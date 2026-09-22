import type { NextRequest } from "next/server"
import { getAgilityPage } from "@/lib/cms/getAgilityPage"
import { pageToMarkdown } from "@/lib/cms-content/pageToMarkdown"
import { defaultLocale, locales, getLocaleFromPathname, removeLocaleFromPathname } from "@/lib/i18n/config"

/**
 * Clean-markdown endpoint for any page.
 *
 * Not called directly — src/proxy.ts rewrites `GET /{path}.md` to
 * `/api/page-md/{path}`. The path travels in the URL PATH rather than a query
 * param, because query strings added during a rewrite do not survive reliably.
 *
 * Data comes from the same cached getters the HTML pages use, so a `.md`
 * response revalidates on exactly the same publish webhook and can never
 * disagree with the rendered page.
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string[] }> }
) {
	const { slug } = await params
	const rawPath = "/" + (slug || []).join("/")

	//non-default locales arrive prefixed (/fr/...); split the prefix off so the
	//page lookup gets the locale and a locale-less slug, matching the route.
	const localePrefix = getLocaleFromPathname(rawPath, locales)
	const locale = localePrefix || defaultLocale
	const path = localePrefix ? (removeLocaleFromPathname(rawPath, localePrefix) || "/") : rawPath

	const pageSlug = path.split("/").filter(Boolean)

	try {
		const agilityData = await getAgilityPage({
			params: Promise.resolve({ slug: pageSlug.length ? pageSlug : [""], locale }),
		})

		if (!agilityData.page || agilityData.notFound) {
			return new Response("Not found", { status: 404 })
		}

		const markdown = await pageToMarkdown(agilityData)

		return new Response(markdown, {
			headers: {
				"Content-Type": "text/markdown; charset=utf-8",
				"CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400",
			},
		})
	} catch (error) {
		console.error(`Could not build markdown for "${rawPath}":`, error)
		return new Response("Not found", { status: 404 })
	}
}
