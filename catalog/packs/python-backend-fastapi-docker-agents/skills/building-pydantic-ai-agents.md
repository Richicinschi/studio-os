---
name: building-pydantic-ai-agents
description: Use when the user mentions Pydantic AI or asks to test agent behavior, get structured output, design multi-agent patterns, define agents from YAML, then stream output, or build an AI agent. Also when code imports pydantic_ai, to add tools or capabilities, or defer capability loading.
metadata:
  scan: SkillSpector, no findings
  category: backend
  author: Richicinschi
  version: "1.1.0"
  domain: backend work on LLM agents in Pydantic AI, kept ready for the studio's AI product ideas
compatibility: Needs Python 3.11 or newer
---

# Building agents with Pydantic AI

Pydantic AI is a Python framework for putting LLM-backed features into real applications. This file is a map. It has short working examples, then points to reference files. Open a reference only when the task calls for it.

## Use it when

- An agent or LLM-powered app has to be built, or Pydantic AI is named.
- Tools, capabilities (thinking, web search) or typed output are being added to an agent.
- Agents are described in YAML or JSON, possibly with template strings.
- The job is streaming agent events, passing work between agents, or testing an agent.
- Code imports `pydantic_ai` or touches `Agent`, `RunContext` or `Tool`.
- Hooks, lifecycle interception or Logfire tracing come up.
- The design includes instructions or tools the model needs only occasionally: specialist workflows, a long tail of tools, bulky background context.

## Skip it when

- Only the `pydantic` validation library is in play, with no agent.
- The project uses another framework such as LangChain, LlamaIndex, CrewAI or AutoGen.
- The Python task has nothing to do with AI agents.

## Examples

### 1. The smallest agent

```python
from pydantic_ai import Agent

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    instructions='Reply in French, in one line.',
)

result = agent.run_sync('Say good morning to my neighbour.')
print(result.output)
```

### 2. Tools with and without context

```python
import random

from pydantic_ai import Agent, RunContext

agent = Agent(
    'google:gemini-3-flash-preview',
    deps_type=str,
    instructions=(
        'You referee a coin toss. Flip the coin, compare it with the '
        "player's call and announce the winner by name."
    ),
)


@agent.tool_plain
def flip_coin() -> str:
    """Flip a coin and report heads or tails."""
    return random.choice(['heads', 'tails'])


@agent.tool
def player_name(ctx: RunContext[str]) -> str:
    """Return the name of the player."""
    return ctx.deps


result = agent.run_sync('I call tails', deps='Maya')
print(result.output)
```

### 3. Typed output

```python
from pydantic import BaseModel

from pydantic_ai import Agent


class BookInfo(BaseModel):
    title: str
    author: str
    year: int


agent = Agent('google:gemini-3-flash-preview', output_type=BookInfo)
result = agent.run_sync('Tell me about the novel Dune.')
print(result.output)  # a validated BookInfo
print(result.usage)   # token and request totals for the run
```

### 4. Dependencies feeding the instructions

```python
from datetime import datetime

from pydantic_ai import Agent, RunContext

agent = Agent(
    'openai:gpt-5.2',
    deps_type=str,
    instructions='Be polite and address the person by name.',
)


@agent.instructions
def person(ctx: RunContext[str]) -> str:
    return f'You are talking to {ctx.deps}.'


@agent.instructions
def clock() -> str:
    return f'The current time is {datetime.now():%H:%M}.'


result = agent.run_sync('What time is it?', deps='Priya')
print(result.output)
```

### 5. A test with no real model

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

bot = Agent('openai:gpt-5.2', instructions='Help with billing questions.')


async def test_bot_answers():
    fake = TestModel()
    with bot.override(model=fake):
        result = await bot.run('hello')
        assert result.output == 'success (no tool calls)'
    assert fake.last_model_request_parameters.function_tools == []
```

### 6. Capabilities

A capability is a reusable bundle of tools, hooks, instructions and model settings that composes with others.

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import Thinking, WebSearch

agent = Agent(
    'anthropic:claude-opus-4-6',
    instructions='You investigate questions carefully and list where each fact came from.',
    capabilities=[Thinking(effort='medium'), WebSearch()],
)
```

### 7. A lifecycle hook

`Hooks` attaches handlers by decorator, so nothing needs subclassing.

```python
from pydantic_ai import Agent, RunContext
from pydantic_ai.capabilities.hooks import Hooks
from pydantic_ai.models import ModelRequestContext

hooks = Hooks()


@hooks.on.before_model_request
async def note_size(ctx: RunContext, request_context: ModelRequestContext) -> ModelRequestContext:
    print(f'about to send {len(request_context.messages)} messages')
    return request_context


agent = Agent('openai:gpt-5.2', capabilities=[hooks])
```

