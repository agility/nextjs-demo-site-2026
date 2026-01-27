"use client"

import clsx from "clsx"
import { useState, useEffect } from "react"
import { useFeatureFlagVariantKey } from "posthog-js/react"
import { Button } from "../../button"
import { Container } from "../../container"
import type { ImageField, URLField } from "@agility/nextjs"
import { AgilityPic } from "@agility/nextjs"
import { analytics } from "@/lib/analytics"
import { AnalyticsEvents } from "@/lib/analytics/events"

interface IHeroVariant {
	variant: string
	heading: string
	description: string
	callToAction?: URLField
	image: ImageField
	imagePosition?: string // "left" or "right"
}

interface ABTestHeroClientProps {
	experimentKey: string
	allVariants: IHeroVariant[]
	contentID: number
}

/**
 * Client-side A/B Test Hero component using PostHog's useFeatureFlagVariantKey hook.
 *
 * Architecture Decision: Client-Side Only A/B Testing
 * ====================================================
 *
 * We intentionally use client-side feature flag evaluation rather than server-side for these reasons:
 *
 * 1. **Static Route Optimization**: Using cookies() or headers() in Next.js App Router opts the
 *    entire route into dynamic rendering, defeating static generation and PPR benefits.
 *
 * 2. **Performance**: Server renders the control variant immediately (fast initial paint),
 *    then client swaps to the correct variant if needed.
 *
 * 3. **Simplicity**: Uses PostHog's standard React hooks which automatically handle:
 *    - $feature_flag_called event tracking
 *    - User identification via PostHog's distinct_id
 *    - Flag evaluation caching
 *
 * 4. **Flicker Mitigation**:
 *    - ~50% of users (control group) see no change at all
 *    - Treatment group users see a brief transition (CSS fade)
 *    - PostHog caches flags in localStorage for returning users
 *
 * Trade-off: First-time treatment group users may see a brief content swap.
 * This is acceptable given the performance benefits of keeping routes static.
 */
export const ABTestHeroClient = ({ experimentKey, allVariants, contentID }: ABTestHeroClientProps) => {
	// Use PostHog's hook - automatically tracks $feature_flag_called
	const flagVariant = useFeatureFlagVariantKey(experimentKey)

	// Track mount state to avoid hydration mismatch
	// Server and initial client render MUST match (both show control)
	// Only after hydration do we switch to the evaluated variant
	const [hasMounted, setHasMounted] = useState(false)

	// Find the control variant (default)
	const controlVariant = allVariants.find(v => v.variant === "control") || allVariants[0]

	// Determine which variant to show
	// - Before mount: always show control (matches server render)
	// - After mount: show evaluated variant or control as fallback
	const selectedVariant = hasMounted && flagVariant
		? (allVariants.find(v => v.variant === flagVariant) || controlVariant)
		: controlVariant

	// Track when component has mounted to enable variant switching
	useEffect(() => {
		setHasMounted(true)
	}, [])

	// Track exposure with our analytics abstraction (in addition to PostHog's automatic tracking)
	useEffect(() => {
		if (!experimentKey || !hasMounted || flagVariant === undefined) return

		const trackExposure = () => {
			if (!analytics.isReady()) {
				setTimeout(trackExposure, 100)
				return
			}

			// Fire custom event for analytics abstraction layer
			analytics.trackExperimentExposure({
				experimentKey,
				variant: selectedVariant.variant,
				component: "ABTestHero",
				contentID: contentID,
				path: typeof window !== 'undefined' ? window.location.pathname : undefined,
			})
		}

		trackExposure()
	}, [experimentKey, hasMounted, flagVariant, selectedVariant.variant, contentID])

	const { heading, description, callToAction, image, imagePosition = "right" } = selectedVariant
	const isImageLeft = imagePosition === "left"

	return (
		<section
			className={clsx(
				"pt-20 transition-opacity duration-200",
				// Subtle fade-in when variant changes to minimize perceived flicker
				hasMounted ? "opacity-100" : "opacity-95"
			)}
			data-agility-component={contentID}
			data-experiment-key={experimentKey}
			data-variant={selectedVariant.variant}
			data-evaluated={hasMounted ? "true" : "false"}
		>
			<Container>
				<div className={clsx(
					"grid gap-8 lg:gap-16 lg:grid-cols-2 lg:items-center",
					// On mobile, image is always on top
					"grid-rows-[auto_1fr]",
					// On desktop, order changes based on imagePosition
					isImageLeft ? "lg:grid-cols-[1fr_1fr]" : "lg:grid-cols-[1fr_1fr]"
				)}>
					{/* Content Section */}
					<div className={clsx(
						"order-2 lg:order-none",
						isImageLeft ? "lg:order-2" : "lg:order-1"
					)}>
						<h1
							className="font-display text-3xl/[1.1] font-medium tracking-tight text-balance sm:text-4xl/[1.1] md:text-5xl/[1.1] text-gray-950 dark:text-gray-50"
							data-agility-field="heading"
						>
							{heading}
						</h1>

						<p
							className="mt-6 text-lg/7 font-medium text-gray-950/75 dark:text-gray-200/90 sm:text-xl/8"
							data-agility-field="description"
						>
							{description}
						</p>

						{callToAction && (
							<div className="mt-8">
								<Button
									href={callToAction.href}
									target={callToAction.target}
									data-agility-field="callToAction"
									onClick={() => {
										// Track CTA clicks for the experiment using analytics abstraction
										if (analytics.isReady()) {
											analytics.trackCTAClick({
												ctaName: `ab_test_${experimentKey}_cta`,
												ctaUrl: callToAction.href,
												ctaText: callToAction.text,
												component: "ABTestHero",
												location: "hero",
												path: typeof window !== 'undefined' ? window.location.pathname : undefined,
											})

											// Also track as experiment interaction for A/B test analysis
											analytics.track(AnalyticsEvents.EXPERIMENT_INTERACTION, {
												experimentKey,
												variant: selectedVariant.variant,
												component: "ABTestHero",
												contentID: contentID,
												action: "cta_click",
												ctaText: callToAction.text,
												ctaHref: callToAction.href,
											})
										}
									}}
								>
									{callToAction.text}
								</Button>
							</div>
						)}
					</div>

					{/* Image Section */}
					<div className={clsx(
						"order-1 lg:order-none",
						isImageLeft ? "lg:order-1" : "lg:order-2"
					)}>
						<div className="relative dark:saturate-0">
							<AgilityPic
								data-agility-field="image"
								image={image}
								fallbackWidth={600}
								className="w-full h-auto rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
							/>
						</div>
					</div>
				</div>
			</Container>
		</section>
	)
}
