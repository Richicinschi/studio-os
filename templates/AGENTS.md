# AGENTS.md

<!-- The front door for every Claude session in this setup. Replace each <prompt>, then delete the
prompt. Keep the file under about 30,000 characters: move history out, never delete it. -->

## Who I am and how to work with me

Read `identity/USER.md`, `identity/STYLE.md` and `identity/RELATIONSHIP.md` first, when they exist.
<One paragraph: your role and what you use Claude for.>

## Load this at the start of every session

1. `memory/MEMORY.md`: the index of what this setup already knows. Open a memory file when its line matches the task.
2. The newest note in `handoffs/`, when the task continues earlier work.

## Rules

- <What Claude must never do here. For example: never run a write query against production; never put customer data anywhere outside the company.>
- <What always needs my OK. For example: deleting files, pushing, sending anything outside this machine.>

## Memory

When you learn a durable, non-obvious fact that would change what a later session does, write one file for it in `memory/` (format in `memory/README.md`) and one line for it in `memory/MEMORY.md`. Never shorten or delete a line in the index: copy the old version word for word into `memory/vault/MEMORY-VAULT.md` first.

## End of a session

Write a note in `handoffs/` named `YYYY-MM-DD-<topic>.md`, from `handoffs/TEMPLATE.md`: what was done, what was decided, what is open, and the first thing the next session does.
