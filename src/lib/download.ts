import type { ConvertResult } from './types';

export function saveBlob(name: string, blob: Blob): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Bundle multiple results into one zip, built client-side with fflate. */
export async function zipResults(results: ConvertResult[]): Promise<Blob> {
	const { zip } = await import('fflate');
	const entries: Record<string, Uint8Array> = {};
	for (const r of results) {
		// avoid name collisions inside the archive
		let name = r.name;
		let i = 2;
		while (entries[name]) {
			if (/\.[^.]+$/.test(r.name)) {
				name = r.name.replace(/(\.[^.]+)$/, `-${i}$1`);
			} else {
				name = `${r.name}-${i}`;
			}
			i++;
		}
		entries[name] = new Uint8Array(await r.blob.arrayBuffer());
	}
	return new Promise<Blob>((resolve, reject) => {
		// outputs are already-compressed formats; store instead of deflating
		zip(entries, { level: 0 }, (err, data) =>
			err ? reject(err) : resolve(new Blob([data as unknown as BlobPart], { type: 'application/zip' }))
		);
	});
}
