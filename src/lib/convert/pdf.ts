import type { ConvertResult, ProgressFn } from '$lib/types';
import { replaceExt } from '$lib/util';

async function getPdfLib() {
	return import('pdf-lib');
}

export async function getPdfJs() {
	// The legacy build supports a wider browser range (the modern build relies
	// on brand-new JS features like Map.getOrInsertComputed).
	// @ts-expect-error deep import without type declarations
	const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
	// @ts-expect-error Vite ?url asset import
	const worker = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default;
	pdfjs.GlobalWorkerOptions.workerSrc = worker;
	return pdfjs;
}

export async function mergePdfs(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { PDFDocument } = await getPdfLib();
	const out = await PDFDocument.create();
	for (let i = 0; i < files.length; i++) {
		progress({ ratio: i / files.length, label: `Adding ${files[i].name} (${i + 1}/${files.length})` });
		const src = await PDFDocument.load(await files[i].arrayBuffer(), { ignoreEncryption: true });
		const pages = await out.copyPages(src, src.getPageIndices());
		for (const p of pages) out.addPage(p);
	}
	progress({ ratio: 0.95, label: 'Writing merged PDF…' });
	const bytes = await out.save();
	progress({ ratio: 1 });
	return [
		{
			name: 'merged.pdf',
			blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
		}
	];
}

/** "1-3, 5, 8-" → [[1,3],[5,5],[8,end]]; empty input → one range per page. */
export function parseRanges(input: string, pageCount: number): [number, number][] {
	const trimmed = input.trim();
	if (!trimmed) return Array.from({ length: pageCount }, (_, i) => [i + 1, i + 1]);
	const ranges: [number, number][] = [];
	for (const token of trimmed.split(',')) {
		const t = token.trim();
		if (!t) continue;
		const m = /^(\d+)?\s*-\s*(\d+)?$/.exec(t);
		if (m) {
			const start = m[1] ? parseInt(m[1], 10) : 1;
			const end = m[2] ? parseInt(m[2], 10) : pageCount;
			if (start >= 1 && start <= end && start <= pageCount) {
				ranges.push([start, Math.min(end, pageCount)]);
			}
		} else if (/^\d+$/.test(t)) {
			const p = parseInt(t, 10);
			if (p >= 1 && p <= pageCount) ranges.push([p, p]);
		}
	}
	if (!ranges.length) throw new Error('No valid page ranges. use e.g. "1-3, 5, 8-10"');
	return ranges;
}

export async function splitPdf(
	files: File[],
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { PDFDocument } = await getPdfLib();
	const file = files[0];
	const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
	const ranges = parseRanges(String(opts.ranges ?? ''), src.getPageCount());
	const base = file.name.replace(/\.pdf$/i, '');
	const results: ConvertResult[] = [];
	for (let i = 0; i < ranges.length; i++) {
		const [start, end] = ranges[i];
		progress({
			ratio: i / ranges.length,
			label: `Extracting pages ${start}${end > start ? `-${end}` : ''} (${i + 1}/${ranges.length})`
		});
		const doc = await PDFDocument.create();
		const idx = Array.from({ length: end - start + 1 }, (_, k) => start - 1 + k);
		const pages = await doc.copyPages(src, idx);
		for (const p of pages) doc.addPage(p);
		const bytes = await doc.save();
		results.push({
			name: `${base}-p${start}${end > start ? `-${end}` : ''}.pdf`,
			blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
			from: file.name
		});
	}
	progress({ ratio: 1 });
	return results;
}

export async function pdfToImages(
	files: File[],
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const pdfjs = await getPdfJs();
	const format = String(opts.format ?? 'png');
	const scale = Number(opts.scale ?? 2);
	const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
	const results: ConvertResult[] = [];
	for (const file of files) {
		const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
		const doc = await task.promise;
		const base = file.name.replace(/\.pdf$/i, '');
		for (let p = 1; p <= doc.numPages; p++) {
			progress({
				ratio: (p - 1) / doc.numPages,
				label: `Rendering page ${p}/${doc.numPages} of ${file.name}`
			});
			const page = await doc.getPage(p);
			const viewport = page.getViewport({ scale });
			const canvas = document.createElement('canvas');
			canvas.width = Math.ceil(viewport.width);
			canvas.height = Math.ceil(viewport.height);
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('2d context unavailable');
			if (mime === 'image/jpeg') {
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}
			await page.render({ canvasContext: ctx, viewport, canvas }).promise;
			const blob = await new Promise<Blob>((resolve, reject) =>
				canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed'))), mime, 0.92)
			);
			results.push({ name: `${base}-p${p}.${format}`, blob, from: file.name });
		}
		await task.destroy();
	}
	progress({ ratio: 1 });
	return results;
}

