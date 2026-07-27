import { a as head, b as attr, i as ensure_array_like, s as stringify, x as escape_html } from "../../../chunks/server.js";
import { t as SITE } from "../../../chunks/site.js";
//#region src/routes/open-source/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const libs = [
			{
				name: "FFmpeg",
				role: "Video & audio conversion engine (compiled to WebAssembly)",
				license: "LGPL-2.1+. see note below",
				url: "https://ffmpeg.org/",
				src: "https://git.ffmpeg.org/ffmpeg.git"
			},
			{
				name: "ffmpeg.wasm (@ffmpeg/ffmpeg)",
				role: "FFmpeg WebAssembly JS bindings, runs in a Web Worker",
				license: "MIT (bindings); custom LGPL-only core build, see note below",
				url: "https://github.com/ffmpegwasm/ffmpeg.wasm",
				src: "https://github.com/ffmpegwasm/ffmpeg.wasm"
			},
			{
				name: "libheif + libde265 (via heic2any)",
				role: "HEIC/HEIF photo decoding",
				license: "LGPL-3.0 (libheif, libde265) · MIT (heic2any wrapper)",
				url: "https://github.com/strukturag/libheif",
				src: "https://github.com/alexcorvi/heic2any"
			},
			{
				name: "pdf-lib",
				role: "PDF merge, split and image-to-PDF assembly",
				license: "MIT",
				url: "https://pdf-lib.js.org/",
				src: "https://github.com/Hopding/pdf-lib"
			},
			{
				name: "Mozilla pdf.js",
				role: "PDF page rendering for PDF → image extraction",
				license: "Apache-2.0",
				url: "https://mozilla.github.io/pdf.js/",
				src: "https://github.com/mozilla/pdf.js"
			},
			{
				name: "SVGO",
				role: "SVG optimization",
				license: "MIT",
				url: "https://svgo.dev/",
				src: "https://github.com/svg/svgo"
			},
			{
				name: "fflate",
				role: "Client-side zip packaging of multi-file results",
				license: "MIT",
				url: "https://github.com/101arrowz/fflate",
				src: "https://github.com/101arrowz/fflate"
			},
			{
				name: "Svelte & SvelteKit",
				role: "UI framework and static site generation",
				license: "MIT",
				url: "https://svelte.dev/",
				src: "https://github.com/sveltejs/kit"
			},
			{
				name: "Tailwind CSS",
				role: "Styling",
				license: "MIT",
				url: "https://tailwindcss.com/",
				src: "https://github.com/tailwindlabs/tailwindcss"
			}
		];
		head("z24vjt", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>source &amp; licenses | ${escape_html(SITE.name)}</title>`);
			});
			$$renderer.push(`<meta name="description"${attr("content", `every library that powers ${stringify(SITE.name)}, with licenses and source links. the site's own code is source available under the PolyForm Shield license.`)}/> <link rel="canonical"${attr("href", `${stringify(SITE.origin)}/open-source`)}/>`);
		});
		$$renderer.push(`<section class="mx-auto max-w-3xl px-4 py-12 sm:px-6"><h1 class="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">source &amp; licenses</h1> <div class="spectrum-gradient mt-4 h-1 w-20 rounded-full opacity-80"></div> <p class="mt-5 leading-relaxed text-zinc-700">${escape_html(SITE.name)} exists because a handful of genuinely remarkable open-source projects made
		native-grade file processing possible inside a browser tab. this page credits them properly and
		explains exactly what runs where.</p> <h2 class="mt-10 text-xl font-bold text-zinc-900">where your files go: nowhere</h2> <p class="mt-3 leading-relaxed text-zinc-700">all processing happens locally on your device using WebAssembly. your files are never uploaded
		to any server or tracked. this site is a set of static pages: no backend, no database, no
		analytics script, not a single cookie. the only network traffic after page load is fetching the
		conversion engines themselves (served from this same site, cached by your browser). you can
		verify this any time with your browser’s DevTools network tab.</p> <p class="mt-3 leading-relaxed text-zinc-700">the site’s own code is public on <a${attr("href", SITE.github)} target="_blank" rel="noopener noreferrer" class="text-[#a34a32] underline decoration-[#a34a32]/40 underline-offset-2 hover:text-[#8c3d28]">GitHub</a> under the <a href="https://polyformproject.org/licenses/shield/1.0.0/" target="_blank" rel="noopener noreferrer" class="text-[#a34a32] underline decoration-[#a34a32]/40 underline-offset-2 hover:text-[#8c3d28]">PolyForm Shield license</a>:
		source available, not fully open source. read it, learn from it, self-host your own copy for
		personal use. the one thing it doesn't let you do is take this code and launch a competing file
		converter with it. every third-party library below keeps its own, separate, genuinely open-source
		license, unaffected by that.</p> <h2 class="mt-10 text-xl font-bold text-zinc-900">the libraries doing the heavy lifting</h2> <div class="mt-4 overflow-x-auto"><table class="w-full min-w-[36rem] border-collapse text-left text-sm"><thead><tr class="border-b border-zinc-300/50 text-zinc-700"><th class="py-2 pr-4 font-medium">project</th><th class="py-2 pr-4 font-medium">used for</th><th class="py-2 pr-4 font-medium">license</th><th class="py-2 font-medium">source</th></tr></thead><tbody><!--[-->`);
		const each_array = ensure_array_like(libs);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let lib = each_array[$$index];
			$$renderer.push(`<tr class="border-b border-zinc-300/30 align-top"><td class="py-3 pr-4 font-medium text-zinc-800"><a${attr("href", lib.url)} target="_blank" rel="noopener noreferrer" class="hover:text-[#a34a32]">${escape_html(lib.name)}</a></td><td class="py-3 pr-4 text-zinc-700">${escape_html(lib.role)}</td><td class="py-3 pr-4 text-zinc-700">${escape_html(lib.license)}</td><td class="py-3"><a${attr("href", lib.src)} target="_blank" rel="noopener noreferrer" class="text-[#a34a32] hover:text-[#8c3d28]">code ↗</a></td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table></div> <h2 class="mt-10 text-xl font-bold text-zinc-900">a precise note on FFmpeg licensing</h2> <p class="mt-3 leading-relaxed text-zinc-700">FFmpeg is licensed under the LGPL v2.1+, with optional components under the GPL, notably the
		x264/x265 encoders and libpostproc. the official prebuilt <code class="rounded bg-zinc-200/60 px-1.5 py-0.5 font-mono text-xs">@ffmpeg/core</code> package ships those GPL components, which puts a reciprocal open-source obligation on any app
		that bundles it. this site doesn't use that package. it ships a <a${attr("href", `${stringify(SITE.github)}/tree/main/vendor/ffmpeg-core-lgpl`)} target="_blank" rel="noopener noreferrer" class="text-[#a34a32] underline decoration-[#a34a32]/40 underline-offset-2 hover:text-[#8c3d28]">custom-built core</a> compiled from the same FFmpeg version and the same <a href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noopener noreferrer" class="text-[#a34a32] underline decoration-[#a34a32]/40 underline-offset-2 hover:text-[#8c3d28]">ffmpeg.wasm build scripts</a>,
		with <code class="rounded bg-zinc-200/60 px-1.5 py-0.5 font-mono text-xs">--enable-gpl</code>, <code class="rounded bg-zinc-200/60 px-1.5 py-0.5 font-mono text-xs">--enable-libx264</code>, <code class="rounded bg-zinc-200/60 px-1.5 py-0.5 font-mono text-xs">--enable-libx265</code> and
		libpostproc removed. everything that's left (libvpx, libmp3lame, libtheora, libvorbis, libopus,
		libwebp, libass/freetype/fribidi, libzimg) is BSD or LGPL licensed. the practical effect: H.264
		and HEVC video can still be read and remuxed (that's most real-world MOV/MP4 files, and it's
		lossless besides), but re-encoding brand new H.264 isn't available. when a source file truly
		needs re-encoding, this site falls back to VP9 instead, which every modern browser plays fine.
		the build recipe, exact configure flags and source links live in <a${attr("href", `${stringify(SITE.github)}/blob/main/vendor/ffmpeg-core-lgpl/BUILD.md`)} target="_blank" rel="noopener noreferrer" class="text-[#a34a32] underline decoration-[#a34a32]/40 underline-offset-2 hover:text-[#8c3d28]">BUILD.md</a> alongside the compiled core, so anyone can verify or reproduce it.</p> <p class="mt-3 leading-relaxed text-zinc-700">This software uses code of FFmpeg licensed under the LGPLv2.1 and its source can be
		downloaded <a href="https://git.ffmpeg.org/ffmpeg.git" target="_blank" rel="noopener noreferrer" class="text-[#a34a32] underline decoration-[#a34a32]/40 underline-offset-2 hover:text-[#8c3d28]">here</a>.
		FFmpeg is a trademark of Fabrice Bellard, originator of the FFmpeg project.</p> <h2 class="mt-10 text-xl font-bold text-zinc-900">what this site will never do</h2> <p class="mt-3 leading-relaxed text-zinc-700">no downloading or ripping from YouTube or social platforms. only transforming files you
		already have. no ads, no trackers, no selling anything about you (there is literally nothing to
		sell. we never see your data). no paywalled “premium” conversions. ever.</p> <h2 class="mt-10 text-xl font-bold text-zinc-900">thank you, seriously</h2> <p class="mt-3 leading-relaxed text-zinc-700">to the maintainers of every project above: this tool is a thin layer of UI over decades of
		your work. if ${escape_html(SITE.name)} saves people time, that credit is mostly yours. if you’d like to
		support this site’s development, there’s a <a${attr("href", SITE.tipUrl)} target="_blank" rel="noopener noreferrer" class="text-[#a34a32] underline decoration-[#a34a32]/40 underline-offset-2 hover:text-[#8c3d28]">tip jar</a>.
		honestly though, consider supporting the upstream projects too.</p></section>`);
	});
}
//#endregion
export { _page as default };
