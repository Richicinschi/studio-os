# Architecture and Decision Guide

Use this file to compare options for Pydantic AI. It has decision trees, comparison tables and a short account of how a run flows.

## Where to look first

A user who already knows the job is better served by the narrow guide for it. Check the other files in this folder (agents, capabilities, on-demand capabilities, tools, native tools, advanced tools, input and history, testing, orchestration) before reading on here.

## Decision trees

### How to register a tool

```
Does the tool read RunContext (deps, usage, messages)?
├── Yes → @agent.tool
└── No → Is it a plain function?
    ├── Yes → @agent.tool_plain
    └── Is it defined outside the agent file?
        ├── Yes → tools=[Tool(...)] in the constructor
        └── Should the definition change with context?
            ├── Yes → ToolPrepareFunc
            └── Is it one of several related tools?
                └── Yes → FunctionToolset
```

### Which output mode

```
Want validated structured data?
├── Yes → Does the provider offer native JSON mode, and do you want it?
│   ├── Yes → NativeOutput(MyModel)
│   └── No, or you want the same behavior everywhere → ToolOutput(MyModel) [default]
└── No → Does the text need custom parsing?
    ├── Yes → TextOutput(parser_fn)
    └── No → Plain text is enough
        └── output_type=str [default]

Schema only known at runtime?
└── Yes → StructuredDict(json_schema)
```

### Which multi-agent pattern

```
Does the child hand its result back to the parent?
├── Yes → delegate through a tool
└── No → Does a specialist take over for good?
    ├── Yes → output functions
    └── Does your own code sit between the agents?
        ├── Yes → programmatic hand-off
        └── Is the flow a complex state machine?
            └── Yes → graph-based control
```

### Which way to extend behavior

```
Same behavior (tools + hooks + instructions) wanted in several agents?
├── Yes → custom capability; then decide whether defer_loading=True should be the default
└── No → Only intercepting lifecycle events?
    ├── Yes → Does the interception also need tools or instructions?
    │   ├── Yes → subclass AbstractCapability
    │   └── No → Hooks capability with decorators
    └── No → Should the agent be defined in a config file?
        ├── Yes → Agent.from_file() with a YAML/JSON spec
        └── No → Just adding tools?
            ├── Yes → @agent.tool or a Toolset
            └── Pass the arguments straight to the Agent constructor
```

### Eager or deferred

```
Does the item belong to a capability?
├── Yes → Start from defer_loading=True. Would eager loading help most turns, or must its hooks/settings always apply?
│   ├── Yes → keep it eager in an always-on capability
│   └── No → capabilities on demand with defer_loading=True
└── No → Will this information or tool schema help most model turns?
    ├── Yes → keep it eager in the base agent or the hot-path toolset
    └── No → Is it a named workflow made of instructions plus tools?
        ├── Yes → capabilities on demand with defer_loading=True
        └── No → Is it one of many tools that can be found individually?
            ├── Yes → tool-level defer_loading=True with tool search
            └── No → Can the caller fetch it outside the agent and pass just the relevant slice?
                ├── Yes → leave it out of the agent; inject the slice through deps, the prompt or retrieval
                └── No → Question whether the agent needs this context at all
```

Take a position on this. Eager loading is a choice you must be able to defend, and no capability should skip the deferral question. An agent should not haul bulky optional policy text, schemas used once in a while, or specialist runbooks in its always-on prompt only because they exist. Disclose progressively unless the content is needed on every turn.

### Which capability

```
Model reasoning wanted?
├── Yes → Thinking(effort='high')
└── Web search wanted?
    ├── Yes → WebSearch() (falls back to a local tool automatically)
    └── Fetching URLs wanted?
        ├── Yes → WebFetch()
        └── MCP servers wanted?
            ├── Yes → MCP()
            └── Only lifecycle hooks?
                ├── Yes → Hooks()
                └── Need to filter or change tool definitions per step?
                    └── Yes → PrepareTools()
```

### Which test approach

```
Want fast, deterministic tests?
├── Yes → TestModel inside agent.override()
└── Need to script specific tool-call behavior?
    ├── Yes → FunctionModel
    └── Testing against the real API (integration)?
        └── Yes → pytest-recording with VCR cassettes
```

## Comparison tables

### Output modes

| Situation | Mode |
|----------|------|
| Structured data, with the widest provider support | `ToolOutput`, the default. It runs on every provider and can stream. |
| The provider itself should enforce the JSON schema | `NativeOutput`. Only OpenAI, Anthropic and Google; streaming is limited. |
| The provider has neither tools nor a JSON mode | `PromptedOutput`, a fallback that works anywhere. |
| The model answers in structured text that is not JSON, such as markdown, YAML or a house format | `TextOutput` with your own parsing function. |

