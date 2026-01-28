"use client"

/**
 * PageviewTracker Component
 *
 * Tracks page views with enhanced context including:
 * - Page path and title
 * - Locale
 * - Audience and region (personalization context)
 * - UTM parameters
 * - Page load performance
 * - Agility CMS page ID and content IDs
 *
 * This component uses Next.js usePathname and useSearchParams hooks
 * to detect route changes and fire page view events.
 */

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { analytics, getTrackingContext, getAgilityContext } from '@/lib/analytics'
import type { PageViewProperties } from '@/lib/analytics/types'

interface PageviewTrackerProps {
	/** Current locale from server */
	locale: string
}

/**
 * Get page load performance metrics
 * Only valid for the initial full page load, not SPA navigations
 */
function getLoadTime(isInitialLoad: boolean): number | undefined {
	// Only return load time for the initial page load
	// For SPA navigations, the navigation timing is stale
	if (!isInitialLoad) return undefined
	if (typeof window === 'undefined' || !window.performance) return undefined

	const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined

	if (navigation && navigation.loadEventEnd > 0) {
		return Math.round(navigation.loadEventEnd - navigation.startTime)
	}

	return undefined
}

// Track if this is the first page view (initial full page load)
let isFirstPageView = true

export function PageviewTracker({ locale }: PageviewTrackerProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const lastTrackedPath = useRef<string>('')
	const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		// Build the full path including search params for uniqueness check
		const searchString = searchParams.toString()
		const fullPath = searchString ? `${pathname}?${searchString}` : pathname

		// Avoid duplicate tracking for the same path
		if (fullPath === lastTrackedPath.current) {
			return
		}

		// Get current context
		const context = getTrackingContext()

		// Build page view properties
		const properties: PageViewProperties = {
			path: pathname,
			title: typeof document !== 'undefined' ? document.title : undefined,
			locale,
			audience: searchParams.get('audience') || undefined,
			region: searchParams.get('region') || undefined,
			referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
			// UTM parameters
			utmSource: searchParams.get('utm_source') || context.utmSource,
			utmMedium: searchParams.get('utm_medium') || context.utmMedium,
			utmCampaign: searchParams.get('utm_campaign') || context.utmCampaign,
			utmContent: searchParams.get('utm_content') || context.utmContent,
			utmTerm: searchParams.get('utm_term') || context.utmTerm,
			timestamp: new Date().toISOString(),
		}

		// Track the page view with retry logic that properly cleans up
		const trackPageView = () => {
			if (analytics.isReady()) {
				// Add load time only for initial full page load (not SPA navigations)
				properties.loadTime = getLoadTime(isFirstPageView)
				// Mark that we've had the first page view
				isFirstPageView = false

				// Add Agility CMS context (page ID and content IDs)
				// This is done at track time to ensure DOM is fully rendered
				const agilityContext = getAgilityContext()
				properties.pageID = agilityContext.pageID
				properties.contentIDs = agilityContext.contentIDs

				analytics.page(pathname, properties)
				lastTrackedPath.current = fullPath
			} else {
				// Retry after a short delay if analytics isn't ready
				// Store the timeout ID so we can clear it on unmount
				retryTimeoutRef.current = setTimeout(trackPageView, 100)
			}
		}

		// Slight delay to ensure title is set and performance metrics are available
		const timeoutId = setTimeout(trackPageView, 100)

		return () => {
			clearTimeout(timeoutId)
			// Also clear any retry timeout that might be pending
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current)
				retryTimeoutRef.current = null
			}
		}
	}, [pathname, searchParams, locale])

	// This component doesn't render anything
	return null
}
