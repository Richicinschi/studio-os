# Detect, for every item

Generated from the "Detect" section of each card in `cards/` by `tools/export/detect.mjs`: edit the cards, never this file. The drill reads it in phase 1 instead of opening each card. Each section is read-only: presence, counts and dates, never a file's content.

## The plugin check, shared by the cards below

A card below that says "the plugin check" runs this, with `<path>` set to the path it names:

- A skill or agent of the same name from a plugin enabled here: run from the project folder, `claude plugin list --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let l;try{l=JSON.parse(s)}catch{}if(!Array.isArray(l))return console.log("plugin check could not run");for(const p of l){const r=p.readFromFolder||p.installPath,f=r&&require("path").join(r,process.argv[1]);if(p.enabled&&f&&require("fs").existsSync(f))console.log(p.id,f)}})' <path>` prints the plugin's id and the path of each copy, and nothing else. `claude plugin list` reports which plugins are enabled for the current folder and the folder each one loads from, so a disabled plugin, a plugin installed for another repository and an old version left after an update do not count. When it prints `plugin check could not run` or an error such as `claude: command not found`, Detect says the plugin check could not run, and the item gets no plugin mark ([docs/facts.md](../docs/facts.md), "Claude Code: installed plugins and their skills").

The menu marks that follow from it, wherever a card below says "the plugin marks": When nothing marks it **have** and that plugin line prints a copy, the menu says **a plugin provides one** instead of **not yet**, or **partly (a plugin provides one)** instead of **partly**, so what is missing stays in view, and it does not offer the kit's copy as a second.

## baseline-before-claim: A baseline before any claim

Card: [cards/baseline-before-claim.md](../cards/baseline-before-claim.md)

Read-only. Counts only; no note's content and no data file is printed.

- Whether your front door carries the rule, a count per file: `grep -ciE 'baseline|control' CLAUDE.md AGENTS.md 2>/dev/null`.
- Claude asks one question: "When you say a new version is better, what do you compare it with, and where was that number printed?" Your experiment notes folder, if you have one, is `<notes>` below.
- How many notes record a baseline line: `grep -liE '^- *baseline' "<notes>"/*.md 2>/dev/null | wc -l`.
- Whether a file of recorded baselines exists, names counted only: `find "<repo>" -maxdepth 3 -iname '*baseline*' -not -path '*/.git/*' 2>/dev/null | wc -l`.

The menu marks the item **have** when the front door carries the rule and your notes or a baselines file record baselines; **partly** when only one of the two is true; and **not yet** when neither is.

## bob-builder: The builder

Card: [cards/bob-builder.md](../cards/bob-builder.md)

Read-only: names, descriptions, versions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The agent itself, at project and user level: `ls .claude/agents/bob-builder.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/bob-builder.md" 2>/dev/null`, and any other name recorded for it in `adoption/decisions.md`.
- Another agent or skill doing the same job: an implementer, an executor, a "build this task" agent. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- The skills that start it by name in the kit's copies, by folder name only: `ls -d .claude/skills/subagent-driven-development .claude/skills/writing-plans "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/subagent-driven-development "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/writing-plans 2>/dev/null`, and the same two in `adoption/plan.md`.
- For each repository in `adoption/inventory.md`, the branch it would start from:
  - `git --version`;
  - the remote names, without their addresses: `git -C <repo> remote`;
  - the remote's default branch, as the clone recorded it: `git -C <repo> symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null`. Claude shows what it prints; when it prints nothing, Claude asks you for the base branch. Git does not require a remote to have a default branch, so the command can print nothing ([docs/facts.md](../docs/facts.md), "Git: hooks and worktrees").
- An agent of the same name from a plugin enabled here: the plugin check, with `<path>` set to `agents/bob-builder.md`.

The menu marks the item **have** when an agent file named `bob-builder`, or the name recorded for it, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise. The plugin marks apply.

## brainstorming: Brainstorming before building

Card: [cards/brainstorming.md](../cards/brainstorming.md)

Read-only: names, descriptions, versions and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/brainstorming/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/brainstorming/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about designs, specs, requirements or interviews. The kit's [drill-to-plan](../cards/drill-to-plan.md) counts; it is the heavier cousin.
- A rule that asks for a design before building, in your instruction files: `grep -n -i -E 'design|spec' CLAUDE.md AGENTS.md 2>/dev/null`.
- For the optional browser companion: `node --version`, and on Windows `bash --version | head -1` (Git Bash).
- Whether a repository already ignores the companion's folder: `grep -c '\.studio-work' .gitignore 2>/dev/null`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/brainstorming/SKILL.md`.

The menu marks the item **have** when a `brainstorming` skill exists at either level, **partly** when only another design skill or an instruction-file rule covers the job, and **not yet** otherwise. The plugin marks apply.

## claim-auditor: Claim auditor

Card: [cards/claim-auditor.md](../cards/claim-auditor.md)

Read-only: folder names and the front matter of skills and agents (their name and description), never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/claim-auditor "$U/skills/claim-auditor" 2>/dev/null`.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names and nothing else:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'fact.?check|claims|every number|verify the figures|sourced' && echo "$f"; done`
- A rule already folded into an instruction file: `grep -inE 're-?run|every (number|figure)|source of' CLAUDE.md AGENTS.md 2>/dev/null`. Claude reads the matching lines to judge whether they ask for a source per figure.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/claim-auditor/SKILL.md`.

The menu marks the item **have** when a skill named `claim-auditor` exists, or another skill's description covers tracing claims to their source; **partly** when only an instruction-file rule asks for sources; **not yet** otherwise. The plugin marks apply.

## claude-ai-project: The claude.ai Project instructions

Card: [cards/claude-ai-project.md](../cards/claude-ai-project.md)

Claude Code cannot see your claude.ai account, so most of this is three questions you answer. The read-only part, in your setup folder:

- Whether your adoption records say you use claude.ai: `grep -ciE 'claude\.ai' adoption/spec.md adoption/inventory.md 2>/dev/null`.
- If you keep a copy of a Project's instructions in your setup, how many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<[a-z][^>]*>' <that file>`.
- Then, one yes or no each:
  1. Is there a Project for this stream of work?
  2. Do its instructions tell a new chat to read the newest handoff note first?
  3. Does its knowledge hold at least one note named `handoff-YYYY-MM-DD.md`?

The menu marks the item **have** when all three answers are yes; **partly** when a Project exists but one of the other two is no; and **not yet** when there is no Project for this work.

## coding-guidelines: The coding guidelines

Card: [cards/coding-guidelines.md](../cards/coding-guidelines.md)

Read-only. Counts, presence and names; no network, and no skill body is opened.

- The four rules in your instruction files, a count per file of the lines that name one, in your setup and in each repository in `adoption/inventory.md`:
  `grep -ciE 'ask before you build|smallest change|touch only what|define done' CLAUDE.md AGENTS.md CLAUDE.local.md 2>/dev/null`. `4` means all four are there.
- A file of your own with coding rules anywhere in your setup, counted: `grep -rliE 'surgical|smallest change|goal-driven' --include='*.md' "<your setup>" 2>/dev/null | wc -l`.
- Whether your front door points at such a file: Claude reads the front door's lines that name it.
- Another skill doing the same job, names only: skill folders whose name contains `guidelines` or `coding-rules`, in `.claude/skills/` and in `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/"`.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when all four rules are in a file that loads every session, or in a file your front door tells Claude to read before it writes code; **partly** when one to three of them are found, or a file holds all four but nothing points to it; and **not yet** otherwise.

## commit-and-pr-writing: Commit messages and PR bodies that say why

Card: [cards/commit-and-pr-writing.md](../cards/commit-and-pr-writing.md)

Read-only. Counts only; no commit message is printed.

- Whether your instruction files carry a rule, a count per file: `grep -ciE 'commit message|PR bod|pull request bod' CLAUDE.md AGENTS.md 2>/dev/null`.
- For each repository in `adoption/inventory.md`, among its last 50 commits:
  - how many first lines start with a type prefix such as `fix:` or `feat(scope):`: `git -C <repo> log -50 --format=%s | grep -cE '^[a-z]+(\([^)]*\))?!?: '`;
  - how many have a body under the first line: `git -C <repo> log -50 --format='%x1e%b' | awk 'BEGIN{RS="\036"} NF{n++} END{print n+0}'`.
- Whether each repository has a remote host, from the inventory: PRs need one.
- Your company's or team's convention, if there is one: **you** say so; Claude cannot see it.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when an instruction file covers both commit messages and PR bodies; **partly** when it covers one of the two, or most recent commits carry a body but no rule asks for one; and **not yet** otherwise.

## context-habits: Context habits

Card: [cards/context-habits.md](../cards/context-habits.md)

Read-only, at the root of your setup folder. Sizes, counts and one question; no file's content is printed.

- What every fresh session starts with, the front door and the files it imports (a line starting with `@` loads that file at launch): `wc -c CLAUDE.md AGENTS.md 2>/dev/null`, then `grep -hE '^@' CLAUDE.md AGENTS.md 2>/dev/null` for the imported files, whose sizes Claude adds with `wc -c`. Claude reports the sum as tokens (an estimate: bytes divided by 4).
- How the identity files load: imported into every session (`grep -cE '^@identity/' CLAUDE.md AGENTS.md 2>/dev/null`), or named in the front door for Claude to read when needed (`grep -c 'identity/' AGENTS.md 2>/dev/null`).
- Whether there is a note to start from: `ls handoffs/ 2>/dev/null | grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}'`.
- The habit itself is not in any file, so Claude asks one question: "When you come back the next day, do you start a new session, or carry on in yesterday's?"

The menu marks the item **have** when you start fresh and there is a handoff note to start from; **partly** when only one of the two is true; and **not yet** when neither is.

## decision-log: A decision log

Card: [cards/decision-log.md](../cards/decision-log.md)

Read-only, in your setup folder and in each repository in `adoption/inventory.md`. Names and counts; no entry's text is printed.

- A decision log already, names only: `find <folder> -maxdepth 3 \( -iname '*decision*' -o -iname 'adr*' \) -not -path '*/node_modules/*' -not -path '<folder>/adoption/*' 2>/dev/null`. ("ADR", architecture decision record, is a common name for the same idea.) The kit's own `adoption/decisions.md`, which records what you adopted, is left out: it is not a log of how you work.
- In a log that exists, dated entries counted, and how many state a reason: `grep -cE '^## [0-9]{4}-[0-9]{2}-[0-9]{2}' <log>` and `grep -c '^\*\*Why:\*\*' <log>`.
- Whether the front door names it: `grep -c 'DECISIONS.md' AGENTS.md CLAUDE.md 2>/dev/null`.
- Whether the front door imports it, which loads all of it into every session: `grep -cE '^@.*DECISIONS' CLAUDE.md AGENTS.md 2>/dev/null`.

The menu marks the item **have** when a log with dated entries that state their reasons exists and the front door names it; **partly** when a log exists without dates or reasons, or nothing points to it; and **not yet** otherwise.

## diagnosing-bugs: Diagnosing bugs

Card: [cards/diagnosing-bugs.md](../cards/diagnosing-bugs.md)

Read-only: folder names, the front matter of skills and agents (their name, description and version) and command paths, never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/diagnosing-bugs "$U/skills/diagnosing-bugs" 2>/dev/null`. If one exists, its version: `awk '/^---$/{n++; next} n==1' <its SKILL.md> | grep -E 'version:'`. The kit's copy is `1.1.0`; `1.0.0` is an earlier copy.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'debug|diagnos|root cause|regression' && echo "$f"; done`
- Whether Claude's shell can run the skill's two bash scripts: `command -v bash` prints a path, or nothing.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/diagnosing-bugs/SKILL.md`.

The menu marks the item **have** when a `diagnosing-bugs` skill at `1.1.0` is in place, or another debugging skill; **partly** when a `1.0.0` copy is there; **not yet** otherwise. The plugin marks apply.

## dispatching-parallel-agents: Dispatching parallel agents

Card: [cards/dispatching-parallel-agents.md](../cards/dispatching-parallel-agents.md)

Read-only: names, descriptions and counts. No skill or agent body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/dispatching-parallel-agents/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/dispatching-parallel-agents/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about subagents, delegation or parallel work.
- Agents you have: `ls .claude/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md 2>/dev/null | wc -l`.
- A delegation rule in your instruction files: `grep -n -i -E 'subagent|parallel|delegat' CLAUDE.md AGENTS.md 2>/dev/null`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/dispatching-parallel-agents/SKILL.md`.

