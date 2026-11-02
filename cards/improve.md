---
id: improve
module: 04-delegation
checked: 2026-11-02
---

# improve: an audit turned into plans

## Why

- **The problem:** one thread doing everything reads thirty files to find one function and keeps them all in its context, and it works through independent parts one after another. While it grinds through a long mechanical task, nobody is planning the next step.
- **The reason:** improve is a read-only advisor. It maps the repository, audits it with read-only subagents across nine categories (bugs, security, performance, tests, tech debt, dependencies, tooling, docs, direction), opens every cited line itself before it shows you anything, and ranks the findings by impact against effort. For the findings you pick, it writes plans in `plans/` that a model with no context from this session can carry out, each with its own verification commands. It changes no source code; its `execute` variant hands one plan to a builder subagent in a separate worktree and reviews the diff, and merging stays yours.
- **The cost of skipping it:** a 24-file sweep, done by hand in the studio's main thread, held it for about 30 minutes; a self-contained brief could have run alongside ([the sweep done by hand](../examples/sweep-done-by-hand.md)).
- **The principle:** [delegate the mechanical, keep the decisions](../PRINCIPLES.md#delegate-the-mechanical-keep-the-decisions). The understanding and the specifying stay with one careful session; the execution goes to other sessions.

## Detect

Read-only: names, descriptions, versions and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/improve/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/improve/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about audits, code review, tech debt or roadmaps.
- In each repository: whether `plans/` exists and already holds something else, counts only (`ls plans 2>/dev/null | wc -l`); improve then writes to `advisor-plans/` instead.
- A decision log it can read, names only: `ls -d docs/adr docs/adrs docs/decisions 2>/dev/null`.
- A rule about the model subagents use, in your instruction files: `grep -n -i 'model' CLAUDE.md AGENTS.md 2>/dev/null`.
- `gh --version`, only if you want its `--issues` option.

The menu marks the item **have** when an `improve` skill exists at either level, **partly** when another audit skill covers the job, and **not yet** otherwise.

## Ask

1. **"Take improve?"**
   - Keep what you have. Recommended when Detect says **have**.
   - ADAPT the kit's copy: your decision log in place of the studio's, and your author line. Recommended when Detect says **not yet**.
   - FOLD its plan template, "write each plan for the weakest plausible executor", into the audit skill you have. Recommended when Detect says **partly**.
   - SKIP: you do not audit codebases or hand work to other sessions.
   - Not sure: the recommended option above for what Detect found.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Which model carries out a plan under `execute`?"**
   - The kit copy's default: the session's own model, unless you name one for a run (`execute 003 haiku`). Recommended when Detect finds no rule about subagent models, or a rule that subagents keep the session's model.
   - A cheaper model by default, such as the `sonnet` alias, which fits the skill's own economics (an expensive model plans, a cheaper one carries out). Recommended when you run many plans and want each run to cost less.
   - Never use `execute`: you open a new session for each plan and hand it the file.
   - Not sure: the recommended option above for what Detect found and how many plans you run; the kit copy's default when Claude cannot tell. You can still name a model for each run.
   - Default when skipped: the kit copy's default.
3. **"Where?"**
   - This project only, in the repository's `.claude/skills/`. Recommended when one repository is the one you want audited.
   - Every project, in `~/.claude/skills/`. Recommended when you work across several repositories.
   - Not sure: the recommended option above for your work; this project only when Claude cannot tell.
   - Default when skipped: this project only.

## Needs

- Claude Code. With subagents the audit runs in parallel; without them it audits directly.
- A git repository: each plan records the commit it was written against, and `execute` needs a separate worktree.
- `gh`, signed in, only for `--issues`. How to install it is not documented in docs/facts.md as of 2026-11-02.
- The upstream `LICENSE`, kept with your copy. The `LICENSE` file in the kit's copy is MIT, copyright shadcn; the licence is not in docs/facts.md as of 2026-11-02, so Claude reads that file at the upstream before you take it.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit's copy, `catalog/skills/improve/`: scans it with SkillSpector (`skillspector scan catalog/skills/improve --no-llm`; on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows) and triages each finding with you. The kit's own scan of 2026-11-02, with the SkillSpector build that reports 2.2.3 (a fresh install is newer and may score it differently; [docs/facts.md](../docs/facts.md), "Installing SkillSpector"), rated it `DO_NOT_INSTALL` at 65/100 from four findings, each a false positive on a closer read: a defence against prompt injection read as an injection, a note that reading `~/.netrc` is a normal convention, a checklist line, and licence text (`tools/export/scan-triage.md` in the kit). It has no code files. Then Claude recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** on your yes, writes the copy into the scope you chose, with `LICENSE` and the `references/` folder, and changes:
   - in its first phase, the line that adds the studio's root decision file to the design documents it reads: your decision log's path, or nothing;
   - the author line in the front matter, which names the studio, to yours;
   - the executor line in `references/closing-the-loop.md`, which leaves the model out so the executor runs on the session's model unless `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), and cites a studio rule for it: the citation becomes your own reason, and when question 2 chose a cheaper default, the line names that model.

   Claude shows the result before it saves it.
3. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files are in place: `test -f <scope>/improve/SKILL.md && test -f <scope>/improve/LICENSE && echo present` prints `present`.
2. **you:** in a new session, in a repository, say "audit this repo and write plans". Claude starts with recon: your README, your instruction file, the configuration and the exact build and test commands. Then it shows a table of findings ranked by leverage and asks which to turn into plans, before it writes any. Afterwards `git status` shows no change outside `plans/` (or `advisor-plans/`).

If Claude edits a source file, or writes plans before you pick findings, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes the `improve` folder from the scope it went into.
- **Claude:** lists any worktrees an `execute` run left (`git worktree list`) and removes the ones you name; their branches are yours to merge or delete.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.
- The plans it wrote stay; they are yours.

## Watch out

- **Read-only by its own rule.** It never edits source, installs, builds into your tree or commits; it writes only under `plans/`. Ask it to fix something and it declines, and offers `execute` or a better plan instead.
- **`--issues` publishes.** With that flag only, it turns each plan into a GitHub issue through `gh`. On a public repository it warns you and asks before publishing any plan that describes a vulnerability or where a credential lives. For a company repository, ask your company first.
- **A cheaper executor is a choice.** The skill's text still rests on a cheaper model carrying out the plans, but the kit's copy names no model, so the executor runs on the session's model unless a run names one or `CLAUDE_CODE_SUBAGENT_MODEL` is set ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), by the studio's rule that the agent writing the code is not downgraded to save tokens. Name a cheaper model for a run (`execute 003 haiku`) when you want that saving ([module 02](../modules/02-context-and-models/README.md), [module 04](../modules/04-delegation/README.md)).
- **Fan-out costs.** A `deep` audit runs up to eight read-only subagents at once, and parallel agents have a rate cost of their own ([module 02, Evidence](../modules/02-context-and-models/README.md#evidence)). `quick` keeps it to one or none.
- **Secrets stay out.** A finding names the file, the line and the kind of credential, never its value.
- **A fresh worktree is bare.** It shares the history but not installed dependencies or build output, so the executor installs them first; that is expected.
- **Not writing-plans.** improve turns an audit into plans; [writing-plans](writing-plans.md) turns a spec you approved into a plan. The studio keeps both.
- **Cost:** its name and description load into every session, about 129 tokens (an estimate, bytes divided by 4); the full skill, about 3,900 tokens (estimate), loads only when it is used, with its references as it reads them.
