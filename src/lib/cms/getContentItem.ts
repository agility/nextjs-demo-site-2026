import "server-only";

import { cacheLife, cacheTag } from "next/cache"
import { connection } from "next/server"
import type { ContentItemRequestParams } from "@agility/content-fetch/dist/methods/getContentItem"
import getAgilitySDK from "@/lib/cms/getAgilitySDK"
import type { ContentItem } from "@agility/content-fetch"

export type GetContentItemParams = ContentItemRequestParams & {
	/** Read staging content instead of published. Preview reads are NEVER cached. */
	preview?: boolean
}

/**
 * Get a single content item.
 *
 * Published reads are cached with `"use cache"` + a cache tag, and invalidated
 * by the publish webhook in /api/revalidate. Preview reads bypass the cache
 * entirely so editors always see their latest draft.
 *
 * The tag format is a CONTRACT with /api/revalidate — do not change it without
 * changing the webhook to match.
 */
export const getContentItem = async <T>({ preview = false, ...params }: GetContentItemParams) => {

	if (preview) {
		//wait for the request before doing an uncached fetch, so the prerender
		//pass doesn't start this and then have to throw it away
		await connection()
		return fetchContentItem<T>(params, true)
	}

	return cachedContentItem<T>(params)
}

const cachedContentItem = async <T>(params: ContentItemRequestParams) => {
	"use cache"
	cacheTag(`agility-content-${params.contentID}-${params.languageCode || params.locale}`)
	//long TTL on purpose: the publish webhook is the real invalidation path, so
	//content goes live immediately and the TTL is only a self-healing backstop.
	cacheLife("days")
	return fetchContentItem<T>(params, false)
}

const fetchContentItem = async <T>(params: ContentItemRequestParams, preview: boolean) => {
	const agilitySDK = getAgilitySDK(preview)
	return await agilitySDK.getContentItem(params) as ContentItem<T>
}
