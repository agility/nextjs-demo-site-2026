import posthog from 'posthog-js'

// Extend window type
declare global {
	interface Window {
		posthog?: typeof posthog
	}
}

// Set up performance monitoring
performance.mark('app-init')

const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
if (postHogKey && postHogHost) {
	// Initialize PostHog with the provided key and host
	console.log("Initializing PostHog.")
	posthog.init(postHogKey, {
		api_host: postHogHost,
		defaults: '2025-05-24'
	});
	// Expose on window for provider access
	window.posthog = posthog
}

// Initialize analytics
console.log('Analytics initialized')

// Set up error tracking
window.addEventListener('error', (event) => {
	// Send to your error tracking service
	reportError(event.error)
})

