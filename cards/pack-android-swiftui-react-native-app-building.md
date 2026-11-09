---
id: pack-android-swiftui-react-native-app-building
module: domains
checked: 2026-11-09
tokens:
  light: 57
  standard: 57
  full: 57
---

# Domain: phone apps (Android, SwiftUI and React Native)

## Why

- **The problem:** a phone app that runs on your device can still be refused at the store. Play and the App Store change their rules often, a remembered deadline is out of date, and a non-coder who builds an app with Claude learns of the rejection from an email, not from the code.
- **The reason:** this pack gives Claude three skills, each a written procedure: build and update a native Android app with Compose, with R8 shrinking, edge-to-edge layout and the Play policy changes that block releases; review SwiftUI and iPhone code for the usual faults, App Store rules and accessibility before it ships; and set up, build, update and test a React Native app with Expo.
- **The cost of skipping it:** Claude answers store-policy questions from memory, which is where numbers and deadlines go stale, and a rejection costs you a release cycle.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The Android skill says never to trust a remembered policy number and to work from the current Play Console page, and each skill ends in a checklist you can verify.

## Detect

Read-only: presence and versions, never your app's code. Programs the skills use, printed as found or not found:

- `node --version` and `npm --version` for React Native and Expo; `java -version 2>&1 | head -1` and `adb version 2>/dev/null | head -1` for Android; `xcodebuild -version 2>/dev/null | head -1` on a Mac for SwiftUI.
- The pack, at project and user level: `ls -d .claude/skills/android-swiftui-react-native-app-building "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/android-swiftui-react-native-app-building 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'android|swiftui|ios|react native|expo|play store|app store'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers phone-app building and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you build or publish phone apps for Android, iPhone or both?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names an Android app, an iPhone app, React Native, Expo or a store release as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the app.
   - Every project, in your user folder. Recommended when you build apps in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Per skill: Android Studio for the Android skill, Xcode on a Mac for the SwiftUI skill, Node for the React Native skill. A skill you do not use needs none of them.
- All three skills have a "Without local tools" section for claude.ai. There Claude works from the files, manifest, warnings and rejection text you paste, and says plainly that it ran nothing.
- Accounts and keys only if you ship: a Play Console account, an Apple developer account, an Expo account for cloud builds. The skills say never to print or commit a signing key or its passwords.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/android-swiftui-react-native-app-building/`: scans it with SkillSpector (`skillspector scan catalog/packs/android-swiftui-react-native-app-building --no-llm`), triages the findings, and recommends the decision.
2. **Claude and you:** read what the pack ships. It holds three skill files and no scripts or templates (a search for `.py`, `.sh`, `.js`, `.ts` and `.mjs` files finds none). The React Native skill does name commands that install and run software (`npm install -g eas-cli`, `eas login`, `eas build`, `eas update`); read them in `skills/react-native-and-expo-basics.md` with Claude.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/android-swiftui-react-native-app-building/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the three skill files under `skills/`.
2. **you:** in a new session, say "Google Play rejected my Android update, here is the email". Expected: Claude opens the pack's entry, picks the Android skill, reads it in full, and asks for the merged manifest and the current Play policy text instead of answering from memory.
3. If Claude explains the rejection without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `android-swiftui-react-native-app-building` folder from `skills/`.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 57 tokens (estimate, bytes divided by 4). Its index, about 322 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **Your app code is session content.** Files, manifests and rejection emails that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you open an app that is not yours.
- **Upload, review and payment need your approval.** The skills do not upload a build, press "send for review", change a store listing, pay a fee, start a cloud build that may be billed, or send an over-the-air update to real users without your yes. Keep that behaviour when you adapt them.
- **Policy changes.** Store rules and deadlines move. Check what Claude cites against the store's own page that day.
- **Studio references.** The Android skill hands privacy-policy and legal wording to a studio skill named `legal-play-gate`. If you have no skill by that name, replace the line with the one you use, or take the legal check from a lawyer.
