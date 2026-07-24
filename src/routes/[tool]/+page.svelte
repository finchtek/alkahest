<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import Dropzone from '$lib/components/Dropzone.svelte';
	import Progress from '$lib/components/Progress.svelte';
	import SuccessModal from '$lib/components/SuccessModal.svelte';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { toolBySlug, tools } from '$lib/registry';
	import { takePending } from '$lib/pending';
	import { saveBlob, zipResults } from '$lib/download';
	import { formatBytes } from '$lib/util';
	import { SITE } from '$lib/site';
	import type { ConvertResult } from '$lib/types';

	const tool = $derived(toolBySlug(page.params.tool ?? ''));
	const related = $derived(
		tool ? tools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 3) : []
	);

	let files: File[] = $state([]);
	let opts: Record<string, string | number> = $state({});
	let phase: 'idle' | 'working' | 'done' | 'error' = $state('idle');
	let progress = $state(-1);
	let progressLabel = $state('');
	let results: ConvertResult[] = $state([]);
	let errorMsg = $state('');
	let elapsedMs = $state(0);
	let modalOpen = $state(false);
	let rejectedNote = $state('');

	const totalIn = $derived(files.reduce((s, f) => s + f.size, 0));
	const totalOut = $derived(results.reduce((s, r) => s + r.blob.size, 0));
	const minFiles = $derived(tool?.minFiles ?? 1);
	const canConvert = $derived(files.length >= minFiles && phase !== 'working');

	let currentSlug = '';
	$effect(() => {
		const t = tool;
		if (!t || t.slug === currentSlug) return;
		currentSlug = t.slug;
		untrack(() => {
			files = [];
			results = [];
			phase = 'idle';
			progress = -1;
			progressLabel = '';
			errorMsg = '';
			modalOpen = false;
			rejectedNote = '';
			opts = Object.fromEntries(t.options.map((o) => [o.key, o.default]));
			const pending = takePending();
			if (pending) addFiles(pending);
		});
	});

	function matchesAccept(f: File): boolean {
		if (!tool) return false;
		const ext = ('.' + (f.name.split('.').pop() ?? '')).toLowerCase();
		return tool.accept.includes(ext);
	}

	function addFiles(incoming: File[]) {
		if (!tool) return;
		const ok = incoming.filter(matchesAccept);
		const rejected = incoming.length - ok.length;
		rejectedNote = rejected
			? `${rejected} file${rejected > 1 ? 's' : ''} skipped. this tool takes ${tool.accept.join(', ')}`
			: '';
		const next = tool.multiple ? [...files, ...ok] : ok.slice(0, 1);
		// de-dupe by name+size
		const seen = new Set<string>();
		files = next.filter((f) => {
			const k = `${f.name}|${f.size}`;
			if (seen.has(k)) return false;
			seen.add(k);
			return true;
		});
		if (phase === 'done' || phase === 'error') {
			phase = 'idle';
			results = [];
			errorMsg = '';
		}
	}

	function removeFile(i: number) {
		files = files.filter((_, idx) => idx !== i);
	}

	async function convert() {
		if (!tool || !canConvert) return;
		phase = 'working';
		progress = -1;
		progressLabel = tool.heavy ? 'heating the crucible (downloading the FFmpeg engine)…' : 'starting…';
		errorMsg = '';
		const t0 = performance.now();
		try {
			const out = await tool.run(files, { ...opts }, (p) => {
				progress = p.ratio;
				if (p.label) progressLabel = p.label;
			});
			elapsedMs = performance.now() - t0;
			results = out;
			phase = 'done';
			modalOpen = true;
		} catch (err) {
			console.error(err);
			errorMsg = err instanceof Error ? err.message : String(err);
			phase = 'error';
		}
	}

	function download(r: ConvertResult) {
		saveBlob(r.name, r.blob);
	}

	async function downloadAll() {
		if (results.length === 1) return download(results[0]);
		const zip = await zipResults(results);
		saveBlob(`${SITE.name.toLowerCase()}-${tool?.slug ?? 'files'}.zip`, zip);
	}

	function resetAll() {
		modalOpen = false;
		files = [];
		results = [];
		phase = 'idle';
		rejectedNote = '';
	}
</script>

