# Verdict model + aggregation

How individual findings roll up into one verdict. Used by `legal-signoff-orchestrator`. The suite is an automated review, not legal advice: the verdict is firm, and a lawyer signs off.

## Verdicts

| Verdict | Trigger | Meaning |
|---|---|---|
| **SHIP** | 0 🔴, 0 🟠 | Nothing found that stops release. 🟡/🟢 may remain as notes. |
| **FIX FIRST** | 0 🔴, ≥1 🟠 | Ready once the conditions table is cleared. |
| **BLOCKED** | ≥1 🔴 | Must not ship. |

Every finding behind a verdict names its clause (`Location`) and the rule behind it (`Basis`: citation, tier, verified date); see `legal-guardrails.md` §3. A verdict covers only what the footer says was checked, against the law it names (`legal-guardrails.md` §5, §9).

A 🔴 that is only `[verify]`/`[low-confidence]` is downgraded to a **hard condition** ("confirm <X>; if confirmed, this is a blocker") rather than an outright BLOCKED verdict — the suite never blocks on unconfirmed law, but it never waves it through either.

A finding resting on a source verified more than 90 days before the run, or with no recorded verified date, carries `re-check before relying on it` (`legal-guardrails.md` §1); it keeps its severity. The Verdict line states how many cited sources are due for re-check.

## Per-document grade

Letter grade per document, continuity with the project's existing scale:

- **A** — complete, code-faithful, no material gaps.
- **A−/B+** — strong; a few 🟡 or one easily-fixed 🟠.
- **B/B−** — several 🟠; solid skeleton, paperwork lagging behind shipped behaviour.
- **C or below** — 🔴 present, or systematic over-claiming vs the app's real data behaviour.

## Aggregation rules

1. **Severity floor / max:** when skills overlap on the same clause, the finding's severity is the **highest** any skill assigned.
2. **Dedupe by (location, issue):** merge identical findings; keep the strongest basis citation.
3. **Code-faithfulness dominates:** a doc statement contradicted by `legal-data-surface-scan` / `legal-flow-grader` (the app does X but the PP says it doesn't, or vice-versa) is at least 🟠, and 🔴 if it is an affirmative false statement about data sharing.
4. **Cross-store drift is 🟠+:** any mismatch among Apple label ↔ Play Data Safety ↔ PP (`legal-cross-store`) rules out SHIP.
5. **Conditions table:** every 🟠 becomes a row `Condition | Owner (owner / code / jurist) | Severity | Basis`. Owner = "jurist" only for the §5 carve-outs.

## Report skeleton

```
# Legal review: <app> Privacy Policy + Terms of Service (<versions>) — <date>
Verdict: <SHIP | FIX FIRST | BLOCKED>  ·  Privacy <grade>  ·  Terms <grade>  ·  <n> of <m> cited sources due for re-check
## Conditions to clear (if FIX FIRST)
| # | Condition | Owner | Sev | Basis |
## Findings (ranked: 🔴 → 🟠 → 🟡)
<findings in the standard format, each naming its clause and rule>
## Confirmed-good (🟢) + reasoned decisions
## Code-faithfulness summary  (declared vs actual data surface)
## Cross-store consistency summary
— What this review covers —  (the review footer, legal-guardrails.md §5)
```
