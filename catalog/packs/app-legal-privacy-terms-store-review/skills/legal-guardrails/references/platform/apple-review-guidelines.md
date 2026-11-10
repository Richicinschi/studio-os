# Apple App Store Review Guidelines — Legal-Document Gates

Reference for adjudicating Privacy Policy + Terms of Service clauses against the App Store
Review Guidelines that Apple's reviewers enforce. Scoped to the guidelines that *gate legal
documents* (privacy, account deletion, IAP/subscription disclosure, health claims). Worked
verdicts use the **example app** (`legal-guardrails.md` §8: Flutter breathing/mindfulness app;
Dutch eenmanszaak sole-controller publisher; auto-renewing subscriptions sold through Apple as
merchant of record via RevenueCat + Firebase `europe-west`; general-wellness, no medical claims,
no HealthKit). Adjudicate the app under review from its fact sheet and its actual build.

**Primary source:** App Store Review Guidelines — https://developer.apple.com/app-store/review/guidelines/
**Last verified against primary source:** 2026-06-06.

> Apple ships the Guidelines as a living document with no version numbers; section numbers are
> stable but wording is edited without notice. Re-fetch the primary URL before a hard sign-off.

---

## Citation tiers used in this file

| Tag | Meaning |
|---|---|
| `[settled — <source>, verified 2026-06-06]` | Confirmed verbatim against the primary Apple page fetched this run. |
| `[verify]` | Believed correct; not confirmed against primary source this run. |
| `[verify-pinpoint]` | Right substance; exact clause/date still to pin. |
| `[low-confidence]` | Novel / contested / fact-specific. |

---

## Quick gate list (PASS/FAIL summary)

Adjudicate the doc set against these. "Gate" = a reviewer-enforced condition the PP/ToS/paywall
must satisfy. "Worked verdict" is the example app's outcome, shown as a pattern; derive the app
under review's own verdict from its actual build + App Store Connect at sign-off.

| # | Guideline | Gate (what the docs/app must show) | Worked verdict (example app) |
|---|---|---|---|
| 1 | 5.1.1(i) | PP link present in **App Store Connect metadata** field **and** in-app (easily accessible). | PASS — in-app `/legal/*` routes ship; confirm ASC metadata field is populated. |
| 2 | 5.1.1(i) | PP enumerates **all** data collected, how, and every use. | PASS if PP inventory matches actual Firebase/RC/Crashlytics flows — cross-check. |
| 3 | 5.1.1(i) | PP confirms every **third party with data access** (analytics, SDKs, affiliates) gives **equal protection**. | VERIFY — PP must name Firebase/Google, RevenueCat, Crashlytics + equal-protection clause. |
| 4 | 5.1.1(i) | PP explains **retention/deletion** + **how to revoke consent / request deletion**. | PASS if present — the example app has soft-delete + 30-day purge cron; PP must describe it. |
| 5 | 5.1.1(v) | **In-app account deletion** exists (deactivation alone fails). | PASS — type-`DELETE` soft-delete → 30-day grace → hard purge. |
| 6 | 5.1.1(ii) | Explicit consent for data collection; **paid features not conditioned** on data access; withdraw-consent path exists. | VERIFY — the paid tier (Firestore sync) must not gate on analytics consent. |
| 7 | 5.1.2(i) | No share of personal data without permission; third parties (incl. third-party AI) disclosed. | PASS — no third-party AI in the example app; PP discloses processors. |
| 8 | 5.1.3 | Health-context data not used for ads/marketing/data-mining; no health data in iCloud. | N/A-PASS — no HealthKit, no iCloud health storage. |
| 9 | 3.1.1 | All feature unlocks via Apple IAP (no external unlock mechanism). | PASS — RevenueCat over StoreKit; Apple is merchant of record. |
| 10 | 3.1.2 | Paywall discloses **title, length, price/period, content per period, auto-renew terms, cancel/manage path**; functional **EULA + PP** links. | VERIFY — confirm paywall surfaces all six + both links. |
| 11 | 1.4.1 | No medical/diagnostic/treatment claims; "consult a doctor" reminder; general-wellness framing. | PASS — "supports / may help relax"; breathing-only disclaimer. |

