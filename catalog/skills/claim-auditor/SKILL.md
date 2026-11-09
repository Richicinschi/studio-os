---
name: claim-auditor
description: >-
  Trace every factual claim in a deliverable back to its source before it ships: re-runs the scripts behind figures and grades GREEN/AMBER/RED. Use for "audit the claims", "check every number", "fact-check this report", or before a report, deck, dossier or listing goes outward. Changes nothing.
metadata:
  category: quality
  author: Richicinschi
  version: 1.0.0
---

# claim-auditor

## Why this exists

The 2026-07-28 usage report identified **unverified claims as the studio's most persistent rework class**: an "already licensed" assertion that was not true, live-deployment evidence that had to be stripped from a deliverable, figures that needed re-deriving after the fact. Each one was cheap to check *before* it shipped and expensive to retract *after*.

A claim reaching a deliverable unverified is a defect, whether or not it happens to be correct.

## Hard rule

**Never soften a finding to make a deliverable look better.** Not by downgrading RED to AMBER, not by omitting a claim you could not source, not by rewording a number into a vaguer form that no longer needs support. If a claim cannot be traced, that fact IS the finding. A report of "4 RED" that reflects reality is worth more than a clean one that does not.

The audit reports. It does not fix, and it does not soften.

## Procedure

### 1. Extract every claim

Read the deliverable in full. Write each claim to `audit/claims.jsonl`, one per line:

```json
{"id": "C7", "doc": "report.md", "loc": "§3, line 42", "claim": "the sample data covers 2025-01-06 to 2025-06-30", "kind": "figure"}
```

`kind` ∈ `figure` · `percentage` · `chart` · `date-range` · `entity` · `capability` · `status`.

Extract, don't judge — judging comes later. Claims hide in places that don't look like claims:

- axis labels, legends, chart titles and callouts
- table headers and units ("in thousands", "annualised")
- image captions and alt text
- comparatives with an implied baseline ("2× faster", "the largest")
- hedged assertions — "roughly 40%" still asserts ~40%
- anything a diagram *depicts* as existing

### 2. Find the grounding

For each claim, name the specific source: a file and line, a script and its output, a URL with an access date, or a person who told you. "It was in the previous draft" is not a source — follow it back to the original or mark it RED.

### 3. Re-run, don't re-read

For any number produced by code, **re-run the script and compare**. Do not trust a figure quoted in a prior document, a commit message, a chat log, or your own earlier summary. Numbers drift when the underlying corpus changes, and a quoted figure carries no timestamp.

Record the command and its actual output next to the claim.

### 4. Verify structure claims against the code

For every component a diagram or architecture description depicts, grep the codebase and confirm it exists, is wired up, and is reachable. A box on a diagram is a claim that the thing exists.

Same for paths: a documented path is a claim. Check it resolves.

### 5. Grade

| Grade | Meaning |
|---|---|
| **GREEN** | Regenerated from source in this audit and matches. |
| **AMBER** | Plausible but the source is indirect, stale, or secondary — a quoted figure, an undated page, a claim traced only to another of our own documents. |
| **RED** | Unsourced, contradicted by the source, or could not be re-derived. |

Escalate to **RED on sight**, pending independent verification, any claim about:

- **licensing** — what we are permitted to use, sell, or redistribute
- **partnerships, customers, endorsements** — anyone else's name attached to ours
- **live deployments** — that something is running, reachable, or in production
- **compliance status** — GDPR, MDR, store policy, tax, "approved", "registered"
- **third-party capabilities** — what someone else's product, API or model does

These are the ones that cause real damage: they are outward-facing, they are the hardest to walk back, and they are exactly the class the usage report flagged. A confident memory is not verification.

### 6. Report

Ranked worst-first. Per claim: id, location, the claim, the grade, the source (or the absence of one), and for figures the command re-run plus its output. Close with counts per grade and an explicit list of what could not be checked and why — an unchecked claim must never be silently absent from the report.

## Scope note

This audits claims, not prose quality, and it is orthogonal to `/code-review` (defects in code). Run it last, on what is about to leave the building.
