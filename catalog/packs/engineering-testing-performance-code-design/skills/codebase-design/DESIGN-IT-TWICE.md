# Design It Twice

Reach for this when the user wants to see other interface options for a deepening candidate they have already picked. The idea comes from Ousterhout's "Design It Twice": the first design is rarely the best one, so produce several in parallel with sub-agents.

Terms used below (module, interface, seam, adapter, leverage) are defined in [SKILL.md](../codebase-design.md).

## Process

### 1. Describe the problem space

Before launching any sub-agent, write a short explanation for the user covering the chosen candidate:

- the constraints that any new interface must meet
- what it will depend on, and which kind each dependency is (see [DEEPENING.md](DEEPENING.md))
- a rough code sketch that makes the constraints concrete; it illustrates, it does not propose

Show it to the user and go straight on to step 2. They can read while the sub-agents run.

### 2. Launch the sub-agents

Start at least three sub-agents at the same time with the Agent tool. Every one must come back with an interface that is **radically different** from the others.

Give each a technical brief of its own: file paths, how things are coupled, the dependency kind from [DEEPENING.md](DEEPENING.md), and what lies behind the seam. This brief is separate from the explanation written in step 1. Hand each agent a different design constraint:

- Agent 1: "Shrink the interface to one to three entry points. Get the most leverage from each."
- Agent 2: "Favour flexibility, with room for many use cases and extensions."
- Agent 3: "Serve the commonest caller best, so the default case is trivial."
- Agent 4, when it fits: "Build around ports and adapters for the dependencies that cross the seam."

Put the vocabulary of [SKILL.md](../codebase-design.md) and that of CONTEXT.md into every brief, so the agents use the architecture words and the project's domain words alike.

Each agent reports:

1. the interface: types, methods, parameters, plus invariants, call order and failure modes
2. an example of a caller using it
3. what the implementation keeps hidden behind the seam
4. how it treats dependencies, and which adapters it needs (kinds are in [DEEPENING.md](DEEPENING.md))
5. trade-offs, naming where leverage is strong and where it is weak

### 3. Show and compare

Present the designs one after another so the user can take each in, then compare them in prose along three lines: **depth** (leverage at the interface), **locality** (where change gathers) and **seam placement**.

Finish with your own pick and the reason. If parts of different designs fit together, suggest a hybrid. Take a position; the user wants a clear opinion, not a list of options.
