# Astro Core Patterns

Sections run from "what version am I on" to "what do I deploy with". Jump to the one you need.

1. Versions and what changed
2. Files, config and pages
3. Rendering: output modes, endpoints, data
4. Components: styles and scripts
5. Content, images, navigation, middleware
6. Deprecated and removed APIs
7. Adapters

## 1. Versions and what changed

### Astro 6

- Astro's v6 upgrade guide: Node 22.12.0 or higher, Vite 7, Zod 4. The guide also says Astro 6 drops Node 18 and Node 20 support entirely.
- Astro's v5 upgrade guide: Astro 5 upgraded to Vite 6, so Vite moved from 6 to 7 with Astro 6.
- Zod comes from `astro/zod` and never straight from `zod`.
- The dev server runs on Vite's Environment API and shares the production runtime, so fewer bugs appear only after deploy. With Cloudflare, `astro dev` runs inside `workerd`. CSP is active under `build` and `preview` only.

### Astro 7

Per Astro's v7 upgrade guide:

- Vite 8 is the dev server and bundler.
- The experimental flags `queuedRendering`, `rustCompiler`, `advancedRouting`, `cache` and `logger` are gone: the first four became default or stable behaviour, and logging has its own top-level `logger` field. If your config still sets one, remove it (`cache` and `routeRules` move out of the `experimental` block).
- The Rust compiler is the only compiler. It rejects unclosed tags and no longer repairs invalid nesting such as a `<div>` inside a `<p>`.
- `.md` and `.mdx` are rendered by Sätteri. `@astrojs/markdown-remark` is not installed by default; unified plugins need it plus `markdown.processor: unified()`.
- `compressHTML` now defaults to `'jsx'`: whitespace between adjacent inline elements can vanish. Add `{" "}` where needed or set `compressHTML: true`.
- `src/fetch.ts` is a reserved file name (set `fetchFile` to move it).
- `@astrojs/db` is removed, and several `astro:transitions` internals (such as `TRANSITION_PAGE_LOAD` and `createAnimationScope()`) can no longer be imported.
- The guide does not restate Node or Zod requirements. Read it, and the project's lockfile, before assuming the Astro 6 numbers.

Other experimental flags from Astro 6 (`svgo`, `contentIntellisense`) are not covered by the v7 guide; check Astro's experimental flags reference before using them.

## 2. Files, config and pages

### Config file

- `astro.config.ts` is best: full type inference.
- `astro.config.mjs` works.
- `astro.config.cjs` fails since Astro 6.

### Dynamic routes from a collection

```ts
// src/pages/notes/[...id].astro
export async function getStaticPaths() {
  const posts = await getCollection('notes')
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }))
}
```

An entry's `id` is its path below the collection's base folder, such as `first-entry` or `guide/step-1`.

## 3. Rendering

### Output modes

| Mode | What happens |
|------|----------|
| `'static'` (default) | Pages are built ahead of time; a page opts out with `export const prerender = false`. |
| `'server'` | Pages render per request; a page opts in to prebuilding with `export const prerender = true`. |

