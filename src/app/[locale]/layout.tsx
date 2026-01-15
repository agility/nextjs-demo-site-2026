import { Container } from '@/components/container'
import { Navbar } from '@/components/header/navbar'

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

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params
  const { isDevelopmentMode, isPreview } = await getAgilityContext(locale)

  // get the header content
  const header = await getHeaderContent({ locale })
  const footer = await getFooterContent({ locale })

  const audiences = await getAudienceListing({ locale, skip: 0, take: 10 })
  const regions = await getRegionListing({ locale, skip: 0, take: 10 })

  const aiConfig = await getAISearchConfig({ locale })
  const settings = await getSettings({ locale })
  const gaId = settings?.googleAnalyticsID || null

  return (
    <>
      <Container>
        {header &&
          <Navbar header={header} locale={locale} />
        }
      </Container>
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
    </>
  )
}