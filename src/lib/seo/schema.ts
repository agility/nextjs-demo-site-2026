/**
 * Stable `@id`s for the shared schema.org entities, so nodes can reference
 * them rather than inline copies.
 *
 * Why this matters for answer engines: a page that inlines a fresh
 * `{"@type":"Organization","name":"Galaxy Tech"}` blob into every Article,
 * Product and FAQ gives a consumer no way to know they describe the SAME
 * organization. Giving each entity one canonical `@id` and referencing it
 * (`{"@id": organizationId(base)}`) lets a crawler resolve the whole site into
 * one entity graph instead of a pile of disconnected fragments.
 *
 * The Organization, WebSite and WebPage nodes themselves are built by
 * `@agility/geo` in ./buildPageJsonLd.ts, which emits ONE `@graph` per page.
 * Its ids use the same form as these helpers (`${siteUrl}/#organization`,
 * `${siteUrl}/#website`, `${url}#webpage`), so content model mappings and
 * component blocks (FAQ, pricing) can point at them.
 */

export const organizationId = (baseUrl: string) => `${baseUrl}/#organization`
export const webSiteId = (baseUrl: string) => `${baseUrl}/#website`
export const webPageId = (url: string) => `${url}#webpage`

/** A reference to an entity defined elsewhere in the graph. */
export const ref = (id: string) => ({ "@id": id })
