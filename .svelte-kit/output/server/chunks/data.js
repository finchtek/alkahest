import { i as replaceExt } from "./util.js";
//#region src/lib/convert/data.ts
/** RFC4180-ish CSV parser: handles quoted fields, escaped "" quotes, and commas/newlines inside quotes. */
function parseCsv(text) {
	const rows = [];
	let row = [];
	let field = "";
	let inQuotes = false;
	let i = 0;
	const n = text.length;
	while (i < n) {
		const c = text[i];
		if (inQuotes) {
			if (c === "\"") {
				if (text[i + 1] === "\"") {
					field += "\"";
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
		if (c === "\"") {
			inQuotes = true;
			i++;
			continue;
		}
		if (c === ",") {
			row.push(field);
			field = "";
			i++;
			continue;
		}
		if (c === "\r") {
			i++;
			continue;
		}
		if (c === "\n") {
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
			i++;
			continue;
		}
		field += c;
		i++;
	}
	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}
function csvField(value) {
	const s = value === null || value === void 0 ? "" : String(value);
	if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
	return s;
}
/** CSV → JSON: first row is treated as headers, every following row becomes one object. */
async function csvToJson(files, _opts, progress) {
	const results = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({
			ratio: i / files.length,
			label: `parsing ${f.name} (${i + 1}/${files.length})`
		});
		const rows = parseCsv(await f.text());
		if (!rows.length) throw new Error(`${f.name} has no rows`);
		const [header, ...body] = rows;
		const objects = body.map((r) => {
			const obj = {};
			header.forEach((h, idx) => obj[h || `column_${idx + 1}`] = r[idx] ?? "");
			return obj;
		});
		const json = JSON.stringify(objects, null, 2);
		results.push({
			name: replaceExt(f.name, "json"),
			blob: new Blob([json], { type: "application/json" }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
/** JSON → CSV: expects an array of flat objects (or arrays). Column set is the union of every key seen. */
async function jsonToCsv(files, _opts, progress) {
	const results = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({
			ratio: i / files.length,
			label: `parsing ${f.name} (${i + 1}/${files.length})`
		});
		let data;
		try {
			data = JSON.parse(await f.text());
		} catch {
			throw new Error(`${f.name} isn't valid JSON`);
		}
		const arr = Array.isArray(data) ? data : [data];
		if (!arr.length) throw new Error(`${f.name} has no records to convert`);
		let lines;
		if (arr.every((r) => Array.isArray(r))) lines = arr.map((r) => r.map(csvField).join(","));
		else {
			const columns = [];
			const seen = /* @__PURE__ */ new Set();
			for (const rec of arr) if (rec && typeof rec === "object") {
				for (const k of Object.keys(rec)) if (!seen.has(k)) {
					seen.add(k);
					columns.push(k);
				}
			}
			lines = [columns.map(csvField).join(",")];
			for (const rec of arr) {
				const row = columns.map((c) => csvField(rec?.[c]));
				lines.push(row.join(","));
			}
		}
		const csv = lines.join("\r\n") + "\r\n";
		results.push({
			name: replaceExt(f.name, "csv"),
			blob: new Blob([csv], { type: "text/csv" }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
//#endregion
export { csvToJson, jsonToCsv };
