import "server-only";

import { cacheLife, cacheTag } from "next/cache"
import { connection } from "next/server"
import type { SitemapNestedRequestParams } from "@agility/content-fetch/dist/methods/getSitemapNested"
import getAgilitySDK from "@/lib/cms/getAgilitySDK"

export type GetSitemapNestedParams = SitemapNestedRequestParams & {
	/** Read staging content instead of published. Preview reads are NEVER cached. */
	preview?: boolean
}

/**
 * Get the nested sitemap (menu tree) for a locale.
 *
 * Published reads are cached and invalidated by /api/revalidate. The tag format
 * is a CONTRACT with that webhook.
 */
export const getSitemapNested = async ({ preview = false, ...params }: GetSitemapNestedParams) => {

	if (preview) {
		await connection()
		return fetchSitemapNested(params, true)
	}

	return cachedSitemapNested(params)
}

const cachedSitemapNested = async (params: SitemapNestedRequestParams) => {
	"use cache"
	cacheTag(`agility-sitemap-nested-${params.languageCode || params.locale}`)
	cacheLife("days")
	return fetchSitemapNested(params, false)
}

const fetchSitemapNested = async (params: SitemapNestedRequestParams, preview: boolean) => {
	const agilitySDK = getAgilitySDK(preview)
	return await agilitySDK.getSitemapNested(params)
}
