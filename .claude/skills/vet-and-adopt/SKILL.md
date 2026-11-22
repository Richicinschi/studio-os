---
name: vet-and-adopt
description: >-
  Use for each item in an adoption plan, and whenever someone wants to take a skill, hook, agent or
  practice from this kit or from any outside source into their own Claude setup. Scans shipped files
  with SkillSpector first, triages the findings, recommends SKIP / FOLD / ADAPT / ADOPT against what
  they already have, applies only what they decide, and records the decision. Trigger on "adopt <item>",
  "next item in the adoption plan", "vet this skill", "is this skill safe", "take this into my setup".
metadata:
  category: adoption
  author: Studio OS kit (generalized from the studio's vet-external-skill and its skill-adoption rule)
  version: 2.1.0
  tooling: SkillSpector (NVIDIA, Apache-2.0), installed as row 1 of the adoption plan
---

# vet-and-adopt

One item at a time: scan, decide, apply, record, check. The scanner is a gate, not a judge. A clean
scan does not mean the item fits, and a noisy scan is often false positives; both need your reading.
The decision is always the adopter's. `drill-to-adopt`'s "Voice and honesty" and "Rules for every
question" hold here in full: one question per message, approvals included; the recommended option
first, then Not sure, and Skip for now where it differs; what a command does, in plain words, before
the command.

## Taking the next row of the plan

With an adoption plan (`adoption/plan.md` in their setup), work from it, wave 1 only in a first
sitting:

1. Take the first row without a tick in its Done column.
2. **When row 1, SkillSpector with the scan-first rule, is not ticked, do it first**, from its card,
   `cards/skillspector.md`: the install lines for their system as `!` commands (uv, then
   SkillSpector) when it is missing; when Detect found it, you run the two checks yourself, since
   they only print: `skillspector --version` prints a version, and a scan of one kit skill, handed
   to the comparer, prints `known: N, moved: 0, reworded: 0, new: 0` and a `report:` line (the card's Check). Nothing else is scanned, so nothing else is adopted, before those two checks pass. The
   rule line may wait for the row that creates the front door; row 1 counts as done for this gate
   once its two checks pass.
3. **"Scan what you already have"**, when the plan has it: say in one line that you are scanning
   their installed items, read-only, then scan each one it lists with SkillSpector from where it is
   installed, and triage as in section 2. Change nothing. Tell them the result in one line per item.
   Record each result in `adoption/decisions.md`. A real finding becomes a question to them, never an
   automatic removal.
4. For every item, open its card, `cards/<id>.md` in the kit. A card question their spec has no
   answer to is asked now, in full, before anything else; a menu tick is not an answer. Then follow
   the Steps in order, each **you:** step handed over (`drill-to-adopt`, "Steps only they can do")
   and each **Claude:** step shown before it runs.
5. **Record the decision as soon as the item is applied or staged** (section 5), with Check
   "pending" and `installed: pending` in the Scan cell, before the scans after Apply; fill the Scan
   cell in when they have run. A SKIP gets its row too, with Check "n/a".
6. Run its Check. **Tick the row only after the check has passed**, and fill in the row's Check
   cell. A failed check leaves the row unticked; say what failed and what to look at next.

Without a plan (an item someone names directly), the steps below still apply in the same order.

## 0. Identify the item

- From the kit: `catalog/skills/<id>/`, `catalog/agents/<id>.md`, a file in `templates/`, or a
  practice from `modules/<nn>/README.md`. Read its card (`cards/<id>.md`), its `SOURCE.md` and its
  module page. A domain is `catalog/packs/<id>/`, with its `SOURCE.md` in that folder and its card
  at `cards/pack-<id>.md`.
- From outside: a folder, a `SKILL.md`, a `.zip` or a git URL; or a plugin, an MCP server or a hook,
  which run inside a session too and are scanned from their source repository the same way.
- Read the tailoring for it in their `adoption/spec.md`, if there is one.

## 1. Scan, when the item ships files

A static scan, no API key, no cost. For a kit item, the scanner prints its report as JSON and the
kit's comparer reads it straight from the pipe and tells the findings the kit has already read from
new ones. Run it from the kit's folder:

```bash
skillspector scan <path> --no-llm --format json | node tools/scan-compare.mjs <item-key> - --root <path>
```

- `<path>` is the item in the kit; give the same path to `--root`. An agent is one file, which the
  scanner copies to a temporary folder of its own: leave `--root` off for an agent.
- `<item-key>` is the item's key in the kit's record of its scans, `tools/export/scans.json`:
  - a skill, `catalog/skills/<id>/`, or one of the kit's own skills, `.claude/skills/<id>/`: `<id>`;
  - an agent, `catalog/agents/<id>.md`: `agent:<id>`;
  - a domain, `catalog/packs/<id>/`: `pack:<id>`.
- On Windows, turn on Python's UTF-8 mode, or the scan can crash on the console's encoding:
  `PYTHONUTF8=1` in front of `skillspector` in Git Bash, or `$env:PYTHONUTF8=1` on its own line
  first in PowerShell (`docs/facts.md`, "Installing SkillSpector"). Never add `--output`: the pinned
  version refuses it on Windows, and the pipe needs no file.
- Show what the comparer prints, exactly as it prints it, and act on those lines. Line 1 counts
  `known: N, moved: K, reworded: R, new: M`; line 2, `report: <recommendation> <score>/100`, is the
  scan's own verdict and score. Then come `moved:` and `reworded:` lines, a recorded finding found
  at another line or on a changed line (normally after Apply, section 4), and `new:` lines, a
  finding the record does not hold. The comparer's exit code: 0, nothing reworded or new; 1, at least
  one `reworded:` or `new:` line, a `moved:` line it could not prove, or a line saying the scanner
  version differs from the kit's record; 2, no comparison was made, and its message says why (no
  report came through the pipe, so read the scanner's error above it; or a key the record does not
  hold). The shell reports the comparer's code for the pipe in PowerShell and in bash as it starts;
  with bash's `set -o pipefail` on, it reports the scanner's instead whenever the comparer exits 0,
  and the scanner exits 1 for DO_NOT_INSTALL, so read the printed lines, not the code alone.
- An outside item has no record, so it is scanned without the comparer:
  `skillspector scan <path-or-git-url> --no-llm --format markdown`, which prints the report.
- When the adopter wants to read a kit item's report too, run the scan a second time with
  `--format markdown` in place of `--format json` and without the pipe; it prints to the terminal.

Keep the paid LLM pass off unless the adopter chooses it. A practice with no files skips the scan.

## 2. Triage

Before the first scan result of a sitting, say once how loud the scanner is: "SkillSpector reads
every file and flags anything that could be misused, so most of its findings are false alarms; the
score says how much it flagged, not how dangerous the item is."

- **A kit item:** the comparer has done the counting; show what it printed. Its known findings were
  already read in the kit's triage (`tools/export/scan-triage.md`, one section per item). The
  kit's own copy must read `moved: 0, reworded: 0, new: 0`.
  - Exit 0, nothing new: the `report:` line is the item's verdict and score, the same as the kit's
    record of its scan (`tools/export/scans.json`), since the findings and the scanner version match.
    `SAFE`: continue. Anything else: tell them the verdict and the score, say that every finding was
    read in the kit's triage, give them its section (the heading that starts with
    `### <item-key>: <verdict>, <score>/100` and ends with the count of findings), and continue only
    when they say yes.
  - Exit 1: a `moved:`, `reworded:` or `new:` line here means the kit's copy does not match the
    kit's record of it: stop, show the lines, and say so. Look for the cause with the adopter: a kit
    folder changed since it was cloned (`git status` in it), or a scanner that is not the pinned one
    (a line saying the version differs; `cards/skillspector.md`, step 2). Until it matches, the item
    can be taken only as an outside one, every finding triaged.
  - Exit 2: nothing was compared; fix what its message names, or else scan the item as an outside
    one and triage every finding.
