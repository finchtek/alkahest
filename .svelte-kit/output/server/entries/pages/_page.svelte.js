import { a as head, b as attr, i as ensure_array_like, n as attr_style, r as derived, s as stringify, t as attr_class, x as escape_html } from "../../chunks/server.js";
import { i as matchingTools, n as categoryBadge, o as tools, r as categoryColors, t as categories } from "../../chunks/registry.js";
import { t as SITE } from "../../chunks/site.js";
import "../../chunks/client.js";
import { t as Dropzone } from "../../chunks/Dropzone.js";
import { t as ToolCard } from "../../chunks/ToolCard.js";
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let unknownMsg = "";
		let droppedFiles = [];
		let matches = [];
		let query = "";
		let openCats = { [categories[0].id]: true };
		function onfiles(files) {
			const found = matchingTools(files);
			droppedFiles = files;
			matches = found;
			if (found.length > 0) unknownMsg = "";
			else unknownMsg = "hmm. mixed or unrecognized file types. search or browse below and we'll take it from there.";
		}
		function detectedLabel(files) {
			const exts = [...new Set(files.map((f) => (/\.([^.]+)$/.exec(f.name)?.[1] ?? "?").toUpperCase()))];
			return `${files.length} file${files.length === 1 ? "" : "s"} · ${exts.join(", ")}`;
		}
		const specialTools = [{
			slug: "edit-pdf",
			name: "edit PDF",
			short: "reorder, rotate, delete and insert pages — the full editor",
			keywords: "pdf editor pages reorder rotate delete insert merge",
			color: "#a34a32",
			badgeClass: "badge-terracotta",
			badgeLabel: "full editor",
			icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4"
		}, {
			slug: "strip-exif",
			name: "photo metadata viewer & stripper",
			short: "see the GPS location & camera info hiding in your photos, then strip it",
			keywords: "exif metadata gps location privacy strip photo camera",
			color: "#7a8450",
			badgeClass: "badge-moss",
			badgeLabel: "privacy",
			icon: "M12 2 3 6v6c0 5 4 8 9 10 5-2 9-5 9-10V6Z"
		}];
		derived(() => query.trim().length > 0 ? tools.filter((t) => {
			const q = query.trim().toLowerCase();
			return t.name.toLowerCase().includes(q) || t.short.toLowerCase().includes(q);
		}) : []);
		derived(() => query.trim().length > 0 ? specialTools.filter((t) => {
			const q = query.trim().toLowerCase();
			return t.name.toLowerCase().includes(q) || t.short.toLowerCase().includes(q) || t.keywords.includes(q);
		}) : []);
		const badges = [
			{
				label: "100% on-device",
				dot: "#c98a3e"
			},
			{
				label: "zero uploads",
				dot: "#7a8450"
			},
			{
				label: "no ads, no tracking",
				dot: "#a34a32"
			}
		];
		const steps = [
			{
				n: "1",
				color: "bg-[#7a8450]/15 text-[#7a8450]",
				title: "bring a file to the lab",
				body: "read straight into your browser's memory. no form posts, no uploads. the network tab stays completely silent."
			},
			{
				n: "2",
				color: "bg-[#c98a3e]/15 text-[#c98a3e]",
				title: "the alchemy happens here",
				body: "FFmpeg, libheif, pdf.js and friends: real native libraries compiled to WebAssembly, working their craft in Web Workers."
			},
			{
				n: "3",
				color: "bg-[#a34a32]/15 text-[#a34a32]",
				title: "collect your work",
				body: "your transmuted file comes back as a download. close the tab and nothing persists anywhere."
			}
		];
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(SITE.name)}. ${escape_html(SITE.tagline)} free in-browser file converter</title>`);
			});
			$$renderer.push(`<meta name="description"${attr("content", SITE.description)}/> <link rel="canonical"${attr("href", SITE.origin)}/> <meta property="og:title"${attr("content", `${stringify(SITE.name)}. ${stringify(SITE.tagline)}`)}/> <meta property="og:description"${attr("content", SITE.description)}/> <meta property="og:type" content="website"/> <meta property="og:url"${attr("content", SITE.origin)}/>`);
		});
		$$renderer.push(`<section class="relative overflow-hidden"><div class="pointer-events-none absolute inset-0" style="background: radial-gradient(700px 340px at 15% 0%, rgb(154 79 63 / 0.09), transparent), radial-gradient(700px 340px at 50% 0%, rgb(194 109 51 / 0.10), transparent), radial-gradient(700px 340px at 85% 10%, rgb(95 111 82 / 0.08), transparent);" aria-hidden="true"></div> <svg class="pointer-events-none absolute top-[8rem] left-1/2 -z-0 hidden -translate-x-1/2 opacity-[0.09] sm:block" width="720" height="720" viewBox="0 0 720 720" aria-hidden="true"><circle cx="360" cy="360" r="330" fill="none" stroke="#a34a32" stroke-width="1.5"></circle><circle cx="360" cy="360" r="280" fill="none" stroke="#c98a3e" stroke-width="1" stroke-dasharray="2 6"></circle><circle cx="360" cy="360" r="210" fill="none" stroke="#7a8450" stroke-width="1.5"></circle><!--[-->`);
		const each_array = ensure_array_like(Array(24));
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			each_array[i];
			$$renderer.push(`<line${attr("x1", 360 + 330 * Math.cos(i * Math.PI / 12))}${attr("y1", 360 + 330 * Math.sin(i * Math.PI / 12))}${attr("x2", 360 + 316 * Math.cos(i * Math.PI / 12))}${attr("y2", 360 + 316 * Math.sin(i * Math.PI / 12))} stroke="#a34a32" stroke-width="1.5"></line>`);
		}
		$$renderer.push(`<!--]--></svg> <div class="relative mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 sm:pt-20"><div class="mx-auto max-w-3xl text-center"><span class="badge badge-amber shadow-sm">alkahest · alpha</span> <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">transmute your files. <span class="text-zinc-600">zero uploads.</span></h1> <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-700 sm:text-lg">40+ conversions — images, video, audio, PDFs, 3D models, docs. every one runs in your
				browser. nothing you drop here ever leaves your device.</p> <div class="guild-stripe mx-auto mt-6 h-1.5 w-28 rounded-full opacity-90"></div></div> <div class="relative mx-auto mt-8 max-w-2xl">`);
		Dropzone($$renderer, {
			accept: "",
			multiple: true,
			hint: "any supported file. we'll show you everything it can become",
			onfiles
		});
		$$renderer.push(`<!----> `);
		if (unknownMsg) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="mt-3 text-center text-sm text-[#c98a3e]">${escape_html(unknownMsg)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (matches.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="card mt-4 p-4 text-left"><p class="text-xs font-medium tracking-wide text-zinc-600 uppercase">detected: ${escape_html(detectedLabel(droppedFiles))}</p> <p class="mt-1 text-sm text-zinc-700">here's everything ${escape_html(SITE.name)} can turn ${escape_html(droppedFiles.length === 1 ? "it" : "them")} into:</p> <div class="mt-3 grid gap-2 sm:grid-cols-2"><!--[-->`);
			const each_array_1 = ensure_array_like(matches);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let m = each_array_1[$$index_1];
				$$renderer.push(`<button type="button" class="group flex flex-col gap-0.5 rounded-lg border border-zinc-400/30 bg-white/50 p-3 text-left transition hover:-translate-y-0.5 hover:border-[#a34a32]/50 hover:bg-[#a34a32]/[0.06]"><span class="font-semibold text-zinc-900 group-hover:text-[#a34a32]">${escape_html(m.name)}</span> <span class="text-xs text-zinc-600">${escape_html(m.short)}</span></button>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <dl class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-2.5 sm:grid-cols-3"><!--[-->`);
		const each_array_2 = ensure_array_like(badges);
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let b = each_array_2[$$index_2];
			$$renderer.push(`<div class="flex items-center justify-center gap-1.5 rounded-full border border-zinc-400/30 bg-white/40 px-3 py-2 text-sm font-semibold text-zinc-800"><span class="inline-block h-1.5 w-1.5 rounded-full"${attr_style(`background:${stringify(b.dot)}`)}></span> ${escape_html(b.label)}</div>`);
		}
		$$renderer.push(`<!--]--></dl></div></section> <section id="tools" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6"><div class="mx-auto max-w-xl"><div class="relative"><svg class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path></svg> <input type="text"${attr("value", query)} placeholder="search 40+ tools… try “heic” or “merge”" class="w-full rounded-full border border-zinc-400/40 bg-white/70 py-2.5 pr-4 pl-10 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-[#a34a32]/60 focus:outline-none"/></div> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mt-3 flex flex-wrap justify-center gap-1.5"><!--[-->`);
			const each_array_3 = ensure_array_like(categories);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let cat = each_array_3[$$index_3];
				$$renderer.push(`<button type="button" class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition hover:-translate-y-0.5 hover:shadow-sm"${attr_style(`background:${stringify(categoryColors[cat.id])}1f; color:${stringify(categoryColors[cat.id])}; border:1.5px solid ${stringify(categoryColors[cat.id])}55`)}><span class="inline-block h-1.5 w-1.5 rounded-full"${attr_style(`background:${stringify(categoryColors[cat.id])}`)}></span> ${escape_html(cat.name)}</button>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div> `);
		{
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="mt-6 space-y-3"><!--[-->`);
			const each_array_6 = ensure_array_like(categories);
			for (let $$index_7 = 0, $$length = each_array_6.length; $$index_7 < $$length; $$index_7++) {
				let cat = each_array_6[$$index_7];
				const catTools = tools.filter((t) => t.category === cat.id);
				$$renderer.push(`<div${attr("id", `cat-${stringify(cat.id)}`)} class="card scroll-mt-24 overflow-hidden"><button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"${attr_style(`background:${stringify(categoryColors[cat.id])}12`)}><div class="flex items-center gap-2.5"><span class="inline-block h-2.5 w-2.5 rounded-full"${attr_style(`background:${stringify(categoryColors[cat.id])}`)}></span> <span class="font-bold"${attr_style(`color:${stringify(categoryColors[cat.id])}`)}>${escape_html(cat.name)}</span> <span${attr_class(`badge ${stringify(categoryBadge[cat.id])}`)}>${escape_html(catTools.length)}</span></div> <svg${attr_class(`transition ${openCats[cat.id] ? "rotate-180" : ""}`)}${attr_style(`color:${stringify(categoryColors[cat.id])}`)} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button> `);
				if (openCats[cat.id]) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="border-t px-4 pt-3 pb-4"${attr_style(`border-color:${stringify(categoryColors[cat.id])}33`)}><p class="mb-3 text-xs text-zinc-600">${escape_html(cat.blurb)}</p> <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">`);
					if (cat.id === "pdf") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<a href="/edit-pdf" class="card group relative flex flex-col gap-1.5 overflow-hidden border-l-[4px] border-l-[#a34a32] py-3 pr-4 pl-3.5 hover:-translate-y-0.5" style="background:#a34a320d"><div class="flex items-center gap-2.5"><span class="rounded-md p-1.5 text-white shadow-sm" style="background:#a34a32"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4"></path></svg></span> <span class="text-sm font-semibold text-zinc-900 group-hover:text-[#a34a32]">edit PDF</span> <span class="badge badge-terracotta">full editor</span></div> <p class="text-xs leading-snug text-zinc-600">reorder, rotate, delete and insert pages</p></a>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (cat.id === "image") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<a href="/strip-exif" class="card group relative flex flex-col gap-1.5 overflow-hidden border-l-[4px] border-l-[#7a8450] py-3 pr-4 pl-3.5 hover:-translate-y-0.5" style="background:#7a84500d"><div class="flex items-center gap-2.5"><span class="rounded-md p-1.5 text-white shadow-sm" style="background:#7a8450"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 3 6v6c0 5 4 8 9 10 5-2 9-5 9-10V6Z"></path></svg></span> <span class="text-sm font-semibold text-zinc-900 group-hover:text-[#7a8450]">photo metadata viewer &amp; stripper</span> <span class="badge badge-moss">privacy</span></div> <p class="text-xs leading-snug text-zinc-600">see the GPS location &amp; camera info hiding in your photos, then strip it</p></a>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <!--[-->`);
					const each_array_7 = ensure_array_like(catTools);
					for (let $$index_6 = 0, $$length = each_array_7.length; $$index_6 < $$length; $$index_6++) {
						let tool = each_array_7[$$index_6];
						ToolCard($$renderer, {
							tool,
							compact: true
						});
					}
					$$renderer.push(`<!--]--></div></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></section> <section class="border-t border-zinc-300/30 bg-zinc-100/50"><div class="mx-auto max-w-6xl px-4 py-12 sm:px-6"><h2 class="text-center text-2xl font-bold text-zinc-900">how the lab keeps your secrets</h2> <div class="mt-8 grid gap-4 sm:grid-cols-3"><!--[-->`);
		const each_array_8 = ensure_array_like(steps);
		for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
			let step = each_array_8[$$index_8];
			$$renderer.push(`<div class="card p-5"><span${attr_class(`inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-bold ${stringify(step.color)}`)}>${escape_html(step.n)}</span> <h3 class="mt-3 font-semibold text-zinc-900">${escape_html(step.title)}</h3> <p class="mt-2 text-sm leading-relaxed text-zinc-700">${escape_html(step.body)}</p></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="card mx-auto mt-8 max-w-3xl border-[#7a8450]/20 bg-[#7a8450]/[0.06] p-5 text-center"><p class="text-sm leading-relaxed text-zinc-800"><span class="font-semibold text-[#7a8450]">don't take our word for it:</span> open your browser's DevTools → network tab and convert something. you'll see zero requests
				carrying your data. the only downloads are the conversion engines themselves, served from
				this site.</p></div></div></section>`);
	});
}
//#endregion
export { _page as default };
