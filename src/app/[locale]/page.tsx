/**
 * The locale root (e.g. /en-us, /fr) — just pull exports from the catch-all,
 * which resolves an empty slug to the home page.
 */
import { locales } from "@/lib/i18n/config"

export { generateMetadata } from "./[...slug]/page"
export { default } from "./[...slug]/page"

/**
 * Without this, `params` is runtime data on this route and `cacheComponents`
 * cannot prerender it — the whole locale home page would render on demand.
 * The catch-all has its own generateStaticParams, but re-exporting a default
 * does not re-export that, so this route needs its own.
 */
export function generateStaticParams() {
	return locales.map((locale) => ({ locale }))
}
