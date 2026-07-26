<script lang="ts">
	let {
		accept = '',
		multiple = true,
		compact = false,
		hint = '',
		onfiles
	}: {
		accept?: string;
		multiple?: boolean;
		compact?: boolean;
		hint?: string;
		onfiles: (files: File[]) => void;
	} = $props();

	let dragging = $state(false);
	let input: HTMLInputElement | undefined = $state();

	function emit(list: FileList | File[] | null | undefined) {
		const arr = [...(list ?? [])].filter((f) => f.size > 0 || f.type !== '');
		if (arr.length) onfiles(multiple ? arr : arr.slice(0, 1));
	}

	function ondrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		emit(e.dataTransfer?.files);
	}

	function onpaste(e: ClipboardEvent) {
		if (e.clipboardData?.files?.length) {
			e.preventDefault();
			emit(e.clipboardData.files);
		}
	}
</script>

<svelte:window {onpaste} />

<div
	role="button"
	tabindex="0"
	aria-label="Drop files here or press Enter to browse"
	class="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed text-center transition
		{dragging
		? 'border-[#a34a32] bg-[#a34a32]/10'
		: 'border-zinc-400/30 bg-white/30 hover:border-[#a34a32]/60 hover:bg-white/50'}
		{compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14 sm:py-20'}"
	ondragover={(e) => {
		e.preventDefault();
		dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	{ondrop}
	onclick={() => input?.click()}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			input?.click();
		}
	}}
>
	<div
		class="rounded-xl border border-zinc-400/40 bg-white/60 p-3 text-[#a34a32] shadow-sm transition group-hover:scale-105 {dragging ? 'scale-110' : ''}"
	>
		<svg width={compact ? 22 : 30} height={compact ? 22 : 30} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
			<path d="M14 2v6h6" />
			<path d="M12 18v-6" />
			<path d="m9 15 3 3 3-3" />
		</svg>
	</div>
	<div>
		<p class="font-semibold text-zinc-900 {compact ? 'text-sm' : 'text-lg'}">
			{dragging ? 'drop it! (gently)' : 'drop files here'}
		</p>
		<p class="mt-1 text-xs text-zinc-700 sm:text-sm">
			or <span class="text-[#a34a32] underline decoration-[#a34a32]/40 underline-offset-2">browse</span> · paste straight from your clipboard
		</p>
	</div>
	{#if hint}
		<p class="text-xs text-zinc-600">{hint}</p>
	{/if}
	<input
		bind:this={input}
		type="file"
		{accept}
		{multiple}
		class="sr-only"
		onchange={(e) => {
			emit(e.currentTarget.files);
			e.currentTarget.value = '';
		}}
	/>
</div>
