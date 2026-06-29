import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { decodeHTML } from "entities"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Decode HTML entities - numeric (&#233;), hex (&#xE9;) and named (&eacute;,
 * &amp;, &nbsp; etc.) - into their plain-text characters. Safe on both server
 * and client (no DOM dependency; backed by the `entities` package).
 *
 * Use this when rendering CMS text into a plain-text context (headings, image
 * alt text, page titles, excerpts). CMS content - especially machine-translated
 * locales - can arrive entity-encoded. Rich-text/HTML fields rendered via
 * dangerouslySetInnerHTML should NOT be decoded; the browser handles their
 * entities natively.
 */
export function decodeHtmlEntities(value: string | null | undefined): string {
  if (!value) return value ?? ""
  return decodeHTML(value)
}
