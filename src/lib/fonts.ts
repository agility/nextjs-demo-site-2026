import localFont from "next/font/local"

/**
 * Switzer, self-hosted.
 *
 * It used to load from api.fontshare.com via a render-blocking <link> in the
 * document head. That cost two extra third-party origins before any brand text
 * could paint: a DNS+TLS+fetch to api.fontshare.com for the CSS, which then
 * pointed at cdn.fontshare.com for the font files themselves.
 *
 * Serving it through next/font/local removes both. The @font-face is inlined,
 * the file is served from this origin with a content-hashed immutable URL, and
 * Next preloads it and generates a size-adjusted fallback so the swap does not
 * shift layout.
 *
 * These are the VARIABLE files (weight 100–900 in one file), so all four
 * weights the site used cost a single request instead of four.
 *
 * Licence: Switzer is published by Indian Type Foundry under the ITF Free Font
 * Licence, which permits self-hosting for web use.
 * https://www.fontshare.com/fonts/switzer
 */
export const switzer = localFont({
	src: [
		{ path: "../fonts/Switzer-Variable.woff2", weight: "100 900", style: "normal" },
		{ path: "../fonts/Switzer-VariableItalic.woff2", weight: "100 900", style: "italic" },
	],
	variable: "--font-switzer",
	display: "swap",
	//used for the size-adjusted fallback Next generates
	fallback: ["system-ui", "sans-serif"],
})
