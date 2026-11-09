---
name: astro-dev
description: "Use when editing .astro/.mdx, astro.config.*, content collections (build-time or live), Tailwind CSS v4, client directives (client:load/idle/visible), forms/actions/Zod 4, server sessions, i18n, env vars, CSP, Cloudflare Workers, view transitions, <ClientRouter />, adapters (Node/Vercel/Netlify)."
version: 0.2.0
tags: [tailwind, astro, islands, content-collections, frontend]
metadata:
  category: web
  author: Richicinschi
  domain: Astro 6 and 7 with Tailwind v4, Cloudflare adapters and islands
  companion: documentation search through the studio-wide astro-docs MCP server
---

# Astro Dev

Older Astro habits (versions 3 to 5) still leak into generated code. This skill lists the corrections that matter for Astro 6 and 7, grouped by area, and points at small reference files.

## First: which Astro is this project on?

Everything below depends on the major version, so read it before writing code.

| Look at | What it settles |
|---|---|
| `astro` in `package.json` | 6 or 7. Notes marked "Astro 7" apply only there. Astro 5 or older: upgrade advice first, the guides cover each step. |
| Node version | Astro 6 needs 22.12.0 or newer (Astro's v6 upgrade guide). For 7, read Astro's v7 upgrade guide, which does not restate Node. |
| Config file name | `astro.config.ts` or `.mjs`. A `.cjs` file fails. |
| Content config path | `src/content.config.ts`. The old `src/content/config.ts` is an error from Astro 6. |
| Tailwind wiring | the `@tailwindcss/vite` plugin, not the deprecated `@astrojs/tailwind` |
| Markdown setup (Astro 7) | whether `markdown.processor` is set; see the markdown group below |

## Where to look things up

- Single question about an option or signature: the Astro Docs MCP, `search_astro_docs({ query: "..." })`.
- Which old habit to drop, how features combine, which approach to pick: this skill.
- No MCP in the session: fetch the single documentation pages listed in `astro-dev/references/doc-endpoints.md`. The old text-dump files were dead when checked, so do not rely on them.

Load only the references the task needs. Never preload them all.

- Setup, core APIs, styling, scripts, middleware, version changes: `astro-core-patterns.md`
- Schemas, loaders, queries, Zod 4: `content-collections.md`
- RSS, paging, tag pages, SEO, contents list, Shiki: `blog-recipes.md`
- Tailwind setup, theming, fonts: `tailwind.md`
- Islands, hydration, client directives: `islands-and-hydration.md`
- Forms, Actions, mutations: `actions-and-forms.md`
- ClientRouter, page transitions, scripts across navigations: `view-transitions.md`
- Sessions, env vars, i18n, CSP, Cloudflare, prerendering: `server-features.md`
- Where the docs live: `doc-endpoints.md`

(All under `astro-dev/references/`.)

---

## Corrections, by area

### Config and styling

**ESM only for the config file.** `astro.config.cjs` with `module.exports` throws; use `.ts` or `.mjs`:
```ts
import { defineConfig } from 'astro/config'
export default defineConfig({ ... })
```

**Tailwind v4 lives in CSS.** Do NOT use `@astrojs/tailwind` (deprecated); use the `@tailwindcss/vite` Vite plugin and these CSS lines:
```css
/* old */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* current */
@import "tailwindcss";
@theme inline {
  --color-primary: oklch(0.55 0.22 285);
}
```
More in `astro-dev/references/tailwind.md`.

**Scoped styles stop at a component boundary, and `class` is not forwarded.** The child must accept it:
```astro
<!-- the class below is silently dropped -->
<Card class="mt-4" />

<!-- Card.astro has to take it and apply it -->
---
const { class: className, ...rest } = Astro.props
---
<div class:list={['card', className]} {...rest}>
  <slot />
</div>
```
Style slotted or markdown-rendered content with `:global()`. Fuller notes: `astro-dev/references/astro-core-patterns.md`.

### Content collections

**Every collection needs a `loader`, and the config sits at `src/content.config.ts`.** Three legacy forms now throw: the file `src/content/config.ts`, `defineCollection({ type: 'content' })`, and a collection with no loader.
```ts
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: ({ image }) => z.object({ cover: image().optional() }),
})
```
The schema is a function when it needs helpers such as `image()`; a plain object is fine otherwise. Details: `astro-dev/references/content-collections.md`.

**Read entries with the collection functions.** `Astro.glob()` no longer exists, and `render` is imported rather than called on the entry:
```ts
import { getCollection, render } from 'astro:content'
const posts = await getCollection('notes')
const { Content } = await render(posts[0])   // not posts[0].render()
```

**Always import Zod from `astro/zod`.** Taking `z` from `astro:content` or `astro:schema` is deprecated in Astro 6. Zod 4 spellings: `z.email()` for `z.string().email()`, `{ error: }` for `{ message: }`.

### Markdown pipeline

**Know which pipeline the project uses before touching remark or rehype plugins.**

- Astro 6, or Astro 7 with `markdown.processor: unified()`: integrations put their remark and rehype plugins at the front of the list while `astro:config:setup` runs, so entries in `markdown.remarkPlugins` run after them. To go first, write a small integration that puts your plugin at the front of the current list, and list it after the integration you want to precede:
```ts
export function myIntegration(): AstroIntegration {
  return {
    name: 'my-plugin',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        const existing = [...(config.markdown?.remarkPlugins || [])]
        updateConfig({
          markdown: { remarkPlugins: [myRemarkPlugin, ...existing] },
        })
      },
    },
  }
}
```
  Simpler where available: the rehype build of the plugin (for instance `rehype-expressive-code` instead of `astro-expressive-code`) in `markdown.rehypePlugins`, which run in array order, after every remark plugin.
- Astro 7 by default: Astro's v7 upgrade guide says `.md` and `.mdx` go through Sätteri, `@astrojs/markdown-remark` is no longer installed by default, and the `remarkPlugins`, `rehypePlugins` and `remarkRehype` options are deprecated and need that package. To keep unified plugins, install it and set `markdown.processor: unified()`. The ordering advice above only applies in that mode.

### Rendering mode and server features

**Per-visitor features need on-demand rendering.** Cookies, sessions, Actions and POST handling all fail quietly on a prerendered page:
```astro
---
export const prerender = false
const session = Astro.cookies.get('session')
---
```

**Frontmatter `fetch()` runs at build time on a static page.** Per-request data needs `prerender = false`; refreshing in the browser needs a framework component with a `client:*` directive.
```astro
---
const data = await fetch('https://api.example.com/data').then(r => r.json())
---
```

**Forms use Actions, not hand-written API routes.** Actions are typed, validated and origin-checked:
```ts
// src/actions/index.ts
export const server = {
  join: defineAction({
    accept: 'form',
    input: z.object({ email: z.email() }),
    handler: async (input) => { ... },
  }),
}
```
More in `astro-dev/references/actions-and-forms.md`.

**Environment variables come from `astro:env`.**
```ts
// instead of process.env.API_KEY across the app
import { API_KEY } from 'astro:env/server'
```
Astro 6 bakes `import.meta.env` into the build output. A value the server must read while running comes from an `astro:env` secret or from `process.env`. Details are in `astro-dev/references/server-features.md`.

**Locale routing is built in.** Do not hand-roll it. In Astro 6 the default of `redirectToDefaultLocale` is `false`.
```ts
i18n: { defaultLocale: 'en', locales: ['en', 'de', 'fr'] }
```

### Components and hydration

**Pick the `client:` directive by urgency, in both directions.** Eager everywhere is wasteful; lazy on a control people use at once loses clicks.
```astro
<Counter client:load />      <!-- needed immediately -->
<Sidebar client:idle />      <!-- useful, not urgent -->
<Footer client:visible />    <!-- below the fold -->

<SearchButton client:load /> <!-- NOT client:idle: an early click is lost -->
```
As a rule of thumb, anything a visitor may click within the first 2 seconds must be `client:load`. More in `astro-dev/references/islands-and-hydration.md`.

**A `<script>` in a component is bundled once, however many instances render.** Loop over instances yourself, and hand server values over with `data-*` attributes, not template expressions. `define:vars` turns the script into `is:inline`, meaning no bundling.

### With `<ClientRouter />`

- **Start code from `astro:page-load`.** It covers the first load and each navigation. Calling the function directly plus an `after-swap` listener breaks one of the two cases.
- **Delegate events from `document`.** Swapped elements lose their own listeners.
```ts
document.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('.btn')) handler()
})
```
- **Carry theme or other state onto the incoming document.** Astro's own theme example does it in `astro:after-swap`; `astro:before-swap` with `e.newDocument` also works. Either way, set it before the page shows.
```ts
document.addEventListener('astro:before-swap', (e) => {
  e.newDocument.documentElement.setAttribute('data-theme',
    localStorage.getItem('theme-preference') || 'light')
})
```
- **Rules that hide content at first paint must go in `global.css`.** A `display: none` rule in a component's `<style is:global>` arrives after the HTML has painted, so the hidden element shows briefly (FOUC). Full patterns: `astro-dev/references/view-transitions.md`.

---

## A typical integration setup

Ready-to-copy files are in `astro-dev/templates/`.

```ts
// astro.config.ts
import { defineConfig, fontProviders } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Rubik',
      cssVariable: '--font-rubik',
      weights: ['100 900'],
    },
  ],
})
```
