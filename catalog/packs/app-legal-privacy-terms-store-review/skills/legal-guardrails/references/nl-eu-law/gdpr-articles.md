# GDPR / AVG — Backbone Article Reference (NL/EU, app-tailored)

**Scope:** the load-bearing GDPR (EU 2016/679) / AVG articles a reviewer needs to adjudicate a mobile-app Privacy Policy + ToS for an EU/NL publisher. Worked examples use the **example app** (`legal-guardrails.md` §8; apply the rules to the app under review from its fact sheet) — a Flutter breathing/mindfulness app published by a **Dutch eenmanszaak** (sole proprietor = sole controller; **no employees, no DPO**), EU-first, auto-renewing subscriptions sold **through Apple/Google** (merchants of record) via **RevenueCat** + **Firebase** (Auth, Firestore, Analytics, Crashlytics, Cloud Functions, Hosting; region `europe-west`). General wellness, **no medical claims** ("supports / may help relax"). Free tier = **on-device data only**; Pro = **Firestore sync**.

**Citation tiers used below:**
- `[settled — <source>, verified 2026-06-06]` — confirmed against the primary source fetched this run.
- `[verify]` — believed correct, not confirmed this run.
- `[verify-pinpoint]` — right substance, exact article/paragraph/letter still to pin.
- `[low-confidence]` — novel / contested / fact-specific.

> NL note: the GDPR is implemented in the Netherlands by the **UAVG** (*Uitvoeringswet Algemene verordening gegevensbescherming*). The supervisory authority ("toezichthouder") is the **Autoriteit Persoonsgegevens (AP)**. The regulation itself is identical EU-wide; the UAVG sets the NL-specific options (notably the Art 8 child-consent age).

---

## Quick-reference matrix

| Art | Topic | The one rule (worked: example app) |
|---|---|---|
| 6 | Six lawful bases | Pick **ONE** basis per purpose. Core delivery = **6(1)(b)** contract. Analytics/crash = **consent** (6(1)(a)), not 6(1)(f) — ePrivacy 5(3) bites first. |
| 7 | Consent conditions | Demonstrable, unbundled, plain-language, **as easy to withdraw as to give**, no pre-ticked boxes. |
| 8 + UAVG | Child consent age | **NL = 16** (UAVG took the max of the 13–16 band). A 13+ gate is **non-compliant** for an NL publisher. |
| 9 | Special-category / health | Bare session logs **arguably not** Art 9 *if no health/mood/stress inference*. Any scoring/inference → **9(2)(a) explicit, separate consent**. |
| 12 / 15–22 | Data-subject rights + SLA | Name all rights; **respond within 1 month** (+2-month extension). |
| 13 | Privacy-notice content | **12-point** mandatory checklist (1(a)–(f), 2(a)–(f)). Missing any one = incomplete notice. |
| 28(3) | Processor DPA clauses | **Eight** mandatory clauses (a)–(h) in every sub-processor contract. |
| 30(5) | RoPA exemption | <250 employees but **"not occasional"** → RoPA is **MANDATORY** here (carve-out (ii)). |
| 33 / 34 | Breach notification | **72h** to the AP; high risk → also notify users; **34(3)(c)** public-notice fallback for indies. |
| 35 | DPIA | No mandatory trigger likely, **but document why** (screening memo). |

---

## Article 6 — Lawfulness of processing (the six bases)

### The six lawful bases (Art 6(1)) `[settled — gdpr-info.eu/art-6, verified 2026-06-06]`

| Letter | Basis | Exact trigger wording |
|---|---|---|
| (a) | **Consent** | "the data subject has given consent to the processing of his or her personal data for one or more specific purposes" |
| (b) | **Contract** | "necessary for the performance of a contract to which the data subject is party or in order to take steps at the request of the data subject prior to entering into a contract" |
| (c) | **Legal obligation** | "necessary for compliance with a legal obligation to which the controller is subject" |
| (d) | **Vital interests** | "necessary in order to protect the vital interests of the data subject or of another natural person" |
| (e) | **Public task** | "necessary for the performance of a task carried out in the public interest or in the exercise of official authority…" |
| (f) | **Legitimate interests** | "necessary for the purposes of the legitimate interests pursued by the controller or by a third party, **except where such interests are overridden by the interests or fundamental rights and freedoms of the data subject** … in particular where the data subject is a child" |

