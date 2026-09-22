import { getDocsTree } from '@/lib/docs/getDocsFiles'
import type { ReactNode } from 'react'
import { DocsLayoutClient } from './DocsLayoutClient'

export default function DocsLayout({ children }: { children: ReactNode }) {
	const tree = getDocsTree()

	return (
		<DocsLayoutClient tree={tree}>
			{children}
		</DocsLayoutClient>
	)
}

