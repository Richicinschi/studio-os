---
name: legal-play-gate
description: >-
  Use when checking Google Play submission-readiness for legal/privacy/store-config.
  Verifies the Data Safety form (14-category/7-purpose/2-security; emits the importable
  CSV via legal-play-gate/scripts/emit_play_csv.mjs), the User Data policy privacy-URL hygiene, the
  in-app + public web account/data-deletion paths, the Health Content declaration +
  mandatory store-description "not a medical device" disclaimer, AD_ID/permission
  reconciliation against the merged manifest, Families/target-audience, IARC content
  rating, and DSA trader details. Adjudicates each as PASS/BLOCKER/MATERIAL and produces
  the Data Safety CSV artifact. Trigger on "Play submission", "Data Safety form",
  "Google Play review", "data deletion URL", "Play policy", "AD_ID", "User Data policy",
  "Health apps declaration", "IARC", "target audience", "DSA trader", "merged manifest".
metadata:
  category: legal
  author: "Richicinschi (Claude-authored)"
  version: "1.0.0"
  domain: "Google Play store-submission legal/privacy readiness (Data Safety + Play Developer Policies)"
  jurisdiction: "Google Play global policy; EU/NL (GDPR/AVG, DSA trader); Dutch eenmanszaak publisher"
---

Operates under legal-guardrails — load its constitution + the references listed below.

This is the Android half of the store-submission gate (symmetric to `legal-apple-gate`). It adjudicates Google Play's legal/privacy/config requirements for **the app under review** and emits the importable **Data Safety CSV** as a concrete artifact. App facts are inputs (the orchestrator's Step 0 fact sheet; run alone, read them from the project and ask for the rest), so it works for any app.

