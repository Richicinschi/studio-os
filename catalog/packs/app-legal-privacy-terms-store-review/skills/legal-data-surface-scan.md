---
name: legal-data-surface-scan
description: >-
  Use when verifying an app's privacy CLAIMS against what the code ACTUALLY collects (code-faithful
  verification) — the truth-source that feeds legal-flow-grader and legal-cross-store. Runs the bundled
  scanners (pubspec.lock → SDK data map, merged AndroidManifest perms + AD_ID strip check, iOS
  PrivacyInfo.xcprivacy collected-types) and optionally Exodus + MobSF on a built binary, then NORMALIZES
  every output into one canonical flow set {data-type, recipient-entity, on/off-device, purpose, basis} with
  a coverage note (which scanners ran vs were skipped — never silently claims full coverage). Trigger on
  "data surface scan", "data-flow scan", "what does the app collect", "code-faithful verification", "SDK
  scan", "manifest scan / AD_ID check", "PrivacyInfo.xcprivacy", "Exodus", "MobSF", "verify privacy policy
  against code", "is the privacy label honest". Entity-aware: names Apple / Google-Firebase / RevenueCat /
  Cloudflare, never "third parties".
metadata:
  category: legal
  author: "Richicinschi (Claude-authored)"
  version: "1.0.0"
  domain: "privacy / data-flow / code-faithful verification (GDPR/AVG · Apple App Privacy · Play Data Safety)"
  jurisdiction: "EU / Netherlands (GDPR/AVG); platform privacy regimes (Apple, Google Play)"
---

Operates under **legal-guardrails** — load its constitution + the references listed below.

This skill produces no legal verdict of its own. It produces **EVIDENCE**: the canonical, entity-aware
flow set that downstream graders (legal-flow-grader, legal-cross-store) reconcile against the Privacy
Policy, Terms, and the two store labels. Garbage-in here poisons every grader, so its one job is to be
**accurate about what the binary/source actually does** and **honest about what it could not inspect**.

## References to load (by path; do NOT inline their contents)

- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/attribution-tiering.md` — tier every proposition.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/finding-format.md` — the `[SCAN-n]` finding shape.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/disclosure-grading.md` — PoliCheck 5-category rubric (context: this skill builds the *flows*; the grader applies the rubric).
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/sdk-data-map.md` — **authoritative** SDK → {recipient, data, on/off-device, purpose, basis, location, transfer} map. The normalizer enriches scanner output from here.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/data-category-ontology.md` — Apple ⇄ Play ⇄ GDPR crosswalk; use to assign each flow its canonical data-category name.

`skill-id` for findings = **SCAN**. Emoji severity: 🔴 BLOCKER / 🟠 MATERIAL / 🟡 MINOR / 🟢 OK; floor to the higher severity when overlapping another skill.

## App-profile inputs (from the orchestrator's Step 0 fact sheet, or read from the project)

| Input | Where it comes from |
|---|---|
| `appDir` | the root of the person's app (the scripts default to the current folder) |
| Built APK | for a Flutter app, `build/app/outputs/flutter-apk/app-release.apk` (after `flutter build apk --release`, plus whatever build flags the project uses) |
| Built IPA + pod manifests | **macOS only** (`flutter build ipa` / a Mac build after `pod install`) — Windows runs see only the app's own `Runner/PrivacyInfo.xcprivacy` |
| Stack | the SDKs and backend the scan finds, plus the hosting region from the project's backend config; ask about services configured outside the repo (example app stack: `legal-guardrails.md` §8) |

Run from the app root, or pass `appDir` as the first positional arg to point the scripts at another folder.

## Scanners (AUTHORED + TESTED — invoke via `node`, never modify)

All scripts emit JSON to stdout, need only Node ≥16 (no npm deps for the source scanners), and **degrade
gracefully** (print `skipped` + a `reason`/`howTo…` and exit 0; they never crash a sign-off).

### 1. `scan_pubspec.mjs` — Dart SDK → data-flow profile (source-of-truth for Flutter)
- **Why:** Exodus/MobSF/Privado are blind to Dart's pub ecosystem; this closes that blind spot.
- **Command:** `node legal-data-surface-scan/scripts/scan_pubspec.mjs [appDir]`
- **Reads:** `pubspec.lock`. **Output:** `offDeviceDataFlows[]` (each = a (data-type, recipient) the PP must disclose), `onDeviceOnly[]` (no external recipient — e.g. free-tier history in SharedPreferences), `unrecognisedDirectDeps[]` (direct deps not in the registry → extend the SDK map, don't ignore), `summary.recipients[]`.
- **Degrades:** missing `pubspec.lock` → `{error}` (re-point `appDir`).

### 2. `scan_android_manifest.mjs` — permissions + AD_ID strip
- **Why:** SDKs auto-merge permissions; `firebase_analytics` silently injects `com.google.android.gms.permission.AD_ID` and collects the GAID by default — a silent contradiction of any "no advertising ID" claim.
- **Command:** `node legal-data-surface-scan/scripts/scan_android_manifest.mjs [appDir]`
- **Reads:** the **merged** manifest (preferred: `build/app/intermediates/merged_manifest/release/.../AndroidManifest.xml`) else the source manifest. **Output:** `permissions[]` (with `stripped` + sensitivity note), `sensitivePermissions[]`, `targetSdk`, and `advertisingId.{presentInMerged, strippedInSource, verdict}`.
- **Degrades:** no merged manifest → falls back to source manifest and sets `isMerged:false` (build the app for a true picture); no manifest at all → `{error}`.

### 3. `scan_ios_privacy.mjs` — PrivacyInfo.xcprivacy collected types
- **Why:** the iOS analog of the Android manifest + App Privacy label; app + each pod manifest together declare collected types, tracking, and required-reason APIs.
- **Command:** `node legal-data-surface-scan/scripts/scan_ios_privacy.mjs [appDir]`
- **Reads:** every `PrivacyInfo.xcprivacy` under `ios/` (skips build dirs). **Output:** `collectedDataTypes[]` (label, linked, purposes), `anyTracking`, `healthOrFitnessDeclared[]`, `accessedApis[]`, per-manifest detail, `appManifestPresent`.
- **Degrades:** `manifestCount ≤ 1` → note "only the app manifest found — pod manifests appear after `pod install` / a macOS build; re-run on the Mac for full third-party coverage." Treat partial coverage as **partial**, not clean.

### 4. `run_exodus.mjs` — Android tracker/permission scan on a built APK (OPTIONAL)
- **Why:** Exodus statically matches APK bytecode against a tracker-signature DB (advertising/analytics/crash incl. Google Firebase Analytics, Crashlytics, RevenueCat) — off-device truth the source scan can miss. Exodus (`exodus-standalone`) is **AGPL-3.0: invoked as an external CLI via Docker, never linked.**
- **Command:** `node legal-data-surface-scan/scripts/run_exodus.mjs --apk <path.apk>`
- **Requires:** Docker + image `exodusprivacy/exodus-standalone` (auto-pulled). **Output:** `trackers[]`, `permissions[]`, `report`.
- **Degrades:** no Docker → `skipped` + install hint; no/invalid `--apk` → `skipped` + the `flutter build apk --release --dart-define-from-file=.env` instruction.

### 5. `run_mobsf.mjs` — cross-platform static scan of APK **or** IPA (OPTIONAL)
- **Why:** MobSF (GPLv3) statically analyses APK *and* IPA → SDKs, permissions, trackers (reuses Exodus signatures), and **network domains** — the only scanner that covers iOS binaries and reveals which endpoints actually receive data. **GPL: driven over its REST API, never linked.**
- **Command:** `node legal-data-surface-scan/scripts/run_mobsf.mjs --file <path.apk|.ipa>`
- **Env:** `MOBSF_URL` (default `http://localhost:8000`), `MOBSF_API_KEY` (required to scan). Server: `docker run -it -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest`.
- **Output:** `permissions[]`, `trackers[]`, `domains[]` (reconcile against declared recipients + EU-region/transfer claims). **Degrades:** server unreachable / no API key / no file → `skipped` + the precise next step.

## WORKFLOW

