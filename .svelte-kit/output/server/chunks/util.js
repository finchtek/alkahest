//#region src/lib/util.ts
function formatBytes(n) {
	if (!Number.isFinite(n) || n < 0) return "n/a";
	if (n < 1024) return `${n} B`;
	const units = [
		"KB",
		"MB",
		"GB"
	];
	let v = n;
	let u = -1;
	do {
		v /= 1024;
		u++;
	} while (v >= 1024 && u < units.length - 1);
	return `${v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v)} ${units[u]}`;
}
function formatDuration(ms) {
	if (ms < 1e3) return `${(ms / 1e3).toFixed(2)}s`;
	if (ms < 1e4) return `${(ms / 1e3).toFixed(1)}s`;
	return `${Math.round(ms / 1e3)}s`;
}
function extOf(name) {
	const m = /\.([^.]+)$/.exec(name);
	return m ? m[1].toLowerCase() : "";
}
function replaceExt(name, ext) {
	return `${name.replace(/\.[^.]+$/, "")}.${ext}`;
}
//#endregion
export { replaceExt as i, formatBytes as n, formatDuration as r, extOf as t };
