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
	// Find the control variant (default)
	const controlVariant = allVariants.find(v => v.variant === "control") || allVariants[0]

	// Check if A/B testing is actually configured:
	// - Must have an experiment key
	// - Must have more than just the control variant
	const hasExperiment = Boolean(experimentKey) && allVariants.length > 1

	// Use PostHog's hook - automatically tracks $feature_flag_called
	// Only evaluate if we have an experiment configured
	const flagVariant = useFeatureFlagVariantKey(hasExperiment ? experimentKey : "")

	// Track mount state to avoid hydration mismatch
	// Server and initial client render MUST match (both show control)
	// Only after hydration do we switch to the evaluated variant
	const [hasMounted, setHasMounted] = useState(false)

	// Timeout state - if PostHog doesn't respond in time, use control
	const [hasTimedOut, setHasTimedOut] = useState(false)

	// Determine which variant to show
	// - If no experiment: always show control
	// - Before mount: always show control (matches server render)
	// - After mount with flag result: show evaluated variant
	// - After timeout: show control
	const selectedVariant = hasExperiment && hasMounted && flagVariant && !hasTimedOut
		? (allVariants.find(v => v.variant === flagVariant) || controlVariant)
		: controlVariant

	// Track when component has mounted to enable variant switching
	useEffect(() => {
		setHasMounted(true)
	}, [])

	// Timeout for PostHog - if it doesn't respond in 2 seconds, show control
	useEffect(() => {
		if (!hasExperiment || flagVariant !== undefined) return

		const timeout = setTimeout(() => {
			setHasTimedOut(true)
		}, 2000)

		return () => clearTimeout(timeout)
	}, [hasExperiment, flagVariant])

	// Track exposure with our analytics abstraction (in addition to PostHog's automatic tracking)
	useEffect(() => {
		// Skip tracking if no experiment is configured or not ready
		if (!hasExperiment || !hasMounted || flagVariant === undefined) return

		let retryTimeout: NodeJS.Timeout | null = null
		const MAX_RETRY_ATTEMPTS = 50 // 5 seconds max (50 * 100ms)

		const trackExposure = (attempts = 0) => {
			if (!analytics.isReady()) {
				if (attempts >= MAX_RETRY_ATTEMPTS) {
					// Give up after max attempts - analytics may not be configured
					return
				}
				// Store the timeout ID so we can clear it on unmount
				retryTimeout = setTimeout(() => trackExposure(attempts + 1), 100)
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

		return () => {
			// Clear any retry timeout that might be pending
			if (retryTimeout) {
				clearTimeout(retryTimeout)
			}
		}
	}, [hasExperiment, experimentKey, hasMounted, flagVariant, selectedVariant.variant, contentID])

	const { heading, description, callToAction, image, imagePosition = "right" } = selectedVariant
	const isImageLeft = imagePosition === "left"

	// Flag evaluation status for data attributes
	const isEvaluated = !hasExperiment ? "no-experiment" : (hasTimedOut ? "timed-out" : (flagVariant !== undefined ? "true" : "pending"))

	return (
		<section
			className={clsx(
				"pt-20 transition-opacity duration-300",
				// Fade in when variant is ready (slight fade effect for smoother transition)
				// If no experiment or timed out, always full opacity
				!hasExperiment || hasTimedOut || (hasMounted && flagVariant !== undefined) ? "opacity-100" : "opacity-95"
			)}
			data-agility-component={contentID}
			data-experiment-key={hasExperiment ? experimentKey : undefined}
			data-variant={selectedVariant.variant}
			data-evaluated={isEvaluated}
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
