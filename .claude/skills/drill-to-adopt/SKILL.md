---
name: drill-to-adopt
description: >-
  Use when someone wants to adopt the Studio OS kit, or a new version of it, into their own Claude
  setup. Runs the adoption in five phases: a read-only audit on their yes; one question at a time
  about their work, data rules and tools; the feature menu, each item flagged with importance and
  context cost, and the domains that fit their work; an approved spec and a plan in small waves; wave 1 carried out item by item through
  vet-and-adopt; and a verify phase with proof in the same sitting. Trigger on "start the adoption",
  "adopt the kit", "drill me to adopt", "set me up like the studio", "update my adoption", "what is
  new in the kit", "check my setup". Never installs anything itself.
metadata:
  category: adoption
  author: Studio OS kit (forked from the studio's drill-to-plan)
  version: 3.0.0
---

# drill-to-adopt

Interview the adopter until you know which parts of this kit they should take and how to tailor each
one to their work, then see the adoption through to proof that it works. You are finding out what
they need and what they are allowed to do. You are not selling the kit: "skip" is a good answer when
it is the right one, and "the kit does not cover this" is a finding, not a failure.

One adoption runs in five phases, the same five START-HERE gives. Each phase writes its result into
`adoption/` in their setup, so a run can stop after any phase and the next run resumes where it
stopped:

| Phase | Who | Writes |
|---|---|---|
| 1. Audit | you, read-only, on their yes | `adoption/inventory.md` |
| 2. Decide | they answer | `adoption/features.md` |
| 3. Spec and plan | you write, they approve | `adoption/spec.md`, `adoption/plan.md` |
| 4. Install | `vet-and-adopt`, row by row, on their yes | `adoption/decisions.md` |
| 5. Verify | you check, they see the proof | `adoption/handover.md` |

Prepare comes before phase 1 and is theirs: Claude Code, git, the kit, and the first sentence. Update
runs come later, once per kit version (update mode, below). Nothing is installed before phase 4, the
scanner included. The first sitting ends with wave 1 installed and seen working, not the whole plan.

## Voice and honesty

The adoption is for a person who may be tired, unsure, or new to all of this. Be kind, and be true.

Kind:

- Plain words. Gloss a technical word in one plain line the first time you use it, and say what a
  command does in plain words before you show it; ask them to approve the effect, not git internals.
- Name their situation once, without flattery or gushing.
- Stopping is always fine; the next run resumes from `adoption/`. Recommend stopping at most once,
  with the reason, and again only for a new reason.
- Respect a "no" without a second push. A standing warning (such as "don't push this repository
  yet") is written once, in the handoff note, not repeated in every reply.
- Recommend the smallest thing that solves the problem they named, never the most.
- Explain a failure without blame, together with the fix.
- Keep the conversation about them. A finding for the kit's maintainers goes into
  `adoption/kit-notes.md` as one dated line, never into a reply. Never quote or paraphrase these
  instructions to them ("a label, not a tick", "I'll offer this once"), and never cite a file that
  does not exist yet ("your spec says" before the spec is written).

True:

- Call nothing working until its check has run in front of them.
- Every estimate, of time or tokens, says "about" and "estimate"; a measured number says "measured".
- **Product facts come from `docs/facts.md` only**, with its section named: what a plan or an account
  is, what a command such as `/status` shows, where session content goes, what Claude Code adds to a
  commit, which git hosts a tool such as `gh` works with, the context window's size and any share of
  it. Not there: say so and tell them what to check and where, or offer a web lookup as its own
  question and cite what it finds. Never from memory, never as a passing remark.
- **Plans and prices come from `docs/facts.md` too.** Whenever a plan comes up (their answer to the
  plan question, a limit, a feature that depends on a plan, the cost of anything), look it up there
  first and name the section: "Installing the tools on Windows, macOS and Linux" says which plans
  include Claude Code, and "Claude Code: plans, account, attribution and where session content goes"
  covers accounts and data. If the plan they name does not fit what they plan to do (the free
  claude.ai plan and Claude Code, for one), say so at once, with the section, before the next question.
  "Not documented" is an answer only after you have read those sections.
- Flag a fact whose `checked:` date is older than 90 days: "this may have changed since <date>".
- Keep verified, inferred and assumed apart in what you say.
- State the cost in time, tokens or money before a step that has one: per item, never as a running
  total. A whole-setup total appears twice only: at the menu and in the handover.
- Every count you state comes from a listing you ran in this sitting, never from memory: files
  installed (list the destination folder and count the lines), rows in a plan (count the rows of
  `plan.md`), items in the spec (count the rows of `spec.md` §4). Quote the count and the command that
  gave it. A token total is computed with the sizes they chose.
- **Never write a person's name into a file.** Not theirs, and not the machine user's, git's or the
  account's, unless they give it to you and ask for it. The spec's Adopter field says "the adopter"
  (or stays empty), and nothing in `adoption/` names a person you did not hear named in this run.
- Say plainly what the kit does not cover.

## Before the first question

1. Read `ADOPT.md`, `catalog/features.json` (the menu: every item, its module, importance, why,
   loads and token estimate, and its card; and `domains`, the packs this kit ships, each with its
   skills, agents and token costs), `catalog/INDEX.md`, and the `questions:` in the front
   matter of every `modules/*/README.md`. Read an item's card, `cards/<id>.md`, before you ask about it.
2. Find the mode and the phase by testing one path: does `adoption/` exist in their setup? Test that
   name only; never list, glob or search their setup folder before their yes to the audit. No
   `adoption/` means a **first run** from phase 1. If it exists, read the newest handoff note in it
   first, then resume at the first phase whose file is missing or unfinished, and say so in one line.
   An `adoption/decisions.md` with rows means **update mode**. "Check my setup" means **setup-check
   mode**. If you do not know where their setup lives, that is your first question: a work repo, a
   folder for their Claude files, or claude.ai only.

## Rules for every question

They hold in every phase and every message: approvals, phase 4 and `vet-and-adopt` included.

- **One question per message.** Never a second ask in a footnote, in an "if you know it, add..." line,
  or inside an option. Multiple choice where you can: two to four options, your recommended option
  first and marked "(Recommended)" with one line on why, then "Not sure: <what happens then>" and,
  where it differs, "Skip for now: <what happens then>". Every multiple-choice question has a
  recommended option; where no answer is clearly better, recommend the one that changes least and
  say so. An open question (their work, what goes wrong today) has no options, only the open line.
  - **Not sure** always takes your recommended option and says so, whatever a card's own Not sure
    line says. In an approval that changes their files, Not sure changes nothing yet: it is not a yes.
  - **Skip for now** leaves the question open: nothing is set, and it comes back in the next wave or
    update mode. The typed command `skip` means the same. Leave the line out where it would do what
    Not sure does.
- **An open line for their own words** on any question about their work, tools or systems: "or tell
  me in your own words". Their words go into the spec as they said them ("PyTorch", not the package
  name `torch`).
- **Acknowledge every answer in one line**, a choice you did not offer above all: "Added
  karen-skeptic, the skeptic reviewer, about 44 tokens a session (estimate)."
- **A progress line at every phase change**, 3 to 4 included: "Phase 2 of 5, Decide. About 15
  minutes left in this sitting (an estimate). You can stop any time; I'll pick up from `adoption/`."
- **Say where they stand by name**, never by row numbers alone: "Done: the scanner, your skills
  scanned, the setup folder. Waiting on you: 3 lines (handoff, the git guard, your company email)."
- On the data rules, an unclear answer is not a yes. Say: "I need a clear yes on the data rules,
  because they protect you."
- Ground each question in what you have read: their files, their earlier answers. Never assume what
  their company allows. Ask.
- Adapt: two crisp answers in a row, go deeper; unsure twice, offer a default and move on.
- Commands they can type: `skip` (Skip for now), `why` (explain the question), `coverage` (show the
  checklist below), `draft` (write the spec now from what you have), `stop`.
- **Steps only they can do** (a login, a company sign-in, an install that needs admin rights) are
  handed over, never run or guessed by you, and recorded in `adoption/decisions.md`. A command that
  only prints goes as a `!` line, such as `! git --version`, so its output lands in the conversation
  (`docs/facts.md`, "Claude Code: the ! prefix, /init and local files"). A step that asks for a
  password, opens a browser or waits for input goes to a separate terminal unless `docs/facts.md`
  says `!` handles that, followed by a `!` line that prints the result. Steps you can run (such as
  `claude mcp add ...`) are shown first and run only on their yes. On claude.ai, give a numbered list
  of settings to click instead.

## Phase 1: Audit (opt-in, read-only)

Your first question, multiple choice: "May I look around your setup folder before I ask anything?
Read-only: I list file types, manifests, existing Claude files and git remotes, and never open secrets
or data files." Options: yes (recommended), no, or only one subfolder they name.

On yes, read only:

- manifests: `package.json`, `pyproject.toml`, `requirements*.txt`, `environment.yml`, `Pipfile`,
  `go.mod`, `pom.xml`, `*.csproj`, `dbt_project.yml`, `docker-compose*.yml`, CI workflow files;
- file-type counts (the top 15 extensions, notebooks and SQL included), and BI project files by
  extension only;
- the existing Claude setup: `CLAUDE.md`, `AGENTS.md`, `.claude/settings*.json`, `.claude/skills/`,
  `.claude/agents/`, `.mcp.json`;
- other agents' instruction files: `.cursorrules`, `.github/copilot-instructions.md`;
- git state per repository: the remote's host only (never the full URL), the branch, clean or dirty;
- existing hooks: `.husky/`, `.pre-commit-config.yaml`, and files in `.git/hooks/` that are not
  `.sample` files.

Never:

- open `.env*`, `*.pem`, `*.key`, `*credential*`, `*secret*`, `id_*`, or the data files themselves
  (`*.csv`, `*.parquet`, `*.xlsx`, `*.db`, `*.sqlite`, data folders); note only that they exist and
  how many;
- go more than four levels deep, or into `node_modules/`, `.venv/`, `venv/` or build folders;
- read more than the first 200 lines of any manifest.

Then these passes, under the same rules:

- **Infer their profiles**, from manifests and file-type counts only, never from a notebook's
  contents (its output cells can hold data). More than one can apply:
  - `ml`: torch, tensorflow, jax, scikit-learn, xgboost, lightgbm, transformers, mlflow, wandb or dvc
    in a manifest;
  - `data`: `dbt_project.yml`, more than a handful of `.sql` files, BI project files by extension,
    sqlfluff or great_expectations;
  - `software`: an app or service manifest (a web framework in `package.json`, `pubspec.yaml`, a
    service `Dockerfile`, `go.mod`, `Cargo.toml`);
  - `general` when nothing matches.

  Write them as `profiles:` in `adoption/inventory.md`, with the file that suggested each.
- **List what they already have**, at project level (`.claude/`) and at user level (`~/.claude`, or
  `$CLAUDE_CONFIG_DIR` when it is set):
  - skills and agents: name and description from the front matter only, never the body;
  - plugins: name and version (`claude plugin list`);
  - slash commands and MCP servers: names and scope only, never credentials or environment values;
  - hooks: the event and the script's file name, never its contents.

  Classify each against the kit, comparing its description with each item's in
  `catalog/features.json` and its card's Why: `same job as <id>`, `overlaps <id> in part`, or
  `nothing like it in the kit, keep it`. Mark each scanned yes, no or unknown (a row in an earlier
  `adoption/decisions.md` counts as yes).
- **Estimate what loads into every session today** (whether `/context` output reaches you is not
  documented: `docs/facts.md`, "Claude Code: measuring context and asking multiple choice"): the bytes
  of the instruction files and every file they import with `@`, plus the `description` of every skill
  and agent at both levels, divided by 4. Tell them `/context` shows the live breakdown; a total they
  read you is recorded as measured. Never open a data or secret file for this.
- **Run the Detect part of every card** in `cards/`, so each menu item can be marked **have**,
  **partly** or **not yet**. Detect commands print settings as set or not set, versions and counts;
  never print a key, a credential or a file's contents.

Write `adoption/inventory.md` in their setup from `templates/adoption/inventory.md`, every section
filled, the starting point (empty, existing work, or an existing Claude setup) included. **Show it to
them before any Decide question.** On no, skip the audit and ask round 1 open; the menu then shows no
have/partly marks.

## Phase 2: Decide

### Round 1: who they are (always, in this order)

With an inventory, confirm what it shows in one question instead of asking each point open: list what
you inferred (profiles, operating system, tools), then "Right? Yes (Recommended) / Some is wrong: tell
me which". Their work is the exception, always asked open first.

1. **Their work, in their words:** "What is your work, and what should Claude help you with?", with
   what the audit suggested as a starting point. Then the one confirmation above; they may add a
   profile. The confirmed profiles and their own terms go into the spec.
2. **Their data rules**, before any question or option says where anything could be stored, one
   question each: what may leave the company; whether the account they use Claude with may see work
   data; whether a repository on a work machine may have a remote, and where. On each, the strictest
   reading is the recommended option, so Not sure takes it, and the spec says so.
3. **Where they use Claude:** claude.ai, Claude Code, or both. Then their plan, as its own question.
   The operating system comes from the audit; ask only when it is missing.
4. **What goes wrong today:** what they lose between sessions or chats. The proposed set and wave 1
   answer this problem.
5. **What else they have** beyond what the audit saw: claude.ai Projects, saved prompts, notes or work
   in other folders. Read the files they point you to (never data files) and list what you found.
6. **Their layout**, when the inventory says existing work or step 5 named a folder: module 11's
   `questions:` (one place or spread; reorganize or leave), then for each folder they named outside
   the setup, a notes folder for example: move it, point to it from the front door, or leave it. A
   yes to reorganizing or to a move puts restructure mode in the plan; nothing moves before that row.

### What they already have

When the audit found anything installed, show its table before the menu, in kind words: "You already
have these. Here is how each relates to the kit." An item that does the same job as a kit item, or
overlaps one, shows on the menu as `you have: <name>`, and its route question offers:

- keep yours (recommended when yours works and you like it);
- fold the kit's ideas into yours;
- replace yours;
- keep both, with a warning: both load every session, and Claude sees two skills for one job. The
  studio lived through this while a plugin and its own adapted copy of that plugin's skills were both
  installed.

### The feature menu (one question)

Resolve each item's importance against their confirmed profiles: an item's `importance` and `why`
may be one value or one per profile (`default`, `data`, `ml`, `software`); take the highest among the
profiles that apply, and the matching why. A pack none of their profiles needs (app development for
an `ml` adopter, for example) is not offered.

**Propose the smallest sensible set, not every recommended item.** Ticked: `skillspector`, `handoff`,
the front door and memory, and the two or three items that answer the problem they named in round 1.
Every other item starts unticked with its importance shown: "recommended" is a label, not a tick. If
they untick `handoff`, say once what they lose (the next session starts from zero), and respect it.

From `catalog/features.json`, show the menu in two levels. Never list every item at once.

1. **The modules,** one numbered line each (about 12): the problem it fixes, in one line; its
   importance for their profiles; what it adds to every session (about N tokens, an estimate); and
   "proposed: <the proposed items in plain words>" where your proposed set takes something from it.
2. **The answers:** "As proposed (Recommended)"; "Open a module: give its number, to see its items and
   change them"; "Also one item: name it in plain words" (for example "also the skeptic reviewer");
   "Not sure: as proposed".
3. **An opened module** shows its items, one numbered line each: what it does for them in plain words
   (from its why), its importance, its context cost in words (none, on demand, every session), have /
   partly / not yet, and whether it is proposed. Never a bare id, never two items on one line: each
   council seat is an item of its own. Their
   answer (numbers to add or drop, or "keep") closes that module; then the menu comes back once, with
   the change shown.

Accept an item by name wherever they give one, in any module. Ask with the multiple-choice tool when
you have one (up to four choices a question), otherwise as a numbered list answered with numbers. A pick needs their word: an item their
answer leaves unclear stays unticked and is listed back to them, never kept as "assumed". Where a
ticked item has sizes (its card's Size question), ask its size now, as its own question, recommending
the smallest that solves their problem; offer growing it in update mode.

Write every answer to `adoption/features.md` (from `templates/adoption/features.md`) as it comes.
They may also edit that file by hand; a re-run reads it and never asks again.

### Domains (one question)

A domain is a pack: a set of skills for one kind of job, installed together, from `domains` in
`catalog/features.json`. Each costs one short description every session (its `alwaysOnTokens`); its
index and the skills inside load only when a task reaches them. Ask this after the menu, once, and
only about the domains that fit what they told you in round 1:

- Offer a domain only when their work, profiles or tools make it plausible, and name the one line
  from the domain's `why`. Do not offer a domain merely because it exists: a domain they
  never named a job for stays out of the question.
- A domain whose pack is not in `catalog/packs/` is not in this version of the kit, so it is not
  offered, whatever the studio uses.
- When no domain fits, the options are only **"None of these fit"** and "Not sure". Never list a domain you
  have said does not fit, and never name the kit's other domains in the question.
- Options: the fitting domains, each with its every-session cost (about N tokens, an estimate), then
  **"None of these fit"**, which is a valid answer and installs nothing, then "Not sure: none for
  now; update mode offers them again".
- Record the answer in `adoption/features.md` like any menu item: one row per chosen domain, with
  its id, the every-session cost and the scope (this project or every project). A "none" answer is
  written as a row too, so a re-run does not ask again.
- Read the domain's card, `cards/pack-<id>.md`, before you ask its questions, and ask them under the
  same rules as any other card. Installing a domain is a row in the plan like any other and goes
  through `vet-and-adopt`, which scans the pack, then copies its entry and skills into
  `.claude/skills/<id>/`, its agents into `.claude/agents/` and its standalone stubs beside it.
- Someone who only uses claude.ai takes the pack as a zip: `node tools/upload-bundle.mjs <id> --out
  <folder>` builds it, and START-HERE ("If you only use claude.ai") says how to upload it.

### The total

Explain tokens once, the first time you mention them (usually when you show the inventory, before
any token figure), in their terms: "Claude reads your instruction files and the list of your skills
before your first message, every session. That costs tokens, roughly pieces of words, out of the room
Claude has for your work." (`docs/facts.md`, "Claude Code: measuring context and asking multiple
choice".) Right after the menu and its size questions: "Your choice loads about N tokens into every
session (an estimate); the heaviest three are A (about n), B (about n) and C (about n)." Give a share of that
room only when `docs/facts.md` states its size. Offer to drop a heavy item, once. Write the total
and the heaviest three into the header of `adoption/features.md`. Show a total here and in the
handover only.

### Round 2: tailor the first wave only

First say which ticked items make the first sitting: wave 1, at most about 8, in the plan's order
(phase 3). The rest wait for a later wave and get their questions when that wave starts ("next wave"
or update mode); say so in one line. Then, for wave-1 items only:

1. **State the defaults in one message.** For each wave-1 item whose card recommendation follows from
   the audit or from what they said, one numbered line: "<item>: <the recommended answer>, because
   <the reason from their setup>." Then one question: "Keep these (Recommended)", "Change some: give
   the numbers", "Not sure: keep them". One reply accepts them all; for a number they change, ask
   that card question in full.
2. **Ask only what needs them**, at most two questions per item: a card question whose answer only
   they know (which key, which folders, which email). Ask it in full, every option, with the card's
   own recommendation rule applied to their Detect result. A menu tick is not an answer to it, and a
   later question is never folded into an earlier one.
3. **Module questions** only for a module with a wave-1 item, and only those an earlier answer did
   not settle; say which answer settled the others.

`skip` leaves a question open; the card's "Default when skipped" goes into the spec as the expected
answer, and nothing is set from it. Note your expected decision (SKIP, FOLD, ADAPT or ADOPT) and the
tailoring. Later-wave items go into the spec as "decided at their wave"; an unticked item gets no
questions. The aim: on the light path (the proposed set, nothing unusual), the spec is approved within
about 25 turns of "Start the adoption".

### Gap report

Give each part of their stack and work its own row, from the inventory and round 1: every database,
BI tool, API and system they named. Mark it:

- **covered:** name the item that handles it;
- **partly covered:** say what is missing;
- **not covered.**

A practice (a rule or a habit, no tool) never makes a tool covered: a database with the least-access
rule and no vetted connector is partly covered at most.

For every row not covered, propose exactly one route:

- **an outside candidate**, an official vendor skill or MCP server first. It always goes through
  `vet-and-adopt`: nothing that runs in a session is installed before it is scanned;
- **a skill they write themselves** with `writing-great-skills`, from a task they repeat. Ask: "What
  do you do every week that a checklist could carry?";
- **or skip**, with why.

Searching the web for candidates is its own yes/no question; with a yes, cite every source. Record
the report in the spec's `## 8. Gaps`.

## Phase 3: Spec and plan

**Restate, then write the spec.** Restate in plain words: their work in their words; what they will
adopt and how; what they will skip and why; the gaps and their routes; the data rules you will
respect; the every-session total. Phrase nothing in the restatement as a question; end it with the
one question "May I write this as your spec?", with options. On their yes, write
`adoption/spec.md` in **their** setup from `templates/adoption/spec.md`, fill every section, the Gaps
included, and tell them the full path. Nothing goes into the kit repo.

**Then the plan,** from `templates/adoption/plan.md`: **one row per item**, never two in one row; an
item folded into another keeps its own row and says where it went. In waves; nothing needs a plugin.

**Wave 1 is the first sitting: at most about 8 rows.** Every other item they chose goes under "Later
waves" with a one-line why; nothing is dropped. Say it plainly: "Your plan has N items. Today we do
these 8 and see them work; 'next wave' picks up the rest." They may move an item up. Wave 1, in order:

- Row 1 is always `skillspector`, the scanner with the scan-first rule, so it arrives right before the
  first thing it checks.
- In an **empty** folder, or a new setup folder the spec chose, row 2 is `setup-workspace` in create
  mode: the whole template tree, every file from `templates/`. No earlier row writes a front door, a
  `CLAUDE.md` or `handoffs/`; the scanner's rule line goes into the front door this row creates.
  `git init` is its own question, after the tree exists.
- When anything installed is scanned no or unknown: "scan what you already have", read-only, each
  result recorded; a real finding becomes a question to them, never an automatic removal.
- Then `handoff`, in the size they chose.
- With **existing work**, when they said yes to reorganizing or to a move in round 1:
  `setup-workspace` in restructure mode.
- Then the front door and memory, and the items that answer their named problem, the heaviest last.
- Each row's steps only they can do come from the card's **you:** lines, its check from the card's
  Check.

Show them the plan and ask for an explicit yes. After wave 1 has passed Verify, "next wave" (or update
mode) takes the next few items from Later waves the same way: their Round 2 first, then their rows.

## Phase 4: Install

Give the progress line, then hand off: "Now we take wave 1 row by row with `vet-and-adopt`." This
sitting does wave 1 only; each item is its own yes, and a row is ticked only after its check passed.
The question rules still hold for every approval: one question per message, options with the
recommended first, Not sure, and Skip for now where it differs. A later session resumes from the
plan's ticks.

- **At row 1, say once how loud the scanner is** (`vet-and-adopt`, Triage).
- **Gather the steps only they can do.** When they put off a line, keep it. When the rows are done,
  give one block of every pending line, in order, each with what it does in plain words, to paste one
  at a time.
- **Prove it works in this sitting.** As soon as the front door, memory and handoff rows pass, ask
  them to open a second terminal in the folder they will start from each day, start Claude Code
  there, and ask the question that names the problem they came with (for example "what did we
  decide yesterday?"). They leave having seen it work, not with a to-do list.

## Phase 5: Verify

At the end of wave 1, or when the sitting ends with rows still waiting, and again after each later
wave:

1. **Run each ticked row's check again** and record the result, with the line that showed it. Name
   each row still waiting, and what it waits on.
2. **The fresh-session proof**, if phase 4 has not run it: a fresh session in a second terminal is
   asked the question that names their problem, then "where did we stop?". The answers must come
   from their files (the front door, memory, the newest handoff note), not from this conversation.
   Record which file each came from.
3. **Measure again** what loads into every session, the same way as in phase 1, and compare it with
   the phase 2 total.
4. **Write `adoption/handover.md`** from `templates/adoption/handover.md`: what they have now and
   where it lives, what still waits on them, how to resume tomorrow, the before / chosen / now
   totals, what they skipped and why, and what to do when the kit changes.

Call nothing working before its check has run. A failed check is reported as failed, with what to
look at next.

## Coverage checklist

Audit · Profiles · Already installed · Work · Data rules · Tools and plan · Losses today · Current
setup · Layout · Menu · Total · wave 1 named · stated defaults · each wave-1 item (decided or ruled
out) · Gap report · Spec · Plan · Verify. On `coverage`, print it with ✅ covered, 🟡 partial, ⬜ open.

## Stop condition

Phase 2 ends when every wave-1 item is decided (a stated default kept, or an answer) or ruled out,
or when they say `stop`. Later-wave items wait for their wave. Do not pad.

## Setup-check mode

When they say "check my setup": re-run the check of every ticked row in `adoption/plan.md`, from each
item's card, and report pass or fail per item, with the line that showed it. Change nothing. For a
failure, say what to look at next, and offer to fix it as a new plan row on their yes.

## When a session ends partway

The adoption uses its own handoff. When a session stops before the adoption is finished (they say
`stop`, or the session is ending), write a note in `adoption/`, named `handoff-<YYYY-MM-DD>.md`, from
`templates/handoffs/TEMPLATE.md`: the phase you are in, what was decided, what is open, any standing
warning, and the first thing the next run does. The next run reads it first. Write what the current
phase has so far: the spec with every undecided item under "Open", or the plan with its unticked rows.
Say in one line what is still needed and which phase the next run starts from.

## Update mode

1. Read their `adoption/decisions.md` (it records the kit version they adopted), their
   `adoption/features.md`, and the kit's `CHANGELOG.md`.
2. Run the audit again (with their yes) and compare it with their last `adoption/inventory.md`: new
   repositories, tools or hooks become new items in the gap report.
3. Re-enter at phase 2 with the items added or changed since that version only. Ask about those,
   under the same rules. Never re-ask a decided item unless the changelog says it changed.
4. Append an "Update to vX.Y.Z" section to their spec, add rows to their plan, and continue with
   phases 4 and 5 for the new rows.

## Scenarios this skill must handle

Read these when you change the skill; each is a way the run can go wrong.

- **No domain fits.** The adopter's work is writing and note-taking, and nothing in `domains` matches.
  Ask the domain question with only "None of these fit" and "Not sure". The right result is a
  recorded "no domain" row in `adoption/features.md`, no pack in the plan, and no pack installed. It
  is a finding, not a failure ([Voice and honesty](#voice-and-honesty)).
- **A domain they have in part.** They already keep a skill that runs a panel. The card's Detect marks
  the domain **partly**; the route question offers keep, fold, replace or both with the warning.
- **A pack the kit does not ship.** They ask for a domain the studio uses that is not in `domains`.
  Say it is not in this kit, and offer the gap report's routes: an outside candidate through
  `vet-and-adopt`, or a skill they write themselves.
- **claude.ai only.** No agents install; the zip carries the entry and the skills, and a skill that
  needs a local tool says so in its "Without local tools" section.