---

## 5.1.1 — Data Collection and Storage (the central PP gate)

Guideline 5.1.1 is under **5. Privacy**. It is the primary reviewer hook for the Privacy Policy.

### 5.1.1(i) Privacy Policies — required content + placement
`[settled — App Store Review Guidelines 5.1.1(i), verified 2026-06-06]`

> "All apps must include a link to their privacy policy in the App Store Connect metadata field
> and within the app in an easily accessible manner."

The privacy policy must **clearly and explicitly**:

1. **Identify what data, if any, the app/service collects, how it collects that data, and all
   uses of that data.**
2. **Confirm that any third party** with whom the app shares user data — *analytics tools,
   advertising networks, third-party SDKs, and any parent/subsidiary/related entities with
   access* — **will provide the same or equal protection** of user data as stated in the PP and
   required by the Guidelines.
3. **Explain data retention/deletion policies and describe how a user can revoke consent and/or
   request deletion** of the user's data.

**Application (worked: example app):**
- **Placement (two links):** verify the ASC "Privacy Policy URL" metadata field is set
  (e.g. a Firebase Hosting page such as `https://<your-domain>/<app>/privacy`) **and** the in-app
  `/legal/privacy` route is reachable pre-auth. Both are mandatory; one alone fails.
- **Data inventory (clause 1):** PP must list — FirebaseAuth (email, UID → Identifiers /
  Contact Info), RevenueCat (purchase history → Purchases), Crashlytics (crash/performance →
  Diagnostics), Firebase Analytics (product interaction → Usage Data), Firestore (paid-tier session
  sync). Free tier = on-device only → PP must say session history is **not transmitted** for
  free users. For another stack, list each of the app's own SDKs the same way.
- **Equal-protection clause (clause 2):** PP must name each processor/subprocessor (Google/
  Firebase, RevenueCat, Apple) and assert equivalent protection. A bare "we use third parties"
  line fails this gate. Cross-reference the project's subprocessor register, if it keeps one.
- **Retention/deletion + revocation (clause 3):** PP must describe the 30-day soft-delete grace
  and hard-purge, plus how to withdraw analytics consent (the in-app opt-out) and how to request
  deletion (in-app delete flow). GDPR Arts. 13/17 satisfy this when present. `[verify]`

### 5.1.1(ii) Permission
`[settled — App Store Review Guidelines 5.1.1(ii), verified 2026-06-06]`

- Apps that collect user/usage data must **secure consent**, even for data anonymous at/after
  collection.
- **"Paid functionality must not be dependent on or require a user to grant access to this
  data."** → For an app with a paid tier (the example app: Firestore sync), the paid features must **not** be gated on granting analytics consent.
- Must provide an **easily accessible, understandable way to withdraw consent**.
- Purpose strings must clearly/completely describe data use.
- Apps relying on **GDPR legitimate interest** without consent must comply with **all** terms of
  that law. (Note: under NL Telecommunicatiewet 11.7a / AP guidance, Firebase Analytics is
  opt-in in the Netherlands — this is stricter than Apple and is the controlling rule for an app with NL users.
  See the NL/ePrivacy reference.) `[verify]`

### 5.1.1(iii) Data Minimization
`[settled — App Store Review Guidelines 5.1.1(iii), verified 2026-06-06]`

Request only data relevant to **core functionality**; collect/use only what's required. Prefer
out-of-process pickers / share sheets over full access to protected resources (Photos, Contacts).
**Worked (example app):** a breathing app should request near-zero device permissions; any permission prompt
(e.g. notifications for reminders) must map to a stated PP purpose.

### 5.1.1(iv) Access
`[settled — App Store Review Guidelines 5.1.1(iv), verified 2026-06-06]`

Respect permission settings; do not manipulate/trick/force consent to unnecessary access; do not
require unrelated permissions; provide alternatives when a user declines. Low relevance for an
app that asks for almost no permissions (the example app), but the "no dark-pattern consent" rule informs paywall + consent-checkbox UX review.

### 5.1.1(v) Account Sign-In / **Account Deletion** (mandatory)
`[settled — App Store Review Guidelines 5.1.1(v), verified 2026-06-06]`