## Load before adjudicating (by path; do not reproduce)
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/attribution-tiering.md` — tag every legal proposition.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/finding-format.md` — the `[PLY-n]` finding shape.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/disclosure-grading.md` — flow→form/policy reconciliation.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/verdict-model.md` — bands + per-doc grade.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/play-data-safety.md` — the 14/7/2 taxonomy, §5 worked matrix (example app), §7 CSV schema, §9 PASS/FAIL gates.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/play-policies.md` — Modules 1–7 + cross-module matrix + DSA trader.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/data-category-ontology.md` — category mapping.
- `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/sdk-data-map.md` — which SDK emits which data type.

## Inputs
- App profile facts from the fact sheet (app name, publisher entity, KvK/BTW/address fills or the publisher's own registration fields, public privacy URL, delete URL, age gate, targetSdk, health integrations).
- `legal-data-surface-scan` **android** output (merged-manifest perms, AD_ID status, SDK→data map). If absent, say so and downgrade affected manifest findings to a `[verify]` condition.
- The live Privacy Policy + Terms (paths, languages and version from the fact sheet) + the Apple App Privacy label (for the three-way reconcile).
- The answers single-source-of-truth: the app's own answers file. Start from `legal-play-gate/assets/data-safety-answers.example.json` (the example app's answers, the same as the script's bundled example), copy it into the person's project, and set every row from the scan and the fact sheet; it is consumed by `legal-play-gate/scripts/emit_play_csv.mjs --answers`.

## Workflow (atomic checks — adjudicate each, emit findings)

1. **DATA SAFETY form.** Build the 14-category / 7-purpose / 2-security declaration from `play-data-safety.md` §5 (the worked matrix) and the app's answers file. Reconcile every row against the scan (manifest perms, AD_ID stripped, SDK map) and against the Privacy Policy's data and sharing sections. For **an app with no Health Connect, no fitness API and no health records — a wellness app whose session logs are plain usage — the row `Health & fitness` MUST be in `notCollected`**: marking Health info/Fitness info is the #1 trap (such logs = App activity). An app that does read health data declares it. Then **emit the CSV**: run `node legal-play-gate/scripts/emit_play_csv.mjs --answers <project>/data-safety-answers.json --out <out>/data-safety.csv` (and `--template <play_export.csv>` if owner has exported the current Play Console template, since Question/Response IDs are Google-assigned). The script is authored + tested — **invoke it, never modify it.** Report the artifact path.
2. **USER DATA policy — privacy-URL hygiene** (Module 1). PP URL HTML not PDF, publicly reachable + non-geofenced, non-editable (static Hosting), `<title>`/heading labelled "Privacy Policy", entity-named (`<publisher>` + `<app name>`, as on the store listing), linked in **both** the Console field and in-app. Confirm comprehensive disclosure: contact + inquiry mechanism, data types accessed/collected/used/shared, **named recipients** (Google/Firebase, RevenueCat, Apple/Google billing — never "third parties"), secure handling, retention + deletion.
3. **ACCOUNT & DATA DELETION** (Module 2). Verify the dual path: an in-app discoverable delete flow (e.g. Settings → Account → type-`DELETE`) **and** a live public web deletion URL (from the fact sheet, e.g. `https://<your-domain>/<app>/delete-account`) that loads without error, prominently features the request path, and names `<app name>` / `<publisher>`. Confirm deletion reaches every store of the account's data (for a Firebase + RevenueCat app: Firestore + Auth + RevenueCat, e.g. via a scheduled purge job), any grace period the app uses (e.g. 30 days), and that the Privacy retention clause matches the purge schedule. Data Safety "users can request deletion" = YES.
4. **HEALTH CONTENT** (Module 3). Google's mandatory disclaimer (**no medical-device status; no diagnosis, treatment, cure or prevention; a pointer to a healthcare professional**; exact words quoted, with source, in `play-policies.md` Module 3D) must appear in the **Play store-listing description itself** (not only in-app About). Decide the **Health apps declaration form**: an app with health, fitness, mindfulness or wellness framing is in scope (the example app's mindfulness framing puts it in) → file it; document the reasoning. Defer the full prohibited-verb claim-scan to `legal-health-claims` (note the handoff).
5. **FAMILIES / TARGET AUDIENCE** (Module 4). Declare **not-primarily-child-directed (adult/16+)**, reconciled with the in-app 16+ self-attestation, the Privacy 16+ clause, and the IARC rating. A child-directed declaration contradicting the 16+ posture is a BLOCKER.
6. **AD_ID + PERMISSION HYGIENE** (Module 6). Reconcile the **merged** manifest (not source) from the scan: `AD_ID` + AdServices stripped via `tools:node="remove"`, no unjustified `QUERY_ALL_PACKAGES`, no leftover location/camera/mic perms, **targetSdk ≥ API 34** (read the app's actual value from the scan). Every declared perm must match Data Safety; the "no advertising ID" answer must be honest. (Build hygiene — AAB + R8/minify — is a release-readiness note, not a legal blocker; surface as MINOR if visible.)
7. **IARC CONTENT RATING** (Module 7). Confirm the questionnaire is completed; answers (in-app purchases = yes, unrestricted internet = yes, no UGC, no objectionable content) match actual features and yield a low age band that is consistent with the target-audience declaration and the Apple age rating. (A low PEGI rating does **not** conflict with the GDPR 16+ data-consent gate — note this so they aren't mistaken for a contradiction.)
8. **DSA TRADER details** (cross-module + DSA Arts. 30/31). Confirm trader status registered + displayed in Play Console with name/address/phone/email that match the KvK and the Privacy/Terms contact block. Ties to the pending `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills — flag those as jurist/owner-reserved, adjudicate the rest.

## Severity & attribution
Use `play-policies.md` / `play-data-safety.md` §9 to set BLOCKER 🔴 / MATERIAL 🟠 / MINOR 🟡 / OK 🟢. Tag every legal basis (`[settled — Help <id>, verified 2026-06-06]` / `[verify]` / `[verify-pinpoint]` / `[low-confidence]`). A 🔴 that is only `[verify]`/`[low-confidence]` becomes a **hard condition** ("confirm X; if confirmed, this blocks"), never a silent pass. **No silent supplement:** any Play requirement outside this checklist → surface as a MINOR note.

### Fixed BLOCKER triggers
- Health & fitness marked collected/shared by an app that collects no health or fitness data. · Any off-device SDK present in the scan but absent from the form (omitted disclosure). · Data Safety contradicts Privacy §3/§4, or the Apple App Privacy label (three-way drift). · Encryption-in-transit ≠ YES or contradicted by the scan. · Deletion = NO, or web delete URL 404 / unnamed. · "Advertising or marketing" purpose anywhere (contradicts the AD_ID strip). · AD_ID present in the **merged** manifest while the form says "no advertising ID". · Child-directed declaration vs the 16+ posture. · ToS names RevenueCat (not Google) as merchant of record, or refund clause denies the EU 14-day withdrawal right.

## De-facto-counsel authority
Decide and sign each check. Reserve for a human Dutch advocaat ONLY: the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` fills, native-NL legal-idiom review, and any item you mark `[low-confidence]`.

## Output
Per `verdict-model.md`:
- **Header:** `Sign-off: <app name> — Google Play submission readiness — <date>` · Verdict band (SIGN-OFF / FIX-THEN-SIGN-OFF / BLOCK) · letter grade.
- **Per-policy line:** each of the 8 checks → PASS 🟢 / MATERIAL 🟠 / BLOCKER 🔴 with one-line basis.
- **Findings** (`[PLY-n]`, ranked 🔴→🟠→🟡) in the standard format: Location (e.g. "Play Console > Data safety > <field>" or "store-listing description") / Basis (citation + tier) / Issue / Redline (specific, entity-named — Google-Firebase, RevenueCat, Apple, Cloudflare) / Confidence.
- **Conditions table** (every 🟠): `Condition | Owner (owner/code/jurist) | Sev | Basis`.
- **Cross-store consistency summary:** Data Safety ⇄ Apple App Privacy ⇄ Privacy §3/§4 (any drift is 🟠+).
- **Artifact:** the emitted Data Safety CSV path (`<out>/data-safety.csv`), with the note that Question/Response IDs must come from a fresh Play Console export template before import (the script fills `Response value` only).
- Authority footer with verified date.
