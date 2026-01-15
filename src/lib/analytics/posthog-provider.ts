/**
 * PostHog Analytics Provider
 *
 * Implementation of the AnalyticsProvider interface for PostHog.
 * This is the default provider for this application.
 *
 * PostHog-specific features:
 * - Automatic session recording
 * - Feature flags integration
 * - Autocapture (can be disabled if you want full control)
 *
 * To switch to a different provider, create a new implementation
 * of AnalyticsProvider and swap it in the main analytics module.
 */

import type {
	AnalyticsProvider,
	EventProperties,
	GroupTraits,
	PageViewProperties,
	UserTraits,
} from './types'

/**
 * Get the PostHog client instance
 * Returns null on server side or if PostHog isn't initialized
 */
function getPostHog() {
	if (typeof window === 'undefined') return null

	// Dynamic import to avoid SSR issues
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const posthog = require('posthog-js').default
		return posthog?.__loaded ? posthog : null
	} catch {
		return null
	}
}

/**
 * PostHog Analytics Provider
 */
export const PostHogProvider: AnalyticsProvider = {
	name: 'PostHog',

	init() {
		// PostHog is initialized in instrumentation-client.ts
		// This method exists for providers that need lazy initialization
		console.log('[Analytics] PostHog provider ready')
	},

	identify(userId: string, traits?: UserTraits) {
		const posthog = getPostHog()
		if (!posthog) return

		// PostHog identify sets the distinct_id and user properties
		posthog.identify(userId, {
			...traits,
			// Ensure consistent property naming for PostHog
			$set: traits,
			$set_once: {
				first_seen: traits?.firstSeen || new Date().toISOString(),
			},
		})

		console.log('[Analytics] User identified:', userId)
	},

	track(event: string, properties?: EventProperties) {
		const posthog = getPostHog()
		if (!posthog) return

		// Add timestamp if not provided
		const enrichedProperties = {
			...properties,
			timestamp: properties?.timestamp || new Date().toISOString(),
		}

		posthog.capture(event, enrichedProperties)
	},

	page(name: string, properties?: PageViewProperties) {
		const posthog = getPostHog()
		if (!posthog) return

		// PostHog doesn't have a dedicated page() method like Segment
		// We use capture with $pageview event and custom properties
		posthog.capture('$pageview', {
			$current_url: typeof window !== 'undefined' ? window.location.href : undefined,
			$pathname: properties?.path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
			$referrer: properties?.referrer,
			$title: properties?.title || (typeof document !== 'undefined' ? document.title : undefined),
			// Custom properties
			page_name: name,
			locale: properties?.locale,
			audience: properties?.audience,
			region: properties?.region,
			// UTM parameters
			utm_source: properties?.utmSource,
			utm_medium: properties?.utmMedium,
			utm_campaign: properties?.utmCampaign,
			utm_content: properties?.utmContent,
			utm_term: properties?.utmTerm,
			// Performance
			load_time_ms: properties?.loadTime,
		})
	},

	group(groupId: string, traits?: GroupTraits) {
		const posthog = getPostHog()
		if (!posthog) return

		// PostHog uses group() for B2B company-level tracking
		posthog.group('company', groupId, traits)
	},

	reset() {
		const posthog = getPostHog()
		if (!posthog) return

		posthog.reset()
		console.log('[Analytics] User identity reset')
	},

	isReady(): boolean {
		const posthog = getPostHog()
		return posthog !== null
	},
}

/**
 * Helper to wait for PostHog to be ready
 * Useful for components that need to track on mount
 */
export function waitForPostHog(callback: () => void, maxAttempts = 10): void {
	let attempts = 0

	const check = () => {
		attempts++
		const posthog = getPostHog()

		if (posthog) {
			callback()
		} else if (attempts < maxAttempts) {
			setTimeout(check, 100)
		} else {
			console.warn('[Analytics] PostHog not available after max attempts')
		}
	}

	check()
}
