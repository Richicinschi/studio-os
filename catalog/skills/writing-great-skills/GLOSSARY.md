# Glossary: building great skills

This is the vocabulary behind [`writing-great-skills`](SKILL.md). A skill pulls repeatable behaviour out of a random system, and each term here names one lever on that. A **bold** word inside an entry has its own entry below.

## Language

### Predictability

How far a skill makes the agent work the same _way_ each run. The process repeats; the output need not (a brainstorming skill should reliably branch out, so its words differ while its behaviour holds). Every other term serves this one. Cost and upkeep follow from it and do not compete with it.

_Avoid_: identical output, consistency, robustness, reliability

### Model-Invoked

A skill that holds on to its **description**, so the agent sees it and may start it unasked. Typing the name still works for you, so human reach is always part of this state. Nothing is agent-only: a description adds agent discovery and never takes away yours. The cost is a permanent **context load**. Other skills can call it, because the description that lets the agent find it also lets them. A model-invoked skill made wholly of **reference** is also a shared home for that reference, since several skills can call it. Choose this mode only when the agent must find the skill unaided; a skill started only by hand should drop its description and its load.

_Avoid_: capability, tool, ability

### User-Invoked

A skill whose **description** is removed, so the agent never sees it and you alone, by typing its name, can start it. Think of it as human-only, against **model-invoked** as human-plus-agent. It trades discoverability for zero **context load**. No other skill can start it either.

_Avoid_: command, workflow, procedure

### Description

A skill's trigger text written for the machine: the single **context pointer** a **model-invoked** skill must leave in view permanently. Having it is what makes a skill model-invoked and callable by other skills; removing it makes the skill **user-invoked**. It is the origin of a skill's **context load**.

_Avoid_: summary, frontmatter

### Context Pointer

Text held in the agent's window that points to material kept elsewhere and states the condition for fetching it. The **description** is the top pointer (window to skill). A link to a disclosed file is the same thing one level lower. Its wording decides _when_ the agent goes and _how dependably_. If vital material sits behind a loosely worded pointer, the result is erratic behaviour: improve the wording first, and put the material inline only if that fails.

_Avoid_: import, reference, link

### Context Load

What a **model-invoked** skill costs the agent's window: its **description**, always present, uses tokens and attention. **User-invoked** skills avoid it by having no description. It is the check on adding more model-invoked skills.

_Avoid_: context bloat, token cost

### Cognitive Load

What a **user-invoked** skill costs you: which skills exist and when each applies live in your head, so you act as the index. **Model-invocation** lifts this by letting the agent find the skill. It caps how many user-invoked skills are sensible. Do not try to drive it to zero: it buys you a say in the loop. Pay it where your judgment is needed and shed it everywhere else.

_Avoid_: overhead, burden, human index

### Granularity

How finely skills are divided. Each finer cut spends a load: more **model-invoked** skills crowd the window (**context load**); more **user-invoked** skills give you more to remember (**cognitive load**). Two cuts guide it. By invocation: give a skill its own model-invoked identity when it has a **leading word** that you really use in prompts. By sequence: break a run of **steps** where **post-completion steps** need hiding, because a separate context removes what follows. The reverse is a hazard: joining sequences puts every step's later steps in view and invites **premature completion**.

_Avoid_: modularity, chunking

### Router Skill

A **user-invoked** skill whose whole job is to list your other user-invoked skills and say when each fits, leaving you one name to recall. It can suggest but never start them, as they have no **description** for it to use. It is the answer to **cognitive load** once user-invoked skills pile up.

_Avoid_: router procedure, index, registry, menu, dispatcher

### Information Hierarchy

A ladder that orders skill content by how soon the agent needs it. Two questions place each piece: is it in the file or behind a pointer, and is it a step or reference. Resulting rungs, best first:

1. **Steps**, in the file
2. **Reference**, in the file
3. **Reference**, disclosed behind a **context pointer**

A skill without **steps** has only the lower two rungs, often as a flat set of equal rules (every check of a review side by side), which is a sound layout. The ladder does not depend on invocation mode. If a skill has steps and its in-file reference ought to have been disclosed, that reference buries the steps and makes attention to them a gamble, which is a source of variance and not only of clutter. Keep the top readable and push down all that can go.

