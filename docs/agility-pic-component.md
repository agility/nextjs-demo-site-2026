# Using the AgilityPic Component for Responsive Images

The `AgilityPic` component from `@agility/nextjs` provides a powerful, declarative way to render responsive images using the native HTML `<picture>` element combined with Agility CMS's image transformation API.

## Why Use AgilityPic Instead of Next.js Image?

The Next.js `<Image />` component performs image transformation compute on your **web server**, which has some drawbacks:

- **Server load**: Image processing happens on your server, consuming CPU and memory
- **Cache invalidation**: Transformed images are not automatically invalidated when the source image changes in Agility CMS
- **No CDN optimization**: You miss out on Agility's edge-cached, globally distributed image transformations

The `AgilityPic` component leverages Agility CMS's image transformation API, which:

- Processes images at the CDN edge, close to your users
- Automatically invalidates when images are updated in the CMS
- Supports modern formats like WebP and AVIF via `format=auto`
- Provides consistent, predictable image URLs

## Image Upload Best Practices

For optimal image quality across all devices, follow these guidelines:

### Resolution and DPI

**Upload images at 72 DPI and twice the maximum display width.**

For example, if an image will display at a maximum of 600px wide:
- Upload the image at **1200px wide**
- This ensures high-DPI screens (Retina displays, modern phones) show crisp, high-quality images
- The `AgilityPic` component will serve appropriately sized versions to each device

### Why 2x Width?

Modern devices have pixel densities of 2x or higher. A 600px container on a Retina display actually renders 1200 physical pixels. By uploading at 2x, you ensure:
- Sharp images on high-DPI screens
- No pixelation or blurriness
- Professional-quality appearance

## Basic Usage

The simplest usage requires only an image and a fallback width:

```tsx
import { AgilityPic } from "@agility/nextjs"

<AgilityPic
  image={image}
  fallbackWidth={400}
  className="w-full h-auto rounded-2xl"
  sources={[
    { media: "(min-width: 1024px)", width: 800 },
    { media: "(min-width: 640px)", width: 600 },
    { media: "(max-width: 639px)", width: 500 },
  ]}
/>
```

The `fallbackWidth` serves two purposes:
1. Provides a small, fast-loading image for browsers that don't support `<picture>`
2. Acts as the default image size when no `sources` match

**Important: The `fallbackWidth` determines your Lighthouse/PageSpeed score.** Mobile performance tools like Google Lighthouse use the fallback image when calculating page speed metrics. Keep `fallbackWidth` small (400-600px) to ensure optimal scores and fast load times for mobile users on slow networks (3G).

The `sources` array then provides appropriately sized images for users on larger screens, ensuring they get the best quality for their device without penalizing your mobile performance metrics.

## Responsive Images with Sources

For full responsive control, use the `sources` prop to define different image sizes for different viewport widths:

```tsx
<AgilityPic
  image={image}
  fallbackWidth={400}
  className="w-full h-full object-cover"
  sources={[
    { media: "(min-width: 1280px)", width: 1200 },
    { media: "(min-width: 640px)", width: 800 },
    { media: "(max-width: 639px)", width: 640 },
  ]}
/>
```

The browser evaluates sources from top to bottom and uses the first match. This example:
- Serves 1200px images on large screens (1280px+)
- Serves 800px images on tablets (640px-1279px)
- Serves 640px images on mobile (under 639px)

## Real-World Examples

### Hero Image

For a hero that spans full width on desktop but needs a fast mobile fallback:

```tsx
<AgilityPic
  image={image}
  fallbackWidth={600}
  className="w-full h-auto rounded-2xl shadow-2xl"
  sources={[
    { media: "(min-width: 1280px)", width: 1200 },
    { media: "(min-width: 768px)", width: 900 },
    { media: "(max-width: 767px)", width: 700 },
  ]}
/>
```

### Blog Post Cards

For a card that displays in different layouts:

```tsx
<AgilityPic
  image={post.image}
  fallbackWidth={400}
  className="absolute inset-0 w-full h-full object-cover"
  sources={[
    { media: "(max-width: 639px)", width: 640 },
    { media: "(max-width: 767px)", width: 800 },
    { media: "(max-width: 1023px)", width: 1200 },
  ]}
/>
```

### Carousel Slides

For a full-width carousel with different sizes per breakpoint:

```tsx
<AgilityPic
  image={image}
  className="w-full h-full object-cover"
  fallbackWidth={400}
  sources={[
    { media: "(min-width: 1280px)", width: 1200 },
    { media: "(min-width: 640px)", width: 800 },
    { media: "(max-width: 639px)", width: 640 },
  ]}
/>
```

### Background Image with Specific Dimensions

When you need both width and height (for art-directed cropping):

```tsx
<AgilityPic
  image={backgroundImage}
  alt={backgroundImage.label || "Background"}
  fallbackWidth={1425}
  sources={[
    {
      media: "(max-width: 640px)",
      width: 640,
      height: 224,
    },
    {
      media: "(max-width: 1024px)",
      width: 1024,
      height: 400,
    },
    {
      media: "(min-width: 1024px)",
      width: 1425,
      height: 800,
    },
  ]}
  className="h-56 w-full object-cover lg:h-full lg:w-1/2"
/>
```

### Small Thumbnails

For avatars and small images, keep sizes minimal:

```tsx
<AgilityPic
  image={author.headShot}
  fallbackWidth={64}
  className="size-12 rounded-full object-cover"
  sources={[
    { media: "(min-width: 768px)", width: 96 },
    { media: "(max-width: 767px)", width: 64 },
  ]}
/>
```

