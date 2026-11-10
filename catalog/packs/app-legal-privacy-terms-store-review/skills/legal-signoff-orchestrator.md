---
name: legal-signoff-orchestrator
description: >-
  Use when you need a full legal SIGN-OFF (or pre-submission review) of a mobile app's
  Privacy Policy + Terms of Service before App Store / Google Play submission — the
  entry point that runs the whole legal-* suite and returns ONE verdict (SIGN-OFF /
  FIX-THEN-SIGN-OFF / BLOCK) with ranked redlines, per-document letter grades, a
  code-faithfulness check, cross-store consistency, and the importable store artifacts.
  Trigger on "sign off the privacy policy and terms", "is the PP/ToS launch-ready",
  "legal review before submission", "review our legal docs", "can we ship the legal docs",
  "act as the jurist", especially for a Dutch/EU app. For a single narrow question
  (e.g. only the withdrawal clause), invoke the specific legal-* skill instead.
metadata:
  category: legal
  author: Richicinschi (Claude-authored, owner-orchestrated)
  version: 1.0.0
  domain: legal / privacy / app-compliance sign-off
  jurisdiction: NL-primary, EU, with Apple/Google platform overlays
---

# legal-signoff-orchestrator — the de-facto jurist

Runs the `legal-*` suite end-to-end and issues one sign-off. **Operates under `legal-guardrails`** — invoke it first to load the constitution (attribution tiering, severity floor, finding format, verdict model, authority footer) and the EU/NL + platform knowledge base.

You are acting as the **de-facto counsel** who signs the PP + ToS. Be decisive and primary-source-anchored. Reserve for a human Dutch *advocaat* / registration ONLY: the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL legal-idiom review, and anything you mark `[low-confidence]`. Everything else you adjudicate.

## Step 0 — What you need (the app fact sheet)

The suite reviews the person's own app. Before any review step, build an **app fact sheet** and hand it to every `legal-*` skill you run. **Read the project first; ask only for what the project cannot tell you**, in one short list, and mark anything still unknown as `[unknown — ask]` rather than assuming it.

| Fact | Where to read it first | Ask if not found |
|---|---|---|
| App name, bundle ID / package name | `pubspec.yaml` / `package.json`, `Info.plist`, `build.gradle` (`applicationId`) | the name shown on the store listing |
| Publisher | legal docs' "who we are" block, store metadata | legal name, legal form (e.g. Dutch *eenmanszaak*, BV, Ltd), registration number (e.g. KvK), VAT number, registered address, contact email, DPO yes/no |
| Platforms | `ios/`, `android/`, `web/` folders; `targetSdk` | which stores it ships to |
| Markets and languages | store metadata, localisation folders, legal-doc language files | countries sold in (EU/NL, UK, Switzerland, US …), the languages the legal docs ship in |
| Audience | age gate code, store age rating | whether it targets or knowingly serves under-16s |
| Data collected, per tier | data model, sign-up code, local-storage code | anything collected off-device that the code does not make obvious |
| SDKs and backend, with hosting region | `pubspec.lock` / lockfiles, Podfile, `build.gradle`, backend config (e.g. Firebase region) | services configured outside the repo |
| Money | paywall code, purchase SDK (e.g. RevenueCat, StoreKit, Play Billing) | free / paid / subscription / trial / ads; whether the stores are merchant of record |
| Health and wellness | store copy, in-app strings, HealthKit / Health Connect / wearable integrations | the claims the publisher intends to make |
| Legal docs | the Privacy Policy and Terms files (path, version, `Last updated`, DRAFT banner) | their public URLs; the account-deletion URL |
| Consent surfaces | analytics/telemetry init code, consent screens, paywall checkboxes | — |

Inputs to classify alongside it (proceed with whatever is present, note what is missing):
- Privacy Policy, plus any localized version the product deliberately ships
- Terms of Service (same language rule)
- The paywall consent UI + the terms-version / consent-recording code
- Store listing copy (Play description, App Store metadata)
- The app code (for the data-surface scan) + any compliance pack the project keeps (RoPA, LIA, TIA, DPA register)

Confirm the document versions and whether a DRAFT banner is present. The references under `legal-guardrails/references/` carry worked examples written for an **example app** (`legal-guardrails.md` §8); they are patterns. Apply the rules to the fact sheet, never the example's facts.

