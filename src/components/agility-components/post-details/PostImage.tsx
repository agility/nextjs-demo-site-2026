'use client'

import React from "react"
import { AgilityPic, type ImageField } from "@agility/nextjs"
import { createPostImageTransitionName } from "@/lib/hooks/useViewTransition"
import { unstable_ViewTransition as ViewTransition } from 'react'

interface PostImageProps {
	image: ImageField
	contentID: string | number
	className?: string
}

export const PostImage: React.FC<PostImageProps> = ({
	image,
	contentID,
	className = "mb-10 aspect-3/2 w-full rounded-2xl object-cover shadow-xl dark:grayscale"
}) => {
	return (
		<ViewTransition name={createPostImageTransitionName(contentID)}>
			<AgilityPic
				data-agility-field="image"
				image={image}
				priority
				fallbackWidth={672}
				className={className}
				// The post body is wrapped in `max-w-2xl` at every breakpoint, so this
				// image is never rendered wider than 672px no matter how wide the
				// viewport gets. AgilityPic emits one URL per <source> (it has no
				// density descriptors), so retina is handled with resolution media
				// queries. First match wins, so the most specific rules come first.
				sources={[
					// 640px and up: pinned at the 672px column width.
					{ media: "(min-width: 640px) and (min-resolution: 2dppx)", width: 1344 },
					{ media: "(min-width: 640px)", width: 672 },
					// Below 640px: the viewport minus the container's 24px gutters,
					// so ~440px covers the widest phones.
					{ media: "(min-resolution: 2dppx)", width: 880 },
					{ media: "(max-width: 639px)", width: 440 },
				]}
			/>
		</ViewTransition>
	)
}
