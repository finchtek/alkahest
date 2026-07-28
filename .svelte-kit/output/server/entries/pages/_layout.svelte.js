import { b as attr, x as escape_html } from "../../chunks/server.js";
import { t as SITE } from "../../chunks/site.js";
//#region src/lib/components/Logo.svelte
function Logo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { size = 28 } = $$props;
		const gid = `ak-g-${Math.random().toString(36).slice(2, 8)}`;
		$$renderer.push(`<svg${attr("width", size)}${attr("height", size)} viewBox="0 0 32 32" fill="none" aria-hidden="true"><defs><linearGradient${attr("id", gid)} x1="11" y1="26" x2="21" y2="15" gradientUnits="userSpaceOnUse"><stop stop-color="#5BCEFA"></stop><stop offset="1" stop-color="#F5A9B8"></stop></linearGradient></defs><rect width="32" height="32" rx="7" fill="#120d08"></rect><rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="#e6d7b8" stroke-opacity="0.14"></rect><circle cx="16" cy="20.5" r="5.4"${attr("fill", `url(#${gid})`)}></circle><circle cx="13.8" cy="19" r="1" fill="#ffffff" fill-opacity="0.85"></circle><path d="M13 5.5 h6 M14.5 5.5 v6.8 c-3.4 1.5 -5.7 4.3 -5.7 7.7 a7.2 7.2 0 0 0 14.4 0 c0 -3.4 -2.3 -6.2 -5.7 -7.7 v-6.8" stroke="#e6d7b8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="20.6" cy="8.4" r="0.9" fill="#F5A9B8"></circle><circle cx="11.6" cy="7.2" r="0.7" fill="#5BCEFA"></circle><path d="M26 11 l0.8 1.7 1.7 0.8 -1.7 0.8 -0.8 1.7 -0.8 -1.7 -1.7 -0.8 1.7 -0.8 z" fill="#e5a86c"></path></svg>`);
	});
}
//#endregion
//#region src/lib/components/Header.svelte
function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<header class="sticky top-0 z-40 border-b border-zinc-300/50 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50"><div class="guild-stripe h-[3px] w-full opacity-90"></div> <div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"><a href="/" class="flex items-center gap-2.5 font-bold tracking-tight text-zinc-900">`);
		Logo($$renderer, {});
		$$renderer.push(`<!----> <span class="flex flex-col leading-none"><span>${escape_html(SITE.name)}</span> <span class="mt-0.5 text-[10px] font-medium tracking-normal text-zinc-600">${escape_html(SITE.byline)}</span></span></a> <nav class="flex items-center gap-1 text-sm sm:gap-2"><a href="/#tools" class="rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">tools</a> <a href="https://finchtek.org/projects.html" rel="external" data-sveltekit-reload="" class="rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">guild suite</a> <a href="https://pulse.finchtek.org" rel="external" data-sveltekit-reload="" class="rounded-lg px-2.5 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900">pulse notary</a> <a${attr("href", SITE.tipUrl)} target="_blank" rel="noopener noreferrer" class="hidden items-center gap-1.5 rounded-lg border border-[#a34a32]/40 bg-[#a34a32]/10 px-3 py-1.5 font-medium text-[#a34a32] transition hover:bg-[#a34a32]/20 sm:inline-flex"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.4h4c.9-1.3 2.3-2.4 4.3-2.4 3.5 0 5.3 3.6 3.7 6.7C19.5 16.3 12 21 12 21Z"></path></svg> tip jar</a></nav></div></header>`);
	});
}
//#endregion
//#region src/lib/components/Footer.svelte
function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<footer class="relative border-t border-zinc-300/50 bg-white/50"><div class="spectrum-gradient absolute inset-x-0 top-0 h-px opacity-40"></div> <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"><div class="max-w-sm"><div class="flex items-center gap-2.5 font-bold text-zinc-900">`);
		Logo($$renderer, { size: 22 });
		$$renderer.push(`<!----> <span>${escape_html(SITE.name)} <span class="text-xs font-medium text-zinc-600">${escape_html(SITE.byline)}</span></span></div> <p class="mt-3 text-sm leading-relaxed text-zinc-700">all processing happens locally on your device using WebAssembly. your files are never
					uploaded anywhere or tracked. promise.</p></div> <nav class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm" aria-label="Footer"><a href="/#tools" class="text-zinc-700 transition hover:text-zinc-900">all tools</a> <a href="https://finchtek.org" rel="external" data-sveltekit-reload="" class="text-zinc-700 transition hover:text-zinc-900">finchtek hub</a> <a href="https://pulse.finchtek.org" rel="external" data-sveltekit-reload="" class="text-zinc-700 transition hover:text-zinc-900">pulse notary</a> <a href="/legal" class="text-zinc-700 transition hover:text-zinc-900">terms &amp; privacy</a></nav></div> <p class="mt-8 text-xs text-zinc-600">no cookies · no analytics · no servers · built with SvelteKit, FFmpeg (WASM), pdf-lib, pdf.js,
			libheif &amp; SVGO</p></div></footer>`);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	let { children } = $$props;
	$$renderer.push(`<div class="flex min-h-dvh flex-col">`);
	Header($$renderer, {});
	$$renderer.push(`<!----> <main class="flex-1">`);
	children($$renderer);
	$$renderer.push(`<!----></main> `);
	Footer($$renderer, {});
	$$renderer.push(`<!----></div>`);
}
//#endregion
export { _layout as default };
