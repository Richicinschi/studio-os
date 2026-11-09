# App Privacy label — answer set (App Store Connect "App Privacy" questionnaire)

Fill-in deliverable for the Apple **App Privacy** "nutrition label" configured in App Store Connect
→ App Privacy. The label is **self-declared** and edits do **not** require a new build. It MUST be
consistent simultaneously with (a) the app's actual behaviour + every bundled SDK, (b) the Privacy
Policy (Review Guideline 5.1.1(i)), and (c) the merged `PrivacyInfo.xcprivacy`
`NSPrivacyCollectedDataTypes`. A mismatch is the most common rejection/enforcement trigger for §5.1.

Pre-filled for **Breathe** (override the App facts for portfolio apps #2/#3). Re-run
`legal-data-surface-scan` (iOS) + re-read `PrivacyInfo.xcprivacy` before every submit; the label
reflects the **default/maximal** collection state, not the user's opted-out state.

Source of truth: `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/apple-app-privacy.md` (§3
taxonomy, §6 Breathe answer table, §11 checklist) and
`app-legal-privacy-terms-store-review/skills/legal-guardrails/references/taxonomy/data-category-ontology.md` (Apple⇄Play⇄GDPR
crosswalk — map by *meaning*, never by category name).

---

## App facts (inputs — edit per app)

| Field | Value (Breathe default) |
|---|---|
| App | Breathe |
| Auth | Firebase Auth (email/password + Google Sign-In → UID) |
| Subscriptions | Apple as merchant of record + RevenueCat middleware (`app_user_id` = Firebase UID) |
| Telemetry | Firebase Analytics + Crashlytics (in-app opt-out; label = default state) |
| Pro sync | Firestore `users/{uid}/sessions` (off-device) |
| Free tier | on-device only (SharedPreferences) → **not "collected"** |
| Ads / tracking | none (Android `AD_ID` stripped); no ATT |
| HealthKit / Motion / location | none |

> "Collect" = transmitting data off-device retained longer than needed to service the request.
> On-device-only data (free-tier breathing history) is **not collected** → not disclosed. The same
> worldwide binary *can* collect Pro data → declare the Pro behaviour; do **not** under-declare on
> "most users are free."

## App-practice → Apple data-type quick map
*(adapted with attribution from rshankras/claude-code-apple-skills, MIT © 2025 Ravishankar)*

| App practice | Apple data types to declare |
|---|---|
| User accounts (email/Google sign-in) | Contact Info (Email; Name if persisted), Identifiers (User ID) |
| Analytics usage | Usage Data (Product Interaction) |
| Crash reporting | Diagnostics (Crash Data; Performance Data if shipped) |
| Subscriptions / IAP | Purchases (Purchase History) |
| Advertising | Identifiers (Device ID), Usage Data (Advertising Data) — **N/A for Breathe** |
| Location / Photos / Health | Location / Photos or Videos / Health & Fitness — **N/A for Breathe** |

---

## Per-type answer set (the four questions × data type)

Per type, answer: **Collected?** (Yes/No) · **Linked?** (Linked/Not Linked) · **Track?**
(Tracking/Not Tracking) · **Purpose(s)** (App Functionality / Analytics / Product Personalization /
Developer Advertising / Third-Party Advertising / Other). Breathe purposes are limited to **App
Functionality** and **Analytics** — never any advertising purpose.

| Apple category → sub-type | Collected? | Source / SDK | Linked? | Track? | Purpose(s) | Notes |
|---|---|---|---|---|---|---|
| Contact Info → Email Address | **Yes** | Firebase Auth | Linked | No | App Functionality | account credential |
| Contact Info → Name | _Yes only if persisted off-device_ | Google Sign-In | Linked | No | App Functionality | declare only if display name stored; else **No** |
| Identifiers → User ID | **Yes** | Firebase UID; RC `app_user_id` (=UID) | Linked | No | App Functionality, Analytics | account-level ID |
| Identifiers → Device ID | **No** | — | — | — | — | AD_ID stripped; no device/advertising ID |
| Purchases → Purchase History | **Yes** | RevenueCat / App Store status | Linked | No | App Functionality | subscription/entitlement state |
| Usage Data → Product Interaction | **Yes** | Firebase Analytics | Linked | No | Analytics | launches, screen views, taps |
| Usage Data → Advertising Data | **No** | — | — | — | — | no ads |
| Diagnostics → Crash Data | **Yes** | Crashlytics | _Linked vs Not-Linked — RESOLVE_ | No | App Functionality | **watch-list:** manifest currently `Linked=false`; if UID-synced, set **Linked** |
| Diagnostics → Performance Data | _Yes only if shipped_ | Firebase Performance | Linked | No | App Functionality | declare only if Performance Monitoring SDK present |
| User Content → Other User Content | **Yes (Pro)** | Firestore session sync | Linked | No | App Functionality | Pro breathing logs; alt-classify as Usage Data — keep PP consistent |
| Health & Fitness | **No** | — | — | — | — | **affirmatively Not Collected** (no HealthKit/Motion) |
| Sensitive Info | **No** | — | — | — | — | Not Collected (keep consistent with PP GDPR Art. 9 section) |
| Location (Precise / Coarse) | **No** | — | — | — | — | no location APIs |
| Contacts | **No** | — | — | — | — | no address-book access |
| Messages / Photos / Audio / Files / Calendar | **No** | — | — | — | — | ambient-sound playback only; nothing recorded/uploaded |
| Browsing History / Search History | **No** | — | — | — | — | no in-app search |
| Financial Info (Payment Info) | **No** | — | — | — | — | Apple/Google are merchant of record; app never sees card data |
| Surroundings / Body | **No** | — | — | — | — | not visionOS |

**"Data Used to Track You" section: EMPTY.** No data is combined with Third-Party Data for ads/
measurement and nothing goes to a data broker → no Tracking, **no ATT prompt**. If any future SDK
does cross-app ad attribution, this flips and `AppTrackingTransparency` becomes mandatory.

**Public buckets that result:**
- *Data Used to Track You* — (none)
- *Data Linked to You* — Email, User ID, Purchase History, Product Interaction, (Crash Data if Linked), (Name / Performance / Session content if declared)
- *Data Not Linked to You* — (Crash Data only if confirmed identifier-free)

---

## Three/four-way reconciliation gate (must pass for sign-off)

1. **Label ⇄ Privacy Policy** — every declared label type appears in the PP data inventory; every
   PP-disclosed collection has a matching label type; the PP **names** Google/Firebase, RevenueCat,
   and Apple with the 5.1.1(i)(2) equal-protection assurance (not "third parties").
2. **Label ⇄ `PrivacyInfo.xcprivacy`** — every `NSPrivacyCollectedDataTypes` entry maps to a declared
   label type with matching Linked/Tracking flags. (Breathe manifest currently declares: Email, Name,
   User ID, Product Interaction, Crash Data, Purchase History — confirm against this table; resolve
   the Crash-Data Linked flag.)
3. **Label ⇄ Play Data Safety** — same flows, consistent answers (Apple Linked/Not-Linked/Track maps
   loosely to Play collected/shared/purpose). Flag any divergence to `legal-cross-store`.
4. *(optional, code-faithful)* **Label ⇄ runtime** — egress shows no undeclared identifiers/domains;
   AD_ID strip confirmed; EU-region endpoints used.

## §11 verdict checklist (copy into the report; mark PASS/FAIL)

```
[ ] Every actually-collected (data-type, entity) flow has a matching label type        PASS/FAIL
[ ] Linked/Not-Linked correct per type (account-bound telemetry = Linked)              PASS/FAIL
[ ] Tracking section empty AND no ATT (no cross-app ad/data-broker flow)               PASS/FAIL
[ ] Purposes limited to App Functionality / Analytics (no advertising)                 PASS/FAIL
[ ] Health & Fitness, Sensitive Info, Location, Contacts, Device ID = NOT collected    PASS/FAIL
[ ] Purchases (Purchase History) + Diagnostics (Crash) declared                        PASS/FAIL
[ ] Third-party SDK collection (Firebase, RevenueCat) reflected in label               PASS/FAIL
[ ] Label ⇄ Privacy Policy data inventory consistent; PP names each processor          PASS/FAIL
[ ] Label ⇄ merged PrivacyInfo.xcprivacy NSPrivacyCollectedDataTypes consistent        PASS/FAIL
[ ] Label ⇄ Play Data Safety three-way consistent                                      PASS/FAIL
[ ] Optional-disclosure exemption only used where all 4 criteria hold (rarely)         PASS/FAIL
```

*Items a human should confirm:* session-log classification (User Content vs Usage Data), email vs
UserID double-count, whether Firebase Performance ships, whether a Google display name is persisted,
and the Crash-Data Linked flag. Tag each `[verify]`/`[verify-pinpoint]` until pinned.
