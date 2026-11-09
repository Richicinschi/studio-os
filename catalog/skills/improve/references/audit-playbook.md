# Audit Playbook

A checklist per category. Hand each subagent (or each direct pass) its category section plus the
**Finding format** at the end. Scale the effort to the repo: for a 2K-line CLI a lighter pass is right,
and for a 500K-line monorepo a heavier one.

Evidence makes a finding. "Somewhere there are probably slow queries" is a hunch.
`billing/export.py:88 runs one SELECT for every invoice line inside a for-loop` is a finding.

---

## 1. Correctness / Bugs

The category you can trust most: defects located by reading code, not guessed.

- Error handling: exceptions swallowed, empty `catch`/`except` blocks, an error only printed on a
  critical path, UI code with no failure state.
- Async hazards: promises or tasks nobody awaits, races on shared state, work never cancelled or
  cleaned up (stale closures in React effects, listeners that are never removed).
- Null flows: non-null assertions (`!`) on values that may be missing, optional chaining that
  hides a value which must exist, array access with no bounds check.
- Edges: off-by-one errors, empty inputs, assumptions about time zone or locale, counters or IDs
  that can overflow.
- State machines: states the types allow but the domain forbids; enums with an unhandled case,
  especially a `default:` branch that does nothing.
- Concurrency: check-then-act on a shared resource, several writes with no transaction around
  them, retried operations (webhooks, queue jobs) that are not idempotent.
- Type escapes: clusters of `any`, `as` casts or `@ts-ignore`. Each is a spot where the compiler
  was overruled.
- Leaks: files, connections or subscriptions left open; a missing `finally`.

## 2. Security

Report only what the code itself supports. Frame each finding as defensive maintenance: name the
code pattern, state the production impact, describe the remedy. Plans stay at the level of code
changes, configuration changes and tests. Leave out working attack strings and step-by-step
misuse.

**Secrets rule:** a secret value never goes into a finding or a plan, because those files get
committed. Give `file:line` and the kind of credential ("payment-provider live key at
`settings.py:31`"). The fix always includes rotation as well as removal, since a committed
secret is compromised even after deletion.

**By design is not a finding.** Ordinary platform conventions are intended: honouring
`https_proxy` and `NO_PROXY`, reading `~/.netrc`, a plainly local developer tool that runs the
configured package manager. A tradeoff written down in an ADR or decision document is settled
too. Raise such a case only if the implementation adds risk beyond the convention or the
recorded decision. Note also that **a stale ADR is a finding in itself**: when the code no longer
does what the decision says, report the drift (either the document or the code is wrong). Do not
let the document silence it.

- Credentials: hardcoded keys, tokens or passwords; secrets in committed `.env` files; secrets
  written to logs or stored in event or history tables. Name only the type and place, then
  advise removal, rotation and a safer way to supply them.
- Untrusted data reaching interpreters or privileged APIs: SQL or shell strings built from
  request data (injection), HTML sinks fed user content (XSS), dynamic-execution APIs given
  runtime input, and file paths built from request data (path traversal). Say which safer API
  or validation boundary would close the gap. Never include a working exploit.
- Access control: endpoints or server actions with no server-side identity check, permissions
  enforced only in the client, records fetched by ID with no owner or tenant check (IDOR), and
  state-changing routes with no request-authenticity check (CSRF).
- Input contracts: request bodies accepted without a schema, file uploads with no type, size or
  storage limits, whole request objects assigned into persistence models (mass assignment).
- Dependencies: run the ecosystem's audit command read-only (`npm audit`, `pip-audit`,
  `cargo audit`). Report only critical or high advisories that reach runtime code or the
  build and distribution path. Skip low-signal noise.
- Production config: overly broad CORS where credentials are allowed, no hardening headers
  (such as CSP) where a browser surface holds sensitive data, cookies without `HttpOnly`,
  `Secure` or `SameSite`, debug or verbose modes enabled in production settings.
- Data minimisation: PII or sensitive operational data in logs, stack traces sent to clients,
  internal error detail shown in API responses.

## 3. Performance

Hunt for algorithmic and structural wins, not micro-tuning.

- N+1: a query or fetch for each item in a loop or each rendered list row, with no batching or
  dataloader.
- Wrong complexity: nested scans of one collection; `find` or `filter` repeated inside a hot
  loop where a keyed map belongs.
- Missing caches: the same costly computation or fetch redone for every request or render; no
  memoisation at obvious function boundaries; no HTTP or data-layer cache on stable data.
- Payload weight: over-fetching (`select *`, whole objects where IDs suffice), unbounded lists
  with no pagination, big JSON sent to clients.
- Frontend, where relevant: bundle makeup (a heavy dependency for a trivial job), no code
  splitting on rarely visited routes, raw images and fonts, client-side fetching of data that
  was available at render time, request waterfalls. For React or Next.js, defer to the repo's
  own framework conventions and any best-practice guidance installed.
- Backend: work done in the request that belongs on a queue; indexes that query patterns imply
  but may be missing (mark for verification; do not assert without schema evidence); a new
  connection per request where a pool exists.
- Build and CI: slow pipelines from missing caches, repeated steps, test suites that could run
  in parallel.

## 4. Test Coverage

The aim is not a percentage. It is to learn which untested code is dangerous.

- Map the critical paths (payments, auth, data writes, the feature the repo exists for) and see
  which have no tests or trivial ones.
- High-churn modules with no tests are the largest refactoring risk. Mark them as candidates for
  "characterization tests first".
- Quality of current tests: assertions that prove nothing, mocks so heavy the test checks the
  mock, snapshots no one reviews, flaky habits (real clocks, live network, dependence on order).
