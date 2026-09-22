import "server-only";

import agility from '@agility/content-fetch'

/**
 * Build an Agility API client for either published or preview (staging) content.
 *
 * `isPreview` is an EXPLICIT argument here — it is deliberately NOT read from
 * `draftMode()` inside this module.
 *
 * Under Cache Components, `draftMode()` is request-time state. Reading it from
 * the data layer would make every content read request-scoped, so nothing could
 * live inside a `"use cache"` scope and the whole site would render dynamically.
 * Preview is resolved exactly once per request, in `getAgilityContext()`, and
 * threaded down as a plain boolean.
 */
export const getAgilitySDK = (isPreview: boolean) => {

	const apiKey = isPreview
		? process.env.AGILITY_API_PREVIEW_KEY
		: process.env.AGILITY_API_FETCH_KEY

	return agility.getApi({
		guid: process.env.AGILITY_GUID,
		apiKey,
		isPreview
	});

}

export default getAgilitySDK
