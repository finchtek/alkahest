import "../../../chunks/internal.js";
import { a as head, b as attr, i as ensure_array_like, n as attr_style, r as derived, s as stringify, x as escape_html } from "../../../chunks/server.js";
import { a as toolBySlug, o as tools } from "../../../chunks/registry.js";
import { t as SITE } from "../../../chunks/site.js";
import { t as page } from "../../../chunks/state.js";
import { t as Dropzone } from "../../../chunks/Dropzone.js";
import { t as ToolCard } from "../../../chunks/ToolCard.js";
import { n as formatBytes } from "../../../chunks/util.js";
import { n as zipResults, r as SuccessModal, t as saveBlob } from "../../../chunks/download.js";
//#region src/lib/components/Progress.svelte
function Progress($$renderer, $$props) {
	let { value = -1, label = "" } = $$props;
	const pct = derived(() => Math.round(Math.min(Math.max(value, 0), 1) * 100));
	$$renderer.push(`<div class="w-full" role="status" aria-live="polite"><div class="mb-2 flex items-center justify-between gap-4 text-sm"><span class="truncate text-zinc-700">${escape_html(label || "transmuting…")}</span> `);
	if (value >= 0) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<span class="font-mono text-xs text-zinc-600">${escape_html(pct())}%</span>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div> <div class="h-2 overflow-hidden rounded-full bg-zinc-300/50">`);
	if (value >= 0) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="spectrum-gradient h-full rounded-full transition-[width] duration-200"${attr_style(`width: ${stringify(pct())}%`)}></div>`);
	} else {
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<div class="spectrum-gradient h-full w-1/3 animate-pulse rounded-full"></div>`);
	}
	$$renderer.push(`<!--]--></div></div>`);
}
//#endregion
//#region src/routes/[tool]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tool = derived(() => toolBySlug(page.params.tool ?? ""));
		const related = derived(() => tool() ? tools.filter((t) => t.category === tool().category && t.slug !== tool().slug).slice(0, 3) : []);
		let files = [];
		let opts = {};
		let phase = "idle";
		let progress = -1;
		let progressLabel = "";
		let results = [];
		let errorMsg = "";
		let elapsedMs = 0;
		let modalOpen = false;
		let rejectedNote = "";
		const totalIn = derived(() => files.reduce((s, f) => s + f.size, 0));
		const totalOut = derived(() => results.reduce((s, r) => s + r.blob.size, 0));
		const minFiles = derived(() => tool()?.minFiles ?? 1);
		const canConvert = derived(() => files.length >= minFiles() && phase !== "working");
		function matchesAccept(f) {
			if (!tool()) return false;
			if (tool().accept.includes("*")) return true;
			const ext = ("." + (f.name.split(".").pop() ?? "")).toLowerCase();
			return tool().accept.includes(ext);
		}
		function addFiles(incoming) {
			if (!tool()) return;
			const ok = incoming.filter(matchesAccept);
			const rejected = incoming.length - ok.length;
			rejectedNote = rejected ? `${rejected} file${rejected > 1 ? "s" : ""} skipped. this tool takes ${tool().accept.join(", ")}` : "";
			const next = tool().multiple ? [...files, ...ok] : ok.slice(0, 1);
			const seen = /* @__PURE__ */ new Set();
			files = next.filter((f) => {
				const k = `${f.name}|${f.size}`;
				if (seen.has(k)) return false;
				seen.add(k);
				return true;
			});
			if (phase === "done" || phase === "error") {
				phase = "idle";
				results = [];
				errorMsg = "";
			}
		}
		function download(r) {
			saveBlob(r.name, r.blob);
		}
		async function downloadAll() {
			if (results.length === 1) return download(results[0]);
			const zip = await zipResults(results);
			saveBlob(`${SITE.name.toLowerCase()}-${tool()?.slug ?? "files"}.zip`, zip);
		}
		function resetAll() {
			modalOpen = false;
			files = [];
			results = [];
			phase = "idle";
			rejectedNote = "";
		}
		head("4c284f", $$renderer, ($$renderer) => {
			if (tool()) {
				$$renderer.push("<!--[0-->");
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>${escape_html(tool().name)}. free, private, in-browser | ${escape_html(SITE.name)}</title>`);
				});
				$$renderer.push(`<meta name="description"${attr("content", tool().description)}/> <link rel="canonical"${attr("href", `${stringify(SITE.origin)}/${stringify(tool().slug)}`)}/> <meta property="og:title"${attr("content", `${stringify(tool().name)}. ${stringify(SITE.name)}`)}/> <meta property="og:description"${attr("content", tool().description)}/> <meta property="og:type" content="website"/> <meta property="og:url"${attr("content", `${stringify(SITE.origin)}/${stringify(tool().slug)}`)}/>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		});
		if (tool()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14"><nav class="text-sm" aria-label="Breadcrumb"><a href="/#tools" class="text-zinc-600 transition hover:text-[#a34a32]">← all tools</a></nav> <h1 class="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">${escape_html(tool().name)}</h1> <p class="mt-3 leading-relaxed text-zinc-700">${escape_html(tool().description)}</p> `);
			if (tool().heavy) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="mt-3 inline-flex items-start gap-2 rounded-xl border border-[#5f7a6b]/30 bg-[#5f7a6b]/[0.08] px-3 py-2 text-xs leading-relaxed text-[#3d4d45]"><svg class="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4M12 16h.01"></path></svg> heads up: the first run downloads the FFmpeg engine (~31 MB) from this site. once downloaded,
				your browser caches it. your files still never leave your device.</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="mt-6">`);
			Dropzone($$renderer, {
				accept: tool().acceptAttr,
				multiple: tool().multiple,
				compact: files.length > 0,
				hint: tool().accept.includes("*") ? "accepts any file type" : `Accepts ${tool().accept.join(", ")}`,
				onfiles: addFiles
			});
			$$renderer.push(`<!----> `);
			if (rejectedNote) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="mt-2 text-sm text-[#8c6239]">${escape_html(rejectedNote)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			if (files.length) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<ul class="mt-4 flex flex-col gap-2"><!--[-->`);
				const each_array = ensure_array_like(files);
				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let f = each_array[i];
					$$renderer.push(`<li class="card flex items-center justify-between gap-3 px-4 py-2.5"><div class="min-w-0"><p class="truncate text-sm font-medium text-zinc-800">${escape_html(f.name)}</p> <p class="text-xs text-zinc-600">${escape_html(formatBytes(f.size))}</p></div> <button class="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-200/60 hover:text-zinc-900"${attr("aria-label", `Remove ${stringify(f.name)}`)}${attr("disabled", phase === "working", true)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg></button></li>`);
				}
				$$renderer.push(`<!--]--></ul> `);
				if (tool().options.length) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="card mt-4 flex flex-col gap-4 p-4"><!--[-->`);
					const each_array_1 = ensure_array_like(tool().options);
					for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
						let opt = each_array_1[$$index_2];
						$$renderer.push(`<label class="flex flex-col gap-1.5 text-sm"><span class="flex items-center justify-between font-medium text-zinc-800">${escape_html(opt.label)} `);
						if (opt.type === "range") {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="font-mono text-xs text-[#a34a32]">${escape_html(opt.key === "quality" ? `${Math.round(Number(opts[opt.key]) * 100)}%` : opts[opt.key])}</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></span> `);
						if (opt.type === "range") {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<input type="range"${attr("min", opt.min)}${attr("max", opt.max)}${attr("step", opt.step)}${attr("value", opts[opt.key])} class="accent-[#a34a32]"${attr("disabled", phase === "working", true)}/>`);
						} else if (opt.type === "select") {
							$$renderer.push("<!--[1-->");
							$$renderer.select({
								value: opts[opt.key],
								disabled: phase === "working",
								class: "rounded-xl border border-zinc-400/40 bg-white/80 px-3 py-2 text-zinc-800 focus:border-[#a34a32]/60 focus:outline-none"
							}, ($$renderer) => {
								$$renderer.push(`<!--[-->`);
								const each_array_2 = ensure_array_like(opt.choices ?? []);
								for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
									let c = each_array_2[$$index_1];
									$$renderer.option({ value: c.value }, ($$renderer) => {
										$$renderer.push(`${escape_html(c.label)}`);
									});
								}
								$$renderer.push(`<!--]-->`);
							});
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<input type="text"${attr("placeholder", opt.placeholder)}${attr("value", opts[opt.key])}${attr("disabled", phase === "working", true)} class="rounded-xl border border-zinc-400/40 bg-white/80 px-3 py-2 text-zinc-800 placeholder:text-zinc-500 focus:border-[#a34a32]/60 focus:outline-none"/> `);
							if (opt.hint) {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<span class="text-xs text-zinc-600">${escape_html(opt.hint)}</span>`);
							} else $$renderer.push("<!--[-1-->");
							$$renderer.push(`<!--]-->`);
						}
						$$renderer.push(`<!--]--></label>`);
					}
					$$renderer.push(`<!--]--></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="mt-5">`);
				if (phase === "working") {
					$$renderer.push("<!--[0-->");
					Progress($$renderer, {
						value: progress,
						label: progressLabel
					});
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<button class="btn-primary w-full sm:w-auto"${attr("disabled", !canConvert(), true)}>transmute ${escape_html(files.length)} ${escape_html(files.length === 1 ? "file" : "files")}</button> `);
					if (files.length < minFiles()) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<p class="mt-2 text-sm text-zinc-600">add at least ${escape_html(minFiles())} files to continue.</p>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (phase === "error") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card mt-5 border-red-500/30 bg-red-500/[0.06] p-4" role="alert"><p class="font-semibold text-red-800">welp, the transmutation fizzled</p> <p class="mt-1 text-sm break-words text-zinc-700">${escape_html(errorMsg)}</p> <button class="btn-secondary mt-3">try again</button></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (phase === "done" && results.length) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="card mt-6 p-4"><div class="flex items-center justify-between gap-3"><h2 class="font-semibold text-zinc-900">results <span class="text-sm font-normal text-zinc-600">(${escape_html(formatBytes(totalOut()))})</span></h2> `);
				if (results.length > 1) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="btn-secondary !px-3 !py-1.5 text-sm">download all (.zip)</button>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <ul class="mt-3 flex flex-col gap-2"><!--[-->`);
				const each_array_3 = ensure_array_like(results);
				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let r = each_array_3[$$index_3];
					$$renderer.push(`<li class="flex items-center justify-between gap-3 rounded-xl bg-zinc-100/60 px-3 py-2"><div class="min-w-0"><p class="truncate text-sm text-zinc-800">${escape_html(r.name)}</p> <p class="text-xs text-zinc-600">${escape_html(formatBytes(r.blob.size))}</p></div> <button class="btn-primary !px-3 !py-1.5 text-sm">download</button></li>`);
				}
				$$renderer.push(`<!--]--></ul></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (related().length) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="mt-12"><h2 class="text-sm font-semibold text-zinc-600">more like this</h2> <div class="mt-3 grid gap-3 sm:grid-cols-3"><!--[-->`);
				const each_array_4 = ensure_array_like(related());
				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let r = each_array_4[$$index_4];
					ToolCard($$renderer, { tool: r });
				}
				$$renderer.push(`<!--]--></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></section> `);
			SuccessModal($$renderer, {
				open: modalOpen,
				results,
				elapsedMs,
				totalIn: totalIn(),
				totalOut: totalOut(),
				onclose: () => modalOpen = false,
				onreset: resetAll,
				ondownload: download,
				ondownloadall: downloadAll
			});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<section class="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"><h1 class="text-2xl font-bold text-zinc-900">recipe not found</h1> <p class="mt-2 text-zinc-700">that transmutation isn't in the guild book (yet, so feel free to ask for it).</p> <a href="/#tools" class="btn-primary mt-6">browse the guild book</a></section>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _page as default };
