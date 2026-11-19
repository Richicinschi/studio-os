# Google Play Data Safety — Reference (form spec + CSV schema)

Authoritative reference for encoding, verifying, and **emitting** the Google Play
**Data safety** form for a Dutch/EU mobile app. Worked applications use the **example
app** (`legal-guardrails.md` §8: Flutter breathing/mindfulness app; Dutch eenmanszaak;
GDPR/AVG; subscriptions sold through Apple/Google as merchants of record via RevenueCat;
Firebase backend in EU `europe-west`; no medical claims; free tier = on-device only,
paid tier = Firestore sync). Build the declaration for the app under review from its fact
sheet and data-surface scan; the §5 matrix is a worked pattern, not its answer.

**Primary sources (fetched and checked 2026-11-18 unless noted):**
- Google, Play Console Help 10787469 — *Provide information for Google Play's Data safety section*
  `https://support.google.com/googleplay/android-developer/answer/10787469` (with the sample CSV it links to)
- Android Publisher API v3 — `applications.dataSafety` (page last updated 2025-05-21)
  `https://developers.google.com/android-publisher/api-ref/rest/v3/applications/dataSafety`

**Scope note:** Every app published on Google Play must complete this form, including
apps on closed, open or production testing tracks. Apps active only on the **internal
testing** track are exempt. Apps that collect no user data still complete it and link a
privacy policy. The form output is shown to users as the public "Data safety" card on
the store listing. [settled — Help 10787469, verified 2026-11-18]

---

## 0. The two definitions that drive every answer

| Term | Definition | Consequence |
|---|---|---|
| **Collection** | "Transmitting data from your app off a user's device." Includes data sent by any **third-party library/SDK** in the app, and data from app-controlled webviews — *irrespective of whether it goes to you or to a third-party server*. | If a byte leaves the device, it is **collected** and must be declared. [settled — Help 10787469, verified 2026-11-18] |
| **Sharing** | "Transferring user data collected from your app to a third party." Includes server-to-server transfers, on-device transfers to other apps, and transfers via SDKs/webviews. | A separate, narrower axis than collection. **Service providers acting on your instructions are NOT "sharing."** [settled — Help 10787469, verified 2026-11-18] |

The two quoted definitions are Google's (Play Console Help 10787469, https://support.google.com/googleplay/android-developer/answer/10787469); the rest of the table is this suite's summary.

### Exceptions to "collection" (do NOT declare as collected)
- **On-device only** — accessed/processed but never transmitted off device. [settled — Help 10787469, verified 2026-11-18]
- **End-to-end encrypted** — data that only the sender and the recipient can read, not the developer and not anyone else. [settled — Help 10787469, verified 2026-11-18]
- **Ephemeral processing** — not an exception from the form: data processed ephemerally is still entered in the form response, but is not shown on the store listing; see §6. [settled — Help 10787469, verified 2026-11-18]

### Exceptions to "sharing" (do NOT declare as shared)
- **Service providers** — a third party that processes data for the developer, on the developer's instructions (i.e. a GDPR Art. 28 processor). [settled — Help 10787469, verified 2026-11-18]
- **Legal purposes** — transfer for specific legal purposes, such as in response to a legal obligation or government requests. [settled — Help 10787469, verified 2026-11-18]
- **User-initiated action or prominent disclosure + user consent** — a transfer on a specific user-initiated action where the user reasonably expects the data to be shared, or on a prominent in-app disclosure and consent that meets the User Data policy. [settled — Help 10787469, verified 2026-11-18]
- **Fully anonymized data** — not linkable to a user/device. [settled — Help 10787469, verified 2026-11-18]

> **Application of the SDK rule (worked: example app):** Firebase Analytics, Crashlytics, Firebase
> Auth/Firestore, Cloud Functions, and RevenueCat all transmit off-device → all count
> as **collection** and must be reflected in the form. Firebase/RevenueCat act as
> **processors on instructions** → treated as **service providers**, so they are
> generally **NOT "sharing"** (declare collected = TRUE, shared = FALSE) — provided a
> DPA/processor relationship is in place. Apple/Google as **merchants of record** for
> the subscription are a transfer to them as merchant, not as your processor; purchase
> handling is a user-initiated store transaction. Do **not** silently omit any SDK:
> an SDK present in the APK but absent from the form is an **omitted-disclosure**
> violation. [verify — app-specific characterization; confirm RevenueCat/Firebase (or the app's own processors') processor framing against current DPAs]

