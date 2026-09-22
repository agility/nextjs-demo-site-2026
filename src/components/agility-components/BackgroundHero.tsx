import clsx from "clsx"
import { Button } from "../button"
import { Container } from "../container"
import { Gradient } from "../gradient"
import { getContentItem } from "@/lib/cms/getContentItem"
import { isFirstComponentInPage } from "@/lib/utils/pageZoneUtils"
import type { ImageField, UnloadedModuleProps, URLField } from "@agility/nextjs"


interface IGradientHero {
	heading: string
	description: string
	cta1?: URLField
	cta2?: URLField
	backgroundType?: string
	backgroundImage?: ImageField
}

/**
 * GradientHero component for the top of a page.
 * This component fetches content from Agility CMS and displays a hero section with a title, description, and buttons.
 *
 * @param {UnloadedModuleProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered hero section.
 */
export const BackgroundHero = async ({ module, languageCode, page, isPreview }: UnloadedModuleProps) => {
	const {
		fields: { heading, description, cta1, cta2, backgroundType, backgroundImage },
		contentID,
	} = await getContentItem<IGradientHero>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	//check the page object to see if this component is the TOP component
	const isFirstComponent = isFirstComponentInPage(module, page)

	return (
		<div className={clsx("relative z-0", isFirstComponent ? "-mt-36" : "mt-20")} data-agility-component={contentID}>
			<Gradient
				className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 dark:ring-white/10 ring-inset"
				backgroundType={backgroundType}
				backgroundImage={backgroundImage}
			/>
			<Container className="relative">

				<div className="pt-48 pb-24 sm:pt-52 sm:pb-32 md:pt-64 md:pb-48">
					<h1 className={clsx("font-display text-6xl/[0.9] font-medium tracking-tight text-balance sm:text-8xl/[0.8] md:text-9xl/[0.8]",
						backgroundType === "background-image"
							? "text-gray-100 text-shadow-lg"
							: "text-gray-950 dark:text-gray-50",
					)}
						data-agility-field="heading">
						{heading}
					</h1>
					<p className={clsx("mt-8 max-w-lg text-xl/7 font-medium sm:text-2xl/8",
						backgroundType === "background-image"
							? "text-gray-50/95 text-shadow-lg"
							: "text-gray-950/75 dark:text-gray-200/90",
					)}
						data-agility-field="description">
						{description}
					</p>
					<div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
						{cta1 &&
							<Button href={cta1.href} target={cta1.target} data-agility-field="cta1">
								{cta1.text}
							</Button>
						}
						{cta2 &&
							<Button href={cta2.href} target={cta2.target} variant="secondary" data-agility-field="cta2">
								{cta2.text}
							</Button>
						}

					</div>
				</div>
			</Container>
		</div>
	)
}