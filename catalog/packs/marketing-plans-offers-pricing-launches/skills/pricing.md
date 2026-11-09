---
id: pricing
title: Pricing and packaging
description: Use for pricing, packaging, monetization, tiers, freemium, free trial, price increase, value metric, Van Westendorp, willingness to pay, wrong pricing, pricing page, annual vs monthly, per seat, free plan, offer plans. Upgrade screens: paywalls. Service offers: offers.
---

# Pricing and packaging

## When to use

Typical wordings: "how much should I charge", "my pricing is wrong", "should I offer a free plan", "annual vs monthly", "per seat or flat fee", "can I raise my price", "design my pricing page", "what goes in each tier", "run a Van Westendorp survey".

Neighbouring skills take over here:
- In-app upgrade screens: paywalls.
- Bonuses, guarantees, value framing and naming for services, courses, coaching or high-ticket B2B: offers.
- Cancel flows and save offers: churn-prevention.
- Pricing page conversion: cro. Pricing page wording: copywriting. Psychology background: marketing-psychology.
- Testing a price change: ab-testing.
- Deal desk, proposals and sales decks: revops and sales-enablement.

Studio rule: the studio's own prices are the owner's decision. Work out options and reasoning, but never fix a real price for a studio product without asking the owner. Every price in this skill and its files is an invented example and is labelled as one.

## How it works

1. Look for a product marketing context file in the project (`.agents/product-marketing.md`, then `.claude/product-marketing.md`, then the older `product-marketing-context.md` in either folder). If one exists, read it and ask only for what it lacks.
2. Collect the facts you still need, a few at a time:
   - Business: product type (software, marketplace, shop, service), current price if any, buyer size (small, mid, large), sales motion (self-serve, sales-led, mixed).
   - Value: the main outcome delivered, the alternatives buyers weigh, what competitors charge.
   - Numbers: conversion rate, average revenue per user, churn, anything buyers have said about price, research already done.
   - Goal: growth, revenue or profit; moving up or down market; what change is being considered.
3. Split the problem into three separate decisions and say which one the user is stuck on:
   - Packaging: what each plan contains (features, limits, support).
   - Pricing metric: the unit you charge for (user, usage, flat fee) and so how price grows with value.
   - Price point: the amount itself.
4. Anchor on value, not cost. The buyer's perceived value is the ceiling; the next best alternative is the floor; cost to serve is only a sanity baseline. Aim between the floor and the ceiling.
5. Pick the metric. Ask: when a customer uses more of this unit, do they get more value? If yes, it is a candidate. A good metric is easy to explain, grows as the customer grows, and is hard to game. Common choices and what they suit are in [value metrics and tiers](pricing/references/value-metrics-and-tiers.md).
6. Shape the tiers. The default is three: an entry plan that lowers the barrier, a middle plan where most buyers should land and which sets the anchor, and a top plan priced above the middle for heavy users (2-3x the middle is a starting point, not a measured value). Separate tiers by gated features, usage limits, support level, or access items such as an API, single sign-on or custom branding. Tier counts, persona-based packaging and a worked example are in the same reference file.
7. Where the price is a guess, research it: Van Westendorp for an acceptable range, MaxDiff for which features belong in which plan, Gabor-Granger or conjoint for demand, usage-to-value analysis for existing customers. Methods, sample sizes and analysis are in [research methods](pricing/references/research-methods.md).
8. For a possible price rise, check three kinds of signal.
   - Market: competitors have gone up, prospects do not react to the price, people say it is cheap.
   - Business: conversion and churn that are healthy compared with your own history (count trial-to-paid and monthly cancellations over the last several months), and healthy unit economics.
   - Product: real value added since the last price change, a more mature product.
   Then pick the rollout: keep existing customers on the old price, announce 3-6 months ahead, pair the rise with new features, or restructure the plans.
9. For the pricing page: a comparison table, the recommended plan highlighted, a monthly/annual switch, one call to action per plan, a line on who each plan is for, an FAQ, a money-back guarantee and trust signals. Set the annual discount from your own numbers: compare how many customers take annual at different discounts and what the up-front cash is worth to you. Psychology levers: show the higher option first (anchoring), make the middle plan the obvious best value (decoy), prices ending in 9 are commonly used to signal value and round numbers to signal premium; treat that as a habit to test with your own buyers, not a proven rule.
10. Decide the free path (free plan, free trial, reverse trial) and whether a large-account plan with "contact sales" is needed. Both are covered in [free plans and enterprise](pricing/references/free-plans-and-enterprise.md).
11. Hand back options with the reasoning, the numbers to validate, and the test to run next. Offer the neighbouring skill that fits the next step.

## Checks before done

- Target personas are named and competitor prices were looked at.
- The metric was tested with the "more use, more value" question.
- Willingness-to-pay evidence exists, or the answer says the price is an untested hypothesis and names the cheapest way to test it.
- Every feature is mapped to a plan; tier count and differences are explicit; the annual discount and any large-account plan are decided.
- All sample prices are marked as invented examples, and no real studio price was set without asking the owner.
