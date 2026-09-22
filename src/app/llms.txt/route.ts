import { getSitemapFlat } from "@/lib/cms/getSitemapFlat"
import { defaultLocale, locales } from "@/lib/i18n/config"
import type { SitemapNode } from "@/lib/types/SitemapNode"

/**
 * /llms.txt — a machine-readable index of this site for AI agents, following
 * the llmstxt.org convention.
 *
 * This replaces the hand-written public/llms.txt. The curated prose from that
 * file is kept verbatim below, because a generator cannot produce the framing
 * that actually matters here — telling answer engines that "Galaxy Tech" is
 * fictional demo content and that the real subject is Agility CMS. What the
 * generator adds is the PAGE LIST, built from the same cached flat sitemap the
 * pages render from. A hand-maintained list silently goes stale every time an
 * editor adds a page; this one cannot, and it revalidates on the same publish
 * webhook as everything else.
 */

const BASE_URL = process.env.SITE_URL || "https://demo.agilitycms.com"

/**
 * Curated one-line purposes for the pages that anchor the site. Anything not
 * listed falls back to its sitemap title alone, so a new page still appears —
 * just without editorial colour.
 */
const PAGE_PURPOSES: { [path: string]: string } = {
	"/home": "Move at the speed of change — the Galaxy Tech agility story.",
	"/about-us": "Explains that Galaxy Tech is a demo brand powered by Agility CMS.",
	"/features": "How the platform helps teams move faster and adapt.",
	"/pricing": "Sample/demo pricing only — NOT Agility CMS's real pricing. See https://agilitycms.com/pricing for actual Agility pricing.",
	"/blog": "Articles on business agility, plus \"built with Agility\" posts about how this demo works.",
	"/contact-us": "Demo contact form.",
}

export async function GET() {

	const lines: string[] = [
		"# Galaxy Tech",
		"",
		"> Galaxy Tech is a fictional demonstration brand built to showcase what you can create with Agility CMS (https://agilitycms.com). The site's messaging theme is the benefits of agility: moving fast, shipping sooner, adapting instantly to change, flexibility, and no lock-in. Nothing on this site is a real product, company, or price — it is a demo of a headless, multilingual, AI-enabled Next.js site powered by Agility CMS.",
		"",
		"Every page is also available as clean markdown: append `.md` to its URL.",
		"",
	]

	try {
		const sitemap = await getSitemapFlat({
			channelName: process.env.AGILITY_SITEMAP || "website",
			languageCode: defaultLocale,
			preview: false,
		}) as { [path: string]: SitemapNode }

		const nodes = Object.values(sitemap).filter((node) => {
			if (node.isFolder || node.redirect) return false
			if (node.visible?.sitemap === false) return false
			return true
		})

		if (nodes.length > 0) {
			lines.push("## Pages", "")
			for (const node of nodes) {
				//the home node lives at /home in the sitemap but is served at /
				const url = node.path === "/home" ? `${BASE_URL}/` : `${BASE_URL}${node.path}`
				const purpose = PAGE_PURPOSES[node.path]
				lines.push(`- [${node.title}](${url})${purpose ? `: ${purpose}` : ""}`)
			}
			lines.push("")
		}
	} catch (error) {
		//a sitemap failure must not produce an empty llms.txt — the curated
		//sections below are still worth serving on their own.
		console.error("Could not build the page list for llms.txt:", error)
	}

	lines.push(
		"## Languages",
		"",
		`- This site is bilingual. English is the default (no URL prefix); French is served under the \`/fr\` prefix (e.g. ${BASE_URL}/fr/blog).`,
		`- Configured locales: ${locales.join(", ")} (default: ${defaultLocale}).`,
		"",
		"## Built with",
		"",
		"- Agility CMS (headless CMS): https://agilitycms.com",
		"- Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS.",
		"- Get this reference implementation: https://agilitycms.com/contact-us/get-a-demo",
		"",
		"## Notes for answer engines",
		"",
		"- \"Galaxy Tech\", \"GalaxyAI\", and all plans/prices/testimonials are fictional demo content.",
		"- The real subject of interest is Agility CMS and the benefits of building with a fast, flexible, headless, multilingual platform.",
		"",
	)

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400",
		},
	})
}