1. **Resolve inputs.** Confirm `appDir` (the person's app root). Note platform: on Windows expect iOS pod coverage to be partial; on macOS run after `pod install` for full pod manifests.
2. **Run the 3 source scanners** (always available): `scan_pubspec.mjs`, `scan_android_manifest.mjs`, `scan_ios_privacy.mjs`. Capture each JSON.
3. **Run the 2 binary scanners if a build exists** (optional, best-effort): build the APK (`flutter build apk --release --dart-define-from-file=.env`) then `run_exodus.mjs --apk …`; if MobSF is up, `run_mobsf.mjs --file …` (APK on any host; IPA only from a macOS build). Record each as **ran** or **skipped** with its reason — never infer coverage you didn't get.
4. **Normalize → one canonical flow set.** For every distinct flow, enrich/reconcile against `sdk-data-map.md` and assign a canonical data-category from `data-category-ontology.md`. Each flow record:
   `{ data-type (canonical), recipient-entity (named legal entity), on/off-device, purpose, lawful-basis (tier-tagged), data-location, transfer-safeguard, source-scanner(s), tier }`.
   - **De-dupe across scanners by (data-type, recipient).** The pubspec map is authoritative for Dart-level flows; Exodus/MobSF corroborate native trackers; iOS manifest corroborates Apple-declared types.
   - **On-device flows are NOT recipient flows** — free-tier breathing history (SharedPreferences / local Firestore cache) leaves the device for no one; tag `on-device`, recipient `(none)`.
   - **Entity-name every recipient** (Google LLC / Google Ireland (Firebase), RevenueCat Inc. (US), Apple Distribution International, Google Commerce/Payment) — never "third parties."
   - **Carry the tier** from the SDK map; downgrade to `[verify]` for anything a skipped scanner would have confirmed.
5. **Reconcile signals into SCAN findings.** Emit a finding (per `finding-format.md`) for each material discrepancy or load-bearing fact:
   - `advertisingId.verdict` ≠ "stripped" → 🔴/🟠 (contradicts the "no advertising ID" PP §4 / Data-Safety answer).
   - A scanner-detected tracker/recipient with **no entry in the SDK map** → 🟠 (unmapped flow; extend the map + check the PP discloses it).
   - `unrecognisedDirectDeps[]` non-empty → 🟡 (direct dep not profiled — could be an undisclosed flow).
   - iOS `healthOrFitnessDeclared` non-empty, or `anyTracking:true`, for a no-HealthKit/no-ATT wellness app → 🔴.
   - A sensitive permission (location, contacts, mic, `QUERY_ALL_PACKAGES`) present with no plausible purpose → 🟠.
   - **No-silent-supplement:** any data behaviour you observe that isn't in the SDK map or the ontology → surface as a 🟡 MINOR note so a human can confirm it belongs.
6. **Output** the canonical flow set + the SCAN findings + the **coverage note**, structured for legal-flow-grader and legal-cross-store to consume directly.

## OUTPUT FORMAT

```
## Data-surface scan — <app> (<date>)

### Coverage  (honest; never claim full coverage you didn't get)
| Scanner | Status | Source |
|---|---|---|
| scan_pubspec        | ran     | pubspec.lock |
| scan_android_manifest | ran (merged: yes/no) | <manifest path> |
| scan_ios_privacy    | ran (partial: app-only, pods absent on Windows) | ios/.../PrivacyInfo.xcprivacy |
| run_exodus          | skipped — no APK built | — |
| run_mobsf           | skipped — server not reachable | — |
Coverage verdict: <FULL | PARTIAL — iOS pods + binary scans pending macOS build/Docker>

### Canonical flow set  (input for legal-flow-grader / legal-cross-store)
| Data-type (canonical) | Recipient entity | On/off-device | Purpose | Lawful basis (tier) | Location | Transfer safeguard | Source | Tier |
|---|---|---|---|---|---|---|---|---|
| Email, UID, tokens | Google/Firebase Auth (Google LLC/Ireland) | off | Account mgmt | 6(1)(b) [verify] | US-only | DPF+SCC | pubspec | [settled …] |
| Usage events, app-instance ID (no AD_ID) | Google LLC (Analytics) | off | Analytics | 6(1)(a) consent — cookiewet [verify-pinpoint] | global/US | DPF+SCC | pubspec+exodus | [settled …] |
| App User ID(=UID), receipts, sub status | RevenueCat Inc. (US) | off | Purchase processing | 6(1)(b) [verify] | US (AWS) | DPA→SCC [verify] | pubspec+mobsf | [settled …] |
| Free-tier breathing history | (none — on-device) | on | On-device storage | n/a | device | n/a | pubspec | [settled …] |

### Deliberate non-collection
- Google Advertising ID (AD_ID/GAID) + AdServices — STRIPPED via tools:node="remove" → verdict: <…>

### Findings
[SCAN-1] <emoji> <title>
  Location:   <merged manifest / PrivacyInfo.xcprivacy / pubspec.lock / Exodus report>
  Basis:      <SDK map / data-category ontology / platform ref> [tier]
  Issue:      <discrepancy vs PP/label, or load-bearing fact>
  Redline:    <entity-named, specific — e.g. "strip AD_ID" / "extend SDK map for <pkg>" / "PP §6 must name RevenueCat Inc.">
  Confidence: high|medium|low
```

## Boundaries (de-facto-counsel authority)

This skill **decides and reports** the factual flow set within its evidence. It does **not** grade
disclosure (that's legal-flow-grader) and does **not** issue a sign-off band. Reserve for a human Dutch
advocaat only: the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL legal-idiom review, and any flow
or basis you mark `[low-confidence]` (e.g. the Analytics/Crashlytics consent-vs-LI lawful basis — flag it,
don't resolve it here). When a scanner is skipped, say so in the coverage table; **partial coverage is a
PARTIAL verdict**, never a clean one.
