import { i as replaceExt } from "./util.js";
//#region src/lib/convert/docs.ts
/** DOCX → clean HTML, markdown or plain text. Word not required. */
async function docxConvert(files, opts, progress) {
	const mammoth = (await import("mammoth")).default ?? await import("mammoth");
	const target = String(opts.format ?? "html");
	const results = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({
			ratio: i / files.length,
			label: `reading ${f.name} (${i + 1}/${files.length})`
		});
		const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await f.arrayBuffer() });
		let out;
		let ext;
		let mime;
		if (target === "markdown") {
			const TurndownService = (await import("turndown")).default;
			out = new TurndownService({
				headingStyle: "atx",
				codeBlockStyle: "fenced"
			}).turndown(html);
			ext = "md";
			mime = "text/markdown";
		} else if (target === "text") {
			const doc = new DOMParser().parseFromString(html, "text/html");
			doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, br").forEach((el) => el.append("\n"));
			out = (doc.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim() + "\n";
			ext = "txt";
			mime = "text/plain";
		} else {
			out = `<!doctype html>\n<html><head><meta charset="utf-8"><title>${f.name}</title></head><body>\n${html}\n</body></html>\n`;
			ext = "html";
			mime = "text/html";
		}
		results.push({
			name: replaceExt(f.name, ext),
			blob: new Blob([out], { type: mime }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
/** XLSX/XLS → CSV, one file per sheet. Excel not required either. */
async function xlsxToCsv(files, _opts, progress) {
	const XLSX = await import("xlsx");
	const results = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({
			ratio: i / files.length,
			label: `reading ${f.name} (${i + 1}/${files.length})`
		});
		const wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
		if (!wb.SheetNames.length) throw new Error(`no sheets found in ${f.name}`);
		const base = f.name.replace(/\.(xlsx|xlsm|xls)$/i, "");
		for (const sheetName of wb.SheetNames) {
			const csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
			const name = wb.SheetNames.length > 1 ? `${base}-${sheetName.replace(/[^\w-]+/g, "_")}.csv` : `${base}.csv`;
			results.push({
				name,
				blob: new Blob([csv], { type: "text/csv" }),
				from: f.name
			});
		}
	}
	progress({ ratio: 1 });
	return results;
}
//#endregion
export { docxConvert, xlsxToCsv };
