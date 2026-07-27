//#region src/lib/convert/exif.ts
/** Reads the metadata out of a photo without stripping anything. Read-only preview. */
async function readExifFindings(file) {
	const base = {
		fileName: file.name,
		fileSize: file.size,
		hasMetadata: false,
		raw: {}
	};
	try {
		const tags = await (await import("exifr")).parse(file, {
			tiff: true,
			exif: true,
			gps: true,
			iptc: true,
			xmp: false,
			ifd1: false
		});
		if (!tags) return base;
		const gps = typeof tags.latitude === "number" && typeof tags.longitude === "number" ? {
			lat: tags.latitude,
			lon: tags.longitude
		} : void 0;
		const dateTaken = tags.DateTimeOriginal ?? tags.CreateDate ?? tags.ModifyDate;
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
		return base;
	}
}
//#endregion
export { readExifFindings };
