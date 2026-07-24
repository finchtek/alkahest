import { expect, type Page } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export const FIX = path.resolve('e2e/fixtures');
export const SHOTS = path.resolve('e2e-artifacts');
mkdirSync(SHOTS, { recursive: true });

export const fix = (name: string) => path.join(FIX, name);

export function magic(buf: Buffer): string {
	return buf.subarray(0, 12).toString('hex');
}

export const looksLike = {
	png: (b: Buffer) =>
		b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
	jpg: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
	webp: (b: Buffer) =>
		b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP',
	gif: (b: Buffer) => b.subarray(0, 4).toString() === 'GIF8',
	pdf: (b: Buffer) => b.subarray(0, 5).toString() === '%PDF-',
	zip: (b: Buffer) => b[0] === 0x50 && b[1] === 0x4b,
	mp4: (b: Buffer) => b.subarray(4, 8).toString() === 'ftyp',
	mp3: (b: Buffer) =>
		b.subarray(0, 3).toString() === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0),
	wav: (b: Buffer) =>
		b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WAVE',
	svg: (b: Buffer) => b.toString('utf8', 0, 200).includes('<svg'),
	glb: (b: Buffer) => b.subarray(0, 4).toString() === 'glTF',
	tiff: (b: Buffer) =>
		b.subarray(0, 4).toString('hex') === '49492a00' || b.subarray(0, 4).toString('hex') === '4d4d002a',
	flac: (b: Buffer) => b.subarray(0, 4).toString() === 'fLaC',
	ico: (b: Buffer) => b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0,
	stl: (b: Buffer) => b.length > 84 && (b.length - 84) % 50 === 0,
	vtt: (b: Buffer) => b.toString('utf8', 0, 20).includes('WEBVTT'),
	srt: (b: Buffer) => /^\d+\r?\n\d{2}:\d{2}:\d{2}[,.]\d{3}/.test(b.toString('utf8', 0, 40))
};

/** Load a tool page, add files, convert, and download the result from the success modal. */
export async function convert(
	page: Page,
	slug: string,
	files: string[],
	configure?: (page: Page) => Promise<void>
): Promise<Buffer> {
	await page.goto(`/${slug}`);
	await page.setInputFiles('input[type=file]', files.map(fix));
	if (configure) await configure(page);
	await page.getByRole('button', { name: /^transmute \d+ files?$/i }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible({ timeout: 210_000 });
	const [download] = await Promise.all([
		page.waitForEvent('download'),
		dialog.getByRole('button', { name: /^download/i }).first().click()
	]);
	const p = await download.path();
	if (!p) throw new Error('download has no path');
	return readFileSync(p);
}

/** Select an option dropdown by its visible label text (e.g. "output format"). */
export async function chooseOption(page: Page, label: string, value: string): Promise<void> {
	await page.locator('label', { hasText: label }).locator('select').selectOption(value);
}