> "If your app supports account creation, you must also offer account deletion within the app."

- Apps without significant account features should let people use them **without a login**.
- May not require personal info to function **except** when directly relevant to core
  functionality or required by law.
- Social-network credentials/tokens may not be stored off-device; must be able to revoke in-app.

**Effective dates:** Apple announced the in-app account-deletion requirement on **2022-06-30**,
with enforcement beginning **2023-01-31** (originally 2022-06-30, extended). `[verify-pinpoint]`

**Application (worked: example app) — PASS:** in-app delete flow (type `DELETE` → soft-delete sets
`deletionRequestedAt` → 30-day restore window → `purgeExpiredDeletions` cron hard-deletes
Firestore + Auth + RevenueCat). **Deactivation-only would FAIL.** A scheduled deletion that
defers final purge (e.g. to honor an active subscription term) is acceptable, but the user-facing
action must be *deletion*, not suspension, and the PP (5.1.1(i) clause 3) must describe the
deletion-request mechanism. `[verify]`

---

## 5.1.2 — Data Use and Sharing
`[settled — App Store Review Guidelines 5.1.2, verified 2026-06-06]`

| Sub | Rule | Relevance (worked: example app) |
|---|---|---|
| (i) | No use/transmit/share of personal data without permission; disclose all third-party sharing **including third-party AI**; obtain explicit permission. Tracking requires App Tracking Transparency (ATT). May not require system features (push, location, tracking) to access functionality or compensation. | No AI (hard project rule). No cross-app tracking → likely no ATT prompt required, but confirm SDKs aren't classified as tracking. |
| (ii) | Data collected for one purpose may not be repurposed without further consent. | PP purpose-limitation must mirror GDPR Art. 5(1)(b). |
| (iii) | No surreptitious profiling; may not re-identify "anonymized"/"aggregated" data. | Wellness analytics must stay aggregate. |
| (iv) | No contact databases from Contacts/Photos; no collecting which other apps are installed for analytics/ads. | N/A for an app that reads neither (the example app). |
| (v) | No unsolicited contact via Contacts/Photos data; no "Select All"/default-selected contacts. | N/A. |
| (vi) | Data from HomeKit, **HealthKit**, Clinical Health Records, MovementDisorder, ClassKit, depth/facial-mapping APIs **may not be used for marketing, advertising, or use-based data mining**, including by third parties. | N/A for an app that uses none of these APIs (the example app). |
| (vii) | Apple Pay data sharing limited to delivery/service improvement. | N/A. |

**Sanction language (quote-worthy for risk framing):** "Apps that share user data without user
consent or otherwise complying with data privacy laws may be removed from sale and may result in
your removal from the Apple Developer Program." `[settled — 5.1.2(i), verified 2026-06-06]`

---

## 5.1.3 — Health and Health Research
`[settled — App Store Review Guidelines 5.1.3, verified 2026-06-06]`

| Sub | Rule |
|---|---|
| (i) | Data gathered in the **health/fitness/medical-research context** (Clinical Health Records, HealthKit, Motion & Fitness, MovementDisorder APIs, or health-related human-subject research) **may not be used or disclosed to third parties for advertising, marketing, or use-based data mining** — only to improve health management, or for health research (with permission). Direct-benefit exemption (e.g. lower insurance premium) only if the benefit provider submits the app and data isn't shared. Must disclose the specific health data collected. |
| (ii) | Must not write false/inaccurate data into HealthKit; **may not store personal health information in iCloud.** |
| (iii) | Health-related human-subject research requires informed consent (parent/guardian for minors) covering nature/purpose/duration, procedures/risks/benefits, confidentiality + data-sharing, contact, withdrawal. |
| (iv) | Such research requires independent ethics-review-board approval; proof on request. |

**Application (worked: example app) — N/A-PASS:** the example app does **not** use HealthKit, Clinical Health Records,
Motion & Fitness, or any medical-research API, and stores no health data in iCloud. Breathing
session logs are **not** special-category health data here because there is no HealthKit/clinical
source — confirm the PP's Art. 9 GDPR section is consistent (i.e. it does not over-declare health
data). The 5.1.3 restrictions mostly don't bite; the operative health gate for such an app is **1.4.1**
(claim language), below. `[verify]`

