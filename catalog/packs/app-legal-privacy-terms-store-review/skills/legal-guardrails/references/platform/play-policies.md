# Google Play Developer Policies — PP/ToS + Store-Config Gates

**Scope:** Google Play Developer Program Policy modules that gate the Privacy Policy, Terms of Service, and Play Console store configuration for **Breathe** (Flutter breathing/mindfulness app; Dutch eenmanszaak sole-controller publisher; EU/NL-first; auto-renew subscriptions sold through Google Play as merchant of record via RevenueCat + Firebase backend in `europe-west`; general-wellness, no medical claims; free tier = on-device data only, Pro = Firestore sync).

**How to use:** Each section is a discrete PASS/FAIL module. Adjudicate a clause/config against the rule rows, then record the Breathe verdict. Citation tiers:
- `[settled — <src>, verified 2026-06-06]` = confirmed against the primary Play Help page fetched this run.
- `[verify]` / `[verify-pinpoint]` / `[low-confidence]` = see flags at the end.

**Companion reference (not duplicated here):** the 14-category / 7-purpose **Data Safety** taxonomy lives in the data-safety taxonomy reference; this file covers only how the policies above interact with the Data safety form, not the form's full schema.

---

## Module 1 — USER DATA policy (privacy-policy + disclosure gate)

Source: Play Console Help **10144311** (User Data). `[settled — support.google.com/.../answer/10144311, verified 2026-06-06]`

### 1A. Privacy-policy posting & URL hygiene

| # | Rule | Tier | Breathe application |
|---|------|------|---------------------|
| 1 | Privacy policy link MUST be posted **in the Play Console designated field** AND **a privacy policy link or text within the app itself**. | settled | Console field + in-app `/legal/privacy` route both required. App has both (in-app `MarkdownDocScreen`). PASS. |
| 2 | URL must be **active, publicly accessible, and non-geofenced** — **no PDFs**. | settled | `https://richicinschi.com/breathe/privacy` is HTML (Firebase Hosting), reachable globally. Verify it is NOT served only to NL IPs. |
| 3 | URL must be **non-editable** (not a doc/wiki that anyone can change). | settled | Static Hosting page — non-editable. PASS. |
| 4 | Must be **clearly labelled** as a privacy policy (e.g. "privacy policy" in the title). | settled | Page `<title>` / heading must read "Privacy Policy". Confirm the rendered HTML title, not just the in-app screen. |
| 5 | The **entity named in the Play store listing** (developer/company) must appear in the privacy policy, **or** the app must be named in the policy. | settled | Listing publisher = `Richicinschi` (KvK trade name). Policy "Who we are" block must name **Richicinschi** (and ideally "Breathe"). Cross-check against the still-pending `[KVK]`/`[REGISTERED ADDRESS]` fills. |
| 6 | Must be served over **HTTPS** (secure transmission of user data is mandated). | verify-pinpoint | Hosting is HTTPS-only. PASS in practice; "HTTPS-mandated" wording not verbatim on this page this run. |

### 1B. Comprehensive disclosure (policy content)

The privacy policy MUST comprehensively cover `[settled]`:
1. **Developer contact information** and an inquiry mechanism.
2. **Types of personal and sensitive user data** the app **accesses, collects, uses, and shares**, AND **any parties with which** that data is shared (recipients named/categorized).
3. **Secure data handling** procedures.
4. **Data retention and deletion** policies.

Breathe recipients to enumerate: Google (Firebase Auth/Firestore/Analytics/Crashlytics/Cloud Functions/Hosting), **RevenueCat** (subscription middleware), Apple/Google (billing). The policy's §3/§4 + recipient list must match the SDK inventory and the Data safety form.

### 1C. Prominent disclosure + affirmative consent (BEFORE sensitive-data collection)

For **personal and sensitive user data**, a prominent in-app disclosure + affirmative consent is required `[settled]`:

