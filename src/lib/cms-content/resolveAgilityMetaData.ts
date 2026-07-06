import { type AgilityPageProps, type ImageField } from "@agility/nextjs"
import { type ContentItem } from "@agility/content-fetch"
import { type Metadata, type ResolvingMetadata } from "next"
import { getHeaderContent } from "./getHeaderContent"

import ReactHtmlParser from "html-react-parser"
import { getContentItem } from "@/lib/cms/getContentItem"
import { decodeHtmlEntities } from "@/lib/utils"
import type { JSX } from "react"

interface Props {
	agilityData: AgilityPageProps
	locale: string
	sitemap: string
	isPreview: boolean
	isDevelopmentMode: boolean
	parent: ResolvingMetadata
}

export const resolveAgilityMetaData = async ({ agilityData, locale, parent }: Props): Promise<Metadata> => {


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
	let metaHTML = agilityData.page?.seo?.metaHTML

	let otherMetaData: { [name: string]: string } = {}


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
	//NOTE: assumes slugs match across locales (en-us <-> fr). This is an acceptable
	//fallback since we don't look up the matching localized sitemap node here.
	const rawPath = agilityData.sitemapNode?.path
	const path = (!rawPath || rawPath === "/") ? "" : rawPath
	//en-us is the default locale and has no url prefix; fr is prefixed with /fr
	const localizedPath = locale === "en-us" ? path : `/fr${path}`

	const siteName = header?.siteName || "Galaxy Tech"

	const title = `${decodeHtmlEntities(agilityData.sitemapNode?.title)} | ${siteName}`

	const description = agilityData.page?.seo?.metaDescription
		|| `${siteName} — move at the speed of change. A demo built with Agility CMS.`

	const ogLocale = locale === "fr" ? "fr_CA" : "en_US"

	//openGraph is a discriminated union on `type`, so branch on isPost to keep literal types
	//and only attach the article-only fields (publishedTime/authors/section) for Posts.
	const openGraph: Metadata["openGraph"] = isPost
		? {
			title,
			description,
			url: localizedPath || "/",
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
			url: localizedPath || "/",
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
			canonical: localizedPath || "/",
			languages: {
				"en-us": path || "/",
				"fr": `/fr${path || ""}` || "/fr",
				"x-default": path || "/",
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
		other: otherMetaData

	}

	return metaData



}