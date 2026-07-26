import type { ConvertResult, ProgressFn } from '$lib/types';

/** Bundles any files the user drops into a single ZIP, built client-side with fflate. */
export async function filesToZip(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { zip } = await import('fflate');
	progress({ ratio: -1, label: `packing ${files.length} files…` });
	const entries: Record<string, Uint8Array> = {};
	const seen = new Set<string>();
	for (const f of files) {
		let name = f.name;
		let i = 2;
		while (seen.has(name)) {
			name = f.name.replace(/(\.[^.]+)?$/, (ext) => `-${i}${ext ?? ''}`);
			i++;
		}
		seen.add(name);
		entries[name] = new Uint8Array(await f.arrayBuffer());
	}
	const blob = await new Promise<Blob>((resolve, reject) => {
		zip(entries, { level: 6 }, (err, data) =>
			err ? reject(err) : resolve(new Blob([data as unknown as BlobPart], { type: 'application/zip' }))
		);
	});
	progress({ ratio: 1 });
	return [{ name: 'archive.zip', blob }];
}
