import { test, expect } from '@playwright/test';
import { convert, looksLike, magic } from './helpers';

test.describe('ffmpeg wasm — video', () => {
	test('MOV → MP4 (remux fast path)', async ({ page }) => {
		const out = await convert(page, 'mov-to-mp4', ['sample.mov']);
		expect(looksLike.mp4(out), `magic: ${magic(out)}`).toBe(true);
	});

	test('MP4 → GIF with palette', async ({ page }) => {
		const out = await convert(page, 'video-to-gif', ['sample.mp4']);
		expect(looksLike.gif(out), `magic: ${magic(out)}`).toBe(true);
	});
});
