# Analytics Integration Guide

This document describes the analytics integration architecture for the Agility CMS demo site, focusing on PostHog implementation with a platform-agnostic abstraction layer.

## Overview

The analytics system provides:
- **Platform-agnostic tracking** - Easy to swap PostHog for GA4, Amplitude, Mixpanel, etc.
- **User identification** - Persistent user IDs with audience/region properties
- **Enhanced pageview tracking** - Path, locale, UTM params, performance metrics
- **Engagement tracking** - Scroll depth, time on page, outbound links
- **Personalization tracking** - Audience/region-based content views
- **A/B test tracking** - Experiment exposure and variant interactions
- **Conversion tracking** - Goal completions and funnel analysis
- **Agility CMS context** - Page IDs and component content IDs for CMS-level analytics

## Architecture

```
src/lib/analytics/
├── index.ts              # Main analytics API
├── types.ts              # TypeScript interfaces
├── events.ts             # Event name constants
├── posthog-provider.ts   # PostHog implementation
├── agility-context.ts    # Agility CMS ID extraction
└── hooks/
    ├── useScrollTracking.ts
    └── useTimeOnPage.ts

src/components/analytics/
├── index.ts              # Component exports
├── AnalyticsProvider.tsx # Combined tracking wrapper
├── UserIdentifier.tsx    # User identification
├── PageviewTracker.tsx   # Page view tracking
├── EngagementTracker.tsx # Engagement tracking
└── PersonalizationTracker.tsx # Personalization tracking
```

## Agility CMS Context

All analytics events automatically include Agility CMS identifiers, enabling queries like:
- "Show engagement metrics grouped by pageID"
- "Compare scroll depth across different contentID values"
- "Which pages have the highest time-on-page?"

### Tracked IDs

| Property | Source | Description |
|----------|--------|-------------|
| `pageID` | `data-agility-page` attribute | Agility CMS page ID |
| `contentIDs` | `data-agility-dynamic-content` + `data-agility-component` attributes | Array of all content IDs on the page |
| `contentID` | Nearest `data-agility-component` | Specific component for interaction events |
| `locale` | URL path (e.g., `/en-us/...`) | Current language/locale |

### Example PostHog Queries

**Engagement by Page ID:**
```sql
SELECT pageID,
       COUNT(*) as scroll_events,
       AVG(depth) as avg_scroll_depth
FROM events
WHERE event = 'scroll_milestone'
GROUP BY pageID
ORDER BY scroll_events DESC
```

**Time on Page by Content:**
```sql
SELECT contentID,
       MAX(seconds) as max_time_seconds,
       COUNT(DISTINCT distinct_id) as unique_users
FROM events
WHERE event = 'time_milestone'
GROUP BY contentID
```

**Engagement by Locale:**
```sql
SELECT locale,
       COUNT(*) as page_views,
       AVG(depth) as avg_scroll_depth
FROM events
WHERE event IN ('$pageview', 'scroll_milestone')
GROUP BY locale
```

### Ensuring Components Have IDs

All Agility CMS components should include the `data-agility-component` attribute:

```tsx
export const MyComponent = async ({ module, languageCode }: UnloadedModuleProps) => {
  const { fields, contentID } = await getContentItem<IMyComponent>({
    contentID: module.contentid,
    languageCode,
  })

  return (
    <section data-agility-component={contentID}>
      {/* Component content */}
    </section>
  )
}
```

For client components, pass the contentID as a prop and use it on the wrapper element.

## Quick Start

### Basic Event Tracking

```typescript
import { analytics } from '@/lib/analytics'

// Track a custom event
analytics.track('button_clicked', {
  buttonName: 'signup',
  location: 'header'
})

// Track a CTA click with typed properties
analytics.trackCTAClick({
  ctaName: 'hero-signup',
  ctaUrl: '/signup',
  ctaText: 'Get Started',
  location: 'hero'
})

// Track a conversion
analytics.trackConversion({
  goalName: 'demo_request',
  value: 100,
  currency: 'USD'
})
```

### User Identification

```typescript
import { analytics, getOrCreateUserId } from '@/lib/analytics'

// Get or create a persistent user ID
const userId = getOrCreateUserId()

// Identify the user with traits
analytics.identify(userId, {
  audience: 'Enterprise',
  region: 'North America',
  locale: 'en-us'
})
```

## Event Taxonomy

### Core Events

| Event | Properties | Description |
|-------|------------|-------------|
| `page_viewed` | path, title, locale, audience, region, pageID, contentIDs, utmSource, etc. | Page navigation |
| `cta_clicked` | ctaName, ctaUrl, ctaText, location, component, pageID, contentID | CTA interactions |
| `scroll_milestone` | depth (25/50/75/100), timeToReach, locale, pageID, contentIDs | Scroll engagement |
| `time_milestone` | seconds (30/60/120/300), isVisible, locale, pageID, contentIDs | Time engagement |
| `outbound_link_clicked` | url, text, path, locale, pageID, contentID | External link clicks |

### Personalization Events

