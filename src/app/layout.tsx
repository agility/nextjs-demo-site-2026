import '@/styles/tailwind.css'
import '@/styles/view-transitions.css'

import type { Metadata } from 'next'
import type React from 'react'

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
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.agilitycms.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&amp;display=swap"
        />
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
        <main>
          {children}
        </main>
        {/* Agility Web Studio SDK is loaded (preview/dev only) from the [locale] layout,
            so it never ships on the public production site. */}
      </body>
    </html>
  )
}
