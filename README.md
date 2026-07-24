# alkahest

**Convert files. Zero uploads.** A free, source-available, privacy-first file converter and PDF editor that runs 100% in the browser via WebAssembly. no servers, no ads, no tracking, $0 to operate.

HEIC → JPG/PNG · WEBP ↔ PNG/JPG · any image ↔ any image · SVG optimize · MP4 → MP3/WAV · MOV → MP4 · video → GIF · FLAC/OGG/OPUS → MP3/WAV · SRT ↔ VTT · merge/split/rotate/watermark PDF · full visual PDF page editor · PDF → images · images → PDF · TIFF → PNG/JPG · PNG → ICO · FBX/OBJ/STL ↔ GLB · RAR/7Z/TAR/ZIP extraction · DOCX → HTML/Markdown/text · XLSX → CSV

## Why it's private by construction

The site is a static bundle on a CDN. Files you drop are read into browser memory, processed by native libraries compiled to WebAssembly (FFmpeg, libheif, pdf.js, pdf-lib, three.js, libarchive.js, mammoth.js, SheetJS, SVGO), and handed back as downloads. the network tab stays silent during conversion. There is no backend to upload to, no analytics, no cookies. The e2e suite asserts zero cross-origin requests during conversions.

## Architecture highlights

- **SvelteKit + adapter-static**. every tool page is prerendered for SEO; zero server code.
- **FFmpeg WASM, self-hosted, custom-built & chunked**. `vendor/ffmpeg-core-lgpl` is a from-source build with the GPL codecs (x264/x265) removed, see [BUILD.md](./vendor/ffmpeg-core-lgpl/BUILD.md). Cloudflare Pages rejects files over 25 MiB, so `scripts/prepare-ffmpeg.mjs` splits the ~30 MB `ffmpeg-core.wasm` into <20 MiB parts at build time; the client streams them with progress, stitches a Blob, and boots the engine from blob URLs. First-party only. no runtime CDN calls.
- **Web Workers everywhere**. FFmpeg runs in its own worker (via `@ffmpeg/ffmpeg`), pdf.js uses its worker, and raster encoding runs in a dedicated `OffscreenCanvas` worker with a main-thread fallback.
- **Zero-dependency image pipeline**. WEBP/PNG/JPG conversions use the browser's own codecs via canvas; only HEIC needs WASM (libheif via heic2any), lazy-loaded on demand.
- **Registry-driven tools**. each converter is a config object in `src/lib/registry.ts` (accepted types, options schema, lazy `run()` import). Adding a tool = adding an entry; the page, SEO tags, sitemap and landing grid follow automatically.

## Develop

```bash
npm install        # also chunks the FFmpeg core into static/vendor/ffmpeg
npm run dev        # local dev server
npm run build      # static production build into build/
npm run preview    # serve the production build
```

## Test (real conversions in headless Chromium)

```bash
npm run fixtures   # generate HEIC/WEBP/MP4/MOV/PDF/SVG test files (needs system ffmpeg + Python w/ pillow, pillow-heif)
npm test           # Playwright: converts real files, checks output byte signatures, asserts zero network egress
```

## Deploy to Cloudflare Pages ($0)

Option A. dashboard:

1. Push this repo to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Build command: `npm run build` · Output directory: `build`.

Option B. CLI:

```bash
npm run build
npx wrangler pages deploy build --project-name alkahest
```

`static/_headers` ships immutable caching for the FFmpeg chunks plus basic security headers.

## Configuration

All in `src/lib/site.ts`: site name, tagline, **tip jar URL** (currently Ko-fi), **GitHub repo URL** (update `YOUR_USERNAME`), and canonical origin for SEO/sitemap (update after you know your domain, also mirrored in `static/robots.txt`).

## Licensing

App code: [PolyForm Shield 1.0.0](./LICENSE), source available with one restriction: you can read it, modify it, self-host it, but you can't use it to run a competing file-conversion service. Runtime engines carry their own genuinely open-source licenses (MIT/BSD/Apache/LGPL) unaffected by that. see [NOTICES.md](./NOTICES.md) and the in-app `/open-source` page. No YouTube/social downloading features. user-provided files only.

## Roadmap

Multi-threaded core behind COOP/COEP · PWA offline support · PDF compression · drag-to-reorder for merge · burn-in subtitles (libass, now part of the LGPL-only core).
