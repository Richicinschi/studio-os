---
title: Agents and the council
pack: way-of-working
sources:
  - .studio/memory/project_studio_council.md
  - .claude/skills/council/SKILL.md
  - .claude/agents/karen-skeptic.md
  - .claude/agents/marie-architect.md
  - .claude/agents/linus-reviewer.md
  - .claude/agents/sherlock-researcher.md
  - .claude/agents/atlas-operator.md
questions:
  - "Do you make decisions where a second opinion helps, such as a tool choice, an agent's design or a dashboard's main metric?"
  - "Would you rather run one reviewer at a time, or a panel that argues?"
---

# Agents and the council

## The problem

One model gives one view, shaped by how you framed the question. Asking the same thread for a second opinion gets the same view again. A big decision, such as a tool choice, a design or what to ship first, deserves someone whose whole job is to find what is wrong with it. A board that nods along is worthless.

## The mechanism

- **Persona agents: one seat, one question each.** A Claude Code agent is a Markdown file with a name, a description and its instructions (where they load from: [docs/facts.md](../../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"). Each studio seat carries one lens:
  - the skeptic ([`karen-skeptic`](../../catalog/agents/karen-skeptic.md)) asks what breaks. It returns the three likeliest ways a plan fails, each with its trigger, then the one assumption that sinks everything if it is wrong;
  - the architect ([`marie-architect`](../../catalog/agents/marie-architect.md)) asks whether this is the simplest thing that works;
  - the reviewer ([`linus-reviewer`](../../catalog/agents/linus-reviewer.md)) asks whether the diff is right, with findings by file and line and a verdict;
  - the researcher ([`sherlock-researcher`](../../catalog/agents/sherlock-researcher.md)) asks what the sources say, and returns a cited report.

  The studio has eleven seats: a board that advises and a crew that does the work.
- **Tools follow the role.** A subagent's `tools:` line is an allowlist ([docs/facts.md](../../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"). The seven advisors get no Write, Edit or Bash, so "read-only" is enforced by what they lack, not by a promise. Two seats are exceptions: the operator ([`atlas-operator`](../../catalog/agents/atlas-operator.md)) advises but also writes plans, so it carries Write, Edit and Bash; the reviewer keeps Bash for git and tests, and Bash can change files, so its read-only is a rule it follows, not a limit. The crew gets the writes its work needs. No seat sets a model, so each runs on the session's, unless `CLAUDE_CODE_SUBAGENT_MODEL` is set.
- **Solo for one view.** "Have the reviewer look at this branch."
- **`/council` for a real fork.** The `council` skill:
  1. selects three to five relevant seats, never all of them by reflex, and says who it left out;
  2. convenes them in parallel with the same context;
  3. synthesizes: one line per seat, then the conflicts, then a recommendation, and the decision handed back to you.
- **`--debate` for the big forks.** The convener runs rounds and carries each round's answers into the next. Each seat gets the others' opening takes and must rebut, concede what lands, then hold or update its position. A third round only for a crux still open. The cost is roughly seats times rounds, so keep it for decisions that deserve it.

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

When the studio built its council, it had over a hundred skills and no agents of its own. It had just rejected a large outside framework, so it wrote thin seats that call its own skills instead of importing a coupled one.

The first live test dispatched all eleven seats, and each answered in character. Then a real debate ran on a product question: two rounds, in which the seats moved their positions and corrected each other instead of agreeing.

By design, the convener does not vote and does not average. It surfaces the conflict, says which arguments survived cross-examination, and hands the decision back to the person who asked.

## Apply it in Claude Code

1. **Pick two or three seats** you would use this month. The skeptic and the architect suit most decisions; the reviewer suits anyone who merges code. All eleven are in `catalog/agents/` ([the index](../../catalog/INDEX.md) lists them).
2. **Take each through `vet-and-adopt`** (ADAPT). The seats carry the studio's framing: its portfolio of projects, its context files and registry, its design system, and skills you may not have. Replace those with your projects, files and skills, or cut the lines. Keep the lens, the output format and the tool list.
3. **Save them** in `.claude/agents/` for one project or `~/.claude/agents/` for all of them.
4. **Keep advisors read-only:** no Write, Edit or Bash in their `tools:` line, since Bash can change files too. Leave `model:` out so each seat uses the session's model (module 02; [docs/facts.md](../../docs/facts.md) gives the order Claude Code follows).
5. **Try one seat solo:** "Have `karen-skeptic` refute this plan."
6. **Adopt `council`** once you have three seats (ADAPT: its seat list and panel table name the studio's eleven, so rewrite them to yours).
7. **Use `/council`** for real forks, and `--debate` only when one round leaves the seats split.

(studio-specific: `council` points to a roster file, a long-running agent service and a studio note on how many agents run at once, none of which the kit ships, and the studio checks its seats' front matter with a small script. Drop the pointers; set a cap on parallel seats that suits your plan.)

## Apply it in claude.ai

Whether the claude.ai chat app has subagents is not documented ([docs/facts.md](../../docs/facts.md)), so on this route you play the convener.

1. **Add two seat files** to a Project's knowledge: the lens and output sections of the skeptic and the architect.
2. **Ask each seat in its own chat** in that Project, so one view does not colour the next: "Answer as the skeptic file describes: the three likeliest ways this breaks, and the assumption that sinks it."
3. **For a debate,** paste each seat's answer into the other's chat and ask it to rebut, concede, then hold or update.
4. **Close it yourself:** where they disagree, and what you decide.

Catalog items used here: [council](../../catalog/skills/council/SOURCE.md) · [karen-skeptic](../../catalog/agents/karen-skeptic.md) · [marie-architect](../../catalog/agents/marie-architect.md) · [linus-reviewer](../../catalog/agents/linus-reviewer.md) · [sherlock-researcher](../../catalog/agents/sherlock-researcher.md).
