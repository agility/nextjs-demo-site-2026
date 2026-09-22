import type { ContentList, ContentItem } from "@agility/content-fetch"
import { getContentList } from "@/lib/cms/getContentList"
import type { IRegion } from "../types/IRegion"

interface LoadRegionsProp {
	locale: string
	skip: number
	take: number
}

/**
 * Get a list of audiences and resolve the URLs for each audience from the sitemap.
 * @param param0
 * @returns
 */
export const getRegionListing = async ({ locale, skip, take }: LoadRegionsProp): Promise<IRegion[]> => {

	try {


		// get regions...
		const rawRegions: ContentList = await getContentList<IRegion>({
			referenceName: "regions",
			languageCode: locale,
			contentLinkDepth: 2,
			take,
			skip,
			locale
		})

		// Return the complete content items without transformation

		return rawRegions.items.map(item => item.fields as IRegion);

	} catch (error) {
		throw new Error(`Error loading data for RegionListing: ${error}`)
	}
}

