import { PlusGrid, PlusGridItem, PlusGridRow } from '@/components/plus-grid'
import { Container } from '../container'
import { Gradient } from '../gradient'
import { Logo } from '../logo'
import { CallToAction } from './call-to-action'
import { Copyright } from './copyright'
import { Sitemap } from './sitemap'
import { SocialLinks } from './social-links'
import type { IFooter } from '@/lib/cms-content/getFooterContent'
import type { ImageField } from '@agility/nextjs'

interface FooterProps {
	footerData: IFooter
	logo: ImageField
	siteName: string
	locale: string
	locales: readonly string[]
	defaultLocale: string
}

// Main Footer component
export const Footer = ({ footerData, logo, siteName, locale, locales, defaultLocale }: FooterProps) => {
	return (
		<footer className='mt-20'>
			<Gradient className="relative" backgroundType='grays'>
				<div className="absolute inset-2 rounded-4xl bg-white/80 dark:bg-gray-950/80" />
				<Container>
					<CallToAction footerData={footerData} />
					<PlusGrid className="pb-16">
						<PlusGridRow>
							<div className="grid grid-cols-2 gap-y-10 pb-6 lg:grid-cols-6 lg:gap-8">
								<div className="col-span-2 flex">
									<PlusGridItem className="pt-6 lg:pb-6 ">
										<div className='flex items-center gap-2 text-gray-900 hover:text-gray-800 dark:text-gray-100 dark:hover:text-gray-200 text-lg'>
											<Logo className="h-9 hover:animate-spin" logo={logo} />
											<span >{siteName}</span>
										</div>
									</PlusGridItem>
								</div>
								<div className="col-span-2 grid grid-cols-2 gap-x-8 gap-y-12 lg:col-span-4 lg:grid-cols-subgrid lg:pt-6">
									<Sitemap footerData={footerData} />
								</div>
							</div>
						</PlusGridRow>
						<PlusGridRow className="flex justify-between">
							<div>
								<PlusGridItem className="p-3">
									<Copyright footerData={footerData} siteName={siteName} />
								</PlusGridItem>
							</div>
							<div className="flex">
								<PlusGridItem className="flex items-center gap-8 p-3">
									<SocialLinks footerData={footerData} />
								</PlusGridItem>
							</div>
						</PlusGridRow>
					</PlusGrid>
				</Container>
			</Gradient>
		</footer>
	)
}

