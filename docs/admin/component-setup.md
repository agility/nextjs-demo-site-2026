# Demo Site: Component Setup

This guide documents the component models configured in the Demo Site.

## Component Overview

The Demo Site includes **20 component definitions** organized by category:

### Content Display (4)
- PostListing, PostDetails, Testimonials, TeamListing

### Hero Components (4)
- Hero, BackgroundHero, ABTestHero, PersonalizedBackgroundHero

### Interactive (3)
- Carousel, ContactUs, FrequentlyAskedQuestions

### Layout (3)
- BentoSection, LogoStrip, PersonalizedLogoStrip

### Data Display (3)
- CompanyStats, StatsStrip, PricingCards, PricingTable

### Navigation (1)
- Header

### Utility (2)
- RichTextArea, Testimonial (single)

## Component Registration

All components must be registered in frontend code:

```typescript
// src/components/agility-components/index.ts
const allModules = [
  { name: "ComponentName", module: ComponentName },
  // ... 19 more components
]
```

> **Note**: The variable name `allModules` and property `module` are from the Next.js SDK's legacy terminology. In Agility CMS, these are now called "components" and "component models."

**Critical:** Component names must match Agility CMS definitions (case-insensitive).

## Component Administration

### Managing Hero Components

**Tasks:**
- Configure hero component fields
- Set up A/B test experiments
- Configure personalization rules

### Managing Content Display Components

**Tasks:**
- Configure display settings
- Set up filtering and sorting
- Configure pagination

### Managing Interactive Components

**Tasks:**
- Configure form components
- Set up carousel settings
- Configure FAQ accordion

---

**Next**: [Workflows](./workflows.md) - Configured workflows

