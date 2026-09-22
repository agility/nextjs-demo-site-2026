import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import type { ContentItem, ImageField, UnloadedModuleProps } from "@agility/nextjs"
import { AgilityPic } from "@agility/nextjs"
import { Container } from "../../container"
import { AnimatedStatValue } from "./AnimatedStatValue"

interface ICompanyStats {
	sectionTitle: string
	heading: string
	description: string
	backgroundImage?: ImageField
	stats: { referencename: string }
}

interface IStat {
	name: string
	value: string
}

export const CompanyStats = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: {
			sectionTitle,
			heading,
			description,
			backgroundImage,
			stats: { referencename: statsReferenceName },
		},
		contentID,
	} = await getContentItem<ICompanyStats>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	// Fetch the stats from the content list
	const statsData = await getContentList<IStat>({
		preview: isPreview,
		referenceName: statsReferenceName,
		languageCode,
		take: 20, // adjust as needed
	})

	return (
		<Container className="mt-20" data-agility-component={contentID}>
			<div className="relative bg-white dark:bg-gray-900">
				{backgroundImage && (
					<AgilityPic
						data-agility-field="backgroundImage"
						image={backgroundImage}
						alt={backgroundImage.label || "Company background"}
						fallbackWidth={1425}
						sources={[
							{
								media: "(max-width: 640px)",
								width: 640,
								height: 224, // h-56 at mobile
							},
							{
								media: "(max-width: 1024px)",
								width: 1024,
								height: 400,
							},
							{
								media: "(min-width: 1024px)",
								width: 1425,
								height: 800,
							},
						]}
						className="h-56 w-full bg-gray-50 dark:bg-gray-800 object-cover lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2 dark:grayscale"
					/>
				)}
				<div className="mx-auto grid max-w-7xl lg:grid-cols-2">
					<div className="px-6 pt-16 pb-24 sm:pt-20 sm:pb-32 lg:col-start-2 lg:px-8 lg:pt-32">
						<div className="mx-auto max-w-2xl lg:mr-0 lg:max-w-lg">
							<h2 className="text-base/8 font-semibold text-gray-600 dark:text-gray-400" data-agility-field="sectionTitle">
								{sectionTitle}
							</h2>
							<p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-gray-50 sm:text-5xl" data-agility-field="heading">
								{heading}
							</p>
							<p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300" data-agility-field="description">
								{description}
							</p>
							<dl className="mt-16 grid max-w-xl grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 xl:mt-16">
								{statsData.items.map((statItem: ContentItem<IStat>, index: number) => {
									const { fields: { name, value }, contentID: statContentID } = statItem;

									return (
										<div key={statContentID} className="flex flex-col gap-y-3 border-l border-gray-900/10 dark:border-white/15 pl-6">
											<dt className="text-sm/6 text-gray-600 dark:text-gray-400" data-agility-field="name">{name}</dt>
											<dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50" data-agility-field="value">
												<AnimatedStatValue value={value} />
											</dd>
										</div>
									)
								})}
							</dl>
						</div>
					</div>
				</div>
			</div>
		</Container>
	)
}

export default CompanyStats
