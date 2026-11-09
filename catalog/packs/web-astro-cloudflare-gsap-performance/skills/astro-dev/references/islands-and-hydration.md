# Islands and Hydration

Astro sends pages as static HTML and wakes up only the interactive parts, the islands. A React, Vue or Svelte component gets no JavaScript at all unless you give it a `client:*` directive; without one it is plain HTML.

## The client directives

| Directive | Hydrates | Typical use |
|---|---|---|
| `client:load` | right away | things that must work at once: modals, nav dropdowns |
| `client:idle` | once the browser is idle (`requestIdleCallback`) | useful but not urgent: comments, sidebars |
| `client:visible` | when it scrolls into view | lower parts of the page: carousels, footer widgets |
| `client:media="(max-width: 768px)"` | when the media query matches | mobile-only behaviour |
| `client:only="react"` | right away, **with no server render at all** | components that need `window` or `document` |

### Choosing one

```
Does it need to be interactive?
├── No  → no directive (static HTML, no JS)
├── Yes → must it work on first paint?
│   ├── Yes → client:load
│   └── No  → is it above the fold?
│       ├── Yes → client:idle
│       └── No  → client:visible
│
Does it crash when rendered on the server?
└── Yes → client:only="react" (or vue, svelte, ...)
```

### In use

```astro
---
import Counter from '../components/Counter.tsx'
import HeavyChart from '../components/Chart.tsx'
import MobileMenu from '../components/MobileMenu.tsx'
---

<!-- live from the start -->
<Counter client:load />

<!-- wakes up when scrolled to -->
<HeavyChart client:visible />

<!-- wakes up on small screens only -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- no server render: it touches the window object -->
<ThemeToggle client:only="react" />
```

## Sharing state across islands

Every island hydrates as its own root, so React `Context` and Vue `provide/inject` stop at the island's edge. Use [nanostores](https://github.com/nanostores/nanostores), which any framework can read:

```ts
// src/stores/basket.ts
import { map } from 'nanostores'

export const basket = map<Record<string, number>>({})

export function addProduct(id: string) {
  basket.setKey(id, (basket.get()[id] || 0) + 1)
}
```

```tsx
// React island — src/components/BasketButton.tsx
import { useStore } from '@nanostores/react'
import { basket } from '../stores/basket'

export default function BasketButton() {
  const items = useStore(basket)
  return <button>{Object.keys(items).length} items</button>
}
```

```astro
<!-- two islands, one store; React context is not involved -->
<BasketButton client:load />
<BasketSidebar client:visible />
```

Install with `npm install nanostores @nanostores/react`, or swap in `@nanostores/vue` or `@nanostores/svelte`.

## Server islands (`server:defer`)

A server island renders in a separate request after the page is delivered. The page appears at once with fallback content in the slot, and the real component fills in when it is ready.

```astro
---
import Avatar from '../components/Avatar.astro'
import GenericAvatar from '../components/GenericAvatar.astro'
---
<Avatar server:defer>
  <GenericAvatar slot="fallback" />
</Avatar>
```

Because it runs on the server in its own request, the deferred component can use cookies, a database and so on:

```astro
---
// Avatar.astro runs on the server, in its own request
const sessionCookie = Astro.cookies.get('session')
const avatarURL = await getUserAvatar(sessionCookie)
---
<img src={avatarURL} alt="User avatar" />
```

### `server:defer` or `client:*`

| Situation | Choose |
|---|---|
| content personalised from server data (user, session) | `server:defer` |
| UI people click, type into or watch animate | a `client:*` directive |
| heavy server work that should not hold up the page | `server:defer` |
| a component that only needs browser APIs | `client:only` |

### Server island limits

- Props are encrypted and sent in the URL query string of a GET request. If the URL would pass the 2048-byte limit the guide cites, Astro switches to a POST and puts the props in the body (Astro's server islands guide). Keep props small either way. Request bodies are capped by `security.serverIslandBodySizeLimit`, which defaults to 1 MB (Astro's configuration reference).
- Props must be serializable: objects, strings, numbers, arrays, Date, Map, Set, URL, RegExp. Functions and circular references fail.
- An adapter is required, because the feature relies on on-demand rendering.
- The island is a separate request, so the page URL is not its own. Take it from `Astro.request.headers.get('Referer')`.
- If you deploy to several places, set the same `ASTRO_KEY` everywhere (create one with `astro create-key`) so they can all decrypt the props.

## Pitfalls, grouped

Hydration
- No directive means static HTML and no JavaScript, so clicks will not work.
- `client:only` must name its framework: `client:only="react"`.
- `client:media` decides when to hydrate, not what is visible; use CSS for showing and hiding.
- `client:load` on every island is wasteful; use `client:idle` or `client:visible` for non-critical ones (but see the rule of thumb for clickable controls).

Shared state and server work
- Wrapping several islands in one React `<Provider>` does not work; use nanostores.
- Personalised or slow content should use `server:defer` so it does not block the page.
