import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import type { ContentItem, ImageField, UnloadedModuleProps, URLField } from "@agility/nextjs"
import { LogoStripClient } from "./LogoStripClient"


interface ILogoStrip {
	ctaDescription: string
	cta: URLField
	logos: { referencename: string }
}

interface ILogoItem {
	title: string
	logo: ImageField
}

export const LogoStrip = async ({ module, languageCode }: UnloadedModuleProps) => {
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

	//now go get the logos
	let logos = await getContentList<ILogoItem>({
		referenceName: logosReferenceName,
		languageCode,
		take: 20, // adjust as needed
	})

	return (
		<section data-agility-component={contentID}>
			<LogoStripClient logos={logos.items} ctaDescription={ctaDescription} cta={cta} />
		</section>
	)
}
