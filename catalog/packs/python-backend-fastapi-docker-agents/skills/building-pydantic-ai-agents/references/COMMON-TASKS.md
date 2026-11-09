# Task Reference Map

Old links used to land on sections of this file, and those sections have since moved into narrower guides. This page records where each topic went. For new work, skip it and open the narrow guide, so you load less.

## The guides, in one line each

- AGENTS-CORE: creating agents, output, deps, specs, models, run methods
- CAPABILITIES-AND-HOOKS: thinking, search capabilities, hooks, custom capabilities
- ON-DEMAND-CAPABILITIES: progressive disclosure and capabilities loaded when asked for
- TOOLS-CORE: function tools, toolsets, MCP, named search tools
- NATIVE-TOOLS: tools the provider runs for you
- TOOLS-ADVANCED: approval, retries, rich returns, timeouts, validators, tool-level deferral
- INPUT-AND-HISTORY: media input, conversation history, history processors
- TESTING-AND-DEBUGGING: fake models, message capture, Logfire
- ORCHESTRATION-AND-INTEGRATIONS: agent teams, graphs, A2A, bare model calls, durable execution, embeddings, evals, outside tool libraries

## Where each old topic went

Open the file named, then find the section by its title.

| Old topic | File | Section title |
|---|---|---|
| Adding capabilities | [file](./CAPABILITIES-AND-HOOKS.md) | the first section, on adding capabilities |
| Progressive disclosure | [file](./ON-DEMAND-CAPABILITIES.md) | the whole file |
| Lifecycle hooks | [file](./CAPABILITIES-AND-HOOKS.md) | the one on intercepting the lifecycle |
| Declarative specs | [file](./AGENTS-CORE.md) | the one on defining agents declaratively |
| Thinking on any provider | [file](./CAPABILITIES-AND-HOOKS.md) | the one on enabling thinking |
| MCP servers | [file](./TOOLS-CORE.md) | the one on MCP servers |
| DuckDuckGo, Tavily or Exa | [file](./TOOLS-CORE.md) | the last section |
| Human approval of tool calls | [file](./TOOLS-ADVANCED.md) | the first section |
| Images, audio, video, documents | [file](./INPUT-AND-HISTORY.md) | the first section |
| Context size | [file](./INPUT-AND-HISTORY.md) | the one on managing context size |
| Message history | [file](./INPUT-AND-HISTORY.md) | the one on working with history |
| Live progress | [file](./AGENTS-CORE.md) | the one on run methods and streaming |
| Provider failures | [file](./AGENTS-CORE.md) | the last section |
| Retries | [file](./TOOLS-ADVANCED.md) | the one on resilience with retries |
| A failed run | [file](./TESTING-AND-DEBUGGING.md) | the one on debugging a failed run |
| Testing behavior | [file](./TESTING-AND-DEBUGGING.md) | the first section |
| Several agents | [file](./ORCHESTRATION-AND-INTEGRATIONS.md) | the first section |
| Graph workflows | [file](./ORCHESTRATION-AND-INTEGRATIONS.md) | the one on multi-step workflows |
| Debugging and validating | [file](./TESTING-AND-DEBUGGING.md) | the Logfire section at the end |

## Rarer features

All are sections of [ORCHESTRATION-AND-INTEGRATIONS](./ORCHESTRATION-AND-INTEGRATIONS.md). Read only the part you need:

- bare model calls
- durable runs
- embeddings
- LangChain tools
- custom toolsets, models and agents
- evals

## If the answer is only in the installed package

Look at the checked-out repository and the bundled references first. Reading the installed package source is the last resort, justified only when:

- the symbol you need is covered nowhere in this skill
- `pydantic_ai` is installed locally and you need the exact module layout
- no smaller offline reference answers the question
