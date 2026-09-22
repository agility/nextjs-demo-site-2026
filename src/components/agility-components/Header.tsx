import { Container } from '@/components/container'
import { Heading, Lead, Subheading } from '@/components/text'
import { getContentItem } from '@/lib/cms/getContentItem'
import type { UnloadedModuleProps } from '@agility/nextjs'

interface IHeader {
	subheading?: string
	heading: string
	description?: string
}

/**
 * Header component for displaying section header.
 * This component fetches content from Agility CMS and displays a header section with subheading, title, and description.
 *
 * @param {UnloadedModuleProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered header section.
 */
export const Header = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: { subheading, heading, description },
		contentID,
	} = await getContentItem<IHeader>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	return (
		<Container data-agility-component={contentID}>
			{subheading && (
				<Subheading className="mt-16" data-agility-field="subheading">
					{subheading}
				</Subheading>
			)}
			<Heading as="h1" className="mt-2" data-agility-field="heading">
				{heading}
			</Heading>
			{description && (
				<Lead className="mt-6 max-w-3xl" data-agility-field="description">
					{description}
				</Lead>
			)}
		</Container>
	)
}
