## Phase 2: Decide

Read now `catalog/INDEX.md` and the `questions:` in the front matter of every `modules/*/README.md`,
and `catalog/features.json` if this session has not read it (they said no to the audit, or the session
resumed here). Read an item's card, `cards/<id>.md`, right before you ask about the item.

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

   Then, once, the `adoption/` folder, unless their setup is claude.ai only (settled before the first
   question). Say what it holds: what the audit found, their data rules, their spec, and which
   protections are installed or still waiting; whoever can read the repository can read it, and a
   push takes it to the remote. Ask: "Keep `adoption/` out of git?" **Keep it out** is recommended
   when the repository is shared, when a data rule took the strictest reading, and when they are not
   sure; **commit it** is recommended only for a repository no one else can read. The spec records the
   answer under "Data rules to respect".
   - **On their explicit "keep it out"**, in a repository: add one line, shown first, to the exclude
     file git keeps for this clone alone, never to a tracked `.gitignore` that colleagues would see.
     `git -C <setup> rev-parse --git-path info/exclude` names the file, relative to `<setup>`; the line
     is `/<prefix>adoption/`, with `<prefix>` from `git -C <setup> rev-parse --show-prefix` (empty at
     the repository's top). Say that another clone needs the same line. This is the one write outside
     `adoption/` before phase 4.
   - **On Not sure**, write nothing: the spec says keep it out, and the line becomes a row of wave 1,
     for their yes there.
   - **With no repository yet**, write nothing now: `setup-workspace` adds `adoption/` to the
     `.gitignore` of the repository it makes.
   - When `git -C <setup> ls-files adoption` prints a name, the folder is already committed: hand
     over `git -C <setup> rm -r --cached adoption` as a step only they run, and say that earlier
     commits still hold it.
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
   partly / partly (a plugin provides one) / not yet / a plugin provides one, and whether it is proposed. Never a bare id, never two items on one line: each
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

Explain tokens as the "Voice and honesty" section of `SKILL.md` says, if you have not yet. Right after
the menu and its size questions: "Your choice loads about N tokens into every
session (an estimate); the heaviest three are A (about n), B (about n) and C (about n)." Give a share of that
room only when `docs/facts.md` states its size. Write the total and the heaviest three into the
header of `adoption/features.md`. Show a total here and in the handover only.

**Skills Claude can tell apart.** Claude picks a skill from the list of names and descriptions it
reads at the start, and that list has room for 1% of the context window, 8,000 characters when
Claude Code cannot work that out (`docs/facts.md`, "Claude Code: measuring context and asking
multiple choice"). Count the skills phase 1 listed at both levels, plus each skill their picks add, a
domain counting its entry and each stub Claude can start. Add up their descriptions, from phase 1's
sizes and the menu's every-session figures, in characters (tokens times 4, the kit's estimator). The
skills inside their plugins and Claude Code's own skills are in the list too, and phase 1 does not
measure them, so the figure is a lower bound: say so. How many characters 1% of their window holds is
an open question (`docs/facts.md`, same section), so use 8,000 as a cautious line. Past it, say once:
"With these, your skills'
descriptions come to at least about N characters. Past the list's room, Claude Code keeps every name
but drops the descriptions of the skills you use least, so those are picked by name alone." Write the
count and the figure into the header of `adoption/features.md`.

Then offer to drop an item, once: the heaviest every-session item, or, past that line, the pick that
adds the most to the list and that their problem needs least. Respect the answer.

### Round 2: tailor the first wave only

First say which ticked items make the first sitting: wave 1, at most about 8, in the plan's order
(`.claude/skills/drill-to-adopt/phases/3-spec-and-plan.md`, its list "Wave 1, in order": read that
file now if this session has not). The rest wait for a later wave and get their questions when that wave starts ("next wave"
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
