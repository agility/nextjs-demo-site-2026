# Agility CMS Next.js Demo Site - AI Agent Instructions

> Modern headless CMS website with AI-powered search, internationalization, and advanced caching

## Project Overview

This is an Agility CMS-powered Next.js demo site built with React 19, TypeScript, and Tailwind CSS. The site demonstrates modern web development practices with a headless CMS architecture with AI-powered search capabilities.

## Get This Reference Implementation

This is a fully-featured reference implementation showcasing Agility CMS capabilities. To get your own copy of this solution:

**[Contact our sales team](https://agilitycms.com/contact-us/get-a-demo)** and we'll clone this solution for you and help you get set up with a POC (Proof of Concept).

Our team will:
- Clone the complete solution to your environment
- Set up your Agility CMS instance with the content models
- Help you configure the necessary integrations
- Guide you through the setup process

---

## Core Architecture

**Headless CMS Pattern**: Content managed in Agility CMS → API fetching → Next.js rendering

- **Page Routing**: Dynamic via Agility's sitemap (`src/components/agility-pages/MainTemplate.tsx`)
- **Content Zones**: `<ContentZone name="main-content-zone">` renders CMS modules
- **Module System**: CMS components auto-registered via `getModule()` function

**Essential File Relationships**:

- `src/middleware.ts` → Handles preview, redirects, i18n routing
- `src/lib/cms/` → All CMS API abstractions with caching
- `src/components/agility-components/` → CMS-bound components (see `BentoSection.tsx` for nested data pattern)

## Technology Stack

- **Framework**: Next.js 15.5.3 with App Router, React 19, TypeScript, Turbopack dev server
- **Frontend**: React 19.1.0 with hooks for state management
- **Styling**: Tailwind CSS v4 (CSS-file based, no config file) + Motion animations
- **CMS**: Agility CMS (@agility/nextjs 15.0.7) with custom caching layer
- **Animations**: Motion (Framer Motion alternative) 12.23.0
- **Icons**: Heroicons v2, React Icons
- **AI Features**: Azure/OpenAI integration with Algolia search (`/api/ai/search`)
- **Analytics**: PostHog integration with environment validation
- **Development**: Turbopack dev server, ESLint, Prettier

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API routes (ai, preview, revalidate, etc.)
│   └── docs/              # In-site documentation (demo site specific - see below)
├── components/             # Reusable UI components
│   ├── agility-components/ # CMS-connected components (RichTextArea, BentoSection, etc.)
│   ├── agility-pages/      # Page-level components
│   ├── header/            # Header navigation components
│   ├── footer/            # Footer components
│   ├── ai-agent/          # AI agent components
│   ├── ai-elements/       # AI-powered UI elements
│   └── ai-search/         # AI search components
├── lib/                   # Utilities and CMS helpers
│   ├── cms/               # Agility CMS API functions and SDK
│   ├── cms-content/        # Content processing utilities
│   ├── ai/                # AI integration utilities
│   ├── posthog/           # Analytics integration
│   ├── docs/              # Documentation utilities (MDX routing, file parsing)
│   └── types/             # TypeScript definitions
├── docs/                  # Documentation markdown files (source for /docs route)
└── public/                # Static assets organized by category
```

### In-Site Documentation System (`/docs`)

**⚠️ Important**: This demo site includes an in-site documentation system accessible at `/docs`. This is **specific to this demo site** and is **not part of a normal Agility CMS site**. It's included here to document the demo site's architecture, implementation patterns, and instance-specific configuration.

**Key Points:**
- **Purpose**: Documents this specific demo site, not generic Agility CMS concepts
- **Implementation**: MDX routing using `react-markdown` to render markdown files from the `docs/` folder
- **Routing**: Dynamic routes via `src/app/docs/[...slug]/page.tsx` that serve markdown files
- **Layout**: Custom layout with sidebar navigation (`src/app/docs/layout.tsx`)
- **Content**: Markdown files in `docs/` folder organized by role (admin, architect, content-editor, developer)
- **Features**: Breadcrumbs, SEO metadata, structured data, dark mode support

**Files:**
- `src/app/docs/layout.tsx` - Documentation layout with header, sidebar, and footer
- `src/app/docs/page.tsx` - Documentation index/homepage
- `src/app/docs/[...slug]/page.tsx` - Dynamic route handler for individual doc pages
- `src/lib/docs/getDocsFiles.ts` - Utilities for reading and parsing markdown files, building navigation tree

**Note**: For generic Agility CMS training and documentation, direct users to the [Official Agility CMS Training Guide](https://agilitycms.com/docs/training-guide). The in-site docs focus on demo-site-specific information.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run prebuild` - Rebuild redirect cache (run before build)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Critical Pre-build Step**: `tsx node/prebuild.ts` rebuilds redirect cache from bloom filters

## Agility CMS MCP Server

This project is configured with the **Agility CMS Model Context Protocol (MCP) server**, which provides AI coding assistants with direct access to your Agility CMS instance. This dramatically improves the development experience when working with Agility CMS content.

### What the MCP Server Provides

The Agility MCP server gives AI assistants the ability to:

**Content Management:**
- Browse and query content items from any container
- Create, read, and update content items
- Upload media assets to the media library
- Work with nested and linked content

**Schema Management:**
- View all content models and component models
- Get detailed field definitions for any model
- Create or modify content models and components
- View and manage containers (content lists)

**Site Structure:**
- Access sitemap/page structure
- View and create pages (static, dynamic, folder, link)
- See page models and their zone configurations
- Work with multi-locale setups

**Instance Information:**
- View available Agility instances
- See configured locales
- Access instance metadata

### How AI Assistants Use It

When you ask an AI assistant to work with Agility CMS, it can:
- Automatically fetch content model schemas before creating components
- Create new content models, components, and containers directly in your CMS
- Query existing content to understand data structures
- Upload images and handle media assets
- Create pages and configure sitemaps
- Validate field types and requirements before generating code

### Benefits for Development

- **No context switching**: AI can access your CMS structure without you copying/pasting schemas
- **Accurate code generation**: AI sees actual field definitions and types
- **Content creation**: AI can populate test content or migrate data
- **Schema management**: AI can help architect and implement new content models
- **Type safety**: AI generates TypeScript interfaces that match your actual CMS schemas

### Example Workflows

1. **"Create a new Hero component in Agility CMS and build the React component for it"**
   - AI fetches existing component models to understand patterns
   - Creates the component model in Agility CMS with appropriate fields
   - Generates the TypeScript interface matching the fields
   - Creates the React component following project conventions
   - Registers it in the component index

2. **"Show me all blog posts and create a new one"**
   - AI queries the posts container
   - Shows you the existing posts
   - Creates a new post with proper field structure

3. **"What fields does the BentoSection component have?"**
   - AI fetches the component model details from Agility
   - Shows you the exact field structure without opening the CMS

### MCP Server Configuration

The MCP server is configured automatically when using AI assistants that support MCP (like Claude Code). The MCP server uses **OAuth authentication** to connect to your Agility CMS instance, providing secure access to your content and schema.

**Authentication:**
- The MCP server authenticates via OAuth (not API keys)
- You'll authenticate through the Agility CMS login flow when first connecting
- OAuth tokens are managed automatically by the MCP server

**Note:** The project's API keys in `.env.local` (AGILITY_API_FETCH_KEY, AGILITY_API_PREVIEW_KEY) are used by the Next.js application for fetching content at runtime, not by the MCP server.

## Component Conventions

- Use TypeScript for all components
- Follow existing naming patterns (PascalCase for components)
- Utilize Tailwind CSS for styling
- Components are functional with modern React patterns
- Agility CMS components follow their SDK patterns
- Always use async components for CMS data fetching

## Code Style

- Prettier configuration with Tailwind CSS plugin
- ESLint with Next.js recommended rules
- Import organization with prettier-plugin-organize-imports
- 2-space indentation, semicolons, single quotes for JSX attributes

## Documentation Maintenance

**CRITICAL**: When making code changes, AI agents must also update relevant documentation to keep it in sync with the codebase.

**Documentation Update Requirements:**
- **Always update documentation** when modifying code that affects:
  - Architecture patterns (middleware, routing, caching)
  - API routes and endpoints
  - Component patterns and conventions
  - Configuration and environment variables
  - Integration patterns (CMS, AI, analytics)
  - Query parameters and search params handling
  - Any behavior that users or developers need to know about

**Documentation Locations:**
- `AGENTS.md` - Main AI agent instructions (this file) - Update sections that describe how things work
- `docs/developer/` - Developer documentation - Update relevant markdown files
- `docs/architect/` - Architecture documentation - Update when architectural patterns change
- `docs/content-editor/` - Content editor guides - Update when CMS components or workflows change
- `docs/admin/` - Admin documentation - Update when configuration or setup changes

**When to Update Documentation:**
- Adding new features or functionality
- Changing existing behavior or patterns
- Modifying configuration requirements
- Updating dependencies or technology stack
- Fixing bugs that affect documented behavior
- Adding new query parameters or API endpoints
- Changing middleware or routing logic
- Modifying caching strategies

**How to Update:**
1. Identify which documentation files are affected by your code changes
2. Search for references to the changed functionality in documentation
3. Update the relevant sections to reflect the new implementation
4. Add examples or clarify explanations if needed
5. Ensure consistency across all documentation files

**Example**: If you modify middleware query string handling, update:
- `AGENTS.md` - "Search Params Handling" section
- `docs/developer/MULTI_LOCALE_IMPLEMENTATION.md` - Middleware processing steps
- `docs/developer/AUDIENCE_REGION_SYSTEM.md` - Query parameter information

## CMS Integration Patterns

### Module Registration System

**CRITICAL**: All Agility CMS components must be registered in `src/components/agility-components/index.ts`:

```typescript
// Import component
import { ComponentName } from "./ComponentName"

// Add to allModules array
const allModules = [
  { name: "ComponentName", module: ComponentName },
  // ... other modules
]

// getModule() function automatically finds and returns components
export const getModule = (moduleName: string) => {
  const obj = allModules.find(m => m.name.toLowerCase() === moduleName.toLowerCase())
  if (!obj) return NoComponentFound  // Fallback component for missing modules
  return obj.module
}
```

**Component Naming**: Module names are case-insensitive but should match exactly what's configured in Agility CMS.

### Standard Component Structure

```typescript
// All CMS components follow this pattern
export const ComponentName = async ({ module, languageCode }: UnloadedModuleProps) => {
  const { fields: { field1, field2 }, contentID } = await getContentItem<IComponentType>({
    contentID: module.contentid,
    languageCode,
  })

  return (
    <div data-agility-component={contentID}>
      <div data-agility-field="field1">{field1}</div>
    </div>
  )
}
```

**UnloadedModuleProps** includes:
- `module` - Module data from Agility (contains `contentid`)
- `languageCode` - Current locale (e.g., "en-us")
- `isDevelopmentMode` - Boolean for dev environment
- `isPreview` - Boolean for preview mode
- `globalData` - Shared data across modules (includes `searchParams`)

### Nested Content Fetching (Critical Pattern)

```typescript
// See BentoSection.tsx for complete example
const { fields: { nestedRef: { referencename } } } = await getContentItem<MainType>({
  contentID: module.contentid,
  languageCode,
})

// Get nested collection using the reference name
const nestedItems = await getContentList<NestedType>({
  referenceName: referencename,  // Key: use referencename from parent
  languageCode,
  take: 20
})
```

**IMPORTANT**: For nested grid/link fields, you must fetch separately using `referencename`. For search list box/dropdown/checkbox linked content, the SDK auto-populates the field - no separate fetch needed.

### Caching Strategy

- **Automatic**: All `getContentItem()`/`getContentList()` calls include Next.js cache tags
- **Cache Tags**: Format is `agility-content-{contentID|referenceName}-{locale}` (e.g., `agility-content-123-en-us`)
- **Revalidation**: 60-second cache + tag-based invalidation via `/api/revalidate`
- **Sitemap Caching**: Tags like `agility-sitemap-flat-{locale}` and `agility-sitemap-nested-{locale}`
- **Page Caching**: Tags like `agility-page-{pageID}-{locale}`
- **Environment**: Use `src/lib/env.ts` for strongly-typed env vars (never `process.env` directly)

**Revalidation API** (`/api/revalidate`):
- Receives webhook from Agility CMS on content publish
- Automatically revalidates content tags, page tags, and paths
- Handles content items, pages, and redirects
- Uses `revalidateTag()` and `revalidatePath()` from Next.js

### Image Handling with AgilityPic

**IMPORTANT:** Always use the `<AgilityPic>` component from `@agility/nextjs` for rendering images from Agility CMS. Never use Next.js `<Image>` or plain `<img>` tags for Agility images.

**Import:**
```typescript
import { AgilityPic } from "@agility/nextjs"
import type { ImageField } from "@agility/nextjs"
```

**Basic Usage:**
```typescript
<AgilityPic
  image={imageField}
  fallbackWidth={600}
  className="w-full h-auto rounded-2xl"
  data-agility-field="image" // For inline editing
/>
```

**Key Props:**
- `image` (required): The `ImageField` object from Agility CMS
- `fallbackWidth`: Width in pixels for the fallback `<img>` tag
- `alt`: Optional alt text override (uses CMS alt text by default)
- `className`: CSS classes applied to the `<img>` element
- `priority`: Set to `true` for above-the-fold images (loads eagerly)
- `sources`: Array of source definitions for responsive images with media queries

### Component Standards

- All components should accept `UnloadedModuleProps` with `module` and `languageCode`
- Add `data-agility-component={contentID}` to container elements
- Add `data-agility-field="fieldName"` to field containers for inline editing
- Always use `getContentItem()` for single content items
- Use `getContentList()` for collections and nested references

### Available Agility Components

- **RichTextArea** - Renders rich text content from CMS
- **BackgroundHero** - Hero section with background image
- **BentoSection** - Animated grid of cards with nested content (example of nested data fetching)
- **LogoStrip** - Display strip of logos
- **PersonalizedLogoStrip** - Audience/region-aware logo display
- **Header/Hero** - Site header and hero components
- **ContactUs** - Contact form components
- **TeamListing** - Team member display
- **BlogHeader** - Blog-specific header
- **CompanyStats** - Statistics display component
- **Testimonials** - Customer testimonial components
- **Pricing** - Pricing table components
- **Carousel** - Image/content carousel
- **PostListing/PostDetails** - Blog post components
- **ABTestHero** - A/B testing hero component

### Rich Text Rendering

**IMPORTANT**: Always use `renderHTML()` from `@agility/nextjs` for rendering HTML content:

```typescript
import { renderHTML } from "@agility/nextjs"

// In component
<div
  data-agility-field="textblob"
  data-agility-html
  className="prose dark:prose-invert"
  dangerouslySetInnerHTML={renderHTML(htmlField)}
/>
```

**Key Points**:
- Use `data-agility-html` attribute for inline editing support
- Apply Tailwind Typography classes (`prose`) for styled content
- Use `dark:prose-invert` for dark mode support
- `renderHTML()` sanitizes and processes Agility HTML content

### TypeScript Patterns

- Define interfaces for CMS content fields (e.g., `IBentoSection`, `IBentoCard`)
- Use `ContentItem<T>` type for typed content items (from `@agility/content-fetch`)
- Always type `ImageField` for Agility image fields (from `@agility/nextjs`)
- Field names are CASE-INSENSITIVE (e.g., 'Title' is the same as 'title')
- Use `IContentListResponse<T>` for content list responses

## Internationalization & Routing

**Middleware Flow** (`src/middleware.ts`):

1. **Preview Mode Detection**: Checks for `agilitypreviewkey` param → redirects to `/api/preview`
2. **Exit Preview**: Handles `AgilityPreview=0` → redirects to `/api/preview/exit`
3. **Dynamic Content**: Handles `ContentID` param → rewrites to `/api/dynamic-redirect`
4. **Redirects**: Checks bloom filter cache for redirects → redirects with appropriate status codes
5. **Locale Query Param**: Handles `?lang=xx` → redirects to locale-prefixed path
6. **Search Params Encoding**: Encodes query params as `path/~~~params~~~` for static optimization
7. **Locale Routing**: Rewrites to `/{locale}/path` (internal, default locale has no prefix)

**Locale Configuration** (`src/lib/i18n/config.ts`):
- Locales loaded from `AGILITY_LOCALES` env var (comma-separated)
- Default locale is first in the list
- Functions: `isValidLocale()`, `getLocaleFromPathname()`, `removeLocaleFromPathname()`

**Locale Strategy**:
- Default locale (no path prefix) + explicit locales (`/fr/`, `/es/`)
- URLs like `/blog` (default) vs `/fr/blog` (French)
- Internal routing always uses locale prefix, external URLs are clean

**Search Params Handling**:
- Middleware only processes whitelisted query parameters: `audience`, `region`, `q`
- Filters out tracking parameters (e.g., Google Analytics `_gl`, `_ga`, `_gcl_au`) to prevent crashes from long query strings
- Maximum query string length: 500 characters (prevents issues with extremely long tracking URLs)
- Middleware encodes: `/blog?q=test` → `/blog/~~~q=test~~~`
- Example: `/?audience=Enterprise&region=North%20America` → `/path/~~~audience=Enterprise&region=North%20America~~~`
- `getAgilityPage()` decodes search params from slug array
- Search params available in `globalData.searchParams` for all modules
- Tracking params are silently ignored and won't cause routing issues

## Styling System

**Tailwind CSS v4 Features**:

- `@import 'tailwindcss'` in `src/styles/tailwind.css`
- CSS custom properties for theming (light/dark mode)
- `clsx()` for conditional classes
- Motion library for animations with staggered delays

**Component Patterns**:

- Container components for consistent layouts
- `data-agility-*` attributes for CMS inline editing
- Mobile-first responsive design (`lg:` breakpoints)
- Dark mode support with `dark:` variants
- Animation delays for staggered effects

## Animation Implementation

- Use Motion library for animations
- Implement staggered delays for grid items
- Fade animations from specific directions
- Calculate delays based on item index for visual interest

## AI & Search Integration

**AI Search API** (`/api/ai/search`):

- Azure OpenAI + Algolia search tool integration
- Content from CMS configures system prompts and behavior
- Streaming responses with tool calling support
- Rate limiting and environment validation

**Search Tool Pattern**: Algolia index → AI context → Streamed responses

**AI Components**:
- `src/components/ai-agent/` - AI agent UI components (chat interface, messages)
- `src/components/ai-elements/` - AI-powered UI elements
- `src/components/ai-search/` - AI search interface components

**AI Agent Features**:
- Streaming chat interface with message history
- Default prompts support
- Markdown rendering for responses
- Syntax highlighting for code blocks

## Type Safety

**Environment Variables**: Strongly typed via `src/lib/env.ts` (throws at runtime if missing)

**Required Environment Variables**:
- `AGILITY_GUID` - Agility instance GUID
- `AGILITY_API_FETCH_KEY` - Production API key
- `AGILITY_API_PREVIEW_KEY` - Preview API key
- `AGILITY_SECURITY_KEY` - Security key for webhooks
- `AGILITY_LOCALES` - Comma-separated locales (e.g., "en-us,fr-ca,es-mx")
- `AGILITY_SITEMAP` - Sitemap channel name (default: "website")
- `AGILITY_FETCH_CACHE_DURATION` - Cache duration for fetches
- `AGILITY_PATH_REVALIDATE_DURATION` - Path revalidation duration
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL
- `NODE_ENV` - Environment (development/production/test)

**Usage Pattern**:
```typescript
import { env } from "@/lib/env"

// Direct access
const guid = env.AGILITY_GUID
const isDev = env.isDevelopment

// Or use getter
const apiKey = env.get('AGILITY_API_FETCH_KEY')
```

**CMS Content**: Define interfaces for all content types (e.g., `IBentoSection`, `IBentoCard`)
**Image Fields**: Always type as `ImageField` from Agility SDK

## Type Definitions

Key TypeScript interfaces are defined in `src/lib/types/`:

- `IPost.ts` - Blog post structure
- `IAuthor.ts` - Author information
- `ICategory.ts` - Content categories
- `ITag.ts` - Content tags
- `ICustomerProfile.ts` - Customer data
- `IAudience.ts` - Audience targeting
- `IRegion.ts` - Regional content
- `SitemapNode.ts` - Site navigation structure

## Key Debugging Commands

```bash
# View environment validation
node -e "console.log(require('./src/lib/env.ts').env.getAll())"

# Check redirect cache
npm run prebuild

# Test AI configuration
curl localhost:3000/api/ai/search -X POST -d '{"messages":[{"role":"user","content":"test"}]}'
```

## Audience & Region Personalization

**System Overview**: Personalization system for audience and region targeting using query parameters. **Note**: The current query parameter approach is implemented for testing purposes. In production, a system would detect the user's region and audience at the edge (via middleware or edge functions) and then rewrite to the appropriate version of the site using query strings, rather than requiring manual query parameter manipulation.

**Client Components** (`useAudienceRegionParams` hook):
```typescript
"use client"
import { useAudienceRegionParams } from '@/lib/hooks/useAudienceRegionParams'

const { selectedAudience, selectedRegion, setAudience, setRegion, clearAll } =
  useAudienceRegionParams(audiences, regions)
```

**Server Components**:
```typescript
import { getAudienceContentID, getRegionContentID } from '@/lib/utils/audienceRegionUtils'

const audienceContentID = await getAudienceContentID(searchParams, locale)
const regionContentID = await getRegionContentID(searchParams, locale)
```

**Conditional Content Rendering**:
```typescript
import { ConditionalContent } from '@/components/AudienceRegionUtils'

<ConditionalContent
  allowedAudiences={['Enterprise']}
  allowedRegions={['North America']}
>
  {/* Content only shown to Enterprise audience in North America */}
</ConditionalContent>
```

**Key Points**:
- **Testing vs Production**: Query parameters are used here for easy testing; production would detect audience/region at the edge and rewrite URLs with query strings automatically
- Audience names are normalized (lowercase, alphanumeric + dashes/underscores only)
- Parameters persist across navigation via URL
- Use `contentID` for filtering content in server components
- Components can read/write selections via hooks or utilities

## View Transitions

**Implementation**: React ViewTransition API for smooth page transitions (experimental in React 19).

**Usage**:
```typescript
import { unstable_ViewTransition as ViewTransition } from 'react'

<ViewTransition name={`post-image-${contentID}`}>
  <AgilityPic image={image} />
</ViewTransition>
```

**Configuration**: Enabled in `next.config.mjs` with `experimental: { viewTransition: true }`

**Browser Support**: Chrome 111+, Edge 111+, Safari 18+. Falls back gracefully in unsupported browsers.

**CSS**: Animations defined in `src/styles/view-transitions.css` (400ms duration, smooth easing)

## Common Gotchas

- **Preview Mode**: Requires `agilitypreviewkey` param, not just `AgilityPreview`
- **Nested Content**: Must use `referencename` field, not `contentid`
- **Caching**: Tags are auto-generated; manual cache invalidation via `/api/revalidate` webhook
- **Search Params**: Encoded in path for static optimization (`~~~params~~~`), decoded in `getAgilityPage()`
- **Styling**: Dark mode uses `@custom-variant dark (&:where(.dark, .dark *))` syntax
- **Images**: Always use `<AgilityPic>` for Agility images, never Next.js `<Image>`
- **Linked Content**: Grid/link fields need separate fetch; search list box/dropdown/checkbox are auto-populated
- **Module Registration**: Components must be added to `allModules` array in `index.ts` to work
- **Rich Text**: Always use `renderHTML()` from `@agility/nextjs`, never `dangerouslySetInnerHTML` directly
- **Locale**: Default locale has no path prefix, but internal routing always uses locale prefix
- **Preview Context**: `isDevelopmentMode` is true in dev, `isPreview` is true in draft mode or dev
- **SDK Initialization**: `getAgilitySDK()` automatically switches between preview/fetch keys based on mode

## API Routes

**Preview Route** (`/api/preview`):
- Validates `agilitypreviewkey` using `validatePreview()` from Agility SDK
- Enables Next.js draft mode via `draftMode().enable()`
- Handles dynamic page URLs via `getDynamicPageURL()`
- Redirects to localized preview URL with `?preview=1`

**Revalidate Route** (`/api/revalidate`):
- Receives webhook from Agility CMS on content publish
- Revalidates cache tags for content items, lists, pages, and sitemaps
- Revalidates paths for published content
- Handles redirect rebuilds via `BUILD_HOOK_URL` env var

**Dynamic Redirect Route** (`/api/dynamic-redirect`):
- Handles direct content ID access (e.g., `?ContentID=123`)
- Resolves to actual page URL via Agility sitemap

**Contact Route** (`/api/contact`):
- Handles contact form submissions
- Integrates with external services if needed

**Search Route** (`/api/search`):
- Provides search functionality (if implemented)

## Page Generation

**Static Generation** (`generateStaticParams`):
- Pre-renders all pages from Agility sitemap at build time
- Generates paths for all locales
- Filters out redirects and folders
- Uses cache tags for sitemap data

**Metadata Generation** (`generateMetadata`):
- Uses `resolveAgilityMetaData()` to generate SEO metadata
- Includes page title, description, OG tags, etc.
- Supports dynamic metadata from CMS

**Revalidation**: Pages revalidate every 60 seconds by default

## Prebuild Process

**Purpose**: Rebuilds redirect cache from bloom filters before production build.

**Command**: `npm run prebuild` (runs `tsx node/prebuild.ts`)

**Process**:
1. Loads environment variables from `.env.local`
2. Calls `rebuildRedirectCache()` to fetch redirects from Agility
3. Generates bloom filter for fast redirect lookups
4. Saves to `data/redirections-bloom-filter.json`

**Critical**: Must run before `npm run build` for redirects to work in production.

## Development Notes

- **Documentation Maintenance**: **Always update relevant documentation** when making code changes. See the "Documentation Maintenance" section above for details.
- **Leverage the Agility MCP Server**: When working with AI assistants, use the MCP server to query CMS schemas, create content models, and manage content directly
- **In-Site Documentation**: Remember that the `/docs` route is demo-site-specific and not part of a normal Agility CMS site. It documents this demo's architecture and implementation.
- Always check existing component patterns before creating new ones
- Use the established TypeScript interfaces for consistency
- Follow the Agility CMS SDK patterns for content fetching
- Reference Tailwind CSS v4 documentation at https://tailwindcss.com/docs
- Maintain accessibility standards with Heroicons and semantic HTML
- Test responsiveness with Tailwind's mobile-first approach
- Use `src/lib/env.ts` for all environment variable access (never `process.env` directly)
- Check `BentoSection.tsx` for nested content fetching examples
- Review `src/middleware.ts` for routing and preview logic
- Register new components in `src/components/agility-components/index.ts`
- Use `getAgilityContext()` to get locale, preview mode, and SDK config
- Use `getAgilityPage()` to fetch page data with search params support
- Check `RichTextArea.tsx` for HTML rendering patterns
- Review audience/region personalization in `PersonalizedBackgroundHero.tsx` and `PersonalizedLogoStrip.tsx`
- Use `ViewTransitionLink` component for smooth page transitions
- Always run `npm run prebuild` before production builds
