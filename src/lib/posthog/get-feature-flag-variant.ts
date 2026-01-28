/**
 * Server-Side Feature Flag Evaluation
 *
 * Evaluate feature flags server-side for feature rollouts and gradual deployments.
 * Returns the variant key/value, or undefined if not configured/error.
 *
 * IMPORTANT: For A/B testing experiments, prefer client-side evaluation using
 * PostHog's useFeatureFlagVariantKey hook. See docs/developer/AB_TESTING.md.
 *
 * Server-side evaluation is best for:
 * - Feature rollouts (boolean flags)
 * - Server-only features (API behavior, backend logic)
 * - Cases where you MUST evaluate before rendering (rare)
 *
 * Trade-off: Using cookies()/headers() in Next.js App Router opts routes into
 * dynamic rendering, which impacts performance. Client-side evaluation keeps
 * routes static while PostHog handles user identification automatically.
 *
 * ALTERNATIVE IMPLEMENTATIONS:
 * ============================
 *
 * LAUNCHDARKLY:
 * -------------
 * import LaunchDarkly from '@launchdarkly/node-server-sdk'
 * const client = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY)
 * const variant = await client.variation(flagKey, { key: distinctId, ...userProperties }, defaultValue)
 *
 * SPLIT.IO:
 * ---------
 * import { SplitFactory } from '@splitsoftware/splitio'
 * const client = factory.client()
 * const variant = client.getTreatment(distinctId, flagKey, userProperties)
 *
 * STATSIG:
 * --------
 * import Statsig from 'statsig-node'
 * await Statsig.initialize(process.env.STATSIG_SERVER_KEY)
 * const variant = Statsig.checkGate({ userID: distinctId }, flagKey)
 * // or for experiments: Statsig.getExperiment({ userID: distinctId }, experimentKey)
 *
 * GROWTHBOOK:
 * -----------
 * import { GrowthBook } from '@growthbook/growthbook'
 * const gb = new GrowthBook({ apiHost: '...', clientKey: '...' })
 * const variant = gb.getFeatureValue(flagKey, defaultValue)
 *
 * Note: When returning undefined, components should fall back to a default/control variant.
 */

import { getPostHogClient } from './get-client'

export async function getFeatureFlagVariant(
	flagKey: string,
	distinctId: string,
	userProperties?: Record<string, any>
): Promise<string | boolean | undefined> {
	try {
		const client = getPostHogClient()
		if (!client) {
			// Feature flags not configured - return undefined to use default variant
			return undefined
		}
		const variant = await client.getFeatureFlag(flagKey, distinctId, userProperties)
		return variant
	} catch (error) {
		console.warn(`Failed to get feature flag ${flagKey}:`, error)
		return undefined
	}
}
