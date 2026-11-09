# Input and History

Open this for non-text input, carrying a conversation across runs, or keeping context from growing without limit.

## Send Images, Audio, Video, or Documents to the Model

The prompt can be a list in which text sits beside media objects: `ImageUrl`, `AudioUrl`, `VideoUrl`, `DocumentUrl`, or `BinaryContent` for raw bytes.

```python
from pydantic_ai import Agent, DocumentUrl

agent = Agent(model='anthropic:claude-sonnet-4-6')
result = agent.run_sync(
    [
        'List the main deadlines in this contract.',
        DocumentUrl(url='https://example.com/contract.pdf'),
    ]
)
print(result.output)
```

Bytes you already hold locally go in `BinaryContent(...)` rather than a URL object.

Models differ in what they accept. Check the chosen provider before promising a given input type.

## Work with Message History

Pass `message_history=` to pick a conversation up where an earlier run stopped.

```python
from pydantic_ai import Agent

agent = Agent('openai:gpt-5.2', instructions='You are a patient maths tutor.')

first = agent.run_sync('What is a prime number?')
second = agent.run_sync('Give me some examples.', message_history=first.new_messages())
print(second.output)
```

Keep these straight:

- `new_messages()` holds just this run's additions; `all_messages()` holds the full accumulated record.
- Given a non-empty `message_history`, Pydantic AI presumes the system prompt travelled with it and adds none.

## Manage Context Size

To shorten or rewrite the history ahead of every model request, add `capabilities=[ProcessHistory(...)]`. Under the hood it is only a shim over the `before_model_request` hook, so when you need the run context, the request context, or the ability to bypass the model call, register your function on that hook directly: `capabilities=[Hooks(before_model_request=fn)]`.

```python
from pydantic_ai import Agent, ModelMessage, ModelRequest
from pydantic_ai.capabilities import ProcessHistory


async def requests_only(messages: list[ModelMessage]) -> list[ModelMessage]:
    return [m for m in messages if isinstance(m, ModelRequest)]


agent = Agent('openai:gpt-5.2', capabilities=[ProcessHistory(requests_only)])
```

Typical uses:

- cutting down long conversations
- stripping personal data before anything reaches the provider
- summarizing older turns
- enforcing whatever history policy the app needs

## Inject Messages Mid-Run

A run can receive extra messages while it is underway. Inside a tool or capability hook call `RunContext.enqueue(...)`; from code that steps through `agent.iter()` call `AgentRun.enqueue(...)`. That lets a tool add follow-up context, or lets an outside event redirect the agent.

`enqueue` is variadic, and each argument is one of these kinds: user content (a `str`, or media like an `ImageUrl`), a request part such as a `SystemPromptPart`, or a complete `ModelRequest` or `ModelResponse`. Consecutive user content collapses into a single `UserPromptPart`. An existing list is passed with a star: `enqueue(*items)`.

```python
from pydantic_ai import Agent, RunContext

agent = Agent('anthropic:claude-opus-4-7')


@agent.tool
def check_stock(ctx: RunContext[None]) -> str:
    ctx.enqueue('Note: the warehouse reports low stock, mention delivery delays.')
    return 'stock checked'
```

The `priority` argument controls when the item arrives:

- `'asap'` (the default) delivers at the first chance: with the next model request, or, if the agent was just about to stop, as a reason for one further request. This is how you steer a live run.
- `'when_idle'` holds the item until the agent would otherwise stop, behind any `'asap'` items. It suits a follow-up job that must not cut into current work.

Delivery of `'when_idle'` items needs `agent.run()` or explicit `AgentRun.next()` calls. A plain `async for` over the run never drains them. The "Injecting messages mid-run" section of the Pydantic AI message-history documentation covers this.
