import { Container } from '@/components/container'
import { Link } from '@/components/link'
import dayjs from 'dayjs'

export async function FeaturedPosts() {
	const featuredPosts: any[] = []

	if (featuredPosts.length === 0) {
		return
	}

	return (
		<div className="mt-16 bg-linear-to-t from-gray-100 pb-14">
			<Container>
				<h2 className="text-2xl font-medium tracking-tight">Featured</h2>
				<div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
					{featuredPosts.map((post) => (
						<div
							key={post.slug}
							className="relative flex flex-col rounded-3xl bg-white p-2 shadow-md ring-1 shadow-black/5 ring-black/5"
						>
							{post.mainImage && (
								<img
									alt={post.mainImage.alt || ''}
									src={post.mainImage.url}
									className="aspect-3/2 w-full rounded-2xl object-cover"
								/>
							)}
							<div className="flex flex-1 flex-col p-8">
								<div className="text-sm/5 text-gray-700">
									{dayjs(post.publishedAt).format('dddd, MMMM D, YYYY')}
								</div>
								<div className="mt-2 text-base/7 font-medium">
									<Link href={`/blog/${post.slug}`}>
										<span className="absolute inset-0" />
										{post.title}
									</Link>
								</div>
								<div className="mt-2 flex-1 text-sm/6 text-gray-500">
									{post.excerpt}
								</div>
								{post.author && (
									<div className="mt-6 flex items-center gap-3">
										{post.author.image && (
											<img
												alt=""
												src={post.author.image.url}
												className="aspect-square size-6 rounded-full object-cover"
											/>
										)}
										<div className="text-sm/5 text-gray-700">
											{post.author.name}
										</div>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</Container>
		</div>
	)
}
