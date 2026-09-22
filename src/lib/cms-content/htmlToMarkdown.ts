import { decodeHTML } from "entities"

/**
 * Convert the HTML that Agility rich-text fields store into markdown.
 *
 * Deliberately small and dependency-free: it covers the tags the CMS editor
 * actually emits (headings, paragraphs, emphasis, links, lists, quotes, code,
 * images, tables, rules) and drops everything else to plain text. It is not a
 * general-purpose HTML parser and does not try to be — the output is for AI
 * agents reading page content, where losing a wrapper <div> costs nothing.
 */
export const htmlToMarkdown = (html: string): string => {
	if (!html) return ""

	let out = html

	// strip things that carry no readable content
	out = out.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, "")
	out = out.replace(/<!--[\s\S]*?-->/g, "")

	// media and rules
	out = out.replace(/<img[^>]*?alt=["']([^"']*)["'][^>]*?src=["']([^"']+)["'][^>]*>/gi, "![$1]($2)")
	out = out.replace(/<img[^>]*?src=["']([^"']+)["'][^>]*?alt=["']([^"']*)["'][^>]*>/gi, "![$2]($1)")
	out = out.replace(/<img[^>]*?src=["']([^"']+)["'][^>]*>/gi, "![]($1)")
	out = out.replace(/<hr[^>]*>/gi, "\n\n---\n\n")
	out = out.replace(/<br\s*\/?>/gi, "\n")

	// code before emphasis, so backticked content is not re-processed
	out = out.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_m, c) => `\n\n\`\`\`\n${stripTags(c)}\n\`\`\`\n\n`)
	out = out.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_m, c) => `\n\n\`\`\`\n${stripTags(c)}\n\`\`\`\n\n`)
	out = out.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_m, c) => `\`${stripTags(c)}\``)

	// headings
	for (let level = 1; level <= 6; level++) {
		const re = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)</h${level}>`, "gi")
		out = out.replace(re, (_m, c) => `\n\n${"#".repeat(level)} ${inline(c)}\n\n`)
	}

	// lists — ordered items are numbered in a second pass per list
	out = out.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, c) =>
		"\n\n" + listItems(c).map((i) => `- ${i}`).join("\n") + "\n\n")
	out = out.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, c) =>
		"\n\n" + listItems(c).map((i, n) => `${n + 1}. ${i}`).join("\n") + "\n\n")

	// tables
	out = out.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_m, c) => tableToMarkdown(c))

	// blocks and inline
	out = out.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, c) =>
		"\n\n" + stripTags(c).trim().split("\n").map((l: string) => `> ${l}`).join("\n") + "\n\n")
	out = out.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, c) => `\n\n${inline(c)}\n\n`)
	out = out.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (_m, c) => `\n\n${inline(c)}\n\n`)

	out = inline(out)

	// collapse the blank lines all those \n\n pairs created
	return out.replace(/\n{3,}/g, "\n\n").trim()
}

/** Inline formatting: links and emphasis, then any leftover tags removed. */
const inline = (html: string): string => {
	let out = html
	out = out.replace(/<a[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => {
		const label = stripTags(text).trim()
		return label ? `[${label}](${href})` : ""
	})
	out = out.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, c) => {
		const inner = stripTags(c).trim()
		return inner ? `**${inner}**` : ""
	})
	out = out.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, c) => {
		const inner = stripTags(c).trim()
		return inner ? `*${inner}*` : ""
	})
	return stripTags(out)
}

/** Remove every remaining tag and decode entities. */
const stripTags = (html: string): string =>
	decodeHTML(String(html).replace(/<[^>]*>/g, "")).replace(/[ \t]+/g, " ")

const listItems = (html: string): string[] => {
	const items: string[] = []
	const re = /<li[^>]*>([\s\S]*?)<\/li>/gi
	let m: RegExpExecArray | null
	while ((m = re.exec(html)) !== null) {
		const text = inline(m[1]).replace(/\s+/g, " ").trim()
		if (text) items.push(text)
	}
	return items
}

const tableToMarkdown = (html: string): string => {
	const rows: string[][] = []
	const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
	let rowMatch: RegExpExecArray | null
	while ((rowMatch = rowRe.exec(html)) !== null) {
		const cells: string[] = []
		const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi
		let cellMatch: RegExpExecArray | null
		while ((cellMatch = cellRe.exec(rowMatch[1])) !== null) {
			cells.push(inline(cellMatch[1]).replace(/\s+/g, " ").trim())
		}
		if (cells.length) rows.push(cells)
	}
	if (rows.length === 0) return ""

	const [header, ...body] = rows
	const lines = [
		`| ${header.join(" | ")} |`,
		`| ${header.map(() => "---").join(" | ")} |`,
		...body.map((r) => `| ${r.join(" | ")} |`),
	]
	return `\n\n${lines.join("\n")}\n\n`
}
