# Google Play Developer Policies — PP/ToS + Store-Config Gates

**Scope:** Google Play Developer Program Policy modules that gate the Privacy Policy, Terms of Service, and Play Console store configuration of a mobile app. Worked verdicts use the **example app** (`legal-guardrails.md` §8: Flutter breathing/mindfulness app; Dutch eenmanszaak sole-controller publisher; EU/NL-first; auto-renew subscriptions sold through Google Play as merchant of record via RevenueCat + Firebase backend in `europe-west`; general-wellness, no medical claims; free tier = on-device data only, paid tier = Firestore sync).

**How to use:** Each section is a discrete PASS/FAIL module. Adjudicate a clause/config against the rule rows, then record the verdict for the app under review (from its fact sheet and build; the worked column shows the example app's). Citation tiers:
- `[settled — <src>, verified <date>]` = confirmed against the primary Play Help page fetched on that date. A bare `[settled, verified <date>]` rests on the module's source line. Play Help pages show no last-updated date.
- `[verify]` / `[verify-pinpoint]` / `[low-confidence]` = see flags at the end.

**Companion reference (not duplicated here):** the 14-category / 7-purpose **Data Safety** taxonomy lives in the data-safety taxonomy reference; this file covers only how the policies above interact with the Data safety form, not the form's full schema.

---

## Module 1 — USER DATA policy (privacy-policy + disclosure gate)

Source: Google, Play Console Help **10144311** (User Data), https://support.google.com/googleplay/android-developer/answer/10144311 `[settled — support.google.com/.../answer/10144311, verified 2026-11-18]`

### 1A. Privacy-policy posting & URL hygiene

| # | Rule | Tier | Application (worked: example app) |
|---|------|------|---------------------|
| 1 | A privacy policy link MUST be in **the Play Console's privacy policy field** AND **inside the app** (a link or the policy text). | settled | Console field + in-app `/legal/privacy` route both required. App has both (in-app `MarkdownDocScreen`). PASS. |
| 2 | URL must be **active, publicly accessible, and non-geofenced** — **no PDFs**. | settled | The privacy URL (e.g. `https://<your-domain>/<app>/privacy`) must be HTML (the example app's is on Firebase Hosting), reachable globally. Verify it is NOT served only to NL IPs. |
| 3 | URL must be **non-editable** (not a doc/wiki that anyone can change). | settled | Static Hosting page — non-editable. PASS. |
| 4 | Must be **clearly labelled** as a privacy policy (e.g. "privacy policy" in the title). | settled | Page `<title>` / heading must read "Privacy Policy". Confirm the rendered HTML title, not just the in-app screen. |
| 5 | The **entity named in the Play store listing** (developer/company) must appear in the privacy policy, **or** the app must be named in the policy. | settled | Listing publisher = `<publisher>` (for a Dutch publisher, the KvK trade name). Policy "Who we are" block must name **`<publisher>`** (and ideally `<app name>`). Cross-check against any still-pending `[KVK]`/`[REGISTERED ADDRESS]` fills. |
| 6 | Must be served over **HTTPS** (secure transmission of user data is mandated). | verify-pinpoint | Hosting is HTTPS-only. PASS in practice. The page (2026-11-18) requires personal and sensitive user data to be transmitted "using modern cryptography (for example, over HTTPS)"; it sets no HTTPS rule for the policy URL itself. |

### 1B. Comprehensive disclosure (policy content)

The privacy policy MUST comprehensively cover `[settled, verified 2026-11-18]`:
1. **Developer contact information** and an inquiry mechanism.
2. **Types of personal and sensitive user data** the app **accesses, collects, uses, and shares**, AND **any parties with which** that data is shared (recipients named/categorized).
3. **Secure data handling** procedures.
4. **Data retention and deletion** policies.

Recipients to enumerate: every recipient of the app's data (the example app's: Google (Firebase Auth/Firestore/Analytics/Crashlytics/Cloud Functions/Hosting), **RevenueCat** (subscription middleware), Apple/Google (billing)). The policy's §3/§4 + recipient list must match the SDK inventory and the Data safety form.

### 1C. Prominent disclosure + affirmative consent (BEFORE sensitive-data collection)

Where the app's access, collection, use or sharing of **personal and sensitive user data** may not be within the user's reasonable expectation (for example, collection in the background), a prominent in-app disclosure + affirmative consent is required `[settled, verified 2026-11-18]`. (The page's Key Considerations list for personal and sensitive user data tells developers to get affirmative consent before collecting any personal or sensitive data. The Prominent Disclosure summary ties the disclosure to collection the user might not expect and puts it before any permission request or consent. The page says its summaries and Key Considerations are overviews and the full policy, which sets the condition above, takes precedence.)

| Requirement | Rule (this suite's summary) |
|---|---|
| Location | Inside the app, not only in the store description or on a website, and not only in the privacy policy or terms of service. |
| Visibility | Shown during normal use; the user must not have to open a menu or settings to find it. |
| Scoping | Not bundled with disclosures that have nothing to do with collecting personal and sensitive user data. |
| No expiring prompts | Auto-dismissing or expiring messages may not be used to obtain consent. |
| Action | Consent needs an active step by the user, such as a tap to accept or a ticked box. |
| No implied consent | Navigating away from the disclosure (tapping away, back, home) never counts as consent. |
| Timing | The disclosure comes immediately before the consent or runtime-permission request, and the user consents **before** the app starts to collect or access the data. |

**Defined term — "personal and sensitive user data":** includes, but is not limited to, PII, financial and payment info, authentication info, phonebook, contacts, device location, SMS and call-related data, **health data**, Health Connect data, inventory of other apps on the device, microphone, camera, and other sensitive device or usage data. `[settled, verified 2026-11-18]`

**Application (worked: example app):** the example app collects email + auth (Firebase Auth) and analytics/crash diagnostics. The sign-up flow already carries an explicit consent checkbox + privacy/terms acceptance (affirmative tick). Analytics/Crashlytics have an in-app opt-out. Free-tier breathing data is on-device only (not "collected" = not leaving device). PASS, provided the consent tick precedes any account-creation network write. **Do not over-classify breathing sessions as health data**: the suite's answer is App activity, not Health & fitness, but Google's Health and Fitness types turn on the data, not on Health Connect access, so confirm it `[verify]`.

### 1D. Data minimization, no-sale, Data-safety consistency

| # | Rule | Tier | Worked (example app) |
|---|------|------|---------|
| 1 | **Data minimization** — collect/use only what's needed for current features. | settled | Only auth + diagnostics. PASS. |
| 2 | **No sale** of personal/sensitive user data ("sale" = exchange/transfer to a third party for monetary consideration). | settled | No data sale; ads disabled; AD_ID stripped. PASS. |
| 3 | The **Data safety section** must be completed clearly and accurately for every app, and **where relevant must be consistent with the privacy policy disclosures**. | settled | Data safety form answers (categories, encrypted-in-transit = yes, deletion = yes) must mirror Privacy §3/§4. Reconcile both before submit. |

**FAIL triggers:** PDF policy URL · geofenced/editable URL · policy entity ≠ listing entity · missing recipient list · no in-app prominent disclosure before sensitive collection · Data safety form contradicts the policy · any data-sale.

---

## Module 2 — ACCOUNT & DATA DELETION

Source: Google, Play Console Help **13327111** (Account deletion requirements), https://support.google.com/googleplay/android-developer/answer/13327111 `[settled — .../answer/13327111, verified 2026-11-18]`

### 2A. Scope

Applies whenever the app **lets users create an account from within the app** — **including apps that direct users to account-creation flows outside the app**, and even if some features work without an account. `[settled, verified 2026-11-18]`
**Exemptions:** permanently private apps and enterprise device-management apps; accounts created and operated offline are not app accounts. `[settled — .../answer/13327111 FAQ, verified 2026-11-18]`

Any app that creates accounts is **in scope** (the example app creates Firebase Auth accounts).

### 2B. Dual-path requirement (BOTH mandatory)

| Path | Rule (summary) | Worked (example app) |
|------|-----------------|---------|
| In-app | A path inside the app to delete the account and its data. | Settings → Account → type-`DELETE` soft-delete flow. PASS (discoverable in account settings). |
| Web | A web page where users can ask for the account and its data to be deleted (it serves users who have uninstalled the app). | The app's public deletion URL (e.g. `https://<your-domain>/<app>/delete-account`). Verify it loads + describes the request path. |

### 2C. Web-resource standards

- **Functional:** the page loads without errors.
- **Relevant:** the way to request deletion is prominent and easy to find.
- **Identified:** names the app or the developer exactly as the store listing does → page must name **`<app name>` / `<publisher>`**.
- Acceptable ways to submit the request: a deletion link, a support email address, or a web form.

### 2D. Deletion obligation + retention exceptions

- Deleting an account means deleting **the user data tied to that account** — including personal data, financial info, authentication details, location, health data, and other sensitive usage data **listed in your Data safety section**. `[settled, verified 2026-11-18]`
- Data may be kept only where **a legitimate reason** requires it (security, preventing fraud, complying with regulation), and the developer **must tell users clearly what it keeps**, for example in the privacy policy. `[settled, verified 2026-11-18]`

**Mapping (worked: example app):** 30-day soft-delete grace → a scheduled purge job hard-purges Firestore + Auth + RevenueCat. The Privacy retention clause must describe the app's grace period + the security/legal retention basis so the policy language matches the actual purge. PASS if the Privacy retention wording matches the purge job.

### 2E. Data-safety form connection

Must answer the **Data deletion questions** in the Data safety form (App content page). Responses affect store-listing visibility. `[settled, verified 2026-11-18]` Set **"users can request deletion" = yes**; reconcile with 2B/2D.

**FAIL triggers:** web URL missing / 404 / does not name app/developer / no visible request path · account deletion that leaves orphaned Firestore or RevenueCat data · undisclosed retention · Data safety deletion answer = no while in-app deletion exists.

---

## Module 3 — HEALTH CONTENT & SERVICES

Source: Google, Play Console Help **16679511** (Health content and services), https://support.google.com/googleplay/android-developer/answer/16679511 `[settled — .../answer/16679511, verified 2026-11-18]`

### 3A. Scope (a wellness app is in scope by framing)

Covers any app with **health-related features or information**, or that uses health data for non-health features — **even when health is a side feature**, not the app's main purpose. `[settled, verified 2026-11-18]`
→ A mindfulness/breathing app falls in scope **by framing alone** even without Health Connect access.

### 3B. Health apps declaration form — DECISION (do not silently skip)

**"All developers must complete the Health apps declaration form"** (Google, Play Console Help 16679511, https://support.google.com/googleplay/android-developer/answer/16679511), on the App content page in Play Console. `[settled, verified 2026-11-18]`

**Adjudication (worked: example app):** the wording is written broadly ("all developers"); an app with mindfulness/relaxation framing, like the example app, falls within the health-related scope of 3A. **Decision: complete the Health apps declaration form** (do not assume exemption). Document the reasoning in the review rather than skipping. `[verify]` — whether a purely on-device, no-health-data wellness app is strictly *required* to file vs. *eligible* to attest is a judgment; the conservative, defensible call is to file. Flag for the reviewer.

### 3C. Prohibited claims (cross-check store listing + ToS + PP + About + in-app copy)

Prohibited `[settled, verified 2026-11-18]`:
- **False/misleading** health/medical functionality, or functionality that could cause harm.
- Claims that **contradict existing medical consensus** or can cause harm.
- (Examples cited: vaccine-DNA misinformation; advocacy of harmful/unapproved treatments.)
- Implicitly: no **diagnose / treat / cure / prevent** disease claims (the mandatory disclaimer's negation, see 3D).

**Wellness-app guardrail:** use **"supports" / "may help relax"**; NEVER "treats / cures / diagnoses / prevents." Scan the **Play store description**, ToS, Privacy, About, and in-app technique copy for the prohibited verbs.

### 3D. Mandatory disclaimer (store description)

Health and medical apps that are not regulated medical devices must state in the app description that the app is **"not a medical device and does not diagnose, treat, cure, or prevent any medical condition"** (Google, Play Console Help 16679511, https://support.google.com/googleplay/android-developer/answer/16679511), and apps must also remind users to consult a healthcare professional for medical advice, diagnosis or treatment (the page does not say where). `[settled, verified 2026-11-18]`

**Application:** the disclaimer must appear in the **Play store listing description itself** (not only the in-app About). Confirm both placements. If the app already has a long in-app health disclaimer (the example app does), add/confirm the condensed version in the Play description.

### 3E. Health-data disclosure, permissions, minimization

- Privacy policy: a link in the Play Console field, and a link or the text inside the app (mirrors Module 1). `[settled, verified 2026-11-18]`
- **Minimization:** request no permission the app's core health function does not need, and remove unused ones. `[settled, verified 2026-11-18]`

**Worked (example app):** requests no health permissions, no Health Connect, no precise location. Verify the merged manifest holds no leftover sensitive permissions (ties to Module 6).

**FAIL triggers:** any diagnose/treat/cure/prevent verb · missing "not a medical device / consult a professional" disclaimer in the **store description** · Health apps declaration form not filed without documented reasoning · unused sensitive permission present.

---

## Module 4 — FAMILIES / TARGET-AUDIENCE DECLARATION

Source: Google, Play Console Help **9893335** (Families / Designed for Families), https://support.google.com/googleplay/android-developer/answer/9893335 `[settled — .../answer/9893335, verified 2026-11-18]`

### 4A. Mandatory declaration

Every app must declare its **target audience prior to publishing**, selecting from the provided age groups. `[settled, verified 2026-11-18]`

**Decision for an adult-facing app (the example app): declare NOT primarily child-directed (adult/16+),** consistent with the in-app **16+ self-attestation age gate** (GDPR Art. 8 alignment) and the IARC age rating. Document the reconciliation.

### 4B. Obligations that attach ONLY if child-directed (an adult-facing app avoids them by declaring 16+)

If targeted to children `[settled, verified 2026-11-18]`:
- Comply with **COPPA** (US) and **GDPR** (EU) and applicable laws.
- Apps that **solely target children must NOT transmit** AAID/advertising ID, SIM Serial, Build Serial, BSSID, MAC, SSID, IMEI, IMSI.
- Apps that **solely target children may NOT request location permission** or collect/transmit precise location.
- Ads must use **Google Play Families Self-Certified Ads SDKs**; no interest-based ads / remarketing.
- Must not contain APIs/SDKs not approved for child-directed services.
- **Mixed-audience** apps must implement a **neutral age screen** to gate child protections.

**Application (worked: example app):** by declaring not-primarily-child-directed, these heavy obligations do not attach — but the declaration MUST stay consistent with: (a) the 16+ in-app gate, (b) the Privacy Policy's 16+ statement, (c) the IARC rating (Module 7). A contradiction (e.g. declaring child-directed while the policy says 16+) is a FAIL. Note: the example app strips AD_ID anyway (Module 6), so it would not transmit the advertising ID regardless.

**FAIL triggers:** target-audience section incomplete · declaration inconsistent with the 16+ gate / Privacy 16+ clause / IARC rating.

---

## Module 5 — SUBSCRIPTIONS / BILLING DISCLOSURE

Source: Google, Play Console Help **9900533** (Subscriptions), https://support.google.com/googleplay/android-developer/answer/9900533 `[settled — .../answer/9900533, verified 2026-11-18]`

### 5A. Required disclosures (developer-controlled copy — must appear in paywall + ToS)

Developers must clearly disclose `[settled, verified 2026-11-18]`:
- **Cost** of the subscription and **billing-cycle frequency**.
- That it **renews and charges automatically** (auto-renew).
- Whether **a subscription is required** to use the app.
- **Any other material information** about the subscription.
- **Free-trial terms:** how long the trial lasts, its price, and what it gives access to + **how and when it turns into a paid subscription** + **what the paid subscription then costs** + **how to cancel before it converts**.

### 5B. Cancellation, management, refunds (Google = merchant of record)

- Must say clearly how to manage or cancel, and give **an easy-to-use online way to cancel** in the app; in account settings (or equivalent) this is met by **a link to Google Play's Subscription Center** and/or direct access to the developer's own cancellation process. `[settled, verified 2026-11-18]`
- Refund: on cancellation, **no refund for the current billing period**, but the user keeps the subscription content until that period ends. Some jurisdictions get prorated refunds per applicable law. `[settled, verified 2026-11-18]`
- Developers may offer a **more flexible refund policy** directly, but must notify users of changes. `[settled, verified 2026-11-18]`
- **Charge timing — up to 24h before period start:** `[verify]` (standard Play billing rule; not surfaced verbatim on this page this run — confirm against Play Billing docs).

### 5C. ToS module (worked: example app)

The subscription clause must state: price + cycle + **auto-renew** + **trial-end charge** + **cancel via Google Play (Subscription Center)**, and route **refunds/cancellation to Google Play** as merchant of record (Apple parallel = App Store / Apple EULA). RevenueCat is internal middleware — **not** named as the merchant of record to users.

**Cross-regime check:** reconcile Play's "no current-period refund" with the **EU 14-day right of withdrawal** the app implements (in the example app: an unticked paywall checkbox + `withdrawalConsentAt` capturing the immediate-performance waiver). The two regimes coexist: EU withdrawal/waiver governs the consumer-law statutory right; Google's refund mechanics govern the store transaction. The ToS must not state the Play refund rule in a way that **denies** the EU statutory withdrawal right.

**FAIL triggers:** paywall omits auto-renew / trial-end charge / cancel path · ToS names RevenueCat (not Google) as merchant of record · refund clause contradicts EU withdrawal rights.

---

## Module 6 — AD_ID + PERMISSION HYGIENE (code/manifest gate)

Source: Google, Play Console Help **6048248** (Advertising ID), https://support.google.com/googleplay/android-developer/answer/6048248 `[settled (core)/verify (notes-only) — .../answer/6048248, verified 2026-11-18]`

| # | Rule | Tier | Worked (example app) |
|---|------|------|---------|
| 1 | Apps **targeting Android 13+ (API 33+)** that use the advertising ID MUST declare `<uses-permission android:name="com.google.android.gms.permission.AD_ID"/>`. | settled | The example app targets API 35; it does **not** use the GAID. |
| 2 | If a user deletes their advertising ID, the app gets **a string of zeros** instead of the identifier. Enforcement reached all Play devices **April 1, 2022**. | settled | N/A for an app that collects no GAID (the example app). |
| 3 | **Auto-merge trap:** some SDKs declare AD_ID in their library manifest, and it **merges into the app's main manifest by default** (e.g. Google Mobile Ads SDK; in practice `firebase_analytics` also merges it.) | settled (general) / verify (firebase_analytics specific) | In the example app, `firebase_analytics` merged AD_ID → stripped. |
| 4 | **Use both controls** so the GAID is not collected: strip the permission via `tools:node="remove"` on the `<uses-permission>` in `AndroidManifest.xml` (for an app targeting Android 13+ the ID "is automatically removed and replaced with a string of zeroes"), **and** set Firebase's `<meta-data android:name="google_analytics_adid_collection_enabled" android:value="false"/>`. | settled — Android 13 behaviour changes; Firebase Analytics config (Android); Play Help 6048248, verified 2026-11-19 | The example app applies `tools:node="remove"` to AD_ID + AdServices and **must also set the flag**; its "no advertising ID" stays `[verify]` until the **MERGED manifest** (not source) shows the permission absent and the flag present. Below Android 13 the strip alone is `[verify — not stated by Android]`. |
| 5 | Declared **permissions/SDKs must match the Data safety section** ("no advertising ID" answer must be honest). | verify | Data safety must answer "no advertising ID"; reconcile against merged manifest. |
| 6 | **targetSdk must meet the current Play minimum (API 34+)**. | verify-pinpoint | Read the app's targetSdk from the scan (the example app targets API 35 → satisfies). (Exact current minimum not re-confirmed this run.) |
| 7 | **`QUERY_ALL_PACKAGES`** requires policy justification. | verify | An app without a policy-approved need should not declare it; grep merged manifest to confirm absence. |

**Adjudication step (scanner):** grep the **MERGED** manifest (`app/build/outputs/.../AndroidManifest.xml`) for `AD_ID`, `AdServices`, the `google_analytics_adid_collection_enabled` meta-data, `QUERY_ALL_PACKAGES`, location/camera/mic perms → reconcile each against Data safety + Privacy §4. Source-manifest absence is insufficient; SDK merge is the trap.

**FAIL triggers:** AD_ID present in merged manifest, or `google_analytics_adid_collection_enabled=false` missing from it, while Data safety says "no advertising ID" · GAID collected without disclosure · unjustified `QUERY_ALL_PACKAGES` · targetSdk below current minimum · permission not reflected in Data safety.

---

## Module 7 — IARC CONTENT RATING

Source: Google, Play Console Help **9859655** (Content ratings / IARC), https://support.google.com/googleplay/android-developer/answer/9859655 `[settled — .../answer/9859655, verified 2026-11-18]`

| # | Rule | Tier |
|---|------|------|
| 1 | **Mandatory** — fill out the rating questionnaire in Play Console; applies to new apps and existing active-but-unrated apps. No app ships unrated. | settled |
| 2 | One questionnaire → multi-region ratings: **ESRB** (Americas), **PEGI** (Europe/ME), **USK** (Germany), **ACB** (Australia, games only), **ClassInd** (Brazil), **GRAC** (S. Korea, games only), **IARC Generic** (other); a **Google Play rating** applies to apps in South Korea and in Russia. | settled (2026-11-18) |
| 3 | Asks about content (violence, sexual content, language, controlled substances), **in-app purchases**, and **Interactive Elements** (shares location, user interaction, digital purchases, unrestricted internet access). | verify-pinpoint (full item list from harvested notes; this page did not enumerate verbatim this run) |
| 4 | **Re-complete** the questionnaire after any change to content or features that would change the answers. | settled |
| 5 | Misrepresenting the app's content can get the app removed or suspended. | settled |

**Application (worked: example app):** declare **in-app purchases = yes** (subscriptions), **unrestricted internet = yes** (Firebase), **user interaction = no** (no UGC/social), **shares location = no**, no objectionable content → expect lowest age bands (PEGI 3 / ESRB Everyone / IARC 3+). The resulting age rating MUST be consistent with: the **target-audience declaration** (Module 4, not-primarily-child-directed/16+) and the **Apple age rating**. A low PEGI rating does not contradict the 16+ self-attestation (the 16+ gate is a GDPR data-consent age, not a content-maturity rating) — note this so the two are not mistaken for a conflict.

**FAIL triggers:** unrated app · IARC answers omit IAP · answers contradict actual features · rating not re-taken after a material content/feature change.

---

## Cross-module consistency matrix (single source of truth)

These five facts must agree across the policy, the app, and every Console form:

| Fact | PP/ToS | In-app | Data safety form | Other Console form |
|------|--------|--------|------------------|--------------------|
| Publisher entity | "Who we are" = `<publisher>` (+KvK) | About screen | (developer account name) | DSA trader details + store listing |
| Account deletion | retention/30-day clause | Settings DELETE flow | "deletion = yes" + deletion Qs | web delete URL (e.g. `/<app>/delete-account`) |
| No advertising ID | Privacy §4 "no ad ID" | (none collected) | "no advertising ID" (Device or other IDs still = Yes for the app-instance ID) | merged manifest: AD_ID stripped **and** `google_analytics_adid_collection_enabled=false` |
| Health framing/disclaimer | health disclaimer §; "supports/may help relax" | About disclaimer | Health & fitness answer confirmed against the data, not asserted `[verify]` (worked example: not collected) | **Health apps declaration form**; "not a medical device" in store description |
| Age / audience | 16+ statement | 16+ sign-up attestation | (n/a) | Target-audience = not-child-directed; IARC age rating |
| Subscription terms | auto-renew/trial/cancel-via-Google | paywall copy + `withdrawalConsentAt` | (n/a) | Play subscription product config |

**Adjacent gate (admin, flag don't adjudicate):** **DSA trader status** (DSA Arts. 30/31) — the eenmanszaak must register & display name/address/phone/email in Play Console; non-registration → EU discoverability loss. Must match the KvK + Privacy/Terms contact block. `[verify-pinpoint]` (Article numbers from harvested notes, not re-fetched this run.)

---

## Verify flags (human confirmation needed)

- **[verify] Module 3B** — whether a purely on-device, no-health-data wellness app is strictly *required* to file the Health apps declaration form vs. merely *eligible*; the page says "all developers" so the conservative call is to file, but confirm the app's specific obligation.
- **[verify] Module 5B** — the **"charge up to 24h before period start"** timing and the "no current-period refund except defects/Google policy" mechanics (standard Play Billing; confirm against Play Billing docs, not surfaced verbatim here).
- **[verify] / [verify-pinpoint] Module 6** rows 3–7 — `tools:node="remove"` strip, firebase_analytics auto-merge specifically, Data-safety match, current targetSdk minimum (believed API 34+), and QUERY_ALL_PACKAGES justification (core AD_ID rule + April 2022 date ARE settled; these specifics came from harvested notes/studio LEARNING).
- **[verify-pinpoint] Module 1, row 6** — HTTPS for the policy URL itself (the page names HTTPS only as an example of modern cryptography for transmitting personal and sensitive user data).
- **[verify-pinpoint] Module 7, row 3** — full Interactive-Elements item list (from harvested notes; this Help page did not enumerate verbatim this run).
- **[verify-pinpoint] DSA trader** — Arts. 30/31 pinpoints (not re-fetched this run).
