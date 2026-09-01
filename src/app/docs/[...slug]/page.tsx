import { getDocBySlug, getBreadcrumbs, getAllDocFiles } from '@/lib/docs/getDocsFiles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { CodeBlock } from '../CodeBlock'

// Docs content ships with the repo and only changes on deploy, so render every
// page fully static at build time. dynamicParams=false prevents runtime
// re-renders in the serverless function, which previously replaced good
// prerendered folder pages (e.g. /docs/admin) with cached 404s in production.
export const dynamic = 'force-static'
export const dynamicParams = false

export async function generateStaticParams() {
	const files = await getAllDocFiles()
	const params: Array<{ slug: string[] }> = []

	// Add all files
	files.forEach((file) => {
		// Skip root README.md (empty slug) - that's handled by /docs/page.tsx
		if (file.slug.length === 0) {
			return
		}

		params.push({ slug: file.slug })

		// If it's a README file, also add the folder path (without README)
		if (file.slug[file.slug.length - 1] === 'README') {
			const folderSlug = file.slug.slice(0, -1)
			// Only add if folder slug is not empty (root README is handled separately)
			if (folderSlug.length > 0) {
				params.push({ slug: folderSlug })
			}
		}
	})

	return params
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
	const { slug } = await params
	const doc = await getDocBySlug(slug)

	if (!doc) {
		return {
			title: 'Documentation Not Found',
		}
	}

	const baseUrl = 'https://demo.agilitycms.com'
	const docUrl = `${baseUrl}/docs/${slug.join('/')}`

	return {
		title: `${doc.title} | Documentation`,
		description: doc.frontmatter.description || `Documentation: ${doc.title}`,
		alternates: {
			canonical: docUrl,
		},
		openGraph: {
			title: doc.title,
			description: doc.frontmatter.description || `Documentation: ${doc.title}`,
			url: docUrl,
			type: 'article',
			siteName: 'Agility CMS Demo Site',
		},
		twitter: {
			card: 'summary',
			title: doc.title,
			description: doc.frontmatter.description || `Documentation: ${doc.title}`,
		},
	}
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
	const { slug } = await params
	const doc = await getDocBySlug(slug)

	if (!doc) {
		notFound()
	}

	const breadcrumbs = await getBreadcrumbs(slug)
	const baseUrl = 'https://demo.agilitycms.com'
	const docUrl = `${baseUrl}/docs/${slug.join('/')}`

	// Generate structured data for Article and BreadcrumbList
	const articleStructuredData: Record<string, any> = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: doc.title,
		description: doc.frontmatter.description || `Documentation: ${doc.title}`,
		url: docUrl,
		author: {
			'@type': 'Organization',
			name: 'Agility CMS',
			url: 'https://agilitycms.com',
		},
		publisher: {
			'@type': 'Organization',
			name: 'Agility CMS',
			url: 'https://agilitycms.com',
			logo: {
				'@type': 'ImageObject',
				url: 'https://agilitycms.com/logo.png',
			},
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': docUrl,
		},
	}

	// Only include datePublished if explicitly provided in frontmatter
	// Using a dynamic fallback would change on each revalidation, which is bad for SEO
	if (doc.frontmatter.datePublished) {
		articleStructuredData.datePublished = doc.frontmatter.datePublished
	}

	// Only include dateModified if explicitly provided in frontmatter
	// Using a dynamic fallback would change on each revalidation, which is misleading
	if (doc.frontmatter.dateModified) {
		articleStructuredData.dateModified = doc.frontmatter.dateModified
	}

	const breadcrumbStructuredData = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Docs',
				item: `${baseUrl}/docs`,
			},
			...breadcrumbs.map((crumb, index) => ({
				'@type': 'ListItem',
				position: index + 2,
				name: crumb.title,
				item: `${baseUrl}${crumb.path}`,
			})),
		],
	}

	return (
		<article>
			{/* Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
			/>
			{/* Header with section and title */}
			<header className="mb-9 space-y-1">
				{breadcrumbs.length > 0 && (
					<p className="text-sm font-medium text-[#5800d4] dark:text-purple-400">
						{breadcrumbs[0].title}
					</p>
				)}
				{!doc.content.trimStart().startsWith('# ') && (
					<h1 className="text-3xl tracking-tight text-gray-900 dark:text-white font-normal">
						{doc.title}
					</h1>
				)}
			</header>

			{/* Content */}
			<div className="prose prose-lg dark:prose-invert max-w-none prose-slate dark:text-gray-300 prose-headings:scroll-mt-28 prose-headings:font-normal prose-lead:text-gray-600 dark:prose-lead:text-gray-400 prose-a:font-semibold prose-a:text-[#5800d4] dark:prose-a:text-purple-400 prose-a:no-underline prose-a:border-b prose-a:border-purple-300 dark:prose-a:border-purple-600 prose-a:pb-0.5 hover:prose-a:border-purple-500 dark:hover:prose-a:border-purple-400 prose-pre:rounded-xl prose-pre:bg-gray-900 prose-pre:shadow-lg dark:prose-pre:bg-gray-800/60 dark:prose-pre:shadow-none dark:prose-pre:ring-1 dark:prose-pre:ring-gray-300/10 dark:prose-hr:border-gray-800">
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					rehypePlugins={[rehypeRaw]}
					components={{
						code({ inline, className, children, ...props }: any) {
							const match = /language-(\w+)/.exec(className || '')
							const language = match ? match[1] : 'text'
							const codeString = String(children)

							// Check if it's a block-level code by:
							// 1. inline prop is explicitly false, OR
							// 2. content contains newlines (multi-line), OR
							// 3. has a language class (from fenced code blocks)
							const isBlockCode = inline === false || codeString.includes('\n') || !!match

							// Block-level code (fenced code blocks)
							if (isBlockCode && !inline) {
								return (
									<CodeBlock language={language} {...props}>
										{codeString}
									</CodeBlock>
								)
							}

							// Inline code
							return (
								<code className={`${className || ''} bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono`} {...props}>
									{children}
								</code>
							)
						},
						a({ node, href, children, ...props }) {
							if (!href) {
								return <a {...props}>{children}</a>
							}

							// Handle hash anchor links (in-page navigation)
							if (href.startsWith('#')) {
								return (
									<a href={href} {...props}>
										{children}
									</a>
								)
							}

							// Handle absolute internal links (starting with /)
							if (href.startsWith('/')) {
								return (
									<Link href={href} {...props}>
										{children}
									</Link>
								)
							}

							// Handle external links (http://, https://, mailto:, etc.)
							if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
								return (
									<a href={href} target="_blank" rel="noopener noreferrer" {...props}>
										{children}
									</a>
								)
							}

							// Handle relative links (./, ../, or just a filename)
							// Resolve relative to current page's slug
							const resolveRelativeLink = (relativeHref: string, currentSlug: string[]): string => {
								// Get the directory of the current file (remove filename/README)
								let baseDir = [...currentSlug]
								if (baseDir.length > 0) {
									// Remove the last segment (filename or README) to get the directory
									baseDir.pop()
								}

								// Remove .md or .mdx extension if present
								let cleanHref = relativeHref.replace(/\.mdx?$/, '')

								// Check if this is a README link
								const isReadmeLink = cleanHref.endsWith('/README') || cleanHref === 'README' || cleanHref.endsWith('./README') || cleanHref === './README'

								// Split the relative path into segments
								let segments = cleanHref.split('/').filter(s => s !== '' && s !== '.')

								// Start with the base directory
								let resolvedSlug = [...baseDir]

								// Process each segment
								for (const segment of segments) {
									if (segment === '..') {
										// Go up one directory
										if (resolvedSlug.length > 0) {
											resolvedSlug.pop()
										}
									} else if (segment !== '.' && segment !== 'README') {
										// Add segment to path
										resolvedSlug.push(segment)
									}
									// If segment is 'README', we ignore it (README links resolve to folder path)
								}

								// Build the /docs/... path
								// README links resolve to the folder (not /README), regular files include the filename
								return `/docs/${resolvedSlug.join('/')}`
							}

							const resolvedPath = resolveRelativeLink(href, slug)

							return (
								<Link href={resolvedPath} {...props}>
									{children}
								</Link>
							)
						},
					}}
				>
					{doc.content}
				</ReactMarkdown>
			</div>
		</article>
	)
}
