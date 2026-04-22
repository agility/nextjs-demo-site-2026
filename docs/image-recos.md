# Image Best Practices for Agility CMS

This guide covers recommendations for uploading and managing images in Agility CMS for optimal performance and quality. It is split into two parts:

- **[For Content Editors](#for-content-editors)** — what formats, sizes, and dimensions to upload
- **[For Developers](#for-developers)** — how to render images efficiently in code

Code examples use Next.js, but the same principles apply to other frameworks. The `AgilityPic` component is also available in the [Blazor starter](https://github.com/agility/agilitycms-dotnet-starter/blob/main/Agility.NET.Blazor.Starter/Components/Shared/AgilityPic.razor) with similar functionality.

## TL;DR

| Rule                | Recommendation                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------ |
| **Format**          | JPG for photos, PNG for screenshots/transparency                                           |
| **Never upload**    | WebP or AVIF                                                                               |
| **What matters**    | Pixel dimensions and compression, not DPI                                                  |
| **Dimensions**      | 2x the display container size                                                              |
| **Component**       | Use `AgilityPic` (renders `<picture>` with sources, routes transforms through Agility CDN) |
| **High-DPI**        | Use `min-resolution: 2dppx` media queries in `sources`                                     |
| **Mobile fallback** | Set `fallbackWidth` prop                                                                   |

---

## For Content Editors

This section covers what you need to know when uploading images to Agility CMS. No coding knowledge required.

## Source Image Requirements

### Start with High-Quality Source Images

Your website's image optimization pipeline relies on having high-quality source images to work with. When you upload a good source image, the system automatically resizes and converts it for each visitor's device and browser — you just need to provide the best starting point.

### Recommended File Formats

| Format       | Use For                               | Upload?                                                         |
| ------------ | ------------------------------------- | --------------------------------------------------------------- |
| **JPG/JPEG** | Photos                                | ✅ Yes                                                          |
| **PNG**      | Screenshots, images with transparency | ✅ Yes                                                          |
| **WebP**     | N/A                                   | ⛔ No                                                           |
| **AVIF**     | N/A                                   | ⛔ No                                                           |
| **SVG**      | Icons, logos, simple graphics         | ✅ Yes (passed through as-is, no resizing or format conversion) |

**Simple rule:**

- **Photos** → JPG
- **Screenshots or transparency** → PNG

### Do NOT Upload WebP or AVIF Files

**This is critical**: Do not upload WebP or AVIF files to Agility CMS, especially if you are using a Next.js website - but it's true of any framework.

**Why?** When you upload a WebP or AVIF file and it gets processed downstream (by the Agility CDN or Next.js Image optimization), the image undergoes double compression. These formats are already lossy-compressed, and re-compressing them causes:

- Visible quality degradation and artifacts
- Larger file sizes than expected (compression algorithms struggle with pre-compressed data)
- Unpredictable visual results

**The correct approach**: Upload high-quality JPG or PNG source files and let the CDN handle format conversion automatically using the `format=auto` parameter. This ensures browsers receive the optimal format (WebP, AVIF, or original) without double compression.

**Exception**: You may upload WebP/AVIF only if you are certain the image will not be processed or transformed downstream. This is rare in most Agility CMS implementations.

## Image Dimensions

### Does the image need to match the container exactly?

No. You should upload images larger than the container size. The optimization pipeline will resize images as needed.

**Best practice**: Upload images at **2x the resolution** of the image container to support 4K and Retina displays. These high-density displays have more pixels per inch, and using 2x resolution ensures images appear crisp rather than blurry.

For example:

- Hero banner displays at 1920px wide → upload at 3840px wide
- Thumbnail displays at 400px wide → upload at 800px wide
- Content image displays at 600px wide → upload at 1200px wide

### Recommended Source Dimensions by Use Case

| Image Type        | Display Size | Upload At (2x) |
| ----------------- | ------------ | -------------- |
| Hero/Banner       | 1920px       | 3840px         |
| Content images    | 1200px       | 2400px         |
| Thumbnails        | 400px        | 800px          |
| Icons             | 128px or SVG | 256px or SVG   |
| Background images | 1920px       | 3840px         |

If you want your images to be used in multiple places (eg: if the image is shared across multiple components or items), then it should be uploaded with maximum size needed anywhere it's used.

### A Note on DPI

**DPI does not matter for web images.** Browsers render images based on pixel dimensions, not DPI metadata. A 1000x1000px image at 72 DPI and the same image at 300 DPI will look identical on screen and produce the same file size — the DPI number in the metadata is ignored.

What actually determines image quality and file size on the web:

- **Pixel dimensions** (width x height) — this is what you should focus on
- **Compression settings** (JPEG quality level, etc.)
- **Format choice** (JPG, PNG, etc.)

The old advice to "use 72 DPI" comes from early Mac displays that were roughly 72 pixels per inch. Modern screens range from ~96 PPI to 3x or 4x density, and none of them read the DPI metadata.

**Watch out for inflated exports:** The practical danger of high DPI settings is that design tools like Photoshop may scale pixel dimensions up to match. For example, exporting a 1920px design at 300 DPI instead of 72 DPI can produce an 8000px-wide file — far larger than needed and wasteful to upload. When exporting, always verify the **pixel dimensions** match what you intend (2x display size), regardless of what the DPI field says.

## File Size Guidelines

While the optimization pipeline compresses images automatically, starting with reasonably sized source files speeds up uploads and processing.

These targets assume you are uploading at 2x dimensions as recommended above. A high-quality 3840px-wide JPG will naturally be larger than a 1920px version — that is expected.

| Image Type        | Ideal Source Size | Maximum Source Size |
| ----------------- | ----------------- | ------------------- |
| Hero/Banner       | 400 KB - 1 MB     | 2 MB                |
| Content images    | 200-500 KB        | 1 MB                |
| Icons             | < 20 KB           | 50 KB               |
| Background images | 400 KB - 1 MB     | 2 MB                |

**How large is too large?**

Files over 5 MB should be avoided. They slow down uploads, increase processing time, and rarely provide quality benefits over smaller optimized files.

---

## For Developers

This section covers how to render Agility CMS images in your code for optimal performance. Examples use Next.js, but the concepts apply to any framework with an AgilityPic component.

## Ensuring format=auto on All Image Sources

**All images served from Agility CMS should include the `format=auto` parameter.** This tells the CDN to automatically serve the optimal format based on browser support (AVIF/WebP where supported, or the original format as fallback).

### Why This Matters

Without `format=auto`, images are served in their original format regardless of browser capabilities. This means:

- Users receive larger JPG/PNG files even when their browser supports WebP
- You miss out on significant file size savings of 30-60%
- Page performance suffers unnecessarily

### How format=auto Works

When you append `?format=auto` to an Agility CDN image URL:

```
# Original URL
https://cdn.agilitycms.com/your-instance/media/images/hero.jpg

# With format=auto
https://cdn.agilitycms.com/your-instance/media/images/hero.jpg?format=auto
```

The CDN inspects the browser's `Accept` header and returns:

- **WebP** if the browser supports it
- **AVIF** if the browser supports it (and it's enabled)
- **Original format** as fallback

### How format=auto Gets Applied in Practice

`format=auto` should be applied automatically at the component level — editors should never need to add it manually.

- **Image fields** — Use `AgilityPic` (or `AgilityImage`). Both append `format=auto` to all generated URLs automatically. See [Using the AgilityPic Component](#using-the-agilitypic-component) for details.
- **Rich content fields** (HTML, Markdown, Block Editor) — Post-process the rendered output to add `format=auto` to embedded `<img>` tags. See [Processing Images in Rich Content](#processing-images-in-rich-content-html-markdown-block-editor) below.

### Audit Existing Content

Review your codebase to ensure:

1. **All image components** use AgilityPic or apply `format=auto`
2. **Rich text/HTML fields** are pre-processed before rendering
3. **Custom image implementations** include the format parameter
4. **No hardcoded image URLs** bypass the optimization pipeline

## Processing Images in Rich Content (HTML, Markdown, Block Editor)

Images rendered through `AgilityPic` get `format=auto` and lazy loading automatically. However, images embedded inside rich content fields — HTML (Rich Text Editor), Markdown, or Block Editor content — are **not processed by default**. These images are rendered as raw `<img>` tags, which means they bypass the optimization pipeline entirely.

This is a common gap. If your site has rich content fields with embedded images, you should post-process the rendered output before displaying it.

### What to Post-Process

For every `<img>` tag in rich content output:

1. **Add `format=auto`** to image URLs (if not already present)
2. **Add `w` (width)** to cap the image at a sensible maximum — without this, a 3840px source image gets served at full size even if the content area is only 800px wide. Set this based on your content layout (e.g., `1200` for a typical content column, `1920` for full-width)
3. **Add `loading="lazy"`** to images that don't have a `loading` attribute set

### Example: HTML / Rich Text Fields

Use a library like [cheerio](https://cheerio.js.org/) to parse and transform the HTML before rendering. The `maxWidth` parameter should match the maximum width images can appear at in your content area:

```typescript
import * as cheerio from 'cheerio'

export const renderHTMLCustom = (html: string | null | undefined, maxWidth: number = 1200) => {
  if (!html) return { __html: '' }

  let str = html

  try {
    const $ = cheerio.load(str)
    $('img').each((_, element) => {
      const src = $(element).attr('src')

      if (src) {
        try {
          const parsed = new URL(src)

          // Add format=auto if not already present
          if (!parsed.searchParams.has('format')) {
            parsed.searchParams.set('format', 'auto')
          }

          // Cap width to avoid serving oversized images
          if (!parsed.searchParams.has('w')) {
            parsed.searchParams.set('w', String(maxWidth))
          }

          $(element).attr('src', parsed.toString())
        } catch {
          // Not a valid absolute URL, skip
        }
      }

      // Enable lazy loading if not explicitly set
      if (!$(element).attr('loading')) {
        $(element).attr('loading', 'lazy')
      }
    })

    str = $.html()
  } catch (error) {
    console.error('Error parsing HTML in renderHTMLCustom', error)
  }

  return { __html: str }
}
```

Then use it in your component, setting `maxWidth` to match your layout:

```tsx
// Content area is ~800px wide
<div dangerouslySetInnerHTML={renderHTMLCustom(fields.content, 800)} />

// Full-width layout
<div dangerouslySetInnerHTML={renderHTMLCustom(fields.content, 1920)} />
```

### Advanced: Responsive Images in Rich Content

The example above serves a single image size to all devices. For better page speed scores — especially on mobile — you can replace each `<img>` with a `<picture>` element that serves a smaller image on mobile and a larger one on desktop, just like `AgilityPic` does for image fields.

```typescript
// Replace <img> with <picture> for responsive rich content images
$('img').each((_, element) => {
  const src = $(element).attr('src')
  if (!src) return

  try {
    const parsed = new URL(src)
    parsed.searchParams.set('format', 'auto')

    // Build sources for different breakpoints
    const desktop = new URL(parsed)
    desktop.searchParams.set('w', String(maxWidth))

    const mobile = new URL(parsed)
    mobile.searchParams.set('w', String(Math.round(maxWidth / 2)))

    const picture = `<picture>
      <source media="(min-width: 640px)" srcset="${desktop.toString()}" />
      <img src="${mobile.toString()}" alt="${$(element).attr('alt') || ''}" loading="lazy" class="${$(element).attr('class') || ''}" />
    </picture>`

    $(element).replaceWith(picture)
  } catch {
    // Not a valid absolute URL, skip
  }
})
```

This is more work to implement, but it means mobile users download a smaller image while desktop users still get the full-width version.

### Markdown and Block Editor Content

The same principle applies — after converting Markdown or Block Editor JSON to HTML, run the output through a similar post-processor before rendering. The implementation will vary by framework and Markdown library, but the logic is the same: find `<img>` tags and add `format=auto` and a `w` parameter to cap the width.

### Why This Matters

Without post-processing, images inside rich content fields are served in their original format at their full source dimensions. A 3840px-wide hero image pasted into a blog post gets delivered at 3840px even though the content column is 800px wide. On a content-heavy site, this can mean dozens of oversized, unoptimized images per page — negating the performance gains you get from using `AgilityPic` elsewhere.

## Using the AgilityPic Component

The `AgilityPic` component renders a native HTML `<picture>` element with `<source>` tags and a fallback `<img>`. It does **not** use `next/image` — instead, it builds image URLs directly using the Agility Image API, appending `?format=auto&w=...` to each source.

> **Note:** If you need `next/image` features (e.g., blur placeholder, priority preload) for Agility CMS images, use `AgilityImage` instead — it wraps `next/image` with a custom loader that routes transforms through the Agility CDN. For non-Agility images, use `next/image` directly.

**How it handles `format=auto`:** AgilityPic automatically appends `format=auto` to all image URLs it generates — both for each `<source>` and the fallback `<img>`. You do not need to add query parameters manually. Every image rendered through AgilityPic gets automatic format negotiation (WebP, AVIF, or original) with no extra work.

**Why use AgilityPic:**

- **Native `<picture>` element** — no client component requirement, no JavaScript overhead
- **Agility CDN handles transformations** (not your web server's CPU)
- **Automatic `format=auto`** on all generated URLs
- **Won't upscale** — if you request a width larger than the source image, it caps at the source width
- **Responsive source selection** via the `sources` array with media queries
- **High-DPI support** via media queries with `min-resolution`

### Props Overview

| Prop            | Description                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| `image`         | Agility CMS image object (from ImageAttachment field)                                |
| `fallbackWidth` | Width for mobile/default fallback image                                              |
| `sources`       | Array of responsive breakpoints with media queries                                   |
| `priority`      | If `true`, sets `loading="eager"` on the fallback `<img>`. Defaults to lazy loading. |
| `className`     | CSS classes for the fallback `<img>` (inherited by sources)                          |
| `alt`           | Override alt text (defaults to `image.label`)                                        |

### Basic Usage

```tsx
import { AgilityPic } from '@agility/nextjs'
;<AgilityPic
  image={fields.image}
  className="h-full w-full object-cover"
  fallbackWidth={640}
/>
```

### Responsive Images with High-DPI Support

Use the `sources` array to serve different image sizes based on screen width and pixel density. This ensures:

- Mobile devices get smaller images (faster loading)
- Desktop gets appropriately sized images
- High-DPI displays (Retina, 4K) get 2x resolution images

**Example: Hero/Banner Image**

```tsx
<AgilityPic
  image={fields.heroImage}
  className="h-full w-full object-cover"
  fallbackWidth={640}
  sources={[
    // Desktop - high DPI first (more specific)
    { media: '(min-width: 1280px) and (min-resolution: 2dppx)', width: 2400 },
    { media: '(min-width: 1280px)', width: 1200 },
    // Tablet - high DPI
    { media: '(min-width: 640px) and (min-resolution: 2dppx)', width: 1600 },
    { media: '(min-width: 640px)', width: 800 },
    // Mobile - high DPI
    { media: '(max-width: 639px) and (min-resolution: 2dppx)', width: 1280 },
    { media: '(max-width: 639px)', width: 640 },
  ]}
/>
```

**Example: Content Image**

```tsx
<AgilityPic
  image={fields.image}
  className="h-full w-full object-cover"
  fallbackWidth={400}
  sources={[
    // Desktop - high DPI
    { media: '(min-width: 1280px) and (min-resolution: 2dppx)', width: 1600 },
    { media: '(min-width: 1280px)', width: 800 },
    // Tablet - high DPI
    { media: '(min-width: 640px) and (min-resolution: 2dppx)', width: 1200 },
    { media: '(min-width: 640px)', width: 600 },
  ]}
/>
```

**Example: Thumbnail**

```tsx
<AgilityPic
  image={fields.thumbnail}
  className="h-full w-full object-cover"
  fallbackWidth={200}
  sources={[
    // Tablet+ - high DPI
    { media: '(min-width: 640px) and (min-resolution: 2dppx)', width: 600 },
    { media: '(min-width: 640px)', width: 300 },
  ]}
/>
```

### Media Query Order

**Important**: Always place high-DPI queries (more specific) before standard queries. The browser uses the first matching media query, so more specific rules must come first.

```tsx
// ✅ Correct - high DPI first
sources={[
  { media: "(min-width: 1280px) and (min-resolution: 2dppx)", width: 2400 },
  { media: "(min-width: 1280px)", width: 1200 },
]}

// ❌ Wrong - standard query would always match first
sources={[
  { media: "(min-width: 1280px)", width: 1200 },
  { media: "(min-width: 1280px) and (min-resolution: 2dppx)", width: 2400 },
]}
```

### Common Breakpoints

These breakpoints align with Tailwind CSS defaults:

| Breakpoint         | Screen Width | Typical Use         |
| ------------------ | ------------ | ------------------- |
| Mobile             | < 640px      | `max-width: 639px`  |
| Tablet (sm)        | ≥ 640px      | `min-width: 640px`  |
| Desktop (lg)       | ≥ 1024px     | `min-width: 1024px` |
| Large Desktop (xl) | ≥ 1280px     | `min-width: 1280px` |

### Lazy Loading

AgilityPic defaults to `loading="lazy"` on the fallback `<img>`, so images below the fold are lazy-loaded automatically with no extra configuration.

For above-the-fold images (like hero banners), set `priority` to load them eagerly:

```tsx
<AgilityPic image={fields.heroImage} fallbackWidth={640} priority />
```

## AgilityPic vs AgilityImage vs next/image

| Component               | What it renders                   | Transforms via  | Use when                                                                  |
| ----------------------- | --------------------------------- | --------------- | ------------------------------------------------------------------------- |
| **AgilityPic**          | `<picture>` with `<source>` tags  | Agility CDN     | You want full control over responsive sources and media queries           |
| **AgilityImage**        | `next/image` with a custom loader | Agility CDN     | You need `next/image` features (blur placeholder, priority preload, etc.) |
| **next/image** (direct) | `next/image` with default loader  | Your web server | Non-Agility images only                                                   |

**Prefer `AgilityPic`** for Agility CMS images. It gives you explicit control over what sizes are served at which breakpoints, uses the native `<picture>` element, and doesn't require a client component.

**Use `AgilityImage`** if you need specific `next/image` features. It wraps `next/image` with a loader that routes through the Agility CDN, so transforms still happen on the CDN rather than your server.

**Avoid raw `next/image`** for Agility images — transforms happen on your web server, there's no automatic cache invalidation, and you have to handle `format=auto` manually.

## CMS Field Validation

Agility CMS allows you to enforce image guidelines through field validation on your Content Models and Components.

### Available Validations

- **File Size**: Set minimum/maximum file size limits
- **Image Width**: Set minimum/maximum width requirements
- **Image Height**: Set minimum/maximum height requirements
- **Valid File Types**: Restrict to specific formats (e.g., `*.jpg,*.jpeg,*.png`)
- **Alt Text Required**: Enforce accessibility compliance

### Setting Up Validation

1. Navigate to **Models** in Agility CMS
2. Select your Content Model or Component
3. Add or edit an Image Field
4. Click **Field Properties**
5. Configure your validation rules
6. Add a custom validation message to guide editors

### Example Validation Settings

For a Hero Banner field:

- File Size: Max 2 MB
- Image Width: Min 1920px
- Valid File Types: `*.jpg,*.jpeg,*.png` (do NOT include WebP or AVIF)
- Require Alt Text: Yes
- Validation Message: "Please upload a high-resolution image (minimum 1920px wide, max 2MB) in JPG or PNG format. Do not upload WebP or AVIF files."

## Quick Reference Checklist

Before uploading an image, verify:

- [ ] Format is correct: JPG for photos, PNG for screenshots or transparency
- [ ] NOT WebP or AVIF
- [ ] Pixel dimensions are correct (not inflated by a high DPI export setting)
- [ ] Dimensions are 2x the display container size (for 4K/Retina support)
- [ ] File size is under the recommended maximum for its type
- [ ] Alt text is prepared for accessibility
- [ ] Image is not stretched or distorted

For your codebase, verify:

- [ ] All image components use `AgilityPic` (not raw `<img>` tags or Next.js Image)
- [ ] `AgilityPic` includes `sources` array for responsive sizing
- [ ] High-DPI media queries are listed before standard queries
- [ ] `fallbackWidth` is set for mobile default
- [ ] Above-the-fold images use `priority` prop (AgilityPic lazy-loads by default)
- [ ] Rich text, Markdown, and Block Editor content is post-processed for `format=auto` and `loading="lazy"`

## Troubleshooting

### Images appear blurry

- Source image dimensions are too small
- Upload a larger source image (2x display size recommended)

### Images load slowly

- Source file size is too large
- Optimize the source image before uploading (use tools like ImageOptim, TinyPNG)
- Verify `format=auto` is being applied to URLs

### Images have visible artifacts or look over-compressed

- Source file may be WebP or AVIF (double compression)
- Replace with original JPG or PNG source file
- Check if multiple optimization passes are occurring

### Images not updating after changes in CMS

- If using Next.js Image component directly, images may be cached
- Use AgilityPic component for automatic cache invalidation
- Clear your CDN cache if using a custom CDN layer

### format=auto not working

- Verify the URL includes the parameter: `?format=auto` or `&format=auto`
- Check browser DevTools Network tab to confirm the response content-type
- Ensure the image is served from the Agility CDN (cdn.agilitycms.com)

## Additional Resources

- [Using the AgilityPic Component for Responsive Images](/docs/nextjs/using-the-agilitypic-component-for-responsive-images)
- [Field Types for Content and Modules](/docs/developers/fields)
- [Next.js Image Optimization Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/images)
