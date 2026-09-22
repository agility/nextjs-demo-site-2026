import { Button } from '@/components/button'
import { Link } from '@/components/link'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, RssIcon } from '@heroicons/react/16/solid'

interface CategoriesProps {
	selected?: string
}

export async function Categories({ selected }: CategoriesProps) {
	const categories: any[] = []

	if (categories.length === 0) {
		return
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<Menu>
				<MenuButton className="flex items-center justify-between gap-2 font-medium">
					{categories.find(({ slug }) => slug === selected)?.title ||
						'All categories'}
					<ChevronUpDownIcon className="size-4 fill-gray-900" />
				</MenuButton>
				<MenuItems
					anchor="bottom start"
					className="min-w-40 rounded-lg bg-white p-1 shadow-lg ring-1 ring-gray-200 [--anchor-gap:6px] [--anchor-offset:-4px] [--anchor-padding:10px]"
				>
					<MenuItem>
						<Link
							href="/blog"
							data-selected={selected === undefined ? true : undefined}
							className="group grid grid-cols-[1rem_1fr] items-center gap-2 rounded-md px-2 py-1 data-focus:bg-gray-950/5"
						>
							<CheckIcon className="hidden size-4 group-data-selected:block" />
							<p className="col-start-2 text-sm/6">All categories</p>
						</Link>
					</MenuItem>
					{categories.map((category) => (
						<MenuItem key={category.slug}>
							<Link
								href={`/blog?category=${category.slug}`}
								data-selected={category.slug === selected ? true : undefined}
								className="group grid grid-cols-[16px_1fr] items-center gap-2 rounded-md px-2 py-1 data-focus:bg-gray-950/5"
							>
								<CheckIcon className="hidden size-4 group-data-selected:block" />
								<p className="col-start-2 text-sm/6">{category.title}</p>
							</Link>
						</MenuItem>
					))}
				</MenuItems>
			</Menu>
			<Button variant="outline" href="/blog/feed.xml" className="gap-1">
				<RssIcon className="size-4" />
				RSS Feed
			</Button>
		</div>
	)
}
