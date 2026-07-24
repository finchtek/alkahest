import type { ConvertResult, ProgressFn } from '$lib/types';
import { replaceExt } from '$lib/util';

const SIZES = [16, 32, 48];

function decodeToDrawable(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
	// SVG needs the <img> path; raster formats can use createImageBitmap
	if (/\.svg$/i.test(file.name)) {
		return new Promise((resolve, reject) => {
			const url = URL.createObjectURL(file);
			const img = new Image();
			img.onload = () => {
				URL.revokeObjectURL(url);
				resolve(Object.assign(img, { width: img.naturalWidth || 512, height: img.naturalHeight || 512 }));
			};
			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error('could not decode SVG'));
			};
			img.src = url;
		});
	}
	return createImageBitmap(file);
}

/**
 * Builds a real .ico container, byte by byte: a 6-byte header, one 16-byte
 * directory entry per size, then PNG-encoded images (valid since Vista).
 */
export async function imagesToIco(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `forging ${f.name} (${i + 1}/${files.length})` });
		const src = await decodeToDrawable(f);
		const pngs: ArrayBuffer[] = [];
		for (const s of SIZES) {
			const canvas = document.createElement('canvas');
			canvas.width = s;
			canvas.height = s;
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('2d context unavailable');
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			ctx.drawImage(src, 0, 0, s, s);
			const blob = await new Promise<Blob>((resolve, reject) =>
				canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encoding failed'))), 'image/png')
			);
			pngs.push(await blob.arrayBuffer());
		}

		const headerSize = 6 + SIZES.length * 16;
		const total = headerSize + pngs.reduce((s, p) => s + p.byteLength, 0);
		const out = new Uint8Array(total);
		const view = new DataView(out.buffer);
		view.setUint16(0, 0, true); // reserved
		view.setUint16(2, 1, true); // type: icon
		view.setUint16(4, SIZES.length, true);
		let offset = headerSize;
		for (let e = 0; e < SIZES.length; e++) {
			const base = 6 + e * 16;
			const s = SIZES[e];
			view.setUint8(base, s < 256 ? s : 0);
			view.setUint8(base + 1, s < 256 ? s : 0);
			view.setUint8(base + 2, 0); // palette
			view.setUint8(base + 3, 0); // reserved
			view.setUint16(base + 4, 1, true); // planes
			view.setUint16(base + 6, 32, true); // bpp
			view.setUint32(base + 8, pngs[e].byteLength, true);
			view.setUint32(base + 12, offset, true);
			out.set(new Uint8Array(pngs[e]), offset);
			offset += pngs[e].byteLength;
		}
		results.push({
			name: replaceExt(f.name, 'ico'),
			blob: new Blob([out], { type: 'image/x-icon' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
