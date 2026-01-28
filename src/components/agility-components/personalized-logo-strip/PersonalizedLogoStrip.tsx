import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import type { ContentItem, ImageField, UnloadedModuleProps, URLField } from "@agility/nextjs"
import { PersonalizedLogoStripClient } from "./PersonalizedLogoStripClient"
import type { ICustomerProfile } from "@/lib/types/ICustomerProfile"
import { getAudienceContentID } from "@/lib/utils/audienceRegionUtils"


interface ILogoStrip {
	ctaDescription: string
	cta: URLField
	logos: { referencename: string }
}

interface ILogoItem {
	title: string
	logo: ImageField
}

export const PersonalizedLogoStrip = async ({ module, languageCode, globalData }: UnloadedModuleProps) => {
	const {
		fields: {
			ctaDescription,
			cta,
			logos: { referencename: logosReferenceName },
		},
		contentID,
	} = await getContentItem<ILogoStrip>({
		contentID: module.contentid,
		languageCode,
	})

	//now go get the customers
	let customers = await getContentList<ICustomerProfile>({
		referenceName: logosReferenceName,
		languageCode,
		take: 250, // grab all of them so we can do the filtering here... TODO - do this filtering here...
	})


	const searchParams = globalData?.["searchParams"]

	if (searchParams) {
		//check the personalization stuff and filter the list of customers
		const audienceContentID = await getAudienceContentID(searchParams, languageCode )

		//filter the customers list
		if (audienceContentID) {
			customers = {
				...customers,
				items: customers.items.filter(customer => customer.fields.audience?.contentID === audienceContentID)
			}
		}
	}


	return (
		<section data-agility-component={contentID}>
			<PersonalizedLogoStripClient customers={customers.items} ctaDescription={ctaDescription} cta={cta} />
		</section>
	)
}
