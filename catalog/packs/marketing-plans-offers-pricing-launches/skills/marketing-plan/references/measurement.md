# Measurement: north star, indicators, rhythm, stop rules

Feeds the first part of section 13. A plan is only checkable if the team can see its numbers.

## North star

One metric that expresses the business-model thesis. It should be derivable from the funnel and revenue model, move slowly enough to steer by, and rise only when the business improves. ARR or MRR alone are outcomes, not stars.

| Model | Candidate | Alternative | Reason |
|---|---|---|---|
| B2B subscription | net revenue retention | logo retention x expansion ARR | gross adds can hide churn |
| Consumer subscription | blended LTV / blended CAC | day-35 paying users from a cohort x LTV | smooths volatile monthly figures |
| Hardware plus software | blended LTV / blended CAC across both | hardware buyers converting to subscribers x blended margin | hardware is not free, subscribers cost less if hardware funds them |
| Marketplace | liquidity ratio x take rate | monthly transacting users x take rate x repeat frequency | volume alone does not show habit |
| Developer tool | weekly active developers x paid conversion | weekly active orgs x seats x revenue per seat | adoption plus money |
| Content or media | daily readers or listeners x revenue per session | subscribers x retention x revenue each | reach plus monetisation |
| Commerce | repeat rate x order value x frequency | LTV / CAC and payback period | quality of customer |

## Leading indicators by stage

- **Acquisition:** organic visits per month, total and per content pillar; store page to install rate; social audience to email subscriber rate; event to signup rate; partner-attributed visits; paid CAC by channel once paid runs.
- **Activation:** day 1, 7 and 35 to paid; onboarding completion; first key action; install to trial to paid; trial to paid.
- **Retention:** day 30, 60, 90 retention; monthly churn, gross and net; open, click and unsubscribe by flow; hardware to app activation if relevant; win-back rate.
- **Referral:** partner-attributed new subscribers; share rate after the value moment; two-sided completion; expert-network referrals; NPS if surveyed.
- **Revenue:** revenue per user by cohort; annual plan share; cohort LTV by source; plan mix shifts; attach rate for physical add-ons; expansion revenue for B2B.

## Rhythm

- **Weekly,** planner and lead founder, 30 minutes: stage scoreboard against last week, what shipped, blockers; ends with actions and decisions.
- **Monthly,** planner, founders and extended team, 60 to 90 minutes: full metrics against quarterly targets, qualitative lessons, idea bank re-ranked; may change the plan or trigger hires.
- **Quarterly,** planner, founders, key advisers, 2 to 3 hours: plan against 90-day and 12-month outcomes, channel analysis, tier check, next 90 days reset; produces the next plan version.

## KPI targets

Every quarter in section 10 must carry three to five. Each must be specific (a number and a baseline measured by you, such as the invented example "day-60 retention from 18 to 26 percent"), measurable from a connected source, a plausible stretch, and decision-triggering (what do we do if missed).

Quarter flavour:
- Q1 foundation: mostly fix-the-leak metrics plus "laid tracks" metrics (pillars staked, listing rewritten); avoid bold growth numbers.
- Q2 validation: does what we built work (paid CAC under target, organic traffic band, new cohort retention versus the old).
- Q3 scaling: how far does it go (paid scaled with CAC steady, first B2B reference case); capability metrics (first partner pilot live).
- Q4 compound: is the flywheel turning (half of new subscribers from non-paid channels, partner share of new subscribers); narrative metrics (blended LTV/CAC above your own target for the next raise).

## Benchmark and forecast honesty

Venture-backed clients past 1M ARR anchor against their own history (budget-math.md); others use linear adds or step targets. State the annual goal, quarterly KPIs and stop rules; never promise a month.

## Stop rules and guardrails

Every channel and initiative gets a stop condition. Examples (the thresholds and periods are placeholders to set from your own baseline, not measured norms): pause a paid channel whose CAC stays above a set multiple of target after a set period at meaningful spend; if one onboarding variant shows no meaningful lift over a set period, fall back to the control; if a lifecycle flow's open rate stays below your own baseline over a set period, redo subject lines and segments.

Guardrail metrics protect brand and economics while growing: voice complaints above a share of feedback you set trigger a content review; paid CAC above target two months running pauses scaling for an audit; a store rating below your own floor triggers a product review.

## Where each number comes from

Name the source so figures can be audited: traffic (web analytics, SEO tool); store conversion (store console); day-N to paid (product analytics or store cohort export); retention (email segments plus product analytics); revenue and plan mix (payments); email metrics (email tool); partner attribution (link tool); NPS (survey tool).

A metric that cannot be measured yet goes to the open decisions with the instrumentation work (for example "shop orders cannot be joined to store accounts; quarter-1 task"). An unmeasurable goal cannot be validated.

## Reporting

Generate the review automatically where connectors exist; at Tier 1 a weekly markdown table to the team is free. From Tier 2 consider a dashboard.
