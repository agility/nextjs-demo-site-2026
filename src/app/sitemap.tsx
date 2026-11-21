import { getSitemapFlat } from "@/lib/cms/getSitemapFlat";
import { locales } from "@/lib/i18n/config";
import { localizeUrl } from "@/lib/i18n/localizeUrl";
import { toPublicPath } from "@/lib/cms/homePage";
import type { MetadataRoute } from "next";

/**
 * Demo Site Sitemap
 *
 * Every Agility CMS page for every configured locale, generated via getSitemapFlat().
 * For the default locale, paths have no prefix; other locales are prefixed with /{locale}.
 * Folder nodes, redirects, and pages hidden from the sitemap are excluded.
 *
 * The site's own /docs pages moved to https://agilitycms.com/docs/nextjs (Joel,
 * 2026-11-20); /docs now redirects there (next.config.mjs), so they aren't listed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.SITE_URL || "https://demo.agilitycms.com";

	// Sitemap entries from Agility CMS pages, for each locale.
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
					// The home node is served at the root ("/", "/fr"), not at its own
					// sitemap path. For the default locale, don't add a locale prefix.
					const publicPath = toPublicPath(path, flatSitemap);
					const localizedPath = localizeUrl(publicPath, locale);
					const isHome = publicPath === "/";

					return {
						url: localizedPath === "/" ? baseUrl : `${baseUrl}${localizedPath}`,
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

	return cmsEntries;
}
