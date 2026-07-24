import { tools } from '$lib/registry';
import { SITE } from '$lib/site';

export const prerender = true;

export function GET() {
	const paths = ['', '/open-source', ...tools.map((t) => `/${t.slug}`)];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `\t<url><loc>${SITE.origin}${p}</loc></url>`).join('\n')}
</urlset>
`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
