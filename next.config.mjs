/** @type {import('next').NextConfig} */
const nextConfig = {
	// NOTE: `experimental.viewTransition` was removed here. React 19.3 stabilized
	// <ViewTransition>, so Next 16.3 no longer recognizes the flag and warns about
	// it on boot. The components import the stable export from "react" directly.

	// Cache Components (Next 16's Partial Prerendering model). Every Agility read
	// in src/lib/cms/ is wrapped in `"use cache"` + cacheTag + cacheLife("days"),
	// and invalidated the instant an editor publishes via /api/revalidate. Pages
	// get a static shell with the request-time parts streamed in.
	// This replaces the old `export const revalidate = 60` on each route.
	cacheComponents: true,
	poweredByHeader: false,
	compress: true,
	compiler: {
		removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
	},
	images: {
		formats: ["image/avif", "image/webp"],
		// Next 16 raised the default from 60s to 4h. Every optimized image here
		// originates from the Agility CDN, whose URL changes when the asset does,
		// so a long TTL is safe and cuts re-optimization cost. NOTE: there is no
		// way to invalidate this cache — if an editor overwrites a media file at
		// the SAME url, the old render can persist. 31 days.
		minimumCacheTTL: 2678400,
		remotePatterns: [
			{ protocol: "https", hostname: "**.agilitycms.com" },
			{ protocol: "https", hostname: "cdn.agilitycms.com" },
			{ protocol: "https", hostname: "*.aglty.io" },
		],
	},
	async redirects() {
		// These /docs namespaces belong to the official Agility docs site, not this
		// repo's file-based docs — inbound links exist, so redirect instead of 404ing.
		return [
			{
				source: "/docs/generic/04-content-basics",
				destination: "https://agilitycms.com/docs/training-guide/content-editor-content-basics",
				permanent: true,
			},
			{
				source: "/docs/generic/05-pages-basics",
				destination: "https://agilitycms.com/docs/training-guide/content-editor-pages-basics",
				permanent: true,
			},
			{
				source: "/docs/generic/06-components",
				destination: "https://agilitycms.com/docs/training-guide/content-editor-components",
				permanent: true,
			},
			{
				source: "/docs/generic/:path*",
				destination: "https://agilitycms.com/docs/training-guide",
				permanent: true,
			},
			{
				source: "/docs/editors/:path*",
				destination: "https://agilitycms.com/docs/editors/:path*",
				permanent: true,
			},
			{
				source: "/docs/nextjs/:path*",
				destination: "https://agilitycms.com/docs/nextjs/:path*",
				permanent: true,
			},
			{
				source: "/docs/developers/:path*",
				destination: "https://agilitycms.com/docs/developers/:path*",
				permanent: true,
			},
		]
	},
	async rewrites() {
		// *** Preview + deep links must survive a CDN cache hit. ***
		//
		// src/proxy.ts also handles ?agilitypreviewkey= and ?ContentID=, but the
		// proxy is a Node function that Vercel and Netlify DO NOT invoke when they
		// serve a page straight from the edge cache — which is exactly what happens
		// to every prerendered page. So on the pages that matter most, the preview
		// key never reached /api/preview, draft mode was never enabled, and Web
		// Studio silently rendered PUBLISHED content. Same story for ?ContentID=
		// deep links, which landed on the cached page instead of resolving the item.
		//
		// A `has`-matched `beforeFiles` rewrite is compiled into the platform's
		// routes manifest and evaluated BEFORE the cache lookup, so it always
		// reaches the route handler. Ported from Agility-Website-Nextjs-2026.
		//
		// Both paths are kept on purpose: the proxy covers uncached requests (where
		// it runs first), these rewrites cover cached ones. They converge on the
		// same handlers, so there is no double-handling.
		//
		// The (?!api) guard keeps /api/preview itself from matching and looping.
		// The incoming query string is carried over automatically, so
		// agilitypreviewkey / lang / ContentID all arrive; only `slug` is added.
		return {
			beforeFiles: [
				{
					source: "/:path((?!api).*)",
					has: [{ type: "query", key: "agilitypreviewkey" }],
					destination: "/api/preview?slug=/:path",
				},
				{
					source: "/:path((?!api).*)",
					// anchored: `has.value` is a regex, so a bare "0" would also match "10"
					has: [{ type: "query", key: "AgilityPreview", value: "^0$" }],
					destination: "/api/preview/exit?slug=/:path",
				},
				{
					source: "/:path((?!api).*)",
					has: [{ type: "query", key: "ContentID" }],
					// `slug` lets the handler fall back to the requested page when the
					// ContentID is not a resolvable item. The proxy could check
					// `contentID > 0` before rewriting; a static rewrite cannot.
					destination: "/api/dynamic-redirect?slug=/:path",
				},
			],
		}
	},
	async headers() {
		// NOTE: CACHE headers are deliberately NOT here — they live in src/proxy.ts,
		// which can see the draft-mode cookie. A rule in this file is unconditional
		// and would put `public` CDN caching on draft renders, publishing an
		// editor's unpublished content to a shared cache. These are security and
		// static-asset headers only, which are safe to apply unconditionally.
		return [
			{
				// Files under public/ (logos, fonts, favicons) otherwise ship
				// `max-age=0, must-revalidate` — Next only long-caches /_next/static,
				// whose filenames are content-hashed. Without this every repeat visit
				// re-requests the brand assets. The trade-off `immutable` accepts:
				// replacing a file at the SAME name won't be picked up by browsers
				// that already have it, so version the filename when swapping an asset.
				source: "/:path*.:ext(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
				headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
			},
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{ key: "X-DNS-Prefetch-Control", value: "on" },
					{
						key: "Content-Security-Policy",
						value: "frame-ancestors 'self' https://app.agilitycms.com;",
					},
				],
			},
		]
	},
}

export default nextConfig