_Avoid_: layout, organization, structure

### Co-location

Putting what the agent needs together in one spot: one heading holds a concept's definition, its rules and its exceptions, nothing strewn around the file. It complements the **Information Hierarchy**, which settles how far down material goes while co-location settles its neighbours. No formula gives the right shape for **reference**; judge by whether the skill reads as documentation made for the agent; grouped material passes that test and scattered material fails it. It differs from **Duplication**, where one meaning is repeated, because scattering breaks one meaning into pieces.

_Avoid_: cohesion, clustering, grouping

### Branch

A separate way of using a skill, which sends different runs down different routes. Skills with many steps often have several; a strictly linear one has none.

_Avoid_: fork, case, path

### Progressive Disclosure

Shifting **reference** down the ladder into a separate file reached by a **context pointer**, which keeps the top legible. Its main value is guarding the **information hierarchy**, not saving tokens. **Branches** justify it: disclose what only some routes use, leave inline what all routes need. Should a pointer get skipped when it ought to fire, reword it; bring the material back inline only if rewording fails.

_Avoid_: chunking, lazy loading

### Steps

The actions an agent performs in sequence. When a skill has them they form its top content tier and live in SKILL.md. Many skills lack them: one can be pure steps (`tdd`), pure **reference** (a checklist for reviewers) or a mix, in either invocation mode. Each step finishes on a **completion criterion**, sharp or loose.

_Avoid_: choreography, instructions, workflow

### Completion Criterion

The condition telling the agent a piece of work is finished. It has two properties. **Clarity** is whether the agent can tell done from not done; a vague bound ("good enough grasp") lets it declare victory and move on, which needs steps to happen, since **premature completion** is a failure between steps. **Demand** is how much the criterion requires and so sets **legwork**: "every failing test has an owner" drives more digging than "list the failing tests". Demand does not need steps, so it can bind flat reference too, as in "every rule applied". The best criteria are checkable and exhaustive.

_Avoid_: stopping rule, exit condition, done condition

### Post-Completion Steps

Whatever **steps** lie beyond the one under way. If the agent can see them, they drag it toward **premature completion**, more strongly the more it sees. Hide them by cutting the sequence into two skills.

_Avoid_: lookahead, fog of war, horizon

### Legwork

Work an agent does unseen within a single step: opening files, probing the code, trying edits, and digging out facts instead of asking you. It sits beneath the step structure, is never written as a step, hides in the phrasing, and the agent steers it more than the skill does. It is the inside-a-step counterpart of the pull that **post-completion steps** exert across steps. A **leading word** (_exhaustive_, _relentless_) or a demanding **completion criterion** raises it, including the demand on flat reference, which makes a stepless skill cover every rung. It thins when demand is absent or when **premature completion** cuts a step short.

_Avoid_: coverage, diligence, effort, scope

### Reference

Content the agent looks up as needed: definitions, facts, parameters, examples, conditional guidance. With **steps** present it comes second; without them it is the whole skill; it may also live outside skills altogether (see **External Reference**). **Context pointers** lead to it, and it is the first thing to consider for **progressive disclosure**.

_Avoid_: background, docs, supporting material

### External Reference

**Reference** kept outside the skill system as an ordinary file with no **description**, no **steps** and no way to be invoked. Any skill may point to it. Put shared reference here when it never needs to start itself; two **user-invoked** skills can share nothing else, because neither can start the other.

_Avoid_: knowledge base, resource, doc

### Leading Word

A short concept, sometimes called a _Leitwort_, that the model already carries from training and the agent thinks with while the skill runs. It packs a behavioural principle into very few tokens by recruiting what the model knows (_ledger_, _smoke test_, _scaffold_, _quarantine_). Repeated as a token, never expanded into a sentence, it builds meaning across the skill and anchors a wide area of behaviour. You can invent one if you define it well, but an invented word recruits nothing, so you pay in definition tokens for what an existing word gives free. Prefer an existing word.

