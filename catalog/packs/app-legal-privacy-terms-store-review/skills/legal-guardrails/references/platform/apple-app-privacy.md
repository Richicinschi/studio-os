# Apple "App Privacy" Nutrition Label — Reference (Dutch eenmanszaak publisher)

Adjudication reference for the Apple App Store **App Privacy** disclosure (the "privacy nutrition label") configured in the App Store Connect privacy questionnaire. Use this to grade whether an app's declared label is (a) complete, (b) internally consistent, and (c) aligned with the Privacy Policy and actual SDK behaviour. Worked applications use one app, the worked example (`worked-example.md` §1); build the same answers for the app under review from its fact sheet and data-surface scan.

**Primary source:** Apple, *App Privacy Details on the App Store* — https://developer.apple.com/app-store/app-privacy-details/ (the page shows no last-updated date) [settled — Apple Developer, verified 2026-11-18]
**Closely-coupled sources** (separate reference files): App Store Review Guidelines 5.1.1 (privacy policy + account deletion), 3.1.2 (subscriptions), 1.4.1 (health claims); `PrivacyInfo.xcprivacy` privacy manifest + Required-Reason API regime; Google Play Data Safety (the Android counterpart). Cross-check the label against the manifest and the Play form for three-way divergence.

---

## 0. The core compliance proposition

The App Privacy label is **self-declared** by the developer in App Store Connect, and it MUST be consistent with three things simultaneously [settled — Apple, App Privacy Details: the answers must stay accurate and up to date, and the practices should follow the App Review Guidelines and all applicable laws; on publishing, App Store Connect has the developer agree the answers comply with both (App Store Connect Help, *Manage app privacy*), verified 2026-11-18]:

1. the **actual data behaviour** of the app and every third-party SDK it bundles;
2. the app's **Privacy Policy** (linked per Review Guideline 5.1.1(i)); and
3. (structurally) the merged **`PrivacyInfo.xcprivacy`** privacy manifest `NSPrivacyCollectedDataTypes`.

A mismatch is an enforcement/rejection risk. Apple can reject at review or pull the app post-publication for an inaccurate label. The label can be edited at any time **without** shipping a new build [settled — Apple, App Privacy Details: changing the answers needs no app update, verified 2026-11-18].

> **Adjudication rubric:** for every (data-type, recipient-entity) flow that the app actually performs, there must be (a) a matching declared data type on the label with correct linked/tracking/purpose flags, AND (b) a covering disclosure in the Privacy Policy that names the recipient entity. Use the PoliCheck 5-category grade per flow: **clear / vague / omitted / incorrect / ambiguous**. `omitted` and `incorrect` are FAIL.

---

## 1. Definition of "Collect" (the disclosure trigger)

Disclosure is required only for data the app **collects**, per Apple's narrow definition [settled — Apple, verified 2026-11-18]:

