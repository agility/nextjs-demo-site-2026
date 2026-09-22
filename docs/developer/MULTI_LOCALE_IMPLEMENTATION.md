# Multi-Locale Implementation in Next.js Demo Site

This Next.js site implements multi-locale support through a combination of URL-based routing, environment configuration, and middleware processing. Here's how it works:

## 1. Configuration

**[`src/lib/i18n/config.ts`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/lib/i18n/config.ts)**

- Locales are defined via the `AGILITY_LOCALES` environment variable (e.g., `"en-us,fr"`)
- First locale is the **default locale** (e.g., `en-us`)
- Provides utility functions: `isValidLocale()`, `getLocaleFromPathname()`, `removeLocaleFromPathname()`

## 2. Route Structure

**[`src/app/[locale]/`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/app/[locale]/)**

- Uses Next.js **dynamic route segment** `[locale]`
- Default locale URLs: `/about`, `/blog` (no prefix)
- Non-default locale URLs: `/fr/about`, `/fr/blog` (with prefix)
- All pages live under [`src/app/[locale]/[...slug]/page.tsx`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/app/[locale]/[...slug]/page.tsx)

## 3. Middleware Processing

**[`src/proxy.ts`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/proxy.ts)**

The middleware handles locale routing in this order:

**Step 1:** Preview mode detection (Agility CMS)
**Step 2:** Redirect checking
**Step 3:** `?lang=xx` query parameter handling

- If `?lang=fr` is passed, redirects to `/fr/path` (or root path for default locale)
- Removes `lang` param from URL after redirect

**Step 4:** Search params encoding

- Only processes whitelisted query parameters (`audience`, `region`, `q`)
- Filters out tracking parameters (e.g., Google Analytics `_gl`, `_ga`, `_gcl_au`) to prevent crashes from long query strings
- Maximum query string length: 500 characters
- Converts `?q=search` → `/path/~~~q=search~~~` for static optimization
- Example: `/?audience=Enterprise&region=North%20America` → `/path/~~~audience=Enterprise&region=North%20America~~~`
- Tracking params like `/?_gl=1*17zxss1*...` are silently ignored

**Step 5:** Locale-based rewriting

- If URL has no locale prefix, **rewrites** (not redirects) to `/{defaultLocale}/path`
- This keeps URLs clean while routing internally to localized pages

## 4. Static Generation

**[`src/app/[locale]/[...slug]/page.tsx`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/app/[locale]/[...slug]/page.tsx)**

`generateStaticParams()` function:

- Loops through all configured locales
- Fetches sitemap from Agility CMS for each locale
- Generates static paths like `{ locale: "en-us", slug: ["about"] }` and `{ locale: "fr", slug: ["about"] }`
- Pre-renders all pages at build time

## 5. URL Localization Helpers

**[`src/lib/i18n/localizeUrl.ts`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/lib/i18n/localizeUrl.ts)**

Helper functions for generating locale-specific URLs:

- `localizeUrl()`: Returns `/path` for default locale, `/fr/path` for others
- `localizeUrlField()`: Works with Agility's URLField type
- Used throughout components for navigation links

## 6. Language Switcher

**[`src/components/footer/language-toggle.tsx`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/components/footer/language-toggle.tsx)**

Client-side component that:

- Shows current language with flag emoji
- Dropdown menu for other locales
- On switch: strips current locale, adds new locale prefix, navigates to equivalent page
- Example: `/fr/about` → `/about` (switching to default locale)

## 7. Layout Integration

**[`src/app/[locale]/layout.tsx`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/app/[locale]/layout.tsx)**

- Receives `locale` from route params
- Passes locale to all data fetching functions
- Footer receives `locale`, `locales`, and `defaultLocale` props for language switcher

## 8. CMS Context

**[`src/lib/cms/getAgilityContext.ts`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/lib/cms/getAgilityContext.ts)**

- Validates locale from route params
- Falls back to default locale if invalid
- Passes validated locale to all Agility CMS API calls

---

## Key Files Reference

| File                                                                                                                                                | Purpose                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [`src/lib/i18n/config.ts`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/lib/i18n/config.ts)                                       | Locale configuration and utilities           |
| [`src/proxy.ts`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/proxy.ts)                                                 | URL routing and locale rewriting             |
| [`src/app/[locale]/[...slug]/page.tsx`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/app/[locale]/[...slug]/page.tsx)             | Dynamic page rendering and static generation |
| [`src/components/footer/language-toggle.tsx`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/components/footer/language-toggle.tsx) | User-facing language switcher                |
| [`src/lib/i18n/localizeUrl.ts`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/lib/i18n/localizeUrl.ts)                             | URL generation helpers                       |
| [`src/lib/cms/getAgilityContext.ts`](https://github.com/agility/nextjs-demo-site-2025/blob/main/src/lib/cms/getAgilityContext.ts)                   | CMS context with locale validation           |

## Flow Diagram

<div class="my-8 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
  <div class="space-y-3">
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        User Request → Middleware
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-gray-600 dark:text-gray-400 text-lg">↓</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        Check Preview Mode
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-gray-600 dark:text-gray-400 text-lg">↓</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        Check Redirects
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-gray-600 dark:text-gray-400 text-lg">↓</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        Handle ?lang= param
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-gray-600 dark:text-gray-400 text-lg">↓</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        Encode Search Params
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-gray-600 dark:text-gray-400 text-lg">↓</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        Rewrite to /[locale]/path
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-gray-600 dark:text-gray-400 text-lg">↓</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        Next.js Router
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-gray-600 dark:text-gray-400 text-lg">↓</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        [locale]/[...slug]/page.tsx
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-gray-600 dark:text-gray-400 text-lg">↓</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        Fetch CMS Content (with locale)
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div class="text-gray-600 dark:text-gray-400 text-lg">↓</div>
    </div>
    <div class="flex items-center justify-center">
      <div class="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium text-sm">
        Render Page
      </div>
    </div>
  </div>
</div>

## Environment Setup

To add additional locales, update your `.env.local`:

```bash
AGILITY_LOCALES=en-us,fr,es,de
```

The first locale in the list will be the default locale (URLs without prefix).
