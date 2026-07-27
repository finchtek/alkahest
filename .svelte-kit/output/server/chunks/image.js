import { i as replaceExt } from "./util.js";
//#region src/lib/convert/image.ts
var EXT = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp"
};
function isHeic(file) {
	return /\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type);
}
/** Normalize formats browsers can't decode natively: HEIC via libheif, TIFF via UTIF. */
async function decodeInput(file) {
	if (isHeic(file)) {
		const heic2any = (await import("heic2any")).default;
		const out = await heic2any({
			blob: file,
			toType: "image/png"
		});
		return Array.isArray(out) ? out[0] : out;
	}
	if (/\.tiff?$/i.test(file.name)) return (await import("./tiff.js")).tiffToPngBlob(file);
	return file;
}
var worker = null;
var seq = 0;
var inflight = /* @__PURE__ */ new Map();
function getWorker() {
	if (typeof window === "undefined" || typeof OffscreenCanvas === "undefined") return null;
	if (!worker) {
		worker = new Worker(new URL("./image.worker.ts", import.meta.url), { type: "module" });
		worker.onmessage = (e) => {
			const { id, ok, blob, error } = e.data;
			const p = inflight.get(id);
			if (!p) return;
			inflight.delete(id);
			if (ok) p.resolve(blob);
			else p.reject(new Error(error));
		};
		worker.onerror = (err) => {
			for (const [, p] of inflight.entries()) p.reject(new Error(err.message || "Worker encoding error"));
			inflight.clear();
		};
	}
	return worker;
}
function blobToImage(blob) {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(blob);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(/* @__PURE__ */ new Error("Could not decode image"));
		};
		img.src = url;
	});
}
async function encodeMainThread(blob, type, quality) {
	let width;
	let height;
	let source;
	try {
		const bmp = await createImageBitmap(blob);
		width = bmp.width;
		height = bmp.height;
		source = bmp;
	} catch {
		const img = await blobToImage(blob);
		width = img.naturalWidth;
		height = img.naturalHeight;
		source = img;
	}
	if (!width || !height) throw new Error("Image has no dimensions");
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("2d context unavailable");
	if (type === "image/jpeg") {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, width, height);
	}
	ctx.drawImage(source, 0, 0);
	return new Promise((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("Encoding failed")), type, quality));
}
async function encode(blob, type, quality) {
	const w = getWorker();
	if (w) {
		const id = seq++;
		try {
			return await new Promise((resolve, reject) => {
				inflight.set(id, {
					resolve,
					reject
				});
				w.postMessage({
					id,
					blob,
					type,
					quality,
					background: type === "image/jpeg" ? "#ffffff" : null
				});
			});
		} catch {
			return encodeMainThread(blob, type, quality);
		}
	}
	return encodeMainThread(blob, type, quality);
}
async function convertImages(files, target, opts, progress) {
	const quality = Number(opts.quality ?? .9);
	const results = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({
			ratio: i / files.length,
			label: `Converting ${f.name} (${i + 1}/${files.length})`
		});
		const out = await encode(await decodeInput(f), target, quality);
		results.push({
			name: replaceExt(f.name, EXT[target]),
			blob: out,
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
/** Normalize any supported raster input (incl. HEIC/WEBP) to PNG bytes. used by images→PDF. */
async function toPngBytes(file) {
	const png = await encode(await decodeInput(file), "image/png", 1);
	return new Uint8Array(await png.arrayBuffer());
}
//#endregion
export { convertImages, toPngBytes };
