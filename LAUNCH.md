# Launch post drafts

## r/webdev · r/opensource · r/selfhosted (adapt title per sub)

**Title:** I built a file converter and PDF editor where your files physically can't be uploaded. FFmpeg/libheif/pdf.js/three.js compiled to WASM, running entirely in the browser. Free, source available, no ads.

**Body:**

Every "free online converter" I tried either uploads your files to someone's server, gates the result behind a paywall, or buries it in ads. So I built alkahest: a static site where all conversion (and now PDF editing) happens on your device via WebAssembly.

What it does:

- **Images** — HEIC→JPG/PNG, WEBP↔PNG/JPG, TIFF→PNG, PNG→ICO (multi-resolution favicons), SVG optimize, plus a general any-format↔any-format image converter.
- **Video & audio** — MP4→MP3/WAV, MOV→MP4 (instant remux), video→GIF, FLAC/OGG/OPUS→MP3/WAV, and SRT↔VTT subtitle conversion.
- **PDF** — merge, split, rotate, delete pages, watermark, add page numbers, PDF→images, images→PDF, and a full visual page editor (reorder, rotate, delete, insert blank pages, then export) — the thing I actually built this for, because free PDF editors on Windows are surprisingly hard to find.
- **3D models** — FBX/OBJ/STL↔GLB, for anyone dealing with 3D printing or web/AR asset pipelines.
- **Docs & archives** — RAR/7Z/TAR/ZIP extraction, DOCX→HTML/Markdown/text, XLSX→CSV.

The interesting technical bits:

- FFmpeg compiled to WASM runs in a Web Worker; raster conversion uses the browser's own codecs through OffscreenCanvas in another worker, and PDF/3D-model work runs through pdf.js/pdf-lib/three.js — so the UI never blocks.
- Cloudflare Pages rejects files over 25 MiB, and ffmpeg-core.wasm is ~30 MB. It's also a custom LGPL-only build I compiled myself (GPL codecs like x264/x265 stripped out, so no reciprocal licensing obligation), so the build splits it into chunks the client streams with a progress bar and stitches back into a Blob before booting the engine. Everything stays first-party; no CDN calls at runtime.
- The Playwright suite converts real files (including 3D models, archives, and DOCX/XLSX documents) in headless Chromium and asserts *zero* cross-origin requests during conversion. The privacy claim is enforced by CI, not just marketing copy.
- Hosting cost: $0 (static + free CDN tier). No accounts, no limits, no tracking. There's a tip jar and that's it.

It's source available under PolyForm Shield (read it, modify it, self-host it, just don't relaunch it as a competing service): [repo link]. Live: [site link].

Honest limitations: video re-encoding in single-threaded WASM is slow for large files (remuxing MOV→MP4 is instant though, and since there's no x264 in this build, the rare full re-encode falls back to VP9 instead of H.264), and there's no YouTube or social-media downloading. That's deliberate — it only transforms files you already have.

Feedback very welcome, especially on which converters to add next.

## Hacker News (Show HN)

**Title:** Show HN: alkahest - file conversion and PDF editing in the browser, files never leave your device

**Text:** Static SvelteKit site; FFmpeg/libheif/pdf.js/pdf-lib/three.js/SVGO compiled to WASM do the work locally in Web Workers — image, video, audio, PDF (including a full visual page editor), 3D model, and document/archive conversion. The FFmpeg core is a custom LGPL-only build (GPL codecs removed) chunked at build time to fit Cloudflare Pages' 25 MiB file limit and stitched client-side. E2E tests assert zero network egress during conversion. Source available (PolyForm Shield), $0 infra, tip-jar monetization only.
