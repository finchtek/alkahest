import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	// @ffmpeg/ffmpeg spawns its worker via `new URL('./worker.js', import.meta.url)`;
	// pre-bundling breaks that resolution, so exclude it from optimizeDeps.
	optimizeDeps: {
		exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
	},
	build: {
		target: 'es2022'
	}
});
