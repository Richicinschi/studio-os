---
name: drill-to-plan
description: >-
  Use when the user wants to be drilled, interviewed or grilled into a finished plan: a vague goal becomes a decision-resolved design spec by one-question-at-a-time interrogation. Triggers: "drill me", "interview me to a spec", "grill me". Heavier than brainstorming; feeds writing-plans.
metadata:
  category: planning
  author: Richicinschi (Claude-authored, the owner-orchestrated)
  version: 1.0.0
  domain: requirements elicitation / interactive planning → design spec
  sources:
    - "drill-with-me (user-provided) — adaptive one-at-a-time engine, command palette, difficulty/stop control"
    - "addyosmani/agent-skills interview-me (MIT) — hypothesis+confidence questions, restate-and-confirm, predict-next-3 stop"
    - "mattpocock/skills grill-me (MIT) — resolve every decision-tree branch; explore the code, don't speculate"
---

# drill-to-plan

Drill the user with adaptive, one-at-a-time questions until a vague goal becomes an
**exhaustive, decision-resolved design spec** — then write that spec to the repo and offer to
turn it into an implementation plan.

You are extracting what the user **wants and has decided**. You are not testing their
knowledge. Every question moves the design forward.

## When to use / when NOT

**Use it** for a non-trivial feature, system, or refactor whose design is underspecified and
worth exhaustive elicitation before building — or to **harden an existing rough draft/notes**
into a real spec.

**Don't use it** for trivial or unambiguous asks (just act), pure information questions, or
mechanical operations. For lightweight product-intent exploration, prefer
`brainstorming` (lean, YAGNI). This skill is its **heavyweight cousin**: it keeps
drilling past the first reasonable design until every branch is resolved. Its output (an
**approved spec**) is the input to `writing-plans`.

**Honour the studio rules:** producing a spec is fine; do NOT start implementing until the
user approves the spec (same gate as brainstorming). Follow the hard rules in
your rules file + the Karpathy guidelines in your coding guidelines —
the spec is "huge" because of genuine coverage, never filler.

## Procedure

You MUST create a TodoWrite item per numbered step and work them in order.

### 1. Frame the target (and ground it in reality)
- Identify what we're planning. If the user gave only a vague goal, that's expected — that's
  what the drill is for.
- **Two entry modes:** (a) from a goal/topic; (b) from an existing draft/notes/plan to harden
  (read it first).
- If the topic maps to a project (any row of
  your project registry), **explore the relevant code/docs FIRST**
  (grill-me principle). Questions must be grounded in what the code actually does, not
  speculation. Note the files you read.

### 2. Open with a hypothesis + confidence
State your best one-sentence reading of the goal, plus an honest **0–100% confidence** number
and why. Example: *"My read: you want an export button on the report page that saves the
current view as CSV. Confidence 55% — unsure whether it exports the filtered rows or all of
them."*

### 3. The drill loop (one question at a time)
Ask **exactly one question per turn.** Each question MUST carry **your recommended answer /
hypothesis**, so the user reacts and commits fast instead of composing from scratch:

> *"Should the export include the rows the current filter hides, or only what is on screen?
> My hypothesis: only what is on screen, reusing the existing filter state.
> — agree, or override?"*

Rules for the loop:
- **Adaptive depth.** If the user answers crisply twice → go deeper / push to edge cases &
  tradeoffs. If they're vague or unsure twice → simplify, offer a concrete default, narrow the
  question. If stuck → give a hint, then a simpler sub-question.
- **Mix question types** so it never feels canned: recall · scenario · "what would you do
  next?" · compare-and-contrast · edge-case · debugging-the-design · trick/assumption-check ·
  real-world application. Don't repeat one format back-to-back. (Bank:
  `references/question-bank.md`.)
- **Resolve every branch of the decision tree** (grill-me). When an answer opens new
  sub-decisions, follow them before moving on.
- **Listen for "should-want" signals** — pattern-matched buzzwords ("scalable", "clean",
  "modern"), deference to convention, "I think I'm supposed to…". Probe: *"If you didn't have
  to justify it to anyone, what would you actually want?"*
- Keep your own commentary short. The user's answers are the spec; your job is to pull them
  out efficiently.

### 4. Track coverage (this is what makes it goal-driven)
Maintain a coverage checklist of the spec dimensions. Drill the OPEN ones:

`Goal/Outcome · Users · Scope & Non-goals · Architecture · Components & interfaces ·
Data model & flow · Dependencies/integrations · Error handling · Edge cases ·
Testing/verification · Risks & tradeoffs · Rollout/migration · Open questions`

Scale to the task — a small feature won't need all 13; a system will. On `coverage`, print the
checklist with each dimension marked ✅ covered / 🟡 partial / ⬜ open.

### 5. Commands the user can type
`hint` (clue, no full answer) · `skip` (state your default for that branch, move on) ·
`harder` / `easier` (shift depth) · `explain` (expand your last point) · `coverage` (show the
checklist) · `draft` (synthesize the spec NOW from what's gathered, marking the rest as Open
Questions) · `stop` / "I don't want to answer any more" / "I'm done" / "no more questions"
(end the drill).

### 6. Stop condition
Stop drilling when EITHER: the user issues a stop command, OR you hit the testable threshold —
**you can confidently predict the user's answers to your next 3 questions** (≈95% confidence)
and every decision-tree branch is resolved or explicitly deferred. Don't pad past this.

### 7. Restate & require an explicit YES
Before writing anything, restate the captured design for line-by-line confirmation —
**Outcome · User · Why now · Success criteria · Constraints · Out of scope · Key decisions
made**. Then ask for explicit approval. Vague confirmations ("sounds good", "whatever you
think") do NOT count — get a real yes, or keep drilling the parts they hesitate on.

### 8. Synthesize the spec (the big md)
Write a comprehensive spec from `templates/spec-skeleton.md`, filling every covered dimension
and logging the decisions resolved during the drill. **Location (project-aware):**
- project topic → `apps/<slug>/plans/<topic>.md` or `games/<slug>/docs/plans/<topic>.md`
- studio / cross-cutting → `docs/specs/YYYY-MM-DD-<topic>-design.md`

Each section scaled to its complexity. Big = thorough coverage of real decisions, NOT padding.
Carry the user's actual words/decisions; don't silently invent. Anything unresolved goes under
**Open Questions / Deferred**, never guessed.

### 9. Self-review, then commit + hand off
- **Self-review the spec** (mirror brainstorming): scan for placeholders/TODOs, internal
  contradictions, scope creep, and any requirement that could be read two ways — fix inline.
- **Commit and push** per repo policy (signed, authored as the owner, no Co-Authored-By; the owner
  merges). A spec at a **studio-root** path goes on a worktree branch off `origin/main`
  (your rules file "Multi-agent operating model"). A spec inside a project repo
  just commits there.
- **Hand off:** offer to invoke `writing-plans` to turn the approved spec into an
  executable, verifiable task list. That — not this skill — produces the implementation plan.

## If the user stops early
Honour it immediately. Run `draft` against whatever was gathered (so the effort isn't lost),
clearly marking the unresolved dimensions as Open Questions, and give a one-line note on what's
still needed to make the spec build-ready.
