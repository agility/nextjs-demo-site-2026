import "server-only";

import { cacheLife, cacheTag } from "next/cache"
import { connection } from "next/server"
import type { SitemapFlatRequestParams } from "@agility/content-fetch/dist/methods/getSitemapFlat"
import getAgilitySDK from "@/lib/cms/getAgilitySDK"

export type GetSitemapFlatParams = SitemapFlatRequestParams & {
	/** Read staging content instead of published. Preview reads are NEVER cached. */
	preview?: boolean
}

/**
 * Get the flat sitemap (path -> node) for a locale.
 *
 * Published reads are cached and invalidated by /api/revalidate on any page or
 * dynamic-item publish. The tag format is a CONTRACT with that webhook.
 */
export const getSitemapFlat = async ({ preview = false, ...params }: GetSitemapFlatParams) => {

	if (preview) {
		await connection()
		return fetchSitemapFlat(params, true)
	}

	return cachedSitemapFlat(params)
}

const cachedSitemapFlat = async (params: SitemapFlatRequestParams) => {
	"use cache"
	cacheTag(`agility-sitemap-flat-${params.languageCode || params.locale}`)
	cacheLife("days")
	return fetchSitemapFlat(params, false)
}

const fetchSitemapFlat = async (params: SitemapFlatRequestParams, preview: boolean) => {
	const agilitySDK = getAgilitySDK(preview)
	return await agilitySDK.getSitemapFlat(params)
}
