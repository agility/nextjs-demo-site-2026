/**
 * Agility CMS Context Extraction for Analytics
 *
 * Extracts page ID and content IDs from the DOM for analytics tracking.
 * These IDs are set by Agility CMS components via data attributes:
 * - data-agility-page: Page ID on the main content wrapper
 * - data-agility-dynamic-content: Content ID for dynamic pages (e.g., blog posts)
 * - data-agility-component: Content ID on each Agility component
 *
 * This allows analytics queries like:
 * - "Show engagement metrics grouped by pageID"
 * - "Compare scroll depth across different contentID values"
 * - "Which pages have the highest time-on-page?"
 */

export interface AgilityContext {
	/** Agility CMS Page ID */
	pageID?: number
	/** All content IDs on the page (dynamic content + component content) */
	contentIDs?: number[]
	/** Current locale/language code */
	locale?: string
}

/**
 * Extract Agility CMS context from DOM data attributes
 *
 * Reads:
 * - data-agility-page attribute for page ID
 * - data-agility-dynamic-content attribute for dynamic content ID
 * - data-agility-component attributes for all component IDs on page
 *
 * All content IDs are combined into a single contentIDs array.
 */
export function getAgilityContext(): AgilityContext {
	if (typeof document === 'undefined') {
		return {}
	}

	const context: AgilityContext = {}
	const contentIDs: number[] = []

	// Find the page wrapper with data-agility-page attribute
	const pageElement = document.querySelector('[data-agility-page]')
	if (pageElement) {
		const pageID = pageElement.getAttribute('data-agility-page')
		if (pageID) {
			context.pageID = parseInt(pageID, 10)
		}

		// Check for dynamic content ID on the same element
		const dynamicContentID = pageElement.getAttribute('data-agility-dynamic-content')
		if (dynamicContentID) {
			const id = parseInt(dynamicContentID, 10)
			if (!isNaN(id)) {
				contentIDs.push(id)
			}
		}
	}

	// Find all components with data-agility-component attribute
	const componentElements = document.querySelectorAll('[data-agility-component]')
	componentElements.forEach((el) => {
		const contentID = el.getAttribute('data-agility-component')
		if (contentID) {
			const id = parseInt(contentID, 10)
			if (!isNaN(id) && !contentIDs.includes(id)) {
				contentIDs.push(id)
			}
		}
	})

	if (contentIDs.length > 0) {
		context.contentIDs = contentIDs
	}

	// Extract locale from URL path (e.g., /en-us/page -> en-us)
	const pathParts = window.location.pathname.split('/').filter(Boolean)
	if (pathParts.length > 0) {
		// Check if first path segment looks like a locale (e.g., en-us, fr-ca)
		const potentialLocale = pathParts[0]
		if (/^[a-z]{2}(-[a-z]{2})?$/i.test(potentialLocale)) {
			context.locale = potentialLocale
		}
	}

	return context
}

/**
 * Get the content ID of the nearest Agility component from an element
 * Useful for tracking interactions within specific components
 *
 * @param element - DOM element to start searching from
 * @returns Content ID of the nearest component, or undefined
 */
export function getNearestContentID(element: HTMLElement | null): number | undefined {
	if (!element) return undefined

	const component = element.closest('[data-agility-component]')
	if (component) {
		const contentID = component.getAttribute('data-agility-component')
		if (contentID) {
			return parseInt(contentID, 10)
		}
	}

	return undefined
}
