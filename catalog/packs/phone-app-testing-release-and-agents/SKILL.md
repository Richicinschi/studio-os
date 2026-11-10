---
name: phone-app-testing-release-and-agents
description: Use when the user tries an app on a phone or emulator, checks a screen or an APK build, prepares a store release, reads crash reports, adds animation or widgets, lets an AI agent use a phone, or changes phone settings with adb.
---

# Phone apps: testing, release checks, crash reports, agents and adb

Find the skill that fits the task in the table, read its file in full before you start, and follow it. If a skill needs a local tool and you are on claude.ai without one, follow that skill's "Without local tools" section.

| Skill | What it does | When to use | File |
|---|---|---|---|
| Safe agents that operate a phone | Consent, scope, no stored passwords and a kill switch for any agent that taps and types on a phone. (needs: adb (optional)) | Use when the user builds or runs an agent that controls a phone or its apps. | skills/phone-agent-safety.md |
| Inspect your own app build | Read an app build you made or may analyse in writing: manifest, permissions, leaked secrets, size. (needs: jadx) | Use when the user wants the build of an app they made, or have written permission to analyse, checked. | skills/inspect-your-own-app-build.md |
| Change phone settings by adb | Turn off unwanted features over adb with per-phone rules, an undo list and a question before every change. (needs: adb) | Use when the user wants ads, notifications or preinstalled apps switched off on their own Android phone. | skills/phone-cleanup-and-settings-by-adb.md |
| Test an app on a phone or emulator by looking | Run the app on a device or emulator and test it by reading the screen: accessibility tree first, screenshot second, counted faults. (needs: adb or an iOS simulator) | Use when the user wants an app tried out on a phone or emulator and the problems listed. | skills/drive-a-phone-or-emulator.md |
| Judge a mobile screen before shipping | Touch targets, safe areas, dark mode, empty and error states and one simulator pass. | Use when the user wants a mobile screen reviewed for quality before release. | skills/mobile-ui-build-bar.md |
| Final checks before uploading an app | Privacy labels, permissions, version numbers, screenshots and the usual review rejections. | Use when the user is about to submit an app to the App Store or Google Play. | skills/app-store-and-play-release-gate.md |
| Crash reports and release health | Set up and read crash reports and release health after a launch. (needs: a Firebase or Sentry account) | Use when the user wants to find why an app crashes in the wild or watch a release. | skills/crash-and-release-monitoring.md |
| Smooth animation and home-screen widgets | Transitions, home-screen widgets and live activities that do not stall the UI thread. | Use when the user adds animation, a widget or a live activity to a mobile app. | skills/mobile-animation-and-widgets.md |
