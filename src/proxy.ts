import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRedirect } from './lib/cms-content/checkRedirect'
import { isPublishedPath } from './lib/cms/publishedPaths'
import { defaultLocale, locales, isValidLocale, getLocaleFromPathname, removeLocaleFromPathname } from './lib/i18n/config'

/** Next sets this cookie when draft mode is on. */
const DRAFT_COOKIE = "__prerender_bypass"

/**
 * Vendor-neutral edge cache headers (RFC 9213), honoured by both Vercel and
 * Netlify. These live HERE rather than in next.config's `headers()` because
 * that rule is unconditional: it would put `public` caching on draft-mode
 * renders too, publishing an editor's unpublished content to a shared CDN.
 *
 * The TTL is only a self-healing backstop — /api/revalidate is the real
 * invalidation path, so a publish goes live immediately regardless.
 */
const CDN_CACHE = "public, s-maxage=60, stale-while-revalidate=86400"

const applyCacheHeaders = (res: NextResponse, request: NextRequest) => {
	if (request.cookies.has(DRAFT_COOKIE)) {
		//a draft render shows unpublished content — it must never reach a shared cache
		res.headers.set("Cache-Control", "private, no-store")
		return res
	}
	res.headers.set("CDN-Cache-Control", CDN_CACHE)
	return res
}

/**
 * A real 404, answered by the proxy itself.
 *
 * Under `cacheComponents` every page route is partially prerendered, so the
 * static shell — and with it a `200` status line — can already be on the wire
 * before the page resolves the sitemap and calls notFound(). Next's own docs
 * are explicit that not-found returns "200 for streamed responses" and that the
 * status "cannot be updated" once headers are sent. A rewrite cannot fix it
 * either: the destination's status is not adopted.
 *
 * So the check happens here, before anything renders. The body is the app's own
 * prerendered 404 page, fetched once per server instance and memoised.
 */
let notFoundBody: string | null = null

const FALLBACK_404 = "<!doctype html><title>404 — Not Found</title><h1>404 — Not Found</h1>"

