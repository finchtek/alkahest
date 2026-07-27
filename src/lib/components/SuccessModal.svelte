<script lang="ts">
	import { SITE } from '$lib/site';
	import { formatBytes, formatDuration } from '$lib/util';
	import type { ConvertResult } from '$lib/types';

	let {
		open = false,
		results = [],
		elapsedMs = 0,
		totalIn = 0,
		totalOut = 0,
		onclose,
		onreset,
		ondownload,
		ondownloadall
	}: {
		open?: boolean;
		results?: ConvertResult[];
		elapsedMs?: number;
		totalIn?: number;
		totalOut?: number;
		onclose: () => void;
		onreset: () => void;
		ondownload: (r: ConvertResult) => void;
		ondownloadall: () => void;
	} = $props();

	const saved = $derived(totalIn > 0 && totalOut < totalIn ? 1 - totalOut / totalIn : 0);

	const cheekyMessages = [
		'no ads, no paywalls, no tracking. ever. if this saved you time or money, consider donating to our ko-fi to keep the cauldron bubbling.',
		'if this saved you time, money, or a headache, consider tossing a coin to our ko-fi!',
		'saved you from an expensive subscription or a sketchy converter site? consider supporting us on ko-fi!',
		'100% free and on-device. if this saved you time or money today, consider buying us a coffee on ko-fi!'
	];

	let messageIndex = $state(0);

	$effect(() => {
		if (open) {
			messageIndex = Math.floor(Math.random() * cheekyMessages.length);
		}
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (open && e.key === 'Escape') onclose();
	}}
/>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/70 p-4 backdrop-blur-sm sm:items-center"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) onclose();
		}}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="success-title"
			class="card relative w-full max-w-md overflow-hidden bg-zinc-900 p-6 shadow-2xl"
		>
			<div class="spectrum-gradient absolute inset-x-0 top-0 h-1"></div>
			<div class="flex items-start justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-emerald-500/15 p-2 text-emerald-400">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M20 6 9 17l-5-5" />
						</svg>
					</div>
					<h2 id="success-title" class="text-lg font-bold text-zinc-50">
						transmuted in {formatDuration(elapsedMs)}
					</h2>
				</div>
				<button class="cursor-pointer rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100" onclick={onclose} aria-label="Close">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
						<path d="M18 6 6 18M6 6l12 12" />
					</svg>
				</button>
			</div>

			<p class="mt-3 text-sm leading-relaxed text-zinc-400">
				processed right on your device: {results.length}
				{results.length === 1 ? 'file' : 'files'}, {formatBytes(totalOut)}{saved > 0.01
					? ` (${Math.round(saved * 100)}% smaller)`
					: ''}. nothing was uploaded, nothing was tracked.{elapsedMs < 5000
					? ' prettyyy fast, right?'
					: ''}
			</p>

			<div class="mt-4 flex flex-col gap-2">
				{#if results.length === 1}
					<button class="btn-primary" onclick={() => ondownload(results[0])}>
						download {results[0].name}
					</button>
				{:else}
					<button class="btn-primary" onclick={ondownloadall}>
						download all ({results.length} files, .zip)
					</button>
				{/if}
				<button class="btn-secondary" onclick={onreset}>transmute more files</button>
			</div>

			<div class="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
				<p class="text-sm text-zinc-300">
					{cheekyMessages[messageIndex]}
				</p>
				<a
					href={SITE.tipUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="mt-3 inline-flex items-center gap-2 rounded-xl border border-accent-500/40 bg-accent-500/10 px-4 py-2 text-sm font-semibold text-accent-300 transition hover:bg-accent-500/20"
				>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.4h4c.9-1.3 2.3-2.4 4.3-2.4 3.5 0 5.3 3.6 3.7 6.7C19.5 16.3 12 21 12 21Z" />
					</svg>
					{SITE.tipLabel}
				</a>
			</div>
		</div>
	</div>
{/if}
