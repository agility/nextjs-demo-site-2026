import clsx from "clsx"
import { Button } from "../button"
import { Container } from "../container"
import { Gradient } from "../gradient"
import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import { isFirstComponentInPage } from "@/lib/utils/pageZoneUtils"
import type { UnloadedModuleProps } from "@agility/nextjs"
import type { IPersonalizedBackgroundHero, IPersonalizedBackgroundHeroItem } from "@/lib/types/IPersonalizedBackgroundHero"
import { getAudienceContentID } from "@/lib/utils/audienceRegionUtils"
import { PersonalizationTracker } from "../analytics/PersonalizationTracker"

export const PersonalizedBackgroundHero = async ({ module, languageCode, globalData, page }: UnloadedModuleProps) => {
	const {
		fields: {
			heading,
			description,
			cta1,
			cta2,
			backgroundType,
			backgroundImage,
			personalizedHeroItems: { referencename: personalizedHeroItemsReferenceName },
		},
		contentID,
	} = await getContentItem<IPersonalizedBackgroundHero>({
		contentID: module.contentid,
		languageCode,
	})

	// Get the personalized hero items
	const personalizedHeroItems = await getContentList<IPersonalizedBackgroundHeroItem>({
		referenceName: personalizedHeroItemsReferenceName,
		languageCode,
		take: 50,
		contentLinkDepth: 2,
	})

	// Default content from main component
	let selectedContent = {
		heading,
		description,
		cta1,
		cta2,
		backgroundType,
		backgroundImage,
	}

	// Track personalization state for analytics
	let isPersonalized = false
	let audienceName: string | null = null

	// Check for audience-specific personalization
	const searchParams = globalData?.["searchParams"]
	if (searchParams) {
		audienceName = typeof searchParams.audience === 'string' ? searchParams.audience : null
		const audienceContentID = await getAudienceContentID(searchParams, languageCode)

		if (audienceContentID) {
			// Find personalized content for this audience
			const personalizedContent = personalizedHeroItems.items.find(
				item => item.fields.audienceDropdown?.contentID === audienceContentID
			)

			if (personalizedContent) {
				isPersonalized = true
				// Use personalized content, falling back to default for any missing fields
				selectedContent = {
					heading: personalizedContent.fields.heading || heading,
					description: personalizedContent.fields.description || description,
					cta1: personalizedContent.fields.cta1 || cta1,
					cta2: personalizedContent.fields.cta2 || cta2,
					backgroundType: personalizedContent.fields.backgroundType || backgroundType,
					backgroundImage: personalizedContent.fields.backgroundImage || backgroundImage,
				}
			}
		}
	}

	//check the page object to see if this component is the TOP component
	const isFirstComponent = isFirstComponentInPage(module, page)

	return (
		<div className={clsx("relative z-0", isFirstComponent ? "-mt-36" : "mt-20")} data-agility-component={contentID}>
			{/* Track personalization analytics */}
			<PersonalizationTracker
				audience={audienceName}
				component="PersonalizedBackgroundHero"
				contentID={contentID}
				isPersonalized={isPersonalized}
			/>
			<Gradient
				className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 dark:ring-white/10 ring-inset"
				backgroundType={selectedContent.backgroundType}
				backgroundImage={selectedContent.backgroundImage}
			/>
			<Container className="relative">
				<div className="pt-48 pb-24 sm:pt-52 sm:pb-32 md:pt-64 md:pb-48">
					<h1 className={clsx("font-display text-6xl/[0.9] font-medium tracking-tight text-balance sm:text-7xl/[0.8] md:text-8xl/[0.8]",
						selectedContent.backgroundType === "background-image"
							? "text-gray-100 text-shadow-lg"
							: "text-gray-950 dark:text-gray-50",
					)}
						data-agility-field="heading">
						{selectedContent.heading}
					</h1>
					<p className={clsx("mt-8 max-w-lg text-xl/7 font-medium sm:text-2xl/8",
						selectedContent.backgroundType === "background-image"
							? "text-gray-50/95 text-shadow-lg"
							: "text-gray-950/75 dark:text-gray-200/90",
					)}
						data-agility-field="description">
						{selectedContent.description}
					</p>
					<div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
						{selectedContent.cta1 &&
							<Button href={selectedContent.cta1.href} target={selectedContent.cta1.target} data-agility-field="cta1">
								{selectedContent.cta1.text}
							</Button>
						}
						{selectedContent.cta2 &&
							<Button href={selectedContent.cta2.href} target={selectedContent.cta2.target} variant="secondary" data-agility-field="cta2">
								{selectedContent.cta2.text}
							</Button>
						}
					</div>
				</div>
			</Container>
		</div>
	)
}