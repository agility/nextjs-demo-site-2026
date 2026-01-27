import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import type { ImageField, UnloadedModuleProps, URLField } from "@agility/nextjs"
import { ABTestHeroClient } from "./ABTestHeroClient"

interface IHeroVariant {
	variant: string
	heading: string
	description: string
	callToAction?: URLField
	image: ImageField
	imagePosition?: string // "left" or "right"
}

interface IHero {
	experimentKey: string
	heading: string
	description: string
	callToAction?: URLField
	image: ImageField
	imagePosition?: string // "left" or "right"
	variants?: {
		referencename: string
	}
}

/**
 * AB Test Hero - Server Component
 *
 * Fetches all variant content from Agility CMS and passes to client component
 * for PostHog feature flag evaluation.
 *
 * Architecture: Client-Side A/B Testing
 * =====================================
 * This component uses client-side feature flag evaluation via PostHog's
 * useFeatureFlagVariantKey hook. See ABTestHeroClient.tsx for the rationale.
 *
 * Benefits:
 * - Routes remain static (no dynamic opt-out from cookies/headers)
 * - Works with PPR and static generation
 * - Uses PostHog's standard React pattern
 * - Automatic $feature_flag_called event tracking
 *
 * How it works:
 * 1. Server fetches all variants from CMS (this component)
 * 2. Server renders control variant in initial HTML
 * 3. Client evaluates feature flag and swaps variant if needed
 * 4. PostHog automatically tracks the experiment exposure
 *
 * @param {UnloadedModuleProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered hero section with A/B testing.
 */
export const ABTestHero = async ({ module, languageCode }: UnloadedModuleProps) => {
	const {
		fields: { experimentKey, heading, description, callToAction, image, imagePosition = "right", variants },
		contentID,
	} = await getContentItem<IHero>({
		contentID: module.contentid,
		languageCode,
	})

	// Fetch variants if they exist
	let variantsList: IHeroVariant[] = []
	if (variants?.referencename) {
		try {
			const contentListResponse = await getContentList<IHeroVariant>({
				referenceName: variants.referencename,
				languageCode,
			})
			variantsList = contentListResponse.items?.map(item => item.fields) || []
		} catch (error) {
			console.warn("Failed to fetch variants for AB test:", error)
		}
	}

	// Create the control variant from the main content
	const controlVariant: IHeroVariant = {
		variant: "control",
		heading,
		description,
		callToAction,
		image,
		imagePosition,
	}

	// Combine control with other variants
	const allVariants = [controlVariant, ...variantsList]

	return (
		<ABTestHeroClient
			experimentKey={experimentKey}
			allVariants={allVariants}
			contentID={contentID}
		/>
	)
}
