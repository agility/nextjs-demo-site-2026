/**
 * Shared schema.org entities, referenced by STABLE `@id` rather than inlined.
 *
 * Why this matters for answer engines: a page that inlines a fresh
 * `{"@type":"Organization","name":"Galaxy Tech"}` blob into every Article,
 * Product and FAQ gives a consumer no way to know they describe the SAME
 * organization. Giving each entity one canonical `@id` and referencing it
 * (`{"@id": organizationId(base)}`) lets a crawler resolve the whole site into
 * one entity graph instead of a pile of disconnected fragments.
 *
 * The convention is the usual one: a fragment on the site's base URL, so the
 * id is globally unique and stable across every page that mentions the entity.
 */

export const organizationId = (baseUrl: string) => `${baseUrl}/#organization`
export const webSiteId = (baseUrl: string) => `${baseUrl}/#website`
export const webPageId = (url: string) => `${url}#webpage`

/** A reference to an entity defined elsewhere in the graph. */
export const ref = (id: string) => ({ "@id": id })

interface OrganizationInput {
	baseUrl: string
	name: string
	logoUrl?: string
}

export const organization = ({ baseUrl, name, logoUrl }: OrganizationInput) => ({
	"@type": "Organization",
	"@id": organizationId(baseUrl),
	name,
	url: baseUrl,
	...(logoUrl ? { logo: { "@type": "ImageObject", url: logoUrl } } : {}),
})

interface WebSiteInput {
	baseUrl: string
	name: string
	inLanguage: string
}

export const webSite = ({ baseUrl, name, inLanguage }: WebSiteInput) => ({
	"@type": "WebSite",
	"@id": webSiteId(baseUrl),
	name,
	url: baseUrl,
	inLanguage,
	publisher: ref(organizationId(baseUrl)),
	potentialAction: {
		"@type": "SearchAction",
		target: {
			"@type": "EntryPoint",
			urlTemplate: `${baseUrl}/search?q={search_term_string}`,
		},
		"query-input": "required name=search_term_string",
	},
})

/**
 * Wrap entities in a single `@graph` with one `@context`.
 *
 * One graph per page is the goal. Where a component deep in the tree has to
 * emit its own block (it cannot reach the layout), it should still reference
 * the shared entities by `@id` so the graphs stitch together.
 */
export const graph = (...entities: object[]) => ({
	"@context": "https://schema.org",
	"@graph": entities,
})
