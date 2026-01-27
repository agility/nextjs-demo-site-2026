# Analytics Demo Dashboard - Insight Reference

This document describes the pre-configured PostHog dashboard for the Agility CMS demo site. For implementation details, see the [Analytics Integration Guide](./ANALYTICS_INTEGRATION.md).

**Dashboard URL:** https://us.posthog.com/project/194639/dashboard/1135430

## Overview

The Analytics Demo dashboard provides 10 insights across three categories:
- **Traffic & Performance** - Page views, top pages, web vitals
- **Engagement** - Time on page, scroll depth, conversion funnel
- **Personalization** - Audience targeting, region preferences, content personalization

## Traffic & Performance Insights

### Page Views Over Time
- **Event:** `$pageview`
- **Chart:** Line Graph
- **Purpose:** Track daily page view trends to understand traffic patterns
- **Use Case:** Identify traffic spikes, measure campaign impact, spot anomalies

### Top Pages by Traffic
- **Event:** `$pageview` (breakdown by `$pathname`)
- **Chart:** Bar Value
- **Purpose:** See which pages get the most traffic
- **Use Case:** Identify popular content, optimize high-traffic pages

### Web Vitals
- **Event:** `$web_vitals`
- **Chart:** Line Graph
- **Purpose:** Monitor Core Web Vitals performance metrics
- **Use Case:** Track site performance, identify performance regressions

---

## Engagement Insights

### Time on Page Milestones
- **Event:** `time_milestone` (breakdown by `seconds`)
- **Chart:** Bar
- **Purpose:** Track how long users stay engaged on pages
- **Milestones:** 30s, 60s, 120s, 300s
- **Use Case:** Measure content engagement depth, identify sticky content

### Scroll Depth Distribution
- **Event:** `scroll_milestone` (breakdown by `depth`)
- **Chart:** Pie
- **Purpose:** See how far users scroll down pages
- **Milestones:** 25%, 50%, 75%, 100%
- **Use Case:** Understand content consumption, optimize page layouts

### Engagement Funnel
- **Events:** `$pageview` → `time_milestone`
- **Chart:** Funnel
- **Purpose:** Conversion from page view to engaged user (30+ seconds)
- **Use Case:** Measure overall engagement rate, identify drop-off points

---

## Personalization Insights

### Personalization by Audience
- **Event:** `personalization_applied` (breakdown by `audience`)
- **Chart:** Bar
- **Purpose:** Track when personalized content is served to different audience segments
- **Properties:** `audience`, `component`, `contentID`, `path`
- **Use Case:** Measure personalization reach by segment (Enterprise, SMB, etc.)

### Personalized Content Views by Component
- **Event:** `personalized_content_viewed` (breakdown by `component`)
- **Chart:** Pie
- **Purpose:** See which components are serving personalized content most often
- **Properties:** `component`, `audience`, `region`, `contentID`
- **Use Case:** Identify most-used personalization touchpoints

### Audience Segment Changes
- **Event:** `audience_changed` (breakdown by `audience`)
- **Chart:** Line Graph
- **Purpose:** Track when users switch between audience segments
- **Properties:** `previousAudience`, `audience`, `path`
- **Use Case:** Understand audience exploration patterns

### Region Changes
- **Event:** `region_changed` (breakdown by `region`)
- **Chart:** Line Graph
- **Purpose:** Track when users switch their region preference
- **Properties:** `previousRegion`, `region`, `path`
- **Use Case:** Measure regional content interest

---

## Event Reference

| Event Name | Trigger | Key Properties |
|------------|---------|----------------|
| `$pageview` | Page load/navigation | `$pathname`, `audience`, `region`, `locale`, `pageID`, `contentIDs` |
| `$web_vitals` | Performance measurement | LCP, FID, CLS metrics |
| `time_milestone` | User stays on page | `seconds`, `path`, `title`, `isVisible`, `locale`, `pageID`, `contentIDs` |
| `scroll_milestone` | User scrolls page | `depth`, `timeToReach`, `path`, `locale`, `pageID`, `contentIDs` |
| `outbound_link_clicked` | External link click | `url`, `text`, `path`, `pageID`, `contentID` |
| `personalization_applied` | Personalized content detected | `audience`, `region`, `component`, `contentID` |
| `personalized_content_viewed` | User sees personalized content | `audience`, `region`, `component`, `isPersonalized` |
| `audience_changed` | URL audience param changes | `audience`, `previousAudience`, `path` |
| `region_changed` | URL region param changes | `region`, `previousRegion`, `path` |

### Agility CMS Properties

These properties are automatically included in events to enable CMS-level analytics:

| Property | Type | Description |
|----------|------|-------------|
| `pageID` | number | Agility CMS page ID from `data-agility-page` attribute |
| `contentIDs` | number[] | All content IDs on the page (dynamic content + component IDs) |
| `contentID` | number | Specific component content ID for interaction events |
| `locale` | string | Current language/locale extracted from URL path |

---

## Testing & Verification

### Development Console Logs

In development mode, all analytics events are logged to the browser console:

```
[Analytics.track] cta_clicked { ctaName: 'hero-signup', location: 'hero' }
[Analytics.page] /blog { locale: 'en-us', audience: 'Enterprise' }
[Analytics.track] scroll_milestone { depth: 50, timeToReach: 15234 }
[Analytics.track] personalization_applied { audience: 'Enterprise', component: 'PersonalizedBackgroundHero' }
```

### PostHog Live Events

1. Open PostHog dashboard
2. Go to **Events → Live Events**
3. Browse the site to see events streaming in real-time

### Browser DevTools Network Tab

1. Open DevTools → Network tab
2. Filter by "posthog"
3. Watch for POST requests to `us.i.posthog.com`

## Testing Personalization

To generate personalization data, browse with these URL parameters:

```
# Enterprise audience in North America
https://yoursite.com/?audience=Enterprise&region=North%20America

# SMB audience in Europe
https://yoursite.com/?audience=SMB&region=Europe

# Switch between audiences to trigger change events
https://yoursite.com/?audience=Enterprise
https://yoursite.com/?audience=SMB
```

### Testing Engagement Events

1. **Time Milestones**: Stay on a page for 30s, 60s, 120s, 300s
2. **Scroll Milestones**: Scroll to 25%, 50%, 75%, 100% of page
3. **CTA Clicks**: Click buttons/links in tracked components

## Troubleshooting

### Events Not Appearing in Dashboard

1. **Check console logs** - Events should log in development mode
2. **Verify PostHog is loaded** - Look for "Initializing PostHog" in console
3. **Check test account filtering** - PostHog may filter localhost traffic by default
4. **Wait for data sync** - Events may take a few minutes to appear in insights

### Personalization Events Missing

1. Ensure you're using `?audience=X&region=Y` query parameters
2. Verify the `PersonalizationTracker` component is rendered
3. Check that `analytics.isReady()` returns true before tracking

## Related Documentation

- [Analytics Integration Guide](./ANALYTICS_INTEGRATION.md) - Full implementation details
- [Audience & Region System](./AUDIENCE_REGION_SYSTEM.md) - Personalization query parameters
- [PostHog Documentation](https://posthog.com/docs) - Official PostHog docs
