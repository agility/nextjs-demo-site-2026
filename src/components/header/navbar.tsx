'use client'

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { Bars2Icon } from '@heroicons/react/24/solid'
import { motion } from "motion/react"
import { Link } from '../link'
import { Logo } from '../logo'
import { PlusGrid, PlusGridItem, PlusGridRow } from '../plus-grid'
import type { IHeaderData } from '@/lib/cms-content/getHeaderContent'
import { DesktopNav } from './desktop-nav'
import { MobileNav } from './mobile-nav'
import { BannerLink } from './banner-link'
import { DarkModeToggle } from './dark-mode-toggle'
import { LanguageSwitcher } from './language-switcher'
import { useState } from 'react'
import { localizeUrl, localizeUrlField } from '@/lib/i18n/localizeUrl'
import { type Locale } from '@/lib/i18n/config'

const links = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/company', label: 'Company' },
  { href: '/blog', label: 'Blog' },
  { href: '/login', label: 'Login' },
]

// The links shown in the navigation

interface Props {
  header: IHeaderData
  locale: string
  /** All configured locales (passed from the server for the language switcher). */
  locales: readonly string[]
  /** Current page's sitemap node IDs, used by the language switcher. */
  pageID?: number
  contentID?: number
}

export function Navbar({ header, locale, locales, pageID, contentID }: Props) {

  const [showMobileNav, setShowMobileNav] = useState(false)

  return (
    <>
      <header className="pt-12 sm:pt-16 z-10 relative">
        <div className="mx-4 sm:mx-6 lg:mx-8 px-4 bg-white/40 dark:bg-black/30 backdrop-blur-md rounded-2xl">
          <PlusGrid>
            <PlusGridRow className="relative flex justify-between">
              <div className="relative flex gap-6">
                <PlusGridItem className="p-3">
                  <Link href={localizeUrl('/', locale as Locale)} title="Home" className='flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-800 dark:hover:text-gray-200 text-xl'>
                    <Logo className="h-9 hover:animate-spin" logo={header.logo} />
                    <span className='text-nowrap'>{header.siteName}</span>
                  </Link>
                </PlusGridItem>
                {header.bannerLink && (
                  <div className="hidden lg:flex items-center">
                    <BannerLink
                      href={header.bannerLink.href}
                      text={header.bannerLink.text}
                      target={header.bannerLink.target}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <DesktopNav links={header.links} locale={locale} />
                <div className="hidden lg:flex items-center gap-2">
                  <LanguageSwitcher currentLocale={locale} locales={locales} pageID={pageID} contentID={contentID} />
                  <DarkModeToggle />
                </div>
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <LanguageSwitcher currentLocale={locale} locales={locales} pageID={pageID} contentID={contentID} />
                <DarkModeToggle />
                <button
                  className="flex size-12 items-center justify-center self-center rounded-lg data-hover:bg-black/5 dark:data-hover:bg-white/5"
                  aria-label="Open main menu"
                  onClick={() => setShowMobileNav(!showMobileNav)}
                >
                  <Bars2Icon className="size-6 text-gray-900 dark:text-gray-100" />
                </button>
              </div>
            </PlusGridRow>
          </PlusGrid>
        </div>
        <MobileNav links={header.links}
          showMobileNav={showMobileNav}
          siteName={header.siteName}
          logo={header.logo}
          locale={locale}
          onClose={() => setShowMobileNav(false)} />
      </header>
    </>
  )
}


