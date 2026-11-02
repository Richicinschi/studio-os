---
title: Adoption protocol
sources:
  - .claude/skills/vet-external-skill/SKILL.md
  - .studio/memory/feedback_skill_adoption_disposition.md
---

# Adoption protocol (for Claude)

You are helping a person take parts of this kit into their own setup, the folder that holds their Claude files. Follow this protocol; it overrides any urge to install something before they have decided. Why the kit works this way is in [PRINCIPLES.md](PRINCIPLES.md). The person does not need to read this page: `START-HERE.md` tells them what to expect, and its last section, "Words used in this kit", explains the kit's terms in their words.

## Order

The adoption has five phases. Prepare comes before them and is theirs; update runs come later, once per kit version. `START-HERE.md`, `drill-to-adopt` and the diagram give the same count. Nothing is installed before phase 4, the scanner included. Run `drill-to-adopt`; it carries phases 1 to 5 and resumes from whatever `adoption/` already holds.

| Phase | What happens | Writes, in their setup |
|---|---|---|
| Before: Prepare | They install Claude Code and git, get the kit, and say "Start the adoption" (`START-HERE.md`). | nothing |
| 1. Audit | On their yes, a read-only look at their setup (never secrets or data files): their profiles (the kinds of work their files suggest: data, ml, software or general) from manifests and file types, what is already installed (names and descriptions only) classified against the kit, an estimate of what loads into every session today, and each card's Detect (its read-only check of whether they already have the item). | `adoption/inventory.md` |
| 2. Decide | Their work and data rules first, before anything is placed; then the feature menu (`catalog/features.json`), where they pick whole modules or single items; the total (the every-session token estimate of what they picked); the cards' questions for the ticked items; the gaps (parts of their work no item covers). | `adoption/features.md` |
| 3. Spec and plan | The spec, after their explicit yes; then the plan from `templates/adoption/plan.md`, one row per item, in waves. Wave 1 is the first sitting, at most about 8 rows: row 1 the scanner; in an empty or new setup folder, row 2 `setup-workspace` in create mode (the whole template tree); a read-only scan of what they already have when any of it was never scanned; then `handoff`; `setup-workspace` in restructure mode when they asked for existing work to be reorganized; then the items that answer their named problem. | `adoption/spec.md`, `adoption/plan.md` |
| 4. Install | Wave 1, with `vet-and-adopt`, row by row: scan whenever the item ships files (a practice with nothing to copy has nothing to scan), triage, recommend, let them decide, apply, run the card's check, record. | `adoption/decisions.md` |
| 5. Verify | At the end of wave 1, in the same sitting, and again after each later wave: every ticked row's check again, a resume test in a fresh session started in their setup folder, and the every-session load estimated again. | `adoption/handover.md` |

**Close each session** with a handoff note (`templates/handoffs/TEMPLATE.md`) in their setup's `adoption/` folder, so the next session resumes from it. To pick up, they start Claude Code in the kit folder with their setup added, as on the first day, and say "Start the adoption" again. When the kit changes, update mode re-enters at phase 2 with only the new or changed items.

## Rules
- Never copy anything from `catalog/`, `templates/` or `.claude/skills/` into their setup without a decision recorded by `vet-and-adopt`, and then write it in their words: no studio sentence, term or path survives into their setup.
- Follow the "Voice and honesty" and "Rules for every question" sections of `drill-to-adopt`: kind, and never false; one question per message; "Not sure" takes the recommended option, and in an approval that changes their files it is not a yes.
- Never skip a scan for an item that ships files. A non-SAFE result (any SkillSpector recommendation other than `SAFE`; scores run from 0 to 100, `docs/facts.md`, "Installing SkillSpector") stops until they have read the findings.
- Their data rules win over any module's advice. When they do not know a rule, the spec says "strictest reading assumed": act as if the strictest version holds (nothing leaves the company, no remote, no personal account on work data) until they say otherwise.
- Write only in their setup. Never write into this kit repo. For a claude.ai Project, write the text in their setup for them to paste or upload, and never say a Project was changed.
- A step only they can run is handed over as the exact command to type with Claude Code's `!` prefix, so its output lands in the conversation, for example `! skillspector --version`. Whether a `!` command can take typed input is not documented (`docs/facts.md`, "Claude Code: the ! prefix, /init and local files"), so a step that asks for a password, opens a browser to sign in or goes through company single sign-on (a login such as `gh auth login`, an install that needs admin rights) is not a `!` line: give it as a command for a separate terminal, then a check line they run with `!`. Which folder a `!` command runs in is not documented, so give a folder-dependent command with its full path. Never run such a step yourself or guess it.
- Never overwrite or delete their files: `setup-workspace` merges, and moves things only through a plan of reversible steps, each on their yes.
- The facts that change (models, cache, claude.ai features, install commands) are in `docs/facts.md`, with dates. Use those, not your memory, and tell them when a fact there is older than 90 days.
- Studio-specific steps (paths, tools the studio uses that they do not) are marked in each module page and `SOURCE.md`. Rewrite or drop them; never carry studio paths into their files.

## Where things are
| You need | Look in |
|---|---|
| What their setup already holds | `adoption/inventory.md`, in their setup |
| Every menu item, with importance, why and context cost | `catalog/features.json` (readable: `catalog/FEATURES.md`) |
| How to detect, ask, install, check and undo one item | `cards/<id>.md` |
| What each pack and item is | `catalog/INDEX.md` |
| What they chose, and the plan | `adoption/features.md`, `adoption/plan.md`, in their setup |
| Why a practice exists, and how to apply it in Claude Code or claude.ai | `modules/NN-*/README.md` |
| An item's origin, licence and last scan | `catalog/skills/<id>/SOURCE.md` |
| The install lines for the scanner and for the tools some items need | `docs/install-reference.md` |
| Blank files to start from | `templates/` |
| What changed since their last run | `CHANGELOG.md` |
