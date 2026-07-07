import { type ContentItemRequestParams } from "@agility/content-fetch/dist/methods/getContentItem"
import getAgilitySDK from "@/lib/cms/getAgilitySDK"
import { type ContentItem } from "@agility/content-fetch"
import { env } from "@/lib/env"

/**
 * Get a content item with caching information added.
 * @param params
 * @returns
 */
export const getContentItem = async <T>(params: ContentItemRequestParams) => {

	const agilitySDK = await getAgilitySDK()

	agilitySDK.config.fetchConfig = {
		next: {
			tags: [`agility-content-${params.contentID}-${params.languageCode || params.locale}`],
			revalidate: env.AGILITY_FETCH_CACHE_DURATION,
		},
	}

	return await agilitySDK.getContentItem(params) as ContentItem<T>

}