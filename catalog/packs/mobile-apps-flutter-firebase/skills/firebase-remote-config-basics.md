---
id: firebase-remote-config-basics
title: Firebase Remote Config basics
description: Use when setting up Firebase Remote Config, managing feature flags or remote settings, editing and deploying the config template, or changing app behavior dynamically without a store release. Covers template management and SDK usage.
requires: [firebase]
---

## When to use

Typical wordings: "add a feature flag", "change this text without an update", "roll a feature out to 10 percent of users", "turn it on only in one country", "deploy the remote config template".

- Project login, project creation and app registration belong to the `firebase-basics` skill. Come back here once a project and an app exist.
- Remote Config is a cloud template of key/value parameters, optionally gated by conditions. The app ships with fallback values and pulls the template at runtime.
- Flutter apps normally use the `firebase_remote_config` plugin. The native Android and iOS notes in this skill's folder are for native hosts or for checking what the plugin does underneath.

## How it works

1. Confirm a Firebase project and an Android or iOS app are registered. Without both there is nothing to configure.
2. Run the CLI as `npx -y firebase-tools@latest`. Two known failures:
   - Registry 403 from npx: tell the user the latest tools could not be fetched, and only if they confirm a global install (`npm install -g firebase-tools`) fall back to the plain `firebase` command.
   - "No active project": run `login:list`, and if logged in, ask the user for the project ID. Add `--project <PROJECT_ID>` to every later command.
3. Pull the live template into a file: `npx -y firebase-tools@latest remoteconfig:get -o remote_config.json`. Never edit blind; always start from what is live.
4. Edit that file. Pick the targeting signal that fits the request (for example `device.country` for a region, `percent` for a staged rollout), then add or change entries in `conditions` and `parameters`.
5. Stop and hand the file to the user. Say the changes are in `remote_config.json`, ask them to read it, and wait for the word "deploy". Do not deploy on your own judgment.
6. Deploy and verify:
   - If `firebase.json` is missing, create it with `{ "remoteconfig": { "template": "remote_config.json" } }`.
   - Run `npx -y firebase-tools@latest deploy --only remoteconfig`.
   - Run `npx -y firebase-tools@latest remoteconfig:versions:list` and confirm the newest version is yours.
7. In the app, shape the loading pattern:
   - Set in-app defaults so the app works offline and before the first fetch.
   - At startup, activate whatever was fetched last time, then fetch fresh values in the background for the next launch. The user never waits on the network.
   - For changes that must show immediately, add the SDK's real-time listener.
8. Connect the SDK per platform: [Android](firebase-remote-config-basics/android-setup.md), [iOS](firebase-remote-config-basics/ios-setup.md). In Flutter, use the plugin's equivalents of defaults, fetch-and-activate and the real-time listener.

## Without local tools

The CLI is the preferred route but not required. Without Node or the CLI, edit the template in the Firebase console and still follow the review step: show the user the intended parameter and condition changes before they publish.

## Checks before done

- The user saw the edited template and said to deploy.
- The version list shows the new version after the deploy.
- Every parameter used in code has an in-app default.
- Values are read only after activation, and a failed fetch leaves the app working on defaults.
