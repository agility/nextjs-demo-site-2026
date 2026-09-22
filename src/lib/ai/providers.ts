import { createAzure, type AzureOpenAIProvider } from '@ai-sdk/azure'
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

// Create the Azure OpenAI provider if we have the necessary environment variables
const azure: AzureOpenAIProvider | null = process.env.AZURE_AI_RESOURCE ? createAzure({
  resourceName: process.env.AZURE_AI_RESOURCE,
  apiKey: process.env.AZURE_AI_KEY
}) : null

// Create OpenAI provider as fallback if no Azure vars are set
const openai: AzureOpenAIProvider | null = process.env.OPENAI_API_KEY ? createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

/**
 * Validate AI environment variables and return configuration status
 */
export function validateAIEnvironment() {
  const useAzureAI = process.env.AZURE_AI_RESOURCE && process.env.AZURE_AI_KEY && process.env.AZURE_AI_DEPLOYMENT
  const useOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_MODEL

  return {
    useAzureAI: !!useAzureAI,
    useOpenAI: !!useOpenAI,
    hasValidConfig: !!(useAzureAI || useOpenAI)
  }
}

/**
 * Get the configured AI model based on environment variables
 */
export function getAIModel(): LanguageModel | null {
  const { useAzureAI, useOpenAI } = validateAIEnvironment()

  if (useAzureAI && process.env.AZURE_AI_DEPLOYMENT && azure) {
    return azure(process.env.AZURE_AI_DEPLOYMENT)
  } else if (useOpenAI && openai && process.env.OPENAI_API_MODEL) {
    return openai(process.env.OPENAI_API_MODEL)
  }

  return null
}

/**
 * Validate Algolia environment variables
 */
export function validateAlgoliaEnvironment() {
  return !!(process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_SEARCH_API_KEY)
}