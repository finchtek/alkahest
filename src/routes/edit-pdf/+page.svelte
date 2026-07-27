<script lang="ts">
	import Dropzone from '$lib/components/Dropzone.svelte';
	import SuccessModal from '$lib/components/SuccessModal.svelte';
	import { saveBlob } from '$lib/download';
	import { formatBytes } from '$lib/util';
	import { SITE } from '$lib/site';
	import type { ConvertResult } from '$lib/types';

	type PageEntry = {
		key: string;
		kind: 'existing' | 'blank';
		srcIndex?: number;
		rotation: number; // extra rotation the user added, on top of the page's own
		thumb?: string; // data URL
		width: number;
		height: number;
	};

	let srcFile = $state<File | null>(null);
	let srcBytes = $state<ArrayBuffer | null>(null);
	let pages: PageEntry[] = $state([]);
	let loading = $state(false);
	let loadError = $state('');
	let exporting = $state(false);
	let exportError = $state('');
	let modalOpen = $state(false);
	let results: ConvertResult[] = $state([]);
	let elapsedMs = $state(0);
	let seq = 0;

	const totalIn = $derived(srcBytes?.byteLength ?? 0);
	const totalOut = $derived(results.reduce((s, r) => s + r.blob.size, 0));

	function nextKey(): string {
		seq += 1;
		return `p${seq}`;
	}

	async function loadFile(files: File[]) {
		const f = files[0];
		if (!f) return;
		loading = true;
		loadError = '';
		modalOpen = false;
		results = [];
		pages = [];
		try {
			srcBytes = await f.arrayBuffer();
			srcFile = f;
			const { getPdfJs } = await import('$lib/convert/pdf');
			const pdfjs = await getPdfJs();
			const task = pdfjs.getDocument({ data: new Uint8Array(srcBytes.slice(0)) });
			const doc = await task.promise;
			const built: PageEntry[] = [];
			for (let i = 1; i <= doc.numPages; i++) {
				const page = await doc.getPage(i);
				const viewport = page.getViewport({ scale: 0.35 });
				const canvas = document.createElement('canvas');
				canvas.width = Math.ceil(viewport.width);
				canvas.height = Math.ceil(viewport.height);
				const ctx = canvas.getContext('2d');
				if (ctx) {
					await page.render({ canvasContext: ctx, viewport, canvas }).promise;
				}
				const full = page.getViewport({ scale: 1 });
				built.push({
					key: nextKey(),
					kind: 'existing',
					srcIndex: i - 1,
					rotation: 0,
					thumb: ctx ? canvas.toDataURL('image/png') : undefined,
					width: full.width,
					height: full.height
				});
			}
			await task.destroy();
			pages = built;
		} catch (err) {
			loadError = err instanceof Error ? err.message : String(err);
			srcFile = null;
			srcBytes = null;
		} finally {
			loading = false;
		}
	}

	function rotate(i: number, by: number) {
		pages[i].rotation = (pages[i].rotation + by + 360) % 360;
	}

	function remove(i: number) {
		pages = pages.filter((_, idx) => idx !== i);
	}

	function move(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= pages.length) return;
		const next = pages.slice();
		[next[i], next[j]] = [next[j], next[i]];
		pages = next;
	}

	function addBlank() {
		const last = pages[pages.length - 1];
		pages = [
			...pages,
			{
				key: nextKey(),
				kind: 'blank',
				rotation: 0,
				width: last?.width ?? 612,
				height: last?.height ?? 792
			}
		];
	}

	function resetAll() {
		srcFile = null;
		srcBytes = null;
		pages = [];
		loadError = '';
		exportError = '';
		results = [];
		modalOpen = false;
	}

	function download(r: ConvertResult) {
		saveBlob(r.name, r.blob);
	}

	function downloadAll() {
		if (results.length > 0) download(results[0]);
	}

	async function exportPdf() {
		if (!srcBytes || !pages.length) return;
		exporting = true;
		exportError = '';
		const t0 = performance.now();
		try {
			const { PDFDocument, degrees } = await import('pdf-lib');
			const src = await PDFDocument.load(srcBytes.slice(0), { ignoreEncryption: true });
			try {
				src.getForm().flatten();
			} catch {
				// ignore if document has no form or fields
			}
			const out = await PDFDocument.create();
			const existingIdx = pages
				.map((p, i) => ({ p, i }))
				.filter(({ p }) => p.kind === 'existing')
				.map(({ p }) => p.srcIndex!) as number[];
			const copied = existingIdx.length ? await out.copyPages(src, existingIdx) : [];
			const bySrcIndex = new Map<number, (typeof copied)[number]>();
			existingIdx.forEach((idx, k) => bySrcIndex.set(idx, copied[k]));
			for (const p of pages) {
				if (p.kind === 'existing' && p.srcIndex !== undefined) {
					const copiedPage = bySrcIndex.get(p.srcIndex)!;
					const finalAngle = (copiedPage.getRotation().angle + p.rotation) % 360;
					copiedPage.setRotation(degrees(finalAngle));
					out.addPage(copiedPage);
				} else {
					const blank = out.addPage([p.width, p.height]);
					if (p.rotation) blank.setRotation(degrees(p.rotation));
				}
			}
			const bytes = await out.save();
			const name = (srcFile?.name ?? 'document.pdf').replace(/\.pdf$/i, '') + '-edited.pdf';
			const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
			elapsedMs = performance.now() - t0;
			results = [{ name, blob }];
			modalOpen = true;
		} catch (err) {
			exportError = err instanceof Error ? err.message : String(err);
		} finally {
			exporting = false;
		}
	}
