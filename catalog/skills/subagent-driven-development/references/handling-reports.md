# Reports that are not DONE

Companion to subagent-driven-development.

**DONE_WITH_CONCERNS** means the work is finished and the implementer has doubts. Read them first. If a doubt touches correctness or scope, resolve it before any review. If it is only an observation (say, a file has grown large), note it and go on to review.

**NEEDS_CONTEXT** means information was missing. Supply it and dispatch again.

**BLOCKED** means the implementer could not finish. Work out the cause and choose:
1. Context was missing: add it and dispatch again.
2. The task calls for more reasoning: decide the hard part yourself, write the ruling to the ledger, and dispatch again with the ruling inside the prompt. The model remains the session's own (Model Selection, SKILL.md).
3. The task is too large: cut it into smaller tasks.
4. The plan is mistaken: rule on the fix, record it in the ledger, and carry the ruling in the new dispatch.

Never wave an escalation through. Never make the same model retry with nothing changed. When an implementer says it is stuck, something has to change.
