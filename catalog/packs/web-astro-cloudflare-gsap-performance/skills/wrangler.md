---
name: wrangler
description: Use before any wrangler command: the Cloudflare Workers CLI to deploy, develop and manage Workers and their storage and compute products (Queues, Containers, Workflows, Pipelines, Workers AI, Hyperdrive, Vectorize, D1, R2, KV, Secrets Store). Fetch current docs, do not trust memory.
metadata:
  category: web
  author: Richicinschi
  domain: web / Cloudflare (wrangler)
---

# Wrangler

Prefer retrieval over memory. Flags get renamed, config fields appear, binding shapes shift. Fetch the latest docs and schema before you write or review any wrangler command or config, and do not rely on memory for CLI flags, config fields or binding shapes. Where this file is unsure, run `wrangler <command> --help`; the installed version is the final word.

| Where | What it settles |
|---|---|
| Cloudflare's Wrangler documentation | Commands, flags, config reference |
| `node_modules/wrangler/config-schema.json` in the project | Field names, binding shapes, allowed values |
| Cloudflare's Workers documentation | Runtime APIs, compatibility dates and flags |

## 1. Get set up

```bash
wrangler --version
```

This guide is written against Wrangler 4. Older releases behave differently (for example, `wrangler types` needed an extra flag to emit runtime types on late 3.x), so update before you trust any command below. Not installed:

```bash
npm install -D wrangler@latest
```

Use wrangler whenever it can do the job; do not hand-build Cloudflare API calls.

New project:

```bash
npx wrangler init edge-api

# or scaffold with a framework
npx create-cloudflare@latest demo-app
```

Daily commands:

| Goal | Command |
|---|---|
| Run locally | `wrangler dev` |
| Ship it | `wrangler deploy` |
| Check a deploy without shipping | `wrangler deploy --dry-run` |
| Refresh TypeScript types | `wrangler types` |
| Time startup | `wrangler check startup` |
| Watch live logs | `wrangler tail` |
| Who am I | `wrangler whoami` |
| Delete the Worker | `wrangler delete` (see warning below) |

`wrangler delete` is destructive: it removes the Worker and its associated resources. Run it with `--dry-run` first and read `wrangler delete --help` for the exact scope.

## 2. Working rules

These replace a longer wish list; follow them and most mistakes go away.

- **Config format.** Use `wrangler.jsonc`, not TOML. Some newer features exist only in JSON config. Commit the file; it is the source of truth for the Worker.
- **One date rule.** Set `compatibility_date` to today's date when you create the project. Old dates keep working. Move it forward on purpose when you want newer runtime behaviour, read what changed on the compatibility-flags page, test, then deploy. Do not bump it blindly.
- **Types.** After any config edit run `wrangler types`. In CI run `wrangler types --check` so a binding mismatch fails the build.
- **Environments.** Keep staging and production apart with `env.staging` and `env.production`; name them differently.
- **Provisioning.** Wrangler can create some resources for you at deploy: KV, R2, D1, Queues and Dispatch Namespaces among them (the config docs list the current set). Leave the ID out of the binding and deploy writes the new ID back into the config file. A deploy from the dashboard does not write it to your repo. Other products (Vectorize, Hyperdrive, Workflows) you create yourself first.
- **Test first.** Try changes under `wrangler dev` before deploying, and use `--dry-run` before any big deploy.
- **Startup.** Run `wrangler check startup` to time startup and catch a script that goes over the limit. Results come from your machine and can differ a lot from Cloudflare, so treat them as a hint.
- **Secrets.** Never type a secret value into a command, an `echo`, a log or a config file. Let wrangler prompt, redirect from a file, use `secret bulk`, or use your CI's secret store. One honest exception: a few commands (Hyperdrive create or update, registry setup) take the value as a flag. Feed those from an environment variable, never a literal, and know the value is then visible to other processes on the machine. Check `--help` for a prompt or stdin form first.

## 3. Config

