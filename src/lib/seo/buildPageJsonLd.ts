import { buildJsonLd, type GeoSitemapFlat, type JsonLdDocument } from "@agility/geo"
import type { AgilityPageProps } from "@agility/nextjs"
import { localizeUrl } from "@/lib/i18n/localizeUrl"
import { defaultLocale, type Locale } from "@/lib/i18n/config"
import { toPublicPath } from "@/lib/cms/homePage"
import { contentModelMappings } from "./contentModelMappings"

interface BuildPageJsonLdInput {
	agilityData: AgilityPageProps
	sitemap: GeoSitemapFlat
	locale: Locale
	siteName: string
	logoUrl?: string
}

/**
 * ONE schema.org `@graph` for the page, built by `@agility/geo`:
 *
 * 1. Organization and WebSite (site-wide, stable `@id`s; see ./schema.ts).
 * 2. The WebPage, typed by the GEO tab's Page Type, plus a BreadcrumbList.
 * 3. The JSON-LD the editor typed into the GEO tab (the page's, or on a dynamic
 *    page the item's own), merged in by `@id`.
 * 4. Our content model mappings (./contentModelMappings.ts) through `transform`:
 *    on a blog post, the Post item becomes a BlogPosting.
 *
 * Components that need their own block (FAQ, pricing) reference these nodes by
 * `@id`, so a crawler still resolves everything into one entity graph.
 */
export function buildPageJsonLd({ agilityData, sitemap, locale, siteName, logoUrl }: BuildPageJsonLdInput): JsonLdDocument | null {
	const { page, dynamicPageItem, sitemapNode } = agilityData
	if (!page || !sitemapNode) return null

	const siteUrl = process.env.SITE_URL || "https://demo.agilitycms.com"
	// Public URLs carry a locale prefix for non-default locales; the sitemap paths don't.
	// The home node is served at the root, so its public path is "/" (see lib/cms/homePage.ts).
	const localeBase = locale === defaultLocale ? siteUrl : `${siteUrl}/${locale}`
	const publicPath = toPublicPath(sitemapNode.path, sitemap)
	const url = siteUrl + localizeUrl(publicPath, locale)

	return buildJsonLd({
		page,
		item: dynamicPageItem,
		sitemap,
		url,
		path: publicPath,
		isHome: publicPath === "/",
		baseUrl: localeBase,
		locale,
		siteSettings: {
			organization: { name: siteName, url: siteUrl, logo: logoUrl },
			website: { name: siteName, url: siteUrl, searchUrl: `${siteUrl}/search?q={query}` },
		},
		transform: (graph, ctx) => {
			const model = dynamicPageItem?.properties?.definitionName
			const mapper = model ? contentModelMappings[model] : undefined
			const node = mapper?.(dynamicPageItem!, { ...ctx, baseUrl: siteUrl })
			if (node) graph.push(node)
		},
	})
}
