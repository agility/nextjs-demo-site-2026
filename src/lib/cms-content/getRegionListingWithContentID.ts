import type { ContentList, ContentItem } from "@agility/content-fetch"
import { getContentList } from "@/lib/cms/getContentList"
import type { IRegion } from "../types/IRegion"
import { type RegionWithContentID, transformContentItemsWithContentID } from "../utils/audienceRegionUtils"

interface LoadRegionsProp {
	locale: string
	/** Read staging content instead of published. */
	preview?: boolean
}

/**
 * Get a list of regions including their contentIDs
 * Use this when you need access to the contentID for each region
 * @param param0
 * @returns
 */
export const getRegionListingWithContentID = async ({ locale, preview = false }: LoadRegionsProp): Promise<RegionWithContentID[]> => {

	try {
		// get regions...
		const rawRegions: ContentList = await getContentList<IRegion>({
			preview,
			referenceName: "regions",
			languageCode: locale,
			contentLinkDepth: 2,
			take: 100,
			skip: 0,
			locale
		})

		// Return the items with contentID included
		return transformContentItemsWithContentID<IRegion>(rawRegions.items as ContentItem<IRegion>[])

	} catch (error) {
		throw new Error(`Error loading data for RegionListingWithContentID: ${error}`)
	}
}