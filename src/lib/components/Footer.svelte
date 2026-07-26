<script lang="ts">
	import { SITE } from '$lib/site';
	import Logo from './Logo.svelte';
</script>

<footer class="relative border-t border-zinc-300/50 bg-white/50">
	<div class="spectrum-gradient absolute inset-x-0 top-0 h-px opacity-40"></div>
	<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
		<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
			<div class="max-w-sm">
				<div class="flex items-center gap-2.5 font-bold text-zinc-900">
					<Logo size={22} />
					<span>{SITE.name} <span class="text-xs font-medium text-zinc-600">{SITE.byline}</span></span>
				</div>
				<p class="mt-3 text-sm leading-relaxed text-zinc-700">
					all processing happens locally on your device using WebAssembly. your files are never
					uploaded anywhere or tracked. promise.
				</p>
			</div>
			<nav class="grid grid-cols-2 gap-x-12 gap-y-2 text-sm" aria-label="Footer">
				<a href="/#tools" class="text-zinc-700 transition hover:text-zinc-900">all tools</a>
				<a href={SITE.tipUrl} target="_blank" rel="noopener noreferrer" class="text-zinc-700 transition hover:text-zinc-900">tip jar</a>
				<a href="/legal" class="text-zinc-700 transition hover:text-zinc-900">terms &amp; privacy</a>
			</nav>
		</div>
		<p class="mt-8 text-xs text-zinc-600">
			no cookies · no analytics · no servers · built with SvelteKit, FFmpeg (WASM), pdf-lib, pdf.js,
			libheif &amp; SVGO
		</p>
	</div>
</footer>
