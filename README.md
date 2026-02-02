# Agility CMS Next.js Demo Site

> Modern headless CMS website with AI-powered search, internationalization, and advanced caching

A production-ready Next.js demo site showcasing Agility CMS integration with React 19, TypeScript, Tailwind CSS v4, and AI-powered search capabilities.

## 🎯 Get This Reference Implementation

This is a fully-featured reference implementation showcasing Agility CMS capabilities. To get your own copy of this solution:

**[Contact our sales team](https://agilitycms.com/contact-us/get-a-demo)** and we'll clone this solution for you and help you get set up with a POC (Proof of Concept).

Our team will:
- Clone the complete solution to your environment
- Set up your Agility CMS instance with the content models
- Help you configure the necessary integrations
- Guide you through the setup process

---

## ✨ Features

- **Headless CMS Integration** - Full Agility CMS integration with dynamic page routing
- **AI-Powered Search** - Azure OpenAI + Algolia integration for intelligent content search
- **Internationalization** - Multi-locale support with clean URL routing
- **Advanced Caching** - Next.js cache tags with automatic revalidation
- **Preview Mode** - Draft content preview with Agility CMS integration
- **Audience & Region Personalization** - URL-based personalization system
- **View Transitions** - Smooth page transitions using React ViewTransition API
- **Type Safety** - Strongly-typed environment variables and CMS content
- **Modern Stack** - Next.js 15.5.3, React 19, Tailwind CSS v4, TypeScript

## 🤖 For AI Coding Assistants

This project includes comprehensive instructions for AI coding assistants. **See [`AGENTS.md`](AGENTS.md)** for complete development guidelines, architecture patterns, CMS integration details, and coding conventions.

The `AGENTS.md` file provides:
- Complete project architecture and patterns
- Agility CMS integration guidelines
- Component conventions and standards
- TypeScript patterns and type definitions
- Development workflows and best practices
- Common gotchas and debugging tips

Supported AI assistants: Cursor, GitHub Copilot, Windsurf, Claude Code, OpenAI Codex, and Google Jules.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Agility CMS instance (get one at [agilitycms.com](https://agilitycms.com))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd demosite2025

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Agility CMS credentials
```

### Environment Variables

Create a `.env.local` file with the following required variables:

```env
# Agility CMS Configuration
AGILITY_GUID=your-instance-guid
AGILITY_API_FETCH_KEY=your-fetch-api-key
AGILITY_API_PREVIEW_KEY=your-preview-api-key
AGILITY_SECURITY_KEY=your-security-key
AGILITY_LOCALES=en-us,fr-ca,es-mx
AGILITY_SITEMAP=website
AGILITY_FETCH_CACHE_DURATION=60
AGILITY_PATH_REVALIDATE_DURATION=60

# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Node Environment
NODE_ENV=development

# Build Hook (Optional - for redirect rebuilds)
BUILD_HOOK_URL=https://your-build-hook-url
```

### Development

```bash
# Start development server with Turbopack
npm run dev

# Run prebuild (rebuilds redirect cache - required before production build)
npm run prebuild

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

**⚠️ Important**: Always run `npm run prebuild` before `npm run build` to rebuild the redirect cache.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   └── [...slug]/     # Dynamic page routes
│   └── api/               # API routes
│       ├── ai/            # AI search endpoints
│       ├── preview/       # Preview mode handling
│       ├── revalidate/    # Cache revalidation webhook
│       └── dynamic-redirect/ # Content ID redirects
├── components/
│   ├── agility-components/ # CMS-connected components
│   ├── agility-pages/      # Page templates
│   ├── ai-agent/          # AI chat interface
│   ├── ai-elements/       # AI-powered UI elements
│   ├── ai-search/         # AI search components
│   ├── header/            # Navigation components
│   └── footer/            # Footer components
├── lib/
│   ├── cms/               # Agility CMS SDK wrappers
│   ├── cms-content/       # Content processing utilities
│   ├── ai/                # AI integration utilities
│   ├── posthog/           # Analytics integration
│   ├── hooks/             # React hooks
│   ├── i18n/              # Internationalization config
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
└── public/                # Static assets
```

## 🏗️ Architecture

### Headless CMS Pattern

Content managed in Agility CMS → API fetching → Next.js rendering

- **Page Routing**: Dynamic via Agility's sitemap
- **Content Zones**: `<ContentZone name="main-content-zone">` renders CMS modules
- **Module System**: Components auto-registered via `getModule()` function

### Key File Relationships

- `src/middleware.ts` → Handles preview, redirects, i18n routing
- `src/lib/cms/` → All CMS API abstractions with caching
- `src/components/agility-components/` → CMS-bound components

## 🎨 Technology Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS v4 (CSS-file based)
- **CMS**: Agility CMS (@agility/nextjs 15.0.7)
- **Animations**: Motion 12.23.0
- **AI**: Azure OpenAI + Algolia
- **Analytics**: PostHog
- **Icons**: Heroicons v2, React Icons

## 📝 Key Concepts

### CMS Component Registration

All Agility CMS components must be registered in `src/components/agility-components/index.ts`:

```typescript
import { ComponentName } from "./ComponentName"

const allModules = [
  { name: "ComponentName", module: ComponentName },
  // ... other modules
]
```

### Standard Component Pattern

```typescript
export const ComponentName = async ({ module, languageCode }: UnloadedModuleProps) => {
  const { fields, contentID } = await getContentItem<IComponentType>({
    contentID: module.contentid,
    languageCode,
  })

  return (
    <div data-agility-component={contentID}>
      <div data-agility-field="fieldName">{fields.fieldName}</div>
    </div>
  )
}
```

### Nested Content Fetching

```typescript
// Get parent content with nested reference
const { fields: { nestedRef: { referencename } } } = await getContentItem<MainType>({
  contentID: module.contentid,
  languageCode,
})

// Fetch nested collection separately
const nestedItems = await getContentList<NestedType>({
  referenceName: referencename,
  languageCode,
  take: 20
})
```

### Image Handling

Always use `<AgilityPic>` for Agility CMS images:

```typescript
import { AgilityPic } from "@agility/nextjs"

<AgilityPic
  image={imageField}
  fallbackWidth={600}
  className="w-full h-auto"
  data-agility-field="image"
/>
```

### Rich Text Rendering

Use `renderHTML()` from Agility SDK:

```typescript
import { renderHTML } from "@agility/nextjs"

<div
  data-agility-field="textblob"
  data-agility-html
  className="prose dark:prose-invert"
  dangerouslySetInnerHTML={renderHTML(htmlField)}
/>
```

## 🌍 Internationalization

The site supports multiple locales with clean URL routing:

- **Default Locale**: No path prefix (e.g., `/blog`)
- **Other Locales**: Explicit prefix (e.g., `/fr/blog`, `/es/blog`)

Locales are configured via `AGILITY_LOCALES` environment variable (comma-separated).

## 🎯 Audience & Region Personalization

URL-based personalization system using query parameters:

```typescript
// Client component
const { selectedAudience, setAudience } = useAudienceRegionParams(audiences, regions)

// Server component
const audienceContentID = await getAudienceContentID(searchParams, locale)
```

## 🔄 Caching & Revalidation

- **Automatic Cache Tags**: All CMS fetches include Next.js cache tags
- **Tag Format**: `agility-content-{contentID|referenceName}-{locale}`
- **Revalidation**: 60-second cache + tag-based invalidation
- **Webhook**: `/api/revalidate` receives Agility CMS publish events

## 🔍 AI Search

AI-powered search using Azure OpenAI and Algolia:

- **Endpoint**: `/api/ai/search`
- **Features**: Streaming responses, tool calling, rate limiting
- **Components**: Chat interface, message history, markdown rendering

## 🚢 Deployment

### Pre-build Steps

1. Set all required environment variables
2. Run `npm run prebuild` to rebuild redirect cache
3. Run `npm run build` for production build

### Environment-Specific Notes

- **Preview Mode**: Automatically enabled in development
- **Redirects**: Bloom filter cache must be rebuilt before production
- **Cache Revalidation**: Configure webhook in Agility CMS to point to `/api/revalidate`

## 📚 Documentation

### In-Site Documentation (`/docs`)

**⚠️ Important**: This demo site includes an in-site documentation system accessible at `/docs`. This is **specific to this demo site** and is **not part of a normal Agility CMS site**. It's included here to document:

- Demo site architecture and implementation patterns
- Instance-specific Agility CMS configuration
- Codebase structure and developer guides
- Content editor workflows for this specific demo

The documentation is built using MDX routing with markdown files in the `docs/` folder. It includes:
- **Admin Guides** - Instance configuration, content models, components, workflows
- **Architect Guides** - Site architecture, component design, content architecture, integrations
- **Content Editor Guides** - Common tasks, components, content models, pages
- **Developer Guides** - Codebase structure, environment variables, multi-locale setup, personalization, view transitions

**Note**: For generic Agility CMS training and documentation, see the [Official Agility CMS Training Guide](https://agilitycms.com/docs/training-guide).

### Quick Reference
- [AI Agent Instructions](AGENTS.md) - Comprehensive development guidelines (single source of truth)
- [Cursor Rules](.cursorrules) - Cursor-specific file (references AGENTS.md)
- [Copilot Instructions](.github/copilot-instructions.md) - GitHub Copilot-specific file (references AGENTS.md)
- [Windsurf Rules](.windsurf/rules/project.md) - Windsurf-specific file (references AGENTS.md)
- [Claude Context](CLAUDE.md) - Stub file pointing to AGENTS.md

### Full Documentation
- **[📖 In-Site Documentation](https://demo.agilitycms.com/docs)** - Complete documentation guide (demo site specific)
- **[📖 Documentation Index](docs/README.md)** - Documentation source files

**Developer Docs:**
- [Codebase Guide](docs/developer/codebase/README.md) - Project structure and implementation
- [Environment Variables](docs/developer/ENVIRONMENT_VARIABLES.md) - Strongly typed env configuration
- [Multi-Locale Implementation](docs/developer/MULTI_LOCALE_IMPLEMENTATION.md) - i18n setup and routing
- [Audience & Region System](docs/developer/AUDIENCE_REGION_SYSTEM.md) - Personalization system
- [View Transitions](docs/developer/VIEW_TRANSITIONS.md) - Page transition implementation

**Agility CMS Training:**
- [Content Editor Guide](docs/content-editor/README.md) - Creating and managing content
- [Administrator Guide](docs/admin/README.md) - Instance configuration
- [Architect Guide](docs/architect/README.md) - Architecture decisions
- [URL Patterns](docs/AGILITY_CMS_URL_PATTERNS.md) - Agility CMS interface URLs

**External Resources:**
- [Official Agility CMS Docs](https://agilitycms.com/docs) - Agility CMS documentation
- [Official Training Guide](https://agilitycms.com/docs/training-guide) - Generic Agility CMS training

## 🐛 Common Issues

### Preview Mode Not Working
- Ensure `agilitypreviewkey` param is present (not just `AgilityPreview`)
- Check that `AGILITY_API_PREVIEW_KEY` is set correctly

### Redirects Not Working
- Run `npm run prebuild` before building
- Check that `data/redirections-bloom-filter.json` exists

### Components Not Rendering
- Verify component is registered in `src/components/agility-components/index.ts`
- Check that component name matches Agility CMS module name (case-insensitive)

### Cache Not Updating
- Verify webhook is configured in Agility CMS
- Check `/api/revalidate` endpoint is accessible
- Ensure `AGILITY_SECURITY_KEY` matches webhook configuration

## 🤝 Contributing

1. Follow existing code patterns and conventions
2. Register new components in `index.ts`
3. Use TypeScript for all new code
4. Follow Tailwind CSS v4 patterns
5. Add proper TypeScript interfaces for CMS content
6. Test with multiple locales if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Agility CMS Documentation](https://agilitycms.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React 19](https://react.dev)

## 🌐 Live Demo

- **Production Site**: [demo.agilitycms.com](https://demo.agilitycms.com)
- **GitHub Repository**: [github.com/agility/nextjs-demo-site-2025](https://github.com/agility/nextjs-demo-site-2025)

---

Built with ❤️ using [Agility CMS](https://agilitycms.com) and [Next.js](https://nextjs.org)
