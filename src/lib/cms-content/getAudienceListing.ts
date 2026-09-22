import type { ContentList, ContentItem } from "@agility/content-fetch"
import { getContentList } from "@/lib/cms/getContentList"
import type { IAudience } from "../types/IAudience"

interface LoadAudiencesProp {
	locale: string
	skip: number
	take: number
}

/**
 * Get a list of audiences and resolve the URLs for each audience from the sitemap.
 * @param param0
 * @returns
 */
export const getAudienceListing = async ({ locale, skip, take }: LoadAudiencesProp): Promise<IAudience[]> => {

	try {


		// get audiences...
		const rawAudiences: ContentList = await getContentList<IAudience>({
			referenceName: "audiences",
			languageCode: locale,
			contentLinkDepth: 2,
			take,
			skip,
			locale
		})

		// Return the complete content items without transformation

		return rawAudiences.items.map(item => item.fields as IAudience)

	} catch (error) {
		throw new Error(`Error loading data for AudienceListing: ${error}`)
	}
}

