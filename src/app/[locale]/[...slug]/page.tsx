import { getPageTemplate } from "@/components/agility-pages"
import { type PageProps, getAgilityPage } from "@/lib/cms/getAgilityPage"
import { getAgilityContext } from "@/lib/cms/getAgilityContext"
import agilitySDK from "@agility/content-fetch"

import type { Metadata, ResolvingMetadata } from "next"

import { resolveAgilityMetaData } from "@/lib/cms-content/resolveAgilityMetaData"
import { type SitemapNode } from "@/lib/types/SitemapNode"
import { notFound } from "next/navigation"
import InlineError from "@/components/InlineError"
import { locales } from "@/lib/i18n/config"
import { Container } from "@/components/container"
import { Navbar } from "@/components/header/navbar"
import { getHeaderContent } from "@/lib/cms-content/getHeaderContent"

export const revalidate = 60
export const runtime = "nodejs"

/**
 * Generate the list of pages that we want to generate a build time.
 */
export async function generateStaticParams() {
	const isDevelopmentMode = process.env.NODE_ENV === "development";
	const isPreview = isDevelopmentMode;
	const apiKey = isPreview ? process.env.AGILITY_API_PREVIEW_KEY : process.env.AGILITY_API_FETCH_KEY;
	const agilityClient = agilitySDK.getApi({
		guid: process.env.AGILITY_GUID,
		apiKey,
		isPreview,
	});

	const allPaths: { locale: string; slug: string[] }[] = [];

	// Generate paths for each locale
	for (const locale of locales) {
		agilityClient.config.fetchConfig = {
			next: {
				tags: [`agility-sitemap-flat-${locale}`],
				revalidate: 60,
			},
		};

		// Get the flat sitemap for this locale
		const sitemap: { [path: string]: SitemapNode } = await agilityClient.getSitemapFlat({
			channelName: process.env.AGILITY_SITEMAP || "website",
			languageCode: locale,
		});

		const localePaths = Object.values(sitemap)
			.filter((node, index) => {
				if (node.redirect !== null || node.isFolder === true) return false;
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
	const { locale } = await getAgilityContext((await params).locale);
	const header = await getHeaderContent({ locale });
	const node = agilityData.sitemapNode;

	return (
		<>
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
			<div data-agility-page={agilityData.page?.pageID} data-agility-dynamic-content={agilityData.sitemapNode.contentID}>
				{AgilityPageTemplate ? (
					<AgilityPageTemplate {...agilityData} searchParams={globalSearchParams} />
				) : (
					<InlineError message={`No template found for page template name: ${agilityData.pageTemplateName}`} />
				)}
			</div>
		</>
	);
}
