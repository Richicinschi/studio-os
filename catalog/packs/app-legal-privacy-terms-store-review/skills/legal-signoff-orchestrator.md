---
name: legal-signoff-orchestrator
description: >-
  Use when you need a full legal pre-submission review of a mobile app's Privacy Policy +
  Terms of Service before App Store / Google Play submission — the entry point that runs
  the whole legal-* suite and returns ONE verdict (SHIP / FIX FIRST / BLOCKED), each
  finding tied to its clause and rule, with ranked redlines, per-document letter grades, a
  code-faithfulness check, cross-store consistency, the importable store artifacts, and a
  footer stating what was checked, against which law, and when each source was verified.
  An automated review, not legal advice: a lawyer signs off. Trigger on "sign off the
  privacy policy and terms", "is the PP/ToS launch-ready", "legal review before
  submission", "review our legal docs", "can we ship the legal docs", especially for a
  Dutch/EU app. For a single narrow question (e.g. only the withdrawal clause), invoke the
  specific legal-* skill instead.
metadata:
  category: legal
  author: Richicinschi (Claude-authored, owner-orchestrated)
  version: 1.0.0
  domain: legal / privacy / app-compliance review
  jurisdiction: NL-primary, EU, with Apple/Google platform overlays
---

# legal-signoff-orchestrator — one verdict, with its limits

Runs the `legal-*` suite end-to-end and gives one verdict. **Operates under `legal-guardrails`** — invoke it first to load the constitution (attribution tiering, the 90-day staleness rule, severity floor, finding format, verdict model, review footer, jurisdiction rule) and the EU/NL + platform knowledge base.

