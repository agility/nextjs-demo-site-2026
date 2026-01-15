/**
 * Analytics Event Constants
 *
 * Centralized event names for consistent tracking across the application.
 * Using constants prevents typos and enables autocomplete.
 *
 * Event naming convention:
 * - Use snake_case for event names (most analytics platforms prefer this)
 * - Use descriptive, action-oriented names
 * - Group related events with common prefixes
 */

export const AnalyticsEvents = {
	// ============================================
	// Page & Navigation Events
	// ============================================
	/** Page viewed - fired on route changes */
	PAGE_VIEWED: 'page_viewed',

	/** Outbound link clicked - user leaving site */
	OUTBOUND_LINK_CLICKED: 'outbound_link_clicked',

	// ============================================
	// Engagement Events
	// ============================================
	/** Scroll depth milestone reached */
	SCROLL_MILESTONE: 'scroll_milestone',

	/** Time on page milestone reached */
	TIME_MILESTONE: 'time_milestone',

	/** CTA button clicked */
	CTA_CLICKED: 'cta_clicked',

	/** Video played */
	VIDEO_PLAYED: 'video_played',

	/** Video completed */
	VIDEO_COMPLETED: 'video_completed',

	// ============================================
	// Personalization Events
	// ============================================
	/** Personalization applied based on audience/region */
	PERSONALIZATION_APPLIED: 'personalization_applied',

	/** Personalized content viewed */
	PERSONALIZED_CONTENT_VIEWED: 'personalized_content_viewed',

	/** User changed their audience selection */
	AUDIENCE_CHANGED: 'audience_changed',

	/** User changed their region selection */
	REGION_CHANGED: 'region_changed',

	// ============================================
	// A/B Testing Events
	// ============================================
	/** User exposed to an experiment variant */
	EXPERIMENT_EXPOSURE: 'experiment_exposure',

	/** User interacted with experiment variant */
	EXPERIMENT_INTERACTION: 'experiment_interaction',

	// ============================================
	// Form Events
	// ============================================
	/** Form started (first field focused) */
	FORM_STARTED: 'form_started',

	/** Form field completed */
	FORM_FIELD_COMPLETED: 'form_field_completed',

	/** Form submitted successfully */
	FORM_SUBMITTED: 'form_submitted',

	/** Form submission failed */
	FORM_ERROR: 'form_error',

	/** Form abandoned (started but not completed) */
	FORM_ABANDONED: 'form_abandoned',

	// ============================================
	// Conversion Events
	// ============================================
	/** Generic conversion goal reached */
	CONVERSION: 'conversion',

	/** Demo/contact request submitted */
	DEMO_REQUESTED: 'demo_requested',

	/** Content/asset downloaded */
	CONTENT_DOWNLOADED: 'content_downloaded',

	/** Newsletter signup completed */
	NEWSLETTER_SIGNUP: 'newsletter_signup',

	// ============================================
	// AI/Search Events
	// ============================================
	/** AI search initiated */
	AI_SEARCH_STARTED: 'ai_search_started',

	/** AI search result clicked */
	AI_SEARCH_RESULT_CLICKED: 'ai_search_result_clicked',

	/** AI agent conversation started */
	AI_AGENT_STARTED: 'ai_agent_started',

	/** AI agent conversation completed */
	AI_AGENT_COMPLETED: 'ai_agent_completed',

	// ============================================
	// Error Events
	// ============================================
	/** JavaScript error occurred */
	ERROR_OCCURRED: 'error_occurred',

	/** API error occurred */
	API_ERROR: 'api_error',
} as const

/**
 * Type for event names - ensures only valid events are used
 */
export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]

/**
 * User property keys for consistent naming
 */
export const UserProperties = {
	AUDIENCE: 'audience',
	REGION: 'region',
	LOCALE: 'locale',
	FIRST_SEEN: 'first_seen',
	SESSION_COUNT: 'session_count',
	AB_TESTS: 'ab_tests',
	LAST_PAGE_VIEWED: 'last_page_viewed',
	PAGES_VIEWED_COUNT: 'pages_viewed_count',
} as const

/**
 * Scroll depth milestones to track
 */
export const ScrollMilestones = [25, 50, 75, 100] as const
export type ScrollMilestone = (typeof ScrollMilestones)[number]

/**
 * Time on page milestones to track (in seconds)
 */
export const TimeMilestones = [30, 60, 120, 300] as const
export type TimeMilestone = (typeof TimeMilestones)[number]
