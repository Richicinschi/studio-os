# SDK → Data-Flow Map (Breathe stack)

Canonical SDK-to-data-flow reference for the **legal-data-surface-scan** and **legal-flow-grader**
subskills. Each SDK is mapped to: data collected · recipient entity · on/off-device · processing
purpose · GDPR lawful basis · transfer mechanism. Use this to (a) build the `(data-type,
recipient-entity, on/off-device)` flow set, then (b) grade each flow against the Privacy Policy /
Terms using the PoliCheck 5-category taxonomy (clear / vague / omitted / incorrect / ambiguous).

**App profile.** "Breathe" — Flutter breathing/mindfulness app. Publisher = Dutch **eenmanszaak**
(sole proprietorship; owner is the **sole data controller**; no employees; **no DPO**). EU/NL-first,
**GDPR/AVG** governed. Auto-renewing subscriptions sold **through Apple / Google** (merchants of
record) via **RevenueCat** middleware + **Firebase** backend (Auth, Firestore, Analytics,
Crashlytics, Cloud Functions, Hosting), Firebase resources provisioned in **EU region
`europe-west`** where the service supports location selection. No medical claims (general wellness:
"supports / may help relax"; never "treats / cures / diagnoses / prevents"). **Free tier = on-device
data only; Pro = Firestore sync.**

---

## Attribution-tier legend

| Tag | Meaning |
|---|---|
| `[settled — <source>, verified 2026-06-06]` | Confirmed against the primary source fetched this run |
| `[verify]` | Believed correct, not confirmed this run |
| `[verify-pinpoint]` | Right substance; exact article/clause/flag still to pin |
| `[low-confidence]` | Novel / contested / fact-specific |

Primary sources fetched this run: Firebase **Privacy & Security**
(`firebase.google.com/support/privacy`); RevenueCat **Privacy Policy** (`revenuecat.com/privacy`);
RevenueCat **CustomerInfo** docs (`revenuecat.com/docs/customers/customer-info`); Firebase **Analytics
data-collection config** (`firebase.google.com/docs/analytics/configure-data-collection`,
iOS-side only returned).

---

## 0. How to use this map (for the grader)

1. **Enumerate recipients, not just data types.** Disclosure consistency MUST be *entity-aware*: the
   PP must name each processor (Google/Firebase, RevenueCat Inc., Apple, Google Play), not merely
   "third parties." Naming each is also what satisfies **GDPR Art. 30 RoPA** and **Apple
   5.1.1(i)** equal-treatment expectations. `[settled — PoliCheck methodology (harvest §PoliCheck),
   verified 2026-06-06]`
2. **Lawful basis ≠ store category.** A flow can be `6(1)(b)` contract for the feature but still
   require **separate ePrivacy/cookiewet consent** for the *storing/reading* step (Analytics,
   Crashlytics). Track both columns.
3. **On-device flows are NOT "processing by a recipient."** Free-tier breathing history stored only
   in SharedPreferences/local Firestore-cache never reaches a recipient → it is *collection* in the
   GDPR sense only if it leaves the device. Grade it as "on-device, no external recipient."
4. **EU region claims must be flow-specific.** Some Google services are **global / US-only by
   architecture** regardless of your project's region selection (see §1, §3, §4). Do not let a
   blanket "Firebase data is in the EU" PP sentence stand — it is *incorrect* for Authentication and
   for Analytics/Crashlytics. `[settled — Firebase Privacy & Security, verified 2026-06-06]`

---

