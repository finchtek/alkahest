import type { ConvertResult, ProgressFn } from '$lib/types';
import { extOf, replaceExt } from '$lib/util';
import { execJob, loadFFmpeg } from './ffmpeg';

async function engine(progress: ProgressFn) {
	return loadFFmpeg((r) =>
		progress({
			ratio: r * 0.98,
			label: 'Downloading conversion engine. one time, cached by your browser…'
		})
	);
}

async function eachFile(
	files: File[],
	progress: ProgressFn,
	fn: (
		file: File,
		inName: string,
		data: Uint8Array,
		onRatio: (r: number) => void
	) => Promise<ConvertResult>
): Promise<ConvertResult[]> {
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		const label = `Converting ${f.name} (${i + 1}/${files.length})`;
		progress({ ratio: i / files.length, label });
		const data = new Uint8Array(await f.arrayBuffer());
		const inName = `in_${i}.${extOf(f.name) || 'bin'}`;
		const onRatio = (r: number) => progress({ ratio: (i + r) / files.length, label });
		results.push(await fn(f, inName, data, onRatio));
	}
	progress({ ratio: 1 });
	return results;
}

export async function extractAudio(
	files: File[],
	format: 'mp3' | 'wav',
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const ff = await engine(progress);
	const bitrate = String(opts.bitrate ?? '192');
	return eachFile(files, progress, async (f, inName, data, onRatio) => {
		const args =
			format === 'mp3'
				? ['-vn', '-c:a', 'libmp3lame', '-b:a', `${bitrate}k`]
				: ['-vn', '-c:a', 'pcm_s16le'];
		const blob = await execJob(
			ff,
			{
				input: { name: inName, data },
				args,
				output: `out_${inName}.${format}`,
				outputType: format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
			},
			onRatio
		);
		return { name: replaceExt(f.name, format), blob, from: f.name };
	});
}

export async function toMp4(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const ff = await engine(progress);
	return eachFile(files, progress, async (f, inName, data, onRatio) => {
		const output = `out_${inName}.mp4`;
		// Fast path: remux without re-encoding (lossless, near-instant).
		// works when the streams are already MP4-compatible (H.264/HEVC + AAC).
		try {
			const blob = await execJob(
				ff,
				{
					input: { name: inName, data },
					args: ['-c', 'copy', '-movflags', '+faststart'],
					output,
					outputType: 'video/mp4'
				},
				onRatio
			);
			return { name: replaceExt(f.name, 'mp4'), blob, from: f.name };
		} catch {
			// Slow path: full re-encode for incompatible codecs (e.g. ProRes).
			// Our FFmpeg build is LGPL-only (no x264/x265), so this re-encodes to
			// VP9 instead of H.264. Valid inside an MP4 container, plays fine in
			// every modern browser, just slower to encode than x264 would be.
			const blob = await execJob(
				ff,
				{
					input: { name: inName, data },
					args: [
						'-c:v',
						'libvpx-vp9',
						'-crf',
						'32',
						'-b:v',
						'0',
						'-deadline',
						'good',
						'-cpu-used',
						'4',
						'-pix_fmt',
						'yuv420p',
						'-c:a',
						'aac',
						'-b:a',
						'128k',
						'-movflags',
						'+faststart'
					],
					output,
					outputType: 'video/mp4'
				},
				onRatio
			);
			return { name: replaceExt(f.name, 'mp4'), blob, from: f.name };
		}
	});
}

export async function toGif(
	files: File[],
	opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const ff = await engine(progress);
	const rawFps = Number(opts.fps ?? 12);
	const fps = Number.isFinite(rawFps) && rawFps > 0 ? Math.min(Math.max(rawFps, 1), 60) : 12;
	const rawWidth = Number(opts.width ?? 480);
	const width = Number.isFinite(rawWidth) && rawWidth > 0 ? Math.min(Math.max(rawWidth, 16), 1920) : 480;
	return eachFile(files, progress, async (f, inName, data, onRatio) => {
		// Single-pass palette generation for quality GIFs
		const vf = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3`;
		const blob = await execJob(
			ff,
			{
				input: { name: inName, data },
				args: ['-vf', vf, '-loop', '0', '-an'],
				output: `out_${inName}.gif`,
				outputType: 'image/gif'
			},
			onRatio
		);
		return { name: replaceExt(f.name, 'gif'), blob, from: f.name };
	});
}
