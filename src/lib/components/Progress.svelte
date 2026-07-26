<script lang="ts">
	let { value = -1, label = '' }: { value?: number; label?: string } = $props();
	const pct = $derived(Math.round(Math.min(Math.max(value, 0), 1) * 100));
</script>

<div class="w-full" role="status" aria-live="polite">
	<div class="mb-2 flex items-center justify-between gap-4 text-sm">
		<span class="truncate text-zinc-700">{label || 'transmuting…'}</span>
		{#if value >= 0}
			<span class="font-mono text-xs text-zinc-600">{pct}%</span>
		{/if}
	</div>
	<div class="h-2 overflow-hidden rounded-full bg-zinc-300/50">
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
