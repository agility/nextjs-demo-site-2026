"use client"

/**
 * useTimeOnPage Hook
 *
 * Tracks time spent on page and fires analytics events at milestones
 * (30s, 60s, 120s, 300s by default).
 *
 * Features:
 * - Pauses when page is not visible (tab backgrounded)
 * - Resets on route changes
 * - Only fires each milestone once per page
 * - Respects page visibility API
 */

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { analytics, getTrackingContext } from '@/lib/analytics'
import { TimeMilestones, type TimeMilestone } from '@/lib/analytics/events'

interface TimeOnPageOptions {
	/** Custom milestones in seconds (default: [30, 60, 120, 300]) */
	milestones?: readonly number[]
	/** Check interval in ms (default: 1000) */
	intervalMs?: number
	/** Disable tracking */
	disabled?: boolean
}

/**
 * Hook to track time on page milestones
 */
export function useTimeOnPage(options: TimeOnPageOptions = {}) {
	const {
		milestones = TimeMilestones,
		intervalMs = 1000,
		disabled = false,
	} = options

	const pathname = usePathname()
	const reachedMilestones = useRef<Set<number>>(new Set())
	const timeOnPage = useRef<number>(0)
	const isVisible = useRef<boolean>(true)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	// Reset on route change
	useEffect(() => {
		reachedMilestones.current = new Set()
		timeOnPage.current = 0
	}, [pathname])

	// Track milestone
	const trackMilestone = useCallback((seconds: number) => {
		if (reachedMilestones.current.has(seconds)) return

		const context = getTrackingContext()

		analytics.trackTimeMilestone({
			seconds,
			isVisible: isVisible.current,
			path: context.path,
			title: context.title,
			audience: context.audience,
			region: context.region,
		})

		reachedMilestones.current.add(seconds)
	}, [])

	// Handle visibility change
	useEffect(() => {
		if (disabled || typeof document === 'undefined') return

		const handleVisibilityChange = () => {
			isVisible.current = document.visibilityState === 'visible'
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [disabled])

	// Time tracking interval
	useEffect(() => {
		if (disabled || typeof window === 'undefined') return

		intervalRef.current = setInterval(() => {
			// Only count time when page is visible
			if (!isVisible.current) return

			timeOnPage.current += intervalMs / 1000

			// Check milestones
			for (const milestone of milestones) {
				if (timeOnPage.current >= milestone && !reachedMilestones.current.has(milestone)) {
					trackMilestone(milestone)
				}
			}
		}, intervalMs)

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [disabled, milestones, intervalMs, trackMilestone])

	return {
		/** Current time on page in seconds */
		getTimeOnPage: () => timeOnPage.current,
		/** Whether page is currently visible */
		isPageVisible: () => isVisible.current,
		/** Milestones that have been reached */
		reachedMilestones: reachedMilestones.current,
	}
}
