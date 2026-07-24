import type { ConvertResult, ProgressFn } from '$lib/types';
import { replaceExt } from '$lib/util';

function vttTimeToSrt(t: string): string {
	const m = /^(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})$/.exec(t.trim());
	if (!m) return t.trim().replace('.', ',');
	return `${(m[1] ?? '0').padStart(2, '0')}:${m[2]}:${m[3]},${m[4]}`;
}

function srtToVtt(text: string): string {
	return 'WEBVTT\n\n' + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2').trim() + '\n';
}

function vttToSrt(text: string): string {
	const blocks = text
		.split(/\n{2,}/)
		.map((b) => b.trim())
		.filter(
			(b) =>
				b &&
				!b.startsWith('WEBVTT') &&
				!b.startsWith('NOTE') &&
				!b.startsWith('STYLE') &&
				!b.startsWith('REGION')
		);
	const cues: string[] = [];
	for (const block of blocks) {
		const lines = block.split('\n');
		const ti = lines.findIndex((l) => l.includes('-->'));
		if (ti < 0) continue;
		const [rawStart, rest] = lines[ti].split('-->');
		const rawEnd = rest.trim().split(/\s+/)[0]; // drop cue settings like align:start
		const body = lines
			.slice(ti + 1)
			.join('\n')
			.replace(/<\/?[cv][^>]*>/g, ''); // strip voice/class tags
		cues.push(`${cues.length + 1}\n${vttTimeToSrt(rawStart)} --> ${vttTimeToSrt(rawEnd)}\n${body}`);
	}
	if (!cues.length) throw new Error('no subtitle cues found');
	return cues.join('\n\n') + '\n';
}

/** SRT and VTT in either direction: drop one kind, receive the other. */
export async function convertSubs(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `rewriting ${f.name} (${i + 1}/${files.length})` });
		const text = (await f.text()).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
		const isVtt = /\.vtt$/i.test(f.name) || text.trimStart().startsWith('WEBVTT');
		const out = isVtt ? vttToSrt(text) : srtToVtt(text);
		results.push({
			name: replaceExt(f.name, isVtt ? 'srt' : 'vtt'),
			blob: new Blob([out], { type: 'text/plain' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
