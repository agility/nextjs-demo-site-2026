import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import type { ContentItem, ImageField, UnloadedModuleProps } from "@agility/nextjs"
import { AgilityPic } from "@agility/nextjs"
import { Container } from "../container"
import { Subheading } from "../text"

interface ITeamListing {
	heading: string
	team: {
		referencename: string
	}
}

interface ITeamMember {
	name: string
	title: string
	headShot: ImageField
}

function Person({
	name,
	title,
	image,
}: {
	name: string
	title: string
	image: ImageField
}) {
	return (
		<li className="flex items-center gap-4">
			<AgilityPic
				image={image}
				fallbackWidth={48}
				alt={image.label || `${name} headshot`}
				className="size-12 rounded-full object-cover dark:grayscale"
			/>
			<div className="text-sm/6">
				<h3 className="font-medium" data-agility-field="name">{name}</h3>
				<p className="text-gray-500" data-agility-field="title">{title}</p>
			</div>
		</li>
	)
}

export const TeamListing = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: { heading, team: { referencename: teamReferenceName } },
		contentID,
	} = await getContentItem<ITeamListing>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	// Get the team members from the "team" content list
	const { items: teamMembers } = await getContentList<ITeamMember>({
		preview: isPreview,
		referenceName: teamReferenceName,
		languageCode,
		take: 50, // adjust as needed
	})

	return (
		<Container className="mt-32" data-agility-component={contentID}>
			<Subheading as="h3" className="mt-24" data-agility-field="heading">
				{heading}
			</Subheading>
			<hr className="mt-6 border-t border-gray-200" />
			<ul
				role="list"
				className="mx-auto mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
			>
				{teamMembers.map((member) => (
					<Person
						key={member.contentID}
						name={member.fields.name}
						title={member.fields.title}
						image={member.fields.headShot}
					/>
				))}
			</ul>
		</Container>
	)
}