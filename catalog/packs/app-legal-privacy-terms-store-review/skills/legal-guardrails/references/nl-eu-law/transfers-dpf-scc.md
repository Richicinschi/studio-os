# International Data Transfers — GDPR Chapter V, EU-US DPF Adequacy, 2021 SCCs, TIA

Reference for adjudicating the **international-transfer** clauses of a Privacy Policy / Terms of Service.
Scope: GDPR/AVG Chapter V (Arts 44–50), the EU-US Data Privacy Framework adequacy decision (Implementing Decision (EU) 2023/1795), the 2021 Standard Contractual Clauses, and the Transfer Impact Assessment (TIA) obligation.

Worked examples use the **example app** (`legal-guardrails.md` §8: Flutter breathing/mindfulness app; Dutch *eenmanszaak*; the owner is the sole controller; no DPO; EU/NL-first; primary storage in Firebase **europe-west**; auto-renewing subscriptions sold *through* Apple/Google as merchants of record + RevenueCat middleware). The rules apply to any EU/NL consumer app: build the register in §6 from the app's own recipients (fact sheet + data-surface scan).

**Verified this run (2026-06-06):** the adequacy decision text on EUR-Lex; the DPF program-overview page; the European Commission EU-US transfers page; the RevenueCat DPA.

---

## 0. At-a-glance decision tree for the reviewer

For **every** recipient of personal data outside the EEA (each sub-processor, each platform), the PP/processing record must answer:

1. Is the recipient in an **adequate** country (Art 45)? → transfer is lawful on adequacy; name the basis.
   - The US is adequate **only** for importers **certified** under the EU-US DPF (partial/entity-level adequacy).
2. If not adequate → is there an **Art 46 safeguard** (almost always the 2021 **SCCs**)? → lawful **only with a TIA** confirming the SCCs are effective in practice.
3. Neither adequacy nor Art 46 safeguard, and no Art 49 derogation → **transfer is unlawful**; flag RED.

The privacy notice **must name the mechanism per recipient** (Art 13(1)(f)). A PP that says only "we may transfer data outside the EU" without naming adequacy/SCCs and how to obtain a copy is non-compliant.

---

## 1. GDPR Chapter V — the transfer rules

| Article | Rule | Tier |
|---|---|---|
| **Art 44** | *General principle*: any transfer to a third country/international organisation is allowed **only if** Chapter V conditions are met; the level of protection must **not be undermined**. Applies to onward transfers too. | [settled — Reg (EU) 2016/679, verify-pinpoint] |
| **Art 45** | *Adequacy decision*: transfer needs no further authorisation if the Commission has decided the third country (or a territory/sector/entity within it) ensures an **adequate** level of protection. Art 45(3) is the legal base for the DPF decision. | [settled — Impl. Dec. 2023/1795 recital cites Art 45(3), verified 2026-06-06] |
| **Art 45(3)/(4)** | Commission **monitors** developments and **periodically reviews** adequacy decisions (at least every 4 years per the post-Schrems standard); can repeal/amend/suspend. | [verify-pinpoint] |
| **Art 46** | *Appropriate safeguards* where there is no adequacy: among them **Standard Contractual Clauses** (Art 46(2)(c)), **Binding Corporate Rules** (Art 47), approved codes of conduct, certification. Requires **enforceable rights + effective remedies** for data subjects. | [settled — Reg (EU) 2016/679, verify-pinpoint] |
| **Art 47** | BCRs — intra-group transfers; not relevant to a publisher with no corporate group (e.g. a sole trader, as in the example app). | [verify] |
| **Art 49** | *Derogations* for specific situations (explicit consent, contract necessity, etc.) — **exceptions, not a routine basis**; EDPB reads them narrowly, for occasional/non-repetitive transfers. Do **not** rely on Art 49 consent as the standing basis for an ongoing sub-processor flow. | [settled — EDPB Guidelines 2/2018, verify-pinpoint] |
| **Art 13(1)(f)** | The privacy notice **must state**: the fact of the transfer, the existence/absence of an adequacy decision, **and** (for Art 46/47) reference to the appropriate safeguards **and the means to obtain a copy** of them or where they are available. | [settled — Reg (EU) 2016/679, verify-pinpoint] |

**Schrems II (C-311/18, 16 Jul 2020)** invalidated Privacy Shield and held that an exporter relying on Art 46 SCCs must **verify, case-by-case, whether the destination law provides essentially equivalent protection**, and apply supplementary measures if not — this is the legal root of the **TIA** requirement. [settled — CJEU C-311/18, verify-pinpoint]

---

## 2. EU-US Data Privacy Framework — Implementing Decision (EU) 2023/1795

**Verified against the EUR-Lex text on 2026-06-06.**

