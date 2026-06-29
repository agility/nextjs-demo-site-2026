import { Container } from '@/components/container'
import { Heading, Lead, Subheading } from '@/components/text'
import { getContentItem } from '@/lib/cms/getContentItem'
import { decodeHtmlEntities } from '@/lib/utils'
import type { UnloadedModuleProps } from '@agility/nextjs'

interface IBlogHeader {
	subheading: string
	heading: string
	description: string
}

/**
 * BlogHeader component for displaying blog section header.
 * This component fetches content from Agility CMS and displays a blog header section with subheading, title, and description.
 *
 * @param {UnloadedModuleProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered blog header section.
 */
export const BlogHeader = async ({ module, languageCode }: UnloadedModuleProps) => {
	const {
		fields: { subheading, heading, description },
		contentID,
	} = await getContentItem<IBlogHeader>({
		contentID: module.contentid,
		languageCode,
	})

	return (
		<Container data-agility-component={contentID}>
			<Subheading className="mt-16" data-agility-field="subheading">
				{decodeHtmlEntities(subheading)}
			</Subheading>
			<Heading as="h1" className="mt-2" data-agility-field="heading">
				{decodeHtmlEntities(heading)}
			</Heading>
			<Lead className="mt-6 max-w-3xl" data-agility-field="description">
				{decodeHtmlEntities(description)}
			</Lead>
		</Container>
	)
}
