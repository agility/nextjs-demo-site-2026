import { cacheLife } from 'next/cache'
import type { IFooter } from '@/lib/cms-content/getFooterContent'

interface CopyrightProps {
	footerData: IFooter
	siteName: string
}

/**
 * The current year, read inside a cached scope.
 *
 * `new Date()` is an unstable value: under `cacheComponents` Next refuses to
 * prerender a route that reads one, because the prerendered HTML would pin
 * whatever the build machine's clock said. Wrapping it in `"use cache"` makes
 * that explicit — the year is part of the cached output and rolls over within
 * a day of New Year, which is the right granularity for a copyright line.
 */
async function getCurrentYear() {
	'use cache'
	cacheLife('days')
	return new Date().getFullYear()
}

export async function Copyright({ footerData, siteName }: CopyrightProps) {
	const currentYear = await getCurrentYear()

	return (
		<div className="text-sm/6 text-gray-950 dark:text-gray-50">
			{`© ${currentYear} ${footerData.copyright}`}
		</div>
	)
}
