---
id: emails
title: Email sequences and lifecycle flows
description: Use for welcome series, email workflow, drip campaign, lifecycle emails, email funnel, nurture sequence, email automation, re-engagement emails, onboarding emails, trigger-based emails, welcome sequence, what emails should I send, email sequence, multi-email flows, email cadence.
---

## When to use

Typical wordings: "draft a welcome series for my new app", "which emails follow a trial start", "I need a lapsed-user flow", "set up a drip for webinar leads", "review our lifecycle mail", "how often should this flow send". Any automated flow of several emails belongs here.

Neighbours and where each takes over:
- Cold outreach to people who never opted in: the `cold-email` skill.
- Screens and prompts inside the product after signup: the `onboarding` skill. Email supports that work and never repeats it.
- Cancel flows, save offers and payment-failure strategy: `churn-prevention`. The email copy for them can still be drafted here.
- The landing page or form an email links to: `copywriting` and `cro`.
- Testing an email element: `ab-testing`.
- Planning the lead magnet that feeds a nurture flow: `lead-magnets`. Email capture popups: `popups`. Lifecycle stages that fire a flow: `revops`.

This skill drafts only. It never sends, schedules or uploads anything to a mail platform. Before any real send or import, stop and ask, and say who would receive it and what it could cost.

## How it works

1. **Load context.** If a product marketing context file exists in the project (`.agents/product-marketing.md`, `.claude/product-marketing.md`, or the older file `product-marketing-context.md`), read it before asking questions. Ask only for what it does not cover or what is specific to this task.
2. **Frame the sequence.** Settle five things, asking the user for whatever is missing:
   - Type: welcome, lead nurture, re-engagement, post-purchase, event-based, educational or sales.
   - Entry trigger: what exactly puts a person into the flow.
   - Audience: who they are, what they already believe about you, how warm the relationship is.
   - Goal: the one conversion action, any relationship or segmentation aim, and how success is measured.
   - Context: which other emails the same person already receives, and how the current ones perform.
3. **Hold four principles.** One email has one job and one main call to action. Give value before asking for anything. Fewer, more relevant emails beat volume, so segment. Every email must move the reader somewhere useful, with the next step obvious.
4. **Pick length and spacing.** The first message goes out the moment the trigger fires. After that, pace by purpose: early emails a day or two apart, nurture mail every two to four days, long-running programs weekly or fortnightly. Count by type: welcome 3-7 emails, nurture 5-10, onboarding 5-10, re-engagement 3-5, then stretch or trim for a long sales cycle, a complex product or a relationship that is already warm. For B2B, keep sends off weekends; for B2C, test them. Deliver in each reader's local time, not the sender's.
5. **Write subject lines and preview text.** Each subject is a promise the email keeps.
   - Rules: say something specific instead of something clever, name a benefit or a real curiosity, and land at 40-60 characters. Emoji divide audiences, so test them before relying on them.
   - Shapes that work: a question ("Haven't finished X yet?"), a how-to with a timeframe, a number ("4 ways to ..."), a line that uses the first name, or the opening of a story.
   - Preview text runs about 90-140 characters and picks up where the subject stops; never repeat the subject in it.
6. **Choose the structure.** Use the four standard shapes (welcome, nurture, re-engagement, product onboarding) from [sequence-templates](emails/sequence-templates.md), or one of the lifecycle and campaign types in [email-types](emails/email-types.md): onboarding, retention, billing, usage, win-back and campaign emails, with an audit list at the end.
7. **Write each email.**
   - Shape: a hook line, why it matters to them, the useful content, one call to action, a warm human sign-off.
   - Layout: paragraphs of 1-3 sentences, space between blocks, bullets for scanning, bold rarely, designed for a phone first.
   - Voice: conversational, "I/we" and "you", active verbs; friendly within the brand; read it aloud and check it sounds like a person.
   - Length: 50-125 words transactional, 150-300 educational, 300-500 story-led. Shorter is the default, and a long email has to earn its length.
   - Call to action: a button for the main action, a plain link for secondary ones, button text that names the action and the result.
8. **Deliver in this format.** First an overview: sequence name, trigger, goal, number of emails, timing between them, exit conditions. Then for every email: number and purpose, send timing, subject, preview, full body, call to action with its destination, and any segment condition.
9. **Add a metrics plan.** Name what to track: open rate, click rate, unsubscribe rate, the sequence-specific conversion rate, and revenue per email where it applies. Do not quote outside benchmark ranges as fact; set targets against the user's own baseline. Personalization, segmentation and test design are in [copy-and-testing](emails/copy-and-testing.md).
10. **Leave tooling to the user.** The user picks the sending platform. Offer to adapt the drafts to its merge-field syntax. Importing or sending is a separate step that needs their explicit go-ahead.

## Checks before done

- The overview block and one block per email are all present, with no placeholder left unfilled except merge fields.
- Each email has exactly one job and one primary call to action.
- Timing, length and exit conditions are stated, and the spacing fits the audience.
- Subject lines sit near 40-60 characters and previews do not repeat them.
- Nothing was sent, scheduled or imported, and the user was told so.
- Recipients opted in to this mail, and every email carries a working way to unsubscribe.
- Output is English only, with no em or en dashes.
