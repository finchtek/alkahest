import { i as replaceExt } from "./util.js";
//#region src/lib/convert/html.ts
/** Any HTML file → clean Markdown, using the same turndown engine the DOCX tool uses. */
async function htmlToMarkdown(files, _opts, progress) {
	const TurndownService = (await import("turndown")).default;
	const turndown = new TurndownService({
		headingStyle: "atx",
		codeBlockStyle: "fenced"
	});
	const results = [];
	for (let i = 0; i < files.length; i++) {
		const f = files[i];
		progress({
			ratio: i / files.length,
			label: `converting ${f.name} (${i + 1}/${files.length})`
		});
		const html = await f.text();
		const md = turndown.turndown(html);
		results.push({
			name: replaceExt(f.name, "md"),
			blob: new Blob([md], { type: "text/markdown" }),
			from: f.name
		});
	}
	progress({ ratio: 1 });
	return results;
}
//#endregion
export { htmlToMarkdown };
