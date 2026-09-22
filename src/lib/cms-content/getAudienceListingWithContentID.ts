import type { ContentList, ContentItem } from "@agility/content-fetch"
import { getContentList } from "@/lib/cms/getContentList"
import type { IAudience } from "../types/IAudience"
import { type AudienceWithContentID, transformContentItemsWithContentID } from "../utils/audienceRegionUtils"

interface LoadAudiencesProp {
	locale: string
	/** Read staging content instead of published. */
	preview?: boolean
}

/**
 * Get a list of audiences including their contentIDs
 * Use this when you need access to the contentID for each audience
 * @param param0
 * @returns
 */
export const getAudienceListingWithContentID = async ({ locale, preview = false }: LoadAudiencesProp): Promise<AudienceWithContentID[]> => {

	try {
		// get audiences...
		const rawAudiences: ContentList = await getContentList<IAudience>({
			preview,
			referenceName: "audiences",
			languageCode: locale,
			contentLinkDepth: 2,
			take: 100,
			skip: 0,
			locale
		})

		// Return the items with contentID included
		return transformContentItemsWithContentID<IAudience>(rawAudiences.items as ContentItem<IAudience>[])

	} catch (error) {
		throw new Error(`Error loading data for AudienceListingWithContentID: ${error}`)
	}
}