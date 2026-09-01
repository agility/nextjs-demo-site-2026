/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		viewTransition: true,
		// ppr: true, // PPR requires Next.js canary - using manual Suspense pattern instead
	},
	poweredByHeader: false,
	compress: true,
	compiler: {
		removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
	},
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "**.agilitycms.com" },
			{ protocol: "https", hostname: "cdn.agilitycms.com" },
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
	async headers() {
		return [
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
