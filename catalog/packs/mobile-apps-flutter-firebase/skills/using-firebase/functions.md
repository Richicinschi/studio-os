# Cloud Functions notes

## Picking a generation

The limits and defaults in this file are the platform's documented values at the time of writing; check the vendor's documentation for the current ones before relying on them.

Concurrency: 1st gen serves one request per instance, 2nd gen up to 1000 (default 80). Longest allowed timeout: HTTP and callable 9 minutes in 1st gen against 60 in 2nd gen; in 2nd gen scheduled and task-queue functions get 30 minutes and other event-driven ones 9. CPU follows memory in 1st gen and can be set per function in 2nd gen; check the vendor's documentation for the current memory and vCPU ceilings. Secrets: the deprecated config store against Secret Manager. Auth triggers: 1st gen has all of them, 2nd gen only the blocking ones. 2nd gen is built on Cloud Run plus Eventarc.

Default to 2nd gen. Use 1st gen only for Auth `onCreate` and `onDelete`.

```typescript
// 2nd gen
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";

export const welcomeNewUser = onDocumentCreated("users/{uid}", (event) => {
  console.log("created", event.params.uid, event.data?.data());
});
export const ping = onRequest({ cors: ["YOUR_APP_ORIGIN"] }, (_req, res) => {
  res.json({ ok: true });
});

// 1st gen, Auth create
import * as v1 from "firebase-functions/v1";
export const onSignup = v1.auth.user().onCreate((user) => {
  console.log("uid", user.uid);
  return null;
});
```

## Triggers at a glance

| Source | 2nd gen import and name |
|---|---|
| Firestore | `firebase-functions/v2/firestore`: `onDocumentCreated`, `onDocumentUpdated`, `onDocumentDeleted`, `onDocumentWritten` |
| Storage | `.../v2/storage`: `onObjectFinalized`, `onObjectDeleted` |
| HTTP | `.../v2/https`: `onRequest` (with CORS option) and `onCall` (callable) |
| Schedule | `.../v2/scheduler`: `onSchedule` |
| Pub/Sub | `.../v2/pubsub`: `onMessagePublished` |
| Auth blocking | `.../v2/identity`: `beforeUserCreated`, `beforeUserSignedIn` |

Python has the same set under `firebase_functions` (`firestore_fn`, `https_fn`, `scheduler_fn`, `identity_fn`). Blocking functions can reject a signup or sign-in by throwing an `HttpsError`, and can return extra claims or a changed display name.

## Schedules

Two syntaxes work. Plain phrases: `every 5 minutes`, `every 24 hours`, `every monday 09:00`. Cron has five fields, minute hour day-of-month month weekday: `0 2 * * *` is daily at 02:00, `0 9 * * 1` is Mondays at 09:00, `*/15 * * * *` is every 15 minutes. Give a `timezone` whenever the hour matters.

## Errors in callable functions

Throw `HttpsError(code, message)`. Check `request.auth` first and validate the input fields before using them.

| Code | HTTP |
|---|---|
| ok | 200 |
| invalid-argument, failed-precondition, out-of-range | 400 |
| unauthenticated | 401 |
| permission-denied | 403 |
| not-found | 404 |
| already-exists, aborted | 409 |
| resource-exhausted | 429 |
| cancelled | 499 |
| internal, unknown, data-loss | 500 |
| unimplemented | 501 |
| unavailable | 503 |
| deadline-exceeded | 504 |

In event functions there is no caller to answer. Log with context. Rethrow only when you want the platform to retry.

## Retries and idempotency

Event functions can run more than once for the same event. Firestore and Storage triggers retry when retry is on, for up to 7 days in 1st gen and 24 hours in 2nd gen; Pub/Sub uses backoff. Set `retry: false` in the options when a repeat would do harm. When it would not be safe to repeat, record the event id (`event.id`) in a document first and skip if it is already there, or write in a way that gives the same end state when repeated (set with a fixed id, not add).

## Options

Set shared defaults with `setGlobalOptions` and override per function.

| Option | Meaning | Default |
|---|---|---|
| region | where it runs | us-central1 |
| memory | e.g. `512MiB` | check the vendor's documentation |
| timeoutSeconds | limit (the maximums are in the generation comparison above) | 60 |
| minInstances | warm instances | 0 |
| maxInstances | cap | check the vendor's documentation |
| concurrency | requests per instance | 80 when the function has at least 1 vCPU, otherwise 1 |
| cpu | vCPU | 1 for up to 2 GB of memory |
| vpcConnector, ingressSettings, labels | network and tagging | no connector, no labels; check the documentation for the ingress default |

Memory to default CPU in 2nd gen: up to 2 GB gives 1 vCPU, 4 GB and 8 GB give 2, 16 GB gives 4. The fractions of a CPU (for example 1/6 at 256 MB) belong to 1st gen, and `setGlobalOptions({ cpu: "gcf_gen1" })` brings that behaviour to 2nd gen functions.

## Cold starts and memory

Raise `minInstances` for latency-sensitive endpoints (it costs money, so say so). Import heavy libraries lazily inside the code path that needs them. Create the Admin app and Firestore client once at module level so warm calls reuse them. Raise `concurrency` for light handlers. For large files, read as a stream, not a full download.

## Secrets and parameters

Create a secret with the CLI, declare it in code (`defineSecret("NAME")`), list it in the function's `secrets` option, and read `.value()` inside the handler only. Python reads it from the environment after you list it in the decorator options. Non-secret settings use params and env files: a shared `.env` plus one per project alias such as `.env.production`. Never put a secret in source or in an env file that is committed.

## Logging

Log objects, not concatenated strings: the logger from `firebase-functions/logger` (Node) or the standard `logging` module (Python) lands in Cloud Logging with fields you can filter on. Read them with `firebase functions:log` (add `--only name` for one function) or in Logs Explorer.

## Testing

Start the emulators (or `firebase emulators:exec "npm test"`), point the Admin SDK at them, and call the functions through their trigger: write a document, hit the HTTP URL, call the callable through the client SDK on the emulator. Use unit tests with a mocked Admin SDK for pure logic.

## App Check

Turn on `enforceAppCheck: true` for callable and HTTP endpoints that matter. Add `consumeAppCheckToken: true` to block replay. In HTTP functions verify the token header yourself. Roll out in steps: watch the App Check metrics before enforcing. Use debug tokens for local runs and CI.
