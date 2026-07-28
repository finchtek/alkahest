/** Central site configuration. edit these values to rebrand or rewire links. */
export const SITE = {
	name: 'Alkahest',
	byline: 'by FinchTek',
	tagline: 'Transmute your files. Zero uploads.',
	description:
		'Alkahest by FinchTek. Free in-browser file converter and PDF editor. HEIC to JPG, WEBP to PNG, MP4 to MP3, merge, split, rotate and edit PDFs. 100% on your device via WebAssembly. No uploads, no ads, no tracking.',
	/** Your tip jar. Shown in the success modal and footer. */
	tipUrl: 'https://ko-fi.com/finchtek',
	tipLabel: 'Toss a coin · Ko-fi',
	/** Set this to your repository once you push to GitHub. */
	github: 'https://github.com/finchtek/alkahest',
	/** Canonical origin used for SEO tags & sitemap. Update after deploy. */
	origin: 'https://alkahest.finchtek.org'
} as const;
