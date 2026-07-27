import { a as head, b as attr, i as ensure_array_like, r as derived, s as stringify, x as escape_html } from "../../../chunks/server.js";
import { t as SITE } from "../../../chunks/site.js";
import { t as Dropzone } from "../../../chunks/Dropzone.js";
import { n as formatBytes } from "../../../chunks/util.js";
//#region src/routes/strip-exif/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let entries = [];
		let stripping = false;
		let results = [];
		let stripError = "";
		let nextId = 0;
		const anyMetadata = derived(() => entries.some((e) => e.finding?.hasMetadata));
		const anyGps = derived(() => entries.some((e) => e.finding?.gps));
		function patchEntry(id, patch) {
			entries = entries.map((e) => e.id === id ? {
				...e,
				...patch
			} : e);
		}
		async function loadFiles(files) {
			results = [];
			stripError = "";
			const images = files.filter((f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
			for (const file of images) {
				const id = nextId++;
				const thumb = URL.createObjectURL(file);
				entries = [...entries, {
					id,
					file,
					thumb,
					finding: null,
					loading: true,
					expanded: false
				}];
				const { readExifFindings } = await import("../../../chunks/exif.js");
				patchEntry(id, {
					loading: false,
					finding: await readExifFindings(file)
				});
			}
		}
		function mapUrl(lat, lon) {
			return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
		}
		head("1oj2mig", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>photo metadata viewer &amp; stripper | ${escape_html(SITE.name)}</title>`);
			});
			$$renderer.push(`<meta name="description" content="see exactly what's hiding inside your photos — GPS location, camera model, timestamps — then strip it with one click. JPEGs are stripped byte-for-byte with zero quality loss, entirely in your browser."/>`);
		});
		$$renderer.push(`<section class="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14"><nav class="text-sm" aria-label="Breadcrumb"><a href="/#tools" class="text-zinc-600 transition hover:text-[#a34a32]">← all tools</a></nav> <span class="badge badge-moss mt-3 inline-flex">privacy</span> <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">photo metadata viewer &amp; stripper</h1> <p class="mt-3 max-w-2xl leading-relaxed text-zinc-700">most phone cameras quietly embed your exact GPS coordinates, camera model, and the timestamp
		into every photo. see what's actually in yours before you post it anywhere, then strip it in
		one click. JPEGs are stripped byte-for-byte — no re-encoding, no quality loss.</p> `);
		if (!entries.length) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mt-6">`);
			Dropzone($$renderer, {
				accept: "image/*,.jpg,.jpeg,.png,.webp,.heic,.heif",
				multiple: true,
				hint: "drop photos to see what metadata they're carrying",
				onfiles: loadFiles
			});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4"><div class="min-w-0"><p class="text-sm font-medium text-zinc-800">${escape_html(entries.length)} photo${escape_html(entries.length === 1 ? "" : "s")}</p> <p class="text-xs text-zinc-600">`);
			if (anyGps()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="font-semibold text-[#a34a32]">GPS location found</span> — this is the one to
						worry about`);
			} else if (anyMetadata()) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`metadata found, no GPS location`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`no metadata found in any of these`);
			}
			$$renderer.push(`<!--]--></p></div> <button class="btn-secondary !px-3 !py-1.5 text-sm">start over</button></div> <div class="mt-5 flex flex-col gap-3"><!--[-->`);
			const each_array = ensure_array_like(entries);
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let entry = each_array[i];
				$$renderer.push(`<div class="card overflow-hidden"><div class="flex items-start gap-3 p-3.5"><img${attr("src", entry.thumb)}${attr("alt", entry.file.name)} class="h-16 w-16 shrink-0 rounded-lg object-cover"/> <div class="min-w-0 flex-1"><div class="flex items-center justify-between gap-2"><p class="truncate text-sm font-semibold text-zinc-900">${escape_html(entry.file.name)}</p> <button class="shrink-0 rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-200/60 hover:text-zinc-800"${attr("aria-label", `remove ${stringify(entry.file.name)}`)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg></button></div> <p class="text-xs text-zinc-600">${escape_html(formatBytes(entry.file.size))}</p> `);
				if (entry.loading) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="mt-2 text-xs text-zinc-600">reading metadata…</p>`);
				} else if (entry.finding) {
					$$renderer.push("<!--[1-->");
					if (!entry.finding.hasMetadata) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<p class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#7a8450]"><span class="inline-block h-1.5 w-1.5 rounded-full bg-[#7a8450]"></span> clean — no metadata found</p>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="mt-2 flex flex-wrap gap-1.5">`);
						if (entry.finding.gps) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<a${attr("href", mapUrl(entry.finding.gps.lat, entry.finding.gps.lon))} target="_blank" rel="noopener noreferrer" class="badge badge-terracotta">GPS: ${escape_html(entry.finding.gps.lat.toFixed(4))}, ${escape_html(entry.finding.gps.lon.toFixed(4))} ↗</a>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (entry.finding.model) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="badge badge-clay">${escape_html(entry.finding.make ? `${entry.finding.make} ` : "")}${escape_html(entry.finding.model)}</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (entry.finding.dateTaken) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="badge badge-teal">${escape_html(entry.finding.dateTaken)}</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--> `);
						if (entry.finding.software) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="badge badge-amber">${escape_html(entry.finding.software)}</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></div> <button class="mt-1.5 text-xs font-medium text-[#a34a32] underline decoration-[#a34a32]/40 underline-offset-2">${escape_html(entry.expanded ? "hide" : "show")} all ${escape_html(Object.keys(entry.finding.raw).length)} raw tags</button> `);
						if (entry.expanded) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<div class="mt-2 max-h-48 overflow-y-auto rounded-lg bg-zinc-100/70 p-2.5 font-mono text-[11px] text-zinc-700"><!--[-->`);
							const each_array_1 = ensure_array_like(Object.entries(entry.finding.raw));
							for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
								let [k, v] = each_array_1[$$index];
								$$renderer.push(`<div class="flex gap-2"><span class="shrink-0 font-semibold text-zinc-800">${escape_html(k)}:</span> <span class="truncate">${escape_html(typeof v === "object" ? JSON.stringify(v) : String(v))}</span></div>`);
							}
							$$renderer.push(`<!--]--></div>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]-->`);
					}
					$$renderer.push(`<!--]-->`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div></div>`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (!results.length) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="mt-6 flex flex-wrap items-center gap-3"><button class="btn-primary"${attr("disabled", stripping, true)}>${escape_html(`strip metadata from ${entries.length} photo${entries.length === 1 ? "" : "s"}`)}</button></div> `);
				if (stripError) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<p class="mt-3 text-sm text-red-700">${escape_html(stripError)}</p>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="card mt-6 border-[#7a8450]/30 bg-[#7a8450]/[0.06] p-4"><p class="font-semibold text-[#5c6b3f]">scrubbed. ${escape_html(results.length)} clean file${escape_html(results.length === 1 ? "" : "s")} ready.</p> <p class="mt-1 text-sm text-zinc-700">GPS, camera info and timestamps are gone. nothing was uploaded to check any of this —
					every byte stayed on your device.</p> <div class="mt-3 flex flex-wrap gap-2">`);
				if (results.length > 1) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<button class="btn-primary !px-3 !py-1.5 text-sm">download all (.zip)</button>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<button class="btn-primary !px-3 !py-1.5 text-sm">download ${escape_html(results[0].name)}</button>`);
				}
				$$renderer.push(`<!--]--> <button class="btn-secondary !px-3 !py-1.5 text-sm">scrub more photos</button></div> <div class="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-[#7a8450]/20 pt-3 text-xs text-zinc-700"><span>if this saved you time or money, consider donating to our ko-fi!</span> <a${attr("href", SITE.tipUrl)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold text-[#a34a32] hover:underline">${escape_html(SITE.tipLabel)} ↗</a></div></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { _page as default };
