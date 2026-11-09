# View Transitions and ClientRouter

`<ClientRouter />` turns a multi-page site into something that behaves like a single-page app, with animated page changes. Scripts, events and state then stop following full-page-load rules, and most bugs come from forgetting it.

Contents: what happens during a navigation, state across the swap, scripts and events, styling, analytics, and same-page transitions.

## What happens during a navigation

Two events matter most:

- `astro:before-swap` fires before the incoming document replaces the current one. `e.newDocument` is the incoming page, so you can change it first.
- `astro:page-load` fires at the end of a navigation, and also on the first load.
- `astro:after-swap` fires right after the swap, before the page is shown.

Astro's view transitions guide tells you to use `astro:page-load` where you would have used `DOMContentLoaded`, because `DOMContentLoaded` does not fire again on client-side navigations.

## Carrying state across the swap (theme, locale)

The incoming page's `<html>` lacks any attributes you set at runtime. Two approaches work:

```ts
// option A: Astro's own theme example uses after-swap, which runs before the page paints
document.addEventListener('astro:after-swap', () => {
  document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light')
})

// option B: write onto the incoming document before the swap
document.addEventListener('astro:before-swap', (e) => {
  const storedTheme = localStorage.getItem('theme') || 'light'
  e.newDocument.documentElement.setAttribute('data-theme', storedTheme)
})
```

Pick either; what matters is that the attribute is set before the new page becomes visible, not later from `page-load`.

## Scripts and events

### Start-up code

A script that works on the first visit but not after navigating (or the reverse) usually calls its setup in the wrong place.

```ts
// breaks one of the two cases
initFeature()
document.addEventListener('astro:after-swap', initFeature)

// covers the first load and every navigation
document.addEventListener('astro:page-load', initFeature)
```

### Listeners

Navigation replaces DOM nodes, so listeners bound to old nodes vanish with them. Delegate from `document`, which is never replaced:

```ts
// lost after a navigation
btn.addEventListener('click', handleClick)

// survives
document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('.btn')
  if (btn) handleClick(btn)
})
```

Bind directly and re-run on `astro:page-load` only for `transition:persist` elements.

### Inline scripts

Per Astro's view transitions guide, bundled module scripts run once, while inline scripts can run again during a visit. Add `data-astro-rerun` to an inline script to force it to run after every transition (it implies `is:inline`).

### `transition:persist` caveats

A persistent element keeps its DOM and its listeners through navigations:
- Re-initialising on every `astro:page-load` may bind twice; prefer delegation.
- Non-persistent children inside a persistent parent are still replaced.

## Styling: avoiding a flash

A rule that decides what is visible at first paint has to live in the global stylesheet. A component's `<style is:global>` is extracted and fetched separately, so it lands after the HTML has painted.

```css
/* wrong: inside a component <style is:global>, it arrives too late */

/* right: in global.css, present on first paint */
.lang-hidden { display: none !important; }
```

This covers `display: none` rules and any "starting state" classes.

## Analytics

Google Analytics' `gtag.js` counts only the first load; router navigations are invisible to it.

```ts
gtag('config', gaId, { send_page_view: false })

document.addEventListener('astro:page-load', () => {
  gtag('event', 'page_view', {
    page_path: window.location.pathname,
    page_title: document.title,
  })
})
```

Any tool that counts on full page loads has the same gap.

## Same-page transitions

A language switch or tab swap can use the browser's View Transition API directly:

```ts
if (document.startViewTransition) {
  document.startViewTransition(() => applyNewState())
} else {
  applyNewState()
}
```

You get the same crossfade as a page change, with no opacity tricks or `setTimeout`.
