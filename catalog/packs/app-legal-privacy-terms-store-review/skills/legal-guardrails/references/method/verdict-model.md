# Verdict model + aggregation

How individual findings roll up into one sign-off band. Used by `legal-signoff-orchestrator`.

## Bands

| Band | Trigger | Meaning |
|---|---|---|
| **SIGN-OFF** | 0 🔴, 0 🟠 | Ships as-is. 🟡/🟢 may remain as notes. |
| **FIX-THEN-SIGN-OFF** | 0 🔴, ≥1 🟠 | Ships once the conditions table is cleared. |
| **BLOCK** | ≥1 🔴 | Must not ship. |

A 🔴 that is only `[verify]`/`[low-confidence]` is downgraded to a **hard condition** ("confirm <X>; if confirmed, this is a blocker") rather than an outright BLOCK — the suite never blocks on unconfirmed law, but it never waves it through either.

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
4. **Cross-store drift is 🟠+:** any mismatch among Apple label ↔ Play Data Safety ↔ PP (`legal-cross-store`) blocks a clean SIGN-OFF.
5. **Conditions table:** every 🟠 becomes a row `Condition | Owner (owner / code / jurist) | Severity | Basis`. Owner = "jurist" only for the §5 carve-outs.

## Report skeleton

```
# Sign-off: <app> Privacy Policy + Terms of Service (<versions>) — <date>
Verdict: <BAND>  ·  Privacy <grade>  ·  Terms <grade>
## Conditions to clear (if FIX-THEN-SIGN-OFF)
| # | Condition | Owner | Sev | Basis |
## Findings (ranked: 🔴 → 🟠 → 🟡)
<findings in the standard format>
## Confirmed-good (🟢) + reasoned decisions
## Code-faithfulness summary  (declared vs actual data surface)
## Cross-store consistency summary
— Sign-off basis —  (the authority footer)
```
