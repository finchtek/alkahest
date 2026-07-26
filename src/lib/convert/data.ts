import type { ConvertResult, ProgressFn } from '$lib/types';
import { replaceExt } from '$lib/util';

/** RFC4180-ish CSV parser: handles quoted fields, escaped "" quotes, and commas/newlines inside quotes. */
function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let inQuotes = false;
	let i = 0;
	const n = text.length;
	while (i < n) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			field += c;
			i++;
			continue;
		}
		if (c === '"') {
			inQuotes = true;
			i++;
			continue;
		}
		if (c === ',') {
			row.push(field);
			field = '';
			i++;
			continue;
		}
		if (c === '\r') {
			i++;
			continue;
		}
		if (c === '\n') {
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
			i++;
			continue;
		}
		field += c;
		i++;
	}
	// final field/row (files rarely end with a trailing newline)
	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

function csvField(value: unknown): string {
	const s = value === null || value === undefined ? '' : String(value);
	if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
	return s;
}

/** CSV → JSON: first row is treated as headers, every following row becomes one object. */
export async function csvToJson(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `parsing ${f.name} (${i + 1}/${files.length})` });
		const rows = parseCsv(await f.text());
		if (!rows.length) throw new Error(`${f.name} has no rows`);
		const [header, ...body] = rows;
		const objects = body.map((r) => {
			const obj: Record<string, string> = {};
			header.forEach((h, idx) => (obj[h || `column_${idx + 1}`] = r[idx] ?? ''));
			return obj;
		});
		const json = JSON.stringify(objects, null, 2);
		results.push({
			name: replaceExt(f.name, 'json'),
			blob: new Blob([json], { type: 'application/json' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}

/** JSON → CSV: expects an array of flat objects (or arrays). Column set is the union of every key seen. */
export async function jsonToCsv(
	files: File[],
	_opts: Record<string, string | number>,
	progress: ProgressFn
): Promise<ConvertResult[]> {
	const results: ConvertResult[] = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({ ratio: i / files.length, label: `parsing ${f.name} (${i + 1}/${files.length})` });
		let data: unknown;
		try {
			data = JSON.parse(await f.text());
		} catch {
			throw new Error(`${f.name} isn't valid JSON`);
		}
		const arr = Array.isArray(data) ? data : [data];
		if (!arr.length) throw new Error(`${f.name} has no records to convert`);
		let lines: string[];
		if (arr.every((r) => Array.isArray(r))) {
			lines = (arr as unknown[][]).map((r) => r.map(csvField).join(','));
		} else {
			const columns: string[] = [];
			const seen = new Set<string>();
			for (const rec of arr) {
				if (rec && typeof rec === 'object') {
					for (const k of Object.keys(rec as Record<string, unknown>)) {
						if (!seen.has(k)) {
							seen.add(k);
							columns.push(k);
						}
					}
				}
			}
			lines = [columns.map(csvField).join(',')];
			for (const rec of arr) {
				const row = columns.map((c) => csvField((rec as Record<string, unknown>)?.[c]));
				lines.push(row.join(','));
			}
		}
		const csv = lines.join('\r\n') + '\r\n';
		results.push({
			name: replaceExt(f.name, 'csv'),
			blob: new Blob([csv], { type: 'text/csv' }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
