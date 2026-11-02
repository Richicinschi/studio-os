---
id: codebase-design
module: 09-data-work
checked: 2026-11-02
---

# Codebase design

## Why

- **The problem:** code that grows without a shape. A module's interface ends up nearly as large as what it does, a layer is added for a variation that never comes, and tests break on every rename because they reach past the interface. Talking about it is hard too, when "component", "service" and "boundary" mean something different to each person.
- **The reason:** the skill gives Claude and you one set of words and a few tests for them. A **module** is anything with an interface and an implementation; it is **deep** when a lot of behaviour sits behind a small **interface**; a **seam** is where that interface lives, and an **adapter** fills it. Its tests: imagine deleting the module and see whether complexity vanishes or spreads to its callers; one adapter means a hypothetical seam, two mean a real one; the interface is also the test surface.
- **The cost of skipping it:** the kit has no story of its own here. Without shared words, each design discussion starts by agreeing on terms, and abstractions get added because they look tidy rather than because two callers need them.
- **The principle:** [simplicity first, surgical changes](../PRINCIPLES.md#simplicity-first-surgical-changes). The deletion test and the two-adapter rule argue against any layer that does not earn its place.

## Detect

Read-only: folder names and the front matter of skills and agents (their name and description), never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/codebase-design "$U/skills/codebase-design" 2>/dev/null`.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'deep module|architect|interface design|seam' && echo "$f"; done`
- The same words already in an instruction file: `grep -inE 'deep module|seam|adapter' CLAUDE.md AGENTS.md 2>/dev/null`.

The menu marks the item **have** when a skill named `codebase-design` exists, or another skill's description covers designing module interfaces; **partly** when only an architecture reviewer exists (an agent or skill that reviews structure without this vocabulary) or the instruction file uses these words; **not yet** otherwise.

## Ask

1. **"Take codebase-design?"** Recommended when your work is software.
   - ADOPT as it is: the body and its two reference files as they ship; the description names `improve`, which the kit ships ([improve](improve.md)), and that name stays only if you take it (step 2). Recommended when Detect says **not yet** and you take [tdd](tdd.md) or [diagnosing-bugs](diagnosing-bugs.md), which use these words.
   - ADAPT: the same, with the examples rewritten in your main language (they are TypeScript) and the glossary matched to words your team already uses.
   - FOLD: the glossary's eight terms and the four principles, in your words, into your instruction file or your existing design skill. Recommended when Detect says **partly**.
   - Skip. Recommended when Detect says **have**, or your code is small and stays small.
   - Not sure: the option recommended above for what Detect found: skip for **have**, FOLD for **partly**, and for **not yet** ADOPT if you take tdd or diagnosing-bugs, skip otherwise.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"** (for ADOPT or ADAPT)
   - This project: `.claude/skills/codebase-design/`.
   - Every project: `~/.claude/skills/codebase-design/`. Recommended when tdd or diagnosing-bugs go to every project, so the words they point to are there too.
   - Not sure: the option recommended above: the same scope as tdd and diagnosing-bugs, or this project if you take neither.
   - Default when skipped: this project.

## Needs

- Nothing beyond Claude Code. Its "design it twice" reference starts subagents, which Claude Code has ([docs/facts.md](../docs/facts.md), "Claude Code: context commands, subagents, extra folders").
- SkillSpector, for the scan in step 1: row 1 of your plan ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/codebase-design/`: `skillspector scan catalog/skills/codebase-design --no-llm` (on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows), the triage, and a recommendation against what Detect found. The studio's scan of this copy on 2026-11-02 said SAFE, 5/100; your own result is the one that counts.
2. **Claude:** on your yes, writes the copy and shows you the change before it saves it:
   - the description's triggers in your words; its mention of `improve` kept if you take the kit's [improve](improve.md), and otherwise replaced by the skills you do have that use these words, or dropped;
   - the front matter's author and the studio's notes dropped; the upstream source line kept;
   - `DEEPENING.md` and `DESIGN-IT-TWICE.md` kept; the latter's mention of a `CONTEXT.md` for your domain's words pointed at your own glossary, or dropped if you keep none;
   - for ADAPT, the examples in your language and any term you rename changed everywhere it appears;
   - `LICENSE` kept (MIT, per the `LICENSE` file itself, the kit's only source for it).
3. **Claude:** for FOLD, writes the terms and principles in your words into the instruction file or skill Detect found, and nothing else.
4. **Claude:** records the decision, the scope, the scan result and the undo in `adoption/decisions.md`.

## Check

1. **you:** in a new session, ask "is <a module in your code> deep or shallow?".
2. Expected: Claude answers in the skill's words (interface, depth, seam, adapter), and applies the deletion test: what would happen to the callers if the module were deleted.

If Claude answers with "component", "service" or "boundary" and no deletion test, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/codebase-design/` or `~/.claude/skills/codebase-design/`, whichever scope you chose. For FOLD, it removes the lines it added, which `adoption/decisions.md` names.
- **Claude:** if tdd or diagnosing-bugs point at it, changes that pointer too, so it does not dangle.
- **Claude:** adds the removal to `adoption/decisions.md`.

## Watch out

- **Context cost:** the description loads every session, about 74 tokens; the body, about 1,550 tokens, loads when the skill runs; `DEEPENING.md` (about 640) and `DESIGN-IT-TWICE.md` (about 680) only when Claude opens them. Estimates (bytes divided by 4).
- **"Design it twice" is the expensive part.** It starts three or more subagents in parallel, each designing the interface a different way, and each subagent works in its own context. Ask for it by name when the choice is worth that cost.
- **Fixed words.** The glossary tells Claude to use its terms exactly and to avoid "component", "service", "API" and "boundary". If your team already has settled words, ADAPT or FOLD it, so you do not end up with two vocabularies.
- **Folding costs every session.** A glossary folded into your instruction file loads on every turn; in the skill it loads only when used. Fold the terms, not the whole page.
