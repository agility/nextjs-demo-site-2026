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
    { media: "(max-width: 639px)", width: 640, height: 360 },
    { media: "(max-width: 767px)", width: 800, height: 400 },
    { media: "(max-width: 1023px)", width: 1200, height: 600 },
    { media: "(min-width: 1024px)", width: 512, height: 512 },
  ]}
/>
```

Each entry sets `height` so the CDN crops to the focal point — see [Handling Focal Points with Different Aspect Ratios](#handling-focal-points-with-different-aspect-ratios).

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
| `height` | `number` | Optional. Desired image height. Supplying it makes the CDN crop, which is what enables [focal points](#handling-focal-points-with-different-aspect-ratios). Without it the crop falls to CSS and is always centred. |

## How It Works

The component generates URLs using Agility's image transformation API:

```
https://cdn.agilitycms.com/your-image.jpg?format=auto&w=800
```

- `format=auto` automatically serves WebP or AVIF based on browser support
- `w=800` resizes the image to 800px wide
- Adding `h=600` would crop to 800x600

The component also respects the original image dimensions—it won't upscale an image beyond its original size. **This clamp only applies to width-only or height-only sources**; when a source supplies both `width` and `height` the clamp is skipped and a larger crop will upscale.

## Handling Focal Points with Different Aspect Ratios

Agility CMS lets content editors set a **focal point** on an image — the part of the picture that must stay visible when the image gets cropped. The focal point is only applied when the transformation URL carries **both** a width and a height.

`AgilityPic` supports this directly. Add `height` alongside `width` in a `sources` entry and the generated URL includes `&h=`:

| Source entry | Generated URL | Focal point |
| --- | --- | --- |
| `{ width: 512 }` | `?format=auto&w=512` | ❌ Ignored |
| `{ width: 512, height: 512 }` | `?format=auto&w=512&h=512` | ✅ Respected |

### Why a width-only source silently breaks focal points

This is the part that catches people out, because nothing looks broken — the image just crops in the wrong place.

With `width` alone, the CDN scales the image proportionally and hands the browser (say) a 512x341 image. If your CSS then forces that into a square box with `object-cover`, **the browser** performs the crop — and `object-cover` always crops from the **centre**. The focal point is never consulted, because the CDN was never told to crop.

Supplying `height` moves the crop from the browser to the CDN, which is the only place the focal point is known.

> **Rule of thumb:** any image rendered with `object-cover` into a fixed aspect ratio should specify `height` on every source.

### Worked example: a ratio that changes per breakpoint

`PostCard` renders the same post image at three different aspect ratios:

```tsx
<div className="relative aspect-video sm:aspect-2/1 lg:aspect-square lg:w-64 lg:shrink-0">
```

Each source therefore needs its own width/height pair matching the ratio rendered at that breakpoint:

```tsx
<AgilityPic
  image={post.image}
  fallbackWidth={400}
  className="absolute inset-0 w-full h-full object-cover"
  sources={[
    // aspect-video (16:9)
    { media: "(max-width: 639px)", width: 640, height: 360 },
    // sm:aspect-2/1
    { media: "(max-width: 767px)", width: 800, height: 400 },
    { media: "(max-width: 1023px)", width: 1200, height: 600 },
    // lg:aspect-square at lg:w-64 (256px), so 2x for retina.
    { media: "(min-width: 1024px)", width: 512, height: 512 },
  ]}
/>
```

Because the CDN now returns an image already at the target ratio, `object-cover` becomes a no-op and the focal-point crop is what the visitor actually sees.

### Watch the breakpoint coverage

When mixing `max-width` and `min-width` queries, make sure every viewport matches a source. It is easy to write a list of `max-width` rules that stops short and leaves the largest screens with **no** matching source — those fall through to the `fallbackWidth` `<img>`, which has no height and therefore no focal point. The `(min-width: 1024px)` entry above exists precisely to catch that case.

### ⚠️ Upscaling caveat

`AgilityPic` caps a request at the source image's own dimensions **only** for width-only or height-only sources. When both `width` and `height` are supplied that clamp is skipped, so requesting a crop larger than the original will upscale it. Upload source images at 2x your largest crop.

The fallback `<img>` cannot be focal-cropped at all — the component exposes `fallbackWidth` but no `fallbackHeight`. As long as your sources cover every breakpoint this is unreachable in practice.

**When this matters most:**

- Product images shown square on mobile but landscape on desktop
- Portraits or team headshots, where a centre crop can cut off a face
- Any art direction where the subject sits away from the centre of the frame

## Performance Tips

1. **Always set a small `fallbackWidth`** (400-800px) for mobile users on 3G networks
2. **Order sources from largest to smallest** when using `min-width` queries
3. **Order sources from smallest to largest** when using `max-width` queries
4. **Use `priority={true}`** for above-the-fold hero images
5. **Upload at 2x your largest display size** at 72 DPI for high-DPI support
6. **Set `height` on every source** when the image renders with `object-cover`, so the focal point is respected

## Related Resources

- [Transforming Images Using Query Strings](https://agilitycms.com/docs/editors/transforming-images-using-query-strings) - Learn about all available transformation parameters
- [Agility CMS Image API](https://agilitycms.com/docs) - Full documentation on image optimization
