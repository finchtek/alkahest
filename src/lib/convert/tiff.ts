import type { ConvertResult, ProgressFn } from '$lib/types';

/** First page of a TIFF as a PNG blob, for feeding the general image pipeline. */
export async function tiffToPngBlob(file: File): Promise<Blob> {
	const UTIF = (await import('utif2')).default;
	const buf = await file.arrayBuffer();
	const ifds = UTIF.decode(buf);
	if (!ifds.length) throw new Error(`no images found inside ${file.name}`);
	UTIF.decodeImage(buf, ifds[0]);
	const rgba = UTIF.toRGBA8(ifds[0]);
	const w = ifds[0].width as number;
	const h = ifds[0].height as number;
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2d context unavailable');
	ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), w, h), 0, 0);
	return new Promise<Blob>((resolve, reject) =>
		canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encoding failed'))), 'image/png')
	);
}

export async function tiffToImages(
	files: File[],
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const UTIF = (await import('utif2')).default;
	const format = String(opts.format ?? 'png');
	const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `decoding ${f.name} (${i + 1}/${files.length})` });
		const buf = await f.arrayBuffer();
		const ifds = UTIF.decode(buf);
		if (!ifds.length) throw new Error(`no images found inside ${f.name}`);
		const base = f.name.replace(/\.tiff?$/i, '');
		for (let p = 0; p < ifds.length; p++) {
			UTIF.decodeImage(buf, ifds[p]);
			const rgba = UTIF.toRGBA8(ifds[p]);
			const w = ifds[p].width as number;
			const h = ifds[p].height as number;
			if (!w || !h) throw new Error(`could not read page ${p + 1} of ${f.name}`);
			const canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('2d context unavailable');
			ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), w, h), 0, 0);
			const blob = await new Promise<Blob>((resolve, reject) =>
				canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encoding failed'))), mime, 0.92)
			);
			results.push({
				name: ifds.length > 1 ? `${base}-p${p + 1}.${format}` : `${base}.${format}`,
				blob,
				from: f.name
			});
		}
	}
	progress({ ratio: 1 });
	return results;
}
