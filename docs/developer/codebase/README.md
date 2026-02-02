# Demo Site: Developer Guide

> **Website**: https://demo.agilitycms.com/

This guide provides codebase-specific information for developers working with this Next.js application. For generic Agility CMS development concepts, see the [official Agility CMS Training Guide](https://agilitycms.com/docs/training-guide).

## 🎯 Get This Reference Implementation

This is a fully-featured reference implementation showcasing Agility CMS capabilities. To get your own copy of this solution:

**[Contact our sales team](https://agilitycms.com/contact-us/get-a-demo)** and we'll clone this solution for you and help you get set up with a POC (Proof of Concept).

Our team will:
- Clone the complete solution to your environment
- Set up your Agility CMS instance with the content models
- Help you configure the necessary integrations
- Guide you through the setup process

---

## Demo Site Overview

The Demo Site is a comprehensive Next.js application powered by Agility CMS, showcasing modern headless CMS patterns, AI-powered search, internationalization, and advanced caching.

### Technology Stack

- **Framework**: Next.js 15.5.3 with App Router
- **React**: 19.1.0
- **TypeScript**: Full type safety
- **Styling**: Tailwind CSS v4
- **CMS**: Agility CMS (@agility/nextjs 15.0.7)
- **Animations**: Motion (Framer Motion alternative)
- **AI**: Azure OpenAI + Algolia integration
- **Analytics**: PostHog integration

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   └── api/               # API routes (ai, preview, revalidate)
├── components/
│   ├── agility-components/ # Agility CMS components (20 components)
│   ├── header/            # Header components
│   ├── footer/            # Footer components
│   ├── ai-agent/          # AI search components
│   └── ...
├── lib/
│   ├── cms/               # CMS API functions
│   ├── cms-content/        # Content processing utilities
│   ├── ai/                # AI integration
│   ├── posthog/           # Analytics integration
│   └── types/             # TypeScript definitions
└── middleware.ts          # Next.js middleware
```

## Quick Links

- [Project Structure](./project-structure.md) - Codebase organization
- [Content Models](./content-models.md) - Content model implementations
- [Components](./components.md) - Component implementations
- [API Routes](./api-routes.md) - Custom API routes
- [Deployment](./deployment.md) - Deployment configuration

## Getting Started

1. **Review Generic Training**: Start with the [official Agility CMS Training Guide](https://agilitycms.com/docs/training-guide)
2. **Understand Project Structure**: Review [Project Structure](./project-structure.md)
3. **Learn Content Models**: See [Content Models](./content-models.md)
4. **Study Components**: Review [Components](./components.md)

---

**Next**: [Project Structure](./project-structure.md) - Codebase organization

