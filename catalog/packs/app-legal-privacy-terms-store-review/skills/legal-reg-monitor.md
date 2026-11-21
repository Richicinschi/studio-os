---
name: legal-reg-monitor
description: >-
  Use when a legal/regulatory or platform-policy change might affect already-shipped legal
  docs: the law moved AFTER review and you need only the delta. Extracts
  the concrete NEW requirement from a specific change (an EU/NL ruling, an AP/EDPB guidance
  update, an Apple Review Guidelines or Google Play policy revision, an ePrivacy/cookiewet or
  DPF development), diffs each against the shipped Privacy Policy + Terms + compliance pack,
  classifies remediation as POLICY-ONLY (doc edit) / PRODUCT-CHANGE (code or UX, e.g. the
  analytics opt-in gate) / VENDOR-RENEGOTIATION (DPA or processor), and assigns owner +
  severity. Also re-validates the knowledge-base verified-dates for staleness. Trigger on: "law
  change", "policy update", "regulatory delta", "does X affect our docs", "new AP guidance",
  "Apple/Play policy change", "is our privacy policy still current", "re-check the legal
  references". Built for a Dutch/EU publisher (GDPR/AVG, Apple/Google platform rules); the
  app's own facts (publisher, processors, stack) are inputs, so it works for any app.
metadata:
  category: legal
  author: Richicinschi (Claude-authored)
  version: 1.0.0
  domain: legal / regulatory-change monitoring / compliance-delta
  jurisdiction: NL-primary, EU, with Apple/Google platform overlays
---

# legal-reg-monitor — regulatory & platform-policy delta against shipped docs

Operates under `legal-guardrails` — load its constitution + the references listed below.

This skill answers **"the law/policy changed — does it affect our already-shipped legal docs, and if so what is the smallest fix?"** It is a *delta* tool, not a full review: it extracts the **new requirement**, diffs it against current state, and classifies the **remediation effort + owner**. It never re-derives the whole doc set (use `legal-privacy-review` / `legal-terms-review` for that).

Adapts: claude-for-legal **reg-gap-analysis** (requirement-extraction table + per-requirement diff block, Apache-2.0, attributed) and simota **clause** Pattern 4 **Compliance Delta** (IDENTIFY → MAP → GAP → SUGGEST) + its effort taxonomy (MIT, re-authored). AGPL/no-license sources were not copied.

## Load before running
- Constitution: `app-legal-privacy-terms-store-review/skills/legal-guardrails.md` (tiering, the 90-day staleness rule, severity, finding format, verdicts, review footer, "no silent supplement").
- Method: `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/method/*` (attribution-tiering, finding-format, verdict-model, disclosure-grading).
- NL/EU law (load the slice the change touches — for a freshness re-check, load all):
  `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/nl-eu-law/{gdpr-articles,bw-unfair-terms,crd-withdrawal,eprivacy-cookiewet,mdr-hbnr,transfers-dpf-scc,adr-bodies,ap-guidance,dsa-trader}.md`
- Platform (load when the change is store-side): `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/platform/{apple-app-privacy,apple-review-guidelines,apple-min-eula,play-data-safety,play-policies}.md`

