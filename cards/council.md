---
id: council
module: 08-agents-and-council
checked: 2026-11-02
tokens:
  light: 57
  standard: 324
  full: 805
---

# The council: several seats on one decision

## Why

- **The problem:** one model gives one view, shaped by how you framed the question, and asking the same thread for a second opinion gets the same view again. A big decision, such as a tool choice, a design or what to ship first, deserves someone whose whole job is to find what is wrong with it.
- **The reason:** the `council` skill picks three to five seats that suit the question, runs them in parallel on the same context, and returns one brief: a line per seat, where they disagree, a recommendation, and the decision handed back to you. With `--debate` it runs a second round in which each seat answers the others.
- **The cost of skipping it:** a big decision gets one view, and nothing in that view argues back. When the studio tested its council, a two-round debate on a question about one of its projects ended with the seats moving their positions and correcting each other instead of agreeing ([module 08, Evidence](../modules/08-agents-and-council/README.md#evidence)).
- **The principle:** [push back once, then do it](../PRINCIPLES.md#push-back-once-then-do-it). Each seat states its concern once, from its own lens; the brief shows the conflict instead of averaging it away, and the decision stays yours.

## Detect

Read-only: names, descriptions and counts, never a skill's or an agent's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The skill, at project and user level: `ls -d .claude/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/council" 2>/dev/null`.
- The seats it would call:
  - how many agent files exist at each level: `ls .claude/agents/*.md 2>/dev/null | wc -l` and `ls "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md 2>/dev/null | wc -l`;
  - which of them are seats: the rows for this module's agents in `adoption/decisions.md`, with the names they were given, and the seats this adoption plans to take, from `adoption/plan.md`.
- Another skill or agent that already runs a panel (a "board", "panel", "second opinion" or "debate" in its description). This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md .claude/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md 2>/dev/null`

The menu marks the item **have** when a council skill, or another skill that runs a panel, exists and at least three seats are in place, or, when `adoption/decisions.md` records the light size for this item, when one seat is in place; **partly** when there is a panel skill with fewer than three seats, or three seats with no panel skill; and **not yet** otherwise.

## Ask

1. **"Size?"** Each estimate is the descriptions that size loads every session, bytes divided by 4; instructions load only when a seat or the council runs.
   - Light: one seat, called by name for a second view; the council itself waits until you have three seats, as module 08 advises. About 57 tokens (estimate), for the skeptic's description. Recommended for a first adoption, and when Detect finds fewer than three seats.
   - Standard: the council with three seats, such as the skeptic, the architect and, if you merge code, the reviewer. About 324 tokens (estimate): the council's description and those three seats'. Recommended when Detect finds three seats, or your plan takes three.
   - Full: the council with every seat you take, up to the kit's eleven. About 805 tokens (estimate) with all eleven. Recommended when your plan takes more than three seats because your decisions need more lenses, such as money, design or law.
   - Not sure: the recommended size above for what Detect found and your plan; light when Claude cannot tell.
   - Default when skipped: light.
2. **"Take the council?"** (only at standard or full)
   - ADAPT the kit's copy: its seat list and panel table rewritten to your seats. Recommended when Detect finds at least three seats, or your plan takes three.
   - Not yet: take two or three seats first, then come back. Recommended when Detect finds fewer than three seats and your plan adds none.
   - FOLD the idea into what you have: a few lines in your instruction file saying that for a big decision Claude asks two seats separately, then lists where they disagree. Recommended when Detect says **partly** because a panel skill exists, or when you expect a panel once a month or less.
   - Skip.
   - Not sure: the recommended option above for what Detect found and your plan.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
3. **"Where?"** (only when the answer above was ADAPT)
   - Every project, in your user folder. Recommended when your seats are in your user folder.
   - This project only. Recommended when your seats are in this project's `.claude/agents/`: a project's agents are there for that project only ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so a council elsewhere cannot call them.
   - claude.ai: no skill file; you act as the convener in a Project ([module 08](../modules/08-agents-and-council/README.md)). Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
   - Not sure: the recommended option above: the same level as most of your seats.
   - Default when skipped: the same level as most of your seats.
4. **"How many seats may run at once?"** (only at standard or full)
   - Up to five, the largest quick panel. Recommended when your `adoption/spec.md` says you do not hit usage limits.
   - One at a time. Recommended when your `adoption/spec.md` says you hit usage limits.
   - Not sure: the recommended option above for what `adoption/spec.md` says; up to five when it does not say, and you can lower it later.
   - Default when skipped: up to five.

## Needs

- Claude Code. The council starts its seats as subagents. Whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), so there you run the seats by hand (Steps 4 and 5).
- At least three seats, each taken through its own card. The module page suggests starting with [karen-skeptic](karen-skeptic.md) and [marie-architect](marie-architect.md), which suit most decisions, and [linus-reviewer](linus-reviewer.md) if you merge code.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)). The install is the same on every system, once uv is installed: `! uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git`. On Windows, run `$env:PYTHONUTF8=1` in PowerShell before a scan.

## Steps

Which steps each size takes: **light** only step 6, which records that the council waits; the one seat goes through its own card, and you call it by name. **Standard** and **full** take steps 1 to 3 and 6, with 4 and 5 on claude.ai; they differ in how many seats step 2 lists.

1. **Claude:** runs `vet-and-adopt` on `catalog/skills/council/`: scans it with SkillSpector (`skillspector scan catalog/skills/council --no-llm`), triages the findings, and recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found. The kit's maintainers rated it SAFE at 0/100 on 2026-11-02, with the SkillSpector build that reports 2.2.3; a fresh install is newer and may score it differently ([docs/facts.md](../docs/facts.md), "Installing SkillSpector"). Your own scan is the one that decides. ADOPT as it is does not fit, because the file names the studio's seats.
2. **Claude:** writes your council in your words, and shows it to you before saving:
   - **the seat list:** your seats, by the names you gave them, each with its one-line lens: three at standard, every seat you took at full. It replaces the studio's eleven, its split into a board and a crew, and the pointer to a roster file the kit does not ship;
   - **the panel table:** one row per kind of question you face, each naming the seats that suit it, three to five once you have that many. A seat you did not take leaves every row;
   - **the cap:** your answer to question 4, in place of the studio's own cap on seats at once, which gives no number and points at one of the studio's memory notes;
   - **the "never all of them" count:** your number of seats, in place of the studio's eight;
   - **the description:** your name for the panel and an example question from your own work. The studio's example question is about one of its own products;
   - **cut:** the note that live crosstalk between seats would need the studio's long-running agent service, which the kit does not ship;
   - **keep:** select, convene and synthesize; the rule to surface disagreement and never average it; debate mode with its round-two instruction (rebut, concede what lands, then hold or update); and the ending that hands the decision back to you.
3. **Claude:** saves it as `.claude/skills/council/SKILL.md` in this project, or `~/.claude/skills/council/SKILL.md` for every project. If you give it another name, the folder and the `name:` line match it.
4. **Claude:** (claude.ai only) writes one short file per seat, its lens and its output format, from that seat's card.
5. **you:** (claude.ai only) add the seat files to a Project's knowledge and ask each seat in its own chat, so one view does not colour the next. For a debate, paste each answer into the other seat's chat and ask it to rebut, concede, then hold or update. You close it: where they disagree, and what you decide.
6. **Claude:** records the decision, the size, the scope, the seat list and the undo in `adoption/decisions.md`. At light, the row says the council waits for three seats.

## Check

1. The file exists at the path you chose: `.claude/skills/council/SKILL.md` or `~/.claude/skills/council/SKILL.md`.
2. **you:** in a new session, say "convene the council on: should I <a small real decision>". Expected: Claude names the seats it picked and the ones it left out, starts the picked seats as subagents, and returns one line per seat, the conflicts, a recommendation, and the decision handed back to you.
3. **you:** ask a second question with "--debate". Expected: a second round in which each seat answers the others' opening takes, and a brief that says whose position moved.
4. claude.ai: each seat's chat answers in that seat's output format.

If step 2 answers in one voice without starting any seat, or names a seat you do not have, the item is not done: the plan row stays unticked, and the seat list is the first thing to look at. At light there is no council file to check: the seat's own card holds the check, and this card's row is done once `adoption/decisions.md` records that the council waits.

## Undo

- **Claude:** deletes the `council` folder from the level you chose, or the lines it added to your instruction file for FOLD.
- The seats stay; each has its own card and its own undo.
- **you:** in claude.ai, remove the seat files from the Project's knowledge.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **Every seat's description loads every session.** With all eleven of the kit's seats, that is about 650 tokens (the 2,604 bytes of their descriptions divided by 4, an estimate), plus about 154 tokens for the council's own description (estimate): about 805 in all at full. At standard, with the skeptic, the architect and the reviewer, it is about 324, and at light, one seat alone, about 57 (estimates). The council's instructions, about 1,260 tokens (estimate), load only when it runs. When subagent descriptions load is not documented ([docs/facts.md](../docs/facts.md)); the kit counts them as every session.
- **A debate costs about seats times rounds.** Four seats over two rounds are eight subagent runs. Keep `--debate` for forks that deserve it.
- **Parallel agents have a rate cost of their own.** The studio once ran nine research agents at once; by its own record of those runs, they hit the session limit, and the last two died mid-run ([module 02, Evidence](../modules/02-context-and-models/README.md#evidence)). A cap per round is cheap insurance.
- **The convener carries the debate.** In the kit's skill each seat answers on its own, from the context it is given; in a debate round the convener hands each seat the others' earlier answers. So a seat sees the other seats only through what the convener passes on. Claude Code itself lets a subagent that has the `SendMessage` tool send a message to another agent ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"); the skill does not use that.
- **A brief that reads like agreement has lost its point.** The convener does not vote and does not average; if the brief shows no conflict, ask for the disagreements again.
- **Company rules:** every seat gets the same context, and that context is session content, which Claude Code sends over the network ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). The kit's seats also list WebSearch and WebFetch. Check your company's data rules before a question names anything they keep inside.
