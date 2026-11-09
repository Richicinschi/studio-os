# ePrivacy Art. 5(3) + Dutch Cookiewet (Telecommunicatiewet Art. 11.7a) — the analytics-consent rule

**Scope of this reference.** This is the decisive substantive resolution for whether device-side telemetry (Firebase Analytics, Crashlytics, any SDK that reads/writes the device) may run on an **opt-out** basis or must be gated behind **prior opt-in consent** in the Netherlands / EU. It governs the *device read/write* layer, which sits **on top of** (and is logically prior to) the GDPR/AVG lawful-basis question for the downstream processing.

**Headline rule (Breathe).** Firebase Analytics + Crashlytics in default configuration **do NOT qualify** for the Dutch analytics exemption and therefore require **prior opt-in consent** in NL. Shipping them opt-OUT (collection on by default, user toggles off) is **non-compliant**. The defensible design is a **first-run consent gate**: `setAnalyticsCollectionEnabled(false)` / `setCrashlyticsCollectionEnabled(false)` until the user affirmatively consents. `Art. 6(1)(f)` legitimate interest does **NOT** cure this — see §5.

---

## 1. The two-layer model (why this is separate from GDPR lawful basis)

Two distinct legal gates apply, in order. Both must pass.

| Layer | Instrument | Question | Governs |
|---|---|---|---|
| **Gate 1 — device access** | ePrivacy Art. 5(3) → NL Telecommunicatiewet Art. 11.7a (the "cookiewet") | May I *store* anything on, or *read* anything from, the user's device? | The act of writing/reading SDK identifiers, SharedPreferences, cookies, cache, install IDs |
| **Gate 2 — data processing** | GDPR/AVG Art. 6 (and Art. 9 for health) | Having obtained the data, may I *process* it, and on what basis? | The downstream analytics/profiling/storage of whatever was read |

The critical, frequently-missed point: **clearing Gate 2 does not clear Gate 1.** You cannot invoke Art. 6(1)(f) legitimate interest to *avoid* the Art. 5(3) consent requirement for the device read/write itself. Where Art. 5(3) requires consent, consent is the *only* lawful basis available for that step, and the downstream Art. 6 basis (typically consent under Art. 6(1)(a), to stay consistent) follows from it. [settled — relationship affirmed by EDPB Opinion 5/2019 on the interplay of ePrivacy and GDPR; **verify-pinpoint** for the exact paragraph]

---

## 2. ePrivacy Directive Art. 5(3) — the EU root rule

**Current consolidated text** (Directive 2002/58/EC as amended by Directive 2009/136/EC):

> "Member States shall ensure that the storing of information, or the gaining of access to information already stored, in the terminal equipment of a subscriber or user is only allowed **on condition that the subscriber or user concerned has given his or her consent**, having been provided with clear and comprehensive information, in accordance with Directive 95/46/EC, inter alia, about the purposes of the processing. This shall not prevent any technical storage or access **for the sole purpose of carrying out the transmission of a communication** over an electronic communications network, or **as strictly necessary in order for the provider of an information society service explicitly requested by the subscriber or user to provide the service**."
> [settled — EUR-Lex CELEX:02002L0058-20091219, Art. 5(3), verified 2026-06-06]

Decomposition:

- **Default = consent required** for any storing of, or gaining access to, information in terminal equipment. The 2009 amendment upgraded the original "right to refuse" (opt-out) to an affirmative **consent** standard. [settled — EUR-Lex, comparison of CELEX:32002L0058 original vs. -20091219 consolidated, verified 2026-06-06]
- **Two — and only two — exemptions** from consent:
  1. **Communication-transmission exemption** — storage/access whose *sole purpose* is carrying out the transmission of a communication.
  2. **Strictly-necessary exemption** — storage/access *strictly necessary* to provide an **information society service explicitly requested** by the user.
- "Consent" here means **GDPR-grade consent** (Art. 4(11) / Art. 7 GDPR): freely given, specific, informed, unambiguous, by clear affirmative action. [settled — Art. 5(3) as read with GDPR Art. 94(2); **verify-pinpoint**]

### 2.1 Technology-neutral scope — EDPB Guidelines 2/2023