---

## 1. The 14 data categories and their data types (the full taxonomy)

Encode this verbatim — it is the closed enumeration the form presents. [settled — Help 10787469, verified 2026-11-18]

| # | Category | Data types (sub-types) |
|---|---|---|
| 1 | **Location** | Approximate location · Precise location |
| 2 | **Personal info** | Name · Email address · User IDs · Address · Phone number · Race and ethnicity · Political or religious beliefs · Sexual orientation · Other info |
| 3 | **Financial info** | User payment info · Purchase history · Credit score · Other financial info |
| 4 | **Health and fitness** | Health info · Fitness info |
| 5 | **Messages** | Emails · SMS or MMS · Other in-app messages |
| 6 | **Photos and videos** | Photos · Videos |
| 7 | **Audio files** | Voice or sound recordings · Music files · Other audio files |
| 8 | **Files and docs** | Files and docs |
| 9 | **Calendar** | Calendar events |
| 10 | **Contacts** | Contacts |
| 11 | **App activity** | App interactions · In-app search history · Installed apps · Other user-generated content · Other actions |
| 12 | **Web browsing** | Web browsing history |
| 13 | **App info and performance** | Crash logs · Diagnostics · Other app performance data |
| 14 | **Device or other IDs** | Device or other IDs |

**Android ID:** declare it under **Device or other IDs** (category 14) when it leaves the
device. Google defines the type as "Identifiers that relate to an individual device, browser
or app", with the examples IMEI number, MAC address, Widevine Device ID, Firebase
installation ID and advertising identifier. [settled — Help 10787469, verified 2026-11-18]
An "April 2025 reclassification" of Android ID is not on Help 10787469.
[verify — source not found 2026-11-18: not on Help 10787469 or its change log (latest entry 5 Dec 2023); a web search found no Google notice]

---

## 2. The per-data-type questions

For **each data type** you declare as collected/shared, the form asks: [settled — Help 10787469, verified 2026-11-18]

1. **Collected / Shared / Both?** — Is this data type collected, shared, or both?
2. **Processed ephemerally?** — Is the data only ever held in memory and retained no longer than needed to service the request in real time? (See §6.)
3. **Required or optional?** — must every user provide the data, or can users choose whether it is collected? (Required vs. user-can-choose / optional.)
4. **Collection purposes** — Why is it collected? *Select all that apply* from the closed list in §3.
5. **Sharing purposes** — Why is it shared? *Select all that apply* from the closed list in §3 (only if shared).

---

## 3. The closed list of 7 purposes

Identical list for **collection** and **sharing** purposes. Multi-select. [settled — Help 10787469, verified 2026-11-18]

| Purpose | Typical trigger (worked: example app) |
|---|---|
| **App functionality** | Auth (email/UID), Firestore sync (paid tier), subscription entitlement, account management plumbing |
| **Analytics** | Firebase Analytics — product-interaction / session events |
| **Developer communications** | Transactional/verification email (Firebase Auth custom sender) |
| **Advertising or marketing** | **Not used** — the example app runs no ads, strips AD_ID |
| **Fraud prevention, security, and compliance** | Crashlytics diagnostics for stability/abuse; security logging |
| **Personalization** | (Generally not used by the example app) |
| **Account management** | Account create / delete / restore; entitlement state |

> **Note for an app with no ads (the example app):** never select **Advertising or marketing**. Selecting it
> contradicts the AD_ID strip (`tools:node="remove"`) and the "no advertising ID"
> posture in the Privacy Policy. [verify — app-specific]

---

## 4. The two app-level security declarations (mandatory)

Asked once for the whole app, not per type. [settled — Help 10787469, verified 2026-11-18]

| Declaration | What the form asks (summary) | Answer (worked: example app) |
|---|---|---|
| **Encryption in transit** | Whether all user data the app collects is encrypted in transit (yes/no) | **YES** — all Firebase/RevenueCat traffic is HTTPS/TLS. [verify — confirm no plaintext egress via traffic capture] |
| **Deletion mechanism** | Whether users have a way to ask for their data to be deleted (yes/no) | **YES** — in-app DELETE flow (soft-delete + 30-day scheduled purge) **and** a public web deletion URL (e.g. `https://<your-domain>/<app>/delete-account`). [worked example — the example app's state; confirm the app's own] |

