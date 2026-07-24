export function formatBytes(n: number): string {
	if (!Number.isFinite(n) || n < 0) return 'n/a';
	if (n < 1024) return `${n} B`;
	const units = ['KB', 'MB', 'GB'];
	let v = n;
	let u = -1;
	do {
		v /= 1024;
		u++;
	} while (v >= 1024 && u < units.length - 1);
	return `${v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v)} ${units[u]}`;
}

export function formatDuration(ms: number): string {
	if (ms < 1000) return `${(ms / 1000).toFixed(2)}s`;
	if (ms < 10_000) return `${(ms / 1000).toFixed(1)}s`;
	return `${Math.round(ms / 1000)}s`;
}

export function extOf(name: string): string {
	const m = /\.([^.]+)$/.exec(name);
	return m ? m[1].toLowerCase() : '';
}

export function replaceExt(name: string, ext: string): string {
	const base = name.replace(/\.[^.]+$/, '');
	return `${base}.${ext}`;
}
