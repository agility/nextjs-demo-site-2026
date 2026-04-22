import agilitySDK from "@agility/content-fetch"
import type { SocialMediaProvider, SocialPost, SocialPublishResult } from "./types"
import { HootsuiteProvider } from "./providers/hootsuite"

// ---------------------------------------------------------------------------
// Provider registry – add new providers here
// ---------------------------------------------------------------------------
const providers: SocialMediaProvider[] = [new HootsuiteProvider()]

function getActiveProviders(): SocialMediaProvider[] {
	return providers.filter((p) => p.isConfigured())
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface PublishToSocialParams {
	contentID: number
	languageCode: string
}

/**
 * Fetch a blog post from Agility CMS, check whether it has already been
 * shared to social media, and if not publish it via every configured provider.
 *
 * After a successful publish, the `socialPublishedDate` field is written back
 * to the CMS so the same post is never shared twice.
 *
 * @returns array of results from each provider, or `null` if the post was
 *          skipped (already shared or not a blog post).
 */
export async function publishPostToSocial({
	contentID,
	languageCode,
}: PublishToSocialParams): Promise<SocialPublishResult[] | null> {
	const active = getActiveProviders()
	if (active.length === 0) {
		console.info("[social] No social media providers configured – skipping.")
		return null
	}

	// Fetch the content item directly (no cache – we need current data)
	const apiKey = process.env.AGILITY_API_FETCH_KEY
	const guid = process.env.AGILITY_GUID
	if (!apiKey || !guid) {
		console.error("[social] Missing AGILITY_GUID or AGILITY_API_FETCH_KEY")
		return null
	}

	const client = agilitySDK.getApi({ guid, apiKey })
	client.config.fetchConfig = { cache: "no-store" }

	let item: any
	try {
		item = await client.getContentItem({ contentID, languageCode, contentLinkDepth: 2 })
	} catch (err) {
		console.error(`[social] Could not fetch content item ${contentID}:`, err)
		return null
	}

	if (!item?.fields) {
		console.info(`[social] Content item ${contentID} has no fields – skipping.`)
		return null
	}

	// ---- Dedup: already published to social? ----
	if (item.fields.socialPublishedDate) {
		console.info(
			`[social] Post ${contentID} was already shared on ${item.fields.socialPublishedDate} – skipping.`
		)
		return null
	}

	// ---- Build the social post payload ----
	const siteUrl =
		process.env.SITE_URL ||
		(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://localhost:3000")

	const postUrl = await resolvePostUrl(client, contentID, languageCode, siteUrl)
	const excerpt = stripHtml(item.fields.content || "").substring(0, 250)

	const tags: string[] = []
	if (item.fields.tags) {
		const tagItems = Array.isArray(item.fields.tags) ? item.fields.tags : [item.fields.tags]
		for (const t of tagItems) {
			if (t?.fields?.title) tags.push(t.fields.title)
		}
	}

	const socialPost: SocialPost = {
		title: item.fields.heading,
		excerpt,
		url: postUrl,
		imageUrl: item.fields.image?.url || undefined,
		tags,
	}

	console.info(`[social] Publishing post ${contentID} "${socialPost.title}" to ${active.map((p) => p.name).join(", ")}`)

	// ---- Publish to all configured providers concurrently ----
	const results = await Promise.all(active.map((p) => p.publishPost(socialPost)))

	const anySuccess = results.some((r) => r.success)

	// ---- Write-back: stamp socialPublishedDate if at least one provider succeeded ----
	if (anySuccess) {
		await writeSocialPublishedDate(contentID, languageCode)
	}

	for (const r of results) {
		if (r.success) {
			console.info(`[social] ${r.provider}: published (externalId=${r.externalId})`)
		} else {
			console.error(`[social] ${r.provider}: failed – ${r.error}`)
		}
	}

	return results
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve the full public URL of a blog post via the sitemap. */
async function resolvePostUrl(
	client: any,
	contentID: number,
	languageCode: string,
	siteUrl: string
): Promise<string> {
	try {
		const sitemap = await client.getSitemapFlat({
			channelName: process.env.AGILITY_SITEMAP || "website",
			languageCode,
		})
		const node = Object.values(sitemap).find((s: any) => s.contentID === contentID) as any
		if (node?.path) {
			return `${siteUrl}${node.path}`
		}
	} catch {
		// fall through to generic URL
	}
	return `${siteUrl}/blog`
}

/** Strip HTML tags from a string. */
function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, "").trim()
}

/**
 * Write the current timestamp into the `socialPublishedDate` field on the
 * content item via the Agility Management REST API.
 *
 * Requires `AGILITY_API_MANAGEMENT_KEY` to be set.
 *
 * When this save is published in the CMS it will trigger the revalidate
 * webhook again, but the dedup check (socialPublishedDate already set) will
 * cause it to be skipped.
 */
async function writeSocialPublishedDate(contentID: number, languageCode: string): Promise<void> {
	const mgmtKey = process.env.AGILITY_API_MANAGEMENT_KEY
	const guid = process.env.AGILITY_GUID
	if (!mgmtKey || !guid) {
		console.warn("[social] Cannot write-back socialPublishedDate – AGILITY_API_MANAGEMENT_KEY not set.")
		return
	}

	const url = `https://mgmt.aglty.io/${guid}/api/${languageCode}/item/${contentID}`

	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				APIKey: mgmtKey,
			},
			body: JSON.stringify({
				contentID,
				fields: {
					socialPublishedDate: new Date().toISOString(),
				},
			}),
		})

		if (!res.ok) {
			const body = await res.text()
			console.error(`[social] Management API write-back failed ${res.status}: ${body}`)
		} else {
			console.info(`[social] socialPublishedDate written for item ${contentID}`)
		}
	} catch (err) {
		console.error("[social] Management API write-back error:", err)
	}
}
