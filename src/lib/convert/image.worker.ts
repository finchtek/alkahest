/// <reference lib="webworker" />
/**
 * Off-main-thread raster encoding: decode with createImageBitmap, draw to an
 * OffscreenCanvas, encode with convertToBlob. Keeps the UI responsive while
 * batches of images are converted.
 */
self.onmessage = async (e: MessageEvent) => {
	const { id, blob, type, quality, background } = e.data as {
		id: number;
		blob: Blob;
		type: string;
		quality: number;
		background: string | null;
	};
	try {
		const bmp = await createImageBitmap(blob);
		const canvas = new OffscreenCanvas(bmp.width, bmp.height);
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('2d context unavailable');
		if (background) {
			ctx.fillStyle = background;
			ctx.fillRect(0, 0, bmp.width, bmp.height);
		}
		ctx.drawImage(bmp, 0, 0);
		bmp.close();
		const out = await canvas.convertToBlob({ type, quality });
		(self as unknown as Worker).postMessage({ id, ok: true, blob: out });
	} catch (err) {
		(self as unknown as Worker).postMessage({ id, ok: false, error: String(err) });
	}
};

export {};
