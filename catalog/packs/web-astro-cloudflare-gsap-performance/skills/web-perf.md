---
name: web-perf
description: Audits page performance with DevTools MCP: Core Web Vitals, render-blocking, request chains, layout shifts, caching, accessibility. Use when asked to audit, profile, debug or optimize load, Lighthouse scores, site speed. Biases towards retrieval of current documentation over pre-trained knowledge.
metadata:
  category: web
  author: Richicinschi
  domain: web / Cloudflare (web-perf)
---

# Web performance audit

You run a page through a real browser trace, read the numbers, and report what is slow and why. Metric thresholds, DevTools insight names and tuning advice drift between releases. Fetch the pages below and check any number or recommendation against them before you cite it, instead of trusting memory.

## Where to look numbers up

| Need | Page |
|---|---|
| Vitals definitions and thresholds | `https://web.dev/articles/vitals` |
| Trace and tooling behaviour | `https://developer.chrome.com/docs/devtools/performance` |
| Lighthouse weights and cut-offs | `https://developer.chrome.com/docs/lighthouse/performance/performance-scoring` |

## Before you start

Call `navigate_page` or `performance_start_trace` once. If neither exists, stop: the chrome-devtools MCP server is not set up. Tell the user to add it to their MCP config and come back. The standard form is:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

Some clients use a different config shape, so point the user at the chrome-devtools-mcp README for their client.

## Working rules

1. Check a suspicion against requests, the DOM or the code, then state the result flatly. No hedging on things you verified.
2. Never tell someone to delete a thing until you have shown it is unused.
3. Rank by the savings the insights report. A change worth 0 ms does not make the list.
4. A render-blocking file with 0 ms estimated cost gets one line of mention and no action item.
5. Name the file and the fix: "convert banner.jpg (620 KB) to AVIF", not "optimize images".
6. If the page is already fast (say LCP 0.9 s, CLS 0.01), say it is excellent, and keep the report short.

## Tool cheat sheet

Call forms, in the order you use them:

```
navigate_page(url: "...")                       # load the page
performance_start_trace(autoStop: true, reload: true)   # record a cold load
performance_analyze_insight(insightSetId: "...", insightName: "...")   # read one insight
list_network_requests(resourceTypes: ["Script", "Stylesheet", ...])   # list requests
get_network_request(reqid: <id>)                # one request in detail
take_snapshot(verbose: true)                    # accessibility tree
```

Every one of these also needs a `pageId` (the number of the open page; `list_pages` shows it). `reqid` is optional on `get_network_request`: leave it out and you get the request selected in the Network panel. The valid `resourceTypes` values come from the tool's own schema, so check it rather than trusting the sample above.

## Progress checklist

Copy this list into your reply and tick items off as you go.

```
- [ ] 1 Trace recorded
- [ ] 2 Vitals read, CLS culprits named
- [ ] 3 Network reviewed
- [ ] 4 Accessibility snapshot taken
- [ ] 5 Code reviewed (skip when you have no access to the site's code)
```

## Step 1: record the trace

1. `navigate_page(url: "<target-url>")`
2. `performance_start_trace(autoStop: true, reload: true)`. The reload makes it a cold load.
3. Wait until the trace finishes, then read what came back.

If the trace is empty or errors, check that the page loaded (`navigate_page`), then run the trace again. If an insight name later fails, read the trace response: it lists the insights that exist.

## Step 2: read the vitals

Pull each insight with `performance_analyze_insight`, using the `insightSetId` from the trace response. Names change between DevTools versions, so when one fails, take the real name from that response.

| Topic | Insight | Shows |
|---|---|---|
| LCP | `LCPBreakdown` | Time split into TTFB, resource load and render delay |
| CLS | `CLSCulprits` | Shifting elements: images with no size, injected blocks, font swaps |
| Blocking | `RenderBlocking` | CSS and JS that hold back first paint |
| Server | `DocumentLatency` | Slow document response |
| Chains | `NetworkRequestsDepGraph` | Requests that wait on other requests |

```
performance_analyze_insight(insightSetId: "<id-from-trace>", insightName: "LCPBreakdown")
```

