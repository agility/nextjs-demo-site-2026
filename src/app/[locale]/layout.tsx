import type React from 'react'

import { getHeaderContent } from "@/lib/cms-content/getHeaderContent"
import { getAgilityContext } from '@/lib/cms/getAgilityContext'

import { getFooterContent } from '@/lib/cms-content/getFooterContent'
import { Footer } from '@/components/footer/footer'
import PreviewBar from '@/components/preview-bar'
import { getAudienceListing } from '@/lib/cms-content/getAudienceListing'
import { getRegionListing } from '@/lib/cms-content/getRegionListing'
import { Suspense } from 'react'
import FloatingAISearch from '@/components/ai-search/FloatingAISearch'
import { getAISearchConfig } from '@/lib/cms-content/getAISearchConfig'
import { locales, defaultLocale } from '@/lib/i18n/config'
import { getSettings } from '@/lib/cms-content/getSettings'
import { GoogleAnalytics } from '@next/third-parties/google'
import { AnalyticsProvider } from '@/components/analytics'
import Script from 'next/script'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params

  // These CMS calls are independent — run them in parallel to avoid a request waterfall.
  const [
    { isDevelopmentMode, isPreview },
    header,
    footer,
    audiences,
    regions,
    aiConfig,
    settings,
  ] = await Promise.all([
    getAgilityContext(locale),
    getHeaderContent({ locale }),
    getFooterContent({ locale }),
    getAudienceListing({ locale, skip: 0, take: 10 }),
    getRegionListing({ locale, skip: 0, take: 10 }),
    getAISearchConfig({ locale }),
    getSettings({ locale }),
  ])
  const gaId = settings?.googleAnalyticsID || null

  // Correct the document language for non-default locales (root <html> defaults to "en").
  const htmlLang = locale === 'fr' ? 'fr' : 'en'
  const baseUrl = process.env.SITE_URL || 'https://demo.agilitycms.com'
  const siteName = header?.siteName || 'Galaxy Tech'
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    ...(header?.logo?.url ? { logo: header.logo.url } : {}),
  }
  const webSiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    inLanguage: htmlLang,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      {/* Correct <html lang> for non-default locales (root layout renders a static "en"). */}
      <script
        dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(htmlLang)}` }}
      />

      {/* Site-wide structured data for search engines and answer engines. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteLd) }}
      />

      {/* The Navbar (with the language switcher) is rendered by the page so it
          can use the current page's sitemap node for locale switching. */}
      {children}
      {footer && header &&
        <Footer footerData={footer} logo={header.logo} siteName={header.siteName} locale={locale} locales={locales} defaultLocale={defaultLocale} />
      }

      {/* Floating AI Search */}
      {aiConfig.showAISearch &&
        <FloatingAISearch
          aiConfig={aiConfig}
        />
      }

      {/* Google Analytics */}
      {gaId && <GoogleAnalytics gaId={gaId} />}

      {/* PostHog Analytics - Enhanced tracking for pageviews, engagement, and personalization */}
      <Suspense fallback={null}>
        <AnalyticsProvider locale={locale} />
      </Suspense>

      {/* Preview indicator - normally not needed in production, but we show it here for illustration purposes */}
      <Suspense fallback={null}>
        <PreviewBar
          {...{ isDevelopmentMode, isPreview, audiences, regions }}
        />
      </Suspense>

      {/* Agility Web Studio SDK — load ONLY in preview/dev (in-context editing), never on the public production site. */}
      {(isPreview || isDevelopmentMode) && (
        <Script
          src="https://unpkg.com/@agility/web-studio-sdk@latest/dist/index.js"
          strategy="afterInteractive"
        />
      )}
    </>
  )
}