**Optional security badges** (not required; do not claim unless true): [settled — Help 10787469, verified 2026-11-18]
- **Independent security review** — third-party validation against **OWASP MASVS** via the **MASA** (App Defense Alliance) program. **Do not claim** it unless the app has passed one (the example app has not).
- **"Committed to follow the Play Families Policy"** badge — only for apps with children as a target audience that have reviewed their compliance with the Families policy.
- **UPI** badge — India Unified Payments Interface apps only.

> **Account-deletion linkage:** answering deletion = YES interacts with the separate
> **account & data deletion** requirement (Help 13327111): an account-creating app
> needs BOTH an in-app path to delete the account (Google accepts, as an alternative,
> a link inside the app to the web deletion resource) AND a functional web deletion link
> that names the app or developer as on the store listing, and deleting an account must
> delete the user data associated with it (some data may be kept for security, fraud
> prevention or regulatory compliance, and users must be told, for example in the privacy
> policy). The example app satisfies both; check the app under review for each. [settled — Help 13327111, verified 2026-11-18]

---

## 5. The recommended declaration matrix (worked for the example app; derive the app's own the same way)

Derive from actual data flows (Firebase Auth, Firestore, Analytics, Crashlytics,
Cloud Functions, RevenueCat). Reconcile this 1:1 with Privacy §3/§4, the Apple App
Privacy label, and the SDK/subprocessor inventory.

| Category → type | Collected? | Shared? | Source / SDK | Purpose(s) | Required/Optional | Ephemeral? |
|---|---|---|---|---|---|---|
| Personal info → **Email address** | YES | NO | Firebase Auth | App functionality, Account management, Developer communications | Required (for account) | No |
| Personal info → **User IDs** | YES | NO | Firebase Auth / RevenueCat (app_user_id = UID) | App functionality, Account management, Analytics | Required | No |
| Financial info → **Purchase history** | YES | NO | RevenueCat / Play Billing | App functionality, Account management | Optional (only if subscribing) | No |
| App activity → **App interactions** | YES | NO | Firebase Analytics | Analytics | Optional (opt-out toggle) | No |
| App info & performance → **Crash logs** | YES | NO | Crashlytics | Fraud prevention, security, and compliance | Optional (opt-out toggle) | No |
| App info & performance → **Diagnostics** | YES | NO | Crashlytics / Analytics | Fraud prevention, security, and compliance; Analytics | Optional | No |
| Device or other IDs → **Device or other IDs** | YES | NO | Firebase (installation/instance IDs) | Analytics; Fraud prevention, security, and compliance | Optional | No |