The menu marks the item **have** when a `dispatching-parallel-agents` skill exists at either level, **partly** when only an instruction-file rule or another skill covers it, and **not yet** otherwise. The plugin marks apply.

## drawio-diagrams: draw.io diagrams

Card: [cards/drawio-diagrams.md](../cards/drawio-diagrams.md)

Read-only: folder names, the front matter of skills and agents (their name and description), and command paths, never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/drawio-diagrams "$U/skills/drawio-diagrams" 2>/dev/null`.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'diagram|draw\.?io|flowchart|mermaid|excalidraw' && echo "$f"; done`
- What the skill can use on this machine: `command -v uv python3 py dot drawio` prints a path for each one found. The kit copy runs its scripts with `uv run python`, which picks a Python for you; without `uv` it uses your own Python 3, as `python3`, or as `py -3` on Windows (`py` is the Windows Python launcher); `dot` is Graphviz; `drawio` is the draw.io desktop app's command line.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/drawio-diagrams/SKILL.md`.

The menu marks the item **have** when a skill named `drawio-diagrams` exists, or another skill writes `.drawio` files; **partly** when another diagram skill exists for a different format (Mermaid or Excalidraw, for example); **not yet** otherwise. The plugin marks apply.

## drill-to-plan: Drill to a plan

Card: [cards/drill-to-plan.md](../cards/drill-to-plan.md)

Read-only: names, descriptions and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/drill-to-plan/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/drill-to-plan/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about interviews, requirements or specs. The kit's [brainstorming](../cards/brainstorming.md) counts as the lighter cousin.
- Where specs live today, counts only: `ls docs/specs/*.md specs/*.md 2>/dev/null | wc -l`, and any spec-folder rule in `CLAUDE.md` or `AGENTS.md`.
- Your commit rules, which replace the skill's own: `grep -n -i 'commit' CLAUDE.md AGENTS.md 2>/dev/null`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/drill-to-plan/SKILL.md`.

The menu marks the item **have** when a `drill-to-plan` skill exists at either level, **partly** when only a lighter design skill such as brainstorming covers the job, and **not yet** otherwise. The plugin marks apply.

## executing-plans: Executing a plan inline, with a ledger

Card: [cards/executing-plans.md](../cards/executing-plans.md)

Read-only: names, descriptions, versions and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/executing-plans/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/executing-plans/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about executing or implementing a plan.
- What it relies on, at both levels, folder names only (`test -d <level>/<name>`): `subagent-driven-development` (whose `scripts/` it calls), `requesting-code-review` (whose `code-reviewer.md` briefs the final review), `tdd`, `diagnosing-bugs`, `verification-before-completion`, `using-git-worktrees`, `finishing-a-development-branch`.
- A reviewer agent: `ls .claude/agents/ "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/" 2>/dev/null`, file names only, looking for `linus-reviewer.md` or your own reviewer.
- bash, for its scripts: `bash --version | head -1`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/executing-plans/SKILL.md`.

The menu marks the item **have** when an `executing-plans` skill exists at either level, **partly** when the skill is there but `subagent-driven-development/scripts/` is not beside it, or when another skill does the job, and **not yet** otherwise. The plugin marks apply.

## finishing-a-development-branch: finishing-a-development-branch

Card: [cards/finishing-a-development-branch.md](../cards/finishing-a-development-branch.md)

Read-only. Names, descriptions, counts and versions only; no skill body is opened.

- A skill of the same name: `.claude/skills/finishing-a-development-branch/SKILL.md` in each repository and in your setup, and `~/.claude/skills/finishing-a-development-branch/SKILL.md` (or the same under `$CLAUDE_CONFIG_DIR` when that is set). Where one exists, read its `name` and `description` only.
- Another skill doing the same job: the front matter of each skill (the lines between the first two `---`), searched for "merge", "pull request" or "finish":
  `for f in .claude/skills/*/SKILL.md "$HOME"/.claude/skills/*/SKILL.md; do sed -n '2,/^---/p' "$f" | grep -qiE 'merge|pull request|finish' && echo "$f"; done`.
- Whether your instruction files say who merges, a count per file: `grep -ciw merge CLAUDE.md AGENTS.md identity/RELATIONSHIP.md 2>/dev/null`.
- Whether the GitHub command line is there: `gh --version` (it may not be installed). Each repository's remote host is already in `adoption/inventory.md`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/finishing-a-development-branch/SKILL.md`.

The menu marks the item **have** when a skill of this name is present, in a project or in your user folder; **partly** when another skill or an instruction-file rule covers the end of a branch; and **not yet** otherwise. The plugin marks apply.

## front-door: The front door

Card: [cards/front-door.md](../cards/front-door.md)

Read-only, at the root of your setup folder. These commands print presence, sizes and yes/no answers; they never print a file's content, and they use no network.

- Which instruction files exist, each with its size in characters and in tokens (an estimate: bytes divided by 4):
  `for f in CLAUDE.md AGENTS.md CLAUDE.local.md .claude/CLAUDE.md; do if [ -f "$f" ]; then echo "$f: $(wc -m < "$f") characters, about $(( ($(wc -c < "$f") + 3) / 4 )) tokens (estimate)"; else echo "$f: not present"; fi; done`
- Whether `CLAUDE.md` imports the front door, that is, holds the line `@AGENTS.md`, which loads `AGENTS.md` with it: `grep -qE '^@AGENTS\.md[[:space:]]*$' CLAUDE.md && echo "imports AGENTS.md" || echo "no @AGENTS.md line"`.
- How many other import lines the two files hold (those files load at launch too): `grep -cE '^@' CLAUDE.md AGENTS.md 2>/dev/null`.
- Instruction files in the folders above, which load as well, and any of which stops Claude Code from reading `AGENTS.md` on its own ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"): `d="$PWD"; while [ "$d" != "$(dirname "$d")" ]; do d="$(dirname "$d")"; for n in CLAUDE.md CLAUDE.local.md .claude/CLAUDE.md; do [ -f "$d/$n" ] && echo "found $n in a folder above"; done; done`.
- Whether a project setting loads both files (the value `claude-md-and-agents-md`): `grep -l 'claude-md-and-agents-md' .claude/settings*.json 2>/dev/null`.
- The Claude Code version: `claude --version`.

The menu marks the item **have** when `AGENTS.md` exists and `CLAUDE.md` holds the line `@AGENTS.md`; **partly** when an instruction file exists but the two are not joined (a `CLAUDE.md` with its own content and no `AGENTS.md`, an `AGENTS.md` beside a `CLAUDE.md` that does not import it, or an `AGENTS.md` alone); and **not yet** when neither file exists.

## git-cleanup: Cleaning up stale branches

Card: [cards/git-cleanup.md](../cards/git-cleanup.md)

Read-only. Names of skills, counts of branches, never branch names; nothing is fetched.

- The skill: a skill named `git-cleanup`, or another whose description is about cleaning up branches or worktrees, at project level (`.claude/skills/`) or user level (`~/.claude/skills/`, or under `$CLAUDE_CONFIG_DIR` when that is set). Names and descriptions only.
- For each repository in `adoption/inventory.md`, counts only:
  - local branches: `git -C <repo> branch --format='%(refname:short)' | wc -l`;
  - branches already merged into the default branch: `git -C <repo> branch --merged <default branch> | wc -l` (the default branch itself counts as one);
  - worktrees: `git -C <repo> worktree list | wc -l` (the main checkout counts as one).
- Whether Claude has a Bash tool, since the skill's commands are bash, and whether a git guard blocks `git branch -D` ([git-guardrails](../cards/git-guardrails.md), Detect).
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/git-cleanup/SKILL.md`.

The menu marks the item **have** when `git-cleanup`, or a skill doing the same job that asks before each deletion, exists, **partly** when a cleanup skill or routine exists that deletes without asking first, and **not yet** otherwise. The plugin marks apply.

## git-guardrails: A guard on Claude's git commands

Card: [cards/git-guardrails.md](../cards/git-guardrails.md)

Read-only. Presence, settings, names and versions; no network.

- Versions: `node --version` (22 or later runs the guard) and `claude --version` (v2.1.295 or later for `onFailure`).
- Claude's shell tools in this session: Bash, PowerShell or both; Claude says which it has. On Windows, Claude Code uses Git for Windows' Bash when it is installed, and PowerShell without it ([docs/facts.md](../docs/facts.md)).
- A git guard already: in `.claude/settings.json` and `.claude/settings.local.json` (project) and `~/.claude/settings.json` (user, or under `$CLAUDE_CONFIG_DIR` when that is set), the `hooks.PreToolUse` entries: how many, which tools each one's matcher names, whether its `command` or `args` name `block-dangerous-git` or another git guard, and whether it sets `onFailure`. Only the hooks part is read.
- The scripts, present or not: `block-dangerous-git.mjs`, with `guard.mjs`, `rules.mjs` and `lib/` beside it, in `.claude/hooks/git-guardrails/` or `~/.claude/hooks/git-guardrails/`; and version 1.4.0's bash script, `block-dangerous-git.sh` in `.claude/hooks/` or `~/.claude/hooks/`.
- The skill: a skill named `git-guardrails`, or another doing the same job, at project or user level. Names and descriptions only.
- Whether your instruction files put pushing on your ask-first list (for question 2).
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/git-guardrails/SKILL.md`.

The menu marks the item **have** when a git guard runs for every shell tool Claude has, **partly** when a guard is set but one shell tool is not matched, or its entry names a script that is missing, and **not yet** otherwise. The plugin marks apply.

## git-hooks: The git hook templates

Card: [cards/git-hooks.md](../cards/git-hooks.md)

Read-only. Settings as set or not set, presence, counts and versions; no network.

- For each repository in `adoption/inventory.md`, whether it already has hooks:
  - a `.husky/` folder and a `.pre-commit-config.yaml` file, each present or not;
  - files in `<repo>/.git/hooks/` other than git's `.sample` files, counted;
  - `git -C "<repo>" config --get core.hooksPath >/dev/null && echo set || echo "not set"`.
- Your user setting, which applies to every repository: `git config --global --get core.hooksPath >/dev/null && echo set || echo "not set"`.
- Whether the template is already in your setup: `<your setup>/git-hooks/check-staged.mjs`, present or not.
- Versions: `git --version`, `node --version` (the hooks need Node), and `gitleaks version` (optional; it may not be installed).

The menu marks the item **have** when the repositories you chose run the template's checks, through `core.hooksPath` or a call from their own hook, **partly** when the template is in your setup but on in none or only some of them, and **not yet** otherwise.

## git-identity-per-folder: One git identity per folder

Card: [cards/git-identity-per-folder.md](../cards/git-identity-per-folder.md)

Read-only. These commands never print an email address (one prints the part after the `@`, and no more); they use no network.

- Your global address, as one word only:
  - `git config --global --get user.email >/dev/null && echo set || echo unset`;
  - when set, `git config --global --get user.email | sed 's/.*@//'` prints the part after the `@` only. Claude writes it down as `company` when it is your company's domain (from your spec, or it asks you), or `personal` for any other, and keeps the domain itself out of every file.
- Whether conditional includes exist in your user config, yes or no: `git config --global --name-only --get-regexp '^[Ii]nclude[Ii]f\.' >/dev/null && echo yes || echo no`. It prints nothing else, since the setting names carry folder paths.
- For each repository in `adoption/inventory.md`, whether the address it commits with matches what its folder is meant for, yes or no: `git -C <repo> config --get user.email | grep -qi '@<domain>$' && echo yes || echo no`, where `<domain>` is your company's domain for a company folder and your personal one elsewhere. When nobody has said yet which folders hold company work, the repositories are marked "not checked".

