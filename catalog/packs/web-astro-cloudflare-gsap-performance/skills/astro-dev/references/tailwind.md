# Tailwind CSS in Astro

## Setup

Add Tailwind as a Vite plugin with `@tailwindcss/vite`. The `@astrojs/tailwind` integration is deprecated.

```ts
// astro.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
})
```

Install it with `npm install tailwindcss @tailwindcss/vite`.

## The stylesheet entry

```css
/* src/styles/global.css */
@import "tailwindcss";
```

Load it from the layout:
```astro
---
// src/layouts/Layout.astro
import '../styles/global.css'
---
```

## Theming

Tailwind v4 has no `tailwind.config.js`; the theme lives in CSS.

```css
@import "tailwindcss";

@theme inline {
  --color-primary: oklch(0.55 0.22 285);
  --color-secondary: oklch(0.75 0.12 160);
  --font-sans: var(--font-rubik);
  --font-mono: 'Fira Code', monospace;
}
```

### Tying the theme to CSS variables

This is the setup for light and dark themes that swap at runtime:

```css
@import "tailwindcss";

@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-border: var(--border);
}

:root {
  --primary: oklch(0.55 0.22 285);
  --background: #ffffff;
  --foreground: #0a0a0a;
}

[data-theme='dark'] {
  --primary: oklch(0.68 0.2 285);
  --background: #1c1c1c;
  --foreground: #fafafa;
}
```

Then classes such as `bg-background text-foreground border-border` follow the active theme.

## Merging classes (clsx and tailwind-merge)

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

In a component:
```astro
---
interface Props { class?: string }
const { class: className } = Astro.props
import { cn } from '@/lib/utils'
---
<div class={cn('rounded-lg border p-4', className)}>
  <slot />
</div>
```

## Dark mode

By default v4 follows the system setting through `prefers-color-scheme`. To drive it with a toggle, define the variant yourself:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

and flip it from script with `document.documentElement.dataset.theme = 'dark'`.

## Handy facts

1. There is no `content` list. Tailwind finds your templates on its own.
2. `@apply` works inside `.astro` files, but think about specificity next to scoped styles.
3. Arbitrary values behave normally: `bg-[#1a1a1a]`, `text-[14px]`.
4. Container queries are part of core: `@container`, `@lg:flex`.
5. The old `theme()` function is replaced by plain variables such as `var(--color-primary)`.

## Fonts

The font system built into Astro 6 is stable, so do not add `<link>` tags or `@fontsource/*` packages by hand. Ask the MCP (`search_astro_docs("fonts API")`) for providers and options.

### The minimum

```ts
// astro.config.ts
import { defineConfig, fontProviders } from 'astro/config'

export default defineConfig({
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

Put `<Font />` in the layout's `<head>`, then point Tailwind at the variable:

```astro
---
import { Font } from 'astro:assets'
---
<head>
  <Font cssVariable="--font-rubik" preload />
</head>
```

```css
@theme inline {
  --font-sans: var(--font-rubik);
}
```

Fonts are downloaded and self-hosted during the build, so the site makes no CDN call at runtime. Available providers: `google()`, `fontsource()`, `local()`, `adobe()`, `bunny()`, `fontshare()`, `npm()`.

## Mistakes generated code makes

Swap these old habits for the current ones:

- Three `@tailwind` directives: write `@import "tailwindcss";` instead.
- A `tailwind.config.js` using `theme.extend`: move tokens into `@theme inline { --color-*: ... }` in the stylesheet.
- The `@astrojs/tailwind` integration: use the `@tailwindcss/vite` plugin.
- A `content` glob array: delete it, because files are detected automatically.
- `darkMode: 'class'`: declare `@custom-variant dark (...)` in CSS.
- The `theme()` helper: reference `var(--color-*)` directly.
