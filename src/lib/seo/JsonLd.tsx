import { serializeJsonLd } from "@agility/geo"

/**
 * Render JSON-LD in a `<script type="application/ld+json">` tag.
 *
 * Always use this rather than `JSON.stringify` inside `dangerouslySetInnerHTML`.
 * Structured data carries editor-written text, and plain `JSON.stringify` leaves
 * `</script>` as-is: a heading or FAQ answer containing it would close the tag
 * and inject markup into the page. `serializeJsonLd` writes `<`, `>` and `&` as
 * the escapes `<`, `>` and `&`, which is still valid JSON that parses back to
 * the same value.
 */
export function JsonLd({ data }: { data: unknown }) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
		/>
	)
}
