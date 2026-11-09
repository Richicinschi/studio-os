---
id: product-marketing
title: Product marketing context
description: Use when a product marketing context document needs making or updating, or on "describe my product", "who is my target audience", ICP, ideal customer profile, positioning, "set up context", product or marketing context, avoid repeating foundational information across tasks, new project.
---

# Product marketing context

This skill builds one file, `.agents/product-marketing.md`, holding the facts about a product, its buyers and its position in the market. Every other marketing skill reads that file, so nobody has to explain the product twice.

## When to use

- A new project starts and no marketing work has happened yet. Run this before the copy, email, pricing or launch skills.
- The user says things like "set up the marketing context", "who is my ideal customer profile", "help me describe my product", "write down my positioning".
- The product changed (new audience, new price, new rival) and the existing file is stale.
- Not for writing copy, emails or plans themselves. Once the file exists, hand over to the matching marketing skill, which will read it.

## How it works

1. **Find any existing file.** Look for `.agents/product-marketing.md`. Also check `.claude/product-marketing.md`, and the older file name `product-marketing-context.md` in either `.agents/` or `.claude/`. A copy found anywhere except the canonical path gets an offer to move it there. If a file exists, read it, summarise what it holds in a few lines, ask which sections the user wants to change, and gather only those.
2. **Offer two routes when nothing exists.** Route A (recommended): you study the repository and draft a first version. Route B: you interview the user section by section. Most people prefer A because correcting a draft is faster than answering from a blank page.
3. **Route A, draft from the repo.** Read the README, landing pages, marketing copy, about pages, meta descriptions, the package manifest and any docs. Fill every section you can from what you actually found. Show the draft, ask "what is wrong and what is missing?", and revise until the user is content.
4. **Route B, interview.** Take the sections in [sections.md](product-marketing/sections.md) one at a time. For each: say in a sentence what you are capturing, ask your questions, repeat back a summary, get a yes, move on. Never paste all questions at once. Rules for the conversation:
   - Ask pointed questions ("what single annoyance makes someone start looking for an alternative?") instead of broad ones ("what problem do you solve?").
   - Ask for a real example when an answer is vague.
   - Press for the customers' own words. A phrase quoted exactly beats a polished description, because it shows how buyers think and speak, and copy built from it lands harder.
   - Skip sections that do not fit, such as buying roles for a consumer product.
   - Proof points, figures and testimonials come only from the user. Never invent them; leave the field blank if there is nothing.
5. **Write the document** using the skeleton in [template.md](product-marketing/template.md). Date the header. Keep tables for buying roles, objections, glossary and value themes.
6. **Confirm and save.** Show the finished file, ask for adjustments, then save it at `.agents/product-marketing.md`. Tell the user that the other marketing skills will pick it up automatically, and that running this skill again updates it.

## Checks before done

- The file exists at the canonical path and has a date in its header.
- Customer language holds exact phrases, not paraphrases.
- No figure, logo or testimonial appears that the user did not supply.
- Each section was either filled or deliberately skipped with a reason.
- The user saw the full document and approved it.