Smallest useful file:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "edge-api",
  "main": "src/index.ts",
  // today's date when you create the project
  "compatibility_date": "2026-11-09"
}
```

With bindings:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "edge-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-11-09",
  "compatibility_flags": ["nodejs_compat"],

  // plain variables
  "vars": {
    "ENVIRONMENT": "production"
  },

  // key-value store
  "kv_namespaces": [
    { "binding": "KV", "id": "<KV_NAMESPACE_ID>" }
  ],

  // object storage
  "r2_buckets": [
    { "binding": "BUCKET", "bucket_name": "media-store" }
  ],

  // SQL database
  "d1_databases": [
    { "binding": "DB", "database_name": "shop-db", "database_id": "<DB_ID>" }
  ],

  // Workers AI (runs on Cloudflare even in local dev)
  "ai": { "binding": "AI" },

  // vector index
  "vectorize": [
    { "binding": "VECTOR_INDEX", "index_name": "docs-index" }
  ],

  // database accelerator
  "hyperdrive": [
    { "binding": "HYPERDRIVE", "id": "<HYPERDRIVE_ID>" }
  ],

  // Durable Objects need a class and a migration that introduces it
  "durable_objects": {
    "bindings": [
      { "name": "ROOM", "class_name": "RoomState" }
    ]
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["RoomState"] }
  ],

  // scheduled runs
  "triggers": {
    "crons": ["0 * * * *"]
  },

  // per-environment overrides
  "env": {
    "staging": {
      "name": "edge-api-staging",
      "vars": { "ENVIRONMENT": "staging" }
    }
  }
}
```

The `migrations` block is the older way to declare Durable Object classes; the config docs describe a newer declarative `exports` field, and the two cannot be combined for Durable Objects. Check the current config page for which to use.

Types:

```bash
# writes worker-configuration.d.ts
wrangler types

# write somewhere else
wrangler types ./src/env.d.ts

# fail if stale (CI)
wrangler types --check
```

## 4. Develop and test

```bash
# default: local simulation of storage
wrangler dev

# pick an environment
wrangler dev --env staging

# stay local
wrangler dev --local

# run on Cloudflare's edge (preview-style)
wrangler dev --remote

# change the port
wrangler dev --port 8787

# reload the browser on HTML changes (confirm with --help on your version)
wrangler dev --live-reload

# allow poking cron handlers
wrangler dev --test-scheduled
# then open http://localhost:8787/cdn-cgi/local/scheduled
```

Fire a cron handler from a script:

```bash
curl "http://localhost:8787/cdn-cgi/local/scheduled"
```

### Local or remote bindings

By default bindings use local copies of the data. A binding with `remote: true` talks to the real resource while you develop. Per Cloudflare's development and testing page:

- Can be remote: R2, KV, Browser Run, Vectorize, mTLS, Images, Dispatch Namespaces.
- Workers AI always runs on Cloudflare, and `remote: false` on it is an error.
- `remote: true` is an error on Durable Objects, Workflows, Hyperdrive, `vars`, secrets, static assets, version metadata and rate limiting. Those run locally.

```jsonc
{
  "r2_buckets": [
    { "binding": "BUCKET", "bucket_name": "media-store", "remote": true }
  ],
  "vectorize": [
    { "binding": "INDEX", "index_name": "docs-index", "remote": true }
  ]
}
```

### Local secrets

Dev-only secrets go in a `.dev.vars` file next to `wrangler.jsonc`, never in the config:

```
PAYMENT_TOKEN=dev-only-123
DATABASE_URL=postgres://localhost:5432/shop_dev
```

### Unit tests

Cloudflare's Vitest integration (current docs) uses a plugin, not the older pool config. Install the plugin and vitest, then:

```bash
npm install -D @cloudflare/vitest-plugin vitest
```

`vitest.config.ts`:

```typescript
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
    }),
  ],
});
```

Check the Vitest integration page for the vitest version it requires.

## 5. Ship and operate

```bash
# production
wrangler deploy

# one environment
wrangler deploy --env staging

# validate only
wrangler deploy --dry-run

# keep variables set in the dashboard
wrangler deploy --keep-vars

# minify the bundle
wrangler deploy --minify
```

Versions and rollback:

```bash
wrangler versions list
wrangler versions view <VERSION_ID>

# back to the previous version, or a chosen one
wrangler rollback
wrangler rollback <VERSION_ID>
```

Secrets:

