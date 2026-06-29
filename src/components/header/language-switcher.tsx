interface LanguageSwitcherProps {
  currentLocale: string
  /**
   * All configured locales. Passed in from the server because the locale list
   * is derived from a non-public env var that isn't available client-side.
   */
  locales: readonly string[]
  /** Current page's sitemap node IDs, used to resolve the equivalent page. */
  pageID?: number
  contentID?: number
}

// Language labels (used for the title/tooltip + accessible label)
const languageLabels: Record<string, string> = {
  'en-us': 'English',
  fr: 'Français',
}

// Flag indicators
const languageFlags: Record<string, string> = {
  'en-us': '🇺🇸',
  fr: '🇫🇷',
}

/**
 * Flag-only language switcher for the header. Renders a flag for each other
 * locale; clicking it hits the server route with the current page's pageID /
 * contentID and the target locale, which resolves the equivalent page in that
 * locale (or 404s) and redirects.
 */
export function LanguageSwitcher({ currentLocale, locales, pageID, contentID }: LanguageSwitcherProps) {
  const otherLocales = locales.filter((locale) => locale !== currentLocale)

  if (otherLocales.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      {otherLocales.map((locale) => {
        const label = languageLabels[locale] ?? locale

        const params = new URLSearchParams({ to: locale })
        if (pageID != null) params.set('pageID', String(pageID))
        if (contentID != null) params.set('contentID', String(contentID))
        const href = `/api/switch-locale?${params.toString()}`

        return (
          <a
            key={locale}
            href={href}
            title={label}
            aria-label={`Switch to ${label}`}
            className="flex size-9 items-center justify-center rounded-lg text-lg leading-none transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span aria-hidden="true">{languageFlags[locale] ?? '🌐'}</span>
          </a>
        )
      })}
    </div>
  )
}
