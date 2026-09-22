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
import { graph, organization, webSite } from '@/lib/seo/schema'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params

  // Resolve preview FIRST — it is request state (draft mode), and every read
  // below needs it to decide between the cached published path and an uncached
  // preview read. This is the only await that has to happen before the fan-out.
  const { isDevelopmentMode, isPreview } = await getAgilityContext(locale)

  // These CMS calls are independent — run them in parallel to avoid a request waterfall.
  const [
    header,
    footer,
    audiences,
    regions,
    aiConfig,
    settings,
  ] = await Promise.all([
    getHeaderContent({ locale, preview: isPreview }),
    getFooterContent({ locale, preview: isPreview }),
    getAudienceListing({ locale, skip: 0, take: 10, preview: isPreview }),
    getRegionListing({ locale, skip: 0, take: 10, preview: isPreview }),
    getAISearchConfig({ locale, preview: isPreview }),
    getSettings({ locale, preview: isPreview }),
  ])
  const gaId = settings?.googleAnalyticsID || null

  // Correct the document language for non-default locales (root <html> defaults to "en").
  const htmlLang = locale === 'fr' ? 'fr' : 'en'
  const baseUrl = process.env.SITE_URL || 'https://demo.agilitycms.com'
  const siteName = header?.siteName || 'Galaxy Tech'
  // ONE @graph for the site-wide entities, each with a stable @id. Pages and
  // components reference these by @id rather than inlining their own copies,
  // so a crawler resolves the whole site into a single entity graph.
  // See lib/seo/schema.ts.
  const siteGraph = graph(
    organization({ baseUrl, name: siteName, logoUrl: header?.logo?.url }),
    webSite({ baseUrl, name: siteName, inLanguage: htmlLang }),
  )

  return (
    <>
      {/* Correct <html lang> for non-default locales (root layout renders a static "en"). */}
      <script
        dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(htmlLang)}` }}
      />

      {/* Site-wide structured data for search engines and answer engines. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph) }}
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