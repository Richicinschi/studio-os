---
name: performance-optimization
description: >-
  Use when performance requirements exist, regression is suspected, or profiling reveals bottleneck in Core Web Vitals, load times. Studio: richicinschi-website/scripts/perf-trace.mjs runs 4x-CPU-throttle; Lighthouse via chrome-devtools MCP if installed. See web-perf-lessons memory: measured gotchas.
metadata:
  category: engineering
  author: Richicinschi
  version: 2.0.0
  domain: speed work on web pages and services, vitals and profiling
---

# Performance Optimization

A guess about speed is usually wrong, and a wrong guess leaves behind complexity that buys nothing. So the order is fixed: take a number, find the real cause, change one thing, take the number again. Touch only what the numbers point at.

## Use it when

- The spec sets a speed target (a load-time budget, a response-time SLA).
- Users or monitoring say something is slow.
- Core Web Vitals sit outside the "good" band.
- A recent change may have made things slower.
- The feature will meet big datasets or heavy traffic.

## Do not use it when

There is no sign of a problem yet. Speculative tuning adds code that costs more to maintain than it ever saves.

## Studio tools

- Web pages: `richicinschi-website/scripts/perf-trace.mjs` compares two builds under a 4x CPU throttle (A/B runs).
- The chrome-devtools MCP, when installed, gives a Lighthouse audit and a Core Web Vitals trace.
- The web-perf-lessons memory lists traps already hit while measuring. Read it before trusting a number.

## Web Vitals thresholds

Bands as published in web.dev's Web Vitals articles (one each for LCP, INP and CLS).

| Metric | Good | Needs work | Poor |
|--------|------|------------|------|
| **LCP** (Largest Contentful Paint) | up to 2.5 s | up to 4.0 s | over 4.0 s |
| **INP** (Interaction to Next Paint) | up to 200 ms | up to 500 ms | over 500 ms |
| **CLS** (Cumulative Layout Shift) | up to 0.1 | up to 0.25 | over 0.25 |

## The loop

```
1. MEASURE  - get a baseline from real data
2. IDENTIFY - locate the bottleneck, do not assume it
3. FIX      - change only that cause
4. VERIFY   - measure again and compare
5. GUARD    - leave a test or monitor so it cannot creep back
```

### Stage 1: Measure

Use two kinds of data, because each covers the other's blind spot.

- **Synthetic** (Lighthouse, the DevTools Performance tab): fixed conditions, repeatable. Good for catching regressions in CI and for isolating one issue.
- **Field data / RUM** (the web-vitals library, CrUX): what real people got on real devices. This is the only proof that a fix helped users.

Frontend:
```bash
# Synthetic: run Lighthouse from DevTools or CI
# DevTools -> Performance tab -> Record
# or take a trace through the Chrome DevTools MCP

# Field: log vitals from the page itself
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

Backend:
```bash
# Log response times, use an APM, and time database queries.

# Quick stopwatch around one call
console.time('load-orders');
const rows = await db.query(...);
console.timeEnd('load-orders');
```

### Where to look first

Pick the starting point from the symptom.

```
What is slow?
├── The first load
│   ├── Big bundle?            --> check bundle size and code splitting
│   ├── Slow server reply?     --> read TTFB in the Network waterfall
│   │   ├── DNS slow?          --> dns-prefetch / preconnect to known origins
│   │   ├── TCP/TLS slow?      --> HTTP/2, an edge deployment, keep-alive
│   │   └── Server wait slow?  --> profile the backend, queries, caching
│   └── Blocking resources?    --> look for CSS/JS that holds up rendering
├── An interaction
│   ├── Freeze on click?       --> profile the main thread for long tasks (web.dev defines these as over 50 ms)
│   ├── Typing lag in a form?  --> count re-renders, controlled inputs
│   └── Choppy animation?      --> layout thrashing, forced reflow
├── A page after navigating
│   ├── Waiting on data?       --> time the API calls, look for request waterfalls
│   └── Slow client render?    --> profile component render time, N+1 fetches
└── Backend / API
    ├── One endpoint slow?     --> profile its queries, check indexes
    ├── Everything slow?       --> connection pool, memory, CPU
    └── Slow now and then?     --> lock contention, GC pauses, outside services
