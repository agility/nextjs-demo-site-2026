import type { AgilityPageProps, ImageField } from "@agility/nextjs"
import type { ContentItem } from "@agility/content-fetch"
import type { Metadata, ResolvingMetadata } from "next"
import { getHeaderContent } from "./getHeaderContent"

import ReactHtmlParser from "html-react-parser"
import { getContentItem } from "@/lib/cms/getContentItem"
import { decodeHtmlEntities } from "@/lib/utils"
import type { JSX } from "react"
import { getSitemapFlat } from "@/lib/cms/getSitemapFlat"
import { toPublicPath } from "@/lib/cms/homePage"
import { localizeUrl } from "@/lib/i18n/localizeUrl"
import { defaultLocale, locales } from "@/lib/i18n/config"

/**
 * Open Graph locale (`language_TERRITORY`) for an Agility locale code:
 * `en-us` -> `en_US`. A code with no region (`fr`) uses the territory below,
 * or the language alone if none is listed.
 */
const OG_TERRITORY: Record<string, string> = { fr: "CA" }
const toOgLocale = (locale: string): string => {
	const [language, region] = locale.split("-")
	const territory = region || OG_TERRITORY[language]
	return territory ? `${language}_${territory.toUpperCase()}` : language
}

interface Props {
	agilityData: AgilityPageProps
	locale: string
	sitemap: string
	isPreview: boolean
	isDevelopmentMode: boolean
	parent: ResolvingMetadata
}