It serves **predictability** in two places. Inside the body it anchors **execution**: each time the idea appears, the agent reaches for the same behaviour, and in flat reference the word points attention at a kind of thing to look for. Inside the **description** it anchors **invocation**, and that reaches past the skill: if your prompts, notes and code share the word, the agent connects that vocabulary to the skill and starts it more dependably. Build the description from the leading words you truly say when you want this skill.

_Avoid_: motif, term, keyword

### Single Source of Truth

The goal that every meaning has exactly one authoritative location, so altering behaviour means one edit. **Duplication** violates it.

_Avoid_: canonical location, home

### Relevance

Whether a line still connects to the job the skill does; the lens for choosing what stays. A line fails it in two ways: it never connected (backstory, or a **branch** that belongs in a disclosed file), or it went stale as the behaviour or surrounding world changed. Short skills are easier to keep relevant, as each line costs little to check. Do not mix it up with **no-op**: relevance asks if a line connects to the task, no-op asks if it alters behaviour.

_Avoid_: freshness, staleness, load-bearing

## Failure Modes

### Premature Completion

The agent quits a step early because its attention has moved to being done and away from the work itself. It is a failure between steps, so it needs **steps** to exist: a stepless skill abandoned halfway shows thin **legwork** against a demand that was never met, which is a separate matter. Two forces oppose each other. Visible **post-completion steps** drag the agent forward; the clarity of the **completion criterion** holds it back, because a checkable bar stays firm and a vague one yields. A fuzzy bound is the precondition. A sharp bound withstands any number of visible later steps, so a step that never gets rushed needs no protection. When one does get rushed, apply two remedies in sequence. **Tighten the bound first**: it is local and costs little. Only if the criterion stays irreducibly fuzzy and you have actually watched the rush should you **hide the later steps**, and hiding works only across a genuine context boundary (a hand-off to a user-invoked skill, or a subagent dispatch). Calling a model-invoked skill inline keeps the later steps in view and hides nothing. Thin legwork has other causes too, since a step can run to full completion and still be shallow.

_Avoid_: shortcutting, rushing, the rush, premature closure

### Duplication

A meaning stored in several places when the **single source of truth** says one. The bills: upkeep (edit one copy and you must chase the rest), tokens, and inflated importance, because repetition lifts a meaning above its real rank. It is the accidental opposite of a **leading word**, which repeats a token deliberately to draw attention and never repeats the meaning.

_Avoid_: redundancy, repetition

### Sediment

Old content that settles in a skill and never gets cleared, because adding feels safe and deleting feels risky. Stale and irrelevant lines pile up until you have to dig past them to find what is live. A skill with no pruning habit ends up this way by default. It is a gradual loss of **relevance**, whereas **duplication** is meaning stated twice.

_Avoid_: rot, cruft, bloat, accretion

### Sprawl

A skill whose SKILL.md is simply too long, whatever the cause. Even when every line is live and none repeats another, it can sprawl. The costs are readability (the agent wades further before acting and its attention spreads thin), upkeep (every added line is another to keep **relevant**) and tokens. The remedy is the **information hierarchy**: move **reference** behind **context pointers**, and divide by **branch** or by sequence so each route carries only what it uses. Contrast **sediment**, which is length from stale buildup, and **duplication**, which is length from repeated meaning. Sprawl is length as such.

_Avoid_: verbosity, size, length, bloat

### No-Op

An instruction that alters nothing because the model would behave that way anyway, so you pay load to tell the agent what it already does. Test any line by asking whether it changes behaviour compared with the default. A line may be fully **relevant** and still be a no-op. Prior knowledge is why a **leading word** costs nothing, and it is also why a no-op is worth nothing.

The two ideas sit on different axes and cross: a leading word is a _technique_, while no-op is a _verdict_ passed on a line. A leading word too weak to beat the default earns the verdict (_be careful_ to an agent that is already careful), and the cure is a stronger word that survives it (_paranoid_), not a new technique. That same test grades whether a leading word pays for its repetitions. The verdict depends on the model, not on the reader: when two people disagree whether a line is a no-op, they disagree about the default, and running the skill settles it where debate does not.

_Avoid_: belaboring, restating the obvious, redundant instruction
