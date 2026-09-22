# View Transitions Implementation

This implementation adds smooth View Transitions between post listing and post detail pages using React's experimental ViewTransition API, creating a seamless visual connection between the post images.

## How it works

1. **Next.js Configuration**: View transitions are enabled via `experimental: { viewTransition: true }` in `next.config.mjs`
2. **React ViewTransition API**: Uses `import { unstable_ViewTransition as ViewTransition } from 'react'`
3. **Post Listing (`PostCard.tsx`)**: Each post image is wrapped with `<ViewTransition name={unique-id}>`
4. **Post Details (`PostImage.tsx`)**: The post image uses the same transition name to create smooth transitions
5. **CSS Animations (`view-transitions.css`)**: Basic CSS provides timing and easing for transitions

## Features

- **Smooth image transitions**: Post images smoothly morph from the listing to the detail view
- **Progressive enhancement**: Falls back gracefully in browsers that don't support view transitions
- **Performance optimized**: Uses React's built-in ViewTransition component for optimal rendering
- **Reusable utilities**: `createPostImageTransitionName()` function for consistent naming

## Browser Support

View Transitions are supported in:
- Chrome 111+
- Edge 111+
- Safari 18+

In unsupported browsers, navigation works normally without transitions.

## Implementation Details

### Next.js Configuration
```js
// next.config.mjs
const nextConfig = {
  experimental: {
    viewTransition: true,
  },
}
```

### PostCard Component
```tsx
import { unstable_ViewTransition as ViewTransition } from 'react'

<ViewTransition name={createPostImageTransitionName(post.contentID)}>
  <AgilityPic ... />
</ViewTransition>
```

### PostImage Component
```tsx
import { unstable_ViewTransition as ViewTransition } from 'react'

<ViewTransition name={createPostImageTransitionName(contentID)}>
  <AgilityPic ... />
</ViewTransition>
```

### CSS Animations
- 400ms duration with smooth easing for elements
- 300ms duration for page content transitions
- Automatic transitions via React's ViewTransition API

## Customization

To adjust the animations, modify the CSS in `src/styles/view-transitions.css`:
- Change `animation-duration` for timing
- Modify `animation-timing-function` for easing
- Add custom keyframes for different effects

## Notes

- This uses React's experimental ViewTransition API which requires Next.js 16 / React 19.3 (now a stable React export)
- The API is still experimental and may change in future React releases
- Make sure to test in supported browsers for the best experience
