# SDK → Data-Flow Map (Firebase + RevenueCat stack, with the worked example)

Canonical SDK-to-data-flow reference for the **legal-data-surface-scan** and **legal-flow-grader**
subskills. Each SDK is mapped to: data collected · recipient entity · on/off-device · processing
purpose · GDPR lawful basis · transfer mechanism. Use this to (a) build the `(data-type,
recipient-entity, on/off-device)` flow set, then (b) grade each flow against the Privacy Policy /
Terms using the PoliCheck 5-category taxonomy (clear / vague / omitted / incorrect / ambiguous).

**How to use it for any app.** The per-SDK facts below (recipient, data, location, retention, basis,
transfer) hold for any app that ships the SDK. The app-specific lines (region chosen, tier split,
what the app's own functions do) are worked for the **worked example** (`worked-example.md`);
replace them with the facts of the app under review (fact sheet + `legal-data-surface-scan`). An
SDK the app ships that is not listed here needs its own row, built from the SDK's privacy docs.

**Worked-example profile:** `worked-example.md` §1.

---

## Attribution-tier legend

| Tag | Meaning |
|---|---|
| `[settled — <source>, verified <date>]` | Confirmed against the primary source fetched on that date |
| `[verify]` | Believed correct, not confirmed against a source |
| `[verify-pinpoint]` | Right substance; exact article/clause/flag still to pin |
| `[low-confidence]` | Novel / contested / fact-specific |

Primary sources fetched 2026-11-18: Firebase **Privacy and Security in Firebase**
(`firebase.google.com/support/privacy`, last modified 16 Nov 2026); Firebase **Terms of Service
for Firebase Services** (`firebase.google.com/terms`, last modified 24 Sep 2026: Auth, Firestore
and Cloud Functions run under the Google Cloud Platform Terms; Hosting and Crashlytics under the
Firebase Data Processing and Security Terms); Firebase **SCC index** (`firebase.google.com/terms/firebase-sccs`);
Google Cloud **Data Processing Addendum** (`cloud.google.com/terms/data-processing-addendum`, last
modified 30 Oct 2026); Firebase **Analytics data-collection config**, Android
(`firebase.google.com/docs/analytics/android/configure-data-collection`) and iOS
(`firebase.google.com/docs/analytics/ios/configure-data-collection`; the old platform-neutral URL
now redirects here); Play Console Help **6048248** (Advertising ID); RevenueCat **Privacy Policy**
(`revenuecat.com/privacy`, last updated June 2026); RevenueCat **DPA** (`revenuecat.com/dpa`,
effective August 2026); RevenueCat **CustomerInfo** and **Identifying Customers** docs
(`revenuecat.com/docs/customers/customer-info`, `.../identifying-customers`); PoliCheck (Andow et
al., USENIX Security 2020, `usenix.org/conference/usenixsecurity20/presentation/andow`).

---

## 0. How to use this map (for the grader)

1. **Enumerate recipients, not just data types.** Disclosure consistency MUST be *entity-aware*: the
   PP must name each processor (Google/Firebase, RevenueCat Inc., Apple, Google Play), not merely
   "third parties." Naming each is also what satisfies **GDPR Art. 30 RoPA** and **Apple
   5.1.1(i)** equal-treatment expectations. `[settled — PoliCheck (Andow et al., USENIX Security
   2020: entity-sensitive flow-to-policy consistency), verified 2026-11-18]`
2. **Lawful basis ≠ store category.** A flow can be `6(1)(b)` contract for the feature but still
   require **separate ePrivacy/cookiewet consent** for the *storing/reading* step (Analytics,
   Crashlytics). Track both columns.
3. **On-device flows are NOT "processing by a recipient."** Free-tier session history stored only
   in SharedPreferences/local Firestore-cache never reaches a recipient → it is *collection* in the
   GDPR sense only if it leaves the device. Grade it as "on-device, no external recipient."
4. **EU region claims must be flow-specific.** Some Google services are **global / US-only by
   architecture** regardless of your project's region selection (see §1, §3, §4). Do not let a
   blanket "Firebase data is in the EU" PP sentence stand — it is *incorrect* for Authentication and
   for Analytics/Crashlytics. `[settled — Firebase Privacy & Security, verified 2026-11-18]`

---

## 1. Firebase Authentication

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC / Google Ireland (Firebase) — **data processor** `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Data collected** | Email address, password (credential), phone numbers (n/a for an app without phone sign-in), user agents, **IP addresses** `[settled — Firebase Privacy & Security, verified 2026-11-18]`; plus the Firebase **user ID (UID)** and ID tokens the service issues `[verify — not listed on the Firebase Privacy & Security page]` |
| **On/off-device** | **Off-device** |
| **Data location** | **US-only by architecture.** "Firebase Authentication service is run only from US data centers… processes data exclusively in the United States." Your `europe-west` selection does **not** apply to Auth. `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Retention** | Logged **IP addresses kept "a few weeks"**; other auth info retained until the customer deletes the user, then removed from live + backup within **180 days** `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Purpose** | Account creation, sign-in, session/token management, email verification, password reset, account deletion |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (performance of the service the user signed up for) `[verify]` |
| **Transfer mechanism** | EU→US transfer to Google: Google LLC is certified under the **EU-US Data Privacy Framework (DPF)**. Firebase Authentication runs under the **Google Cloud Platform Terms of Service**, so its processing terms are the **Cloud Data Processing Addendum**, which provides Google's **SCCs** (cloud.google.com/terms/sccs/…) and allows an "Alternative Transfer Solution" such as an adequacy framework. `[settled — Firebase Privacy & Security + Terms of Service for Firebase Services + Cloud Data Processing Addendum, verified 2026-11-18]` |

**Grader notes.** Because Auth is **US-only**, an EU-region claim in the PP is *incorrect* for this
flow — the PP must disclose a US transfer + name DPF/SCC. In the worked example the Firebase UID is the join key that links
Firestore, RevenueCat (App User ID = UID) and Crashlytics; treat it as a pseudonymous identifier.

---

## 2. Cloud Firestore

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC / Google Ireland (Firebase) — **data processor** `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Data collected** | **Account profile** (`users/{uid}` doc: consent timestamps for the age confirmation and the withdrawal waiver, the terms version, a soft-delete flag); **Pro-tier session history** (`users/{uid}/sessions`); **subscription mirror** (`users/{uid}/private/subscription`, server-written). `[worked example — its documents; read the app's own]` Customer-defined content: the Firebase page has no Firestore row in its end-user-data table, and Firestore is not among the services whose "Firebase Service Data" (application IDs, package/bundle IDs, IP addresses) it lists. `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **On/off-device** | **Pro = off-device** (synced to Google). **FREE tier = ON-DEVICE ONLY** — session history lives in local storage / local Firestore cache and is **not** synced to a recipient. `[worked example — its tier split; read the app's own from its code]` |
| **Data location** | Firestore is a **global service with location selection** → read the app's chosen location from its config; the worked example provisions **`europe-west`**, so synced data is processed in the EU. `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Retention** | **Customer-controlled.** Worked example: live until user deletes; soft-delete → 30-day grace → a scheduled recursive-delete purge job. `[settled — Firebase Privacy & Security + app profile, verified 2026-11-18]` |
| **Purpose** | Persist account state + consent records; sync session history for paying users; mirror entitlement state |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (Pro sync is the paid feature; account record is necessary to provide the account); consent records evidence **Art. 7 / Art. 8 / Art. 16(m)** compliance, not a separate basis `[verify]` |
| **Transfer mechanism** | **None required for EU region** — data stays in EU (`europe-west`). DPF/SCC remain Google's fallback umbrella. `[verify-pinpoint]` |

**Grader notes.** For an app with a tier split, the **free-vs-paid split is the single most important PP-accuracy point**:
the PP must state that free-user history is **on-device only** and **not held on
our servers** (so "we cannot remotely purge it" is the honest retention answer for free users). Any
PP sentence implying server-side history for all users is *incorrect* for the free tier.

---

## 3. Firebase Analytics (Google Analytics for Firebase)

| Field | Value |
|---|---|
| **Recipient entity** | Google (Google Analytics for Firebase) — a separate service; its processing terms are the **Google Ads Data Processing Terms**, which the GA Terms §7 incorporate "to the extent … within scope"; "Google Analytics for Firebase" is listed as a Processor Service and Google "is a processor of Customer Personal Data" (§5.1.1(b)). **Condition:** the GA data-sharing setting "Google products & services" is **off** — when on, Google is a controller of the shared data. Confirm the terms are accepted in the GA account. [settled — Firebase P&S (16 Nov 2026); GA Terms §7; Ads DPT v8.0 §5.1.1(b); Processor Services list (23 Oct 2025); GA Help 1011397, verified 2026-11-19] |
| **Data collected** | App usage / interaction **events** (the app's own event taxonomy), **pseudonymous app-instance ID** (per-installation identifier), device/OS attributes, IP-derived coarse geo `[verify — not listed on the Firebase Analytics config pages]`. **Advertising ID (AD_ID/GAID):** on Android the SDK collects it unless the app sets `google_analytics_adid_collection_enabled` to `false` `[settled — Firebase Analytics config (Android), verified 2026-11-18]`; the worked example strips the AD_ID permission and **must also set** that flag (see below); its "no advertising ID" stays `[verify]` until the merged manifest shows both |
| **On/off-device** | **Off-device** (events transmitted to Google) |
| **Data location** | Analytics is a **separate service subject to separate terms**; its processing is **not governed by your Firestore EU-region selection** — treat as global/US-capable. `[settled — Firebase Privacy & Security, verified 2026-11-18]` `[verify]` (exact region) |
| **Retention** | Per Google Analytics terms (not on the Firebase Privacy & Security page) `[verify]` |
| **Purpose** | Product analytics (feature usage, funnels, retention) — NOT advertising for an app with no ads |
| **GDPR lawful basis** | **CONSENT — Art. 6(1)(a)** required, *and* **ePrivacy / NL `Telecommunicatiewet` art. 11.7a (cookiewet)** consent for the storing/reading of the app-instance identifier on the device. **FLAG:** analytics may **not** rely on legitimate interest in NL; opt-in is required (`ap-guidance.md` §3). `[settled — Tw 11.7a(1), (3)(b), wetten-overheid.nl mirror, verified 2026-11-19; ePrivacy Art 5(3) + EDPB Guidelines 2/2023, verified 2026-11-18]` `[verify — source blocked 2026-11-19: AP GA4 position; the AP's Google Analytics documents sat behind a CAPTCHA]` |
| **Transfer mechanism** | Ads DPT §7.1 / Appendix 3A: the Alternative Transfer Solution if Google has adopted one, otherwise the SCCs (one or the other) (Google LLC is DPF-listed per Firebase P&S). Name the mechanism accordingly in the PP. [settled — Ads DPT v8.0 §7.1, Appendix 3A; Firebase P&S, verified 2026-11-19] |

### AD_ID strip (load-bearing for the "no advertising ID" claim)

- On Android, `firebase_analytics` **collects the Android Advertising ID (GAID)** unless collection
  is switched off: the config page's "Disable Advertising ID collection" step sets
  `<meta-data android:name="google_analytics_adid_collection_enabled" android:value="false" />`.
  `[settled — Firebase Analytics config (Android), verified 2026-11-18]` Apps targeting Android 13+
  need the `com.google.android.gms.permission.AD_ID` permission to use the advertising ID, and an
  SDK that declares it in its library manifest has it merged into the app's manifest by default.
  `[settled — Play Console Help 6048248, verified 2026-11-18]` Whether `firebase_analytics` itself
  declares the permission is not on either page `[verify — check the merged manifest]`.
- An app that does not use the GAID must do **both**: (1) remove the permission from the merged manifest, `<uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove"/>` (plus the two ACCESS_ADSERVICES_* permissions), so for an app targeting Android 13+ the ID "is automatically removed and replaced with a string of zeroes"; and (2) set Firebase's switch `<meta-data android:name="google_analytics_adid_collection_enabled" android:value="false"/>`. The flag is Firebase's documented control; the strip is Android's. With both, "no advertising ID" is supported. [settled — Android 13 behaviour changes; Firebase Analytics config (Android); Play Help 6048248, verified 2026-11-19] Behaviour on devices below Android 13 with the strip alone: [verify — not stated by Android] The worked example's profile (`worked-example.md` §1) records only the strip: [verify — worked example; confirm both controls in the merged manifest]
- The runtime opt-out toggle is `setAnalyticsCollectionEnabled(false)`; iOS uses `FIREBASE_ANALYTICS_COLLECTION_ENABLED` /
  `FIREBASE_ANALYTICS_COLLECTION_DEACTIVATED` in Info.plist and removes `AdSupport.framework` to
  suppress IDFA. `[settled — Firebase Analytics config (iOS), verified 2026-11-18]`

**Grader checks.** (1) The PP "no advertising ID" answer is *consistent* only if the merged manifest
shows the AD_ID permission **absent** and `google_analytics_adid_collection_enabled=false` set (verify with Exodus/MobSF). (2) `daily_reminder_received`-type
events must not be claimed in the PP if not actually fired. (3) Reminder time must be sent **coarse**
(`"changed"`), not the exact `HH:mm`, for the "not transmitted to our servers" claim to hold.

---

## 4. Firebase Crashlytics

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC (Crashlytics) — **data processor** `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Data collected** | Crash stack traces, **Crashlytics Installation UUIDs**, **Firebase installation IDs (FID)**, minidump data, device info (OS/model, RAM, disk space), thread data, exception details, binary image data, jailbreak status, screen rotation, proximity-sensor state `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **On/off-device** | **Off-device** (on crash/next launch) |
| **Data location** | **Global** — "could process data at any of the Google Cloud Platform locations" (NOT pinned to `europe-west`) `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Retention** | Crash stack traces + minidump + associated identifiers kept **90 days** before removal `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Purpose** | Stability / crash diagnostics |
| **GDPR lawful basis** | Two defensible reads: **Art. 6(1)(f) legitimate interest** (security/stability — common for crash reporting) **OR** opt-in **consent** if treated as non-essential telemetry. An app that ships an **opt-out** toggle fits LI; the conservative NL/cookiewet read may push it to consent. **FLAG.** `[low-confidence]` |
| **Transfer mechanism** | Google **DPF + SCC** (Crashlytics runs under the Firebase Data Processing and Security Terms, whose SCCs are indexed at firebase.google.com/terms/firebase-sccs) `[settled — Firebase Privacy & Security + Terms of Service for Firebase Services + Firebase SCC index, verified 2026-11-18]` |

**Grader notes.** Crashlytics processes from **any GCP location** → the PP cannot claim
"Crashlytics data stays in the EU." Disclose global processing + DPF/SCC. Device diagnostics +
installation UUIDs are personal data (online identifiers, Art. 4(1)).

---

## 5. Cloud Functions for Firebase

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC (Cloud Functions) — **data processor** (runs the app's own server code) `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Data collected** | **IP addresses** for HTTP/event handling; whatever the app's functions touch (worked example: the **RevenueCat webhook** payload (App User ID, subscription event), soft-delete purge of Firestore + Auth + RC) `[settled — Firebase Privacy & Security + worked-example profile, verified 2026-11-18]` |
| **On/off-device** | **Off-device (server-side / backend)** |
| **Data location** | Global service infrastructure; read the app's function region from its config (the worked example deploys to **`europe-west1`**) `[settled — Firebase Privacy & Security + worked-example profile, verified 2026-11-18]` |
| **Retention** | IP/processing data held **"temporarily, to provide the service"** `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Purpose** | Mirror RevenueCat subscription state to Firestore; scheduled hard-delete of expired soft-deleted accounts |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (subscription mirror, account deletion) + **Art. 6(1)(c) / 17** for the erasure cron `[verify]` |
| **Transfer mechanism** | EU region for the worked example's functions; Google **DPF + SCC** umbrella `[verify-pinpoint]` |

**Grader notes.** Functions are the *only* component that touches all three identity systems
(Firebase UID, RC App User ID, store tokens) — its description anchors the "how subscription status
flows" disclosure. The RC **webhook secret** is the auth boundary; not a data flow but worth noting
for the security section.

---

## 6. Firebase Hosting

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC (Firebase Hosting) — **data processor** `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Data collected** | **IP addresses** from incoming requests (server logs) `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **On/off-device** | **Off-device** (web/server logs) |
| **Data location** | Global service (CDN) `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Retention** | Retains IP data for **"a few months"** `[settled — Firebase Privacy & Security, verified 2026-11-18]` |
| **Purpose** | Serve the public legal pages (e.g. `/<app>/privacy`, `/terms`, `/support`, `/delete-account`) on the publisher's domain (`<your-domain>`) |
| **GDPR lawful basis** | **Art. 6(1)(f) legitimate interest** (serving a public website + security logging) `[verify]` |
| **Transfer mechanism** | Google **DPF + SCC** umbrella `[verify-pinpoint]` |

**Grader notes.** Often omitted because it serves only static legal pages, but it **does log IPs** —
a complete RoPA should list it. The public **account-deletion URL** must be live here (Play Data
Safety requirement).

---

## 7. RevenueCat (purchases SDK + dashboard/API)

| Field | Value |
|---|---|
| **Recipient entity** | **RevenueCat, Inc.** — 1032 E Brandon Blvd #3003, Brandon, FL 33511, **United States** — **data processor** for end-user info `[settled — RevenueCat Privacy Policy, verified 2026-11-18]` |
| **Data collected** | **App User ID (= Firebase UID** in the worked example), **purchase tokens / receipts** (Apple receipt file, Google purchase token), last-seen time, **subscription status / entitlements**, product identifiers, original + latest purchase dates, first-seen / install date, store/platform, original app version, **end-user technical info** (device type, operating system), optional attribution metadata `[settled — RevenueCat Privacy Policy + CustomerInfo docs, verified 2026-11-18]`. The policy's end-user list does not name IP addresses. |
| **On/off-device** | **Off-device** (sent to RevenueCat servers; cached `CustomerInfo` locally) |
| **Data location** | **United States** — stored on **AWS in the US**: "Customer data sent to RevenueCat from around the world is sent to AWS data centers located in the United States." `[settled — RevenueCat Privacy Policy, verified 2026-11-18]` |
| **Retention** | Per RevenueCat retention (not pinned this run); deleted on hard-delete via RC REST `DELETE` in `hardDeleteUser` `[verify]` |
| **Purpose** | Cross-store subscription validation, entitlement resolution, restore, billing-issue detection |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (delivering the paid subscription the user bought) `[verify]` |
| **Transfer mechanism** | **EU→US transfer.** The **DPA at `revenuecat.com/dpa`** (effective August 2026) makes the **EU SCCs** (Commission Decision 2021/914) available for transfers out of the EEA to a country without adequacy, incorporated into the DPA. Neither the DPA nor the privacy policy names the **DPF** or Privacy Shield. `[settled — RevenueCat DPA + Privacy Policy, verified 2026-11-18]` RevenueCat is not on the DPF List, Active or Inactive `[settled — dataprivacyframework.gov List, checked 2026-11-19]` (see transfers-dpf-scc.md) |

**Grader notes.**
- **App User ID MUST equal the Firebase UID** — this is both a correctness invariant for a Firebase + RevenueCat app and a
  disclosure point (the UID is shared with a US processor). RevenueCat's guide says custom App User IDs
  must be unique per user and not guessable (a UUID v4 is recommended), and not emails or IDFA;
  anonymous `$RCAnonymousID` IDs cannot share subscription status across apps and platforms.
  `[settled — RevenueCat Identifying Customers docs + app profile, verified 2026-11-18]`
- RevenueCat is the **clearest US transfer in the stack** → the PP must (a) **name RevenueCat,
  Inc.** (USA, AWS) as a US processor, (b) name the SCCs, the safeguard its DPA incorporates
  (Decision 2021/914, Module 2), and (c) say how to obtain a copy (GDPR Art 13(1)(f)). This
  wording does not depend on RevenueCat's DPF status; a PP that names the DPF for RevenueCat is a
  🔴 false statement unless RevenueCat is Active on the list (it is not, checked 2026-11-19).
  `[settled — RevenueCat DPA (Aug 2026); GDPR Art 13(1)(f), verified 2026-11-19]` Confirm the DPA
  is accepted for the account before a SHIP verdict.
- RevenueCat is **NOT** the merchant of record — Apple/Google are (see §9). RC only *reads* the
  store transaction; it never charges the user.

---

## 8. Google Sign-In (`google_sign_in` + GoogleSignIn iOS/Android SDK)

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC (Google Identity / OAuth) — for a Firebase app's purposes the credential feeds **Firebase Auth** (§1) `[verify]` |
| **Data collected** | Google **account email + basic profile** (name, profile picture URL), **OAuth ID token / access token**; exchanged for a Firebase credential `[verify]` |
| **On/off-device** | **Off-device** (OAuth exchange with Google) |
| **Data location** | Google global (then Firebase Auth US, §1) `[verify]` |
| **Retention** | Token lifetime; resulting account follows Firebase Auth retention (§1) `[verify]` |
| **Purpose** | Federated sign-in option |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (sign-in chosen by the user) `[verify]` |
| **Transfer mechanism** | Google **DPF + SCC** `[verify-pinpoint]` |

**Biometric-permission note (important, low-disclosure-risk).** The GoogleSignIn Android SDK pulls
in **`USE_BIOMETRIC` / `USE_FINGERPRINT`** permissions **transitively** (for credential/passkey
flows). **An app that only signs in with Google collects, stores, and transmits NO biometric data** — these are platform
capability permissions, not a data flow. The PP should **not** declare a "biometric data" category;
if an Exodus/MobSF scan surfaces these permissions, grade as a **false-positive permission**, not an
omitted data flow. `[verify]` (transitive permission presence — confirm via APK manifest scan)

---

## 9. Apple App Store / Google Play billing (merchants of record)

| Field | Value |
|---|---|
| **Recipient entity** | **Apple Distribution International Ltd.** (App Store) / **Google Commerce / Google Payment** (Play) — each is the **merchant of record (seller)** and an **independent controller** for the payment transaction `[verify]` |
| **Data collected** | Payment instrument, billing data, store account ID, purchase/receipt — handled **entirely by the store**; the app and RevenueCat **never see the card/payment data**, so neither store asks the app to declare it (Play: not declared if the app never accesses it and the payment service collects it directly under its own terms; Apple: payment info entered outside the app that the developer never accesses "is not collected") `[settled — Play Console Help 10787469 FAQ + Apple App Privacy Details, verified 2026-11-18]` `[verify-pinpoint]` (controller status) |
| **On/off-device** | **Off-device** (store-side) |
| **Data location** | Apple / Google global infrastructure `[verify]` |
| **Retention** | Store-controlled (tax/refund/fiscal retention by the store) `[verify]` |
| **Purpose** | Process the auto-renewing subscription charge, refunds, renewals, family sharing |
| **GDPR lawful basis** | The store's own basis (it is the seller); the app's publisher relies on **6(1)(b)** for *delivering* the entitlement once the store confirms purchase `[verify]` |
| **Transfer mechanism** | The store's own framework (out of the publisher's control): Google LLC is Active on the DPF List; Apple Inc. is not on the DPF List; Apple's Privacy Policy (updated 30 July 2025): transfers of EEA, UK and Swiss data are "governed by Standard Contractual Clauses" `[settled — dataprivacyframework.gov List; apple.com/legal/privacy, verified 2026-11-19]` `[verify-pinpoint]` (each store's own mechanism) |

**Grader notes.** Because the **store is the merchant of record**, the app's Terms must reflect
that **the contract of sale + the 14-day withdrawal/refund handling sit with Apple/Google**, while
the publisher is the *app provider*. The PP should state the publisher receives **no payment-card data** — only
the post-purchase token/receipt via the store→RevenueCat path. This is also why Apple's **Licensed
Application EULA** minimum terms apply (the EULA is between user ↔ developer, not Apple).

---

## 10. Consolidated flow table (for the normalizer)

| SDK / service | Recipient | Key data | On/off-device | Lawful basis | Location | Transfer safeguard |
|---|---|---|---|---|---|---|
| Firebase Auth | Google (proc.) | email, UID, tokens, IP | off | 6(1)(b) | **US-only** | DPF + SCC |
| Cloud Firestore | Google (proc.) | profile, consent ts, Pro sessions, sub-mirror | **Pro off / FREE on-device** | 6(1)(b) | **EU `europe-west`** | none (EU) |
| Firebase Analytics | Google (proc. under the Ads DPT, while "Google products & services" sharing is off) | usage events, **app-instance ID** (iOS: IDFV), no AD_ID only with strip + flag (§3) `[verify]` | off | **6(1)(a) CONSENT (cookiewet)** | global/US | Alternative Transfer Solution if adopted, otherwise SCCs (Ads DPT §7.1); Google LLC DPF |
| Crashlytics | Google (proc.) | crash + device diag, install UUID/FID | off | 6(1)(f) **or** consent | **global (any GCP)** | DPF + SCC |
| Cloud Functions | Google (proc.) | IP, webhook payload, deletion ops | off (backend) | 6(1)(b) + 6(1)(c)/17 | EU `europe-west1` | DPF + SCC |
| Firebase Hosting | Google (proc.) | request IPs | off | 6(1)(f) | global CDN | DPF + SCC |
| RevenueCat | **RevenueCat Inc. (proc.)** | App User ID(=UID), receipts, sub status, device type/OS | off | 6(1)(b) | **US (AWS)** | **SCC via DPA** (no DPF named) |
| Google Sign-In | Google → Firebase Auth | email, profile, OAuth token | off | 6(1)(b) | global→US | DPF + SCC |
| Apple/Play billing | Apple / Google (controller) | payment, receipt | off | store's basis | store global | Google: DPF/SCC; Apple: SCCs (not on the DPF List) |

**Deliberate non-collection:** Google **Advertising ID (AD_ID/GAID)** + AdServices permissions are
**stripped** (`tools:node="remove"`); with `google_analytics_adid_collection_enabled=false` also set,
**no advertising ID is collected**, supporting the PP "no advertising identifier" and the Play
Data Safety "no advertising ID" answers. The rule is `[settled — Android 13 behaviour changes; Firebase
Analytics config (Android); Play Help 6048248, verified 2026-11-19; see §3]`; the worked example's answer
is `[verify — until its merged manifest shows both controls]`; below Android 13 the strip alone is
`[verify — not stated by Android]`.

---

## 11. Open items a human must confirm (verify flags)

1. **RevenueCat transfer safeguard** — answered 2026-11-19: the PP names the SCCs from the DPA
   (Decision 2021/914, Module 2) and how to obtain a copy, whatever the DPF status (RevenueCat is
   not on the DPF List, checked 2026-11-19; §7). Still to confirm: the DPA is accepted for the
   account. `[verify]`
2. **Analytics lawful basis under NL cookiewet** — answered 2026-11-19: opt-in consent, on
   Tw 11.7a(1), (3)(b) and ePrivacy Art 5(3) alone (§3; `ap-guidance.md` §3). Relying on the
   analytics exemption instead of consent: `[low-confidence — LEGAL REVIEW REQUIRED]`.
3. **Crashlytics lawful basis** — LI (6(1)(f)) vs. consent for crash telemetry under ePrivacy.
   `[low-confidence]`
4. **Exact lawful-basis article tags** for Auth/Firestore/Functions/Hosting/RC/Sign-In (substance is
   contract/LI; the `6(1)(b)`/`6(1)(f)` letter tags are reasoned, not source-confirmed). `[verify]`
5. **Analytics & Crashlytics exact data-location/region + retention** (separate Google Analytics
   terms, not on the Firebase Privacy page). `[verify]`
6. **Google Sign-In data inventory** (email/profile/token set) and the **transitive
   `USE_BIOMETRIC`/`USE_FINGERPRINT`** permission presence — confirm via an Exodus/MobSF APK manifest
   scan. `[verify]`
7. **Apple/Google billing controller-vs-processor status** and their transfer framework (Google LLC
   is Active on the DPF List; Apple Inc. is not on it, checked 2026-11-19). `[verify-pinpoint]`
8. **Firestore/Functions/Hosting EU-region transfer-safeguard pinpoint** (EU keeps data in-region;
   confirm no incidental US sub-processing under Google's DPF/SCC umbrella). `[verify-pinpoint]`
