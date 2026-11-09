---
id: cro
title: Page and form conversion audit
description: Use on homepage, landing, pricing, feature, lead form: CRO, conversion rate optimization, nobody's converting, landing sucks, form abandonment, needs work, why isn't this working, improve conversions, URL feedback. Not signup, registration flows, post-signup activation, onboarding, popups, modals.
---

## When to use

Typical wordings: "this page isn't converting", "nobody's converting", "why isn't this page working", "my landing page sucks", "low conversion rate", "improve conversions", "this page needs work", "form abandonment", plain "CRO" or "conversion rate optimization". Also use it when the user only pastes a URL and asks what you think.

Scope: any marketing page (homepage, landing, pricing, feature, blog, about) and any form (lead capture, contact, demo request, quote).

Neighbours, and where each takes over:
- Account creation or registration flow: use the signup skill.
- What happens after the account exists (activation): use the onboarding skill.
- Popups and modals as a tactic: use the popups skill.
- The page needs a full copy rewrite: use the copywriting skill; stay here for the diagnosis.
- Running a test properly (sample, duration, stats): use the ab-testing skill.

## How it works

You are acting as a conversion specialist. The goal is a ranked list of changes someone can ship, not a general critique.

1. Look for saved product context. If `.agents/product-marketing.md` exists (older setups used `.claude/product-marketing.md` or a file called `product-marketing-context.md`), read it first. Ask the user only for what it does not answer or what is specific to this page.

2. Pin down three facts and ask the five questions below.
   - Page type: homepage, landing page, pricing, feature, blog, about, other.
   - The one conversion that counts: sign up, book a demo, buy, subscribe, download, contact sales.
   - Traffic source: organic search, paid, email, social.
   Questions: What is the current conversion rate and the target? Where does the traffic come from? What does the flow look like after this page? Is there any research (heatmaps, session recordings, user interviews)? What has already been tried?

3. Audit the page along seven dimensions, strongest lever first. Cover all seven; skip one only when it is genuinely fine.

   1. Value proposition (biggest lever). Could a stranger say what this is and why it matters within a few seconds? Is the main benefit specific and different from competitors, in the customer's words and not internal jargon? Typical faults: describes features instead of results, is vague or too witty to be clear, tries to say everything rather than the one thing that matters.
   2. Headline. It should carry the core value, be concrete enough to mean something, and echo what the visitor clicked on. Patterns that work: a result without the usual pain ("get X without Y"), figures or timeframes, a proof count ("trusted by 4,000+ shops").
   3. Calls to action. One obvious primary action, visible without scrolling. Button text should promise something: "Go", "Continue" and "Click Here" are weak; "Book My Slot", "Get the Checklist" and "Compare Plans" are stronger. Check the primary/secondary ranking and that the CTA reappears at points where a decision is made.
   4. Visual hierarchy and scanning. Someone skimming should still get the message. The key elements must stand out, spacing should give room, and images must back the message instead of competing with it.
   5. Trust and proof. Look for recognisable customer logos, testimonials that are specific, named and pictured, short case results with real numbers, review scores with counts, and security badges where money or data is involved. Put proof beside CTAs and right after a claim.
   6. Objections. Typical doubts: is it worth the price, will it work in my situation, is it hard to set up, what if it fails. Answer with an FAQ, a guarantee, comparison content, or a visible description of the process.
   7. Friction. Too many form fields, a vague next step, tangled navigation, details required that need not be, poor mobile behaviour, slow loading.

4. Deliver the findings in four blocks.
   - Quick wins: cheap changes likely to help right away.
   - High-impact changes: larger work with a bigger expected payoff, in priority order.
   - Test ideas: hypotheses to verify with an experiment instead of assuming.
   - Copy alternatives: for the headline, main CTA and any other key line, 2 or 3 options each with the reasoning.

5. Apply the page-type lens on top of the audit.

   | Page | What good looks like |
   |---|---|
   | Homepage | Positioning a cold visitor understands; a short route to the most common action; room for both the ready-to-buy and the still-researching visitor |
   | Landing page | Wording matches the ad or link that brought the visitor; one CTA, with site navigation removed where possible; the whole argument on one page |
   | Pricing | Plans easy to compare; the suggested plan marked; reassurance for "which one is right for me?" |
   | Feature | Feature tied to the benefit; use cases and examples; obvious way to try or buy |
   | Blog post | CTAs related to the post topic; inline CTAs at natural pauses in the text |

6. Propose experiments in these areas: the hero (headline, visual, CTA), where proof sits, how prices are shown, form changes, navigation and general UX. A long catalogue by page type is in [experiment ideas by page](cro/references/experiment-ideas-by-page.md). Pick the few that fit the audit rather than listing everything.

7. If the page holds a form, or the form is the problem, switch to [form fields and flow](cro/references/form-fields-and-flow.md) for field-level advice, multi-step design, errors, mobile, and measurement.

## Checks before done

- Page type, one conversion goal and traffic source are stated, not guessed silently.
- Every recommendation names the element, the problem, and the change; none is generic advice.
- Findings are ranked, and the four output blocks are present.
- Headline and CTA each have 2 or 3 alternatives with a reason.
- Claims about what "will" lift conversions are phrased as hypotheses unless the user supplied data.
- Anything better handled by a neighbouring skill is pointed there instead of half-done here.
