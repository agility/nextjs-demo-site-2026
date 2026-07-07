/**
 * Strongly typed environment variables utility
 * Provides runtime validation and type safety for environment variables
 */

type RequiredEnvVars = {
	// Agility CMS
	AGILITY_GUID: string
	AGILITY_API_FETCH_KEY: string
	AGILITY_API_PREVIEW_KEY: string
	AGILITY_SECURITY_KEY: string
	AGILITY_LOCALES: string
	AGILITY_SITEMAP: string

	// PostHog
	NEXT_PUBLIC_POSTHOG_KEY: string
	NEXT_PUBLIC_POSTHOG_HOST: string

	// Node.js
	NODE_ENV: 'development' | 'production' | 'test'
}

type OptionalEnvVars = {
	// Social media auto-publishing (Hootsuite)
	HOOTSUITE_ACCESS_TOKEN: string
	HOOTSUITE_PROFILE_IDS: string
	HOOTSUITE_API_URL: string
	// Agility management API (for writing socialPublishedDate back to CMS)
	AGILITY_API_MANAGEMENT_KEY: string
	// Site URL for building post links
	SITE_URL: string
	// Agility cache/revalidation durations (optional, default 60)
	AGILITY_FETCH_CACHE_DURATION: string
	AGILITY_PATH_REVALIDATE_DURATION: string
}

type EnvVars = RequiredEnvVars & Partial<OptionalEnvVars>

/**
 * Get a required environment variable with runtime validation
 */
function getRequiredEnvVar<K extends keyof RequiredEnvVars>(key: K): RequiredEnvVars[K] {
	const value = process.env[key]

	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`)
	}

	// Special validation for NODE_ENV
	if (key === 'NODE_ENV' && !['development', 'production', 'test'].includes(value)) {
		throw new Error(`Invalid NODE_ENV value: ${value}. Must be 'development', 'production', or 'test'`)
	}

	return value as RequiredEnvVars[K]
}

/**
 * Get an optional environment variable
 */
function getOptionalEnvVar<K extends keyof OptionalEnvVars>(key: K, defaultValue?: OptionalEnvVars[K]): OptionalEnvVars[K] | undefined {
	return process.env[key] as OptionalEnvVars[K] || defaultValue
}

/**
 * Get all environment variables with validation
 */
function getAllEnvVars(): EnvVars {
	return {
		// Agility CMS
		AGILITY_GUID: getRequiredEnvVar('AGILITY_GUID'),
		AGILITY_API_FETCH_KEY: getRequiredEnvVar('AGILITY_API_FETCH_KEY'),
		AGILITY_API_PREVIEW_KEY: getRequiredEnvVar('AGILITY_API_PREVIEW_KEY'),
		AGILITY_SECURITY_KEY: getRequiredEnvVar('AGILITY_SECURITY_KEY'),
		AGILITY_LOCALES: getRequiredEnvVar('AGILITY_LOCALES'),
		AGILITY_SITEMAP: getRequiredEnvVar('AGILITY_SITEMAP'),

		// PostHog
		NEXT_PUBLIC_POSTHOG_KEY: getRequiredEnvVar('NEXT_PUBLIC_POSTHOG_KEY'),
		NEXT_PUBLIC_POSTHOG_HOST: getRequiredEnvVar('NEXT_PUBLIC_POSTHOG_HOST'),

		// Node.js
		NODE_ENV: getRequiredEnvVar('NODE_ENV'),
	}
}

/**
 * Typed environment variables object
 * Use this instead of process.env for type safety
 */
export const env = {
	get: getRequiredEnvVar,
	getOptional: getOptionalEnvVar,
	getAll: getAllEnvVars,

	// Direct access to commonly used variables
	get AGILITY_GUID() { return getRequiredEnvVar('AGILITY_GUID') },
	get AGILITY_API_FETCH_KEY() { return getRequiredEnvVar('AGILITY_API_FETCH_KEY') },
	get AGILITY_API_PREVIEW_KEY() { return getRequiredEnvVar('AGILITY_API_PREVIEW_KEY') },
	get AGILITY_SECURITY_KEY() { return getRequiredEnvVar('AGILITY_SECURITY_KEY') },
	get AGILITY_LOCALES() { return getRequiredEnvVar('AGILITY_LOCALES') },
	get AGILITY_SITEMAP() { return getRequiredEnvVar('AGILITY_SITEMAP') },
	get AGILITY_FETCH_CACHE_DURATION() { return parseInt(process.env.AGILITY_FETCH_CACHE_DURATION || "60", 10) },
	get AGILITY_PATH_REVALIDATE_DURATION() { return parseInt(process.env.AGILITY_PATH_REVALIDATE_DURATION || "60", 10) },
	get NEXT_PUBLIC_POSTHOG_KEY() { return getRequiredEnvVar('NEXT_PUBLIC_POSTHOG_KEY') },
	get NEXT_PUBLIC_POSTHOG_HOST() { return getRequiredEnvVar('NEXT_PUBLIC_POSTHOG_HOST') },
	get NODE_ENV() { return getRequiredEnvVar('NODE_ENV') },

	// Computed values
	get isDevelopment() { return getRequiredEnvVar('NODE_ENV') === 'development' },
	get isProduction() { return getRequiredEnvVar('NODE_ENV') === 'production' },
	get isTest() { return getRequiredEnvVar('NODE_ENV') === 'test' },
} as const

export type { RequiredEnvVars, OptionalEnvVars, EnvVars }
