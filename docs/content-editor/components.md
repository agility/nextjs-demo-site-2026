# Demo Site: Components

This guide documents all components available in the Demo Site instance. For generic information about components, see [Generic Guide: Components](https://agilitycms.com/docs/training-guide/content-editor-components).

## Component Overview

The Demo Site has **20 component definitions** organized into categories:

- **Content Display** (4 components)
- **Hero Variants** (4 components)
- **Interactive** (3 components)
- **Layout** (3 components)
- **Data Display** (3 components)
- **Navigation** (1 component)

## Content Display Components

### Post Listing

**Purpose**: Display a list of blog posts

**Fields:**
- Category filter (optional)
- Pagination settings
- Display options

**Use Cases:**
- Blog listing pages
- Category-specific post listings
- Featured posts sections

**Linked Content:**
- Automatically displays Posts from the Posts content list
- Can filter by Category

### Post Details

**Purpose**: Display individual blog post content

**Fields:**
- Auto-populated from Post content item
- Display options

**Use Cases:**
- Individual blog post pages
- Post detail views

**Linked Content:**
- Automatically linked to Post content item via URL

### Testimonials

**Purpose**: Display customer testimonials

**Fields:**
- Heading
- Subheading
- Display options

**Linked Content:**
- Links to multiple Testimonial content items

**Use Cases:**
- Testimonial sections on pages
- Social proof displays

### Team Listing

**Purpose**: Display team members

**Fields:**
- Heading
- Display options

**Linked Content:**
- Links to team member content items

**Use Cases:**
- About page team sections
- Team member displays

## Hero Components

### Hero

**Purpose**: Standard hero section

**Fields:**
- Heading
- Description
- Image
- CTA Button

**Use Cases:**
- Page hero sections
- Landing page headers

### Background Hero

**Purpose**: Hero section with background image

**Fields:**
- Heading
- Description
- Background Image
- CTA Button
- Overlay options

**Use Cases:**
- Full-width hero sections
- Image background heroes

### A/B Test Hero

**Purpose**: Hero section with A/B testing support

**Fields:**
- Variant A content
- Variant B content
- Experiment key
- Display logic

**Use Cases:**
- A/B testing experiments
- Variant testing

### Personalized Background Hero

**Purpose**: Hero section with audience/region personalization

**Fields:**
- Default content
- Audience-specific content
- Region-specific content
- Targeting rules

**Use Cases:**
- Personalized hero sections
- Audience-targeted content

## Interactive Components

### Carousel

**Purpose**: Image/content carousel

**Fields:**
- Carousel settings
- Display options

**Linked Content:**
- Links to Carousel Slide content items

**Use Cases:**
- Image carousels
- Featured content sliders

### Contact Us

**Purpose**: Contact form

**Fields:**
- Form fields configuration
- Submission settings
- Success message

**Use Cases:**
- Contact pages
- Lead generation forms

### Frequently Asked Questions

**Purpose**: FAQ display

**Fields:**
- Heading
- Display options

**Linked Content:**
- Links to FAQ Item content items

**Use Cases:**
- FAQ sections
- Help pages

## Layout Components

### Bento Section

**Purpose**: Animated grid of cards

**Fields:**
- Heading
- Subheading
- Display options

**Linked Content:**
- Links to Bento Card content items

**Use Cases:**
- Feature grids
- Service displays
- Card layouts

### Logo Strip

**Purpose**: Display strip of logos

**Fields:**
- Heading
- Display options

**Linked Content:**
- Links to Logo Item content items

**Use Cases:**
- Client logos
- Partner displays

### Personalized Logo Strip

**Purpose**: Audience/region-aware logo display

**Fields:**
- Default logos
- Audience-specific logos
- Region-specific logos

**Linked Content:**
- Links to Logo Item content items with targeting

**Use Cases:**
- Personalized logo displays
- Region-specific partners

## Data Display Components

### Company Stats

**Purpose**: Statistics and metrics display

**Fields:**
- Heading
- Display options

**Linked Content:**
- Links to Stat content items

**Use Cases:**
- Metrics displays
- KPI sections

### Pricing Cards

**Purpose**: Pricing information cards

**Fields:**
- Heading
- Display options

**Linked Content:**
- Links to Pricing Tier content items

**Use Cases:**
- Pricing pages
- Pricing comparisons

### Pricing Table

**Purpose**: Detailed pricing table

**Fields:**
- Heading
- Table configuration

**Linked Content:**
- Links to Pricing Tier content items

**Use Cases:**
- Detailed pricing displays
- Feature comparisons

## Navigation Components

### Header

**Purpose**: Site header/navigation

**Fields:**
- Logo
- Navigation configuration
- CTA buttons

**Linked Content:**
- Links to Header content item
- Links to Nav Link items

**Use Cases:**
- Site header
- Main navigation

## Component Usage Patterns

### Common Combinations

**Homepage Pattern:**
- BackgroundHero or PersonalizedBackgroundHero
- BentoSection
- Testimonials
- CompanyStats

**Blog Pattern:**
- PostListing (for blog listing page)
- PostDetails (for individual posts)

**Pricing Page Pattern:**
- Hero or BackgroundHero
- PricingCards or PricingTable
- FAQ

## Working with Components

For generic information about:
- Adding components to pages: See [Generic Guide: Components](https://agilitycms.com/docs/training-guide/content-editor-components)
- Editing components: See [Generic Guide: Components](https://agilitycms.com/docs/training-guide/content-editor-components)
- Linking content to components: See [Generic Guide: Components](https://agilitycms.com/docs/training-guide/content-editor-components)

---

**Next**: [Pages](./pages.md) - Site structure and page organization

