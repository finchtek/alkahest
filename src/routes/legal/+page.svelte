<script lang="ts">
	import { SITE } from '$lib/site';
</script>

<svelte:head>
	<title>terms &amp; privacy | {SITE.name}</title>
	<meta
		name="description"
		content="{SITE.name}'s terms of service and privacy policy: what happens (and doesn't happen) to your files, and the legal basics of using the site."
	/>
	<link rel="canonical" href="{SITE.origin}/legal" />
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
	<h1 class="text-3xl font-extrabold tracking-tight text-zinc-50 sm:text-4xl">terms &amp; privacy</h1>
	<div class="spectrum-gradient mt-4 h-1 w-20 rounded-full opacity-80"></div>
	<p class="mt-5 leading-relaxed text-zinc-400">
		last updated 2026-07-23. this covers using {SITE.name} as a visitor. if you're looking for the
		license that governs the source code itself, that's a separate thing — see
		<a href="/open-source" class="text-accent-300 underline decoration-accent-500/40 underline-offset-2 hover:text-accent-200">source &amp; licenses</a>.
	</p>

	<h2 class="mt-10 text-xl font-bold text-zinc-50">privacy policy</h2>
	<p class="mt-3 leading-relaxed text-zinc-400">
		{SITE.name} doesn't have a backend. every conversion runs in your browser, on your device,
		using WebAssembly. the files you drop are read into your browser's own memory and never
		leave it — they are never uploaded, transmitted, or seen by us, because there is no server on
		the other end to send them to.
	</p>
	<p class="mt-3 leading-relaxed text-zinc-400">
		concretely, this site does not use cookies, does not run any analytics or tracking script, does
		not have a login or account system, and does not collect, store, or sell any personal data,
		because it has no mechanism to do any of those things. the only network requests this page
		makes are to fetch the site itself and the conversion engines (WASM files), all served from this
		same domain and cached by your browser — you can verify this yourself any time in your
		browser's network tab.
	</p>
	<p class="mt-3 leading-relaxed text-zinc-400">
		the hosting provider serving these static files may log basic, standard web-server
		information (like IP address and request timestamps) the way any web host does. that logging
		happens at the infrastructure level, is not something {SITE.name} configures or accesses, and is
		unrelated to your files or what you convert.
	</p>

	<h2 class="mt-10 text-xl font-bold text-zinc-50">terms of service</h2>
	<p class="mt-3 leading-relaxed text-zinc-400">
		{SITE.name} is provided free, as-is, with no warranty of any kind, express or implied. that
		means no guarantee of uninterrupted availability, no guarantee that every conversion will be
		perfect or lossless for every file, and no liability for any damages, data loss, or other harm
		arising from using (or being unable to use) the site. you're responsible for keeping your own
		backups of anything you convert.
	</p>
	<p class="mt-3 leading-relaxed text-zinc-400">
		you agree to use {SITE.name} only for files you have the legal right to convert, and not to use
		it for any unlawful purpose. these terms are governed by the laws of the State of Wyoming,
		without regard to conflict-of-law principles.
	</p>
	<p class="mt-3 leading-relaxed text-zinc-400">
		these terms may be updated from time to time; the date at the top of this page reflects the
		most recent revision. continued use of the site after a change means you accept the updated
		terms.
	</p>

	<h2 class="mt-10 text-xl font-bold text-zinc-50">questions</h2>
	<p class="mt-3 leading-relaxed text-zinc-400">
		reach out via the
		<a href={SITE.tipUrl} target="_blank" rel="noopener noreferrer" class="text-accent-300 underline decoration-accent-500/40 underline-offset-2 hover:text-accent-200">tip jar / contact link</a>
		if anything here needs clarifying.
	</p>
</section>
