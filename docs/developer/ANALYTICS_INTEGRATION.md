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

## Architecture

```
src/lib/analytics/
├── index.ts              # Main analytics API
├── types.ts              # TypeScript interfaces
├── events.ts             # Event name constants
├── posthog-provider.ts   # PostHog implementation
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
| `page_viewed` | path, title, locale, audience, region, utmSource, etc. | Page navigation |
| `cta_clicked` | ctaName, ctaUrl, ctaText, location, component | CTA interactions |
| `scroll_milestone` | depth (25/50/75/100), timeToReach | Scroll engagement |
| `time_milestone` | seconds (30/60/120/300), isVisible | Time engagement |
| `outbound_link_clicked` | url, text, path | External link clicks |

### Personalization Events

| Event | Properties | Description |
|-------|------------|-------------|
| `personalization_applied` | personalizationType, audience, region | Context detected |
| `personalized_content_viewed` | component, contentId, audience, region | Personalized content shown |
| `audience_changed` | audience, previousAudience, path | User changed audience |
| `region_changed` | region, previousRegion, path | User changed region |

### Experiment Events

| Event | Properties | Description |
|-------|------------|-------------|
| `experiment_exposure` | experimentKey, variant, component, contentId | Variant shown |
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

1. **Experiment Performance**
   - Create a Funnel insight
   - Step 1: `experiment_exposure` where `experimentKey = your-experiment`
   - Step 2: `experiment_interaction`
   - Step 3: `conversion`
   - Breakdown by: `variant`

2. **Using PostHog Experiments**
   - PostHog has built-in experiment analysis
   - Go to Experiments > Select your experiment
   - View statistical significance and lift

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

### CDPs (Segment, RudderStack)

To switch to Segment:

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

### Google Analytics 4

GA4 can receive the same events through Google Tag Manager:

1. Set up GA4 in GTM
2. Create triggers for custom events
3. Map analytics events to GA4 events
4. The event taxonomy is already GA4-compatible

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
        contentId={contentID}
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
