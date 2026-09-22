import { getDynamicPageURL } from "@agility/nextjs/node";
import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers"

/**
 * Resolves a ?ContentID= deep link from the CMS to the dynamic page that renders
 * that item.
 *
 * Reached two ways (see next.config.mjs and src/proxy.ts):
 *  - a `beforeFiles` rewrite, which fires even when the requested page is served
 *    from the CDN cache (the proxy is skipped in that case), and
 *  - the proxy, for uncached requests.
 *
 * The rewrite cannot validate that ContentID is a positive integer the way the
 * proxy could, so anything unresolvable falls back to the originally requested
 * page rather than 404ing a URL that would otherwise have rendered fine.
 */
export async function GET(req: NextRequest) {

	const searchParams = req.nextUrl.searchParams
	const contentIDStr = searchParams.get("ContentID") as string
	const contentID = parseInt(contentIDStr)
	const { isEnabled: preview } = await draftMode()

	//the page that was originally requested, supplied by the rewrite
	const slug = searchParams.get("slug") || ""

	if (!isNaN(contentID) && contentID > 0) {
		//*** this is a dynamic page request ***
		//get the slug for this page based on the sitemap and redirect there
		const redirectUrl = await getDynamicPageURL({ contentID, preview, slug: "" })
		if (redirectUrl) {
			return NextResponse.redirect(new URL(redirectUrl, req.nextUrl.origin), { status: 307 })
		}
	}

	//the ContentID was junk or didn't resolve. Send the visitor to the page they
	//actually asked for, minus the param, instead of 404ing it.
	if (slug) {
		const fallback = new URL(slug, req.nextUrl.origin)
		return NextResponse.redirect(fallback, { status: 307 })
	}

	return NextResponse.json({ message: "Not Found" }, { status: 404 })

}