- Missing layers: only unit tests and nothing at API boundaries, or the reverse, a slow
  end-to-end test for what a unit test would catch.
- Verification set-up: is there one command that says whether the code works? If not, that is
  finding one, and a prerequisite plan for every risky change.

## 5. Tech Debt & Architecture

- Duplication: one piece of logic written out in three or more places; copies that have
  drifted apart.
- Layer breaks: UI reaching into data-layer internals, import cycles, a "utils" module that
  became a junk drawer everything imports.
- Dead code: unexported and unused modules, fully launched feature flags that still branch,
  commented-out blocks with no note, manifest entries no longer imported.
- Oversized units: a file that everything touches and that is an order of magnitude
  larger than the repo median; functions with double-digit parameter lists or deeply nested conditions.
- Mixed patterns: three ways of fetching data, handling errors or styling in one repo. Choose
  the winner (the style the team moved to most recently) and plan the merge.
- Wrong abstraction level: a premature abstraction with exactly one implementation (test seams
  and ports are legitimate, so leave those), or no abstraction where every change must touch N
  files together.

## 6. Dependencies & Migrations

- Core framework or runtime far behind by major version. Ignore routine minor bumps; flag only
  the cases where staying behind costs something real (end of life, security fixes stopping,
  ecosystem incompatibility).
- Deprecated APIs in use whose removal date has been announced.
- Abandoned packages (no release for years, archived repos) on critical paths.
- Two packages for the same job (two date libraries, two HTTP clients).
- Lockfile and manifest out of step; version pins that differ across a monorepo.
- For every migration candidate, estimate the blast radius in files touched. It sets the effort
  and decides whether to recommend the migration at all.

## 7. DX & Tooling

- Missing or broken pieces: typecheck script, lint config, formatter, pre-commit hooks,
  editorconfig.
- Slow feedback: a dev server or test start that takes minutes, no watch mode, CI with no
  cache.
- Onboarding friction: README steps that are wrong or incomplete, required env vars nobody
  documented, no `.env.example`.
- No `CLAUDE.md` or `AGENTS.md`. Where agents will carry out the plans this is a high-leverage
  fix; recommend one and put its outline in a plan.
- Logging and errors: unstructured service logs, no request or correlation IDs, debugging that
  needs a code change.

## 8. Docs

Lowest priority by default. Raise something only when its absence has a concrete cost.

- A published package whose public API has no reference docs.
- Architectural choices no one can reconstruct (why X rather than Y) in an area under active
  dispute.
- Docs that are wrong, which is worse than missing: setup steps or API samples that no longer
  compile.

## 9. Direction: what to build next

Here you look ahead. The question is not what is broken but what the project is becoming.
**Grounding rule:** every idea must point at evidence in this repo. If an idea would suit any
project of the same type ("add dark mode", "add AI"), it is filler. Real signals come from:

- **Intent left unfinished**: TODO or FIXME notes piling up around one theme, flags that never
  shipped, stubs and half-built modules, feature code commented out, work dropped midway as
  git history shows.
- **Promises with nothing behind them**: README, docs or roadmap entries lacking code; CLI
  flags or settings that do nothing; issue templates for features that are absent. The best
  anchor of all is a PRD or `PRODUCT.md` naming users, use cases, or a direction that the code
  has yet to reach. Trust it over guessed intent. Never propose what a decision document
  already turned down; report the conflict instead.
- **Lopsided surfaces**: operations that only run one way (export but no import, single create
  but no bulk, webhooks sent but never received), entities missing one of create, read, update
  and delete, a public API the internal code obviously needed and hand-rolled around.
- **The cheap next move**: whatever the architecture makes unusually easy, such as a plugin
  hook one interface away, a public endpoint one route file from an existing service layer, an
  integration the data model already supports.
- **Chores worth absorbing**: manual work users plainly do around the project (docs, examples
  and issues show it) that the project could do for them.

Direction findings use the normal format with two shifts. **Impact** is product value: who
wants the thing and why now. **Confidence** measures how solid the evidence is, not whether the
idea is wise. Strategy is the maintainer's call; your job is grounded options with honest
trade-offs. Effort estimates are coarser here, and you should say so. A plan for a chosen
direction finding is usually a design or spike plan (research, prototype, define the API, list
open questions), not a plan to build the whole thing. Scope it that way.

---

## Finding format

Every finding returns in this form, whichever category or subagent produced it:

```markdown
### [CATEGORY-NN] Short imperative title

- **Evidence**: `path/file.py:123`, then a sentence on what sits there. (One bullet per
  location; keep the 2-5 best, and write "and ~N similar sites" if it is widespread.)
- **Impact**: The harm or cost, concretely: "each invoice export fires 1+N queries", never
  "inefficient".
- **Effort**: S (hours) / M (about a day) / L (several days) to *fix it*, tests included.
- **Risk**: What the fix could break: LOW, MED or HIGH, with one line of reason.
- **Confidence**: HIGH (read the code, certain) / MED (strong signal, still to confirm) / LOW
  (a smell to investigate). A LOW finding can be reported, but it gets an "investigate" plan,
  not a "fix" plan.
- **Fix sketch**: one to three sentences. It is not the plan, only enough to size the work.
```

## Prioritization rubric

Order findings by **leverage: impact over effort, reduced for doubt and for risky fixes**. When
two are close, apply these tie-breakers:

1. If a finding unblocks others (a verification baseline, characterization tests), it goes up.
2. A HIGH-confidence security finding beats a non-security one with equal leverage.
3. Prefer a finding whose fix is simple to verify, since executor models do well on those.
4. A "not worth doing" verdict is valid. Write it with a line of reasoning so the user sees the
   idea was weighed.
