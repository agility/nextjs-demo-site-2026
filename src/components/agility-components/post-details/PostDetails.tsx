import React from "react"
import { AgilityPic, type UnloadedModuleProps, renderHTML } from "@agility/nextjs"
import { DateTime } from "luxon"
import type { IPost } from "@/lib/types/IPost"
import { ChevronLeftIcon } from "@heroicons/react/16/solid"
import dayjs from "dayjs"
import Link from "next/link"
import { Container } from "../../container"
import { Subheading, Heading } from "../../text"
import { Button } from "../../button"
import { PostImage } from "./PostImage"
import { localizeUrl } from "@/lib/i18n/localizeUrl"
import { decodeHtmlEntities } from "@/lib/utils"

const PostDetails = async ({ dynamicPageItem, languageCode }: UnloadedModuleProps) => {
	if (!dynamicPageItem) {
		return <div>Post not found</div>
	}

	// post fields
	const post = dynamicPageItem.fields as IPost

	// category
	const category = post.category?.fields.name || "Uncategorized"

	// format date
	const dateStr = DateTime.fromJSDate(new Date(post.postDate)).toFormat(
		"LLL. dd, yyyy"
	)

	// content id
	const contentID = dynamicPageItem.contentID

	// CMS text can arrive HTML-entity-encoded (e.g. translated content). The
	// rich-text Content field renders those natively, but plain-text fields
	// (heading, image alt) must be decoded so entities don't show literally.
	const heading = decodeHtmlEntities(post.heading)
	const image = post.image
		? { ...post.image, label: decodeHtmlEntities(post.image.label) }
		: post.image

	return (
		<Container data-agility-component={contentID}>
			<Subheading
				className="mt-16"
				data-agility-field="postDate"
			>
				{dayjs(post.postDate).format('dddd, MMMM D, YYYY')}
			</Subheading>
			<Heading
				as="h1"
				className="mt-2"
				data-agility-field="heading"
			>
				{heading}
			</Heading>
			<div className="mt-16 grid grid-cols-1 gap-8 pb-24 lg:grid-cols-[15rem_1fr] xl:grid-cols-[15rem_1fr_15rem]">
				<div className="flex flex-wrap items-center gap-8 max-lg:justify-between lg:flex-col lg:items-start">
					{post.author && (
						<div className="flex items-center gap-3">
							{post.author.fields.headShot && (
								<AgilityPic
									image={post.author.fields.headShot}
									fallbackWidth={64}
									className="aspect-square size-6 rounded-full object-cover"

								/>
							)}
							<div className="text-sm/5 text-gray-700 dark:text-gray-300">
								{post.author.fields.name}
							</div>
						</div>
					)}

					{post.category && (
						<div className="flex flex-wrap gap-2">
							<Link
								key={post.category.contentID}
								href={`/blog?category=${post.category.fields.name}`}
								className="rounded-full border border-dotted border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-2 text-sm/6 font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							>
								{post.category.fields.name}
							</Link>
						</div>
					)}
				</div>
				<div className="text-gray-700 dark:text-gray-300">
					<div className="max-w-2xl xl:mx-auto">
						{image && (
							<PostImage
								image={image}
								contentID={contentID}
								data-agility-field="image"
							/>
						)}

						<div
							data-agility-field="content"
							data-agility-html="true"
							className="prose dark:prose-invert max-w-full mb-20"
							dangerouslySetInnerHTML={renderHTML(post.content)}
						/>

						<div className="mt-10">
							<Button variant="outline" href={localizeUrl("/blog", languageCode)}>
								<ChevronLeftIcon className="size-4" />
								Back to blog
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Container>
	)
}

export default PostDetails
export { PostImage } from "./PostImage"
