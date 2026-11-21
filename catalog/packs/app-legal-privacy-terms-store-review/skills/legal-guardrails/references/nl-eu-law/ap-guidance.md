# Autoriteit Persoonsgegevens (AP) — App-Specific Guidance & Enforcement Reference

> **Scope:** The Dutch supervisory authority for data protection and its concrete, app-specific
> expectations. Use this to adjudicate a Privacy Policy / Terms of Service against the Dutch
> (AVG/UAVG) layer that sits on top of the GDPR. Worked examples use one app, the
> **worked example** (profile: `worked-example.md` §1). Apply each rule to the app under review
> from its fact sheet.

**Reference date:** 2026-06-06 · **Primary authority:** Autoriteit Persoonsgegevens (AP),
the Dutch *toezichthouder* for the AVG (the Dutch GDPR) and the UAVG (Uitvoeringswet AVG).

**Citation tiers used below:**
`[settled — <source>, verified <date>]` confirmed against the source on that date (the AP pages were read in a browser on 2026-11-19; lines still dated 2026-06-06 rest on the AP's Google Analytics documents, which sat behind a CAPTCHA, and carry `[verify — source blocked 2026-11-19: …]`) ·
`[verify]` believed correct, not confirmed this run ·
`[verify-pinpoint]` right substance, exact article/paragraph still to pin ·
`[low-confidence]` novel / contested / fact-specific.

> **Fetch note:** The AP website (`autoriteitpersoonsgegevens.nl`) returns **HTTP 403** to
> automated fetchers (WAF). On 2026-11-19 the pages were read in a real browser; the lines dated
> 2026-11-19 below were checked against the live AP pages, which are linked in the table at the
> end. The AP's Google Analytics documents returned a CAPTCHA, so the lines resting on them keep
> their old date and a `[verify — source blocked 2026-11-19: …]` marker.

---

## 1. Who the AP is and what it enforces

| Item | Rule | Tier |
|---|---|---|
| Identity | Autoriteit Persoonsgegevens (AP) is the Dutch national **supervisory authority** under **GDPR Art. 51** and the UAVG. English name used by AP itself: "Dutch data protection authority". | [settled — autoriteitpersoonsgegevens.nl, verified 2026-11-19] |
| Primary mandate | Enforces the **AVG (GDPR)** and the **UAVG** (the Dutch implementing act) over all processing of personal data by controllers/processors established in NL or targeting NL data subjects. | [settled — autoriteitpersoonsgegevens.nl, verified 2026-11-19] |
| Cookie / device-storage rules | The Dutch cookie rule is **Telecommunicatiewet (Tw) Art. 11.7a** (implements ePrivacy Dir. Art. 5(3)). Supervision is currently **split**: the **ACM** (Autoriteit Consument & Markt) is the competent authority for the *placing/reading of and consent for* cookies/device storage under Tw 11.7a; the **AP** supervises the *processing of personal data* collected via cookies/SDKs under the AVG. The AP's cookie-banner page (updated 9 Nov 2026) still links to the ACM's own explanation of cookies. | [settled — AP "Voorstel AP toezicht cookies" + AP "Vuistregels heldere cookiebanners" (updated 9 Nov 2026), verified 2026-11-19; Privacy Company / DDMA analyses as secondary] |
| Pending transfer (do not overstate) | On **26 March 2025** the AP proposed to the Minister of Economic Affairs to become the **sole** competent authority for Tw 11.7a, taking the placement/consent supervision **from the ACM**. As of 2026-11-19 this is a **proposal**, not completed law: the AP site reports no enactment (its proposal page dates from 7 April 2025, so it cannot prove the law alone), and Tw art. 15.1 still leaves 11.7a with the ACM (`eprivacy-cookiewet.md` §3). **Do not assert "AP took over cookie enforcement from the ACM" as accomplished fact.** | [settled — AP proposal 2025-03-26, verified 2026-11-19] |
| Practical consequence for review | Regardless of which authority polices Tw 11.7a, **both** legal layers apply to an app: (a) the **device-access consent rule** (Tw 11.7a / ePrivacy 5(3)) **and** (b) the **AVG** for the resulting personal-data processing. A PP/ToS must comply with both. | [settled — Tw 11.7a + GDPR, verified 2026-11-18] |

> **Drafting takeaway for the app's PP:** name **"Autoriteit Persoonsgegevens (AP)"** as the
> supervisory authority. Do **not** claim the AP is the cookie-placement regulator outright;
> if the PP describes device-storage/SDK enforcement, the accurate phrasing is that **the AP
> supervises the data-protection (AVG) aspects and the ACM currently supervises the
> Telecommunicatiewet consent-for-placement aspects** (with a transfer proposed).

---

## 2. AP app-specific guidance — the developer obligations

These are AP's published expectations on its "Privacy and apps" page. They are written as
user-facing rights but each maps to a **developer obligation** for the review.

| # | AP rule (developer obligation) | Verbatim / paraphrase from AP | Application (worked example) | Tier |
|---|---|---|---|---|
| G1 | **Consent before reading from / placing data on the device** | An app "asks you for consent to use your personal data **before it retrieves data from or places data on your device**" (AP "Privacy and apps", EN). | The very act of writing to SharedPreferences / reading device identifiers / initialising an SDK that stores on-device triggers this. Strictly-necessary storage (for the service the user explicitly requested) is exempt; **non-essential telemetry is not** (see §3). | [settled — AP "Privacy and apps", verified 2026-11-19] |
| G2 | **Separate consent per data type (unbundling)** | "Apps have to ask you for consent **for each type** of your data that they want to use" / "**separately ask for consent** for different types of personal data." | **Do not bundle** the age attestation, the analytics/crash-telemetry opt-in, and the withdrawal/immediate-delivery acknowledgement into one tick. Health-adjacent data, analytics, and account data each need their own basis/consent surface. | [settled — AP "Privacy and apps", verified 2026-11-19] |
| G3 | **Clear, fixed purposes** | "Apps should indicate **clear and understandable purposes** for which the app uses your data and **should not change these purposes without your consent**." | The PP must state purposes per data category; a later purpose change (e.g. new analytics use) needs fresh consent, not a silent PP edit. | [settled — AP "Privacy and apps", verified 2026-11-19] |
| G4 | **Withdrawal of consent must be possible and as easy as giving it** | AP: an app "gives you the option to withdraw your consent, to de-install the app, and to remove the personal data collected" (Privacy and apps); withdrawal "must be as easy as giving consent" (Legal basis of consent). | The app must provide an in-app **opt-out** that flips telemetry off (for Firebase: `setAnalyticsCollectionEnabled(false)` / `setCrashlyticsCollectionEnabled(false)`) and stops future processing. Maps to **GDPR Art. 7(3)**. | [settled — AP "Privacy and apps" + AP "Legal basis of consent" + GDPR Art. 7(3), verified 2026-11-19] |
| G5 | **Data minimisation — only what the app needs to function** | AP guidance: collect only data **necessary for the app to function**; users can restrict per-app access (location, contacts, etc.). | Keep each tier's data where its feature needs it: in the worked example the free tier stays **on-device only** and Firestore sync (paid tier) is justified by the user-requested sync feature. Don't request permissions the app's core feature doesn't need. Maps to **GDPR Art. 5(1)(c)**. | [settled — AP "Privacy and apps" + GDPR Art. 5(1)(c), verified 2026-11-19] |
| G6 | **Readable / accessible privacy statement** | AP expects a **privacy statement (privacyverklaring)** that is readable, understandable and accessible ("Privacy bij apps"). On functional cookies, the AP's Cookies page adds: "You can find this information, for example, in the privacy statement of the website or app." | The app's PP must be reachable **in-app and pre-install** (store listing), plain-language, and list every data category + SDK (for the worked example: Firebase Auth/Firestore/Analytics/Crashlytics/Cloud Functions, RevenueCat). Maps to **GDPR Arts. 12–14**. | [settled — AP "Privacy and apps" + AP "Cookies" + GDPR Arts. 12–14, verified 2026-11-19] |
| G7 | **Don't change purposes / scope-creep** | (See G3.) The AP page supports the purpose-change rule only; treating undisclosed expansion as a breach of the transparency + consent rules is this suite's reading. | Version the PP; trigger re-consent on material change (e.g. by bumping a terms-version constant such as `kTermsVersion`). | [settled — AP "Privacy and apps", verified 2026-11-19] |

---

## 3. Analytics & device telemetry — AP's opt-IN position (the load-bearing NL rule)

For an app that ships third-party analytics or crash SDKs, this is the single highest-impact NL-specific finding.

| Item | Rule | Tier |
|---|---|---|
| Device-access consent rule | **Tw Art. 11.7a / ePrivacy Art. 5(3):** storing or reading information on a user's terminal equipment requires **prior consent** unless it is **strictly necessary** for a service **explicitly requested** by the user. EDPB Guidelines 2/2023 confirm this covers **any** device storage/access (SDK identifiers, SharedPreferences), not just browser cookies. | [settled — EDPB Guidelines 02/2023, verified 2026-11-18] |
| NL analytics exemption (narrow) | Tw 11.7a lid 3(b) has a narrow **analytics exemption** (no prior consent) for collecting information on the quality or effectiveness of the service with no or minor privacy consequences (see `eprivacy-cookiewet.md` §3). Secondary sources read it as met **only if ALL** of: (1) first-party only; (2) IP anonymised/masked; (3) **no** cross-site/cross-app tracking; (4) **no** data shared with third parties for their own purposes; (5) minimal privacy impact (solely measuring quality/performance). These five conditions are not on the AP's pages (checked 2026-11-19), nor in the statute. The AP's own published test: limited analytics cookies with "geen of geringe gevolgen" for privacy need no consent (Cookies page, 16 Oct 2026); on its cookie-banner page (9 Nov 2026), functional and/or limited analytics cookies need no consent and rest on legitimate interest ("gerechtvaardigd belang"), while analytics cookies "met meer dan een geringe impact op de privacy" require consent. | [settled — AP "Cookies" (16 Oct 2026) + AP "Vuistregels heldere cookiebanners" (9 Nov 2026), verified 2026-11-19] [verify — five conditions per secondary sources; not on the AP's pages, checked 2026-11-19] |
| **AP's GA4 / "cookie letter" position** | Secondary sources (turing.law) report that the AP took the position (in a **"cookie letter"** on Google Analytics 4; no AP page by that name was found on 2026-11-19) that **standard GA4 — and by extension Firebase Analytics in default config — does NOT qualify** for the exemption, because data is shared with Google for Google's own purposes, **failing condition (4)**. Therefore such telemetry needs **prior opt-IN consent** in NL. | [verify — secondary source (turing.law), 2026-06-06] [verify — source blocked 2026-11-19: the AP's Google Analytics documents (ambtsbericht of 11 Dec 2025 and two Woo decisions) sat behind a CAPTCHA; no readable AP page names GA4 and AP search finds no "cookie letter"; the AP's general test (vuistregels, 9 Nov 2026) is "more than minor privacy impact → consent"; GA4 specifics rest on turing.law only] |
| Legitimate interest does NOT cure it | A **GDPR Art. 6(1)(f) legitimate-interest** basis for analytics does **not** override the **Art. 5(3) / Tw 11.7a device-access consent** requirement. The consent gate is a separate, prior obstacle. | [settled — ePrivacy 5(3) is lex specialis to GDPR Art. 6, EDPB Opinion 5/2019, verified 2026-11-18] |
| **Verdict for a Firebase app** | Default Firebase Analytics needs prior opt-in in NL: it stores and reads an app-instance identifier (and on iOS the IDFV) on the device, which needs consent under Tw 11.7a(1) and ePrivacy Art 5(3); the analytics exemption of Tw 11.7a(3)(b) requires "geen of geringe gevolgen" for privacy, which an identifier linked to a user ID and sent to Google does not safely meet. The conclusion rests on the statute; the AP's GA4 position supports it but could not be read. | [settled — Tw 11.7a(1), (3)(b), wetten-overheid.nl mirror, verified 2026-11-19; ePrivacy Art 5(3) + EDPB Guidelines 2/2023, verified 2026-11-18] [verify — source blocked 2026-11-19: AP GA4 position; the AP's Google Analytics documents sat behind a CAPTCHA] |

> **Review rule:** If the app initialises Firebase Analytics/Crashlytics (or any non-essential telemetry SDK) before an affirmative
> consent gate, that is a **finding**. Acceptable remediation: gate telemetry behind a
> pre-init opt-in; until consented, do not call `setAnalyticsCollectionEnabled(true)` /
> `setCrashlyticsCollectionEnabled(true)`. The withdrawal path (G4 / Art. 7(3)) must also exist.
>
> **Limit of this verdict:** opt-in needs no further review. A setup that relies on the Tw 11.7a(3)(b)
> analytics exemption instead of consent (e.g. no user ID, no IDFV, Google sharing off, EU-only) is
> untested; whether it meets "geen of geringe gevolgen" is `[low-confidence — reliance on the
> analytics exemption instead of consent; LEGAL REVIEW REQUIRED]` and gets no verdict here
> (`legal-guardrails.md` §5, carve-out 3).
>
> **Strictly-necessary carve-out (still allowed without consent):** purchase/entitlement
> processing via RevenueCat + the store, Firebase Auth session, and Firestore **sync that the
> paid-tier user explicitly requested** are arguably "strictly necessary for a service explicitly
> requested" — but **analytics/crash telemetry is not** and must stay behind the opt-in.
> [verify — boundary is fact-specific; document the per-SDK necessity analysis]

---

## 4. Children's apps — the AP's extra rules

NL sets the **digital-consent age at 16** (the maximum the GDPR Art. 8(1) allows). The UAVG
fixes 16; below 16 the **holder of parental responsibility must consent**.

| # | AP / NL rule | Application (worked example) | Tier |
|---|---|---|---|
| C1 | **Age of valid consent = 16.** Children under 16 **cannot** give valid consent; a parent/guardian must consent for processing their data. **Since 1 Sep 2026** (Verzamelwet gegevensbescherming) a child aged **12 or older may withdraw** that consent themselves: "Kinderen van 12 jaar of ouder mogen zelf de toestemming intrekken." | A 16+ self-attestation checkbox (recording a confirmation timestamp) is the right pattern for an app that is **not** targeting under-16s and obtains an age statement. An app that does serve under-16s must let a child of 12+ withdraw consent without the parent. | [settled — GDPR Art. 8(1) + UAVG (NL = 16) + AP "Grondslag toestemming" (updated 17 Sep 2026), verified 2026-11-19] |
| C2 | **No email (or any data) from an under-16 without parental consent.** AP: "An app is **not allowed**, for example, **to ask for an email address without having obtained consent from the parents**." | Because sign-up (email/Google) collects email, an app that **knowingly** serves under-16s would need verifiable parental consent. The mitigation for an adult-facing app = the 16+ gate; it must not market to children. | [settled — AP "Privacy and apps", verified 2026-11-19] |
| C3 | **No child-targeted advertising using children's data.** AP: "Apps mogen geen gegevens van kinderen gebruiken voor specifieke op een kind gerichte advertenties." (NL page, 19 May 2026; the older EN page says "children under the age of 16"). | An app that shows no ads and collects no advertising ID (`AD_ID` stripped) is compliant by design; an app with ads must keep children's data out of child-targeted advertising. | [settled — AP "Privacy bij apps", verified 2026-11-19] |
| C4 | **Child-appropriate language.** Where an app targets children, "information about the app must be offered in a simple manner, with use of language that is in line with the age of the children." | Not directly triggered (16+ gate), but the readability standard (G6) still applies generally. | [settled — AP "Privacy and apps", verified 2026-11-19] |

> **Review rule:** If the app's store listing, age rating, or copy could be read as
> **targeting under-16s**, the 16+ attestation is **insufficient** — verifiable parental
> consent (Art. 8(2)) would be required. Confirm the IARC/age rating and marketing are 16+/adult
> framed, and that no data is requested before the age gate.

---

## 5. The AP as the authority to NAME in the Privacy Policy

| Use | Requirement | Tier |
|---|---|---|
| **Art. 13(2)(d) complaint right** | The PP must inform the user of the **right to lodge a complaint with a supervisory authority**. Name the **Autoriteit Persoonsgegevens (AP)** and link it. | [settled — GDPR Art. 13(2)(d), verified 2026-11-18] |
| AP complaint route (for PP copy) | Direct users to the AP's complaint mechanism (the AP "Tip ons" / complaint form on its site) and note they may complain to the AP of their habitual residence/place of the alleged infringement. | [verify — exact current AP complaint-page URL/label] |
| **Art. 33 breach notification — the authority** | A controller must notify a personal-data breach to the **competent supervisory authority** — for an NL-established controller, the **AP**. | [settled — GDPR Art. 33(1), verified 2026-11-18] |
| **72-hour deadline** | Notify the AP **without undue delay and, where feasible, within 72 hours** of becoming aware, unless the breach is unlikely to result in a risk to rights/freedoms. Late notice needs a documented justification. | [settled — GDPR Art. 33(1) + AP data-breach page, verified 2026-11-19] |
| **Channel = the form/portal only (meldloket)** | Breaches must be reported via the AP's **online data-breach notification form (meldloket)**. AP: "You **cannot call** the authority to report your data breach, **nor can you send your notification by post or email**." | [settled — AP "This is how you report a data breach", verified 2026-11-19] |
| Notification content (Art. 33(3)) | Where possible: nature of the breach + categories/approx. number of data subjects and records; DPO/contact point; likely consequences; measures taken/proposed. | [settled — GDPR Art. 33(3), verified 2026-11-18; the AP page sends notifiers to its "Questionnaire personal data breach notification form" and asks for the number of affected data records, verified 2026-11-19] |
| **Notifying data subjects (Art. 34)** | If the breach is likely to result in a **high risk** to individuals, the controller must also inform the **affected individuals without undue delay**, in plain language. | [settled — GDPR Art. 34(1)–(2), verified 2026-11-18] |
| Records of all breaches (Art. 33(5)) | The controller must **document all breaches** (facts, effects, remedial action), reportable or not, so the AP can verify compliance. Keep an internal breach register. | [settled — GDPR Art. 33(5), verified 2026-11-18] |

> **Eenmanszaak note:** a sole-trader publisher (as in the worked example) has **no DPO** (not required — no large-scale or
> special-category core processing under Art. 37). In the Art. 33(3) notification, give the
> **owner/controller's contact** as the contact point, not a DPO.

---

## 6. How this maps onto an app's actual stack (the worked example's stack; build the same table for the app under review)

| Stack element | AP/NL position | Required state for SHIP |
|---|---|---|
| Firebase **Analytics** (default) | Non-essential device telemetry → **opt-in** (Tw 11.7a + ePrivacy 5(3), §3) | Gate before init; PP basis = **consent (Art. 6(1)(a))**, not legitimate interest |
| Firebase **Crashlytics** | Same as Analytics → **opt-in** | Same gate; do not init pre-consent |
| Firebase **Auth / Firestore (paid-tier sync)** | Arguably strictly-necessary for the user-requested sync/account service | Basis = **contract (Art. 6(1)(b))**; document necessity |
| **RevenueCat + store billing** | Necessary to provide the purchased subscription | Basis = **contract (Art. 6(1)(b))**; name RevenueCat + Apple/Google as recipients/processors |
| **Age attestation (16+)** | C1/C2 satisfied by the gate; **separate** consent (G2) | Own checkbox; records a timestamp; not bundled |
| **Withdrawal/immediate-delivery ack** | Distinct consumer/consent surface (G2) | Own unticked checkbox; records a timestamp |
| **Device region** | EU `europe-west` keeps processing in-EU (helps Chapter V) | State EU hosting in PP; flag any non-EU sub-processor (Crashlytics/RevenueCat US legs) for transfer-mechanism review |
| **PP accessibility (G6)** | In-app + store listing, plain language | Confirm both surfaces serve the current version |
| **Supervisory authority named** | AP (§5) | PP §complaint-rights names + links the AP |
| **Breach runbook** | AP meldloket, 72h, form-only (§5) | Runbook points to the AP online form; no email/phone route |

---

## 7. Quick review checklist (AP/NL layer)

- [ ] **Telemetry is opt-IN**, gated before Firebase Analytics/Crashlytics init (not opt-out, not legitimate-interest). [§3]
- [ ] **Consents are unbundled** — age, telemetry, withdrawal-ack each separate. [G2]
- [ ] **Withdrawal** of consent is available in-app and stops future processing. [G4 / Art. 7(3)]
- [ ] **Data minimisation** — no permissions/data beyond what the app's core feature + sync need; free tier on-device. [G5]
- [ ] **PP is readable + accessible** in-app and on the store listing; lists every SDK/recipient. [G6]
- [ ] **Purposes are fixed + versioned**; material change triggers re-consent. [G3/G7]
- [ ] **16+ gate** present; no data requested from under-16s; not marketed to children. [§4]
- [ ] **AP named** as supervisory authority for the Art. 13(2)(d) complaint right. [§5]
- [ ] **Breach runbook** = AP online **meldloket** form only, 72h, Art. 33(3) content, Art. 34 high-risk notice, internal register. [§5]
- [ ] Cookie/device-storage wording does **not** wrongly claim the AP already replaced the ACM for Tw 11.7a placement supervision. [§1]

---

## 8. Source register

| Source | URL | Backs |
|---|---|---|
| AP — Privacy and apps (EN) | https://www.autoriteitpersoonsgegevens.nl/en/themes/internet-and-smart-devices/smartphone-and-apps/privacy-and-apps | G1–G7, §4 (C1–C4) |
| AP — Privacy bij apps (NL, updated 19 May 2026) | https://www.autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/smartphone-apps/privacy-bij-apps | G1–G7, C2–C4 (C3 wording) |
| AP — Grondslag toestemming (NL, updated 17 Sep 2026) | https://www.autoriteitpersoonsgegevens.nl/themas/basis-avg/avg-algemeen/grondslag-toestemming | C1 (age 16; withdrawal by a child of 12+ since 1 Sep 2026) |
| AP — Cookies (EN) | https://www.autoriteitpersoonsgegevens.nl/en/themes/internet-and-smart-devices/cookies | §1 cookie split, G6 |
| AP — Cookies (NL, updated 16 Oct 2026) | https://www.autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies | §3 "geen of geringe gevolgen" test |
| AP — Vuistregels heldere cookiebanners (NL, updated 9 Nov 2026) | https://www.autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies/vuistregels-heldere-cookiebanners | §1 cookie split, §3 limited vs. more-than-minor analytics |
| AP — Google Analytics documents (ambtsbericht 11 Dec 2025; Woo decisions 9 Jan 2025, 9 Sep 2025) | https://www.autoriteitpersoonsgegevens.nl/documenten/ambtsbericht-ap-over-google-analytics | §3 GA4 (behind a CAPTCHA on 2026-11-19; not read) |
| AP — Questionnaire personal data breach notification form (EN) | https://www.autoriteitpersoonsgegevens.nl/en/documents/questionnaire-personal-data-breach-notification-form | §5 notification content |
| AP — This is how the AP monitors the use of cookies (EN) | https://www.autoriteitpersoonsgegevens.nl/en/themes/internet-and-smart-devices/cookies/this-is-how-the-ap-monitors-the-use-of-cookies | §3 enforcement |
| AP — Voorstel AP toezicht cookies (proposal, 26 Mar 2025) | https://www.autoriteitpersoonsgegevens.nl/documenten/voorstel-ap-toezicht-cookies | §1 proposed transfer from ACM |
| AP — Legal basis of consent (EN) | https://www.autoriteitpersoonsgegevens.nl/en/themes/basic-gdpr/gdpr-basics/legal-basis-of-consent | G2, G4 |
| AP — EDPA joint opinion on mobile apps (news) | https://autoriteitpersoonsgegevens.nl/en/news/european-data-protection-authorities-publish-their-joint-opinion-mobile-apps-free-and-informed | G1–G4 (informed consent) |
| AP — This is how you report a data breach (EN) | https://www.autoriteitpersoonsgegevens.nl/en/themes/security/data-breaches/this-is-how-you-report-a-data-breach | §5 meldloket / form-only / 72h |
| EDPB Guidelines 2/2023 (tech scope of Art. 5(3) ePrivacy) | https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf | §3 device-access scope |
| turing.law — Dutch DPA "cookie letter" & GA4 | https://www.turing.law/the-dutch-data-protection-authoritys-cookie-letter-and-the-use-of-google-analytics-4/ | §3 GA4 opt-in |
| GDPR text (Arts. 7, 8, 12–14, 33, 34, 51) | https://gdpr-text.com/ | §2–§5 article anchors |

---

## 9. Open items for a human reviewer (verify flags)

- **[verify-pinpoint]** The 5-condition reading of the **Tw 11.7a** analytics exemption is in neither the statute nor the AP's pages (checked 2026-11-19); it rests on secondary sources. The AP's own test is "geen of geringe gevolgen" (§3).
- **[verify]** The precise per-SDK **"strictly necessary"** boundary for Auth/Firestore-sync vs. telemetry (fact-specific; document the necessity analysis) (§3 carve-out).
- **[verify]** Current AP **complaint-page URL/label** to cite in the PP's Art. 13(2)(d) clause (§5).
- **[settled, but watch]** The **ACM→AP** cookie-supervision transfer is still a **proposal** as of 2026-11-19 — re-check before relying on AP as the single Tw 11.7a authority (§1).
- **[note]** AP pages return HTTP 403 to fetchers; the lines dated 2026-11-19 were checked against the live pages in a browser. The AP's Google Analytics documents were behind a CAPTCHA that day; the lines resting on them keep their old date and are marked.