### Provider prefixes

Write the prefix, a colon, then the provider's own model id.

| Provider | Prefix |
|----------|--------|
| OpenAI | `openai:` |
| Anthropic | `anthropic:` |
| Google (Gemini API) | `google:` |
| Google Cloud | `google-cloud:` |
| Groq | `groq:` |
| Mistral | `mistral:` |
| Cohere | `cohere:` |
| AWS Bedrock | `bedrock:` |
| Azure | `azure:` |
| OpenRouter | `openrouter:` |
| xAI | `xai:` |
| DeepSeek | `deepseek:` |
| Fireworks | `fireworks:` |
| Together | `together:` |
| Ollama (local) | `ollama:` |
| GitHub Models | `github:` |
| Hugging Face | `huggingface:` |
| Cerebras | `cerebras:` |
| Heroku | `heroku:` |

Some ids carry a vendor path of their own. `bedrock:` takes the vendor-qualified Bedrock id, and `openrouter:` takes `vendor/model`.

Further prefixes exist for `moonshotai`, `vercel`, `sambanova`, `alibaba`, `ovhcloud`, `nebius` and `litellm`, each followed by a colon. For a provider that is not listed, write a `Model` subclass, or point `OpenAIChatModel` at your own `base_url`.

### Tool decorators

| Situation | Use |
|----------|-----------|
| The tool needs deps, usage stats, messages or the retry count | `@agent.tool`, with `RunContext` as the required first parameter |
| An ordinary function that needs nothing from the agent | `@agent.tool_plain` |
| The tool sits in another module or is shared among agents | `Tool(fn)`, handed to the constructor as `tools=[...]` |

### Built-in capabilities

| Name | Purpose | Usable in a YAML spec |
|---|---|:---:|
| `Thinking` | Reasoning at an adjustable effort level | Yes |
| `Hooks` | Registers lifecycle handlers through decorators | No |
| `WebSearch` | Searching the web: provider-side when possible, a local tool if not | Yes |
| `WebFetch` | Reading URLs: provider-side when possible, a custom tool if not | Yes |
| `ImageGeneration` | Making images: provider-side when possible, a custom tool if not | Yes |
| `MCP` | Reaching an MCP server: provider-side when possible, a direct connection if not | Yes |
| `PrepareTools` | Filters or edits the tool definitions at every step | No |
| `PrefixTools` | Puts a name prefix on the tools of a wrapped capability | Yes |
| `NativeTool` | Attaches one provider-native tool | Yes |
| `Toolset` | Adapts an `AbstractToolset` into a capability | No |
| `ProcessHistory` | Runs a history function before each model request, as a thin shell around the hook of that name | No |

### Agent methods

| Situation | Method |
|----------|--------|
| A chat UI that displays tool calls and progress live | `agent.run(event_stream_handler=...)`, which forwards each event and runs to completion |
| Background jobs, batch work, autonomous agents | `agent.run()` |
| Scripts, notebooks and command-line tools with no async | `agent.run_sync()` |
| Pushing the final text to a screen as it is produced | `agent.run_stream()` |
| Pushing it from synchronous code | `agent.run_stream_sync()` |
| Consuming typed events (tool calls, tool results, final answer) as an async iterable | `agent.run_stream_events()` |
| Inspecting or altering state between steps, including manual approval | `agent.iter()` |

For `event_stream_handler` details, read the streaming section of AGENTS-CORE.

## Architecture overview

**How a run flows:** `Agent.run()` starts at `UserPromptNode`, goes to `ModelRequestNode`, then `CallToolsNode`, and either loops back or ends.

**Lifecycle hooks**, available from `Hooks` or `AbstractCapability`, fire in this order:

```
before_run → before_model_request → before_tool_execute → after_tool_execute → after_model_request → after_run
```

**Generic types:**

- `Agent[AgentDepsT, OutputDataT]` carries the dependency type and the output type
- `RunContext[AgentDepsT]` is what tools and instructions receive
- `AbstractCapability[AgentDepsT]` is the base class for reusable bundles

**Ways to build an agent:**

```
Agent(model, instructions=..., tools=..., capabilities=...)
Agent.from_file('agent.yaml')   # or Agent.from_spec({...})
```

**Capabilities** are where you extend an agent. One capability carries tools, hooks, instructions and settings together. The built-ins include `Thinking`, `WebSearch`, `WebFetch`, `Hooks` and `MCP`.

**Model strings** follow the pattern `provider:model-name`, the same one shown in the provider table above.

**Output modes:**

- `ToolOutput` returns structured data through tool calls, the default for Pydantic models
- `NativeOutput` uses the provider's own structured output
- `PromptedOutput` extracts structure through the prompt
- `TextOutput` returns plain text
