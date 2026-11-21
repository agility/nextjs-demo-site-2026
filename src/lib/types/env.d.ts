declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Agility CMS Environment Variables
			AGILITY_GUID: string
			AGILITY_API_FETCH_KEY: string
			AGILITY_API_PREVIEW_KEY: string
			AGILITY_SECURITY_KEY: string
			AGILITY_LOCALES: string
			AGILITY_SITEMAP: string
			AGILITY_FETCH_CACHE_DURATION: string
			AGILITY_PATH_REVALIDATE_DURATION: string
			// whsec_ secret of the revalidate webhook ("Enable secure delivery" in Agility).
			// Set = /api/revalidate rejects unsigned requests.
			WH_SECRET_REVALIDATE: string | undefined

			// PostHog Environment Variables
			NEXT_PUBLIC_POSTHOG_KEY: string
			NEXT_PUBLIC_POSTHOG_HOST: string

			//Algolia Environment Variables
			ALGOLIA_APP_ID: string
			ALGOLIA_SEARCH_API_KEY: string

			//Azure OpenAI Environment Variables
			AZURE_AI_RESOURCE: string | undefined
			AZURE_AI_DEPLOYMENT: string | undefined
			AZURE_AI_KEY: string | undefined

			//OpenAI Environment Variables
			OPENAI_API_KEY: string | undefined
			OPENAI_API_MODEL: string | undefined



			// Node.js Environment Variables
			NODE_ENV: 'development' | 'production' | 'test'
		}
	}
}

export { }
