import "server-only";

import type { AgilityPageProps, ContentItem } from "@agility/nextjs"
import { getContentItem } from "@/lib/cms/getContentItem"
import { htmlToMarkdown } from "./htmlToMarkdown"

/**
 * Field names, in priority order, that carry the readable text of a component.
 * Matched case-insensitively against whatever the component model defines, so
 * this works for component models that did not exist when this was written —
 * which matters, because an Agility site's component set is defined in the CMS,
 * not here.
 */
const HEADING_FIELDS = ["heading", "title", "subheading", "eyebrow", "name"]
const BODY_FIELDS = ["textblob", "content", "description", "text", "body", "excerpt", "summary"]

const pick = (fields: Record<string, unknown>, names: string[]): string[] => {
	const found: string[] = []
	for (const name of names) {
		for (const key of Object.keys(fields)) {
			if (key.toLowerCase() !== name) continue
			const value = fields[key]
			if (typeof value === "string" && value.trim()) found.push(value)
		}
	}
	return found
}

/**
 * Render an Agility page as markdown for AI agents.
 *
 * Walks the page's content zones, fetches each component's content item, and
 * emits its text-bearing fields. This is intentionally generic rather than
 * per-component: components are defined in the CMS, so a hand-written mapping
 * would silently omit any component added later.
 */
export const pageToMarkdown = async (agilityData: AgilityPageProps): Promise<string> => {

	const { page, sitemapNode, dynamicPageItem, languageCode, isPreview } = agilityData
	const out: string[] = []

	out.push(`# ${sitemapNode?.title ?? page?.title ?? "Untitled"}`)
	if (page?.seo?.metaDescription) {
		out.push("", `> ${page.seo.metaDescription}`)
	}
	out.push("")

	// A dynamic page (a details page for one list item) carries its content on
	// dynamicPageItem rather than in the zones.
	if (dynamicPageItem?.fields) {
		const fields = dynamicPageItem.fields as Record<string, unknown>
		for (const value of pick(fields, HEADING_FIELDS)) {
			if (value !== sitemapNode?.title) out.push(`## ${value}`, "")
		}
		for (const value of pick(fields, BODY_FIELDS)) {
			out.push(htmlToMarkdown(value), "")
		}
	}

	for (const zoneName of Object.keys(page?.zones ?? {})) {
		const components = page?.zones?.[zoneName] ?? []

		for (const instance of components) {
			//the SDK's zone item is either a ContentReference (`contentid`, what
			//getPage returns) or a fully expanded ContentItem (`contentID`).
			//Narrow across both shapes rather than assuming one.
			const zoneItem = instance.item as { contentid?: number; contentID?: number } | undefined
			const contentID = zoneItem?.contentid ?? zoneItem?.contentID
			if (!contentID) continue

			try {
				const item = await getContentItem<Record<string, unknown>>({
					contentID,
					languageCode: languageCode ?? undefined,
					preview: isPreview === true,
				}) as ContentItem<Record<string, unknown>>

				const fields = (item?.fields ?? {}) as Record<string, unknown>

				for (const value of pick(fields, HEADING_FIELDS)) {
					out.push(`## ${htmlToMarkdown(value)}`, "")
				}
				for (const value of pick(fields, BODY_FIELDS)) {
					out.push(htmlToMarkdown(value), "")
				}
			} catch (error) {
				//one unreadable component must not blank the whole page
				console.error(`Could not read component ${contentID} for markdown output:`, error)
			}
		}
	}

	return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n"
}
