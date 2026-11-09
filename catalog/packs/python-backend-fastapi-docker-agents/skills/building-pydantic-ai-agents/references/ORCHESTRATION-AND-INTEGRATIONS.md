# Orchestration and Integrations

Open this for several agents working together, graph workflows, bare model calls, A2A, durable runs, embeddings, evals, or third-party tools.

## Coordinate Multiple Agents

Delegation means one agent calls another from inside a tool and uses what comes back. Pass `usage=ctx.usage` so the child's cost is counted with the parent's.

```python
from pydantic_ai import Agent, RunContext

planner = Agent('anthropic:claude-sonnet-4-6')
translator = Agent('anthropic:claude-sonnet-4-6', output_type=str)


@planner.tool
async def translate(ctx: RunContext, text: str, language: str) -> str:
    result = await translator.run(f'Translate into {language}: {text}', usage=ctx.usage)
    return result.output
```

Which pattern:

- Delegate through tools while the parent stays in charge.
- Use output functions or a programmatic hand-off when control passes to someone else.

## Build Multi-Step Workflows with Graphs

When the work is a state machine instead of one agent loop, use `pydantic_graph`. Build the graph with `GraphBuilder` and typed step functions.

```python
from pydantic_graph import GraphBuilder, StepContext

g = GraphBuilder(input_type=str, output_type=str)


@g.step
async def shout(ctx: StepContext[None, None, str]) -> str:
    return ctx.inputs.upper()


@g.step
async def exclaim(ctx: StepContext[None, None, str]) -> str:
    return ctx.inputs + "!"


g.add(
    g.edge_from(g.start_node).to(shout),
    g.edge_from(shout).to(exclaim),
    g.edge_from(exclaim).to(g.end_node),
)

graph = g.build()
result = graph.run_sync(inputs="hello")
```

From async code, call `await graph.run(inputs=...)`.

## Call the Model Without Using an Agent

The direct API sends one request to a model, with no agent around it.

```python
from pydantic_ai import ModelRequest
from pydantic_ai.direct import model_request_sync

response = model_request_sync(
    'anthropic:claude-sonnet-4-6',
    [ModelRequest.user_text_prompt('Suggest uses for a paperclip.')],
)
```

Choose it when you need no tools, no retries and no loop state.

## Use Durable Execution

When a run has to survive crashes, restarts or long waits, use a durable execution integration.

Temporal provides:

- `PydanticAIPlugin`
- `PydanticAIWorkflow`
- `TemporalAgent`

DBOS and Prefect have matching integrations.

## Use Embeddings for RAG

`Embedder(...)` produces embeddings for queries and documents, which is what retrieval and semantic search need.

```python
from pydantic_ai import Embedder

embedder = Embedder('openai:text-embedding-3-small')
```

## Use LangChain Tools

Bridges:

- `LangChainToolset`
- `tool_from_langchain`

Use them only when the user wants the LangChain ecosystem in place of Pydantic AI's own tools.

## Systematically Verify Agent Behavior with Evals

`pydantic_evals` is for repeatable datasets and evaluators, which ad hoc tests cannot give you.

Where to start:

- `Dataset`
- `Case`
- the evaluator classes in `pydantic_evals.evaluators`

## Build Custom Toolsets, Models, or Agents

The extension points:

- `AbstractToolset` and `WrapperToolset`
- `Model` and `WrapperModel`
- `AbstractAgent` and `WrapperAgent`
- `AbstractCapability`

Use them only when the built-in pieces truly fall short.
