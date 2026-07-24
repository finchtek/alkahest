<script lang="ts">
	import { goto } from '$app/navigation';
	import Dropzone from '$lib/components/Dropzone.svelte';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { categories, detectTool, tools } from '$lib/registry';
	import { setPending } from '$lib/pending';
	import { SITE } from '$lib/site';

	let unknownMsg = $state('');

	function onfiles(files: File[]) {
		const tool = detectTool(files);
		if (tool) {
			unknownMsg = '';
			setPending(files);
			goto(`/${tool.slug}`);
		} else {
			unknownMsg = 'hmm. mixed or unrecognized file types. pick a tool below and we’ll take it from there.';
			document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
		}
	}

	const badges = [
		{ label: '100% on-device', detail: 'WebAssembly in your browser', dot: '#e0a06c' },
		{ label: 'zero uploads', detail: 'files never touch a server', dot: '#a9bc8f' },
		{ label: 'no ads, no tracking', detail: 'not even analytics', dot: '#d89a7f' },
		{ label: 'source available', detail: 'read every line, on GitHub', dot: '#d8c9a8' }
	];

	const steps = [
		{
			n: '1',
			color: 'bg-[#5f6f52]/25 text-[#a9bc8f]',
			title: 'bring a file to the lab',
			body: 'it’s read straight into your browser’s memory. no form posts, no uploads. the network tab stays completely silent.'
		},
		{
			n: '2',
			color: 'bg-[#c26d33]/15 text-[#e0a06c]',
			title: 'the alchemy happens here',
			body: 'FFmpeg, libheif, pdf.js and friends: real native libraries compiled to WebAssembly, working their craft in Web Workers on your machine.'
		},
		{
			n: '3',
			color: 'bg-[#9a4f3f]/20 text-[#d89a7f]',
			title: 'collect your work',
			body: 'your transmuted file comes back from browser memory as a download. close the tab and nothing persists anywhere.'
		}
	];

	const catDots: Record<string, string> = {
		image: '#a9bc8f',
		media: '#e0a06c',
		pdf: '#d89a7f',
		'3d': '#d8c9a8',
		docs: '#c68a5a'
	};
</script>

<svelte:head>
	<title>{SITE.name}. {SITE.tagline} free in-browser file converter</title>
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
	<div class="relative mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
		<div class="mx-auto max-w-3xl text-center">
			<a
				href="/open-source"
				class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 transition hover:border-accent-500/40 hover:text-accent-300"
			>
				<span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
				source available · no servers involved
			</a>
			<h1 class="mt-5 text-4xl font-extrabold tracking-tight text-zinc-50 sm:text-6xl">
				transmute your files. <span class="text-zinc-400">zero uploads.</span>
			</h1>
			<p class="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
				HEIC to JPG, MP4 to MP3, FBX to GLB, RAR extraction, DOCX, XLSX, TIFF, full PDF editing and
				more. all of it happens right here in your browser with WebAssembly. your files never
				leave your device, because there’s literally no server to send them to.
			</p>
			<div class="spectrum-gradient mx-auto mt-6 h-1 w-24 rounded-full opacity-80"></div>
		</div>

		<div class="mx-auto mt-8 max-w-2xl">
			<Dropzone accept="" multiple={true} hint="any supported file. the lab routes you to the right workbench" {onfiles} />
			{#if unknownMsg}
				<p class="mt-3 text-center text-sm text-amber-300">{unknownMsg}</p>
			{/if}
		</div>

		<dl class="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
			{#each badges as b (b.label)}
				<div class="card px-4 py-3 text-center hover:border-white/20">
					<dt class="flex items-center justify-center gap-1.5 text-sm font-semibold text-zinc-100">
						<span class="inline-block h-1.5 w-1.5 rounded-full" style="background:{b.dot}"></span>
						{b.label}
					</dt>
					<dd class="mt-0.5 text-xs text-zinc-500">{b.detail}</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>

<!-- tools -->
<section id="tools" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
	{#each categories as cat (cat.id)}
		<div class="mb-10">
			<h2 class="flex items-center gap-2.5 text-xl font-bold text-zinc-50">
				<span class="inline-block h-2 w-2 rounded-full" style="background:{catDots[cat.id]}"></span>
				{cat.name}
			</h2>
			<p class="mt-1 text-sm text-zinc-500">{cat.blurb}</p>
			<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#if cat.id === 'pdf'}
					<a
						href="/edit-pdf"
						class="card group flex flex-col gap-2 border-accent-500/30 bg-accent-500/[0.06] p-4 hover:-translate-y-0.5 hover:border-accent-500/60 hover:shadow-[0_12px_40px_-12px_rgba(194,109,51,0.35)]"
					>
						<div class="flex items-center gap-3">
							<span class="rounded-lg bg-accent-500/15 p-2 text-accent-300">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" />
								</svg>
							</span>
							<span class="font-semibold text-zinc-100 group-hover:text-zinc-50">edit PDF</span>
						</div>
						<p class="text-sm text-zinc-400">reorder, rotate, delete and insert pages. the full editor</p>
					</a>
				{/if}
				{#each tools.filter((t) => t.category === cat.id) as tool (tool.slug)}
					<ToolCard {tool} />
				{/each}
			</div>
		</div>
	{/each}
</section>

<!-- how it works -->
<section class="border-t border-white/5 bg-zinc-900/30">
	<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
		<h2 class="text-center text-2xl font-bold text-zinc-50">how the lab keeps your secrets</h2>
		<div class="mt-8 grid gap-4 sm:grid-cols-3">
			{#each steps as step (step.n)}
				<div class="card p-5 hover:border-white/20">
					<span class="inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-bold {step.color}">
						{step.n}
					</span>
					<h3 class="mt-3 font-semibold text-zinc-100">{step.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-zinc-400">{step.body}</p>
				</div>
			{/each}
		</div>
		<div class="card mx-auto mt-8 max-w-3xl border-emerald-500/20 bg-emerald-500/[0.04] p-5 text-center">
			<p class="text-sm leading-relaxed text-zinc-300">
				<span class="font-semibold text-emerald-300">don’t take our word for it:</span>
				open your browser’s DevTools → network tab and convert something. you’ll see zero requests
				carrying your data. the only downloads are the conversion engines themselves, served from
				this site. the whole source is on
				<a href={SITE.github} target="_blank" rel="noopener noreferrer" class="underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-300">GitHub</a>.
			</p>
		</div>
	</div>
</section>
