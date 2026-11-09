# Reviewing Workers code: one checklist

This file stands alone. It is a single checklist you work through top to bottom. Part A decides how hard to look, part B gathers facts, part C is the checklist, part D is how to report.

## A. Decide how hard to look

Open every file whole; a diff hides how bindings are reached. Then put each piece of code in one class, because the class sets the bar:

- **Illustrative**: a concept sketch, mostly comments. API names and signatures must be real and believable.
- **Demonstrative**: a working snippet that sits inside a larger context. Syntax, APIs and binding access must be right.
- **Executable**: stands alone and runs as is. It must compile and run, with imports and config included.

Rate the risk of what you read: HIGH for auth, crypto and bindings; MEDIUM for business logic and config; LOW for style and comments. Look hardest at HIGH.

## B. Gather the facts first

Memory is not evidence here. Types, schemas and APIs shift with compatibility dates and new binding kinds, so fetch them.

1. **Types.** The installed `@cloudflare/workers-types` may lag. Download the newest:

   ```bash
   mkdir -p /tmp/workers-types-latest && \
     npm pack @cloudflare/workers-types --pack-destination /tmp/workers-types-latest && \
     tar -xzf /tmp/workers-types-latest/cloudflare-workers-types-*.tgz -C /tmp/workers-types-latest
   # Search /tmp/workers-types-latest/package/index.d.ts
   ```

   Search that file for the exact class, type or interface in question. Never invent a type name. Another route is `npx wrangler types`, which writes an `Env` interface from the local config. Last resort: `node_modules/@cloudflare/workers-types/index.d.ts`, with the installed version written down.
2. **Config schema.** Wrangler ships `config-schema.json` (JSON Schema draft-07). Read it with `cat node_modules/wrangler/config-schema.json`, and look up field names and shapes there instead of guessing.
3. **Docs.** Use a docs search tool if you have one, otherwise open `https://developers.cloudflare.com/workers/`. The best-practices page sits under `/workers/best-practices/workers-best-practices/`.

## C. The checklist

### Bindings and `Env`

- Each binding has a precise type. Flag `any`, `unknown`, `object` and `Record<string, unknown>` standing in for a binding.
- Generic binding types carry their parameters: Durable Object namespaces, Queues, service bindings used for RPC. Read the definition to learn which are generic.
- Binding names in `Env` equal the names in the wrangler config, letter for letter. Prefer the types that `wrangler types` generates to a hand-typed interface.
- Bindings are reached the right way. Exported module handlers (`fetch`, `scheduled`, `queue`, `email`) read them from the `env` argument. Classes extending `WorkerEntrypoint`, `DurableObject`, `Workflow` or `Agent` read `this.env.X`. Flag `env.X` inside such a class, and flag `this.env.X` inside an exported handler. This is the commonest slip.

### Handlers and classes

Compare with the current type definitions; signatures change.

- The import path is right (most platform classes come from `"cloudflare:workers"`; a frequent error is mixing it up with `"cloudflare:workflows"`).
- Base classes receive their type parameter, e.g. `DurableObject<Env>`.
- Exported handlers take `ExecutionContext` as the third argument when they use `ctx.waitUntil()`.
- A `fetch()` handler returns `Promise<Response>`.
- Platform classes are extended, never implemented. `implements` is the legacy style and drops `this.ctx` and `this.env`.
- Renamed members are updated (`this.state` became `this.ctx` in Durable Objects, for one), and constructors match what the base class expects today. Confirm in the types.

### Type discipline

- No `any` on bindings, handler parameters or API results.
- No `as unknown as T`: it conceals a true mismatch, so fix the design.
- Every `@ts-ignore` or `@ts-expect-error` carries a comment saying why.
- `satisfies ExportedHandler<Env>` is better than `as`: it checks the shape and keeps the type narrow, while `as` only asserts and can hide mismatches.
- Untyped input (JSON, parsed bodies) goes through a schema or a type guard, never an assertion.

### Config

- A deployable code Worker normally sets `name`, `compatibility_date` and `main`. Cloudflare's best-practices page lists no required fields and the schema marks none, so treat these as convention and an assets-only Worker may omit `main`.
- `compatibility_date` is recent. Use the same rule of thumb as `rules.md`: flag one older than about six months. In docs, write the `$today` placeholder.
- Format: `wrangler.jsonc` for new projects; `wrangler.json` works but cannot hold comments; `wrangler.toml` is the old format, tolerated in existing material and flagged in new projects.
- Code and config agree: every `env.X` in code has a declared binding, every declared binding is used somewhere (warn when not), names match including case, and for Durable Objects `class_name` equals the exported class name.
- Each new Durable Object class has a migration entry.
- Secrets never sit under `vars`; use `wrangler secret put`.
- Binding declarations sit under the right top-level key (check the schema), and a runnable Worker has an entrypoint.

### Values crossing boundaries

Whatever crosses these edges must survive a structured clone:

- Queue message bodies given to `.send()` or `.sendBatch()`
- Return values of Workflow steps, which are saved to durable storage
- Durable Object storage: `storage.put()` values and SQL data
- WebSocket payloads sent with `postMessage()`

Flag `Response`, `Request`, `Error`, functions, class instances that have methods, `Map`, `Set` and `Symbol`. A `Response` or `Error` inside a step result or queue message compiles but fails when it runs. Safe values: plain objects, arrays, strings, numbers, booleans, null, `ArrayBuffer`, `Date`.

### Behaviour and security

Walk the rules in `rules.md`: streaming, floating promises, global state, crypto use, secret handling, constant-time comparison, error handling. Then run the tools: `npx tsc --noEmit`, and a lint pass with `no-floating-promises`.

## D. Reporting a finding

```
**[SEVERITY]** Short description
`file.ts:42` — what is wrong, with evidence
Suggested fix: `code`
```

Severity scale:

- **CRITICAL**: a security hole, lost data, or a crash.
- **HIGH**: a type error, the wrong API, or a config that will not work.
- **MEDIUM**: validation that is missing, or an unhandled edge case.
- **LOW**: style, or a small improvement.