| Fact | Detail | Tier |
|---|---|---|
| Instrument | **Commission Implementing Decision (EU) 2023/1795** of 10 July 2023, pursuant to Reg (EU) 2016/679, on the adequate level of protection under the **EU-US Data Privacy Framework**. | [settled — Impl. Dec. 2023/1795, verified 2026-06-06] |
| Adopted / published | Adopted **10 July 2023**; published **OJ L 231, 20.9.2023, p. 118**. In force. | [settled — EUR-Lex, verified 2026-06-06] |
| Legal base | **Art 45(3)** GDPR. | [settled — EUR-Lex, verified 2026-06-06] |
| What it decides | The US ensures an **adequate** level of protection **for personal data transferred from the EU to US organisations certified** under the EU-US DPF Principles. It is **entity-level** adequacy — it rides on the importer's certification, not the country at large. | [settled — EUR-Lex, verified 2026-06-06] |
| Who is covered | Only US organisations that have **voluntarily self-certified** adherence with the **US Department of Commerce** and are subject to FTC or DoT investigatory/enforcement powers (recital 9). | [settled — EUR-Lex recital 9, verified 2026-06-06] |
| The list | The DoC **maintains and publishes a public list** of certified organisations (recital 52); an organisation may receive EU data **from the date it is placed on the DPF list** (recital 49). | [settled — EUR-Lex recitals 49, 52, verified 2026-06-06] |
| Surveillance safeguards | Built on **Executive Order 14086** (7 Oct 2022) "Enhancing Safeguards for US Signals Intelligence Activities" + AG Regulation; signals-intelligence access must be **necessary and proportionate** (recital 89). | [settled — EUR-Lex recitals 6, 89, verified 2026-06-06] |
| Redress | Two layers: (1) DPAs/DoC/FTC + a DPA-panel route (advice within ~60 days; org compliance within 25 days or FTC referral — recital 75); (2) the **Data Protection Review Court (DPRC)** (independent judicial review) and **binding arbitration** via the EU-US DPF Panel as last resort (recital 81). | [settled — EUR-Lex recitals 6, 66–86, verified 2026-06-06] |
| Onward transfers | Governed by the **Accountability for Onward Transfer Principle** (recital 38): a certified org passing data to a third party must ensure the **same level of protection** and bind it by contract to limited, specified purposes. | [settled — EUR-Lex recital 38, verified 2026-06-06] |
| If an org leaves the DPF | **SCCs serve as fallback** for data retained after exiting the framework (recital 55). | [settled — EUR-Lex recital 55, verified 2026-06-06] |
| Periodic review | The Commission monitors and conducts **periodic reviews** of the decision; first review took place in 2024. May suspend/repeal/amend. | [verify-pinpoint] |

### Litigation status
- **Latombe v Commission (T-553/23)** — annulment action before the EU **General Court**. The DPF decision **survived its first challenge in 2025** (the General Court did **not** annul it). A further appeal to the CJEU remains possible; the decision **remains valid and in force** as of 2026-06-06. [verify] (substance corroborated by harvested notes; exact 2025 judgment date not pinned this run)
- Operational read for the reviewer: **the DPF is currently a valid Art 45 basis.** But because a future Schrems III-style invalidation is a live risk, **best practice is to also have SCCs + a TIA as a fallback** for any US importer, even DPF-certified ones.

---

## 3. The DPF participant list — how to verify a recipient

- Administered by the **US Department of Commerce, International Trade Administration (ITA)**. [settled — dataprivacyframework.gov, verified 2026-06-06]
- Three frameworks under one program: **EU-US DPF**, **UK Extension** to the EU-US DPF, and **Swiss-US DPF**. An org must certify to each one it wants to rely on; EU-US DPF certification alone does **not** cover UK or Swiss exports. [settled — dataprivacyframework.gov, verified 2026-06-06]
- Organisations **self-certify** and must **re-certify annually** to stay current. [settled — dataprivacyframework.gov, verified 2026-06-06]
- Status: **Active** = currently certified and compliant (transfers may ride adequacy); **Inactive** = no longer participating / lapsed (adequacy **no longer** applies — fall back to SCCs). [settled — dataprivacyframework.gov, verified 2026-06-06]
- **Verification step:** search the public participant list at **dataprivacyframework.gov** by the importer's exact legal entity name. Confirm (a) **Active** status and (b) that **"EU-US"** is listed (not only Swiss/UK), and (c) that the relevant **data category** is in scope of their certification (some certify HR vs non-HR data separately). [settled — dataprivacyframework.gov, verified 2026-06-06]

> Reviewer caution: DPF certification is **per legal entity**. "Google LLC" being certified does **not** automatically certify a separately-incorporated affiliate. Always match the exact entity named in the sub-processor's DPA.

---

