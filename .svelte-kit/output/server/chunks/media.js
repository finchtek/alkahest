import { i as replaceExt, t as extOf } from "./util.js";
//#region src/lib/convert/ffmpeg.ts
/**
* Singleton loader for the FFmpeg WASM engine.
*
* The ~31 MB ffmpeg-core.wasm is self-hosted in /vendor/ffmpeg, split into
* <20 MiB chunks (Cloudflare Pages rejects files over 25 MiB). We stream the
* chunks with progress, stitch them into a Blob, and boot the core from blob
* URLs. everything stays first-party; no CDN is contacted at runtime.
*/
var instance = null;
var loadPromise = null;
function loadFFmpeg(onDownload) {
	if (instance) return Promise.resolve(instance);
	if (!loadPromise) loadPromise = (async () => {
		const { FFmpeg } = await import("@ffmpeg/ffmpeg");
		const base = "/vendor/ffmpeg";
		const manifest = await (await fetch(`${base}/manifest.json`)).json();
		let received = 0;
		const chunks = [];
		for (const part of manifest.parts) {
			const res = await fetch(`${base}/${part.name}`);
			if (!res.ok || !res.body) throw new Error(`Failed to fetch ${part.name}`);
			const reader = res.body.getReader();
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				chunks.push(value);
				received += value.length;
				onDownload?.(Math.min(received / manifest.totalSize, 1));
			}
		}
		const wasmURL = URL.createObjectURL(new Blob(chunks, { type: "application/wasm" }));
		const jsText = await (await fetch(`${base}/${manifest.js}`)).text();
		const coreURL = URL.createObjectURL(new Blob([jsText], { type: "text/javascript" }));
		const ff = new FFmpeg();
		await ff.load({
			coreURL,
			wasmURL
		});
		instance = ff;
		return ff;
	})().catch((err) => {
		loadPromise = null;
		throw err;
	});
	return loadPromise;
}
/** Run one ffmpeg job in the in-memory FS, with per-job progress callback. */
async function execJob(ff, job, onProgress) {
	const handler = ({ progress }) => {
		if (onProgress && Number.isFinite(progress)) onProgress(Math.min(Math.max(progress, 0), 1));
	};
	ff.on("progress", handler);
	try {
		await ff.writeFile(job.input.name, job.input.data);
		const code = await ff.exec([
			"-hide_banner",
			"-i",
			job.input.name,
			...job.args,
			job.output
		]);
		if (code !== 0) throw new Error(`FFmpeg exited with code ${code}`);
		const data = await ff.readFile(job.output);
		if (!data || data.length === 0) throw new Error("FFmpeg produced an empty file");
		return new Blob([data], { type: job.outputType });
	} finally {
		ff.off("progress", handler);
		for (const n of [job.input.name, job.output]) try {
			await ff.deleteFile(n);
		} catch {}
	}
}
//#endregion
//#region src/lib/convert/media.ts
async function engine(progress) {
	return loadFFmpeg((r) => progress({
		ratio: r * .98,
		label: "Downloading conversion engine. one time, cached by your browser…"
	}));
}
async function eachFile(files, progress, fn) {
	const results = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		const label = `Converting ${f.name} (${i + 1}/${files.length})`;
		progress({
			ratio: i / files.length,
			label
		});
		const data = new Uint8Array(await f.arrayBuffer());
		const inName = `in_${i}.${extOf(f.name) || "bin"}`;
		const onRatio = (r) => progress({
			ratio: (i + r) / files.length,
			label
		});
		results.push(await fn(f, inName, data, onRatio));
	}
	progress({ ratio: 1 });
	return results;
}
async function extractAudio(files, format, opts, progress) {
	const ff = await engine(progress);
	const bitrate = String(opts.bitrate ?? "192");
	return eachFile(files, progress, async (f, inName, data, onRatio) => {
		const args = format === "mp3" ? [
			"-vn",
			"-c:a",
			"libmp3lame",
			"-b:a",
			`${bitrate}k`
		] : [
			"-vn",
			"-c:a",
			"pcm_s16le"
		];
		const blob = await execJob(ff, {
			input: {
				name: inName,
				data
			},
			args,
			output: `out_${inName}.${format}`,
			outputType: format === "mp3" ? "audio/mpeg" : "audio/wav"
		}, onRatio);
		return {
			name: replaceExt(f.name, format),
			blob,
			from: f.name
		};
	});
}
async function toMp4(files, _opts, progress) {
	const ff = await engine(progress);
	return eachFile(files, progress, async (f, inName, data, onRatio) => {
		const output = `out_${inName}.mp4`;
		try {
			const blob = await execJob(ff, {
				input: {
					name: inName,
					data
				},
				args: [
					"-c",
					"copy",
					"-movflags",
					"+faststart"
				],
				output,
				outputType: "video/mp4"
			}, onRatio);
			return {
				name: replaceExt(f.name, "mp4"),
				blob,
				from: f.name
			};
		} catch {
			const blob = await execJob(ff, {
				input: {
					name: inName,
					data
				},
				args: [
					"-c:v",
					"libvpx-vp9",
					"-crf",
					"32",
					"-b:v",
					"0",
					"-deadline",
					"good",
					"-cpu-used",
					"4",
					"-pix_fmt",
					"yuv420p",
					"-c:a",
					"aac",
					"-b:a",
					"128k",
					"-movflags",
					"+faststart"
				],
				output,
				outputType: "video/mp4"
			}, onRatio);
			return {
				name: replaceExt(f.name, "mp4"),
				blob,
				from: f.name
			};
		}
	});
}
async function toGif(files, opts, progress) {
	const ff = await engine(progress);
	const fps = Number(opts.fps ?? 12);
	const width = Number(opts.width ?? 480);
	return eachFile(files, progress, async (f, inName, data, onRatio) => {
		const vf = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3`;
		const blob = await execJob(ff, {
			input: {
				name: inName,
				data
			},
			args: [
				"-vf",
				vf,
				"-loop",
				"0",
				"-an"
			],
			output: `out_${inName}.gif`,
			outputType: "image/gif"
		}, onRatio);
		return {
			name: replaceExt(f.name, "gif"),
			blob,
			from: f.name
		};
	});
}
//#endregion
export { extractAudio, toGif, toMp4 };
