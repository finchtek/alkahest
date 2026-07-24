import { test, expect } from '@playwright/test';
import path from 'node:path';
import { SHOTS, fix } from './helpers';

test.describe('pages & screenshots', () => {
	test('landing renders with tool grid', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(/zero uploads/i);
		await expect(page.locator('#tools a[href="/heic-to-jpg"]')).toBeVisible();
		await page.screenshot({ path: path.join(SHOTS, 'landing.png'), fullPage: true });
	});

	test('open-source page lists licenses', async ({ page }) => {
		await page.goto('/open-source');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(/source.*licenses/i);
		await expect(page.getByText('LGPL', { exact: false }).first()).toBeVisible();
		await page.screenshot({ path: path.join(SHOTS, 'open-source.png'), fullPage: true });
	});

	test('tool page and success modal screenshots', async ({ page }) => {
		await page.goto('/heic-to-jpg');
		await page.setInputFiles('input[type=file]', [fix('sample.heic')]);
		await page.screenshot({ path: path.join(SHOTS, 'tool-ready.png'), fullPage: true });
		await page.getByRole('button', { name: /^transmute/i }).click();
		await expect(page.getByRole('dialog')).toBeVisible({ timeout: 60_000 });
		await page.screenshot({ path: path.join(SHOTS, 'success-modal.png') });
	});
});
