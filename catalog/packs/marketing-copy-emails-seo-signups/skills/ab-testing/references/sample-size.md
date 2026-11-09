# Sizing a test and planning its length

Use a free online sample-size calculator (several exist, some with a Bayesian mode and duration estimates). This file explains the inputs and the planning around them. It holds no lookup tables on purpose: take the number from a calculator.

## Inputs

1. Baseline rate: the current rate of the exact metric on the exact page, not a site-wide average.
2. Minimum detectable effect (MDE): the smallest change worth acting on. Set it from business value, build cost and what earlier tests produced.
3. Significance: 95% is a common convention, meaning you accept a 5% risk of calling a winner when there is no real difference (a p-value under 0.05 is not the chance that this result is noise). Set your own.
4. Power: 80% is a common convention, meaning an 80% chance of detecting a real effect of MDE size. Set your own.

## Duration

Days = (sample per variant x number of variants) / (daily visitors x share of visitors exposed)

Worked cases with made-up numbers:
- Needs 8,000 per variant, 2 variants, 4,000 visitors a day, all exposed: 16,000 / 4,000 = 4 days.
- Needs 25,000 per variant, 2 variants, 1,250 a day, all exposed: 50,000 / 1,250 = 40 days.
- Needs 12,000 per variant, 2 variants, 400 a day, 25% exposed (100 a day): 24,000 / 100 = 240 days, so do not run it as designed.

Minimum run: one full week to cover day-of-week swings; two business cycles for B2B; across paydays for retail. Maximum (a starting point, not a measured value): avoid going beyond 4-8 weeks, because novelty fades, outside events creep in and the slot blocks other tests.

## More than two variants

Sample need grows with every added variant; enter the real variant count in the calculator. With 5 or more, cut variants. More arms mean more comparisons and more false positives; apply a Bonferroni correction or use a tool that corrects for it.

## Sizing mistakes

- Underpowered: the sample cannot detect a realistic effect. Be honest about MDE, find more traffic, or do not test.
- Waiting past significance: if you already see significance before the planned sample, that is fine, but you committed to the sample, so honor it.
- Wrong baseline: use the specific metric and page.
- Segments: if you will analyze a segment, size for the smallest one.
- Too many concurrent tests: they split the traffic; rank ideas and run fewer.

## When the requirement is too large

1. Raise the MDE and accept only bigger effects (a larger lift than you first planned).
2. Drop to 90% confidence, which is riskier, and write that down.
3. Cut variants to the most promising one.
4. Pool traffic across similar pages.
5. Test further up the funnel, where traffic is larger.
6. Skip the test and decide on qualitative evidence.
7. Accept a longer run.

## Sequential testing

If you must look before the planned sample, use a sequential method that corrects for repeated looks. Use it for high-risk changes, for stopping bad variants early, or under time pressure. Several commercial and open tools offer it. The price is a slightly larger sample and harder analysis.

## Can I run this?

Write down daily traffic, baseline and MDE; get the sample from the calculator; divide by daily traffic. The cut-offs below are the skill's own rule of thumb, a starting point, not measured values.
- More than 60 days: look for alternatives.
- More than 30 days: acceptable only for high-impact tests.
- Under 14 days: likely feasible.
- Under 7 days: easy; still consider running longer to cover a full week.
