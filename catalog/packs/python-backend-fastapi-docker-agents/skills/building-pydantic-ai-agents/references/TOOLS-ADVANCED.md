# Tools Advanced

Open this when tools need approval steps, retry logic, argument checks, time limits, richer return values, or lazy discovery.

## Human approval

A deferred tool call lets a run stop and wait until a person signs off.

```python
from pydantic_ai import (
    Agent,
    DeferredToolRequests,
    DeferredToolResults,
    ToolDenied,
)

agent = Agent('anthropic:claude-sonnet-4-6', output_type=[str, DeferredToolRequests])


@agent.tool_plain(requires_approval=True)
def send_invoice(customer: str) -> str:
    return f'Invoice sent to {customer}'


result = agent.run_sync('Send an invoice to Acme')
history = result.all_messages()

assert isinstance(result.output, DeferredToolRequests)
decisions = DeferredToolResults()
for pending in result.output.approvals:
    decisions.approvals[pending.tool_call_id] = ToolDenied('Invoices need a manager sign-off first')

result = agent.run_sync('Continue', message_history=history, deferred_tool_results=decisions)
print(result.output)
```

Rules:

- The output type must include `DeferredToolRequests`.
- When approval hinges on the arguments, skip `requires_approval=True` and raise `ApprovalRequired(...)` from inside the tool.

## Retries

Inside a tool, raise `ModelRetry` to tell the model to fix its call and try once more.

```python
from pydantic_ai import Agent, ModelRetry, RunContext

agent = Agent('anthropic:claude-sonnet-4-6', deps_type=dict[str, str])


@agent.tool(retries=2)
def find_room(ctx: RunContext[dict[str, str]], employee: str) -> str:
    room = ctx.deps.get(employee)
    if room is None:
        raise ModelRetry(f'Nobody called {employee!r} is in the directory')
    return room
```

Use retries for slips the model can correct. A crash in your own code is a different matter.

## Checking arguments first

`args_validator=` applies business rules to arguments that already have the right types. It runs before the tool executes and before any approval request.

```python
from pydantic_ai import Agent, DeferredToolRequests, ModelRetry, RunContext

agent = Agent('anthropic:claude-sonnet-4-6', deps_type=int, output_type=[str, DeferredToolRequests])


def check_budget(ctx: RunContext[int], price: int, quantity: int) -> None:
    if price * quantity > ctx.deps:
        raise ModelRetry(f'Order total must stay under {ctx.deps}')


@agent.tool(requires_approval=True, args_validator=check_budget)
def place_order(ctx: RunContext[int], price: int, quantity: int) -> int:
    return price * quantity
```

## More tool features

Most needs are met by a plain function tool. For the rest:

- `ToolReturn` splits the answer into a return value, extra content and metadata.
- `prepare=` computes the tool definition at run time.
- `timeout=` limits how long the tool may take.
- `sequential=True` makes the tool a barrier: it executes alone, after earlier-emitted tools have finished and before later ones begin, while unrelated tools still run in parallel. Function tools support it, and output tools do through `ToolOutput(sequential=True)`.

Example of `ToolReturn`:

```python
from pydantic_ai import Agent, BinaryContent, ToolReturn

agent = Agent('anthropic:claude-sonnet-4-6')


@agent.tool_plain
def take_screenshot(page: str) -> ToolReturn:
    return ToolReturn(
        return_value=f'Captured {page}',
        content=['Screenshot:', BinaryContent(data=b'png-bytes', media_type='image/png')],
        metadata={'page': page},
    )
```

## When an output tool shares a response with other tools

Sometimes one model response contains both a call to an output tool (the structured-output channel) and calls to ordinary tools. The agent's `end_strategy` settles how those calls execute and which result ends the run. Few agents mix them, so few touch the setting. It is passed to the agent: `Agent(..., end_strategy='early')`.

- `'graceful'` is the default. Calls run in emission order. Function tools always run, in parallel when they can. The first output tool to succeed wins and later output tools are skipped. Choose it if side effects of function tools, like logging or notifications, still have to occur.
- `'early'` goes through output tools in order and halts at the first success. When an output succeeds, function tools from the same response are skipped; when every output fails, they run anyway. This is quickest when a finished result makes the function tools pointless.
- `'exhaustive'` starts every tool in parallel. The earliest valid output by emission order wins and the remaining output tools still execute. The model gets to see that each tool ran, and the cost is that the side effects of the losing output tools are discarded.

Under `'graceful'` and `'exhaustive'` a retry takes priority: if a function tool in the response raises `ModelRetry`, or its arguments fail validation, a successful output is held back so the model deals with the retry next round. `'early'` has no such rule, and neither does streaming, since `run_stream` commits to the first matching output immediately and so behaves like `'early'`.

Forcing strictly serial tool execution for a whole run takes one of these settings:

```python
with agent.parallel_tool_call_execution_mode('sequential'):
    ...
# or, in the model settings: parallel_tool_calls=False
```

Further reading: the "Tool calls alongside a final result" section of the Pydantic AI output documentation, and the parallel-tool-calls section of its advanced-tools page.

## Network errors and rate limits

`ModelRetry` and a tool's `retries=...` cover tool calls and nothing else.

Retrying failing HTTP requests is configured elsewhere, at the transport layer, through the HTTP client's own retry options. `ModelRetry` will not rescue a provider outage or a dropped connection.

## Tool search

Put `defer_loading=True` on a tool when the agent owns many tools and the model should find individual ones when needed, via `search_tools`.

```python
from pydantic_ai import Agent

agent = Agent('anthropic:claude-sonnet-4-6')


@agent.tool_plain(defer_loading=True)
def fetch_warranty_terms(product: str) -> str:
    return f'warranty terms for {product}'
```

Good fits:

- an MCP server exposing a long list of tools
- any big catalog of tools
- situations where all the schemas together would crowd the context

If instructions and tools should be revealed together as a bundle, use [ON-DEMAND-CAPABILITIES](./ON-DEMAND-CAPABILITIES.md) instead.
