import { test, expect } from '@playwright/test';
import { unzipSync } from 'fflate';
import { convert, chooseOption, looksLike, magic } from './helpers';

test.describe('general image converter', () => {
	test('PNG -> JPG via format picker', async ({ page }) => {
		const out = await convert(page, 'image-converter', ['sample.png'], (p) =>
			chooseOption(p, 'output format', 'jpg')
		);
		expect(looksLike.jpg(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('WEBP -> WEBP passthrough re-encode defaults to PNG', async ({ page }) => {
		const out = await convert(page, 'image-converter', ['sample.webp']);
		expect(looksLike.png(out), `magic: ${magic(out)}`).toBe(true);
	});
});

test.describe('TIFF and ICO', () => {
	test('TIFF -> PNG', async ({ page }) => {
		const out = await convert(page, 'tiff-to-png', ['sample.tiff']);
		expect(looksLike.png(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('PNG -> ICO (multi-resolution favicon)', async ({ page }) => {
		const out = await convert(page, 'png-to-ico', ['sample.png']);
		expect(looksLike.ico(out), `magic: ${magic(out)}`).toBe(true);
	});
});

test.describe('audio converter (ffmpeg wasm)', () => {
	test('FLAC -> MP3', async ({ page }) => {
		const out = await convert(page, 'audio-converter', ['sample.flac']);
		expect(looksLike.mp3(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('FLAC -> WAV via format picker', async ({ page }) => {
		const out = await convert(page, 'audio-converter', ['sample.flac'], (p) =>
			chooseOption(p, 'output format', 'wav')
		);
		expect(looksLike.wav(out), `magic: ${magic(out)}`).toBe(true);
	});
});

test.describe('subtitles', () => {
	test('SRT -> VTT', async ({ page }) => {
		const out = await convert(page, 'subtitle-convert', ['sample.srt']);
		expect(looksLike.vtt(out), `starts: ${out.toString('utf8', 0, 20)}`).toBe(true);
	});

	test('VTT -> SRT', async ({ page }) => {
		const out = await convert(page, 'subtitle-convert', ['sample.vtt']);
		expect(looksLike.srt(out), `starts: ${out.toString('utf8', 0, 20)}`).toBe(true);
	});
});

test.describe('3d models (three.js)', () => {
	test('OBJ -> GLB', async ({ page }) => {
		const out = await convert(page, 'obj-to-glb', ['sample.obj']);
		expect(looksLike.glb(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('STL -> GLB', async ({ page }) => {
		const out = await convert(page, 'stl-to-glb', ['sample.stl']);
		expect(looksLike.glb(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('GLB -> STL (printable)', async ({ page }) => {
		const out = await convert(page, 'model-to-stl', ['sample.glb']);
		expect(looksLike.stl(out), `length: ${out.length}`).toBe(true);
	});

	// FBX round-trips through the same loader/exporter pipeline as OBJ/STL/GLB above
	// (only the parser differs: three.js's FBXLoader). No FBX fixture is generated here
	// since no FBX exporter is available in this sandbox to produce one.
});

test.describe('archives', () => {
	test('ZIP extraction preserves both files', async ({ page }) => {
		const out = await convert(page, 'extract-archive', ['sample.zip']);
		expect(looksLike.zip(out), `magic: ${magic(out)}`).toBe(true);
		const entries = unzipSync(new Uint8Array(out));
		const names = Object.keys(entries).sort();
		expect(names).toEqual(['one.txt', 'two.txt']);
		expect(Buffer.from(entries['one.txt']).toString('utf8').trim()).toBe('file one contents');
	});
});

test.describe('docs and data', () => {
	test('DOCX -> HTML', async ({ page }) => {
		const out = await convert(page, 'docx-to-html', ['sample.docx']);
		const html = out.toString('utf8');
		expect(html).toContain('<!doctype html>');
		expect(html).toContain('Test Document');
		expect(html).toContain('paragraph for testing');
	});

	test('DOCX -> markdown via format picker', async ({ page }) => {
		const out = await convert(page, 'docx-to-html', ['sample.docx'], (p) =>
			chooseOption(p, 'output format', 'markdown')
		);
		const md = out.toString('utf8');
		expect(md).toContain('Test Document');
	});

	test('XLSX -> CSV', async ({ page }) => {
		const out = await convert(page, 'xlsx-to-csv', ['sample.xlsx']);
		const csv = out.toString('utf8');
		expect(csv).toContain('Name,Value');
		expect(csv).toContain('Alpha,1');
		expect(csv).toContain('Beta,2');
	});
});
