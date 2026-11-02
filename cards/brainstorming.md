---
id: brainstorming
module: 03-planning
checked: 2026-11-02
---

# Brainstorming before building

## Why

- **The problem:** building starts before anyone has written down what "done" means, so the work answers a question nobody asked, or half of the one they did.
- **The reason:** brainstorming makes Claude find out what you want, and why, before it builds. It reads the project first, asks one question at a time, lays out two or three ways to build the thing with a recommendation, and writes a design document: a short one for a small change, a full one for a project. Nothing is built until you approve that document; then it hands over to [writing-plans](writing-plans.md).
- **The cost of skipping it:** the kit holds no story of its own for this. Skipping it means Claude builds from its own reading of your request, and the gaps show up after the code exists ([module 03, The problem](../modules/03-planning/README.md#the-problem)).
- **The principle:** [simplicity first, surgical changes](../PRINCIPLES.md#simplicity-first-surgical-changes). An approved design is what every later line of the change can be traced back to.

## Detect

Read-only: names, descriptions, versions and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/brainstorming/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/brainstorming/SKILL.md" && echo user`.
- The upstream plugin, which carries the same skill as `superpowers:brainstorming`: `claude plugin list`, reading only a `superpowers@...` entry and its `Version`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about designs, specs, requirements or interviews. The kit's [drill-to-plan](drill-to-plan.md) counts; it is the heavier cousin.
- A rule that asks for a design before building, in your instruction files: `grep -n -i -E 'design|spec' CLAUDE.md AGENTS.md 2>/dev/null`.
- For the optional browser companion: `node --version`, and on Windows `bash --version | head -1` (Git Bash).
- Whether a repository already ignores the companion's folder: `grep -c '\.superpowers' .gitignore 2>/dev/null`.

The menu marks the item **have** when a `brainstorming` skill exists at either level or the superpowers plugin is installed, **partly** when only another design skill or an instruction-file rule covers the job, and **not yet** otherwise.

## Ask

1. **"Take brainstorming?"**
   - Keep what you have. Recommended when Detect says **have**. If what you have is the plugin, read [superpowers](superpowers.md) for its logo request and the switch that turns it off.
   - ADAPT the kit's copy: your folder for design documents, your author line, and the hand-over to the planner you use. Recommended when Detect says **not yet**.
   - FOLD the idea into what you have: one line in your `CLAUDE.md`, "before building anything non-trivial, agree a short design with me and wait for my yes". Recommended when Detect says **partly** and you want to keep that.
   - SKIP: your work arrives as clear tickets that need no design conversation.
   - Not sure: the recommended option above for what Detect found.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where?"**
   - Every project, in `~/.claude/skills/`. Recommended when you plan work in more than one repository.
   - This project only, in the repository's `.claude/skills/`.
   - Not sure: every project, the recommended option, when you plan work in more than one repository; otherwise this project only, the narrowest choice. You can move it later.
   - Default when skipped: this project only.

## Needs

- Nothing beyond Claude Code for the conversation and the design document.
- The optional browser companion, which shows mockups in a browser tab, runs a small server on your machine and needs:
  - Node.js. The kit installs version 22; the companion's minimum version is not documented in docs/facts.md as of 2026-11-02. Windows: `! winget install --id OpenJS.NodeJS.22 -e`; macOS and Linux: `! curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash`, then `! \. "$HOME/.nvm/nvm.sh" && nvm install 22`.
  - bash, for its start and stop scripts. Windows: Git for Windows, `! winget install --id Git.Git -e --source winget`; macOS and Linux: check with `bash --version`.
- [writing-plans](writing-plans.md), for the step after an approved design. Optional: step 2 below says what replaces it.
- A git repository, if you want design documents committed.

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit's copy, `catalog/skills/brainstorming/`: scans it with SkillSpector (`skillspector scan catalog/skills/brainstorming --no-llm`; on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows), triages each finding with you, and reads the companion's code itself. Expect the scan to say no: the kit's own run on 2026-11-02, with the SkillSpector build that reports 2.2.3, rated it `DO_NOT_INSTALL` at 100/100 from 12 findings ([scan-triage.md](../tools/export/scan-triage.md)); a fresh install is newer and may score it differently ([docs/facts.md](../docs/facts.md), "Installing SkillSpector"). The kit's triage found one real behaviour among them, rated low and reported twice: the companion's start script runs its server detached from the session. Claude confirms that the server listens only on loopback (an address that only your own machine can reach) behind a key for each session, and that `scripts/server.cjs` sends nothing out: the kit's copy has the upstream logo request removed. The studio rescanned its adapted copies of superpowers 7.0.1 the same way and found no new real finding; `VENDORED.md` lists every change it made. Then it recommends SKIP, FOLD, ADAPT or ADOPT against what Detect found.
2. **Claude:** on your yes, writes the copy into the scope you chose, keeps the upstream `LICENSE` (MIT), and changes:
   - the author line in the front matter, which names the studio, to yours;
   - "Where it goes": the copy saves designs as `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`; Claude puts your folder there, or keeps that one;
   - the brand text in `scripts/server.cjs`, which says it is the studio's copy, to your own words;
   - the hand-over: after approval the copy invokes `writing-plans`. If you skipped writing-plans, Claude points it at the planner you use, or tells it to stop and hand the approved design back to you;
   - the studio's `VENDORED.md`, replaced by a short note of your own: the upstream, version 7.0.1, and what you changed.

   Claude shows the result before it saves it.
3. **Claude:** adds `.superpowers/` to the `.gitignore` of each repository where you will use the companion, because its session folder holds your mockups and the session key. It shows the line first.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The file is in place: `test -f <scope>/brainstorming/SKILL.md && echo present` prints `present`, where `<scope>` is the repository's `.claude/skills` or `~/.claude/skills`.
2. The copy sends nothing out: `grep -c "<img" <scope>/brainstorming/scripts/server.cjs` prints `0`.
3. **you:** in a new session inside a project, say "let's brainstorm <a small change you want>". Claude reads the relevant files first, then replies with one question about what you want, and ends its message on that question. It writes no file and changes no code.

If a check fails, or Claude starts building in check 3, the item is not done: the plan row stays unticked. A skill of the same name in your user folder wins over a project copy (docs/facts.md), so when the answer looks wrong, check which copy answered.

## Undo

- **Claude:** deletes the `brainstorming` folder from the scope it went into.
- **Claude:** on your yes, removes the `.superpowers/` line from `.gitignore` and deletes the `.superpowers/brainstorm/` folders, which hold the mockups of past sessions.
- **Claude:** adds a row to `adoption/decisions.md` saying the item was removed.
- The design documents it wrote stay; they are yours.

## Watch out

- **brainstorming or drill-to-plan.** Both end in an approved design for writing-plans. brainstorming is the lighter conversation, for a day's work whose shape you roughly know. [drill-to-plan](drill-to-plan.md) is the heavier interview, for a vague and big ask, often someone else's: it keeps asking until every decision is resolved. For a small, clear ask, use neither. You can take both and pick per task.
- **It offers a way out.** When you did not ask for brainstorming by name, its first message ends with an offer to start without the questions; take it and Claude does the task directly.
- **The companion on Windows** runs in the foreground, because Git Bash ends background processes; Claude starts it as a background task instead. There it stops only after four hours idle, because the check that stops it when its session ends is off on Windows (below).
- **The companion's server outlives the shell that started it.** Its start script detaches it (`nohup` and `disown`, `scripts/start-server.sh`), the one real item in the kit's scan triage ([scan-triage.md](../tools/export/scan-triage.md)). By default it listens only on your own machine, behind a key for each session, and stops when the session that started it ends or after four hours idle.
- **Its `--host` option**, meant for remote and container setups, can make the companion listen on every network interface, still behind the key. Keep the default unless you need it.
- **On Windows the owner check is off.** From a Windows shell the server runs without the check that stops it when its session ends, so only the four-hour idle stop ends a forgotten one; close it yourself when you finish brainstorming.
- **The plugin's version of this skill** loads the vendor's logo from the vendor's website when the companion opens, which sends your IP address and the superpowers version. The kit's copy has that request removed ([superpowers](superpowers.md)).
- **Cost:** its name and description load into every session, about 57 tokens (an estimate, bytes divided by 4); the full skill, about 3,500 tokens (estimate), loads only when it is used.
- **Company repositories:** a design document committed to `docs/` stays in the repository's history. Ask whether your company wants design notes there before the first commit.
- **claude.ai:** the conversation and the design document work there as an uploaded custom skill (docs/facts.md, "claude.ai: custom skills and the built-in document skills"). The browser companion runs a server on your machine and the builder check starts a subagent, so both need Claude Code; whether claude.ai's chat app has subagents is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from").