### 8. An agent loaded from a file

`Agent.from_file` reads YAML or JSON, so the agent needs no construction code.

```python
from pydantic_ai import Agent

# support.yaml
# model: anthropic:claude-sonnet-4-6
# instructions: You answer questions about shipping times.
# capabilities:
#   - WebFetch
#   - Thinking:
#       effort: low

agent = Agent.from_file('support.yaml')
```

## Which reference to open

The reference files sit in the folder `building-pydantic-ai-agents/references/`. Pick the single best match first, and add another only when the task spans areas.

| Task | File |
|---|---|
| Build or configure an agent, choose output types, pass deps, write specs and template strings, pick a run method or model, fail over between providers | `AGENTS-CORE.md` |
| Package reusable behavior, switch on thinking, intercept lifecycle events | `CAPABILITIES-AND-HOOKS.md` |
| Decide what loads at the start and what loads later, defer a capability, understand `load_capability` | `ON-DEMAND-CAPABILITIES.md` |
| Function tools, toolsets, MCP servers, named search tools | `TOOLS-CORE.md` |
| Search, fetch or code execution run by the provider | `NATIVE-TOOLS.md` |
| Human approval, retries, argument validators, timeouts, `ToolReturn`, tool search | `TOOLS-ADVANCED.md` |
| Media as input, message history, trimming context, injecting messages mid-run | `INPUT-AND-HISTORY.md` |
| Test or debug an agent | `TESTING-AND-DEBUGGING.md` |
| Agents cooperating, or graph workflows (start at the section on coordinating agents) | `ORCHESTRATION-AND-INTEGRATIONS.md` |
| Bare model calls, A2A, durable execution, embeddings, evals, third-party tools | `ORCHESTRATION-AND-INTEGRATIONS.md` |
| Compare abstractions, output modes, decorators or provider prefixes | `ARCHITECTURE.md` |
| An old link into `COMMON-TASKS.md`, or an old section name to place | `COMMON-TASKS.md` |

## Architecture guide

Open ARCHITECTURE only when someone is choosing between abstractions or wants a table or decision tree. It contains:

- trees for registering tools, picking an output mode, a multi-agent pattern, an extension point, eager or deferred loading, a capability, and a test approach
- tables for output modes, provider prefixes, tool decorators, built-in capabilities and agent methods
- a short account of how a run flows and the main generic types

Facts to keep handy (model ids in the examples are samples; the installed version's known-model list is the authority):

- A model string reads `provider:model-name`, such as `openai:gpt-5.2`, `anthropic:claude-sonnet-4-6` or `google:gemini-3-pro-preview`.
- An agent can be driven by `run()`, `run_sync()`, `run_stream()`, `run_stream_sync()`, `run_stream_events()` or `iter()`.

## Habits

- Target Python 3.11 or newer, the floor stated in the Pydantic AI installation guide.
- For each capability, ask whether `defer_loading=True` would pay off. Keep specialist instructions, rare tool schemas and domain background out of the always-on prompt unless most turns need them. Named bundles of instructions plus tools fit capabilities on demand. A large flat set of tools fits tool search.
- Trace with Logfire: `logfire.instrument_pydantic_ai()` records runs, tool calls and model requests, and `logfire.instrument_httpx(capture_all=True)` adds the raw request and response headers and bodies for providers that go through httpx (Bedrock uses boto3, so it is not covered).
- Use `TestModel` when generated valid output is enough, and `FunctionModel` when a test needs scripted replies.

## Pitfalls

Each of these fails quietly or with a confusing error.

- `@agent.tool` must take `RunContext` first. `@agent.tool_plain` must not. When nothing from the run is needed, use `tool_plain`.
- A bare model name such as `'gpt-5.2'` cannot be resolved; write `'openai:gpt-5.2'`.
- In tests, do not assign `agent.model`. Use `with agent.override(model=TestModel()):`.
- If `output_type` contains `str`, or is unset, the model may finish with ordinary text. Remove `str` from the union to require structured output through a tool.
- Hook names under `.on` leave off the `on_` prefix: `hooks.on.run_error`, `hooks.on.model_request_error`.
- Avoid the deprecated `history_processors` argument. Use `capabilities=[ProcessHistory(fn)]`, or attach `before_model_request` through `Hooks`. `ProcessHistory` merely wraps that hook. Version 1.x still accepts the old argument but warns with `PydanticAIDeprecationWarning`, and version 2 drops it.
