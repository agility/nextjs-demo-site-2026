# Developer Documentation

Codebase-specific documentation for developers working with this Next.js application.

## 🎯 Get This Reference Implementation

This is a fully-featured reference implementation showcasing Agility CMS capabilities. To get your own copy of this solution:

**[Contact our sales team](https://agilitycms.com/contact-us/get-a-demo)** and we'll clone this solution for you and help you get set up with a POC (Proof of Concept).

Our team will:
- Clone the complete solution to your environment
- Set up your Agility CMS instance with the content models
- Help you configure the necessary integrations
- Guide you through the setup process

---

## Codebase Guide

- **[Codebase Overview](./codebase/README.md)** - Project structure, components, and implementation details
  - [Project Structure](./codebase/project-structure.md) - Codebase organization
  - [Content Models](./codebase/content-models.md) - Content model implementations
  - [Components](./codebase/components.md) - Component implementations
  - [API Routes](./codebase/api-routes.md) - Custom API routes
  - [Deployment](./codebase/deployment.md) - Deployment configuration

## Technical Documentation

- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Strongly typed environment configuration
- **[Multi-Locale Implementation](./MULTI_LOCALE_IMPLEMENTATION.md)** - Internationalization setup and routing
- **[Audience & Region System](./AUDIENCE_REGION_SYSTEM.md)** - Personalization system (query parameters for testing; edge-based detection in production)
- **[View Transitions](./VIEW_TRANSITIONS.md)** - Page transition implementation using React's ViewTransition API

## Analytics Documentation

- **[Analytics Integration Guide](./ANALYTICS_INTEGRATION.md)** - Platform-agnostic analytics architecture with PostHog implementation
- **[Analytics Dashboard Reference](./ANALYTICS_DASHBOARD.md)** - PostHog dashboard insights and event reference
- **[A/B Testing Guide](./AB_TESTING.md)** - Client-side A/B testing with PostHog Experiments

## Quick Links

- **Official Agility CMS Docs**: [https://agilitycms.com/docs](https://agilitycms.com/docs)
- **Official Developer Training**: [https://agilitycms.com/docs/training-guide](https://agilitycms.com/docs/training-guide)
- **Demo Site**: [https://demo.agilitycms.com/](https://demo.agilitycms.com/)

## Technology Stack

- **Framework**: Next.js 15.5.3 with App Router
- **React**: 19.1.0
- **TypeScript**: Full type safety
- **Styling**: Tailwind CSS v4
- **CMS**: Agility CMS (@agility/nextjs 15.0.7)
- **Animations**: Motion (Framer Motion alternative)
- **AI**: Azure OpenAI + Algolia integration
- **Analytics**: PostHog integration

---

*For generic Agility CMS development concepts, see the [official training guide](https://agilitycms.com/docs/training-guide)*