```

### Stage 2: Identify the bottleneck

Frontend:

| What you see | Usual cause | Check |
|---|---|---|
| Late LCP | Heavy images, blocking resources, slow server | Network waterfall, image weights |
| High CLS | Images without size, content injected late, font swaps | Layout-shift attribution |
| Bad INP | Too much JavaScript on the main thread, big DOM updates | Long tasks in the trace |
| Slow first load | Large bundle, many requests | Bundle size, splitting |

Backend:

| What you see | Usual cause | Check |
|---|---|---|
| Slow API replies | N+1 queries, missing indexes, poor queries | Query log |
| Memory climbing | Stray references, caches with no cap, huge payloads | Heap snapshot |
| CPU spikes | Heavy synchronous work, regex backtracking | CPU profile |
| High latency | No cache, repeated work, extra network hops | Trace one request end to end |

### Stage 3: Fix the usual suspects

#### N+1 queries

```typescript
// BAD: one extra query for every order
const orders = await db.orders.findMany();
for (const order of orders) {
  order.customer = await db.customers.findUnique({ where: { id: order.customerId } });
}

// GOOD: one query that loads the customer with it
const orders = await db.orders.findMany({
  include: { customer: true },
});
```

#### Fetching without a limit

```typescript
// BAD: every row, every time
const everyInvoice = await db.invoices.findMany();

// GOOD: a page at a time, latest due date first
const invoices = await db.invoices.findMany({
  take: 25,
  skip: (page - 1) * 25,
  orderBy: { dueDate: 'desc' },
});
```

#### Images

Always give an image its width and height so the layout does not jump. The hero (the likely LCP element) gets high fetch priority. Anything below the fold loads lazily.

```html
<!-- BAD: no size, one heavy format -->
<img src="/banner.jpg" />

<!-- GOOD banner: a square crop on small screens (media), several widths per
     crop (srcset + sizes), AVIF first with WebP behind it -->
<picture>
  <!-- small screens: square crop -->
  <source
    media="(max-width: 599px)"
    srcset="/banner-sq-320.avif 320w, /banner-sq-640.avif 640w"
    sizes="100vw"
    width="640"
    height="640"
    type="image/avif"
  />
  <source
    media="(max-width: 599px)"
    srcset="/banner-sq-320.webp 320w, /banner-sq-640.webp 640w"
    sizes="100vw"
    width="640"
    height="640"
    type="image/webp"
  />
  <!-- everything wider: 3:1 strip -->
  <source
    srcset="/banner-960.avif 960w, /banner-1440.avif 1440w"
    sizes="(max-width: 1440px) 100vw, 1440px"
    width="1440"
    height="480"
    type="image/avif"
  />
  <source
    srcset="/banner-960.webp 960w, /banner-1440.webp 1440w"
    sizes="(max-width: 1440px) 100vw, 1440px"
    width="1440"
    height="480"
    type="image/webp"
  />
  <img
    src="/banner-wide.jpg"
    width="1440"
    height="480"
    fetchpriority="high"
    alt="Describe the banner"
  />
</picture>

<!-- GOOD below the fold: lazy, decoded off the main path -->
<img
  src="/gallery-3.webp"
  width="600"
  height="450"
  loading="lazy"
  decoding="async"
  alt="Describe the photo"
/>
```

#### React re-renders

```tsx
// BAD: a fresh object each render makes the child re-render every time
function ProductGrid() {
  return <ProductToolbar view={{ layout: 'grid', columns: 3 }} />;
}

// GOOD: define it once, outside the component
const GRID_VIEW = { layout: 'grid', columns: 3 } as const;
function ProductGrid() {
  return <ProductToolbar view={GRID_VIEW} />;
}