EDPB **Guidelines 2/2023 on the technical scope of Art. 5(3)** (adopted Oct 2023, v2.0 after public consultation) confirm Art. 5(3) is **technology-neutral** and is **NOT limited to browser cookies**. It captures *any* operation that stores information on, or reads information from, terminal equipment, including:

- HTTP cookies, local storage, IndexedDB
- **SDK identifiers, persistent app identifiers, install IDs**
- **`SharedPreferences` / app-local key-value storage and any app-side cache used to read back info**
- Pixels, link decoration, local processing that later transmits
- IoT / smart-device storage; any "terminal equipment" of the end user

Key EDPB criteria (the guidelines articulate these as the test): there must be (a) **"information"** (need not be personal data); (b) a **"terminal equipment"** of the subscriber/user; (c) an **"electronic communications network"** in use; and (d) an act of **"storing"** or **"gaining access to information already stored."** Where all are present, Art. 5(3) applies. [settled in substance — EDPB Guidelines 2/2023; PDF fetch failed this run so the exact paragraph numbers are **verify-pinpoint**; substance corroborated by harvested primary-source notes]

**Breathe application.** Firebase SDKs write/read app-instance identifiers, persistent installation IDs, and cached config on-device; Crashlytics writes session/install state. These are device-storage/access operations squarely inside Art. 5(3). The fact that the app is native (not web) is **irrelevant** — there is no browser-cookie carve-out. [low-confidence on which *specific* Firebase writes count as strictly necessary — see §6]

---

## 3. Dutch implementation — Telecommunicatiewet Art. 11.7a

The Netherlands transposes Art. 5(3) in **Telecommunicatiewet (Tw) Art. 11.7a** — the "cookiewet." Enforced by the **Autoriteit Persoonsgegevens (AP)**, which took over cookie enforcement from the ACM.

**Structure** (Art. 11.7a, version in force 2024-07-01):

