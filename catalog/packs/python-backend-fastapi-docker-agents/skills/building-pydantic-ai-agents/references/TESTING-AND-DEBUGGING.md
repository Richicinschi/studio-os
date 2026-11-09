# Testing and Debugging

Open this for repeatable tests, scripted fake models, a look at what was sent, or tracing a live run.

## Test Agent Behavior

`TestModel` gives fast, predictable runs. `FunctionModel` lets you write the model's answers yourself.

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent('anthropic:claude-sonnet-4-6')

with agent.override(model=TestModel()):
    result = agent.run_sync('ping')
    assert result.output == 'success (no tool calls)'
```

```python
from pydantic_ai import Agent, ModelResponse, TextPart
from pydantic_ai.models.function import FunctionModel

agent = Agent('anthropic:claude-sonnet-4-6')


def always_pong(messages, info):
    return ModelResponse(parts=[TextPart(content='pong')])


with agent.override(model=FunctionModel(always_pong)):
    result = agent.run_sync('ping')
    assert result.output == 'pong'
```

How to choose:

- `TestModel` when automatically generated valid output is enough.
- `FunctionModel` when a test must pin exact behavior, force a failure or exercise a retry.

## Debug a Failed Agent Run

Wrap the call in `capture_run_messages()` to get the exact requests and responses that led up to the failure.

```python
from pydantic_ai import Agent, UnexpectedModelBehavior, capture_run_messages

agent = Agent('anthropic:claude-sonnet-4-6')

with capture_run_messages() as transcript:
    try:
        agent.run_sync('Convert some furlongs to a unit the tool cannot handle.')
    except UnexpectedModelBehavior:
        print(transcript)
```

This works inside the running process. For one run that went wrong, it beats turning on logging everywhere.

## Debug and Validate Agent Behavior

Logfire gives you traces across runs, tools and model requests.

```python
import logfire

logfire.configure()
logfire.instrument_pydantic_ai()
logfire.instrument_httpx(capture_all=True)
```

It helps with:

- following tool calls
- confirming what really reached the provider
- working out why structured output failed
- watching a system in production
