# Content Collections

## Where the config lives

The file is `src/content.config.ts`, directly under `src`. If Astro 6 finds `src/content/config.ts` it raises an error; there is no fallback to the old path.

## Build-time collections

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob, file } from 'astro/loaders'

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      image: image().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
})

const people = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    avatar: z.string(),
    bio: z.string().optional(),
  }),
})

export const collections = { notes, people }
```

Points to take from it:

- A `loader` is mandatory. No folder is picked up by convention, and Astro 6 stops with an error when it is missing.
- Use the function form of `schema` when you need helpers like `image()`. A plain `z.object(...)` is fine when you do not.
- Content may sit anywhere on disk; the loader's `base` tells Astro where.
- `z` comes from `astro/zod`. Taking it from `astro:content` is deprecated in Astro 6.
- Astro 6 runs Zod 4, so `z.string().email()` is now `z.email()` and the `{message:}` option is now `{error:}`.

## The loaders

### `glob`: Markdown and MDX from disk
```ts
import { glob } from 'astro/loaders'
loader: glob({
  pattern: '**/*.{md,mdx}',
  base: './src/content/notes',
})
```

### `file`: one JSON or YAML data file
```ts
import { file } from 'astro/loaders'
loader: file('./src/data/navigation.json')
```

### Your own loader: any source at all
```ts
import type { Loader } from 'astro/loaders'

// Astro 6: end with `satisfies Loader` so the types are inferred
const myLoader = {
  name: 'custom-loader',
  load: async ({ store }) => {
    const data = await fetch('https://api.example.com/posts').then(r => r.json())
    for (const item of data) {
      store.set({ id: item.slug, data: item })
    }
  },
} satisfies Loader
```

## Reading build-time collections

```ts
import { getCollection, getEntry, render } from 'astro:content'

// everything, or filtered by a callback
const posts = await getCollection('notes')
const published = await getCollection('notes', ({ data }) => !data.draft)

// a single entry, by id
const post = await getEntry('notes', 'first-entry')

// turn it into renderable output
const { Content, headings, remarkPluginFrontmatter } = await render(post)
```

## Live collections (Astro 6)

A live collection pulls its data when a request arrives, not during the build. For the whole API, ask the MCP (`search_astro_docs("live content collections")`).

What differs from the build-time kind:

| | Build-time | Live |
|---|---|---|
| Declared in | `src/content.config.ts` | `src/live.config.ts` |
| Defined by | `defineCollection()` | `defineLiveCollection()` |
| Read with | `getCollection()` / `getEntry()` | `getLiveCollection()` / `getLiveEntry()` |
| Executes | during the build | per request |
| Adapter | optional | required |
| Bundled loaders | `glob`, `file` | none; write your own |

Things that trip people up:
- A page that reads a live collection needs `export const prerender = false`.
- No loader ships with Astro for this. You implement both `loadCollection` and `loadEntry`.
- The config goes in `src/live.config.ts`; do not put it in `content.config.ts`.

## What an entry looks like

```ts
interface CollectionEntry {
  id: string          // path minus extension, e.g. 'first-entry' or 'series/step-1'
  data: z.infer<...>  // frontmatter after validation
  body: string         // raw markdown source (undefined for data-only collections)
  collection: string   // name of the collection
}
```

## Validating images in a schema

```ts
schema: ({ image }) =>
  z.object({
    cover: image(),
    thumbnail: image().optional(),
  })
```

`image().refine()` does not work in Astro 6. Check image properties when you use them instead.

## Moving to Zod 4

Astro 6 includes Zod 4. The changes that touch content schemas:

```ts
import { z } from 'astro/zod'

// validators moved from string methods to the top level
z.email()           // before: z.string().email()
z.url()             // before: z.string().url()

// error text option
z.string().min(5, { error: "Too short." })   // before: { message: "..." }

// .default() after a transform takes the OUTPUT type
z.string().transform(Number).default(0)      // before: .default("0")
// to keep the old behaviour (default goes through the transform) use .prefault()
z.string().transform(Number).prefault("0")

// custom loaders: `satisfies Loader` for inference
const myLoader = { /* ... */ } satisfies Loader
```

## Recipes

### Hide drafts only in production
```ts
const posts = await getCollection('notes', ({ data }) => {
  return import.meta.env.PROD ? !data.draft : true
})
```

### Newest first
```ts
const posts = (await getCollection('notes'))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
```

### Linking one collection to another
```ts
const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    people: z.array(z.string()).optional(),
  }),
})
```
Store the ids, then look them up yourself:
```ts
const personEntries = await Promise.all(
  post.data.people.map((id) => getEntry('people', id))
)
```

### Series of posts
Nest the files in a folder: `notes/guide/step-1.md`, `notes/guide/step-2.md`. The ids come out as `guide/step-1` and `guide/step-2`. To tell whether a post belongs to a series, test `id.includes('/')`.

## Pitfalls, grouped

Definition
- Every collection needs a `loader` (`glob({...})`); Astro 6 errors otherwise.
- The config file is `src/content.config.ts`, the only valid place in Astro 6.
- `defineCollection({ type: 'content' })`: delete `type`, it is gone in Astro 6.
- A schema that calls `image()` must be the function form: `schema: ({ image }) => z.object({...})`.
- `image().refine()` is unsupported; validate when the image is used.

Reading
- `entry.render()` becomes `render(entry)`, `entry.slug` becomes `entry.id`, `getEntryBySlug()` becomes `getEntry()`.

Zod
- Import `z` from `astro/zod`, not `astro:content`.
- `z.email()` and `z.url()` replace the string methods, and `{ error: "..." }` replaces `{ message: "..." }`.
