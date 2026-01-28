# PostHog Analytics & A/B Testing Implementation Guide

## Overview

This guide covers implementing PostHog for:
- Page view tracking with CMS context (page IDs, content IDs, locale)
- Event tracking (scroll milestones, time on page, CTA clicks)
- A/B testing with feature flags

## 1. Installation & Initialization

### Install PostHog

```bash
npm install posthog-js
```

### Initialize in `instrumentation-client.ts`

```typescript
import posthog from 'posthog-js'

declare global {
  interface Window {
    posthog?: typeof posthog
  }
}

const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (postHogKey && postHogHost) {
  posthog.init(postHogKey, {
    api_host: postHogHost,
    defaults: '2025-05-24'
  })
  // Expose on window for provider access
  window.posthog = posthog
}
```

### Environment Variables

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## 2. Analytics Provider Pattern

Create a provider abstraction to decouple your app from PostHog directly:

```typescript
// posthog-provider.ts
function getPostHog() {
  if (typeof window === 'undefined') return null
  const posthog = window.posthog
  return posthog?.__loaded ? posthog : null
}

// Queue events that arrive before PostHog is ready
const eventQueue: QueuedEvent[] = []

export const PostHogProvider: AnalyticsProvider = {
  page(name: string, properties?: PageViewProperties) {
    const posthog = getPostHog()
    if (!posthog) {
      eventQueue.push({ type: 'page', name, properties })
      waitForPostHogAndFlush()
      return
    }

    posthog.capture('$pageview', {
      $current_url: window.location.href,
      $pathname: properties?.path,
      $title: properties?.title,
      locale: properties?.locale,
      // CMS context
      pageID: properties?.pageID,
      contentIDs: properties?.contentIDs,
    })
  },

  track(event: string, properties?: EventProperties) {
    const posthog = getPostHog()
    if (!posthog) {
      eventQueue.push({ type: 'track', event, properties })
      waitForPostHogAndFlush()
      return
    }
    posthog.capture(event, properties)
  },

  isReady(): boolean {
    return getPostHog() !== null
  }
}
```

## 3. Tracking CMS Content IDs

### Add Data Attributes to Components

Components should include `data-agility-component={contentID}`:

```tsx
<Container data-agility-component={contentID}>
  {/* component content */}
</Container>
```

### Extract Content IDs from DOM

```typescript
// agility-context.ts
export function getAgilityContext(): AgilityContext {
  if (typeof document === 'undefined') return {}

  const contentIDs: number[] = []

  // Find page ID
  const pageElement = document.querySelector('[data-agility-page]')
  const pageID = pageElement?.getAttribute('data-agility-page')

  // Find all component content IDs
  document.querySelectorAll('[data-agility-component]').forEach((el) => {
    const id = parseInt(el.getAttribute('data-agility-component') || '', 10)
    if (!isNaN(id) && !contentIDs.includes(id)) {
      contentIDs.push(id)
    }
  })

  return { pageID: pageID ? parseInt(pageID, 10) : undefined, contentIDs }
}
```

## 4. A/B Testing with Feature Flags

### Client Component for A/B Testing

```tsx
'use client'

import { useFeatureFlagVariantKey, usePostHog } from 'posthog-js/react'

export function ABTestComponent({ variants }: { variants: Variant[] }) {
  const posthog = usePostHog()
  const variantKey = useFeatureFlagVariantKey('your-experiment-name')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (variantKey !== undefined) {
      setIsLoading(false)
      // Track experiment exposure
      posthog?.capture('$experiment_exposure', {
        experimentName: 'your-experiment-name',
        variantKey,
        contentID: contentID
      })
    }
  }, [variantKey])

  if (isLoading) {
    return <SkeletonLoader /> // Prevent flicker
  }

  const activeVariant = variants.find(v => v.key === variantKey) || variants[0]
  return <RenderVariant variant={activeVariant} />
}
```

## 5. HogQL Queries for Analytics

### Query Pageviews by Content ID

```sql
SELECT count() as impressions
FROM events
WHERE event = '$pageview'
  AND has(JSONExtractArrayRaw(properties, 'contentIDs'), toString(27))
  AND JSONExtractString(properties, 'locale') = 'en-us'
  AND timestamp > now() - INTERVAL 30 DAY
```

### Query Pages Containing a Content ID

```sql
SELECT
  JSONExtractInt(properties, 'pageID') as pageID,
  count() as views
FROM events
WHERE event = '$pageview'
  AND has(JSONExtractArrayRaw(properties, 'contentIDs'), toString(27))
  AND JSONExtractInt(properties, 'pageID') > 0
GROUP BY pageID
ORDER BY views DESC
```

### Query Scroll Depth for Content

```sql
SELECT avg(JSONExtractInt(properties, 'depth')) as avgDepth
FROM events
WHERE event = 'scroll_milestone'
  AND has(JSONExtractArrayRaw(properties, 'contentIDs'), toString(27))
  AND timestamp > now() - INTERVAL 30 DAY
```

### Query Time on Page Distribution

```sql
SELECT
  JSONExtractInt(properties, 'seconds') as seconds,
  count() as count
FROM events
WHERE event = 'time_milestone'
  AND has(JSONExtractArrayRaw(properties, 'contentIDs'), toString(27))
  AND timestamp > now() - INTERVAL 30 DAY
GROUP BY seconds
ORDER BY seconds
```

### Query CTA Clicks by Content ID

```sql
SELECT count() as clicks
FROM events
WHERE event = 'outbound_link_clicked'
  AND JSONExtractInt(properties, 'contentID') = 27
  AND timestamp > now() - INTERVAL 30 DAY
```

## 6. Key Implementation Notes

### Event Queuing

PostHog may not be ready when your app starts. Queue events and flush when ready to avoid losing early pageviews.

### Bot Detection

PostHog filters bots by default. Automated testing (Playwright, Puppeteer, Chrome DevTools Protocol) may trigger bot detection due to `navigator.webdriver = true`. Events won't be sent in these environments.

### Batching

PostHog batches events and sends them periodically (~30 seconds) or on page unload. Events won't appear instantly in the network tab during development.

### Content ID Tracking

Use the `contentIDs` array to track which CMS components appear on each page. This enables per-component analytics like:
- Which content gets the most impressions
- Scroll depth by content
- Time spent viewing specific content

### A/B Test Flicker Prevention

Use skeleton loaders while waiting for feature flag evaluation to prevent content flicker. The variant should only render after `useFeatureFlagVariantKey` returns a defined value.

### Container Component Pattern

Ensure wrapper components pass through data attributes:

```tsx
export function Container({
  className,
  children,
  ...props  // This spreads data-agility-component and other attributes
}: {
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx(className, 'px-6 lg:px-8')} {...props}>
      <div className="mx-auto max-w-2xl lg:max-w-7xl">{children}</div>
    </div>
  )
}
```
