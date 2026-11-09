# Capabilities and Hooks

Open this when the goal is behavior you can reuse, tools that adapt to the provider, or interception of the agent's lifecycle.

## Add Capabilities to an Agent

A capability packages behavior for reuse, and several of them combine without extra wiring.

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import Thinking, WebFetch

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    capabilities=[
        Thinking(effort='medium'),
        WebFetch(),
    ],
)
```

These adapt to the provider, so try them before anything custom:

- `MCP`
- `ImageGeneration`
- `WebSearch`
- `WebFetch`
- `Thinking`

Choose a capability when the behavior must keep working after you change model or provider.

## Enable Thinking Across Providers

Reasoning can be switched on for any provider, through the `Thinking` capability or through the `thinking` entry in the model settings.

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import Thinking

via_capability = Agent('anthropic:claude-sonnet-4-6', capabilities=[Thinking(effort='low')])
via_setting = Agent('anthropic:claude-sonnet-4-6', model_settings={'thinking': 'low'})
```

The effort scale runs from off to maximum:

```
False, True, 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'
```

## Intercept Agent Lifecycle with Hooks

`Hooks` lets you intercept the lifecycle with decorators.

```python
import time

from pydantic_ai import Agent, RunContext, ToolDefinition
from pydantic_ai.capabilities import ValidatedToolArgs
from pydantic_ai.capabilities.hooks import Hooks
from pydantic_ai.messages import ToolCallPart
from pydantic_ai.models import ModelRequestContext

hooks = Hooks()


@hooks.on.before_model_request
async def stamp(ctx: RunContext, request_context: ModelRequestContext) -> ModelRequestContext:
    print(f'{time.strftime("%H:%M:%S")} request with {len(request_context.messages)} messages')
    return request_context


@hooks.on.before_tool_execute(tools=['charge_card'])
async def watch_payment(
    ctx: RunContext[None],
    *,
    call: ToolCallPart,
    tool_def: ToolDefinition,
    args: ValidatedToolArgs,
) -> ValidatedToolArgs:
    print(f'payment tool {call.tool_name} is about to run')
    return args


agent = Agent('openai:gpt-5.2', capabilities=[hooks])
```

Hook groups:

- the whole run
- each graph node
- model requests
- validation of tool arguments
- tool execution
- event streaming

Reach for hooks to watch, audit or lightly alter a run. They spare you a new abstraction for that.

## Writing your own capability

Subclass `AbstractCapability` when tools, hooks, instructions and model settings should be delivered as a single package.

Do it when:

- more than one agent needs the same package
- `Hooks` alone cannot express the behavior
- someone should be able to install it or declare it in a spec

Keep each one narrow. A lone tool or a lone hook does not need a capability around it.

Then ask, for every capability, whether `defer_loading=True` would spare the always-on context its instructions and tool schemas. Stay eager only when the model benefits on most turns, when hooks or settings must apply constantly, or when deferring would make the model pick the wrong capability.

## Deferring a capability

Details live in [ON-DEMAND-CAPABILITIES](./ON-DEMAND-CAPABILITIES.md). Read it when the user raises deferred loading, progressive disclosure or `load_capability`. Read it unprompted when the design includes optional instructions, specialist workflows, rarely used tools or context that most turns never touch.