Ratings, as good / needs improvement / poor. The LCP, INP, CLS, TTFB and FCP bands come from web.dev's article on each metric. For LCP, INP and CLS the verdict is read at the 75th percentile of real page loads; web.dev gives the TTFB figure as a rough guide only. The TBT and Speed Index bands are Lighthouse's mobile ranges, from Lighthouse's Total Blocking Time and Speed Index pages; its desktop TBT ranges are tighter. Re-check them when you cite them:

| Metric | Good | Needs improvement | Poor |
|---|---|---|---|
| TTFB | under 800 ms | under 1.8 s | over 1.8 s |
| FCP | under 1.8 s | under 3 s | over 3 s |
| LCP | under 2.5 s | under 4 s | over 4 s |
| INP | under 200 ms | under 500 ms | over 500 ms |
| TBT | under 200 ms | under 600 ms | over 600 ms |
| CLS | under 0.1 | under 0.25 | over 0.25 |
| Speed Index | under 3.4 s | under 5.8 s | over 5.8 s |

## Step 3: review the network

```
list_network_requests(resourceTypes: ["Script", "Stylesheet", "Document", "Font", "Image"])
```

Sort what you find by cause. Open any single request with `get_network_request` when the list is not enough.

**Held back by other files**
- Scripts or stylesheets in `<head>` without `async`, `defer` or `media` block rendering.
- Chains: an asset is found late because another must load first, as with CSS `@import` or fonts requested by script.

**Found too late, or hinted wrongly**
- Fonts, the hero image and key scripts that nobody preloads.
- A preconnect the insights flag: search the requests for its origin. Zero requests means it is unused, so recommend removing it. Requests that begin late mean the hint may still be worth keeping.

**Fetched again and again**
- Missing or weak `Cache-Control`, `ETag` or `Last-Modified`.

**Too big**
- Bundles served uncompressed or far larger than they need to be.

## Step 4: accessibility snapshot

Run `take_snapshot(verbose: true)` and flag these, most user-visible first:

- Buttons, links and inputs that have no accessible name.
- Focus traps, or focus with no visible ring.
- Text that fails WCAG AA contrast (success criterion 1.4.3 in WCAG 2.2: normal text needs 4.5:1, large text 3:1).
- ARIA ids that are duplicated or missing.

## Step 5: read the code

Skip this when you have no access to the site's code, for example a third-party site.

### Find the stack

The config file that exists names the tool:

- Astro uses `astro.config.mjs`; SvelteKit uses `svelte.config.js`.
- Next.js has `next.config.js` or `.mjs`; Nuxt has `nuxt.config.js` or `.ts`.
- Vite has `vite.config.js` or `.ts`; Rollup has `rollup.config.js` or `.mjs`.
- Webpack has `webpack.config.js` or a `webpack.*.js` variant.
- esbuild may only appear as a build script that calls `esbuild`.
- Parcel shows as `.parcelrc` or a `parcel` field in `package.json`.

Read `package.json` too, for framework dependencies and build scripts.

### Build output

- Which minifier runs: `terser`, `esbuild` or `swc`.
- gzip or brotli, in build output or on the server.
- Production source maps should be external or off.

### Code that ships but is not needed

- Webpack: `mode: 'production'`, `sideEffects` in `package.json`, `usedExports`.
- Vite and Rollup shake trees by default; look for a `treeshake` override.
- Barrel files that re-export everything, and big libraries imported whole (a full icon set, a charting suite).
- Eager imports that could be dynamic.
- CSS: CSS-in-JS versus extracted static CSS, and the purge setup (PurgeCSS, UnCSS, or Tailwind's `content` globs).
- Polyfills: `@babel/preset-env` `targets` and `useBuiltIns`; `core-js` imports, often far bigger than needed; a `browserslist` that reaches too far back.

## Report format

1. Vitals summary: a table of metric, value, rating.
2. Top issues, ordered, each tagged high, medium or low impact.
3. Fixes: concrete, with code or config where it helps.
4. Code findings: detected stack and savings available. Leave this out when you had no code access.
