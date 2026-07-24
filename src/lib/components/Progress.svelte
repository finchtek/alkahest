<script lang="ts">
	let { value = -1, label = '' }: { value?: number; label?: string } = $props();
	const pct = $derived(Math.round(Math.min(Math.max(value, 0), 1) * 100));
</script>

<div class="w-full" role="status" aria-live="polite">
	<div class="mb-2 flex items-center justify-between gap-4 text-sm">
		<span class="truncate text-zinc-300">{label || 'transmuting…'}</span>
		{#if value >= 0}
			<span class="font-mono text-xs text-zinc-400">{pct}%</span>
		{/if}
	</div>
	<div class="h-2 overflow-hidden rounded-full bg-white/10">
		{#if value >= 0}
			<div
				class="spectrum-gradient h-full rounded-full transition-[width] duration-200"
				style="width: {pct}%"
			></div>
		{:else}
			<div class="spectrum-gradient h-full w-1/3 animate-pulse rounded-full"></div>
		{/if}
	</div>
</div>
