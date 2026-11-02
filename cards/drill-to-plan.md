---
id: drill-to-plan
module: 03-planning
checked: 2026-11-02
---

# Drill to a plan

## Why

- **The problem:** building starts before anyone has written down what "done" means. With a vague, big ask, often someone else's, a short conversation leaves decisions open, and they come back in the middle of the build.
- **The reason:** drill-to-plan interviews you one question at a time, each question carrying its recommended answer for you to accept or override. It keeps a coverage checklist (goal, users, scope and non-goals, architecture, data, error handling, testing, risks and more) and stops when it can predict your next three answers, or when you say stop. It restates the design, waits for an explicit yes, and writes a spec with a log of the decisions made and the questions still open. Its output feeds [writing-plans](writing-plans.md).
- **The cost of skipping it:** the kit holds no story of its own for this. Skipping it means the open decisions get settled during the build, by whoever is building, often by guess ([module 03, The problem](../modules/03-planning/README.md#the-problem)).
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). The decisions land in a spec file with a decision log, not in a chat that compaction can lose.

## Detect

Read-only: names, descriptions and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/drill-to-plan/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/drill-to-plan/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about interviews, requirements or specs. The kit's [brainstorming](brainstorming.md), or the plugin's `superpowers:brainstorming` (`claude plugin list`), counts as the lighter cousin.
- Where specs live today, counts only: `ls docs/superpowers/specs/*.md docs/specs/*.md 2>/dev/null | wc -l`, and any spec-folder rule in `CLAUDE.md` or `AGENTS.md`.
- Your commit rules, which replace the skill's own: `grep -n -i 'commit' CLAUDE.md AGENTS.md 2>/dev/null`.

The menu marks the item **have** when a `drill-to-plan` skill exists at either level, **partly** when only a lighter design skill such as brainstorming covers the job, and **not yet** otherwise.

## Ask

1. **"Take drill-to-plan?"**
   - Keep what you have. Recommended when Detect says **have**.
   - ADAPT the kit's copy: your folders, your commit rules and your stack's examples in place of the studio's. Recommended when Detect says **not yet** or **partly** and your work often starts as a vague ask, yours or someone else's.
   - FOLD its coverage checklist and its "predict the next three answers" stop into brainstorming, if you take that one. Recommended when your asks are rarely both vague and big.
   - SKIP: your work arrives as clear tickets.
   - Not sure: the recommended option above for what Detect found and your work.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where?"**
   - Every project, in `~/.claude/skills/`. Recommended when you plan work in more than one repository.
   - This project only, in the repository's `.claude/skills/`.
   - Not sure: every project, the recommended option, when you plan work in more than one repository; otherwise this project only. You can move it later.
   - Default when skipped: this project only.

## Needs

- Nothing beyond Claude Code.
- A git repository, if you want specs committed.
- [writing-plans](writing-plans.md), for the step after an approved spec. Optional: step 2 below says what replaces it.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit's copy, `catalog/skills/drill-to-plan/`: scans it with SkillSpector (`skillspector scan catalog/skills/drill-to-plan --no-llm`; on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows) and triages each finding with you. It is prose, a spec template and a question bank, with no scripts; the kit's own scan of 2026-11-02 rated it `SAFE`, and your scan of your copy is still the gate. Then it recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** on your yes, writes the copy into the scope you chose and replaces the studio-specific parts (module 03 marks them):
   - the project folders it explores first, which name the studio's own projects and its project registry: "the repository you are in", or your projects;
   - where it saves specs, which are the studio's project folders and a dated file in `docs/superpowers/specs/`: your folder;
   - its commit step, written for the studio's signing and authorship rules, a push that leaves the merge to the studio, and a worktree rule for its root folder: your commit rules, or "leave the spec uncommitted for me to review";
   - "Honour the studio rules", which points at the studio's own rules file and coding guidelines: your instruction file;
   - the names `brainstorming` and `writing-plans`, which the copy now gives bare, as the kit ships them (in `SKILL.md` and in the spec template's last line): kept when you take the kit's [brainstorming](brainstorming.md) and [writing-plans](writing-plans.md); otherwise the names you use (the plugin's, `superpowers:brainstorming` and `superpowers:writing-plans`, or your own planner). If you have no planner, the hand-off becomes "give me the approved spec";
   - in `templates/spec-skeleton.md` and `references/question-bank.md`, the example answers drawn from the studio's own stack and products: examples from your stack, or none;
   - the author line in the front matter, which names the studio, to yours.

   Claude shows the result before it saves it.
3. **Claude:** adds one line to your front door (`CLAUDE.md` or `AGENTS.md`) saying where specs live, and shows it first.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file is in place: `test -f <scope>/drill-to-plan/SKILL.md && echo present` prints `present`, where `<scope>` is the repository's `.claude/skills` or `~/.claude/skills`.
2. **you:** in a new session, say "drill me into a plan for <a vague goal>". Claude opens with its one-sentence reading of the goal and a confidence number from 0 to 100, then asks exactly one question that carries its recommended answer.
3. **you:** type `coverage`. Claude prints the checklist with each dimension marked covered, partial or open.

If any check fails, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes the `drill-to-plan` folder from the scope it went into, and the spec-folder line from your front door.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.
- The specs it wrote stay; they are yours.

## Watch out

- **drill-to-plan or brainstorming.** drill-to-plan is the heavier interview: it keeps drilling past the first reasonable design until every branch is resolved, for a vague and big ask. [brainstorming](brainstorming.md) is the lighter design conversation, for a day's work whose shape you roughly know. Both end in an approved spec for writing-plans. For a small, clear ask, use neither: ask, with one line on what done means and how you will check it ([module 03](../modules/03-planning/README.md)).
- **You control the length.** `skip` takes its default for one branch, `draft` writes the spec now with the rest marked open, and `stop` or "I'm done" ends the drill and still writes a draft, so the answers are not lost.
- **"Sounds good" is not a yes.** It keeps asking about the parts you hesitate on until you approve the restated design.
- **One question per turn** makes a long drill many turns. Plan time for it, or use `draft` early.
- **Cost:** its name and description are the longest of the planning skills, about 169 tokens in every session (an estimate, bytes divided by 4); the full skill, about 2,100 tokens (estimate), loads only when it is used. Past the budget for skill descriptions, the least-used ones are dropped first (docs/facts.md).
- **Someone else's ask** may carry internal detail. Save the spec where your company's rules allow, not in a personal repository.
- **claude.ai:** it works there as an uploaded custom skill, after `vet-and-adopt` (docs/facts.md, "claude.ai: custom skills and the built-in document skills").
