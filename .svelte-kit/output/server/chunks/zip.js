//#region src/lib/convert/zip.ts
/** Bundles any files the user drops into a single ZIP, built client-side with fflate. */
async function filesToZip(files, _opts, progress) {
	const { zip } = await import("fflate");
	progress({
		ratio: -1,
		label: `packing ${files.length} files…`
	});
	const entries = {};
	const seen = /* @__PURE__ */ new Set();
	for (const f of files) {
		let name = f.name;
		let i = 2;
		while (seen.has(name)) {
			name = f.name.replace(/(\.[^.]+)?$/, (ext) => `-${i}${ext ?? ""}`);
			i++;
		}
		seen.add(name);
		entries[name] = new Uint8Array(await f.arrayBuffer());
	}
	const blob = await new Promise((resolve, reject) => {
		zip(entries, { level: 6 }, (err, data) => err ? reject(err) : resolve(new Blob([data], { type: "application/zip" })));
	});
	progress({ ratio: 1 });
	return [{
		name: "archive.zip",
		blob
	}];
}
//#endregion
export { filesToZip };
