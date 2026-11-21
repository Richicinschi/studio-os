# Data-Category Ontology — Apple ⇄ Google Play ⇄ GDPR Crosswalk

**Role of this file.** This is the canonical crosswalk that `legal-cross-store` uses to keep the three "labels" in lockstep: the **Apple App Privacy** ("nutrition label"), the **Google Play Data Safety** form/CSV, and the **Privacy Policy** data-inventory / recipients (subprocessor) section. One change to what the app actually collects must propagate to all three artefacts from this single source of truth. The last column of the §1 table is a worked example (the app in `worked-example.md` §1); fill it for the app under review from its fact sheet and data-surface scan.

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

Columns: **Canonical category** · **Apple App Privacy label** (verbatim category → type) · **Google Play Data Safety** (verbatim category → type) · **GDPR category** (Art. 4 / Art. 9) · **Sensitivity** · **Worked example: collected? SDK? on/off-device** (the worked column; derive the app's own).

> Apple verbatim taxonomy confirmed at [settled — developer.apple.com/app-store/app-privacy-details, verified 2026-11-18]. Google verbatim taxonomy confirmed at [settled — support.google.com/googleplay/android-developer/answer/10787469, verified 2026-11-18].

| Canonical category | Apple App Privacy label | Google Play Data Safety | GDPR category | Sensitivity | Worked example: collected? / SDK / on-off-device |
|---|---|---|---|---|---|
| **Account email** | Contact Info → **Email Address** | Personal info → **Email address** | Art. 4(1) personal data (contact/identifier) | normal | **YES** · Firebase Auth (email/password + Google Sign-In) · OFF-device (Firebase Auth, which runs only in US data centers; see sdk-data-map.md §1) |
| **Account / user ID (app account)** | Identifiers → **User ID** | Personal info → **User IDs** | Art. 4(1) personal data (online identifier) | normal | **YES** · Firebase Auth UID; mirrored as RevenueCat `app_user_id` (= Firebase UID) · OFF-device |
| **Name** | Contact Info → **Name** | Personal info → **Name** | Art. 4(1) personal data | normal | **CONDITIONAL** · only the Google account display name *if* Google Sign-In is used · OFF-device (Firebase Auth). If not surfaced/stored, declare **Not Collected**. |
| **Purchase / subscription history** | **Purchases → Purchase History** | **Financial info → Purchase history** | Art. 4(1) personal data | normal | **YES** · RevenueCat (entitlement/subscription state) + Apple/Google as merchants of record · OFF-device (RevenueCat API + Firestore mirror `users/{uid}/private/subscription`) |
| **Payment instrument (card/PAN)** | Financial Info → **Payment Info** | Financial info → **User payment info** | Art. 4(1) personal data | normal | **NO** · payment handled entirely by Apple/Google (merchant of record); publisher never sees card data → **Not Collected** on both labels |
| **Crash data** | Diagnostics → **Crash Data** | App info and performance → **Crash logs** | Art. 4(1) personal data (telemetry, may be linkable) | normal | **YES (opt-in NL — see §4)** · Firebase Crashlytics · OFF-device |
| **Performance / diagnostics** | Diagnostics → **Performance Data** (+ Other Diagnostic Data) | App info and performance → **Diagnostics** (+ Other app performance data) | Art. 4(1) personal data | normal | **YES (opt-in NL)** · Firebase Crashlytics / Performance · OFF-device |
| **Analytics / usage / app interactions** | Usage Data → **Product Interaction** | App activity → **App interactions** | Art. 4(1) personal data | normal | **YES (opt-in NL)** · Firebase Analytics (GA4) · OFF-device |
| **In-app search history** | Search History → **Search History** | App activity → **In-app search history** | Art. 4(1) personal data | normal | **NO** · the worked example has no in-app search → **Not Collected** |
| **Session metadata (`<app category>` session logs that record only timing/usage, §3)** | **Open** — User Content → Other User Content vs Usage Data → Other Usage Data, either may be defensible `[verify-pinpoint]`, see `apple-app-privacy.md` attribution ledger (NOT Health & Fitness) | App activity → **App interactions** (or **Other actions**) — NOT Health and fitness | Art. 4(1) personal data (ordinary, see §3) | **normal — NOT special category** | **Pro: YES** (Firestore sync `users/{uid}/sessions`, OFF-device); **Free: ON-device only** (SharedPreferences, not "collected"). Health = No for bare session logs (not health or medical data); whether they are Fitness rather than another category is the developer's call, see §3 `[verify]` |
| **Device identifier** | Identifiers → **Device ID** | **Device or other IDs → Device or other IDs** | Art. 4(1) personal data (online identifier) | normal | **YES** · Firebase app-instance/installation IDs (iOS: IDFV) ride analytics/crash SDKs; **no Android Advertising ID** once both controls are in place (AD_ID permission stripped and `google_analytics_adid_collection_enabled=false`, sdk-data-map.md §3). Declare Device ID (Apple) and Device or other IDs (Play) whenever analytics or crash SDKs can be enabled for any user; opt-in does not remove the declaration. OFF-device `[settled — App Privacy Details; Play Help 10787469; Firebase Analytics config (Apple platforms), verified 2026-11-19]` |
| **Advertising ID (GAID/IDFA)** | Identifiers → **Device ID** ("Such as the device's advertising identifier"; Usage Data → Advertising Data is information about the ads the user has seen) | (declared as Device or other IDs if collected) | Art. 4(1) personal data | normal | **NO** · AD_ID permission removed; `google_analytics_adid_collection_enabled=false` must also be set; on iOS the IDFA reads as zeros without ATT; no ads SDK → **Not Collected**; supports the "no advertising ID" PP claim. Rule: `[settled — Android 13 behaviour changes; Firebase Analytics config (Android); Apple advertisingIdentifier docs, verified 2026-11-19; see sdk-data-map.md §3]`; the example answer: `[verify — until the merged manifest shows both controls]` |
| **Approximate location** | Location → **Coarse Location** | Location → **Approximate location** | Art. 4(1) personal data | normal | **NO** · no location permission → **Not Collected** |
| **Precise location** | Location → **Precise Location** | Location → **Precise location** | Art. 4(1) personal data | normal | **NO** → **Not Collected** |
| **Health & fitness** | **Health & Fitness** {Health, Fitness} | **Health and fitness** {Health info, Fitness info} | **Art. 9** special category (health) — if the data can reveal health status, whatever its source (§3) | **special-category** | **NO in the worked example**. No HealthKit / Health Connect / Motion & Fitness API, and that alone does not decide it. Bare session logs are not health or medical data (Health = No on both stores) and not Art. 9 health data unless a §3 trigger is present. Whether they are Fitness is the developer's call `[verify — see §3]` |
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
Sensitive Info · Location (coarse+precise) · Contacts · Messages · Photos/Videos · Audio recordings · Files & docs · Calendar · Browsing/Search history · Phone number. **Confirm, do not assert** `[verify]`: Health & Fitness (the stores define it by the data, not the API; §3) and Advertising ID (both Android controls present in the merged manifest; row above). Device ID is not on this list: it is collected whenever analytics or crash SDKs can be enabled (row above). Apple lets you declare **"Data Not Collected"** for the whole app only if *nothing* is collected — an app that collects account + purchase + (opt-in) telemetry must enumerate those and leave the rest off.

---

## Section 2 — Per-store questionnaire axes (what each label additionally asks)

These extra axes are where the two stores' artefacts diverge even when the canonical category matches. The skill must answer them per data type, not just "collected y/n".

### 2a. Apple App Privacy — 4 questions per data type
[settled — developer.apple.com/app-store/app-privacy-details, verified 2026-11-18]

1. **Collected?** "Collect" = transmitted off the device in a way that lets you/your third parties access it beyond servicing the user's immediate request.
2. **Linked to the user?** Two linkage states: **Linked to the User** vs **Not Linked to the User** (data must be de-identified, not re-linkable, and not joined to identifying data). For the worked example, account email/UID, purchases, and (opt-in) telemetry tied to the signed-in UID are **Linked to the User**.
3. **Used to Track You?** *Tracking* = linking your app's data with **Third-Party Data** for targeted advertising / ad measurement, OR sharing with a **data broker**. An app that does **none** of this → **Not used for tracking** for every type. (No ATT prompt required.)
4. **Purpose(s)?** Closed list of 6: **Third-Party Advertising · Developer's Advertising or Marketing · Analytics · Product Personalization · App Functionality · Other Purposes**. Worked-example purposes: App Functionality (account, purchases) and Analytics (telemetry); never the two advertising purposes (an app without ads never selects them).

**Apple data-type categories (verbatim, full set):** Contact Info · Health & Fitness · Financial Info · Location · Sensitive Info · Contacts · User Content · Browsing History · Search History · Identifiers · Purchases · Usage Data · Diagnostics · Surroundings (Environment Scanning) · Body (Hands, Head) · Other Data. [settled — developer.apple.com/app-store/app-privacy-details, verified 2026-11-18]

**Apple optional-disclosure carve-out** (data type may be omitted only if ALL hold): not used for tracking; not used for Third-Party/Developer advertising or "Other Purposes"; collected infrequently, not part of the primary functionality, and optional; the user provides it in the app's interface, it is clear what is collected, the user's name or account name is prominently displayed in the submission form alongside the other data, and the user affirmatively chooses to provide it each time. (The page also lists separate carve-outs for product-improvement programs, regulated financial services and health research.) [settled — developer.apple.com/app-store/app-privacy-details, verified 2026-11-18]

### 2b. Google Play Data Safety — axes per data type
[settled — support.google.com/googleplay/android-developer/answer/10787469, verified 2026-11-18]

1. **Collected and/or Shared?** *Collection* = data leaving the device. *Sharing* = transfer to a third party. Every third-party SDK (Firebase, Crashlytics, RevenueCat, Google Sign-In) counts as collection — and as **sharing** when the recipient is a separate controller/broker. Transfers to a "service provider" (an entity that processes user data on the developer's behalf and on its instructions) are not sharing; an SDK provider that builds advertising profiles across customers is not a service provider. [settled — support.google.com/googleplay/android-developer/answer/10787469, verified 2026-11-18] Whether each SDK here qualifies as a service provider follows from its terms (see sdk-data-map.md) `[verify]`.
2. **Processed ephemerally?** Data held only in memory and no longer than necessary may be disclosed but **excluded from the public listing**. Persisted data (all of the worked example's) is not ephemeral.
3. **Required vs optional (user can choose)?** Account/purchase = required for that functionality; analytics/crash = **optional** (user can opt out → mark *optional* / users can choose).
4. **Purpose(s)?** Closed 7-item list: **App functionality · Analytics · Developer communications · Advertising or marketing · Fraud prevention, security, and compliance · Personalization · Account management**. [settled — support.google.com/googleplay/android-developer/answer/10787469, verified 2026-11-18]
5. **App-level security declarations (2):** *All data encrypted in transit?* → **Yes** (Firebase/HTTPS). *Users can request data deletion?* → **Yes** (in-app delete + web URL).

**Google data categories (verbatim, full set):** Location · Personal info · Financial info · Health and fitness · Messages · Photos and videos · Audio files · Files and docs · Calendar · Contacts · App activity · Web browsing · App info and performance · Device or other IDs. [settled — support.google.com/googleplay/android-developer/answer/10787469, verified 2026-11-18]

### 2c. Axis-divergence cheat sheet (drives review comparisons)

| Axis | Apple | Google Play | Notes for the skill |
|---|---|---|---|
| Off-device test | "Collect" | "Collected" | Same threshold (data leaves device). |
| Third-party transfer | folded into "Used to Track You" + purposes | explicit **Shared** flag | Google asks *sharing* separately; Apple only flags *tracking*. |
| Linkability | **Linked / Not Linked to the User** | not asked as such | Apple-only axis. |
| Required vs optional | not asked | **Required / Optional** | Google-only axis; consent-gated analytics/crash = optional. |
| Encryption-in-transit | not asked | app-level **Yes/No** | Google-only. |
| Deletability | not asked (covered by 5.1.1(v) account-deletion rule elsewhere) | app-level **Yes/No** + web URL | For an app that lets users create an account, Google requires a web deletion link **in addition** to the in-app deletion path. [settled — support.google.com/googleplay/android-developer/answer/13327111, verified 2026-11-18] |
| Ephemeral | not a public axis | **excluded from public listing** | Google-only. |

---

## Section 3 — When a wellness app's session logs are, and are not, special-category health data

This is a load-bearing determination; the skill must defend it.

- **GDPR Art. 9** special categories = data revealing racial/ethnic origin, political opinions, religious/philosophical beliefs, trade-union membership, genetic data, biometric data for unique ID, **data concerning health**, sex life, or sexual orientation. [verify — GDPR Art. 9(1); substance settled, paragraph not re-fetched this run]
- **Test (GDPR):** data are health data if they are capable of revealing health status, directly or by collation or deduction, even only with a certain probability; their source does not matter. [settled — GDPR Art 4(15), Recital 35; CJEU C-21/23 paras 81, 83, 90; C-184/20 paras 123, 125, 127, verified 2026-11-19] **Applied:** logs holding only technique, time, rounds and audio settings, with non-medical goals (calm/focus/reset), are not health data. They become Art 9 data — explicit consent, Art 9(2)(a) — if a technique or program is framed around a condition, the user enters mood or symptoms, the app measures a physiological signal, or the app infers a state. [low-confidence — fact-specific; no CJEU or EDPB ruling on wellness-session logs; LEGAL REVIEW REQUIRED before relying on "not Art 9" if any trigger is present]
- **The stores define these types by the data, not by the API it comes from** (this suite's short summaries, not the stores' text). Apple's Health type covers health and medical data from any source: the clinical-records, HealthKit and Movement Disorder APIs and health research are its examples, and it also takes in "any other user provided health or medical data". Its Fitness type covers fitness and exercise data, the Motion and Fitness API among them. Google's Health info is data about a user's health, with medical records and symptoms as its examples; its Fitness info is data about a user's fitness, with exercise and other physical activity as its examples. [settled — developer.apple.com/app-store/app-privacy-details + support.google.com/googleplay/android-developer/answer/10787469, verified 2026-11-18] Having **no HealthKit / Health Connect / Motion & Fitness** access does not by itself make both labels **Not Collected** for synced session logs. [verify — Health = No for bare session logs (below); whether they count as Fitness is the developer's call]
- **General-wellness positioning** (no "treats/cures/diagnoses/prevents"; "supports / may help relax") keeps the app out of the MDR medical-device frame and reinforces the non-health classification. [verify — ties to MDR/MDCG 2019-11 wellness carve-out, not re-fetched this run]

**Over-declaration trap:** declaring "Health and fitness" on Play / "Health & Fitness" on Apple for `<app category>` session data that reveals nothing about health or exercise is a common indie mistake that (a) invites Google's Health Apps policy self-assessment burden and (b) misstates the GDPR basis. Classify by the data, not the API: Health = No for bare session logs (not health or medical data); whether such a session is "exercise data" (Apple Fitness) or "physical activity" (Google Fitness info) is not answered by the store text — for a session that records only timing/usage and reveals nothing about health or exercise (§3), Product Interaction / App interactions is the defensible answer; record the choice. [settled on the definitions — Apple App Privacy Details; Play Help 10787469, verified 2026-11-19] [verify — Fitness classification is the developer's call]

---

## Section 4 — NL/EU overlay: consent gating that the labels do not capture

The store labels are platform-policy artefacts; they do **not** encode the GDPR/AVG lawful basis. The crosswalk must be read together with these:

- **Firebase Analytics (GA4) is opt-IN in the Netherlands** under Telecommunicatiewet 11.7a / ePrivacy Art. 5(3): default Firebase Analytics stores and reads an app-instance identifier, which does not safely meet the "geen of geringe gevolgen" analytics exemption (`ap-guidance.md` §3). [settled — Tw 11.7a(1), (3)(b), wetten-overheid.nl mirror, verified 2026-11-19; ePrivacy Art 5(3) + EDPB Guidelines 2/2023, verified 2026-11-18] [verify — source blocked 2026-11-19: AP GA4 position; the AP's Google Analytics documents sat behind a CAPTCHA] **Crashlytics:** the same opt-in gate is the conservative recommendation; whether crash reporting is "strictly necessary" is not settled `[verify / low-confidence — eprivacy-cookiewet.md §6]`.
- Consequence for the labels: analytics/crash are **Optional** on Play and must be gated behind consent at boot (`setAnalyticsCollectionEnabled(false)` until consent). The Apple label still lists them as collected (Analytics purpose, Linked, not Tracking) — the *label* says what is collected when enabled; *consent* governs *whether* it is enabled. Do not let a "we're opt-in" argument cause under-declaration on the labels.
- **Account email/UID and purchase data** rest on **Art. 6(1)(b)** (performance of the contract) — required, not consent-gated. [verify-pinpoint — GDPR Art. 6(1)(b)]

---

## Section 5 — Recipients / subprocessor list this table must drive in the PP

Every "collected? OFF-device" row above implies a named recipient in the Privacy Policy (Apple 5.1.1(i) equal-protection + GDPR Art. 30 RoPA + PoliCheck entity-sensitivity: name the entity, never just "third parties"). [settled — Apple 5.1.1(i) (Guidelines last updated 16 Oct 2026: the policy must confirm that third parties it shares data with, "such as analytics tools, advertising networks and third-party SDKs", give equal protection) + PoliCheck (Andow et al., USENIX Security 2020: entity-sensitive consistency), verified 2026-11-18. Naming each entity is this suite's rule; neither source requires names.]

| Recipient (entity) | Role | Data it receives (canonical rows) | Region |
|---|---|---|---|
| **Google / Firebase** (Auth, Firestore, Analytics, Crashlytics, Cloud Functions, Hosting) | Processor (Analytics: per the Google Analytics terms `[verify]`) | email, user ID, session metadata (Pro), crash/perf, analytics/usage, device/installation IDs | Auth: **US only**; Firestore and Functions: the project's chosen location (example: europe-west, EU); Crashlytics, Hosting, Analytics: global (see sdk-data-map.md) |
| **RevenueCat** | Processor | user ID (= Firebase UID), purchase/subscription history | **US (AWS)**; EU SCCs via RevenueCat's DPA (see sdk-data-map.md §7) |
| **Apple / Google (Play Billing)** | Merchant of record / independent controller for payments | payment instrument (publisher never sees PAN), purchase confirmation | per store |

The PP recipients section, the Apple label, and the Play CSV must list the **same set of data types per recipient**. A row present in this table but absent from any one of the three artefacts is an **OMITTED** disclosure (PoliCheck taxonomy) and rules out SHIP.

---

## Section 6 — Three-way reconciliation rules (the review invariant)

For every canonical row marked **collected = YES**:
1. It appears as a **declared type** in the Apple App Privacy label (correct category/type name, Linked state, purpose, tracking=No).
2. It appears as **collected** (and *shared* if applicable) in the Play Data Safety form/CSV, with required/optional + purpose set, and the app-level encryption-in-transit = Yes / deletion = Yes both true.
3. It appears in the **PP data-inventory + recipients** section, naming the specific processor.

For every row marked **NO / Not Collected** (esp. Sensitive Info, Location): it must be **absent** from both labels and must not be implied anywhere in the PP. Health & Fitness and Advertising ID are confirmed, not asserted `[verify]` (the affirmative list above); Device ID is a collected row. Asserting "we don't collect location/health" while an SDK does = **INCORRECT** disclosure (the most severe PoliCheck class).

**Name-mapping rule:** never copy a category name store-to-store. Resolve through the **Canonical category** column, then emit each store's verbatim name from the table. This is the only safe way to keep "Diagnostics", "Purchases", "Usage Data", and "Identifiers" correct on both sides.

---

## Verify flags (human confirmation recommended)
- Whether synced `<app category>` session logs fall under Apple Fitness or Google Fitness info (§1 rows, §3): Health = No for bare session logs (answered 2026-11-19); Fitness is the developer's call — `[verify]`.
- Whether each SDK qualifies as a Play "service provider" (§2b item 1) — `[verify]`.
- GDPR Art. 9(1) enumeration + Art. 4(15) "data concerning health" pinpoint — `[verify]`.
- Session logs that record only timing/usage (the worked example's, `worked-example.md` §8) are not Art. 9 without a §3 trigger (answered 2026-11-19); with a trigger present — `[low-confidence]`, LEGAL REVIEW REQUIRED.
- Tw 11.7a opt-in conclusion for GA4/Crashlytics rests on the statute (answered 2026-11-19, §4); the AP's own GA4 position — `[verify]` (behind a CAPTCHA on 2026-11-19).
- MDR/MDCG 2019-11 wellness carve-out reliance — `[verify]`.
- GDPR Art. 6(1)(b) contract-basis pinpoint for account/purchase data — `[verify-pinpoint]`.
- RevenueCat transfer basis: answered 2026-11-19 — the PP names the SCCs from its DPA (Module 2) and how to obtain a copy; RevenueCat is not on the DPF List (checked 2026-11-19); region US/AWS confirmed 2026-11-18. Still to confirm: the DPA is accepted for the account — `[verify]`.
