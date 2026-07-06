import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Gradient } from '@/components/gradient'
import { LogoCloud } from '@/components/logo-cloud'
import { Subheading } from '@/components/text'
import { CheckIcon, MinusIcon } from '@heroicons/react/16/solid'
import type { UnloadedModuleProps, URLField, ContentItem } from "@agility/nextjs"
import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import type { IPricingTier } from "@/lib/types/IPricingTier"
import { getRegionContentID } from '@/lib/utils/audienceRegionUtils'

interface IPricingCards {
	title?: string
	subtitle?: string
	pricingTiers: { referencename: string }

}

interface TransformedTier {
	name: string
	description: string
	priceMonthly: number
	currency: string
	currencySymbol: string
	ctaButton: URLField
	highlights: string[]
	regionName?: string
	regionID?: string
}

export const PricingCards = async ({ module, languageCode, globalData }: UnloadedModuleProps) => {
	const {
		fields: {
			title,
			subtitle,
			pricingTiers: { referencename: tiersReferenceName },

		},
		contentID,
	} = await getContentItem<IPricingCards>({
		contentID: module.contentid,
		languageCode,
	})

	// Get the pricing tiers
	const tiersData = await getContentList<IPricingTier>({
		referenceName: tiersReferenceName,
		languageCode,
		take: 100,
	})


	const searchParams = globalData?.["searchParams"]
	let regionContentID: number | null = null
	if (searchParams) {
		//check the personalization stuff and filter the list of customers
		regionContentID = await getRegionContentID(searchParams, languageCode)

	}

	console.log("Region Content ID: ", regionContentID)

	// Transform the tiers data
	const tiers: TransformedTier[] = tiersData.items
		.filter(tier => {
			// If there's no regionContentID, include the defaults
			if (!regionContentID) return !tier.fields.regionID;

			const tierRegionID = tier.fields.regionID ? parseInt(tier.fields.regionID) : null;

			// Include the tier if it matches the regionContentID
			return tierRegionID === regionContentID;
		})
		.map((tier: ContentItem<IPricingTier>) => {
			const fields = tier.fields
			return {
				...fields,
				priceMonthly: parseFloat(fields.priceMonthly) || 0,
				highlights: fields.highlights ? fields.highlights.split('\n').map(h => h.trim()).filter(h => h) : [],
			}
		})

	// Build Product JSON-LD structured data, one entry per pricing tier, omitting missing fields.
	const baseUrl = process.env.SITE_URL || "https://demo.agilitycms.com"
	const productsStructuredData = tiers.map((tier) => {
		const offers: Record<string, any> = {
			"@type": "Offer",
			url: tier.ctaButton?.href || baseUrl,
		}
		if (tier.priceMonthly != null) {
			offers.price = tier.priceMonthly
		}
		if (tier.currency) {
			offers.priceCurrency = tier.currency
		}

		const product: Record<string, any> = {
			"@context": "https://schema.org",
			"@type": "Product",
			offers,
		}
		if (tier.name) {
			product.name = tier.name
		}
		if (tier.description) {
			product.description = tier.description
		}
		return product
	})

	return (
		<div className="relative py-24" data-agility-component={contentID}>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(productsStructuredData) }}
			/>
			<Gradient backgroundType='grays' className="absolute inset-x-2 top-48 bottom-0 rounded-4xl ring-1 ring-black/5 dark:ring-white/10 ring-inset" />
			<Container className="relative">
				{(title || subtitle) && (
					<div className="text-center mb-16">
						{subtitle && (
							<Subheading data-agility-field="subtitle">{subtitle}</Subheading>
						)}
						{title && (
							<h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl" data-agility-field="title">
								{title}
							</h2>
						)}
					</div>
				)}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3" data-agility-field="pricingTiers">
					{tiers.map((tier: TransformedTier, tierIndex: number) => (
						<PricingCard key={tierIndex} tier={tier} />
					))}
				</div>
			</Container>
		</div>
	)
}

function PricingCard({ tier }: { tier: TransformedTier }) {
	return (
		<div className="-m-2 grid grid-cols-1 rounded-4xl shadow-[inset_0_0_2px_1px_#ffffff4d] dark:shadow-[inset_0_0_2px_1px_#ffffff1a] ring-1 ring-black/5 dark:ring-white/10 max-lg:mx-auto max-lg:w-full max-lg:max-w-md">
			<div className="grid grid-cols-1 rounded-4xl p-2 shadow-md shadow-black/5 dark:shadow-black/20">
				<div className="rounded-3xl bg-white dark:bg-gray-900 p-10 pb-9 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
					<Subheading>{tier.name}</Subheading>
					<p className="mt-2 text-sm/6 text-gray-950/75 dark:text-gray-300">{tier.description}</p>
					<div className="mt-8 flex items-center gap-4">
						<div className="text-5xl font-medium text-gray-950 dark:text-white">
							{tier.currencySymbol || '$'}{tier.priceMonthly}
						</div>
						<div className="text-sm/5 text-gray-950/75 dark:text-gray-300">
							<p>{tier.currency || 'USD'}</p>
							<p>per month</p>
						</div>
					</div>
					<div className="mt-8">
						<Button href={tier.ctaButton?.href || '#'}>
							{tier.ctaButton?.text || 'Start a free trial'}
						</Button>
					</div>
					<div className="mt-8">
						<h3 className="text-sm/6 font-medium text-gray-950 dark:text-white">
							Start selling with:
						</h3>
						<ul className="mt-3 space-y-3">
							{tier.highlights.map((highlight: string, featureIndex: number) => (
								<FeatureItem key={featureIndex} description={highlight} />
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}

function FeatureItem({
	description,
	disabled = false,
}: {
	description: string
	disabled?: boolean
}) {
	return (
		<li
			data-disabled={disabled ? true : undefined}
			className="flex items-start gap-4 text-sm/6 text-gray-950/75 dark:text-gray-300 data-disabled:text-gray-950/25 dark:data-disabled:text-gray-600"
		>
			<span className="inline-flex h-6 items-center">
				<PlusIcon className="size-3.75 shrink-0 fill-gray-950/25 dark:fill-gray-400" />
			</span>
			{disabled && <span className="sr-only">Not included:</span>}
			{description}
		</li>
	)
}

function PlusIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
	return (
		<svg viewBox="0 0 15 15" aria-hidden="true" {...props}>
			<path clipRule="evenodd" d="M8 0H7v7H0v1h7v7h1V8h7V7H8V0z" />
		</svg>
	)
}
