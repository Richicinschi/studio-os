---
id: frontend-design
module: 03-planning
checked: 2026-11-02
---

# Frontend design with intent

## Why

- **The problem:** an interface Claude builds without direction tends to land on a few looks that read as generated. The skill names five of them, from a warm cream page with a serif headline and a clay accent to content chopped into identical rounded cards under the same soft shadow. Module 03 is silent on design; this problem is the skill's own.
- **The reason:** before any code, the skill has Claude name the subject, the audience and the design's main job, then write a compact design plan: four to six named colours, the typefaces and their roles, a layout concept, and the principles that make this page its own. It checks that plan against the brief for anything it would produce for any similar page, revises those parts, and only then builds, to a floor of responsive layout, visible keyboard focus and respected reduced-motion settings, critiquing as it goes.
- **The cost of skipping it:** the kit holds no story for it. Skipping it means Claude's defaults decide how your interface looks.
- **The principle:** [simplicity first, surgical changes](../PRINCIPLES.md#simplicity-first-surgical-changes). Its restraint rule, one bold element and no decoration the brief does not need, is the same idea applied to design.

## Detect

Read-only: names, descriptions, versions and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/frontend-design/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/frontend-design/SKILL.md" && echo user`.
- The official plugin: `claude plugin list`, reading only a `frontend-design@claude-plugins-official` entry and its `Version`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about visual design, user interfaces, brand or typography.
- Whether you do interface work at all, counts only, in each repository: `git -C <repo> ls-files '*.html' '*.css' '*.scss' '*.tsx' '*.jsx' '*.vue' '*.svelte' | wc -l`.

The menu marks the item **have** when a `frontend-design` skill or the plugin is installed, **partly** when another design skill covers the job, and **not yet** otherwise. With no interface files in any repository, the menu leaves it **not yet** without recommending it.

## Ask

1. **"Take frontend-design?"** Recommended when your work is software.
   - ADOPT the kit's copy. Its body is Anthropic's text, unchanged by the studio. Recommended when Detect counts interface files and finds no design skill.
   - Install the official plugin instead, from its source. Recommended when you would rather install it than keep a copy of the file.
   - Keep what you have, folding into it any line it lacks. Recommended when Detect says **have** or **partly**.
   - SKIP. Recommended when Detect counts no interface files.
   - Not sure: the option recommended above for what Detect found: keep what you have, folding in any line it lacks, for **have** or **partly**; ADOPT the kit's copy when it counts interface files and finds no design skill; SKIP when it counts none.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where?"**
   - This project only, in the repository's `.claude/skills/`. Recommended when only one repository has interface files.
   - Every project, in `~/.claude/skills/`. Recommended when several do.
   - Not sure: the option recommended above: every project when several repositories have interface files, otherwise this project only.
   - Default when skipped: this project only.

## Needs

- Nothing beyond Claude Code.
- Its self-critique works best when Claude can take screenshots of what it builds; how to set that up is not documented in docs/facts.md as of 2026-11-02.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit's copy, `catalog/skills/frontend-design/`: scans it with SkillSpector (`skillspector scan catalog/skills/frontend-design --no-llm`; on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows) and triages each finding with you. It is one prose file and its licence, with no code. Expect a few findings in the licence text: the studio's rescan of its copy rated it `SAFE`, with four false positives, all in `LICENSE.txt`. For the plugin route, Claude scans the same text at its source, `plugins/frontend-design` in the `anthropics/claude-plugins-official` repository. Then it recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** for the kit's copy, on your yes, writes it into the scope you chose, keeps `LICENSE.txt` (Apache-2.0) and the `license:` line, changes the author line in the front matter, which says the studio kept the text unchanged, to name only Anthropic and you, and replaces the studio's `VENDORED.md` with a short note of your own (the upstream, the text of 2026-09-01, what you changed). If you have a brand guide or design system, Claude adds one line pointing at it. It shows the change before it saves it.
3. **you:** for the plugin instead, type inside Claude Code: `/plugin install frontend-design@claude-plugins-official`.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The skill is in place: `test -f <scope>/frontend-design/SKILL.md && echo present` prints `present`, or `claude plugin list` lists `frontend-design@claude-plugins-official`.
2. **you:** in a new session, say "design a landing page for <your subject>". Before any code, Claude writes a short design plan, with named hex colours, typefaces and their roles, a layout concept that says how content aligns, and principles, then says what it revised after checking the plan against your brief.

If Claude goes straight to code, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes the `frontend-design` folder from the scope it went into, and the brand-guide line if step 2 added one.
- **you:** for the plugin, remove it with Claude Code's `/plugin` commands; the uninstall command is not documented in docs/facts.md as of 2026-11-02. Afterwards `claude plugin list` no longer lists it.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.

## Watch out

- **Your brief wins.** Where your brief or your company's design system pins a visual direction, the skill follows it exactly, even when it is one of the looks it calls a default.
- **One of the looks it warns against** uses the accent colour of Anthropic's own interface. A brand that already uses a similar colour is not wrong, only common.
- **Typefaces need licences.** A typeface it picks may need a licence for your product; check before you ship.
- **Keep the licence.** The skill is Apache-2.0: keep `LICENSE.txt` with any copy, and read it for what a changed copy must carry (docs/facts.md, "Licences of the external items").
- **Two copies:** with the plugin and the kit's copy both installed, both descriptions load in every session.
- **Optional by default.** It is for software work with a user interface; without one it only costs its description.
- **Cost:** its description loads into every session, about 51 tokens (an estimate, bytes divided by 4, description only, as on the other cards); the full skill, about 2,400 tokens (estimate), loads only when it is used.
