---
id: pack-phone-app-testing-release-and-agents
module: domains
checked: 2026-11-09
tokens:
  light: 57
  standard: 57
  full: 57
---

# Domain: phone apps, testing, release checks and phone agents

## Why

- **The problem:** an app that runs on the builder's screen is not yet an app that is ready for a store. Touch targets, dark mode, empty states, store paperwork, crash reports and an AI agent that taps on a real phone each go wrong in ways the builder does not see until a reviewer, a user or a crash report shows them.
- **The reason:** this pack gives Claude eight written procedures for phone apps. Representative jobs: try an app on a phone or emulator by reading the screen and list the faults with counts; judge one mobile screen against a quality bar before release; run the final checks before an App Store or Google Play upload; set up and read crash reports after a launch; put safety limits around an agent that operates a phone; and switch off ads or preinstalled apps over `adb`, one asked-for change at a time.
- **The cost of skipping it:** each of these starts from a blank prompt, and the usual result is a statement that the app looks fine instead of a list of counted faults, or an agent given more reach on your phone than you meant.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The skills end in a report of what was checked and what was not, and several name "not verified" items instead of passing them.

## Detect

Read-only: presence and versions, never your app or your phone's contents. Tools some of the skills use, printed as found or not found:

- `adb version 2>/dev/null | head -1`, `jadx --version 2>/dev/null`, and, on a Mac, `xcrun simctl help 2>/dev/null | head -1`. None of these lists devices or reads anything from a phone.
- The pack, at project and user level: `ls -d .claude/skills/phone-app-testing-release-and-agents "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/phone-app-testing-release-and-agents 2>/dev/null`.
- Another skill that already covers phone apps or store release, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'android|iphone|emulator|app store|play store|crash|apk|adb'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers phone apps and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you build, test or release phone apps, or let an AI agent use a phone?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names a mobile app, an APK, a store release or a phone as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the app.
   - Every project, in your user folder. Recommended when you build or test apps in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Per skill: `adb` (Android platform tools, free) for testing on a phone and for the settings skill; `jadx` for reading an APK; an iOS simulator (macOS with Xcode only) as the other test route; a Firebase or Sentry account for crash reports. The screen-quality, store-release and animation skills need no program of their own.
- Five of the eight skills carry a "Without local tools" section for claude.ai (device testing, build inspection, crash reports, phone agent safety, phone settings). On claude.ai those skills hand you the exact commands to run on your own computer and ask you to paste the output back; they do not pretend to run anything.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/phone-app-testing-release-and-agents/`: scans it with SkillSpector (`skillspector scan catalog/packs/phone-app-testing-release-and-agents --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude and you:** the pack ships no script or template files, only instructions. Several of those instructions have Claude run `adb` and `jadx` commands on your computer, so `vet-and-adopt` reads those command lines with you, above all the ones that change a phone (`adb shell input`, `adb shell settings put`, disabling a package).
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/phone-app-testing-release-and-agents/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **you:** install `adb` or `jadx` if Detect did not find the one you need. A command that installs software is handed to you to type; Claude does not run it.
5. **Claude:** records the decision, the scope, the tools found and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the eight skill files under `skills/`.
2. **you:** in a new session, say "I am about to upload my app to Google Play, check it first". Expected: Claude opens the pack's entry, picks the release-check skill, reads it in full, and answers with a verdict (ready, ready with fixes, or not ready) that lists failed checks and the checks it could not do. It does not upload or submit anything.
3. On claude.ai, upload the pack's zip first ([START-HERE](../START-HERE.md), "If you only use claude.ai"); the same request works there, with the limits the skill states.
4. If Claude reviews the app without opening the pack, or hands over a verdict with no list of unchecked items, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `phone-app-testing-release-and-agents` folder from `skills/`.
- **you:** remove the zip from claude.ai's skill settings.
- **you:** if you used the settings skill, its undo list (kept in a session file beside your work) is the record of what was switched off; re-enable those items from it.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 57 tokens (estimate, bytes divided by 4). Its index, about 672 tokens (estimate), loads when a phone task comes up, and each skill only when it is used.
- **Your app and your phone are session content.** Screenshots, screen dumps, crash logs and build files that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you give Claude an unreleased app or a phone that holds real accounts.
- **Approval stays with you.** The skills stop and ask before installing or clearing an app, sending anything, creating an account or enabling a paid plan, and each change over `adb` needs its own yes. The release skill never uploads or submits; those are your actions. Keep these stops when you adapt the skills.
- **Only your own app and phone.** The build-inspection skill asks first whether you built the app or hold written permission, and stops if not. The phone-agent skill refuses to set up an agent on someone else's phone without their knowledge. Keep both limits.
- **Studio-specific names.** A few skills point to other studio skills by name (the legal store-gate skills, a Firebase app scanner, the Flutter and Firebase pack). Those are not in this pack; replace the pointers with your own skills or remove them. Several examples use Flutter.
