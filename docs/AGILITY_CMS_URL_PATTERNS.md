# Agility CMS URL Patterns

This document explains the URL structure for navigating the Agility CMS content manager interface.

## Base URL Pattern

```
https://app.agilitycms.com/instance/[instance-guid]/[locale-code]/section/[screen-stack]
```

**Example Base:**
```
https://app.agilitycms.com/instance/[instance-guid]/en-us
```

## URL Patterns by Section

### Content Section

#### Content List
View a content list (collection of content items).

**Pattern:**
```
/content/list-{container-id}
```

**Example:**
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/content/list-38
```

**Notes:**
- `container-id` is the ID of the content list container
- Different content models have different container IDs
- Container IDs are not the same as content model IDs

#### Content Item (within a list)
View or edit a specific content item.

**Pattern:**
```
/content/list-{container-id}/listitem-{content-id}
```

**Example:**
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/content/list-38/listitem-92
```

**Notes:**
- `container-id` is the parent list's container ID
- `content-id` is the specific content item's ID
- The content item is nested under its parent list

### Models Section

#### Content Model Definition
View or edit a content model definition.

**Pattern:**
```
/models/contentmodels/{content-model-id}
```

**Example:**
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/models/contentmodels/39
```

**Notes:**
- `content-model-id` is the content model's ID (not container ID)
- This shows the model definition, not the content items
- Example: Model ID 39 = "A/B Test Hero Item"

#### Component Model Definition
View or edit a component model definition.

**Pattern:**
```
/models/component-models/{component-model-id}
```

**Example:**
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/models/component-models/40
```

**Notes:**
- `component-model-id` is the component model's ID
- This shows the component definition, not component instances
- Example: Component ID 40 = "A/B Test Hero"

### Pages Section

#### Page View
View or edit a specific page.

**Pattern:**
```
/pages/page-{page-id}
```

**Example:**
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/pages/page-2
```

**Notes:**
- `page-id` is the page's ID from the sitemap
- Example: Page ID 2 = "Home" page

#### Component on a Page
View or edit a component instance on a specific page.

**Pattern:**
```
/pages/page-{page-id}/item-{container-id}
```

**Example:**
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/pages/page-2/item-75
```

**Notes:**
- `page-id` is the parent page's ID
- `container-id` is the component instance's container ID
- The component is nested under its parent page

## Common Sections

### Dashboard/Home
```
/home
```

### Content Overview
```
/content
```

### Pages Overview
```
/pages
```

### Sitemap
```
/pages/sitemap
```

### Components Overview
```
/components
```

### Assets/Media
```
/media/folder-0
```

**Notes:**
- Assets are organized in folders
- Default folder is `folder-0`
- URL pattern: `/media/folder-{folder-id}`

## ID Reference

### Content Model IDs (from Demo Site instance)

| Model Name | Model ID | Reference Name |
|------------|----------|----------------|
| A/B Test Hero Item | 39 | ABTestHeroItem |
| AI Search Configuration | 65 | AISearchConfiguration |
| Audience | 42 | Audience |
| Author | 8 | Author |
| Bento Card | 17 | BentoCard |
| Carousel Slide | 49 | carouselSlide |
| Category | 9 | Category |
| Customer Profile | 56 | CustomerProfile |
| FAQ Item | 26 | FAQItem |
| Footer | 20 | Footer |
| Footer Link | 21 | FooterLink |
| Footer Social Link | 22 | FooterSocialLink |
| Global Settings | 66 | globalsettings |
| Header | 15 | Header |
| Logo Item | 18 | LogoItem |
| Nav Link | 12 | NavLink |
| Personalized Hero Item | 60 | PersonalizedHeroItem |
| Post | 11 | Post |
| Pricing Tier | 29 | PricingTier |
| Region | 41 | Region |
| Stat | 38 | Stat |
| Tag | 10 | Tag |
| Testimonial Item | 32 | TestimonialItem |
| Top Level Nav | 13 | TopLevelNav |

### Component Model IDs (from Demo Site instance)

| Component Name | Component ID | Reference Name |
|----------------|--------------|----------------|
| A/B Test Hero | 40 | ABTestHero |
| Background Hero | 14 | BackgroundHero |
| Bento Section | 16 | BentoSection |
| Carousel | 50 | carousel |
| Company Stats | 37 | CompanyStats |
| Stats Strip | 73 | StatsStrip |
| Contact Us | 51 | ContactUs |
| Frequently Asked Questions | 27 | FrequentlyAskedQuestions |
| Header | 25 | Header |
| Hero | 34 | Hero |
| Logo Strip | 19 | LogoStrip |
| Personalized Background Hero | 61 | PersonalizedBackgroundHero |
| Personalized Logo Strip | 57 | PersonalizedLogoStrip |
| Post Details | 23 | PostDetails |
| Post Listing | 24 | PostListing |
| Pricing Cards | 30 | PricingCards |
| Pricing Table | 31 | PricingTable |
| Service Listing | 47 | ServiceListing |
| Team Listing | 36 | TeamListing |
| Testimonial | 28 | Testimonial |
| Testimonials | 33 | Testimonials |

### Page IDs (from Demo Site instance)

| Page Name | Page ID | URL Path |
|-----------|---------|----------|
| Home | 2 | /home |
| About Us | 3 | /about-us |
| Pricing | 4 | /pricing |
| Blog | 5 | /blog |
| Features | 6 | /features |
| Contact Us | 8 | /contact-us |

## Important Notes

1. **Container IDs vs Model IDs**: Container IDs (used in `/content/list-{id}`) are different from content model IDs. Container IDs represent the list container, while model IDs represent the model definition.

2. **Nested Structure**: Content items are nested under their lists, and components are nested under their pages. This reflects the hierarchical structure of the CMS.

3. **Locale**: Always include the locale code in the URL (e.g., `en-us`, `fr`).

4. **Instance GUID**: The instance GUID is required in all URLs.

## Usage Examples

### Navigate to Posts Content List
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/content/list-{posts-container-id}
```

### Navigate to a Specific Post
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/content/list-{posts-container-id}/listitem-{post-content-id}
```

### Navigate to Post Content Model Definition
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/models/contentmodels/11
```

### Navigate to Home Page
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/pages/page-2
```

### Navigate to a Component on Home Page
```
https://app.agilitycms.com/instance/[instance-guid]/en-us/pages/page-2/item-{component-container-id}
```

## Finding IDs

To find the correct IDs for your instance:

1. **Container IDs**: Navigate to the content list in the UI and check the URL
2. **Content IDs**: Click on a content item and check the URL
3. **Model IDs**: Use the Agility MCP Server `get_content_models` and `get_component_models` tools
4. **Page IDs**: Use the Agility MCP Server `get_sitemap` tool or check the sitemap URL

---

*This documentation describes URL patterns for Agility CMS instances. URL patterns may vary slightly between instances or Agility CMS versions.*

