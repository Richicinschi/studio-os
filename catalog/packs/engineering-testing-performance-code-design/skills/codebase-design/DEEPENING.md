# Deepening

Use this when a group of shallow modules should become one deep module and you need to do it without breaking things. It relies on the words from [SKILL.md](../codebase-design.md): **module**, **interface**, **seam**, **adapter**.

## Kinds of dependency

Sort what the candidate depends on first. The kind tells you how the merged module gets tested at its seam.

### 1. In-process

Plain computation and in-memory state, with no I/O. These can always be deepened: fold the modules together and test through the new interface. No adapter is needed.

### 2. Local-substitutable

The dependency has a stand-in that runs locally, such as an embedded SQLite file standing in for a hosted database, or a temp directory standing in for object storage. Deepen when such a stand-in exists, and run the suite against it. The seam stays internal, so the module's outer interface gets no port.

### 3. Remote but owned (ports and adapters)

Your own services reached over a network: microservices, internal APIs. Put a **port** at the seam. The deep module holds the logic and receives the transport as an **adapter**. Tests plug in an in-memory adapter; production plugs in HTTP, gRPC or a queue.

How to phrase the advice: "Add a port at the seam, with an HTTP adapter for production and an in-memory one for tests, so the logic lives in a single deep module even though the pieces are deployed apart."

### 4. True external (mock)

Third-party services you do not control, such as a payment processor or an SMS gateway. The deepened module receives the service through an injected port, and tests supply a mock adapter.

## Seam discipline

- **One adapter is a guess, two is a seam.** Do not create a port until two adapters are justified, normally production plus test. A seam with one adapter is just extra indirection.
- **Keep internal seams internal.** A deep module may have private seams that its own tests use next to the external one. Leave them out of the interface, even though tests rely on them.

## Testing: replace, do not stack

- Once tests exist at the deepened interface, the old unit tests on the shallow pieces are dead weight. Remove them.
- Write the new tests against the deepened module's interface, which is the test surface.
- Assert on what an outside observer can see through the interface, never on internal state.
- A good test outlives refactors because it describes behaviour. If a test must change whenever the implementation does, it is reaching past the interface.
