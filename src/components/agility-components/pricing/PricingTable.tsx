import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Link } from '@/components/link'
import { Subheading } from '@/components/text'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, MinusIcon } from '@heroicons/react/16/solid'
import type { UnloadedModuleProps, URLField, ContentItem } from "@agility/nextjs"
import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"

interface IPricingTable {
	title?: string
	subtitle?: string
	featuresJSON: string // JSON string containing features array
}

interface Feature {
	section: string
	name: string
	value: string | number | boolean
}

interface PricingTier {
	name: string
	href: string
	features: Feature[]
}

// const pricingTable = [
// 	{
// 		name: 'Starter',
// 		href: '/contact-us',
// 		features: [
// 			{ section: 'Features', name: 'Accounts', value: 3 },
// 			{ section: 'Features', name: 'Deal progress boards', value: 5 },
// 			{ section: 'Features', name: 'Sourcing platforms', value: 'Select' },
// 			{ section: 'Features', name: 'Contacts', value: 100 },
// 			{ section: 'Features', name: 'AI assisted outreach', value: false },
// 			{ section: 'Analysis', name: 'Competitor analysis', value: false },
// 			{ section: 'Analysis', name: 'Dashboard reporting', value: false },
// 			{ section: 'Analysis', name: 'Community insights', value: false },
// 			{ section: 'Analysis', name: 'Performance analysis', value: false },
// 			{ section: 'Support', name: 'Email support', value: true },
// 			{ section: 'Support', name: '24 / 7 call center support', value: false },
// 			{ section: 'Support', name: 'Dedicated account manager', value: false },
// 		],
// 	},
// 	{
// 		name: 'Growth',
// 		href: '#',
// 		features: [
// 			{ section: 'Features', name: 'Accounts', value: 10 },
// 			{ section: 'Features', name: 'Deal progress boards', value: 'Unlimited' },
// 			{ section: 'Features', name: 'Sourcing platforms', value: '100+' },
// 			{ section: 'Features', name: 'Contacts', value: 1000 },
// 			{ section: 'Features', name: 'AI assisted outreach', value: true },
// 			{ section: 'Analysis', name: 'Competitor analysis', value: '5 / month' },
// 			{ section: 'Analysis', name: 'Dashboard reporting', value: true },
// 			{ section: 'Analysis', name: 'Community insights', value: true },
// 			{ section: 'Analysis', name: 'Performance analysis', value: true },
// 			{ section: 'Support', name: 'Email support', value: true },
// 			{ section: 'Support', name: '24 / 7 call center support', value: true },
// 			{ section: 'Support', name: 'Dedicated account manager', value: false },
// 		],
// 	},
// 	{
// 		name: 'Enterprise',
// 		href: '#',
// 		features: [
// 			{ section: 'Features', name: 'Accounts', value: 'Unlimited' },
// 			{ section: 'Features', name: 'Deal progress boards', value: 'Unlimited' },
// 			{ section: 'Features', name: 'Sourcing platforms', value: '100+' },
// 			{ section: 'Features', name: 'Contacts', value: 'Unlimited' },
// 			{ section: 'Features', name: 'AI assisted outreach', value: true },
// 			{ section: 'Analysis', name: 'Competitor analysis', value: 'Unlimited' },
// 			{ section: 'Analysis', name: 'Dashboard reporting', value: true },
// 			{ section: 'Analysis', name: 'Community insights', value: true },
// 			{ section: 'Analysis', name: 'Performance analysis', value: true },
// 			{ section: 'Support', name: 'Email support', value: true },
// 			{ section: 'Support', name: '24 / 7 call center support', value: true },
// 			{ section: 'Support', name: 'Dedicated account manager', value: true },
// 		],
// 	},
// ]