- **One basis per purpose.** Each distinct processing purpose in the RoPA / privacy notice must name **exactly one** Art 6 basis (Art 13(1)(c) makes stating it mandatory). Do not "stack" bases as a hedge. `[settled — gdpr-info.eu/art-6 + EDPB practice, verified 2026-06-06]`
- **6(1)(f) is the only basis with a balancing test** → it requires a documented **Legitimate Interests Assessment (LIA)** (purpose / necessity / balancing). `[settled — gdpr-info.eu/art-6, verified 2026-06-06]`
- **6(1)(f) is UNAVAILABLE** in three situations relevant here:
  1. **Device-side analytics/telemetry where ePrivacy Art 5(3) bites** — the *reading/writing of information on the device* needs **prior consent**; 6(1)(f) cannot launder away that consent. 6(1)(f) at most governs the *downstream* processing after consent is obtained. `[settled — Art 6 text + ePrivacy 5(3) interaction, verified 2026-06-06]` (see ePrivacy/cookiewet reference)
  2. **Children** — the recital text singling out children as overriding cautions against 6(1)(f) for child-directed processing. `[verify-pinpoint]` (Recital 38)
  3. **Art 9 special-category (health) data** — Art 9 needs its **own** condition (9(2)(a) explicit consent); 6(1)(f) does not satisfy it. `[settled — Art 9 supremacy over Art 6, verified 2026-06-06]`
- **6(4)** purpose-compatibility test (for re-using data for a new purpose without fresh consent/legal authority) weighs: link between purposes; collection context + controller–subject relationship; nature of data (esp. special categories); consequences for subjects; safeguards (encryption/pseudonymisation). `[settled — gdpr-info.eu/art-6, verified 2026-06-06]`

### Worked lawful-basis map (the model answer for the example app; build the same map for the app under review)

| Purpose | Lawful basis | Notes |
|---|---|---|
| Account creation, auth, subscription delivery, Pro Firestore sync | **6(1)(b) contract** | Core service the user signed up for. No consent toggle needed. |
| RevenueCat / Apple-Google receipt validation & entitlement | **6(1)(b) contract** | Necessary to deliver the paid service. |
| Crash diagnostics (Crashlytics) | **6(1)(a) consent** | Device-read → ePrivacy 5(3) → opt-in. The in-app opt-out toggle is the withdrawal mechanism. |
| Product analytics (Firebase Analytics) | **6(1)(a) consent** | Same as above; **not** 6(1)(f). |
| Legal / fiscal record-keeping (subscription invoices) | **6(1)(c) legal obligation** | Dutch fiscal-retention duty. `[verify]` |
| Security / fraud prevention (server logs) | **6(1)(f) legitimate interests** | Permissible *only* for server-side processing, with an LIA on file. |

> **Reviewer red flag:** a privacy notice that bases analytics or crash reporting on "legitimate interest" instead of consent is **wrong** for an app where the SDK reads/writes device storage — flag it.

---

## Article 7 — Conditions for consent

`[settled — gdpr-info.eu/art-7, verified 2026-06-06]`

| Para | Rule | Exact wording (key phrase) |
|---|---|---|
| 7(1) | **Demonstrable** | controller "shall be able to demonstrate that the data subject has consented" |
| 7(2) | **Distinguishable + plain language** | request must be "clearly distinguishable from the other matters, in an intelligible and easily accessible form, using clear and plain language" |
| 7(3) | **Withdrawable; prior processing stays valid** | "It shall be as easy to withdraw as to give consent"; withdrawal does not affect prior lawful processing; subject must be informed of the withdrawal right **before** consenting |
| 7(4) | **Freely given / no bundling** | service must not be "conditional on consent to the processing of personal data that is not necessary for the performance of that contract" |

