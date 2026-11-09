# Blog Recipes

Each recipe below combines several Astro features, so one docs search will not give you the whole picture.

For a lone question such as "what does `paginate()` accept?", call `search_astro_docs()` instead.

## RSS feed from a content collection

Generated code often reaches for `pagesGlobToRssItems()`. That helper is meant for plain `src/pages/*.md` files. With a collection, read the entries and map them:

```ts
// src/pages/rss.xml.ts
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET(context) {
  const posts = await getCollection('notes', ({ data }) => !data.draft)
  return rss({
    title: 'Field Notes',
    description: 'Short notes on building sites',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/notes/${post.id}/`,
    })),
  })
}
```

Watch for:
- `site` must be set in `astro.config.ts`, otherwise the feed throws.
- Do not combine `pagesGlobToRssItems()` with collections.
- To put full post bodies in the feed, convert markdown with `markdown-it` and clean it with `sanitize-html`. `render()` returns a component, not an HTML string.

Let readers' feed apps find it by adding this to the layout's `<head>`:
```html
<link rel="alternate" type="application/rss+xml" title="Field Notes" href={new URL('rss.xml', Astro.site)} />
```

## Pagination

The page size of 10 in these examples is a starting point, not a requirement.

Slicing an array by hand is unnecessary; `paginate()` is passed to `getStaticPaths`.

```astro
---
// src/pages/notes/[page].astro
import { getCollection } from 'astro:content'

export async function getStaticPaths({ paginate }) {
  const posts = (await getCollection('notes', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  return paginate(posts, { pageSize: 10 })
}

const { page } = Astro.props
---
{page.data.map(post => <PostCard post={post} />)}

<nav>
  {page.url.prev && <a href={page.url.prev}>Previous</a>}
  <span>Page {page.currentPage} of {page.lastPage}</span>
  {page.url.next && <a href={page.url.next}>Next</a>}
</nav>
```

Name the file `[...page].astro` (a rest parameter) so page 1 lives at `/notes` and not `/notes/1`.

## Tag pages that are also paginated

Combine `flatMap` with `paginate()`:

```astro
---
// src/pages/tag/[tag]/[...page].astro
import { getCollection } from 'astro:content'

export async function getStaticPaths({ paginate }) {
  const posts = await getCollection('notes', ({ data }) => !data.draft)
  const tags = [...new Set(posts.flatMap(post => post.data.tags))]

  return tags.flatMap(tag => {
    const filtered = posts.filter(post => post.data.tags.includes(tag))
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    return paginate(filtered, { params: { tag }, pageSize: 10 })
  })
}

const { page } = Astro.props
const { tag } = Astro.params
---
<h1>Topic: {tag}</h1>
{page.data.map(post => <PostCard post={post} />)}
```

The detail to remember: pass `params: { tag }` into `paginate()` for every tag, or the routes cannot be built.

## Shiki and dark mode

The CSS variable prefix to remember is `--astro-code-*`. Do not guess `--shiki-*` names for the base variables.

```ts
// astro.config.ts
export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})
```

```css
/* dark-mode override: the class is .astro-code, not .shiki */
@media (prefers-color-scheme: dark) {
  .astro-code,
  .astro-code span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
  }
}
```

Points to know:
- Code blocks carry the class `.astro-code`.
- The base variables are `--astro-code-foreground` and `--astro-code-background`. Avoid the older `--astro-code-color-text` name.
- Shiki and CSP are incompatible. If you need CSP, use `<Prism />`.

## Overriding elements in MDX

`<Content />` takes a `components` prop that swaps HTML elements for your own components:

```astro
---
// src/pages/notes/[...id].astro
import { getEntry, render } from 'astro:content'
import CustomH2 from '../../components/CustomH2.astro'
import CustomImage from '../../components/CustomImage.astro'
import CustomCode from '../../components/CustomCode.astro'

const post = await getEntry('notes', Astro.params.id)
const { Content, headings } = await render(post)
---
<Content components={{ h2: CustomH2, img: CustomImage, code: CustomCode }} />
```

This only applies to MDX. Plain `.md` files ignore `components`.

## Table of contents

No custom parser is needed, because `render()` already hands back `headings`:

```astro
---
const { Content, headings } = await render(post)
// headings = [{ depth: 2, slug: 'intro', text: 'Introduction' }, ...]
---
<nav class="toc">
  <ul>
    {headings
      .filter(h => h.depth <= 3)
      .map(h => (
        <li style={`margin-left: ${(h.depth - 2) * 1}rem`}>
          <a href={`#${h.slug}`}>{h.text}</a>
        </li>
      ))}
  </ul>
</nav>
<Content />
```

The anchors only work because `rehype-slug` adds ids; it is on by default.

## SEO tags in one layout

Keep meta tags in a layout that takes props, rather than repeating them in each page:

```astro
---
// src/layouts/PostLayout.astro
interface Props {
  title: string
  description: string
  image?: string
  date?: Date
}
const { title, description, image, date } = Astro.props
const ogImage = image || '/default-og.png'
const canonicalURL = new URL(Astro.url.pathname, Astro.site)
---
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={new URL(ogImage, Astro.site)} />
  <meta property="og:url" content={canonicalURL} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={new URL(ogImage, Astro.site)} />

  {date && <meta property="article:published_time" content={date.toISOString()} />}
</head>
<body>
  <slot />
</body>
</html>
```

Call it from a page:
```astro
<PostLayout title={entry.data.title} description={entry.data.description} date={entry.data.date}>
```

## Reading time

There is no need for an npm package. A short remark plugin does it. The divisor is a rule of thumb: 200 words per minute is a common reading-speed assumption, so tune it to your readers:

```ts
// src/plugins/reading-time.ts
import { toString } from 'mdast-util-to-string'

export function remarkReadingTime() {
  return (tree, { data }) => {
    const text = toString(tree)
    const words = text.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    data.astro.frontmatter.readingTime = `${minutes} min read`
  }
}
```

```ts
// astro.config.ts
import { remarkReadingTime } from './src/plugins/reading-time'

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
})
```

Read the value back through `remarkPluginFrontmatter`:
```astro
---
const { remarkPluginFrontmatter } = await render(post)
---
<span>{remarkPluginFrontmatter.readingTime}</span>
```

## Previous and next links

Sort the posts, find the current one, take its neighbours. Do not look entries up by position in the folder.

```astro
---
const allPosts = (await getCollection('notes', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())

const currentIndex = allPosts.findIndex(p => p.id === post.id)
const prev = allPosts[currentIndex + 1] // older post
const next = allPosts[currentIndex - 1] // newer post
---
<nav>
  {prev && <a href={`/notes/${prev.id}`}>← {prev.data.title}</a>}
  {next && <a href={`/notes/${next.id}`}>{next.data.title} →</a>}
</nav>
```

## Blog pitfalls, grouped

Feeds and paging
- `pagesGlobToRssItems()` is for plain `src/pages` files; for a collection, `getCollection()` then `map()` into RSS items.
- Slice-by-hand paging is unnecessary: use `paginate()` inside `getStaticPaths`, and pass `params: { tag }` to it for each tag group.

Rendering
- Code blocks carry `.astro-code`, not `.shiki`; the base variable is `--astro-code-foreground`.
- Headings come from the `headings` array that `render()` returns; do not parse them yourself.
- `<Content components={...}>` overrides work on MDX only.

Page furniture
- OG and Twitter tags belong in one layout component with props, not in every page.
- Reading time needs a small remark plugin using `mdast-util-to-string`, not an extra package.