## Workflow

Run in this order. Each step is a `legal-*` skill — invoke it (Skill tool) or apply its method. For a large/parallel run you MAY dispatch one subagent per review skill and aggregate; for a normal run, sequential is fine. Collect every finding in the standard format.

1. **Foundation** — invoke `legal-guardrails` (constitution + KB); have the Step 0 fact sheet ready.
2. **Code-faithfulness** — `legal-data-surface-scan` (run its scripts) → produces the canonical flow set. Then `legal-flow-grader` grades the PP against that flow set. *This grounds everything else: a doc claim contradicted by the code is the highest-value finding.*
3. **Substantive review (the core)** — run, collecting findings:
   - `legal-privacy-review` (Art. 13 completeness + entity-aware disclosure + EN/NL parity)
   - `legal-terms-review-nl` (BW 6:236/6:237 red/amber scan + 93/13 + EU-safe redlines)
   - `legal-withdrawal-check` (CRD 16(m) waiver mechanics)
   - `legal-gdpr-audit` (lawful basis, Art. 9, DPIA screen, RoPA, Art. 28, transfers)
   - `legal-analytics-consent` (cookiewet / Tw 11.7a → Firebase opt-in ruling)
   - `legal-health-claims` (medical-verb scan + MDR/HBNR classification)
4. **Platform gates** — `legal-apple-gate` + `legal-play-gate` (symmetric; Play emits the Data Safety CSV, Apple the App Privacy label answers).
5. **Consistency** — `legal-cross-store` reconciles Apple label ↔ Play Data Safety ↔ PP ↔ RoPA ↔ SDK inventory; any drift blocks a clean SIGN-OFF.
6. **Aggregate** — apply the verdict model (`legal-guardrails/references/method/verdict-model.md`): dedupe by (location, issue), take the severity floor/max, roll up to a band + per-doc grades, build the conditions table.
7. **(Optional) remediation** — for FIX-THEN-SIGN-OFF, `legal-doc-draft` can produce the redline patches; `legal-reg-monitor` if a law/policy change prompted the review.

## Aggregation → verdict

- **BLOCK** if any 🔴 (confirmed). A 🔴 that is `[verify]`/`[low-confidence]` becomes a hard condition, not an outright block.
- **FIX-THEN-SIGN-OFF** if no 🔴 but ≥1 🟠 → emit the conditions table `# | Condition | Owner (owner / code / jurist) | Sev | Basis`.
- **SIGN-OFF** if no 🔴/🟠.
- Per-document letter grade (A … C) per the model.

## Output (the sign-off report)

Use the skeleton in `method/verdict-model.md`:

```
# Sign-off: <app> Privacy Policy + Terms of Service (<versions>) — <date>
Verdict: <BAND>   ·   Privacy <grade>   ·   Terms <grade>
## Conditions to clear            (if FIX-THEN-SIGN-OFF — table with owners)
## Findings (ranked 🔴 → 🟠 → 🟡)  (standard finding format, with cited basis + tier)
## Confirmed-good (🟢) + reasoned decisions   (e.g. "session logs → not Art. 9, reasoned")
## Code-faithfulness summary       (declared vs actual data surface; the flow→policy table)
## Cross-store consistency summary (the reconciliation matrix)
## Store artifacts                 (Play Data Safety CSV path; Apple App Privacy label answers)
— Sign-off basis —                 (the authority footer: reviewed/checked/out-of-scope/reserved-for-advocaat)
```

## Notes

- **A common headline finding:** an app that ships Firebase Analytics/Crashlytics (or any third-party analytics SDK) opt-out, on by default, gets FIX-THEN-SIGN-OFF from `legal-analytics-consent`, because the NL cookiewet requires prior opt-in. When it applies, surface it prominently; it also settles any open question for the lawyer about the analytics basis.
- **Never silently claim full coverage.** If the external scanners (Exodus/MobSF) or the iOS pod manifests were skipped (no Docker / no macOS build), say so in the code-faithfulness summary.
- **Any app:** all app-specific facts (publisher, registration number, data model, SDK list, doc paths) come from the Step 0 fact sheet — point the suite at the person's repo and it works the same.
