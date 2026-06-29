import { NextResponse, type NextRequest } from "next/server"
import { resolveLocaleSwitchUrl } from "@/lib/i18n/resolveLocaleSwitchUrl"
import { defaultLocale, isValidLocale, locales } from "@/lib/i18n/config"

/**
 * Server-side locale switch.
 *
 * Params:
 *   - `to`        the target locale code
 *   - `pageID`    the current page's pageID (from its sitemap node)
 *   - `contentID` the current page's dynamic content ID (optional)
 *
 * Resolves the equivalent page in the target locale via that locale's sitemap
 * and redirects to it. If no equivalent page exists, it redirects to a
 * non-existent path in the target locale so the app's catch-all renders the
 * styled 404 page.
 */
export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl
	const targetLocale = searchParams.get("to") ?? ""

	if (!isValidLocale(targetLocale, locales)) {
		return NextResponse.redirect(new URL("/", request.url))
	}

	const pageID = Number(searchParams.get("pageID"))
	const contentIDParam = searchParams.get("contentID")
	const contentID = contentIDParam ? Number(contentIDParam) : undefined

	const targetUrl = await resolveLocaleSwitchUrl({ targetLocale, pageID, contentID })

	if (targetUrl) {
		return NextResponse.redirect(new URL(targetUrl, request.url))
	}

	// No accompanying page in the target locale -> let the catch-all 404.
	const notFoundPath =
		targetLocale === defaultLocale
			? "/page-not-found"
			: `/${targetLocale}/page-not-found`
	return NextResponse.redirect(new URL(notFoundPath, request.url))
}
