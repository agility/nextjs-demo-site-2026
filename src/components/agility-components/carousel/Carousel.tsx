import { getContentItem } from "@/lib/cms/getContentItem";
import { getContentList } from "@/lib/cms/getContentList";
import type { ContentItem, ImageField, URLField, UnloadedModuleProps } from "@agility/nextjs";
import { Container } from "../../container";
import { Subheading, Heading } from "../../text";
import { CarouselClient } from "./CarouselClient";

interface ICarouselModuleFields {
	subheading?: string
	heading?: string
	slides: { referencename: string }
}

interface ICarouselSlideFields {
	heading: string
	image: ImageField
	cta?: URLField
	ctaText?: string
	description?: string
}

export const Carousel = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: { subheading = "", heading = "", slides: { referencename: slidesRef } },
		contentID
	} = await getContentItem<ICarouselModuleFields>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode
	});

	const slides = await getContentList<ICarouselSlideFields>({
		preview: isPreview,
		referenceName: slidesRef,
		languageCode,
		take: 25
	});

	if (!slides.items?.length) return null;

	return (
		<Container className="mt-20" data-agility-component={contentID}>
			{(subheading || heading) && (
				<div className="mb-8">
					{subheading && <Subheading data-agility-field="subheading">{subheading}</Subheading>}
					{heading && <Heading as="h3" className="mt-2" data-agility-field="heading">{heading}</Heading>}
				</div>
			)}
			<CarouselClient
				slides={slides.items as ContentItem<ICarouselSlideFields>[]}
			/>
		</Container>
	);
};

export default Carousel;
