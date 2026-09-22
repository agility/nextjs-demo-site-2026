import type { UnloadedModuleProps, ImageField, ContentItem } from "@agility/nextjs"
import { getContentItem } from "@/lib/cms/getContentItem"
import { TestimonialClient } from './TestimonialClient'
import type { ITestimonial } from "../testimonials/types"

interface ITestimonialComponent {
	quote: string
	testimonial: ContentItem<ITestimonial>,
	backgroundPattern?: string
}

export const Testimonial = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: {
			testimonial,
			backgroundPattern = "/dot-texture.svg"
		},
		contentID,
	} = await getContentItem<ITestimonialComponent>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
		contentLinkDepth: 1
	})

	return <TestimonialClient
		quote={testimonial.fields.quote}
		authorName={testimonial.fields.name}
		authorTitle={testimonial.fields.title}
		authorImage={testimonial.fields.image}
		backgroundPattern={backgroundPattern}
		contentID={contentID}
	/>
}
