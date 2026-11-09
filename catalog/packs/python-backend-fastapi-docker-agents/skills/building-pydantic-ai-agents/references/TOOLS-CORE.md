# Tools Core

Open this to add function tools, bundle tools into toolsets, attach MCP servers, or use search tools chosen by name.

## Adding tools

`@agent.tool_plain` is for a function that needs nothing from the run. `@agent.tool` is for one that takes a `RunContext`.

```python
from datetime import date

from pydantic_ai import Agent, RunContext

agent = Agent('google:gemini-3-flash-preview', deps_type=dict[str, str])


@agent.tool_plain
def today() -> str:
    return date.today().isoformat()


@agent.tool
def lookup_email(ctx: RunContext[dict[str, str]], name: str) -> str:
    return ctx.deps.get(name, 'unknown')
```

When tools live outside the agent module, or several agents share them, wrap each in `Tool(fn)`.

## Which registration to use

Rules of thumb:

- The tool reads deps, usage, the retry count or message history: `@agent.tool`.
- The tool is an ordinary function: `@agent.tool_plain`.
- Several agents should share it: `Tool(...)` placed in `tools=[...]`.
- A group of related tools should travel together: `FunctionToolset`.

## Toolsets

A toolset fits when related tools belong together, or when one behavior should cover a whole group.

Typical members:

- `FunctionToolset`, a bundle of Python functions
- MCP servers, which already are toolsets
- wrapper toolsets adding approval, deferral or other cross-cutting behavior

## What the RunContext offers

A tool declared with `@agent.tool` receives a `RunContext`. Its useful attributes:

- `ctx.deps` for your dependencies
- `ctx.usage` for token and request counts
- `ctx.messages` for the history so far
- `ctx.retry` for the current retry number

## MCP servers

A server reachable by URL is added through the `MCP` capability. It runs the server locally unless you pass `native=True`, which asks for the provider's own MCP support. The MCP capability page of the Pydantic AI documentation has the rest.

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import MCP

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    capabilities=[
        MCP('https://tools.example.org/mcp'),                 # Streamable HTTP, handled locally by default
        MCP('https://docs.example.org/mcp', native=True),     # provider-native, local fallback
    ],
)
```

The first positional argument is the URL. Anything else that `MCPToolset` accepts goes through the `local=` keyword: a `fastmcp.client.transports.*Transport`, a ready `fastmcp.Client`, an in-process `FastMCP` server, or a path to a local script.

```python
from fastmcp.client.transports import StdioTransport

from pydantic_ai import Agent
from pydantic_ai.capabilities import MCP

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    capabilities=[MCP(local=StdioTransport(command='python', args=['notes_server.py']))],
)
```

The MCP client page of the Pydantic AI documentation covers `MCPToolset`, which you can use directly, passed as `toolsets=[...]`, when you want to run the toolset lifecycle yourself, share one server among several agents, or need FastMCP settings the capability cannot express.

## Named search tools

When the search engine is chosen explicitly, in place of an adaptive capability, add its tool:

```python
from pydantic_ai import Agent
from pydantic_ai.common_tools.duckduckgo import duckduckgo_search_tool

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    tools=[duckduckgo_search_tool()],
    instructions='Search the web for the question and summarize the top results.',
)
```

Which to pick:

- `WebSearch()` for search that works with any model and falls back to a local tool when the provider lacks it
- `duckduckgo_search_tool()`, Tavily or Exa when the user specifically asks for one of those engines
