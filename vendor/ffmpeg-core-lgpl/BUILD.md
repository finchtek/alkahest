# Building this core

This is a self-built alternative to the official `@ffmpeg/core` npm package.
Same toolchain, same FFmpeg version (n5.1.4), same ffmpeg.wasm build scripts,
with two changes:

1. `--enable-gpl`, `--enable-libx264` and `--enable-libx265` are removed from
   the FFmpeg configure line, so no GPL-licensed component is compiled in.
2. `-lpostproc` / `-Llibpostproc` are removed from the final link step.
   `libpostproc` is GPL-only; without `--enable-gpl`, FFmpeg's own configure
   already skips building it, so the official link script (which references
   it unconditionally) fails without this change. `ffmpeg-wasm-lgpl.sh` in
   this directory is `build/ffmpeg-wasm.sh` from the ffmpeg.wasm repo with
   just those two lines deleted.

Every remaining codec library is BSD or LGPL licensed: libvpx (VP8/VP9),
libmp3lame (MP3 encode), libtheora, libvorbis, libopus, libwebp, libzimg,
and libass/freetype/fribidi (subtitle rendering). H.264/HEVC *decoding*
still works (it's part of libavcodec itself, not the GPL x264/x265
*encoders*), so remuxing an already-H.264 MOV/MP4 is unaffected. What's
gone is the ability to *encode new* H.264/HEVC video; `src/lib/convert/media.ts`
falls back to VP9 (via libvpx) for the rare re-encode path instead.

## Reproducing this build

Requires Docker (with buildx) and a clone of
[ffmpegwasm/ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) at the
commit matching your installed `@ffmpeg/ffmpeg` wrapper version's expected
core API (the wrapper and core are versioned together upstream).

```bash
git clone https://github.com/ffmpegwasm/ffmpeg.wasm.git
cd ffmpeg.wasm
cp path/to/Dockerfile.lgpl .
cp path/to/ffmpeg-wasm-lgpl.sh build/ffmpeg-wasm-lgpl.sh
docker buildx build --build-arg FFMPEG_ST=yes -f Dockerfile.lgpl -o ./dist-lgpl .
```

Output lands in `dist-lgpl/dist/{esm,umd}/ffmpeg-core.{js,wasm}`. Copy both
pairs into this directory (`vendor/ffmpeg-core-lgpl/{esm,umd}/`), then run
`npm run build` (or just `node scripts/prepare-ffmpeg.mjs`) to re-chunk it
into `static/vendor/ffmpeg/`.

If your sandbox or CI environment intercepts outbound TLS (common in locked-down
build environments), you may need to trust that proxy's CA certificate inside
the Docker build itself. `RUN` steps that make their own network calls from
inside a freshly-built container (the `embuilder build sdl2` step and the
`git clone` for zimg) don't inherit host-level proxy trust automatically; a
`COPY` + `update-ca-certificates` (or pointing `SSL_CERT_FILE`/`GIT_SSL_CAINFO`
at a copied-in CA bundle) ahead of those steps fixes it, as done in
`Dockerfile.lgpl` here.

## Verifying the result

```bash
strings esm/ffmpeg-core.wasm | grep -o "configuration: [^\"]*" | head -1
```

Should show `--enable-libvpx --enable-libmp3lame --enable-libtheora
--enable-libvorbis --enable-libopus --enable-zlib --enable-libwebp
--enable-libfreetype --enable-libfribidi --enable-libass --enable-libzimg`
with no `--enable-gpl` and no `--enable-libx264` / `--enable-libx265`.
