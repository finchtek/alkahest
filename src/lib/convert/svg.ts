import type { ConvertResult, ProgressFn } from '$lib/types';

export async function optimizeSvgs(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const { optimize } = await import('svgo/browser');
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `Optimizing ${f.name} (${i + 1}/${files.length})` });
		const text = await f.text();
		const res = optimize(text, { multipass: true });
		results.push({
			name: f.name.replace(/\.svg$/i, '.min.svg'),
			blob: new Blob([res.data], { type: 'image/svg+xml' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
