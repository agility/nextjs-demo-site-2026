import { getContentItem } from "@/lib/cms/getContentItem"
import { renderHTML, type UnloadedModuleProps } from "@agility/nextjs"


export interface RichText {
	textblob: string
}

const RichTextArea = async ({ module, languageCode, isPreview }: UnloadedModuleProps) => {
	const {
		fields: { textblob },
		contentID,
	} = await getContentItem<RichText>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	return (
		<section id={`${contentID}`} className="relative px-8" data-agility-component={contentID}>
			<div className="max-w-2xl mx-auto my-12 md:mt-18 lg:mt-20">
				<div
					data-agility-field="textblob"
					data-agility-html
					className="my-6 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-full dark:prose-invert"
					dangerouslySetInnerHTML={renderHTML(textblob)}
				></div>
			</div>
		</section>
	)
}

export default RichTextArea