**Breathing-session data → declared under App activity, not Health & fitness, in this worked example.** [verify — see the trap note below: Google's Fitness info type covers "exercise or other physical activity", so whether synced breathing sessions belong there is for the reviewer]
- For **free** users, sessions are **on-device only** → **not collected** at all (no row). [worked example — the example app's state; confirm the app's own]
- For **paid-tier** users, sessions sync to Firestore. Map them to **App activity → Other actions** (or App interactions). [verify — exact App-activity sub-type is a judgment call]

> **OVER-DECLARATION TRAP (the #1 wellness-app pitfall):** Google defines the two types by
> the data, not by the API it comes from: **Health info** is "Information about a user's
> health, such as medical records or symptoms"; **Fitness info** is "Information about a
> user's fitness, such as exercise or other physical activity". [settled — Help 10787469, verified 2026-11-18]
> This suite's worked answer for the example app (no Health Connect, no fitness API):
> breathing logs are user-generated app activity, so Health and fitness stays unmarked `[verify]`.
> Marking it would (a) misrepresent the data, (b) likely pull the app into the **Health
> apps declaration** scrutiny, and (c) diverge from the Apple label and the Art. 9 GDPR
> analysis. An app that does read health or fitness data declares it. [verify — the Health
> Connect / fitness-API test is the suite's reading, not Google's; check synced breathing
> sessions against the Fitness info definition]
>
> **UNDER-DECLARATION TRAP:** Every off-device SDK counts. Forgetting Crashlytics
> diagnostics or RevenueCat purchase history is an omitted disclosure. Cross-check the
> merged manifest + the release APK (e.g. Exodus/MobSF) against this matrix. [verify — app-specific]

---

## 6. Ephemeral processing — the carve-out

Data **processed ephemerally** must still be **reported in the form**, but is **not
shown** in the public Data safety card as "collected." [settled — Help 10787469, verified 2026-11-18]

- **Definition:** "accessing and using it while the data is only stored in memory and
  retained for no longer than necessary to service the specific request in real-time."
  (Google, Play Console Help 10787469, https://support.google.com/googleplay/android-developer/answer/10787469)
  [settled — Help 10787469, verified 2026-11-18]
- **Qualifying example (Google's):** a weather app transmits location off-device to
  fetch current weather, uses it only in memory, and discards it once the request is
  served → transient use of location may be treated as ephemeral. [settled — Help 10787469, verified 2026-11-18]
- **Disqualifying example (Google's):** data used to build advertising or other user
  profiles **cannot** count as ephemeral; declare it as collected or shared.
  [settled — Help 10787469, verified 2026-11-18]

> **Worked (example app):** persisted Firestore sessions, Analytics events, and Crashlytics reports
> are **stored** beyond the request → **NOT ephemeral**. Mark ephemeral = No across the
> matrix in §5. [verify — app-specific]

---

## 7. The importable CSV schema (the deliverable artifact)

The Data safety form can be **exported to CSV** and **imported from CSV** in Play
Console (**App content → Data safety → Start**, then **Export to CSV** or **Import to CSV**
near the top right of the page). **Import overwrites** existing answers. The
Android Publisher API `applications.dataSafety` accepts the **same CSV contents**
programmatically (see §8). [settled — Help 10787469 + API doc, verified 2026-11-18]

**Five columns** (one row per response choice): [settled — Help 10787469 and its sample CSV (header row as below) + Android Publisher API doc, verified 2026-11-18]

| Column header | Meaning | Allowed values |
|---|---|---|
| **Question ID (machine readable)** | Stable machine ID for the question | Google-assigned opaque IDs (treat as fixed; obtain by exporting the current template) |
| **Response ID (machine readable)** | Stable machine ID for a specific answer choice within that question | Google-assigned opaque IDs (from the exported template) |
| **Response value** | Whether this choice is selected | `TRUE` / `FALSE` (or blank) |
| **Answer requirement** | Cardinality/required-ness of the question | `OPTIONAL` · `REQUIRED` · `MULTIPLE_CHOICE` · `SINGLE_CHOICE` · `MAYBE_REQUIRED` (required only when an earlier answer makes it so) |
| **Human-friendly question label** | Display text (for humans; not parsed) | Free text — the question as the form words it |

**Operating rules:**
- One row per response choice; set **Response value = TRUE** for selected choices,
  **FALSE** (or blank where the question is optional or multiple choice) otherwise. [settled — Help 10787469, verified 2026-11-18]
- **Do not invent Question/Response IDs.** They are Google-assigned and version with the
  form — always **export the current template first**, then edit `Response value` only,
  then re-import. [settled — derived from export/import workflow + API doc, verified 2026-11-18]
- Import **overwrites** the answers already in the form ("Answers already entered into your form will be overwritten when you import a CSV"); treat the CSV as the single source of truth. [settled — Help 10787469, verified 2026-11-18]

**CI / reference tooling:**
- `owenbean400/fastlane-plugin-google_data_safety` — `prompt_create_data_safety_csv`
  (interactive → CSV) + `upload_google_data_safety` (service-account upload). Confirms
  the same 5-column schema. [verify — third-party tool, schema corroborated but not primary]
- `Privado-Inc/privado` — static data-flow scanner that can emit a Data Safety report
  (Java/Python GA; limited Dart) to corroborate the declaration against code. [verify — third-party tool]

---

## 8. The `applications.dataSafety` API (programmatic submit)

[settled — Android Publisher API v3 doc, verified 2026-11-18]

```
POST https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{packageName}/dataSafety
```

| Element | Value |
|---|---|
| **HTTP method** | `POST` |
| **Path param** | `packageName` (string, required) — the app's package name, e.g. `com.example.app` |
| **Request body** | `{ "safetyLabels": string }` — the **contents of the Data Safety CSV file** |
| **Response** | Empty body on success |
| **OAuth scope** | `https://www.googleapis.com/auth/androidpublisher` |

> The API page does **not** itself enumerate the CSV column schema — it links out to
> the Help Center for the format and template. Use the §7 schema (from the export
> template) as the authoritative column spec. [settled — API doc, verified 2026-11-18]

---

## 9. Review checklist (PASS/FAIL gates)

Use to adjudicate the app's Data safety declaration (the items name the example app's SDKs; substitute the app's own). Severity: 🔴 blocker · 🟠 must-fix · 🟡 review.

1. **Hard condition — Health & fitness answer confirmed.** For an app with no Health Connect / fitness API,
   confirm whether Health info and Fitness info are collected or shared; a declaration is not by itself a
   defect. [verify — Google's types turn on the data, not the API; see §5 trap note]
2. 🔴 **Every off-device SDK is declared.** Scan merged manifest + release APK
   (Exodus/MobSF) and assert Firebase Auth/Firestore/Analytics, Crashlytics, Cloud
   Functions, RevenueCat each map to a declared category. No omitted disclosures. [verify]
3. 🔴 **Encryption in transit = YES** and matches reality (no plaintext egress). [verify]
4. 🔴 **Data deletion = YES**, with in-app path **and** a live public web deletion URL
   (the delete-account page loads and names `<app name>` / `<publisher>`). [verify-pinpoint — Help 13327111]
5. 🟠 **No "Advertising or marketing" purpose** anywhere (consistent with AD_ID strip
   and "no advertising ID" in Privacy §4). [verify]
6. 🟠 **Form ↔ Privacy Policy parity.** Every declared category/type appears in Privacy
   §3/§4; nothing in the policy's data inventory is missing from the form. [verify]
7. 🟠 **Form ↔ Apple App Privacy parity.** Three-way reconcile (form ⇄ Apple label ⇄
   policy); flag any divergence in category mapping (e.g. Email, User IDs, Purchase
   history, Crash, Diagnostics, Device IDs). [verify]
8. 🟠 **Device IDs declared** if Firebase installation/instance IDs leave the device; a missing row is a GAP, as in `legal-cross-store.md`
   (and Android ID, which fits the type's definition; see §1). [verify]
9. 🟡 **Required vs optional** matches the in-app opt-outs (Analytics/Crashlytics
   toggles → optional). [verify]
10. 🟡 **Ephemeral = No** for all persisted data (Firestore/Analytics/Crashlytics). [verify]
11. 🟡 **CSV emitted from the current exported template** (IDs not hand-authored);
    re-import overwrites cleanly. [verify]

---

## 10. Cross-references (adjacent Play gates — not this file's scope, but linked)

| Topic | Where | One-line gate |
|---|---|---|
| Account & data deletion | Help **13327111** | In-app path + public web deletion URL; delete-on-delete. [verify-pinpoint] |
| User Data policy (privacy URL) | Help **10144311** | Non-PDF, non-geofenced, non-editable, labelled, in-Console + in-app, entity-name match. [verify-pinpoint] |
| Health Content & Services | Help **16679511** | Wellness framing may need the Health apps declaration; "not a medical device" disclaimer in the store description. [verify-pinpoint] |
| AD_ID / manifest hygiene | Help **6048248** | AD_ID auto-merged by SDKs; strip via `tools:node="remove"` **and** set `google_analytics_adid_collection_enabled=false` (both controls, `sdk-data-map.md` §3); must match "no advertising ID" answer. [verify-pinpoint] |
| Target audience / Families | Help **9893335** | Declare "not targeted at children"; reconcile with 16+ age gate. [verify-pinpoint] |

---

### Open items for human confirmation
- The **"April 2025" Android-ID reclassification** date: not found on Help 10787469 on
  2026-11-18 (§1). The CSV import-overwrite behaviour and the Console menu path were
  confirmed on the page that day (§7).
- Whether synced breathing sessions fall under Google's **Fitness info** type (§5, §9 item 1).
- All **app-specific** mappings in §5 (esp. RevenueCat/Firebase **service-provider
  vs sharing** framing, and the App-activity sub-type for synced sessions) need
  confirmation against the current DPAs and the actual code/data flows.