| Event | Properties | Description |
|-------|------------|-------------|
| `personalization_applied` | personalizationType, audience, region | Context detected |
| `personalized_content_viewed` | component, contentID, audience, region | Personalized content shown |
| `audience_changed` | audience, previousAudience, path | User changed audience |
| `region_changed` | region, previousRegion, path | User changed region |

### Experiment Events

| Event | Properties | Description |
|-------|------------|-------------|
| `experiment_exposure` | experimentKey, variant, component, contentID | Variant shown |
| `experiment_interaction` | experimentKey, variant, action, component | User interacted with variant |

### Conversion Events

| Event | Properties | Description |
|-------|------------|-------------|
| `conversion` | goalName, value, currency, metadata | Goal completed |
| `demo_requested` | All conversion properties | Demo/contact form submitted |
| `form_started` | formName, step | Form interaction started |
| `form_submitted` | formName, filledFields | Form completed |

## User Properties

These properties are set on users for segmentation:

| Property | Type | Description |
|----------|------|-------------|
| `audience` | string | Current audience segment |
| `region` | string | Current region |
| `locale` | string | Language preference |
| `first_seen` | ISO date | First visit timestamp |
| `session_count` | number | Total sessions |

## PostHog Dashboard Setup

> **See Also:** [Analytics Dashboard Reference](./ANALYTICS_DASHBOARD.md) for the pre-built demo dashboard with all insights configured.

### Demo Dashboard

A pre-configured PostHog dashboard is available with 10 insights covering traffic, engagement, and personalization:

**Dashboard URL:** https://us.posthog.com/project/194639/dashboard/1135430

The dashboard includes:
- Page Views Over Time
- Top Pages by Traffic
- Web Vitals Performance
- Time on Page Milestones
- Scroll Depth Distribution
- Engagement Funnel
- Personalization by Audience
- Personalized Content Views by Component
- Audience Segment Changes
- Region Changes

### Creating a Conversion Funnel

1. Go to PostHog > Insights > New Insight > Funnel
2. Add steps:
   - Step 1: `page_viewed` (entry)
   - Step 2: `cta_clicked`
   - Step 3: `form_submitted`
   - Step 4: `conversion`
3. Break down by `audience` property to see conversion by segment

### Creating an Audience Dashboard

1. **Traffic by Audience**
   - Create a Trends insight
   - Event: `page_viewed`
   - Breakdown by: `audience`
   - Display: Bar chart

2. **Engagement by Audience**
   - Create a Trends insight
   - Event: `scroll_milestone` where `depth = 100`
   - Breakdown by: `audience`
   - This shows which audiences read full pages

3. **Personalization Effectiveness**
   - Create a Funnel insight
   - Step 1: `personalized_content_viewed`
   - Step 2: `cta_clicked`
   - Step 3: `conversion`
   - Breakdown by: `audience`
   - Compare personalized vs non-personalized conversion

### A/B Test Analysis

> **See Also:** [A/B Testing Implementation Guide](./AB_TESTING.md) for complete implementation details, architecture decisions, and setup instructions.

A/B testing uses **client-side feature flag evaluation** with PostHog's `useFeatureFlagVariantKey` hook. This keeps routes static while PostHog handles experiment tracking automatically.

1. **Experiment Performance**
   - Create a Funnel insight
   - Step 1: `$feature_flag_called` where `$feature_flag = your-experiment`
   - Step 2: `cta_clicked` or `experiment_interaction`
   - Step 3: `conversion`
   - Breakdown by: `$feature_flag_response` (variant)

2. **Using PostHog Experiments Dashboard**
   - PostHog has built-in experiment analysis
   - Go to Experiments > Select your experiment
   - View statistical significance, conversion rates, and lift

## Switching Analytics Providers

The analytics system is designed to be provider-agnostic. You can swap providers for both client-side and server-side tracking.

### Graceful Degradation

If analytics credentials are not configured, the system gracefully degrades:
- **Client-side**: PostHog won't initialize, tracking calls are silently skipped
- **Server-side**: Feature flags return `undefined` (components use default variants), event tracking is skipped
- **No errors**: The application works normally without analytics

### Client-Side Provider Swap

To switch to a different client-side provider (e.g., Segment, Mixpanel):

1. Create a new provider in `src/lib/analytics/segment-provider.ts`
2. Implement the `AnalyticsProvider` interface
3. Swap the provider in `src/lib/analytics/index.ts`

```typescript
// Example segment-provider.ts structure
export const SegmentProvider: AnalyticsProvider = {
  name: 'Segment',
  init() { /* Initialize Segment */ },
  identify(userId, traits) { analytics.identify(userId, traits) },
  track(event, properties) { analytics.track(event, properties) },
  page(name, properties) { analytics.page(name, properties) },
  group(groupId, traits) { analytics.group(groupId, traits) },
  reset() { analytics.reset() },
  isReady() { return true }
}
```

4. Update `src/instrumentation-client.ts` to initialize your provider

### Server-Side Provider Swap

Server-side analytics (for feature flags and server-side event tracking) is in `src/lib/posthog/`. Each file contains detailed comments showing alternative implementations:

