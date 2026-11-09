# Workers rules, by consequence

The rules are grouped by what goes wrong when you break them, in the same groups as the cheat sheet in the main skill file. Each entry says what to do, what to check, the right shape, and the wrong shape where one helps. Code is plain TypeScript.

Some entries rest on facts that change. Those end with a **Retrieve** line naming the page to read before you flag anything; every docs path there hangs off `https://developers.cloudflare.com`.

---

## 1. The Worker crashes or stalls

### Stream bodies instead of buffering them

An isolate may use up to 128 MB of memory, shared by every request it serves (Cloudflare's Workers limits page). Reading a whole body with `await response.text()` or `await request.arrayBuffer()` can exhaust it. Hand `response.body` straight on, or push data through a `TransformStream`.

**Check**: `.text()`, `.json()` or `.arrayBuffer()` called on data that may be large or has no known bound. A small payload of known size, like a config file, may be buffered.

Pass the stream along:
```ts
async fetch(request: Request, env: Env): Promise<Response> {
  const upstream = await fetch("https://api.example.com/big-export");
  return new Response(upstream.body, upstream);
}
```

Join several streams into one response:
```ts
async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const urls = ["https://api.example.com/chunk-a", "https://api.example.com/chunk-b"];
  const { readable, writable } = new TransformStream();

  // hand the pipeline to waitUntil so it is not left floating
  ctx.waitUntil((async () => {
    for (const url of urls) {
      const res = await fetch(url);
      if (res.body) {
        await res.body.pipeTo(writable, { preventClose: true });
      }
    }
    await writable.close();
  })());

  return new Response(readable, {
    headers: { "Content-Type": "application/octet-stream" },
  });
}
```

Wrong:
```ts
// The whole body sits in memory; large payloads crash the Worker
const upstream = await fetch("https://api.example.com/big-export");
const text = await upstream.text();
return new Response(text);
```

**Retrieve**: `/workers/runtime-apis/streams/`.

### Respect the CPU limit

CPU time per request is capped. Cloudflare's Workers limits page gives 10 ms on the Free plan, and on the Paid plan a 30-second default that can be raised (up to five minutes) with `limits.cpu_ms` in the wrangler config. Long synchronous work, like tight loops, parsing huge JSON or heavy crypto, can reach the cap and kill the request.

**Check**: compute-heavy synchronous code. Split it into smaller pieces, send it to Queues or Workflows, or move it into WebAssembly.

**Retrieve**: `/workers/platform/limits/`.

### Send slow or background jobs to Queues and Workflows

Work that takes long, may need retries, or is not urgent should not hold up a request.

- **Queues** separate the sender from the receiver. They suit fan-out, buffering and batching, and simple one-step jobs. Delivery is at-least-once.
- **Workflows** run multi-step jobs durably. The result of each step is saved, only a failing step is retried, and a run may last hours, days or weeks.
- **Together**: a Queue absorbs a heavy intake, and its consumer starts Workflow instances for the complicated cases.

**Check**: email sends, webhooks and multi-step processes executed inside the fetch handler rather than handed off.

```ts
async fetch(request: Request, env: Env): Promise<Response> {
  const order = await request.json<{ id: string; type: string }>();

  if (order.type === "simple") {
    await env.JOBS_QUEUE.send({ shipmentId: order.id, action: "send-receipt" });
  } else {
    await env.SHIPPING_WORKFLOW.create({ params: { shipmentId: order.id } });
  }

  return Response.json({ status: "accepted" }, { status: 202 });
}
```

**Retrieve**: `/queues/` and `/workflows/` for current APIs. Workflow-specific rules: the Workflows rules page ("Rules of Workflows") at `https://developers.cloudflare.com/workflows/build/rules-of-workflows/`.

---

## 2. Data leaks or credentials fall out

### Keep secrets out of config and code

A secret never belongs in the wrangler config or in source. Set it with `wrangler secret put` and read it from `env` while running. Plain settings go under `vars`.

**Check**: string literals that resemble API keys, tokens or passwords. For local development, confirm `.env` is listed in `.gitignore`.

```jsonc
{
  "vars": {
    "API_BASE_URL": "https://api.example.com"  // public setting, fine here
  }
  // the secret is set with: wrangler secret put API_KEY
}
```

Wrong:
```jsonc
{
  "vars": {
    "API_KEY": "<LIVE_SECRET_KEY>"  // committed to version control
  }
}
```

### Take randomness from Web Crypto, compare secrets in constant time

Unique IDs come from `crypto.randomUUID()`, and raw random bytes from `crypto.getRandomValues()`. `Math.random()` is predictable and must stay out of anything security-related.

To compare secrets such as API keys or HMAC signatures, use `crypto.subtle.timingSafeEqual()`. Hash both sides to the same size first, and do not return early when lengths differ, because that leaks the length through timing.

**Check**: `Math.random()` producing anything security-related, and secret comparisons that skip `timingSafeEqual` with fixed-size hashes.

```ts
// A random session ID
const sessionId = crypto.randomUUID();

// A random token from 32 secure bytes
const tokenBytes = new Uint8Array(32);
crypto.getRandomValues(tokenBytes);
const token = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
```

```ts
// Constant-time check; hashing first hides the length
async function verifyToken(provided: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
}
```

Wrong:
```ts
// Guessable output
const token = Math.random().toString(36).substring(2);

// Timing side channel: reveals how much of the secret matched
return provided === expected;
```

**Retrieve**: `/workers/runtime-apis/web-crypto/`.

### No request state at module level

An isolate serves many requests. A mutable module-level variable can hand one user's data to another, keep stale values, and trigger "Cannot perform I/O on behalf of a different request".

**Check**: `let` or `var` at module scope that a handler assigns to. Pass state as function arguments.

```ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const userId = request.headers.get("X-Account-Id");
    const result = await handleRequest(userId, env);
    return Response.json(result);
  },
} satisfies ExportedHandler<Env>;
```

Wrong:
```ts
// Shared variable at module level: the next request can see it
let activeAccount: string | null = null;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    activeAccount = request.headers.get("X-Account-Id");  // another request may read this
    // ...
  },
};
```

---

## 3. Work silently goes missing

### Never leave a promise floating

A Promise that is not awaited, returned, or given to `ctx.waitUntil()` is floating. Its result is lost, its errors vanish, and the work may be cut off when the runtime ends the isolate.

**Check**: any `fetch()`, `env.*.put()`, `env.*.send()` or other async call left unhandled. Turn on the `no-floating-promises` lint rule.

```bash
# ESLint
npx eslint --rule '{"@typescript-eslint/no-floating-promises": "error"}' src/

# oxlint
npx oxlint --deny typescript/no-floating-promises src/
```

```ts
// await it when the result is needed
const response = await fetch("https://api.example.com/ingest", { method: "POST", body: JSON.stringify(data) });

// use waitUntil when the reply need not wait for it
ctx.waitUntil(fetch("https://api.example.com/notify", { method: "POST", body: JSON.stringify(data) }));
```

Wrong:
```ts
// Floating: nobody sees the result or the failure
fetch("https://api.example.com/notify", { method: "POST", body: JSON.stringify(data) });
```

### Use waitUntil for work after responding

`ctx.waitUntil()` lets analytics, cache writes and webhooks finish after the response has gone out, so the reply stays quick. That extra work can run for up to 30 seconds after the response, a budget shared by all `waitUntil()` calls of the request; unsettled promises are then cancelled (Cloudflare's Workers context documentation).

**Check**: background jobs awaited inline instead of passed to `ctx.waitUntil()`. Do not destructure `ctx`: Cloudflare's Workers best-practices page says that loses the `this` binding and throws "Illegal invocation".

```ts
async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const data = await processRequest(request);

  ctx.waitUntil(logToAnalytics(env, data));
  ctx.waitUntil(updateCache(env, data));

  return Response.json(data);
}
```

Wrong:
```ts
// Pulling waitUntil off ctx detaches it from its object
const { waitUntil } = ctx;  // throws "Illegal invocation" when called
waitUntil(somePromise);
```

### Handle errors yourself

`passThroughOnException()` fails open: when the Worker throws, the request goes to the origin. That conceals bugs and makes debugging hard. Wrap the work in try/catch and return a structured error.

**Check**: any `ctx.passThroughOnException()`. Errors should be caught, logged with `console.error`, and answered with a JSON error body.

```ts
async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    const result = await handleRequest(request, env);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(JSON.stringify({ message: "unhandled error", error: message, path: new URL(request.url).pathname }));
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Switch on logs and traces

Enable `observability` in the wrangler config before going to production. `head_sampling_rate` sets how much is recorded, which controls volume and cost. Log JSON, as in `console.log(JSON.stringify({...}))`, so entries can be searched, and use `console.error` for failures so they show at error severity in the dashboard.

**Check**: `observability.enabled` set to `true`, and logs written as JSON instead of glued-together strings.

```jsonc
{
  "observability": {
    "enabled": true,
    "logs": { "head_sampling_rate": 1 },
    "traces": { "enabled": true, "head_sampling_rate": 0.01 }
  }
}
```

```ts
// JSON entries can be searched and filtered
console.log(JSON.stringify({ message: "incoming request", method: request.method, path: url.pathname }));

// Shows up at error severity
console.error(JSON.stringify({ message: "request failed", error: e instanceof Error ? e.message : String(e) }));
```

Wrong:
```ts
// Free-form text is hard to query
console.log("Got a request to " + url.pathname);
```

**Retrieve**: the pages at `/workers/observability/logs/workers-logs/` and `/workers/observability/traces/`, to see which options exist today.

### Test inside the Workers runtime

Run tests with the Cloudflare Vitest plugin, `@cloudflare/vitest-plugin`, which executes them in the Workers runtime against real bindings and catches problems plain Node tests miss. Its predecessor was published as `@cloudflare/vitest-pool-workers`; an older project may still use that name and should move to the plugin (Cloudflare's Vitest integration page has the migration guide).

**Known trap**: Cloudflare's Workers best-practices page warns that the plugin injects `nodejs_compat` on its own, so tests can pass even when your wrangler config lacks the flag. If your code uses Node built-ins, check `wrangler.jsonc` yourself.

**Check**: a test setup built on the plugin, with tests for nullable results such as KV `.get()` returning `null`.

```ts
import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";

describe("KV operations", () => {
  it("stores a value and reads it back", async () => {
    await env.CACHE_KV.put("greeting", "hello");
    const result = await env.CACHE_KV.get("greeting");
    expect(result).toBe("hello");
  });

  it("gives null for a key that is not there", async () => {
    const result = await env.CACHE_KV.get("absent-key");
    expect(result).toBeNull();
  });
});
```

**Retrieve**: read `/workers/testing/vitest-integration/` before writing the setup, and confirm the `cloudflare:test` import against it.

---

## 4. Setup drifts from reality

### Keep compatibility_date recent

On a new project, use today's date. On an existing one, raise it from time to time to get new APIs and fixes.

**Check**: a `compatibility_date` that is missing, or older than about six months (a rule of thumb for this skill, not a platform rule).

```jsonc
// wrangler.jsonc
{
  "compatibility_date": "$today",  // put the real date here, YYYY-MM-DD
  "compatibility_flags": ["nodejs_compat"]
}
```

**Retrieve**: `/workers/configuration/compatibility-dates/`.

### Turn on nodejs_compat

The `nodejs_compat` flag makes Node built-ins such as `node:crypto`, `node:buffer` and `node:stream` available. A lot of packages need them, and without the flag you get puzzling import failures at runtime.

**Check**: `"nodejs_compat"` inside `compatibility_flags`.

```jsonc
{
  "compatibility_flags": ["nodejs_compat"]
}
```

### Generate Env with wrangler types

Do not write `Env` yourself. `wrangler types` builds it from the config; run it again whenever a binding is added or renamed.

**Check**: a hand-made `interface Env` that repeats the config bindings, and the `satisfies ExportedHandler<Env>` pattern on the default export.

```ts
// Env comes from `wrangler types`, so it always matches the config
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const value = await env.CACHE_KV.get("greeting");
    return new Response(value);
  },
} satisfies ExportedHandler<Env>;
```

Wrong:
```ts
// A manual Env goes stale the moment a binding changes
interface Env {
  CACHE_KV: KVNamespace;  // is the binding still called this?
}
```

### Write config as wrangler.jsonc

Choose `wrangler.jsonc` over `wrangler.toml`: newer features are JSON-only, and JSONC lets you comment your decisions.

**Check**: `wrangler.jsonc` or `wrangler.json` in use. Flag `wrangler.toml` in a new project.

---

## 5. Cloudflare services are reached the slow way

### Bindings beat the REST API

KV, R2, D1, Queues and Workflows are available as bindings: in-process references with no network trip and no credentials to manage. Calling the Cloudflare REST API from inside a Worker adds delay and code for nothing.

**Check**: `fetch("https://api.cloudflare.com/client/v4/...")` aimed at a service that has a binding.

```ts
// Through a binding: direct, no overhead
const object = await env.ASSETS_BUCKET.get("report.pdf");
```

Wrong:
```ts
// Going out over the REST API from within a Worker
const response = await fetch(
  "https://api.cloudflare.com/client/v4/accounts/.../r2/buckets/.../objects/report.pdf",
  { headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` } }
);
```

### Service bindings between Workers

A service binding costs nothing extra, never touches the public internet, and offers typed RPC. Do not call a sibling Worker at its public URL.

**Check**: Worker-to-Worker calls written as `env.SERVICE_NAME.method()` (RPC) or `env.SERVICE_NAME.fetch()`, and not as `fetch("https://my-other-worker.example.com/...")`.

```ts
import { WorkerEntrypoint } from "cloudflare:workers";

export class SessionService extends WorkerEntrypoint {
  async verifyToken(token: string): Promise<{ userId: string; valid: boolean }> {
    return { userId: "acct-42", valid: true };
  }
}

// In the calling Worker
const auth = await env.SESSION_SERVICE.verifyToken(token);
```

**Retrieve**: check the `WorkerEntrypoint` import path and signature in the newest `@cloudflare/workers-types`.

### Hyperdrive for outside databases

Hyperdrive keeps a pool of connections close to your database. Per Cloudflare's Hyperdrive documentation ("How Hyperdrive works"), opening a connection straight from a Worker may need several round trips to the database, while with Hyperdrive that setup happens at the edge between the Worker and Hyperdrive. Create a fresh `Client` per request and let Hyperdrive do the pooling; Cloudflare's Workers best-practices page states this, and that Hyperdrive needs `nodejs_compat`.

**Check**: a `new Client()` or other database connection built from a raw connection string rather than `env.HYPERDRIVE.connectionString`.

```jsonc
{
  "hyperdrive": [{ "binding": "HYPERDRIVE", "id": "<YOUR_HYPERDRIVE_ID>" }]
}
```

```ts
import { Client } from "pg";

async fetch(request: Request, env: Env): Promise<Response> {
  const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
  await client.connect();
  const result = await client.query("SELECT id, title FROM articles LIMIT 5");
  return Response.json(result.rows);
}
```

**Retrieve**: `/hyperdrive/` for current setup and supported databases.
