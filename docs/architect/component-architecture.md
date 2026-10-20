# Demo Site: Component Architecture

This guide documents the component architecture of the Demo Site, including all 20 components and their design patterns.

## Component Overview

The Demo Site includes **20 registered components** organized by category:

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

## Component Design Patterns

### Pattern 1: Simple Component

**Example: Hero**

- Direct field mapping
- Minimal data fetching
- Fast rendering

### Pattern 2: Content List Component

**Example: PostListing**

- Links to content list
- Supports filtering/sorting
- Pagination support

### Pattern 3: Nested Component

**Example: BentoSection**

- Parent component with nested content
- Fetches nested content separately
- Complex nested structure

### Pattern 4: Personalized Component

**Example: PersonalizedBackgroundHero**

- Audience/region filtering
- Query parameter handling
- Fallback content

### Pattern 5: A/B Test Component

**Example: ABTestHero**

- PostHog feature flag integration
- Server-side variant selection
- Analytics tracking

## Component Architecture Decisions

### Server vs Client Components

**Server Components:**
- Data fetching
- Content rendering
- SEO optimization

**Client Components:**
- Interactive features
- Form handling
- Animations

**Pattern:**
- Server component fetches data
- Passes data to client component
- Client component handles interactivity

### Component Registration

All components registered in `src/components/agility-components/index.ts`:

```typescript
const allModules = [
  { name: "ComponentName", module: ComponentName },
  // ... 19 more components
]
```

> **Note**: The variable name `allModules` and property `module` are from the Next.js SDK's legacy terminology. In Agility CMS, these are now called "components" and "component models."

## Key Architectural Patterns

### Nested Content Pattern

**BentoSection Example:**
1. Fetch parent component content
2. Extract nested reference name
3. Fetch nested content list separately
4. Render nested content

### Personalization Pattern

**PersonalizedBackgroundHero Example:**
1. Detect audience/region from URL params
2. Fetch component content
3. Filter personalized items by audience/region
4. Fallback to default content

### A/B Testing Pattern

**ABTestHero Example:**
1. Fetch component content with variants
2. Evaluate PostHog feature flag server-side
3. Select variant based on flag
4. Render selected variant
5. Track analytics

## Component Reusability

### Reusable Components

Components designed for reuse:
- **Hero variants**: Used across multiple pages
- **Content display**: PostListing, Testimonials used in multiple contexts
- **Layout components**: BentoSection, LogoStrip reusable

### Component Composition

Pages built by composing components:
- **Home Page**: PersonalizedBackgroundHero + BentoSection + Testimonials
- **Blog Page**: PostListing component
- **Pricing Page**: Hero + PricingCards + FAQ

## Best Practices Applied

1. **Focused Components**: Each component has single purpose
2. **Reusability**: Components designed for reuse
3. **Type Safety**: Full TypeScript support
4. **Performance**: Optimized for performance
5. **Accessibility**: Semantic HTML and ARIA labels

---

**Next**: [Integrations](./integrations.md) - Implemented integrations