const notFoundResponse = async (request: NextRequest) => {
	if (notFoundBody === null) {
		try {
			//A header the proxy can see on the way back in. /_not-found is also
			//listed in APP_PATHS, but this is a hard stop: without it, a mistake
			//in that list turns into an infinite fetch loop that hangs the
			//request rather than failing visibly.
			const res = await fetch(new URL("/_not-found", request.nextUrl.origin), {
				headers: { "x-proxy-404-body": "1" },
			})
			notFoundBody = await res.text()
		} catch {
			notFoundBody = FALLBACK_404
		}
	}
	return new NextResponse(notFoundBody, {
		status: 404,
		headers: { "Content-Type": "text/html; charset=utf-8" },
	})
}

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {


	/*****************************
	 * *** AGILITY MIDDLEWARE ***
	 * 1: Check if this is a preview request,
	 * 2: Check if we are exiting preview
	 * 3: Check if this is a direct to a dynamic page
	 *    based on a content id
	 *******************************/

	let pathname = request.nextUrl.pathname
	const previewQ = request.nextUrl.searchParams.get("AgilityPreview")
	const contentIDStr = request.nextUrl.searchParams.get("ContentID") as string || ""

	const ext = request.nextUrl.pathname.includes(".") ? request.nextUrl.pathname.split('.').pop() : null


	if (request.nextUrl.searchParams.has("agilitypreviewkey")) {
		//*** this is a preview request ***
		const agilityPreviewKey = request.nextUrl.searchParams.get("agilitypreviewkey") || ""
		//locale is also passed in the querystring on preview requests
		const locale = request.nextUrl.searchParams.get("lang")
		const slug = request.nextUrl.pathname
		//valid preview key: we need to redirect to the correct url for preview
		const redirectUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/preview?locale=${locale}&ContentID=${contentIDStr}&slug=${encodeURIComponent(slug)}&agilitypreviewkey=${encodeURIComponent(agilityPreviewKey)}`

		return NextResponse.redirect(redirectUrl)

	} else if (previewQ === "0") {
		//*** exit preview
		const locale = request.nextUrl.searchParams.get("lang")

		//we need to redirect to the correct url for preview
		const slug = request.nextUrl.pathname
		const redirectUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/preview/exit?locale=${locale}&ContentID=${contentIDStr}&slug=${encodeURIComponent(slug)}`

		return NextResponse.redirect(redirectUrl)
	} else if (contentIDStr && parseInt(contentIDStr) > 0) {
		//*** this is a dynamic page request ***
		//NOTE: the validity check lives in the condition, not inside the block. When
		//it was nested, a junk ?ContentID= (e.g. "?ContentID=abc") matched this arm
		//of the else-if chain, did nothing, and fell straight to NextResponse.next()
		//- skipping locale routing entirely, so the page 404'd.
		const contentID = parseInt(contentIDStr)
		const dynredirectUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/dynamic-redirect?ContentID=${contentID}&slug=${encodeURIComponent(request.nextUrl.pathname)}`
		return NextResponse.rewrite(dynredirectUrl)

	} else if ((!ext || ext.length === 0)) {

		/**********************
		 * CHECK FOR REDIRECT *
		***********************/
		const redirection = await checkRedirect({ path: request.nextUrl.pathname })

		if (redirection) {
			//redirect to the destination url
			//cache the redirect for 10 minutes
			if (redirection.destinationUrl.startsWith("/")) {
				//handle relative paths
				const url = request.nextUrl.clone()
				url.pathname = redirection.destinationUrl
				return NextResponse.redirect(url, {
					status: redirection.statusCode,
					headers: {
						"Cache-Control": "public,maxage=600, stale-while-revalidate"
					}
				})
			} else {
				//handle absolute paths
				return NextResponse.redirect(redirection.destinationUrl, {
					status: redirection.statusCode,
					headers: {
						"Cache-Control": "public,maxage=3600, stale-while-revalidate"
					}
				})
			}
		}



		/**************************************
		 * SPECIAL CASE FOR lang= QUERY PARAM *
		 **************************************/

		//handle the case where ?lang=xx is passed in the querystring
		const langParam = request.nextUrl.searchParams.get("lang")
		//get the current locale from the pathname (if any)

		const currentLocale = getLocaleFromPathname(pathname, locales) || defaultLocale

		//if we have a lang query and it's valid and it's different from the current locale in the path
		if (langParam && isValidLocale(langParam, locales) && langParam !== currentLocale) {

			//we have a locale specified in the querystring and it's valid
			if (langParam === defaultLocale) {
				//default locale - redirect to root path (no locale in path)
				const redirectUrl = new URL(request.nextUrl.toString())
				redirectUrl.pathname = removeLocaleFromPathname(pathname, currentLocale)
				//remove lang param from querystring
				redirectUrl.searchParams.delete("lang")
				return NextResponse.redirect(redirectUrl)
			} else {
				//non-default locale - redirect to include locale in path
				const redirectUrl = new URL(request.nextUrl.toString())
				//add the locale to the pathname
				const pathnameWithoutLocale = removeLocaleFromPathname(pathname, currentLocale)
				redirectUrl.pathname = `/${langParam}${pathnameWithoutLocale}`
				//remove lang param from querystring
				redirectUrl.searchParams.delete("lang")
				return NextResponse.redirect(redirectUrl)
			}
		}
		/*********************************
		 * VALIDATE THE PATH (real 404s) *
		 *********************************/

		// Skipped in dev and in draft mode: an editor previewing an unpublished
		// page is exactly the case where the path is legitimately absent from the
		// PUBLISHED sitemap. Fails open if the CMS is unreachable.
		const isDraft = request.cookies.has(DRAFT_COOKIE)
		const isFetchingOwn404Body = request.headers.has("x-proxy-404-body")
		if (process.env.NODE_ENV !== "development" && !isDraft && !isFetchingOwn404Body) {
			if (!(await isPublishedPath(request.nextUrl.pathname))) {
				return await notFoundResponse(request)
			}
		}

		/************************
		 * HANDLE SEARCH PARAMS *
		 ************************/

		// Only process query parameters that are expected/used within the app
		// This prevents issues with long tracking query strings (e.g., Google Analytics)
		const ALLOWED_QUERY_PARAMS = ['audience', 'region', 'q'] // Whitelist of allowed query params
		const MAX_QUERY_STRING_LENGTH = 500 // Maximum length for query string encoding

		// Filter search params to only include whitelisted parameters
		const filteredParams = new URLSearchParams()
		for (const [key, value] of request.nextUrl.searchParams.entries()) {
			if (ALLOWED_QUERY_PARAMS.includes(key.toLowerCase())) {
				filteredParams.append(key, value)
			}
		}

		// Only encode if we have allowed params and they're within reasonable length
		let searchParams = filteredParams.toString()
		const hasSearchParams = searchParams && searchParams.length > 0 && searchParams.length <= MAX_QUERY_STRING_LENGTH

		if (hasSearchParams) {
			const searchParamPortion = `~~~${encodeURIComponent(searchParams)}~~~`
			//if we have search params, we need to include them in the path like this /path/->/path/~~~searchParams~~~
			pathname = pathname.endsWith("/") ? `${pathname}${searchParamPortion}` : `${pathname}/${searchParamPortion}`
		} else {
			searchParams = ""
		}

		/************************
		 * LOCALE BASED ROUTING *
		 ************************/

		// Skip if already has locale prefix or is a static file or docs route
		const hasLocalePrefix = locales.some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)
		const isStaticFile = pathname.includes('.') || pathname.startsWith('/_next')
		const isDocsRoute = pathname.startsWith('/docs')
		const isSitemapOrRobots = pathname === '/sitemap.xml' || pathname === '/robots.txt'

		// Skip locale routing for docs routes, sitemap, and robots.txt
		if (isDocsRoute || isSitemapOrRobots) {
			return applyCacheHeaders(NextResponse.next(), request)
		}

		const baseUrl = request.nextUrl.origin

		if (!hasLocalePrefix && !isStaticFile) {

			const localeBasedUrl = new URL(`/${defaultLocale}${pathname}`, baseUrl)

			// For all paths (including root), rewrite to include default locale (no redirect)
			// This keeps the clean URL but internally routes to the locale-specific page
			return applyCacheHeaders(NextResponse.rewrite(localeBasedUrl), request)
		}

		if (hasSearchParams) {
			//if we have search params, we need to make sure we decode them before passing them on
			const searchParamUrl = new URL(pathname, baseUrl)
			return applyCacheHeaders(NextResponse.rewrite(searchParamUrl), request)
		}

		// If we reach here, let Next.js handle the request normally
		return applyCacheHeaders(NextResponse.next(), request)

	}

	return NextResponse.next()
}



export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - assets (public assets)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - sitemap.xml (sitemap file)
		 * - robots.txt (robots file)
		 */
		'/((?!api|assets|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)',
	],
}