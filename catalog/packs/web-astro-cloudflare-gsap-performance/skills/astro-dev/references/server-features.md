# Server Features

Order here: environment variables, rendering mode, locale routing, prefetch, security settings, sessions, Cloudflare, then the pitfalls grouped by topic.

## Environment variables with `astro:env`

### What changed in Astro 6

Every `import.meta.env` value is baked in when you build. A server value read at runtime comes from `astro:env` secrets or from `process.env`.

### Declare a schema

```ts
// astro.config.ts
import { defineConfig, envField } from 'astro/config'

export default defineConfig({
  env: {
    schema: {
      // public, sent to the browser; fixed at build time
      API_URL: envField.string({ context: 'client', access: 'public' }),

      // public but server-only
      PORT: envField.number({ context: 'server', access: 'public', default: 4321 }),

      // secret: read at runtime, never bundled
      DB_PASSWORD: envField.string({ context: 'server', access: 'secret' }),

      // restricted to listed values
      NODE_ENV: envField.enum({
        context: 'server', access: 'public',
        values: ['development', 'production'],
        default: 'development',
      }),
    },
  },
})
```

### Read them

```ts
// client values
import { API_URL } from 'astro:env/client'

// server values, public and secret
import { PORT, DB_PASSWORD } from 'astro:env/server'

// a secret that is not in the schema
import { getSecret } from 'astro:env/server'
const key = getSecret('DYNAMIC_KEY') // string | undefined
```

### Limits

- Not usable inside `astro.config.mjs`: the virtual module does not exist yet. Use `process.env` or Vite's `loadEnv()` there.
- A client-side secret is rejected: `context: 'client'` with `access: 'secret'`.
- Names missing from the schema cannot be imported; `getSecret()` reaches them.
- Client values are fixed at build time and cannot differ per deployment.

## Prerendered or on-demand

The mode silently changes behaviour, so settle it first.

| Mode | Default | Per-page override |
|---|---|---|
| `'static'` (the default) | built ahead of time | `export const prerender = false` |
| `'server'` | rendered per request | `export const prerender = true` |

