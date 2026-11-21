---
name: legal-guardrails
description: >-
  Shared constitution + EU/NL legal knowledge base for the legal-* PP/ToS review suite.
  Invoke FIRST in any privacy-policy / terms-of-service / app-store legal review (or it is
  invoked automatically by legal-signoff-orchestrator) to load: source-attribution tiering,
  the 90-day staleness rule, the severity + verdict model (SHIP / FIX FIRST / BLOCKED), the
  finding/report format, the anti-hallucination citation rule, the review footer (what was
  checked, against which law, each source's verified date), the jurisdiction rule, and the
  GDPR/AVG + Dutch consumer-law (BW unfair-terms, cookiewet, CRD withdrawal) + Apple/Google-Play
  reference library that every other legal-* skill relies on. Use whenever reviewing or
  drafting legal documents for a mobile app, especially a Dutch/EU one. An automated review,
  not legal advice: a lawyer signs off.
metadata:
  category: legal
  author: Richicinschi (Claude-authored, owner-orchestrated)
  version: 1.0.0
  domain: legal / privacy / app-compliance
  jurisdiction: NL-primary, EU, with Apple/Google platform overlays
license: >-
  MIT, published in the Studio OS kit since v3.0.0 (2026-11-09). Two asset files carry text
  adapted from MIT sources, each with its MIT notice; method and structure taken from other
  sources, among them anthropics/claude-for-legal (Apache-2.0), are credited in
  legal-guardrails/ATTRIBUTION.md, re-reviewed 2026-11-10. Primary law quoted with last-verified dates.
---

# legal-guardrails — the suite constitution

Every `legal-*` skill operates under these rules. They override default behaviour for legal work. This skill is also the **knowledge-base hub**: the substantive law lives in `legal-guardrails/references/` and is loaded on demand by the other skills.

## 0. What this suite is (and is not)

This suite is an **automated review, not legal advice**. It gives a firm verdict on whether an app's Privacy Policy + Terms of Service are ready to ship: **SHIP**, **FIX FIRST** or **BLOCKED** (§4). Every finding names the clause it is about and the rule behind it (§3), so the verdict can be checked line by line; it does not hedge each line with "consult a lawyer". It signs nothing: a lawyer signs off.

Its limits are stated, not implied. The law tables cover the **Netherlands and the EU** (§9); store rules and the data-collection checks apply wherever the app is offered. A finding resting on a source verified more than 90 days before the run says so (§1). Three things it leaves to a Dutch-qualified *advocaat* or to a registration and gives no verdict on (the §5 carve-outs). The footer (§5) records what was checked, against which law, and when each cited source was last verified.

## 1. Source-attribution tiering (anti-hallucination)

**Never assert a legal proposition without a citation and a tier.** Tag every legal statement:

- `[settled — <source>, verified <YYYY-MM-DD>]` — well-established black-letter law confirmed against a primary source (statute/regulation/official guidance). Example: `[settled — GDPR Art. 8(1) (the UAVG does not lower it), NL age = 16, verified 2026-11-18]`.
- `[verify]` — a proposition believed correct but not confirmed against primary source this run; the reviewer must confirm before relying on it for a BLOCKED verdict.
- `[verify-pinpoint]` — substance is right but the exact article/paragraph/letter needs pinning down before it goes in a redline.
- `[low-confidence]` — a genuinely novel or contested call. Surface it; do not let it drive a SHIP or a BLOCKED verdict without flagging.

**Staleness (90 days):** compare every `verified <YYYY-MM-DD>` date a finding rests on with the run date. A finding resting on a source verified **more than 90 days before the run** carries `re-check before relying on it` in its Basis line, and the footer (§5) marks that source the same way. The finding keeps its severity; the mark tells the reader the source may have moved since. A source with no recorded verified date counts as stale too: a `[settled — <source>]` tag without `verified <date>`, or a tag in a reference that dates its tags only at file level (e.g. `mdr-hbnr.md`'s "Last-verified date for [settled] tags"). The footer lists it as `verified date not recorded`. The Verdict line in the footer states how many cited sources are due for re-check. A review run never changes a verified date: only re-checking the source itself does.

**Primary-source-over-paraphrase:** prefer the statute / regulation / official guidance text over blog or summary paraphrase. When a fact came from a summary, mark `[verify]` until checked against the primary URL in `legal-guardrails/references/`.

**No silent supplement:** do not quietly add or drop a requirement that isn't in the applicable checklist. If you notice "a question that isn't in my checklist," raise it explicitly as a `🟡` note rather than acting on it silently.

## 2. Severity (the shared floor)

| Sev | Meaning | Drives |
|---|---|---|
| 🔴 **blocker** | Void/illegal clause, mandatory store gate failed, or a false statement about data practices | BLOCKED (or a hard condition) |
| 🟠 **material** | Real legal/compliance gap or over-claim that a regulator/store/consumer could act on | FIX FIRST condition |
| 🟡 **minor** | Improvement, clarity, defensibility, or a flagged "not in my checklist" observation | Note; not blocking |
| 🟢 **ok/note** | Confirmed-good, or a documented reasoned decision (e.g. "not Art. 9 because no inference") | Evidence the doc is sound |

A finding's severity is the **floor**: when two skills disagree, take the higher severity.

## 3. Finding format

Every finding is emitted as:

```
[<skill-id>-<n>] <severity emoji> <one-line title>
  Location: <the clause: doc + section/line, or store field>
  Basis:    <the rule: legal citation + attribution tier + verified date (+ "re-check before relying on it" if stale, §1)>
  Issue:    <what is wrong / missing / over-claimed>
  Redline:  <concrete fix — exact replacement text where possible>
  Confidence: high | medium | low
```

**Clause and rule, every time.** A finding that moves the verdict names the clause it is about (`Location`) and the rule behind it (`Basis`). An observation that cannot name both is a 🟡 note and does not move the verdict.

Redlines must be **specific, not generic** ("state that RevenueCat receives purchase tokens", not "improve third-party disclosure"). Name each processor entity; never hide behind "third parties" (entity-aware grading — see `legal-guardrails/references/method/disclosure-grading.md`).

## 4. Verdict model

One overall verdict per review, plus a per-document letter grade (continuity with the project's A−/B+ scale).

- **SHIP** — no 🔴, no 🟠. Nothing found that stops release; 🟡/🟢 remain as notes. (≈ "READY".)
- **FIX FIRST** — no 🔴, ≥1 🟠. Ready once the listed **conditions** are met; emit a conditions table `Condition | Owner | Severity | Basis`. (≈ "SOME / MATERIAL CONCERN".)
- **BLOCKED** — ≥1 🔴. Must not ship until resolved. (≈ "REFUSE".)

The verdict covers what the footer says was checked, against the law it names, and nothing more. See `legal-guardrails/references/method/verdict-model.md` for the aggregation rules the orchestrator uses.

## 5. Review footer (what was checked, against which law, verified when)

Every review report ends with:

```
— What this review covers —
Automated review, not legal advice; a lawyer signs off.
Offered in: <countries/regions the app is offered in (the orchestrator's first question)>.
Reviewed: <docs + versions> on <run date>.
Checked: <checks run>.   Not checked this run: <checks skipped, each with why>.
Law checked against: <Netherlands + EU | EU> — <the frameworks actually applied, e.g. GDPR/AVG +
  UAVG, BW 6:233/236/237, CRD 2011/83, ePrivacy/Tw 11.7a, Dir. 93/13, MDR, DSA>. ("none" when the
  app is offered only outside the Netherlands and the EU, §9.)
Dutch national law (BW, Tw 11.7a, UAVG, AP guidance, other NL-only items): <applied | given as
  notes only — the Netherlands is not among the countries the app is offered in (§9)>.
Store rules checked against: <Apple App Store Review Guidelines, Google Play policies, as run>.
Law not checked: <every market the app is offered in outside the Netherlands and the EU, and the
  national law of any other EU member state it is offered in> — this suite holds no law tables
  for it, so it gives no verdict on that law. ("none" when the app is offered only in the
  Netherlands.)
Sources cited, with the date each was last verified:
  <source (reference file + URL)> — verified <YYYY-MM-DD>[ — re-check before relying on it (> 90 days, §1)]
  <source (reference file + URL)> — verified date not recorded — re-check before relying on it (§1)
  …
Verdict: <SHIP | FIX FIRST | BLOCKED> · Privacy <grade> · Terms <grade> · <n> of <m> cited sources
  due for re-check (§1).
Left to a lawyer or a registration (the carve-outs; no verdict given on these):
  (1) the [KVK]/[BTW]/[REGISTERED ADDRESS] values: the suite checks that the placeholders are gone
      (one left in is a 🔴 blocker, e.g. Apple EULA #8), not that the filled values are right;
  (2) native-language legal-idiom review of any non-English version a product deliberately ships
      (binding consumer text under 93/13 Art. 5) — N/A when the fact sheet says the legal docs
      ship in English only;
  (3) any item this report marks [low-confidence].
```

## 6. Authoring standard (for skills in this suite)

Anthropic SKILL.md spec: `name` ≤64 (lowercase-hyphen), `description` ≤1024 (this is the **trigger** — write it as "use when…"), body **<500 lines**, progressive disclosure (heavy tables/law → `legal-guardrails/references/`, executable code → `scripts/`, templates/output → `assets/`). Each skill states, near the top: "Operates under `legal-guardrails`. Load: `legal-guardrails/references/...` it needs." Skills reference the knowledge base by path `app-legal-privacy-terms-store-review/skills/legal-guardrails/references/<file>` (portable across machines via `~`).

## 7. Knowledge base index (`legal-guardrails/references/`)

- `method/` — `attribution-tiering.md`, `verdict-model.md`, `finding-format.md`, `disclosure-grading.md`
- `nl-eu-law/` — `gdpr-articles.md`, `bw-unfair-terms.md`, `crd-withdrawal.md`, `eprivacy-cookiewet.md`, `mdr-hbnr.md`, `transfers-dpf-scc.md`, `adr-bodies.md`, `ap-guidance.md`, `dsa-trader.md`
- `platform/` — `apple-app-privacy.md`, `apple-review-guidelines.md`, `apple-min-eula.md`, `play-data-safety.md`, `play-policies.md`
- `taxonomy/` — `data-category-ontology.md`, `sdk-data-map.md`
- `worked-example.md` — one app's profile and verdicts, the case the references work through (not the person's app)

Load only what the task needs. The orchestrator loads `method/*` once, then each review skill loads its own slice.

## 8. App facts and the worked example

**The app under review is an input.** Its facts (name, publisher, platforms, markets, data collected, SDKs, money, health claims, doc paths) come from the app fact sheet in `legal-signoff-orchestrator.md` Step 0. A skill run on its own gathers the rows it needs the same way: read the person's project first, ask only for what the project cannot tell you, and mark the rest `[unknown — ask]`.

**The references carry worked examples.** Many of them apply the law to one app, so the reasoning is shown end to end. That app's profile and its verdicts are in `legal-guardrails/references/worked-example.md`. Wherever a skill or reference says "the worked example", it means that app, and nothing else.

A worked example is a pattern, never a fact about the person's app. Re-run its reasoning on the fact sheet: where the person's app differs (another SDK, real health data, ads, another legal form, no EU region), the outcome can flip, and the rule that decides it is the one to apply. In templates, use plain placeholders such as `<app name>`, `<publisher>`, `<contact email>`, `<your-domain>`, never an invented name.

## 9. Where the app is offered (jurisdiction)

The law tables in `references/nl-eu-law/` cover the **Netherlands and the EU**. The orchestrator's first question is where the app is offered (`legal-signoff-orchestrator.md` Step 0); a skill run on its own asks it first too. What runs depends on the answer:

| The app is offered in | What runs | What the footer (§5) says |
|---|---|---|
| The Netherlands (with or without other EU states) | The whole suite. | Law checked against: Netherlands + EU. Dutch national law: applied. Law not checked: the national law of any other member state named. |
| EU states, but not the Netherlands | The whole suite. EU-law findings (GDPR, ePrivacy Art. 5(3), CRD 2011/83, Dir. 93/13, DSA, MDR) drive the verdict. Findings resting only on Dutch national law (BW 6:236/237, Tw 11.7a, UAVG, AP guidance, other NL-only items) are 🟡 notes and do not move the verdict; a finding that rests on both (e.g. Tw 11.7a and ePrivacy Art. 5(3)) keeps its EU basis. | Law checked against: EU. Dutch national law: given as notes only. Law not checked: the national law of each member state named. |
| Markets outside the Netherlands and the EU as well | The whole suite, for the NL/EU part (apply the EU-not-NL row when the Netherlands is not among them). | Law not checked: each market outside the Netherlands and the EU. |
| Only outside the Netherlands and the EU | **Store-rule checks** (`legal-apple-gate`, `legal-play-gate`, the store-copy checks of `legal-health-claims`) and **data-collection checks** (`legal-data-surface-scan`, `legal-flow-grader`, `legal-cross-store`) still run. The law reviews (`legal-privacy-review`'s GDPR checklist, `legal-gdpr-audit`, `legal-terms-review-nl`, `legal-withdrawal-check`, `legal-analytics-consent`, the MDR screen) do not, and no check that rests on NL/EU law gives a verdict. | Law checked against: none. Law not checked: each market named; no law tables, so no verdict on law. The verdict covers store rules and data collection only. |

The only law table outside the EU is the US FTC Health Breach Notification Rule screen in `mdr-hbnr.md`, run by `legal-health-claims`; its ultimate call stays `[low-confidence]`. A market the person cannot name is `[unknown — ask]`, and the footer lists it under "Law not checked".