`'hybrid'` was merged into `'static'` in Astro 5 (Astro's v5 upgrade guide), so either mode lets any page set `prerender = false`.

### Endpoints (API routes)

```ts
// src/pages/api/data.ts
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ request }) => {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json()
  return new Response(JSON.stringify({ received: body }))
}
```

A static build runs only `GET` handlers, once, at build time. For `POST`, `PUT` or `DELETE`, set `output: 'server'` or `export const prerender = false` in that file.

Astro 6 change: an endpoint whose URL ends in a file extension (like `/sitemap.xml`) answers only without a trailing slash.

### Fetching data

In `.astro` frontmatter, `fetch()` runs during the **build** unless the page is server-rendered (`output: 'server'` or `prerender = false`), where it runs per request:

```astro
---
// static page: one call at build time, not one per visitor
const data = await fetch('https://api.example.com/posts').then(r => r.json()) // public example endpoint only
---
```

- Top-level `await` is allowed in frontmatter.
- To call your own endpoint: `await fetch(new URL('/api/data', Astro.url))`.
- Frontmatter never runs in the browser. For data that refreshes itself, use a framework component with a `client:*` directive.

## 4. Components: styles and scripts

### Scoped styles

Rules written in an `.astro` file are scoped on their own. Astro stamps a `data-astro-cid-*` attribute on the elements and on the selectors.

```astro
<h1>Hello</h1>
<style>
  h1 { color: red; }
  /* compiled to: h1[data-astro-cid-xyz] { color: red; } */
</style>
```

**Passing `class` down.** A `class` on a child component is not forwarded by itself; the child reads and applies it:

```astro
---
// Card.astro
interface Props { class?: string }
const { class: className, ...rest } = Astro.props
---
<div class:list={['card', className]} {...rest}>
  <slot />
</div>
```

Keep `{...rest}`: it carries the scope attribute, which is how a parent's scoped styles can reach this component.

**Markdown and slotted content.** HTML from markdown or from a `<slot />` has no scope attribute, so reach it with `:global()`:

```astro
<article class="prose">
  <Content />
</article>
<style>
  .prose :global(h2) {
    color: var(--color-primary);
  }
</style>
```

**Pitfalls.** A CSS file imported inside a component (`import './reset.css'`) applies to the whole site whether or not the component renders. A scoped rule beats an equal-specificity rule because it is emitted last, but a more specific selector from imported CSS still wins.

### Scripts

A `<script>` in an `.astro` file is processed: bundled, deduplicated, emitted as `type="module"`.

```astro
<!-- three instances, one execution of the script -->
<Counter />
<Counter />
<Counter />
```

```astro
<!-- Counter.astro -->
<button class="counter">Click</button>
<script>
  // executes once, so loop over every instance yourself
  document.querySelectorAll('.counter').forEach((btn) => {
    btn.addEventListener('click', () => { /* ... */ })
  })
</script>
```

`is:inline` opts out of all of that: no bundling, no dedup, no TypeScript, imports unresolved, and the tag is emitted once per instance. Keep it for third-party CDN scripts or when you want one run per instance.

**Server values in a script.** Frontmatter variables exist on the server only. Put them on an element:

```astro
---
const message = 'Rendered on the server'
---
<div data-message={message} id="container"></div>
<script>
  const el = document.getElementById('container')
  console.log(el.dataset.message)
</script>
```

For an inline script, `define:vars` works too, but it makes the script `is:inline`:

```astro
---
const greeting = 'Hello'
---
<script define:vars={{ greeting }}>
  console.log(greeting)
</script>
```

**Order (changed in Astro 6).** `<script>` and `<style>` render in the order written; Astro 5 reversed them. After a v5 upgrade, if the cascade looks off, check whether tags need flipping.

**Many instances, one scope.** A custom element keeps each copy's DOM work separate:

```astro
<my-counter>
  <button>Click</button>
</my-counter>

<script>
  class MyCounter extends HTMLElement {
    connectedCallback() {
      this.querySelector('button').addEventListener('click', () => { /* ... */ })
    }
  }
  customElements.define('my-counter', MyCounter)
</script>
```

## 5. Content, images, navigation, middleware

### Rendering an entry

```ts
import { render } from 'astro:content'

const post = await getEntry('notes', id)
const { Content, headings, remarkPluginFrontmatter } = await render(post)
```

`render` is imported from `astro:content`; the entry has no `render` method. Collections need a `loader`, and a schema that uses helpers is a function (`content-collections.md`).

### Images

```astro
---
import { Image } from 'astro:assets'
import coverImage from '../assets/cover.png'
---
<Image src={coverImage} alt="Cover" width={800} />
```

- Local files are optimized at build time; remote images need both `width` and `height`.
- In a collection schema, validate images with `image()`.
- Astro 6 can rasterize SVG; state `format` explicitly so the conversion is not a surprise.

### Page transitions

```astro
---
import { ClientRouter } from 'astro:transitions'
---
<head>
  <ClientRouter />
</head>
```

- Astro 5 renamed `<ViewTransitions />` to `<ClientRouter />` (Astro's v5 upgrade guide).
- `transition:persist` keeps an element alive across navigations; `transition:name="..."` pairs an element on the old page with one on the new page.
- Inline scripts can run again during a visit. Per Astro's view transitions guide, add `data-astro-rerun` to force re-execution after every transition; bundled module scripts run once.
- `<ClientRouter />` does not work with `security.csp`; use the browser's native View Transition API.

### Middleware

```ts
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()
  return response
})
```

Several in a row with `sequence()`:

```ts
import { sequence, defineMiddleware } from 'astro:middleware'

const auth = defineMiddleware(async (context, next) => {
  const sessionCookie = context.cookies.get('session')
  // whatever flow sets this cookie should mark it HttpOnly, Secure and SameSite
  context.locals.user = sessionCookie ? await getUser(sessionCookie.value) : null
  return next()
})

const logging = defineMiddleware(async (context, next) => {
  console.log(`[${context.request.method}] ${context.url.pathname}`)
  return next()
})

export const onRequest = sequence(auth, logging)
```

Requests pass through `auth` then `logging`; responses come back in reverse. Type `locals` once:

```ts
// src/env.d.ts
declare namespace App {
  interface Locals {
    user: { id: string; name: string } | null
  }
}
```

## 6. Deprecated and removed APIs

### Removed (they throw or do not exist)

| Gone | Use instead |
|---------|-------------|
| `Astro.glob()` and `Astro.fetchContent()` | `getCollection()` (import it from `astro:content`) |
| `getEntryBySlug()` | `getEntry()` with the full id |
| `entry.render()` and `entry.slug` | `render(entry)` and `entry.id` |
| `<ViewTransitions />` | `<ClientRouter />` from `astro:transitions` |
| `output: 'hybrid'` | `'static'` plus `prerender = false` on the pages that need it |
| `astro.config.cjs` | `.ts` or `.mjs` |
| `src/content/config.ts` | `src/content.config.ts` |
| `defineCollection({ type: 'content' })` and the `legacy.collections` flag | a `loader` on every collection (Content Layer API) |

### Deprecated (still run, replace now)

| Old | Use instead |
|---------|-------------|
| `@astrojs/tailwind` integration | the `@tailwindcss/vite` Vite plugin |
| `z` from `astro:content` or `astro:schema` | `z` from `astro/zod` |
| the string form of `session.driver` and the separate `session.options` | `sessionDrivers.<name>(...)` from `astro/config` |
| `markdown.remarkPlugins`, `rehypePlugins`, `remarkRehype` (Astro 7) | still work, but need `@astrojs/markdown-remark`; see section 1 |

## 7. Adapters

An adapter is required only for on-demand rendering, server islands or Actions. A fully static site needs none.

Install any of them with `npx astro add <name>` (name = `node`, `vercel`, `netlify` or `cloudflare`).

- Cloudflare Workers uses `@astrojs/cloudflare`; Astro 6 requires version 13 or later of the adapter (Astro's Cloudflare integration guide).
- Self-hosting on Node.js or in Docker uses `@astrojs/node`.
- Vercel uses `@astrojs/vercel`, and Netlify uses `@astrojs/netlify`.
