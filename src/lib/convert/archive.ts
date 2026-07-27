import type { ConvertResult, ProgressFn } from '$lib/types';

let initialized = false;

function flatten(node: Record<string, unknown>, prefix: string, out: ConvertResult[], from: string) {
	for (const [key, value] of Object.entries(node)) {
		if (value instanceof File) {
			out.push({ name: prefix + key, blob: value, from });
		} else if (value && typeof value === 'object') {
			flatten(value as Record<string, unknown>, `${prefix}${key}/`, out, from);
		}
	}
}

/**
 * Opens RAR, 7Z, TAR(.GZ/.BZ2/.XZ) and ZIP archives with libarchive compiled
 * to WebAssembly and hands every contained file back individually. Folder
 * structure is preserved in the file names, so "download all" rebuilds it.
 */
export async function extractArchives(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { Archive } = await import('libarchive.js');
	if (!initialized) {
		Archive.init({ workerUrl: '/vendor/libarchive/worker-bundle.js' });
		initialized = true;
	}
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `unsealing ${f.name} (${i + 1}/${files.length})` });
		const archive = await Archive.open(f);
		try {
			try {
				if (await archive.hasEncryptedData()) {
					throw new Error(`${f.name} is password-protected. encrypted archives aren't supported yet.`);
				}
			} catch (err) {
				if (err instanceof Error && err.message.includes('password')) throw err;
				// hasEncryptedData can throw on some formats; carry on and try extraction
			}
			const tree = (await archive.extractFiles()) as Record<string, unknown>;
			flatten(tree, '', results, f.name);
		} finally {
			await archive.close?.();
		}
	}
	if (!results.length) throw new Error('the archive appears to be empty');
	progress({ ratio: 1 });
	return results;
}