// Skip re-rendering a costly card whose props did not change
const ProductCard = React.memo(function ProductCard({ product }: Props) {
  return <div>{/* costly render */}</div>;
});

// Cache a costly calculation between renders
function CartTotals({ lines }: Props) {
  const totals = useMemo(() => sumLines(lines), [lines]);
  return <div>{totals.items} items, {totals.price}</div>;
}
```

#### Bundle size

```typescript
// Vite and webpack 5+ tree-shake named imports without help, as long as the
// package ships ES modules and declares `sideEffects: false`. Rewriting import
// styles rarely pays; splitting and lazy loading do. Measure before editing.

// Load a heavy, seldom-used feature on demand
const PdfExporter = lazy(() => import('./PdfExporter'));

// Split per route, with a fallback while the chunk arrives
const ReportsPage = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ReportsPage />
    </Suspense>
  );
}
```

#### Caching on the backend

```typescript
// Hold data that is read often and changes rarely
const RATES_TTL = 10 * 60 * 1000; // ten minutes
let cachedRates: ExchangeRates | null = null;
let ratesExpiry = 0;

async function getRates(): Promise<ExchangeRates> {
  if (cachedRates && Date.now() < ratesExpiry) {
    return cachedRates;
  }
  cachedRates = await db.rates.findFirst();
  ratesExpiry = Date.now() + RATES_TTL;
  return cachedRates;
}

// Static files: a year is the usual rule of thumb; safe only when filenames carry a content hash
app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true,
}));

// API responses that may be reused briefly
res.set('Cache-Control', 'public, max-age=120'); // two minutes
```

## Budget

Write the limits down and let CI enforce them. The sizes and the p95 line below are example team budgets, not published standards; the Total Blocking Time line follows web.dev's Total Blocking Time article (under 200 ms on average mobile hardware) and the INP line follows web.dev's Interaction to Next Paint article (good up to 200 ms, poor above 500 ms).

```
Initial JavaScript:   under 170 KB gzipped
CSS:                  under 40 KB gzipped
Image above the fold: under 150 KB each
Fonts:                under 80 KB in total
API response, p95:    under 200 ms
Total Blocking Time:  under 200 ms on average mobile hardware
INP:                  200 ms or less
Lighthouse score:     90 or higher (Lighthouse's own "good" band for the score)
```

In CI:
```bash
# fail the build when the bundle outgrows its limit
npx bundlesize --config bundlesize.config.json

# Lighthouse CI
npx lhci autorun
```

## Excuses

| What gets said | What is true |
|---|---|
| "We can speed it up later." | Slowness piles up like interest. Remove the obvious anti-patterns now; leave micro-tuning for later. |
| "It runs fine on my laptop." | Your laptop is not your user's phone. Test on typical hardware and a typical network. |
| "This change is clearly faster." | Without a before and after number you do not know that. |
| "Nobody feels a small delay." | Interaction delay is a published Core Web Vitals measure (INP) because people do feel it. Look at your own INP numbers. |
| "The framework takes care of speed." | It avoids some mistakes. It cannot fix an N+1 query or a bloated bundle. |

## Warning signs

- Tuning with no profile to justify it.
- N+1 patterns in data access.
- List endpoints that return everything.
- Images missing size, lazy loading or responsive variants.
- A bundle that grows and nobody reviews it.
- Nothing watching speed in production.
- `React.memo` and `useMemo` sprinkled everywhere. Too much is as harmful as too little.

## Before you call it done

- [ ] Numbers from before and after the change are on record.
- [ ] The named bottleneck is the one that was fixed.
- [ ] Core Web Vitals are in the "good" band.
- [ ] Bundle size did not jump.
- [ ] New data-access code has no N+1.
- [ ] The CI budget passes, where one exists.
- [ ] The existing tests still pass, so behaviour is unchanged.