> "'Collect' refers to transmitting data off the device in a way that allows you and/or your third-party partners to access it for a period longer than what is necessary to service the transmitted request in real time."
> (Apple, App Privacy Details on the App Store, definition of "collect", https://developer.apple.com/app-store/app-privacy-details/)

Key consequences:
- **On-device-only data is NOT "collected"** and need not be disclosed. [settled — Apple, App Privacy Details, verified 2026-11-18]
- **Transient transmissions are NOT "collected"**: an auth token or IP address sent on a server call and not retained, or data sent then immediately discarded after servicing the request, is not disclosable. [settled — Apple, verified 2026-11-18]
- **Ongoing collection after an initial permission grant IS "collected"** and must be disclosed. [settled — Apple, App Privacy Details, verified 2026-11-18]

> **Application (worked example):** Free-tier session history is stored **on-device only** (SharedPreferences / local) → NOT "collected" → not disclosable for free users. Pro-tier history is **synced to Firestore** (off-device, retained) → IS "collected" → must be declared (as User Content / Usage Data per §6 mapping). The label must reflect the Pro behaviour because the same binary worldwide app build can collect it; do not under-declare on the theory that "most users are free."

---

## 2. The four questions answered per data type

For **each** data type the questionnaire asks four things [settled — Apple App Privacy Details (its Data collection, Data use, linked and Tracking sections; App Store Connect links this page for the questions, which sit behind sign-in), verified 2026-11-18]:

| # | Question | Answer space |
|---|---|---|
| 1 | Do you (or a third-party partner) **collect** this data type? | Yes / No |
| 2 | Is it **linked to the user's identity**? | Linked / Not Linked |
| 3 | Is it **used to track** the user? | Tracking / Not Tracking |
| 4 | For which **purpose(s)** is it collected? | one or more of the 6 purposes (§5) |

These resolve into the three public label buckets:
- **Data Used to Track You** — any type where Q3 = Tracking.
- **Data Linked to You** — any (non-tracking) type where Q2 = Linked.
- **Data Not Linked to You** — any type where Q2 = Not Linked and Q3 = Not Tracking.

---

## 3. The data-type taxonomy (15 categories + sub-types)

Category and sub-type names as Apple's questionnaire shows them, needed exactly to fill it in; the descriptions are this suite's short summaries, not Apple's text [settled — Apple App Privacy Details, verified 2026-11-18]:

| # | Category | Sub-types (Apple's names; this suite's summaries) |
|---|---|---|
| 1 | **Contact Info** | Name; Email Address (incl. hashed); Phone Number (incl. hashed); Physical Address; Other User Contact Info |
| 2 | **Health & Fitness** | Health (health and medical data, including but not limited to HealthKit / Clinical Health Records / Movement Disorder API / health-related human-subject research, or any other user-provided health or medical data); Fitness (fitness and exercise data, including but not limited to the Motion and Fitness API) |
| 3 | **Financial Info** | Payment Info (form of payment, card/bank account number); Credit Info (credit score); Other Financial Info (salary, income, assets, debts) |
| 4 | **Location** | Precise Location (lat/long ≥ 3 decimal places); Coarse Location (< 3 decimals; Approximate Location) |
| 5 | **Sensitive Info** | Racial/ethnic data, sexual orientation, pregnancy/childbirth, disability, religious/philosophical beliefs, trade-union membership, political opinion, genetic info, biometric data |
| 6 | **Contacts** | The user's contact lists (phone, address book, social graph) |
| 7 | **User Content** | Emails or Text Messages; Photos or Videos; Audio Data; Gameplay Content; Customer Support; Other User Content |
| 8 | **Browsing History** | Websites and other content viewed outside the app |
| 9 | **Search History** | In-app searches |
| 10 | **Identifiers** | User ID (screen name, handle, account ID, assigned user ID, customer number); Device ID (advertising identifier or other device-level ID) |
| 11 | **Purchases** | Purchase History (what the account or person bought, or tends to buy) |
| 12 | **Usage Data** | Product Interaction (app launches, taps, clicks, scrolling, views, saved place); Advertising Data (ads seen); Other Usage Data |
| 13 | **Diagnostics** | Crash Data (crash logs); Performance Data (launch time, hang rate, energy use); Other Diagnostic Data |
| 14 | **Surroundings** | Environment Scanning (mesh, planes, scene classification, image detection of surroundings — visionOS) |
| 15 | **Body** | Hands (hand structure/movements); Head (head movement) — visionOS |
| — | **Other Data** | Other Data Types — any not listed above |

> Note: the harvested notes count "14 categories"; the primary source as fetched 2026-06-06 and again 2026-11-18 enumerates **15** (Surroundings and Body are split, plus "Other Data"). Use the 15-category list above. [settled — Apple App Privacy Details, verified 2026-11-18]

---

## 4. Definitions of the three handling concepts

### 4.1 "Tracking" (Q3)

> "'Tracking' refers to linking data collected from your app about a particular end-user or device, such as a user ID, device ID, or profile, with Third-Party Data for targeted advertising or advertising measurement purposes, or sharing data collected from your app about a particular end-user or device with a data broker." [settled — Apple, verified 2026-11-18]
> (Apple, App Privacy Details on the App Store, definition of "tracking", https://developer.apple.com/app-store/app-privacy-details/)

**Third-Party Data**, in Apple's sense, is data about a user or device that came from apps, websites or offline properties the developer does not own. [settled — Apple, verified 2026-11-18]

**Counts as tracking** (even if the developer doesn't personally use it that way): placing a third-party SDK (e.g. a login SDK) that combines your app's user data with data from other developers' apps to target/measure advertising. [settled — Apple, verified 2026-11-18]

**NOT tracking** [settled — Apple, verified 2026-11-18]:
- Data linked **solely on the end-user's device** and not sent off-device in identifiable form.
- Data shared with a data broker that uses it **solely for fraud detection/prevention or security**.
- Data shared with a consumer reporting agency for creditworthiness reporting.

> Tracking (Q3 = Yes) also requires **App Tracking Transparency (ATT)** prompt + permission at runtime (Review Guideline 5.1.2 / ATT framework) — see the 5.1.x reference. If an app declares "Data Used to Track You" it must implement `AppTrackingTransparency`.

### 4.2 "Linked to the user's identity" (Q2)

Data is **Linked** if it is associated with the user's identity (account, device, or other details) by the developer and/or third-party partners. "Personal Information" / "Personal Data" as defined under applicable privacy laws is **considered linked** to the user. [settled — Apple, verified 2026-11-18]

To declare **Not Linked**, the de-identification must be done **before collection** (strip direct identifiers, or break linkage so it cannot be re-linked) **and** the developer must not afterwards attempt to re-link or tie it to other datasets that enable linkage. [settled — Apple, verified 2026-11-18]

> **Application (worked example):** Firebase Analytics / Crashlytics events tied to a Firebase UID and a signed-in account are **Linked** for Pro users. For free users, if analytics events are sent without an account-level identifier they may be **Not Linked** — but only if no persistent identifier ties them back; verify against the manifest/SDK config rather than assuming. The default safe answer for account-bound telemetry is **Linked**.

### 4.3 "Not Linked"

The inverse of §4.2 — data properly de-identified/anonymized per the criteria above. [settled — Apple, verified 2026-11-18]

---

## 5. The six data-use purposes (Q4)

| Purpose (Apple's name) | What it covers (this suite's summary) |
|---|---|
| **Third-Party Advertising** | Other companies' ads in the app, or data passed to whoever shows them |
| **Developer's Advertising or Marketing** | The developer's own ads or marketing messages, or data passed to whoever shows the developer's ads |
| **Analytics** | Studying how people use the app: which features work, what to build next, how big the audience is |
| **Product Personalization** | Tailoring what each user sees, such as recommendations |
| **App Functionality** | Running the app: sign-in, features, fraud and security, uptime, crash reduction, performance, support |
| **Other Purposes** | Anything not covered above |

[settled — Apple App Privacy Details, verified 2026-11-18]

Multiple purposes may apply to one data type. Example from Apple: an email used to authenticate and personalize → **App Functionality** + **Product Personalization**. [settled — Apple, verified 2026-11-18]

> **Application (worked example):** an app with **no advertising** (the worked example also strips the Android `AD_ID`) must NOT select Third-Party Advertising or Developer's Advertising/Marketing for any type. Valid purposes are limited to **App Functionality** (auth, crash-min, subscriptions), **Analytics** (Firebase Analytics), and arguably **Product Personalization** only if it personalizes content (an app that does not personalize content → leave unchecked unless a real feature uses it).

---

## 6. Per-category mapping (the worked answer table for the worked example; derive the app's own the same way)

Profile: no HealthKit, no ads, no location, no Sensitive Info, no Contacts. Auth = Firebase (email + Google sign-in → UID); subscriptions = Apple as merchant of record + RevenueCat middleware; telemetry = Firebase Analytics + Crashlytics; paid-tier sync = Firestore. Free = on-device only.

| Apple category / sub-type | Collected? | Source | Linked? | Track? | Purpose(s) | Notes |
|---|---|---|---|---|---|---|
| **Contact Info → Email Address** | **Yes** | Firebase Auth (email sign-up) | Linked | No | App Functionality | Email is account credential. [verify-pinpoint — confirm Apple wants email under Contact Info AND not double-counted] |
| **Contact Info → Name** | No (unless Google sign-in returns display name and you store it) | Google Sign-In | Linked | No | App Functionality | [verify] declare only if display name is actually persisted off-device |
| Health & Fitness | **No (Data Not Collected)** | — | — | — | — | No HealthKit/Motion API does not settle it: Apple's Health type also covers "any other user provided health or medical data". Bare session logs are not health or medical data, so Health = No `[settled on the definitions — App Privacy Details, verified 2026-11-19]`; whether they are Fitness ("exercise data") is the developer's call `[verify — see data-category-ontology.md §3]`. |
| Financial Info | **No** | — | — | — | — | Apple/Google are merchants of record; the app never sees card/bank data. |
| Location (Precise/Coarse) | **No** | — | — | — | — | No location APIs. |
| Sensitive Info | **No (Data Not Collected)** | — | — | — | — | Affirmatively not collected; keep consistent with GDPR Art. 9 section of the PP. |
| Contacts | **No** | — | — | — | — | No address-book access. |
| User Content → Other User Content | **Yes (Pro)** | Firestore session sync | Linked | No | App Functionality | Pro-tier session history synced off-device. [verify-pinpoint — User Content "Other" vs Usage Data classification for session logs] |
| Browsing History | **No** | — | — | — | — | |
| Search History | **No** | — | — | — | — | No in-app search. |
| **Identifiers → User ID** | **Yes** | Firebase UID; RevenueCat `app_user_id` (= UID) | Linked | No | App Functionality | The account-level ID. |
| **Identifiers → Device ID** | **Yes** (whenever Firebase Analytics ships enabled for any user) | Firebase Analytics (IDFV, app-instance ID); IDFA reads as zeros without ATT | Linked (via `setUserId`) | No | Analytics | **No** only if the iOS build sets `GOOGLE_ANALYTICS_IDFV_COLLECTION_ENABLED = NO`, drops Ad ID support, and no other SDK reads a device-level ID. The Android AD_ID strip says nothing about iOS. [settled — App Privacy Details; Firebase Analytics config (Apple platforms); Apple advertisingIdentifier docs, verified 2026-11-19] [verify — IDFV default inferred from Firebase's off-switch; RevenueCat default inferred from its docs] |
| **Purchases → Purchase History** | **Yes** | RevenueCat / App Store subscription status | Linked | No | App Functionality | Subscription/entitlement state. Apple Store also surfaces a "Purchase History" label — reconcile PP wording. |
| **Usage Data → Product Interaction** | **Yes** | Firebase Analytics | Linked (account-bound) | No | Analytics | App launches, screen views, taps. |
| Usage Data → Advertising Data | **No** | — | — | — | — | No ads. |
| **Diagnostics → Crash Data** | **Yes** | Crashlytics | Linked (UID identity sync) | No | App Functionality | Crash logs. |
| **Diagnostics → Performance Data** | **Yes (if enabled)** | Firebase Performance/Crashlytics | Linked | No | App Functionality | [verify] declare only if Performance Monitoring SDK is actually shipped. |
| Surroundings / Body | **No** | — | — | — | — | Not visionOS. |
| Other Data | **No** | — | — | — | — | |

> **Tracking column is uniformly "No"** for the worked example: no data is combined with Third-Party Data for ads, and nothing is shared with a data broker. An app in that position should have an **empty "Data Used to Track You"** section and **no ATT prompt**. If any SDK is later added that does cross-app ad attribution, this flips and ATT becomes mandatory. [settled — tracking definition, verified 2026-11-18]

> **Analytics opt-out interaction:** when an app lets users disable Analytics/Crashlytics in-app, the label reflects the *default* / maximal collection state, not the opted-out state. Declaring these types is correct even though users can turn them off; the PP must describe the opt-out.

---

## 7. Optional-disclosure exemption (narrow — rarely applies to a consumer app)

A data type need NOT be disclosed only if it meets **ALL** of the general criteria [settled — Apple, verified 2026-11-18]:

1. **Not used for tracking** (not linked with Third-Party Data for ads/measurement; not shared with a data broker);
2. **Not used for** Third-Party Advertising, Developer's Advertising/Marketing, or Other Purposes;
3. **Infrequent & optional** — collected only in cases NOT part of the app's primary functionality, and optional for the user; AND
4. **User-initiated & transparent** — provided by the user via the app UI, with clear visibility of what is collected, the user's name/account name prominently displayed alongside the data, and the user affirmatively chooses to provide it **each time**.

Apple's example: optional feedback forms or customer-service requests unrelated to the app's primary purpose. There are three further all-criteria exemptions: **Product Improvement Programs** (data used only to improve the app, collected only after an explicit in-app opt-in with two clear options, choice changeable at any time and without effect on features or price, not linked to the user's identity, not used for tracking, advertising, Product Personalization or Other Purposes), **regulated financial services**, and **health research (ICF + IRB/ethics-board approved)**. The last two do not apply to a consumer wellness app. [settled — Apple, verified 2026-11-18]

> **Application (worked example):** Routine analytics/crash/subscription/auth data is part of primary functionality and ongoing → **does not qualify** for the exemption. Only something like a one-off in-app feedback form (if added) might qualify — and only if all four criteria hold. Do not rely on this exemption to drop core telemetry from the label.

---

## 8. Third-party SDK / partner collection counts as YOURS

Apple's **third-party partners** are the analytics tools, ad networks, SDKs and other outside vendors whose code the developer added to the app, and the label must cover the data the developer **and** those partners collect. [settled — Apple, verified 2026-11-18]

Critical rule: an SDK that combines your app's user data with other apps' data for targeted advertising / ad measurement counts as **tracking by you, even if you don't use the SDK for that purpose**. [settled — Apple, verified 2026-11-18]

> **Application (worked example):** Firebase (Auth, Firestore, Analytics, Crashlytics, Cloud Functions, Hosting) and RevenueCat are all third-party partners whose collection must appear on the app's label and be named (entity-specifically) in the PP. Verify each against: (a) the merged `PrivacyInfo.xcprivacy` `NSPrivacyCollectedDataTypes` from the iOS pods, and (b) the named-subprocessor register / PP. A flow present in a pod manifest but absent from the label/PP is an **omitted disclosure** (FAIL). Firebase Analytics ships with `AD_ID` by default on Android — an app that strips it must confirm no advertising-ID flow sneaks back via an SDK update (the IDFV and app-instance ID are declared under Device ID, §6).

---

## 9. Label ↔ Policy ↔ Behaviour alignment (the enforcement gate)

- The developer is responsible for keeping the answers **accurate and current**; update on practice change (no build needed). [settled — Apple, verified 2026-11-18]
- Practices should follow the **App Review Guidelines and all applicable laws**; publishing the answers in App Store Connect means agreeing they comply with both. [settled — Apple, App Privacy Details + App Store Connect Help *Manage app privacy*, verified 2026-11-18]
- The label being inconsistent with the Privacy Policy or with observed SDK behaviour is the most common rejection/enforcement trigger for this section. [verify — Apple does not publish a single quotable "label must equal PP" sentence; the requirement is the conjunction of "accurate" + Guideline 5.1.1(i) which requires the PP to enumerate all data collected and all third parties]

> **Three-way cross-check (mandatory for SHIP):**
> 1. **Label vs PP** — every declared label data type appears in the PP data inventory; every PP-disclosed collection has a matching label type; the PP names each third-party processor with an equal-protection assurance (Guideline 5.1.1(i)).
> 2. **Label vs manifest** — every `NSPrivacyCollectedDataTypes` entry in the merged `PrivacyInfo.xcprivacy` maps to a declared label type.
> 3. **Label vs runtime** — (optional, code-faithful) MobSF/mitmproxy egress shows no undeclared identifiers/domains; AD_ID strip confirmed; EU-region endpoints used.
> 4. **Label vs Play Data Safety** — same flows, consistent answers (Apple "Linked/Not Linked/Track" maps loosely to Play "collected/shared/purpose"); flag divergence.

---

## 10. Common indie failure modes (adjudicator checklist)

| Failure | Why it fails | Status (worked example) |
|---|---|---|
| Declaring **Health & Fitness** because the app is "wellness" | The type turns on the data, not the app's category: health or medical data from any source, user-provided included (HealthKit/clinical/Motion are examples, "including but not limited to"); over-declaring still creates PP↔label drift and a false Art. 9 (GDPR) signal | Health: declare **NOT collected** for bare session logs; Fitness is the developer's call [verify — see the §6 Health row] |
| Forgetting **Purchases → Purchase History** for subscriptions | Subscription/entitlement state is collected via RC | Declare Yes / Linked / App Functionality |
| Forgetting **Diagnostics** (Crashlytics) | Crash logs are off-device + retained = collected | Declare Crash (+ Performance if shipped) |
| Marking analytics **Not Linked** when it is account-bound | UID/identity-synced telemetry is Linked | Declare Usage Data as **Linked** |
| Declaring **Tracking** without an ATT prompt | Tracking requires ATT implementation | No tracking, no ATT (correct for an app with no tracking) |
| Omitting a third-party SDK's collection | Partner collection = developer collection | Enumerate Firebase + RevenueCat |
| Answering **Device ID = No** because of the AD_ID strip | The Android strip says nothing about iOS; Firebase Analytics collects the IDFV and app-instance ID once enabled | Declare Device ID = **Yes**, Linked, Analytics; **No** only if neither the iOS app nor any SDK collects a device-level identifier (see the §6 Device ID row) |
| Label not updated after adding an SDK | Must keep accurate/up to date | Re-run cross-check on each dependency bump |
| PP says "third parties" generically | 5.1.1(i) needs named entities + equal-protection | PP must name Google/Firebase + RevenueCat + Apple |

---

## 11. Quick verdict template

```
APP PRIVACY LABEL — VERDICT CHECKLIST
[ ] Every actually-collected (data-type, entity) flow has a matching label type        PASS/FAIL
[ ] Linked/Not-Linked flag correct per type (account-bound telemetry = Linked)         PASS/FAIL
[ ] Tracking section empty AND no ATT (no cross-app ad/data-broker flow)                PASS/FAIL
[ ] Purposes limited to App Functionality / Analytics (no advertising)                  PASS/FAIL
[ ] Sensitive Info, Location, Contacts = NOT collected                                  PASS/FAIL
[ ] Device ID declared (Yes, Linked, Analytics) while Firebase Analytics can be enabled  PASS/FAIL
[ ] Health & Fitness: answer confirmed against the data (Fitness call) [verify]        CONFIRM
[ ] Purchases (Purchase History) + Diagnostics (Crash) declared                         PASS/FAIL
[ ] Third-party SDK collection (Firebase, RevenueCat) reflected in label                PASS/FAIL
[ ] Label ↔ Privacy Policy data inventory consistent; PP names each processor           PASS/FAIL
[ ] Label ↔ merged PrivacyInfo.xcprivacy NSPrivacyCollectedDataTypes consistent         PASS/FAIL
[ ] Label ↔ Play Data Safety three-way consistent                                       PASS/FAIL
[ ] Optional-disclosure exemption only used where all 4 criteria hold (rarely)          PASS/FAIL
```

---

## Attribution ledger (items a human should confirm)

- **[verify-pinpoint]** Classification of synced **session logs** under the Apple taxonomy — "User Content → Other User Content" vs "Usage Data → Other Usage Data". Apple's taxonomy is recipient-agnostic; either may be defensible. Pin to whichever the PP names and keep both consistent.
- **[verify-pinpoint]** Whether stored **email** belongs to "Contact Info → Email Address" only, or also counts as an "Identifiers → User ID" when used as the account key (avoid double-counting; declare under Contact Info, declare the UID under Identifiers).
- **[verify]** Whether the app ships Firebase **Performance Monitoring** (drives the "Diagnostics → Performance Data" Yes/No). Confirm against `pubspec.lock` / pods.
- **[verify]** Whether **display name** from Google Sign-In is persisted off-device (drives "Contact Info → Name").
- **[verify]** The exact phrasing of Apple's requirement that the label match the Privacy Policy — it is the conjunction of the duty to keep the answers accurate + Review Guideline 5.1.1(i), not a single verbatim sentence on the App Privacy Details page.
- **[settled]** Everything tagged `[settled — Apple, verified 2026-11-18]` is quoted/derived directly from https://developer.apple.com/app-store/app-privacy-details/ fetched this run.
