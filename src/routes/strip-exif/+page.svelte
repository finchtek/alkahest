<script lang="ts">
	import Dropzone from '$lib/components/Dropzone.svelte';
	import SuccessModal from '$lib/components/SuccessModal.svelte';
	import { saveBlob, zipResults } from '$lib/download';
	import { formatBytes } from '$lib/util';
	import { SITE } from '$lib/site';
	import type { ExifFinding } from '$lib/convert/exif';
	import type { ConvertResult } from '$lib/types';

	type Entry = {
		id: number;
		file: File;
		thumb: string;
		finding: ExifFinding | null;
		loading: boolean;
		expanded: boolean;
	};

	let entries: Entry[] = $state([]);
	let stripping = $state(false);
	let results: ConvertResult[] = $state([]);
	let stripError = $state('');
	let modalOpen = $state(false);
	let elapsedMs = $state(0);
	let nextId = 0;

	const anyMetadata = $derived(entries.some((e) => e.finding?.hasMetadata));
	const anyGps = $derived(entries.some((e) => e.finding?.gps));
	const totalIn = $derived(entries.reduce((s, e) => s + e.file.size, 0));
	const totalOut = $derived(results.reduce((s, r) => s + r.blob.size, 0));

	function patchEntry(id: number, patch: Partial<Entry>) {
		entries = entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
	}

	async function loadFiles(files: File[]) {
		results = [];
		stripError = '';
		modalOpen = false;
		const images = files.filter((f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
		for (const file of images) {
			const id = nextId++;
			const thumb = URL.createObjectURL(file);
			entries = [...entries, { id, file, thumb, finding: null, loading: true, expanded: false }];
			const { readExifFindings } = await import('$lib/convert/exif');
			const finding = await readExifFindings(file);
			patchEntry(id, { loading: false, finding });
		}
	}

	function remove(i: number) {
		URL.revokeObjectURL(entries[i].thumb);
		entries = entries.filter((_, idx) => idx !== i);
	}

	function resetAll() {
		entries.forEach((e) => URL.revokeObjectURL(e.thumb));
		entries = [];
		results = [];
		stripError = '';
		modalOpen = false;
	}

	async function stripAll() {
		if (!entries.length) return;
		stripping = true;
		stripError = '';
		const t0 = performance.now();
		try {
			const { stripMetadata } = await import('$lib/convert/exif');
			results = await stripMetadata(entries.map((e) => e.file), {}, () => {});
			elapsedMs = performance.now() - t0;
			modalOpen = true;
		} catch (err) {
			stripError = err instanceof Error ? err.message : String(err);
		} finally {
			stripping = false;
		}
	}

	function download(r: ConvertResult) {
		saveBlob(r.name, r.blob);
	}

	async function downloadAll() {
		if (results.length === 1) return download(results[0]);
		const zip = await zipResults(results);
		saveBlob('scrubbed-photos.zip', zip);
	}

	function mapUrl(lat: number, lon: number): string {
		return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
	}
</script>

<svelte:head>
	<title>photo metadata viewer & stripper | {SITE.name}</title>
	<meta
		name="description"
		content="see exactly what's hiding inside your photos — GPS location, camera model, timestamps — then strip it with one click. JPEGs are stripped byte-for-byte with zero quality loss, entirely in your browser."
	/>
</svelte:head>

<section class="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
	<nav class="text-sm" aria-label="Breadcrumb">
		<a href="/#tools" class="text-zinc-600 transition hover:text-[#a34a32]">← all tools</a>
	</nav>
	<span class="badge badge-moss mt-3 inline-flex">privacy</span>
	<h1 class="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
		photo metadata viewer &amp; stripper
	</h1>
	<p class="mt-3 max-w-2xl leading-relaxed text-zinc-700">
		most phone cameras quietly embed your exact GPS coordinates, camera model, and the timestamp
		into every photo. see what's actually in yours before you post it anywhere, then strip it in
		one click. JPEGs are stripped byte-for-byte — no re-encoding, no quality loss.
	</p>

	{#if !entries.length}
		<div class="mt-6">
			<Dropzone
				accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif"
				multiple={true}
				hint="drop photos to see what metadata they're carrying"
				onfiles={loadFiles}
			/>
		</div>
	{:else}
		<div class="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
			<div class="min-w-0">
				<p class="text-sm font-medium text-zinc-800">
					{entries.length} photo{entries.length === 1 ? '' : 's'}
				</p>
				<p class="text-xs text-zinc-600">
					{#if anyGps}
						<span class="font-semibold text-[#a34a32]">GPS location found</span> — this is the one to
						worry about
					{:else if anyMetadata}
						metadata found, no GPS location
					{:else}
						no metadata found in any of these
					{/if}
				</p>
			</div>
			<button class="btn-secondary !px-3 !py-1.5 text-sm" onclick={resetAll}>start over</button>
		</div>

		<div class="mt-5 flex flex-col gap-3">
			{#each entries as entry, i (entry.thumb)}
				<div class="card overflow-hidden">
					<div class="flex items-start gap-3 p-3.5">
						<img src={entry.thumb} alt={entry.file.name} class="h-16 w-16 shrink-0 rounded-lg object-cover" />
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between gap-2">
								<p class="truncate text-sm font-semibold text-zinc-900">{entry.file.name}</p>
								<button
									class="shrink-0 rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-200/60 hover:text-zinc-800"
									onclick={() => remove(i)}
									aria-label="remove {entry.file.name}"
								>
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
										<path d="M18 6 6 18M6 6l12 12" />
									</svg>
								</button>
							</div>
							<p class="text-xs text-zinc-600">{formatBytes(entry.file.size)}</p>

							{#if entry.loading}
								<p class="mt-2 text-xs text-zinc-600">reading metadata…</p>
							{:else if entry.finding}
								{#if !entry.finding.hasMetadata}
									<p class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#7a8450]">
										<span class="inline-block h-1.5 w-1.5 rounded-full bg-[#7a8450]"></span>
										clean — no metadata found
									</p>
								{:else}
									<div class="mt-2 flex flex-wrap gap-1.5">
										{#if entry.finding.gps}
											<a
												href={mapUrl(entry.finding.gps.lat, entry.finding.gps.lon)}
												target="_blank"
												rel="noopener noreferrer"
												class="badge badge-terracotta"
											>
												GPS: {entry.finding.gps.lat.toFixed(4)}, {entry.finding.gps.lon.toFixed(4)} ↗
											</a>
										{/if}
										{#if entry.finding.model}
											<span class="badge badge-clay">{entry.finding.make ? `${entry.finding.make} ` : ''}{entry.finding.model}</span>
										{/if}
										{#if entry.finding.dateTaken}
											<span class="badge badge-teal">{entry.finding.dateTaken}</span>
										{/if}
										{#if entry.finding.software}
											<span class="badge badge-amber">{entry.finding.software}</span>
										{/if}
									</div>
									<button
										class="mt-1.5 text-xs font-medium text-[#a34a32] hover:text-[#8c3d28]"
										onclick={() => (entry.expanded = !entry.expanded)}
									>
										{entry.expanded ? 'hide' : 'show'} all {Object.keys(entry.finding.raw).length} raw tags
									</button>
									{#if entry.expanded}
										<div class="mt-2 max-h-48 overflow-y-auto rounded-lg bg-zinc-100/70 p-2.5 font-mono text-[11px] text-zinc-700">
											{#each Object.entries(entry.finding.raw) as [k, v] (k)}
												<div class="flex gap-2">
													<span class="shrink-0 font-semibold text-zinc-800">{k}:</span>
													<span class="truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
												</div>
											{/each}
										</div>
									{/if}
								{/if}
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-6 flex flex-wrap items-center gap-3">
			<button class="btn-primary" onclick={stripAll} disabled={stripping}>
				{stripping ? 'scrubbing…' : `strip metadata from ${entries.length} photo${entries.length === 1 ? '' : 's'}`}
			</button>
		</div>
		{#if stripError}
			<p class="mt-3 text-sm font-medium text-red-600">{stripError}</p>
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
