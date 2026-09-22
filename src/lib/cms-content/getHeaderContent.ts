import type { ContentItem, ImageField, URLField } from "@agility/nextjs"
import { getContentList } from "@/lib/cms/getContentList"

interface ISubNavLink {
	link: URLField
	description?: string
	icon?: ImageField
}

export interface ILink {
	link: URLField
	subNavLinks: ISubNavLink[]
	bottomLink1?: URLField | null
	bottomLink2?: URLField | null
}

export interface IHeaderData {
	siteName: string
	logo: ImageField
	bannerLink?: URLField | null
	links: ILink[]
}

interface IHeader {
	siteName: string
	logo: ImageField
	bannerLink?: URLField
	navigation: { referencename: string }
}

interface Props {
	locale: string
}

/**
 * Get the site header content from the main `siteheader` content item,
 * We are using nested linked content lists for the navigation structure.
 *
 * @param {Props} { locale }
 * @return {*}
 */
export const getHeaderContent = async ({ locale }: Props) => {

	// set up content item
	let contentItem: ContentItem<IHeader> | null = null



	try {
		// try to fetch our site header
		const header = await getContentList<IHeader>({
			referenceName: "header",
			languageCode: locale,
			take: 1,
			locale
		})

		// if we have a header, set as content item
		if (header && header.items && header.items.length > 0) {
			contentItem = header.items[0]
		}

		if (!contentItem) {
			return null
		}
	} catch (error) {
		if (console) console.error("Could not load site header item.", error)
		return null
	}

	let links: ILink[] = []

	try {

		//get the nav links
		const navLinks = await getContentList<ILink>({
			referenceName: contentItem.fields.navigation.referencename,
			languageCode: locale,
			contentLinkDepth: 1, // we only want the first level of links
			expandAllContentLinks: true,
			take: 10, // adjust as needed
			locale
		})



		links = navLinks.items.map((item: any) => {
			return {
				link: item.fields.link,
				subNavLinks: (item.fields.subNavLinks || []).map((subLink: any) => ({
					link: subLink.fields.link,
					description: subLink.fields.description,
					icon: subLink.fields.icon
				})),
				bottomLink1: item.fields.bottomLink1 || null,
				bottomLink2: item.fields.bottomLink2 || null
			}
		})

	} catch (error) {
		if (console) console.error("Could not load nested sitemap.", error)
	}


	return {
		siteName: contentItem.fields.siteName,
		bannerLink: contentItem.fields.bannerLink || null,
		logo: contentItem.fields.logo,
		links,
	} as IHeaderData
}