The menu marks the item **have** when conditional includes exist and every repository answers yes; **partly** when includes exist but a repository answers no or is not checked, or when there are no includes but every repository answers yes; and **not yet** when there are no includes and a repository answers no.

## grant-ledger: The grant ledger for risky acts

Card: [cards/grant-ledger.md](../cards/grant-ledger.md)

Read-only. Counts and yes/no answers only; the words inside a row are never printed.

- Whether a ledger exists in your setup: `find "<your setup>" -maxdepth 4 -name grants.md | wc -l`.
- If one exists, whether it has the header row, and how many rows it holds, counts only:
  - `grep -c '^| Date | Act | Target | Your words | Reference |' <the file>`;
  - `grep -c '^| [0-9]' <the file>`.
- Whether your contract names the risky acts, a count per file: `grep -ciwE 'force-push|no-verify|merge|tag|rewrite' CLAUDE.md AGENTS.md identity/RELATIONSHIP.md 2>/dev/null` in your setup (a file that does not exist is skipped).
- Whether an instruction file tells Claude to write a row before the act: `grep -c 'grants.md' CLAUDE.md AGENTS.md identity/RELATIONSHIP.md 2>/dev/null`.

The menu marks the item **have** when a ledger with the header row exists and an instruction file tells Claude to write a row before the act, or, when `adoption/decisions.md` records the light size for this item, when your contract names the risky acts; **partly** when only one of the two exists, or when your contract names the risky acts but nothing is recorded; and **not yet** otherwise.

## handoff: The handoff note, and the skill that writes it

Card: [cards/handoff.md](../cards/handoff.md)

Read-only, at your setup folder's root: presence, counts and dates, never a note's content or a skill's body.

- The notes: the template, `ls handoffs/TEMPLATE.md 2>/dev/null`; dated notes, `ls handoffs/ 2>/dev/null | grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}'`; the newest one's date, from its name, `ls handoffs/ 2>/dev/null | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort | tail -1 | cut -c1-10`; the front door naming them, `grep -c 'handoffs/' AGENTS.md CLAUDE.md 2>/dev/null`.
- A skill of the same name, here or for every project: `ls -d .claude/skills/handoff "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/handoff" 2>/dev/null`.
- Another skill or agent doing the job, from its front matter only; Claude reads each match's description, as passing mentions match too:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md .claude/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'handoff|wrap(ping)? up|end of (the )?(day|session)' && echo "$f"; done`
- The [memory index](../cards/memory-index.md) the sweep writes into: `ls memory/MEMORY.md 2>/dev/null`.
- A `Stop` hook (run when a session stops): `grep -c '"Stop"' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Work left behind, per repository in `adoption/inventory.md`: uncommitted changes, `git -C <repo> status --porcelain | wc -l`, and commits on no remote, `git -C <repo> rev-list --count HEAD --not --remotes`.
- claude.ai, which Claude Code cannot see: Claude asks "Does a claude.ai Project's knowledge hold files named `handoff-YYYY-MM-DD.md`?"
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/handoff/SKILL.md`.

