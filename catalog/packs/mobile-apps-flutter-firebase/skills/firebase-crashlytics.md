---
id: firebase-crashlytics
title: Firebase Crashlytics setup
description: Use for Android or iOS apps that need crash reporting added, Crashlytics set up, or the Crashlytics SDK used, covering provisioning, install, test crash, custom keys, logs, user ids, non-fatal errors.
---

# Firebase Crashlytics setup

## When to use

Typical wordings: "set up Crashlytics", "add crash reporting to my app", "how do I log a non-fatal error", "why does my test crash not show up".

Neighbours: `firebase-basics` handles CLI install, login, project and app creation, and the MCP server install; come back here once a project and an app exist. `xcode-project-setup` handles Xcode project edits and linking the iOS config file; this skill relies on it for iOS.

## How it works

1. Check the prerequisites. Crashlytics needs a Firebase project plus one Firebase app, Android or iOS. To read collected crashes from the agent side, the Firebase CLI MCP server must be installed (see `firebase-basics`). Without it, read the console by hand.
2. Pick the platform and follow its guide:
   - Android: [android-setup.md](firebase-crashlytics/android-setup.md)
   - iOS: [ios-setup.md](firebase-crashlytics/ios-setup.md)
3. Force a test crash. This step is required, never skipped: the install is not proven until a real crash arrives. The guides give the code for each platform. Crash a few seconds after launch, run the app, then relaunch it, because the report is sent on the next start.
4. Verify and clean up. Wait a few minutes. Check with the MCP `get_report` tool when it is installed; otherwise open the Crashlytics page of the Firebase console (DevOps and Engagement, then Crashlytics). Once the crash is confirmed, delete the test-crash code at once, or the app will crash on every start.
5. Make reports useful (optional but recommended). The SDK can attach:
   - custom keys (state at the time of the crash),
   - custom log lines (a trail before the crash),
   - a user identifier,
   - non-fatal exceptions you catch and report yourself.

   Each platform has its own Firebase page named "Customize Crash Reports" (Android) and "Customize Crash Reports for Apple Platforms". Read the page for the platform in use before writing the calls.

## Without local tools

The CLI is optional. When it is not installed, run it through `npx -y firebase-tools@latest <command>`. If neither the CLI nor the MCP server is available, create the project and app in the Firebase console and download the config file from there; verify the test crash in the console.

## Checks before done

- A Firebase project and app exist, and the config file (Android `google-services.json` in the app module, iOS `GoogleService-Info.plist`) is in place.
- The test crash was seen in Crashlytics, by `get_report` or in the console.
- The test-crash code is removed again.
- Android native code: the NDK dependency and symbol upload are on. iOS: the dSYM upload script is present and was verified.
