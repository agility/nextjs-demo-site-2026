import type { SocialMediaProvider, SocialPost, SocialPublishResult } from "../types"

/**
 * Hootsuite provider – schedules posts via the Hootsuite REST API v1.
 *
 * Required env vars:
 *   HOOTSUITE_ACCESS_TOKEN   – OAuth 2 Bearer token
 *   HOOTSUITE_PROFILE_IDS    – Comma-separated social profile IDs to post to
 *
 * Optional:
 *   HOOTSUITE_API_URL         – Override the API base (defaults to https://platform.hootsuite.com)
 */
export class HootsuiteProvider implements SocialMediaProvider {
	readonly name = "Hootsuite"

	private get apiUrl(): string {
		return process.env.HOOTSUITE_API_URL || "https://platform.hootsuite.com"
	}

	private get accessToken(): string | undefined {
		return process.env.HOOTSUITE_ACCESS_TOKEN
	}

	private get profileIds(): string[] {
		const raw = process.env.HOOTSUITE_PROFILE_IDS
		if (!raw) return []
		return raw.split(",").map((id) => id.trim()).filter(Boolean)
	}

	isConfigured(): boolean {
		return Boolean(this.accessToken) && this.profileIds.length > 0
	}

	async publishPost(post: SocialPost): Promise<SocialPublishResult> {
		if (!this.isConfigured()) {
			return { success: false, provider: this.name, error: "Hootsuite is not configured" }
		}

		const text = this.formatPostText(post)

		try {
			const res = await fetch(`${this.apiUrl}/v1/messages`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.accessToken}`,
				},
				body: JSON.stringify({
					text,
					socialProfileIds: this.profileIds,
					scheduledSendTime: new Date().toISOString(),
				}),
			})

			if (!res.ok) {
				const body = await res.text()
				console.error(`[social] Hootsuite API error ${res.status}: ${body}`)
				return { success: false, provider: this.name, error: `HTTP ${res.status}: ${body}` }
			}

			const data = (await res.json()) as { data?: { id?: string } }
			return {
				success: true,
				provider: this.name,
				externalId: data.data?.id,
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			console.error(`[social] Hootsuite publish failed:`, message)
			return { success: false, provider: this.name, error: message }
		}
	}

	/**
	 * Format the social media post text.
	 * Pattern:  Title
	 *           Excerpt…
	 *           #tag1 #tag2
	 *           url
	 */
	private formatPostText(post: SocialPost): string {
		const parts: string[] = [post.title]

		if (post.excerpt) {
			// Trim excerpt to stay well within platform character limits
			const maxExcerpt = 200
			const excerpt =
				post.excerpt.length > maxExcerpt
					? post.excerpt.substring(0, maxExcerpt).trimEnd() + "..."
					: post.excerpt
			parts.push(excerpt)
		}

		if (post.tags && post.tags.length > 0) {
			const hashtags = post.tags
				.map((t) => `#${t.replace(/\s+/g, "")}`)
				.join(" ")
			parts.push(hashtags)
		}

		parts.push(post.url)

		return parts.join("\n\n")
	}
}
