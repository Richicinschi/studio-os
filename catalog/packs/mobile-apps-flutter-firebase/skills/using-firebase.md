---
id: using-firebase
title: Using Firebase
description: "Use when building on Firebase: firebase, firestore, cloud functions, firebase functions, hosting, auth, storage, emulator, deploy, init, rules, security, secrets, HTTP, Pub/Sub, callable, scheduled, onDocumentCreated, onRequest, onCall, onSchedule, rewrites, headers, GCP, BigQuery, Cloud Tasks"
requires: [firebase]
---

# Using Firebase

## When to use

Typical wordings: "set up Firebase", "write a Firestore query", "add a Cloud Function that runs when a document is created", "run the emulators", "my security rules are too open", "deploy hosting", "store an API key for a function", "send events to BigQuery".

It covers Firestore data and queries, Cloud Functions (1st and 2nd generation, TypeScript and Python, triggers for Firestore, Auth, Storage, HTTP, callable, scheduled and Pub/Sub), the Firebase CLI, the emulators, Firestore and Storage rules, Auth on the server, Hosting config and the GCP services around a Firebase project.

Not for: GCP work with no Firebase in it, AWS or Azure, self-hosted or non-serverless backends, or data that needs heavy relational queries (pick Cloud SQL). The Flutter client side (screens, routing, widgets) stays with the neighbouring Flutter skills in this pack; this skill takes over once the question is about the Firebase project, its rules or its server code.

Every deploy, secret change, production import and delete touches the live project. Ask the owner first and say what it will change and what it may cost.

## How it works

Helper script: `using-firebase/scripts/fbtool.sh <command>` wraps the official `firebase` CLI. Commands: `init`, `emu`, `deploy`, `fn-deploy`, `secret`, `export`, `import`. Read a script before first use. `deploy`, `fn-deploy`, production `export` and `import`, and `secret delete` stop and ask for a yes first (a "no" or no answer cancels and exits with code 1, so a calling script sees the stop), and `deploy` and `fn-deploy` take `--dry-run`. `--force` on the two deploy commands skips that question and lets the CLI delete deployed functions missing from the local code, so never add it yourself; `secret set` writes a new secret version with no question at all, so treat it as a production change and get the owner's yes before running it.

1. **Start the project (owner step).** `init` is interactive, so do not run it yourself: print `fbtool.sh init [project-id]` and ask the owner to run it. It checks the CLI is installed and the owner is logged in, then starts the CLI's picker; the owner chooses Firestore, Functions, Hosting, Storage and Emulators in it.
2. **Copy the starting files** from `using-firebase/assets/`: `firebase.json.template` to `firebase.json`, `firestore.rules.template` to `firestore.rules`, `storage.rules.template` to `storage.rules`, `tsconfig.functions.json` to `functions/tsconfig.json`, `gitignore.template` into your ignore file. Trim what the app does not use.
3. **Run locally.** `fbtool.sh emu` starts the emulator suite, saves data to `./emulator-data` on exit and reloads it next time. Flags: `--debug` (function inspector on port 9229), `--import <dir>`, `--no-persist`, `--only a,b`. Default ports are 9099 (Auth), 5001 (Functions), 8080 (Firestore), 9199 (Storage), 5000 (Hosting) and 4000 (the UI). More in [CLI and emulators](using-firebase/cli-and-emulators.md).
4. **Write functions.** Use 2nd generation unless you need Auth `onCreate` or `onDelete`, which exist only in 1st generation. Triggers, options, errors, retries, secrets and App Check are in [Functions](using-firebase/functions.md).
5. **Add Python functions if needed.** `python using-firebase/scripts/new_python_functions.py --path python-functions --codebase python` writes a starter project and prints the `firebase.json` entry. Add that entry, then `fbtool.sh fn-deploy --codebase python`. Pick TypeScript when the team and the client SDKs are JavaScript, Python when the work is data or ML. Both can live side by side as separate codebases.
6. **Model data and rules.** Embed data that is read together and rarely changes; reference data that changes often or is shared; use subcollections for parent and child, root collections for queries across parents. Details in [Firestore](using-firebase/firestore.md). Start rules from the template, test them in the emulator, then `firebase deploy --only firestore:rules`. Patterns, validation, claims and rule tests are in [Rules and Auth](using-firebase/rules-and-auth.md).
7. **Set secrets before the first deploy.** `fbtool.sh secret set NAME` (also `get`, `list` which runs `gcloud secrets list`, `delete`, `versions`). Setting again creates a new version, which is how you rotate. Bind the secret to each function that reads it. Prefer this over raw `gcloud` because it handles the access binding.
8. **Preview, then deploy.** `fbtool.sh deploy --dry-run`, show the owner the result, and only then `fbtool.sh deploy` (flags `--only`, `--except`, `--message`; `--force` skips the confirmation and is the owner's call, not yours). Data moves with `fbtool.sh export` and `import`; production export and import go through a `gs://` bucket, and `--collections a,b` becomes the single flag `--collection-ids=a,b` (spaces trimmed). `bash using-firebase/scripts/test_fbtool.sh` checks the wrapper with stand-in programs and calls nothing real.
9. **Hosting and GCP.** Rewrites, redirects, headers, preview channels, rollback, IAM roles, logging, BigQuery and Cloud Tasks are in [Hosting and GCP](using-firebase/hosting-and-gcp.md).

## Without local tools

With no `firebase` CLI, write the config files, rules and function code in the repo and hand the owner the exact commands to run (from [CLI and emulators](using-firebase/cli-and-emulators.md)). Do not claim a deploy, a rules test or an emulator run happened. Say what is untested.

## Checks before done

- Rules were tested in the emulator and nothing is open to everyone; the last match in each rules file denies by default.
- `firebase use` shows the project you mean to touch.
- Every secret a function needs appears in `fbtool.sh secret list` (it runs `gcloud secrets list`).
- Functions ran against the emulator.
- Firestore indexes are deployed (`firebase deploy --only firestore:indexes`).
- A dry run was read and the changes match the intent.
- App Check is on for production apps, a budget alert exists in the GCP console, and Cloud Logging and Error Reporting are enabled.
- Nothing was deleted or deployed without the owner's yes.
