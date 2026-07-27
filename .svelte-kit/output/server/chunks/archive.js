//#region src/lib/convert/archive.ts
var initialized = false;
function flatten(node, prefix, out, from) {
	for (const [key, value] of Object.entries(node)) if (value instanceof File) out.push({
		name: prefix + key,
		blob: value,
		from
	});
	else if (value && typeof value === "object") flatten(value, `${prefix}${key}/`, out, from);
}
/**
* Opens RAR, 7Z, TAR(.GZ/.BZ2/.XZ) and ZIP archives with libarchive compiled
* to WebAssembly and hands every contained file back individually. Folder
* structure is preserved in the file names, so "download all" rebuilds it.
*/
async function extractArchives(files, _opts, progress) {
	const { Archive } = await import("libarchive.js");
	if (!initialized) {
		Archive.init({ workerUrl: "/vendor/libarchive/worker-bundle.js" });
		initialized = true;
	}
	const results = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({
			ratio: i / files.length,
			label: `unsealing ${f.name} (${i + 1}/${files.length})`
		});
		const archive = await Archive.open(f);
		try {
			if (await archive.hasEncryptedData()) throw new Error(`${f.name} is password-protected. encrypted archives aren't supported yet.`);
		} catch (err) {
			if (err instanceof Error && err.message.includes("password")) throw err;
		}
		flatten(await archive.extractFiles(), "", results, f.name);
		await archive.close?.();
	}
	if (!results.length) throw new Error("the archive appears to be empty");
	progress({ ratio: 1 });
	return results;
}
//#endregion
export { extractArchives };
