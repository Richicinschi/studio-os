# Agents Core

Open this for the everyday `Agent` workflow: building one, choosing its output type, passing dependencies, writing a spec, picking a model, and deciding how to run or stream it.

## Create a Basic Agent

```python
from pydantic_ai import Agent

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    instructions='Answer as a friendly librarian, briefly.',
)

result = agent.run_sync('How do I find a book about beekeeping?')
print(result.output)
```

## Structured Output with Pydantic Models

Set `output_type` to a Pydantic model and the reply arrives validated.

```python
from pydantic import BaseModel

from pydantic_ai import Agent


class Recipe(BaseModel):
    name: str
    minutes: int
    vegetarian: bool


agent = Agent('google:gemini-3-flash-preview', output_type=Recipe)
result = agent.run_sync('Give me a quick pasta recipe without meat.')
print(result.output)
```

Picking an output mode:

- `output_type=str` returns plain text.
- `output_type=MyModel` returns validated structured data.
- `TextOutput` parses the text with a function you supply.
- `NativeOutput` or `ToolOutput` pin the mechanism down explicitly.

## Dependency Injection

Declare `deps_type=...`, then read the value through `RunContext[...]` in tools and instructions.

```python
from pydantic_ai import Agent, RunContext

agent = Agent('openai:gpt-5.2', deps_type=str)


@agent.instructions
def add_shop_name(ctx: RunContext[str]) -> str:
    return f'You work for the shop called {ctx.deps}.'
```

A tool that reads the context uses `@agent.tool`. A tool that does not uses `@agent.tool_plain`.

## Define Agents Declaratively with Specs

When setup belongs in a config file instead of Python, write a YAML or JSON spec.

```yaml
model: google:gemini-3-flash-preview
instructions: "You are assisting {{customer}} with order questions."
capabilities:
  - WebFetch
  - Thinking:
      effort: low
```

```python
from dataclasses import dataclass

from pydantic_ai import Agent


@dataclass
class OrderContext:
    customer: str


agent = Agent.from_file('orders.yaml', deps_type=OrderContext)
result = agent.run_sync('Where is my parcel?', deps=OrderContext(customer='Tomas'))
```

The `{{...}}` placeholders belong to the spec mechanism, so questions about them are answered in this section as well.

## Choose or Configure Models

A model string has the form `provider:model-name`, for example `openai:gpt-5.2` or `anthropic:claude-sonnet-4-6`. If you need constructor arguments that only one provider understands, pass a model object in place of the string.

## Run Methods and Streaming

Match the method to how the caller works:

- `run()` is the async call that runs to the end.
- `run_sync()` suits scripts and notebooks.
- `run_stream()` streams the final output.
- `run_stream_sync()` streams without async.
- `run_stream_events()` hands you the typed event stream itself.
- `iter()` lets you walk the agent loop node by node.

To show progress without consuming the event stream yourself, give `run()` or `run_stream()` an `event_stream_handler=`.

```python
from collections.abc import AsyncIterable

from pydantic_ai import Agent, AgentStreamEvent, FunctionToolCallEvent, RunContext

agent = Agent('openai:gpt-5.2')


async def show_progress(ctx: RunContext, events: AsyncIterable[AgentStreamEvent]):
    async for event in events:
        if isinstance(event, FunctionToolCallEvent):
            print(f'-> running tool {event.part.tool_name}')


async def main():
    await agent.run('Plan my week', event_stream_handler=show_progress)
```

## Handle Provider Failures

`FallbackModel` moves on to the next model when one fails, which covers provider outages.

```python
from pydantic_ai import Agent
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.models.fallback import FallbackModel
from pydantic_ai.models.openai import OpenAIChatModel

resilient = FallbackModel(
    AnthropicModel('claude-sonnet-4-6'),
    OpenAIChatModel('gpt-5.2'),
)

agent = Agent(resilient)
```

Sensible defaults:

- Put the strong, costly model first and a cheaper one behind it.
- Keep a single prompt and a single output contract across all of them.
- Add per-model settings only where something really differs.
