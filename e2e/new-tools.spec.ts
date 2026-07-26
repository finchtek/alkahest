import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { convert, fix } from './helpers';

test.describe('zip, markdown & data tools', () => {
	test('files to ZIP bundles multiple files', async ({ page }) => {
		const buf = await convert(page, 'files-to-zip', ['zip-src-a.txt', 'zip-src-b.txt']);
		expect(buf[0]).toBe(0x50);
		expect(buf[1]).toBe(0x4b); // PK zip signature
	});

	test('HTML to Markdown converts headings, bold and links', async ({ page }) => {
		const buf = await convert(page, 'html-to-markdown', ['sample.html']);
		const text = buf.toString('utf8');
		expect(text).toContain('# Title');
		expect(text).toContain('**bold**');
		expect(text).toContain('[link](https://example.com)');
	});

	test('CSV to JSON parses quoted commas correctly', async ({ page }) => {
		const buf = await convert(page, 'csv-to-json', ['sample.csv']);
		const json = JSON.parse(buf.toString('utf8'));
		expect(json).toEqual([
			{ name: 'Smith, John', age: '34', city: 'New York' },
			{ name: 'Jane', age: '29', city: 'Boston' }
		]);
	});

	test('JSON to CSV re-quotes fields containing commas', async ({ page }) => {
		const buf = await convert(page, 'json-to-csv', ['sample.json']);
		const text = buf.toString('utf8');
		expect(text).toContain('"Smith, John"');
		expect(text).toContain('name,age,city');
	});
});

test.describe('photo metadata viewer & stripper', () => {
	test('finds GPS, camera and date in a tagged photo, then strips it losslessly', async ({ page }) => {
		await page.goto('/strip-exif');
		await page.setInputFiles('input[type=file]', [fix('sample-with-gps.jpg')]);

		// findings surface as badges before anything is stripped
		await expect(page.getByText(/GPS: 40\.7484/)).toBeVisible({ timeout: 15_000 });
		await expect(page.getByText('TESTCAM INC. PIXEL TEST 9', { exact: false })).toBeVisible();

		const before = readFileSync(fix('sample-with-gps.jpg'));

		await page.getByRole('button', { name: /^strip metadata from/i }).click();
		await expect(page.getByText(/scrubbed\. 1 clean file ready\./)).toBeVisible({ timeout: 15_000 });

		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /^download /i }).click()
		]);
		const p = await download.path();
		expect(p).toBeTruthy();
		if (!p) return;
		const after = readFileSync(p);

		// stripped file must be smaller (EXIF segment removed)...
		expect(after.length).toBeLessThan(before.length);
		// ...but the compressed image data itself is byte-identical: zero quality loss.
		const sos = (b: Buffer) => b.indexOf(Buffer.from([0xff, 0xda]));
		expect(after.subarray(sos(after))).toEqual(before.subarray(sos(before)));
	});

	test('reports a clean file when there is no metadata to find', async ({ page }) => {
		await page.goto('/strip-exif');
		await page.setInputFiles('input[type=file]', [fix('sample.jpg')]);
		await expect(page.getByText(/clean — no metadata found/)).toBeVisible({ timeout: 15_000 });
	});
});
