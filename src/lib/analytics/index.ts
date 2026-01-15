/**
 * Analytics Module
 *
 * Platform-agnostic analytics tracking for the Agility CMS demo site.
 *
 * This module provides a unified interface for tracking user interactions,
 * page views, and conversions. It's designed to be easily portable to
 * different analytics platforms (PostHog, GA4, Amplitude, Mixpanel, etc.).
 *
 * Usage:
 * ```typescript
 * import { analytics } from '@/lib/analytics'
 *
 * // Track events
 * analytics.track('cta_clicked', { ctaName: 'hero-signup', location: 'hero' })
 *
 * // Track page views
 * analytics.page('/blog', { locale: 'en-us', audience: 'Enterprise' })
 *
 * // Identify users
 * analytics.identify('user-123', { audience: 'Enterprise', region: 'North America' })
 * ```
 *
 * To switch providers:
 * 1. Create a new provider implementing AnalyticsProvider interface
 * 2. Import it here and set it as activeProvider
 */

import { PostHogProvider } from './posthog-provider'
import type {
	AnalyticsProvider,
	CTAClickProperties,
	ConversionProperties,
	EventProperties,
	ExperimentProperties,
	FormProperties,
	GroupTraits,
	PageViewProperties,
	PersonalizationProperties,
	ScrollMilestoneProperties,
	TimeMilestoneProperties,
	UserTraits,
} from './types'
import { AnalyticsEvents } from './events'

// Export types and events for use throughout the app
export * from './types'
export * from './events'

/**
 * Active analytics provider
 * Change this to switch analytics platforms
 */
const activeProvider: AnalyticsProvider = PostHogProvider

/**
 * Debug mode - logs all analytics calls to console
 */
const DEBUG = process.env.NODE_ENV === 'development'

/**
 * Log analytics calls in development
 */
function debugLog(method: string, ...args: unknown[]) {
	if (DEBUG) {
		console.log(`[Analytics.${method}]`, ...args)
	}
}

/**
 * Main analytics interface
 * All tracking should go through this object
 */
export const analytics = {
	/**
	 * Get current provider name
	 */
	get providerName() {
		return activeProvider.name
	},

	/**
	 * Check if analytics is ready
	 */
	isReady(): boolean {
		return activeProvider.isReady()
	},

	/**
	 * Initialize analytics (called automatically)
	 */
	init() {
		activeProvider.init()
	},

	/**
	 * Identify a user with traits for segmentation
	 */
	identify(userId: string, traits?: UserTraits) {
		debugLog('identify', userId, traits)
		activeProvider.identify(userId, traits)
	},

	/**
	 * Track a custom event
	 */
	track(event: string, properties?: EventProperties) {
		debugLog('track', event, properties)
		activeProvider.track(event, properties)
	},

	/**
	 * Track a page view
	 */
	page(name: string, properties?: PageViewProperties) {
		debugLog('page', name, properties)
		activeProvider.page(name, properties)
	},

	/**
	 * Associate user with a group/company (B2B)
	 */
	group(groupId: string, traits?: GroupTraits) {
		debugLog('group', groupId, traits)
		activeProvider.group(groupId, traits)
	},

	/**
	 * Reset user identity (on logout)
	 */
	reset() {
		debugLog('reset')
		activeProvider.reset()
	},

	// ============================================
	// Typed Helper Methods for Common Events
	// ============================================

	/**
	 * Track CTA click
	 */
	trackCTAClick(properties: CTAClickProperties) {
		this.track(AnalyticsEvents.CTA_CLICKED, properties)
	},

	/**
	 * Track scroll milestone
	 */
	trackScrollMilestone(properties: ScrollMilestoneProperties) {
		this.track(AnalyticsEvents.SCROLL_MILESTONE, properties)
	},

	/**
	 * Track time on page milestone
	 */
	trackTimeMilestone(properties: TimeMilestoneProperties) {
		this.track(AnalyticsEvents.TIME_MILESTONE, properties)
	},

	/**
	 * Track personalization event
	 */
	trackPersonalization(properties: PersonalizationProperties) {
		this.track(AnalyticsEvents.PERSONALIZATION_APPLIED, properties)
	},

	/**
	 * Track personalized content view
	 */
	trackPersonalizedContentViewed(properties: PersonalizationProperties) {
		this.track(AnalyticsEvents.PERSONALIZED_CONTENT_VIEWED, properties)
	},

	/**
	 * Track audience change
	 */
	trackAudienceChange(properties: PersonalizationProperties) {
		this.track(AnalyticsEvents.AUDIENCE_CHANGED, properties)
	},

	/**
	 * Track region change
	 */
	trackRegionChange(properties: PersonalizationProperties) {
		this.track(AnalyticsEvents.REGION_CHANGED, properties)
	},

	/**
	 * Track experiment exposure
	 */
	trackExperimentExposure(properties: ExperimentProperties) {
		this.track(AnalyticsEvents.EXPERIMENT_EXPOSURE, properties)
	},

	/**
	 * Track form started
	 */
	trackFormStarted(properties: FormProperties) {
		this.track(AnalyticsEvents.FORM_STARTED, properties)
	},

	/**
	 * Track form submitted
	 */
	trackFormSubmitted(properties: FormProperties) {
		this.track(AnalyticsEvents.FORM_SUBMITTED, properties)
	},

	/**
	 * Track conversion
	 */
	trackConversion(properties: ConversionProperties) {
		this.track(AnalyticsEvents.CONVERSION, properties)
	},

	/**
	 * Track demo request (specific conversion type)
	 */
	trackDemoRequested(properties: Omit<ConversionProperties, 'goalName'>) {
		this.track(AnalyticsEvents.DEMO_REQUESTED, {
			...properties,
			goalName: 'demo_request',
		})
	},

	/**
	 * Track error
	 */
	trackError(error: Error, context?: Record<string, unknown>) {
		this.track(AnalyticsEvents.ERROR_OCCURRED, {
			error_message: error.message,
			error_stack: error.stack,
			...context,
		})
	},
}

/**
 * Get current URL parameters for tracking context
 * Extracts audience, region, locale, and UTM params
 */
export function getTrackingContext(): Partial<PageViewProperties> {
	if (typeof window === 'undefined') return {}

	const url = new URL(window.location.href)
	const params = url.searchParams

	return {
		path: url.pathname,
		title: document.title,
		referrer: document.referrer || undefined,
		audience: params.get('audience') || undefined,
		region: params.get('region') || undefined,
		utmSource: params.get('utm_source') || undefined,
		utmMedium: params.get('utm_medium') || undefined,
		utmCampaign: params.get('utm_campaign') || undefined,
		utmContent: params.get('utm_content') || undefined,
		utmTerm: params.get('utm_term') || undefined,
	}
}

/**
 * Helper to get or create a persistent user ID
 * Uses localStorage with fallback to session
 */
export function getOrCreateUserId(): string {
	if (typeof window === 'undefined') return 'server'

	const STORAGE_KEY = 'analytics_user_id'

	// Try localStorage first
	let userId = localStorage.getItem(STORAGE_KEY)

	if (!userId) {
		// Generate a new ID
		userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
		localStorage.setItem(STORAGE_KEY, userId)
	}

	return userId
}