| Requirement | Verbatim rule |
|---|---|
| Location | "Must be within the app itself, not only in the app description or on a website." |
| Visibility | "Must be displayed in the normal usage of the app and not require the user to navigate into a menu or settings." |
| Scoping | "Cannot be included with other disclosures unrelated to personal and sensitive user data collection." |
| Clarity | "Must present the consent dialog clearly and unambiguously." |
| Action | "Must require affirmative user action (for example, tap to accept, tick a check-box)." |
| No implied consent | "Must not interpret navigation away from the disclosure ... as consent." |
| Timing | "Must be granted by the user **before** your app can begin to collect or access the personal and sensitive user data." |

**Defined term — "personal and sensitive user data":** includes PII, financial/payment info, authentication info, contacts, location, SMS/call data, **health data** (incl. Health Connect), inventory of installed apps, microphone, camera, and similar. `[verify-pinpoint]` (definition substance confirmed; exact enumeration partly from harvested notes).

**Breathe application:** Breathe collects email + auth (Firebase Auth) and analytics/crash diagnostics. The sign-up flow already carries an explicit consent checkbox + privacy/terms acceptance (affirmative tick). Analytics/Crashlytics have an in-app opt-out. Free-tier breathing data is on-device only (not "collected" = not leaving device). PASS, provided the consent tick precedes any account-creation network write. **Do NOT over-classify breathing sessions as health data** — they are App-activity, not Health & fitness (no Health Connect access).

### 1D. Data minimization, no-sale, Data-safety consistency

| # | Rule | Tier | Breathe |
|---|------|------|---------|
| 1 | **Data minimization** — collect/use only what's needed for current features. | settled | Only auth + diagnostics. PASS. |
| 2 | **No sale** of personal/sensitive user data ("sale" = exchange/transfer to a third party for monetary consideration). | settled | No data sale; ads disabled; AD_ID stripped. PASS. |
| 3 | The **Data safety section** must be completed clearly and accurately for every app, and **where relevant must be consistent with the privacy policy disclosures**. | settled | Data safety form answers (categories, encrypted-in-transit = yes, deletion = yes) must mirror Privacy §3/§4. Reconcile both before submit. |

**FAIL triggers:** PDF policy URL · geofenced/editable URL · policy entity ≠ listing entity · missing recipient list · no in-app prominent disclosure before sensitive collection · Data safety form contradicts the policy · any data-sale.

---

## Module 2 — ACCOUNT & DATA DELETION

Source: Play Console Help **13327111** (Account deletion requirements). `[settled — .../answer/13327111, verified 2026-06-06]`

### 2A. Scope

Applies whenever the app **lets users create an account from within the app** — **including apps that direct users to account-creation flows outside the app**, and even if some features work without an account. `[settled]`
**Exemptions:** permanently-private apps and enterprise device-management apps. `[verify]` (exemptions named in harvested notes; not surfaced verbatim this run.)

Breathe creates Firebase Auth accounts → **in scope**.

### 2B. Dual-path requirement (BOTH mandatory)

| Path | Rule (verbatim) | Breathe |
|------|-----------------|---------|
| In-app | "an in-app path to delete their app accounts and associated data." | Settings → Account → type-`DELETE` soft-delete flow. PASS (discoverable in account settings). |
| Web | "a web link resource where users can request app account deletion and associated data deletion." (exists because some users may have uninstalled) | `https://richicinschi.com/breathe/delete-account`. Verify it loads + describes the request path. |

### 2C. Web-resource standards (verbatim)

- **Functional:** "loads without error."
- **Relevant:** "the pathway to request account deletion should be prominently featured and easily discoverable."
- **Identified:** must "reference the app or developer name (that is, as it appears on your store listing)" → page must name **Breathe / Richicinschi**.
- Acceptable submission mechanisms: "an additional link that initiates account deletion, a customer service email or a form."

### 2D. Deletion obligation + retention exceptions

