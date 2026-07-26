import { test, expect } from '@playwright/test';
import { fix } from './helpers';

test.describe('landing page: detect file type and list conversions', () => {
	test('dropping a PNG lists every tool that accepts it', async ({ page }) => {
		await page.goto('/');
		await page.setInputFiles('input[type=file]', [fix('sample.png')]);

		await expect(page.getByText(/detected:/i)).toBeVisible();
		await expect(page.getByText(/1 file · PNG/i)).toBeVisible();

		// a PNG is a valid input for several tools; all should be listed. Each
		// button's accessible name is "<tool name> <short description>", so
		// match on the leading tool name rather than the full string.
		await expect(page.getByRole('button', { name: /^PNG to WEBP/ })).toBeVisible();
		await expect(page.getByRole('button', { name: /^any image converter/ })).toBeVisible();
		await expect(page.getByRole('button', { name: /^images to PDF/ })).toBeVisible();
		await expect(page.getByRole('button', { name: /^PNG to ICO/ })).toBeVisible();
	});

	test('picking a listed conversion hands the file off to that tool', async ({ page }) => {
		await page.goto('/');
		await page.setInputFiles('input[type=file]', [fix('sample.png')]);
		await page.getByRole('button', { name: /^PNG to WEBP/ }).click();

		await expect(page).toHaveURL(/\/png-to-webp$/);
		// the dropped file should already be loaded; the convert button is
		// ready without needing to re-select anything.
		await expect(page.getByRole('button', { name: /^transmute 1 file$/i })).toBeVisible();
	});

	test('an unsupported file falls back to the manual tool grid', async ({ page }) => {
		await page.goto('/');
		await page.setInputFiles('input[type=file]', [fix('sample.exe')]);

		await expect(page.getByText(/mixed or unrecognized file types/i)).toBeVisible();
	});
});
