/**
 * Copies the FFmpeg WASM core out of vendor/ffmpeg-core-lgpl into
 * static/vendor/ffmpeg, splitting the ~30 MB ffmpeg-core.wasm into <20 MiB
 * chunks.
 *
 * Why a custom core: the official @ffmpeg/core package is compiled with
 * --enable-gpl and libx264/libx265, which puts a reciprocal open-source
 * obligation on any application that ships it. vendor/ffmpeg-core-lgpl is
 * built from the same ffmpeg.wasm toolchain (see vendor/ffmpeg-core-lgpl/BUILD.md)
 * with those two flags removed and libpostproc (GPL-only) dropped from the
 * link step. Every remaining codec (libvpx, libmp3lame, libtheora,
 * libvorbis, libopus, libwebp, libass/freetype/fribidi, libzimg) is
 * BSD/LGPL, so this build carries no reciprocal license obligation.
 *
 * Why chunking at all: Cloudflare Pages rejects any single file over 25 MiB.
 * Chunking lets us self-host the engine (first-party only — no runtime CDN
 * calls), and the client stitches the parts back together into a Blob
 * before ffmpeg.load().
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'static', 'vendor', 'ffmpeg');
const CHUNK = 20 * 1024 * 1024; // 20 MiB, safely under Cloudflare Pages' 25 MiB cap

const corePkg = join(root, 'vendor', 'ffmpeg-core-lgpl');
const esm = join(corePkg, 'esm');
const jsSrc = join(esm, 'ffmpeg-core.js');
const wasmSrc = join(esm, 'ffmpeg-core.wasm');
if (!existsSync(wasmSrc)) {
	console.log('[prepare-ffmpeg] vendor/ffmpeg-core-lgpl not present; skipping.');
	process.exit(0);
}
// No package.json here (this isn't an npm package) — version the manifest
// off FFmpeg's own release tag plus a build tag for the LGPL-only flag set.
const version = 'n5.1.4-lgpl';

// libarchive worker + wasm must live same-origin, same-directory
const laDist = join(root, 'node_modules', 'libarchive.js', 'dist');
if (existsSync(laDist)) {
	const laOut = join(root, 'static', 'vendor', 'libarchive');
	mkdirSync(laOut, { recursive: true });
	for (const f of ['worker-bundle.js', 'libarchive.wasm', 'libarchive.js']) {
		const src = join(laDist, f);
		if (existsSync(src)) cpSync(src, join(laOut, f));
	}
	console.log('[prepare] libarchive assets copied.');
}

const wasmSize = statSync(wasmSrc).size;
const manifestPath = join(outDir, 'manifest.json');
if (existsSync(manifestPath)) {
	const prev = JSON.parse(readFileSync(manifestPath, 'utf8'));
	if (prev.version === version && prev.totalSize === wasmSize) {
		console.log(`[prepare-ffmpeg] up to date (core ${version}).`);
		process.exit(0);
	}
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'ffmpeg-core.js'), readFileSync(jsSrc));

const wasm = readFileSync(wasmSrc);
const parts = [];
for (let i = 0, n = 0; i < wasm.length; i += CHUNK, n++) {
	const name = `ffmpeg-core.wasm.part${n}`;
	const slice = wasm.subarray(i, Math.min(i + CHUNK, wasm.length));
	writeFileSync(join(outDir, name), slice);
	parts.push({ name, size: slice.length });
}

writeFileSync(
	manifestPath,
	JSON.stringify({ version, js: 'ffmpeg-core.js', parts, totalSize: wasmSize }, null, 2)
);
console.log(
	`[prepare-ffmpeg] core ${version}: ${parts.length} wasm parts (${(wasmSize / 1048576).toFixed(1)} MiB total).`
);
