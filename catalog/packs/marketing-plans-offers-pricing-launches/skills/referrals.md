---
id: referrals
title: Referral and affiliate programs
description: Use when the user wants a referral program, affiliate program or word of mouth plan created, optimized or analyzed: ambassador, viral loop, refer a friend, partner program, referral incentive, customers referring customers, affiliate payout. For launch virality see launch.
---

# Referral and affiliate programs

## When to use

Typical wordings: "set up a referral program", "refer a friend offer", "affiliate program for my app", "ambassadors", "how do I get customers to bring customers", "what should the payout be", "why does nobody use our invite link", "viral loop".

Use it whenever existing users or outside partners should bring in new customers. Neighbours:
- `launch` takes over for virality tied to a launch date.
- `emails` writes the nurture campaigns that promote the program.
- `marketing-psychology` explains why people share.
- `analytics` sets up attribution and tracking.
- `pricing` and `offers` own the underlying price and offer the reward sits on.

## How it works

1. **Gather context.** If a product marketing context file exists (check the agents folder, the claude folder, and the older file name), read it and ask only what is missing. Needed: customer referral, affiliate or both; B2B or B2C; average customer lifetime value (LTV); current acquisition cost (CAC) from other channels; whether a program already exists, its referral rate and the incentives tried; whether the product is shareable or has network effects; tools in use or considered; the reward budget. Ask for the budget before proposing any reward.
2. **Pick the type.** A customer referral program suits existing customers recommending to their circle, products people already talk about, and cheaper or self-serve products. Trust is higher, volume lower, rewards usually one-off or capped. An affiliate program suits reaching audiences you do not own (creators, bloggers, newsletters), and products with enough margin to pay commission. Affiliates need not be customers, the relationship is ongoing, volume is higher, trust varies. Both can run side by side.
3. **Map the loop.** The loop runs trigger moment, share action, the referred person converts, reward, and back to the start. Put the prompt where goodwill peaks: right after the first "this works" moment, after a milestone, after standout support, after a renewal or upgrade.
4. **Design the share action.** The options, best expected conversion first: sharing inside the product, a personal link, an email invite, a social post, then a code (a plus when sharing happens offline). Build the top option and make it one click.
5. **Choose the incentive.** Single-sided (referrer only) is simple and fits high-value products. Double-sided (both parties) usually converts better and frames the offer as a gift. Tiered rewards add a game and keep people referring. Reward type and size: read [incentives and sizing](referrals/incentives-and-sizing.md). **Incentives and payouts: state the cost per reward and the worst-case monthly total, and get the user's yes before any reward is set live, announced or paid.**
6. **Add controls.** Fraud rules, caps, delayed payout, terms. See [tools and fraud](referrals/tools-and-fraud.md).
7. **Affiliates.** Commission model, cookie window, recruitment and enablement are in [affiliate programs](referrals/affiliate-programs.md).
8. **Diagnose an existing program.**
   - Few people refer: ask at better moments, shorten the sharing path, try other reward types, put the prompt where users already look.
   - Referrals do not convert: improve the page the friend lands on, strengthen the friend's reward, show who recommended them.
   - Tests to queue: reward amount, type, one-sided versus two-sided, and timing; description and call-to-action wording; where and when the prompt appears. Change one thing per test.

   | Symptom | Fix |
   |---|---|
   | Nobody knows about it | Prominent in-app prompt |
   | Few shares | One-click sharing |
   | Friends do not sign up | Better landing for referred users |
   | Abuse | Verification and caps |
   | People refer once then stop | Tiers or milestones |
9. **Measure.** Health: active referrers (referred someone in the last 30 days), referral conversion rate, rewards earned and paid. Impact: share of new customers from referrals, CAC through referrals versus other channels, LTV of referred customers, program ROI. Compare your own referred cohort with other customers for LTV and churn; do not assume referred customers are better, because published claims about that vary and are unverified.
10. **Before launch.** Goals and success metrics written down; incentive structure; tool chosen or built; referral landing page; tracking and attribution; fraud rules; terms and conditions; the whole flow tested end to end. At launch: announce to customers, add in-app prompts, put the details on the website, brief support.
11. **First 30 days.** Review the funnel, identify top referrers, collect feedback, fix friction, remind customers who have not referred.
12. **Messages.** Launch email: subject names the reward and the product; body says what they get, what the friend gets, shows the personal link, then three short steps (share, friend signs up, both rewarded). Nurture rhythm (a starting cadence, not a measured value; adjust by your own open and referral data): reminder around day 7, a "know anyone who would benefit?" note around day 30, a success story with the prompt around day 60, and a note after a milestone. Draft these; sending them is the user's decision.

## Checks before done

- Reward cost per referral and worst-case monthly spend are stated and approved by the user.
- Max reward sits below the margin-based ceiling in the sizing file.
- Fraud rules, caps and terms exist before the first payout.
- Every number in the output comes from the user, from an official source named in words, or is labelled as an example or a starting point.
- Nothing was sent, posted or paid.
