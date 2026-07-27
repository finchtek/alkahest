import { b as attr, r as derived, x as escape_html } from "./server.js";
import { t as SITE } from "./site.js";
import { n as formatBytes, r as formatDuration } from "./util.js";
//#region src/lib/components/SuccessModal.svelte
function SuccessModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { open = false, results = [], elapsedMs = 0, totalIn = 0, totalOut = 0, onclose, onreset, ondownload, ondownloadall } = $$props;
		const saved = derived(() => totalIn > 0 && totalOut < totalIn ? 1 - totalOut / totalIn : 0);
		const cheekyMessages = [
			"no ads, no paywalls, no tracking. ever. if this saved you time or money, consider donating to our ko-fi to keep the cauldron bubbling.",
			"if this saved you time, money, or a headache, consider tossing a coin to our ko-fi!",
			"saved you from an expensive subscription or a sketchy converter site? consider supporting us on ko-fi!",
			"100% free and on-device. if this saved you time or money today, consider buying us a coffee on ko-fi!"
		];
		let messageIndex = 0;
		if (open) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/70 p-4 backdrop-blur-sm sm:items-center" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="success-title" class="card relative w-full max-w-md overflow-hidden bg-zinc-900 p-6 shadow-2xl"><div class="spectrum-gradient absolute inset-x-0 top-0 h-1"></div> <div class="flex items-start justify-between gap-4"><div class="flex items-center gap-3"><div class="rounded-full bg-emerald-500/15 p-2 text-emerald-400"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></div> <h2 id="success-title" class="text-lg font-bold text-zinc-50">transmuted in ${escape_html(formatDuration(elapsedMs))}</h2></div> <button class="cursor-pointer rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100" aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg></button></div> <p class="mt-3 text-sm leading-relaxed text-zinc-300">processed right on your device: ${escape_html(results.length)}
				${escape_html(results.length === 1 ? "file" : "files")}, ${escape_html(formatBytes(totalOut))}${escape_html(saved() > .01 ? ` (${Math.round(saved() * 100)}% smaller)` : "")}. nothing was uploaded, nothing was tracked.${escape_html(elapsedMs < 5e3 ? " prettyyy fast, right?" : "")}</p> <div class="mt-4 flex flex-col gap-2">`);
			if (results.length === 1) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="btn-primary">download ${escape_html(results[0].name)}</button>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<button class="btn-primary">download all (${escape_html(results.length)} files, .zip)</button>`);
			}
			$$renderer.push(`<!--]--> <button class="btn-secondary">transmute more files</button></div> <div class="mt-5 rounded-xl border border-zinc-700 bg-zinc-800/90 p-4 text-center"><p class="text-sm font-medium leading-relaxed text-zinc-100">${escape_html(cheekyMessages[messageIndex])}</p> <a${attr("href", SITE.tipUrl)} target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#a34a32] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#8c3d28]"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.4h4c.9-1.3 2.3-2.4 4.3-2.4 3.5 0 5.3 3.6 3.7 6.7C19.5 16.3 12 21 12 21Z"></path></svg> ${escape_html(SITE.tipLabel)}</a></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/download.ts
function saveBlob(name, blob) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 3e4);
}
/** Bundle multiple results into one zip, built client-side with fflate. */
async function zipResults(results) {
	const { zip } = await import("fflate");
	const entries = {};
	for (const r of results) {
		let name = r.name;
		let i = 2;
		while (entries[name]) {
			if (/\.[^.]+$/.test(r.name)) name = r.name.replace(/(\.[^.]+)$/, `-${i}$1`);
			else name = `${r.name}-${i}`;
			i++;
		}
		entries[name] = new Uint8Array(await r.blob.arrayBuffer());
	}
	return new Promise((resolve, reject) => {
		zip(entries, { level: 0 }, (err, data) => err ? reject(err) : resolve(new Blob([data], { type: "application/zip" })));
	});
}
//#endregion
export { zipResults as n, SuccessModal as r, saveBlob as t };