---

## 3.1.1 — In-App Purchase
`[settled — App Store Review Guidelines 3.1.1, verified 2026-06-06]`

> "If you want to unlock features or functionality within your app … you must use in-app
> purchase. Apps may not use their own mechanisms to unlock content or functionality, such as
> license keys, augmented reality markers, QR codes, cryptocurrencies and cryptocurrency
> wallets, etc."

- All Pro-feature unlocking must go through **Apple IAP** (StoreKit); RevenueCat is permitted
  middleware *on top of* StoreKit, not a bypass. `[verify]`
- Purchased credits/currencies may not expire; restorable purchases need a **restore mechanism**
  (check the app surfaces "Restore Purchases"; the example app does — PASS).
- **Apple is the merchant of record** for IAP — the ToS must say cancellation/refunds run through
  the **Store**, not the developer. `[verify]`

**ToS/paywall gate:** the legal docs must state Apple (and Google, on Android) is the merchant of
record and that subscription management/cancellation happens in the user's Apple ID / Play account.

---

## 3.1.2 — Auto-Renewable Subscriptions (the paywall-disclosure gate)
`[settled — App Store Review Guidelines 3.1.2, verified 2026-06-06]`

Auto-renewable subscriptions are allowed in any category. Before asking a customer to subscribe,
the app must **clearly describe what the user gets for the price** and **clearly communicate the
requirements described in Schedule 2 of the Apple Developer Program License Agreement (ADPLA)**.

**Pre-purchase paywall must disclose (checklist):**

| # | Required disclosure | Check (worked: example app) |
|---|---|---|
| 1 | **Subscription title/name** | e.g. "`<app name>` Pro" |
| 2 | **Length of the subscription period** (billing cycle) | monthly / annual |
| 3 | **Price** per period (and per-unit price if relevant) | from RevenueCat offering |
| 4 | **Content/services provided** in each period | what Pro unlocks (Firestore sync, gated techniques) |
| 5 | **Auto-renew terms** — renews automatically until cancelled | must be stated on paywall |
| 6 | **Functional links to Terms of Use (EULA) + Privacy Policy** | both must be tappable on the paywall |

Plus: a **free trial** (if offered) must clearly disclose its **duration** and the **price after
trial**; the subscription must last **at least 7 days** and be available across all the user's
devices; must provide **ongoing value**; no bait-and-switch. `[settled — 3.1.2 / 3.1.2(c),
verified 2026-06-06]`

**Application (worked: example app):** confirm the paywall surfaces all six items + the dynamic trial-length
copy and the post-trial price. The unticked withdrawal/immediate-delivery checkbox
(`withdrawalConsentAt`) is an **EU consumer-law** mechanism (Directive 2011/83 Art. 16(m)), **not**
an Apple requirement — Apple does not mandate or prohibit it. Do not conflate the two: Apple 3.1.2
governs *disclosure*, the CRD governs the *14-day withdrawal waiver*. `[verify]`

> **Schedule 2 ADPLA is the binding source** for required subscription metadata; 3.1.2 points to
> it. If a custom EULA is shipped, also check Apple's **Minimum Terms of Developer's EULA** (10
> mandatory clauses) — that is a separate reference, not duplicated here. `[verify]`

---

## 1.4.1 — Medical / Physical Harm (the health-claim gate)
`[settled — App Store Review Guidelines 1.4.1, verified 2026-06-06]`

> "Medical apps that could provide inaccurate data or information, or that could be used for
> diagnosing or treating patients may be reviewed with greater scrutiny."

- Apps must **clearly disclose data and methodology** to support accuracy claims relating to
  health measurements; if accuracy/methodology **cannot be validated, Apple will reject** the app.
  (Example: claiming to take x-rays or measure blood pressure / body temperature / blood glucose /
  blood oxygen using only device sensors is **not permitted**.)
- Apps should **remind users to check with a doctor** in addition to using the app and before
  making medical decisions.
- If the app has **regulatory clearance**, submit a link to that documentation.

**Application (worked: example app) — PASS (firewall to maintain):**
- The example app makes **no health measurements** and **no diagnostic/treatment claims**, so the
  measurement-validation prong does not bite.
