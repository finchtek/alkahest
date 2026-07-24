import type { FFmpeg } from '@ffmpeg/ffmpeg';

/**
 * Singleton loader for the FFmpeg WASM engine.
 *
 * The ~31 MB ffmpeg-core.wasm is self-hosted in /vendor/ffmpeg, split into
 * <20 MiB chunks (Cloudflare Pages rejects files over 25 MiB). We stream the
 * chunks with progress, stitch them into a Blob, and boot the core from blob
 * URLs. everything stays first-party; no CDN is contacted at runtime.
 */
let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export type DownloadProgressFn = (ratio: number) => void;

export function loadFFmpeg(onDownload?: DownloadProgressFn): Promise<FFmpeg> {
	if (instance) return Promise.resolve(instance);
	if (!loadPromise) {
		loadPromise = (async () => {
			const { FFmpeg } = await import('@ffmpeg/ffmpeg');
			const base = '/vendor/ffmpeg';
			const manifest = (await (await fetch(`${base}/manifest.json`)).json()) as {
				js: string;
				parts: { name: string; size: number }[];
				totalSize: number;
			};

			let received = 0;
			const chunks: Uint8Array[] = [];
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
			const wasmURL = URL.createObjectURL(
				new Blob(chunks as unknown as BlobPart[], { type: 'application/wasm' })
			);
			const jsText = await (await fetch(`${base}/${manifest.js}`)).text();
			const coreURL = URL.createObjectURL(new Blob([jsText], { type: 'text/javascript' }));

			const ff = new FFmpeg();
			await ff.load({ coreURL, wasmURL });
			instance = ff;
			return ff;
		})().catch((err) => {
			loadPromise = null; // allow retry after a failure
			throw err;
		});
	}
	return loadPromise;
}

export interface ExecJob {
	input: { name: string; data: Uint8Array };
	/** args between -i <input> and the output name */
	args: string[];
	output: string;
	outputType: string;
}

/** Run one ffmpeg job in the in-memory FS, with per-job progress callback. */
export async function execJob(
	ff: FFmpeg,
	job: ExecJob,
	onProgress?: (ratio: number) => void
): Promise<Blob> {
	const handler = ({ progress }: { progress: number }) => {
		if (onProgress && Number.isFinite(progress)) onProgress(Math.min(Math.max(progress, 0), 1));
	};
	ff.on('progress', handler);
	try {
		await ff.writeFile(job.input.name, job.input.data);
		const code = await ff.exec(['-hide_banner', '-i', job.input.name, ...job.args, job.output]);
		if (code !== 0) throw new Error(`FFmpeg exited with code ${code}`);
		const data = (await ff.readFile(job.output)) as Uint8Array;
		if (!data || data.length === 0) throw new Error('FFmpeg produced an empty file');
		return new Blob([data as unknown as BlobPart], { type: job.outputType });
	} finally {
		ff.off('progress', handler);
		for (const n of [job.input.name, job.output]) {
			try {
				await ff.deleteFile(n);
			} catch {
				/* file may not exist. fine */
			}
		}
	}
}
