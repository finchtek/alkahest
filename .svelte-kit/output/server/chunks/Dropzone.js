import { b as attr, t as attr_class, x as escape_html } from "./server.js";
//#region src/lib/components/Dropzone.svelte
function Dropzone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { accept = "", multiple = true, compact = false, hint = "", onfiles } = $$props;
		$$renderer.push(`<div role="button" tabindex="0" aria-label="Drop files here or press Enter to browse"${attr_class(`group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed text-center transition border-zinc-400/30 bg-white/30 hover:border-[#a34a32]/60 hover:bg-white/50 ${compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14 sm:py-20"}`)}><div${attr_class(`rounded-xl border border-zinc-400/40 bg-white/60 p-3 text-[#a34a32] shadow-sm transition group-hover:scale-105 `)}><svg${attr("width", compact ? 22 : 30)}${attr("height", compact ? 22 : 30)} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><path d="M12 18v-6"></path><path d="m9 15 3 3 3-3"></path></svg></div> <div><p${attr_class(`font-semibold text-zinc-900 ${compact ? "text-sm" : "text-lg"}`)}>${escape_html("drop files here")}</p> <p class="mt-1 text-xs text-zinc-700 sm:text-sm">or <span class="font-semibold text-[#a34a32]">browse</span> · paste straight from your clipboard</p></div> `);
		if (hint) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-xs text-zinc-600">${escape_html(hint)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <input type="file"${attr("accept", accept)}${attr("multiple", multiple, true)} class="sr-only"/></div>`);
	});
}
//#endregion
export { Dropzone as t };