- Enforce one copy rule across **PP, ToS, store listing, and in-app text**: use
  "supports / may help relax"; **never** "treats / cures / diagnoses / prevents / clinically
  proven." This is the Apple-side mirror of the EU-MDR wellness carve-out and the FTC HBNR
  classification question.
- Keep the "general wellness, not medical advice — consult a doctor" disclaimer present (satisfies
  the doctor-reminder prong). `[verify]`

> 1.4.1 is the *claim-language* gate; the *data-handling* gate for any health-adjacent data is
> 5.1.3. For a wellness app with no health data sources (the example app), 1.4.1 is the live one and 5.1.3 is N/A.

---

## Consistency obligations that cause rejections (cross-doc adjudication)

These are not single-clause gates but reviewer cross-checks the legal docs must survive:

1. **App Privacy "nutrition label" ⇄ PP must reconcile.** The App Store Connect App Privacy
   declarations (the 14 data categories) must match what the PP says is collected. A mismatch is a
   common enforcement/rejection trigger. For the example app: declare Identifiers (User ID/Device ID),
   Contact Info (Email), Purchases (Purchase History), Usage Data (Product Interaction),
   Diagnostics (Crash/Performance); affirmatively mark **Health & Fitness = Not Collected** and
   **Sensitive Info = Not Collected**, and ensure the PP matches.
   `[settled — App Privacy Details + 5.1.1, verified 2026-06-06]`
2. **PrivacyInfo.xcprivacy manifest ⇄ PP/label.** The merged privacy manifest's
   `NSPrivacyCollectedDataTypes` must align with both the App Privacy label and the PP data
   inventory; each bundled "commonly used" SDK (FirebaseAuth/Crashlytics/Firestore/Core,
   GoogleSignIn, RevenueCat) must ship a signed manifest or **submission is blocked** (ITMS-91053
   missing declaration / ITMS-91061 missing signature). This is a build gate that feeds the
   doc-consistency check. `[verify-pinpoint]`
3. **Equal-protection clause coverage.** Every SDK/processor surfaced by the manifest/label must
   appear in the PP with the 5.1.1(i)(2) equal-protection assurance.

---

## eenmanszaak publisher notes for the reviewer (the example app's profile)

- **Sole controller, no DPO, no employees:** Apple does not require a DPO; GDPR Art. 37 likely
  doesn't either for this profile. The PP must still name the controller with a real contact —
  the `[KVK]`, `[BTW]`, and `[REGISTERED ADDRESS]` placeholders are a **hard blocker** for the
  developer-identity/complaint-contact obligations (relevant to a custom EULA's developer
  name+address clause and to 5.1.1(i)). `[verify]`
- **Merchant of record:** Apple (iOS) / Google (Android) are MoR; the developer is not the seller
  of the subscription for tax/refund purposes — keep ToS billing/cancellation/refund language
  pointing to the Store, not the publisher.
- **EU region (`europe-west`) + GDPR/AVG:** Apple's 5.1.1(ii) explicitly defers to GDPR; where NL
  law (Telecommunicatiewet 11.7a / AP GA4 finding) is stricter (opt-in analytics), the stricter
  rule controls — Apple compliance is necessary but not sufficient.

---

## Verify-flags (human confirmation recommended)

- Account-deletion **effective/enforcement dates** (announced 2022-06-30; enforcement
  2023-01-31). `[verify-pinpoint]`
- Whether the app triggers **App Tracking Transparency** at all (depends on SDK tracking
  classification). `[verify]`
- RevenueCat-as-StoreKit-middleware being squarely within 3.1.1 (no IAP bypass). `[verify]`
- PrivacyInfo.xcprivacy manifest coverage + signing for every bundled SDK; ITMS-91053/91061
  codes. `[verify-pinpoint]`
- PP retention/deletion + consent-revocation wording actually present and accurate vs. the shipped
  30-day soft-delete + opt-out toggle. `[verify]`
- Schedule 2 ADPLA exact required-metadata enumeration (paywall disclosure list derived from it).
  `[verify]`
- ToS merchant-of-record + Store-cancellation language present. `[verify]`