- Deleting an account requires deleting **"the user data associated with that app account"** — including personal data, financial info, authentication details, location, health data, and other sensitive usage data **listed in your Data safety section**. `[settled]`
- Retention permitted only **"for legitimate reasons such as security, fraud prevention or regulatory compliance,"** and the developer **"must clearly inform users about your data retention practices, for example, within your privacy policy."** `[settled]`

**Breathe mapping:** 30-day soft-delete grace → `purgeExpiredDeletions` cron hard-purges Firestore + Auth + RevenueCat. The Privacy retention clause must describe the 30-day grace + the security/legal retention basis so the policy language matches the actual purge. PASS if Privacy §retention wording matches `purgeExpiredDeletions`.

### 2E. Data-safety form connection

Must answer the **Data deletion questions** in the Data safety form (App content page). Responses affect store-listing visibility. `[settled]` Set **"users can request deletion" = yes**; reconcile with 2B/2D.

**FAIL triggers:** web URL missing / 404 / does not name app/developer / no visible request path · account deletion that leaves orphaned Firestore or RevenueCat data · undisclosed retention · Data safety deletion answer = no while in-app deletion exists.

---

## Module 3 — HEALTH CONTENT & SERVICES

Source: Play Console Help **16679511** (Health content and services). `[settled — .../answer/16679511, verified 2026-06-06]`

### 3A. Scope (Breathe is in scope by framing)

Covers **"apps that offer health-related features or information as part of its functionality, or accesses health data to support non-health features"** — explicitly including an app that **"is not primarily a health app, but has health-related features."** `[settled]`
→ A mindfulness/breathing app falls in scope **by framing alone** even without Health Connect access.

### 3B. Health apps declaration form — DECISION (do not silently skip)

Verbatim: **"All developers must complete the Health apps declaration form on the App content page (Monitor & Improve > Policy > App content) in Play Console."** `[settled]`

**Adjudication for Breathe:** the wording is written broadly ("all developers"); given Breathe's mindfulness/relaxation framing it falls within "health-related features or information." **Decision: complete the Health apps declaration form** (do not assume exemption). Document the reasoning in the sign-off rather than skipping. `[verify]` — whether a purely on-device, no-health-data wellness app is strictly *required* to file vs. *eligible* to attest is a judgment; the conservative, defensible call is to file. Flag for the reviewer.

### 3C. Prohibited claims (cross-check store listing + ToS + PP + About + in-app copy)

