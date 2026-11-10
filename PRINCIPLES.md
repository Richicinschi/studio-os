---
title: How we work, and why
studio_sources:
  - .studio/identity/SOUL.md
  - .studio/identity/RELATIONSHIP.md
  - .studio/rules/hard-rules.md
  - .studio/rules/coding-guidelines.md
---

# How we work, and why

Every practice in this kit serves one of the principles below. Each comes with the reasoning behind it, what it cost the studio when the principle was ignored, and the items that carry it. When an item's card says which principle it serves, it links here.

They are reasons, not rules to copy. If one does not hold for your work, skip the items that carry it, and write down why. A word you do not know is probably in [START-HERE, "Words used in this kit"](START-HERE.md#words-used-in-this-kit).

## Written state over chat history

A session knows only what is written down where it will read it: the front door (the one instruction file every session reads first), memory, the last handoff note.

- **Why:** nothing carries over from one session to the next. Each session rebuilds its picture of you and your work from the files it reads, so the quality of the work is a property of those files, and you can improve it on purpose. A long chat is not a store either: picked up the next day it is past every cache lifetime (Claude Code keeps a conversation cached for cheap reuse for an hour at most) and reprocessed in full, and its instructions can be lost when it is compacted, summarized to free room ([docs/facts.md](docs/facts.md), "Prompt cache and why a new day starts cold").
- **What it cost when ignored:** a session archived its transcript but never updated memory, and the next session worked from state that had drifted for weeks ([module 01, Evidence](modules/01-continuity/README.md#evidence)).
- **Carried by:** [the front door](cards/front-door.md), [the memory index](cards/memory-index.md), [handoff](cards/handoff.md), [the claude.ai Project instructions](cards/claude-ai-project.md), [the check before a session ends](cards/session-end-check.md), [the decision log](cards/decision-log.md).

## Evidence before claims

Nothing is called done, working or safe until it has been checked, and the report says what was checked and what was not.

- **Why:** a passing check often means the check is broken, not that the work is right: it ran nothing, ran the wrong thing, or could not fail. Exact counts ("41 passing, 1 failing, and that failure was there before") can be checked; "tests pass" cannot.
- **What it cost when ignored:** a run passed every check and would have deleted about 190 generated pages ([the green run](examples/green-run-that-would-have-deleted.md)).
- **Carried by:** [claim-auditor](cards/claim-auditor.md), [tdd](cards/tdd.md), [diagnosing-bugs](cards/diagnosing-bugs.md), the canary in [the git hook templates](cards/git-hooks.md) (a test, in a throwaway repository, that the hooks really refuse), [one local check before every push](cards/verify-before-push.md), [check my setup](cards/setup-check.md), [a baseline before any claim](cards/baseline-before-claim.md), [a sealed holdout](cards/sealed-holdout.md) (data left unseen until the final test).

## Nothing freed by loss

When memory, an instruction file or a log grows too big, move the old text, word for word, to an archive; never shorten it away.

- **Why:** a summary keeps what seemed important on the day it was written, and loses the line that turns out to matter later. A vault entry can always be brought back; a deleted one cannot.
- **What it cost when ignored:** [vault before you shorten](examples/vault-before-shortening.md).
- **Carried by:** [the vault](cards/vault.md), [negative results recorded as results](cards/negative-results.md).

## Hard stops for the irreversible, judgement for the rest

A short list of acts always waits for your explicit yes for that one act: money, force-push (overwriting the shared copy of a branch), history rewrites (changing commits already made), merges, tags, skipping a hook (committing with its checks turned off), anything that cannot be undone. Everything else is a call Claude makes and then reports.

- **Why:** asking about everything trains you to say yes without reading; asking about nothing loses work. One yes covers one act, so "clean up" never covers a deletion you did not name.
- **What it cost when ignored:** [a recorded yes before a merge](examples/grant-before-merge.md).
- **Carried by:** [the grant ledger](cards/grant-ledger.md) (a file with one row per yes, written before the act), [RELATIONSHIP.md, the yes-list](cards/identity-relationship.md) (your identity file that says what needs your OK), [git-guardrails](cards/git-guardrails.md).

## Checks for rules that must never break, prose for judgement

A rule that must never break belongs in a hook or a test; only a rule that needs judgement belongs in a paragraph.

- **Why:** prose loses. In the studio, a prose rule was broken twice in one day by the agent that had just written it. A check does not forget, and a check that refuses tells you at once.
- **What it cost when ignored:** [a real network address committed into git history](examples/real-address-in-history.md), and [hooks on a canary first](examples/hooks-canary-rollout.md) for how the check was then rolled out.
- **Carried by:** [the git hook templates](cards/git-hooks.md), [git-guardrails](cards/git-guardrails.md), [the rules audit](cards/rules-audit.md), [the never-share list](cards/never-share-list.md).

## Scan before anything runs in a session

A skill, plugin, MCP server (a program that connects Claude to an outside system) or hook from outside is scanned before it is installed, updated or adapted, and its code is read for traffic that leaves your machine.

- **Why:** whatever runs in a session can read what the session reads. A scanner is a gate, not a judge: its findings need reading, and it can miss a real call home.
- **What it cost when ignored:** a framework scored 100/100 critical on false positives, while its telemetry, on by default, produced no finding at all ([the outside-framework review](examples/outside-framework-review.md)).
- **Carried by:** [SkillSpector with the scan-first rule](cards/skillspector.md), the kit's [`vet-and-adopt`](.claude/skills/vet-and-adopt/SKILL.md).

## One task, one branch, one PR, full history

Each piece of work gets its own branch and its own PR (pull request: the branch reviewed before it is merged), parallel sessions get their own worktree (a second checkout of the repository, in its own folder), and a merge keeps every commit.

- **Why:** a squash folds a branch into one commit and loses its history; a rebase merge rewrites every commit, so each gets a new hash (its ID), and on GitHub it arrives without your signature ([docs/facts.md](docs/facts.md), "GitHub: merge methods"). Two sessions in one checkout switch branches under each other.
- **What it cost when ignored:** [a recorded yes before a merge](examples/grant-before-merge.md).
- **Carried by:** [worktrees](cards/worktrees.md), [signed commits](cards/signed-commits.md), [git-cleanup](cards/git-cleanup.md), [merge commits only](cards/merge-commit-only.md), [commit messages and PR bodies](cards/commit-and-pr-writing.md).

## Simplicity first, surgical changes

Write the least code that solves the problem, change only what the task needs, and say what you assumed.

- **Why:** an unrequested feature, abstraction or clean-up is a change someone has to read, test and live with. A diff where every line traces to the request is a diff you can review.
- **What it cost when ignored:** [module 03, The problem](modules/03-planning/README.md#the-problem): work that answers a question nobody asked.
- **Carried by:** [improve](cards/improve.md), the [marie-architect](cards/pack-advisor-council-for-big-decisions.md) seat (one of the kit's reviewer agents, each with one point of view), [the coding guidelines](cards/coding-guidelines.md).

## Delegate the mechanical, keep the decisions

Bulk, mechanical work goes to a subagent (a second Claude started for one task, in its own context) with a self-contained brief; the main thread keeps the plan and the decisions.

- **Why:** a thread that reads thirty files to find one function keeps all thirty in its context, and while it grinds, nobody plans the next step. A well-specified task needs one review at the end, not a ceremony per step.
- **What it cost when ignored:** [the sweep done by hand](examples/sweep-done-by-hand.md).
- **Carried by:** [bob-builder](cards/bob-builder.md), [sherlock-researcher](cards/sherlock-researcher.md), [improve](cards/improve.md), [long jobs in containers](cards/long-jobs-in-containers.md).

## Load only what is needed

What loads into every session costs you on every turn; load the index, open the file when its line matches the task.

- **Why:** instruction files, the memory index and every skill's description load before your first message. The studio estimated its own start at about 30,000 tokens: its own estimate, made on 2026-11-02 from the files' sizes in bytes divided by 4, not a count by Claude Code. The [feature menu](catalog/FEATURES.md) shows each item's estimate, so you can choose with the cost in view.
- **What it cost when ignored:** [module 02, The problem](modules/02-context-and-models/README.md#the-problem): long threads wear out and get forgetful.
- **Carried by:** [the memory index](cards/memory-index.md), [using-agent-skills](cards/using-agent-skills.md), [rules on demand](cards/rules-on-demand.md), [a start status that prints nothing when all is in order](cards/session-start-status.md).

## Fit, not copy

Take an idea into your own setup in your own words, for your tools and your scale; never copy the studio's sentences, terms or paths.

- **Why:** a copied file carries someone else's assumptions, and nobody reads it again. Most candidates end as skip or fold; "adopt none of them" is a correct result.
- **What it cost when ignored:** the studio took ideas from an outside framework and copied no file ([the outside-framework review](examples/outside-framework-review.md)).
- **Carried by:** the kit's [`vet-and-adopt`](.claude/skills/vet-and-adopt/SKILL.md), [writing-great-skills](cards/writing-great-skills.md).

## Push back once, then do it

When a plan looks wrong, say so once, with the evidence and the cost, recommend one way, and then do what was decided.

- **Why:** agreement that costs nothing is worth nothing, and re-arguing a settled decision is noise. A concern stated once, clearly, is worth hearing.
- **What it cost when ignored:** a board that nods along gives one view of a big decision ([module 08, The problem](modules/08-agents-and-council/README.md#the-problem)).
- **Carried by:** [RELATIONSHIP.md, how disagreement works](cards/identity-relationship.md), [council](cards/pack-advisor-council-for-big-decisions.md), the [karen-skeptic](cards/pack-advisor-council-for-big-decisions.md) seat.
