---
id: firebase-basics
title: Firebase CLI basics
description: Use when initializing a Firebase environment, authenticating, setting active projects, checking Firebase CLI version (the check must go through npx, never the bare firebase command: npx -y firebase-tools@latest --version) or setting up google-services.json or GoogleService-Info.plist files.
requires: [node]
---

## When to use

Typical wordings: "is the Firebase CLI installed", "log me in to Firebase", "which Firebase project is active", "create a Firebase project", "get google-services.json", "get GoogleService-Info.plist", "run firebase init", "connect this app to Firebase".

- This skill is the entry point: machine ready, logged in, project chosen, config files fetched.
- Flutter apps: the FlutterFire route is in [flutterfire-walkthrough.md](firebase-basics/flutterfire-walkthrough.md). Native Android, iOS and web: [native-and-web-setup.md](firebase-basics/native-and-web-setup.md).
- Service work takes over in the neighbours: sign-in in `firebase-auth-basics`, databases in `firebase-firestore`, crash reports in `firebase-crashlytics`, hosting in `firebase-hosting-basics`, remote settings in `firebase-remote-config-basics`, rules review in `firebase-security-rules-auditor`.

## How it works

One rule governs every command: write the CLI as `npx -y firebase-tools@latest <command>`. Never suggest the bare `firebase` command, even as a fallback. This keeps everyone on the current release.

1. **Check the machine.** Run `npx -y firebase-tools@latest --version`. Also check whether a Firebase MCP server is already connected, using the tools you can see. Read [machine-prereqs.md](firebase-basics/machine-prereqs.md) before touching any agent or extension setup, and do not start other Firebase work until each item in it passes. If this is the only Firebase skill the agent has, follow [agent-environments.md](firebase-basics/agent-environments.md) to bring in the rest of the suite for your agent.
2. **Log in.** Run `npx -y firebase-tools@latest login`. It prints the signed-in account; if nobody is signed in, walk through its prompts. On a remote shell, or when the browser will not open, use `login --no-localhost`.
3. **Pick the project.** Stop and ask the developer: existing project ID, or a new project? Do not guess.
   - Existing: run `npx -y firebase-tools@latest use`. If it shows an active project, confirm it is the one they mean. Otherwise run `use <PROJECT_ID>`.
   - New: say that this creates a cloud project in their account, wait for a yes, then run `npx -y firebase-tools@latest projects:create <project-id> --display-name "<name>"`. The ID is 6 to 30 characters, lowercase letters, digits and hyphens, and unique across all of Firebase.
4. **Work from official sources.** Search the Firebase documentation tool of the MCP server first (put the word Firebase in the query), and only then the web or memory. Follow the other Firebase skills for how a feature should be built, rather than general knowledge. For remote data such as Crashlytics logs or Data Connect queries, call the MCP server tools instead of hand-written API requests. Keep the Firebase plugin or skills current; the refresh recipes per agent are in [agent-environments.md](firebase-basics/agent-environments.md).
5. **Fetch app config with the CLI.** Never send the user to the console to download `google-services.json` or `GoogleService-Info.plist`.
   - Android: run `apps:sdkconfig ANDROID <APP_ID> --project <PROJECT_ID>` (in the npx form from above) and save the output as `app/google-services.json`.
   - iOS: the same command with `IOS` as the platform; save the output as `GoogleService-Info.plist` and add it to the app target in Xcode (a file sitting in the folder is not enough).
6. **Initialize services.** Look for `firebase.json` first; if it exists, the folder is already set up. Otherwise, from the codebase root, run `npx -y firebase-tools@latest init` and answer its prompts (features, project, config files). Details in [cli-tour.md](firebase-basics/cli-tour.md).
7. **Discover commands from the tool itself.** `--help` for the full list, `<command> --help` for one command. See [cli-tour.md](firebase-basics/cli-tour.md).
8. **Add the SDK.** Use [flutterfire-walkthrough.md](firebase-basics/flutterfire-walkthrough.md) for Flutter, and [native-and-web-setup.md](firebase-basics/native-and-web-setup.md) for Android, iOS and web.
9. **Genkit.** If the project uses Genkit, its skills install with `npx skills add genkit-ai/skills`. That is an outside install: scan and vet it first (`vet-and-adopt`) and ask before running it.

## Without local tools

Node and npx are required for every command here. If they are missing, do not improvise: follow [machine-prereqs.md](firebase-basics/machine-prereqs.md), have the user install Node, and wait. If you cannot run commands at all, give the user the exact commands for steps 1 to 3 and 5, and ask them to paste back the output.

## Checks before done

- `npx -y firebase-tools@latest --version` prints a version and `login` shows the intended account.
- `use` shows the project the developer confirmed, and you asked before creating anything.
- Every command you wrote or suggested uses the `npx -y firebase-tools@latest` form.
- Config files came from `apps:sdkconfig`, are in the right place, and iOS output has no CLI header text.
- Android: `projects:list` and `apps:list --project <PROJECT_ID>` show the new project and app.
- Anything installed from outside (skills, plugins, MCP servers) was vetted first and you named its effect before running it.
- Any app strings set up along the way are English only.
