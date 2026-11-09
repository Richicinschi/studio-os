# Templates for tests

Copy a block, fill the brackets, drop what you do not need.

## Test plan

```
# Test: [name]
Owner: [person]   Tool ID: [id]   Where: [page or feature]   Dates: [start] to [end]

Hypothesis: Because [data], we believe [change] will cause [outcome] for [audience]. We will know when [metrics].

Design: type [A/B | A/B/n | multivariate | split URL]; length [weeks]; sample [n per variant]; split [e.g. 50/50]; tool [name]; delivery [client-side | server-side]

Control: [screenshot, current state]
Variant: [screenshot or mockup, each change, why it should win]

Primary metric: [name], definition [how counted], baseline [x], MDE [x]
Secondary: [metric and what it shows]
Guardrails: [metrics that must not worsen]
Segments to read: [device, new vs returning, source, other]

Win: [primary improves by x with 95% confidence]
Lose: [primary falls significantly]
Inconclusive: [what we do then]

Before launch: hypothesis reviewed, metric trackable, sample and length set, variants QA'd, tracking verified in every arm, stakeholders told, date held for the readout.
```

## Result report

```
# Result: [name]
Dates [start to end], [days] days. Outcome: [winner | loser | inconclusive]. Decision: [action].

Hypothesis: [copy from plan]

Sample: control [target, actual, % of target]; variant [target, actual, % of target]
Primary metric: control [rate, interval]; variant [rate, interval, change vs control]; p = [value]
Practical meaning: [is the lift worth it in business terms]

Secondary: [metric, control, variant, change, significant?]
Guardrails: [metric, control, variant, change, concern?]
Segments: [segment, control, variant, lift]

What happened: [plain words]
Why we think so: [reasoning]
Caveats: [limits, outside events]

Action and timing: [implement | keep control | retest, when]
Learned: [insights]   Next tests: [follow-ups]   Projected impact: [lift and value]
```

## Test log (one row per test)

The row below is an invented example.

```
| ID | Name | Page | Dates | Primary metric | Result | Lift | Link |
| 014 | Shorter pricing intro | Pricing | 3/4-3/25 | Plan selected | Winner | +9% | [link] |
```

## Quick brief (small tests)

```
[Name]
What: [one sentence]   Why: [one-sentence hypothesis]   Metric: [primary]
Length: [weeks]   Result: [pending | winner | loser | inconclusive]   Learned: [takeaway]
```

## Stakeholder update

```
Test: [name]   Status: [running | done]   Days left: [n]   Sample so far: [% of target]
Early observations (no decisions yet): [text]
Next: [what happens]
Dates: analysis [date]; recommendation [date]; rollout [date, if it wins]
```

## Priority scorecard

Score each idea 1 to 5 (5 best) and weight it. The weights are a starting point, not measured values; change them to fit your goals.

| Factor | Weight |
|---|---|
| Potential impact | 30% |
| Confidence in the hypothesis | 25% |
| Ease of building | 20% |
| Risk if wrong | 15% |
| Strategic fit | 10% |

## Hypothesis bank

```
| ID | Area | Observation | Hypothesis | Impact | Status |
| H7 | Checkout | Many visitors leave at the shipping step | Showing delivery date early reduces exits | High | Backlog |
```
