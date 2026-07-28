<script lang="ts">
	import { SITE } from '$lib/site';
	import Logo from './Logo.svelte';
</script>

<footer class="relative border-t border-[#d9c7a8] bg-[#e8dcc8]/40">
	<div class="spectrum-gradient absolute inset-x-0 top-0 h-px opacity-40"></div>
	<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
		<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
			<div class="max-w-sm">
				<div class="flex items-center gap-2.5 font-bold text-[#3d2f24]">
					<Logo size={22} />
					<span class="font-display">{SITE.name} <span class="text-xs font-sans font-medium text-[#6b5847]">{SITE.byline}</span></span>
				</div>
				<p class="mt-3 text-sm leading-relaxed text-[#6b5847]">
					all processing happens locally on your device using WebAssembly. your files are never
					uploaded anywhere or tracked. promise.
				</p>
			</div>
			<nav class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm" aria-label="Footer">
				<a href="/#tools" class="text-[#3d2f24] transition hover:text-[#a34a32]">all tools</a>
				<a href="https://finchtek.org" rel="external" data-sveltekit-reload class="text-[#3d2f24] transition hover:text-[#a34a32]">finchtek hub</a>
				<a href="https://pulse.finchtek.org" rel="external" data-sveltekit-reload class="text-[#3d2f24] transition hover:text-[#a34a32]">pulse notary</a>
				<a href="/legal" class="text-[#3d2f24] transition hover:text-[#a34a32]">terms &amp; privacy</a>
			</nav>
		</div>
		<p class="mt-8 text-xs text-[#6b5847]">
			no cookies · no analytics · no servers · built with SvelteKit, FFmpeg (WASM), pdf-lib, pdf.js,
			libheif &amp; SVGO
		</p>
	</div>
</footer>
