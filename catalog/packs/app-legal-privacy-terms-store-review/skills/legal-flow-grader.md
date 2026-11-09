---
name: legal-flow-grader
description: >-
  Use when grading a Privacy Policy against the app's ACTUAL data flows. Takes
  the canonical flow set from legal-data-surface-scan and grades each
  (data-type, recipient-entity, on/off-device) pair against the policy text as
  clear / vague / omitted / incorrect / ambiguous — entity-aware, so a generic
  "service providers" line does NOT clear a flow to a named processor
  (Apple, Google-Firebase, RevenueCat, Cloudflare). Emits the flow-to-policy
  table that feeds legal-privacy-review and legal-cross-store. Trigger on
  "flow to policy", "disclosure grading", "does the policy match the code",
  "omitted disclosure", "over-disclosure", "under-disclosure", "policy vs SDK",
  "is this data flow disclosed", "entity-aware reconciliation", EN/NL
  disclosure parity. App facts are inputs (reusable across the 3-app portfolio).
metadata:
  category: legal
  author: "Richicinschi (Claude-authored)"
  version: "1.0.0"
  domain: "privacy-policy disclosure reconciliation (flow-to-policy grading)"
  jurisdiction: "EU/NL — GDPR/AVG; ePrivacy; platform store policies"
---

Operates under legal-guardrails — load its constitution + the references listed below.

`skill-id` for findings: **FLOW**. This skill grades; it does not enumerate the
code itself — the flow set is an INPUT from `legal-data-surface-scan`.

## References to load (by path; do NOT inline them)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails.md` (constitution — attribution tiers, severity, finding format, de-facto-counsel authority, "no silent supplement")
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/disclosure-grading.md` (the 5-grade entity-aware rubric — primary method)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/finding-format.md` (the FLOW-n finding shape)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/verdict-model.md` (severity floor/max, code-faithfulness dominance, grade bands)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/attribution-tiering.md` (tag every legal proposition)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/sdk-data-map.md` (per-SDK recipient/location/basis — the authoritative flow facts for Breathe)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/data-category-ontology.md` (data-type naming + sensitivity → severity)

## Inputs
1. **Canonical flow set** from `legal-data-surface-scan` — list of `(data-type, recipient-entity, on/off-device)` tuples found in the code + merged manifest. If not provided, fall back to the consolidated table in `sdk-data-map.md` §10 (and say so as a `[verify]` note — a stale map is not a scan).
2. **Privacy Policy text** — `apps/my-app/app/assets/legal/privacy.md` AND `privacy.nl.md` (v6). Other apps: their PP path (an input).
3. **App facts** (controller, free/Pro split, EU region) — from `sdk-data-map.md` app profile; overridable per app.

## WORKFLOW
1. **Load** the flow set + both PP language files. Confirm versions match (EN/NL same version number) — a version mismatch is itself a MINOR note.
2. **Normalize each flow** to `(data-type, recipient-entity, on/off-device)`. Name the entity precisely (Google LLC / Firebase, RevenueCat Inc., Apple Distribution International, Google Play, Cloudflare) — never "third party". Drop nothing the scan found; an on-device-only flow (e.g. reminder time, free-tier history) is still a row, graded against the PP's on-device claims.
3. **Locate the PP assertion(s)** for each flow — search by data-type AND by entity name. Record the section/line.
4. **Grade per the rubric** in `disclosure-grading.md` (full table there — do not restate it):
   - **clear** 🟢 — exact named (data-type, entity) disclosure.
   - **vague** 🟡/🟠 — mentions the data-type or "third parties/service providers" but NOT the named entity. Entity-awareness is the core rule: a generic processor line does NOT clear a flow to a named processor (GDPR Art. 13(1)(e); Play User Data policy).
   - **omitted** 🟠 (🔴 if sensitive) — code does it, PP silent.
   - **incorrect** 🔴 — PP affirmatively states the opposite (e.g. "we never share X" while an SDK sends X; or "all data stays in the EU" while Firebase Auth/Analytics/Crashlytics are US/global per `sdk-data-map.md`).
   - **ambiguous** 🟠 — PP self-contradicts, or two sections disagree on the flow.
5. **Apply direction** (per `disclosure-grading.md`):
   - **Over-disclosure** (PP claims a flow the app does NOT do — e.g. declares "biometric data" off transitive `USE_BIOMETRIC` perms that carry no data, or a never-fired event) → 🟡 MINOR / 🟠 MATERIAL. Flag for tightening; over-claims mislead the store label.
   - **Under-disclosure** (app does a flow the PP hides) → 🟠 MATERIAL / 🔴 BLOCKER (BLOCKER when the data is sensitive or the silence makes the store-label false). This is the dangerous direction and the dominant v6 finding-type.
