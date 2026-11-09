# Hosting and GCP notes

## Hosting config (`firebase.json`, key `hosting`)

Core keys: `public` (folder to serve), `ignore`, `cleanUrls`, `trailingSlash`, `rewrites`, `redirects`, `headers`.

- Single page app: last rewrite `{ "source": "**", "destination": "/index.html" }`.
- API behind the site: `{ "source": "/api/**", "function": { "functionId": "api", "region": "us-central1" } }`. A Cloud Run service uses `run` with `serviceId` and `region` instead. Put specific rewrites before the catch-all.
- Redirects: `{ "source": "/old", "destination": "/new", "type": 301 }`. 301 is permanent (browsers cache it); 302 is temporary. Segments such as `/blog/:slug` and globs work, and the destination can be another site.
- Headers: long cache for fingerprinted assets (`Cache-Control: max-age=31536000, immutable`), no-store for `index.html`, security headers on everything (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a Content-Security-Policy suited to the app), CORS headers for shared assets.

## Preview channels and releases

`firebase hosting:channel:deploy <name> --expires 7d` makes a temporary URL. Expiry runs from hours (`1h`) to days, defaults to 7 days, and has a ceiling set by the platform (30 days at the time of writing; check the vendor's documentation). Promote with `firebase hosting:clone <site>:<channel> <site>:live`; a specific past version clones as `<site>:@<version-id>`. List and delete channels with `hosting:channel:list` and `hosting:channel:delete`. The CLI has no rollback command: roll back in the console (Release history, then Roll back on the earlier release) or clone the old version to live. In CI, deploy a channel per pull request.

## Several sites in one project

Create with `firebase hosting:sites:create <id>`. In `firebase.json` make `hosting` an array where each entry has a `target`. Bind names with `firebase target:apply hosting <target> <site-id>`. Deploy one with `firebase deploy --only hosting:<target>`.

## A Firebase project is a GCP project

Billing, IAM, service accounts and APIs are shared; the Firebase console and the GCP console are two views of one project. Accounts you will meet: the App Engine default account (functions run as it unless told otherwise), the Admin SDK account, the Cloud Build account and the Compute default account.

Locally, use Application Default Credentials (`gcloud auth application-default login`) rather than a downloaded key. If you must create a key for a service account, keep it out of git and delete it when done. Inside Cloud Functions the credentials are automatic.

## IAM roles worth knowing

- Firebase: `roles/firebase.admin`, `firebase.viewer`, `firebase.developAdmin`, `firebase.analyticsViewer`, `firebase.growthViewer`, `firebase.qualityViewer`.
- Functions: `roles/cloudfunctions.admin`, `developer`, `invoker`, `viewer`.
- Firestore: `roles/datastore.owner`, `user`, `viewer`, `indexAdmin`.
- Storage: `roles/storage.admin`, `objectAdmin`, `objectCreator`, `objectViewer`.

Grant the smallest role that works: `gcloud projects add-iam-policy-binding PROJECT --member=... --role=...`, and read bindings back with `get-iam-policy`. Changing IAM is a production change: ask first.

## Secret Manager

The Firebase CLI route (`firebase functions:secrets:*`) is the one to use for functions because it also grants access. Direct `gcloud secrets create`, `versions add`, `versions access latest`, `list` and `delete` work too, and then you must grant the function's service account `roles/secretmanager.secretAccessor` on that secret.

## Logging, metrics, alerts

Structured logs from functions are searchable in Logs Explorer (filter `resource.type="cloud_function"`). Turn a log pattern into a log-based metric, view metrics in Cloud Monitoring, and attach an alert policy to a notification channel (create the channel first). Custom metrics can be written from code.

## BigQuery

Enable the Firebase to BigQuery export from the console for Analytics and Crashlytics data, then query the exported tables with SQL. Firestore data is exported with a Firestore export to a bucket and loaded into BigQuery, or with the dedicated export extension. Exports and queries can cost money: say so before starting.

## Other services

- Cloud Tasks: queue delayed or rate-limited work and have a function receive it.
- Pub/Sub: fan-out messages between functions and other systems.
- Cloud Scheduler: lists jobs behind scheduled functions (`gcloud scheduler jobs list`) and can run one on demand.
- Cloud Storage: reach buckets directly from the Admin SDK when rules should not apply.
- VPC connector: lets a function reach private network resources; create it, then set `vpcConnector` on the function.
