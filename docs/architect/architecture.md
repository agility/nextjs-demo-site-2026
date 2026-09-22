# Demo Site: Architecture

This guide documents the overall architecture of the Demo Site, including technology stack, project structure, and architectural decisions.

## Technology Stack

### Frontend Framework

- **Next.js**: 16.3.5 with App Router
- **React**: 19.3.0
- **TypeScript**: Full type safety
- **Turbopack**: Development server

### Styling

- **Tailwind CSS**: v4 (CSS-file based, no config file)
- **Motion**: 12.23.0 (Framer Motion alternative)
- **Heroicons**: v2
- **React Icons**: Icon library

### CMS Integration

- **Agility CMS**: @agility/nextjs 16.0.8
- **Content Fetch**: @agility/content-fetch 2.0.9
- **Custom Caching**: Cache Components (`"use cache"` + cacheTag/cacheLife)

### Additional Features

- **AI Search**: Azure OpenAI + Algolia
- **Analytics**: PostHog integration
- **A/B Testing**: PostHog feature flags
- **Internationalization**: Multi-locale support

## Project Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   └── api/               # API routes
├── components/
│   ├── agility-components/ # 20 Agility components
│   ├── header/            # Header components
│   ├── footer/            # Footer components
│   └── ai-agent/          # AI search components
├── lib/
│   ├── cms/               # CMS API functions
│   ├── cms-content/        # Content processing
│   ├── ai/                # AI integration
│   └── types/             # TypeScript definitions
└── proxy.ts                      # Next 16 proxy (was middleware.ts)
```

## Integration Architecture

### CMS Integration

**SDK Initialization:**
- Automatic preview mode detection
- Environment-based API key selection
- Cache configuration

**Content Fetching:**
- Type-safe content access
- Automatic caching with tags
- Preview mode support

### AI Integration

**AI Search:**
- Azure OpenAI integration
- Algolia search tool
- Streaming responses
- CMS-configured prompts

### Analytics Integration

**PostHog:**
- Feature flags for A/B testing
- Analytics tracking
- Server-side evaluation

## Performance Architecture

### Caching Strategy — Cache Components

- **Partial Prerendering**: every route is a static shell with request-time parts streamed in (`cacheComponents: true`)
- **Cached reads**: `"use cache"` + `cacheTag(...)` + `cacheLife("days")` on each Agility primitive
- **Preview reads**: bypass the cache entirely via `await connection()`
- **Webhook Revalidation**: `/api/revalidate` calls `revalidateTag(tag, "max")` on publish, so long TTLs cost nothing and publishing is instant
- **Static Generation**: `generateStaticParams` pre-renders every sitemap path at build time

### CDN Strategy

- **Edge cache headers**: set in `src/proxy.ts`, not `next.config` — the proxy can see the draft cookie, so draft renders get `private, no-store` and never reach a shared cache
- **Assets**: Delivered via Agility CDN
- **Image Optimization**: Automatic resizing
- **Global Delivery**: Edge locations worldwide

## Scalability Architecture

### Content Scalability

- **Pagination**: Content lists support pagination
- **Filtering**: Efficient query filtering
- **Caching**: Multi-layer caching

### Performance Scalability

- **Static Generation**: Pre-render pages
- **Incremental Regeneration**: Update on-demand
- **CDN Delivery**: Global asset delivery

### Multi-Locale Scalability

- **Locale-Specific Content**: Separate instances per locale
- **Efficient Routing**: Locale-based routing
- **Fallback Strategy**: Fallback to default locale

---

**Next**: [Content Architecture](./content-architecture.md) - Content model design

