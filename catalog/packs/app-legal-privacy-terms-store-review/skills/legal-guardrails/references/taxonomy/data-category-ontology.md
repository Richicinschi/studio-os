# Data-Category Ontology — Apple ⇄ Google Play ⇄ GDPR Crosswalk

**Role of this file.** This is the canonical crosswalk that `legal-cross-store` uses to keep the three "labels" in lockstep: the **Apple App Privacy** ("nutrition label"), the **Google Play Data Safety** form/CSV, and the **Privacy Policy** data-inventory / recipients (subprocessor) section. One change to what the app actually collects must propagate to all three artefacts from this single source of truth. The last column of the §1 table is a worked example for the example app (`legal-guardrails.md` §8); fill it for the app under review from its fact sheet and data-surface scan.

**Core warning — no clean 1:1 mapping exists.** Apple, Google, and the GDPR each invented their own ontology. The category *names* do **not** align across all three:

| The mismatch | Apple | Google Play | Why it bites |
|---|---|---|---|
| Crash / perf telemetry | **Diagnostics** {Crash Data, Performance Data, Other Diagnostic Data} | **App info and performance** {Crash logs, Diagnostics, Other app performance data} | Google nests "Diagnostics" as a *type* under "App info and performance"; Apple uses "Diagnostics" as the *category*. The word "Diagnostics" means different scopes on each side. |
| Subscription / IAP | **Purchases** {Purchase History} | **Financial info > Purchase history** | Apple has a top-level "Purchases" category; Google buries the same data inside "Financial info". |
| Behavioural telemetry | **Usage Data** {Product Interaction, Advertising Data, Other Usage Data} | **App activity** {App interactions, In-app search history, Installed apps, Other UGC, Other actions} | Different category names, different sub-type granularity. "Product Interaction" ≈ "App interactions" but is not identical. |
| Identifiers | **Identifiers** {User ID, Device ID} | **Device or other IDs** (device IDs) + **Personal info > User IDs** (account/user IDs) | Apple keeps user ID and device ID together; Google **splits** account user IDs (Personal info) from device IDs (Device or other IDs). |

A category-by-category copy between stores is therefore **wrong by construction**. Map by *meaning* (the Canonical column below), never by name.

---

## Section 1 — Master crosswalk table

