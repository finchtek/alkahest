/**
 * Generates real test files for the e2e suite into e2e/fixtures/.
 * Requires: system ffmpeg (for mp4/mov/flac), python3 with pillow + pillow-heif
 * (for png/jpg/webp/heic/tiff), python-docx + openpyxl (for docx/xlsx).
 * PDFs, SVG, subtitles, archives and 3D models are generated in-process
 * with packages already in this repo (pdf-lib, fflate, three.js).
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'e2e', 'fixtures');
mkdirSync(out, { recursive: true });

const sh = (cmd) => execSync(cmd, { stdio: 'pipe' });

// ---------- SVG (deliberately bloated so the optimizer has work to do) ----------
const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Generator: Some Editor 9.99, bloat included     -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="200.000000px" height="200.000000px" viewBox="0.000000 0.000000 200.000000 200.000000">
  <metadata id="metadata1">Lots of editor metadata that serves no purpose at all</metadata>
  <defs id="defs99"></defs>
  <g id="layer1" transform="translate(0.000000,0.000000)">
    <rect x="10.000000" y="10.000000" width="180.000000" height="180.000000"
          style="fill:#22d3ee;fill-opacity:1.0000;stroke:none" id="rect1"/>
    <circle cx="100.000000" cy="100.000000" r="60.000000"
          style="fill:#09090b;fill-opacity:1.0000" id="circle1"/>
    <!-- another pointless comment -->
  </g>
</svg>`;
writeFileSync(join(out, 'sample.svg'), svg);

// ---------- PDFs ----------
const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
async function makePdf(pages, label) {
	const doc = await PDFDocument.create();
	const font = await doc.embedFont(StandardFonts.Helvetica);
	for (let i = 1; i <= pages; i++) {
		const page = doc.addPage([400, 300]);
		page.drawRectangle({ x: 0, y: 0, width: 400, height: 300, color: rgb(0.95, 0.97, 1) });
		page.drawText(`${label}, page ${i}/${pages}`, { x: 40, y: 140, size: 20, font, color: rgb(0.05, 0.05, 0.4) });
	}
	return doc.save();
}
writeFileSync(join(out, 'doc-a.pdf'), await makePdf(2, 'Document A'));
writeFileSync(join(out, 'doc-b.pdf'), await makePdf(1, 'Document B'));

// ---------- Raster images (+ HEIC) via Python ----------
const py = `
import sys
from PIL import Image, ImageDraw
img = Image.new('RGB', (320, 240), (14, 165, 180))
d = ImageDraw.Draw(img)
for i in range(0, 320, 20):
    d.line([(i, 0), (i, 240)], fill=(9, 9, 11), width=2)
d.ellipse([90, 50, 230, 190], fill=(129, 140, 248))
d.text((20, 20), 'Prism fixture', fill=(255, 255, 255))
img.save(r'${join(out, 'sample.png')}')
img.save(r'${join(out, 'sample.jpg')}', quality=90)
img.save(r'${join(out, 'sample.webp')}', quality=90)
try:
    import pillow_heif
    pillow_heif.from_pillow(img).save(r'${join(out, 'sample.heic')}', quality=80)
    print('heic ok')
except Exception as e:
    print('heic skipped:', e, file=sys.stderr)
`;
try {
	sh(`python3 -c "${py.replace(/"/g, '\\"')}"`);
} catch (e) {
	console.error('[fixtures] python image generation failed:', e.message);
}

// ---------- Video + audio via system ffmpeg ----------
try {
	sh(
		`ffmpeg -y -loglevel error -f lavfi -i testsrc2=size=320x240:rate=24:duration=2 -f lavfi -i sine=frequency=440:duration=2 -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "${join(out, 'sample.mp4')}"`
	);
	sh(
		`ffmpeg -y -loglevel error -f lavfi -i testsrc2=size=320x240:rate=24:duration=2 -f lavfi -i sine=frequency=330:duration=2 -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "${join(out, 'sample.mov')}"`
	);
	sh(`ffmpeg -y -loglevel error -f lavfi -i sine=frequency=440:duration=1 -c:a flac "${join(out, 'sample.flac')}"`);
} catch (e) {
	console.error('[fixtures] ffmpeg video/audio generation failed:', e.message);
}

// ---------- TIFF via Python/Pillow ----------
try {
	sh(
		`python3 -c "from PIL import Image; Image.new('RGB', (64, 64), color=(120, 90, 60)).save(r'${join(out, 'sample.tiff')}')"`
	);
} catch (e) {
	console.error('[fixtures] tiff generation failed:', e.message);
}

// ---------- Subtitles (plain text, no deps) ----------
writeFileSync(
	join(out, 'sample.srt'),
	'1\n00:00:00,000 --> 00:00:02,000\nhello there\n\n2\n00:00:02,500 --> 00:00:04,000\nthis is a subtitle test\n'
);
writeFileSync(
	join(out, 'sample.vtt'),
	'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nhello there\n\n00:00:02.500 --> 00:00:04.000\nthis is a subtitle test\n'
);

// ---------- DOCX / XLSX via Python (python-docx, openpyxl) ----------
try {
	sh(
		`python3 -c "import docx; d=docx.Document(); d.add_heading('Test Document', level=1); d.add_paragraph('This is a paragraph for testing docx to html conversion.'); d.add_paragraph('Second paragraph with more text.'); d.save(r'${join(out, 'sample.docx')}')"`
	);
} catch (e) {
	console.error('[fixtures] docx generation failed (needs python-docx):', e.message);
}
try {
	sh(
		`python3 -c "import openpyxl; wb=openpyxl.Workbook(); ws=wb.active; ws.append(['Name','Value']); ws.append(['Alpha',1]); ws.append(['Beta',2]); wb.save(r'${join(out, 'sample.xlsx')}')"`
	);
} catch (e) {
	console.error('[fixtures] xlsx generation failed (needs openpyxl):', e.message);
}

// ---------- ZIP archive, built with fflate (already a dependency) ----------
try {
	const { zipSync, strToU8 } = await import('fflate');
	const zipped = zipSync(
		{
			'one.txt': strToU8('file one contents\n'),
			'two.txt': strToU8('file two contents\n')
		},
		{ level: 0 }
	);
	writeFileSync(join(out, 'sample.zip'), zipped);
} catch (e) {
	console.error('[fixtures] zip generation failed:', e.message);
}

// ---------- 3D models: a plain cube, written by hand (OBJ/STL) or via three.js (GLB) ----------
const objCube = `# cube
v -0.5 -0.5 -0.5
v 0.5 -0.5 -0.5
v 0.5 0.5 -0.5
v -0.5 0.5 -0.5
v -0.5 -0.5 0.5
v 0.5 -0.5 0.5
v 0.5 0.5 0.5
v -0.5 0.5 0.5
f 1 2 3 4
f 5 8 7 6
f 1 5 6 2
f 2 6 7 3
f 3 7 8 4
f 5 1 4 8
`;
writeFileSync(join(out, 'sample.obj'), objCube);

function binaryStlCube() {
	// 12 triangles (2 per cube face), 84-byte header + 50 bytes/triangle.
	const faces = [
		[0, 0, -1, [0, 0, 0], [1, 1, 0], [1, 0, 0]],
		[0, 0, -1, [0, 0, 0], [0, 1, 0], [1, 1, 0]],
		[0, 0, 1, [0, 0, 1], [1, 0, 1], [1, 1, 1]],
		[0, 0, 1, [0, 0, 1], [1, 1, 1], [0, 1, 1]],
		[0, -1, 0, [0, 0, 0], [1, 0, 0], [1, 0, 1]],
		[0, -1, 0, [0, 0, 0], [1, 0, 1], [0, 0, 1]],
		[0, 1, 0, [0, 1, 0], [1, 1, 1], [1, 1, 0]],
		[0, 1, 0, [0, 1, 0], [0, 1, 1], [1, 1, 1]],
		[-1, 0, 0, [0, 0, 0], [0, 1, 0], [0, 1, 1]],
		[-1, 0, 0, [0, 0, 0], [0, 1, 1], [0, 0, 1]],
		[1, 0, 0, [1, 0, 0], [1, 1, 1], [1, 1, 0]],
		[1, 0, 0, [1, 0, 0], [1, 0, 1], [1, 1, 1]]
	];
	const buf = Buffer.alloc(84 + faces.length * 50);
	buf.write('binary STL cube fixture', 0, 'ascii');
	buf.writeUInt32LE(faces.length, 80);
	let off = 84;
	for (const [nx, ny, nz, a, b, c] of faces) {
		buf.writeFloatLE(nx, off);
		buf.writeFloatLE(ny, off + 4);
		buf.writeFloatLE(nz, off + 8);
		[a, b, c].forEach((v, i) => {
			buf.writeFloatLE(v[0], off + 12 + i * 12);
			buf.writeFloatLE(v[1], off + 16 + i * 12);
			buf.writeFloatLE(v[2], off + 20 + i * 12);
		});
		buf.writeUInt16LE(0, off + 48); // attribute byte count
		off += 50;
	}
	return buf;
}
writeFileSync(join(out, 'sample.stl'), binaryStlCube());

try {
	// Minimal FileReader polyfill: three.js's GLTFExporter uses it to turn its
	// internal Blob into an ArrayBuffer, which is a browser-only API in Node.
	if (typeof globalThis.FileReader === 'undefined') {
		globalThis.FileReader = class {
			readAsArrayBuffer(blob) {
				blob.arrayBuffer().then((buf) => {
					this.result = buf;
					this.onloadend?.();
				});
			}
			readAsDataURL(blob) {
				blob.arrayBuffer().then((buf) => {
					this.result = `data:application/octet-stream;base64,${Buffer.from(buf).toString('base64')}`;
					this.onloadend?.();
				});
			}
		};
	}
	const THREE = await import('three');
	const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
	const mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshStandardMaterial({ color: 0xb8a88f })
	);
	const glb = await new Promise((resolve, reject) => {
		new GLTFExporter().parse(mesh, resolve, reject, { binary: true });
	});
	writeFileSync(join(out, 'sample.glb'), Buffer.from(glb));
} catch (e) {
	console.error('[fixtures] glb generation failed:', e.message);
}

const made = [
	'sample.svg',
	'doc-a.pdf',
	'doc-b.pdf',
	'sample.png',
	'sample.jpg',
	'sample.webp',
	'sample.heic',
	'sample.mp4',
	'sample.mov',
	'sample.flac',
	'sample.tiff',
	'sample.srt',
	'sample.vtt',
	'sample.docx',
	'sample.xlsx',
	'sample.zip',
	'sample.obj',
	'sample.stl',
	'sample.glb'
];
console.log('[fixtures] present:', made.filter((f) => existsSync(join(out, f))).join(', '));
console.log('[fixtures] missing:', made.filter((f) => !existsSync(join(out, f))).join(', ') || 'none');