## Inputs
- **The change** — one of: (a) a specific delta the user names (a ruling, guidance note, ASRG/Play-policy revision, a date), or (b) **no change named** → run **freshness mode**: re-validate every `[settled — … verified <date>]` anchor in the loaded references against its verified-date and flag stale ones (verified more than 90 days before the run, `legal-guardrails.md` §1).
- **App fact sheet** (the orchestrator's Step 0 sheet; run alone, read the project first and ask only for the rest): publisher (legal form, controller, DPO or none); processors, each named, with hosting region; who sells (stores as merchants of record or the publisher); health claims; what each tier stores where. Worked case: the worked example in `legal-guardrails/references/worked-example.md` (NL eenmanszaak, sole controller, no DPO; Apple, Google Firebase in EU `europe-west`, RevenueCat, Cloudflare for DNS/email routing; stores as merchants of record; no medical claims; free tier on-device, paid tier Firestore sync).
- **Current state to diff against**: the shipped Privacy Policy + Terms (paths, languages, version from the fact sheet); the project's compliance pack, if it keeps one (RoPA, LIA, TIA, DPA register, DPF log, retention schedule, SDK inventory, breach runbook); and any store-declaration notes it keeps. Grep these; never assume — quote what they actually say.

## Workflow
1. **SCOPE the change.** Establish applicability before diffing — skip a non-applicable change with a one-line reasoned 🟢 note (no silent drop):
   - *Jurisdiction*: does it bind an NL-established controller / an EU consumer / an app on Apple/Google? (US-only state privacy laws → usually N/A; note it.)
   - *Sector/threshold*: does it bite a sole-proprietor consumer wellness app (no DPO, no large-scale special-category processing, no ads)?
   - *Dates*: capture **adoption / effective / enforcement** dates separately. A future effective date → a dated condition, not an immediate BLOCKER.
2. **EXTRACT the new requirement(s)** into the requirement table (below). One row per discrete obligation; cite the primary provision at pin-point granularity with an attribution tier. Many "new" laws are 90% of an existing one — extract only the **delta**, not the whole text.
3. **DIFF each requirement against current state.** Grep the shipped docs + pack; record verbatim what they say today; grade the gap **None / Partial / Full** (per the disclosure-grading entity-awareness rule — name the processor, never "third parties").
4. **CLASSIFY remediation effort** per gap (taxonomy below) and assign an **owner**.
5. **SEVERITY** each gap on the shared floor (🔴/🟠/🟡/🟢); a false statement about data practices or a void clause introduced by the change = 🔴; a real gap a regulator/store/consumer could act on = 🟠.
6. **EMIT** findings in the standard format + the remediation plan + (freshness mode) the verified-date hygiene table. Roll up to a verdict scoped to *this change* (does it leave the current shipped docs BLOCKED / FIX FIRST / clean for SHIP).
7. **No silent supplement**: a related issue the change surfaces but that isn't in scope → a 🟡 note, not an action.

## Requirement-extraction table (Step 2)
| # | New requirement (the delta) | Source + pin-point | Tier | Category | Effective / Enforcement |
|---|---|---|---|---|---|
Categories: **Notice** (Arts 12–14) · **Rights** (Arts 15–22) · **Lawful-basis/Consent** (Arts 6/7/8/9, ePrivacy 5(3)/Tw 11.7a) · **Security/Breach** (Arts 32–34) · **Vendor/Transfers** (Art 28, Ch. V, DPF/SCC) · **Consumer-terms** (BW 6:233/236/237, CRD/Dir 2011/83) · **Platform** (Apple ASRG/App Privacy, Play policies/Data Safety) · **Governance** (versioning, re-consent, records).

## Per-requirement diff block (Step 3–5) — adapted from reg-gap-analysis
```
[REG-<n>] <emoji> <one-line requirement title>
  Source:      <primary provision + pin-point>   Tier: [settled|verify|verify-pinpoint|low-confidence]
  Dates:       effective <YYYY-MM-DD> · enforcement <YYYY-MM-DD or "n/a">
  Requirement: <what the change now demands>
  We currently:<verbatim quote from privacy.md/terms.md §x OR compliance-pack file; "(silent)" if absent>
  Gap:         None | Partial | Full
  Remediation: POLICY-ONLY | PRODUCT-CHANGE | VENDOR-RENEGOTIATION | NEW-PROCESS
  Owner:       owner | code | jurist     (jurist ONLY for §5 carve-outs)
  Redline:     <SPECIFIC, entity-named fix — exact replacement text where possible>
  Severity:    🔴 | 🟠 | 🟡 | 🟢
  Confidence:  high | medium | low
```

## Remediation effort taxonomy (Step 4)
| Class | Means | Typical owner | Example (the worked example) |
|---|---|---|---|
| **POLICY-ONLY** | edit the PP/ToS/pack wording; bump the terms-version constant (e.g. `kTermsVersion`) if it triggers re-consent | owner (Claude drafts) | rename a supervisory authority, add an Art. 13 disclosure, drop a dead URL |
| **PRODUCT-CHANGE** | code/UX change in the app or its backend config (e.g. a Flutter app's Firebase config); the doc edit alone would be a false statement | code | the **analytics opt-IN gate** (don't init Firebase Analytics/Crashlytics pre-consent); a new consent surface; a retention/cron change |
| **VENDOR-RENEGOTIATION** | a processor DPA / sub-processor / transfer mechanism must change | owner + counterparty | re-paper a RevenueCat/Firebase Art. 28 term; add an SCC module / re-check a DPF certification for a US sub-processor |
| **NEW-PROCESS** | a recurring operational duty (a register, a periodic review, a notification routine) | owner | a new logging/records obligation; a periodic re-verification |
*Severity floor:* if the honest fix is PRODUCT-CHANGE or VENDOR-RENEGOTIATION, a POLICY-ONLY edit that papers over it is a 🔴 (false statement about data practices). Code-faithfulness dominates the doc.

## Freshness mode (verified-date hygiene) — run when no specific change is named
Re-validate the KB anchors against their `verified <date>` and the standing facts below; flag any whose date is stale (more than 90 days before the run, `legal-guardrails.md` §1) or whose underlying fact has a known pending move. Emit a table `Anchor | Reference file | Verified date | Status (current / pending / superseded) | Action`.

| Standing fact (re-confirm, don't assume) | Status (re-checked 2026-11-18 unless marked) | Watch |
|---|---|---|
| **EU ODR platform** | **Dead — shut down 2025-07-19, data deleted 2025-07-20; trader obligation lifted.** Any ToS linking `ec.europa.eu/consumers/odr` = 🔴. | Reg. (EU) 2024/3228 repealed the ODR Regulation; Dir. (EU) 2025/2647 amends the ADR Directive and has the Commission set up an information tool on redress (due 20 Apr 2026; not a dispute platform; live status not checked) — re-check `[settled — adr-bodies.md :38–:39, verified 2026-11-18]` |
| **EU-US Data Privacy Framework** | **In force** — adequacy Decision 2023/1795 (adopted 2023-07-10); upheld by the General Court in T-553/23 (2025). DPF-certified US importers ride adequacy. `[settled — transfers-dpf-scc.md :43, verified 2026-11-18]` | re-check each US sub-processor's certification at dataprivacyframework.gov; a preliminary question on the decision (C-804/25) is pending |
| **Cookiewet / analytics consent** | **AP position, as reported by secondary sources**: GA4 / default Firebase Analytics fails the Tw 11.7a exemption → **opt-IN required** in NL `[verify — source blocked 2026-11-19: AP Google Analytics documents behind a CAPTCHA; status as of 2026-06-06]`; the opt-in itself rests on Tw 11.7a(1), (3)(b) and ePrivacy Art. 5(3) (`ap-guidance.md` §3); legitimate interest does **not** cure Art. 5(3). | the **ACM→AP** single-authority transfer for Tw 11.7a is a **proposal** (2025-03-26), not yet law per the AP site on 2026-11-19 — do NOT assert it as done |
| **NL digital-consent age** | **16**: GDPR Art. 8(1) sets 16 unless a Member State lowers it, and the UAVG does not (its art. 5(1) covers consent outside Art. 8). `[settled — GDPR Art. 8(1); UAVG art. 5 (wetten.overheid.nl, in force from 1 Sep 2026), verified 2026-11-18]` | stable |
| **Apple ASRG / App Privacy + Google Play policies** | account-deletion (Apple 5.1.1(v) / Play 13327111), Data Safety, health-content, subscription-disclosure rules current. | platform policies revise frequently — have the person open the named Help/Guideline page and compare |

## Output format
1. **Header** — `# Reg delta: <change or "freshness re-check"> vs <app name> legal docs v<version> — <date>`; one-line scope verdict.
2. **Applicability** — bound / not-bound, with the jurisdiction+threshold+date reasoning (🟢 if N/A).
3. **Requirement-extraction table** (Step 2).
4. **Findings** — per-requirement diff blocks, ranked 🔴 → 🟠 → 🟡.
5. **Remediation plan** — `# | Requirement | Gap | Class | Owner | Sev | Target date`.
6. **Freshness table** (freshness mode) or a one-line "anchors current as of <date>" note.
7. **Verdict** (scoped to this change): SHIP (no impact) / FIX FIRST (conditions table) / BLOCKED (a 🔴 the change introduces into the shipped docs); per-doc grade only if the change touches that doc.
8. **Review footer** (from the constitution §5: what was checked, against which law, each source's verified date): give no verdict on the §5 carve-outs (the `[KVK]`/`[BTW]`/`[REGISTERED ADDRESS]` values, native-NL legal-idiom review, any `[low-confidence]` call); they need a lawyer or a registration first. A lawyer signs off on the whole.

## Guardrails
- **Primary-source over paraphrase.** A regulator press release or blog → `[verify]` until checked against the statute/guidance; never let a summary drive a 🔴 BLOCKED verdict.
- **Delta, not dump.** Extract only what changed; don't re-litigate clauses the change didn't touch.
- **Entity-named redlines** — name Apple / Google-Firebase / RevenueCat / Cloudflare, never "third parties".
- **Effective ≠ enforcement.** A future effective date is a dated condition, not an immediate blocker.