The menu marks the item **have** when notes are in use (the template, a dated note and a front door naming `handoffs/`, or on claude.ai a note in a Project's knowledge) and, in Claude Code, a skill does this job; **partly** when only some of that holds; **not yet** when neither exists. The plugin marks apply.

## identity-relationship: RELATIONSHIP.md: what needs your OK

Card: [cards/identity-relationship.md](../cards/identity-relationship.md)

Read-only, at the root of your setup folder. Presence, sizes and counts; no file's content is printed or quoted.

- Whether the file exists: `ls identity/RELATIONSHIP.md 2>/dev/null`.
- How many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<(\.\.\.|[a-z][^>]*)>' identity/RELATIONSHIP.md 2>/dev/null`.
- Its size: `wc -c < identity/RELATIONSHIP.md`, reported as tokens (an estimate: bytes divided by 4).
- How it loads, counts only: imported, `grep -cE '^@identity/RELATIONSHIP\.md' CLAUDE.md AGENTS.md 2>/dev/null`; named in the front door, `grep -c 'identity/RELATIONSHIP.md' AGENTS.md CLAUDE.md 2>/dev/null`; printed by a start-up hook, `grep -c 'identity/RELATIONSHIP.md' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Whether the front door protects the identity files with a diff rule: `grep -ciE 'identity/.*diff|diff.*identity/' AGENTS.md CLAUDE.md 2>/dev/null`.
- Whether a contract already lives somewhere else. Claude reads your instruction files (`CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md`) and your user-level one, `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md`, if it exists, which discovery may do. It reports only "has a section about what needs your OK: yes or no", with the file's name, and never quotes the section.
- claude.ai: Claude Code cannot see your account, so Claude asks one yes or no question: "Do the instructions of one of your claude.ai Projects already list what needs your OK and what must never happen?"

The menu marks the item **have** when `identity/RELATIONSHIP.md` exists with no prompts left and loads in one of the three ways above; **partly** when it exists but prompts remain or nothing loads it, or when a section about what needs your OK lives in an instruction file or a Project instead; and **not yet** otherwise.

## identity-soul: SOUL.md: the values Claude works by

Card: [cards/identity-soul.md](../cards/identity-soul.md)

Read-only, at the root of your setup folder. Presence, sizes and counts; no file's content is printed or quoted.

- Whether the file exists: `ls identity/SOUL.md 2>/dev/null`.
- How many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<(\.\.\.|[a-z][^>]*)>' identity/SOUL.md 2>/dev/null`.
- Its size: `wc -c < identity/SOUL.md`, reported as tokens (an estimate: bytes divided by 4).
- How it loads, counts only: imported, `grep -cE '^@identity/SOUL\.md' CLAUDE.md AGENTS.md 2>/dev/null`; named in the front door, `grep -c 'identity/SOUL.md' AGENTS.md CLAUDE.md 2>/dev/null`; printed by a start-up hook, `grep -c 'identity/SOUL.md' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Whether stated values already live somewhere else. Claude reads your instruction files (`CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md`) and your user-level one, `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md`, if it exists, which discovery may do. It reports only "has a section of values: yes or no", with the file's name, and never quotes the section.
- claude.ai: Claude Code cannot see your account, so Claude asks one yes or no question: "Do the instructions of one of your claude.ai Projects already state values for Claude to work by?"

The menu marks the item **have** when `identity/SOUL.md` exists with no prompts left and loads in one of the three ways above; **partly** when it exists but prompts remain or nothing loads it, or when a section of values lives in an instruction file or a Project instead; and **not yet** otherwise.

## identity-style: STYLE.md: how to write for you

Card: [cards/identity-style.md](../cards/identity-style.md)

Read-only, at the root of your setup folder. Presence, sizes and counts; no file's content is printed or quoted.

- Whether the file exists: `ls identity/STYLE.md 2>/dev/null`.
- How many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<(\.\.\.|[a-z][^>]*)>' identity/STYLE.md 2>/dev/null`.
- Its size: `wc -c < identity/STYLE.md`, reported as tokens (an estimate: bytes divided by 4).
- How it loads, counts only: imported, `grep -cE '^@identity/STYLE\.md' CLAUDE.md AGENTS.md 2>/dev/null`; named in the front door, `grep -c 'identity/STYLE.md' AGENTS.md CLAUDE.md 2>/dev/null`; printed by a start-up hook, `grep -c 'identity/STYLE.md' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Whether you named output habits that annoy you: Claude reads "What goes wrong today" in your `adoption/spec.md` and your round 1 answers, and says yes or no.
- Whether style rules already live somewhere else. Claude reads your instruction files (`CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md`) and your user-level one, `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md`, if it exists, which discovery may do. It reports only "has a section about how to write for you: yes or no", with the file's name, and never quotes the section.
- claude.ai: Claude Code cannot see your account, so Claude asks one yes or no question: "Do the instructions of one of your claude.ai Projects already say how to write for you?"

The menu marks the item **have** when `identity/STYLE.md` exists with no prompts left and loads in one of the three ways above; **partly** when it exists but prompts remain or nothing loads it, or when a section about how to write for you lives in an instruction file or a Project instead; and **not yet** otherwise.

## identity-user: USER.md: who you are

Card: [cards/identity-user.md](../cards/identity-user.md)

Read-only, at the root of your setup folder. Presence, sizes and counts; no file's content is printed or quoted.

- Whether the file exists: `ls identity/USER.md 2>/dev/null`.
- How many lines still hold a template prompt (a `<...>` placeholder): `grep -cE '<(\.\.\.|[a-z][^>]*)>' identity/USER.md 2>/dev/null`.
- Its size, and the four identity files together for question 2: `wc -c < identity/USER.md` and `cat identity/*.md 2>/dev/null | wc -c`, each reported as tokens (an estimate: bytes divided by 4).
- How the identity files load today, counts only:
  - imported (a line starting with `@` in an instruction file loads that file at launch): `grep -cE '^@identity/' CLAUDE.md AGENTS.md 2>/dev/null`;
  - named in the front door for Claude to read: `grep -c 'identity/' AGENTS.md CLAUDE.md 2>/dev/null`;
  - printed by a start-up hook (a command Claude Code runs when a session starts): `grep -c 'identity/' .claude/settings.json .claude/settings.local.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" 2>/dev/null`.
- Whether text about who you are already lives somewhere else. Claude reads your instruction files (`CLAUDE.md`, `AGENTS.md`, `CLAUDE.local.md`) and your user-level one, `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/CLAUDE.md`, if it exists, which discovery may do. It reports only "has a section about who you are: yes or no", with the file's name, and never quotes the section.
- claude.ai: Claude Code cannot see your account, so Claude asks one yes or no question: "Do the instructions of one of your claude.ai Projects already say who you are?"

The menu marks the item **have** when `identity/USER.md` exists with no prompts left and loads in one of the three ways above; **partly** when it exists but prompts remain or nothing loads it, or when a section about who you are lives in an instruction file or a Project instead; and **not yet** otherwise.

## improve: improve: an audit turned into plans

Card: [cards/improve.md](../cards/improve.md)

Read-only: names, descriptions, versions and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/improve/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/improve/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about audits, code review, tech debt or roadmaps.
- In each repository: whether `plans/` exists and already holds something else, counts only (`ls plans 2>/dev/null | wc -l`); improve then writes to `advisor-plans/` instead.
- A decision log it can read, names only: `ls -d docs/adr docs/adrs docs/decisions 2>/dev/null`.
- A rule about the model subagents use, in your instruction files: `grep -n -i 'model' CLAUDE.md AGENTS.md 2>/dev/null`.
- `gh --version`, only if you want its `--issues` option.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/improve/SKILL.md`.

The menu marks the item **have** when an `improve` skill exists at either level, **partly** when another audit skill covers the job, and **not yet** otherwise. The plugin marks apply.

## linus-reviewer: The reviewer seat

Card: [cards/linus-reviewer.md](../cards/linus-reviewer.md)

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The seat itself, at project and user level: `ls .claude/agents/linus-reviewer.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/linus-reviewer.md" 2>/dev/null`, and any other name recorded for this seat in `adoption/decisions.md`.
- Another agent or skill doing the same job: a code reviewer, a "review my diff" or pull-request reviewer. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- The skills that name this agent in the kit's copies, by folder name only: `ls -d .claude/skills/requesting-code-review .claude/skills/subagent-driven-development .claude/skills/executing-plans .claude/skills/writing-plans "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/requesting-code-review "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/subagent-driven-development "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/executing-plans "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/writing-plans 2>/dev/null`, and the same four in `adoption/plan.md`.
- Where your conventions are written: `ls CLAUDE.md AGENTS.md .claude/CLAUDE.md CONTRIBUTING.md 2>/dev/null`.
- Git, which it reads the diff with: `git --version`.
- An agent of the same name from a plugin enabled here: the plugin check, with `<path>` set to `agents/linus-reviewer.md`.

The menu marks the item **have** when an agent file named `linus-reviewer`, or the name recorded for this seat, exists at either level; **partly** when another reviewer agent or skill does the same job; and **not yet** otherwise. The plugin marks apply.

## long-jobs-in-containers: Long jobs in named containers

Card: [cards/long-jobs-in-containers.md](../cards/long-jobs-in-containers.md)

Read-only. Versions, counts, and running or not; no network. The Docker commands on this card are in [docs/facts.md](../docs/facts.md), "Docker: a long job in a named container". The field names used with `--format` here (`.NCPU`, `.MemTotal`, `.ServerVersion`, `.State.ExitCode`) are not in Docker's own examples, so Claude first finds each in your Docker's full output, one field at a time, for example `docker info --format '{{json .}}' | grep -o '"NCPU":[0-9]*'`, and uses the name it finds there.

- Docker: `docker --version` (it may not be installed).
- Whether its engine is running: `docker info >/dev/null 2>&1 && echo running || echo "not running"`. What `docker info` does when the engine is down is not in Docker's docs ([docs/facts.md](../docs/facts.md)); if the answer looks wrong, Claude reads the command's error with you.
- What Docker may use: `docker info --format '{{.NCPU}} processors, {{.MemTotal}} bytes of memory'`.
- Containers, counted, never listed: `docker ps -q | wc -l` (running) and `docker ps -aq | wc -l` (all).
- For each repository in `adoption/inventory.md`: a `Dockerfile`, and a `compose.yaml` or `docker-compose.yml`, present or not. Their contents are not read, since a compose file can hold environment values.
- Whether your instruction files carry a rule, a count per file: `grep -ciE 'container|docker' CLAUDE.md AGENTS.md 2>/dev/null`.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when an instruction file carries the rule and Docker is running; **partly** when Docker is installed but no rule says when to use it, or the rule is there but Docker is missing or stopped; and **not yet** otherwise.

## mcp-least-access: MCP servers with the least access

Card: [cards/mcp-least-access.md](../cards/mcp-least-access.md)

Read-only. Server names and scopes only: never a credential, a header, an environment value or a token in a URL. In the adoption's audit (phase 1), project servers come from the audit script's output, `.mcp.json` stays closed, and `claude mcp list` runs only in an empty temporary folder (a new one in the system temp folder: `mktemp -d`, or a new folder under `$env:TEMP` on Windows; never inside your setup or the kit's folder), so it lists user-scope servers only (and those from a plugin or a claude.ai connector); a local-scope server is then not found until this item is taken.

- Project scope: the names of the servers in `.mcp.json` at the root of each repository in `adoption/inventory.md`, not their settings.
- Every scope: `claude mcp list` prints each server with its state (connected, needs authentication, failed). Claude reports names and states only; if a line shows a token in a URL or an argument, Claude says a secret is exposed there without repeating it. To print a state it has to reach each server, so Claude asks before running it; without your yes, Detect stops at `.mcp.json` and asks you which other servers you use.
- Which scope each server is in: one named in `.mcp.json` is project scope. Local and project servers load only in their own project, and user servers in all of them ([docs/facts.md](../docs/facts.md), "Claude Code: MCP servers"), so Claude runs `claude mcp list` once more in an empty temporary folder (a new one in the system temp folder: `mktemp -d`, or a new folder under `$env:TEMP` on Windows; never inside your setup or the kit's folder): a server listed there too is user scope (or comes from a plugin or a claude.ai connector), and one listed only in the project and not in `.mcp.json` is local.
- Records: whether each server has a row in `adoption/decisions.md`, or in your own notes, naming its source, its scope and its access.

The menu marks the item **have** when every server Detect finds has a recorded source, scope and access, **partly** when some do, and **not yet** when none do or there are no servers yet. With no servers, the item stays optional until you want one.

## memory-index: The memory folder with its index

Card: [cards/memory-index.md](../cards/memory-index.md)

Read-only, at the root of your setup folder. File names, counts and sizes only: the memory files themselves are not opened, and the vault, where there is one, is only searched for a file's name, with nothing from it printed.

- Whether the index and its format note exist: `ls memory/MEMORY.md memory/README.md 2>/dev/null`.
- Whether each index line links a file that exists, and each memory file has a line, both ways (the template's own example line, which links `file.md` in its comment, is left out):
  ```bash
  links=$(grep -E '^- \[' memory/MEMORY.md | sed -nE 's/^- \[[^]]*\]\(([^)]*)\).*/\1/p' | grep -vx 'file\.md' | sort -u)
  printf '%s\n' "$links" | while read -r l; do [ -z "$l" ] || { [ -f "memory/${l%%#*}" ] && echo "ok $l" || echo "no file for line: $l"; }; done
  ls memory | grep -E '\.md$' | grep -vxE 'MEMORY\.md|README\.md' | sort | while read -r f; do
    printf '%s\n' "$links" | sed 's/#.*//' | grep -qxF "$f" || { grep -qF "($f)" memory/vault/MEMORY-VAULT.md 2>/dev/null && echo "in the vault: $f"; } || echo "no line for file: $f"; done
  ```
- In that output, a `no file` line is a line without a file; a `no line` line is a file without a line. A line counts when the file it links exists, so a pointer into the vault (`vault/MEMORY-VAULT.md`, with or without a `#section`, which the test drops) is `ok`; a file whose line the [vault](../cards/vault.md) card moved, word for word, into `memory/vault/MEMORY-VAULT.md` prints `in the vault`, not `no line`. Two equal counts are not enough: a line that links `staging-vpn.md` and a file named `staging-needs-vpn.md` count 1 and 1.
- The index's size: `echo "about $(( ($(wc -c < memory/MEMORY.md) + 3) / 4 )) tokens (estimate)"`.
- Whether the front door loads it: `grep -c 'memory/MEMORY.md' AGENTS.md CLAUDE.md 2>/dev/null`.
- Whether the light size is in place: `ls NOTES.md 2>/dev/null` and `grep -c 'NOTES.md' AGENTS.md CLAUDE.md 2>/dev/null`.
- Whether another memory store is in use: a notes or memory file the front door names (Claude reads the front door, which discovery may do), and Claude Code's own auto memory. Auto memory keeps its files in `~/.claude/projects/<project>/memory/`, one folder per git repository ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"); `/context`, which you type, shows which auto memory files loaded.

The menu marks the item **have** when `memory/MEMORY.md` exists, the front door names it, and the comparison prints no `no file` or `no line` line, or, at the light size, when `NOTES.md` exists and the front door names it; **partly** when the folder or the index exists but the front door does not load it, or the comparison prints a `no file` or `no line` line; and **not yet** when there is no memory folder.

## merge-commit-only: Merge commits only

Card: [cards/merge-commit-only.md](../cards/merge-commit-only.md)

Read-only and offline. The settings live on the server, so they are read in Steps, on your yes.

- The `gh` command line: `gh --version` (it may not be installed).
- Each repository's remote host, from `adoption/inventory.md` (the host only, never the full address). This card covers GitHub.
- Merge commits on each repository's main branch, counted: `git -C <repo> rev-list --count --merges <main branch>`. Zero in a repository whose work lands through PRs points to squash or rebase merges.
- Whether your instruction files carry the rule, a count per file: `grep -ciE 'squash|merge commit' CLAUDE.md AGENTS.md 2>/dev/null`.
- Whether an earlier run recorded the settings: `grep -c merge-commit-only adoption/decisions.md`.
- A local guard: when [git-guardrails](../cards/git-guardrails.md) is in your setup, whether it refuses a squash merge. Claude sends the installed guard a fake one, which merges nothing: `echo '{"tool_name":"Bash","tool_input":{"command":"git merge --squash x"}}' | node <path to block-dangerous-git.mjs>; echo "exit $?"` (in PowerShell, `; "exit $LASTEXITCODE"` at the end). `exit 2` is yes; any other exit is no. The guard as shipped answers no. Version 1.4.0 is a bash script, `.claude/hooks/block-dangerous-git.sh` or `~/.claude/hooks/block-dangerous-git.sh`: there, `grep -c squash` on that file counts its squash patterns.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when an instruction file carries the rule and `adoption/decisions.md` records each GitHub repository's settings as merge commit only; **partly** when only one of the two holds; and **not yet** otherwise.

## negative-results: Negative results recorded as results

Card: [cards/negative-results.md](../cards/negative-results.md)

Read-only. Counts only; no entry's content is printed.

- Whether your front door carries the rule, a count per file: `grep -ciE 'negative result|ruled[- ]out|falsified|failed run' CLAUDE.md AGENTS.md 2>/dev/null`.
- Claude asks one question: "Where do you keep notes on your experiments, and where does an idea go when it did not work?" The notes folder is `<notes>` below.
- Whether a list of ruled-out ideas exists, and how many entries it holds:
  - `find "<notes>" -maxdepth 2 \( -iname '*ruled*out*' -o -iname '*negative*' -o -iname '*falsified*' \) | wc -l`;
  - in that file, `grep -c '^## ' <the file>`.
- How many notes have a result section, written whichever way the run went: `grep -liE '^#+ .*(after the run|result)' "<notes>"/*.md 2>/dev/null | wc -l`, beside the number of notes, `find "<notes>" -maxdepth 2 -name '*.md' | wc -l`.

The menu marks the item **have** when the front door carries the rule and a ruled-out list exists; **partly** when your notes record results but failed ideas have no list, or the list exists and no rule sends Claude to it; and **not yet** otherwise.

## never-share-list: A never-share list

Card: [cards/never-share-list.md](../cards/never-share-list.md)

Read-only. Presence, counts, and set or not set; the list's terms are never printed.

- The hook template in your setup, and whether that copy reads a list: `<your setup>/git-hooks/check-staged.mjs`, present or not, and `grep -c never-share "<your setup>/git-hooks/check-staged.mjs"` (`0` means a copy from before the list existed).
- The list: `<your setup>/git-hooks/never-share.local.txt`, present or not, and how many terms it holds, as a count: `grep -cvE '^[[:space:]]*(#([[:space:]]|$)|$)' "<your setup>/git-hooks/never-share.local.txt"`.
- Kept out of git, when your setup folder is a git repository: `git -C "<your setup>" check-ignore -q git-hooks/never-share.local.txt && echo ignored || echo "not ignored"`; and whether it was ever committed: `git -C "<your setup>" log --oneline -- git-hooks/never-share.local.txt | wc -l` (`0` is right).
- The repositories that run the hooks: as in the [git hook templates](../cards/git-hooks.md) card's Detect.
- Whether your front door asks Claude to check the list: `grep -c never-share CLAUDE.md AGENTS.md 2>/dev/null`.
- Your profiles, from `adoption/inventory.md`.

The menu marks the item **have** when the list holds at least one term, is ignored and was never committed, the hook copy reads it and runs in at least one repository, and your front door carries the check; **partly** when only some of these hold; and **not yet** otherwise.

## pack-advisor-council-for-big-decisions: Domain: a council of viewpoints for big decisions

Card: [cards/pack-advisor-council-for-big-decisions.md](../cards/pack-advisor-council-for-big-decisions.md)

Read-only: names, descriptions and counts, never a skill's or an agent's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The pack, the council skill and the seats, at project and user level: `ls -d .claude/skills/advisor-council-for-big-decisions .claude/skills/council .claude/agents "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/advisor-council-for-big-decisions "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/council "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents 2>/dev/null`.
- How many agent files exist at each level: `ls .claude/agents/*.md 2>/dev/null | wc -l` and `ls "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md 2>/dev/null | wc -l`.
- Another skill or agent that already runs a panel (a "board", "panel", "second opinion" or "debate" in its description). Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md .claude/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md 2>/dev/null`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/advisor-council-for-big-decisions/SKILL.md`.

The menu marks the domain **have** when the pack's folder and the `council` skill exist and at least three seats are in place; **partly** when only some of that is true, or another skill already runs a panel; and **not yet** otherwise. The plugin marks apply.

## pack-android-swiftui-react-native-app-building: Domain: phone apps (Android, SwiftUI and React Native)

Card: [cards/pack-android-swiftui-react-native-app-building.md](../cards/pack-android-swiftui-react-native-app-building.md)

Read-only: presence and versions, never your app's code. Programs the skills use, printed as found or not found:

- `node --version` and `npm --version` for React Native and Expo; `java -version 2>&1 | head -1` and `adb version 2>/dev/null | head -1` for Android; `xcodebuild -version 2>/dev/null | head -1` on a Mac for SwiftUI.
- The pack, at project and user level: `ls -d .claude/skills/android-swiftui-react-native-app-building "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/android-swiftui-react-native-app-building 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'android|swiftui|ios|react native|expo|play store|app store'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/android-swiftui-react-native-app-building/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers phone-app building and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-app-legal-privacy-terms-store-review: Domain: app legal, privacy policy, terms and store review

Card: [cards/pack-app-legal-privacy-terms-store-review.md](../cards/pack-app-legal-privacy-terms-store-review.md)

Read-only: presence and versions, never the contents of your files.

- The pack, at project and user level: `ls -d .claude/skills/app-legal-privacy-terms-store-review "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/app-legal-privacy-terms-store-review 2>/dev/null`.
- The standalone stub: `ls -d .claude/skills/legal-signoff-orchestrator "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/legal-signoff-orchestrator 2>/dev/null`.
- Tools the pack's scripts use: `node --version` (the data-surface scripts need Node 18 or newer). Optional, for the binary scans only: `docker --version | head -1`. The skills carry no `requires` list; these are the tools named in the skill files.
- Another skill that already does legal or privacy review, from its front matter only:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'privacy|terms of service|gdpr|legal|store review'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/app-legal-privacy-terms-store-review/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already does legal or privacy review and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-audio-video-media: Domain: audio, video and media

Card: [cards/pack-audio-video-media.md](../cards/pack-audio-video-media.md)

Read-only: presence and versions, never the media itself. Tools some of the skills use, printed as found or not found:

- `ffmpeg -version 2>/dev/null | head -1`, and the same for `ffprobe`, `yt-dlp` and `gifsicle`.
- The pack, at project and user level: `ls -d .claude/skills/audio-video-media "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/audio-video-media 2>/dev/null`.
- Another skill that already handles video or audio, from its front matter only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'video|audio|podcast|transcri|subtitle' && echo "$f"; done`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/audio-video-media/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already handles media and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-dependency-supply-chain-risk-checks: Domain: dependency supply-chain risk checks

Card: [cards/pack-dependency-supply-chain-risk-checks.md](../cards/pack-dependency-supply-chain-risk-checks.md)

Read-only: presence and versions, never your files' contents.

- The pack, at project and user level: `ls -d .claude/skills/dependency-supply-chain-risk-checks "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/dependency-supply-chain-risk-checks 2>/dev/null`.
- The standalone stub: `ls -d .claude/skills/supply-chain-risk-auditor "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/supply-chain-risk-auditor 2>/dev/null`.
- The tool the skill requires, and whether it is signed in: `gh --version | head -1`, then `gh auth status 2>&1 | head -2`.
- Which package files your project has, by name only: `ls package.json pubspec.yaml requirements.txt pyproject.toml 2>/dev/null`.
- Another skill that already checks dependencies, from its front matter only:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'dependenc|supply.chain|vulnerab|package'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/dependency-supply-chain-risk-checks/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already checks dependencies and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-design-ui-logos-slides-posters: Domain: design, UX and accessibility

Card: [cards/pack-design-ui-logos-slides-posters.md](../cards/pack-design-ui-logos-slides-posters.md)

Read-only: presence and versions, never your designs or files. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The pack and the two stubs, at project and user level: `ls -d .claude/skills/design-ui-logos-slides-posters .claude/skills/review-animations .claude/skills/motion-dev-animations "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/design-ui-logos-slides-posters "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/review-animations "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/motion-dev-animations 2>/dev/null`.
- Whether the agent exists: `ls .claude/agents/design-critic.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/design-critic.md 2>/dev/null`.
- Tools some of the skills use, printed as found or not found: `node --version 2>/dev/null`, `python --version 2>/dev/null`, and a browser (`google-chrome --version 2>/dev/null || chromium --version 2>/dev/null`; on Windows or macOS say which browser you use).
- Another skill that already does design work, from its front matter only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'logo|design|slides|poster|accessib|brand' && echo "$f"; done`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/design-ui-logos-slides-posters/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already handles design and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-django-flask-laravel-shops-and-chat: Domain: Django, Flask and Laravel back ends, shops, chat and jobs

Card: [cards/pack-django-flask-laravel-shops-and-chat.md](../cards/pack-django-flask-laravel-shops-and-chat.md)

Read-only: presence and versions, never the contents of your code. Tools the skills use, printed as found or not found:

- `python --version 2>/dev/null || python3 --version`, `php --version | head -1` and `composer --version`. Which ones matter depends on your framework.
- The pack, at project and user level: `ls -d .claude/skills/django-flask-laravel-shops-and-chat "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/django-flask-laravel-shops-and-chat 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'django|flask|laravel|shop|checkout|payment|chat|websocket|queue'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/django-flask-laravel-shops-and-chat/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers one of these frameworks, shops or chat and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-engineering-testing-performance-code-design: Domain: browser testing, performance and code design

Card: [cards/pack-engineering-testing-performance-code-design.md](../cards/pack-engineering-testing-performance-code-design.md)

Read-only: presence and versions, never your code. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The pack, at project and user level: `ls -d .claude/skills/engineering-testing-performance-code-design "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/engineering-testing-performance-code-design 2>/dev/null`. This pack has no stubs and no agents.
- Tools the browser skill uses, printed as found or not found: `node --version 2>/dev/null`, `npx --version 2>/dev/null`, and a Chrome (`google-chrome --version 2>/dev/null || chromium --version 2>/dev/null`; on Windows or macOS say which browser you use).
- Whether a DevTools connection is already set up (file names only): `grep -l "chrome-devtools" .mcp.json "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/settings.json 2>/dev/null`.
- Another skill that already does this job, from its front matter only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'performance|lighthouse|devtools|profil|refactor|architecture' && echo "$f"; done`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/engineering-testing-performance-code-design/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already handles this work and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-games-design-prototype-playtest-assets: Domain: making games (design, prototype, playtest, art and ports)

Card: [cards/pack-games-design-prototype-playtest-assets.md](../cards/pack-games-design-prototype-playtest-assets.md)

Read-only: presence and versions, never your game files. Programs some of the skills use, printed as found or not found:

- `python --version 2>/dev/null || python3 --version`, then `python -c "import PIL; print(PIL.__version__)" 2>/dev/null` for Pillow (the art check script needs it), and `ffmpeg -version 2>/dev/null | head -1` (optional, for animation frames).
- The pack, at project and user level: `ls -d .claude/skills/games-design-prototype-playtest-assets "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/games-design-prototype-playtest-assets 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'game|playtest|sprite|prototype'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/games-design-prototype-playtest-assets/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers game design or playtesting and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-godot-camera-shaders-particles-export: Domain: Godot games, camera, shaders, particles, export and audit

Card: [cards/pack-godot-camera-shaders-particles-export.md](../cards/pack-godot-camera-shaders-particles-export.md)

Read-only: presence and versions, never your project files. The program the skills use, printed as found or not found:

- `godot --version 2>/dev/null || godot4 --version 2>/dev/null`. Godot is the one requirement for nine of the ten skills.
- The pack, at project and user level: `ls -d .claude/skills/godot-camera-shaders-particles-export "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/godot-camera-shaders-particles-export 2>/dev/null`.
- Another skill that already covers Godot, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'godot|gdscript|shader|particle|tween'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/godot-camera-shaders-particles-export/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers Godot and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-learning-lessons-explanations-practice: Domain: learning something from zero

Card: [cards/pack-learning-lessons-explanations-practice.md](../cards/pack-learning-lessons-explanations-practice.md)

Read-only: presence only, never your notes. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The pack and the stub, at project and user level: `ls -d .claude/skills/learning-lessons-explanations-practice .claude/skills/teach "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/learning-lessons-explanations-practice "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/teach 2>/dev/null`. This pack has no agents.
- Whether a course folder already exists here (names only): `ls MISSION.md GLOSSARY.md RESOURCES.md lessons learning-records 2>/dev/null`.
- Another skill that already teaches, from its front matter only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'teach|tutor|lesson|learn|course|flashcard' && echo "$f"; done`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/learning-lessons-explanations-practice/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already teaches and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-marketing-copy-emails-seo-signups: Domain: marketing copy, emails, search, signups and tests

Card: [cards/pack-marketing-copy-emails-seo-signups.md](../cards/pack-marketing-copy-emails-seo-signups.md)

Read-only: presence only, never the contents of your files.

- The pack, at project and user level: `ls -d .claude/skills/marketing-copy-emails-seo-signups "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/marketing-copy-emails-seo-signups 2>/dev/null`.
- Whether a product marketing context file already exists, by name only: `ls .agents/product-marketing.md .claude/product-marketing.md 2>/dev/null`. The skills read it first if it is there.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'copywriting|marketing|seo|email|conversion|signup|onboarding|paywall|analytics'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/marketing-copy-emails-seo-signups/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers copy, email or search work and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-marketing-plans-offers-pricing-launches: Domain: marketing plans, offers, pricing and launches

Card: [cards/pack-marketing-plans-offers-pricing-launches.md](../cards/pack-marketing-plans-offers-pricing-launches.md)

Read-only: presence only, never the contents of your files.

- The pack, at project and user level: `ls -d .claude/skills/marketing-plans-offers-pricing-launches "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/marketing-plans-offers-pricing-launches 2>/dev/null`.
- Whether a product marketing context file already exists, by name only: `ls .agents/product-marketing.md .claude/product-marketing.md 2>/dev/null`. The skills read it first if it is there.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'marketing|pricing|launch|competitor|referral|positioning|social|advertis'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/marketing-plans-offers-pricing-launches/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers marketing plans, pricing or launches and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-mobile-apps-flutter-firebase: Domain: mobile apps with Flutter and Firebase

Card: [cards/pack-mobile-apps-flutter-firebase.md](../cards/pack-mobile-apps-flutter-firebase.md)

Read-only: presence and versions, never the contents of your app. Tools the skills use, printed as found or not found:

- `flutter --version 2>/dev/null | head -1`, `dart --version`, `node --version`, `npx --version`, `flutterfire --version` and `gcloud --version 2>/dev/null | head -1`. The Firebase skills run the CLI as `npx firebase-tools@15.36.0` (pinned), so `firebase --version` is optional.
- The pack, at project and user level: `ls -d .claude/skills/mobile-apps-flutter-firebase "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/mobile-apps-flutter-firebase 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'flutter|dart|firebase|firestore|crashlytics'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/mobile-apps-flutter-firebase/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers Flutter or Firebase and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-phone-app-testing-release-and-agents: Domain: phone apps, testing, release checks and phone agents

Card: [cards/pack-phone-app-testing-release-and-agents.md](../cards/pack-phone-app-testing-release-and-agents.md)

Read-only: presence and versions, never your app or your phone's contents. Tools some of the skills use, printed as found or not found:

- `adb version 2>/dev/null | head -1`, `jadx --version 2>/dev/null`, and, on a Mac, `xcrun simctl help 2>/dev/null | head -1`. None of these lists devices or reads anything from a phone.
- The pack, at project and user level: `ls -d .claude/skills/phone-app-testing-release-and-agents "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/phone-app-testing-release-and-agents 2>/dev/null`.
- Another skill that already covers phone apps or store release, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'android|iphone|emulator|app store|play store|crash|apk|adb'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/phone-app-testing-release-and-agents/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers phone apps and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-python-backend-fastapi-docker-agents: Domain: Python back ends, FastAPI, Docker and AI agents

Card: [cards/pack-python-backend-fastapi-docker-agents.md](../cards/pack-python-backend-fastapi-docker-agents.md)

Read-only: presence and versions, never the contents of your code. Tools the skills use, printed as found or not found:

- `python --version 2>/dev/null || python3 --version`, and `uv --version`, `docker --version` and `node --version` (the last one only matters for the Node Docker template).
- The pack, at project and user level: `ls -d .claude/skills/python-backend-fastapi-docker-agents "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/python-backend-fastapi-docker-agents 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'python|fastapi|docker|pydantic'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/python-backend-fastapi-docker-agents/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers Python, FastAPI or Docker and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-stock-research-backtests-trading-safety: Domain: stock research, backtests, trading safety and budgets

Card: [cards/pack-stock-research-backtests-trading-safety.md](../cards/pack-stock-research-backtests-trading-safety.md)

Read-only: presence and versions, never your data, statements or keys. Tools the skills use, printed as found or not found:

- `python --version 2>/dev/null || python3 --version` (three skills ship a small Python script).
- The pack, at project and user level: `ls -d .claude/skills/stock-research-backtests-trading-safety "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/stock-research-backtests-trading-safety 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'stock|trading|backtest|valuation|broker|budget|portfolio'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/stock-research-backtests-trading-safety/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers stock research, trading or budgets and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-unity-editor-scripts-prefabs-builds: Domain: Unity games (editor, scripts, prefabs, tests and builds)

Card: [cards/pack-unity-editor-scripts-prefabs-builds.md](../cards/pack-unity-editor-scripts-prefabs-builds.md)

Read-only: presence and versions, never your project files. Unity has no single version command, so Detect looks for the editor folders the skills name:

- `ls -d "/c/Program Files/Unity/Hub/Editor"/* /Applications/Unity/Hub/Editor/* 2>/dev/null` lists the installed editor versions on Windows and macOS.
- Programs for the platform builds, printed as found or not found: `java -version 2>&1 | head -1` and `adb version 2>/dev/null | head -1` for Android, and `xcodebuild -version 2>/dev/null | head -1` on a Mac for iOS.
- The pack, at project and user level: `ls -d .claude/skills/unity-editor-scripts-prefabs-builds "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/unity-editor-scripts-prefabs-builds 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'unity|c#'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/unity-editor-scripts-prefabs-builds/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers Unity and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-web-api-security-login-and-graphql: Domain: web back ends, API design, security, sign-in and GraphQL

Card: [cards/pack-web-api-security-login-and-graphql.md](../cards/pack-web-api-security-login-and-graphql.md)

Read-only: presence and versions, never the contents of your code. Tools the skills use, printed as found or not found:

- `node --version 2>/dev/null` and `npx --version 2>/dev/null` (only the API lint and client generation steps use them), and `curl --version 2>/dev/null | head -1`.
- The pack, at project and user level: `ls -d .claude/skills/web-api-security-login-and-graphql "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/web-api-security-login-and-graphql 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'openapi|rest api|graphql|sign-in|login|session|csrf|api security'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/web-api-security-login-and-graphql/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers web API, security or sign-in work and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-web-astro-cloudflare-gsap-performance: Domain: websites, Astro, Cloudflare, animation and speed

Card: [cards/pack-web-astro-cloudflare-gsap-performance.md](../cards/pack-web-astro-cloudflare-gsap-performance.md)

Read-only: presence and versions, never the contents of your site. Tools the skills use, printed as found or not found:

- `node --version` and `npm --version`, and `wrangler --version 2>/dev/null | head -1` (it only prints when wrangler is installed on your computer).
- The pack, at project and user level: `ls -d .claude/skills/web-astro-cloudflare-gsap-performance "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/web-astro-cloudflare-gsap-performance 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'astro|cloudflare|wrangler|gsap|schema|seo|web perf'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/web-astro-cloudflare-gsap-performance/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers web work and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## pack-web-search-and-scraping-into-files: Domain: web search and page data saved into files

Card: [cards/pack-web-search-and-scraping-into-files.md](../cards/pack-web-search-and-scraping-into-files.md)

Read-only: presence and versions, never your files. The one program the skill uses, printed as found or not found:

- `python --version 2>/dev/null || python3 --version 2>/dev/null || py --version`. Python is optional; the checker and the short scripts that read saved pages use the standard library only.
- The pack, at project and user level: `ls -d .claude/skills/web-search-and-scraping-into-files "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/web-search-and-scraping-into-files 2>/dev/null`.
- Another skill that already does the same job, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'scrap|crawl|fetch|search the web|robots'`
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/web-search-and-scraping-into-files/SKILL.md`.

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already collects web data and the pack is absent; and **not yet** otherwise. The plugin marks apply.

## project-registry: A project registry

Card: [cards/project-registry.md](../cards/project-registry.md)

Read-only. Presence and counts; no network.

- The registry: `<your setup>/registry/PROJECTS.md`, present or not, and its rows, counted (the first two table lines are the header and its rule):
  ```bash
  grep -E '^\|' "<your setup>/registry/PROJECTS.md" | sed '1,2d' | wc -l
  ```
- How many repositories you have: the rows of `adoption/inventory.md`, and those inside your setup folder, the setup itself included when it is one: `find "<your setup>" -maxdepth 3 -name .git | wc -l`.
- Rows whose path is not the top folder of a repository, counted (`0` is right). As in Check step 1, git's `--show-toplevel` must be the path itself, so a plain folder inside a repository counts here, and so does an empty Path cell:
  ```bash
  cd "<your setup>" && grep -E '^\|' registry/PROJECTS.md | sed '1,2d' | cut -d'|' -f3 | tr -d ' `' |
    while read -r p; do
      [ -n "$p" ] && top=$(git -C "$p" rev-parse --show-toplevel 2>/dev/null) && [ "$top" -ef "$p" ] || echo x
    done | wc -l
  ```
- Whether your front door points at it: `grep -c PROJECTS.md CLAUDE.md AGENTS.md 2>/dev/null`.
- Another list doing the same job: a table of repositories in your front door or a README, noted by its heading only.
- The session hooks: whether `.claude/settings.json` names `session-start-status` or `session-end-check`.

The menu marks the item **have** when the registry has a row for every repository, every path in it is a repository, and your front door points at it; **partly** when it exists but misses a repository, holds a stale path, or nothing points at it; and **not yet** otherwise.

## real-data-seed: A small real-data seed

Card: [cards/real-data-seed.md](../cards/real-data-seed.md)

Read-only. Folder names, sizes and counts only. Claude never opens, lists or samples a data file, a seed included.

- Whether your front door mentions a seed or says why there is none, a count per file: `grep -ciE 'seed' CLAUDE.md AGENTS.md 2>/dev/null`.
- Whether the repository has a seed folder: `find "<repo>" -maxdepth 2 -type d -name seeds -not -path '*/.git/*' | wc -l`; if it has, its size only: `du -sh "<repo>/seeds"`.
- Whether it has a folder of hand-made test data, counted, not opened: `find "<repo>" -maxdepth 3 -type d -iname '*fixture*' -not -path '*/.git/*' | wc -l`.
- Claude asks two questions, because the answers are not in any file: "What happens to your tests when the real data is missing: do they fail, skip, or not notice?" and "Who decides what may be done with this data, and have they said anything about copies?"

The menu marks the item **have** when a seed exists, a test runs the pipeline on it, and that test fails when the seed is missing, or when your front door records that your data rules forbid a seed, with the reason; **partly** when only a hand-made fixture exists, or a seed exists that no test needs; and **not yet** otherwise.

## receiving-code-review: Receiving a code review

Card: [cards/receiving-code-review.md](../cards/receiving-code-review.md)

Read-only: names, descriptions, versions and counts, never a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The skill, at project and user level: `ls -d .claude/skills/receiving-code-review "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/receiving-code-review" 2>/dev/null`.
- Another skill that handles review feedback. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- A rule in your instruction files about review feedback or agreeing too readily: `grep -n -i -E 'review|feedback|absolutely right' CLAUDE.md AGENTS.md .claude/CLAUDE.md 2>/dev/null`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/receiving-code-review/SKILL.md`.

The menu marks the item **have** when a skill of this name exists at either level; **partly** when another skill or an instruction-file rule covers how to take review feedback; and **not yet** otherwise. The plugin marks apply.

## requesting-code-review: Requesting a code review

Card: [cards/requesting-code-review.md](../cards/requesting-code-review.md)

Read-only: names, descriptions, versions and counts, never a skill's or an agent's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The skill, at project and user level: `ls -d .claude/skills/requesting-code-review "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/requesting-code-review" 2>/dev/null`.
- The reviewer it would start: `ls .claude/agents/linus-reviewer.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/linus-reviewer.md" 2>/dev/null`, the name recorded for that seat in `adoption/decisions.md`, and any other reviewer agent or review skill. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- Git: `git --version`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/requesting-code-review/SKILL.md`.

The menu marks the item **have** when a skill of this name exists at either level; **partly** when another review skill exists, or only a reviewer agent; and **not yet** otherwise. The plugin marks apply.

## rules-audit: The periodic rules audit

Card: [cards/rules-audit.md](../cards/rules-audit.md)

Read-only. File names and counts only; no skill body or memory file is opened at this stage.

- Whether the brief is in your setup: `find "<your setup>" -maxdepth 4 -name 'rules-audit*' | wc -l`.
- Whether an audit was run before: `find "<your setup>" -maxdepth 4 -name '*-rules-audit.md' | wc -l`, which counts reports saved as in step 4 below. A report you keep under another name counts when you point Claude at it.
- How many kinds of place state rules in your setup, counted:
  - a front door: `ls CLAUDE.md AGENTS.md 2>/dev/null | wc -l`;
  - identity files: `ls identity/*.md 2>/dev/null | wc -l`;
  - memory files: `ls memory/*.md 2>/dev/null | wc -l`;
  - skills and agents: `ls .claude/skills/*/SKILL.md .claude/agents/*.md 2>/dev/null | wc -l`;
  - Claude Code hooks: `grep -c '"hooks"' .claude/settings*.json 2>/dev/null`;
  - git hooks, for each repository in `adoption/inventory.md`: `git -C <repo> config --get core.hooksPath >/dev/null && echo set || echo "not set"`.

The menu marks the item **have** when the brief is in your setup and an audit report exists; **partly** when only one of the two exists; and **not yet** otherwise.

## rules-on-demand: Rules loaded only when needed

Card: [cards/rules-on-demand.md](../cards/rules-on-demand.md)

Read-only, at the root of your setup folder. Instruction files may be read; nothing else is opened.

- The front door's size: `wc -c CLAUDE.md AGENTS.md 2>/dev/null`, reported as tokens (an estimate: bytes divided by 4).
- The files it imports, which load into every session with it (a line starting with `@` loads that file at launch): `grep -hE '^@' CLAUDE.md AGENTS.md 2>/dev/null`, each with its size from `wc -c`.
- Claude reads the front door and names each section or rule that applies to some kinds of task only (one language, one tool, one client, one kind of release), with its size in bytes.
- A table of this kind already: a section that names a file to read before a kind of task. For each file such a table names, present or not: a row that names a missing file sends Claude to a dead end.
- Rule files already kept apart: `ls rules/*.md 2>/dev/null | wc -l` (or the folder your front door uses).

The menu marks the item **have** when such a table exists, every file it names exists, and the front door holds no section that applies to one kind of task only; **partly** when the table names a missing file, or task-only sections or imports remain in the front door, or rule files exist that nothing points to; and **not yet** when there is no table.

## sealed-holdout: A sealed holdout

Card: [cards/sealed-holdout.md](../cards/sealed-holdout.md)

Read-only. Counts and yes/no answers only. Claude never lists, opens or samples a data file or a data folder.

- Whether your front door carries a holdout rule, a count per file: `grep -ciE 'holdout|held-out|held out|test set' CLAUDE.md AGENTS.md 2>/dev/null`.
- Claude asks one question, because a holdout lives in data it must not read: "Do you keep part of your data back until the final evaluation? If so, how was it split, and what can read it today?"
- Whether your code already guards it, a count of code files that name it (code only, never data): `grep -rliE 'holdout|held_out' --include='*.py' --include='*.R' --include='*.sql' "<repo>" 2>/dev/null | wc -l`. Claude adds your language's extension when it is not listed.
- Whether there is a log of reads, in your experiment notes (`<notes>`): `ls "<notes>"/holdout.md 2>/dev/null | wc -l`.

The menu marks the item **have** when a holdout exists, the front door forbids tuning on it and something records or guards every read; **partly** when a holdout exists but nothing guards it; and **not yet** when there is no holdout.

## sensitive-file-deny-rules: Deny rules for secret files

Card: [cards/sensitive-file-deny-rules.md](../cards/sensitive-file-deny-rules.md)

Read-only. Rule text, counts and a version; never a file's contents, and never any other value from a settings file.

- Deny rules already set, at user level (`~/.claude/settings.json`, or under `$CLAUDE_CONFIG_DIR` when that is set) and in `.claude/settings.json` and `.claude/settings.local.json` of each repository in `adoption/inventory.md`. Claude prints the `permissions.deny` list alone, so no `env` value reaches the session:
  `node -e "try{const s=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8').replace(/^\uFEFF/,''));console.log(JSON.stringify((s.permissions||{}).deny||[]))}catch(e){console.log('no file, or not valid JSON')}" "<settings file>"`
  Rule text holds no secret, so it is shown as written. Without Node.js, you type `/permissions`, which lists every rule with its file, and read out the deny rules.
- What the rules would refuse. A rule matches a file or a folder anywhere in the path, the folders above the project included, so Claude counts four things per repository, printing no name (to see names, run a count in your own terminal without the `c` in `-ciE`); the first two are the secret-file paths:
  - tracked paths with a `.env*`, `*.pem` or `*.key` file or folder in them: `git -C "<repo>" ls-files | grep -ciE '(^|/)(\.env[^/]*|[^/]*\.(pem|key))(/|$)'`;
  - a top-level `.env` folder, often a Python virtual environment, which `git ls-files` hides when it is ignored: `test -d "<repo>/.env" && echo "a .env folder" || echo "none"`;
  - tracked paths with `credential` or `secret` in any file or folder name: `git -C "<repo>" ls-files | grep -ciE '(^|/)[^/]*(credential|secret)[^/]*(/|$)'`;
  - the repository's own path and every folder above it, which `git ls-files` never shows (`1` means it holds either word): `git -C "<repo>" rev-parse --show-toplevel | grep -ciE 'credential|secret'`; for a setup folder that is not a repository, `(cd "<your setup>" && pwd) | grep -ciE 'credential|secret'`.
- Claude Code's version: `claude --version`. Input redirects such as `cat < .env` are covered from v2.1.257, the Write tool from v2.1.228 ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files").

The menu marks the item **have** when a deny list at user level, or in every repository in `adoption/inventory.md`, holds rules for `.env*`, `*.pem`, `*.key` and `~/.ssh`, and for the two name words unless you chose against them; **partly** when only some of these are there; and **not yet** otherwise.

## session-end-check: A check before a session ends

Card: [cards/session-end-check.md](../cards/session-end-check.md)

Read-only. Settings, names, presence, counts and versions; no network. From the settings files only the `hooks` part is read, plus one name under `env`: no other variable there is looked at, since those can hold credentials.

- The Stop hooks you already have: in your setup's `.claude/settings.json` and `.claude/settings.local.json`, and in `~/.claude/settings.json` (or the one under `$CLAUDE_CONFIG_DIR` when that is set), the `hooks.Stop` entries: how many, and the file name of the script each one runs.
- Whether each script a Stop entry names exists. An entry that names a missing file runs nothing while it still looks set.
- Whether an active window is already set: `SESSION_END_ACTIVE_MINUTES` under `env` in those files, set or not set.
- The template in your setup: `<your setup>/hooks/session-end-check.mjs`, present or not.
- Where the hook would read its list of repositories: `registry/PROJECTS.md` in your setup if it exists, else `adoption/inventory.md`.
- For each repository in `adoption/inventory.md`, counts only: whether it has a remote, `git -C <repo> remote | wc -l`, and how many commits on its local branches or its HEAD are on no remote, `git -C <repo> rev-list --count HEAD --branches --not --remotes`.
- Versions: `node --version` (the hook runs on Node) and `git --version`.

The menu marks the item **have** when a Stop entry runs `session-end-check.mjs`, or another script you confirm checks for unpushed work, and that file exists; **partly** when the file is in your setup but no entry runs it, or an entry names a file that is missing; and **not yet** otherwise.

## session-start-status: A status line at the start of a session

Card: [cards/session-start-status.md](../cards/session-start-status.md)

Read-only. Settings, names, presence, counts and versions; no network. From the settings files only the `hooks` part is read.

- The SessionStart hooks you already have: in your setup's `.claude/settings.json` and `.claude/settings.local.json`, and in `~/.claude/settings.json` (or the one under `$CLAUDE_CONFIG_DIR` when that is set), the `hooks.SessionStart` entries: how many, their matchers, and the file name of the script each one runs.
- Whether each script such an entry names exists. An entry that names a missing file runs nothing while it still looks set.
- The template in your setup: `<your setup>/hooks/session-start-status.mjs`, present or not.
- Where it would read its list of repositories: `registry/PROJECTS.md` in your setup if it exists, else `adoption/inventory.md`.
- Whether your front door carries a dated current-state section, which the front-door line needs: `grep -ciE '^#+ .*current state' AGENTS.md CLAUDE.md 2>/dev/null`.
- What already loads into every session: the total in `adoption/inventory.md`, so the status's cost can be weighed against it.
- Versions: `node --version` (the hook runs on Node) and `git --version`.

The menu marks the item **have** when a SessionStart entry runs `session-start-status.mjs`, or another script you confirm reports unsaved work and stale state, and that file exists; **partly** when the file is in your setup but no entry runs it, or an entry names a file that is missing; and **not yet** otherwise.

## setup-check: Check my setup

Card: [cards/setup-check.md](../cards/setup-check.md)

Read-only, in your setup folder and in the kit folder.

- Whether you have a plan, and how many rows are ticked: `ls adoption/plan.md` and `grep -c '\[x\]' adoption/plan.md`.
- Whether your copy of the kit has the mode: `grep -rqs 'Setup-check mode' "<kit>/.claude/skills/drill-to-adopt" && echo yes || echo no` prints `yes`. It looks in the whole skill folder, since newer versions keep each mode in a file of its own.
- The kit version you have, the first `## ` heading of `<kit>/CHANGELOG.md`, and the version your adoption was made with, the Kit version column of the newest row in `adoption/decisions.md`.

The menu marks the item **have** when a plan with ticked rows exists and your kit copy has the mode; **partly** when there is a plan but the kit copy is older than the mode, or no row is ticked yet; and **not yet** when there is no plan.

## sherlock-researcher: The researcher

Card: [cards/sherlock-researcher.md](../cards/sherlock-researcher.md)

Read-only: names, descriptions and counts, never an agent's or a skill's instructions, and no network. `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` is your user folder: `~/.claude`, unless `CLAUDE_CONFIG_DIR` moves it.

- The agent itself, at project and user level: `ls .claude/agents/sherlock-researcher.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/sherlock-researcher.md" 2>/dev/null`, and any other name recorded for it in `adoption/decisions.md`.
- Another agent or skill doing the same job: a researcher, a "deep research" or fact-checking skill. This reader prints each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/agents/*.md .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/agents/*.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null`
- Whether you hit usage limits: your answer in `adoption/spec.md`.
- An agent of the same name from a plugin enabled here: the plugin check, with `<path>` set to `agents/sherlock-researcher.md`.

The menu marks the item **have** when an agent file named `sherlock-researcher`, or the name recorded for it, exists at either level; **partly** when another agent or skill does the same job; and **not yet** otherwise. The plugin marks apply.

## signed-commits: Signed commits

Card: [cards/signed-commits.md](../cards/signed-commits.md)

Read-only. These commands print settings as set or not set, versions and counts. They never print a key ID, a fingerprint or a file name, they use no network, and they leave no file behind: `gpg` makes its keyring folder and files the first time it lists keys, so it runs only where a keyring already exists. Where one does, listing the keys starts `gpg-agent`, which keeps its socket files in that folder while it runs; once the agent stops, nothing is left.

- Signing settings, for your user and for each repository in `adoption/inventory.md`:
  - `git config --global --get commit.gpgsign` and `git config --global --get gpg.format`;
  - `git config --global --get user.signingkey >/dev/null && echo set || echo "not set"`;
  - the same three inside each repository with `git -C <repo> config --local ...`.
- Whether a company repository overrides any of them locally: `git -C <repo> config --local --name-only --get-regexp '^(commit\.gpgsign|gpg\.format|user\.signingkey)$'`. `--name-only` prints the names without the values ([docs/facts.md](../docs/facts.md), "Git: signed commits and identity per folder"); Claude still checks in `git help config` that the installed git has it.
- Versions: `git --version`, `ssh -V`, and `gpg --version | head -1` (it may not be installed).
- How many keys exist, counts only:
  - GPG secret keys, counted only when the folder that holds them exists (`gpgconf` names the keyring folder the `gpg` you run uses, without creating it), otherwise `no keyring`:
    ```bash
    if d=$(gpgconf --list-dirs homedir 2>/dev/null) && [ -d "$d/private-keys-v1.d" ]
    then gpg --no-auto-check-trustdb --list-secret-keys --with-colons 2>/dev/null | grep -c '^sec'; else echo "no keyring"; fi
    ```
  - SSH public keys: `ls "$HOME"/.ssh/*.pub 2>/dev/null | wc -l`.

The menu marks the item **have** when `commit.gpgsign` is `true` and a signing key is set, **partly** when a key exists but signing is off, and **not yet** otherwise.

## skillspector: SkillSpector with the scan-first rule

Card: [cards/skillspector.md](../cards/skillspector.md)

Read-only. Versions, and present or not; no network.

- `skillspector --version`: a version, or "not found". Claude compares the version with the one the kit pins, v2.13.6 (`tools/export/scanner.json`), and reports "pinned" or the other version it found.
- `uv --version`: a version, or "not found". uv is the Python tool manager that SkillSpector installs with.
- The scan-first line: Claude searches your front door (the `CLAUDE.md` or `AGENTS.md` your sessions load, in your setup and in each repository in `adoption/inventory.md`; see [the front door](../cards/front-door.md)) for the word SkillSpector, and reports found or not found for each file.

The menu marks the item **have** when `skillspector --version` prints v2.13.6 and your front door carries the scan-first line, **partly** when only one of the two holds or the version is another one, and **not yet** otherwise.

## subagent-driven-development: Subagent-driven development

Card: [cards/subagent-driven-development.md](../cards/subagent-driven-development.md)

Read-only: names, descriptions, versions and counts. No skill or agent body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/subagent-driven-development/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/subagent-driven-development/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about running a plan through subagents.
- Agents for the two roles: file names in `.claude/agents/` and `"${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/"`, and the front matter of each, looking for one that builds and one that reviews (`bob-builder` and `linus-reviewer` by name).
- What it relies on, at both levels, folder names only (`test -d <level>/<name>`): `requesting-code-review` (whose `code-reviewer.md` briefs the final review), `using-git-worktrees`, `finishing-a-development-branch`, and `executing-plans`, which shares its scripts.
- bash, for its scripts: `bash --version | head -1`.
- A rule about subagent models or reviews in your instruction files: `grep -n -i -E 'subagent|model|review' CLAUDE.md AGENTS.md 2>/dev/null`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/subagent-driven-development/SKILL.md`.

The menu marks the item **have** when a `subagent-driven-development` skill exists at either level, **partly** when another skill does the job, and **not yet** otherwise. The plugin marks apply.

## success-criteria-first: Success criteria before the run

Card: [cards/success-criteria-first.md](../cards/success-criteria-first.md)

Read-only. Counts only; no note's content is printed, and no data file or notebook is opened.

- Whether your front door carries the rule, a count per file: `grep -ciE 'success criteria|before (the|any) run|criteria first' CLAUDE.md AGENTS.md 2>/dev/null`.
- The habit may not be in any file yet, so Claude asks one question: "Where do you keep a note for each experiment or run?" The answer is `<notes>` below; "nowhere yet" is a fine answer.
- In `<notes>`, how many notes there are and how many have a criteria block written before the run:
  - `find "<notes>" -maxdepth 2 -name '*.md' | wc -l`;
  - `grep -liE '^#+ .*(before the run|success criteria)' "<notes>"/*.md 2>/dev/null | wc -l`.
- Notebooks are counted, never opened, because their saved outputs can hold data: `find "<notes>" -maxdepth 2 -name '*.ipynb' | wc -l`.
- Whether `<notes>` is inside a git repository, which the full size needs: `git -C "<notes>" rev-parse --is-inside-work-tree 2>/dev/null || echo "not a repository"`.

The menu marks the item **have** when the front door carries the rule and at least one note has a criteria block; **partly** when only one of the two is true; and **not yet** when neither is.

## tdd: Test-driven development

Card: [cards/tdd.md](../cards/tdd.md)

Read-only: folder names, the front matter of skills and agents (their name, description and version), never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/tdd "$U/skills/tdd" 2>/dev/null`. If one exists, its version: `awk '/^---$/{n++; next} n==1' <its SKILL.md> | grep -E 'version:'`. The kit's copy is `1.1.0`; `1.0.0` is an earlier copy.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'test.?driven|test.?first|red.?green' && echo "$f"; done`
- A test-first rule in an instruction file: `grep -inE 'test.?first|failing test|red.?green' CLAUDE.md AGENTS.md 2>/dev/null`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/tdd/SKILL.md`.

The menu marks the item **have** when a `tdd` skill at `1.1.0` is in place, or another test-first skill; **partly** when a `1.0.0` copy or only an instruction-file rule is there; **not yet** otherwise. The plugin marks apply.

## using-agent-skills: A router for your skills

Card: [cards/using-agent-skills.md](../cards/using-agent-skills.md)

Read-only. Names, descriptions and counts.

- How many skills you have: folders under `.claude/skills/` (project) and `~/.claude/skills/` (user, or under `$CLAUDE_CONFIG_DIR` when that is set), counted; and your plugins, by name, from `claude plugin list`, since a plugin can bring skills too.
- A router already: a skill named `using-agent-skills`, or one whose description says it picks among your skills. Names and descriptions only, never a skill's body.
- A list of skills kept in your front door instead, which a router could replace.
- Near-duplicates: two skills with the same name, or nearly the same description, at project and user level.
- A start-up hook already (for question 3): in `.claude/settings.json`, `.claude/settings.local.json` and `~/.claude/settings.json` (or the one under `$CLAUDE_CONFIG_DIR`), the `hooks.SessionStart` entries: how many, their matchers, and the file name each command prints or runs. Only the hooks part is read.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/using-agent-skills/SKILL.md`.

The menu marks the item **have** when a router exists and every skill it names exists, **partly** when a router or a front-door list exists but names missing skills or leaves some out, and **not yet** otherwise. The plugin marks apply.

## using-git-worktrees: using-git-worktrees

Card: [cards/using-git-worktrees.md](../cards/using-git-worktrees.md)

Read-only. Names, descriptions, counts and versions only; no skill body is opened.

- A skill of the same name: `.claude/skills/using-git-worktrees/SKILL.md` in each repository and in your setup, and `~/.claude/skills/using-git-worktrees/SKILL.md` (or the same under `$CLAUDE_CONFIG_DIR` when that is set). Where one exists, read its `name` and `description` only.
- Another skill doing the same job: the front matter of each skill (the lines between the first two `---`), searched for the word "worktree":
  `for f in .claude/skills/*/SKILL.md "$HOME"/.claude/skills/*/SKILL.md; do sed -n '2,/^---/p' "$f" | grep -qi worktree && echo "$f"; done`.
- A declared preference the skill would follow: `grep -ci worktree CLAUDE.md AGENTS.md 2>/dev/null` in your setup and each repository, a count.
- For each repository in `adoption/inventory.md`: the number of worktrees, `git -C <repo> worktree list | wc -l`; and, when a `.worktrees` folder exists, `git -C <repo> check-ignore -q .worktrees && echo ignored || echo "not ignored"`.
- Version: `git --version`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/using-git-worktrees/SKILL.md`.

The menu marks the item **have** when a skill of this name is present, in a project or in your user folder; **partly** when another skill or an instruction-file rule covers worktrees without the full routine; and **not yet** otherwise. The plugin marks apply.

## vault: The memory vault

Card: [cards/vault.md](../cards/vault.md)

Read-only, at the root of your setup folder. Presence and counts only; the vault's entries are not printed.

- Whether the vault exists: `ls memory/vault/MEMORY-VAULT.md 2>/dev/null`.
- How many moves it records (one dated heading each; the template's placeholder heading does not count): `grep -cE '^## [0-9]{4}-[0-9]{2}-[0-9]{2}' memory/vault/MEMORY-VAULT.md`.
- Whether the rule is written where sessions read it: `grep -ci 'vault' AGENTS.md memory/MEMORY.md 2>/dev/null`.
- Whether you already keep another archive file: `ls handoffs/archive.md docs/handoff-archive.md 2>/dev/null`.

The menu marks the item **have** when the vault file exists and the front door or the index names it; **partly** when only one of those is true; and **not yet** when neither is.

## verification-before-completion: Verification before completion

Card: [cards/verification-before-completion.md](../cards/verification-before-completion.md)

Read-only: names and descriptions only. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/verification-before-completion/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/verification-before-completion/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about verifying, evidence, or checking before calling work done. The kit's [claim-auditor](../cards/claim-auditor.md) does a different job (see Watch out).
- A rule in your instruction files: `grep -n -i -E 'verif|evidence|baseline' CLAUDE.md AGENTS.md 2>/dev/null`.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/verification-before-completion/SKILL.md`.

The menu marks the item **have** when a `verification-before-completion` skill exists at either level, **partly** when only an instruction-file rule or another skill covers it, and **not yet** otherwise. The plugin marks apply.

## verify-before-push: One local check before every push

Card: [cards/verify-before-push.md](../cards/verify-before-push.md)

Read-only, for each repository in `adoption/inventory.md`. Manifests and CI workflow files may be read; nothing else is opened, and no test is run. In the adoption's audit (phase 1), they stay closed: what they name comes from the audit script's output.

- A verify script already: `ls <repo>/verify.sh <repo>/tools/verify.sh <repo>/scripts/verify.sh 2>/dev/null`.
- The test and lint commands the repository already names, names only:
  - `package.json` scripts: `node -e 'console.log(Object.keys(require(process.argv[1]).scripts || {}).join(" "))' "<repo>/package.json"`;
  - `pyproject.toml` tool sections: `grep -oE '^\[tool\.[A-Za-z0-9_-]+' <repo>/pyproject.toml`;
  - Makefile targets: `grep -oE '^[A-Za-z0-9_-]+:' <repo>/Makefile`.
- Hosted CI: workflow files counted, `ls <repo>/.github/workflows/*.y*ml 2>/dev/null | wc -l`, and the ones that run on a push, `grep -lE '^on:.*push|^ +push:' <repo>/.github/workflows/*.y*ml 2>/dev/null`. Claude reads their steps: a step that no local command runs is a gap.
- Whether the front door tells Claude to run it: `grep -ci 'verify' AGENTS.md CLAUDE.md 2>/dev/null`.
- The shell the script needs: `bash --version | head -1` (on Windows it comes with Git for Windows). On Windows, also which `bash` a PowerShell window of yours finds. A PowerShell started from Claude's shell inherits Git's folders on its PATH and always finds Git's bash, so Claude sets the PATH a new window gets, the machine's then the user's, inside that one PowerShell process only: `powershell.exe -NoProfile -Command '$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User"); (Get-Command bash -ErrorAction SilentlyContinue).Source'`; where Claude's shell tool is PowerShell, the part inside the single quotes runs there as it is. A path ending in `System32\bash.exe`, in any mix of capitals, is the launcher for the Windows Subsystem for Linux (WSL), not Git's bash: `bash verify.sh` typed in PowerShell runs the script there. Claude says so; the PowerShell form below calls Git's bash by its full path.

The menu marks the item **have** when a script, or an entry in the repository's task runner, runs every test and lint the repository has, and, where Claude pushes for you, the front door says to run it first; **partly** when tests exist but run only in hosted CI or one at a time, or the script misses a step the workflow files run; and **not yet** otherwise.

## worktrees: One worktree per parallel session

Card: [cards/worktrees.md](../cards/worktrees.md)

Read-only. Counts and set / not set only.

- For each repository in `adoption/inventory.md`, how many worktrees it has: `git -C <repo> worktree list | wc -l` (`1` means the main checkout only).
- Whether a worktree folder inside a repository is kept out of git, when one exists: `git -C <repo> check-ignore -q .worktrees && echo ignored || echo "not ignored"`, and the same for `worktrees`.
- Whether your instruction files carry a worktree rule, a count per file: `grep -ci worktree CLAUDE.md AGENTS.md 2>/dev/null` in your setup and in each repository.
- Whether the full routine is there: a skill folder named `using-git-worktrees` in `.claude/skills/` or in `~/.claude/skills/` (or under `$CLAUDE_CONFIG_DIR` when that is set).

The menu marks the item **have** when an instruction file carries a worktree rule and every worktree folder inside a repository is ignored; **partly** when the skill is there but no instruction says when to use it, or when the rule is there but a worktree folder inside a repository is not ignored; and **not yet** otherwise.

## writing-great-skills: Writing your own skills

Card: [cards/writing-great-skills.md](../cards/writing-great-skills.md)

Read-only. Names, descriptions and counts.

- A skill named `writing-great-skills` at project level (`.claude/skills/`) or user level (`~/.claude/skills/`, or under `$CLAUDE_CONFIG_DIR` when that is set).
- Another skill doing the same job: one whose description is about writing, reviewing or improving skills. Names and descriptions only, never a skill's body.
- How many skills you have at each level, counted by folder.
- Whether your front door already holds a checklist for writing skills.
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/writing-great-skills/SKILL.md`.

The menu marks the item **have** when `writing-great-skills` or another skill for writing skills exists, **partly** when only a checklist in your front door or notes does that job, and **not yet** otherwise. The plugin marks apply.

## writing-plans: Writing plans from an approved design

Card: [cards/writing-plans.md](../cards/writing-plans.md)

Read-only: names, descriptions, settings as set or not set, and counts. No skill body is opened, and nothing uses the network.

- A skill of the same name: `test -f .claude/skills/writing-plans/SKILL.md && echo project` in each repository in `adoption/inventory.md`, and `test -f "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/writing-plans/SKILL.md" && echo user`.
- Another skill doing the same job: the front matter only (the lines between the first two `---`) of every `SKILL.md` at both levels, looking for a description about implementation plans or task lists.
- Where plans live today, counts only: `ls docs/plans/*.md plans/*.md 2>/dev/null | wc -l`, and any plan-folder rule in `CLAUDE.md` or `AGENTS.md`.
- The agents its execution menu names: `ls .claude/agents/ "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/agents/" 2>/dev/null`, file names only, looking for `bob-builder.md`, `linus-reviewer.md`, or your own builder and reviewer.
- Whether you sign commits: `git config --get commit.gpgsign` in each repository (`true`, or nothing).
- A skill of the same name from a plugin enabled here: the plugin check, with `<path>` set to `skills/writing-plans/SKILL.md`.

The menu marks the item **have** when a `writing-plans` skill exists at either level, **partly** when another planning skill or an instruction-file rule covers the job, and **not yet** otherwise. The plugin marks apply.