**Operational consent rules (reviewer checklist):**
- **No pre-ticked boxes.** Consent must be an unticked, **affirmative opt-in action** (a deliberate tick/tap). `[settled — Art 7 + Recital 32, verified 2026-06-06]`
- **No bundling into ToS acceptance.** Each consent (analytics, crash, age, withdrawal-waiver) must be **separate** from blanket "I accept the Terms" acceptance. `[settled — Art 7(2)/(4), verified 2026-06-06]`
- **Symmetric withdrawal.** If consent is granted with one tap, withdrawal must be ≈ one tap. `[settled — Art 7(3), verified 2026-06-06]`
- **Log it.** Store timestamped proof (e.g. `ageConfirmedAt`, `withdrawalConsentAt`, analytics-toggle state). `[settled — Art 7(1), verified 2026-06-06]`

**Application (worked: example app):**
- Analytics/crash opt-**in** toggle (or opt-out clearly presented at first run) + Settings off-switch ⇒ satisfies 7(3) easy-withdrawal.
- **16+ self-attestation checkbox** and **paywall withdrawal-waiver checkbox** must each be **unticked**, **separate** affirmative actions — *not* folded into the single ToS checkbox. The app's `ageConfirmedAt` / `withdrawalConsentAt` records satisfy the 7(1) demonstrability duty.
- The right to withdraw must be stated **before** consent is taken (Art 7(3) + Art 13(2)(c)).

---

## Article 8 — Child's consent for information-society services (+ Dutch UAVG)

`[settled — gdpr-info.eu/art-8, verified 2026-06-06]`

- **8(1)** Where consent (Art 6(1)(a)) is the basis for an information-society service offered directly to a child, processing is lawful only if the child is **at least 16**. Below 16, it is lawful "only if and to the extent that consent is given or authorised by the holder of parental responsibility." **Member States may lower the age, but not below 13.**
- **8(2)** The controller must "make **reasonable efforts to verify** … that consent is given or authorised by the holder of parental responsibility … **taking into consideration available technology**."
- **8(3)** Does not affect Member-State general contract law on a child's capacity to contract.

### NL-specific: the age is **16**

The Netherlands set the digital-consent age at the **maximum of the band — 16 — via the UAVG**. There is **no lower Dutch carve-out**. `[settled — harvest notes / UAVG, verify-pinpoint exact UAVG article]`