export const resolveAgilityMetaData = async ({ agilityData, locale, sitemap, parent, isPreview }: Props): Promise<Metadata> => {


	const header = await getHeaderContent({ locale })
	const ogImages = (await parent).openGraph?.images || []

	//whether this dynamic page is a blog Post (drives openGraph.type + article fields)
	let isPost = false
	//article-specific openGraph fields, resolved from the Post content item when present
	let publishedTime: string | undefined = undefined
	let authors: string | undefined = undefined
	let section: string | undefined = undefined

	//#region *** resolve open graph stuff from dynamic pages ***
	if (agilityData.sitemapNode.contentID !== undefined
		&& agilityData.sitemapNode.contentID > 0) {

		//get the content item for this dynamic page
		try {
			const contentItem: ContentItem = await getContentItem({
				preview: isPreview,
				contentID: agilityData.sitemapNode.contentID,
				languageCode: locale,
				locale
			})

			if (contentItem.properties.definitionName === "Post") {
				/* *** Posts MetaData *** */
				isPost = true

				const image = contentItem.fields["image"] as ImageField | undefined

				if (image) {
					ogImages.push({
						url: `${image.url}?format=auto&w=1200`,
						alt: image.label
					})
				}

				//reuse the already-fetched Post fields for article openGraph metadata (guard everything)
				const postDate = (contentItem.fields["postDate"] ?? contentItem.fields["date"]) as string | undefined
				if (postDate) publishedTime = new Date(postDate).toISOString()

				const author = contentItem.fields["author"] as { fields?: { name?: string; title?: string } } | { name?: string } | string | undefined
				if (typeof author === "string") {
					if (author) authors = author
				} else if (author) {
					const authorName = ("fields" in author ? (author.fields?.name || author.fields?.title) : (author as { name?: string }).name)
					if (authorName) authors = authorName
				}

				const category = contentItem.fields["category"] as { fields?: { title?: string; name?: string } } | { title?: string } | string | undefined
				if (typeof category === "string") {
					if (category) section = category
				} else if (category) {
					const categoryName = ("fields" in category ? (category.fields?.title || category.fields?.name) : (category as { title?: string }).title)
					if (categoryName) section = categoryName
				}
			} else {
				//TODO: handle other dynamic pages types here!
			}

		} catch (error) {
			console.warn("Could not resolve open graph meta data from dynamic page contentID:", agilityData.sitemapNode.contentID, error)
		}
	}
	//#endregion

	//#region *** resolve the "additional" meta tags ***
	const metaHTML = agilityData.page?.seo?.metaHTML

	const otherMetaData: { [name: string]: string } = {}


	if (metaHTML) {
		const additionalHeaderMarkup = ReactHtmlParser(metaHTML)

		const handleMetaTag = (item: JSX.Element) => {
			if (!item.type) return
			//check if this is a meta tag and add it to the otherMetaData if so
			if (item.type === "meta") {
				const metaTag = item.props as React.MetaHTMLAttributes<HTMLMetaElement>
				if (metaTag && (metaTag.property || metaTag.name) && metaTag.content) {

					const metaProperty = metaTag.property || metaTag.name
					if (!metaProperty) return

					//special case for og:image
					if (metaProperty === "og:image") {
						ogImages.push({
							url: metaTag.content
						})
					} else {
						otherMetaData[metaProperty] = metaTag.content
					}

					return
				}
			}
			console.warn("Warning: could not output tag in Additional Header Markup", item)
		}

		if (typeof additionalHeaderMarkup === "string") {
			console.warn("Could not parse additional meta tags from Agility CMS")
		} else if (Array.isArray(additionalHeaderMarkup)) {
			//array of meta tags
			additionalHeaderMarkup.forEach((item) => handleMetaTag(item));
		} else {
			//single meta tag
			handleMetaTag(additionalHeaderMarkup)
		}
	}
	//#endregion



	//#region *** localized paths + resolved title/description ***
	//NOTE: assumes slugs match across locales. This is an acceptable fallback
	//since we don't look up the matching localized sitemap node here.
	//The home node is served at the root ("/", "/fr"), not at its own sitemap
	//path; toPublicPath maps it (see lib/cms/homePage.ts). Same cached sitemap
	//call getAgilityPage makes, so this is a cache hit.
	const sitemapFlat = await getSitemapFlat({ channelName: sitemap, languageCode: locale, preview: isPreview })
	const path = toPublicPath(agilityData.sitemapNode?.path, sitemapFlat)
	//the default locale has no url prefix; every other locale is prefixed with /{locale}
	const localizedPath = localizeUrl(path, locale)

	const siteName = header?.siteName || "Galaxy Tech"

	const title = `${decodeHtmlEntities(agilityData.sitemapNode?.title)} | ${siteName}`

	const description = agilityData.page?.seo?.metaDescription
		|| `${siteName} — move at the speed of change. A demo built with Agility CMS.`

	const ogLocale = toOgLocale(locale)

	//openGraph is a discriminated union on `type`, so branch on isPost to keep literal types
	//and only attach the article-only fields (publishedTime/authors/section) for Posts.
	const openGraph: Metadata["openGraph"] = isPost
		? {
			title,
			description,
			url: localizedPath,
			siteName,
			type: "article",
			locale: ogLocale,
			images: ogImages,
			...(publishedTime ? { publishedTime } : {}),
			...(authors ? { authors } : {}),
			...(section ? { section } : {}),
		}
		: {
			title,
			description,
			url: localizedPath,
			siteName,
			type: "website",
			locale: ogLocale,
			images: ogImages,
		}
	//#endregion

	const metaData: Metadata = {
		metadataBase: new URL(process.env.SITE_URL || "https://demo.agilitycms.com"),
		title,
		description,
		keywords: agilityData.page?.seo?.metaKeywords,
		alternates: {
			//relative paths — Next resolves them against metadataBase
			canonical: localizedPath,
			//one hreflang alternate per configured locale, plus x-default
			languages: {
				...Object.fromEntries(locales.map((l) => [l, localizeUrl(path, l)])),
				"x-default": localizeUrl(path, defaultLocale),
			},
		},
		openGraph,
		twitter: {
			card: "summary_large_image",
			title,
			description,
			//ogImages elements can be a string, URL, or descriptor object — normalize to a url
			images: ogImages.map((i) => (typeof i === "string" || i instanceof URL) ? i : i.url),
		},

		generator: `Agility CMS`,
		//Google and Bing index only /docs on the demo site (Joel, 2026-11-03), which
		//this resolver never serves. Other crawlers — Algolia, Azure AI Search —
		//still index these pages. The proxy sends the same rule as an X-Robots-Tag.
		robots: { googleBot: { index: false, follow: true } },
		other: { ...otherMetaData, bingbot: "noindex, follow" }

	}

	return metaData



}