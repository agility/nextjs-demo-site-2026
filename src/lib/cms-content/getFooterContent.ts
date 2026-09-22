import type { ContentItem, ImageField, URLField } from "@agility/nextjs"
import { getContentList } from "@/lib/cms/getContentList"

export interface IFooterLink {
	link: URLField
}

export interface ISocialLink {
	link: URLField
	icon: ImageField
}

interface IFooterItem {
	ctaSubheading: string
	ctaHeading: string
	ctaDescription: string
	ctaCTA: URLField
	col1Heading: string
	col1Links: ContentItem<IFooterLink>[]
	col2Heading: string
	col2Links: ContentItem<IFooterLink>[]
	col3Heading: string
	col3Links: ContentItem<IFooterLink>[]
	col4Heading: string
	col4Links: ContentItem<IFooterLink>[]
	copyright: string
	socialLinks: ContentItem<ISocialLink>[]
}

export interface IFooter {
	locale: string
	ctaSubheading: string
	ctaHeading: string
	ctaDescription: string
	ctaCTA: URLField
	col1Heading: string
	col1Links: IFooterLink[]
	col2Heading: string
	col2Links: IFooterLink[]
	col3Heading: string
	col3Links: IFooterLink[]
	col4Heading: string
	col4Links: IFooterLink[]
	copyright: string
	socialLinks: ISocialLink[]
}

interface Props {
	locale: string
}

/**
 * Get the site footer content from the main `sitefooter` content item,
 *
 * @param {Props} { locale }
 * @return {*}
 */
export const getFooterContent = async ({ locale }: Props): Promise<IFooter | null> => {

	// set up content item
	let contentItem: ContentItem<IFooterItem> | null = null



	try {
		/*
		Try to fetch our site footer.
		Normally we would NOT expand all links, but for the footer we want to get all the links in one request.

		The side effect of this is that when the child links are updated,
		the footer will not update until the data cache expires for this whole item.

		That's ok for this use case, since footers are not updated often.
		*/

		const footer = await getContentList<IFooterItem>({
			referenceName: "footer",
			languageCode: locale,
			take: 1,
			expandAllContentLinks: true, // expand all links
			contentLinkDepth: 1, // we only want the first level of links
			locale
		})

		// if we have a footer, set as content item
		if (footer && footer.items && footer.items.length > 0) {
			contentItem = footer.items[0]
		}

		if (!contentItem) {
			return null
		}
	} catch (error) {
		if (console) console.error("Could not load site footer item.", error)
		return null
	}

	const footerItem = contentItem.fields
	// map the content item to the IFooter interface
	return {
		locale,
		ctaSubheading: footerItem.ctaSubheading,
		ctaHeading: footerItem.ctaHeading,
		ctaDescription: footerItem.ctaDescription,
		ctaCTA: footerItem.ctaCTA,
		col1Heading: footerItem.col1Heading,
		col1Links: footerItem.col1Links.map(link => link.fields),
		col2Heading: footerItem.col2Heading,
		col2Links: footerItem.col2Links.map(link => link.fields),
		col3Heading: footerItem.col3Heading,
		col3Links: footerItem.col3Links.map(link => link.fields),
		col4Heading: footerItem.col4Heading,
		col4Links: footerItem.col4Links.map(link => link.fields),
		copyright: footerItem.copyright,
		socialLinks: footerItem.socialLinks.map(link => link.fields),
	}
}



