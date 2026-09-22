import { draftMode } from 'next/headers';
import { agilityConfig } from "@agility/nextjs"
import { type Locale, defaultLocale, isValidLocale, locales } from "@/lib/i18n/config"

/** Local `next dev` serves staging content unless FORCE_PUBLISHED=1 is set. */
export const isDevelopmentMode = process.env.NODE_ENV === "development"

/**
 * Resolve the Agility context for the current request.
 *
 * This is the ONE place `draftMode()` is read. Everything downstream takes
 * `preview` as a plain boolean argument, which is what lets the data layer in
 * `lib/cms/` sit inside `"use cache"` scopes. Call this from a page, layout or
 * route handler — never from inside a cached function.
 */
export const getAgilityContext = async (locale?: string) => {

	//determine if we're in preview mode based on "draft" mode from next.js
	let isPreview = false
	try {
		const { isEnabled } = await draftMode()
		isPreview = isEnabled
	} catch {
		//called outside a request scope (e.g. generateStaticParams) — treat as published
	}

	//local dev shows editors' unpublished work by default; FORCE_PUBLISHED=1
	//makes `next dev` behave like production, which is how you test the
	//published experience without deploying.
	if (isDevelopmentMode && process.env.FORCE_PUBLISHED !== "1") {
		isPreview = true
	}

	// Validate and use the provided locale, fallback to default
	const validatedLocale: Locale = (locale && isValidLocale(locale, locales)) ? locale : defaultLocale

	return {
		locales: agilityConfig.locales,
		locale: validatedLocale,
		sitemap: agilityConfig.channelName,
		isPreview,
		isDevelopmentMode
	}
}
