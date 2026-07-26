import type { ConvertResult, ProgressFn } from '$lib/types';

export interface ExifFinding {
	fileName: string;
	fileSize: number;
	hasMetadata: boolean;
	make?: string;
	model?: string;
	software?: string;
	lens?: string;
	dateTaken?: string;
	artist?: string;
	description?: string;
	gps?: { lat: number; lon: number };
	/** every raw tag exifr found, for the "show everything" expand */
	raw: Record<string, unknown>;
}

/** Reads the metadata out of a photo without stripping anything. Read-only preview. */
export async function readExifFindings(file: File): Promise<ExifFinding> {
	const base: ExifFinding = {
		fileName: file.name,
		fileSize: file.size,
		hasMetadata: false,
		raw: {}
	};
	try {
		const exifr = await import('exifr');
		const tags = await exifr.parse(file, {
			tiff: true,
			exif: true,
			gps: true,
			iptc: true,
			xmp: false,
			ifd1: false
		});
		if (!tags) return base;
		const gps =
			typeof tags.latitude === 'number' && typeof tags.longitude === 'number'
				? { lat: tags.latitude, lon: tags.longitude }
				: undefined;
		const dateTaken: Date | string | undefined = tags.DateTimeOriginal ?? tags.CreateDate ?? tags.ModifyDate;
		return {
			...base,
			hasMetadata: Object.keys(tags).length > 0,
			make: tags.Make,
			model: tags.Model,
			software: tags.Software,
			lens: tags.LensModel ?? tags.LensMake,
			dateTaken: dateTaken instanceof Date ? dateTaken.toLocaleString() : dateTaken,
			artist: tags.Artist,
			description: tags.ImageDescription ?? tags.Description,
			gps,
			raw: tags
		};
	} catch {
		// unparsable / no metadata segment at all — that's fine, it just means clean
		return base;
	}
}

/**
 * Losslessly strips EXIF/IPTC/XMP/comment segments from a JPEG by walking its
 * marker structure and dropping APP1 (EXIF + XMP), APP13 (Photoshop/IPTC) and
 * COM segments, byte for byte — no re-encoding, no quality loss whatsoever.
 * Once the scan (SOS) marker is hit, the remainder of the file is copied
 * through untouched (compressed image data can't be safely marker-parsed).
 */
function stripJpegMarkers(bytes: Uint8Array): Uint8Array {
	if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
		throw new Error('not a valid JPEG (missing SOI marker)');
	}
	const out: number[] = [0xff, 0xd8];
	let i = 2;
	const DROP = new Set([0xe1, 0xed, 0xfe]); // APP1 (EXIF/XMP), APP13 (IPTC), COM
	while (i < bytes.length - 1) {
		if (bytes[i] !== 0xff) {
			// shouldn't happen between markers; bail safely by copying the rest
			for (let k = i; k < bytes.length; k++) out.push(bytes[k]);
			break;
		}
		const marker = bytes[i + 1];
		// standalone markers with no length/payload
		if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
			out.push(0xff, marker);
			i += 2;
			continue;
		}
		if (marker === 0xda) {
			// start of scan: copy its header, then everything else verbatim to EOF
			const len = (bytes[i + 2] << 8) | bytes[i + 3];
			for (let k = i; k < i + 2 + len; k++) out.push(bytes[k]);
			for (let k = i + 2 + len; k < bytes.length; k++) out.push(bytes[k]);
			break;
		}
		const len = (bytes[i + 2] << 8) | bytes[i + 3];
		if (!DROP.has(marker)) {
			for (let k = i; k < i + 2 + len; k++) out.push(bytes[k]);
		}
		i += 2 + len;
	}
	return new Uint8Array(out);
}

function isJpeg(file: File): boolean {
	return /\.jpe?g$/i.test(file.name) || file.type === 'image/jpeg';
}

/**
 * Strips identifying metadata from photos. JPEGs are stripped byte-for-byte
 * (zero quality loss). Other raster formats are redrawn through a canvas,
 * which drops all metadata as a side effect of re-encoding.
 */
export async function stripMetadata(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `scrubbing ${f.name} (${i + 1}/${files.length})` });
		if (isJpeg(f)) {
			const bytes = new Uint8Array(await f.arrayBuffer());
			const stripped = stripJpegMarkers(bytes);
			results.push({
				name: f.name.replace(/(\.jpe?g)$/i, '-scrubbed$1'),
				blob: new Blob([stripped as unknown as BlobPart], { type: 'image/jpeg' }),
				from: f.name
			});
		} else {
			// PNG/WEBP/etc: redraw via canvas. this silently drops all metadata,
			// including any eXIf/tEXt chunks, at the cost of one re-encode.
			const { convertImages } = await import('./image');
			const targetType = f.type === 'image/webp' ? 'image/webp' : 'image/png';
			const [converted] = await convertImages([f], targetType, { quality: 0.95 }, () => {});
			results.push({ ...converted, name: converted.name.replace(/(\.[^.]+)$/, '-scrubbed$1') });
		}
	}
	progress({ ratio: 1 });
	return results;
}
