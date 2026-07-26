<script lang="ts">
	import Dropzone from '$lib/components/Dropzone.svelte';
	import { saveBlob } from '$lib/download';
	import { formatBytes } from '$lib/util';
	import { SITE } from '$lib/site';

	type PageEntry = {
		key: string;
		kind: 'existing' | 'blank';
		srcIndex?: number;
		rotation: number; // extra rotation the user added, on top of the page's own
		thumb?: string; // data URL
		width: number;
		height: number;
	};

	let srcFile: File | null = $state(null);
	let srcBytes: ArrayBuffer | null = $state(null);
	let pages: PageEntry[] = $state([]);
	let loading = $state(false);
	let loadError = $state('');
	let exporting = $state(false);
	let exportError = $state('');
	let done = $state(false);
	let seq = 0;

	function nextKey(): string {
		seq += 1;
		return `p${seq}`;
	}

	async function loadFile(files: File[]) {
		const f = files[0];
		if (!f) return;
		loading = true;
		loadError = '';
		done = false;
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
		done = false;
	}

	async function exportPdf() {
		if (!srcBytes || !pages.length) return;
		exporting = true;
		exportError = '';
		done = false;
		try {
			const { PDFDocument, degrees } = await import('pdf-lib');
			const src = await PDFDocument.load(srcBytes.slice(0), { ignoreEncryption: true });
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
			saveBlob(name, new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }));
			done = true;
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
		content="reorder, rotate, delete and insert PDF pages right in your browser. no uploads, no Acrobat subscription."
	/>
</svelte:head>

<section class="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
	<nav class="text-sm" aria-label="Breadcrumb">
		<a href="/#tools" class="text-zinc-600 transition hover:text-[#a34a32]">← all tools</a>
	</nav>
	<h1 class="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">edit PDF</h1>
	<p class="mt-3 leading-relaxed text-zinc-700">
		reorder pages, rotate the sideways ones, delete what you don't need and drop in a blank page
		where you do. free, and it never leaves your device. this is the one for when windows makes
		you hunt for a real PDF editor and every option wants a subscription.
	</p>

	{#if !srcFile}
		<div class="mt-6">
			<Dropzone
				accept=".pdf,application/pdf"
				multiple={false}
				hint="drop a single PDF to start editing its pages"
				onfiles={loadFile}
			/>
			{#if loading}
				<p class="mt-3 text-center text-sm text-zinc-700">reading pages…</p>
			{/if}
			{#if loadError}
				<p class="mt-3 text-center text-sm text-red-700">{loadError}</p>
			{/if}
		</div>
	{:else}
		<div class="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
			<div class="min-w-0">
				<p class="truncate text-sm font-medium text-zinc-800">{srcFile.name}</p>
				<p class="text-xs text-zinc-600">{pages.length} page{pages.length === 1 ? '' : 's'}</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<button class="btn-secondary !px-3 !py-1.5 text-sm" onclick={addBlank}>+ blank page</button>
				<button class="btn-secondary !px-3 !py-1.5 text-sm" onclick={resetAll}>start over</button>
			</div>
		</div>

		<div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
			{#each pages as p, i (p.key)}
				<div class="card flex flex-col gap-2 p-2.5">
					<div class="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-zinc-200/40">
						{#if p.kind === 'existing' && p.thumb}
							<img
								src={p.thumb}
								alt="page {i + 1}"
								class="max-h-full max-w-full transition-transform"
								style="transform: rotate({p.rotation}deg)"
							/>
						{:else}
							<div
								class="flex h-[70%] w-[55%] items-center justify-center rounded border border-dashed border-zinc-400/50 bg-zinc-100/60 text-[10px] text-zinc-600 transition-transform"
								style="transform: rotate({p.rotation}deg)"
							>
								blank
							</div>
						{/if}
						<span class="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-800">
							{i + 1}
						</span>
					</div>
					<div class="flex items-center justify-between gap-1">
						<button
							class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-zinc-800 disabled:opacity-30"
							onclick={() => move(i, -1)}
							disabled={i === 0}
							aria-label="move page {i + 1} earlier"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
						</button>
						<button
							class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-zinc-800"
							onclick={() => rotate(i, -90)}
							aria-label="rotate page {i + 1} left"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3.5-7.1M3 4v5h5" /></svg>
						</button>
						<button
							class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-zinc-800"
							onclick={() => rotate(i, 90)}
							aria-label="rotate page {i + 1} right"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3.5-7.1M21 4v5h-5" /></svg>
						</button>
						<button
							class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-red-700"
							onclick={() => remove(i)}
							aria-label="delete page {i + 1}"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
						</button>
						<button
							class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-zinc-800 disabled:opacity-30"
							onclick={() => move(i, 1)}
							disabled={i === pages.length - 1}
							aria-label="move page {i + 1} later"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
						</button>
					</div>
				</div>
			{/each}
		</div>

		{#if !pages.length}
			<p class="mt-6 text-center text-sm text-zinc-600">
				every page is gone. add a blank one or start over with a fresh file.
			</p>
		{/if}

		<div class="mt-6 flex flex-wrap items-center gap-3">
			<button class="btn-primary" onclick={exportPdf} disabled={exporting || !pages.length}>
				{exporting ? 'writing PDF…' : 'export edited PDF'}
			</button>
			{#if srcBytes}
				<span class="text-xs text-zinc-600">original: {formatBytes(srcBytes.byteLength)}</span>
			{/if}
		</div>
		{#if exportError}
			<p class="mt-3 text-sm text-red-700">{exportError}</p>
		{/if}
		{#if done}
			<p class="mt-3 text-sm text-emerald-700">downloaded. close the tab and nothing is kept anywhere.</p>
		{/if}
	{/if}
</section>