export async function imagesToPdf(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { PDFDocument } = await getPdfLib();
	const { toPngBytes } = await import('./image');
	const doc = await PDFDocument.create();
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `Adding ${f.name} (${i + 1}/${files.length})` });
		const bytes = new Uint8Array(await f.arrayBuffer());
		let img;
		if (/\.(jpe?g)$/i.test(f.name)) {
			img = await doc.embedJpg(bytes);
		} else if (/\.png$/i.test(f.name)) {
			img = await doc.embedPng(bytes);
		} else {
			// WEBP/HEIC etc.. normalize to PNG via the canvas pipeline first
			img = await doc.embedPng(await toPngBytes(f));
		}
		const page = doc.addPage([img.width, img.height]);
		page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
	}
	progress({ ratio: 0.95, label: 'Writing PDF…' });
	const bytes = await doc.save();
	progress({ ratio: 1 });
	const name = files.length === 1 ? replaceExt(files[0].name, 'pdf') : 'images.pdf';
	return [
		{ name, blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }) }
	];
}

export async function rotatePdf(
	files: File[],
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { PDFDocument, degrees } = await getPdfLib();
	const by = Number(opts.degrees ?? 90);
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `rotating ${f.name} (${i + 1}/${files.length})` });
		const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
		for (const page of doc.getPages()) {
			page.setRotation(degrees((page.getRotation().angle + by) % 360));
		}
		const bytes = await doc.save();
		results.push({
			name: replaceExt(f.name, 'pdf'),
			blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}

/** Removes the given page ranges (e.g. "2, 5-7") and keeps the rest as one PDF. */
export async function deletePages(
	files: File[],
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { PDFDocument } = await getPdfLib();
	const file = files[0];
	const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
	const total = src.getPageCount();
	const remove = new Set<number>();
	for (const [start, end] of parseRanges(String(opts.ranges ?? ''), total)) {
		for (let p = start; p <= end; p++) remove.add(p);
	}
	const keep = Array.from({ length: total }, (_, i) => i).filter((idx) => !remove.has(idx + 1));
	if (!keep.length) throw new Error('that removes every page. leave at least one');
	progress({ ratio: 0.3, label: 'rebuilding PDF…' });
	const doc = await PDFDocument.create();
	const pages = await doc.copyPages(src, keep);
	for (const p of pages) doc.addPage(p);
	const bytes = await doc.save();
	progress({ ratio: 1 });
	return [
		{
			name: replaceExt(file.name, 'pdf').replace(/\.pdf$/i, '-edited.pdf'),
			blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
			from: file.name
		}
	];
}

export async function watermarkPdf(
	files: File[],
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { PDFDocument, StandardFonts, rgb, degrees } = await getPdfLib();
	const text = String(opts.text ?? 'DRAFT').slice(0, 60) || 'DRAFT';
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `stamping ${f.name} (${i + 1}/${files.length})` });
		const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
		const font = await doc.embedFont(StandardFonts.HelveticaBold);
		for (const page of doc.getPages()) {
			const { width, height } = page.getSize();
			const size = Math.max(24, Math.min(width, height) / 8);
			const textWidth = font.widthOfTextAtSize(text, size);
			page.drawText(text, {
				x: width / 2 - textWidth / 2,
				y: height / 2,
				size,
				font,
				color: rgb(0.55, 0.35, 0.2),
				opacity: 0.25,
				rotate: degrees(45)
			});
		}
		const bytes = await doc.save();
		results.push({
			name: replaceExt(f.name, 'pdf').replace(/\.pdf$/i, '-watermarked.pdf'),
			blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}

export async function addPageNumbers(
	files: File[],
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { PDFDocument, StandardFonts, rgb } = await getPdfLib();
	const position = String(opts.position ?? 'bottom-center');
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `numbering ${f.name} (${i + 1}/${files.length})` });
		const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
		const font = await doc.embedFont(StandardFonts.Helvetica);
		const pages = doc.getPages();
		const total = pages.length;
		pages.forEach((page, idx) => {
			const { width } = page.getSize();
			const label = `${idx + 1} / ${total}`;
			const size = 10;
			const textWidth = font.widthOfTextAtSize(label, size);
			const x = position === 'bottom-right' ? width - textWidth - 28 : width / 2 - textWidth / 2;
			page.drawText(label, { x, y: 20, size, font, color: rgb(0.35, 0.3, 0.25) });
		});
		const bytes = await doc.save();
		results.push({
			name: replaceExt(f.name, 'pdf').replace(/\.pdf$/i, '-numbered.pdf'),
			blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
