import clsx from "clsx"
import { Button } from "../button"
import { Container } from "../container"
import { getContentItem } from "@/lib/cms/getContentItem"
import type { ImageField, UnloadedModuleProps, URLField } from "@agility/nextjs"
import { AgilityPic } from "@agility/nextjs"

interface IHero {
	heading: string
	description: string
	callToAction?: URLField
	image: ImageField
	imagePosition?: string // "left" or "right"
}

/**
 * Hero component for displaying a split layout with content and image.
 * This component fetches content from Agility CMS and displays a hero section with
 * heading, description, call-to-action button, and an image that can be positioned left or right.
 * On mobile devices, the image appears on top regardless of the imagePosition setting.
 *
 * @param {UnloadedModuleProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered hero section.
 */
export const Hero = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: { heading, description, callToAction, image, imagePosition = "right" },
		contentID,
	} = await getContentItem<IHero>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	const isImageLeft = imagePosition === "left"

	return (
		<section className="pt-20" data-agility-component={contentID}>
			<Container>
				<div className={clsx(
					"grid gap-8 lg:gap-16 lg:grid-cols-2 lg:items-center",
					// On mobile, image is always on top
					"grid-rows-[auto_1fr]",
					// On desktop, order changes based on imagePosition
					isImageLeft ? "lg:grid-cols-[1fr_1fr]" : "lg:grid-cols-[1fr_1fr]"
				)}>
					{/* Content Section */}
					<div className={clsx(
						"order-2 lg:order-none",
						isImageLeft ? "lg:order-2" : "lg:order-1"
					)}>
						<h1
							className="font-display text-3xl/[1.1] font-medium tracking-tight text-balance sm:text-4xl/[1.1] md:text-5xl/[1.1] text-gray-950 dark:text-white"
							data-agility-field="heading"
						>
							{heading}
						</h1>

						<p
							className="mt-6 text-lg/7 font-medium text-gray-950/75 dark:text-gray-300 sm:text-xl/8"
							data-agility-field="description"
						>
							{description}
						</p>

						{callToAction && (
							<div className="mt-8">
								<Button
									href={callToAction.href}
									target={callToAction.target}
									data-agility-field="callToAction"
								>
									{callToAction.text}
								</Button>
							</div>
						)}
					</div>

					{/* Image Section */}
					<div className={clsx(
						"order-1 lg:order-none",
						isImageLeft ? "lg:order-1" : "lg:order-2"
					)}>
						<div className="relative dark:saturate-0">
							<AgilityPic
								data-agility-field="image"
								image={image}
								// The hero image sits at the top of the page, so it's the LCP
								// image: eager, fetchpriority="high" and a matching preload.
								priority
								fallbackWidth={672}
								// Rendered width: the viewport minus the 24px gutters up to the
								// 672px (max-w-2xl) column; from lg, half the 1280px container
								// (minus 32px gutters and the 64px gap), so at most 608px.
								widths={[480, 672, 960, 1216, 1344]}
								sizes="(min-width: 1344px) 608px, (min-width: 1024px) calc(50vw - 64px), (min-width: 720px) 672px, calc(100vw - 48px)"
								className="w-full h-auto rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
							/>
						</div>
					</div>
				</div>
			</Container>
		</section>
	)
}