- **An outside item that scans SAFE:** continue.
- **Anything else:** stop. Show the score and each finding with your reading of it: a real risk, or a
  false positive and why (quote the line). Continue only when the adopter has read them and says so;
  never ask them to wave through a red score unexplained. Prompt injection, data exfiltration, or a
  network call they did not expect is a hard stop.
- Read the files yourself as well. A scanner can miss a real egress. When the studio reviewed an
  outside framework, the scan scored it 100/100 critical on false positives and missed its
  telemetry, which was on by default (`examples/outside-framework-review.md`).

## 3. Compare with what they have

List what in their setup already does this job (from round 1 of the drill, or look). Recommend one
decision, with one line of why:

- **SKIP:** it does not fit their work, or they already have something better.
- **FOLD:** take the idea into something they already have: an existing skill, their instruction
  file, a Project's instructions.
- **ADAPT:** take it, rewritten for their setup (their paths, tools and rules), with the
  studio-specific steps removed. Those steps are marked in the module page and in `SOURCE.md`.
- **ADOPT:** take it as it is.

The adopter decides. Apply nothing before they do.

## 4. Apply

- **Fit, not copy.** Write every adopted text file in the adopter's words, for their tools and scale.
  Never copy a studio sentence, term or path. A module's `(studio-specific: ...)` notes are never
  carried over. A practice defaults to ADAPT. Take the size they chose on the item's card, and
  nothing beyond it. Scripts are the exception, next.
