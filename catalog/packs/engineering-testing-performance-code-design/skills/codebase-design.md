---
name: codebase-design
description: >-
  Deep-module vocabulary the studio shares. Use to find
  deepening opportunities, decide where a seam goes, design or improve a module's interface, make
  code more testable or AI-navigable. Also for another skill (tdd, diagnosing-bugs, improve)
  that needs these terms.
metadata:
  category: engineering
  author: Richicinschi
  version: 1.1.0
  domain: deep-module vocabulary and principles
---

# Codebase Design

The target is the deep module: much behaviour sitting behind a small interface, with the seam in a sensible place and tests going through that same interface. Callers gain leverage, maintainers gain locality, and the code gets easier to verify. Apply the words and rules below whenever code is being shaped or reorganised.

## Words

Pick these words and stay with them. Do not drift into "component", "service", "API" or "boundary"; a stable vocabulary is what makes design talk precise.

**Module**: anything that has an interface and an implementation. It can be one function, a class, a package, or a slice that crosses tiers. Not "unit", "component" or "service".

**Interface**: every fact a caller needs in order to use the module correctly. That covers the type signature and also invariants, call order, failure modes, required configuration and performance behaviour. Not "API" or "signature", which only name the typed surface.

**Implementation**: the code inside the module. Keep it apart from **adapter**. A thin wrapper around a vendor SDK is a small adapter over a big implementation; a hand-written in-memory fake is a big adapter over a tiny implementation. Say "adapter" when you are talking about the seam, "implementation" otherwise.

**Depth**: how much behaviour a caller or test can trigger for each bit of interface it has to learn. A **deep** module hides a lot behind a small interface. A **shallow** one has an interface about as heavy as its body.

**Seam** _(from Michael Feathers)_: a spot where behaviour can be changed without editing that spot. It is the place where a module's interface sits. Choosing the spot is a separate decision from choosing what goes behind it. Not "boundary", which already means bounded context in domain-driven design.

**Adapter**: a concrete thing that fills the interface at a seam. The word names the role it plays, not what it is made of.

**Leverage**: what depth gives callers, which is more capability for each unit of interface learned. One implementation repays itself over N call sites and M tests.

**Locality**: what depth gives maintainers. Changes, bugs, knowledge and checks gather in one spot, so a fix made once holds everywhere.

## Deep and shallow

A deep module:

```
┌─────────────────────┐
│   Small Interface   │  ← few methods, plain parameters
├─────────────────────┤
│                     │
│  Deep Implementation│  ← the hard parts are hidden here
│                     │
└─────────────────────┘
```

A shallow module, to be avoided:

```
┌─────────────────────────────────┐
│       Large Interface           │  ← many methods, awkward parameters
├─────────────────────────────────┤
│  Thin Implementation            │  ← forwards calls and little else
└─────────────────────────────────┘
```

While shaping an interface, put three questions to it:

- Which methods can go?
- Which parameters can be dropped or merged?
- What other complexity can move inside?

## Principles

1. **Depth belongs to the interface, not the body.** The inside of a deep module may be built from many small, swappable, mockable parts, as long as none of them leak into the interface. A module may have private internal seams for its own tests alongside the one external seam at its interface.
2. **Run the deletion test.** Picture the module removed. If the complexity disappears with it, the module only passed calls along. If the complexity pops up again in N callers, the module was doing real work.
3. **The interface is where tests go.** Callers and tests cross the same seam. A wish to test beneath the interface usually means the module has the wrong shape.
4. **One adapter is a guess, two is a seam.** Add a seam only when something truly differs on the other side of it.

## Making code easy to test

1. **Take dependencies in; do not build them inside.**

   ```typescript
   // easy to test
   function sendInvoice(invoice, mailer) {}

   // hard to test
   function sendInvoice(invoice) {
     const mailer = new SmtpMailer();
   }
   ```

2. **Hand back a value instead of causing a side effect.**

   ```typescript
   // easy to test
   function computeShipping(parcel): Fee {}

   // hard to test
   function chargeShipping(parcel): void {
     parcel.balance += fee;
   }
   ```

3. **Keep the surface small.** Every method you drop is a test you never write, and every parameter you drop shortens the setup.

## How the words connect

- Each **module** has exactly one **interface**, the face it shows to callers and tests.
- **Depth** is judged on a module by looking at its interface.
- The **seam** is the place where a module's interface lives.
- An **adapter** stands at a seam and fulfils the interface.
- **Depth** is what produces **leverage** for callers and **locality** for maintainers.

## Framings we reject

- **Depth as implementation lines divided by interface lines** (Ousterhout). It pays you for padding the body, so we measure depth as leverage.
- **"Interface" as the TypeScript keyword or a class's public methods.** Too narrow; here it holds everything a caller must know.
- **"Boundary".** It clashes with the DDD bounded context. Write **seam** or **interface**.

## Going further

- **Deepening a cluster, given what it depends on**: the DEEPENING note ([link](codebase-design/DEEPENING.md)) sorts dependencies into kinds, sets the rules for seams, and says how to swap old tests for new ones.
- **Trying other interface shapes**: the DESIGN-IT-TWICE note ([link](codebase-design/DESIGN-IT-TWICE.md)) runs several sub-agents that each propose a very different interface, then weighs them on depth, locality and seam placement.
