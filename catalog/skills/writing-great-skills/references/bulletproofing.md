# Bulletproofing a skill against rationalization

Reach for this file when your baseline run shows a discipline failure: the agent knows the rule and talks itself out of it under pressure. Skills that enforce a discipline (a backup before a migration, a test before code) need to survive a clever agent looking for a way round.

## Scope

This toolkit fits discipline failures only. It does not fit output of the wrong shape or a missing element. For those, piling on prohibitions backfires, so describe the form you want instead. The research on why pressure and framing change compliance is not part of the studio copy; the practical effect is that every tactic below works by removing an exit.

## Name the loopholes

Stating a rule is not enough. Forbid the specific workarounds, because the agent will try each one.

Weak:

```markdown
Skip the backup? Don't.
```

Strong:

```markdown
Skipped the backup before the migration? Restore the state, take the backup, start the migration again.

**No exceptions:**
- A "small" schema change still needs it
- A backup taken afterwards does not count
- A copy on the same disk does not count
- Restoring means restoring
```

## Letter and spirit

State a founding principle near the top:

```markdown
**Breaking the letter of a rule breaks its spirit.**
```

One line closes the whole family of "I am honouring the intent, just not the wording" arguments.

## Excuse table

Fill it from baseline runs (see `testing-skills-with-subagents.md`, the sibling file in writing-great-skills). Each excuse the agent actually produced gets a row and a short answer.

```markdown
| Excuse | Answer |
|--------|--------|
| "It is only a rename" | Renames break foreign keys. The backup takes a minute. |
| "Staging is identical to production" | Then the backup is trivial too. Take it. |
| "The migration is reversible" | Reversible is a claim until a restore proves it. |
```

## Red flags

Give the agent a list to scan while it is rationalizing:

```markdown
## Red flags: stop and go back

- Running the migration before the backup
- "I will back up right after"
- "The down-script is enough"
- "This one is different because..."

**Each of these means: stop, take the backup, restart the migration.**
```

## Symptoms in the description

Put the signs that the agent is about to break the rule into the description, so the skill fires at that moment:

```yaml
description: Use before running any schema migration, when tempted to migrate first and back up later, or when a change looks too small to need one.
```
