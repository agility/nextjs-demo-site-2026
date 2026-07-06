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
