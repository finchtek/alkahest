import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	timeout: 240_000,
	workers: 2,
	retries: 1,
	reporter: [['list']],
	use: {
		baseURL: 'http://localhost:4173',
		viewport: { width: 1280, height: 800 },
		// Use the environment's preinstalled Chromium when the pinned
		// Playwright build isn't downloaded (e.g. offline CI sandboxes).
		launchOptions: process.env.PW_CHROMIUM_PATH
			? { executablePath: process.env.PW_CHROMIUM_PATH }
			: {}
	},
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: true,
		timeout: 300_000
	}
});
