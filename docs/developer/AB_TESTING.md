# A/B Testing Implementation Guide

This document describes the A/B testing architecture for the Agility CMS demo site using PostHog Experiments.

## Overview

A/B testing is implemented using **client-side feature flag evaluation** with PostHog's React hooks. This approach prioritizes performance while maintaining accurate experiment tracking.

## Architecture Decision: Client-Side Evaluation

We use client-side feature flag evaluation rather than server-side for A/B tests. Here's why:

### Why Client-Side?

| Consideration | Server-Side | Client-Side (Our Choice) |
|--------------|-------------|-------------------------|
| **Route Rendering** | Dynamic (uses cookies/headers) | Static (PPR-compatible) |
| **Initial Paint** | Correct variant immediately | Control variant, then swap |
| **Performance** | Slower (dynamic rendering) | Faster (static + hydration) |
| **Complexity** | User ID sync between server/client | PostHog handles automatically |
| **PostHog Pattern** | Custom implementation | Standard React hooks |

### The Trade-off

- **~50% of users (control group)**: See the correct content immediately, no change
- **~50% of users (treatment group)**: See control briefly, then content swaps

We mitigate the swap with:
1. CSS opacity transition (subtle fade rather than jarring swap)
2. PostHog's localStorage caching (returning users get instant correct variant)

### Next.js App Router Constraint

Using `cookies()` or `headers()` in Next.js App Router opts the entire route segment into dynamic rendering. This defeats the benefits of:
- Static generation
- Partial Prerendering (PPR)
- Edge caching

For a performance-focused site, keeping routes static is more valuable than eliminating a brief content swap for first-time treatment users.

## Implementation

### Component Structure

```
src/components/agility-components/ABTestHero/
├── ABTestHero.tsx       # Server component - fetches CMS content
├── ABTestHeroClient.tsx # Client component - evaluates flag, renders variant
└── index.ts             # Exports
```

### Server Component (ABTestHero.tsx)

Fetches all variant content from Agility CMS and passes to the client:

```tsx
export const ABTestHero = async ({ module, languageCode }) => {
  // Fetch main content and variants from CMS
  const { fields, contentID } = await getContentItem(...)
  const variantsList = await getContentList(...)

  // Create control variant from main content
  const controlVariant = { variant: "control", ...fields }
  const allVariants = [controlVariant, ...variantsList]

  return (
    <ABTestHeroClient
      experimentKey={fields.experimentKey}
      allVariants={allVariants}
      contentID={contentID}
    />
  )
}
```

### Client Component (ABTestHeroClient.tsx)

Uses PostHog's `useFeatureFlagVariantKey` hook:

```tsx
import { useFeatureFlagVariantKey } from "posthog-js/react"

export const ABTestHeroClient = ({ experimentKey, allVariants, contentID }) => {
  // PostHog's hook - automatically tracks $feature_flag_called
  const flagVariant = useFeatureFlagVariantKey(experimentKey)

  const controlVariant = allVariants.find(v => v.variant === "control")
  const selectedVariant = flagVariant
    ? allVariants.find(v => v.variant === flagVariant) || controlVariant
    : controlVariant

  return (
    <section data-variant={selectedVariant.variant}>
      {/* Render variant content */}
    </section>
  )
}
```

## PostHog Setup

### 1. Create a Feature Flag

1. Go to PostHog → Feature Flags → New Feature Flag
2. Set the flag key (this is your `experimentKey` in CMS)
3. Configure variants:
   - `control` - matches your default CMS content
   - `variant-a`, `variant-b`, etc. - match your CMS variant names

### 2. Create an Experiment

1. Go to PostHog → Experiments → New Experiment
2. Link to your feature flag
3. Set your goal metric (e.g., `cta_clicked`, `conversion`)
4. Configure traffic allocation

### 3. Configure in Agility CMS

1. Create an ABTestHero component
2. Set `experimentKey` to match your PostHog flag key
3. Add variants via the linked content list
4. Each variant's `variant` field must match a PostHog variant key

## Event Tracking

### Automatic Events (PostHog)

The `useFeatureFlagVariantKey` hook automatically fires:

```json
{
  "event": "$feature_flag_called",
  "properties": {
    "$feature_flag": "homepage-hero-test",
    "$feature_flag_response": "variant-a"
  }
}
```

### Custom Events (Analytics Abstraction)

We also fire events through our analytics abstraction for flexibility:

```typescript
// Experiment exposure
analytics.trackExperimentExposure({
  experimentKey: "homepage-hero-test",
  variant: "variant-a",
  component: "ABTestHero",
  contentID: 123
})

// Experiment interaction (e.g., CTA click)
analytics.track(AnalyticsEvents.EXPERIMENT_INTERACTION, {
  experimentKey: "homepage-hero-test",
  variant: "variant-a",
  action: "cta_click"
})
```

## Analyzing Results

### PostHog Experiments Dashboard

1. Go to PostHog → Experiments
2. Select your experiment
3. View:
   - Conversion rates by variant
   - Statistical significance
   - Confidence intervals
   - Sample sizes

### Custom Funnels

Create a funnel insight:
1. Step 1: `$feature_flag_called` where `$feature_flag = your-experiment`
2. Step 2: `experiment_interaction` or `cta_clicked`
3. Step 3: `conversion`
4. Breakdown by: `$feature_flag_response` (variant)

## Best Practices

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Feature flag key | `kebab-case` | `homepage-hero-test` |
| Variant names | `kebab-case` | `control`, `variant-a`, `variant-b` |
| CMS experimentKey | Match flag key exactly | `homepage-hero-test` |

### Experiment Design

1. **One change per test** - Test a single hypothesis
2. **Adequate sample size** - Let PostHog calculate required traffic
3. **Run to completion** - Don't stop early based on results
4. **Document everything** - Record hypothesis, variants, and outcomes

### Flicker Mitigation

The component includes subtle flicker mitigation:

```tsx
<section
  className={clsx(
    "transition-opacity duration-200",
    hasEvaluated ? "opacity-100" : "opacity-95"
  )}
>
```

This creates a barely perceptible fade rather than a jarring content swap.

## Troubleshooting

### Variant Not Changing

1. Check the feature flag exists in PostHog
2. Verify `experimentKey` in CMS matches the flag key exactly
3. Check PostHog is initialized (console: "Initializing PostHog")
4. Clear localStorage and refresh (PostHog caches flags)

### Events Not Appearing

1. Check PostHog Live Events for `$feature_flag_called`
2. Verify the experiment is running (not paused)
3. Check you're not filtered out by test account settings

### Always Seeing Control

1. You may be in the control group (check PostHog toolbar)
2. Override locally: PostHog toolbar → Feature Flags → Toggle

## Server-Side Evaluation (When Needed)

For cases where server-side evaluation is required (rare), use:

```typescript
import { getFeatureFlagVariant } from '@/lib/posthog/get-feature-flag-variant'

const variant = await getFeatureFlagVariant(flagKey, distinctId)
```

**Warning**: This opts routes into dynamic rendering. Only use for:
- Server-only features (API behavior)
- Cases where you absolutely cannot show control first

## Related Documentation

- [Analytics Integration Guide](./ANALYTICS_INTEGRATION.md) - Full analytics architecture
- [Analytics Dashboard Reference](./ANALYTICS_DASHBOARD.md) - PostHog insights
- [PostHog React Docs](https://posthog.com/docs/libraries/react) - Official docs
- [PostHog Experiments](https://posthog.com/docs/experiments) - Experiment setup
