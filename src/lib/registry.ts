import type { Category, ToolDef } from './types';

const qualityOpt = (def = 0.9) => ({
	key: 'quality',
	label: 'quality',
	type: 'range' as const,
	min: 0.5,
	max: 1,
	step: 0.05,
	default: def
});

export const tools: ToolDef[] = [
	// ---------- Images ----------
	{
		slug: 'heic-to-jpg',
		name: 'HEIC to JPG',
		short: 'iPhone photos → universal JPG',
		description:
			'convert Apple HEIC/HEIF photos to JPG right in your browser. decoded locally with libheif (WebAssembly). your photos are never uploaded.',
		category: 'image',
		accept: ['.heic', '.heif'],
		acceptAttr: '.heic,.heif,image/heic,image/heif',
		multiple: true,
		options: [qualityOpt()],
		run: async (f, o, p) => (await import('./convert/image')).convertImages(f, 'image/jpeg', o, p)
	},
	{
		slug: 'heic-to-png',
		name: 'HEIC to PNG',
		short: 'iPhone photos → lossless PNG',
		description:
			'convert HEIC/HEIF photos to lossless PNG entirely on your device. no upload, no quality loss.',
		category: 'image',
		accept: ['.heic', '.heif'],
		acceptAttr: '.heic,.heif,image/heic,image/heif',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/image')).convertImages(f, 'image/png', o, p)
	},
	{
		slug: 'webp-to-png',
		name: 'WEBP to PNG',
		short: 'web images → editable PNG',
		description:
			'convert WEBP images to PNG locally using your browser’s built-in decoder. instant, private, free.',
		category: 'image',
		accept: ['.webp'],
		acceptAttr: '.webp,image/webp',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/image')).convertImages(f, 'image/png', o, p)
	},
	{
		slug: 'webp-to-jpg',
		name: 'WEBP to JPG',
		short: 'web images → universal JPG',
		description: 'convert WEBP images to JPG on-device. no servers involved.',
		category: 'image',
		accept: ['.webp'],
		acceptAttr: '.webp,image/webp',
		multiple: true,
		options: [qualityOpt()],
		run: async (f, o, p) => (await import('./convert/image')).convertImages(f, 'image/jpeg', o, p)
	},
	{
		slug: 'png-to-webp',
		name: 'PNG to WEBP',
		short: 'shrink PNGs for the web',
		description:
			'compress PNG images to modern WEBP in your browser. typically 60-90% smaller for web use.',
		category: 'image',
		accept: ['.png'],
		acceptAttr: '.png,image/png',
		multiple: true,
		options: [qualityOpt(0.85)],
		run: async (f, o, p) => (await import('./convert/image')).convertImages(f, 'image/webp', o, p)
	},
	{
		slug: 'jpg-to-webp',
		name: 'JPG to WEBP',
		short: 'shrink JPGs for the web',
		description: 'convert JPG photos to smaller WEBP files without leaving your browser.',
		category: 'image',
		accept: ['.jpg', '.jpeg'],
		acceptAttr: '.jpg,.jpeg,image/jpeg',
		multiple: true,
		options: [qualityOpt(0.85)],
		run: async (f, o, p) => (await import('./convert/image')).convertImages(f, 'image/webp', o, p)
	},
	{
		slug: 'svg-optimizer',
		name: 'SVG optimizer',
		short: 'minify SVGs with SVGO',
		description:
			'optimize SVG files with SVGO (multipass): strips editor cruft and shrinks files, all client-side.',
		category: 'image',
		accept: ['.svg'],
		acceptAttr: '.svg,image/svg+xml',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/svg')).optimizeSvgs(f, o, p)
	},

	// ---------- Video & Audio ----------
	{
		slug: 'mp4-to-mp3',
		name: 'MP4 to MP3',
		short: 'extract audio from video',
		description:
			'extract the audio track from MP4/MOV/WEBM videos as MP3. powered by FFmpeg compiled to WebAssembly, running entirely on your device.',
		category: 'media',
		accept: ['.mp4', '.mov', '.webm', '.mkv', '.m4v', '.avi'],
		acceptAttr: '.mp4,.mov,.webm,.mkv,.m4v,.avi,video/*',
		multiple: true,
		heavy: true,
		options: [
			{
				key: 'bitrate',
				label: 'MP3 bitrate',
				type: 'select',
				choices: [
					{ value: '128', label: '128 kbps' },
					{ value: '192', label: '192 kbps (recommended)' },
					{ value: '256', label: '256 kbps' },
					{ value: '320', label: '320 kbps' }
				],
				default: '192'
			}
		],
		run: async (f, o, p) => (await import('./convert/media')).extractAudio(f, 'mp3', o, p)
	},
	{
		slug: 'video-to-wav',
		name: 'video to WAV',
		short: 'uncompressed audio extract',
		description:
			'extract audio from any video as uncompressed WAV (16-bit PCM). ideal for editing. 100% in-browser via FFmpeg WASM.',
		category: 'media',
		accept: ['.mp4', '.mov', '.webm', '.mkv', '.m4v', '.avi'],
		acceptAttr: '.mp4,.mov,.webm,.mkv,.m4v,.avi,video/*',
		multiple: true,
		heavy: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/media')).extractAudio(f, 'wav', o, p)
	},
	{
		slug: 'mov-to-mp4',
		name: 'MOV to MP4',
		short: 'iPhone video → universal MP4',
		description:
			'convert MOV (and WEBM/MKV/AVI) to MP4. remuxes losslessly in seconds when codecs allow; falls back to a local re-encode otherwise.',
		category: 'media',
		accept: ['.mov', '.webm', '.mkv', '.avi', '.m4v'],
		acceptAttr: '.mov,.webm,.mkv,.avi,.m4v,video/*',
		multiple: true,
		heavy: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/media')).toMp4(f, o, p)
	},
	{
		slug: 'video-to-gif',
		name: 'video to GIF',
		short: 'clips → looping GIFs',
		description:
			'turn short video clips into optimized looping GIFs with palette generation. all processed on your device.',
		category: 'media',
		accept: ['.mp4', '.mov', '.webm', '.m4v'],
		acceptAttr: '.mp4,.mov,.webm,.m4v,video/*',
		multiple: true,
		heavy: true,
		options: [
			{
				key: 'fps',
				label: 'frame rate',
				type: 'range',
				min: 5,
				max: 24,
				step: 1,
				default: 12
			},
			{
				key: 'width',
				label: 'width',
				type: 'select',
				choices: [
					{ value: '320', label: '320 px' },
					{ value: '480', label: '480 px' },
					{ value: '640', label: '640 px' }
				],
				default: '480'
			}
		],
		run: async (f, o, p) => (await import('./convert/media')).toGif(f, o, p)
	},

	// ---------- PDF ----------
	{
		slug: 'merge-pdf',
		name: 'merge PDF',
		short: 'combine PDFs into one',
		description:
			'merge multiple PDFs into a single document, in order, without uploading them anywhere. powered by pdf-lib.',
		category: 'pdf',
		accept: ['.pdf'],
		acceptAttr: '.pdf,application/pdf',
		multiple: true,
		minFiles: 2,
		options: [],
		run: async (f, o, p) => (await import('./convert/pdf')).mergePdfs(f, o, p)
	},
	{
		slug: 'split-pdf',
		name: 'split PDF',
		short: 'extract pages or ranges',
		description:
			'split a PDF into separate files: every page individually, or custom ranges like “1-3, 5, 8-10”. fully client-side.',
		category: 'pdf',
		accept: ['.pdf'],
		acceptAttr: '.pdf,application/pdf',
		multiple: false,
		options: [
			{
				key: 'ranges',
				label: 'page ranges',
				type: 'text',
				placeholder: 'e.g. 1-3, 5, 8-10. leave empty for every page',
				hint: 'leave empty to split into single pages',
				default: ''
			}
		],
		run: async (f, o, p) => (await import('./convert/pdf')).splitPdf(f, o, p)
	},
	{
		slug: 'pdf-to-images',
		name: 'PDF to images',
		short: 'pages → PNG or JPG',
		description:
			'render each PDF page to a high-resolution PNG or JPG using Mozilla’s pdf.js. right in your browser.',
		category: 'pdf',
		accept: ['.pdf'],
		acceptAttr: '.pdf,application/pdf',
		multiple: false,
		options: [
			{
				key: 'format',
				label: 'image format',
				type: 'select',
				choices: [
					{ value: 'png', label: 'PNG (lossless)' },
					{ value: 'jpg', label: 'JPG (smaller)' }
				],
				default: 'png'
			},
			{
				key: 'scale',
				label: 'resolution',
				type: 'select',
				choices: [
					{ value: '1', label: '1× (72 dpi)' },
					{ value: '2', label: '2× (144 dpi)' },
					{ value: '3', label: '3× (216 dpi)' }
				],
				default: '2'
			}
		],
		run: async (f, o, p) => (await import('./convert/pdf')).pdfToImages(f, o, p)
	},
	{
		slug: 'images-to-pdf',
		name: 'images to PDF',
		short: 'photos & scans → one PDF',
		description:
			'combine JPG, PNG, WEBP or HEIC images into a single PDF: one page per image, sized to fit. nothing leaves your device.',
		category: 'pdf',
		accept: ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'],
		acceptAttr: '.jpg,.jpeg,.png,.webp,.heic,.heif,image/*',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/pdf')).imagesToPdf(f, o, p)
	},
	{
		slug: 'rotate-pdf',
		name: 'rotate PDF',
		short: 'fix sideways scans',
		description:
			'rotate every page of a PDF by 90, 180 or 270 degrees. handy for scans that came out sideways or upside down.',
		category: 'pdf',
		accept: ['.pdf'],
		acceptAttr: '.pdf,application/pdf',
		multiple: true,
		options: [
			{
				key: 'degrees',
				label: 'rotate by',
				type: 'select',
				choices: [
					{ value: '90', label: '90° clockwise' },
					{ value: '180', label: '180°' },
					{ value: '270', label: '270° clockwise' }
				],
				default: '90'
			}
		],
		run: async (f, o, p) => (await import('./convert/pdf')).rotatePdf(f, o, p)
	},
	{
		slug: 'delete-pages',
		name: 'delete PDF pages',
		short: 'remove pages, keep the rest',
		description:
			'drop specific pages or ranges (like “2, 5-7”) and get back one PDF with everything else, in order. no more hunting for a desktop editor.',
		category: 'pdf',
		accept: ['.pdf'],
		acceptAttr: '.pdf,application/pdf',
		multiple: false,
		options: [
			{
				key: 'ranges',
				label: 'pages to remove',
				type: 'text',
				placeholder: 'e.g. 2, 5-7',
				hint: 'these pages are dropped. everything else stays, in order',
				default: ''
			}
		],
		run: async (f, o, p) => (await import('./convert/pdf')).deletePages(f, o, p)
	},
	{
		slug: 'watermark-pdf',
		name: 'watermark PDF',
		short: 'stamp text across every page',
		description:
			'stamp a diagonal text watermark, like “draft” or “confidential”, across every page. no design software, no subscription.',
		category: 'pdf',
		accept: ['.pdf'],
		acceptAttr: '.pdf,application/pdf',
		multiple: true,
		options: [
			{
				key: 'text',
				label: 'watermark text',
				type: 'text',
				placeholder: 'e.g. DRAFT',
				hint: 'stamped diagonally, semi-transparent, on every page',
				default: 'DRAFT'
			}
		],
		run: async (f, o, p) => (await import('./convert/pdf')).watermarkPdf(f, o, p)
	},
	{
		slug: 'add-page-numbers',
		name: 'add page numbers',
		short: 'number every page automatically',
		description:
			'stamp “1 / 12” style page numbers on every page of a PDF. pick bottom-center or bottom-right. done in seconds.',
		category: 'pdf',
		accept: ['.pdf'],
		acceptAttr: '.pdf,application/pdf',
		multiple: true,
		options: [
			{
				key: 'position',
				label: 'position',
				type: 'select',
				choices: [
					{ value: 'bottom-center', label: 'bottom center' },
					{ value: 'bottom-right', label: 'bottom right' }
				],
				default: 'bottom-center'
			}
		],
		run: async (f, o, p) => (await import('./convert/pdf')).addPageNumbers(f, o, p)
	},

	// ---------- more images ----------
	{
		slug: 'image-converter',
		name: 'any image converter',
		short: 'anything in, your pick out',
		description:
			'convert between PNG, JPG, WEBP, GIF, BMP, AVIF, HEIC, SVG and TIFF in one place. pick the output, set the quality, done. all on your device.',
		category: 'image',
		accept: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif', '.heic', '.heif', '.svg', '.tif', '.tiff'],
		acceptAttr: '.png,.jpg,.jpeg,.webp,.gif,.bmp,.avif,.heic,.heif,.svg,.tif,.tiff,image/*',
		multiple: true,
		options: [
			{
				key: 'format',
				label: 'output format',
				type: 'select',
				choices: [
					{ value: 'png', label: 'PNG (lossless)' },
					{ value: 'jpg', label: 'JPG (small, universal)' },
					{ value: 'webp', label: 'WEBP (small, modern)' }
				],
				default: 'png'
			},
			{ key: 'quality', label: 'quality', type: 'range', min: 0.5, max: 1, step: 0.05, default: 0.9 }
		],
		run: async (f, o, p) => {
			const m = await import('./convert/image');
			const t = o.format === 'jpg' ? 'image/jpeg' : o.format === 'webp' ? 'image/webp' : 'image/png';
			return m.convertImages(f, t as import('./convert/image').RasterTarget, o, p);
		}
	},
	{
		slug: 'tiff-to-png',
		name: 'TIFF to PNG',
		short: 'scanner files → normal images',
		description:
			'convert TIFF scans and exports to PNG or JPG in your browser. multi-page TIFFs become one image per page. nothing is uploaded.',
		category: 'image',
		accept: ['.tif', '.tiff'],
		acceptAttr: '.tif,.tiff,image/tiff',
		multiple: true,
		options: [
			{
				key: 'format',
				label: 'image format',
				type: 'select',
				choices: [
					{ value: 'png', label: 'PNG (lossless)' },
					{ value: 'jpg', label: 'JPG (smaller)' }
				],
				default: 'png'
			}
		],
		run: async (f, o, p) => (await import('./convert/tiff')).tiffToImages(f, o, p)
	},
	{
		slug: 'png-to-ico',
		name: 'PNG to ICO',
		short: 'any image → favicon.ico',
		description:
			'make a real favicon.ico from any PNG, JPG or SVG. bundles 16, 32 and 48 pixel versions into one file, built byte by byte in your browser.',
		category: 'image',
		accept: ['.png', '.jpg', '.jpeg', '.svg'],
		acceptAttr: '.png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/ico')).imagesToIco(f, o, p)
	},

	// ---------- more media ----------
	{
		slug: 'audio-converter',
		name: 'audio converter',
		short: 'FLAC/OGG/OPUS → MP3 or WAV',
		description:
			'convert FLAC, OGG, OPUS, M4A, AIFF and other audio to MP3 or WAV with FFmpeg compiled to WebAssembly. private, local, free.',
		category: 'media',
		accept: ['.flac', '.ogg', '.opus', '.m4a', '.aac', '.wav', '.aiff', '.wma'],
		acceptAttr: '.flac,.ogg,.opus,.m4a,.aac,.wav,.aiff,.wma,audio/*',
		multiple: true,
		heavy: true,
		options: [
			{
				key: 'format',
				label: 'output format',
				type: 'select',
				choices: [
					{ value: 'mp3', label: 'MP3 (small, universal)' },
					{ value: 'wav', label: 'WAV (uncompressed)' }
				],
				default: 'mp3'
			},
			{
				key: 'bitrate',
				label: 'MP3 bitrate',
				type: 'select',
				choices: [
					{ value: '128', label: '128 kbps' },
					{ value: '192', label: '192 kbps (recommended)' },
					{ value: '320', label: '320 kbps' }
				],
				default: '192'
			}
		],
		run: async (f, o, p) =>
			(await import('./convert/media')).extractAudio(f, o.format === 'wav' ? 'wav' : 'mp3', o, p)
	},
	{
		slug: 'subtitle-convert',
		name: 'SRT ↔ VTT',
		short: 'subtitles, both directions',
		description:
			'convert SRT subtitles to WebVTT and back, instantly. drop either kind and get the other. pure text transformation on your device.',
		category: 'media',
		accept: ['.srt', '.vtt'],
		acceptAttr: '.srt,.vtt,text/vtt',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/subs')).convertSubs(f, o, p)
	},

	// ---------- 3d models ----------
	{
		slug: 'fbx-to-glb',
		name: 'FBX to GLB',
		short: 'autodesk models → modern glTF',
		description:
			'convert FBX models to GLB (binary glTF) right in your browser using three.js. no autodesk tools, no upload, no waiting on an export queue.',
		category: '3d',
		accept: ['.fbx'],
		acceptAttr: '.fbx',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/model3d')).modelsToGlb(f, o, p)
	},
	{
		slug: 'obj-to-glb',
		name: 'OBJ to GLB',
		short: 'classic meshes → modern glTF',
		description:
			'convert OBJ meshes to GLB (binary glTF) locally with three.js. perfect for getting older models into modern engines and web viewers.',
		category: '3d',
		accept: ['.obj'],
		acceptAttr: '.obj',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/model3d')).modelsToGlb(f, o, p)
	},
	{
		slug: 'stl-to-glb',
		name: 'STL to GLB',
		short: 'print files → shareable glTF',
		description:
			'convert STL files to GLB (binary glTF) on your device. handy for previewing and sharing print models on the web.',
		category: '3d',
		accept: ['.stl'],
		acceptAttr: '.stl,model/stl',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/model3d')).modelsToGlb(f, o, p)
	},
	{
		slug: 'model-to-stl',
		name: '3D model to STL',
		short: 'FBX/OBJ/GLB → printable STL',
		description:
			'turn FBX, OBJ, GLB or glTF models into binary STL for 3D printing. parsed and exported entirely in your browser.',
		category: '3d',
		accept: ['.fbx', '.obj', '.glb', '.gltf'],
		acceptAttr: '.fbx,.obj,.glb,.gltf,model/gltf-binary',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/model3d')).modelsToStl(f, o, p)
	},

	// ---------- docs, data & archives ----------
	{
		slug: 'extract-archive',
		name: 'archive extractor',
		short: 'RAR, 7Z, TAR.GZ → your files',
		description:
			'open RAR, 7Z, TAR, TAR.GZ and ZIP archives without installing anything. libarchive compiled to WebAssembly unpacks them on your device, folder structure intact.',
		category: 'docs',
		accept: ['.rar', '.7z', '.tar', '.gz', '.tgz', '.bz2', '.xz', '.zip'],
		acceptAttr: '.rar,.7z,.tar,.gz,.tgz,.bz2,.xz,.zip',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/archive')).extractArchives(f, o, p)
	},
	{
		slug: 'docx-to-html',
		name: 'DOCX to HTML',
		short: 'word docs → html, md or text',
		description:
			'convert Word documents to clean HTML, markdown or plain text without Word. mammoth.js reads the docx right in your browser.',
		category: 'docs',
		accept: ['.docx'],
		acceptAttr: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		multiple: true,
		options: [
			{
				key: 'format',
				label: 'output format',
				type: 'select',
				choices: [
					{ value: 'html', label: 'HTML' },
					{ value: 'markdown', label: 'markdown' },
					{ value: 'text', label: 'plain text' }
				],
				default: 'html'
			}
		],
		run: async (f, o, p) => (await import('./convert/docs')).docxConvert(f, o, p)
	},
	{
		slug: 'xlsx-to-csv',
		name: 'XLSX to CSV',
		short: 'spreadsheets → plain data',
		description:
			'convert Excel spreadsheets to CSV without Excel. every sheet becomes its own CSV file, parsed locally by SheetJS.',
		category: 'docs',
		accept: ['.xlsx', '.xlsm', '.xls'],
		acceptAttr: '.xlsx,.xlsm,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		multiple: true,
		options: [],
		run: async (f, o, p) => (await import('./convert/docs')).xlsxToCsv(f, o, p)
	}
];

