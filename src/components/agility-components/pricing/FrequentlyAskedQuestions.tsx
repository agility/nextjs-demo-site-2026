import { Container } from '@/components/container'
import { Subheading, Heading } from '@/components/text'
import type { UnloadedModuleProps, ContentItem } from "@agility/nextjs"
import { getContentItem } from "@/lib/cms/getContentItem"
import { getContentList } from "@/lib/cms/getContentList"

interface IFrequentlyAskedQuestions {
	subheading?: string
	heading?: string
	faqs: { referencename: string }
}

interface IFAQ {
	question: string
	answer: string
}

export const FrequentlyAskedQuestions = async ({ module, languageCode }: UnloadedModuleProps) => {
	const {
		fields: {
			subheading = "Frequently asked questions",
			heading = "Your questions answered.",
			faqs: { referencename: faqsReferenceName },
		},
		contentID,
	} = await getContentItem<IFrequentlyAskedQuestions>({
		contentID: module.contentid,
		languageCode,
	})

	// Get the FAQs
	const faqsData = await getContentList<IFAQ>({
		referenceName: faqsReferenceName,
		languageCode,
		take: 100,
	})

	const faqs: IFAQ[] = faqsData.items.map((faq: ContentItem<IFAQ>) => faq.fields)

	// Build FAQPage JSON-LD structured data. Answers may contain HTML, so strip tags.
	const stripHtml = (html: string) =>
		(html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()

	const faqStructuredData = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((f) => ({
			"@type": "Question",
			name: f.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: stripHtml(f.answer),
			},
		})),
	}

	return (
		<Container className='mt-20' data-agility-component={contentID}>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
			/>
			<section id="faqs" className="scroll-mt-8">
				<Subheading className="text-center" data-agility-field="subheading">
					{subheading}
				</Subheading>
				<Heading as="div" className="mt-2 text-center" data-agility-field="heading">
					{heading}
				</Heading>
				<div className="mx-auto mt-16 mb-32 max-w-xl space-y-12" data-agility-field="faqs">
					{faqs.map((faq, index) => (
						<dl key={index}>
							<dt className="text-sm font-semibold text-gray-900 dark:text-white">
								{faq.question}
							</dt>
							<dd className="mt-4 text-sm/6 text-gray-600 dark:text-gray-300">
								{faq.answer}
							</dd>
						</dl>
					))}
				</div>
			</section>
		</Container>
	)
}