| File | Purpose | Alternatives |
|------|---------|--------------|
| `get-client.ts` | Analytics client initialization | GA4 Measurement Protocol, Mixpanel, Amplitude, Segment |
| `track-event.ts` | Server-side event tracking | GA4, Mixpanel, Amplitude, Segment |
| `get-feature-flag-variant.ts` | Feature flag evaluation | LaunchDarkly, Split.io, Statsig, GrowthBook |

Example environment variables for different providers:

```bash
# PostHog (current)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# Google Analytics 4
GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_ANALYTICS_API_SECRET=xxx

# Mixpanel
MIXPANEL_TOKEN=xxx

# LaunchDarkly (feature flags)
LAUNCHDARKLY_SDK_KEY=sdk-xxx
```

## Integrating with Other Tools

### Heat Mapping (Hotjar, FullStory, etc.)

The analytics events can trigger heat mapping recordings:

```typescript
// Example: Trigger Hotjar event on scroll milestone
analytics.track('scroll_milestone', {
  depth: 50
})

// In Hotjar, you can filter recordings by this event
```

### Google Analytics 4

GA4 is supported in two ways:

1. **Client-side (recommended)**: Use `@next/third-parties/google` in `layout.tsx`:
   ```tsx
   import { GoogleAnalytics } from '@next/third-parties/google'
   // ...
   {gaId && <GoogleAnalytics gaId={gaId} />}
   ```

2. **Server-side**: Use the Measurement Protocol (see `src/lib/posthog/track-event.ts` for example)

The event taxonomy is already GA4-compatible.

## Adding Tracking to Components

### Server Components (RSC)

For server-rendered components, embed the `PersonalizationTracker`:

```tsx
import { PersonalizationTracker } from '@/components/analytics'

export const MyComponent = async ({ searchParams, languageCode }) => {
  const audience = searchParams.audience
  const isPersonalized = /* check if showing personalized content */

  return (
    <div>
      <PersonalizationTracker
        audience={audience}
        component="MyComponent"
        contentID={contentID}
        isPersonalized={isPersonalized}
      />
      {/* Component content */}
    </div>
  )
}
```

### Client Components

Use the analytics API directly:

```tsx
"use client"

import { analytics } from '@/lib/analytics'

export function MyButton() {
  return (
    <button onClick={() => {
      analytics.trackCTAClick({
        ctaName: 'my-button',
        location: 'sidebar'
      })
    }}>
      Click Me
    </button>
  )
}
```

### Forms

Track form interactions:

```tsx
"use client"

import { analytics } from '@/lib/analytics'

export function ContactForm() {
  const handleFocus = () => {
    analytics.trackFormStarted({ formName: 'contact' })
  }

  const handleSubmit = async (data) => {
    await submitForm(data)

    analytics.trackFormSubmitted({
      formName: 'contact',
      filledFields: Object.keys(data)
    })

    analytics.trackConversion({
      goalName: 'contact_form',
      value: 50
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onFocus={handleFocus} />
      {/* ... */}
    </form>
  )
}
```

## Testing Analytics

### Development Mode

In development, all analytics calls are logged to the console:

```
[Analytics.track] cta_clicked { ctaName: 'hero-signup', location: 'hero' }
[Analytics.page] /blog { locale: 'en-us', audience: 'Enterprise' }
```

### PostHog Live Events

1. Open PostHog dashboard
2. Go to Events > Live Events
3. Browse the site to see events in real-time

### Browser DevTools

1. Open Network tab
2. Filter by "posthog"
3. View event payloads being sent

## Best Practices

1. **Use typed event helpers** - `trackCTAClick()` instead of `track('cta_clicked', ...)`
2. **Include context** - Always include `path`, `audience`, `region` when relevant
3. **Name events consistently** - Use snake_case, be descriptive
4. **Track meaningful actions** - Focus on user intent, not technical events
5. **Test before deploying** - Verify events in PostHog Live Events
6. **Document custom events** - Update this guide when adding new events

## Troubleshooting

### Analytics Not Configured (Expected Behavior)

If you haven't set up PostHog credentials, the system works normally:
- No console errors about missing configuration
- Feature flags return `undefined`, components use default variants
- Event tracking calls are silently skipped
- A/B tests show the control variant

This is intentional - analytics is optional.

### Events Not Appearing

1. Check PostHog is initialized (console log: "Initializing PostHog")
2. Verify `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` are set
3. Check Network tab for failed requests to PostHog

### User Properties Not Set

1. Ensure `identify()` is called before `track()`
2. Check that user ID is being generated/retrieved
3. Verify properties in PostHog > Persons

### Scroll/Time Tracking Not Working

1. Check if page has scrollable content
2. Verify EngagementTracker is mounted (check React DevTools)
3. Ensure page visibility is working (check console logs)

### Feature Flags Not Working

1. Verify PostHog credentials are set
2. Check the feature flag exists in PostHog dashboard
3. Ensure the experiment key matches exactly
4. Server logs will show: `Failed to get feature flag <key>: ...` if there's an error
