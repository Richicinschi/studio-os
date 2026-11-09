---
name: writing-great-skills
description: >-
  Use when authoring or editing, adapting or reviewing a Claude Code skill (SKILL.md), by principles that make it predictable. Triggers: "why isn't my skill firing", "improve this skill", "write a skill"; questions on descriptions, granularity, progressive disclosure. Pairs with vet-external-skill
metadata:
  category: studio
  author: Richicinschi
  version: 1.1.0
  domain: Claude Code skill authoring + review
---
An agent is a random process. A skill narrows it. What you want back is the same _way of working_ on every run, not the same words out. That is **predictability**, and every choice below serves it.

Terms in **bold** have full definitions in [`GLOSSARY.md`](GLOSSARY.md).

## Invocation

Each skill sits on one side of a trade.

- **Model-invoked.** The skill keeps a **description**. The agent can start it unprompted, other skills can call it, and typing its name still works for you too. The price is **context load**: the description is in the window on every turn. To get this, leave out `disable-model-invocation` and write trigger-rich wording ("Use when the user wants..., mentions...").
- **User-invoked.** The skill has no description the agent can see, so only you can start it, by name, and no skill can call it. The context load is zero, but you carry **cognitive load**: you must remember it exists. To get this, set `disable-model-invocation: true` and turn the description into a one-line summary for humans with no trigger list.

Choose model-invoked only when the agent, or another skill, has to reach the skill without you. A skill you only ever start by hand should be user-invoked.

Once you own more user-invoked skills than you can recall, add a **router skill**: one user-invoked skill that lists the rest and says when each fits.

## Writing the description

A model-invoked **description** states what the skill is and names the **branches** that should fire it. It is loaded every turn, so prune it harder than the body.

- Put the **leading word** at the front. The description is where that word does its work of getting the skill picked.
- Give each branch one trigger. Two phrasings of the same branch is **duplication** ("when the user wants a script" plus "when asked to write a script" is one branch said twice). Keep only triggers that differ in kind.
- Leave out anything the body already says about what the skill is. What remains is triggers, plus a "when another skill needs this" clause if that applies.

## Information hierarchy

Skill content is either **steps** or **reference**, and one skill may hold both. The question is where each piece sits on the **information hierarchy**, which ranks material by how soon the agent needs it.

1. **Step in the skill.** An action, in order, in `SKILL.md`. Each ends on a **completion criterion**. Make it checkable, so the agent can tell finished from unfinished, and where the work matters make it exhaustive ("every failing test has an owner" beats "list the failing tests"). A vague criterion lets the agent stop early: **premature completion**.
2. **Reference in the skill.** Facts, rules and definitions held in `SKILL.md` and consulted when needed. Rules that carry equal weight can legitimately sit side by side on this rung. Nothing is wrong with that. This skill is all reference.
3. **External reference.** Material moved out of `SKILL.md` and reached through a **context pointer**. It can be a sibling file such as `GLOSSARY.md`, or a file outside the skill system that any skill may point to.

An exacting completion criterion produces **legwork**, the digging done inside a step. This holds for a pile of rules as much as for a sequence: "every rule checked" is a bar for reference too.

Moving too little down leaves the top crowded. Moving too much hides what the agent needs. Balance the two.

### Progressive disclosure

**Progressive disclosure** moves material down the ladder into a linked file named for what it holds (this skill sends its full definitions to `GLOSSARY.md`), so the top of `SKILL.md` stays easy to read. The test is the **branch**. A branch is one distinct way the skill gets used. Keep inline what all branches need. Put behind a pointer what only some branches need. The _wording_ of a **context pointer** decides whether and when the agent follows it; the target does not.

**Co-location** is the partner rule. Wherever material ends up, gather everything about one concept (what it is, its rules, its exceptions) beneath a single heading, so reading one part brings the rest along.

## When to split

**Granularity** means how many skills the work is divided into. Each division spends one of the two loads, so divide only when it earns the spend. There are two kinds of cut.

- **By invocation.** Make a separate model-invoked skill when it has its own **leading word** that should start it, or when another skill has to reach it. You are buying a permanent description in the window, so the independent reach must be worth that.
- **By sequence.** Break a run of steps in two when what comes later (the **post-completion steps**) pulls the agent into rushing the step in front of it. Out of sight, the later steps stop pulling, and the agent does more **legwork** now.

## Pruning

Hold each meaning in one place only, a **single source of truth**, so a behaviour change is one edit.

Ask of every line whether it keeps its **relevance**, meaning it still connects to the job the skill does today.

Finally, go sentence by sentence, not just line by line, and put each sentence alone through the **no-op** test. If the sentence changes nothing the agent would do anyway, remove the whole sentence. Do not trim words off it. Most sentences that fail should be deleted outright.

## Leading words

Here a **leading word** means a brief concept the model picked up in training, which the agent reasons with as the skill runs (_ledger_, _smoke test_, _scaffold_, _quarantine_). Used again and again, it builds up meaning across the text and holds a large area of behaviour in very few tokens. A strong one may need to appear only once.

It helps predictability in two places. In the body it fixes _execution_: the same behaviour comes up whenever the word does. In the description it fixes _invocation_: if your prompts, notes and code already use that word, the agent links your request to the skill.

Look for places where a leading word can replace a longer passage. A three-part list spelled out in three places is duplication. A description that burns a sentence pointing at one idea wants a single token. Two illustrations:

- "small, quick, cheap to run" repeated across a section becomes _lean_, a single word for one quality.
- "check the build and see whether it passes" becomes _green_: the build is green or it is not, a yes-or-no state in place of a loose judgment.

The payoff is fewer tokens and a firmer handle for the agent's reasoning. Expect your own skill to hide restatements of this kind, and hunt for them.

## Failure modes

When a skill misbehaves, match the symptom to one of these.

- **Premature completion.** The agent leaves a step before the work is done because it is thinking about being finished. Treat it in two moves. First tighten the completion criterion, the cheap local fix. Only if the criterion cannot be made sharp, and you have seen the rush, split the sequence so later steps are hidden.
- **Duplication.** One meaning in several places. It costs upkeep and tokens and makes the meaning look more important than it is.
- **Sediment.** Old layers pile up because adding feels safe and deleting feels risky. Any skill with no pruning habit ends up here.
- **Sprawl.** The skill is plain too long, though each line may be alive and unique. Readability, upkeep and tokens all suffer. Push reference behind pointers, and divide along branches or sequence.
- **No-op.** A line that repeats the model's default. It costs load and changes nothing. If the cause is a weak leading word (_be careful_ for an agent that is already careful), swap in a stronger one (_paranoid_) rather than adding technique.

## Pressure-testing

A skill that makes the agent do what it is tempted to skip should be tested before release, like code. Give a subagent without the skill a pressure scenario and note what it gets wrong (red). Then write the skill to answer those failures (green). Then find the fresh excuses the agent invents and close them (refactor). For the full method, open the testing guide at `references/testing-skills-with-subagents.md`. For shutting the loopholes it uncovers, open `references/bulletproofing.md`.
