/**
 * Server-Side Event Tracking
 *
 * Track events from server-side code (API routes, server components, etc.)
 *
 * ALTERNATIVE IMPLEMENTATIONS:
 * ============================
 *
 * GOOGLE ANALYTICS 4 (Measurement Protocol):
 * ------------------------------------------
 * await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     client_id: distinctId,
 *     events: [{ name: event, params: properties }]
 *   })
 * })
 *
 * MIXPANEL:
 * ---------
 * mixpanel.track(event, { distinct_id: distinctId, ...properties })
 *
 * AMPLITUDE:
 * ----------
 * amplitude.track(event, properties, { user_id: distinctId })
 *
 * SEGMENT:
 * --------
 * analytics.track({ userId: distinctId, event, properties })
 */

import { getPostHogClient } from './get-client'

export async function trackEvent(
	event: string,
	distinctId: string,
	properties?: Record<string, any>
) {
	try {
		const client = getPostHogClient()
		if (!client) {
			// Analytics not configured - skip event tracking
			return
		}
		client.capture({
			distinctId,
			event,
			properties,
		})
	} catch (error) {
		console.warn(`Failed to track event ${event}:`, error)
	}
}
