# Counted from the studio's own use (2026-11-26)

The kit is written down from one studio's daily work, and that work leaves records. These three counts come from them, each with how it was counted. They are not adoption evidence: the studio wrote the kit and has not adopted it the way a reader would ([docs/trials.md](trials.md) has the trials, and the reports from adopters as they come). No count names a project, a client or a person. Each holds for the dates it gives; the next count will be a new page.

## 1. A recorded yes before risky acts: 225 rows

The studio's grant ledger, the file the [grant ledger](../cards/grant-ledger.md) card describes, was started on 2026-10-23. By 2026-11-25 it held 225 rows: 198 for merges, 7 for tags, 6 for history rewrites, 3 for force-pushes, 1 for a hook skip, 3 for clean-ups, and 7 standing rows, which cover one kind of act in one repository instead of a single act. 7 rows carry earlier dates, from 2026-05-29: acts written in after the ledger began. From 2026-10-26 the studio's tool-call guard refuses a merge, force-push, tag, history rewrite or hook skip that no row names; 207 of the rows date from then. Clean-ups are recorded, not checked.

**How it was counted:** the rows of the ledger's table, by the value in its kind column and by their date.

## 2. Refusals by the studio's tool-call guard: 174 in sessions, 1,430 in their subagents

From 2026-07-28 to 2026-11-26, 1,117 sessions were started in the studio's folder, a folder under it, or one of its worktrees. The guard refused 174 tool calls in 55 of them: 171 in the 120 interactive sessions, started in a terminal or the desktop app, and 3 in the 997 headless sessions that one program started for another. The 2,086 subagents those sessions started had 1,430 more refused. The studio's guard covers more than git; [git-guardrails](../cards/git-guardrails.md) is the kit's guard for git commands.

**How it was counted:** in Claude Code's own record of each session and each subagent, the tool calls whose result is an error that carries the guard's refusal line. The guard keeps no log of its own, so a session without a record is not counted. Not counted: what each refusal stopped, and how many were false alarms.

## 3. Sessions that picked up earlier work: 5 of 75

Of the 120 interactive sessions in the same period, 45 opened with a written brief from another session, so a person opened 75. Of those 75, 5 opened by asking to carry on from earlier work: 4 named a handoff note, 1 asked to continue where they had left off. 2 of the 75 read a handoff note within their first five tool calls.

**How it was counted:** a keyword match, checked by hand. A brief is a first message that starts "You are worker" or "You are the ... session", or says it was started by another session. A request to carry on is a first message whose first 300 characters hold "handoff", "where did we stop", "continue", "resume", "carry on" or "pick up". The automatic summary that continues a session past its context limit is not a first message. A handoff note read is a file whose name holds "handoff", or the studio's session log, read by one of the first five tool calls.

These undercount. In the studio, each project's current state is kept in its front door, which Claude Code loads when a session starts in that folder, so a session can pick up without reading a note or asking to.
