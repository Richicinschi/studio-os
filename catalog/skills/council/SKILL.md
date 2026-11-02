---
name: council
description: Convene the Studio Council — a panel of the studio's persona-agents — to critique a decision, plan, or question from multiple viewpoints and return one synthesized brief. Use when facing a real fork ("should we build X", "is this plan sound", "ship the paywall now?") and you want diverse, conflicting perspectives before deciding. Trigger on "/council", "convene the council", "what does the board think", "get the council's take". For a multi-round deliberation where the seats actually rebut and respond to each other, trigger "debate", "deliberate", "/council --debate", "argue it out", "full deliberation".
metadata:
  category: studio
  author: Richicinschi
  domain: studio / multi-persona advisory + synthesis
---

# /council — convene the Studio Council

The Council is the studio's cast of persona-agents (`.claude/agents/`). Board:
`lorn-founder` (Founder) · `midas-treasurer` (Treasurer) · `atlas-operator` (Operator) · `marie-architect` (Architect)
· `jony-designer` (Designer) · `karen-skeptic` (Skeptic) · `fred-advocate` (User's Advocate) · `saul-counsel`
(Counsel, on-call). Crew: `sherlock-researcher` (Researcher) · `bob-builder` (Builder) · `linus-reviewer`
(Reviewer). Full roster + lenses: `.claude/agents/AGENTS.md`.

There are two modes: **Quick council** (default — one round, fast) and **Debate** (multi-round, the seats argue it out). Use Quick for most decisions; Debate for the big forks.

## Quick council (default — one round)

**1. SELECT** — read the question / decision / `@file`. Pick the **3-5 relevant
seats** (never all 8 by reflex). State which seats and *why*, and who you are
leaving out. Typical panels:

| The question is about… | Convene |
|---|---|
| build-it-at-all / go-no-go | lorn-founder · midas-treasurer · fred-advocate · karen-skeptic |
| monetization / pricing | midas-treasurer · lorn-founder · karen-skeptic · fred-advocate |
| architecture / refactor | marie-architect · karen-skeptic (+ linus-reviewer if there's a diff) |
| design / UX / brand | jony-designer · fred-advocate · karen-skeptic |
| "why isn't this shipping?" | atlas-operator · marie-architect · karen-skeptic |
| anything touching legal/health/privacy | add saul-counsel |

The user may override: "convene everyone", or "just atlas-operator + marie-architect".

**2. CONVENE** — dispatch the selected agents via the Agent/Task tool, **in
parallel, within the studio's concurrency cap** (a studio note on how many agents run at once,
the one place that number lives; batch if more). Give each the
same context; each answers only from its seat.

**3. SYNTHESIZE** — return a **Council Brief**:
- one line per seat (its verdict),
- **the CONFLICTS** — where the seats disagree (this is the whole point; do not
  flatten it into consensus),
- a synthesized recommendation,
- the decision handed **explicitly back to the user**.

## Debate mode (multi-round) — when they should argue it out

The Quick council above is ONE round (parallel takes → synthesize) — right for most calls. For a **big fork** where you want the seats to genuinely *respond to and rebut each other*, run a deliberation (trigger: "debate" / "deliberate" / `--debate` / "argue it out").

⚠ The seats are dispatched one-shot and never answer each other here — so **YOU (the chair) run the rounds**, relaying each round's output into the next. No MCP, no special infra; just orchestrate the loop.

**Round 1 — Opening takes.** SELECT + CONVENE exactly as Quick mode (parallel, within the cap). Collect each seat's position verbatim.

**Round 2 — Cross-examination.** Re-dispatch the SAME seats (parallel, within the cap), but hand each one the OTHER seats' Round-1 takes, with this instruction:
> *"Here is what the other seats said: [paste their takes]. From your seat: rebut the ones you disagree with, concede any point that genuinely lands, then HOLD or UPDATE your position — with the reason. Do NOT repeat your opening; advance the argument."*

**Round 3 — Closing (optional).** Only if Round 2 leaves a live, unresolved crux: re-dispatch just the 2-3 seats still in conflict for a final word on that specific crux. Skip otherwise.

**SYNTHESIZE (deliberated).** The brief now shows more than who disagreed:
- each seat's FINAL position (and whether it moved from Round 1),
- **which arguments SURVIVED cross-examination** vs. which dissolved under it,
- the remaining irreducible crux, if any,
- the recommendation + the decision handed back to the user.

**Debate rules:**
- **Stay in your seat; rebut, don't repeat** — every round must advance the argument, not restate it.
- **Within the concurrency cap per round** (the same note; each round is its own fan-out — batch if the panel is bigger).
- **2 rounds is usually enough.** Add Round 3 only for a real unresolved crux; the chair calls time — don't let it spiral.
- **Cost-aware:** debate is roughly N seats × R rounds dispatches. Use it for forks that deserve it; Quick council for everything else.
- (For *true* real-time crosstalk — agents interjecting live — you'd need a persistent-agent runtime, not this skill. Rounds-via-chair is the right tool here.)

## Solo mode

For a single viewpoint, skip this skill — just dispatch one agent: "have `linus-reviewer`
review feat/x", "have `karen-skeptic` refute this plan", "have `atlas-operator` tell me what
ships next". No panel, no synthesis.

## Rules

- **Selectivity is the discipline** — never summon all 8 by default.
- **Surface disagreement; never average it away.** A board that nods along is
  worthless.
- **The Council advises; the user decides.** End every brief with the open
  decision, not a fait accompli.
