import '@/styles/tailwind.css'
import '@/styles/view-transitions.css'

import type { Metadata } from 'next'
import type React from 'react'
import { switzer } from '@/lib/fonts'

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Galaxy Tech'
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${switzer.variable} overflow-x-hidden`} suppressHydrationWarning>
      <head>
        {/* Switzer is self-hosted via next/font/local (see lib/fonts.ts) — the
            api.fontshare.com stylesheet that used to sit here was render-blocking
            on a third-party origin, and pointed at a second one for the files. */}
        <link rel="preconnect" href="https://cdn.agilitycms.com" />
        <meta name="view-transition" content="same-origin" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedOverride = localStorage.getItem('darkModeOverride');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = storedOverride !== null ? storedOverride === 'true' : prefersDark;
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        data-agility-guid={process.env.AGILITY_GUID}
        className="text-gray-950 antialiased overflow-x-hidden dark:bg-black dark:text-gray-200 transition-colors">
        {/* NOTE: no <main> here. This layout wraps the site chrome too — the
            navbar comes from the page and the footer from the [locale] layout —
            so a <main> at this level contained the nav and footer as well,
            which defeats the landmark for screen-reader users navigating by
            region. <main> now wraps only the page content, in
            app/[locale]/[...slug]/page.tsx. */}
        {children}
        {/* Agility Web Studio SDK is loaded (preview/dev only) from the [locale] layout,
            so it never ships on the public production site. */}
      </body>
    </html>
  )
}