```bash
# prompts for the value
wrangler secret put PAYMENT_TOKEN

# value read from a file
wrangler secret put SIGNING_KEY < signing.pem

wrangler secret list
wrangler secret delete PAYMENT_TOKEN

# many at once from a JSON file (keep that file out of git)
wrangler secret bulk secrets.json
```

Logs:

```bash
wrangler tail
wrangler tail edge-api
wrangler tail --status error
wrangler tail --search "error"
wrangler tail --format json
```

Stored logs, in config:

```jsonc
{
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1
  }
}
```

Pages:

```bash
wrangler pages project create portfolio-site
wrangler pages deploy ./dist
wrangler pages deploy ./dist --branch main
wrangler pages deployment list --project-name portfolio-site
```

## 6. Data products

### KV

```bash
wrangler kv namespace create SESSIONS_KV
wrangler kv namespace list
wrangler kv namespace delete --namespace-id <ID>

wrangler kv key put --namespace-id <ID> "key" "value"
# with a lifetime in seconds
wrangler kv key put --namespace-id <ID> "key" "value" --expiration-ttl 3600
wrangler kv key get --namespace-id <ID> "key"
wrangler kv key list --namespace-id <ID>
wrangler kv key delete --namespace-id <ID> "key"
wrangler kv bulk put --namespace-id <ID> data.json
```

```jsonc
{ "kv_namespaces": [ { "binding": "CACHE", "id": "<NAMESPACE_ID>" } ] }
```

### R2

```bash
wrangler r2 bucket create media-store
# with a location hint
wrangler r2 bucket create media-store --location wnam
wrangler r2 bucket list
wrangler r2 bucket info media-store
wrangler r2 bucket delete media-store

wrangler r2 object put media-store/path/file.txt --file ./local-file.txt
wrangler r2 object get media-store/path/file.txt
wrangler r2 object delete media-store/path/file.txt
```

```jsonc
{ "r2_buckets": [ { "binding": "ASSETS", "bucket_name": "media-store" } ] }
```

### D1

```bash
wrangler d1 create shop-db
# with a location
wrangler d1 create shop-db --location wnam
wrangler d1 list
wrangler d1 info shop-db
wrangler d1 delete shop-db

# SQL against the live database, or the local copy
wrangler d1 execute shop-db --remote --command "SELECT id, total FROM orders"
wrangler d1 execute shop-db --remote --file ./schema.sql
wrangler d1 execute shop-db --local --command "SELECT id, total FROM orders"

# migrations
wrangler d1 migrations create shop-db add_orders_table
wrangler d1 migrations list shop-db --local
wrangler d1 migrations apply shop-db --local
wrangler d1 migrations apply shop-db --remote

# backups
wrangler d1 export shop-db --remote --output backup.sql
wrangler d1 export shop-db --remote --output schema.sql --no-data
```

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "shop-db",
      "database_id": "<DATABASE_ID>",
      "migrations_dir": "./migrations"
    }
  ]
}
```

### Vectorize

```bash
# explicit size and metric
wrangler vectorize create docs-index --dimensions 768 --metric cosine
# or a preset that sets both
wrangler vectorize create docs-index --preset @cf/baai/bge-base-en-v1.5
wrangler vectorize list
wrangler vectorize get docs-index
wrangler vectorize delete docs-index

# load vectors from NDJSON, then search
wrangler vectorize insert docs-index --file vectors.ndjson
wrangler vectorize query docs-index --vector "[0.1, 0.2, ...]" --top-k 10
```

```jsonc
{ "vectorize": [ { "binding": "SEARCH_INDEX", "index_name": "docs-index" } ] }
```

### Hyperdrive

The create and update commands take the database password as a flag, so this is the exception to the secrets rule: pass it from an environment variable.

```bash
# from separate parts
wrangler hyperdrive create pg-accel \
  --origin-host db.internal.test \
  --origin-port 5432 \
  --database shop-db \
  --origin-user app_rw \
  --origin-password "$DB_PASSWORD"

# or one connection string held in an env var
wrangler hyperdrive create pg-accel \
  --connection-string "$HYPERDRIVE_CONNECTION_STRING"

wrangler hyperdrive list
wrangler hyperdrive get <HYPERDRIVE_ID>

