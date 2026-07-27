import type { ConvertResult, ProgressFn } from '$lib/types';
import { replaceExt } from '$lib/util';

export type RasterTarget = 'image/png' | 'image/jpeg' | 'image/webp';

const EXT: Record<RasterTarget, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp'
};

function isHeic(file: File): boolean {
	return /\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type);
}

/** Normalize formats browsers can't decode natively: HEIC via libheif, TIFF via UTIF. */
async function decodeInput(file: File): Promise<Blob> {
	if (isHeic(file)) {
		const heic2any = (await import('heic2any')).default;
		const out = await heic2any({ blob: file, toType: 'image/png' });
		return Array.isArray(out) ? out[0] : out;
	}
	if (/\.tiff?$/i.test(file.name)) {
		return (await import('./tiff')).tiffToPngBlob(file);
	}
	return file;
}

let worker: Worker | null = null;
let seq = 0;
const inflight = new Map<number, { resolve: (b: Blob) => void; reject: (e: Error) => void }>();

function getWorker(): Worker | null {
	if (typeof window === 'undefined' || typeof OffscreenCanvas === 'undefined') return null;
	if (!worker) {
		worker = new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module' });
		worker.onmessage = (e: MessageEvent) => {
			const { id, ok, blob, error } = e.data;
			const p = inflight.get(id);
			if (!p) return;
			inflight.delete(id);
			if (ok) p.resolve(blob);
			else p.reject(new Error(error));
		};
		worker.onerror = (err) => {
			for (const [, p] of inflight.entries()) {
				p.reject(new Error(err.message || 'Worker encoding error'));
			}
			inflight.clear();
		};
	}
	return worker;
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(blob);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Could not decode image'));
		};
		img.src = url;
	});
}

async function encodeMainThread(blob: Blob, type: RasterTarget, quality: number): Promise<Blob> {
	let width: number;
	let height: number;
	let source: CanvasImageSource;
	try {
		const bmp = await createImageBitmap(blob);
		width = bmp.width;
		height = bmp.height;
		source = bmp;
	} catch {
		// e.g. SVG blobs. decode via <img> instead
		const img = await blobToImage(blob);
		width = img.naturalWidth;
		height = img.naturalHeight;
		source = img;
	}
	if (!width || !height) throw new Error('Image has no dimensions');
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2d context unavailable');
	if (type === 'image/jpeg') {
		ctx.fillStyle = '#ffffff'; // JPEG has no alpha. flatten onto white
		ctx.fillRect(0, 0, width, height);
	}
	ctx.drawImage(source, 0, 0);
	return new Promise<Blob>((resolve, reject) =>
		canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed'))), type, quality)
	);
}

async function encode(blob: Blob, type: RasterTarget, quality: number): Promise<Blob> {
	const w = getWorker();
	if (w) {
		const id = seq++;
		try {
			return await new Promise<Blob>((resolve, reject) => {
				inflight.set(id, { resolve, reject });
				w.postMessage({
					id,
					blob,
					type,
					quality,
					background: type === 'image/jpeg' ? '#ffffff' : null
				});
			});
		} catch {
			// OffscreenCanvas may reject some inputs (e.g. SVG). fall back
			return encodeMainThread(blob, type, quality);
		}
	}
	return encodeMainThread(blob, type, quality);
}

export async function convertImages(
	files: File[],
	target: RasterTarget,
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const quality = Number(opts.quality ?? 0.9);
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `Converting ${f.name} (${i + 1}/${files.length})` });
		const decoded = await decodeInput(f);
		const out = await encode(decoded, target, quality);
		results.push({ name: replaceExt(f.name, EXT[target]), blob: out, from: f.name });
	}
	progress({ ratio: 1 });
	return results;
}

/** Normalize any supported raster input (incl. HEIC/WEBP) to PNG bytes. used by images→PDF. */
export async function toPngBytes(file: File): Promise<Uint8Array> {
	const decoded = await decodeInput(file);
	const png = await encode(decoded, 'image/png', 1);
	return new Uint8Array(await png.arrayBuffer());
}
