"use client"

/**
 * useScrollTracking Hook
 *
 * Tracks scroll depth milestones (25%, 50%, 75%, 100%) and fires
 * analytics events when each milestone is reached.
 *
 * Features:
 * - Debounced scroll handling for performance
 * - Tracks time to reach each milestone
 * - Resets on route changes
 * - Only fires each milestone once per page
 */

import { useEffect, useRef, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { analytics, getTrackingContext } from '@/lib/analytics'
import { ScrollMilestones, type ScrollMilestone } from '@/lib/analytics/events'

interface ScrollTrackingOptions {
	/** Custom milestones to track (default: [25, 50, 75, 100]) */
	milestones?: readonly ScrollMilestone[]
	/** Debounce delay in ms (default: 100) */
	debounceMs?: number
	/** Disable tracking */
	disabled?: boolean
}

/**
 * Calculate current scroll depth as a percentage
 */
function getScrollDepth(): number {
	if (typeof window === 'undefined') return 0

	const scrollTop = window.scrollY
	const docHeight = document.documentElement.scrollHeight
	const winHeight = window.innerHeight
	const scrollableHeight = docHeight - winHeight

	if (scrollableHeight <= 0) return 100 // Page is not scrollable

	return Math.min(100, Math.round((scrollTop / scrollableHeight) * 100))
}

/**
 * Hook to track scroll depth milestones
 */
export function useScrollTracking(options: ScrollTrackingOptions = {}) {
	const {
		milestones = ScrollMilestones,
		debounceMs = 100,
		disabled = false,
	} = options

	const pathname = usePathname()
	const searchParams = useSearchParams()
	const reachedMilestones = useRef<Set<ScrollMilestone>>(new Set())
	const pageLoadTime = useRef<number>(Date.now())
	const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

	// Build a full path key including search params for reset detection
	const fullPath = searchParams.toString()
		? `${pathname}?${searchParams.toString()}`
		: pathname

	// Reset milestones on route change (including search param changes)
	// This matches PageviewTracker's behavior of firing new pageviews on search param changes
	useEffect(() => {
		reachedMilestones.current = new Set()
		pageLoadTime.current = Date.now()
	}, [fullPath])

	// Track milestone
	const trackMilestone = useCallback((milestone: ScrollMilestone) => {
		if (reachedMilestones.current.has(milestone)) return

		const context = getTrackingContext()
		const timeToReach = Date.now() - pageLoadTime.current

		analytics.trackScrollMilestone({
			depth: milestone,
			timeToReach,
			path: context.path,
			title: context.title,
			locale: context.locale,
			audience: context.audience,
			region: context.region,
			// Agility CMS context for page-level analytics
			pageID: context.pageID,
			contentIDs: context.contentIDs,
		})

		reachedMilestones.current.add(milestone)
	}, [])

	// Handle scroll event
	const handleScroll = useCallback(() => {
		if (disabled) return

		// Clear existing timeout
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current)
		}

		// Debounce the scroll handling
		debounceTimeout.current = setTimeout(() => {
			const depth = getScrollDepth()

			// Check each milestone
			for (const milestone of milestones) {
				if (depth >= milestone && !reachedMilestones.current.has(milestone)) {
					trackMilestone(milestone)
				}
			}
		}, debounceMs)
	}, [disabled, milestones, debounceMs, trackMilestone])

	// Set up scroll listener
	useEffect(() => {
		if (disabled || typeof window === 'undefined') return

		window.addEventListener('scroll', handleScroll, { passive: true })

		// Check initial scroll position (user might land mid-page)
		handleScroll()

		return () => {
			window.removeEventListener('scroll', handleScroll)
			if (debounceTimeout.current) {
				clearTimeout(debounceTimeout.current)
			}
		}
	}, [handleScroll, disabled])

	return {
		/** Milestones that have been reached */
		reachedMilestones: reachedMilestones.current,
		/** Current scroll depth percentage */
		getCurrentDepth: getScrollDepth,
	}
}
