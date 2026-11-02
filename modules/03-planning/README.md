---
title: Planning
pack: way-of-working
sources:
  - .studio/memory/feedback_green_can_be_a_lie.md
  - .studio/memory/project_wiki_chronicle.md
  - .claude/skills/drill-to-plan/SKILL.md
questions:
  - "How does your work usually start: a clear ticket, or a vague ask from someone else?"
  - "How big is a typical piece of work: an hour, a day, or weeks?"
  - Do you check results against something before calling them done, and against what?
---

# Planning

Say what "done" means before the work starts, and prove it before the work ends. This module is how the studio does both.

## The problem

Two failures bracket most work that goes wrong.

At the start, building begins before anyone has written down what "done" means. The work then answers a question nobody asked, or half of the one they did.

At the end, a green check is taken as proof. In the studio's experience a passing check often means the check is broken, not that the work is right. It may have run nothing, run the wrong thing, or been unable to fail at all. These failures report success or silence, never an obvious error, so nobody goes looking.

## The mechanism

- **Brainstorm, spec, plan, execute.** The superpowers library has a skill for each step, and the kit ships the studio's adapted copies. `brainstorming` explores what you want and turns it into a design you approve, written down as a spec. `writing-plans` turns the approved spec into small tasks, each with its own check. `executing-plans` carries the plan out in the session that runs it, task by task, keeping a ledger and ending with one review of the whole branch; `subagent-driven-development` runs independent tasks through subagents instead. No building before the spec has your yes.
- **`drill-to-plan` when the ask is vague and big.** It interviews you one question at a time, each with its recommended answer for you to accept or override. It keeps a coverage checklist (goal, users, scope, data, error handling, testing, risks and more) and stops when it can predict your next three answers. Its output is an approved spec for `writing-plans`. For a small, clear ask, skip it and just act.
- **Verify against a baseline before saying done.** `verification-before-completion` asks for evidence before any claim of success. The studio adds a baseline: compare the result with something recorded before the change. Three habits come with it:
  - Ask what would have to break for the check to go red. If the answer is "nothing that matters", the check is decoration.
  - Prove a new check can fail: break its input, run it, see red.
  - Never record a baseline you have not seen printed yourself, and mark whether a cause you write down was measured or inferred.
- **Checks you can run yourself.** [One local check before every push](../../cards/verify-before-push.md) runs every test and lint first; [the coding guidelines](../../cards/coding-guidelines.md) keep changes small and surgical; "check my setup" ([setup check](../../cards/setup-check.md)) re-runs every check from your adoption plan.

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

The studio's wiki generator reads every project folder and writes pages from them. One run was made in a separate git worktree whose project folders were a kind of folder link. The directory reader reports that kind of link as a symbolic link, not a folder, so the scanner never walked into any project.

The run exited 0. Its drift check said clean. Every canary passed. Yet its output stripped every project page of its file list and deleted about 190 generated plan cards, the wiki's page for each plan: 530 files changed, 7,532 lines removed. All three signals checked the run; none checked the result.

The studio's memory now marks that recipe as broken, says never to commit a run made that way, and names the one recipe that works.

## Apply it in Claude Code

1. **Adopt the planning skills** (`brainstorming`, `writing-plans`, and `verification-before-completion`) through your adoption plan; each has its card in `cards/`. The upstream superpowers plugin is an optional alternative, after its scan ([install reference](../../docs/install-reference.md#optional-the-upstream-superpowers-plugin)).
2. **Small and clear (about an hour):** just ask, with one line on what done means and how you will check it.
3. **A day's work:** say "let's brainstorm this" to start `brainstorming`, then approve the spec it writes.
4. **Vague and big, or someone else's vague ask:** adopt [drill-to-plan](../../catalog/skills/drill-to-plan/SOURCE.md) through `vet-and-adopt` as ADAPT, and say "drill me into a plan". (studio-specific: the project folders it explores first, the paths where it saves specs, and its commit rules; replace them with your own.)
5. **With an approved spec,** say "write the plan" for `writing-plans`. Run it with `executing-plans`, best started in a fresh session, or `subagent-driven-development` when its tasks are independent.
6. **Decide where specs and plans live,** and write it into your front door. The studio keeps them where the shipped `brainstorming` and `writing-plans` save them, `docs/superpowers/specs/` and `docs/superpowers/plans/`, with the date at the start of each file name.
7. **Tick each plan step as it is done.** When the studio's wiki generator read its plans back, not one of 187 had every box ticked.
8. **Before you say done,** run `verification-before-completion` and compare with your baseline. For data work: the row count before and after, a total that must match the source, a query whose answer you already know. A drop is a failure until it is explained.

## Apply it in claude.ai

1. **Ask for a spec first.** In the Project's chat: "Before any work, write a one-page spec: the outcome, what done means, what is out of scope, and how we will check it. Ask me one question at a time until you can."
2. **Approve it, then save it** as `spec-<topic>.md` in the Project's knowledge.
3. **Work from the spec** in new chats, one per part. Each starts by reading it.
4. **Keep the baseline habit.** Give Claude the numbers you expect before you ask for the result, ask it to compare and to report every difference, and check one result by hand.
5. **`drill-to-plan` works here too** as an uploaded custom skill, after `vet-and-adopt` (`docs/facts.md`, "claude.ai: custom skills and the built-in document skills").

Catalog items used: [drill-to-plan](../../catalog/skills/drill-to-plan/SOURCE.md), [brainstorming](../../catalog/skills/brainstorming/SOURCE.md), [writing-plans](../../catalog/skills/writing-plans/SOURCE.md), [executing-plans](../../catalog/skills/executing-plans/SOURCE.md), [verification-before-completion](../../catalog/skills/verification-before-completion/SOURCE.md), [frontend-design](../../catalog/skills/frontend-design/SOURCE.md); the upstream `superpowers` plugin is listed in the catalog as an optional alternative.
