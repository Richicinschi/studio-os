---
id: setup-check
module: 03-planning
checked: 2026-11-02
other_figures:
  - 29
---

# Check my setup

## Why

- **The problem:** adopted items drift. A hook is switched off, a tool is uninstalled or drops off the PATH, a settings file stops parsing, a new machine is missing half the setup. Nothing announces it: the parts fail quietly, and a quiet check reads like a pass.
- **The reason:** your adoption plan already holds a check for every item, the one in the item's card that passed when its row was ticked. Saying "check my setup" makes `drill-to-adopt` run every ticked row's check again and report pass or fail per item, with the line that showed it. It changes nothing; a failure turns into an offer of a new plan row, on your yes.
- **The cost of skipping it:** drift is found when a mistake finds it. The studio's lesson about checks is that a green signal can be wrong: a run passed every check while its output would have deleted about 190 pages ([module 03, Evidence](../modules/03-planning/README.md#evidence)). A check run again against the setup as it is today is evidence; the memory of a pass months ago is not.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). "My setup works" stays a claim until each check has run again.

## Detect

Read-only, in your setup folder and in the kit folder.

- Whether you have a plan, and how many rows are ticked: `ls adoption/plan.md` and `grep -c '\[x\]' adoption/plan.md`.
- Whether your copy of the kit has the mode: `grep -c 'Setup-check mode' <kit>/.claude/skills/drill-to-adopt/SKILL.md` prints `1`.
- The kit version you have, the first `## ` heading of `<kit>/CHANGELOG.md`, and the version your adoption was made with, the Kit version column of the newest row in `adoption/decisions.md`.

The menu marks the item **have** when a plan with ticked rows exists and your kit copy has the mode; **partly** when there is a plan but the kit copy is older than the mode, or no row is ticked yet; and **not yet** when there is no plan.

## Ask

1. **"When will you run it?"**
   - On demand: after a new machine or a reinstall, after each kit update, and whenever something you adopted seems to have stopped working. Nothing loads every session. Recommended when Detect finds a plan with ticked rows.
   - On demand, plus one line in your front door so Claude offers it after a new machine, a reinstall or a kit update. About 29 tokens every session (estimate). Recommended when you move between machines.
   - No.
   - Not sure: the option recommended above: on demand plus the front-door line when you move between machines; on demand only, with nothing written, otherwise.
   - Default when skipped: on demand only.

   The same for every profile.

## Needs

- Claude Code, and the kit folder at a version whose `drill-to-adopt` has setup-check mode. An older copy is updated with `git pull` in the kit's folder.
- `adoption/plan.md` with ticked rows.
- What each row's check needs: the tools in that item's Needs part, such as Node.js, git or SkillSpector. A tool missing today is itself a finding.

## Steps

1. **Claude:** runs `vet-and-adopt` for this item. Nothing ships but this card: the mode is part of `drill-to-adopt`, which you already use, so there is nothing to scan. Claude compares the card with what Detect found.
2. **you:** when Detect says your kit copy is older than the mode, update it: `! git -C <kit> pull`.
3. **you:** in a terminal, start Claude Code in the kit folder with your setup added, the way you started the adoption (START-HERE, "Your first session"): `claude --add-dir "<your setup>"`. This starts Claude Code itself, so it goes in a terminal, not after `!` inside a session.
4. **you:** say "check my setup".
5. **Claude:** reads `adoption/plan.md`. For each ticked row it opens that item's card in the kit and runs its Check part, then reports one line per item: **pass**, **fail**, or **needs you** for a check only you can do (the first answer in a new session, a push to your server), each with the line that showed it. It changes nothing in your setup. For a failure it says what to look at next and offers a new plan row to fix it, on your yes.
6. **Claude:** with the reminder chosen, adds one line to your front door and shows the change first:

   ```markdown
   - After a new machine, a reinstall or a kit update, offer to run "check my setup" from the kit before other work.
   ```

   It is 114 bytes, about 29 tokens every session (estimate).
7. **Claude:** records the decision, the reminder (yes or no) and the undo in `adoption/decisions.md`.

## Check

1. **you:** say "check my setup". Expected: one line per ticked row of `adoption/plan.md`, each **pass**, **fail** or **needs you**, with the line that showed it; the number of lines equals what `grep -c '\[x\]' adoption/plan.md` prints. Where your setup is a git repository, `git -C "<your setup>" status --short` prints the same before and after the run.
2. **you:** show that it can fail. Switch one adopted item off for a minute yourself, for example by renaming a hook script that a settings entry runs, and say "check my setup" again. Expected: that row reads **fail** and names the missing file. Rename it back and run once more: **pass**.

A row reported as pass without its check having run, a ticked row missing from the report, or a row that stays pass in step 2, means the item is not done: the plan row stays unticked.

## Undo

- **Claude:** removes the front-door line, if you chose it, with the diff shown, and marks the row in `adoption/decisions.md` as undone.
- Nothing else: the mode is part of the kit and runs only when you ask for it.

## Watch out

- **Silence is not a pass.** A check that cannot run, because a tool is missing or a file it reads is gone, is reported as fail with the reason, never as pass. For the same reason, a start-of-session hook that should speak and prints nothing counts as a failure.
- **Registered means found, not mentioned.** A hook entry whose script file is gone, or a settings file that no longer parses, runs nothing while it still looks set. The checks look at the file an entry names, not only at the entry.
- **"Not on the PATH" is not "not installed".** A tool installed a moment ago may reach only new terminals. When a check says a command is not found, open a new terminal and run it again before calling the tool missing ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux").
- **Every check passing is not the whole truth.** The studio's rules audit found stale personal copies of skills shadowing the current ones, which no existing check looked at; its health check got a drift check for exactly that ([auditing the studio's own rules](../examples/rules-audit.md)). A check covers only what it looks at.
- **Some checks need you.** The first answer in a new session, or a commit showing as verified on your server, cannot be produced by Claude alone. They are listed as "needs you", never as pass.
- **Without the kit at hand,** each row's check is also written in the plan's "How you will see it works" column, so a session started in your setup can run them from there by hand.
- **Time and tokens.** Nothing loads every session, or about 29 tokens with the reminder line (estimate, bytes divided by 4). A run opens each ticked item's card once, and some checks build a throwaway repository in a temporary folder, so the more rows, the longer it takes.
- **When to run it.** After a machine switch, a restore, a reinstall or a kit update, before you trust a session: those are the moments drift arrives.
