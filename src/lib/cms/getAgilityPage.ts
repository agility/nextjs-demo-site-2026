import "server-only";
import { getAgilityPageProps } from "@agility/nextjs/node";
import { getAgilityContext } from "./getAgilityContext";

export interface PageProps {
	params: Promise<{ slug: string[], locale: string }>
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}


/**
 * Get a page with caching information added.
 * @param param0
 * @returns
 */
export const getAgilityPage = async ({ params }: PageProps) => {

	const awaitedParams = await params
	const { isPreview: preview, locale } = await getAgilityContext(awaitedParams.locale)


	if (!awaitedParams.slug) awaitedParams.slug = [""]

	//check the last element of the slug to see if it has search params encoded (from middleware)
	let lastSlug = awaitedParams.slug[awaitedParams.slug.length - 1]
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

		awaitedParams.slug = awaitedParams.slug.slice(0, awaitedParams.slug.length - 1)
		if (awaitedParams.slug.length === 0) awaitedParams.slug = [""]
	}

	//get the page
	const page = await getAgilityPageProps({
		params: awaitedParams, preview, locale, apiOptions: {
			contentLinkDepth: 0
		}
	})

	page.globalData = page.globalData || {};
	page.globalData["searchParams"] = searchParams;

	return page

}

