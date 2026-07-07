'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Lazy-load react-syntax-highlighter (and its prism style objects) so this large
// dependency is code-split out of the initial docs bundle and only loaded when a
// code block actually renders. Each theme is baked into its own dynamic wrapper
// so the style imports stay out of the initial bundle too.
const makeSyntaxHighlighter = (styleName: 'vscDarkPlus' | 'oneLight') =>
	dynamic(
		async () => {
			const [{ Prism }, styles] = await Promise.all([
				import('react-syntax-highlighter'),
				import('react-syntax-highlighter/dist/esm/styles/prism'),
			])
			const style = styles[styleName]
			const P = Prism as any
			const Highlighter = (props: Record<string, any>) => (
				<P style={style} {...props} />
			)
			Highlighter.displayName = `SyntaxHighlighter(${styleName})`
			return Highlighter
		},
		{ ssr: false, loading: () => null }
	)

const DarkSyntaxHighlighter = makeSyntaxHighlighter('vscDarkPlus')
const LightSyntaxHighlighter = makeSyntaxHighlighter('oneLight')

interface CodeBlockProps {
	language: string
	children: string
	className?: string
	[key: string]: any // Allow other props from ReactMarkdown
}

export function CodeBlock({ language, children, className, ...props }: CodeBlockProps) {
	const [isDark, setIsDark] = useState(false)

	useEffect(() => {
		// Check if dark mode is active
		const checkDarkMode = () => {
			setIsDark(document.documentElement.classList.contains('dark'))
		}

		// Initial check
		checkDarkMode()

		// Watch for changes using MutationObserver
		const observer = new MutationObserver(checkDarkMode)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})

		return () => observer.disconnect()
	}, [])

	const SyntaxHighlighter = isDark ? DarkSyntaxHighlighter : LightSyntaxHighlighter

	return (
		<SyntaxHighlighter
			language={language}
			PreTag="div"
			className={`rounded-lg !mt-4 !mb-4 ${className || ''}`}
			{...props}
		>
			{String(children).replace(/\n$/, '')}
		</SyntaxHighlighter>
	)
}
