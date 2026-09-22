import { getSitemapFlat } from "@/lib/cms/getSitemapFlat";
import { getAllDocFiles } from "@/lib/docs/getDocsFiles";
import { locales, defaultLocale } from "@/lib/i18n/config";
import type { MetadataRoute } from "next";
import fs from "node:fs";

/**
 * Real modification time of a docs markdown file.
 *
 * Docs ship with the repo, so the file mtime is an honest `<lastmod>` — and,
 * unlike `new Date()`, it is a stable value that `cacheComponents` is happy to
 * prerender. Returns undefined if the file cannot be stat'd, which just omits
 * the date for that entry.
 */
const fileModified = (filePath: string): Date | undefined => {
	try {
		return fs.statSync(filePath).mtime
	} catch {
		return undefined
	}
}

/**
 * Demo Site Sitemap
 *
 * This sitemap now covers BOTH:
 * - All Agility CMS pages for every configured locale, generated via getSitemapFlat().
 *   For the default locale, paths have no prefix; other locales are prefixed with /{locale}.
 *   Folder nodes, redirects, and pages hidden from the sitemap are excluded.
 * - The demo-site-specific /docs pages (generated from the local markdown files).
 *
 * Note: the /docs section is specific to this demo site. In a real Agility CMS site
 * the CMS pages portion (getSitemapFlat) would typically be the whole sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.SITE_URL || "https://demo.agilitycms.com";

	// (a) Generate sitemap entries from Agility CMS pages, for each locale.
	const cmsEntries: MetadataRoute.Sitemap = [];

	for (const locale of locales) {
		try {
			const flatSitemap = await getSitemapFlat({
				channelName: process.env.AGILITY_SITEMAP || "website",
				languageCode: locale,
			});

			if (!flatSitemap) continue;

			const localeEntries = Object.keys(flatSitemap)
				.filter((path) => {
					const node = flatSitemap[path];
					if (node.isFolder || node.redirect) {
						return false;
					}
					if (!node.visible?.sitemap) {
						return false;
					}
					return true;
				})
				.map((path) => {
					// For the default locale, don't add a locale prefix to the URL.
					const localizedPath =
						locale === defaultLocale ? path : `/${locale}${path}`;
					const isHome = path === "/";

					return {
						url: isHome ? baseUrl : `${baseUrl}${localizedPath}`,
						// No lastModified. It used to be `new Date()`, which claimed every
						// page changed on every build — search engines learn to ignore a
						// lastmod that always says "now", so it was worse than useless. It
						// is also an unstable value, which `cacheComponents` refuses to
						// prerender. Real per-page dates need each node's `modified` field
						// from the CMS; until that exists, omitting beats lying.
						changeFrequency: "daily" as const,
						priority: isHome ? 1 : 0.8,
					};
				});

			cmsEntries.push(...localeEntries);
		} catch (error) {
			// Guard each locale fetch so one failure doesn't break the whole sitemap.
			console.error(`Failed to build sitemap for locale "${locale}":`, error);
		}
	}

	// (b) Generate sitemap entries for documentation pages.
	const docsEntries: MetadataRoute.Sitemap = [];
	const addedPaths = new Set<string>();

	// This is demo-site-specific - in a real site, you'd generate from Agility CMS pages
	const docFiles = getAllDocFiles();

	docFiles.forEach((file) => {
		const isReadme = file.slug[file.slug.length - 1] === 'README';

		if (isReadme) {
			// Skip root README (docs/README.md) - it's handled by the explicit docs index entry below
			if (file.slug.length === 1 && file.slug[0] === 'README') {
				return;
			}

			// For README files, add the folder path (without README)
			const folderPath = file.slug.slice(0, -1).join('/');
			if (folderPath && !addedPaths.has(folderPath)) {
				docsEntries.push({
					url: `${baseUrl}/docs/${folderPath}`,
					lastModified: fileModified(file.filePath),
					changeFrequency: "weekly" as const,
					priority: 0.8
				});
				addedPaths.add(folderPath);
			}
		} else {
			// For regular files, add the file path
			const filePath = file.slug.join('/');
			if (filePath && !addedPaths.has(filePath)) {
				docsEntries.push({
					url: `${baseUrl}/docs/${filePath}`,
					lastModified: fileModified(file.filePath),
					changeFrequency: "weekly" as const,
					priority: 0.8
				});
				addedPaths.add(filePath);
			}
		}
	});

	// Add docs index page
	docsEntries.unshift({
		url: `${baseUrl}/docs`,
		// newest doc wins for the index page
		lastModified: docFiles.reduce<Date | undefined>((newest, f) => {
			const m = fileModified(f.filePath)
			return !newest || (m && m > newest) ? m : newest
		}, undefined),
		changeFrequency: "weekly" as const,
		priority: 0.9
	});

	// Merge CMS page entries with the demo /docs entries.
	return [...cmsEntries, ...docsEntries];
}
