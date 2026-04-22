import { type URLField } from "@agility/nextjs"
import { type Locale, defaultLocale, locales, getLocaleFromPathname, removeLocaleFromPathname } from "./config"

/**
 * Localizes a URL based on the current locale.
 * For default locale (en-us), returns the URL without a locale prefix.
 * For other locales, prefixes the URL with the locale.
 * Idempotent: if the URL already starts with any known locale prefix, that prefix is stripped before the target locale is applied.
 */
export function localizeUrl(url: string, locale: Locale): string {
  // Handle external URLs (don't localize)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url
  }

  // Handle root URL
  if (url === '/' || url === '') {
    return locale === defaultLocale ? '/' : `/${locale}`
  }

  // Ensure URL starts with /
  let normalizedUrl = url.startsWith('/') ? url : `/${url}`

  // Strip any existing locale prefix so we don't produce paths like /fr/fr/blog
  const existingLocale = getLocaleFromPathname(normalizedUrl, locales)
  if (existingLocale) {
    normalizedUrl = removeLocaleFromPathname(normalizedUrl, existingLocale)
  }

  // For default locale, return URL without a prefix
  if (locale === defaultLocale) {
    return normalizedUrl
  }

  // For other locales, add locale prefix
  return `/${locale}${normalizedUrl}`
}

/**
 * Localizes an Agility URLField based on the current locale
 */
export function localizeUrlField(urlField: URLField | null | undefined, locale: Locale): string {
  if (!urlField?.href) {
    return '/'
  }

  return localizeUrl(urlField.href, locale)
}