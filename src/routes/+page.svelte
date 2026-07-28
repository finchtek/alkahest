<script lang="ts">
	import { goto } from '$app/navigation';
	import Dropzone from '$lib/components/Dropzone.svelte';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { categories, categoryBadge, categoryColors, matchingTools, tools } from '$lib/registry';
	import { setPending } from '$lib/pending';
	import { SITE } from '$lib/site';
	import type { ToolDef } from '$lib/types';

	let unknownMsg = $state('');
	let droppedFiles = $state<File[]>([]);
	let matches = $state<ToolDef[]>([]);
	let query = $state('');

	// first category starts expanded so there's something to see; the rest
	// stay collapsed until opened, keeping the default page short
	let openCats = $state<Record<string, boolean>>({ [categories[0].id]: true });

	function onfiles(files: File[]) {
		const found = matchingTools(files);
		droppedFiles = files;
		matches = found;
		if (found.length > 0) {
			unknownMsg = '';
		} else {
			unknownMsg = 'Hmm. Mixed or unrecognized file types. Search or browse below and we\'ll take it from there.';
		}
	}

	function pick(slug: string) {
		setPending(droppedFiles);
		goto(`/${slug}`);
	}

	function detectedLabel(files: File[]): string {
		const exts = [...new Set(files.map((f) => (/\.([^.]+)$/.exec(f.name)?.[1] ?? '?').toUpperCase()))];
		return `${files.length} file${files.length === 1 ? '' : 's'} · ${exts.join(', ')}`;
	}

	function jumpTo(id: string) {
		openCats[id] = true;
		requestAnimationFrame(() => {
			document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}

	// hand-built editor pages that live outside the registry (custom UI, not a
	// simple file-in/file-out tool), kept searchable alongside everything else
	const specialTools = [
		{
			slug: 'edit-pdf',
			name: 'Edit PDF',
			short: 'Reorder, rotate, delete and insert pages — the full editor',
			keywords: 'pdf editor pages reorder rotate delete insert merge',
			color: '#a34a32',
			badgeClass: 'badge-terracotta',
			badgeLabel: 'Full Editor',
			icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4'
		},
		{
			slug: 'strip-exif',
			name: 'Photo Metadata Viewer & Stripper',
			short: 'See the GPS location & camera info hiding in your photos, then strip it',
			keywords: 'exif metadata gps location privacy strip photo camera',
			color: '#7a8450',
			badgeClass: 'badge-moss',
			badgeLabel: 'Privacy',
			icon: 'M12 2 3 6v6c0 5 4 8 9 10 5-2 9-5 9-10V6Z'
		}
	];

	const filtered = $derived(
		query.trim().length > 0
			? tools.filter((t) => {
					const q = query.trim().toLowerCase();
					return t.name.toLowerCase().includes(q) || t.short.toLowerCase().includes(q);
				})
			: []
	);

	const filteredSpecial = $derived(
		query.trim().length > 0
			? specialTools.filter((t) => {
					const q = query.trim().toLowerCase();
					return t.name.toLowerCase().includes(q) || t.short.toLowerCase().includes(q) || t.keywords.includes(q);
				})
			: []
	);

	const badges = [
		{ label: '100% On-Device', dot: '#c98a3e' },
		{ label: 'Zero Uploads', dot: '#7a8450' },
		{ label: 'No Ads, No Tracking', dot: '#a34a32' }
	];

	const steps = [
		{
			n: '1',
			color: 'bg-[#7a8450]/15 text-[#7a8450]',
			title: 'Bring a File to the Lab',
			body: 'Read straight into your browser\'s memory. No form posts, no uploads. The network tab stays completely silent.'
		},
		{
			n: '2',
			color: 'bg-[#c98a3e]/15 text-[#c98a3e]',
			title: 'The Alchemy Happens Here',
			body: 'FFmpeg, libheif, pdf.js and friends: real native libraries compiled to WebAssembly, working their craft in Web Workers.'
		},
		{
			n: '3',
			color: 'bg-[#a34a32]/15 text-[#a34a32]',
			title: 'Collect Your Work',
			body: 'Your transmuted file comes back as a download. Close the tab and nothing persists anywhere.'
		}
	];
</script>

<svelte:head>
	<title>{SITE.name}. {SITE.tagline} Free In-Browser File Converter</title>
	<meta name="description" content={SITE.description} />
	<link rel="canonical" href={SITE.origin} />
	<meta property="og:title" content="{SITE.name}. {SITE.tagline}" />
	<meta property="og:description" content={SITE.description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE.origin} />
</svelte:head>

<!-- hero -->
<section class="relative overflow-hidden">
	<div
		class="pointer-events-none absolute inset-0"
		style="background:
			radial-gradient(700px 340px at 15% 0%, rgb(154 79 63 / 0.09), transparent),
			radial-gradient(700px 340px at 50% 0%, rgb(194 109 51 / 0.10), transparent),
			radial-gradient(700px 340px at 85% 10%, rgb(95 111 82 / 0.08), transparent);"
		aria-hidden="true"
	></div>

	<!-- alchemical seal: concentric rings behind the dropzone, quiet-alchemy motif -->
	<svg
		class="pointer-events-none absolute top-[8rem] left-1/2 -z-0 hidden -translate-x-1/2 opacity-[0.09] sm:block"
		width="720"
		height="720"
		viewBox="0 0 720 720"
		aria-hidden="true"
	>
		<circle cx="360" cy="360" r="330" fill="none" stroke="#a34a32" stroke-width="1.5" />
		<circle cx="360" cy="360" r="280" fill="none" stroke="#c98a3e" stroke-width="1" stroke-dasharray="2 6" />
		<circle cx="360" cy="360" r="210" fill="none" stroke="#7a8450" stroke-width="1.5" />
		{#each Array(24) as _, i (i)}
			<line
				x1={360 + 330 * Math.cos((i * Math.PI) / 12)}
				y1={360 + 330 * Math.sin((i * Math.PI) / 12)}
				x2={360 + 316 * Math.cos((i * Math.PI) / 12)}
				y2={360 + 316 * Math.sin((i * Math.PI) / 12)}
				stroke="#a34a32"
				stroke-width="1.5"
			/>
		{/each}
	</svg>

	<div class="relative mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 sm:pt-20">
		<div class="mx-auto max-w-3xl text-center">
			<span class="badge badge-amber shadow-sm" style="margin-bottom: 8px;">Alkahest · Alpha</span>
			<h1 style="width: min(100%, 36rem);">
				Transmute Your Files. <span style="color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.9);">Zero Uploads.</span>
			</h1>
			<p class="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-zinc-700 sm:text-lg">
				40+ conversions — images, video, audio, PDFs, 3D models, docs. Every one runs in your
				browser. Nothing you drop here ever leaves your device.
			</p>
			<div class="guild-stripe mx-auto mt-6 h-1.5 w-28 rounded-full opacity-90"></div>
		</div>

		<div class="relative mx-auto mt-8 max-w-2xl">
			<Dropzone accept="" multiple={true} hint="Any supported file. We'll show you everything it can become" {onfiles} />
			{#if unknownMsg}
				<p class="mt-3 text-center text-sm text-[#c98a3e]">{unknownMsg}</p>
			{/if}
			{#if matches.length > 0}
				<div class="card mt-4 p-4 text-left">
					<p class="text-xs font-medium tracking-wide text-zinc-600 uppercase">
						Detected: {detectedLabel(droppedFiles)}
					</p>
					<p class="mt-1 text-sm text-zinc-700">
						Here's everything {SITE.name} can turn {droppedFiles.length === 1 ? 'it' : 'them'} into:
					</p>
					<div class="mt-3 grid gap-2 sm:grid-cols-2">
						{#each matches as m (m.slug)}
							<button
								type="button"
								onclick={() => pick(m.slug)}
								class="group flex flex-col gap-0.5 rounded-lg border border-zinc-400/30 bg-white/50 p-3 text-left transition hover:-translate-y-0.5 hover:border-[#a34a32]/50 hover:bg-[#a34a32]/[0.06]"
							>
								<span class="font-semibold text-zinc-900 group-hover:text-[#a34a32]">{m.name}</span>
								<span class="text-xs text-zinc-600">{m.short}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<dl class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-2.5 sm:grid-cols-3">
			{#each badges as b (b.label)}
				<div class="flex items-center justify-center gap-1.5 rounded-full border border-zinc-400/30 bg-white/40 px-3 py-2 text-sm font-semibold text-zinc-800">
					<span class="inline-block h-1.5 w-1.5 rounded-full" style="background:{b.dot}"></span>
					{b.label}
				</div>
			{/each}
		</dl>
	</div>
</section>

<!-- tools: search bar + collapsible category shelves -->
<section id="tools" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
	<div class="mx-auto max-w-xl">
		<div class="relative">
			<svg class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="11" cy="11" r="7" />
				<path d="m21 21-4.3-4.3" />
			</svg>
			<input
				type="text"
				bind:value={query}
				placeholder="Search 40+ tools… Try &ldquo;HEIC&rdquo; or &ldquo;merge&rdquo;"
				class="w-full rounded-full border border-zinc-400/40 bg-white/70 py-2.5 pr-4 pl-10 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-[#a34a32]/60 focus:outline-none"
			/>
		</div>

		{#if !query}
			<div class="mt-3 flex flex-wrap justify-center gap-1.5">
				{#each categories as cat (cat.id)}
					<button
						type="button"
						onclick={() => jumpTo(cat.id)}
						class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition hover:-translate-y-0.5 hover:shadow-sm"
						style="background:{categoryColors[cat.id]}1f; color:{categoryColors[cat.id]}; border:1.5px solid {categoryColors[cat.id]}55"
					>
						<span class="inline-block h-1.5 w-1.5 rounded-full" style="background:{categoryColors[cat.id]}"></span>
						{cat.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if query}
		<!-- flat search results -->
		<div class="mt-6">
			{#if filtered.length > 0 || filteredSpecial.length > 0}
				<p class="mb-3 text-center text-xs tracking-wide text-zinc-600 uppercase">
					{filtered.length + filteredSpecial.length} match{filtered.length + filteredSpecial.length === 1 ? '' : 'es'}
				</p>
				<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredSpecial as t (t.slug)}
						<a
							href="/{t.slug}"
							class="card group relative flex flex-col gap-1.5 overflow-hidden border-l-[3px] py-2.5 pr-3 pl-3.5 hover:-translate-y-0.5"
							style="border-left-color:{t.color}; background:{t.color}0d"
						>
							<div class="flex items-center gap-2.5">
								<span class="rounded-md p-1.5 text-white shadow-sm" style="background:{t.color}">
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
										<path d={t.icon} />
									</svg>
								</span>
								<span class="text-sm font-semibold text-zinc-900 group-hover:text-[#a34a32]">{t.name}</span>
								<span class="badge {t.badgeClass}">{t.badgeLabel}</span>
							</div>
							<p class="text-xs leading-snug text-zinc-600">{t.short}</p>
						</a>
					{/each}
					{#each filtered as tool (tool.slug)}
						<ToolCard {tool} compact />
					{/each}
				</div>
			{:else}
				<p class="mt-6 text-center text-sm text-zinc-600">
					Nothing matches "{query}" — try a format name like PDF, MP4, or HEIC.
				</p>
			{/if}
		</div>
	{:else}
		<!-- collapsible category shelves -->
		<div class="mt-6 space-y-3">
			{#each categories as cat (cat.id)}
				{@const catTools = tools.filter((t) => t.category === cat.id)}
				<div id="cat-{cat.id}" class="card scroll-mt-24 overflow-hidden">
					<button
						type="button"
						onclick={() => (openCats[cat.id] = !openCats[cat.id])}
						class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
						style="background:{categoryColors[cat.id]}12"
					>
						<div class="flex items-center gap-2.5">
							<span class="inline-block h-2.5 w-2.5 rounded-full" style="background:{categoryColors[cat.id]}"></span>
							<span class="font-bold" style="color:{categoryColors[cat.id]}">{cat.name}</span>
							<span class="badge {categoryBadge[cat.id]}">{catTools.length}</span>
						</div>
						<svg
							class="transition {openCats[cat.id] ? 'rotate-180' : ''}"
							style="color:{categoryColors[cat.id]}"
							width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>
					{#if openCats[cat.id]}
						<div class="border-t px-4 pt-3 pb-4" style="border-color:{categoryColors[cat.id]}33">
							<p class="mb-3 text-xs text-zinc-600">{cat.blurb}</p>
							<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{#if cat.id === 'pdf'}
									<a
										href="/edit-pdf"
										class="card group relative flex flex-col gap-1.5 overflow-hidden border-l-[4px] border-l-[#a34a32] py-3 pr-4 pl-3.5 hover:-translate-y-0.5"
										style="background:#a34a320d"
									>
										<div class="flex items-center gap-2.5">
											<span class="rounded-md p-1.5 text-white shadow-sm" style="background:#a34a32">
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
													<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" />
												</svg>
											</span>
											<span class="text-sm font-semibold text-zinc-900 group-hover:text-[#a34a32]">Edit PDF</span>
											<span class="badge badge-terracotta">Full Editor</span>
										</div>
										<p class="text-xs leading-snug text-zinc-600">Reorder, rotate, delete and insert pages</p>
									</a>
								{/if}
								{#if cat.id === 'image'}
									<a
										href="/strip-exif"
										class="card group relative flex flex-col gap-1.5 overflow-hidden border-l-[4px] border-l-[#7a8450] py-3 pr-4 pl-3.5 hover:-translate-y-0.5"
										style="background:#7a84500d"
									>
										<div class="flex items-center gap-2.5">
											<span class="rounded-md p-1.5 text-white shadow-sm" style="background:#7a8450">
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
													<path d="M12 2 3 6v6c0 5 4 8 9 10 5-2 9-5 9-10V6Z" />
												</svg>
											</span>
											<span class="text-sm font-semibold text-zinc-900 group-hover:text-[#7a8450]">Photo Metadata Viewer &amp; Stripper</span>
											<span class="badge badge-moss">Privacy</span>
										</div>
										<p class="text-xs leading-snug text-zinc-600">See the GPS location &amp; camera info hiding in your photos, then strip it</p>
									</a>
								{/if}
								{#each catTools as tool (tool.slug)}
									<ToolCard {tool} compact />
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- how it works -->
<section class="border-t border-zinc-300/30 bg-zinc-100/50">
	<div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
		<h2 class="text-center text-2xl font-bold text-zinc-900">How the Lab Keeps Your Secrets</h2>
		<div class="mt-8 grid gap-4 sm:grid-cols-3">
			{#each steps as step (step.n)}
				<div class="card flex flex-col items-center p-5 text-center">
					<span class="inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-bold {step.color}">
						{step.n}
					</span>
					<h3 class="mt-3 text-center font-semibold text-zinc-900">{step.title}</h3>
					<p class="mt-2 text-center text-sm leading-relaxed text-zinc-700">{step.body}</p>
				</div>
			{/each}
		</div>
		<div class="card mx-auto mt-8 max-w-3xl border-[#7a8450]/20 bg-[#7a8450]/[0.06] p-5 text-center">
			<p class="text-sm leading-relaxed text-zinc-800">
				<span class="font-semibold text-[#7a8450]">Don't take our word for it:</span>
				Open your browser's DevTools → network tab and convert something. You'll see zero requests
				carrying your data. The only downloads are the conversion engines themselves, served from
				this site.
			</p>
		</div>
	</div>
</section>
