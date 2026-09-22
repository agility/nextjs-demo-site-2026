import type { UnloadedModuleProps } from "@agility/nextjs"


import { getContentItem } from "@/lib/cms/getContentItem"
import OutputContentItem from "./output-content-item/OutputContentItem"

const NoComponentFound = async ({ module, languageCode, isDevelopmentMode, isPreview }: UnloadedModuleProps) => {
	const contentItem = await getContentItem<any>({
		preview: isPreview,
		contentID: module.contentid,
		languageCode,
	})

	if (isDevelopmentMode || isPreview) {
		//in development mode, show the error
		return <OutputContentItem contentItem={contentItem} />
	} else {
		//in production mode, just keep on truckin' after throwing a warning in the log
		console.warn("Agility: No Component form for: ", contentItem?.properties.definitionName)
		return null
	}
}

export default NoComponentFound
