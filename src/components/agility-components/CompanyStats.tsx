'use client'

import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"
import type { ContentItem, ImageField, UnloadedModuleProps } from "@agility/nextjs"
import { Container } from "../container"
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'

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

// Helper component to animate stat values
const AnimatedStatValue = ({ value }: { value: string }) => {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.5 })

	// Extract number and suffix from the value (e.g., "8,000+" -> number: 8000, suffix: "+")
	const match = value.match(/^([\d,]+\.?\d*)(.*)$/)

	if (!match) {
		// If no number found, return the original value
		return <span ref={ref}>{value}</span>
	}

	const [, numberStr, suffix] = match
	const number = parseFloat(numberStr.replace(/,/g, ''))

	// Determine if it's a decimal number
	const decimals = numberStr.includes('.') ? numberStr.split('.')[1].length : 0

	// Check if original had commas to preserve formatting
	const hasCommas = numberStr.includes(',')

	const motionValue = useMotionValue(0)
	const spring = useSpring(motionValue, { damping: 30, stiffness: 100 })
	const display = useTransform(spring, (num) => {
		const formatted = num.toFixed(decimals)
		// Add commas back if the original had them and the number is >= 1000
		if (hasCommas && num >= 1000) {
			return parseFloat(formatted).toLocaleString('en-US', {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals
			})
		}
		return formatted
	})

	useEffect(() => {
		motionValue.set(isInView ? number : 0)
	}, [isInView, number, motionValue])

	return (
		<span ref={ref}>
			<motion.span>{display}</motion.span>
			{suffix}
		</span>
	)
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
				<img
					alt=""
					src={backgroundImage?.url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2850&q=80"}
					className="h-56 w-full bg-gray-50 dark:bg-gray-800 object-cover lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2 dark:grayscale"
					data-agility-field="backgroundImage"
				/>
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
