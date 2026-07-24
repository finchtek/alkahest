<script lang="ts">
	import { SITE } from '$lib/site';
	import Logo from './Logo.svelte';
</script>

<header
	class="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60"
>
	<div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
		<a href="/" class="flex items-center gap-2.5 font-bold tracking-tight text-zinc-50">
			<Logo />
			<span class="flex flex-col leading-none">
				<span>{SITE.name}</span>
				<span class="mt-0.5 text-[10px] font-medium tracking-normal text-zinc-500">{SITE.byline}</span>
			</span>
		</a>
		<nav class="flex items-center gap-1 text-sm sm:gap-2">
			<a href="/#tools" class="rounded-lg px-3 py-1.5 text-zinc-300 transition hover:bg-white/5 hover:text-zinc-50">tools</a>
			<a href="/open-source" class="rounded-lg px-3 py-1.5 text-zinc-300 transition hover:bg-white/5 hover:text-zinc-50">open&nbsp;source</a>
			<a
				href={SITE.github}
				target="_blank"
				rel="noopener noreferrer"
				class="rounded-lg p-2 text-zinc-300 transition hover:bg-white/5 hover:text-zinc-50"
				aria-label="GitHub repository"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path
						d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.35.96.11-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.05.78 2.13v3.16c0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
					/>
				</svg>
			</a>
			<a
				href={SITE.tipUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="hidden items-center gap-1.5 rounded-lg border border-accent-500/40 bg-accent-500/10 px-3 py-1.5 font-medium text-accent-300 transition hover:bg-accent-500/20 sm:inline-flex"
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
