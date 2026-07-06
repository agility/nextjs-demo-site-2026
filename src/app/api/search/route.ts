import { algoliasearch } from 'algoliasearch'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		// Validate environment variables
		if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_SEARCH_API_KEY) {
			console.error('Missing required Algolia environment variables')
			return Response.json(
				{ error: 'Search service configuration error' },
				{ status: 500 }
			)
		}

		// Initialize Algolia client lazily (avoids throwing at import/build time when keys are absent)
		const algolia = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_SEARCH_API_KEY)

		const { query, limit = 10 }: { query: string; limit?: number } = await req.json()

		if (!query || query.trim().length === 0) {
			return Response.json(
				{ error: 'Query is required' },
				{ status: 400 }
			)
		}


		const searchParams = {
			query: query.trim(),
			hitsPerPage: limit,
			attributesToRetrieve: ['title', 'content', 'url', 'excerpt', 'description', 'image', 'imageUrl', 'featuredImage', 'date', 'category', 'tags', 'objectID'],
		}

		// Use the known content index
		const response = await algolia.searchSingleIndex({
			indexName: 'content',
			searchParams
		})

		const results = response.hits.map((hit: any) => {
			// Extract and clean the title
			let title = hit.title?.trim()

			// Clean common title patterns (remove brand suffixes)
			if (title) {
				title = title
					.replace(/\s*\|\s*(Galaxy Tech|Galaxy Tech|Galaxy Tech - Galaxy Tech).*$/i, '') // Remove "| Galaxy Tech" etc
					.replace(/\s*-\s*(Galaxy Tech|Galaxy Tech|Galaxy Tech - Galaxy Tech).*$/i, '') // Remove "- Galaxy Tech" etc
					.replace(/\s*\|\s*$/, '') // Remove trailing pipe
					.replace(/\s*-\s*$/, '') // Remove trailing dash
					.trim()
			}

			if (!title && hit.content) {
				// Try to extract title from URL path
				const urlPath = hit.url?.split('/').filter(Boolean).pop()
				if (urlPath && urlPath !== 'index' && urlPath !== 'home') {
					title = urlPath.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
				} else {
					// Extract first meaningful sentence as title
					const sentences = hit.content.split(/[.!?]/).filter((s: string) => s.trim().length > 20 && s.trim().length < 100)
					if (sentences.length > 0) {
						title = sentences[0].trim()
					}
				}
			}

			// Generate a better excerpt/description
			let description = hit.excerpt || hit.description || ''
			if (!description && hit.content) {
				// Extract first 2-3 meaningful sentences as excerpt
				const sentences = hit.content.split(/[.!?]/).filter((s: string) => s.trim().length > 30)
				if (sentences.length > 0) {
					description = sentences.slice(0, 2).join('. ').trim()
					if (!description.endsWith('.')) description += '.'
					// Limit to ~200 characters
					if (description.length > 200) {
						description = description.substring(0, 197) + '...'
					}
				}
			}

			// Find the best image URL
			const image = hit.image || hit.imageUrl || hit.featuredImage || ''

			return {
				id: hit.objectID,
				title: title || 'Page Content',
				content: hit.content || hit.excerpt || '',
				description,
				image,
				url: hit.url || '#',
				date: hit.date || '',
				category: hit.category || '',
				tags: hit.tags || [],
			}
		})

		return Response.json({
			results,
			totalHits: response.hits.length,
			query: query.trim(),
		})

	} catch (error) {
		console.error('Search API error:', error)
		return Response.json(
			{
				error: `Search service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				results: [],
				totalHits: 0,
			},
			{ status: 500 }
		)
	}
}