import { test, expect } from '@playwright/test';
import { convert, looksLike, magic } from './helpers';

test.describe('ffmpeg wasm — audio extraction', () => {
	test('MP4 → MP3 with zero network egress', async ({ page, baseURL }) => {
		const external: string[] = [];
		page.on('request', (req) => {
			if (!req.url().startsWith(baseURL!) && !req.url().startsWith('blob:')) {
				external.push(req.url());
			}
		});
		const out = await convert(page, 'mp4-to-mp3', ['sample.mp4']);
		expect(looksLike.mp3(out), `magic: ${magic(out)}`).toBe(true);
		expect(out.length).toBeGreaterThan(10_000);
		expect(external, `unexpected external requests: ${external.join(', ')}`).toHaveLength(0);
	});

	test('video → WAV', async ({ page }) => {
		const out = await convert(page, 'video-to-wav', ['sample.mp4']);
		expect(looksLike.wav(out), `magic: ${magic(out)}`).toBe(true);
	});
});