`'hybrid'` no longer exists (merged into `'static'` in Astro 5, per Astro's v5 upgrade guide).

| Feature | Prerendered | On-demand |
|---|---|---|
| Middleware | runs once, at **build time** | runs on each request |
| `Astro.cookies`, sessions, Actions, POST/PUT/DELETE | not available | available |
| `Astro.redirect()` | writes a `<meta http-equiv="refresh">` tag | sends an HTTP 302 |
| `Astro.clientAddress`, live collections | not available | available |
| `Astro.request.headers` | limited to build time | the real headers |

Rule of thumb: cookies, sessions, forms, live collections or anything per request means on-demand.

```astro
---
export const prerender = false

const session = Astro.cookies.get('session')
---
```

## Locale routing (i18n)

Astro routes locales itself.

```ts
// astro.config.ts
export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr'],
    routing: {
      prefixDefaultLocale: false, // /about for en, /de/about, /fr/about
    },
    fallback: {
      de: 'en', // pages missing in de are served from en
    },
  },
})
```

Astro 6: `redirectToDefaultLocale` now defaults to `false` and may only be set when `prefixDefaultLocale` is `true`. For the earlier behaviour:
```ts
routing: {
  prefixDefaultLocale: true,
  redirectToDefaultLocale: true,
}
```

Link helper:
```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n'
---
<a href={getRelativeLocaleUrl('de', '/about')}>About (German)</a>
<!-- gives: /de/about -->
```

Finding the locale:
```astro
---
const currentLocale = Astro.currentLocale          // taken from the URL
const preferred = Astro.preferredLocale             // browser Accept-Language, if you support it
const allPreferred = Astro.preferredLocaleList      // every supported match
---
```
`preferredLocale` and `preferredLocaleList` read the request, so they work on on-demand pages only (Astro's API reference: not usable on prerendered pages).

Translated content can sit in per-locale folders (`src/content/notes/en/welcome.md`, `src/content/notes/de/welcome.md`):
```ts
const post = await getEntry('notes', `${lang}/${slug}`)
```

## Prefetch

```ts
// astro.config.ts
export default defineConfig({
  prefetch: true, // or prefetch: { prefetchAll: true }
})
```

```html
<a href="/about" data-astro-prefetch>About</a>
<a href="/heavy" data-astro-prefetch="viewport">Heavy page</a>
<a href="/action" data-astro-prefetch="tap">Action page</a>
```

Strategies: `hover` (default; mouse hover or focus), `tap` (just before the click), `viewport` (link scrolls into view), `load` (all links after page load). On a slow connection or with data saver on, Astro falls back to `tap`.

## Security settings

### Content Security Policy

Built in under `security.csp`; ask the MCP for options (`search_astro_docs("security csp")`).

```ts
export default defineConfig({ security: { csp: true } })
```

Limits: build and preview only, never the dev server; `<ClientRouter />` and Shiki are incompatible (use native View Transitions and `<Prism />`). Runtime helpers: `Astro.csp?.insertDirective()` and `Astro.csp?.insertScriptHash()`.

### Origin check and body size

```ts
export default defineConfig({
  security: {
    checkOrigin: true,  // CSRF check, on by default
    actionBodySizeLimit: 10 * 1024 * 1024,  // 10MB is an example value
    serverIslandBodySizeLimit: 10 * 1024 * 1024,  // example value
  },
})
```

Astro's configuration reference gives both limits a default of 1 MB (1048576 bytes). `serverIslandBodySizeLimit` arrived in Astro 6.

## Sessions

Per-visitor state kept on the server for on-demand pages; no client script. Keep login state in server sessions and HttpOnly cookies, never in localStorage or sessionStorage.

### Setup

The Node, Cloudflare and Netlify adapters provide a default store, so a config may need nothing. For a specific store, use the object form from `astro/config`; the string form of `driver` is deprecated in Astro 6 (v6 upgrade guide):

```ts
import { defineConfig, sessionDrivers } from 'astro/config'

export default defineConfig({
  session: {
    driver: sessionDrivers.redis({ url: process.env.REDIS_URL }), // config-time use is fine; inside app code use typed env access
  },
})
```

### Use

`Astro.session` is undefined when the page is prerendered or no store is configured, so the docs use optional chaining:

```astro
---
const basket = await Astro.session?.get('basket') ?? []
await Astro.session?.set('basket', [...basket, newItem])
---
```

```ts
// endpoints, actions and middleware
const basket = await context.session?.get('basket')
await context.session?.set('basket', updatedBasket)

// new session id after login
await context.session?.regenerate()

// end the session on logout
await context.session?.destroy()
```

Type the data once:
```ts
// src/env.d.ts
declare namespace App {
  interface SessionData {
    user: { id: string; name: string }
    basket: string[]
  }
}
```

Limits: on-demand pages only; not in edge middleware; values are serialized with devalue (Date, Map, Set, URL, arrays, plain objects).

## Cloudflare Workers

Astro 6 requires `@astrojs/cloudflare` 13 or later (Astro's Cloudflare integration guide), which runs your code in `workerd` in dev, build and production. Setup details: ask the MCP.

- The adapter no longer supports deployment on Cloudflare Pages; deploy to Workers.
- Workers support most Node.js APIs through the `nodejs_compat` flag in the Wrangler config; without it, assume Node APIs are missing.
- Prerendered pages run in `workerd` by default. If one reads files with `node:fs`, set `prerenderEnvironment: 'node'` in the adapter options. On-demand pages always run in `workerd`.
- Some CommonJS packages need `optimizeDeps.include` so they get pre-bundled.
- Bindings come from `import { env } from 'cloudflare:workers'`; `astro:env` works as well.

## Pitfalls, by topic

Environment variables
- `process.env.SECRET` scattered through app code: use `astro:env/server` with a schema, keeping `process.env` for documented config-time cases.
- `import.meta.env` for runtime server values: build-time in Astro 6, so use `astro:env` secrets or `process.env`.

Rendering mode
- Cookies on a prerendered page, or a missing `export const prerender = false` for cookies, sessions, forms, Actions and live collections.
- Expecting middleware to run per request on static pages: it runs at build time there.
- `output: 'hybrid'`: gone; use `'static'` plus `prerender = false` per page.

Sessions and locales
- Hand-rolled cookie sessions: use `Astro.session` or `context.session`.
- Hand-built locale routing: use the `i18n` config.
- Assuming `redirectToDefaultLocale` is `true`: the Astro 6 default is `false`.

Security
- Leaving CSP off by default: switch on `security.csp` and test under `build` and `preview`.