## 4. The 2021 Standard Contractual Clauses (Commission Implementing Decision (EU) 2021/914)

For any non-adequate / non-DPF importer, the standing Art 46 safeguard is the **2021 SCCs**.

| Module | Relationship | Relevance to an app publisher (worked: example app) |
|---|---|---|
| **Module 1** | Controller → Controller | Where a US recipient is an independent controller of the data. |
| **Module 2** | Controller → Processor | **Most common for an app publisher**: the publisher (controller) → US **processor** (e.g. RevenueCat, Firebase services on US infra, in the example app). |
| **Module 3** | Processor → Sub-processor | Only if the publisher were a processor (an app publisher acting for itself is not — it is the controller). |
| **Module 4** | Processor → Controller | Importer is a controller receiving from an EU processor. Niche. |

Tier: [settled — Impl. Dec. (EU) 2021/914, verify-pinpoint] for module structure.

Key SCC facts for clause review:
- The old (2010/2004) SCCs were **repealed**; only the **2021 SCCs** are valid for new contracts. A DPA still referencing the old SCCs is **stale → flag**. [verify-pinpoint]
- SCCs require completing **Annexes** (parties, transfer description, technical/organisational measures, sub-processor list) and choosing a **docking/clause options**. A bare "we use the SCCs" with no annexed specifics is incomplete. [verify]
- SCCs **alone are not enough** after Schrems II: they must be backed by a **TIA** and, where needed, **supplementary measures** (encryption in transit/at rest, pseudonymisation, EU data residency, transparency reporting). [settled — CJEU C-311/18 + EDPB Recs 01/2020, verify-pinpoint]

---

## 5. Transfer Impact Assessment (TIA)

A TIA is the documented **case-by-case assessment** (per Schrems II + EDPB **Recommendations 01/2020** on supplementary measures) of whether the destination country's law and practice give protection **essentially equivalent** to the EEA, and what supplementary measures are needed.

Six-step EDPB method (compressed): (1) **map** the transfers; (2) identify the **transfer tool** (DPF / SCC / etc.); (3) assess whether the third-country **law/practice** undermines that tool (esp. government access — FISA 702, EO 12333 for the US); (4) adopt **supplementary measures**; (5) take **procedural steps** to put them in place; (6) **re-evaluate** periodically. [settled — EDPB Recs 01/2020, verify-pinpoint]

**Best-practice rule (applies to any app with US recipients, including the example app):** run/record a **TIA even under the DPF**, because (a) the DPF can be invalidated on short notice (Schrems history) and (b) it documents the controller's accountability (Art 5(2)). The TIA + SCCs become the immediate fallback if the DPF falls. [settled — harvested notes corroborate; substance = EDPB Recs 01/2020, verify]

For an *eenmanszaak* with no DPO, the TIA can be **lightweight but written**: one short record per US recipient (data categories, mechanism, residency, encryption, government-access exposure, conclusion). The repo already carries a **TIA file** and a **DPF-log** — the reviewer's job is to confirm each US recipient appears there.

---

## 6. Per-recipient transfer register (the operative checklist; worked for the example app — build one row per recipient of the app under review)

The example app keeps **primary storage in Firebase europe-west** (EU region), which **minimises** but does not eliminate transfer exposure — some sub-processors and platform flows still touch US entities. For each recipient the PP/record must name the mechanism:

| Recipient | Role | US transfer? | Mechanism to record | Tier |
|---|---|---|---|---|
| **Google (Firebase: Auth, Firestore, Crashlytics, Cloud Functions, Hosting)** — data stored **europe-west** | Processor | Reduced — primary data is EU-region, but **Google LLC** (US) may process support/telemetry/sub-processing | **Google LLC is DPF-certified** → adequacy for any US leg; **also** covered by Google's SCCs as belt-and-braces. Record DPF cert (verify on list) **+** SCC Module 2. Confirm europe-west residency in the PP. | DPF-listed [verify]; verify exact entity + active status on the list |
| **Google (Firebase Analytics)** | Processor (telemetry) | Yes — Analytics data flows to Google US infra | Same DPF/SCC basis as above. **Separate NL issue:** Firebase Analytics in default config needs **prior opt-in consent** under Telecommunicatiewet 11.7a (the AP says GA4 fails the analytics exemption) — see `eprivacy-cookiewet` reference. Transfer basis ≠ lawful-collection basis. | [verify] for DPF; opt-in finding is settled-NL elsewhere |
| **Apple** (App Store / IAP / sign-in; **merchant of record** for purchases) | Mostly **independent controller** for purchase + App Store data; **processor** only where it acts for the developer | Yes — Apple US | **Apple Inc. is DPF-listed** → adequacy where Apple acts as processor; where Apple is its **own controller** (store/payment data), the transfer is governed by **Apple's** policy, not the publisher's SCCs. PP should describe Apple as a separate controller for store/payment data. Verify Apple's entity on the DPF list. | DPF-listed [verify]; verify on list |
| **RevenueCat** (subscription middleware) | Processor | **Yes** — RevenueCat is US-based; sub-processors incl. AWS, Cloudflare, Google LLC, Snowflake (mostly US) | **RevenueCat is NOT DPF-certified.** Its DPA states it relies **exclusively on the 2021 SCCs** (incl. UK Addendum + Swiss amendments). → Record **SCC Module 2 + TIA**. The PP must name **SCCs** (not DPF) for RevenueCat. | [settled — RevenueCat DPA, verified 2026-06-06] |
| **Cloudflare** (CDN / edge; appears as a RevenueCat sub-processor and may serve Hosting/edge) | Processor / sub-processor | Yes — US entity | **Cloudflare, Inc. is DPF-certified** (verify on list); also offers SCCs. Record DPF cert **or** SCC + TIA. | [verify] — verify on list |

