<script lang="ts">
	import type { ToolDef } from '$lib/types';

	let { tool }: { tool: ToolDef } = $props();

	const icons: Record<string, string> = {
		image:
			'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z m12.5 5-3.1-3.1a2 2 0 0 0-2.8 0L6 21',
		media:
			'M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z m6 4 5 3-5 3Z',
		pdf: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h6',
		'3d': 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.3 7 12 12l8.7-5 M12 22V12',
		docs: 'M21 8v13H3V8 M1 3h22v5H1z M10 12h4'
	};
</script>

<a
	href="/{tool.slug}"
	class="card group flex flex-col gap-2 p-4 hover:-translate-y-0.5 hover:border-accent-500/50 hover:bg-zinc-900 hover:shadow-[0_12px_40px_-12px_rgba(194,109,51,0.35)]"
>
	<div class="flex items-center gap-3">
		<span class="rounded-lg bg-white/5 p-2 text-accent-400 transition group-hover:bg-accent-500/15">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d={icons[tool.category]} />
			</svg>
		</span>
		<span class="font-semibold text-zinc-100 group-hover:text-zinc-50">{tool.name}</span>
	</div>
	<p class="text-sm text-zinc-400">{tool.short}</p>
</a>
