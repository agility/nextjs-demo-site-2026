import type { ILink } from "@/lib/cms-content/getHeaderContent"
import type { ImageField } from "@agility/nextjs"
import { DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { Bars2Icon, XMarkIcon } from "@heroicons/react/24/solid"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "../logo"
import { PlusGridItem } from "../plus-grid"
import { localizeUrl, localizeUrlField } from '@/lib/i18n/localizeUrl'
import type { Locale } from '@/lib/i18n/config'



interface Props {
	links: ILink[]
	showMobileNav: boolean
	siteName?: string
	logo?: ImageField
	locale: string
	onClose?: () => void
}




export function MobileNav({ links, showMobileNav, onClose, siteName, logo, locale }: Props) {

	const router = useRouter()

	const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		// Prevent immediate navigation
		e.preventDefault();

		// Delay the navigation and closing to show the pressed animation
		setTimeout(() => {
			if (onClose) onClose();
			// Navigate after showing the animation using Next.js router
			router.push(href);
		}, 400);
	}

	return (
		<>
			{/* Backdrop overlay */}
			<AnimatePresence>
				{showMobileNav && (
					<motion.div
						className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-sm z-40 lg:hidden"
						initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
						animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
						exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
						transition={{ duration: 0.3 }}
						onClick={onClose}
					/>
				)}
			</AnimatePresence>

			{/* Navigation panel */}
			<AnimatePresence>
				{showMobileNav && (
					<motion.div
						className="fixed top-0 right-0 h-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg w-[250px] lg:hidden"
						initial={{ x: '100%', backdropFilter: 'blur(0px)' }}
						animate={{ x: 0, backdropFilter: 'blur(12px)' }}
						exit={{ x: '100%', backdropFilter: 'blur(0px)' }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
					>
						<button
							onClick={() => {
								// Delay the close to show the pressed animation
								if (onClose) {
									setTimeout(() => onClose(), 400);
								}
							}}
							className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-50/70 dark:hover:bg-gray-700/70 active:bg-gray-100/80 dark:active:bg-gray-600/80 active:scale-95 transition-all touch-manipulation"
							aria-label="Close navigation"
						>
							<XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
						</button>

						<div className="flex flex-col gap-6 py-16 px-6">
							<div>

								<Link
									href={localizeUrl('/', locale as Locale)}
									title="Home" className='flex items-center gap-2 text-xl font-medium text-gray-950 dark:text-gray-100 py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50/60 dark:hover:bg-gray-700/60 active:bg-gray-100/70 dark:active:bg-gray-600/70 active:scale-97 transition-all touch-manipulation'
									onClick={(e) => handleLinkClick(e, localizeUrl('/', locale as Locale))}>
									<Logo className="h-9 hover:animate-spin" logo={logo} />
									<span >{siteName}</span>
								</Link>

							</div>
							{links.map(({ link }, linkIndex) => (
								<motion.div
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.3,
										ease: 'easeOut',
										delay: 0.2 + linkIndex * 0.08, // Delay starts after menu opens + staggered for each item
									}}
									key={link.href}
								>
									<Link
										href={localizeUrlField(link, locale as Locale)}
										target={link.target}
										className="text-base font-medium text-gray-950 dark:text-gray-100 block py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50/60 dark:hover:bg-gray-700/60 active:bg-gray-100/70 dark:active:bg-gray-600/70 active:scale-97 transition-all touch-manipulation"
										onClick={(e) => handleLinkClick(e, localizeUrlField(link, locale as Locale))}
									>
										{link.text}
									</Link>
								</motion.div>
							))}
						</div>

					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}