export const categories: { id: Category; name: string; blurb: string }[] = [
	{ id: 'image', name: 'images', blurb: 'decoded and re-encoded with your browser’s own codecs + libheif WASM.' },
	{ id: 'media', name: 'video & audio', blurb: 'FFmpeg compiled to WebAssembly, running in a Web Worker.' },
	{ id: 'pdf', name: 'PDF', blurb: 'merge, split, rotate, watermark, number and fully re-edit pages. pdf-lib and Mozilla pdf.js, entirely client-side.' },
	{ id: '3d', name: '3d models', blurb: 'FBX, OBJ, STL and GLB, parsed by three.js in your browser. no license servers, no export queues.' },
	{ id: 'docs', name: 'docs, data & archives', blurb: 'the "why does this need special software" pile. mammoth, SheetJS and libarchive, all local.' }
];

export function toolBySlug(slug: string): ToolDef | undefined {
	return tools.find((t) => t.slug === slug);
}

/** Best-guess tool for files dropped on the landing page. */
export function detectTool(files: File[]): ToolDef | undefined {
	const exts = files.map((f) => (/\.([^.]+)$/.exec(f.name)?.[1] ?? '').toLowerCase());
	const all = (...ok: string[]) => exts.every((e) => ok.includes(e));
	if (all('pdf')) return toolBySlug(files.length > 1 ? 'merge-pdf' : 'split-pdf');
	if (all('heic', 'heif')) return toolBySlug('heic-to-jpg');
	if (all('webp')) return toolBySlug('webp-to-png');
	if (all('svg')) return toolBySlug('svg-optimizer');
	if (all('png')) return toolBySlug('png-to-webp');
	if (all('jpg', 'jpeg')) return toolBySlug('jpg-to-webp');
	if (all('tif', 'tiff')) return toolBySlug('tiff-to-png');
	if (all('gif', 'bmp', 'avif')) return toolBySlug('image-converter');
	if (all('fbx')) return toolBySlug('fbx-to-glb');
	if (all('obj')) return toolBySlug('obj-to-glb');
	if (all('stl')) return toolBySlug('stl-to-glb');
	if (all('glb', 'gltf')) return toolBySlug('model-to-stl');
	if (all('rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'xz', 'zip')) return toolBySlug('extract-archive');
	if (all('docx')) return toolBySlug('docx-to-html');
	if (all('xlsx', 'xlsm', 'xls')) return toolBySlug('xlsx-to-csv');
	if (all('srt', 'vtt')) return toolBySlug('subtitle-convert');
	if (all('flac', 'ogg', 'opus', 'm4a', 'aac', 'aiff', 'wma')) return toolBySlug('audio-converter');
	if (all('mov')) return toolBySlug('mov-to-mp4');
	if (all('mp4', 'webm', 'mkv', 'm4v', 'avi', 'mov')) return toolBySlug('mp4-to-mp3');
	if (all('jpg', 'jpeg', 'png', 'webp', 'heic', 'heif')) return toolBySlug('images-to-pdf');
	return undefined;
}
