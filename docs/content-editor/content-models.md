# Demo Site: Content Models

This guide documents all content models available in the Demo Site instance. For generic information about content models, see [Generic Guide: Content Basics](https://agilitycms.com/docs/training-guide/content-editor-content-basics).

## Content Model Overview

The Demo Site has **24 content models** organized into different categories:

- **6 Content Items** (single instances)
- **18 Content Lists** (collections of items)

## Blog Content Models

### Posts (Content List)

![Posts Content List](https://cdn.aglty.io/agility-cms-docs/images/training-guide/assets/screenshots/agility-cms/03-content-posts-list.png)

**Purpose**: Individual blog posts

**Fields:**
- Heading
- Slug (URL-friendly identifier)
- Post Date
- Content (rich text)
- Featured Image
- Category (linked to Category content item)
- Author (linked to Author content item)
- Tags (multiple linked to Tag items)

**Use Cases:**
- Blog articles
- News updates
- Case studies

### Authors (Content List)

![Authors Content List](https://cdn.aglty.io/agility-cms-docs/images/training-guide/assets/screenshots/agility-cms/04-content-authors-list.png)

**Purpose**: Blog post authors

**Fields:**
- Name
- Headshot Image

**Use Cases:**
- Author profiles
- Linked to blog posts

### Categories (Content List)

![Categories Content List](https://cdn.aglty.io/agility-cms-docs/images/training-guide/assets/screenshots/agility-cms/05-content-categories-list.png)

**Purpose**: Blog post categories

**Fields:**
- Name

**Use Cases:**
- Organizing blog posts by topic
- Filtering blog listings

### Tags (Content List)

**Purpose**: Blog post tags for additional organization

**Fields:**
- Name

**Use Cases:**
- Tagging posts with keywords
- Additional filtering and organization

## Personalization Content Models

### Audiences (Content List)

**Purpose**: Target audience segments for content personalization

**Fields:**
- Name
- Description
- Icon Image

**Use Cases:**
- Audience-based content targeting
- Personalization features

### Regions (Content List)

**Purpose**: Geographic regions for content targeting

**Fields:**
- Name
- Description

**Use Cases:**
- Region-based content targeting
- Localization features

### Customer Profiles (Content List)

**Purpose**: Customer data for personalization

**Fields:**
- Various customer profile fields

**Use Cases:**
- Customer segmentation
- Personalized experiences

## Component Content Models

### Bento Cards (Content List)

![Bento Cards List](https://cdn.aglty.io/agility-cms-docs/images/training-guide/assets/screenshots/agility-cms/06-content-bento-cards-list.png)

**Purpose**: Cards used in Bento sections

**Fields:**
- Title
- Description
- Image
- Link

**Use Cases:**
- Displayed in BentoSection components
- Feature highlights
- Service cards

### Testimonials (Content List)

![Testimonials List](https://cdn.aglty.io/agility-cms-docs/images/training-guide/assets/screenshots/agility-cms/07-content-testimonials-list.png)

**Purpose**: Customer testimonials

**Fields:**
- Customer Name
- Quote
- Image
- Company/Title

**Use Cases:**
- Displayed in Testimonials components
- Social proof
- Customer reviews

## Other Content Models

### FAQ Items (Content List)

**Purpose**: Frequently asked questions

**Fields:**
- Question
- Answer

**Use Cases:**
- Displayed in FAQ components
- Help sections

### Pricing Tiers (Content List)

**Purpose**: Pricing information

**Fields:**
- Tier Name
- Price
- Features
- CTA

**Use Cases:**
- Displayed in Pricing components
- Pricing pages

### Stats (Content List)

**Purpose**: Statistics and metrics

**Fields:**
- Number
- Label
- Icon

**Use Cases:**
- Displayed in Company Stats components
- Metrics and KPIs

### Carousel Slides (Content Item)

**Purpose**: Individual carousel slide content

**Fields:**
- Image
- Caption
- Link

**Use Cases:**
- Displayed in Carousel components
- Image galleries

### Global Settings (Content Item)

**Purpose**: Site-wide settings

**Fields:**
- Site name
- Contact information
- Social links
- Footer content

**Use Cases:**
- Global configuration
- Reusable across site

### AI Search Configuration (Content Item)

**Purpose**: AI search settings

**Fields:**
- Search configuration
- AI settings

**Use Cases:**
- AI-powered search functionality

### Personalized Hero Item (Content Item)

**Purpose**: Hero content for personalization

**Fields:**
- Heading
- Description
- Image
- CTA
- Audience/Region targeting

**Use Cases:**
- Personalized hero sections
- Audience-specific content

## Navigation Content Models

### Header (Content Item)

**Purpose**: Site header/navigation

**Fields:**
- Logo
- Navigation links
- CTA buttons

**Use Cases:**
- Site header
- Main navigation

### Footer (Content Item)

**Purpose**: Site footer

**Fields:**
- Footer links
- Social links
- Copyright

**Use Cases:**
- Site footer
- Footer navigation

### Nav Links (Content List)

**Purpose**: Navigation link items

**Fields:**
- Label
- URL
- Order

**Use Cases:**
- Header navigation
- Footer navigation

## Content Model Relationships

### Blog Relationships

- **Post → Author**: Many posts to one author
- **Post → Category**: Many posts to one category
- **Post → Tags**: Many posts to many tags

### Component Relationships

- **BentoSection → BentoCards**: One section to many cards
- **Testimonials Component → Testimonial Items**: One component to many testimonials
- **Pricing Component → Pricing Tiers**: One component to many tiers

## Working with Content Models

For generic information about:
- Creating content items: See [Generic Guide: Content Basics](https://agilitycms.com/docs/training-guide/content-editor-content-basics)
- Editing content items: See [Generic Guide: Content Basics](https://agilitycms.com/docs/training-guide/content-editor-content-basics)
- Linking content: See [Generic Guide: Components](https://agilitycms.com/docs/training-guide/content-editor-components)

---

**Next**: [Components](./components.md) - Available components in Demo Site

