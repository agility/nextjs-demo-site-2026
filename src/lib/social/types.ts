/**
 * Social media auto-publishing interfaces.
 *
 * To add a new provider, implement the `SocialMediaProvider` interface
 * and register it in `src/lib/social/publishPost.ts`.
 */

/** The post payload sent to social media providers. */
export interface SocialPost {
	title: string
	excerpt: string
	url: string
	imageUrl?: string
	tags?: string[]
}

/** Result returned from a provider after attempting to publish. */
export interface SocialPublishResult {
	success: boolean
	provider: string
	/** ID of the post/message on the external platform. */
	externalId?: string
	error?: string
}

/** Every social media provider must implement this interface. */
export interface SocialMediaProvider {
	/** Human-readable provider name (e.g. "Hootsuite"). */
	readonly name: string

	/**
	 * Returns true when the provider has been configured with the required
	 * environment variables and is ready to accept publish calls.
	 */
	isConfigured(): boolean

	/**
	 * Publish / schedule a post on the external platform.
	 */
	publishPost(post: SocialPost): Promise<SocialPublishResult>
}