## 1. Firebase Authentication

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC / Google Ireland (Firebase) — **data processor** `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Data collected** | Email address, password (credential), phone numbers (n/a for Breathe), user agents, **IP addresses**; Firebase **user ID (UID)**, auth tokens / ID tokens `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **On/off-device** | **Off-device** |
| **Data location** | **US-only by architecture.** "Firebase Authentication service is run only from US data centers… processes data exclusively in the United States." Your `europe-west` selection does **not** apply to Auth. `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Retention** | Logged **IP addresses kept "a few weeks"**; other auth info retained until the customer deletes the user, then removed from live + backup within **180 days** `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Purpose** | Account creation, sign-in, session/token management, email verification, password reset, account deletion |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (performance of the service the user signed up for) `[verify]` |
| **Transfer mechanism** | EU→US transfer to Google: **EU-US Data Privacy Framework (DPF)** + Google's **SCCs** ("Firebase: Standard Contractual Clauses") under the **Firebase Data Processing and Security Terms** `[settled — Firebase Privacy & Security, verified 2026-06-06]` |

**Grader notes.** Because Auth is **US-only**, an EU-region claim in the PP is *incorrect* for this
flow — the PP must disclose a US transfer + name DPF/SCC. The Breathe UID is the join key that links
Firestore, RevenueCat (App User ID = UID) and Crashlytics; treat it as a pseudonymous identifier.

---