Columns: **Canonical category** · **Apple App Privacy label** (verbatim category → type) · **Google Play Data Safety** (verbatim category → type) · **GDPR category** (Art. 4 / Art. 9) · **Sensitivity** · **Example app: collected? SDK? on/off-device** (the worked column; derive the app's own).

> Apple verbatim taxonomy confirmed at [settled — developer.apple.com/app-store/app-privacy-details, verified 2026-06-06]. Google verbatim taxonomy confirmed at [settled — support.google.com/googleplay/android-developer/answer/10787469, verified 2026-06-06].

| Canonical category | Apple App Privacy label | Google Play Data Safety | GDPR category | Sensitivity | Example app: collected? / SDK / on-off-device |
|---|---|---|---|---|---|
| **Account email** | Contact Info → **Email Address** | Personal info → **Email address** | Art. 4(1) personal data (contact/identifier) | normal | **YES** · Firebase Auth (email/password + Google Sign-In) · OFF-device (Firebase Auth, EU region) |
| **Account / user ID (app account)** | Identifiers → **User ID** | Personal info → **User IDs** | Art. 4(1) personal data (online identifier) | normal | **YES** · Firebase Auth UID; mirrored as RevenueCat `app_user_id` (= Firebase UID) · OFF-device |
| **Name** | Contact Info → **Name** | Personal info → **Name** | Art. 4(1) personal data | normal | **CONDITIONAL** · only the Google account display name *if* Google Sign-In is used · OFF-device (Firebase Auth). If not surfaced/stored, declare **Not Collected**. |
| **Purchase / subscription history** | **Purchases → Purchase History** | **Financial info → Purchase history** | Art. 4(1) personal data | normal | **YES** · RevenueCat (entitlement/subscription state) + Apple/Google as merchants of record · OFF-device (RevenueCat API + Firestore mirror `users/{uid}/private/subscription`) |
| **Payment instrument (card/PAN)** | Financial Info → **Payment Info** | Financial info → **User payment info** | Art. 4(1) personal data | normal | **NO** · payment handled entirely by Apple/Google (merchant of record); publisher never sees card data → **Not Collected** on both labels |
| **Crash data** | Diagnostics → **Crash Data** | App info and performance → **Crash logs** | Art. 4(1) personal data (telemetry, may be linkable) | normal | **YES (opt-in NL — see §4)** · Firebase Crashlytics · OFF-device |
| **Performance / diagnostics** | Diagnostics → **Performance Data** (+ Other Diagnostic Data) | App info and performance → **Diagnostics** (+ Other app performance data) | Art. 4(1) personal data | normal | **YES (opt-in NL)** · Firebase Crashlytics / Performance · OFF-device |
| **Analytics / usage / app interactions** | Usage Data → **Product Interaction** | App activity → **App interactions** | Art. 4(1) personal data | normal | **YES (opt-in NL)** · Firebase Analytics (GA4) · OFF-device |
| **In-app search history** | Search History → **Search History** | App activity → **In-app search history** | Art. 4(1) personal data | normal | **NO** · the example app has no in-app search → **Not Collected** |
| **Session metadata (breathing logs)** | Usage Data → **Product Interaction** (NOT Health & Fitness) | App activity → **App interactions** (or **Other actions**) — NOT Health and fitness | Art. 4(1) personal data (ordinary, see §3) | **normal — NOT special category** | **Pro: YES** (Firestore sync `users/{uid}/sessions`, OFF-device); **Free: ON-device only** (SharedPreferences, not "collected") |
| **Device identifier** | Identifiers → **Device ID** | **Device or other IDs → Device or other IDs** | Art. 4(1) personal data (online identifier) | normal | **MINIMAL** · Firebase instance/installation IDs ride analytics/crash SDKs; **no Android Advertising ID** (AD_ID permission stripped via `tools:node="remove"`). Declare under Device IDs only if analytics/crash are enabled. OFF-device |
| **Advertising ID (GAID/IDFA)** | Usage Data → **Advertising Data** | (declared as Device or other IDs if collected) | Art. 4(1) personal data | normal | **NO** · AD_ID permission removed; no ads SDK → **Not Collected**; supports the "no advertising ID" PP claim |
| **Approximate location** | Location → **Coarse Location** | Location → **Approximate location** | Art. 4(1) personal data | normal | **NO** · no location permission → **Not Collected** |
| **Precise location** | Location → **Precise Location** | Location → **Precise location** | Art. 4(1) personal data | normal | **NO** → **Not Collected** |
| **Health & fitness** | **Health & Fitness** {Health, Fitness} | **Health and fitness** {Health info, Fitness info} | **Art. 9** special category (health) — *only if* sourced from a health platform | **special-category** | **NO — affirmatively NOT collected.** No HealthKit / Health Connect / Motion & Fitness API. Breathing logs are ordinary App activity, not Art. 9 health data (see §3). Mark **Not Collected** on BOTH labels. |
| **Sensitive info (race, religion, sexual orientation, politics, biometrics, etc.)** | **Sensitive Info → Sensitive Info** | Personal info → {Race and ethnicity, Political or religious beliefs, Sexual orientation} | **Art. 9** special categories | **special-category** | **NO** → **Not Collected** |
| **Contacts (address book)** | **Contacts → Contacts** | **Contacts → Contacts** | Art. 4(1) personal data (of third parties) | normal | **NO** → **Not Collected** |
| **Messages** | User Content → **Emails or Text Messages** | **Messages** {Emails, SMS or MMS, Other in-app messages} | Art. 4(1) personal data | normal | **NO** → **Not Collected** |
| **Photos / videos / audio** | User Content → **Photos or Videos / Audio Data** | **Photos and videos** / **Audio files** | Art. 4(1) personal data | normal | **NO** (ambient-sound *playback* only; no recording/upload) → **Not Collected** |
| **Files & docs / Calendar** | (User Content → Other) | **Files and docs** / **Calendar** | Art. 4(1) personal data | normal | **NO** → **Not Collected** |
| **Web browsing history** | Browsing History → **Browsing History** | **Web browsing** → Web browsing history | Art. 4(1) personal data | normal | **NO** → **Not Collected** |
| **Phone number** | Contact Info → **Phone Number** | Personal info → **Phone number** | Art. 4(1) personal data | normal | **NO** → **Not Collected** |
| **Physical address** | Contact Info → **Physical Address** | Personal info → **Address** | Art. 4(1) personal data | normal | **NO** (customer-side; the *publisher's* registered address is a controller-identity field, not collected user data) → **Not Collected** |
| **Customer support correspondence** | User Content → **Customer Support** | App activity → Other UGC (or n/a) | Art. 4(1) personal data | normal | **CONDITIONAL** · only if a support email (`<contact email>`) is used; the message body is then User Content / Customer Support. Declare if a support channel is offered. OFF-device (email) |

### Affirmative "Data Not Collected" list (assert on BOTH labels)
Health & Fitness · Sensitive Info · Location (coarse+precise) · Contacts · Messages · Photos/Videos · Audio recordings · Files & docs · Calendar · Browsing/Search history · Phone number · Advertising ID. Apple lets you declare **"Data Not Collected"** for the whole app only if *nothing* is collected — an app that collects account + purchase + (opt-in) telemetry (the example app), so it must enumerate those and leave the rest off.

---

## Section 2 — Per-store questionnaire axes (what each label additionally asks)

These extra axes are where the two stores' artefacts diverge even when the canonical category matches. The skill must answer them per data type, not just "collected y/n".

### 2a. Apple App Privacy — 4 questions per data type
[settled — developer.apple.com/app-store/app-privacy-details, verified 2026-06-06]

1. **Collected?** "Collect" = transmitted off the device in a way that lets you/your third parties access it beyond servicing the user's immediate request.
2. **Linked to the user?** Two linkage states: **Linked to the User** vs **Not Linked to the User** (data must be de-identified, not re-linkable, and not joined to identifying data). For the example app, account email/UID, purchases, and (opt-in) telemetry tied to the signed-in UID are **Linked to the User**.
3. **Used to Track You?** *Tracking* = linking your app's data with **Third-Party Data** for targeted advertising / ad measurement, OR sharing with a **data broker**. An app that does **none** of this (the example app) → **Not used for tracking** for every type. (No ATT prompt required.)
4. **Purpose(s)?** Closed list of 6: **Third-Party Advertising · Developer's Advertising or Marketing · Analytics · Product Personalization · App Functionality · Other Purposes**. Example-app purposes: App Functionality (account, purchases) and Analytics (telemetry); never the two advertising purposes (an app without ads never selects them).

**Apple data-type categories (verbatim, full set):** Contact Info · Health & Fitness · Financial Info · Location · Sensitive Info · Contacts · User Content · Browsing History · Search History · Identifiers · Purchases · Usage Data · Diagnostics · Surroundings (Environment Scanning) · Body (Hands, Head) · Other Data. [settled — same source]

**Apple optional-disclosure carve-out** (data type may be omitted only if ALL hold): not used for tracking; not used for Third-Party/Developer advertising or "Other Purposes"; collected infrequently, not part of the primary functionality, and optional; user provides it through the app's UI with clear association to its use and an affirmative per-instance choice. [verify-pinpoint — criteria from developer.apple.com/app-store/app-privacy-details; exact wording not re-pinned this run]

### 2b. Google Play Data Safety — axes per data type
[settled — support.google.com/googleplay/android-developer/answer/10787469, verified 2026-06-06]

1. **Collected and/or Shared?** *Collection* = data leaving the device. *Sharing* = transfer to a third party. Every third-party SDK (Firebase, Crashlytics, RevenueCat, Google Sign-In) counts as collection — and as **sharing** when the recipient is a separate controller/broker. [verify-pinpoint — first-party-processor "Firebase = collection not necessarily sharing" nuance: confirm against Play "sharing" definition exclusions for service providers]
2. **Processed ephemerally?** Data held only in memory and no longer than necessary may be disclosed but **excluded from the public listing**. Persisted data (all of the example app's) is not ephemeral.
3. **Required vs optional (user can choose)?** Account/purchase = required for that functionality; analytics/crash = **optional** (user can opt out → mark *optional* / users can choose).
4. **Purpose(s)?** Closed 7-item list: **App functionality · Analytics · Developer communications · Advertising or marketing · Fraud prevention, security, and compliance · Personalization · Account management**. [settled — harvested official spec, line 7]
5. **App-level security declarations (2):** *All data encrypted in transit?* → **Yes** (Firebase/HTTPS). *Users can request data deletion?* → **Yes** (in-app delete + web URL).

**Google data categories (verbatim, full set):** Location · Personal info · Financial info · Health and fitness · Messages · Photos and videos · Audio files · Files and docs · Calendar · Contacts · App activity · Web browsing · App info and performance · Device or other IDs. [settled — same source]

### 2c. Axis-divergence cheat sheet (drives sign-off comparisons)

| Axis | Apple | Google Play | Notes for the skill |
|---|---|---|---|
| Off-device test | "Collect" | "Collected" | Same threshold (data leaves device). |
| Third-party transfer | folded into "Used to Track You" + purposes | explicit **Shared** flag | Google asks *sharing* separately; Apple only flags *tracking*. |
| Linkability | **Linked / Not Linked to the User** | not asked as such | Apple-only axis. |
| Required vs optional | not asked | **Required / Optional** | Google-only axis; consent-gated analytics/crash = optional (as in the example app). |
| Encryption-in-transit | not asked | app-level **Yes/No** | Google-only. |
| Deletability | not asked (covered by 5.1.1(v) account-deletion rule elsewhere) | app-level **Yes/No** + web URL | Google requires a public web deletion URL **in addition** to in-app deletion. [settled — harvested official spec, line 436] |
| Ephemeral | not a public axis | **excluded from public listing** | Google-only. |

---

## Section 3 — Why a wellness app's session logs (the example app's breathing logs) are NOT special-category health data

This is a load-bearing determination; the skill must defend it.

- **GDPR Art. 9** special categories = data revealing racial/ethnic origin, political opinions, religious/philosophical beliefs, trade-union membership, genetic data, biometric data for unique ID, **data concerning health**, sex life, or sexual orientation. [verify — GDPR Art. 9(1); substance settled, paragraph not re-fetched this run]
- "Data concerning health" (Art. 4(15)) = personal data related to physical/mental health revealing health status. A count of completed breathing sessions, chosen technique, and timestamps, with **no medical source and no diagnostic inference**, is ordinary App activity, not Art. 9 health data. [low-confidence — fact-specific; a Dutch jurist should confirm that aggregate wellness-session logs do not become Art. 9 by inference]
- **No HealthKit / Health Connect / Motion & Fitness** access ⇒ Apple "Health & Fitness" and Google "Health and fitness" are both correctly **Not Collected**. The presence/absence of these platform APIs is the bright-line both stores use. [settled — Apple category sourced from HealthKit/Clinical/Motion APIs per harvested notes line 468; Google "Health info/Fitness info" per fetched taxonomy]
- **General-wellness positioning** (no "treats/cures/diagnoses/prevents"; "supports / may help relax") keeps the app out of the MDR medical-device frame and reinforces the non-health classification. [verify — ties to MDR/MDCG 2019-11 wellness carve-out, not re-fetched this run]

**Over-declaration trap:** declaring "Health and fitness" on Play / "Health & Fitness" on Apple for breathing data is a common indie mistake that (a) invites Google's Health Apps policy self-assessment burden and (b) misstates the GDPR basis. Keep it OFF unless a HealthKit/Health Connect integration is actually added.

---

## Section 4 — NL/EU overlay: consent gating that the labels do not capture

The store labels are platform-policy artefacts; they do **not** encode the GDPR/AVG lawful basis. The crosswalk must be read together with these:

- **Firebase Analytics (GA4) and Crashlytics are opt-IN in the Netherlands** under Telecommunicatiewet 11.7a / ePrivacy Art. 5(3) per the Autoriteit Persoonsgegevens position that GA4/Firebase Analytics does **not** qualify for the strictly-necessary/analytics exemption. [verify — AP position via harvested notes line 441/447; primary AP letter not fetched this run]
- Consequence for the labels: analytics/crash are **Optional** on Play and must be gated behind consent at boot (`setAnalyticsCollectionEnabled(false)` until consent). The Apple label still lists them as collected (Analytics purpose, Linked, not Tracking) — the *label* says what is collected when enabled; *consent* governs *whether* it is enabled. Do not let a "we're opt-in" argument cause under-declaration on the labels.
- **Account email/UID and purchase data** rest on **Art. 6(1)(b)** (performance of the contract) — required, not consent-gated. [verify-pinpoint — GDPR Art. 6(1)(b)]

---

## Section 5 — Recipients / subprocessor list this table must drive in the PP

Every "collected? OFF-device" row above implies a named recipient in the Privacy Policy (Apple 5.1.1(i) equal-protection + GDPR Art. 30 RoPA + PoliCheck entity-sensitivity: name the entity, never just "third parties"). [settled — Apple 5.1.1(i) per harvested notes line 474; entity-sensitivity per PoliCheck notes line 534]

| Recipient (entity) | Role | Data it receives (canonical rows) | Region |
|---|---|---|---|
| **Google / Firebase** (Auth, Firestore, Analytics, Crashlytics, Cloud Functions, Hosting) | Processor | email, user ID, session metadata (Pro), crash/perf, analytics/usage, device/installation IDs | europe-west (EU) |
| **RevenueCat** | Processor | user ID (= Firebase UID), purchase/subscription history | (confirm region/transfer basis) |
| **Apple / Google (Play Billing)** | Merchant of record / independent controller for payments | payment instrument (publisher never sees PAN), purchase confirmation | per store |

The PP recipients section, the Apple label, and the Play CSV must list the **same set of data types per recipient**. A row present in this table but absent from any one of the three artefacts is an **OMITTED** disclosure (PoliCheck taxonomy) and a sign-off failure.

---

## Section 6 — Three-way reconciliation rules (the sign-off invariant)

For every canonical row marked **collected = YES**:
1. It appears as a **declared type** in the Apple App Privacy label (correct category/type name, Linked state, purpose, tracking=No).
2. It appears as **collected** (and *shared* if applicable) in the Play Data Safety form/CSV, with required/optional + purpose set, and the app-level encryption-in-transit = Yes / deletion = Yes both true.
3. It appears in the **PP data-inventory + recipients** section, naming the specific processor.

For every row marked **NO / Not Collected** (esp. Health & Fitness, Sensitive Info, Location, Advertising ID): it must be **absent** from both labels and must not be implied anywhere in the PP. Asserting "we don't collect location/health" while an SDK does = **INCORRECT** disclosure (the most severe PoliCheck class).

**Name-mapping rule:** never copy a category name store-to-store. Resolve through the **Canonical category** column, then emit each store's verbatim name from the table. This is the only safe way to keep "Diagnostics", "Purchases", "Usage Data", and "Identifiers" correct on both sides.

---

## Verify flags (human confirmation recommended)
- Apple optional-disclosure exact criteria wording — `[verify-pinpoint]`.
- Google "collection vs sharing" service-provider exclusion (is Firebase first-party processing "sharing"?) — `[verify-pinpoint]`.
- GDPR Art. 9(1) enumeration + Art. 4(15) "data concerning health" pinpoint — `[verify]`.
- Breathing-session logs are not Art. 9 by inference — `[low-confidence]`, Dutch jurist call.
- AP / Tw 11.7a opt-in conclusion for GA4/Crashlytics — `[verify]` (primary AP letter not fetched this run).
- MDR/MDCG 2019-11 wellness carve-out reliance — `[verify]`.
- GDPR Art. 6(1)(b) contract-basis pinpoint for account/purchase data — `[verify-pinpoint]`.
- RevenueCat data-hosting region / international-transfer basis — `[verify]`.
