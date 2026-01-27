"use client"

/**
 * EngagementTracker Component
 *
 * Comprehensive engagement tracking component that monitors:
 * - Scroll depth (25%, 50%, 75%, 100%)
 * - Time on page (30s, 60s, 120s, 300s)
 * - Outbound link clicks
 *
 * This component should be placed in the root layout to track
 * engagement across all pages.
 */

import { useEffect } from 'react'
import { useScrollTracking } from '@/lib/analytics/hooks/useScrollTracking'
import { useTimeOnPage } from '@/lib/analytics/hooks/useTimeOnPage'
import { analytics, getTrackingContext, getNearestContentID } from '@/lib/analytics'
import { AnalyticsEvents } from '@/lib/analytics/events'

interface EngagementTrackerProps {
	/** Disable scroll tracking */
	disableScrollTracking?: boolean
	/** Disable time tracking */
	disableTimeTracking?: boolean
	/** Disable outbound link tracking */
	disableOutboundTracking?: boolean
}

/**
 * Check if a URL is external (different domain)
 */
function isExternalLink(href: string): boolean {
	if (!href || href.startsWith('#') || href.startsWith('/')) return false

	try {
		const url = new URL(href, window.location.origin)
		return url.hostname !== window.location.hostname
	} catch {
		return false
	}
}

export function EngagementTracker({
	disableScrollTracking = false,
	disableTimeTracking = false,
	disableOutboundTracking = false,
}: EngagementTrackerProps) {
	// Initialize scroll tracking
	useScrollTracking({ disabled: disableScrollTracking })

	// Initialize time on page tracking
	useTimeOnPage({ disabled: disableTimeTracking })

	// Track outbound link clicks
	useEffect(() => {
		if (disableOutboundTracking || typeof document === 'undefined') return

		const handleClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement
			const link = target.closest('a')

			if (!link) return

			const href = link.getAttribute('href')
			if (!href || !isExternalLink(href)) return

			const context = getTrackingContext()
			const contentID = getNearestContentID(link)

			analytics.track(AnalyticsEvents.OUTBOUND_LINK_CLICKED, {
				url: href,
				text: link.textContent?.trim().substring(0, 100),
				path: context.path,
				locale: context.locale,
				audience: context.audience,
				region: context.region,
				// Agility CMS context
				pageID: context.pageID,
				contentID, // The specific component this link is in
			})
		}

		document.addEventListener('click', handleClick)

		return () => {
			document.removeEventListener('click', handleClick)
		}
	}, [disableOutboundTracking])

	// This component doesn't render anything
	return null
}
