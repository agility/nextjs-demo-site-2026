---
description: Review code changes in a pull request. Use when the user asks to review a PR, check PR changes, look at a pull request, or mentions reviewing code for merge.
---

# Review Pull Request

Review the code changes in a pull request for this Agility CMS Next.js codebase.

## Arguments

- `$ARGUMENTS` - Optional: PR number or URL. If not provided, reviews the current branch's PR.

## Instructions

1. **Get PR Information**
   - If a PR number/URL is provided, use that
   - Otherwise, get the PR for the current branch using `gh pr view`
   - Fetch the PR diff using `gh pr diff`

2. **Analyze the Changes**
   Review the code for:

   ### Code Quality
   - TypeScript type safety and proper interface definitions
   - Proper error handling
   - Code clarity and maintainability
   - Avoiding over-engineering (no unnecessary abstractions)

   ### Agility CMS Patterns
   - Correct use of `getContentItem()` and `getContentList()` for CMS data fetching
   - Proper nested content fetching using `referencename` (not `contentid`)
   - Components registered in `src/components/agility-components/index.ts`
   - Use of `UnloadedModuleProps` with proper destructuring
   - `data-agility-component` and `data-agility-field` attributes for inline editing
   - Use of `<AgilityPic>` for Agility images (not Next.js `<Image>`)
   - Use of `renderHTML()` for rich text content

   ### Security
   - No hardcoded secrets or API keys
   - Proper input validation at system boundaries
   - No XSS, SQL injection, or command injection vulnerabilities

   ### Next.js & React Patterns
   - Correct use of server vs client components
   - Proper use of async components for data fetching
   - Following App Router conventions
   - Correct metadata and SEO patterns

   ### Styling
   - Tailwind CSS v4 patterns
   - Dark mode support with `dark:` variants
   - Mobile-first responsive design
   - Use of `clsx()` for conditional classes

   ### Documentation
   - Check if changes require documentation updates in `docs/` or `AGENTS.md`

3. **Output Format**

   Provide a structured review with:

   ```
   ## PR Summary
   [Brief description of what the PR does]

   ## Review

   ### Strengths
   - [What's done well]

   ### Issues Found
   - **[Severity: Critical/Major/Minor]** [File:Line] - [Description]

   ### Suggestions
   - [Optional improvements that aren't required]

   ### Documentation Check
   - [Does this PR need documentation updates? Which files?]

   ## Verdict
   [APPROVE / REQUEST CHANGES / NEEDS DISCUSSION]
   [Summary of overall assessment]
   ```

4. **Severity Levels**
   - **Critical**: Security issues, data loss risks, breaking changes
   - **Major**: Bugs, significant pattern violations, missing error handling
   - **Minor**: Style issues, minor improvements, nitpicks