6. **EN/NL parity:** grade `privacy.nl.md` independently. A flow disclosed in EN but absent/weaker in NL grades **omitted** for the NL doc ("a translation gap is a compliance gap"). Native-NL legal-idiom quality is OUT OF SCOPE → reserve as a `[low-confidence]` note for a Dutch advocaat.
7. **Tag every legal proposition** with an attribution tier; cite the forcing provision at pinpoint where a grade rests on law (Art. 13(1)(e), Play User Data, ePrivacy 5(3)). Prefer the primary-source facts in `sdk-data-map.md` over paraphrase.
8. **Emit** the flow-to-policy table + FLOW-n findings for every non-🟢 row, then a one-paragraph code-faithfulness summary. Surface anything outside this checklist as a MINOR "no silent supplement" note.

## Entity-aware grading checklist (Breathe stack — facts in `sdk-data-map.md`)
Grade each, EN + NL. Severity floor = the higher when this overlaps another skill.
- **Firebase Auth** (Google) — email, UID, tokens, **IP**; **US-only by architecture** → a blanket "EU region" PP line is **incorrect** 🔴 for this flow; needs US transfer + DPF/SCC named.
- **Cloud Firestore** (Google) — profile, consent timestamps, **Pro** session history (off-device), **subscription mirror**. **FREE tier = on-device only** → a PP implying server-side history for all users is **incorrect** 🔴 for free users. EU `europe-west`.
- **Firebase Analytics** (Google) — usage events + **app-instance ID**, **no AD_ID** (stripped). PP "no advertising ID" is only **clear** if the merged manifest shows AD_ID absent; consent basis is the COOK skill's call (note, don't relitigate).
- **Crashlytics** (Google) — crash + device diag, install UUID/FID; **global (any GCP)** → "Crashlytics stays in the EU" is **incorrect** 🔴.
- **Cloud Functions** (Google) — IP, RevenueCat webhook payload, deletion ops; EU `europe-west1`.
- **Firebase Hosting** (Google) — request **IPs** (often **omitted** 🟠 — it logs IPs even for static legal pages).
- **RevenueCat Inc.** — **App User ID (= Firebase UID)**, purchase tokens/receipts, sub status, IP/device; **US (AWS)**. Must be **named** as a US processor + transfer safeguard (DPA→SCC, `[verify]`). A bare "service providers" line grades **vague** 🟠 here.
- **Google Sign-In** → feeds Firebase Auth; email/profile/OAuth token. Transitive `USE_BIOMETRIC`/`USE_FINGERPRINT` perms carry **no biometric data** → if the PP declares "biometric data", grade **over-disclosure** 🟠; if a scan flags the perm, it's a false-positive permission, not an omitted flow.
- **Apple / Google Play billing** — merchants of record; Breathe receives **no payment-card data**, only post-purchase token/receipt. PP must say so; do not over-claim card collection.
- **Deliberate non-collection** (AD_ID/GAID stripped) — verify the PP/Data-Safety "no advertising ID" answer is consistent; an over-claim of ad-ID collection is 🟡.

## OUTPUT
Flow-to-policy table feeding `legal-privacy-review` + `legal-cross-store`:

```
| data-type | recipient-entity | on/off-device | EN grade | NL grade | direction | severity |
```
(`direction` = under / over / on-device-claim; `severity` 🔴/🟠/🟡/🟢 = highest of EN/NL.)

Then, per non-🟢 row, a finding in the standard shape (see `finding-format.md`):

```
[FLOW-<n>] <emoji> <title>
  Location:   privacy.md §x (line) / privacy.nl.md §x
  Basis:      <provision + attribution tier>   e.g. GDPR Art. 13(1)(e) [settled — verified 2026-06-06]
  Issue:      <under/over/incorrect/ambiguous; entity named>
  Redline:    <exact replacement text; name the entity, never "third parties">
  Confidence: high | medium | low
```

Close with: a **code-faithfulness summary** (declared vs actual data surface, one paragraph), the EN/NL parity tally, and reserved items (native-NL review + any `[low-confidence]` law) flagged for a human Dutch advocaat per the constitution. Roll severity into the verdict via `verdict-model.md`; this skill does not pronounce the final band — the orchestrator aggregates.
