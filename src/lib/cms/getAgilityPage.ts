import "server-only";

import type { AgilityPageProps, AgilitySitemapNode } from "@agility/nextjs";
import { getAgilityContext } from "./getAgilityContext";
import { getSitemapFlat } from "./getSitemapFlat";
import { getPage } from "./getPage";
import { getContentItem } from "./getContentItem";

export interface PageProps {
	params: Promise<{ slug: string[], locale: string }>
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * Resolve an Agility page for a route.
 *
 * This composes the CACHED primitives — flat sitemap -> node by path -> page by
 * ID (-> dynamic item) — rather than calling `getAgilityPageProps` from
 * @agility/nextjs/node.
 *
 * Why: `getAgilityPageProps` does its own uncached fetching and calls
 * `Date.now()` internally. Under `cacheComponents` that is fatal — Next refuses
 * to prerender a route that reads an unstable value, and the uncached fetch
 * would force every page to render at request time anyway. Composing the
 * primitives keeps the whole page shell prerenderable and tag-invalidated.
 * (Same approach as Agility-Website-Nextjs-2026 and the documentation site.)
 *
 * The returned shape matches AgilityPageProps, because it is spread straight
 * into the page template and on into <ContentZone>.
 */
export const getAgilityPage = async ({ params }: PageProps): Promise<AgilityPageProps> => {

	const awaitedParams = await params
	const { isPreview: preview, locale, sitemap, isDevelopmentMode } = await getAgilityContext(awaitedParams.locale)

	//NOTE: work on a COPY of the slug. The object returned by `await params` is
	//built from getters in a production build, so assigning to it throws
	//"Cannot set property slug of #<Object> which has only a getter" - which
	//took down every URL carrying a query string (?audience=, ?region=, ?q=),
	//since only those routes reach the ~~~ branch below. `next dev` hands back a
	//writable object, so this only ever failed once deployed.
	let slugParts = awaitedParams.slug ? [...awaitedParams.slug] : [""]

	//check the last element of the slug to see if it has search params encoded (from the proxy)
	let lastSlug = slugParts[slugParts.length - 1]
	const searchParams: { [key: string]: string } = {}
	if (lastSlug && lastSlug.startsWith("~~~") && lastSlug.endsWith("~~~")) {
		//we have search params encoded here
		lastSlug = lastSlug.replace(/~~~+/g, "")
		const decoded = decodeURIComponent(lastSlug)
		const parts = decoded.split("&").map(part => part.trim())

		parts.forEach(part => {
			const kvp = part.split("=")
			if (kvp.length === 2) {
				searchParams[kvp[0]] = kvp[1]
			}
		})

		slugParts = slugParts.slice(0, slugParts.length - 1)
		if (slugParts.length === 0) slugParts = [""]
	}

	const path = "/" + slugParts.filter(s => s.length > 0).join("/")

	const base = {
		languageCode: locale,
		channelName: sitemap,
		isPreview: preview,
		isDevelopmentMode,
		globalData: { searchParams },
	}

	const sitemapFlat = await getSitemapFlat({
		channelName: sitemap,
		languageCode: locale,
		preview,
	}) as { [path: string]: AgilitySitemapNode }

	//the home page is the first node that actually renders something
	const sitemapNode = path === "/"
		? Object.values(sitemapFlat).find(n => !n.isFolder && !n.redirect)
		: sitemapFlat[path]

	//no node, a folder, or a redirect node -> the caller calls notFound()
	if (!sitemapNode || sitemapNode.isFolder || sitemapNode.redirect) {
		return { ...base, sitemapNode: sitemapNode as AgilitySitemapNode, notFound: true }
	}

	const page = await getPage({
		pageID: sitemapNode.pageID,
		languageCode: locale,
		contentLinkDepth: 0,
		preview,
	})

	if (!page) {
		return { ...base, sitemapNode, notFound: true }
	}

	//a node with a contentID is a DYNAMIC page - a details page rendering one
	//item from a list. Fetch that item so components can read it off
	//`dynamicPageItem` (see post-details/PostDetails.tsx).
	let dynamicPageItem = undefined
	if (sitemapNode.contentID !== undefined && sitemapNode.contentID > 0) {
		dynamicPageItem = await getContentItem({
			contentID: sitemapNode.contentID,
			languageCode: locale,
			contentLinkDepth: 2,
			expandAllContentLinks: true,
			preview,
		})
	}

	return {
		...base,
		sitemapNode,
		page,
		dynamicPageItem,
		//Strip everything non-alphanumeric, exactly as getAgilityPageProps did.
		//The CMS returns the template's display name ("Main Template"), while the
		//registry in components/agility-pages/index.ts is keyed by component name
		//("MainTemplate"). Without this, every page renders the "No template
		//found" InlineError and the entire content zone silently disappears.
		pageTemplateName: page.templateName?.replace(/[^0-9a-zA-Z]/g, "") ?? null,
	}
}
