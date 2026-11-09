---
id: pack-mobile-apps-flutter-firebase
module: domains
checked: 2026-11-09
tokens:
  light: 49
  standard: 49
  full: 49
---

# Domain: mobile apps with Flutter and Firebase

## Why

- **The problem:** a Flutter app with a Firebase back end has many places to go wrong that a first version does not show: a screen that overflows on a tablet, sign-in that is half connected, database rules left open to everyone, a deploy that changes a live project before you meant it to. A non-coder who builds with Claude does not know which of these to ask about.
- **The reason:** this pack gives Claude eighteen skills, each a written procedure. Grouped by job:
  - Build and fix screens: responsive layouts, layout errors such as overflow stripes, live widget previews, and the UI, logic and data structure of the app.
  - Data and network: model classes with `fromJson` and `toJson`, calls to a REST API with the `http` package, and `go_router` navigation with deep links.
  - Test and translate: widget tests, integration tests, and translations with ARB files, plurals and placeholders.
  - Connect Firebase: check the CLI, log in, pick a project, fetch the app's config files, and turn on sign-in providers.
  - Data and rules: Firestore databases, models, indexes and queries, and an auditor that tries to break your security rules and scores them 1 to 5.
  - Run it live: Crashlytics with a test crash, Remote Config flags, Hosting with preview channels, and Cloud Functions, emulators, secrets and deploys.
- **The cost of skipping it:** Claude writes each of these from memory, in whatever version of the tools it last saw, and the gaps show up when real users arrive.
- **The principle:** [hard stops for the irreversible, judgement for the rest](../PRINCIPLES.md#hard-stops-for-the-irreversible-judgement-for-the-rest). The skills let Claude edit files and run emulators freely, and stop to ask before anything that changes a live Firebase project.

## Detect

Read-only: presence and versions, never the contents of your app. Tools the skills use, printed as found or not found:

- `flutter --version 2>/dev/null | head -1`, `dart --version`, `node --version`, `npx --version`, `flutterfire --version` and `gcloud --version 2>/dev/null | head -1`. The Firebase skills run the CLI as `npx -y firebase-tools@latest`, so `firebase --version` is optional.
- The pack, at project and user level: `ls -d .claude/skills/mobile-apps-flutter-firebase "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/mobile-apps-flutter-firebase 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'flutter|dart|firebase|firestore|crashlytics'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers Flutter or Firebase and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you build Flutter apps or use Firebase?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names a mobile app, Flutter, Dart, Firebase, sign-in, Firestore or crash reports as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the app.
   - Every project, in your user folder. Recommended when you build apps in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- For the Flutter skills: the Flutter SDK (`flutter`, which brings `dart`). Three of them name it as a requirement: integration tests, widget previews and localization. Nothing in the pack asks for an Android signing keystore.
- For the Firebase skills: Node and `npx`, which run the Firebase CLI (`npx -y firebase-tools@latest`). `firebase-basics` is the skill that checks this and walks through installing Node.
- `flutterfire` (`dart pub global activate flutterfire_cli`) to link a Flutter app to a Firebase project.
- `gcloud` for two commands of the `using-firebase` helper script: listing secrets, and exporting or importing production Firestore data through a `gs://` bucket.
- Accounts: a Google account with a Firebase project (the skill can create one, after your yes). The CLI signs in through the browser with `login`. The app's config files (`google-services.json`, `GoogleService-Info.plist`) are fetched by the CLI, not downloaded by hand. Cloud Functions secrets are set with a command the script runs after you approve. The pack mentions billing and IAM only as shared project settings in `skills/using-firebase/hosting-and-gcp.md`; it does not turn billing on.
- A "Without local tools" section on claude.ai exists in eight skills: `firebase-basics`, `firebase-crashlytics`, `firebase-firestore`, `firebase-remote-config-basics`, `flutter-add-integration-test`, `flutter-add-widget-preview`, `flutter-setup-localization` and `using-firebase`. The other ten have no such section. On claude.ai Claude writes the files and hands you the exact commands to run yourself.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/mobile-apps-flutter-firebase/`: scans it with SkillSpector (`skillspector scan catalog/packs/mobile-apps-flutter-firebase --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude and you:** read the files that run or seed a project, together. Only one skill holds them: `skills/using-firebase/scripts/` has `fbtool.sh` (a wrapper around the `firebase` and `gcloud` commands), `new_python_functions.py` and `test_fbtool.sh` (a test that uses stand-in programs and calls nothing real), and `skills/using-firebase/assets/` has `tsconfig.functions.json` and the starting templates for `firebase.json`, the Firestore and Storage rules and an ignore file. The script is the part that deploys, so read it before first use.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/mobile-apps-flutter-firebase/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **you:** install Flutter and Node if Detect did not find them. A command that installs software is handed to you to type; Claude does not run it.
5. **Claude:** records the decision, the scope, the tools found and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the eighteen skill files under `skills/`.
2. **you:** in a new session, say "my Flutter screen shows yellow and black stripes and says RenderFlex overflowed". Expected: Claude opens the pack's entry, picks the skill for fixing layout issues, reads it in full, and works from it. For the Firebase side, "my Firestore rules changed today, are they safe before I deploy?" should open the rules auditor.
3. If Claude answers without opening the pack's entry, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `mobile-apps-flutter-firebase` folder from `skills/`.
- **you:** remove the zip from claude.ai's skill settings, if you added one.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed. Nothing the skills did in a Firebase project is undone by this: a deploy already made stays on the project.

## Watch out

- **The entry is the one cost every session:** about 49 tokens (estimate, bytes divided by 4). Its index, about 1,275 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **Steps that touch a live Firebase project ask for your yes first.** The skills say so for: turning on sign-in providers (`deploy --only auth`), a live Hosting deploy (preview channel first), a Remote Config deploy (Claude hands you the file and waits for the word "deploy"), a Firestore index build, creating a Firebase project, and any `fbtool.sh` deploy, Functions deploy, production export or import, or secret delete. The helper's `--force` flag skips that question and is your call, not Claude's. Keep this behaviour when you adapt the skills.
- **Your app is session content.** Files Claude reads from your app, and Crashlytics reports it fetches, go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you open an app that holds customer data.
- **Outside installs.** `firebase-basics` and its environment notes mention installing Firebase's own skills and the Genkit skills with `npx`. Those are outside code: vet them with SkillSpector before you accept them.
- **Studio-specific wording.** A few skills say "the studio's main stack", cite "studio hard rule 14" and carry a studio note about the Node version on the studio's machines (`skills/firebase-basics/machine-prereqs.md`). Replace them with your own stack and rules, and check version notes against your machine.
