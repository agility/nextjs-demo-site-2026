# Demo Site: Content Editor Guide

> **Website**: https://demo.agilitycms.com/

This guide provides instance-specific information for content editors working with the Demo Site. For generic Agility CMS concepts and workflows, see the [official Agility CMS Training Guide](https://agilitycms.com/docs/training-guide).

## Demo Site Overview

The Demo Site is a comprehensive Next.js application powered by Agility CMS, showcasing modern headless CMS patterns, AI-powered search, internationalization, and advanced caching.

### Content Architecture

- **24 content models** total
  - **6 Content Items**: Author, Category, Carousel Slide, Global Settings, AI Search Configuration, Personalized Hero Item
  - **18 Content Lists**: Posts, Tags, Bento Cards, Testimonials, FAQ Items, Pricing Tiers, Stats, Audiences, Regions, Customer Profiles, and more

### Component Library

- **21 component definitions** covering:
  - **Content Display**: Post Listing, Post Details, Testimonials, Team Listing
  - **Hero Variants**: Hero, Background Hero, A/B Test Hero, Personalized Background Hero
  - **Interactive**: Carousel, Contact Us, Frequently Asked Questions
  - **Layout**: Bento Section, Logo Strip, Personalized Logo Strip
  - **Data Display**: Company Stats, Pricing Cards, Pricing Table

### Site Structure

- **7 main pages** in sitemap:
  - Home, About Us, Pricing, Blog, Features, Contact Us
  - Dynamic Post Details page for individual blog posts

### Internationalization

- **2 locales** configured:
  - **English (en-us)** - Default locale (no URL prefix)
  - **French (fr)** - Secondary locale (with `/fr/` prefix)

### Key Features

- **AI-Powered Search**: Azure OpenAI + Algolia integration
- **Personalization**: Audience and region-based content targeting (query parameters for testing; edge-based detection in production)
- **A/B Testing**: PostHog feature flags integration
- **Analytics**: PostHog tracking
- **Performance**: Advanced caching with Next.js App Router

## Quick Links

- [Content Models](./content-models.md) - All 24 content models available in Demo Site
- [Components](./components.md) - All 21 components and their use cases
- [Pages](./pages.md) - Site structure and page organization
- [Common Tasks](./common-tasks.md) - Demo Site-specific workflows

## Getting Started

1. **Review Generic Training**: Start with the [official Agility CMS Training Guide](https://agilitycms.com/docs/training-guide) to understand Agility CMS concepts
2. **Learn Demo Site Structure**: Review this guide to understand what content models and components are available
3. **Practice Common Tasks**: Follow the [Common Tasks](./common-tasks.md) guide for hands-on practice

---

**Next**: [Content Models](./content-models.md) - Available content models in Demo Site

