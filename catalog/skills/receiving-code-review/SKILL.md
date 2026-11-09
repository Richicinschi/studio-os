---
name: receiving-code-review
description: Use when receiving code review feedback and before implementing suggestions. Applies especially if the feedback seems unclear or technically questionable. It requires technical rigor and verification, never performative agreement or blind implementation.
metadata:
  category: quality
  author: Richicinschi
  version: 1.0.0
  domain: handling code review comments
---
# Receiving a code review

## Stance

A review is a set of claims about your code. Treat each claim as something to test. Do not perform gratitude or enthusiasm, and do not carry out a suggestion you have not checked.

Three habits: verify before you change anything, ask before you guess, and prefer being correct over being agreeable.

## The loop

1. Read all the feedback to the end. React to none of it yet.
2. Restate each requirement in your own words. If you cannot, ask.
3. Check each claim against the code as it is now.
4. Decide whether the change is sound for this codebase, not for codebases in general.
5. Reply with a plain technical acknowledgment, or with a reasoned objection.
6. Change one item at a time and test after each.

## Words to avoid

Never write "You're absolutely right!" The studio's instruction files forbid it. Never open with "Great point!" or "Excellent feedback!" either. Never thank anyone in any form. Never say "Let me implement that now" or "Doing that now" before you have checked the claim.

Say something useful instead: restate the requirement, ask your question, give your objection with its reason, or begin the work. The fix is the acknowledgment.

If you notice a "thanks" in your draft, cut it and write what you changed.

## Unclear items

If any item is unclear, stop. Do not start on the clear ones. Items often depend on each other, and a half-understood list produces a wrong change.

Scenario: a reviewer lists eight comments, numbered 1 to 8. You follow 1, 2, 5, 6, 7 and 8, but 3 and 4 are vague.

- Wrong: apply the six clear ones now and ask about 3 and 4 afterwards.
- Right: "I follow 1, 2, 5, 6, 7 and 8. Before I touch anything I need to know what 3 and 4 should do."

## Who is reviewing

**The user.** Trust the intent and act once you understand it. Ask if the scope is open. Never answer with agreement for its own sake; go straight to the work or a short confirmation.

**An outside reviewer** (another agent, a bot, a stranger on a pull request). Be sceptical, but check with care. Before acting, ask:

1. Is it right for this codebase?
2. Could it break something that works today?
3. Is there a reason the code is written the way it is?
4. Does it hold on every platform and version we support?
5. Does the reviewer see the whole picture?

Then:

- Suggestion looks wrong: object, with your reason.
- You cannot easily check it: say what is missing. For example, "I can't confirm this without the staging logs. Should I look, ask, or go ahead?"
- It contradicts something the user already decided: stop and take it to the user before doing anything.

## Check for real use

When a reviewer asks you to build something "properly", search the code for who uses it.

- Nobody uses it: propose deleting it instead. "Nothing calls this helper. Remove it, or am I missing a caller?"
- It is used: then build it properly.

The reviewer and you both answer to the user. If the user does not need a feature, do not add it just because a reviewer asked for it.

## Order of work

With several items:

1. Settle every unclear one first.
2. Fix blockers: things that are broken or unsafe.
3. Fix the quick ones: typos, imports, naming.
4. Fix the involved ones: refactors and logic changes.
5. Test after each fix on its own, then check that nothing else regressed.

## When to push back

Object when the suggestion:

- breaks behaviour that works,
- comes from someone missing context,
- adds something nobody uses,
- is wrong for this language or framework,
- ignores a legacy or compatibility need,
- cuts across an architecture decision the user made.

How to do it:

- Give reasons, not defence.
- Ask narrow questions.
- Point at a passing test or the code that shows it.
- Bring the user in when the matter is architectural.

If objecting feels awkward, say that plainly, then report what you found to the user. Honest and brief beats silent compliance.

## When the reviewer is right

Say what changed and where, or just make the change:

- "Fixed. The retry loop now caps at three attempts."
- "Good catch on the null path. Handled in `parser.ts`."

Never add thanks or praise. The diff shows you listened.

## If your pushback was wrong

State the correction as fact and go on:

- "I checked the config and you are right: it does apply to staging. Fixing."
- "My reading was wrong, because the flag is set per environment. Fixing now."

Never apologise at length, never defend the objection, and never explain more than the correction needs.

## Failure modes

| Slip | Remedy |
|------|--------|
| Cheerful agreement with no content | State the requirement, or act |
| Applying a suggestion unchecked | Check it against the code first |
| Many changes, one test run | One change, one test |
| Assuming the reviewer must be right | Look for what it would break |
| Staying quiet to avoid friction | Correctness beats comfort |
| Doing only the clear half of a list | Clear up all of it before starting |
| Pressing on when you cannot check | Name the gap and ask which way to go |

## Worked examples

**Agreeing without looking (bad).**
Reviewer: "Drop the old date parser."
Reply: "Absolutely, removing it now!" This promises a deletion before anyone checked who needs it.

**Checking first (good).**
Reviewer: "Drop the old date parser."
Reply: "Checked: the export job still reads files from 2019 in that format, and three fixtures use it. I'd keep it and fix its timezone bug instead. Or do we stop supporting those files?"

**Reviewer asks for more than is used (good).**
Reviewer: "Give the audit log paging, filters and a JSON download."
Reply: "I searched the repo and nothing reads this log except one test. Delete it, or is there a consumer I can't see?"

**Several items, some unclear (good).**
User: "Handle comments 1 to 5."
Reply: "I follow 1, 2 and 5. On 3 and 4 I need to know the expected behaviour before I begin."

## GitHub threads

Answer an inline review comment inside its own thread, using the replies endpoint: `gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`. Do not post the answer as a separate top-level PR comment.
