<script lang="ts">
	import type { ToolDef } from '$lib/types';
	import { categoryColors } from '$lib/registry';

	let { tool, compact = false }: { tool: ToolDef; compact?: boolean } = $props();

	const icons: Record<string, string> = {
		image:
			'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z m12.5 5-3.1-3.1a2 2 0 0 0-2.8 0L6 21',
		media:
			'M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z m6 4 5 3-5 3Z',
		pdf: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h6',
		'3d': 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.3 7 12 12l8.7-5 M12 22V12',
		docs: 'M21 8v13H3V8 M1 3h22v5H1z M10 12h4'
	};

	const color = $derived(categoryColors[tool.category]);
</script>

<a
	href="/{tool.slug}"
	class="card group relative flex flex-col gap-1.5 overflow-hidden border-l-[4px] pl-3.5 {compact ? 'py-2.5 pr-3' : 'py-3 pr-4'} hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(61,47,36,0.4)]"
	style="border-left-color:{color}; background:{color}0d"
>
	<div class="flex items-center gap-2.5">
		<span class="rounded-md p-1.5 text-white shadow-sm transition group-hover:scale-110" style="background:{color}">
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d={icons[tool.category]} />
			</svg>
		</span>
		<span class="text-sm font-semibold text-zinc-900 group-hover:text-[#a34a32]">{tool.name}</span>
	</div>
	{#if !compact}
		<p class="text-xs leading-snug text-zinc-600">{tool.short}</p>
	{/if}
</a>
