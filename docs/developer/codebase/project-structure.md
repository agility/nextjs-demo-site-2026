# Demo Site: Project Structure

This guide documents the codebase organization of the Demo Site. Understanding the project structure helps you navigate and contribute to the codebase effectively.

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Internationalized routes
│   │   ├── [...slug]/           # Dynamic page routing
│   │   │   └── page.tsx         # Main page component
│   │   └── layout.tsx           # Locale-specific layout
│   ├── api/                     # API routes
│   │   ├── ai/                  # AI search endpoints
│   │   ├── contact/             # Contact form endpoint
│   │   ├── preview/              # Preview mode endpoints
│   │   ├── revalidate/          # Cache revalidation webhook
│   │   └── search/              # Search endpoint
│   ├── layout.tsx               # Root layout
│   ├── sitemap.tsx              # Sitemap generation
│   └── robots.tsx               # Robots.txt generation
├── components/
│   ├── agility-components/       # Agility CMS components (20 components)
│   │   ├── index.ts             # Component registration
│   │   ├── BackgroundHero/
│   │   ├── BentoSection/
│   │   ├── PostListing/
│   │   └── ...
│   ├── header/                   # Header components
│   ├── footer/                   # Footer components
│   ├── ai-agent/                 # AI search components
│   ├── ai-elements/              # AI UI elements
│   └── ai-search/                # AI search interface
├── lib/
│   ├── cms/                      # CMS API functions
│   │   ├── getAgilitySDK.ts      # SDK initialization
│   │   ├── getContentItem.ts     # Fetch single content item
│   │   ├── getContentList.ts     # Fetch content list
│   │   ├── getAgilityPage.ts     # Fetch page data
│   │   ├── getSitemapFlat.ts     # Flat sitemap
│   │   └── getSitemapNested.ts   # Nested sitemap
│   ├── cms-content/              # Content processing utilities
│   │   ├── getHeaderContent.ts   # Header content
│   │   ├── getFooterContent.ts   # Footer content
│   │   └── checkRedirect.ts      # Redirect checking
│   ├── ai/                       # AI integration
│   │   └── search.ts             # AI search utilities
│   ├── posthog/                  # Analytics integration
│   ├── i18n/                     # Internationalization
│   │   └── config.ts             # Locale configuration
│   ├── types/                     # TypeScript definitions
│   │   ├── IPost.ts              # Post type
│   │   ├── IAuthor.ts            # Author type
│   │   └── ...
│   ├── utils/                    # Utility functions
│   │   └── audienceRegionUtils.ts # Personalization utilities
│   ├── hooks/                    # React hooks
│   │   └── useAudienceRegionParams.ts # Personalization hook
│   └── env.ts                    # Environment variables
├── proxy.ts                              # Next 16 proxy (was middleware.ts)
└── styles/                       # Global styles
    └── tailwind.css              # Tailwind CSS
```

## Key Files

### Proxy (`src/proxy.ts`)

Handles:
- Preview mode detection (alongside `beforeFiles` rewrites in `next.config.mjs`, which
  cover cached requests the proxy never sees)
- Redirect management
- Locale routing
- Search params encoding
- Dynamic content redirects
- Clean markdown rewrites (`/{path}.md` → `/api/page-md/...`)
- **Real 404s** — validated against the published sitemap, because under Cache
  Components `notFound()` can only produce a soft 404
- **Edge cache headers** — draft-aware, so unpublished content never reaches a shared cache

### Component Registration (`src/components/agility-components/index.ts`)

Registers all 20 Agility components:
- `allModules` array contains component mappings
- `getModule()` function finds components by name
- Case-insensitive matching

### CMS Utilities (`src/lib/cms/`)

Core CMS functions:
- `getAgilitySDK()` - SDK initialization with preview mode
- `getContentItem()` - Fetch single content item with caching
- `getContentList()` - Fetch content list with caching
- `getAgilityPage()` - Fetch page data with components

### Environment Configuration (`src/lib/env.ts`)

Strongly-typed environment variables:
- Validates required variables at runtime
- Provides type-safe access
- Throws errors for missing variables

## Component Organization

### Agility Components

Located in `src/components/agility-components/`:

- **Simple Components**: Direct field mapping (Hero, RichTextArea)
- **List Components**: Display content lists (PostListing, Testimonials)
- **Nested Components**: Fetch nested content (BentoSection)
- **Client Components**: Interactive components (Carousel, ContactUs)
- **Personalized Components**: Audience/region filtering

### Component Patterns

**Server Component Pattern:**
```typescript
// Server component fetches data
export const ComponentName = async ({ module, languageCode }) => {
  const { fields } = await getContentItem({ ... })
  return <div>{fields.heading}</div>
}
```

**Server + Client Split:**
```typescript
// Server component
export const ComponentServer = async ({ module, languageCode }) => {
  const data = await fetchData()
  return <ComponentClient data={data} />
}

// Client component
"use client"
export const ComponentClient = ({ data }) => {
  // Interactive logic
}
```

## API Routes

### Preview Routes

- `/api/preview` - Enable preview mode
- `/api/preview/exit` - Exit preview mode

### Revalidation Route

- `/api/revalidate` - Webhook endpoint for cache invalidation

### AI Routes

- `/api/ai/search` - AI-powered search
- `/api/ai/agent` - AI agent endpoint

### Other Routes

- `/api/contact` - Contact form submission
- `/api/search` - Standard search
- `/api/dynamic-redirect` - Dynamic content redirects

## Type Definitions

TypeScript interfaces in `src/lib/types/`:

- `IPost.ts` - Blog post structure
- `IAuthor.ts` - Author information
- `ICategory.ts` - Blog categories
- `ITag.ts` - Blog tags
- `IAudience.ts` - Audience targeting
- `IRegion.ts` - Regional content
- `SitemapNode.ts` - Sitemap structure

## Build Process

### Pre-build Step

```bash
npm run prebuild
```

Runs `node/prebuild.ts` to:
- Rebuild redirect cache
- Generate bloom filters
- Prepare static data

### Build

```bash
npm run build
```

- Generates static pages
- Builds API routes
- Optimizes assets

## Development Workflow

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Make Changes:**
   - Edit components in `src/components/agility-components/`
   - Update types in `src/lib/types/`
   - Modify API routes in `src/app/api/`

3. **Test Changes:**
   - Preview in browser
   - Test with different content
   - Verify caching behavior

4. **Build and Deploy:**
   ```bash
   npm run prebuild
   npm run build
   ```

---

**Next**: [Content Models](./content-models.md) - Content model implementations