</script>

<svelte:head>
	<title>edit PDF. reorder, rotate, delete pages | {SITE.name}</title>
	<meta
		name="description"
		content="reorder, rotate, delete and insert PDF pages right in your browser. zero uploads, zero tracking."
	/>
</svelte:head>

<section class="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
	<nav class="text-sm" aria-label="Breadcrumb">
		<a href="/#tools" class="text-zinc-600 transition hover:text-[#a34a32]">← all tools</a>
	</nav>
	<span class="badge badge-terracotta mt-3 inline-flex">full editor</span>
	<h1 class="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">edit PDF</h1>
	<p class="mt-3 max-w-2xl leading-relaxed text-zinc-700">
		reorder pages, rotate sideways ones, delete unnecessary pages, and insert blank pages.
		100% on your device, private and free.
	</p>

	{#if !srcFile}
		<div class="mt-6">
			<Dropzone
				accept=".pdf,application/pdf"
				multiple={false}
				hint="drop a PDF to start editing its pages"
				onfiles={loadFile}
			/>
			{#if loading}
				<p class="mt-3 text-center text-sm font-medium text-zinc-700">reading pages…</p>
			{/if}
			{#if loadError}
				<p class="mt-3 text-center text-sm font-medium text-red-600">{loadError}</p>
			{/if}
		</div>
	{:else}
		<div class="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
			<div class="min-w-0">
				<p class="truncate text-sm font-bold text-zinc-900">{srcFile.name}</p>
				<p class="text-xs font-medium text-zinc-600">{pages.length} page{pages.length === 1 ? '' : 's'}</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<button class="btn-secondary !px-3 !py-1.5 text-xs font-bold" onclick={addBlank}>+ blank page</button>
				<button class="btn-secondary !px-3 !py-1.5 text-xs font-bold" onclick={resetAll}>change PDF</button>
			</div>
		</div>

		<div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each pages as p, i (p.key)}
				<div class="card group relative flex flex-col gap-2 p-3 transition hover:border-[#a34a32]/50 hover:shadow-xs">
					<div class="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-100 p-1.5">
						{#if p.kind === 'existing' && p.thumb}
							<img
								src={p.thumb}
								alt="page {i + 1}"
								class="max-h-full max-w-full rounded shadow-xs transition-transform"
								style="transform: rotate({p.rotation}deg)"
							/>
						{:else}
							<div
								class="flex h-[75%] w-[60%] items-center justify-center rounded border-2 border-dashed border-zinc-300 bg-white text-xs font-bold text-zinc-500 transition-transform"
								style="transform: rotate({p.rotation}deg)"
							>
								blank
							</div>
						{/if}
						<span class="absolute top-2 left-2 rounded-full bg-zinc-900/85 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
							{i + 1}
						</span>
					</div>
					<div class="flex items-center justify-between gap-1 border-t border-zinc-200/60 pt-2 text-zinc-600">
						<button
							class="rounded-lg p-1.5 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-25 disabled:hover:bg-transparent"
							onclick={() => move(i, -1)}
							disabled={i === 0}
							aria-label="move page {i + 1} earlier"
							title="Move page earlier"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
						</button>
						<button
							class="rounded-lg p-1.5 transition hover:bg-zinc-100 hover:text-zinc-900"
							onclick={() => rotate(i, -90)}
							aria-label="rotate page {i + 1} left"
							title="Rotate -90°"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3.5-7.1M3 4v5h5" /></svg>
						</button>
						<button
							class="rounded-lg p-1.5 transition hover:bg-zinc-100 hover:text-zinc-900"
							onclick={() => rotate(i, 90)}
							aria-label="rotate page {i + 1} right"
							title="Rotate +90°"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3.5-7.1M21 4v5h-5" /></svg>
						</button>
						<button
							class="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-50 hover:text-red-600"
							onclick={() => remove(i)}
							aria-label="delete page {i + 1}"
							title="Delete page"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
						</button>
						<button
							class="rounded-lg p-1.5 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-25 disabled:hover:bg-transparent"
							onclick={() => move(i, 1)}
							disabled={i === pages.length - 1}
							aria-label="move page {i + 1} later"
							title="Move page later"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
						</button>
					</div>
				</div>
			{/each}
		</div>

		{#if !pages.length}
			<p class="mt-6 text-center text-sm font-medium text-zinc-600">
				every page is gone. add a blank one or start over with a fresh file.
			</p>
		{/if}

		<div class="mt-6 flex flex-wrap items-center gap-3">
			<button class="btn-primary" onclick={exportPdf} disabled={exporting || !pages.length}>
				{exporting ? 'exporting PDF…' : 'export edited PDF'}
			</button>
			{#if srcBytes}
				<span class="text-xs font-medium text-zinc-600">original: {formatBytes(srcBytes.byteLength)}</span>
			{/if}
		</div>
		{#if exportError}
			<p class="mt-3 text-sm font-medium text-red-600">{exportError}</p>
		{/if}
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
