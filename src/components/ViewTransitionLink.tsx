'use client'

import { useRouter } from 'next/navigation'
import { Link } from '@/components/link'
import type { LinkProps } from 'next/link'
import { forwardRef } from 'react'

export const ViewTransitionLink = forwardRef<
	HTMLAnchorElement,
	LinkProps & React.ComponentPropsWithoutRef<'a'>
>(function ViewTransitionLink(props, ref) {
	const router = useRouter()

	const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
		// Call the original onClick handler if it exists
		if (props.onClick) {
			props.onClick(e)
		}

		// If default was prevented or if it's not a left click, don't handle view transition
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
			return
		}

		// Check if it's an internal link and view transitions are supported
		if (
			typeof props.href === 'string' &&
			!props.href.startsWith('http') &&
			!props.href.startsWith('mailto:') &&
			!props.href.startsWith('tel:') &&
			document.startViewTransition
		) {
			e.preventDefault()

			// Start view transition
			const transition = document.startViewTransition(async () => {
				// Use Next.js router for navigation
				await router.push(props.href as string)
			})

			// Wait for the transition to finish
			try {
				await transition.finished
			} catch (error) {
				// Handle any transition errors
				console.warn('View transition failed:', error)
			}
		}
	}

	return <Link ref={ref} {...props} onClick={handleClick} />
})
