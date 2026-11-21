# Worked example: one app's review (not yours)

The verdicts in this file are one app's, the app profiled in §1; your app gets its own, from its fact sheet (`legal-signoff-orchestrator.md` Step 0) and the rules in the references.

Wherever a skill or reference in this domain says "the worked example", it means this app, and nothing else. The rules stay in the references and skills named in each section; this file holds only what this one app answered. A worked example is a pattern, never a fact about the person's app (`legal-guardrails.md` §8): where the person's app differs (another SDK, real health data, ads, another legal form, no EU region), the outcome can flip, and the rule that decides it is the one to apply.

## 1. The app

- a subscription wellness app (guided breathing / relaxation), built in Flutter, on iOS and Android;
- published by a Dutch sole trader (*eenmanszaak*): one person, sole controller, no employees, no DPO; EU/NL-first, though the stores make it reachable to US users too;
- backend on Firebase (Auth, Firestore, Analytics, Crashlytics, Cloud Functions, Hosting), with the Firestore and Functions region set to the EU (`europe-west`);
- subscriptions sold through Apple and Google as merchants of record, with RevenueCat as middleware; a free trial that converts to a paid tier;
- free tier stores its history on the device only; the paid tier syncs session history to Firestore;
- no medical claims ("supports / may help relax"), no HealthKit / Health Connect / wearables, no ads, no tracking, the Android `AD_ID` permission stripped (it must also set `google_analytics_adid_collection_enabled=false` before "no advertising ID" holds; `sdk-data-map.md` §3);
- legal docs: a Privacy Policy and Terms in the app's assets and on the publisher's website, with an in-app account-deletion flow and a public deletion URL.

The details of its code and documents that the sections below rely on:

- **Account deletion:** the user types `DELETE` → a soft-delete sets `deletionRequestedAt` → a 30-day restore window → the scheduled Cloud Function `purgeExpiredDeletions` hard-deletes Firestore + Auth + RevenueCat.
- **Account document** `users/{uid}`: consent timestamps `ageConfirmedAt` (the 16+ self-attestation checkbox) and `withdrawalConsentAt` (the paywall withdrawal-waiver checkbox), `termsVersion`, a soft-delete flag; paid-tier session history in `users/{uid}/sessions`; a server-written subscription mirror in `users/{uid}/private/subscription`.
- **Withdrawal waiver:** an unticked paywall checkbox; the paywall consent screen records the `withdrawalConsentAt` timestamp in Firestore (via a `recordWithdrawalConsent` call). Terms: `terms.md` + `terms.nl.md`, withdrawal section §6, Apple EULA section §25.
- **Telemetry:** Firebase Analytics + Crashlytics ship opt-OUT (collection on by default; a Settings → Data & privacy toggle behind an `analyticsEnabledProvider`, applied at boot before the Crashlytics handlers). The fix the references give records the grant as `analyticsConsentAt`.
- **Build:** Cloud Functions deploy to `europe-west1` (e.g. a `revenueCatWebhook`); Android targets API 35; `firebase_analytics` merged `AD_ID` into the manifest and the app strips it; the iOS privacy manifest declares Crash Data with `Linked=false`.
- **Other:** in-app `/legal/*` routes; "Restore Purchases" on the paywall; a long in-app health disclaimer, for breathing exercises only; sign-in by email/password and Google only; no in-app search; no third-party AI; no independent security review (MASA) passed.

## 2. Apple gate (`legal-apple-gate.md`, checks A1–A8)

| ID | This app's verdict |
|---|---|
| **A1** | PASS if PP code-faithful + ASC field set |
| **A2** | PASS — type-`DELETE` soft-delete → 30-day grace → `purgeExpiredDeletions` hard purge |
| **A3** | N/A-PASS — no HealthKit, no ads, no tracking |
| **A4** | VERIFY — confirm all six on the paywall |
| **A5** | PASS — breathing-only disclaimer ships |
| **A6** | PASS — §25 has all 10 + scoping + the "Apple not responsible" close |
| **A7** | VERIFY against merged manifest |
| **A8** | VERIFY — derive via the template + §6 table |

The A7/A8 watch-list items were seen in this app's Firebase stack: its manifest declares Crashlytics crash data `Linked=false`; its paid tier's Firestore-synced breathing logs are the session logs to classify. It has no tracking, so it needs no ATT prompt (correct).

## 3. App Store Review Guidelines (`apple-review-guidelines.md`)

Quick gate list, this app's verdicts:

