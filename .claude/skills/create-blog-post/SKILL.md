---
name: create-blog-post
description: Create a new blog post in Agility CMS from a topic prompt. Writes the post in en-us, then translates it to fr, and uploads a main image. Use when the user asks to write, draft, publish, or create a blog post.
---

# Create Blog Post (EN → FR, with Image)

Create a complete blog post in Agility CMS from a short topic prompt. The post is authored in English (`en-us`), then translated into French (`fr`), and a main image is uploaded. Both locale versions share the same `contentID`.

## Inputs

- **Topic prompt** — required. A short description of what the post should be about.
- **Brand guidelines document** — should be attached to the Claude project. Tone, voice, positioning, vocabulary, banned words, CTA patterns, etc. All generated copy MUST follow it.
- **Image** — required. Either:
  - An image the user attached to the conversation, OR
  - A reference image already in the Agility media library (use its existing CDN URL).

If the user has not supplied a brand guidelines document or an image, ask for them before generating anything.

## Target Instance

- **Default `instanceGuid`**: `13f09fe2-u` (project: Demo Site 2026 in the Starter Templates org).
- Confirm with `mcp__Agility-CMS__get_available_instances` if the user wants a different instance, or if the GUID is rejected.
- Locales: `en-us` (default) and `fr`. Verify with `mcp__Agility-CMS__get_locales`.

## Content Model: `Post` (container `Posts`)

Fields that matter when saving (names are case-insensitive):

| Field | Type | Notes |
|---|---|---|
| `Heading` | Text | Post title. |
| `Slug` | Text | URL slug — lowercase, hyphenated, ASCII-only, no trailing punctuation. Keep the SAME slug across en-us and fr (slug is not translated). |
| `PostDate` | Date | ISO date (e.g. `2026-04-21T00:00:00`). Use today's date unless the user specifies otherwise. **If the post is about a past event, use the event date — not today.** |
| `Category` | LinkedContentDropdown → `Categories` | Pick ONE existing category. See "Linked Content" below. |
| `CategoryID` | Integer | Companion field. Set to the chosen category's `contentID` as a string. |
| `CategoryName` | Text | Companion field. Set to the chosen category's `Name`. |
| `Tags` | LinkedContentSearchListBox → `Tags` | Pick 1–3 existing tags. See "Linked Content" below. |
| `TagIDs` | Text | Comma-separated `contentID`s of chosen tags (e.g. `"9,8"`). |
| `TagNames` | Text | Comma-separated `Name`s of chosen tags (e.g. `"Technology,A.I."`). |
| `Author` | LinkedContentDropdown → `Authors` | Pick ONE existing author. See "Linked Content" below. |
| `AuthorID` | Integer | Companion field. Set to the author's `contentID` as a string. |
| `AuthorName` | Text | Companion field. Set to the author's `Name`. |
| `Content` | Html | Article body as HTML. See "Content Formatting" below. |
| `Image` | ImageAttachment | Main image. See "Image Handling" below. |
| `SocialPublishedDate` | Date | **Do NOT set.** Set by the social-publishing webhook automatically. |

The `Category`, `Tags`, and `Author` fields themselves are reference-name strings (e.g. `"categories"`, `"tags"`, `"authors"`) — the actual linking is done through the `*ID` / `*Name` companion fields.

## Workflow

### 1. Gather context

1. Ask the user for the post topic if it wasn't supplied.
2. Confirm the brand guidelines document is available in the project — if not, ask for it.
3. Confirm how the image will be provided (attached now vs. pick an existing one).

### 2. Look up linked content (once per session is fine)

Run these in parallel:

- `mcp__Agility-CMS__get_content_items` → `Categories` (locale `en-us`) — pick the best-fit category.
- `mcp__Agility-CMS__get_content_items` → `Authors` (locale `en-us`) — pick an author. If the user hasn't specified, default to `Joel Varty` (contentID `4`) unless the topic clearly suggests another author from the list.
- `mcp__Agility-CMS__get_content_items` → `Tags` (locale `en-us`) — pick 1–3 tags that match the topic. Do NOT invent new tags; only choose from existing ones.

