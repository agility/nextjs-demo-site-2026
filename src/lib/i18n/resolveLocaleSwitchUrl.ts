import "server-only"
import { getSitemapFlat } from "@/lib/cms/getSitemapFlat"
import type { SitemapNode } from "@/lib/types/SitemapNode"
import { type Locale, defaultLocale, isValidLocale, locales } from "./config"

type FlatSitemap = Record<string, SitemapNode>

const CHANNEL_NAME = process.env.AGILITY_SITEMAP || "website"

// The home page is keyed "/home" in the sitemap but served at the site root.
const HOME_PATH = "/home"

/** Build a locale-aware URL from a sitemap node's path. */
const buildLocalizedUrl = (path: string, targetLocale: Locale): string => {
	// The home node's path is "/home", but it lives at the site root.
	const cleanPath = !path || path === HOME_PATH ? "/" : path
	if (targetLocale === defaultLocale) return cleanPath
	if (cleanPath === "/") return `/${targetLocale}`
	return `/${targetLocale}${cleanPath}`
}

interface ResolveArgs {
	targetLocale: string
	pageID: number
	contentID?: number
}

/**
 * Resolve the equivalent URL for a page in another locale, given the current
 * page's sitemap node (pageID, plus contentID for dynamic pages).
 *
 *   - dynamic pages (a contentID is supplied): match on BOTH pageID and
 *     contentID. A dynamic page's pageID is shared across every item in the
 *     list, so the contentID pins down the specific item; both are stable
 *     across locales for properly locale-linked content.
 *   - other pages (no contentID): match on pageID alone.
 *
 * @returns the target-locale URL, or `null` when no equivalent page exists.
 */
export const resolveLocaleSwitchUrl = async ({
	targetLocale,
	pageID,
	contentID,
}: ResolveArgs): Promise<string | null> => {
	if (!isValidLocale(targetLocale, locales)) return null
	if (!Number.isFinite(pageID) || pageID <= 0) return null

	const sitemap = (await getSitemapFlat({
		channelName: CHANNEL_NAME,
		languageCode: targetLocale,
	})) as FlatSitemap

	const targetNode = Object.values(sitemap).find((node) =>
		contentID != null
			? node.pageID === pageID && node.contentID === contentID
			: node.pageID === pageID
	)

	if (!targetNode) return null

	return buildLocalizedUrl(targetNode.path, targetLocale)
}