| # | Guideline | This app's verdict |
|---|---|---|
| 1 | 5.1.1(i) | PASS — in-app `/legal/*` routes ship; confirm ASC metadata field is populated. |
| 2 | 5.1.1(i) | PASS if PP inventory matches actual Firebase/RC/Crashlytics flows — cross-check. |
| 3 | 5.1.1(i) | VERIFY — PP must name Firebase/Google, RevenueCat, Crashlytics + equal-protection clause. |
| 4 | 5.1.1(i) | PASS if present — the app has soft-delete + 30-day purge cron; PP must describe it. |
| 5 | 5.1.1(v) | PASS — type-`DELETE` soft-delete → 30-day grace → hard purge. |
| 6 | 5.1.1(ii) | VERIFY — the paid tier (Firestore sync) must not gate on analytics consent. |
| 7 | 5.1.2(i) | PASS — no third-party AI in the app; PP discloses processors. |
| 8 | 5.1.3 | N/A-PASS — no HealthKit, no iCloud health storage. |
| 9 | 3.1.1 | PASS — RevenueCat over StoreKit; Apple is merchant of record. |
| 10 | 3.1.2 | VERIFY — confirm paywall surfaces all six + both links. |
| 11 | 1.4.1 | PASS — "supports / may help relax"; breathing-only disclaimer. |

- **5.1.1(iii):** a breathing app should request near-zero device permissions.
- **5.1.1(iv):** it asks for almost no permissions.
- **5.1.1(v) — PASS:** in-app delete flow (type `DELETE` → soft-delete sets `deletionRequestedAt` → 30-day restore window → `purgeExpiredDeletions` cron hard-deletes Firestore + Auth + RevenueCat).
- **5.1.2(iv), (v), (vi) and (vii):** N/A; it reads neither Contacts nor Photos, uses none of the listed APIs, and has no Apple Pay.
- **5.1.3 — N/A-PASS:** it does **not** use HealthKit, Clinical Health Records, Motion & Fitness, or any medical-research API, and stores no health data in iCloud; whether its breathing session logs are special-category health data turns on what the data can reveal.
- **3.1.1:** it surfaces "Restore Purchases" — PASS.
- **3.1.2:** its unticked withdrawal/immediate-delivery checkbox records `withdrawalConsentAt`.
- **1.4.1 — PASS (firewall to maintain):** it makes **no health measurements** and **no diagnostic/treatment claims**, so the measurement-validation prong does not bite.

## 4. Health-app classification (`mdr-hbnr.md`)

Decision (§0):

> **EU MDR — OUT OF SCOPE.** The app is **not a medical device**: it serves a *lifestyle/well-being* purpose, makes **no medical claim** (diagnosis/prevention/monitoring/prediction/prognosis/treatment/alleviation of disease), and its software functions do not go beyond delivering breathing exercises + logging sessions. Reasoning recorded per `mdr-hbnr.md` §1–2.
>
> **US FTC HBNR — NOT A PHR VENDOR.** The app lacks the **"technical capacity to draw information from multiple sources"** that defines a *personal health record*: it imports **no** external health data (no HealthKit, no Google Fit, no wearable, no third-party health API). On the current self-contained design it is outside the HBNR's "vendor of personal health records" definition. Reasoning recorded per `mdr-hbnr.md` §3–4. Both determinations are conditional on the current design.

Medical purposes (Art. 2(1), first indent), this app's answers: diagnosis No · prevention No · monitoring No (session logging ≠ monitoring of a disease/physiological process for medical purpose) · prediction No · prognosis No · treatment No · alleviation of disease No. Of the third indent, a breathing app is the closest case: paced breathing modifies respiration, and its wellness aim keeps it outside.

- MDCG 2019-11 step 3: essentially no action beyond storage (it presents timed breathing visuals + logs); it exits at step 5 at the latest (no medical purpose) → **not MDSW**.
- HBNR: the app records breathing-session data the **user generates inside the app only**; it does **not** import from HealthKit, Google Fit, a wearable, or any external health source → **HBNR does not apply** (`[low-confidence]` on the ultimate classification, as `mdr-hbnr.md` §6 says).

Its filled-in classification block (`mdr-hbnr.md` §10):

```
HEALTH-APP CLASSIFICATION GATE — <app name> — <date>

EU MDR 2017/745:  OUT OF SCOPE
  - No medical purpose (Art. 2(1)); lifestyle/well-being carve-out (Recital 19).
  - Claim-scan result: [PASS — wellness framing intact] / [FAIL — phrases: ...]
  - Software functions limited to delivery + storage/sync (not MDSW).
  - If scoped-in: likely Class IIa (Annex VIII Rule 11) → CE marking. ESCALATE.

US FTC HBNR (16 CFR 318):  NOT A PHR VENDOR
  - No "technical capacity to draw from multiple sources":
    HealthKit? NO. Google Fit? NO. Wearable/3P health API? NO.
  - Integration inventory attached as evidence.
```

Claim scan (`legal-health-claims.md`): its copy uses safe wellness framing ("a mindfulness/breathing practice"); its scan output reads `MDR-claim-scan: PASS — wellness framing intact`. Its in-app About disclaimer is tailored to breathing. Its mindfulness framing puts it in scope of Google's Health apps declaration, so it files the form.

## 5. Withdrawal waiver (`crd-withdrawal.md` §8, `legal-withdrawal-check.md`)

