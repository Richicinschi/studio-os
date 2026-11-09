---
id: pack-web-astro-cloudflare-gsap-performance
module: domains
checked: 2026-11-09
tokens:
  light: 59
  standard: 59
  full: 59
---

# Domain: websites, Astro, Cloudflare, animation and speed

## Why

- **The problem:** a website for a small business or a project needs many small decisions that a non-coder cannot judge: how pages are organised, whether search engines understand them, whether a Cloudflare Worker is safe to deploy, whether the page is slow, and how to animate it without making it heavy.
- **The reason:** this pack gives Claude ten skills, each a written procedure. Representative jobs: work on an Astro site (`astro-dev`), animate with GSAP (tweens, scroll-linked animation and timelines, three skills), deploy and manage a Cloudflare Worker with `wrangler`, review Worker code against production practice, audit page speed in a real browser trace (`web-perf`), plan a site's pages and navigation (`site-architecture`), add structured data (`schema`), and build a whole local-business site from a template (`build-local-site`).
- **The cost of skipping it:** Claude answers from memory, and command flags, config fields and speed thresholds change between releases. The skills tell Claude to look current documentation up instead.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The speed skill reads numbers from a real trace, and the Worker skills try a change under `wrangler dev` and `--dry-run` before a deploy.

## Detect

Read-only: presence and versions, never the contents of your site. Tools the skills use, printed as found or not found:

- `node --version` and `npm --version`, and `wrangler --version 2>/dev/null | head -1` (it only prints when wrangler is installed on your computer).
- The pack, at project and user level: `ls -d .claude/skills/web-astro-cloudflare-gsap-performance "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/web-astro-cloudflare-gsap-performance 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'astro|cloudflare|wrangler|gsap|schema|seo|web perf'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers web work and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you build or look after websites, Cloudflare Workers or animated pages?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names a website, a landing page, a Cloudflare Worker or a client's site as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the site.
   - Every project, in your user folder. Recommended when you build sites in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Node and `npm` for Astro and for `wrangler`. The speed skill needs the Chrome DevTools MCP server, which it starts with `npx`; it stops and tells you to add it when it is missing. None of the ten skills has a "Without local tools" section, so on claude.ai Claude can write code and explain commands, and you run them on your own computer.
- A Cloudflare account for deploys. The local-site skill names it as the free host.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/web-astro-cloudflare-gsap-performance/`: scans it with SkillSpector (`skillspector scan catalog/packs/web-astro-cloudflare-gsap-performance --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude and you:** read the code files the pack ships, together. They are templates, and they run only when a project copies them: `skills/astro-dev/templates/` holds `astro.config.ts`, `content.config.ts` and a stylesheet; `skills/build-local-site/templates/` holds a full Astro site scaffold (config, `package.json`, components, layouts, pages and data templates). No script runs on its own.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/web-astro-cloudflare-gsap-performance/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the ten skill files under `skills/`.
2. **you:** in a new session, say "how do I make a section pin while the page scrolls, with GSAP?". Expected: Claude opens the pack's entry, picks the ScrollTrigger skill, reads it, and answers from it.
3. If Claude answers without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `web-astro-cloudflare-gsap-performance` folder from `skills/`.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 59 tokens (estimate, bytes divided by 4). Its index, about 762 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **Deploys and accounts need your approval.** A `wrangler deploy` publishes to your Cloudflare account and `wrangler login` signs you in. Ask Claude to try `wrangler dev` and `--dry-run` first, and approve the deploy yourself.
- **The skills fetch current documentation.** The Worker and speed skills tell Claude to read pages on the web instead of trusting memory, and the speed skill drives a real browser on a page you name. Page addresses and traces are session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes").
- **The local-site skill is large.** It builds 80 to 100 or more pages, so ask for the counts first and review the sample business data before it generates the site.
- **Author field and sample names.** The skills carry the studio's author name in their front matter, and the local-site skill uses a sample plumbing business as its example. Replace the author with yours, and keep the sample data out of a real site.
