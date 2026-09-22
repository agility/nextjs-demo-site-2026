import "server-only";

import { cacheLife, cacheTag } from "next/cache"
import { connection } from "next/server"
import type { PageRequestParams } from "@agility/content-fetch/dist/methods/getPage"
import getAgilitySDK from "@/lib/cms/getAgilitySDK"

export type GetPageParams = PageRequestParams & {
	/** Read staging content instead of published. Preview reads are NEVER cached. */
	preview?: boolean
}

/**
 * Get a page (its zones and the component instances in them) by page ID.
 *
 * Published reads are cached and invalidated by /api/revalidate on publish.
 * The tag format is a CONTRACT with that webhook.
 */
export const getPage = async ({ preview = false, ...params }: GetPageParams) => {

	if (preview) {
		await connection()
		return fetchPage(params, true)
	}

	return cachedPage(params)
}

const cachedPage = async (params: PageRequestParams) => {
	"use cache"
	cacheTag(`agility-page-${params.pageID}-${params.languageCode || params.locale}`)
	cacheLife("days")
	return fetchPage(params, false)
}

const fetchPage = async (params: PageRequestParams, preview: boolean) => {
	const agilitySDK = getAgilitySDK(preview)
	return await agilitySDK.getPage(params)
}