- **Mechanism:** an unticked paywall checkbox capturing (i) consent to immediate performance and (ii) acknowledgement of losing the 14-day right; the app records **`withdrawalConsentAt`** (Firestore) as evidence of (i)+(ii). `withdrawalConsentAt` is internal evidence, not the consumer's Art. 8(7) confirmation.
- **Its open item (R7):** the unticked checkbox satisfies (i)+(ii); whether the Apple/Google receipt or a publisher-sent email satisfies (iii) is open. It only logs a consent timestamp, which may not deliver a consumer-facing durable artefact.
- **Its Terms:** the withdrawal disclosure is §6 of `terms.md` + `terms.nl.md`.
- **Its subscription:** paid, so Art 3(1a) ("paid" with personal data) is moot for the paid tier; the clock starts at purchase.

## 6. Analytics consent (`legal-analytics-consent.md`, `eprivacy-cookiewet.md`, `ap-guidance.md`)

- **Its state:** analytics ships **opt-OUT** (collection enabled by default, Settings → Data & privacy toggle to disable; flips `setAnalyticsCollectionEnabled` / `setCrashlyticsCollectionEnabled`), behind an `analyticsEnabledProvider`, with the persisted toggle applied at boot before the Crashlytics handlers. That is the non-compliant pattern for NL, and the most common one in indie apps.
- **Its fix:** make the default-when-unset OFF, add the first-run gate, and on consent record `analyticsConsentAt` (timestamp, wording version), mirroring its `ageConfirmedAt` / `withdrawalConsentAt` pattern.
- **Its headline finding:** `[COOK-1] 🟠 Firebase Analytics/Crashlytics ship opt-OUT (default-ON, legitimate-interest framing) — NL requires prior opt-in` → **FIX FIRST**.
- **Outside consent, for this app:** on-device session history for the free tier, Firebase Auth session tokens, and Firestore sync for a paid-tier user who requested it.

## 7. GDPR records and rights (`gdpr-articles.md`, `ap-guidance.md`, `sdk-data-map.md`)

- Its `ageConfirmedAt` / `withdrawalConsentAt` records satisfy the Art. 7(1) demonstrability duty; its 16+ self-attestation checkbox (recording `ageConfirmedAt`) is the right pattern for an app not targeting under-16s.
- Art. 17 erasure: soft-delete + 30-day grace + the `purgeExpiredDeletions` cron.
- Art. 22: it makes no automated decisions (N/A), so the Art. 35(3)(a) DPIA trigger fails; its privacy notice states **none** (Art 22 N/A) for Art 13(2)(f).
- Art. 14 is not needed: it collects directly from the user.
- Cloud Functions: mirror RevenueCat subscription state to Firestore (the `revenueCatWebhook`, in `europe-west1`) and hard-delete expired soft-deleted accounts (`purgeExpiredDeletions`).

## 8. Store declarations (`play-data-safety.md`, `play-policies.md`, `apple-app-privacy.md`, `data-category-ontology.md`)

- No ads; `AD_ID` stripped; no GAID collected; targets API 35.
- Data safety: deletion mechanism YES (in-app DELETE flow + public web deletion URL), satisfying both parts of Help 13327111; no independent security review claimed (it has not passed one).
- Breathing-session data: on-device only for free users (not collected); for paid-tier users synced to Firestore and declared under App activity, not Health & fitness, `[verify]` as the references say. On Apple: User Content → Other User Content (paid tier), Health = No for bare session logs, Fitness the developer's call.
- Health apps declaration (Play Module 3): its mindfulness framing puts it in scope; it files the form.
- Target audience: adult (16+), not primarily child-directed, consistent with its 16+ age gate.
- Its session logs (`data-category-ontology.md`, verify flags): Breathing-session logs are not Art. 9 without a §3 trigger (answered 2026-11-19); with a trigger present — `[low-confidence]`, LEGAL REVIEW REQUIRED.

Play policies (`play-policies.md`), this app's verdicts, word for word:

- 1A row 1 (privacy policy in the Console field and in the app): App has both (in-app `MarkdownDocScreen`). PASS.
- 1A row 3 (non-editable URL): Static Hosting page — non-editable. PASS.
- 1A row 6 (HTTPS): Hosting is HTTPS-only. PASS in practice.
- 1C (prominent disclosure and consent): PASS, provided the consent tick precedes any account-creation network write.
- 1D row 1 (data minimization): Only auth + diagnostics. PASS.
- 1D row 2 (no sale): No data sale; ads disabled; AD_ID stripped. PASS.
- 2B in-app deletion path: Settings → Account → type-`DELETE` soft-delete flow. PASS (discoverable in account settings).
- Module 6 row 1 (AD_ID permission): The worked example targets API 35; it does **not** use the GAID.
- Module 6 row 3 (auto-merge trap): In the worked example, `firebase_analytics` merged AD_ID → stripped.
- Module 6 row 4 (both controls): The worked example applies `tools:node="remove"` to AD_ID + AdServices and **must also set the flag**.
- Module 6 row 5 (Data safety): Data safety must answer "no advertising ID"; reconcile against merged manifest.
- Module 6 row 6 (targetSdk): (the worked example targets API 35 → satisfies)