## 2. Cloud Firestore

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC / Google Ireland (Firebase) — **data processor** `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Data collected** | **Account profile** (`users/{uid}` doc: consent timestamps — `ageConfirmedAt`, `withdrawalConsentAt`, `termsVersion` — soft-delete flag); **Pro-tier session history** (`users/{uid}/sessions`); **subscription mirror** (`users/{uid}/private/subscription`, server-written). Customer-defined content; Firestore also processes Application IDs / package/bundle IDs. `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **On/off-device** | **Pro = off-device** (synced to Google). **FREE tier = ON-DEVICE ONLY** — breathing history lives in local storage / local Firestore cache and is **not** synced to a recipient. `[settled — app profile / CLAUDE.md, verified 2026-06-06]` |
| **Data location** | Firestore is a **global service with location selection** → Breathe provisions **`europe-west`**, so synced data is processed in the EU. `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Retention** | **Customer-controlled.** Breathe: live until user deletes; soft-delete → 30-day grace → `purgeExpiredDeletions` recursive delete. `[settled — Firebase Privacy & Security + app profile, verified 2026-06-06]` |
| **Purpose** | Persist account state + consent records; sync session history for paying users; mirror entitlement state |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (Pro sync is the paid feature; account record is necessary to provide the account); consent records evidence **Art. 7 / Art. 8 / Art. 16(m)** compliance, not a separate basis `[verify]` |
| **Transfer mechanism** | **None required for EU region** — data stays in EU (`europe-west`). DPF/SCC remain Google's fallback umbrella. `[verify-pinpoint]` |

**Grader notes.** The **free-vs-Pro split is the single most important PP-accuracy point** for
Breathe: the PP must state that free-user breathing history is **on-device only** and **not held on
our servers** (so "we cannot remotely purge it" is the honest retention answer for free users). Any
PP sentence implying server-side history for all users is *incorrect* for the free tier.

---

## 3. Firebase Analytics (Google Analytics for Firebase)

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC (Google Analytics for Firebase) — **separate service under separate terms**; acts as **processor** for Firebase-linked data `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Data collected** | App usage / interaction **events** (taxonomy per `ANALYTICS.md`), **pseudonymous app-instance ID** (per-installation identifier), device/OS attributes, IP-derived coarse geo. **Advertising ID (AD_ID/GAID): NOT collected by Breathe — deliberately stripped** (see below). `[settled — Firebase Analytics config + app profile, verified 2026-06-06]` |
| **On/off-device** | **Off-device** (events transmitted to Google) |
| **Data location** | Analytics is a **separate service subject to separate terms**; its processing is **not governed by your Firestore EU-region selection** — treat as global/US-capable. `[settled — Firebase Privacy & Security, verified 2026-06-06]` `[verify]` (exact region) |
| **Retention** | Per Google Analytics terms (not on the Firebase Privacy & Security page) `[verify]` |
| **Purpose** | Product analytics (feature usage, funnels, retention) — NOT advertising for Breathe |
| **GDPR lawful basis** | **CONSENT — Art. 6(1)(a)** required, *and* **ePrivacy / NL `Telecommunicatiewet` art. 11.7a (cookiewet)** consent for the storing/reading of the app-instance identifier on the device. **FLAG:** analytics may **not** rely on legitimate interest in NL; opt-in is the conservative position. `[verify-pinpoint]` (cookiewet art. 11.7a) `[low-confidence]` (LI-vs-consent is the project's open jurist question) |
| **Transfer mechanism** | Google **DPF + SCC** for any EU→US flow `[settled — Firebase Privacy & Security, verified 2026-06-06]` |

### AD_ID strip (load-bearing for the "no advertising ID" claim)

- `firebase_analytics` **silently adds `com.google.android.gms.permission.AD_ID`** and, by default,
  **collects the Android Advertising ID (GAID)** on Android. `[settled — Firebase Analytics
  data-collection docs, verified 2026-06-06]` (the config page confirms "by default, on Android the
  SDK collects the Advertising ID").
- Breathe **removes** the permission in the merged manifest via
  `<uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove"/>`
  (plus stripping AdServices), so **no Google Advertising ID is collected**. `[settled — app
  profile / CLAUDE.md + memory `reference_firebase_analytics_adid`, verified 2026-06-06]`
- The runtime opt-out toggle is `setAnalyticsCollectionEnabled(false)` (Breathe's
  `analyticsEnabledProvider`); iOS uses `FIREBASE_ANALYTICS_COLLECTION_ENABLED` /
  `FIREBASE_ANALYTICS_COLLECTION_DEACTIVATED` in Info.plist and removes `AdSupport.framework` to
  suppress IDFA. `[settled — Firebase Analytics config (iOS), verified 2026-06-06]`

**Grader checks.** (1) The PP "no advertising ID" answer is *consistent* only if the merged manifest
shows the AD_ID permission **absent** (verify with Exodus/MobSF). (2) `daily_reminder_received`-type
events must not be claimed in the PP if not actually fired. (3) Reminder time must be sent **coarse**
(`"changed"`), not the exact `HH:mm`, for the "not transmitted to our servers" claim to hold.

---

## 4. Firebase Crashlytics

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC (Crashlytics) — **data processor** `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Data collected** | Crash stack traces, **Crashlytics Installation UUIDs**, **Firebase installation IDs (FID)**, minidump data, device info (OS/model, RAM, disk space), thread data, exception details, binary image data, jailbreak status, screen rotation, proximity-sensor state `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **On/off-device** | **Off-device** (on crash/next launch) |
| **Data location** | **Global** — "could process data at any of the Google Cloud Platform locations" (NOT pinned to `europe-west`) `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Retention** | Crash stack traces + minidump + associated identifiers kept **90 days** before removal `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Purpose** | Stability / crash diagnostics |
| **GDPR lawful basis** | Two defensible reads: **Art. 6(1)(f) legitimate interest** (security/stability — common for crash reporting) **OR** opt-in **consent** if treated as non-essential telemetry. Breathe ships an **opt-out** toggle, which fits LI; the conservative NL/cookiewet read may push it to consent. **FLAG.** `[low-confidence]` |
| **Transfer mechanism** | Google **DPF + SCC** `[settled — Firebase Privacy & Security, verified 2026-06-06]` |

**Grader notes.** Crashlytics processes from **any GCP location** → the PP cannot claim
"Crashlytics data stays in the EU." Disclose global processing + DPF/SCC. Device diagnostics +
installation UUIDs are personal data (online identifiers, Art. 4(1)).

---

## 5. Cloud Functions for Firebase

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC (Cloud Functions) — **data processor** (runs Breathe's own server code) `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Data collected** | **IP addresses** for HTTP/event handling; whatever Breathe's functions touch: the **RevenueCat webhook** payload (App User ID, subscription event), soft-delete purge of Firestore + Auth + RC `[settled — Firebase Privacy & Security + app profile, verified 2026-06-06]` |
| **On/off-device** | **Off-device (server-side / backend)** |
| **Data location** | Global service infrastructure; Breathe deploys functions to **`europe-west1`** (e.g. `revenueCatWebhook`) `[settled — Firebase Privacy & Security + app profile, verified 2026-06-06]` |
| **Retention** | IP/processing data held **"temporarily, to provide the service"** `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Purpose** | Mirror RevenueCat subscription state to Firestore; scheduled hard-delete of expired soft-deleted accounts (`purgeExpiredDeletions`) |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (subscription mirror, account deletion) + **Art. 6(1)(c) / 17** for the erasure cron `[verify]` |
| **Transfer mechanism** | EU region for Breathe's functions; Google **DPF + SCC** umbrella `[verify-pinpoint]` |

**Grader notes.** Functions are the *only* component that touches all three identity systems
(Firebase UID, RC App User ID, store tokens) — its description anchors the "how subscription status
flows" disclosure. The RC **webhook secret** is the auth boundary; not a data flow but worth noting
for the security section.

---

## 6. Firebase Hosting

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC (Firebase Hosting) — **data processor** `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Data collected** | **IP addresses** from incoming requests (server logs) `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **On/off-device** | **Off-device** (web/server logs) |
| **Data location** | Global service (CDN) `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Retention** | Retains IP data for **"a few months"** `[settled — Firebase Privacy & Security, verified 2026-06-06]` |
| **Purpose** | Serve the public legal pages (`/breathe/privacy`, `/terms`, `/support`, `/delete-account`) on `richicinschi.com` |
| **GDPR lawful basis** | **Art. 6(1)(f) legitimate interest** (serving a public website + security logging) `[verify]` |
| **Transfer mechanism** | Google **DPF + SCC** umbrella `[verify-pinpoint]` |

**Grader notes.** Often omitted because it serves only static legal pages, but it **does log IPs** —
a complete RoPA should list it. The public **account-deletion URL** must be live here (Play Data
Safety requirement).

---

## 7. RevenueCat (purchases SDK + dashboard/API)

| Field | Value |
|---|---|
| **Recipient entity** | **RevenueCat, Inc.** — 1032 E Brandon Blvd #3003, Brandon, FL 33511, **United States** — **data processor** for end-user info `[settled — RevenueCat Privacy Policy, verified 2026-06-06]` |
| **Data collected** | **App User ID (= Firebase UID** for Breathe), **purchase tokens / receipts**, **subscription status / entitlements**, product identifiers, original + latest purchase dates, first-seen / install date, store/platform, original app version, **end-user technical info** (IP, OS, device), optional attribution metadata `[settled — RevenueCat Privacy Policy + CustomerInfo docs, verified 2026-06-06]` |
| **On/off-device** | **Off-device** (sent to RevenueCat servers; cached `CustomerInfo` locally) |
| **Data location** | **United States** — stored/processed on **AWS in the US**; "Your personal data may be stored and processed in any country where we have facilities," with explicit US storage `[settled — RevenueCat Privacy Policy, verified 2026-06-06]` |
| **Retention** | Per RevenueCat retention (not pinned this run); deleted on hard-delete via RC REST `DELETE` in `hardDeleteUser` `[verify]` |
| **Purpose** | Cross-store subscription validation, entitlement resolution, restore, billing-issue detection |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (delivering the paid subscription the user bought) `[verify]` |
| **Transfer mechanism** | **EU→US transfer.** RevenueCat offers a **DPA at `revenuecat.com/dpa`**; its public privacy policy **does NOT name DPF, Privacy Shield, or SCCs** as the transfer mechanism. **The DPA must be read/signed to confirm the actual basis (SCC expected).** **FLAG.** `[verify]` (DPF certification status) `[verify-pinpoint]` (SCC reliance via DPA) |

**Grader notes.**
- **App User ID MUST equal the Firebase UID** (RevenueCat recommends a "stable known user
  identifier," not `$RCAnonymousID`) — this is both a correctness invariant for Breathe and a
  disclosure point (the UID is shared with a US processor). `[settled — RevenueCat CustomerInfo docs
  + app profile, verified 2026-06-06]`
- RevenueCat is the **clearest US transfer in the stack** → the PP must (a) **name RevenueCat,
  Inc.** as a US processor, (b) state the transfer + safeguard. Confirm the safeguard from the
  signed DPA before sign-off. A bare "DPF/SCC" claim in the PP is **`[verify]`** until the DPA is
  checked.
- RevenueCat is **NOT** the merchant of record — Apple/Google are (see §9). RC only *reads* the
  store transaction; it never charges the user.

---

## 8. Google Sign-In (`google_sign_in` + GoogleSignIn iOS/Android SDK)

| Field | Value |
|---|---|
| **Recipient entity** | Google LLC (Google Identity / OAuth) — for *Breathe's* purposes the credential feeds **Firebase Auth** (§1) `[verify]` |
| **Data collected** | Google **account email + basic profile** (name, profile picture URL), **OAuth ID token / access token**; exchanged for a Firebase credential `[verify]` |
| **On/off-device** | **Off-device** (OAuth exchange with Google) |
| **Data location** | Google global (then Firebase Auth US, §1) `[verify]` |
| **Retention** | Token lifetime; resulting account follows Firebase Auth retention (§1) `[verify]` |
| **Purpose** | Federated sign-in option |
| **GDPR lawful basis** | **Art. 6(1)(b) contract** (sign-in chosen by the user) `[verify]` |
| **Transfer mechanism** | Google **DPF + SCC** `[verify-pinpoint]` |

**Biometric-permission note (important, low-disclosure-risk).** The GoogleSignIn Android SDK pulls
in **`USE_BIOMETRIC` / `USE_FINGERPRINT`** permissions **transitively** (for credential/passkey
flows). **Breathe collects, stores, and transmits NO biometric data** — these are platform
capability permissions, not a data flow. The PP should **not** declare a "biometric data" category;
if an Exodus/MobSF scan surfaces these permissions, grade as a **false-positive permission**, not an
omitted data flow. `[verify]` (transitive permission presence — confirm via APK manifest scan)

---

## 9. Apple App Store / Google Play billing (merchants of record)

| Field | Value |
|---|---|
| **Recipient entity** | **Apple Distribution International Ltd.** (App Store) / **Google Commerce / Google Payment** (Play) — each is the **merchant of record (seller)** and an **independent controller** for the payment transaction `[verify]` |
| **Data collected** | Payment instrument, billing data, store account ID, purchase/receipt — handled **entirely by the store**; Breathe and RevenueCat **never see the card/payment data** `[settled — app profile + merchant-of-record model, verified 2026-06-06]` `[verify-pinpoint]` (controller status) |
| **On/off-device** | **Off-device** (store-side) |
| **Data location** | Apple / Google global infrastructure `[verify]` |
| **Retention** | Store-controlled (tax/refund/fiscal retention by the store) `[verify]` |
| **Purpose** | Process the auto-renewing subscription charge, refunds, renewals, family sharing |
| **GDPR lawful basis** | The store's own basis (it is the seller); Breathe relies on **6(1)(b)** for *delivering* the entitlement once the store confirms purchase `[verify]` |
| **Transfer mechanism** | Apple/Google's own DPF/SCC framework (out of Breathe's control) `[verify-pinpoint]` |

**Grader notes.** Because the **store is the merchant of record**, Breathe's Terms must reflect
that **the contract of sale + the 14-day withdrawal/refund handling sit with Apple/Google**, while
Breathe is the *app provider*. The PP should state Breathe receives **no payment-card data** — only
the post-purchase token/receipt via the store→RevenueCat path. This is also why Apple's **Licensed
Application EULA** minimum terms apply (the EULA is between user ↔ developer, not Apple).

---

## 10. Consolidated flow table (for the normalizer)

| SDK / service | Recipient | Key data | On/off-device | Lawful basis | Location | Transfer safeguard |
|---|---|---|---|---|---|---|
| Firebase Auth | Google (proc.) | email, UID, tokens, IP | off | 6(1)(b) | **US-only** | DPF + SCC |
| Cloud Firestore | Google (proc.) | profile, consent ts, Pro sessions, sub-mirror | **Pro off / FREE on-device** | 6(1)(b) | **EU `europe-west`** | none (EU) |
| Firebase Analytics | Google (proc.) | usage events, **app-instance ID**, no AD_ID | off | **6(1)(a) CONSENT (cookiewet)** | global/US | DPF + SCC |
| Crashlytics | Google (proc.) | crash + device diag, install UUID/FID | off | 6(1)(f) **or** consent | **global (any GCP)** | DPF + SCC |
| Cloud Functions | Google (proc.) | IP, webhook payload, deletion ops | off (backend) | 6(1)(b) + 6(1)(c)/17 | EU `europe-west1` | DPF + SCC |
| Firebase Hosting | Google (proc.) | request IPs | off | 6(1)(f) | global CDN | DPF + SCC |
| RevenueCat | **RevenueCat Inc. (proc.)** | App User ID(=UID), receipts, sub status, IP/device | off | 6(1)(b) | **US (AWS)** | **DPA → SCC `[verify]`** |
| Google Sign-In | Google → Firebase Auth | email, profile, OAuth token | off | 6(1)(b) | global→US | DPF + SCC |
| Apple/Play billing | Apple / Google (controller) | payment, receipt | off | store's basis | store global | store DPF/SCC |

**Deliberate non-collection:** Google **Advertising ID (AD_ID/GAID)** + AdServices permission are
**stripped** (`tools:node="remove"`) → **no advertising ID is collected**, supporting the PP "no
advertising identifier" and the Play Data Safety "no advertising ID" answers. `[settled — app
profile / firebase_analytics AD_ID memory + Analytics config, verified 2026-06-06]`

---

## 11. Open items a human must confirm (verify flags)

1. **RevenueCat transfer safeguard** — RC's public privacy policy names **no DPF/SCC**; the actual
   basis lives in the **DPA at `revenuecat.com/dpa`** (SCC expected). Read/sign + confirm DPF
   certification status before the PP states the safeguard. `[verify]`
2. **Analytics lawful basis under NL cookiewet** — opt-in consent vs. legitimate interest is the
   project's open jurist question; conservative answer is **consent**. Pin `Telecommunicatiewet`
   art. 11.7a. `[verify-pinpoint]` / `[low-confidence]`
3. **Crashlytics lawful basis** — LI (6(1)(f)) vs. consent for crash telemetry under ePrivacy.
   `[low-confidence]`
4. **Exact lawful-basis article tags** for Auth/Firestore/Functions/Hosting/RC/Sign-In (substance is
   contract/LI; the `6(1)(b)`/`6(1)(f)` letter tags are reasoned, not source-confirmed). `[verify]`
5. **Analytics & Crashlytics exact data-location/region + retention** (separate Google Analytics
   terms, not on the Firebase Privacy page). `[verify]`
6. **Google Sign-In data inventory** (email/profile/token set) and the **transitive
   `USE_BIOMETRIC`/`USE_FINGERPRINT`** permission presence — confirm via an Exodus/MobSF APK manifest
   scan. `[verify]`
7. **Apple/Google billing controller-vs-processor status** and their transfer framework.
   `[verify-pinpoint]`
8. **Firestore/Functions/Hosting EU-region transfer-safeguard pinpoint** (EU keeps data in-region;
   confirm no incidental US sub-processing under Google's DPF/SCC umbrella). `[verify-pinpoint]`