<svelte:head>
	{#if tool}
		<title>{tool.name}. free, private, in-browser | {SITE.name}</title>
		<meta name="description" content={tool.description} />
		<link rel="canonical" href="{SITE.origin}/{tool.slug}" />
		<meta property="og:title" content="{tool.name}. {SITE.name}" />
		<meta property="og:description" content={tool.description} />
		<meta property="og:type" content="website" />
		<meta property="og:url" content="{SITE.origin}/{tool.slug}" />
	{/if}
</svelte:head>

{#if tool}
	<section class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
		<nav class="text-sm" aria-label="Breadcrumb">
			<a href="/#tools" class="text-zinc-500 transition hover:text-accent-300">← all tools</a>
		</nav>
		<h1 class="mt-3 text-3xl font-extrabold tracking-tight text-zinc-50 sm:text-4xl">
			{tool.name}
		</h1>
		<p class="mt-3 leading-relaxed text-zinc-400">{tool.description}</p>

		{#if tool.heavy}
			<p class="mt-3 inline-flex items-start gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/5 px-3 py-2 text-xs leading-relaxed text-indigo-200/90">
				<svg class="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
					<circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
				</svg>
				heads up: the first run downloads the FFmpeg engine (~31 MB) from this site. once downloaded,
				your browser caches it. your files still never leave your device.
			</p>
		{/if}

		<div class="mt-6">
			<Dropzone
				accept={tool.acceptAttr}
				multiple={tool.multiple}
				compact={files.length > 0}
				hint="Accepts {tool.accept.join(', ')}"
				onfiles={addFiles}
			/>
			{#if rejectedNote}
				<p class="mt-2 text-sm text-amber-300">{rejectedNote}</p>
			{/if}
		</div>

		{#if files.length}
			<ul class="mt-4 flex flex-col gap-2">
				{#each files as f, i (f.name + f.size)}
					<li class="card flex items-center justify-between gap-3 px-4 py-2.5">
						<div class="min-w-0">
							<p class="truncate text-sm font-medium text-zinc-200">{f.name}</p>
							<p class="text-xs text-zinc-500">{formatBytes(f.size)}</p>
						</div>
						<button
							class="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
							onclick={() => removeFile(i)}
							aria-label="Remove {f.name}"
							disabled={phase === 'working'}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
								<path d="M18 6 6 18M6 6l12 12" />
							</svg>
						</button>
					</li>
				{/each}
			</ul>

			{#if tool.options.length}
				<div class="card mt-4 flex flex-col gap-4 p-4">
					{#each tool.options as opt (opt.key)}
						<label class="flex flex-col gap-1.5 text-sm">
							<span class="flex items-center justify-between font-medium text-zinc-300">
								{opt.label}
								{#if opt.type === 'range'}
									<span class="font-mono text-xs text-accent-300">
										{opt.key === 'quality'
											? `${Math.round(Number(opts[opt.key]) * 100)}%`
											: opts[opt.key]}
									</span>
								{/if}
							</span>
							{#if opt.type === 'range'}
								<input
									type="range"
									min={opt.min}
									max={opt.max}
									step={opt.step}
									bind:value={opts[opt.key]}
									class="accent-cyan-400"
									disabled={phase === 'working'}
								/>
							{:else if opt.type === 'select'}
								<select
									bind:value={opts[opt.key]}
									disabled={phase === 'working'}
									class="rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-accent-500 focus:outline-none"
								>
									{#each opt.choices ?? [] as c (c.value)}
										<option value={c.value}>{c.label}</option>
									{/each}
								</select>
							{:else}
								<input
									type="text"
									placeholder={opt.placeholder}
									bind:value={opts[opt.key]}
									disabled={phase === 'working'}
									class="rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:border-accent-500 focus:outline-none"
								/>
								{#if opt.hint}
									<span class="text-xs text-zinc-500">{opt.hint}</span>
								{/if}
							{/if}
						</label>
					{/each}
				</div>
			{/if}

			<div class="mt-5">
				{#if phase === 'working'}
					<Progress value={progress} label={progressLabel} />
				{:else}
					<button class="btn-primary w-full sm:w-auto" onclick={convert} disabled={!canConvert}>
						transmute {files.length} {files.length === 1 ? 'file' : 'files'}
					</button>
					{#if files.length < minFiles}
						<p class="mt-2 text-sm text-zinc-500">
							add at least {minFiles} files to continue.
						</p>
					{/if}
				{/if}
			</div>
		{/if}

		{#if phase === 'error'}
			<div class="card mt-5 border-red-500/30 bg-red-500/5 p-4" role="alert">
				<p class="font-semibold text-red-300">welp, the transmutation fizzled</p>
				<p class="mt-1 text-sm break-words text-zinc-400">{errorMsg}</p>
				<button class="btn-secondary mt-3" onclick={() => (phase = 'idle')}>try again</button>
			</div>
		{/if}

		{#if phase === 'done' && results.length}
			<div class="card mt-6 p-4">
				<div class="flex items-center justify-between gap-3">
					<h2 class="font-semibold text-zinc-100">
						results <span class="text-sm font-normal text-zinc-500">({formatBytes(totalOut)})</span>
					</h2>
					{#if results.length > 1}
						<button class="btn-secondary !px-3 !py-1.5 text-sm" onclick={downloadAll}>
							download all (.zip)
						</button>
					{/if}
				</div>
				<ul class="mt-3 flex flex-col gap-2">
					{#each results as r (r.name)}
						<li class="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
							<div class="min-w-0">
								<p class="truncate text-sm text-zinc-200">{r.name}</p>
								<p class="text-xs text-zinc-500">{formatBytes(r.blob.size)}</p>
							</div>
							<button class="btn-primary !px-3 !py-1.5 text-sm" onclick={() => download(r)}>
								download
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if related.length}
			<div class="mt-12">
				<h2 class="text-sm font-semibold text-zinc-500">more like this</h2>
				<div class="mt-3 grid gap-3 sm:grid-cols-3">
					{#each related as r (r.slug)}
						<ToolCard tool={r} />
					{/each}
				</div>
			</div>
		{/if}
	</section>

	<SuccessModal
		open={modalOpen}
		{results}
		{elapsedMs}
		{totalIn}
		{totalOut}
		onclose={() => (modalOpen = false)}
		onreset={resetAll}
		ondownload={download}
		ondownloadall={downloadAll}
	/>
{:else}
	<section class="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
		<h1 class="text-2xl font-bold text-zinc-100">recipe not found</h1>
		<p class="mt-2 text-zinc-400">that transmutation isn’t in the guild book (yet, so feel free to ask for it).</p>
		<a href="/#tools" class="btn-primary mt-6">browse the guild book</a>
	</section>
{/if}
