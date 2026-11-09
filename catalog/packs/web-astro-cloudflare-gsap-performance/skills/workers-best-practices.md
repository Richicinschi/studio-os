---
name: workers-best-practices
description: Write or review Cloudflare Workers code. Load for configuring wrangler.jsonc, writing new Workers, reviewing Worker code, or checking common Workers anti-patterns: observability gaps, bindings misuse, secrets, global state, floating promises, streaming. Favours fetching Cloudflare docs over recall.
metadata:
  category: web
  author: Richicinschi
  domain: web / Cloudflare (workers-best-practices)
---

Anything you remember about Workers APIs, types and config may be out of date. Look it up first, whether you are writing code or reviewing it.

## Look it up before you touch anything

Pull the current version of each source below before you write or judge a line. Never answer from memory about a signature, a config field or the shape of a binding.

| Question | Where the answer lives |
|----------|------------------------|
| What do the official rules say? | The Workers best-practices page: `https://developers.cloudflare.com/workers/best-practices/workers-best-practices/` |
| What is the exact type or signature? | The newest `@cloudflare/workers-types` (download steps below, details in `workers-best-practices/references/review.md`) |
| Which config fields and values exist? | `node_modules/wrangler/config-schema.json` |
| Anything else about the platform? | Any docs search tool you have, else `https://developers.cloudflare.com/workers/` |

Fetch the newest types first. When the project carries an older copy in `node_modules`, the newest published one wins.

```bash
# Download the newest workers types into a scratch folder
mkdir -p /tmp/workers-types-latest && \
  npm pack @cloudflare/workers-types --pack-destination /tmp/workers-types-latest && \
  tar -xzf /tmp/workers-types-latest/cloudflare-workers-types-*.tgz -C /tmp/workers-types-latest
# The file to search: /tmp/workers-types-latest/package/index.d.ts
```

## The rules, grouped by what breaks when you ignore them

Full explanations, right and wrong code, and the facts to re-check live in `workers-best-practices/references/rules.md`.

### The Worker crashes or stalls

| Rule | In short |
|------|----------|
| Stream big bodies | Pipe large or unbounded bodies through; never `await response.text()` on them |
| Mind the limits | Keep long synchronous work short, or move it to Queues, Workflows or WebAssembly |
| Offload slow work | Queues and Workflows take background jobs off the request path |

### Data leaks or credentials fall out

| Rule | In short |
|------|----------|
| Secrets | Store them with `wrangler secret put`; nothing secret in config or code |
| Random values | `crypto.randomUUID()` or `crypto.getRandomValues()`, never `Math.random()`, for tokens and IDs |
| Comparing secrets | `crypto.subtle.timingSafeEqual` on equal-size hashes |
| No global request state | Nothing tied to one request lives in a module-level variable |

### Work silently goes missing

| Rule | In short |
|------|----------|
| Floating promises | Await, return, `void` or `ctx.waitUntil()` every Promise |
| waitUntil | Post-response work goes through `ctx.waitUntil()`; keep `ctx` intact, no destructuring |
| Errors | Catch them yourself and return a structured response; skip `passThroughOnException` |
| Observability | Switch on `observability`, set `head_sampling_rate`, log JSON objects |

### Setup drifts from reality

| Rule | In short |
|------|----------|
| Compatibility date | Today's date on a new project; bump it now and then on an old one |
| nodejs_compat | Turn the flag on; many packages need Node built-ins |
| Generated types | `wrangler types` writes `Env`; never maintain binding interfaces by hand |
| Config file | `wrangler.jsonc`; newer features are JSON-only |

### Cloudflare services are reached the slow way

| Rule | In short |
|------|----------|
| Bindings | KV, R2, D1 and Queues through bindings, not the Cloudflare REST API |
| Service bindings | Worker-to-Worker calls use a service binding, not a public URL |
| Hyperdrive | Every external PostgreSQL or MySQL connection goes through it |

## Smells, in rough order of how bad they are

Use this as a scan list while reading code.

1. A secret typed into source or config (it lands in version control).
2. `Math.random()` producing a token or ID (guessable).
3. Secrets compared as plain strings (`===`, `==`, `localeCompare`): a timing leak, so use `crypto.subtle.timingSafeEqual`.
4. A mutable module-level variable holding request data (one request can see another's).
5. A `fetch()` fired with no `await` or `waitUntil` (a floating promise; result and error vanish).
6. `await response.text()` on a body of unknown size (can exceed the 128 MB per-isolate memory cap on Cloudflare's Workers limits page).
7. `const { waitUntil } = ctx` (the `this` link is lost; "Illegal invocation" at runtime).
8. `ctx.passThroughOnException()` used instead of handling errors (bugs go unseen).
9. The Cloudflare REST API called from inside a Worker (an extra hop, extra auth, extra delay).
10. A hand-typed `Env` interface (drifts away from the wrangler bindings).
11. `any` on `Env` or handler params (turns off checking for every binding use).
12. `as unknown as T` (papers over a real mismatch; redesign instead).
13. `implements` instead of `extends` on DurableObject, WorkerEntrypoint or Workflow (old style; no `this.ctx` or `this.env`).
14. `env.X` inside a class that extends a platform base class (should read `this.env.X`).

## How to run a review

1. Look things up: best-practices page, workers types, wrangler schema.
2. Open every file whole; a diff hides how bindings are reached.
3. Static pass: types (how bindings are read, handler signatures, no `any`, no risky casts, see `workers-best-practices/references/review.md`) and config (date, `nodejs_compat`, observability, secrets, code and config agreeing on binding names).
4. Behaviour pass: streaming, floating promises, global state, values crossing serialization boundaries.
5. Security pass: crypto calls, secret handling, constant-time comparison, error handling.
6. Run the tools: `npx tsc --noEmit`, plus a lint pass with `no-floating-promises`.
7. For each finding, find its entry in `workers-best-practices/references/rules.md` and compare with the right pattern.

## Where this skill stops

It handles Workers practices and Workers code review. For neighbours:

- Durable Objects: load the `durable-objects` skill.
- Workflows: read the Workflows rules page (Cloudflare's "Rules of Workflows" under the Workflows docs).
- Wrangler commands: load the `wrangler` skill.

## Working principles

- Retrieve before you flag, every time. When an API, field or pattern is uncertain, read the docs before saying anything.
- Back every finding with evidence: a line number, tool output or a docs link.
- Write for the person who will copy it. Snippets in answers get pasted into production.
- A short example that runs beats a thorough one with mistakes.
