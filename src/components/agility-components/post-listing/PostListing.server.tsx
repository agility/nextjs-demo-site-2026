import { Container } from '@/components/container'
import { getPostListing } from '@/lib/cms-content/getPostListing'
import { getAgilityContext } from '@/lib/cms/getAgilityContext'
import { FeaturedPosts } from './FeaturedPosts'
import { Categories } from './Categories'
import { Posts } from './Posts'
import { Pagination } from './Pagination'
import type { UnloadedModuleProps } from '@agility/nextjs'

const postsPerPage = 5


export const PostListing = async ({ globalData, languageCode, isPreview }: UnloadedModuleProps) => {

	// Get page from globalData, default to 1
	const pageParam = globalData?.searchParams?.page
	let page = 1
	if (typeof pageParam === 'string') {
		const parsed = parseInt(pageParam, 10)
		if (!isNaN(parsed) && parsed > 0) {
			page = parsed
		}
	}

	// Get category from globalData
	const categoryParam = globalData?.searchParams?.category
	let category: string | undefined = undefined
	if (typeof categoryParam === 'string' && categoryParam.trim() !== '') {
		category = categoryParam
	}
	const { sitemap, locale } = await getAgilityContext(languageCode)

	const postsResult = await getPostListing({
		locale, sitemap, skip: (page - 1) * postsPerPage, take: postsPerPage, preview: isPreview
	})


	return (
		<>
			{page === 1 && !category && <FeaturedPosts />}
			<Container className="mt-16 pb-24">
				<Categories selected={category} />
				<Posts page={page} category={category} posts={postsResult.posts} />
				<Pagination {...{ page, category, totalPosts: postsResult.totalCount, postsPerPage, languageCode }} />
			</Container>
		</>
	)
}
