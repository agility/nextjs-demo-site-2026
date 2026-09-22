import { createMcpHandler } from "mcp-handler"
import { z } from "zod4"
import { algoliasearch } from "algoliasearch"
import { getSitemapFlat } from "@/lib/cms/getSitemapFlat"
import { getAgilityPage } from "@/lib/cms/getAgilityPage"
import { pageToMarkdown } from "@/lib/cms-content/pageToMarkdown"
import { defaultLocale, locales } from "@/lib/i18n/config"
import type { SitemapNode } from "@/lib/types/SitemapNode"

/**
 * MCP server for this site, at /api/mcp.
 *
 * NOTE on `import { z } from "zod4"`: the MCP SDK's schema types require zod
 * v4, but this project is pinned to zod 3 by the AI SDK (@ai-sdk/* and `ai`).
 * Rather than force one version on both, package.json aliases
 * `zod4 -> npm:zod@^4` and ONLY this file imports it. Everything else keeps
 * using plain `zod` (v3). Do not "tidy" this import back to "zod" — it will
 * stop type-checking.
 *
 * Lets an MCP client (Claude, Cursor, ChatGPT, any agent) list, search and read
 * the site's content directly — no scraping, no JavaScript execution. It reads
 * through the same cached CMS getters the pages render from, so an agent can
 * never see something the site itself would not serve.
 *
 * This complements the other two machine-readable surfaces: /llms.txt is the
 * static index a crawler finds on its own, `.md` is one page as text, and this
 * is the interactive one.
 *
 * Ported from the Agility documentation site's MCP server.
 */

const BASE_URL = process.env.SITE_URL || "https://demo.agilitycms.com"

const fullUrl = (path: string) => `${BASE_URL}${path === "/home" ? "/" : path}`

const handler = createMcpHandler(
	(server) => {

		server.registerTool(
			"list_pages",
			{
				title: "List pages",
				description: "List every published page on the site, with its title and URL. Start here to see what exists before searching or fetching.",
				inputSchema: {
					locale: z.enum(locales as [string, ...string[]]).optional()
						.describe(`Locale to list. Defaults to ${defaultLocale}.`),
				},
			},
			async ({ locale }) => {
				const lang = locale || defaultLocale
				const sitemap = await getSitemapFlat({
					channelName: process.env.AGILITY_SITEMAP || "website",
					languageCode: lang,
					preview: false,
				}) as { [path: string]: SitemapNode }

				const pages = Object.values(sitemap)
					.filter((n) => !n.isFolder && !n.redirect && n.visible?.sitemap !== false)
					.map((n) => `- ${n.title} — ${fullUrl(n.path)}`)

				return {
					content: [{
						type: "text" as const,
						text: pages.length
							? `Published pages (${lang}):\n\n${pages.join("\n")}`
							: `No published pages found for locale "${lang}".`,
					}],
				}
			}
		)

		server.registerTool(
			"get_page",
			{
				title: "Get page as markdown",
				description: "Fetch the full text of one page as markdown. Takes a site path such as /about-us or /blog/some-post.",
				inputSchema: {
					path: z.string().describe("Site path, e.g. \"/about-us\". A locale prefix like /fr/... selects that locale."),
				},
			},
			async ({ path }) => {
				const clean = path.startsWith("http")
					? new URL(path).pathname
					: (path.startsWith("/") ? path : `/${path}`)

				const localePrefix = locales.find(l => clean === `/${l}` || clean.startsWith(`/${l}/`))
				const locale = localePrefix || defaultLocale
				const pagePath = localePrefix ? (clean.slice(localePrefix.length + 1) || "/") : clean
				const slug = pagePath.split("/").filter(Boolean)

				try {
					const agilityData = await getAgilityPage({
						params: Promise.resolve({ slug: slug.length ? slug : [""], locale }),
					})

					if (!agilityData.page || agilityData.notFound) {
						return {
							content: [{
								type: "text" as const,
								text: `No published page at "${clean}". Use list_pages to see what exists.`,
							}],
						}
					}

					return {
						content: [{ type: "text" as const, text: await pageToMarkdown(agilityData) }],
					}
				} catch (error) {
					console.error(`MCP get_page failed for "${clean}":`, error)
					return {
						content: [{ type: "text" as const, text: `Could not read "${clean}".` }],
					}
				}
			}
		)

		server.registerTool(
			"search_content",
			{
				title: "Search site content",
				description: "Full-text search across the site's content. Use concise keyword queries; use get_page afterwards to read a result in full.",
				inputSchema: {
					query: z.string().describe("Search terms."),
					limit: z.number().min(1).max(25).optional().describe("Max results (default 10)."),
				},
			},
			async ({ query, limit }) => {
				if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_SEARCH_API_KEY) {
					return {
						content: [{
							type: "text" as const,
							text: "Search is not configured on this deployment. Use list_pages and get_page instead.",
						}],
					}
				}

				try {
					const algolia = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_SEARCH_API_KEY)
					const response = await algolia.searchSingleIndex({
						indexName: "content",
						searchParams: {
							query: query.trim(),
							hitsPerPage: limit ?? 10,
							attributesToRetrieve: ["title", "url", "excerpt", "description", "objectID"],
						},
					})

					const hits = (response.hits as Array<Record<string, unknown>>).map((hit) => {
						const title = String(hit.title ?? "Untitled").trim()
						const url = String(hit.url ?? "")
						const summary = String(hit.excerpt ?? hit.description ?? "").trim()
						return `## ${title}\n${url}${summary ? `\n\n${summary}` : ""}`
					})

					return {
						content: [{
							type: "text" as const,
							text: hits.length
								? `${hits.length} result(s) for "${query}":\n\n${hits.join("\n\n")}`
								: `No results for "${query}".`,
						}],
					}
				} catch (error) {
					console.error("MCP search_content failed:", error)
					return {
						content: [{ type: "text" as const, text: "Search failed. Try list_pages instead." }],
					}
				}
			}
		)
	},
	{
		serverInfo: { name: "galaxy-tech-demo-site", version: "1.0.0" },
	}
)

export { handler as GET, handler as POST, handler as DELETE }
