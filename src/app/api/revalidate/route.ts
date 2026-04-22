

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


	//only process publish events
	if (data.state === "Published") {

		let sitemapFlat: {
			[path: string]: SitemapNode
		} = {}

		//grab the sitemap flat so we can revalidate the full path if needed
		if (data.contentID || data.pageID) {
			const apiKey = process.env.AGILITY_API_FETCH_KEY

			const agilityClient = agilitySDK.getApi({
				guid: process.env.AGILITY_GUID,
				apiKey
			})

			const languageCode = process.env.AGILITY_LOCALES || "en-us"

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

			//grab the sitemap and check if this content is in there so we can revalidate a full path
			if (sitemapFlat) {
				const sitemapNode = Object.values(sitemapFlat).find(s => s.contentID === data.contentID)
				if (sitemapNode) {
					const path = sitemapNode.path
					revalidatePath(path)
					console.info("Revalidating path:", path)

				}
			}


		} else if (data.pageID !== undefined && data.pageID > 0) {
			//page change
			const pageTag = `agility-page-${data.pageID}-${data.languageCode}`
			revalidateTag(pageTag)


			//also revalidate the sitemaps
			const sitemapTagFlat = `agility-sitemap-flat-${data.languageCode}`
			const sitemapTagNested = `agility-sitemap-nested-${data.languageCode}`
			revalidateTag(sitemapTagFlat)
			revalidateTag(sitemapTagNested)

			console.info("Revalidating page and sitemap tags:", pageTag, sitemapTagFlat, sitemapTagNested)

			if (sitemapFlat) {
				const sitemapNode = Object.values(sitemapFlat).find(s => s.pageID === data.pageID)
				if (sitemapNode) {
					const path = sitemapNode.path
					revalidatePath(path)
					console.info("Revalidating path:", path)

				}
			}
		}
		// --- Social media auto-publish for blog posts ---
		if (
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