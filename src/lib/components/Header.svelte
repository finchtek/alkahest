<script lang="ts">
	import { SITE } from '$lib/site';
	import Logo from './Logo.svelte';
</script>

<header
	class="sticky top-0 z-40 border-b border-zinc-300/50 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50"
>
	<div class="guild-stripe h-[3px] w-full opacity-90"></div>
	<div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
		<a href="/" class="flex items-center gap-2.5 font-bold tracking-tight text-zinc-900">
			<Logo />
			<span class="flex flex-col leading-none">
				<span>{SITE.name}</span>
				<span class="mt-0.5 text-[10px] font-medium tracking-normal text-zinc-600">{SITE.byline}</span>
			</span>
		</a>
		<nav class="flex items-center gap-1 text-sm sm:gap-2">
			<a href="/#tools" class="rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">tools</a>
			<a href="https://finchtek.org/projects.html" rel="external" data-sveltekit-reload class="rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">guild suite</a>
			<a href="https://pulse.finchtek.org" rel="external" data-sveltekit-reload class="rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">pulse notary</a>
			<a
				href={SITE.tipUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="hidden items-center gap-1.5 rounded-lg border border-[#a34a32]/40 bg-[#a34a32]/10 px-3 py-1.5 font-medium text-[#a34a32] transition hover:bg-[#a34a32]/20 sm:inline-flex"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path
						d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.4h4c.9-1.3 2.3-2.4 4.3-2.4 3.5 0 5.3 3.6 3.7 6.7C19.5 16.3 12 21 12 21Z"
					/>
				</svg>
				tip jar
			</a>
		</nav>
	</div>
</header>