# change settings, e.g. rotate the password
wrangler hyperdrive update <HYPERDRIVE_ID> \
  --origin-password "$DB_PASSWORD"

wrangler hyperdrive delete <HYPERDRIVE_ID>
```

Binding. Cloudflare's driver examples pair it with the `nodejs_compat` flag; confirm in the Hyperdrive docs for the driver you use:

```jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "hyperdrive": [ { "binding": "HYPERDRIVE", "id": "<HYPERDRIVE_ID>" } ]
}
```

### Queues

```bash
wrangler queues create jobs-queue
wrangler queues list
wrangler queues delete jobs-queue

# attach or detach a consumer Worker
wrangler queues consumer add jobs-queue edge-api
wrangler queues consumer remove jobs-queue edge-api
```

```jsonc
{
  "queues": {
    "producers": [ { "binding": "JOBS", "queue": "jobs-queue" } ],
    "consumers": [
      { "queue": "jobs-queue", "max_batch_size": 10, "max_batch_timeout": 30 }
    ]
  }
}
```

## 7. Compute and AI products

### Workers AI

```bash
wrangler ai models
wrangler ai finetune list
```

```jsonc
{ "ai": { "binding": "AI" } }
```

It always runs on Cloudflare, so even `wrangler dev` incurs usage charges.

### Containers

```bash
# build, optionally push in the same step
wrangler containers build -t web-img:v2 .
wrangler containers build -t web-img:v2 . --push
# push an image you already built
wrangler containers push web-img:v2

wrangler containers list
wrangler containers info <CONTAINER_ID>
wrangler containers delete <CONTAINER_ID>

wrangler containers images list
wrangler containers images delete web-img:v2
```

External registries. Credentials come from environment variables, never typed into the command; check `--help` for a prompt or stdin form.

```bash
wrangler containers registries list

# ECR
wrangler containers registries configure <DOMAIN> \
  --aws-access-key-id "$AWS_ACCESS_KEY_ID"

# DockerHub
wrangler containers registries configure <DOMAIN> \
  --dockerhub-username "$DOCKERHUB_USERNAME"

wrangler containers registries delete <DOMAIN>
```

### Workflows

```bash
wrangler workflows list
wrangler workflows describe nightly-sync

# start a run, with or without input
wrangler workflows trigger nightly-sync
wrangler workflows trigger nightly-sync --params '{"key": "value"}'

wrangler workflows delete nightly-sync

# runs (instances)
wrangler workflows instances list nightly-sync
wrangler workflows instances describe nightly-sync <INSTANCE_ID>
wrangler workflows instances terminate nightly-sync <INSTANCE_ID>
```

```jsonc
{
  "workflows": [
    { "binding": "SYNC", "name": "nightly-sync", "class_name": "NightlySync" }
  ]
}
```

### Pipelines

The Pipelines command set has changed between releases. Do not copy commands from memory: run `wrangler pipelines --help` and read Cloudflare's Pipelines documentation for the commands your version supports. The binding in config looks like this:

```jsonc
{
  "pipelines": [ { "binding": "EVENTS", "pipeline": "events-pipe" } ]
}
```

### Secrets Store

```bash
wrangler secrets-store store create team-store
wrangler secrets-store store list
wrangler secrets-store store delete <STORE_ID>

wrangler secrets-store secret put <STORE_ID> stripe-key
wrangler secrets-store secret list <STORE_ID>
wrangler secrets-store secret get <STORE_ID> stripe-key
wrangler secrets-store secret delete <STORE_ID> stripe-key
```

```jsonc
{
  "secrets_store_secrets": [
    { "binding": "STRIPE_KEY", "store_id": "<STORE_ID>", "secret_name": "stripe-key" }
  ]
}
```

## 8. When something breaks

| Symptom | Fix |
|---|---|
| `command not found: wrangler` | `npm install -D wrangler` |
| Authentication errors | `wrangler login` |
| Startup time limit exceeded | `wrangler check startup` profiles startup and writes CPU profiles |
| Type errors right after a config edit | `wrangler types` |
| Local data does not stick | Look in the `.wrangler/state` folder |
| A binding is `undefined` in code | The name in code must match the config exactly |

```bash
wrangler whoami
wrangler check startup

# config docs in the terminal
wrangler docs configuration
```
