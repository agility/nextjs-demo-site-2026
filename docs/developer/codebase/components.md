# Demo Site: Component Implementations

This guide documents the 20 Agility components implemented in the Demo Site, including patterns, code examples, and usage.

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

## Component Registration

All components are registered in `src/components/agility-components/index.ts`:

```typescript
const allModules = [
  { name: "RichTextArea", module: RichTextArea },
  { name: "BackgroundHero", module: BackgroundHero },
  { name: "BentoSection", module: BentoSection },
  // ... 17 more components
]
```

> **Note**: The variable name `allModules` and property `module` are from the Next.js SDK's legacy terminology. In Agility CMS, these are now called "components" and "component models."

## Component Patterns

### Pattern 1: Simple Component

**Example: Hero**

```typescript
export const Hero = async ({ module, languageCode }: UnloadedModuleProps) => {
  const { fields, contentID } = await getContentItem<IHero>({
    contentID: module.contentid,
    languageCode,
  })

  return (
    <section data-agility-component={contentID}>
      <h1 data-agility-field="heading">{fields.heading}</h1>
      <p data-agility-field="description">{fields.description}</p>
    </section>
  )
}
```

### Pattern 2: List Component

**Example: PostListing**

```typescript
export const PostListing = async ({ module, languageCode }: UnloadedModuleProps) => {
  const { items } = await getContentList<IPost>({
    referenceName: "posts",
    languageCode,
    take: 10,
  })

  return (
    <div data-agility-component={module.contentid}>
      {items.map((post) => (
        <article key={post.contentID}>
          <h2>{post.fields.heading}</h2>
        </article>
      ))}
    </div>
  )
}
```

### Pattern 3: Nested Content Component

**Example: BentoSection**

```typescript
export const BentoSection = async ({ module, languageCode }: UnloadedModuleProps) => {
  // 1. Get section with nested reference
  const { fields: { bentoCards: { referencename } }, contentID } =
    await getContentItem<IBentoSection>({
      contentID: module.contentid,
      languageCode,
    })

  // 2. Fetch nested cards
  const bentoCards = await getContentList<IBentoCard>({
    referenceName: referencename,
    languageCode,
    take: 20,
  })

  return (
    <Container data-agility-component={contentID}>
      {bentoCards.items.map((card) => (
        <AnimatedBentoCard key={card.contentID} {...card.fields} />
      ))}
    </Container>
  )
}
```

### Pattern 4: Server + Client Split

**Example: ContactUs**

```typescript
// Server component
export const ContactUs = async ({ module, languageCode }: UnloadedModuleProps) => {
  const { fields } = await getContentItem<IContactUs>({
    contentID: module.contentid,
    languageCode,
  })

  return <ContactUsClient fields={fields} />
}

// Client component
"use client"
export const ContactUsClient = ({ fields }) => {
  // Form handling logic
}
```

### Pattern 5: Personalization Component

**Example: PersonalizedBackgroundHero**

```typescript
export const PersonalizedBackgroundHero = async ({
  module,
  languageCode,
  globalData
}: UnloadedModuleProps) => {
  const { searchParams } = globalData
  const audienceContentID = await getAudienceContentID(searchParams, languageCode)

  // Fetch personalized content based on audience
  const { fields } = await getContentItem<IPersonalizedHero>({
    contentID: module.contentid,
    languageCode,
  })

  // Filter personalized items by audience
  const personalizedItems = fields.personalizedHeroItems.items.filter(
    item => item.fields.audience?.contentID === audienceContentID
  )

  return (
    <section data-agility-component={module.contentid}>
      {/* Render personalized content */}
    </section>
  )
}
```

## Key Components

### BentoSection

**Purpose**: Animated grid of cards

**Pattern**: Nested content fetching

**Key Features**:
- Fetches parent section content
- Fetches nested Bento Cards separately
- Animated grid layout
- Staggered animations

### PostListing

**Purpose**: Display blog post listings

**Pattern**: Content list with filtering

**Key Features**:
- Fetches Posts content list
- Supports category filtering
- Pagination support
- SEO-friendly URLs

### PostDetails

**Purpose**: Display individual blog post

**Pattern**: Single content item

**Key Features**:
- Fetches single Post content item
- Displays author, category, tags
- Rich text rendering
- Related posts

### ABTestHero

**Purpose**: A/B testing hero section

**Pattern**: Server + Client with PostHog

**Key Features**:
- PostHog feature flag integration
- Partial Prerendering (PPR) support
- Server-side variant selection
- Analytics tracking

### PersonalizedBackgroundHero

**Purpose**: Audience/region-aware hero

**Pattern**: Personalization with filtering

**Key Features**:
- Audience-based content filtering
- Region-based content filtering
- Fallback to default content
- URL parameter-based targeting

## Component Best Practices

1. **Type Safety**: Always use TypeScript interfaces
2. **Error Handling**: Handle missing content gracefully
3. **Performance**: Use `priority` for above-the-fold images
4. **Accessibility**: Include alt text and semantic HTML
5. **SEO**: Use proper heading hierarchy

---

**Next**: [API Routes](./api-routes.md) - Custom API routes

