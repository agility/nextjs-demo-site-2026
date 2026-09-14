'use client'

import { Link } from '@/components/link'
import { type IPostMin } from '@/lib/cms-content/getPostListing'
import { AgilityPic } from '@agility/nextjs'
import { createPostImageTransitionName } from '@/lib/hooks/useViewTransition'
import { unstable_ViewTransition as ViewTransition } from 'react'

interface PostCardProps {
	post: IPostMin
}

export function PostCard({ post }: PostCardProps) {
	return (
		<Link
			href={post.url}
			className="group block"
		>
			<article className="relative isolate flex flex-col gap-8 lg:flex-row transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50 rounded-3xl p-6 -m-6 focus-within:ring-2 focus-within:ring-gray-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900">
				<div className="relative aspect-video sm:aspect-2/1 lg:aspect-square lg:w-64 lg:shrink-0">
					<ViewTransition name={createPostImageTransitionName(post.contentID)}>
						<AgilityPic
							image={post.image}
							fallbackWidth={400}
							className="absolute inset-0 w-full h-full rounded-2xl bg-gray-50 dark:bg-gray-800 object-cover transition-transform duration-200 ease-in-out group-hover:scale-105 dark:grayscale"
							// Passing BOTH width and height makes the Agility image API do the
							// crop, which honours the focal point set in the CMS. With only a
							// width the API scales proportionally and the CSS `object-cover`
							// below crops from the centre, ignoring the focal point. Each
							// entry therefore matches the aspect ratio rendered at that
							// breakpoint. First match wins, so these run narrowest first.
							sources={[
								// aspect-video (16:9)
								{ media: "(max-width: 639px)", width: 640, height: 360 },
								// sm:aspect-2/1
								{ media: "(max-width: 767px)", width: 800, height: 400 },
								{ media: "(max-width: 1023px)", width: 1200, height: 600 },
								// lg:aspect-square at lg:w-64 (256px), so 2x for retina.
								{ media: "(min-width: 1024px)", width: 512, height: 512 },
							]}
						/>
					</ViewTransition>
					<div className="absolute inset-0 rounded-2xl ring-1 ring-gray-900/10 dark:ring-white/10 ring-inset" />
				</div>
				<div className="flex-1">
					<div className="flex items-center gap-x-4 text-xs">
						<time className="text-gray-500 dark:text-gray-400">
							{post.date}
						</time>
						{post.category && (
							<span className="relative z-10 rounded-full bg-gray-50 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-600 dark:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-200">
								{post.category}
							</span>
						)}
					</div>
					<div className="relative max-w-xl">
						<h3 className="mt-3 text-lg/6 font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
							{post.title}
						</h3>
						<p className="mt-5 text-sm/6 text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">{post.excerpt}</p>
					</div>
					{post.author && (
						<div className="mt-6 flex border-t border-gray-900/5 dark:border-white/10 pt-6">
							<div className="relative flex items-center gap-x-4">
								{post.authorImage && (
									<img
										alt=""
										src={post.authorImage.url}
										className="size-10 rounded-full bg-gray-50 dark:bg-gray-800 object-cover transition-transform duration-200 ease-in-out group-hover:scale-110 dark:grayscale"
									/>
								)}
								<div className="text-sm/6">
									<p className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
										{post.author}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</article>
		</Link>
	)
}