- **Scripts byte for byte.** A script (a file whose first line starts with `#!`, or a name ending
  `.mjs`, `.js`, `.cjs`, `.ts`, `.sh`, `.bash`, `.ps1`, `.psm1`, `.py`, `.cmd` or `.bat`) is copied byte for byte, line endings
  included, with a file copy (`cp`, or `Copy-Item` in PowerShell), never written out again: the scan
  read those bytes. Only when the adopter asks for a change to a script, show the changed lines as
  `-` and `+` lines before saving it.
- **Claude Code:** skills go in `<their repo>/.claude/skills/<id>/` for one project, or
  `~/.claude/skills/<id>/` for every project; agents in `.claude/agents/`; instruction text in their
  `CLAUDE.md` or `AGENTS.md`. Keep the upstream `LICENSE` with any adapted third-party skill.
- **A domain (a pack in `catalog/packs/<id>/`):** scan the whole folder first (step 1), then copy by
  these rules, each file shown before it is saved:
  - the entry `SKILL.md` and the `skills/` folder to `<scope>/skills/<id>/`, kept together, because
    the entry points to the files in `skills/` by relative path;
  - each `stubs/<name>/SKILL.md` to `<scope>/skills/<name>/SKILL.md` (a stub is a one-line skill
    that sends Claude into the pack, for a name a person types or a skill with tool limits);
  - each file in `agents/` to `<scope>/agents/`, only the ones the adopter took on the card.
  Then check it (the card's Check). The pack's own text is the studio's, and its examples are the
  studio's too: read them with the adopter and swap any that name a tool or a path they do not use.
  On claude.ai a pack goes in as a zip built by `node tools/upload-bundle.mjs <id> --out <folder>`:
  the entry and the skills, with no agents.
- **MCP servers:** add one with `claude mcp add` at the narrowest scope that works, local first, and
  pass secrets as environment variables or `${VAR}` references, never as text in a shared `.mcp.json`
  (`docs/facts.md`, "Claude Code: MCP servers"). A sign-in the server needs is handed over as a `!`
  command for them to type.
- **claude.ai:** instruction text goes into a Project's instructions, reference documents into the
  Project's knowledge, skills through the upload described in `docs/facts.md` ("claude.ai: custom
  skills and the built-in document skills").
- Respect the data rules in their spec. Nothing company-internal goes where their rules forbid it,
  such as a personal account or an outside remote.
- Show them the change before you save it.

### Then scan what was installed

After each item is applied, check the copy now on disk too. First record its row (section 5), with
`installed: pending` in the Scan cell, so an applied item is never left without a row. Then run the
two commands below from the kit's folder, in this order, with the Windows prefix from section 1.
`<installed>` is where the item went: `<scope>/skills/<id>/` for a skill or a domain, the `.md` file
for an agent.

1. **What differs from the kit's copy, first:**

   ```bash
   node tools/compare-install.mjs <kit-path> <installed>
   ```

   `<kit-path>` is the path scanned in section 1 (an agent: two files). Show what it prints, as it
   prints it: files in one copy only, files that differ (an adapted `SKILL.md` will), and each script
   as `identical` or `changed`, with the changed lines. Every script reads `identical` but one the
   adopter asked to change. Any other `changed` line, whatever its note (`line endings only`,
   `byte-order mark only` and `not UTF-8` included), is a script that differs from the kit's copy:
   it stops. Show it, and on their yes copy that script again and run this command again. For a
   domain, `stubs/` and `agents/` went elsewhere, so they show under "Only in the kit copy".
2. **The same scan, on the installed copy, compared with the kit's record of the item**, with the
   `<item-key>` from section 1, and the kit's copy given as `--kit`:

   ```bash
   skillspector scan <installed> --no-llm --format json | node tools/scan-compare.mjs <item-key> - --kit <kit-path> --root <installed>
   ```

   Apply rewrote the text files, so the comparer maps each recorded line of the kit's copy to the
   installed copy through the line diff, and sorts what it found:

   - **`moved:`** a recorded finding on a line that is unchanged, only at another number. The text
     is the same, so it is accepted without reading.
   - **`reworded:`** a recorded line that was changed, with a finding of the same rule on a changed
     line in the same place. The comparer prints both lines, `line <n>:` from the installed copy and
     `kit line <n>:` from the kit's. It counts as the same finding only when the installed line asks
     for the same act as the kit's line. When it asks for anything the kit's line did not, or the
     found line is new text, treat it as a `new:` line: stop. Say in one line, for each, which it
     was.
   - **`new:`** anything the record does not explain. It stops for the adopter, exactly as a new
     finding in the kit's copy does.
   - A `no line map for <file>` line names a file that could not be mapped; its findings come out as
     `reworded:` or `new:` and are read the same way. For a domain, `installed copy: ENOENT` is
     expected for the files of `stubs/` and `agents/`, which went elsewhere. A file that uses line
     breaks other than LF and CRLF has no map and no text shown (`not read: line breaks other than
     LF and CRLF`): read the line in the file yourself, and when you cannot tell that it asks for
     the same act as the kit's, treat it as `new:`.

   An agent is one file, scanned without `--root` or `--kit`, so nothing maps it. When it was
   adapted, read every finding's line in the installed file beside the kit's recorded line, `known:`
   ones included, since a match by line number alone proves nothing in a rewritten file; each by the
   same rule as a `reworded:` line. The comparer only counts `known:` findings: the recorded lines
   are in `tools/export/scans.json` under `agent:<id>`, and the found ones in a `--format markdown`
   scan of the installed file. An agent copied as it is needs no reading: its findings are
   `known:`. An outside item has no record: scan the installed copy with `--format markdown`, and
   stop on anything the first scan did not show.
3. **MCP servers and claude.ai uploads** are not scanned again: a `claude mcp add` writes no folder,
   and an upload leaves none on disk to read. Their row says so (section 5).

**A stop after the install** ends one of two ways, and the adopter chooses: keep the item, with the
reason written in the row's Why cell, or take it out with the card's Undo, and the row's Decision
says it was undone. The item is on disk until then, so ask before anything else.

The scanner does not see every change: a script edited after the scan can scan the same, which is
why the comparison runs too.

## 5. Record

Append one row to their `adoption/decisions.md` (format in `templates/adoption/decisions.md`) as soon
as the item is applied or staged, before its check: date, kit version (the top section of
`CHANGELOG.md`), item, decision, where it went, why, the scan result, Check "pending", and the undo
(the card's Undo, written for their setup). When the check has run, replace "pending" with its
result and the line that showed it. One row per item, a folded item included.

The Scan cell holds both scans and the script comparison:
`kit: <verdict> <score>/100 · installed: <verdict> <score>/100 · scripts identical`, or
`· changed: <names>` with each changed script's path, or `· no scripts`. Each verdict and score is
the comparer's `report:` line for that copy: the kit's from section 1, the installed one's from the
scan after Apply. An outside item has no comparer: take them from its markdown report's "Risk
Assessment" table. The other forms:

- **Applied or staged, scans after Apply not run yet:** `kit: <verdict> <score>/100 · installed: pending`.
- **A comparer that exited 2** printed no `report:` line: the item was scanned as an outside one
  (section 2), so write that report's verdict and score, then `(not compared: <its reason, in a few
  words>)`.
- **SKIP:** `kit: <verdict> <score>/100 · installed: n/a: not installed`, or `kit: n/a: not scanned`
  when it was skipped before the scan.
- **FOLD:** `kit: <verdict> <score>/100 · installed: n/a: folded into <file>`.
- **An MCP server or a claude.ai upload:** `kit: <verdict> <score>/100 · installed: n/a: nothing installed on disk`.
- **A practice or any item with no files:** `n/a: no files`.

## 6. Outside items

The same steps apply to a skill from anywhere. Name its upstream and its licence in the decisions row,
and keep its licence file with any copy.
