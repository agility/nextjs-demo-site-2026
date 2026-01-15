"use client"

/**
 * UserIdentifier Component
 *
 * Handles user identification and property setting for analytics.
 * Sets user properties for segmentation in analytics dashboards.
 *
 * Properties tracked:
 * - audience: Current audience segment from URL
 * - region: Current region from URL
 * - locale: User's language/locale
 * - firstSeen: First visit timestamp
 * - sessionCount: Number of sessions
 *
 * This component should be placed in the root layout to ensure
 * user properties are set on every page load.
 */

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { analytics, getOrCreateUserId } from '@/lib/analytics'
import type { UserTraits } from '@/lib/analytics/types'

interface UserIdentifierProps {
	/** Current locale from server */
	locale: string
}

const SESSION_COUNT_KEY = 'analytics_session_count'
const LAST_SESSION_KEY = 'analytics_last_session'
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

/**
 * Get or increment session count
 * A new session starts after 30 minutes of inactivity
 */
function getSessionCount(): number {
	if (typeof window === 'undefined') return 1

	const now = Date.now()
	const lastSession = parseInt(localStorage.getItem(LAST_SESSION_KEY) || '0', 10)
	let sessionCount = parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0', 10)

	// Check if this is a new session
	if (now - lastSession > SESSION_TIMEOUT) {
		sessionCount += 1
		localStorage.setItem(SESSION_COUNT_KEY, sessionCount.toString())
	}

	// Update last session timestamp
	localStorage.setItem(LAST_SESSION_KEY, now.toString())

	return sessionCount
}

/**
 * Get first seen timestamp, or set it if not present
 */
function getFirstSeen(): string {
	if (typeof window === 'undefined') return new Date().toISOString()

	const FIRST_SEEN_KEY = 'analytics_first_seen'
	let firstSeen = localStorage.getItem(FIRST_SEEN_KEY)

	if (!firstSeen) {
		firstSeen = new Date().toISOString()
		localStorage.setItem(FIRST_SEEN_KEY, firstSeen)
	}

	return firstSeen
}

export function UserIdentifier({ locale }: UserIdentifierProps) {
	const searchParams = useSearchParams()
	const identifiedRef = useRef(false)
	const lastPropertiesRef = useRef<string>('')

	useEffect(() => {
		// Get current audience and region from URL
		const audience = searchParams.get('audience') || undefined
		const region = searchParams.get('region') || undefined

		// Build user traits
		const traits: UserTraits = {
			locale,
			audience,
			region,
			firstSeen: getFirstSeen(),
			sessionCount: getSessionCount(),
		}

		// Create a hash of properties to detect changes
		const propertiesHash = JSON.stringify({ audience, region, locale })

		// Only identify if we haven't yet or if properties changed
		if (!identifiedRef.current || propertiesHash !== lastPropertiesRef.current) {
			const userId = getOrCreateUserId()

			// Wait for analytics to be ready
			const identify = () => {
				if (analytics.isReady()) {
					analytics.identify(userId, traits)
					identifiedRef.current = true
					lastPropertiesRef.current = propertiesHash
				} else {
					// Retry after a short delay
					setTimeout(identify, 100)
				}
			}

			identify()
		}
	}, [searchParams, locale])

	// This component doesn't render anything
	return null
}
