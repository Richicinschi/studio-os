---
id: ad-creative
title: Ad creative at scale
description: "Use to generate, scale or iterate existing ad copy: headlines, descriptions, primary text, RSA headlines, bulk ad copy, variations, creative testing, performance optimization, write ads, Facebook, Google, LinkedIn. Campaign strategy and targeting: ads. Landing page copywriting: copywriting."
---

# Ad creative at scale

Produce ad copy that fits each platform's limits, built from distinct angles, and improve it round by round from real results. Nothing is generated with paid tools or published without the owner's approval.

## When to use

Typical wordings: "write me ads for this", "give me 15 RSA headlines", "I need more variations of the winning ad", "here is last month's export, what should I write next", "Facebook ad copy for the launch", "LinkedIn ad text", "bulk ad copy as a CSV".

Neighbouring skills:
- Campaign strategy, targeting, budgets: the ads skill takes over.
- Landing page copy, where the click arrives: copywriting.
- Statistically sound creative tests: ab-testing.
- Why a message persuades: marketing-psychology.
- Polishing finished copy: copy-editing.

## How it works

1. **Read what the studio already knows.** If a product marketing context file exists (look under `.agents/`, including an older `product-marketing-context.md` name), read it first and ask only for what it lacks.
2. **Collect the brief.** Ask for whatever is missing:
   - Platform and format (search responsive ads, display, social feed, stories, video) and whether there are ads to build on.
   - What is promoted (product, feature, trial, demo, lead magnet), the core value, and what separates it from alternatives.
   - Audience, and their awareness stage: knows the problem, knows solutions exist, or knows this product. Their pains and wants.
   - For iteration: what is running now, which items win and lose on which metric (CTR, conversion rate, ROAS), and which angles were already tried.
   - Constraints: voice, banned words, regulated industry, platform policy, required elements such as a brand name, trademark symbol or disclaimer.
3. **Pick the mode.** Fresh start: build the set from the brief. Iteration: the user pastes a CSV or report; analyze it, then write on top of the findings. Either way the loop is: get data, find patterns, write, check limits, deliver.
4. **Define 3 to 5 angles before any line is written.** An angle is a distinct reason to click. Draw from: a pain to end, a concrete outcome, proof from others, a curiosity gap, a comparison, a real deadline, "made for this role", or a stance against common practice. Name each angle in one line.
5. **Write variations inside each angle.** Change word choice, how specific the claim is, tone (statement, question, command) and length. Rules for good lines:
   - Concrete beats vague ("cut weekly invoicing from 4 hours to 1" beats "save time"), benefit beats feature, active voice, a number where one is true.
   - Skip insider jargon, unbacked superlatives, all caps, stacked punctuation, and any promise the landing page cannot keep.
   - Descriptions add what headlines lack: proof, an answer to the usual objection, a call to action, urgency only if it is real.
   - Search headlines are shuffled by the platform, so each must work alone and beside any other. Include at least one keyword headline, one benefit headline and two or three call-to-action headlines. For several platforms, write the tightest format first, then widen (see [platform-specs.md](ad-creative/references/platform-specs.md)).
6. **Iterate from data.** Ask which metric matters most, then:
   - Winners: note themes, sentence shapes, recurring words and how much of the character limit they use.
   - Losers: note weak themes and shared flaws (too generic, too long, wrong tone).
   - Next batch: restate winning themes in fresh words, stretch the winning angles, test one or two new angles, avoid what the losers share.
   - Do not call anything a loser before it has had enough impressions to compare fairly (a starting point is about 1,000, not a measured value; set it from your own volume and baseline). Change one variable per test round.
   - Pulling data: ask the user to export a report from the ad platform and paste it. Do not log in or call platform APIs unless the user sets that up.
   - Keep a log: round number, date, top items with their metrics, patterns, counts written, angles in test, angles retired.
7. **Check every line against its limit.** Count spaces and symbols. Flag any overrun and offer a trimmed version next to it. Limits and counting caveats live in [platform-specs.md](ad-creative/references/platform-specs.md); tell the user to confirm in the platform's own preview, because limits change.
8. **Deliver in an upload-ready shape.** Group by angle and show the count beside each line, for example `"Invoices in 1 hour, not 4" (26)`. At 10 or more variations offer a CSV with one column per slot plus a platform column. When iterating, open with a short summary (items analyzed, best and worst with their metric, the pattern seen), then the new copy, then what to pause, scale and test.
9. **Scale in waves when asked for volume.** Split the work into headlines (aim: clicks), descriptions (aim: conversion) and primary text (aim: engagement). Wave one: core angles with about five lines each. Wave two: more variations on the best two angles. Wave three: wild cards. Then filter: drop overlong lines and near-duplicates, flag anything a platform policy may reject, and check that headline and description pairs read sensibly. For images, video and voice, follow [visual-production.md](ad-creative/references/visual-production.md).
10. **Stop at approval.** Before anything that costs money (paid generation tools, ad spend, boosting a post) or goes outward (uploading, publishing, sending), state the amount or the action and wait for a clear yes. Ad policies change, so tell the user to check the platform's current policy for the product category.

## Checks before done

- Every line is inside its platform limit, counted with spaces; overruns are flagged with a trim.
- Angles are truly different, not one idea reworded; search headlines include at least one keyword line, one benefit line and two or three call-to-action lines; descriptions are specific, never filler.
- No claim is invented or unprovable (numbers, awards, customer counts, "best"); regulated categories and required disclaimers are handled.
- Copy and the landing page promise the same thing.
- An iteration round has its log entry and one variable under test.
- No spend, generation or publishing happened without approval and a stated amount.
- English only; no em or en dashes in the copy.
