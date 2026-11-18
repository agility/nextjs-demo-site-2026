import type { JsonLdNode, TransformContext } from "@agility/geo"
import type { ContentItem } from "@agility/nextjs"
import type { IPost } from "@/lib/types/IPost"
import { decodeHtmlEntities } from "@/lib/utils"
import { organizationId, webPageId, webSiteId, ref } from "./schema"

/**
 * Content model -> schema.org mappings.
 *
 * Structured data for a content item is built from the item's own fields, so it
 * can never drift from what the page shows: change the post's heading and the
 * `headline` changes with it. Hand-typing the same values into JSON-LD would
 * give you two sources of truth.
 *
 * Keyed by the content model's name (`item.properties.definitionName`). Each
 * mapper returns one node, which `buildPageJsonLd` adds to the page's single
 * `@graph` through `@agility/geo`'s `transform` hook. Anything an editor types
 * into the GEO tab's JSON-LD field is merged into the same graph by `@id`.
 *
 * To support another model, add a mapper here. Nothing else changes.
 */
type Mapper = (item: ContentItem, ctx: TransformContext & { baseUrl: string }) => JsonLdNode | undefined

/** Post -> BlogPosting. The linked Author item becomes a Person. */
const post: Mapper = (item, { url, baseUrl, geo }) => {
	const fields = item.fields as IPost
	const node: JsonLdNode = {
		"@type": "BlogPosting",
		"@id": `${url}#article`,
		mainEntityOfPage: ref(webPageId(url)),
		publisher: ref(organizationId(baseUrl)),
		isPartOf: ref(webSiteId(baseUrl)),
	}

	const headline = decodeHtmlEntities(fields.heading)
	if (headline) node.headline = headline
	// The GEO tab's Summary is the answer-first description; fall back to the SEO description.
	const description = geo.summary || geo.description
	if (description) node.description = description
	if (fields.image?.url) node.image = [fields.image.url]
	if (fields.postDate) node.datePublished = fields.postDate
	if (fields.socialPublishedDate || fields.postDate) {
		node.dateModified = fields.socialPublishedDate || fields.postDate
	}

	const author = fields.author?.fields
	if (author?.name) {
		node.author = {
			"@type": "Person",
			name: author.name,
			...(author.headShot?.url ? { image: author.headShot.url } : {}),
		}
	}

	const category = fields.category?.fields?.name
	if (category) node.articleSection = category

	return node
}

export const contentModelMappings: Record<string, Mapper> = {
	Post: post,
}
