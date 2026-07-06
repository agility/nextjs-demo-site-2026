import getAgilitySDK from "@/lib/cms/getAgilitySDK"
import type { ContentListRequestParams } from "@agility/content-fetch/dist/methods/getContentList"
import type { IContentListResponse } from "../types/IContentListResponse"
import { env } from "@/lib/env"


/**
 * Get a content list with caching information added.
 * @param params
 * @returns
 */
export const getContentList = async <T>(params: ContentListRequestParams): Promise<IContentListResponse<T>> => {


	const agilitySDK = await getAgilitySDK()

	agilitySDK.config.fetchConfig = {
		next: {
			tags: [`agility-content-${params.referenceName.toLowerCase()}-${params.languageCode || params.locale}`],
			revalidate: env.AGILITY_FETCH_CACHE_DURATION,
		},
	}

	return await agilitySDK.getContentList(params)

}