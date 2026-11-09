> House rule: pick another model for the orchestrator below only if the owner names it. Without that, each subagent inherits the model of the session.

# Claude Code: running a plan one layer down

The skills are written for Claude Code: its `Agent` tool starts a subagent, it keeps a todo list, and it has a `Skill` tool. It also lets you move the coordination of a long plan off the expensive main session. This is optional and needs the owner's request. No skill depends on it.

## Why bother

In a `subagent-driven-development` run the main session is the costly seat. It reads every report that comes back and normally runs on the strongest model available. Claude Code lets subagents start subagents (up to three levels under the main conversation; set `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` to change the limit), so the whole loop can sit one level lower.

## How

Do it only when the owner asks, or when he has said the session model is too pricey for coordination.

1. Start exactly one orchestrator subagent. Give it the path to the plan and tell it to run `subagent-driven-development` from the first task to the last.
2. Put it on a mid-tier model only if the owner named that model. Otherwise it inherits the session's model, like every other subagent.
3. The orchestrator starts its own implementers and reviewers and picks their models as that skill describes. The workspace and the ledger stay on disk, so the extra level loses nothing.
4. Its last message must contain the list headed "Rulings I made", word for word. That list is how its judgment calls reach the owner. Pass it on as written; do not condense it.

## Limit

Use this for a complete plan only. Wrapping a single task in an orchestrator adds a seat and saves nothing.
