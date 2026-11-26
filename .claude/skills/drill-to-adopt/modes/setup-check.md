## Setup-check mode

When they say "check my setup": first, when `adoption/installed.json` exists, run
`node tools/check-setup.mjs <setup>` from the kit's folder and show what it prints. It checks each
installed item without you: whether every file its install wrote is there, what changed since, and
the card's check block where it has one, read-only; and it counts the steps left for them. A change
is not a fault by itself; say which item it touches. Then, for every ticked row in
`adoption/plan.md`, run the rest of the card's Check by hand: its **Claude:** steps the script did
not run, and each **you:** step as a request to them. Report pass, fail or needs you per item, with
the line that showed it. Change nothing. For a failure, say what to look at next, and offer to fix
it as a new plan row on their yes.

Whatever the plan holds, also send each git guard one fake force-push: every `block-dangerous-git.mjs`
that a `hooks.PreToolUse` entry names in `.claude/settings.json`, `.claude/settings.local.json` or the
user settings, with the line of `cards/git-guardrails.md`, Check step 1. Report one line per guard:
`exit 2` is pass; any other exit, a missing file among them, is fail. A path that is not a
file, such as a folder, is fail and is never run. Run no other hook from the settings.
