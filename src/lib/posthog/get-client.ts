/**
 * Server-Side Analytics Client
 *
 * This module provides a server-side analytics client for tracking events and
 * evaluating feature flags. Currently configured for PostHog, but can be swapped
 * for other analytics providers.
 *
 * SWAPPING ANALYTICS PROVIDERS:
 * ============================
 *
 * To use a different analytics provider, replace the implementation below:
 *
 * GOOGLE ANALYTICS 4 (Measurement Protocol):
 * ------------------------------------------
 * import { BetaAnalyticsDataClient } from '@google-analytics/data'
 * // or use the Measurement Protocol directly for server-side tracking:
 * // POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXX&api_secret=XXX
 * // Env vars: GOOGLE_ANALYTICS_MEASUREMENT_ID, GOOGLE_ANALYTICS_API_SECRET
 *
 * MIXPANEL:
 * ---------
 * import Mixpanel from 'mixpanel'
 * const client = Mixpanel.init(process.env.MIXPANEL_TOKEN)
 * // Env vars: MIXPANEL_TOKEN
 *
 * AMPLITUDE:
 * ----------
 * import { Amplitude } from '@amplitude/analytics-node'
 * Amplitude.init(process.env.AMPLITUDE_API_KEY)
 * // Env vars: AMPLITUDE_API_KEY
 *
 * SEGMENT:
 * --------
 * import Analytics from '@segment/analytics-node'
 * const client = new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY })
 * // Env vars: SEGMENT_WRITE_KEY
 *
 * Note: For client-side tracking, see src/lib/analytics/posthog-provider.ts
 * which implements the AnalyticsProvider interface for easy provider swapping.
 */

import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null
let initAttempted = false

/**
 * Get the PostHog server-side client instance.
 * Returns null if PostHog credentials are not configured.
 *
 * Required environment variables:
 * - NEXT_PUBLIC_POSTHOG_KEY: Your PostHog project API key
 * - NEXT_PUBLIC_POSTHOG_HOST: PostHog host (e.g., https://us.posthog.com)
 */
export function getPostHogClient(): PostHog | null {
	if (!initAttempted) {
		initAttempted = true
		const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
		const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

		if (!postHogKey || !postHogHost) {
			// PostHog is not configured - analytics will be disabled
			return null
		}

		posthogClient = new PostHog(postHogKey, {
			host: postHogHost,
		})
	}

	return posthogClient
}
