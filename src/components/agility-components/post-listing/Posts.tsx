import type { IPostMin } from '@/lib/cms-content/getPostListing'
import { PostCard } from './PostCard'

interface PostsProps {
	page: number
	category?: string
	posts: IPostMin[]
}

export async function Posts({ page, category, posts }: PostsProps) {
	if (posts.length === 0) {
		return <p className="mt-6 text-gray-500 dark:text-gray-400">No posts found.</p>
	}

	return (
		<div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
			{posts.map((post) => (
				<PostCard
					key={post.contentID}
					post={post}
				/>
			))}
		</div>
	)
}
