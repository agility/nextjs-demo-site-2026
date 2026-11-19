'use client'

import React from "react"
import { AgilityPic, type ImageField } from "@agility/nextjs"
import { createPostImageTransitionName } from "@/lib/hooks/useViewTransition"
import { ViewTransition } from 'react'

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
				// This is the post page's LCP image. The post body is wrapped in
				// `max-w-2xl` (672px) at every breakpoint; below 640px it is the
				// viewport minus the container's 24px gutters. A width-descriptor
				// srcset lets the browser pick for its screen density, and (unlike
				// `sources`) lets `priority` emit a matching <link rel="preload">.
				widths={[440, 672, 880, 1344]}
				sizes="(min-width: 640px) 672px, calc(100vw - 48px)"
			/>
		</ViewTransition>
	)
}