> **Reviewer rule:** for an NL-first publisher relying on any Art 6(1)(a) / Art 9(2)(a) consent, the sign-up + notice must enforce a **16+ gate**, not 13+. **A 13+ gate is non-compliant for an NL-first app.** A 16+ self-attestation checkbox (the example app's) is correctly calibrated; it is the pragmatic minimum (true under-16 targeting would require *verifiable parental consent* per 8(2), which an app that does not target children does not do and does not need).

---

## Article 9 — Special categories of personal data (health) — **the key judgement call**

### 9(1) — the prohibition `[settled — gdpr-info.eu/art-9, verified 2026-06-06]`

Processing is **prohibited** of data revealing: racial/ethnic origin; political opinions; religious/philosophical beliefs; trade-union membership; **genetic data**; **biometric data for unique identification**; **data concerning health**; data concerning sex life or sexual orientation.

### 9(2)(a) — the explicit-consent gateway `[settled — gdpr-info.eu/art-9, verified 2026-06-06]`

"the data subject has given **explicit consent** to the processing of those personal data for **one or more specified purposes** …"

(Other lifts 9(2)(b)–(j): employment/social-security; vital interests; non-profit activities; manifestly-public data; legal claims; substantial public interest; preventive/occupational medicine; public health; archiving/research/statistics. **None apply to a consumer wellness app like the example app** — only 9(2)(a) is realistically available.)

### The inference nuance (decide this explicitly for every sign-off)

- **Inferred health data is Art 9 data even if the inputs were not.** If usage/behavioural data is analysed to **estimate stress, anxiety, sleep, mood, or wellbeing**, the **output is health data** and Art 9 applies. `[verify — regulator/EDPB + commentary position; not a verbatim article rule]`
- **Bare session logs (technique, duration, timestamp) are arguably NOT Art 9** **if the app makes NO health/stress/mood inference and shows no scoring/labels.** `[low-confidence — fact-specific; defensible but not statutory black-letter]`
- **The no-medical-claims framing is load-bearing.** The general-wellness posture ("supports / may help relax"; never "treats / cures / diagnoses / prevents") is what keeps a wellness app (like the example app) **defensibly out of Art 9**. If the copy drifts into health claims or the data model adds scoring, the analysis flips. `[low-confidence — but this is the crux of the sign-off]`

### Art 9 sign-off procedure (for a wellness app)

1. **Scan** the data model + all user-facing copy for any health/stress/mood **inference, score, label, or trend** (e.g. "your calm score", "anxiety down 20%").
2. **If found** → Art 9 triggers → require **9(2)(a) explicit, separate consent** (a *distinct* interaction, not bundled into ToS/privacy acceptance) **and** surface it in privacy-notice §3.
3. **If absent** → **document the "no health inference → not Art 9" reasoning** in the LIA/DPIA so the conclusion is defensible on audit. Cross-check the health-disclaimer wording stays inference-free.

> **Reviewer red flag:** any wellness "score", mood graph, or stress-trend feature without explicit Art 9 consent. Also flag any privacy notice that *claims* health data is processed but provides only ordinary consent.

---

## Articles 12 + 15–22 — Data-subject rights and the response deadline

`[settled — gdpr-info.eu/art-12 & 15-22, verify-pinpoint exact paragraph anchors per article]`

| Art | Right | Operationalisation (worked: example app) |
|---|---|---|
| 15 | **Access** | Provide account/session data on request (email + in-app). |
| 16 | **Rectification** | Edit account fields. |
| 17 | **Erasure** ("right to be forgotten") | **In-app account-deletion flow** (soft-delete + 30-day grace + `purgeExpiredDeletions` cron) — store-mandated anyway. |
| 18 | **Restriction** | Stop processing on request (manual for an indie). |
| 20 | **Portability** | Export of session history (machine-readable). |
| 21 | **Object** | Honour objection to consent-based processing (= the analytics/crash off-switch). |
| 22 | **Automated individual decision-making / profiling** | An app that makes **no** such decisions (the example app) → state "not applicable / we do not carry out automated decision-making". |

**Response deadline (Art 12(3)):** act on a request "without undue delay and **in any event within one month**"; extendable by **two further months** for complexity/volume, with **notice to the subject within the first month** explaining the extension. `[settled — gdpr-info.eu/art-12, verified via harvest 2026-06-06; verify-pinpoint = Art 12(3)]`

**Reviewer checks:**
- All applicable rights named in the PP (Art 13(2)(b)).
- A **working channel** to exercise them (email + in-app deletion).
- Stated SLA **matches the 1-month rule** — flag any PP promising a different window (e.g. "30 days" is fine; "within 90 days" as the default is not; "instantly" over-promises).
- The **right to lodge a complaint with the AP** is stated (Art 13(2)(d)).

---

## Article 13 — Mandatory privacy-notice content (the 12-point checklist)

`[settled — gdpr-info.eu/art-13, verified 2026-06-06]`

A privacy notice for data **collected from the data subject** MUST contain **all** of:

| # | Ref | Required element | Content (worked: example app) |
|---|---|---|---|
| 1 | 13(1)(a) | **Who the controller is and how to reach it** (and its representative, if it has one) | The eenmanszaak: owner name / trade name, **KvK number**, registered address, contact email. |
| 2 | 13(1)(b) | **How to reach the DPO**, if one is appointed | **No DPO** (not required for a solo eenmanszaak) → state "no DPO appointed; contact the controller at …". `[verify — Art 37 trigger not met]` |
| 3 | 13(1)(c) | **What each processing is for, and the ground it rests on** | Map each purpose to its Art 6 basis (see Art 6 table above). |
| 4 | 13(1)(d) | **The interest pursued**, whenever 6(1)(f) is the ground | Only for server-side security/fraud — name the interest. |
| 5 | 13(1)(e) | **Who gets the data** (by name, or at least by kind) | Apple, Google, **RevenueCat**, **Firebase / Google Cloud** (EU region). |
| 6 | 13(1)(f) | **Whether data leaves the EEA, and on what footing** (adequacy decision / Art 46–49 safeguards) | US sub-processors under **EU-US DPF** and/or **SCCs (2021)** — name the mechanism. |
| 7 | 13(2)(a) | **How long data is kept** (or the rule that sets it) | State per data category (e.g. account data while active + grace; fiscal records 7 yrs). |
| 8 | 13(2)(b) | **The user's rights over the data** (access, rectification, erasure, restriction, objection, portability) | List all (see Art 15–22). |
| 9 | 13(2)(c) | **That consent can be withdrawn at any time**, where processing rests on it | Reference the analytics/crash off-switch. |
| 10 | 13(2)(d) | **That the user can complain to the regulator** (a supervisory authority) | Name the **Autoriteit Persoonsgegevens** (autoriteitpersoonsgegevens.nl). |
| 11 | 13(2)(e) | Whether the user is **obliged to give the data** (by law or by contract), and what follows if they don't | E.g. account data is contractually necessary to use the service. |
| 12 | 13(2)(f) | **Whether decisions are automated or the user is profiled**, and if so the logic and its effect on the user | State **none** (Art 22 N/A). |

**Also:** **13(3)** — if data is later processed for a *new* purpose, inform the subject **beforehand**. **13(4)** — the duty falls away only insofar as the subject **already has** the information. `[settled — gdpr-info.eu/art-13, verified 2026-06-06]`

> **Reviewer rule:** a privacy notice **missing any one of the 12** is incomplete. Grep the PP for each element; report gaps. (For data obtained *indirectly* the parallel checklist is **Art 14** — not needed by an app that collects directly from the user, as the example app does. `[verify]`)

---

## Article 28 — Processor obligations (the eight mandatory DPA clauses)

### 28(3) — every processor contract MUST contain `[settled — gdpr-info.eu/art-28, verified 2026-06-06]`

| Clause | Obligation (exact substance) |
|---|---|
| (a) | Process **only on documented controller instructions**, including for third-country transfers, unless required by Union/MS law. |
| (b) | Ensure authorised persons are under a **confidentiality** commitment / statutory duty. |
| (c) | Take all **Article 32** security measures. |
| (d) | Respect the **sub-processor** conditions in 28(2)/(4) (prior authorisation; flow-down). |
| (e) | **Assist the controller** (by appropriate TOMs) to fulfil **data-subject-rights** requests (Chapter III). |
| (f) | **Assist** the controller with compliance under **Articles 32–36** (security, breach notification, DPIA, prior consultation). |
| (g) | At the controller's choice, **delete or return** all personal data at end of service. |
| (h) | **Make available all info** to demonstrate compliance + **allow and contribute to audits/inspections**. |

**Supporting paras:** 28(1) controllers must use only processors giving sufficient guarantees; 28(2) no sub-processor without authorisation (general authorisation requires change-notice + right to object); 28(4) sub-processors bound by the **same** obligations, with the primary processor remaining **fully liable**. `[settled — gdpr-info.eu/art-28, verified 2026-06-06]`

**Sign-off (worked for the example app's processors; list the app's own):** for **each** sub-processor confirm a signed Art-28 DPA exists covering all of (a)–(h) **and** onward-transfer terms:

| Processor | DPA instrument | Status |
|---|---|---|
| Google / Firebase / Google Cloud | **Google Cloud Data Processing Addendum (CDPA)** | Accept the current CDPA; confirms (a)–(h). `[verify]` |
| RevenueCat | **RevenueCat DPA** | Confirm signed/accepted; check sub-processor flow-down. `[verify]` |
| Apple | DPA **where Apple acts as processor** (Apple is often an *independent controller* / merchant of record for the payment) | Clarify Apple's role per stream; flag if treated solely as processor where it is actually a controller. `[low-confidence — Apple's role is split]` |

> **Reviewer red flag:** any recipient in the sub-processor register with **no DPA on file**, or a DPA missing the audit (h) or delete/return (g) clauses.

---

## Article 30 — Records of Processing Activities (RoPA)

### 30(1) controller-record contents `[settled — gdpr-info.eu/art-30, verified 2026-06-06]`

(a) controller (+ joint controller / representative / DPO) name & contact; (b) purposes; (c) categories of data subjects + categories of personal data; (d) categories of recipients; (e) third-country transfers + safeguards; (f) **where possible**, erasure time-limits per category; (g) **where possible**, a general description of the technical & organisational security measures.

**30(3)** in writing (incl. electronic). **30(4)** make available to the supervisory authority on request.

### 30(5) — the <250-employee exemption **and its three carve-outs** `[settled — gdpr-info.eu/art-30, verified 2026-06-06]`

> "The obligations … shall not apply to an enterprise or an organisation employing fewer than 250 persons **unless** the processing it carries out (i) **is likely to result in a risk to the rights and freedoms of data subjects**, (ii) **the processing is not occasional**, or (iii) **the processing includes special categories of data** as referred to in Article 9(1) or personal data relating to criminal convictions and offences referred to in Article 10."

### Worked conclusion (example app): **RoPA is MANDATORY** (despite the publisher being one person)

- A one-person eenmanszaak is far under 250 — **but** a continuously-running app processes personal data **routinely, not occasionally**, so **carve-out (ii) "not occasional" defeats the exemption**. `[settled — Art 30(5) text + EDPB/WP29 reading of "occasional", verified 2026-06-06; the "continuous app ⇒ not occasional" application is verify]`
- If **any Art 9 health inference** exists, **carve-out (iii)** independently requires a RoPA too.
- The "we're tiny, no RoPA needed" assumption is **wrong** here — cite carve-out (ii) as the reason in the sign-off.

> **Reviewer rule:** confirm a maintained RoPA exists with all 30(1)(a)–(g) fields. Do **not** accept "small publisher exemption" as a reason to skip it.

---

## Article 35 — Data Protection Impact Assessment (DPIA)

### 35(1) trigger `[settled — gdpr-info.eu/art-35, verified 2026-06-06]`

DPIA required where processing (esp. using new technologies) **"is likely to result in a high risk to the rights and freedoms of natural persons."**

### 35(3) — the three named mandatory cases `[settled — gdpr-info.eu/art-35, verified 2026-06-06]`

| Case | Wording (substance) |
|---|---|
| (a) | **Systematic + extensive evaluation/profiling** based on automated processing, on which decisions producing **legal or similarly significant effects** are based |
| (b) | Processing **on a large scale** of **Art 9** special-category (or Art 10 criminal) data |
| (c) | **Systematic monitoring of a publicly accessible area on a large scale** |

### 35(7) — minimum DPIA content `[settled — gdpr-info.eu/art-35, verified 2026-06-06]`

(a) systematic description of the processing + purposes (incl. any 6(1)(f) interest); (b) necessity & proportionality assessment; (c) risk assessment to data-subject rights/freedoms; (d) measures/safeguards/security to address the risks.

Also: **35(4)** each supervisory authority publishes its own DPIA-required list (the AP maintains a NL list — cross-check it `[verify]`); **35(10)** possible carve-out where a legal-basis impact assessment was already done.

### Worked conclusion (example app): **likely no mandatory trigger — but record a screening memo**

- A single-developer wellness app with **no profiling / no decisions with legal-or-similar effect** (fails 35(3)(a)), **no large-scale Art 9 processing** (fails 35(3)(b) given the no-inference posture), and **no public-area monitoring** (fails 35(3)(c)) likely **does not** hit a mandatory 35(3) trigger. `[low-confidence — fact-specific conclusion]`
- **But document WHY** in a short DPIA-**screening / threshold memo** rather than silently skipping it (defensibility), alongside the LIA/TIA. If **health inference at scale** is ever added, **35(3)(b)** can trigger a full DPIA.

> **Reviewer output:** a recorded determination — either "no mandatory trigger, reasoning on file" **or** "DPIA required." Cross-check against the AP's published 35(4) list.

---

## Articles 33 / 34 — Personal-data-breach notification

### 33 — notify the supervisory authority (the AP) `[settled — gdpr-info.eu/art-33, verified 2026-06-06]`

- **33(1):** notify the AP **"without undue delay and, where feasible, not later than 72 hours after having become aware of it"** — **unless** the breach is **unlikely to result in a risk** to rights/freedoms. Delay beyond 72h must be reasoned.
- **33(2):** a **processor** must inform the **controller** without undue delay on becoming aware. (For a Firebase + RevenueCat app such as the example app: rely on RevenueCat/Google breach-notice clauses in their DPAs to start your 72h clock; likewise for each of the app's own processors.) `[settled — gdpr-info.eu/art-33, verified 2026-06-06]`
- **33(3) notification content:** (a) nature of the breach incl. categories + approximate numbers of subjects and records; (b) DPO / contact-point details; (c) likely consequences; (d) measures taken / proposed (incl. mitigation).
- **33(4):** may be provided **in phases**. **33(5):** **document all breaches** (facts, effects, remedial action) regardless of notification.

### 34 — notify affected individuals `[settled — harvest notes / gdpr-info.eu/art-34, verify-pinpoint exact paragraph anchors]`

- **34(1):** where the breach is **"likely to result in a HIGH risk"** to individuals → notify the affected data subjects **without undue delay**, in clear, plain language.
- **34(3) exceptions to individual notice:**
  - **(a)** data was rendered **unintelligible** to unauthorised parties — "such as encryption";
  - **(b)** subsequent measures ensure the high risk **"is no longer likely to materialise"**;
  - **(c)** direct notice would involve **disproportionate effort** → substitute a **public communication** "or similar measure whereby the data subjects are informed in an equally effective manner."

### Application (worked: example app)

- Bake the **72h clock** into the breach runbook (clock starts at *awareness*, including awareness via a processor's 33(2) notice).
- High-risk breach → **also notify users** (in-app + email).
- The **34(3)(c) public-communication fallback** is the realistic route for a solo indie if direct contact to all users is impractical — but it is a *fallback*, not the default.
- Encryption-at-rest of Firestore data helps an **34(3)(a)** argument. `[verify]`
- The privacy notice + runbook should both **state the 72h rule and the Art 34 user-notification trigger/exceptions** so the docs match the runbook.

> **Reviewer cross-checks:** PP/runbook mention the 72h AP deadline; the high-risk user-notice trigger; the three 34(3) exceptions; and a breach **register** (33(5)).

---

## Adjudication cheat-sheet (what to flag)

1. **Analytics/crash based on "legitimate interest"** instead of consent → **wrong** (ePrivacy 5(3) + Art 6). Flag.
2. **Single combined "I accept everything" checkbox** covering ToS + analytics + age + withdrawal → **bundling**, violates Art 7(2)/(4). Flag; require separation.
3. **Pre-ticked consent box** → violates Art 7 + Recital 32. Flag.
4. **13+ age gate** for an NL publisher → violates UAVG's 16. Flag.
5. **Any wellness "score"/mood-trend without Art 9 explicit consent** → Art 9 risk. Flag.
6. **Health-claim language** ("treats/cures/diagnoses/prevents") → both an Art 9 trigger risk and a health-claim/medical-device risk. Flag.
7. **Privacy notice missing any of the Art 13 12 points** → incomplete. Flag the specific gap.
8. **Sub-processor with no DPA / DPA missing (g) or (h)** → Art 28 gap. Flag.
9. **"No RoPA, we're too small"** → wrong via Art 30(5) carve-out (ii). Flag.
10. **No DPIA screening memo at all** → not necessarily a breach, but flag the absence of *documented reasoning*.
11. **SLA for rights requests ≠ 1 month (+2 extension)** → Art 12(3) mismatch. Flag.
12. **Breach docs silent on 72h / Art 34** → flag.

---

## Sources fetched this run (primary)

- Art 6 — https://gdpr-info.eu/art-6-gdpr/ `[settled, verified 2026-06-06]`
- Art 7 — https://gdpr-info.eu/art-7-gdpr/ `[settled, verified 2026-06-06]`
- Art 8 — https://gdpr-info.eu/art-8-gdpr/ `[settled, verified 2026-06-06]`
- Art 9 — https://gdpr-info.eu/art-9-gdpr/ `[settled, verified 2026-06-06]`
- Art 13 — https://gdpr-info.eu/art-13-gdpr/ `[settled, verified 2026-06-06]`
- Art 28 — https://gdpr-info.eu/art-28-gdpr/ `[settled, verified 2026-06-06]`
- Art 30 — https://gdpr-info.eu/art-30-gdpr/ `[settled, verified 2026-06-06]`
- Art 35 — https://gdpr-info.eu/art-35-gdpr/ `[settled, verified 2026-06-06]`
- Art 33 — https://gdpr-info.eu/art-33-gdpr/ `[settled, verified 2026-06-06]`

Art 12 / 15–22 and Art 34 substance taken from the harvested distilled notes (gdpr-info.eu) — confirm exact paragraph anchors against the primary text. UAVG age-16 implementation: confirm the exact UAVG article.