- **Lid 1 — consent + information requirement.** Storing data in, or reading data from, a user's randapparatuur (terminal equipment) is permitted only if the user has been given clear and complete information *and* has given **consent (toestemming)** for it. [settled — Tw Art. 11.7a lid 1; primary fetch (wetten.overheid.nl) returned 404/length-capped this run, so exact lid wording is **verify-pinpoint**; substance verified against EUR-Lex Art. 5(3) which it transposes 1:1]
- **Lid 3 — exemptions.** Consent is **not** required where the storing/reading is:
  - **(a) communication-transmission** — for the sole purpose of carrying out the transmission over an electronic communications network; **or**
  - **(b) strictly necessary** to deliver a service of the information society explicitly requested by the user; **or**
  - **(c) the analytics exemption** — for *measuring* the quality or effectiveness of the delivered service, provided this has **"geen of geringe gevolgen voor de persoonlijke levenssfeer"** (no or only minor consequences for the user's private life). [settled — the "geen of geringe gevolgen" phrasing is the statutory analytics-exemption test, confirmed via wetten.overheid.nl summary this run; **verify-pinpoint** for the exact lid/onderdeel letter]

### 3.1 The five-condition analytics test (the operative rule)

The AP reads the "geen of geringe gevolgen voor de persoonlijke levenssfeer" exemption as satisfied **only if ALL FIVE** conditions hold. Failing **any one** removes the exemption → **prior consent required**.

| # | Condition | Plain meaning | Breathe / Firebase status |
|---|---|---|---|
| 1 | **First-party only** | Analytics serve only *your own* measurement; not a shared/third-party analytics service | **FAILS** — Firebase Analytics is a Google service |
| 2 | **IP anonymised / masked** | IP addresses are truncated/anonymised before processing | Not guaranteed in default GA4/Firebase config |
| 3 | **No cross-site / cross-app tracking** | No tracking of the user across other sites/apps/services | GA4/Firebase contributes to Google's cross-property graph by default |
| 4 | **No data shared with third parties for their own purposes** | The processor may not use the data for its *own* ends | **FAILS** — Google uses GA4/Firebase data for its own purposes |
| 5 | **Minimal privacy impact** | Solely measuring quality/performance of *this* service | Fails by consequence of 1–4 |

[settled in substance — AP analytics-exemption conditions per harvested primary-source notes + AP cookies guidance; **verify-pinpoint** for an AP page citation, as the AP cookies pages returned 403 this run]

### 3.2 The decisive AP finding on Google Analytics / Firebase

The **AP has explicitly stated that standard Google Analytics 4 does NOT qualify** for the Art. 11.7a analytics exemption, because **data is shared with Google for Google's own purposes** — which fails **condition 4** (and, with default config, conditions 1–3 as well). By direct extension, **Firebase Analytics in default configuration** (and Crashlytics device telemetry) **falls outside the exemption** and therefore **requires prior opt-in consent in the Netherlands.** [settled in substance — AP "Google Analytics" position per harvested notes corroborating the AP cookies guidance; specific AP page citation **verify** (AP cookies pages 403 this run)]

**This resolves the repo's open "analytics-lawful-basis / cookiewet" question: opt-IN, not opt-out, is the only defensible position for Firebase.**

---

## 4. Valid consent — the mechanics (Art. 7 GDPR as imported by Art. 5(3))

Any consent gate the app builds must meet **all** of these, or it is invalid:

| Requirement | Rule | Source / tier |
|---|---|---|
| **Prior** | Telemetry must NOT run before consent. Collection starts *after* the affirmative click, not before. | [settled — Art. 5(3) "has given consent"; CNIL/EDPB consistent practice, verified 2026-06-06] |
| **Affirmative / unambiguous** | Pre-ticked boxes, "by continuing you agree", and implied consent are invalid. Clear affirmative action only. | [settled — GDPR Art. 4(11); CJEU *Planet49* C-673/17 holds pre-ticked = no consent; **verify-pinpoint** for the para] |
| **Freely given — no cookie walls** | Access to core functionality may NOT be conditioned on accepting non-essential telemetry. No "accept-or-leave" wall. | [settled — EDPB Guidelines 05/2020 on consent, §§38–40; **verify-pinpoint**] |
| **Granular / unbundled** | Separate the analytics consent from other consents (age 16+, health-data, terms acceptance). One bundled "I agree to everything" is not specific. The AP expects **separate consent per data type**. | [settled in substance — AP per-data-type expectation per harvested notes; **verify**] |
| **Reject as easy as accept** | The decline path must be as prominent/easy as the accept path (no dark patterns, no asymmetric buttons). | [settled — EDPB + national-DPA enforcement (e.g. CNIL €150M Google for asymmetric reject); **verify-pinpoint**] |
| **Withdrawable as easily as granted** | A persistent, easy in-app control to turn telemetry back off at any time (Settings → Data & privacy). Withdrawal is prospective. | [settled — GDPR Art. 7(3); verified 2026-06-06] |
| **Informed** | Clear, plain-language disclosure of *who* (Google/Firebase), *what* (events, identifiers), *why* (measurement), before the choice. | [settled — Art. 5(3) "clear and comprehensive information"; verified 2026-06-06] |

### 4.1 Consent record / retention

- **Keep proof of consent** (who consented, when, to what, the wording shown) — GDPR Art. 7(1) accountability. Record a timestamp (mirror the app's existing `ageConfirmedAt` / `withdrawalConsentAt` pattern, e.g. `analyticsConsentAt`). [settled — Art. 7(1); verified 2026-06-06]
- **Re-ask / record cadence:** common DPA practice caps the *consent's own validity / cookie lifetime* at **≈6 months, max 13 months**, after which consent is re-solicited. (This 6/13-month figure is the CNIL-anchored EU norm; the AP follows ePrivacy principles but has not published an identical hard number.) [verify — 6/13-month cap is CNIL guidance, applied EU-wide by analogy; not a hard AP-published number]

---

## 5. Why legitimate interest (Art. 6(1)(f)) does NOT save analytics here

A frequent (wrong) argument: "we'll run analytics on legitimate interest and skip consent."

- **Art. 5(3) is lex specialis for the device read/write.** It demands *consent* (or an exemption). Legitimate interest is **not** one of the two Art. 5(3) exemptions. So even a perfect LIA cannot authorise the device-storage step. [settled in substance — Art. 5(3) text + EDPB Opinion 5/2019; **verify-pinpoint**]
- LIA could, at most, justify *downstream* processing of data lawfully obtained — but if the *obtaining* (the device read) is unlawful for want of consent, the whole chain is unlawful.
- The AP's stance that GA4/Firebase needs consent forecloses the LIA route for these specific tools in NL regardless. [settled in substance — §3.2; AP citation **verify**]

**Sign-off action:** flag any privacy policy / DPIA / RoPA that claims "legitimate interest" as the basis for Firebase Analytics or Crashlytics in NL as **non-compliant** → must be **consent (opt-in)**.

---

## 6. Crashlytics under "strictly necessary" — analysis [verify]

Can crash reporting ride the **strictly-necessary** exemption (Art. 5(3) / Tw 11.7a lid 3(b)) instead of needing consent? Mixed; argue conservatively.

- **Argument for exemption:** stability/crash diagnostics could be framed as strictly necessary to *provide a functioning service the user requested.* Some authorities accept security/integrity and essential error-handling as strictly necessary. [verify]
- **Argument against (stronger in NL):** Crashlytics (a) is a **third-party** Google SDK, (b) sends device/session data to Google, (c) is **not strictly necessary** in the narrow EDPB sense — the app *functions* without it; it benefits the *developer's* diagnostics, not the *user's* requested service. EDPB Guidelines 05/2020 read "strictly necessary" narrowly: necessary for the service the *user* asked for, judged from the user's perspective — not "useful to the operator." [verify-pinpoint — EDPB consent guidelines §§ on strictly-necessary]
- **AP exposure:** because Crashlytics shares with Google for Google's purposes, it likely fails the same condition-4 logic as Analytics, pushing it toward consent. [low-confidence — no AP statement specifically on Crashlytics located this run]

**Recommended posture for Breathe:** treat **Crashlytics as consent-required (opt-in), same gate as Analytics.** Do **not** rely on "strictly necessary" without a documented, defensible necessity assessment and ideally NL legal sign-off. Bundle both behind one telemetry consent toggle, default OFF. [low-confidence → conservative recommendation, flag for jurist]

What *can* sit outside consent (genuinely strictly necessary / Breathe's own service): on-device session history for the free tier (no device-access *sharing* concern beyond the user's own device), Firebase **Auth** session tokens, and Firestore sync **for a Pro user who explicitly requested cloud sync** (the sync IS the requested service → Art. 11.7a lid 3(b) strictly-necessary, and Art. 6(1)(b) contract downstream). [verify — strictly-necessary framing for Auth/requested-sync is defensible but fact-specific]

---

## 7. Practical consequence — what Breathe must change

Current state per repo: analytics ships **opt-OUT** (collection enabled by default, Settings → Data & privacy toggle to disable; flips `setAnalyticsCollectionEnabled` / `setCrashlyticsCollectionEnabled`). **This is the non-compliant pattern for NL.**

Required change — **opt-IN consent gate**:

1. **Boot with telemetry OFF.** Call `setAnalyticsCollectionEnabled(false)` and `setCrashlyticsCollectionEnabled(false)` at startup, *before* any Firebase telemetry initialises and before logging any boot event. (The repo already applies the persisted toggle at boot before the Crashlytics handlers — extend this so the *default* when unset is OFF, not ON.)
2. **First-run consent prompt** — granular, plain-language, with equal accept/decline weight, no cookie wall (declining must not block using the app). Separate from the 16+ age checkbox and the paywall withdrawal checkbox.
3. **On consent** → enable collection + record `analyticsConsentAt` (timestamp, wording version) for Art. 7(1) accountability.
4. **Persistent withdrawal control** in Settings, as easy to use as the grant; withdrawal flips collection back off (already present — keep).
5. **Privacy policy** must state analytics/crash telemetry is **consent-based (opt-in)**, name **Google/Firebase** as recipient, and not claim legitimate interest.
6. **Store declarations** (Apple App Privacy label, Google Play Data Safety) must reflect that telemetry is **collected only with consent / user can opt out**, consistently with the policy.

---

## 8. Quick adjudication checklist (for clause sign-off)

- [ ] Does any device-storage/SDK read run **before** consent? → **FAIL** (Art. 5(3) prior-consent).
- [ ] Is Firebase Analytics / Crashlytics defended on **legitimate interest** in NL? → **FAIL** → must be consent (§5).
- [ ] Is the analytics consent **bundled** with age/health/terms? → **FAIL** → unbundle (§4).
- [ ] Is there a **cookie wall** (decline blocks core use)? → **FAIL** (§4).
- [ ] Is **reject** harder/less prominent than **accept**? → **FAIL** (§4).
- [ ] Is there an **easy in-app withdrawal**? → required (Art. 7(3)).
- [ ] Is the consent **recorded** with timestamp + wording version? → required (Art. 7(1)).
- [ ] Does the PP claim the analytics exemption (all 5 conditions met)? → **FAIL** for default Firebase (§3.1–3.2).
- [ ] Does the PP / Data Safety / App Privacy label all agree telemetry is opt-in? → must reconcile (§7.6).
- [ ] Does the ToS/PP cite the **dead EU ODR platform**? (separate issue, but common co-occurring fault) → remove.

---

## 9. Source ledger

| Proposition | Source | Tier |
|---|---|---|
| Art. 5(3) current consolidated text (consent standard) | EUR-Lex CELEX:02002L0058-20091219 | settled, verified 2026-06-06 |
| Art. 5(3) original text (right-to-refuse → upgraded to consent by 2009/136) | EUR-Lex CELEX:32002L0058 | settled, verified 2026-06-06 |
| Art. 5(3) technology-neutral, covers SDK IDs / SharedPreferences, not just cookies | EDPB Guidelines 2/2023 (PDF fetch failed; substance from harvested primary notes) | settled-substance; **verify-pinpoint** paras |
| Tw Art. 11.7a transposition; "geen of geringe gevolgen" analytics test | wetten.overheid.nl BWBR0009950 (length-capped this run) | settled-substance; **verify-pinpoint** lid/onderdeel |
| Five-condition analytics exemption test | AP cookies guidance + harvested notes (AP pages 403 this run) | settled-substance; **verify** AP page cite |
| AP: GA4/Firebase fails exemption (shares with Google) → opt-in required | AP "Google Analytics" position via harvested notes | settled-substance; **verify** AP page cite |
| LI (6(1)(f)) cannot cure Art. 5(3) device-access consent | Art. 5(3) text + EDPB Opinion 5/2019 | settled-substance; **verify-pinpoint** |
| Consent mechanics (prior, no wall, granular, easy reject/withdraw) | GDPR Art. 4(11)/7; EDPB Guidelines 05/2020; CJEU Planet49 | settled; some **verify-pinpoint** |
| ~6-month / max-13-month consent-record/cookie-lifetime cap | CNIL guidance applied EU-wide by analogy | **verify** (not a hard AP number) |
| Crashlytics under "strictly necessary" | analysis; no AP-specific statement found | **verify** / **low-confidence** |

---

### Open items a human (Dutch jurist) should confirm
1. **verify-pinpoint:** exact paragraph numbers in EDPB Guidelines 2/2023 for the SDK-identifier / app-storage examples (PDF was unreadable this run).
2. **verify-pinpoint:** the exact lid/onderdeel lettering of Tw Art. 11.7a (the consent lid and the analytics-exemption onderdeel) — wetten.overheid.nl was length-capped this run.
3. **verify:** a citable AP page URL for the five-condition test and the GA4/Firebase "needs consent" position (AP cookies pages returned 403 this run; substance is solid, the exact citation is not pinned).
4. **verify:** whether the AP publishes any hard consent-record / re-consent cadence (the 6/13-month figure is CNIL-anchored, applied by analogy).
5. **verify / low-confidence:** whether Crashlytics can lawfully ride "strictly necessary" in NL, or must be opt-in like Analytics (this file recommends opt-in conservatively).
6. **verify-pinpoint:** EDPB Opinion 5/2019 paragraph confirming Art. 5(3) consent cannot be displaced by Art. 6(1)(f).
