import { o as tools } from "../../../chunks/registry.js";
import { t as SITE } from "../../../chunks/site.js";
//#region src/routes/sitemap.xml/+server.ts
var prerender = true;
function GET() {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
		"",
		"/open-source",
		...tools.map((t) => `/${t.slug}`)
	].map((p) => `\t<url><loc>${SITE.origin}${p}</loc></url>`).join("\n")}
</urlset>
`;
	return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
//#endregion
export { GET, prerender };
