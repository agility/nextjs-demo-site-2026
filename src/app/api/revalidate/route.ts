

import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import agilitySDK from "@agility/content-fetch"
import type { SitemapNode } from "@/lib/types/SitemapNode";
import { publishPostToSocial } from "@/lib/social/publishPost";

interface IRevalidateRequest {
	state: string,
	instanceGuid: string
	languageCode?: string
	referenceName?: string
	contentID?: number
	contentVersionID?: number
	pageID?: number
	pageVersionID?: number
	changeDateUTC?: string
}

export async function POST(req: NextRequest) {

	//parse the body
	const data = await req.json() as IRevalidateRequest

	//a publish makes content live; a delete/unpublish takes it offline. Both can
	//change the sitemap (a node is added, renamed, or removed), so both need the
	//sitemap cache cleared.
	const isPublish = data.state === "Published"
	const isRemoval = data.state === "Deleted" || data.state === "Unpublished"

	//helper: clear the flat + nested sitemap tags for a locale so anything that
	//resolves URLs from the sitemap (the locale switcher, the blog listing,
	//generateStaticParams) picks up the change immediately.
	const revalidateSitemapTags = (locale?: string) => {
		const sitemapTagFlat = `agility-sitemap-flat-${locale}`
		const sitemapTagNested = `agility-sitemap-nested-${locale}`
		revalidateTag(sitemapTagFlat)
		revalidateTag(sitemapTagNested)
		console.info("Revalidating sitemap tags:", sitemapTagFlat, sitemapTagNested)
	}

	const hasContentOrPage = !!data.referenceName || (data.pageID !== undefined && data.pageID > 0)

	if ((isPublish || isRemoval) && hasContentOrPage) {

		let sitemapFlat: {
			[path: string]: SitemapNode
		} = {}

		//grab the sitemap flat so we can revalidate the full path if needed.
		//only useful on publish: on a delete/unpublish the node is already gone
		//from the sitemap, so there's nothing to look up.
		if (isPublish && (data.contentID || data.pageID)) {
			const apiKey = process.env.AGILITY_API_FETCH_KEY

			const agilityClient = agilitySDK.getApi({
				guid: process.env.AGILITY_GUID,
				apiKey
			})

			//use the locale of the item that changed (NOT the full AGILITY_LOCALES
			//list) so the node lookup and path resolution happen in the right locale
			const defaultLocale = process.env.AGILITY_LOCALES?.split(",")[0] || "en-us"
			const languageCode = data.languageCode || defaultLocale

			//don't cache the sitemap here... we want to get the latest
			agilityClient.config.fetchConfig = {
				cache: "no-store"
			}


			sitemapFlat = await agilityClient.getSitemapFlat({
				channelName: process.env.AGILITY_SITEMAP || "website",
				languageCode
			})
		}

		//revalidate the correct tags based on what changed
		if (data.referenceName) {
			//content item change
			const itemTag = `agility-content-${data.referenceName.toLowerCase()}-${data.languageCode}`
			const listTag = `agility-content-${data.contentID}-${data.languageCode}`
			revalidateTag(itemTag)
			revalidateTag(listTag)

			console.info("Revalidating content tags:", itemTag, listTag)

			if (isPublish) {
				//grab the sitemap and check if this content is in there so we can revalidate a full path
				const sitemapNode = Object.values(sitemapFlat).find(s => s.contentID === data.contentID)
				if (sitemapNode) {
					const path = sitemapNode.path
					revalidatePath(path)
					console.info("Revalidating path:", path)

					//this content item backs a dynamic page, so its change can alter the
					//sitemap (new node, changed slug). Clear the sitemap tags so the
					//flat/nested sitemaps pick up the change immediately.
					revalidateSitemapTags(data.languageCode)
				}
			} else {
				//delete/unpublish: if this was a dynamic page item, its node has been
				//removed from the sitemap. We can't look it up anymore, so clear the
				//sitemap tags so the removed node drops out right away.
				revalidateSitemapTags(data.languageCode)
			}


		} else if (data.pageID !== undefined && data.pageID > 0) {
			//page change or removal
			const pageTag = `agility-page-${data.pageID}-${data.languageCode}`
			revalidateTag(pageTag)

			//a page being added, changed, or removed always affects the sitemap
			revalidateSitemapTags(data.languageCode)

			console.info("Revalidating page tag:", pageTag)

			if (isPublish) {
				const sitemapNode = Object.values(sitemapFlat).find(s => s.pageID === data.pageID)
				if (sitemapNode) {
					const path = sitemapNode.path
					revalidatePath(path)
					console.info("Revalidating path:", path)

				}
			}
		}

		// --- Social media auto-publish for blog posts (publish only) ---
		if (
			isPublish &&
			data.referenceName?.toLowerCase() === "posts" &&
			data.contentID &&
			data.languageCode
		) {
			// Fire-and-forget: don't block the webhook response
			publishPostToSocial({
				contentID: data.contentID,
				languageCode: data.languageCode,
			}).catch((err) => console.error("[social] Unexpected error:", err))
		}

	} else if (data.contentID === undefined && data.pageID === undefined) {
		//if no content or page id is provided, it's for a URL redirection
		//trigger the rebuild hook for netlify's rebuild...
		const hookUrl = process.env.BUILD_HOOK_URL
		if (hookUrl) {
			await fetch(hookUrl, {
				method: 'POST'
			})
		}
	}

	return new Response(`OK`, {
		status: 200
	})


}