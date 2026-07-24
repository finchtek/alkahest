# Third-party notices

alkahest's own code is source available under the [PolyForm Shield 1.0.0
license](https://polyformproject.org/licenses/shield/1.0.0/) (see [LICENSE](./LICENSE)):
you can read it, modify it and self-host it, but not use it to operate a
competing file-conversion service. At runtime it loads and uses the following
genuinely open-source components, which remain under their own licenses and
are unaffected by that restriction:

| Component | Use | License | Source |
| --- | --- | --- | --- |
| FFmpeg | Video/audio conversion engine (WASM), custom LGPL-only build (see below) | LGPL-2.1+ | https://git.ffmpeg.org/ffmpeg.git |
| ffmpeg.wasm (`@ffmpeg/ffmpeg`, `@ffmpeg/util`) | FFmpeg WASM JS bindings | MIT | https://github.com/ffmpegwasm/ffmpeg.wasm |
| libheif / libde265 (via `heic2any`) | HEIC decoding | LGPL-3.0 (libs), MIT (wrapper) | https://github.com/strukturag/libheif |
| pdf-lib | PDF merge/split/create | MIT | https://github.com/Hopding/pdf-lib |
| Mozilla pdf.js (`pdfjs-dist`) | PDF rendering | Apache-2.0 | https://github.com/mozilla/pdf.js |
| SVGO | SVG optimization | MIT | https://github.com/svg/svgo |
| fflate | Client-side zip | MIT | https://github.com/101arrowz/fflate |
| three.js | 3D model parsing/export (FBX, OBJ, STL, GLB) | MIT | https://github.com/mrdoob/three.js |
| UTIF2 | TIFF decoding | MIT | https://github.com/photopea/UTIF.js |
| libarchive.js | Archive extraction (RAR/7Z/TAR/ZIP, WASM) | MIT | https://github.com/nika-begiashvili/libarchivejs |
| mammoth.js | DOCX → HTML conversion | BSD-2-Clause | https://github.com/mwilliamson/mammoth.js |
| Turndown | HTML → Markdown conversion | MIT | https://github.com/mixmark-io/turndown |
| SheetJS (`xlsx`) | Spreadsheet reading/CSV export | Apache-2.0 | https://github.com/SheetJS/sheetjs |
| Svelte / SvelteKit | UI framework | MIT | https://github.com/sveltejs/kit |
| Tailwind CSS | Styling | MIT | https://github.com/tailwindlabs/tailwindcss |

## FFmpeg licensing

This app does not use the official `@ffmpeg/core` npm package, because it's
compiled with `--enable-gpl` and the x264/x265 encoders, which puts a
reciprocal open-source obligation on anything that bundles it. Instead it
ships a custom core built from the same FFmpeg version (n5.1.4) and the same
ffmpeg.wasm build scripts, with `--enable-gpl`, `--enable-libx264`,
`--enable-libx265` and `libpostproc` (GPL-only, so unbuildable without
`--enable-gpl` anyway) removed. Everything left in the build — libvpx,
libmp3lame, libtheora, libvorbis, libopus, libwebp, libass/freetype/fribidi,
libzimg — is BSD or LGPL licensed. H.264/HEVC decoding and remuxing (the fast
path used for the vast majority of real-world MOV/MP4 files) is unaffected;
new H.264 encoding is not available, so the rare re-encode fallback in
`src/lib/convert/media.ts` targets VP9 instead. The exact build recipe,
configure flags and verification steps are in
[`vendor/ffmpeg-core-lgpl/BUILD.md`](./vendor/ffmpeg-core-lgpl/BUILD.md).

> This software uses code of FFmpeg licensed under the LGPLv2.1 and its
> source can be downloaded [here](https://git.ffmpeg.org/ffmpeg.git).

FFmpeg is a trademark of Fabrice Bellard, originator of the FFmpeg project.
