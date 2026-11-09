# Capabilities on Demand

Open this for any design that reveals information step by step, for an agent that carries material it seldom uses, or for questions on deferred capabilities and the `load_capability` tool.

## Mental Model

Think of a deferred capability as a sealed package. The model starts out with a short menu: each deferred capability's `id` (and `description`, when given) plus one built-in tool named `load_capability`. Calling `load_capability(id)` opens the package and returns its instructions. From the next model request on, the package's function tools, native tools and settings apply, and its hooks may fire at later points of the run.

Be firm about it. For each capability, test the deferral option before accepting eager loading. If the model does not need some fact, specialist instruction set or tool schema on most turns, keep it out of the always-on prompt.

It fits specialist behavior whose instructions and tools belong together:

- support flows such as invoicing, shipping, warranty claims or abuse review
- domain bundles of which a typical request needs just one
- agents that would otherwise haul many instruction sets and tool schemas into every turn

A large flat list of tools that the model should discover one by one is a job for tool search instead. The tools differ by name: `search_tools` for tool search, `load_capability` for capabilities on demand.

## Design rules

- Raise the deferral question for every capability, not only when a user asks for it.
- Keep the base prompt lean: the agent's identity, its limits, global safety rules, and the instruction explaining how to choose what to load.
- Put specialist runbooks in on-demand capabilities when only some requests need them.
- Put wide tool catalogs behind tool search when tools can be found individually and need no shared instructions.
- Leave tools used all the time, and instructions that always hold, eager.
- Favor a few coherent bundles over dozens of tiny ones, which would force the model to work out its own dependency order.
- Whatever the model needs in order to pick a capability has to stay visible, in the description or in always-on routing instructions.

## Minimal Pattern

Give each deferred capability a fixed, hand-written `id` and set `defer_loading=True`. A `description` can be added when the `id` does not make routing obvious.

```python
from pydantic_ai import Agent
from pydantic_ai.capabilities import Capability

shipping = Capability(
    id='shipping',
    description='Delivery estimates and carrier tools.',
    instructions='Check the carrier status before promising a delivery date.',
    defer_loading=True,
)


@shipping.tool_plain
def delivery_estimate(parcel_id: str) -> str:
    """Return the expected delivery window for a parcel."""
    return f'{parcel_id} is with the carrier.'


agent = Agent(
    'anthropic:claude-sonnet-4-6',
    instructions='You are a customer service assistant.',
    capabilities=[shipping],
)
```

`Capability` is a convenience class for plain bundles: instructions, a description, function tools and toolsets. Its description, instructions and toolsets may also be supplied as functions. Anything beyond that, meaning model settings, hooks, native tools, wrapper toolsets, behavior meant for public reuse, or logic that runs per run, calls for your own `AbstractCapability` subclass. Wrapper toolsets get assembled at the start of each run, so a wrapper whose behavior must wait for a deferred capability to load has to do that check itself.

## Runtime Semantics

On the first request:

- No instructions from deferred capabilities are sent.
- Their function tools exist in the framework toolset, flagged `defer_loading=True`. Discovery of them runs through a local, client-side search, so the provider's own hosted search cannot see them, and nothing can call them until the capability has loaded.
- Any capability that is not deferred is treated as loaded from the start.
- Once one or more capabilities are deferred, the framework adds the `load_capability` tool.

When `load_capability` succeeds:

- A dedicated capability-load part is stored in the messages.
- The result can carry the capability's resolved instructions, plus those of any toolsets it owns.
- The id is recorded in `ctx.available_capability_ids`.
- The capability's tools show up in later steps.
- `load_capability` itself stays listed, so the tool set never changes shape.

The message history carries the state. Which capabilities are loaded is reconstructed from paired `LoadCapabilityCallPart` and `LoadCapabilityReturnPart` entries. If a history processor strips those entries, the model may have to load the capability a second time.

## Dynamic descriptions and instructions

If the menu text depends on the run, override `get_description()` so that it returns a function (with or without a `RunContext` parameter) which builds the string. If the text delivered at load time needs deps or run state, use dynamic instructions in the same way.

```python
from dataclasses import dataclass

from pydantic_ai import RunContext
from pydantic_ai.capabilities import AbstractCapability


@dataclass
class ShopDeps:
    tier: str
    customer_id: str


@dataclass
class LoyaltyCapability(AbstractCapability[ShopDeps]):
    def get_description(self):
        def describe(ctx: RunContext[ShopDeps]) -> str:
            return f'Loyalty point tools for {ctx.deps.tier} members.'

        return describe

    def get_instructions(self):
        def at_load(ctx: RunContext[ShopDeps]) -> str:
            return f'Look up points for customer {ctx.deps.customer_id}.'

        return at_load


loyalty = LoyaltyCapability(id='loyalty', defer_loading=True)
```

## Composition Rules

- Ids must not repeat within a run.
- A deferred capability's id has to be written by hand and stay fixed. Automatically generated ids are rejected, since history replay cannot depend on them.
- Nobody else may use the name `load_capability` once any capability is deferred.
- Instructions and model settings of a deferred capability take effect only after loading.
- Function tools and native tools are both deferred together with their capability. Deferring a native tool delays its definition reaching the request and so invalidates the prompt-cache prefix when it loads; do that only for tools that make the prompt heavy.
- Deferring at capability level treats the bundle as one gate, so every tool appears together after loading. For individual tools that should stay behind `search_tools`, put `defer_loading=True` on those tools outside any deferred capability.

## Kinds of deferral

Covered above are capabilities on demand (`load_capability`) and tool search (`search_tools`). Also in this family are **deferred tool calls**, which is about when and where a call runs: approval, timing, or execution outside the agent. It decides if a call the model can already see may go ahead now, and does not conceal anything from the model.

A fast check: would a good reply to most user prompts degrade if this material were absent until requested? If not, advise progressive disclosure.
