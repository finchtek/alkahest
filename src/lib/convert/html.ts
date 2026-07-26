import type { ConvertResult, ProgressFn } from '$lib/types';
import { replaceExt } from '$lib/util';

/** Any HTML file → clean Markdown, using the same turndown engine the DOCX tool uses. */
export async function htmlToMarkdown(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const TurndownService = (await import('turndown')).default;
	const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `converting ${f.name} (${i + 1}/${files.length})` });
		const html = await f.text();
		const md = turndown.turndown(html);
		results.push({
			name: replaceExt(f.name, 'md'),
			blob: new Blob([md], { type: 'text/markdown' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
