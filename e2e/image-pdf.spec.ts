import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { convert, fix, looksLike, magic } from './helpers';

test.describe('image tools', () => {
	test('WEBP → PNG', async ({ page }) => {
		const out = await convert(page, 'webp-to-png', ['sample.webp']);
		expect(looksLike.png(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('HEIC → JPG (libheif wasm)', async ({ page }) => {
		const out = await convert(page, 'heic-to-jpg', ['sample.heic']);
		expect(looksLike.jpg(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('PNG → WEBP', async ({ page }) => {
		const out = await convert(page, 'png-to-webp', ['sample.png']);
		expect(looksLike.webp(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('SVG optimizer shrinks the file', async ({ page }) => {
		const src = readFileSync(fix('sample.svg'));
		const out = await convert(page, 'svg-optimizer', ['sample.svg']);
		expect(looksLike.svg(out), `starts: ${out.toString('utf8', 0, 40)}`).toBe(true);
		expect(out.length).toBeLessThan(src.length);
	});
});

test.describe('pdf tools', () => {
	test('merge two PDFs → 3 pages', async ({ page }) => {
		const out = await convert(page, 'merge-pdf', ['doc-a.pdf', 'doc-b.pdf']);
		expect(looksLike.pdf(out), `magic: ${magic(out)}`).toBe(true);
		const { PDFDocument } = await import('pdf-lib');
		const doc = await PDFDocument.load(new Uint8Array(out));
		expect(doc.getPageCount()).toBe(3);
	});

	test('split 2-page PDF → zip of 2 files', async ({ page }) => {
		const out = await convert(page, 'split-pdf', ['doc-a.pdf']);
		expect(looksLike.zip(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('PDF → PNG image (pdf.js render)', async ({ page }) => {
		const out = await convert(page, 'pdf-to-images', ['doc-b.pdf']);
		expect(looksLike.png(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('images → single PDF', async ({ page }) => {
		const out = await convert(page, 'images-to-pdf', ['sample.png', 'sample.jpg']);
		expect(looksLike.pdf(out), `magic: ${magic(out)}`).toBe(true);
		const { PDFDocument } = await import('pdf-lib');
		const doc = await PDFDocument.load(new Uint8Array(out));
		expect(doc.getPageCount()).toBe(2);
	});
});