export const PricingTable = async ({ module, languageCode, globalData, isPreview }: UnloadedModuleProps) => {
	const {
		fields: {
			title,
			subtitle,
			featuresJSON = ""
		},
		contentID,
	} = await getContentItem<IPricingTable>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	let tiers: PricingTier[] = []

	try {
		// Validate featuresJSON is a valid JSON string}
		// Transform the tiers data
		tiers = JSON.parse(featuresJSON)
	} catch (error) {
		console.error("Error parsing featuresJSON:", error)
	}
	if (!Array.isArray(tiers) || tiers.length === 0) {
		// If parsing fails or no tiers are provided, fallback to default pricing table
		console.warn("Invalid or empty featuresJSON, using default pricing table.")
		return null
	}
	// Fallback to default pricing table if parsing fails

	// Determine selected tier
	const tierParam = globalData?.searchParams?.tier
	let selectedTier: PricingTier | undefined
	if (typeof tierParam === 'string' && tierParam.trim() !== '') {
		selectedTier = tiers.find(tier => tier.name.toLowerCase() === tierParam.toLowerCase())
	}
	if (!selectedTier) {
		selectedTier = tiers[0] // Default to the first tier if no match
	}

	return (
		<div data-agility-component={contentID}>
			{(title || subtitle) && (
				<Container className="py-12">
					<div className="text-center">
						{subtitle && (
							<Subheading data-agility-field="subtitle">{subtitle}</Subheading>
						)}
						{title && (
							<h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl" data-agility-field="title">
								{title}
							</h2>
						)}
					</div>
				</Container>
			)}
			<Container className="py-24">
				<table className="w-full text-left" data-agility-field="pricingTiers">
					<caption className="sr-only">Pricing plan comparison</caption>
					<colgroup>
						<col className="w-3/5 sm:w-2/5" />
						{tiers.map((tier) => (
							<col
								key={tier.name}
								data-selected={selectedTier === tier ? true : undefined}
								className="w-2/5 data-selected:table-column max-sm:hidden sm:w-1/5"
							/>
						))}
					</colgroup>
					<thead>
						<tr className="max-sm:hidden">
							<td className="p-0" />
							{tiers.map((tier) => (
								<th
									key={tier.name}
									scope="col"
									data-selected={selectedTier === tier ? true : undefined}
									className="p-0 data-selected:table-cell max-sm:hidden"
								>
									<Subheading as="div">{tier.name}</Subheading>
								</th>
							))}
						</tr>
						<tr className="sm:hidden">
							<td className="p-0">
								<div className="relative inline-block">
									<Menu>									<MenuButton className="flex items-center justify-between gap-2 font-medium text-gray-900 dark:text-gray-100">
										{selectedTier.name}
										<ChevronUpDownIcon className="size-4 fill-gray-900 dark:fill-gray-100" />
									</MenuButton>									<MenuItems
										anchor="bottom start"
										className="min-w-(--button-width) rounded-lg bg-white dark:bg-gray-800 p-1 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 [--anchor-gap:6px] [--anchor-offset:-4px] [--anchor-padding:10px]"
									>
											{tiers.map((tier) => (
												<MenuItem key={tier.name}>
													<Link
														scroll={false}
														href={`/pricing?tier=${tier.name}`}
														data-selected={
															tier === selectedTier ? true : undefined
														}
														className="group flex items-center gap-2 rounded-md px-2 py-1 data-focus:bg-gray-200 dark:data-focus:bg-gray-700 text-gray-900 dark:text-gray-100"
													>
														{tier.name}
														<CheckIcon className="hidden size-4 group-data-selected:block" />
													</Link>
												</MenuItem>
											))}
										</MenuItems>
									</Menu>								<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
										<ChevronUpDownIcon className="size-4 fill-gray-900 dark:fill-gray-100" />
									</div>
								</div>
							</td>
							<td colSpan={3} className="p-0 text-right">
								<Button variant="outline" href={selectedTier.href || '#'}>
									{'Get started'}
								</Button>
							</td>
						</tr>
						<tr className="max-sm:hidden">
							<th className="p-0" scope="row">
								<span className="sr-only">Get started</span>
							</th>
							{tiers.map((tier) => (
								<td
									key={tier.name}
									data-selected={selectedTier === tier ? true : undefined}
									className="px-0 pt-4 pb-0 data-selected:table-cell max-sm:hidden"
								>
									<Button variant="outline" href={tier.href || '#'}>
										{'Get started'}
									</Button>
								</td>
							))}
						</tr>
					</thead>
					{tiers.length > 0 && [...new Set(tiers[0].features.map(({ section }) => section))].map(
						(section) => (
							<tbody key={section} className="group">
								<tr>
									<th
										scope="colgroup"
										colSpan={4}
										className="px-0 pt-10 pb-0 group-first-of-type:pt-5"
									>
										<div className="-mx-4 rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm/6 font-semibold text-gray-900 dark:text-gray-100">
											{section}
										</div>
									</th>
								</tr>
								{tiers[0].features
									.filter((feature) => feature.section === section)
									.map(({ name }) => (
										<tr
											key={name}
											className="border-b border-gray-100 dark:border-gray-700 last:border-none"
										>
											<th
												scope="row"
												className="px-0 py-4 text-sm/6 font-normal text-gray-600 dark:text-gray-400"
											>
												{name}
											</th>
											{tiers.map((tier) => {
												const value = tier.features.find(
													(feature) =>
														feature.section === section && feature.name === name,
												)?.value

												return (
													<td
														key={tier.name}
														data-selected={
															selectedTier === tier ? true : undefined
														}
														className="p-4 data-selected:table-cell max-sm:hidden"
													>
														{value === true ? (
															<>
																<CheckIcon className="size-4 fill-green-600" />
																<span className="sr-only">
																	Included in {tier.name}
																</span>
															</>
														) : value === false || value === undefined ? (
															<>
																<MinusIcon className="size-4 fill-gray-400" />
																<span className="sr-only">
																	Not included in {tier.name}
																</span>
															</>
														) : (
															<div className="text-sm/6 text-gray-900 dark:text-gray-100">{value}</div>
														)}
													</td>
												)
											})}
										</tr>
									))}
							</tbody>
						),
					)}
				</table>
			</Container>
		</div>
	)
}
