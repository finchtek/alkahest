import { a as head, b as attr, i as ensure_array_like, n as attr_style, s as stringify, x as escape_html } from "../../../chunks/server.js";
import { t as SITE } from "../../../chunks/site.js";
import { t as Dropzone } from "../../../chunks/Dropzone.js";
import { n as formatBytes } from "../../../chunks/util.js";
//#region src/routes/edit-pdf/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let srcFile = null;
		let srcBytes = null;
		let pages = [];
		let loading = false;
		let loadError = "";
		let done = false;
		let seq = 0;
		function nextKey() {
			seq += 1;
			return `p${seq}`;
		}
		async function loadFile(files) {
			const f = files[0];
			if (!f) return;
			loading = true;
			loadError = "";
			done = false;
			pages = [];
			try {
				srcBytes = await f.arrayBuffer();
				srcFile = f;
				const { getPdfJs } = await import("../../../chunks/pdf.js");
				const task = (await getPdfJs()).getDocument({ data: new Uint8Array(srcBytes.slice(0)) });
				const doc = await task.promise;
				const built = [];
				for (let i = 1; i <= doc.numPages; i++) {
					const page = await doc.getPage(i);
					const viewport = page.getViewport({ scale: .35 });
					const canvas = document.createElement("canvas");
					canvas.width = Math.ceil(viewport.width);
					canvas.height = Math.ceil(viewport.height);
					const ctx = canvas.getContext("2d");
					if (ctx) await page.render({
						canvasContext: ctx,
						viewport,
						canvas
					}).promise;
					const full = page.getViewport({ scale: 1 });
					built.push({
						key: nextKey(),
						kind: "existing",
						srcIndex: i - 1,
						rotation: 0,
						thumb: ctx ? canvas.toDataURL("image/png") : void 0,
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
		head("u5kyw", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>edit PDF. reorder, rotate, delete pages | ${escape_html(SITE.name)}</title>`);
			});
			$$renderer.push(`<meta name="description" content="reorder, rotate, delete and insert PDF pages right in your browser. no uploads, no Acrobat subscription."/>`);
		});
		$$renderer.push(`<section class="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14"><nav class="text-sm" aria-label="Breadcrumb"><a href="/#tools" class="text-zinc-600 transition hover:text-[#a34a32]">← all tools</a></nav> <h1 class="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">edit PDF</h1> <p class="mt-3 leading-relaxed text-zinc-700">reorder pages, rotate the sideways ones, delete what you don't need and drop in a blank page
		where you do. free, and it never leaves your device. this is the one for when windows makes
		you hunt for a real PDF editor and every option wants a subscription.</p> `);
		if (!srcFile) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mt-6">`);
			Dropzone($$renderer, {
				accept: ".pdf,application/pdf",
				multiple: false,
				hint: "drop a single PDF to start editing its pages",
				onfiles: loadFile
			});
			$$renderer.push(`<!----> `);
			if (loading) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="mt-3 text-center text-sm text-zinc-700">reading pages…</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (loadError) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="mt-3 text-center text-sm text-red-700">${escape_html(loadError)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4"><div class="min-w-0"><p class="truncate text-sm font-medium text-zinc-800">${escape_html(srcFile.name)}</p> <p class="text-xs text-zinc-600">${escape_html(pages.length)} page${escape_html(pages.length === 1 ? "" : "s")}</p></div> <div class="flex flex-wrap gap-2"><button class="btn-secondary !px-3 !py-1.5 text-sm">+ blank page</button> <button class="btn-secondary !px-3 !py-1.5 text-sm">start over</button></div></div> <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"><!--[-->`);
			const each_array = ensure_array_like(pages);
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let p = each_array[i];
				$$renderer.push(`<div class="card flex flex-col gap-2 p-2.5"><div class="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-zinc-200/40">`);
				if (p.kind === "existing" && p.thumb) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<img${attr("src", p.thumb)}${attr("alt", `page ${stringify(i + 1)}`)} class="max-h-full max-w-full transition-transform"${attr_style(`transform: rotate(${stringify(p.rotation)}deg)`)}/>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<div class="flex h-[70%] w-[55%] items-center justify-center rounded border border-dashed border-zinc-400/50 bg-zinc-100/60 text-[10px] text-zinc-600 transition-transform"${attr_style(`transform: rotate(${stringify(p.rotation)}deg)`)}>blank</div>`);
				}
				$$renderer.push(`<!--]--> <span class="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-800">${escape_html(i + 1)}</span></div> <div class="flex items-center justify-between gap-1"><button class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-zinc-800 disabled:opacity-30"${attr("disabled", i === 0, true)}${attr("aria-label", `move page ${stringify(i + 1)} earlier`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg></button> <button class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-zinc-800"${attr("aria-label", `rotate page ${stringify(i + 1)} left`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3.5-7.1M3 4v5h5"></path></svg></button> <button class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-zinc-800"${attr("aria-label", `rotate page ${stringify(i + 1)} right`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3.5-7.1M21 4v5h-5"></path></svg></button> <button class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-red-700"${attr("aria-label", `delete page ${stringify(i + 1)}`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg></button> <button class="rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-200/60 hover:text-zinc-800 disabled:opacity-30"${attr("disabled", i === pages.length - 1, true)}${attr("aria-label", `move page ${stringify(i + 1)} later`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg></button></div></div>`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (!pages.length) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="mt-6 text-center text-sm text-zinc-600">every page is gone. add a blank one or start over with a fresh file.</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="mt-6 flex flex-wrap items-center gap-3"><button class="btn-primary"${attr("disabled", !pages.length, true)}>${escape_html("export edited PDF")}</button> `);
			if (srcBytes) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="text-xs text-zinc-600">original: ${escape_html(formatBytes(srcBytes.byteLength))}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (done) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[#a34a32]/20 bg-[#a34a32]/[0.05] p-3.5 text-xs text-zinc-900"><div><p class="font-bold text-emerald-800">downloaded. close the tab and nothing is kept anywhere.</p> <p class="mt-0.5 font-medium text-zinc-900">if this saved you time or money, consider donating to our ko-fi!</p></div> <a${attr("href", SITE.tipUrl)} target="_blank" rel="noopener noreferrer" class="shrink-0 rounded-lg border border-[#a34a32]/40 bg-[#a34a32]/10 px-3.5 py-1.5 font-bold text-[#a34a32] hover:bg-[#a34a32]/20 transition">${escape_html(SITE.tipLabel)} ↗</a></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { _page as default };
