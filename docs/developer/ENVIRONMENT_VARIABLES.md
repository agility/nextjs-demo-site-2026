# Strongly Typed Environment Variables

This project uses TypeScript to provide strong typing for environment variables while keeping the familiar `process.env.*` syntax.

## Usage

Use `process.env` as you normally would, but now with full TypeScript support:

```typescript
// Type-safe access - TypeScript will catch typos and provide autocomplete
const agilityGuid = process.env.AGILITY_GUID
const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const nodeEnv = process.env.NODE_ENV // Typed as 'development' | 'production' | 'test'

// TypeScript will catch typos at compile time
const typo = process.env.AGILITY_GUID_TYPO // ❌ Error: Property 'AGILITY_GUID_TYPO' does not exist

// Environment checks with proper typing
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode')
}
```

## Benefits

1. **Type Safety**: TypeScript will catch typos and missing environment variables at compile time
2. **IntelliSense**: Get autocomplete suggestions for all available environment variables
3. **Familiar Syntax**: Continue using `process.env.*` as you always have
4. **No Runtime Overhead**: Pure compile-time type checking with no additional runtime code

## Environment Variables

All environment variables are strongly typed in `/src/lib/types/env.d.ts`.

### Available Variables

- `AGILITY_GUID` - Agility CMS GUID
- `AGILITY_API_FETCH_KEY` - Agility CMS fetch API key
- `AGILITY_API_PREVIEW_KEY` - Agility CMS preview API key
- `AGILITY_SECURITY_KEY` - Agility CMS security key
- `AGILITY_LOCALES` - Supported locales
- `AGILITY_SITEMAP` - Sitemap name
- `AGILITY_FETCH_CACHE_DURATION` - Cache duration for fetch
- `AGILITY_PATH_REVALIDATE_DURATION` - Revalidation duration
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key (optional - analytics disabled if not set)
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL (optional - analytics disabled if not set)
- `NODE_ENV` - Node environment (strongly typed as 'development' | 'production' | 'test')

### Optional Analytics Configuration

The PostHog environment variables are optional. If not configured:
- Analytics tracking is silently skipped
- Feature flags return `undefined` (A/B tests use control variant)
- The application works normally without any errors

To enable analytics, set both `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`.

### Adding New Environment Variables

To add a new environment variable:

1. Add it to the `ProcessEnv` interface in `/src/lib/types/env.d.ts`:

```typescript
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// ...existing variables...
			NEW_VARIABLE: string
			OPTIONAL_VARIABLE?: string // Use ? for optional variables
		}
	}
}
```

2. Add the variable to your `.env.local` file
3. Restart your TypeScript server for changes to take effect

## Type Safety Features

### Required vs Optional Variables

```typescript
// Required variables (will show TypeScript error if undefined)
const required = process.env.AGILITY_GUID // string

// Optional variables (marked with ? in the type definition)
const optional = process.env.OPTIONAL_VAR // string | undefined
```

### NODE_ENV Type Safety

The `NODE_ENV` variable is strongly typed to only allow valid values:

```typescript
// ✅ Valid
if (process.env.NODE_ENV === 'development') { }
if (process.env.NODE_ENV === 'production') { }
if (process.env.NODE_ENV === 'test') { }

// ❌ TypeScript error
if (process.env.NODE_ENV === 'invalid') { } // Error: not assignable to type
```

## Migration Complete

All files in the project now use strongly typed `process.env.*` access with no changes to the existing syntax.