### High-DPI (Retina) Support with srcSet

For the best quality on high-DPI screens, you can provide multiple resolutions using srcSet syntax. This example serves 2x images to Retina displays:

```tsx
import type { ImageField } from "@agility/nextjs"

interface Props {
  image: ImageField
  className?: string
}

export function RetinaImage({ image, className }: Props) {
  const baseUrl = image.url

  return (
    <picture>
      {/* Desktop: 600px display, serve 1200px for 2x screens */}
      <source
        media="(min-width: 1024px)"
        srcSet={`
          ${baseUrl}?format=auto&w=600 1x,
          ${baseUrl}?format=auto&w=1200 2x
        `}
      />

      {/* Tablet: 500px display, serve 1000px for 2x screens */}
      <source
        media="(min-width: 640px)"
        srcSet={`
          ${baseUrl}?format=auto&w=500 1x,
          ${baseUrl}?format=auto&w=1000 2x
        `}
      />

      {/* Mobile: 400px display, serve 800px for 2x screens */}
      <source
        media="(max-width: 639px)"
        srcSet={`
          ${baseUrl}?format=auto&w=400 1x,
          ${baseUrl}?format=auto&w=800 2x
        `}
      />

      {/* Fallback for older browsers */}
      <img
        src={`${baseUrl}?format=auto&w=400`}
        alt={image.label}
        loading="lazy"
        className={className}
      />
    </picture>
  )
}
```

**How this works:**
- The `1x` and `2x` descriptors tell the browser which image to use based on device pixel ratio
- A Retina MacBook (2x) viewing at the 1024px+ breakpoint will request the 1200px image
- A standard display at the same breakpoint will request the 600px image
- This ensures crisp images on high-DPI screens without wasting bandwidth on standard displays

## Component Props

| Prop | Type | Description |
|------|------|-------------|
| `image` | `ImageField` | Required. The image object from Agility CMS |
| `fallbackWidth` | `number` | Optional. Width for the fallback `<img>` tag. Keep small for mobile performance |
| `alt` | `string` | Optional. Override the alt text from Agility |
| `sources` | `SourceProps[]` | Optional. Array of source configurations for responsive images |
| `priority` | `boolean` | Optional. If true, loads image eagerly instead of lazy |
| `className` | `string` | Optional. CSS classes applied to the `<img>` element |

### Source Props

Each source object can include:

| Prop | Type | Description |
|------|------|-------------|
| `media` | `string` | CSS media query (e.g., `"(min-width: 768px)"`) |
| `width` | `number` | Desired image width |
| `height` | `number` | Optional. Desired image height (enables cropping) |

## How It Works

The component generates URLs using Agility's image transformation API:

```
https://cdn.agilitycms.com/your-image.jpg?format=auto&w=800
```

- `format=auto` automatically serves WebP or AVIF based on browser support
- `w=800` resizes the image to 800px wide
- Adding `h=600` would crop to 800x600

The component also respects the original image dimensions—it won't upscale an image beyond its original size.

## Handling Focal Points with Different Aspect Ratios

When the same image needs to display in different aspect ratios (e.g., rectangular on desktop, square on mobile), and the image has a focal point set in Agility CMS, the `AgilityPic` component may not handle this automatically.

**The issue**: Focal points work when both `width` and `height` are specified in the transformation URL. The crop then centers on the focal point rather than the image center. However, if you need different aspect ratios at different breakpoints, each source needs its own width/height combination.

**The solution**: Create a manual `<picture>` tag with explicit sources for each aspect ratio:

```tsx
import type { ImageField } from "@agility/nextjs"

interface Props {
  image: ImageField
  className?: string
}

export function ResponsiveAspectImage({ image, className }: Props) {
  const baseUrl = image.url

  return (
    <picture>
      {/* Square aspect ratio for mobile - focal point will be respected */}
      <source
        media="(max-width: 639px)"
        srcSet={`${baseUrl}?format=auto&w=640&h=640`}
      />

      {/* 16:9 aspect ratio for tablet */}
      <source
        media="(max-width: 1023px)"
        srcSet={`${baseUrl}?format=auto&w=1024&h=576`}
      />

      {/* 3:2 aspect ratio for desktop */}
      <source
        media="(min-width: 1024px)"
        srcSet={`${baseUrl}?format=auto&w=1200&h=800`}
      />

      {/* Fallback */}
      <img
        src={`${baseUrl}?format=auto&w=400&h=400`}
        alt={image.label}
        loading="lazy"
        className={className}
      />
    </picture>
  )
}
```

**Key points:**
- Each `<source>` includes both `w` (width) and `h` (height) parameters
- The focal point set in Agility CMS will be respected for each crop
- Different aspect ratios can be served at different breakpoints
- The fallback `<img>` should also include both dimensions for consistent behavior

**When to use this approach:**
- Product images that show square on mobile but landscape on desktop
- Hero images where the subject needs to stay centered regardless of crop
- Any scenario where art direction requires different aspect ratios with a non-center focal point

## Performance Tips

1. **Always set a small `fallbackWidth`** (400-800px) for mobile users on 3G networks
2. **Order sources from largest to smallest** when using `min-width` queries
3. **Order sources from smallest to largest** when using `max-width` queries
4. **Use `priority={true}`** for above-the-fold hero images
5. **Upload at 2x your largest display size** at 72 DPI for high-DPI support

## Related Resources

- [Transforming Images Using Query Strings](/docs/editors/transforming-images-using-query-strings) - Learn about all available transformation parameters
- [Agility CMS Image API](https://agilitycms.com/docs) - Full documentation on image optimization
