import type posthogType from 'posthog-js'

// Extend window type
declare global {
	interface Window {
		posthog?: typeof posthogType
	}
}

// Set up performance monitoring
performance.mark('app-init')

/**
 * PostHog is loaded LAZILY, after the page is interactive.
 *
 * This file is Next's client instrumentation hook, so it runs on every page
 * load before anything else. A static `import posthog from 'posthog-js'` here
 * put ~76 kB gzipped of analytics on the critical path of every single page —
 * ahead of the content the visitor actually came for.
 *
 * Deferring it is safe by construction: lib/analytics/posthog-provider.ts
 * already queues events and polls `window.posthog` until it appears
 * (see waitForPostHogAndFlush), so nothing captured during the gap is lost.
 */
const loadPostHog = async () => {
	const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
	const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
	if (!postHogKey || !postHogHost) return

	try {
		const { default: posthog } = await import('posthog-js')
		posthog.init(postHogKey, {
			api_host: postHogHost,
			defaults: '2025-05-24',
		})
		// Expose on window for provider access
		window.posthog = posthog
	} catch (error) {
		console.error('Could not initialize PostHog.', error)
	}
}

// requestIdleCallback where available (Safari still lacks it), otherwise a
// short timeout after load. Either way the visitor's first paint comes first.
const scheduleAnalytics = () => {
	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(() => { void loadPostHog() }, { timeout: 4000 })
	} else {
		setTimeout(() => { void loadPostHog() }, 1500)
	}
}

if (document.readyState === 'complete') {
	scheduleAnalytics()
} else {
	window.addEventListener('load', scheduleAnalytics, { once: true })
}

// Set up error tracking
window.addEventListener('error', (event) => {
	// Send to your error tracking service
	reportError(event.error)
})
