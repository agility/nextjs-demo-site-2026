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
 * Queue for events that arrive before PostHog is ready
 */
type QueuedEvent =
	| { type: 'identify'; userId: string; traits?: UserTraits }
	| { type: 'track'; event: string; properties?: EventProperties }
	| { type: 'page'; name: string; properties?: PageViewProperties }
	| { type: 'group'; groupId: string; traits?: GroupTraits }

const eventQueue: QueuedEvent[] = []
let isFlushingQueue = false

/**
 * Get the PostHog client instance
 * Returns null on server side or if PostHog isn't initialized
 */
function getPostHog() {
	if (typeof window === 'undefined') return null
	// Access the posthog instance exposed on window by instrumentation-client.ts
	const posthog = window.posthog
	return posthog?.__loaded ? posthog : null
}

/**
 * Wait for PostHog to be ready and flush queued events
 */
function waitForPostHogAndFlush() {
	if (isFlushingQueue) return
	isFlushingQueue = true

	const checkAndFlush = () => {
		const posthog = getPostHog()
		if (posthog && eventQueue.length > 0) {
			console.log(`[Analytics] Flushing ${eventQueue.length} queued events to PostHog`)
			while (eventQueue.length > 0) {
				const event = eventQueue.shift()!
				switch (event.type) {
					case 'identify':
						PostHogProvider.identify(event.userId, event.traits)
						break
					case 'track':
						PostHogProvider.track(event.event, event.properties)
						break
					case 'page':
						PostHogProvider.page(event.name, event.properties)
						break
					case 'group':
						PostHogProvider.group(event.groupId, event.traits)
						break
				}
			}
			isFlushingQueue = false
		} else if (!posthog) {
			// Retry in 100ms
			setTimeout(checkAndFlush, 100)
		} else {
			isFlushingQueue = false
		}
	}

	checkAndFlush()
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
		if (!posthog) {
			// Queue the event and wait for PostHog to be ready
			eventQueue.push({ type: 'identify', userId, traits })
			waitForPostHogAndFlush()
			return
		}

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
		if (!posthog) {
			// Queue the event and wait for PostHog to be ready
			eventQueue.push({ type: 'track', event, properties })
			waitForPostHogAndFlush()
			return
		}

		// Add timestamp if not provided
		const enrichedProperties = {
			...properties,
			timestamp: properties?.timestamp || new Date().toISOString(),
		}

		posthog.capture(event, enrichedProperties)
	},

	page(name: string, properties?: PageViewProperties) {
		const posthog = getPostHog()
		if (!posthog) {
			// Queue the event and wait for PostHog to be ready
			eventQueue.push({ type: 'page', name, properties })
			waitForPostHogAndFlush()
			return
		}

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
			// Agility CMS context
			pageID: properties?.pageID,
			contentIDs: properties?.contentIDs,
		})
	},

	group(groupId: string, traits?: GroupTraits) {
		const posthog = getPostHog()
		if (!posthog) {
			// Queue the event and wait for PostHog to be ready
			eventQueue.push({ type: 'group', groupId, traits })
			waitForPostHogAndFlush()
			return
		}

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