**Reviewer red-lines for the app's PP transfer section:**
1. **RevenueCat must be named with SCCs, not DPF.** A PP that lumps RevenueCat under "DPF-certified partners" is **factually wrong → RED**. [settled — RevenueCat DPA, verified 2026-06-06]
2. Every US recipient must have **either** a verified-active DPF entry **or** SCCs+TIA. A recipient with **neither** = unlawful transfer → RED.
3. The PP must say **how a user can obtain a copy** of the SCCs / where the safeguards are available (Art 13(1)(f)). Missing = AMBER.
4. The PP should state **primary storage is EU (europe-west)** — this is true and reduces exposure; verify it is not overclaimed (some flows still reach the US). [verify]
5. Apple/Google as **merchants of record / independent controllers** for purchase data should be described as **separate controllers**, not the publisher's processors, for that data. [verify]
6. **UK / Swiss users:** if the app has UK or Swiss users, EU-US DPF certification does **not** cover them — the importer needs the **UK Extension** / **Swiss-US DPF**, or the SCCs need the **UK Addendum** / Swiss amendments. RevenueCat's DPA already includes these; confirm for any DPF-only importer. [verify]

---

## 7. Common clause defects (scanner rules)

| Defect in the PP/DPA | Verdict |
|---|---|
| "We may transfer your data outside the EU" with no named mechanism | AMBER — fails Art 13(1)(f) specificity |
| Names **Privacy Shield** as the basis | RED — Privacy Shield invalidated (Schrems II, 2020); stale |
| Names the **old 2010/2004 SCCs** | RED/AMBER — repealed; must be 2021 SCCs |
| Claims a US recipient is "DPF-certified" without it being on the active list | RED if false (e.g. RevenueCat); verify each entity |
| SCCs cited but **no TIA** on file | AMBER — Schrems II requires a TIA; document it |
| Relies on **Art 49 consent** as the standing basis for an ongoing sub-processor flow | AMBER/RED — derogations are for occasional transfers, not routine |
| No mention of how to obtain SCC copies / where safeguards are available | AMBER — Art 13(1)(f) |
| UK/Swiss users but only EU-US DPF / EU SCCs referenced | AMBER — needs UK Addendum / Swiss mechanism |

---

## 8. Verify-flags (human confirmation recommended)

- The DPF **periodic-review** cadence and the **first-review** completion date (Art 45(3)/(4) interval) — [verify-pinpoint].
- The **Latombe (T-553/23)** outcome and exact date; whether any CJEU appeal is pending — [verify].
- **Google LLC**, **Apple Inc.**, **Cloudflare, Inc.** current **Active** status on the EU-US DPF participant list at dataprivacyframework.gov, and that the **EU-US** framework (not only Swiss/UK) and the relevant data category are in scope — [verify] (DPF-listed per harvested notes; confirm live before sign-off).
- Exact **Art 44 / 45 / 46 / 49** and **2021 SCC module** pinpoints (cited by substance, not pulled from the consolidated text this run) — [verify-pinpoint].
- EDPB **Recommendations 01/2020** six-step pinpoint references — [verify-pinpoint].
- Whether any **Firebase Analytics / Crashlytics / Cloud Functions** processing actually leaves the EU region for the US in the app's current config — [verify] (factual, app-config dependent).

---

## 9. Cross-references

- `eprivacy-cookiewet.md` — Telecommunicatiewet 11.7a: Firebase Analytics needs **prior opt-in** in NL (separate from the transfer basis).
- `breach-notification.md` — GDPR Art 33/34 (a US sub-processor breach can trigger NL notification duties).
- The project's **TIA** file, **DPF-log**, and **sub-processor/SDK inventory**, wherever it keeps them — the destination for every entry in §6.
