import "server-only";

import { cacheLife, cacheTag } from "next/cache"
import { connection } from "next/server"
import type { ContentListRequestParams } from "@agility/content-fetch/dist/methods/getContentList"
import getAgilitySDK from "@/lib/cms/getAgilitySDK"
import type { IContentListResponse } from "../types/IContentListResponse"

export type GetContentListParams = ContentListRequestParams & {
	/** Read staging content instead of published. Preview reads are NEVER cached. */
	preview?: boolean
}

/**
 * Get a content list by reference name.
 *
 * Published reads are cached with `"use cache"` + a cache tag, and invalidated
 * by the publish webhook in /api/revalidate. Preview reads bypass the cache.
 *
 * The tag format is a CONTRACT with /api/revalidate — do not change it without
 * changing the webhook to match.
 */
export const getContentList = async <T>({ preview = false, ...params }: GetContentListParams): Promise<IContentListResponse<T>> => {

	if (preview) {
		await connection()
		return fetchContentList<T>(params, true)
	}

	return cachedContentList<T>(params)
}

const cachedContentList = async <T>(params: ContentListRequestParams): Promise<IContentListResponse<T>> => {
	"use cache"
	cacheTag(`agility-content-${params.referenceName.toLowerCase()}-${params.languageCode || params.locale}`)
	cacheLife("days")
	return fetchContentList<T>(params, false)
}

const fetchContentList = async <T>(params: ContentListRequestParams, preview: boolean): Promise<IContentListResponse<T>> => {
	const agilitySDK = getAgilitySDK(preview)
	return await agilitySDK.getContentList(params)
}
