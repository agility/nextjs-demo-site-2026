/**
 * Analytics Types
 *
 * Platform-agnostic type definitions for analytics tracking.
 * These types are designed to be portable across different analytics platforms
 * (PostHog, GA4, Amplitude, Mixpanel, Segment, etc.)
 */

/**
 * User traits for identification
 * These become user properties in your analytics platform
 */
export interface UserTraits {
	/** Current audience segment (e.g., "Enterprise", "SMB", "Developer") */
	audience?: string
	/** Current region (e.g., "North America", "Europe") */
	region?: string
	/** User's locale/language preference */
	locale?: string
	/** First time the user was seen (ISO timestamp) */
	firstSeen?: string
	/** Number of sessions this user has had */
	sessionCount?: number
	/** Active A/B test variants */
	abTests?: Record<string, string>
	/** Custom traits can be added */
	[key: string]: unknown
}

/**
 * Group/Company traits for B2B analytics
 */
export interface GroupTraits {
	/** Company/organization name */
	name?: string
	/** Industry vertical */
	industry?: string
	/** Company size */
	size?: string
	/** Plan or tier */
	plan?: string
	/** Custom traits */
	[key: string]: unknown
}

/**
 * Base properties included with every event
 */
export interface BaseEventProperties {
	/** Page path where event occurred */
	path?: string
	/** Page title */
	title?: string
	/** Current locale */
	locale?: string
	/** Current audience segment */
	audience?: string
	/** Current region */
	region?: string
	/** Event timestamp */
	timestamp?: string
	/** Allow additional custom properties */
	[key: string]: unknown
}

/**
 * Page view specific properties
 */
export interface PageViewProperties extends BaseEventProperties {
	/** Referrer URL */
	referrer?: string
	/** UTM source */
	utmSource?: string
	/** UTM medium */
	utmMedium?: string
	/** UTM campaign */
	utmCampaign?: string
	/** UTM content */
	utmContent?: string
	/** UTM term */
	utmTerm?: string
	/** Page load time in ms */
	loadTime?: number
}

/**
 * CTA click event properties
 */
export interface CTAClickProperties extends BaseEventProperties {
	/** Name/identifier of the CTA */
	ctaName: string
	/** Destination URL */
	ctaUrl?: string
	/** Text displayed on the CTA */
	ctaText?: string
	/** Location on page (e.g., "hero", "footer", "sidebar") */
	location?: string
	/** Component that contains the CTA */
	component?: string
}

/**
 * Scroll milestone event properties
 */
export interface ScrollMilestoneProperties extends BaseEventProperties {
	/** Scroll depth percentage (25, 50, 75, 100) */
	depth: 25 | 50 | 75 | 100
	/** Time spent before reaching this depth (ms) */
	timeToReach?: number
}

/**
 * Time on page milestone properties
 */
export interface TimeMilestoneProperties extends BaseEventProperties {
	/** Seconds spent on page */
	seconds: number
	/** Whether page is currently visible */
	isVisible?: boolean
}

/**
 * Personalization event properties
 */
export interface PersonalizationProperties extends BaseEventProperties {
	/** Type of personalization applied */
	personalizationType: 'audience' | 'region' | 'both'
	/** Previous audience (for change events) */
	previousAudience?: string
	/** Previous region (for change events) */
	previousRegion?: string
	/** Component showing personalized content */
	component?: string
	/** Content ID of personalized content */
	contentId?: number
}

/**
 * A/B Test experiment properties
 */
export interface ExperimentProperties extends BaseEventProperties {
	/** Experiment/feature flag key */
	experimentKey: string
	/** Variant assigned to user */
	variant: string
	/** Component running the experiment */
	component?: string
	/** Content ID */
	contentId?: number
}

/**
 * Conversion event properties
 */
export interface ConversionProperties extends BaseEventProperties {
	/** Name of the conversion goal */
	goalName: string
	/** Monetary value if applicable */
	value?: number
	/** Currency code */
	currency?: string
	/** Additional context */
	metadata?: Record<string, unknown>
}

/**
 * Form interaction properties
 */
export interface FormProperties extends BaseEventProperties {
	/** Form identifier/name */
	formName: string
	/** Form step (for multi-step forms) */
	step?: number
	/** Total steps in form */
	totalSteps?: number
	/** Fields that were filled (names only, not values) */
	filledFields?: string[]
}

/**
 * Generic event properties - use specific types when possible
 */
export interface EventProperties extends BaseEventProperties {
	[key: string]: unknown
}

/**
 * Analytics provider interface
 * Implement this interface to add support for any analytics platform
 */
export interface AnalyticsProvider {
	/** Provider name for debugging */
	name: string

	/**
	 * Initialize the analytics provider
	 * Called once when analytics is set up
	 */
	init(): void

	/**
	 * Identify a user with traits
	 * @param userId - Unique user identifier
	 * @param traits - User properties for segmentation
	 */
	identify(userId: string, traits?: UserTraits): void

	/**
	 * Track a custom event
	 * @param event - Event name
	 * @param properties - Event properties
	 */
	track(event: string, properties?: EventProperties): void

	/**
	 * Track a page view
	 * @param name - Page name/path
	 * @param properties - Page view properties
	 */
	page(name: string, properties?: PageViewProperties): void

	/**
	 * Associate user with a group/company (B2B)
	 * @param groupId - Group identifier
	 * @param traits - Group properties
	 */
	group(groupId: string, traits?: GroupTraits): void

	/**
	 * Reset/clear user identity (on logout)
	 */
	reset(): void

	/**
	 * Check if provider is ready
	 */
	isReady(): boolean
}
