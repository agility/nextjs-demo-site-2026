"use client"

/**
 * AnalyticsProvider Component
 *
 * Wraps all analytics tracking components for easy integration into layouts.
 * This component handles:
 * - User identification and property setting
 * - Enhanced page view tracking
 * - Engagement tracking (scroll depth, time on page, outbound links)
 *
 * Usage in layout:
 * ```tsx
 * <Suspense fallback={null}>
 *   <AnalyticsProvider locale="en-us" />
 * </Suspense>
 * ```
 */

import { UserIdentifier } from './UserIdentifier'
import { PageviewTracker } from './PageviewTracker'
import { EngagementTracker } from './EngagementTracker'

interface AnalyticsProviderProps {
	/** Current locale from server */
	locale: string
	/** Disable user identification */
	disableUserIdentification?: boolean
	/** Disable page view tracking */
	disablePageviewTracking?: boolean
	/** Disable engagement tracking (scroll, time, outbound links) */
	disableEngagementTracking?: boolean
}

export function AnalyticsProvider({
	locale,
	disableUserIdentification = false,
	disablePageviewTracking = false,
	disableEngagementTracking = false,
}: AnalyticsProviderProps) {
	return (
		<>
			{!disableUserIdentification && <UserIdentifier locale={locale} />}
			{!disablePageviewTracking && <PageviewTracker locale={locale} />}
			{!disableEngagementTracking && <EngagementTracker />}
		</>
	)
}
