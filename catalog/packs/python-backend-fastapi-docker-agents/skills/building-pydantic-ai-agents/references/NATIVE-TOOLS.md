# Native Tools

Open this for tools that the model provider runs itself: search, fetch, code execution, memory, file search.

If the code should not care which provider sits behind it, take an adaptive capability instead: `WebSearch()`, `WebFetch()`, `MCP()` or `ImageGeneration()`. Choose a native tool when the user wants the provider's own behavior or its provider-only settings.

## Give My Agent Web Search or Code Execution

A native tool goes inside a `NativeTool` wrapper, and the wrapper is passed in `capabilities=[...]`.

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import NativeTool
from pydantic_ai.native_tools import WebSearchTool

agent = Agent('openai-responses:gpt-5.2', capabilities=[NativeTool(WebSearchTool())])
result = agent.run_sync('What changed in the latest Python release?')
print(result.output)
```

OpenAI's search only works through the Responses API, so the prefix has to be `openai-responses:`. A plain `openai:` prefix will not do.

## Native Tool Defaults

Where the provider supports them, these are available:

- `FileSearchTool`
- `MCPServerTool`
- `MemoryTool`
- `ImageGenerationTool`
- `CodeExecutionTool`
- `WebFetchTool`
- `WebSearchTool`

## Dynamic Native Tool Configuration

When the setup depends on who is asking, give `NativeTool` a function that receives the `RunContext` and builds the tool. Returning `None` leaves the tool out.

```python
from pydantic_ai import Agent, RunContext
from pydantic_ai.capabilities import NativeTool
from pydantic_ai.native_tools import WebSearchTool


async def local_search(ctx: RunContext[dict]) -> WebSearchTool | None:
    town = ctx.deps.get('town')
    if not town:
        return None
    return WebSearchTool(user_location={'city': town})


agent = Agent(
    'openai-responses:gpt-5.2',
    capabilities=[NativeTool(local_search)],
    deps_type=dict,
)
```

## When to Use Native Tools vs Provider-Adaptive Capabilities

Take the adaptive capabilities when:

- the code has to run on more than one provider
- you want a local fallback in case native support is missing
- the provider is not settled yet

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import WebFetch

agent = Agent('anthropic:claude-sonnet-4-6', capabilities=[WebFetch()])
```

Take a native tool (`NativeTool(WebSearchTool(...))`) when:

- the user asks outright for the provider's own behavior
- a provider-only setting matters, such as `WebSearchTool(user_location=...)`
- the provider is already fixed and supports the tool
