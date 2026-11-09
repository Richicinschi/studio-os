---
id: pack-marketing-plans-offers-pricing-launches
module: domains
checked: 2026-11-09
tokens:
  light: 50
  standard: 50
  full: 50
---

# Domain: marketing plans, offers, pricing and launches

## Why

- **The problem:** a solo maker ships a product and then has no plan for who to tell, what to charge, how to launch, or what a competitor does better. Asking Claude "how do I market this?" returns a generic list with no order, no budget and no first step.
- **The reason:** this pack gives Claude sixteen skills, each a written procedure. Grouped by job:
  - Plan: a full marketing plan sized to your budget, team and stage, a short list of fitting ideas drawn from a library of 139, a shared product context file (audience, rivals, voice, proof) that the other skills read, and psychology models applied honestly.
  - Offer and price: build or fix an offer (bonuses, guarantee, honest scarcity, payment plans), and set tiers, a free plan or trial, price rises and the pricing page.
  - Launch and spread: a launch plan with stages and a checklist, a free download that collects emails, a referral or affiliate program, and press (media list, pitches). The press skill drafts only.
  - Know the market: rival profiles built from their public pages, alternative and versus pages from sourced records, and customer research from interviews, surveys, reviews or public communities.
  - Posts and ads: social posts and short video scripts, community building, and ad headlines and text checked against platform limits.
- **The cost of skipping it:** marketing stays a to-do that never gets a plan, a price comes from a guess, and a launch happens with no checklist.
- **The principle:** [fit, not copy](../PRINCIPLES.md#fit-not-copy). The plan and offer skills start from your budget, team and stage, and state their own figures as starting points.

## Detect

Read-only: presence only, never the contents of your files.

- The pack, at project and user level: `ls -d .claude/skills/marketing-plans-offers-pricing-launches "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/marketing-plans-offers-pricing-launches 2>/dev/null`.
- Whether a product marketing context file already exists, by name only: `ls .agents/product-marketing.md .claude/product-marketing.md 2>/dev/null`. The skills read it first if it is there.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'marketing|pricing|launch|competitor|referral|positioning|social|advertis'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers marketing plans, pricing or launches and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you plan marketing, set prices, run launches or study competitors and customers?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names a product you sell, a launch, pricing, customers, competitors or social channels as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when the marketing belongs to one product.
   - Every project, in your user folder. Recommended when you market several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- No program is required. None of the sixteen skills lists a required tool, and none has a "Without local tools" section. They read pages you give them and files in your project, and write markdown.
- Some steps use what you already have: public pages of your rivals (the two competitor skills fetch and save them), exports from interviews or surveys, and connections to your analytics, store or email tool if you have set them up (the plan skill reads from them when they exist). No account or key is needed to adopt the pack, and no skill asks for one to be created. Paid tools for ad visuals and voice are named only as options.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/marketing-plans-offers-pricing-launches/`: scans it with SkillSpector (`skillspector scan catalog/packs/marketing-plans-offers-pricing-launches --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude:** looks for skill folders that hold scripts or templates (`find catalog/packs/marketing-plans-offers-pricing-launches -type f \( -name '*.mjs' -o -name '*.py' -o -name '*.sh' -o -name '*.js' -o -name '*.ts' \)`). The pack is expected to have none: its skill folders hold reference notes and templates in markdown. If the scan or the find lists anything, read it with you before the copy.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/marketing-plans-offers-pricing-launches/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the sixteen skill files under `skills/`.
2. **you:** in a new session, say "I am planning a launch for my app next month". Expected: Claude opens the pack's entry, picks the launch skill, reads it in full, asks about your product and audience, and returns a plan and drafts without posting or paying for anything.
3. If Claude writes a launch plan without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `marketing-plans-offers-pricing-launches` folder from `skills/`.
- **you:** remove the zip from claude.ai's skill settings, if you added one.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 50 tokens (estimate, bytes divided by 4). Its index, about 1,033 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **This is general practice, not a promise of results.** The skills mark their own figures as starting points: "a starting point, not a measured value" for the tier gap in `skills/pricing.md`, the media list size in `skills/public-relations/building-a-media-list.md` and the persona floor in `skills/customer-research.md`, and the plan's year-end goal is "a forecast, not a promise" (`skills/marketing-plan/references/sections-9-13.md`). Your results depend on your product, audience and budget.
- **Spending and publishing need your approval.** The launch skill keeps to plans and drafts and does not post, send or pay for anything itself; the ad skill stops before anything that costs money or goes outward and states the amount; the press skill hands over drafts one at a time and sends nothing; the lead magnet skill names a budget before any paid promotion. Keep that behaviour when you adapt them.
- **Rival research fetches public pages.** The competitor skills save the pages they fetch and say to use public sources only. Check a site's terms before you fetch it in bulk.
- **Your plans and customer data are session content.** Interview notes, survey exports and reviews that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Remove names and contact details from research material you paste in.
- **Studio-specific wording.** The skills carry "studio rule" lines (English only, no em or en dashes, no fake accounts or staged praise) and read the context file at `.agents/product-marketing.md` or `.claude/product-marketing.md`. Replace the rules with yours, and keep the context file where your setup keeps it.
