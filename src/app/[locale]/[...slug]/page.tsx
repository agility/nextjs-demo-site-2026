import { getPageTemplate } from "@/components/agility-pages"
import { type PageProps, getAgilityPage } from "@/lib/cms/getAgilityPage"
import { getAgilityContext } from "@/lib/cms/getAgilityContext"
import { getSitemapFlat } from "@/lib/cms/getSitemapFlat"

import type { Metadata, ResolvingMetadata } from "next"

import { resolveAgilityMetaData } from "@/lib/cms-content/resolveAgilityMetaData"
import type { SitemapNode } from "@/lib/types/SitemapNode"
import { notFound, permanentRedirect } from "next/navigation"
import InlineError from "@/components/InlineError"
import { locales } from "@/lib/i18n/config"
import { Container } from "@/components/container"
import { Navbar } from "@/components/header/navbar"
import { getHeaderContent } from "@/lib/cms-content/getHeaderContent"
import { buildPageJsonLd } from "@/lib/seo/buildPageJsonLd"
import { JsonLd } from "@/lib/seo/JsonLd"
import type { GeoSitemapFlat } from "@agility/geo"
import { findHomeNode } from "@/lib/cms/homePage"
import { localizeUrl } from "@/lib/i18n/localizeUrl"

// NOTE: the `revalidate` and `runtime` route segment configs were removed —
// both are rejected under `cacheComponents`. Freshness now comes from
// cacheLife("days") on each read in src/lib/cms/ plus instant tag
// invalidation from the publish webhook in /api/revalidate. "nodejs" was
// already the default runtime.

/**
 * Generate the list of pages that we want to generate a build time.
 */
export async function generateStaticParams() {

	const allPaths: { locale: string; slug: string[] }[] = [];

	// Generate paths for each locale. This goes through the cached getSitemapFlat
	// primitive rather than building its own SDK client with hand-written fetch
	// tags, so the build and the render share one cache entry per locale.
	// Published content only: a build must never bake staging content into
	// static pages.
	for (const locale of locales) {
		const sitemap = await getSitemapFlat({
			channelName: process.env.AGILITY_SITEMAP || "website",
			languageCode: locale,
			preview: false,
		}) as { [path: string]: SitemapNode };

		// The home node is prerendered at the locale root by ../page.tsx, and its
		// own path (/home) redirects there, so it is not prerendered again here.
		const homePath = findHomeNode(sitemap)?.path;

		const localePaths = Object.values(sitemap)
			.filter((node) => {
				if (node.redirect !== null || node.isFolder === true) return false;
				if (node.path === homePath) return false;
				return true;
			})
			.map((node) => {
				return {
					locale,
					slug: node.path.split("/").slice(1),
				};
			});

		allPaths.push(...localePaths);
	}

	console.log("Pre-rendering", allPaths.length, "static paths across", locales.length, "locales.");
	return allPaths;
}

/**
 * Generate metadata for this page
 */
export async function generateMetadata(
	props: PageProps,
	parent: ResolvingMetadata
): Promise<Metadata> {
	const { params } = props;
	const awaitedParams = await params;

	const { locale, sitemap, isDevelopmentMode, isPreview } = await getAgilityContext(awaitedParams.locale);
	const agilityData = await getAgilityPage({ params });
	if (!agilityData.page) return {};
	return await resolveAgilityMetaData({
		agilityData,
		locale,
		sitemap,
		isDevelopmentMode,
		isPreview,
		parent,
	});
}
export default async function Page({ params }: PageProps) {

	const agilityData = await getAgilityPage({ params });
	if (!agilityData.page) notFound();

	const AgilityPageTemplate = getPageTemplate(agilityData.pageTemplateName || "");

	//get the search params from global data (since they are added in getAgilityPage)
	const globalSearchParams = agilityData.globalData?.["searchParams"] || {};

	// The header (with the language switcher) is rendered here so it can use the
	// current page's sitemap node - pageID and, for dynamic pages, contentID -
	// to resolve the equivalent page when switching locales.
	const { locale, isPreview, sitemap: channelName } = await getAgilityContext((await params).locale);
	const [header, sitemap] = await Promise.all([
		getHeaderContent({ locale, preview: isPreview }),
		// Same cached call getAgilityPage makes, so this is a cache hit, not a second fetch.
		getSitemapFlat({ channelName, languageCode: locale, preview: isPreview }),
	]);
	const node = agilityData.sitemapNode;

	// The home page is served at the locale root ("/", "/fr"), never at its own
	// sitemap path. The proxy already redirects /home; this covers any request
	// that reaches the page without going through it. See lib/cms/homePage.ts.
	const requestedSlug = ((await params).slug || []).filter((s) => s && !s.startsWith("~~~"));
	if (requestedSlug.length > 0 && node.path === findHomeNode(sitemap)?.path) {
		const query = new URLSearchParams(globalSearchParams as Record<string, string>).toString();
		permanentRedirect(localizeUrl("/", locale) + (query ? `?${query}` : ""));
	}

	// ONE schema.org @graph for the page: site entities, WebPage + breadcrumbs,
	// the editor's GEO tab JSON-LD, and content model mappings (a Post becomes a
	// BlogPosting). See lib/seo/buildPageJsonLd.ts.
	const jsonLd = buildPageJsonLd({
		agilityData,
		sitemap: sitemap as GeoSitemapFlat,
		locale,
		siteName: header?.siteName || "Galaxy Tech",
		logoUrl: header?.logo?.url,
	});

	return (
		<>
			{jsonLd && <JsonLd data={jsonLd} />}
			{header && (
				<Container>
					<Navbar
						header={header}
						locale={locale}
						locales={locales}
						pageID={node?.pageID}
						contentID={node?.contentID}
					/>
				</Container>
			)}
			<main data-agility-page={agilityData.page?.pageID} data-agility-dynamic-content={agilityData.sitemapNode.contentID}>
				{AgilityPageTemplate ? (
					<AgilityPageTemplate {...agilityData} searchParams={globalSearchParams} />
				) : (
					<InlineError message={`No template found for page template name: ${agilityData.pageTemplateName}`} />
				)}
			</main>
		</>
	);
}
