---
id: ab-testing
title: A/B testing and experiments
description: Use when comparing versions or planning, designing, implementing an A/B test or experiment: split test, multivariate, hypothesis, variant copy, significance, run length, growth experiments, velocity, ICE; build a systematic program to measure better. Tracking: analytics; page-level conversion: cro.
---

# A/B testing and experiments

## When to use

Typical wordings: "A/B test this", "split test", "should I test this", "which version is better", "test two versions", "test this change", "is this significant", "how long should I run this test", "multivariate test", "growth experiments", "experiment backlog", "ICE score", "experiment playbook".

Neighbours:
- Tracking and event set-up goes to `analytics`.
- Finding what to change on a page goes to `cro`.
- Writing the variant text goes to `copywriting`.

This skill covers the test itself (hypothesis, design, run, read) and the habit of running tests continuously.

## How it works

1. **Get context.** If a product marketing context file exists (`.agents/product-marketing.md`, `.claude/product-marketing.md`, or the older `product-marketing-context.md`), read it first and ask only for what it lacks. Then find out: the current rate on the exact page or step, daily traffic to it, the change being considered and why, the smallest improvement worth detecting, the tools available, the deadline, and whether this area was tested before.
2. **Write a hypothesis.** A test without a prediction is just looking. Use this shape: "Because [data or observation], we believe [change] will cause [outcome] for [audience]. We will know when [metric moves]." Weak: "A shorter form might help." Strong: "Because session recordings show 4 of 10 visitors abandon at the phone-number field, we believe removing it will raise form completion for first-time visitors. We will read completion rate from form view to submit."
3. **Size the test before launch.** Fix the sample per variant in advance, using a free online sample-size calculator or the formula in [sample-size.md](ab-testing/references/sample-size.md). You need baseline rate, minimum detectable effect, significance (usually 95%) and power (usually 80%). Do not stop when the numbers look good; stop at the planned sample.
4. **Design the variants.** One meaningful change per test, bold enough to move the metric, faithful to the hypothesis. Choose the type by traffic: A/B (two versions, moderate traffic), A/B/n (more variants, more traffic), multivariate (changes in combination, very high traffic), split URL (separate pages, moderate traffic). Things worth varying: message angle, layout and imagery, button text and placement, what content appears and in what order, proof elements.
5. **Pick metrics.** One primary metric, tied to the hypothesis and to business value; it alone decides the test. Secondary metrics explain how the change worked. Guardrails are things that must not get worse. Example for a checkout-page test: primary is completed orders per session, secondary is cart edits and time to pay, guardrails are payment errors and refund requests.
6. **Set up delivery.** Split 50/50 by default. Use 90/10 or 80/20 when a bad variant would be costly, or ramp up from a small share when the technical risk is high. Keep each visitor on the same variant on return, and balance exposure across weekdays and times of day. Client-side tools change the page after load, are quick to ship and can flicker; server-side decides before render, has no flicker and needs developer work. Run at least one full week; the other duration limits are in the sizing file.
7. **Launch and watch.** Before launch confirm: hypothesis written, primary metric defined, sample size set, every variant renders correctly, tracking fires in every variant, QA done. While running: watch for technical faults, check the quality of the traffic in each arm, note outside events (campaigns, outages, holidays). Do not peek and stop early (early stops produce false winners), do not edit variants, do not add new traffic sources. Stop early only if a guardrail turns significantly negative.
8. **Read the result.** 95% confidence means p below 0.05, which is a threshold, not proof. Check in order: was the planned sample reached (if not, the result is preliminary); is the difference significant, with the confidence interval in view; is the effect large enough to matter against the minimum detectable effect; do secondary metrics agree; did a guardrail slip; do segments such as mobile and desktop or new and returning differ. Then decide: significant winner, ship it; significant loser, keep control and work out why; no difference, you need more traffic or a bolder change; mixed signals, dig into segments.
9. **Record it.** Keep the hypothesis, screenshots of each variant, sample and metric results with significance, the decision and what was learned. Templates are in [templates.md](ab-testing/references/templates.md).
10. **Run it as a program.** Tests compound when they form a loop: generate hypotheses, score them, run the best, analyze, add winners to a playbook, learn, repeat. Feed the backlog from analytics (drop-offs, weak pages and segments), customer research (confusion, unmet expectations), competitors, support tickets, heatmaps and recordings, and earlier experiments (a clear loser often suggests a new angle).
11. **Prioritize with ICE.** Score each idea 1 to 10 for impact (how far it moves the primary metric), confidence (based on data, not gut) and ease (speed and cost to ship and measure). ICE = (impact + confidence + ease) / 3. Run the highest first and re-score every month.
12. **Track velocity.** Count experiments launched per month, your win rate (a rate that is far higher than your earlier months may mean the hypotheses are too safe), average duration, how many hypotheses are waiting, and the cumulative lift from all winners, and compare each against your own earlier months.
13. **Keep a playbook.** For each finished test write: name, date, hypothesis, sample per variant, result with change size, interval and p-value, guardrail outcomes, notable segment differences, why it worked or failed, the reusable pattern, where else to apply it, and status (shipped, parked, needs follow-up).
14. **Keep a rhythm.** Weekly (30 minutes): check running tests for faults and guardrails; never call a winner early. Every two weeks: close finished tests, update the playbook, launch the next one. Monthly (1 hour): review velocity, win rate and cumulative lift, refill and re-score the backlog. Quarterly: audit the playbook for patterns not yet scaled and funnel areas with too little testing.

## Checks before done

- A written hypothesis, one primary metric and guardrails exist.
- The sample size was fixed before launch, and the run did not stop early.
- Only one thing changed, and nothing was edited mid-test.
- Tracking was verified on every variant, and segment analysis was planned, not cherry-picked after.
- The decision follows the interpretation in step 8, with the confidence interval reported and an inconclusive result not oversold.
- The test is documented and any pattern is in the playbook.
