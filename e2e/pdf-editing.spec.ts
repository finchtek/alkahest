import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { convert, chooseOption, fix, looksLike, magic } from './helpers';

// doc-a.pdf has 2 pages, doc-b.pdf has 1 page (see e2e/fixtures).

test.describe('PDF editing tools', () => {
	test('rotate PDF by 90 degrees', async ({ page }) => {
		const out = await convert(page, 'rotate-pdf', ['doc-a.pdf']);
		expect(looksLike.pdf(out), `magic: ${magic(out)}`).toBe(true);
		const doc = await PDFDocument.load(new Uint8Array(out));
		expect(doc.getPage(0).getRotation().angle).toBe(90);
	});

	test('rotate PDF by 180 via picker', async ({ page }) => {
		const out = await convert(page, 'rotate-pdf', ['doc-a.pdf'], (p) =>
			chooseOption(p, 'rotate by', '180')
		);
		const doc = await PDFDocument.load(new Uint8Array(out));
		expect(doc.getPage(0).getRotation().angle).toBe(180);
	});

	test('delete pages removes the requested page and keeps the rest', async ({ page }) => {
		const out = await convert(page, 'delete-pages', ['doc-a.pdf'], async (p) => {
			await p.getByPlaceholder(/e\.g\. 2, 5-7/).fill('1');
		});
		const doc = await PDFDocument.load(new Uint8Array(out));
		expect(doc.getPageCount()).toBe(1); // doc-a has 2 pages, minus the one removed
	});

	test('watermark PDF stamps custom text', async ({ page }) => {
		const out = await convert(page, 'watermark-pdf', ['doc-a.pdf'], async (p) => {
			await p.getByPlaceholder(/e\.g\. DRAFT/).fill('SECRET');
		});
		expect(looksLike.pdf(out), `magic: ${magic(out)}`).toBe(true);
		// pdf-lib doesn't expose text extraction, but a bigger file size than the
		// source is a reasonable proxy that content was actually drawn onto it.
		const srcSize = (await readFile(fix('doc-a.pdf'))).length;
		expect(out.length).toBeGreaterThan(srcSize);
	});

	test('add page numbers to every page', async ({ page }) => {
		const out = await convert(page, 'add-page-numbers', ['doc-a.pdf']);
		expect(looksLike.pdf(out), `magic: ${magic(out)}`).toBe(true);
		const doc = await PDFDocument.load(new Uint8Array(out));
		expect(doc.getPageCount()).toBe(2);
	});
});

test.describe('visual PDF page editor', () => {
	test('rotate a page, add a blank page, then export', async ({ page }) => {
		await page.goto('/edit-pdf');
		await page.setInputFiles('input[type=file]', [fix('doc-a.pdf')]);
		await expect(page.locator('[aria-label="rotate page 1 right"]')).toBeVisible({ timeout: 30_000 });
		await expect(page.locator('[aria-label="rotate page 2 right"]')).toBeVisible();

		// rotate page 1 twice (180 total), add a blank page, then export
		await page.locator('[aria-label="rotate page 1 right"]').click();
		await page.locator('[aria-label="rotate page 1 right"]').click();
		await page.getByRole('button', { name: '+ blank page' }).click();
		await expect(page.locator('.grid > .card').filter({ hasText: 'blank' })).toBeVisible();

		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /^export edited PDF$/ }).click()
		]);
		const p = await download.path();
		if (!p) throw new Error('no download path');
		const bytes = await readFile(p);
		const doc = await PDFDocument.load(new Uint8Array(bytes));
		expect(doc.getPageCount()).toBe(3); // 2 original + 1 blank
		expect(doc.getPage(0).getRotation().angle).toBe(180);
	});

	test('delete a page in the visual editor', async ({ page }) => {
		await page.goto('/edit-pdf');
		await page.setInputFiles('input[type=file]', [fix('doc-a.pdf')]);
		await expect(page.locator('[aria-label="delete page 2"]')).toBeVisible({ timeout: 30_000 });
		await page.locator('[aria-label="delete page 2"]').click();

		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /^export edited PDF$/ }).click()
		]);
		const p = await download.path();
		if (!p) throw new Error('no download path');
		const bytes = await readFile(p);
		const doc = await PDFDocument.load(new Uint8Array(bytes));
		expect(doc.getPageCount()).toBe(1);
	});
});