This is an automated review, not legal advice: a lawyer signs off. Within that, be firm and primary-source-anchored: give **SHIP**, **FIX FIRST** or **BLOCKED**, tie each finding to its clause and the rule behind it, and do not hedge each line with "consult a lawyer". Give no verdict on the §5 carve-outs (the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` values, native-NL legal-idiom review, anything you mark `[low-confidence]`); they need a lawyer or a registration first.

## Step 0 — Where is the app offered? Then the app fact sheet

**Ask this first, before anything else:** *"Which countries or regions is the app offered in?"* If the store metadata or localisation folders already suggest an answer, say what they suggest and ask the person to confirm it. The answer sets the scope of the run (`legal-guardrails.md` §9):

- **The Netherlands (with or without other EU states)** — run the whole workflow below. Other member states' national law goes in the footer under "Law not checked".
- **EU states, but not the Netherlands** — run the whole workflow below. EU-law findings (GDPR, ePrivacy Art. 5(3), CRD, Dir. 93/13, DSA, MDR) drive the verdict; findings that rest only on Dutch national law (BW 6:236/237, Tw 11.7a, UAVG, AP guidance, other NL-only items) are 🟡 notes only, and the footer says so.
- **The Netherlands / the EU plus markets outside them** — run the whole workflow (apply the EU-not-NL row when the Netherlands is not among them); the footer lists those other markets under "Law not checked".
- **Only outside the Netherlands and the EU** — run the store-rule and data-collection steps (2, 4, 5 and the store-copy checks in `legal-health-claims`); skip the law reviews in step 3; give no verdict on law. The verdict covers store rules and data collection only, and the footer says the law of those markets was not checked because the suite holds no tables for it.

Then the suite reviews the person's own app. Before any review step, build an **app fact sheet** and hand it, with the markets, to every `legal-*` skill you run. **Read the project first; ask only for what the project cannot tell you**, in one short list, and mark anything still unknown as `[unknown — ask]` rather than assuming it.

| Fact | Where to read it first | Ask if not found |
|---|---|---|
| App name, bundle ID / package name | `pubspec.yaml` / `package.json`, `Info.plist`, `build.gradle` (`applicationId`) | the name shown on the store listing |
| Publisher | legal docs' "who we are" block, store metadata | legal name, legal form (e.g. Dutch *eenmanszaak*, BV, Ltd), registration number (e.g. KvK), VAT number, registered address, contact email, DPO yes/no |
| Platforms | `ios/`, `android/`, `web/` folders; `targetSdk` | which stores it ships to |
| Markets and languages | the answer to the first question; store metadata, localisation folders, legal-doc language files | the languages the legal docs ship in |
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

1. **Foundation** — invoke `legal-guardrails` (constitution + KB); have the Step 0 markets and fact sheet ready.
2. **Code-faithfulness** — `legal-data-surface-scan` (run its scripts) → produces the canonical flow set. Then `legal-flow-grader` grades the PP against that flow set. *This grounds everything else: a doc claim contradicted by the code is the highest-value finding.*
3. **Substantive review (the core; NL/EU law)** — skip this step when the app is offered only outside the Netherlands and the EU, except the store-copy checks of `legal-health-claims` (Apple 1.4.1, Play Module 3). Otherwise run, collecting findings:
   - `legal-privacy-review` (Art. 13 completeness + entity-aware disclosure + EN/NL parity)
   - `legal-terms-review-nl` (BW 6:236/6:237 red/amber scan + 93/13 + EU-safe redlines)
   - `legal-withdrawal-check` (CRD 16(m) waiver mechanics)
   - `legal-gdpr-audit` (lawful basis, Art. 9, DPIA screen, RoPA, Art. 28, transfers)
   - `legal-analytics-consent` (cookiewet / Tw 11.7a → Firebase opt-in ruling)
   - `legal-health-claims` (medical-verb scan + MDR/HBNR classification)
4. **Platform gates** — `legal-apple-gate` + `legal-play-gate` (symmetric; Play emits the Data Safety CSV, Apple the App Privacy label answers).
5. **Consistency** — `legal-cross-store` reconciles Apple label ↔ Play Data Safety ↔ PP ↔ RoPA ↔ SDK inventory; any drift rules out SHIP.
6. **Aggregate** — apply the verdict model (`legal-guardrails/references/method/verdict-model.md`): dedupe by (location, issue), take the severity floor/max, mark every finding whose source was verified more than 90 days before today, or has no recorded verified date, `re-check before relying on it` (`legal-guardrails.md` §1), roll up to a verdict + per-doc grades, build the conditions table.
7. **(Optional) remediation** — for FIX FIRST, `legal-doc-draft` can produce the redline patches; `legal-reg-monitor` if a law/policy change prompted the review.

## Aggregation → verdict

- **BLOCKED** if any 🔴 (confirmed). A 🔴 that is `[verify]`/`[low-confidence]` becomes a hard condition, not an outright block.
- **FIX FIRST** if no 🔴 but ≥1 🟠 → emit the conditions table `# | Condition | Owner (owner / code / jurist) | Sev | Basis`.
- **SHIP** if no 🔴/🟠.
- Every finding names its clause and the rule behind it; an observation that cannot is a 🟡 note.
- Per-document letter grade (A … C) per the model.

## Output (the review report)

Use the skeleton in `method/verdict-model.md`:

```
# Legal review: <app> Privacy Policy + Terms of Service (<versions>) — <date>
Verdict: <SHIP | FIX FIRST | BLOCKED>   ·   Privacy <grade>   ·   Terms <grade>   ·   <n> of <m> cited sources due for re-check
## Conditions to clear            (if FIX FIRST — table with owners)
## Findings (ranked 🔴 → 🟠 → 🟡)  (standard finding format: clause, rule + tier + verified date)
## Confirmed-good (🟢) + reasoned decisions   (e.g. "session logs → not Art. 9, reasoned")
## Code-faithfulness summary       (declared vs actual data surface; the flow→policy table)
## Cross-store consistency summary (the reconciliation matrix)
## Store artifacts                 (Play Data Safety CSV path; Apple App Privacy label answers)
— What this review covers —        (the review footer, legal-guardrails.md §5: offered in / checked /
                                    law checked against / law not checked / each source's verified
                                    date / verdict / left to a lawyer or a registration)
```

## Notes

- **A common headline finding:** an app that ships Firebase Analytics/Crashlytics (or any third-party analytics SDK) opt-out, on by default, gets FIX FIRST from `legal-analytics-consent`, because the NL cookiewet requires prior opt-in. When it applies, surface it prominently; it also gives the lawyer the basis for the analytics question.
- **Never silently claim full coverage.** If the external scanners (Exodus/MobSF) or the iOS pod manifests were skipped (no Docker / no macOS build), say so in the code-faithfulness summary.
- **Any app:** all app-specific facts (publisher, registration number, data model, SDK list, doc paths) come from the Step 0 fact sheet — point the suite at the person's repo and it works the same.
