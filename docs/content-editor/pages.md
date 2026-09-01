# Demo Site: Pages

This guide documents the page structure of the Demo Site. For generic information about pages, see [Generic Guide: Pages Basics](https://agilitycms.com/docs/training-guide/content-editor-pages-basics).

## Site Structure

The Demo Site has **7 main pages** organized in the sitemap:

### Main Pages

1. **Home** (`/`)
   - URL: `/` or `/home`
   - Page ID: 2
   - Components: BackgroundHero, BentoSection, Testimonials, CompanyStats

2. **About Us** (`/about-us`)
   - URL: `/about-us`
   - Page ID: 3
   - Components: Hero, TeamListing, BentoSection

3. **Pricing** (`/pricing`)
   - URL: `/pricing`
   - Page ID: 4
   - Components: Hero, PricingCards or PricingTable, FAQ

4. **Blog** (`/blog`)
   - URL: `/blog`
   - Page ID: 5
   - Components: PostListing

5. **Features** (`/features`)
   - URL: `/features`
   - Page ID: 6
   - Components: Hero, BentoSection, Testimonials

6. **Contact Us** (`/contact-us`)
   - URL: `/contact-us`
   - Page ID: 8
   - Components: Hero, ContactUs

### Dynamic Pages

7. **Post Details** (Dynamic)
   - URL Pattern: `/blog/{post-slug}`
   - Generated dynamically for each blog post
   - Components: PostDetails (auto-populated from Post content)

## Sitemap Structure

![Sitemap View](https://cdn.aglty.io/agility-cms-docs/images/training-guide/assets/screenshots/agility-cms/09-sitemap-view.png)

The sitemap organizes pages hierarchically:
- Home (root)
- About Us
- Pricing
- Blog
  - [Dynamic Post Pages]
- Features
- Contact Us

## Page Models

The Demo Site uses page models to define page structure:

- **Main Page Model**: Standard pages with content zones
- **Blog Post Model**: Dynamic pages for blog posts

## Internationalization

The Demo Site supports **2 locales**:

- **English (en-us)**: Default locale, no URL prefix
  - `/` (Home)
  - `/about-us`
  - `/blog`

- **French (fr)**: Secondary locale, with `/fr/` prefix
  - `/fr/` (Home)
  - `/fr/about-us`
  - `/fr/blog`

## Page Components by Page

### Home Page Components

- **BackgroundHero** or **PersonalizedBackgroundHero**: Main hero section
- **BentoSection**: Feature highlights
- **Testimonials**: Customer testimonials
- **CompanyStats**: Key metrics

### About Page Components

- **Hero**: Page header
- **TeamListing**: Team members
- **BentoSection**: Company features

### Pricing Page Components

- **Hero**: Page header
- **PricingCards** or **PricingTable**: Pricing information
- **FAQ**: Frequently asked questions

### Blog Listing Page Components

- **PostListing**: List of blog posts
  - Automatically displays Posts from the Posts content list
  - Supports category filtering

### Blog Post Detail Components

- **PostDetails**: Individual blog post
  - Auto-populated from Post content item
  - Displays post content, author, category, tags

### Features Page Components

- **Hero**: Page header
- **BentoSection**: Feature highlights
- **Testimonials**: Customer testimonials

### Contact Page Components

- **Hero**: Page header
- **ContactUs**: Contact form

## Editing Pages

For generic information about:
- Creating pages: See [Generic Guide: Pages Basics](https://agilitycms.com/docs/training-guide/content-editor-pages-basics)
- Editing pages: See [Generic Guide: Pages Basics](https://agilitycms.com/docs/training-guide/content-editor-pages-basics)
- Adding components: See [Generic Guide: Components](https://agilitycms.com/docs/training-guide/content-editor-components)

## URL Structure

- Main pages: `/page-name` (e.g., `/about-us`)
- Blog posts: `/blog/{post-slug}` (e.g., `/blog/my-first-post`)
- French pages: `/fr/page-name` (e.g., `/fr/about-us`)

---

**Next**: [Common Tasks](./common-tasks.md) - Demo Site-specific workflows

