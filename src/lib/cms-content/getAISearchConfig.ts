import type { ContentItem } from "@agility/nextjs"
import { getContentList } from "@/lib/cms/getContentList"

interface IAISearchConfig {
	aiSearchHelp: string
	showAISearch: string
	aISearchSummarySystemPrompt: string
	maxTokens: string
	temperature: string
	defaultPrompt1: string
	defaultPrompt2: string
	defaultPrompt3: string
	fullAgentMode: string
	contactCaptureURL: string
}

export interface IAISearchConfigData {
	aiSearchHelp: string // Placeholder text for the AI search input field
	showAISearch: boolean
	systemPrompt: string
	maxTokens: number
	temperature: number
	defaultPrompts: string[] // Array of up to 3 default search prompts
	fullAgentMode: boolean // Whether to show full agent dialog instead of search
	contactCaptureURL?: string // URL for posting contact form submissions
}

interface Props {
	locale: string
}

/**
 * Parse temperature value from dropdown selection
 */
const parseTemperature = (temperatureValue: string | undefined | null): number => {
	// Return default if value is undefined, null, or empty
	if (!temperatureValue || temperatureValue.trim() === '') {
		return 0.3
	}

	// Extract numeric value from the dropdown selection
	if (temperatureValue.includes("0.1")) return 0.1
	if (temperatureValue.includes("0.3")) return 0.3
	if (temperatureValue.includes("0.5")) return 0.5
	if (temperatureValue.includes("0.7")) return 0.7
	if (temperatureValue.includes("0.9")) return 0.9

	// Default fallback
	return 0.3
}

/**
 * Get the AI Search configuration from the `AISearchConfiguration` content container.
 * This contains the system prompt and other AI configuration settings.
 * Always returns configuration values, using defaults if CMS data is unavailable.
 *
 * @param {Props} { locale }
 * @return {IAISearchConfigData}
 */
export const getAISearchConfig = async ({ locale }: Props): Promise<IAISearchConfigData> => {

	// Default configuration values
	const defaultConfig: IAISearchConfigData = {
		aiSearchHelp: "Ask me anything about our products and services...",
		showAISearch: true,
		systemPrompt: `You are an AI search assistant for this website. You help users find information from the website's content through search.

Your role:
- You are knowledgeable about the content, products, services, and information available on this website
- You only provide information found on the website through search results using the search tool
- You help users discover relevant content and answer their questions based on what's available
- Always use the search tool to find current information before responding
- Stay focused on topics related to this website's content and purpose

Response format:
1. Provide a direct, helpful answer based on the search results
2. Highlight the most relevant information from the website's content
3. If multiple relevant topics are found, organize them clearly
4. If no relevant results are found, suggest alternative search terms or topics
5. Be conversational but professional - you represent this website

Keep responses informative and helpful. Use the search tool results to provide accurate summaries and information.`,
		maxTokens: 2000,
		temperature: 0.3,
		defaultPrompts: [],
		fullAgentMode: false
	}

	// set up content item
	let contentItem: ContentItem<IAISearchConfig> | null = null

	try {
		// try to fetch our AI search configuration (reference name is case-sensitive)
		const aiConfig = await getContentList<IAISearchConfig>({
			referenceName: "aisearchconfiguration",
			languageCode: locale,
			take: 1,
			locale
		})

		// if we have a config, set as content item
		if (aiConfig && aiConfig.items && aiConfig.items.length > 0) {
			contentItem = aiConfig.items[0]
		}

		if (!contentItem) {
			console.warn("No AI Search Configuration found in Agility CMS, using defaults")
			return defaultConfig
		}
	} catch (error) {
		console.error("Could not load AI Search Configuration from Agility CMS, using defaults:", error)
		return defaultConfig
	}

	// Return configuration with CMS values or fallback to defaults
	const defaultPrompts = [
		contentItem.fields.defaultPrompt1,
		contentItem.fields.defaultPrompt2,
		contentItem.fields.defaultPrompt3
	].filter(prompt => prompt && prompt.trim() !== '') // Only include non-empty prompts

	return {
		aiSearchHelp: contentItem.fields.aiSearchHelp || defaultConfig.aiSearchHelp,
		showAISearch: (contentItem.fields.showAISearch ?? "false") === "true",
		systemPrompt: contentItem.fields.aISearchSummarySystemPrompt || defaultConfig.systemPrompt,
		maxTokens: parseInt(contentItem.fields.maxTokens) || defaultConfig.maxTokens,
		temperature: parseTemperature(contentItem.fields.temperature),
		defaultPrompts: defaultPrompts,
		fullAgentMode: (contentItem.fields.fullAgentMode ?? "false") === "true",
		contactCaptureURL: contentItem.fields.contactCaptureURL || undefined
	} as IAISearchConfigData
}