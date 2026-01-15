"use client"

/**
 * PersonalizationTracker Component
 *
 * Tracks when personalized content is displayed to users.
 * This component is embedded in server-rendered personalized components
 * to fire client-side analytics events.
 *
 * Usage in a server component:
 * ```tsx
 * <PersonalizationTracker
 *   audience="Enterprise"
 *   component="PersonalizedBackgroundHero"
 *   contentId={contentID}
 *   isPersonalized={true}
 * />
 * ```
 */

import { useEffect, useRef } from 'react'
import { analytics } from '@/lib/analytics'
import type { PersonalizationProperties } from '@/lib/analytics/types'

interface PersonalizationTrackerProps {
	/** Current audience being shown (null if default) */
	audience?: string | null
	/** Current region being shown (null if default) */
	region?: string | null
	/** Component name for tracking */
	component: string
	/** Content ID from Agility CMS */
	contentId?: number
	/** Whether personalized content is being shown (vs default) */
	isPersonalized: boolean
}

export function PersonalizationTracker({
	audience,
	region,
	component,
	contentId,
	isPersonalized,
}: PersonalizationTrackerProps) {
	const trackedRef = useRef(false)

	useEffect(() => {
		// Only track once per mount, and only if personalization was applied
		if (trackedRef.current) return

		// Determine personalization type
		const hasAudience = audience !== null && audience !== undefined
		const hasRegion = region !== null && region !== undefined

		if (!hasAudience && !hasRegion) {
			// No personalization active, don't track
			return
		}

		let personalizationType: 'audience' | 'region' | 'both' = 'audience'
		if (hasAudience && hasRegion) {
			personalizationType = 'both'
		} else if (hasRegion) {
			personalizationType = 'region'
		}

		const trackPersonalization = () => {
			if (!analytics.isReady()) {
				setTimeout(trackPersonalization, 100)
				return
			}

			const properties: PersonalizationProperties = {
				personalizationType,
				audience: audience || undefined,
				region: region || undefined,
				component,
				contentId,
				path: typeof window !== 'undefined' ? window.location.pathname : undefined,
			}

			if (isPersonalized) {
				// Track that personalized content was shown
				analytics.trackPersonalizedContentViewed(properties)
			} else {
				// Track that personalization context exists but default content shown
				analytics.trackPersonalization({
					...properties,
					personalizationType,
				})
			}

			trackedRef.current = true
		}

		trackPersonalization()
	}, [audience, region, component, contentId, isPersonalized])

	// This component doesn't render anything visible
	return null
}