Record the `contentID` and `Name` for each selection — you'll need both.

### 3. Draft the English post

Write the post in `en-us`, following the brand guidelines. Requirements:

- **Heading**: Compelling, ≤ 100 chars, aligned with brand voice.
- **Slug**: Derived from the heading. Lowercase, words separated by `-`, strip punctuation/stopwords where appropriate (e.g. `ai-engine-helping-brands`). 3–7 words is a good target.
- **Content (HTML)**: Follow the patterns used by existing posts:
  - Opening paragraph (`<p>`) that hooks the reader.
  - `<h2>` section headings (not `<h1>` — the heading field supplies the H1).
  - Short paragraphs, `<ul><li>` bullet lists for enumerations, `<blockquote><p>` for pull quotes with attributions in `<strong>`.
  - Use semantic HTML — no inline styles or class attributes.
  - Target 500–900 words unless the user specifies length.
- Respect the brand guidelines' tone, terminology, and any banned phrasing.

### 4. Upload the main image

**First, look at the image(s).** Before uploading anything, use the Read tool on each image file the user provided. Claude can view JPEG/PNG/WebP directly — this is essential for writing accurate alt text, choosing a featured image, and making sure the image actually matches the post topic.

**Featured image selection heuristics** (when the user provides several and doesn't specify which is the hero):

1. Prefer landscape orientation — the blog header renders wide.
2. Prefer images with a clear subject and strong composition.
3. Prefer images that visually represent the post's main idea, not a minor detail.
4. Tell the user which one you picked and why in your final report.
5. If you can't analyze for some reason, use the first image.

**Option A — user attached one or more new images:**

1. Call `mcp__Agility-CMS__initialize_media_upload` for the chosen hero image with `instanceGuid`, a descriptive `fileName` (e.g. `predict-iq-hero.jpg` — don't carry through UUID-style filenames), and `folderPath: "mcp-uploads"` (or `"blog-images"` if the user prefers). If the user supplied multiple images, initialize all uploads in parallel (single tool-call batch).
2. Each response includes an `uploadUrl` (expires in 5 minutes). Upload the file via curl — also in parallel if there are multiple:
   ```bash
   curl -s -X POST "<uploadUrl>" -F "file=@/absolute/path/to/image.jpg"
   ```
3. The curl response body contains the final CDN asset URL. Use that URL in the `Image` field when saving.

**Option B — reusing an existing image from the media library:**

Skip the upload step and set `Image` to `{ "url": "<existing-cdn-url>", "label": "<alt text>" }`.

Either way, the `Image` field on the content item takes the shape:

```json
{
  "url": "https://cdn.agilitycms.com/.../hero.jpg",
  "label": "Short, descriptive alt text"
}
```

**Do NOT duplicate the hero image inside the `Content` HTML body** — the post detail template renders it above the body automatically via the `PostImage` component. If the user provides other supporting images for the body, those can go in the HTML.

### 5. Save the English post

Call `mcp__Agility-CMS__save_content_items` with:

- `instanceGuid`: `13f09fe2-u` (or user-specified)
- `locale`: `en-us`
- `items`: one item with `contentID: -1`, `referenceName: "Posts"`, and all fields from the "Content Model" table populated.

Capture the returned `contentID` — you'll reuse it for the French translation.

**Example payload (English):**

```json
{
  "instanceGuid": "13f09fe2-u",
  "locale": "en-us",
  "items": [{
    "contentID": -1,
    "referenceName": "Posts",
    "fields": {
      "Heading": "…",
      "Slug": "ai-engine-helping-brands",
      "PostDate": "2026-04-21T00:00:00",
      "Category": "categories",
      "CategoryID": "6",
      "CategoryName": "Industry Event",
      "Tags": "tags",
      "TagIDs": "9,8",
      "TagNames": "Technology,A.I.",
      "Author": "authors",
      "AuthorID": "4",
      "AuthorName": "Joel Varty",
      "Content": "<p>…</p><h2>…</h2>…",
      "Image": {
        "url": "https://cdn.agilitycms.com/.../hero.jpg",
        "label": "Descriptive alt text"
      }
    }
  }]
}
```

### 6. Translate to French

Translate the post to Canadian French (`fr`). Requirements:

- **Heading**: Translated naturally — do not translate brand / product names.
- **Slug**: Keep IDENTICAL to the English slug (slugs are shared across locales).
- **PostDate**: Same value as English.
- **Category / Tags / Author**: Same `*ID` values as English (linked content is language-neutral). `CategoryName`, `TagNames`, `AuthorName` companion fields can stay as the English names OR be set to localized names if the user has localized them — default to keeping the English names since companions are mostly display helpers and translating them risks breaking filters.
- **Content**: Translate naturally. Preserve HTML structure exactly (same `<h2>`, `<p>`, `<ul>`, `<blockquote>` tree). Preserve brand names, product names, and proper nouns untranslated. Adjust idioms; don't machine-translate word-for-word.
- **Image**: Same `url` as English. Translate the `label` (alt text) to French.

### 7. Save the French translation

Call `mcp__Agility-CMS__save_content_items` AGAIN, but this time with:

- `locale`: `fr`
- The SAME `contentID` returned from step 5 (NOT `-1` — this creates/updates the French version of the same content item).
- All fields translated per step 6.

### 8. Report back

Always end the response with the following block, filled in:

- **Content ID**: `{contentID}`
- **Edit in Agility (en-us)**: `https://app.agilitycms.com/instance/13f09fe2-u/en-us/content/list-9/listitem-{contentID}`
- **Edit in Agility (fr)**: `https://app.agilitycms.com/instance/13f09fe2-u/fr/content/list-9/listitem-{contentID}`
- **Preview (en-us)**: `https://demo.agilitycms.com/blog?ContentID={contentID}&lang=en-us&agilitypreviewkey=YSJChtivLrrzEdoJ6cric9bo7m%2fRLxAKsdDpcaVipHvA5kGPa1cTVkDVjWNeHlIGLfFTEW8Up6Gu4TOiYyBL3A%3d%3d&agilityts=20260421024609`
- **Preview (fr)**: `https://demo.agilitycms.com/blog?ContentID={contentID}&lang=fr&agilitypreviewkey=YSJChtivLrrzEdoJ6cric9bo7m%2fRLxAKsdDpcaVipHvA5kGPa1cTVkDVjWNeHlIGLfFTEW8Up6Gu4TOiYyBL3A%3d%3d&agilityts=20260421024609`

Notes on the URLs:
- The edit URL's `list-9` segment is the **container ID** for `Posts` in this instance — don't change it.
- The `agilitypreviewkey` is instance-scoped and stable. Keep it URL-encoded exactly as shown (the `%2f` and `%3d%3d` are intentional).
- If the user wants fresh preview links, you can regenerate the `agilityts` value as the current UTC timestamp in `yyyyMMddHHmmss` format — but the existing value works indefinitely.
- If the user targets a different `instanceGuid`, substitute it in the edit URL and warn that the preview key above only works for `13f09fe2-u`.

Also mention that both locales were saved as **Staging** (default state). Posts still need to be reviewed and published in the CMS UI — do not attempt to set `state: 2` (Published) automatically unless the user explicitly asks.

## Linked Content Reference

For this instance, the currently known linked content (verify if stale):

**Categories** (`Categories` container):
- `7` — General Interest
- `5` — News
- `6` — Industry Event
- `61` — Knowledge

**Authors** (`Authors` container):
- `4` — Joel Varty (default)
- `58` — Vincent Dries
- `59` — Emily Selman
- `60` — Leo Krasner
- `110` — Michael Foster

**Tags** (`Tags` container):
- `8` — A.I.
- `9` — Technology
- `10` — Commerce
- `11` — Trends

Always re-fetch these if unsure — new entries may have been added.

## Content Formatting Rules

HTML emitted into the `Content` field should match the style of existing posts:

- Start with a hook paragraph, no heading at the top (the `Heading` field IS the H1).
- Use `<h2>` for major sections. `<h3>` only if you need a sub-section.
- Short paragraphs (2–4 sentences).
- Use `<strong>` for emphasis on people/company names the first time they appear.
- Use `<em>` for product names on first mention.
- Pull quotes: `<blockquote><p>“…,” said <strong>Name</strong>, Title at Company.</p></blockquote>`.
- Bullet lists: `<ul><li><strong>Label:</strong> Description</li>…</ul>`.
- Do NOT inline `style="…"` or `class="…"` attributes — the site provides styling via Tailwind `prose`.
- Do NOT wrap the whole thing in `<html>`, `<body>`, or `<article>`.

## Creating New Categories, Tags, or Authors (Only If The User Explicitly Asks)

**NEVER proactively create linked content.** If nothing fits, ask the user which existing item to use or whether they want to add a new one. Only run these calls when the user explicitly approves.

**New Category** (save in both en-us and fr so the category works across locales):

```
mcp__Agility-CMS__save_content_items({
  instanceGuid: "13f09fe2-u",
  locale: "en-us",
  items: [{
    contentID: -1,
    referenceName: "Categories",
    fields: { Name: "Category Name" }
  }]
})
```

Capture the returned `contentID`, then save the French version at the SAME `contentID` with `locale: "fr"`.

**New Tag**:

```
mcp__Agility-CMS__save_content_items({
  instanceGuid: "13f09fe2-u",
  locale: "en-us",
  items: [{
    contentID: -1,
    referenceName: "Tags",
    fields: { Name: "Tag Name" }
  }]
})
```

**New Author**: don't create authors programmatically without the user explicitly providing a name AND a headshot image — the site relies on the headshot for the byline layout. If requested, follow the same pattern but populate `Name` and `HeadShot` (ImageAttachment, same upload flow as the post hero image).

## Example Session

**User:** "Write a blog post about how headless CMS improves developer experience. Use the brand guidelines I attached. Here's a hero image." *[attaches `developer-at-desk.jpg`]*

**Claude:**

1. Reads `developer-at-desk.jpg` to confirm it's a landscape shot of a developer at a monitor — good hero material.
2. In parallel: fetches Categories, Tags, Authors from the CMS.
3. Picks Category `61` (Knowledge), Tags `9` (Technology) and `8` (A.I.), Author `4` (Joel Varty — default).
4. Drafts the English post following the brand guidelines doc attached to the project:
   - Heading: *"Why Headless CMS Changes the Developer Experience"*
   - Slug: `headless-cms-developer-experience`
   - PostDate: `2026-04-21T00:00:00`
   - Content: HTML with a hook paragraph, three `<h2>` sections, a pull quote, and a bullet list.
5. Initializes a media upload, curls the image up, captures the CDN URL.
6. Saves the English post with `contentID: -1`, gets back e.g. `contentID: 312`.
7. Translates Heading, Content (preserving HTML structure), and `Image.label` to French. Keeps slug, PostDate, and all `*ID` fields identical.
8. Saves the French version at `contentID: 312`, `locale: "fr"`.
9. Reports back with both Edit URLs, both Preview URLs, notes the post is in Staging, and mentions the hero image was selected because it's landscape with a clear subject.

## Guardrails

- **Never invent categories, tags, or authors.** Always pick from existing items.
- **Never set `SocialPublishedDate`** — it's auto-managed.
- **Never publish automatically.** Save as Staging and let the human editor review.
- **Never translate proper nouns, product names, or brand-specific terms.**
- **Never reuse an existing slug.** If the generated slug collides with an existing post, append a disambiguator (e.g. `-2026`).
- **If image upload fails**, fall back to reusing an existing image URL and warn the user, rather than saving without an image.
- **Confirm before saving** if anything is ambiguous (author choice, category fit, image selection).
