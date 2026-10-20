import { Container } from "@/components/container"
import { Heading } from "@/components/text"
import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import type { ContentItem, UnloadedModuleProps } from "@agility/nextjs"
import { AnimatedStatValue } from "../company-stats/AnimatedStatValue"

interface IStatsStrip {
	heading: string
	description?: string
	stats: { referencename: string }
}

interface IStat {
	name: string
	value: string
}

export const StatsStrip = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: {
			heading,
			description,
			stats: { referencename: statsReferenceName },
		},
		contentID,
	} = await getContentItem<IStatsStrip>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	// Fetch the stats from the nested content list
	const statsData = await getContentList<IStat>({
		preview: isPreview,
		referenceName: statsReferenceName,
		languageCode,
		take: 20,
	})

	return (
		<Container className="my-24 sm:my-32" data-agility-component={contentID}>
			<div className="mx-auto max-w-3xl text-center">
				<Heading data-agility-field="heading">{heading}</Heading>
				{description && (
					<p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300" data-agility-field="description">
						{description}
					</p>
				)}
			</div>
			<dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
				{statsData.items.map((statItem: ContentItem<IStat>) => {
					const { fields: { name, value }, contentID: statContentID } = statItem

					return (
						<div
							key={statContentID}
							className="flex flex-col bg-gray-50 p-8 dark:bg-white/5"
							data-agility-component={statContentID}
						>
							<dt className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400" data-agility-field="name">
								{name}
							</dt>
							<dd className="order-first text-4xl font-medium tracking-tight text-gray-950 dark:text-white" data-agility-field="value">
								<AnimatedStatValue value={value} />
							</dd>
						</div>
					)
				})}
			</dl>
		</Container>
	)
}

export default StatsStrip