Prohibited `[settled]`:
- **False/misleading** health/medical functionality that is "misleading or potentially harmful."
- Claims that **contradict existing medical consensus** or can cause harm.
- (Examples cited: vaccine-DNA misinformation; advocacy of harmful/unapproved treatments.)
- Implicitly: no **diagnose / treat / cure / prevent** disease claims (the mandatory disclaimer's negation, see 3D).

**Breathe guardrail (already enforced studio-wide):** use **"supports" / "may help relax"**; NEVER "treats / cures / diagnoses / prevents." Scan the **Play store description**, ToS, Privacy, About, and in-app technique copy for the prohibited verbs.

### 3D. Mandatory disclaimer (store description — verbatim)

Apps must state they are **"not a medical device and does not diagnose, treat, cure, or prevent any medical condition,"** and **"must also remind users to consult a healthcare professional for medical advice, diagnosis, or treatment."** `[settled]`

**Breathe:** the disclaimer must appear in the **Play store listing description itself** (not only the in-app About). Confirm both placements. The in-app long health disclaimer already exists; add/confirm the condensed version in the Play description.

### 3E. Health-data disclosure, permissions, minimization

- Privacy policy must "post a privacy policy link in the designated field within Play Console, and a privacy policy link or text within the app itself" (mirrors Module 1). `[settled]`
- **Minimization:** "Permissions that are not required for a health app to perform its core functionality should not be requested and unused permissions must be removed." `[settled]`

**Breathe:** requests no health permissions, no Health Connect, no precise location. Verify the merged manifest holds no leftover sensitive permissions (ties to Module 6).

**FAIL triggers:** any diagnose/treat/cure/prevent verb · missing "not a medical device / consult a professional" disclaimer in the **store description** · Health apps declaration form not filed without documented reasoning · unused sensitive permission present.

---

## Module 4 — FAMILIES / TARGET-AUDIENCE DECLARATION

Source: Play Console Help **9893335** (Families / Designed for Families). `[settled — .../answer/9893335, verified 2026-06-06]`

### 4A. Mandatory declaration

Every app must declare its **target audience prior to publishing**, selecting from the provided age groups. `[settled]`

**Breathe decision: declare NOT primarily child-directed (adult/16+),** consistent with the in-app **16+ self-attestation age gate** (GDPR Art. 8 alignment) and the IARC age rating. Document the reconciliation.

### 4B. Obligations that attach ONLY if child-directed (Breathe avoids by declaring 16+)

If targeted to children `[settled]`:
- Comply with **COPPA** (US) and **GDPR** (EU) and applicable laws.
- Apps that **solely target children must NOT transmit** AAID/advertising ID, SIM Serial, Build Serial, BSSID, MAC, SSID, IMEI, IMSI.
- Apps that **solely target children may NOT request location permission** or collect/transmit precise location.
- Ads must use **Google Play Families Self-Certified Ads SDKs**; no interest-based ads / remarketing.
- Must not contain APIs/SDKs not approved for child-directed services.
- **Mixed-audience** apps must implement a **neutral age screen** to gate child protections.

**Breathe application:** by declaring not-primarily-child-directed, these heavy obligations do not attach — but the declaration MUST stay consistent with: (a) the 16+ in-app gate, (b) the Privacy Policy's 16+ statement, (c) the IARC rating (Module 7). A contradiction (e.g. declaring child-directed while the policy says 16+) is a FAIL. Note: Breathe already strips AD_ID anyway (Module 6), so it would not transmit the advertising ID regardless.

**FAIL triggers:** target-audience section incomplete · declaration inconsistent with the 16+ gate / Privacy 16+ clause / IARC rating.

---

## Module 5 — SUBSCRIPTIONS / BILLING DISCLOSURE

Source: Play Console Help **9900533** (Subscriptions). `[settled — .../answer/9900533, verified 2026-06-06]`

### 5A. Required disclosures (developer-controlled copy — must appear in paywall + ToS)

Developers must clearly disclose `[settled]`:
- **Cost** of the subscription and **billing-cycle frequency**.
- That it **"will be automatically renewed and charged"** (auto-renew).
- Whether **a subscription is required** to use the app.
- **Any other material information** about the subscription.
- **Free-trial terms:** "the duration, pricing, and description of accessible content or services" + **"how and when a free trial will convert to a paid subscription"** + **"how much the paid subscription will cost"** after trial.

### 5B. Cancellation, management, refunds (Google = merchant of record)

- Must provide **"access to an easy-to-use, online method to cancel the subscription"** in account settings, including **"a link to Google Play's Subscription Center."** `[settled]`
- Refund: **"The user will not receive a refund for the current billing period, but will continue to receive their subscription content for the remainder of the current billing period."** Some jurisdictions get prorated refunds per applicable law. `[settled]`
- Developers may offer a **more flexible refund policy** directly, but must notify users of changes. `[settled]`
- **Charge timing — up to 24h before period start:** `[verify]` (standard Play billing rule; not surfaced verbatim on this page this run — confirm against Play Billing docs).

### 5C. Breathe ToS module

The subscription clause must state: price + cycle + **auto-renew** + **trial-end charge** + **cancel via Google Play (Subscription Center)**, and route **refunds/cancellation to Google Play** as merchant of record (Apple parallel = App Store / Apple EULA). RevenueCat is internal middleware — **not** named as the merchant of record to users.

**Cross-regime check:** reconcile Play's "no current-period refund" with the **EU 14-day right of withdrawal** Breathe already implements (unticked paywall checkbox + `withdrawalConsentAt` capturing the immediate-performance waiver). The two regimes coexist: EU withdrawal/waiver governs the consumer-law statutory right; Google's refund mechanics govern the store transaction. The ToS must not state the Play refund rule in a way that **denies** the EU statutory withdrawal right.

**FAIL triggers:** paywall omits auto-renew / trial-end charge / cancel path · ToS names RevenueCat (not Google) as merchant of record · refund clause contradicts EU withdrawal rights.

---

## Module 6 — AD_ID + PERMISSION HYGIENE (code/manifest gate)

Source: Play Console Help **6048248** (Advertising ID). `[settled (core)/verify (notes-only) — .../answer/6048248, verified 2026-06-06]`

| # | Rule | Tier | Breathe |
|---|------|------|---------|
| 1 | Apps **targeting Android 13+ (API 33+)** that use the advertising ID MUST declare `<uses-permission android:name="com.google.android.gms.permission.AD_ID"/>`. | settled | Breathe targets API 35; it does **not** use the GAID. |
| 2 | If a user deletes their advertising ID, **"any attempts to access the identifier will receive a string of zeros."** Enforcement reached all Play devices **April 1, 2022**. | settled | N/A — Breathe collects no GAID. |
| 3 | **Auto-merge trap:** some SDKs declare AD_ID in their library manifest and it **"will be merged with your app's main manifest by default."** (e.g. Google Mobile Ads SDK; in practice `firebase_analytics` also merges it.) | settled (general) / verify (firebase_analytics specific) | Breathe's `firebase_analytics` historically merged AD_ID → stripped. |
| 4 | **Strip via** `tools:node="remove"` on the `<uses-permission>` in `AndroidManifest.xml` so the GAID is not collected. | verify | Breathe applies `tools:node="remove"` to AD_ID + AdServices; **verify the MERGED manifest** (not source) shows it absent. (From harvested notes + studio LEARNING; not surfaced verbatim on this Help page this run.) |
| 5 | Declared **permissions/SDKs must match the Data safety section** ("no advertising ID" answer must be honest). | verify | Data safety must answer "no advertising ID"; reconcile against merged manifest. |
| 6 | **targetSdk must meet the current Play minimum (API 34+)**. | verify-pinpoint | Breathe targets API 35 → satisfies. (Exact current minimum not re-confirmed this run.) |
| 7 | **`QUERY_ALL_PACKAGES`** requires policy justification. | verify | Breathe should not declare it; grep merged manifest to confirm absence. |

**Adjudication step (scanner):** grep the **MERGED** manifest (`app/build/outputs/.../AndroidManifest.xml`) for `AD_ID`, `AdServices`, `QUERY_ALL_PACKAGES`, location/camera/mic perms → reconcile each against Data safety + Privacy §4. Source-manifest absence is insufficient; SDK merge is the trap.

**FAIL triggers:** AD_ID present in merged manifest while Data safety says "no advertising ID" · GAID collected without disclosure · unjustified `QUERY_ALL_PACKAGES` · targetSdk below current minimum · permission not reflected in Data safety.

---

## Module 7 — IARC CONTENT RATING

Source: Play Console Help **9859655** (Content ratings / IARC). `[settled — .../answer/9859655, verified 2026-06-06]`

| # | Rule | Tier |
|---|------|------|
| 1 | **Mandatory** — fill out the rating questionnaire in Play Console; applies to new apps and existing active-but-unrated apps. No app ships unrated. | settled |
| 2 | One questionnaire → multi-region ratings: **ESRB** (Americas), **PEGI** (Europe/ME), **USK** (Germany), **ACB** (Australia, games), **ClassInd** (Brazil), **GRAC** (S. Korea), **IARC Generic** (other). | settled |
| 3 | Asks about content (violence, sexual content, language, controlled substances), **in-app purchases**, and **Interactive Elements** (shares location, user interaction, digital purchases, unrestricted internet access). | verify-pinpoint (full item list from harvested notes; this page did not enumerate verbatim this run) |
| 4 | **Re-complete** the questionnaire on "any ... change to your content or features that would affect the responses." | settled |
| 5 | "Misrepresentation of your app's content may result in its removal or suspension." | settled |

**Breathe application:** declare **in-app purchases = yes** (subscriptions), **unrestricted internet = yes** (Firebase), **user interaction = no** (no UGC/social), **shares location = no**, no objectionable content → expect lowest age bands (PEGI 3 / ESRB Everyone / IARC 3+). The resulting age rating MUST be consistent with: the **target-audience declaration** (Module 4, not-primarily-child-directed/16+) and the **Apple age rating**. A low PEGI rating does not contradict the 16+ self-attestation (the 16+ gate is a GDPR data-consent age, not a content-maturity rating) — note this so the two are not mistaken for a conflict.

**FAIL triggers:** unrated app · IARC answers omit IAP · answers contradict actual features · rating not re-taken after a material content/feature change.

---

## Cross-module consistency matrix (single source of truth)

These five facts must agree across the policy, the app, and every Console form:

| Fact | PP/ToS | In-app | Data safety form | Other Console form |
|------|--------|--------|------------------|--------------------|
| Publisher entity | "Who we are" = Richicinschi (+KvK) | About screen | (developer account name) | DSA trader details + store listing |
| Account deletion | retention/30-day clause | Settings DELETE flow | "deletion = yes" + deletion Qs | web delete URL `/breathe/delete-account` |
| No advertising ID | Privacy §4 "no ad ID" | (none collected) | "no advertising ID" | merged manifest AD_ID stripped |
| Health framing/disclaimer | health disclaimer §; "supports/may help relax" | About disclaimer | Health & fitness = **NOT** collected | **Health apps declaration form**; "not a medical device" in store description |
| Age / audience | 16+ statement | 16+ sign-up attestation | (n/a) | Target-audience = not-child-directed; IARC age rating |
| Subscription terms | auto-renew/trial/cancel-via-Google | paywall copy + `withdrawalConsentAt` | (n/a) | Play subscription product config |

**Adjacent gate (admin, flag don't adjudicate):** **DSA trader status** (DSA Arts. 30/31) — the eenmanszaak must register & display name/address/phone/email in Play Console; non-registration → EU discoverability loss. Must match the KvK + Privacy/Terms contact block. `[verify-pinpoint]` (Article numbers from harvested notes, not re-fetched this run.)

---

## Verify flags (human confirmation needed)

- **[verify] Module 3B** — whether a purely on-device, no-health-data wellness app is strictly *required* to file the Health apps declaration form vs. merely *eligible*; the page says "all developers" so the conservative call is to file, but confirm Breathe's specific obligation.
- **[verify] Module 2A** — the permanently-private / enterprise device-management **exemptions** (from harvested notes; not surfaced verbatim this run).
- **[verify] Module 5B** — the **"charge up to 24h before period start"** timing and the "no current-period refund except defects/Google policy" mechanics (standard Play Billing; confirm against Play Billing docs, not surfaced verbatim here).
- **[verify] / [verify-pinpoint] Module 6** rows 3–7 — `tools:node="remove"` strip, firebase_analytics auto-merge specifically, Data-safety match, current targetSdk minimum (believed API 34+), and QUERY_ALL_PACKAGES justification (core AD_ID rule + April 2022 date ARE settled; these specifics came from harvested notes/studio LEARNING).
- **[verify-pinpoint] Module 1, row 6** — HTTPS explicitly *mandated* by this page (secure-handling is settled; the verbatim HTTPS requirement was not re-quoted this run).
- **[verify-pinpoint] Module 1C** — exact enumeration of the "personal and sensitive user data" definition.
- **[verify-pinpoint] Module 7, row 3** — full Interactive-Elements item list (from harvested notes; this Help page did not enumerate verbatim this run).
- **[verify-pinpoint] DSA trader** — Arts. 30/31 pinpoints (not re-fetched this run).
