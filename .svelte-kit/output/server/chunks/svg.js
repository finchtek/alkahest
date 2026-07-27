//#region src/lib/convert/svg.ts
async function optimizeSvgs(files, _opts, progress) {
	const { optimize } = await import("svgo/browser");
	const results = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({
			ratio: i / files.length,
			label: `Optimizing ${f.name} (${i + 1}/${files.length})`
		});
		const res = optimize(await f.text(), { multipass: true });
		results.push({
			name: f.name.replace(/\.svg$/i, ".min.svg"),
			blob: new Blob([res.data], { type: "image/svg+xml" }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
//#endregion
export { optimizeSvgs };
