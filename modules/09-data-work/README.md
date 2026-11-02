---
title: Data work
pack: data-work
sources:
  - .claude/skills/claim-auditor/SKILL.md
  - .claude/skills/modern-python/SKILL.md
  - .claude/skills/production-fastapi/SKILL.md
  - .claude/skills/building-pydantic-ai-agents/SKILL.md
  - .claude/skills/supply-chain-risk-auditor/SKILL.md
  - .claude/skills/tdd/SKILL.md
  - .claude/skills/drawio-diagrams/SKILL.md
questions:
  - "Which tools do you use: which SQL dialect, Python or not, and which BI tool?"
  - Do your agents call HTTP APIs or databases, and do you test their tool calls?
  - Must every number you ship trace back to the query that produced it?
---

# Data work

Words you do not know are in [START-HERE, "Words used in this kit"](../../START-HERE.md#words-used-in-this-kit).

## The problem

Three things go wrong in data work done with Claude:

- a number in a dashboard or a slide that nobody can trace back to the query behind it;
- an agent whose tool calls into an API or a database were never tested;
- a package installed because a snippet needed it, with no look at who maintains it.

The first is the expensive one. The studio's review of its own Claude usage, quoted in the `claim-auditor` skill, named unverified claims its most persistent kind of rework: cheap to check before shipping, expensive to retract after.

## The mechanism

- **Trace every figure** with `claim-auditor`. It lists every claim in a deliverable, axis labels, table headers and units included, names the source of each, re-runs the script or query behind every figure instead of trusting a quoted value, and grades each GREEN, AMBER or RED. A claim it cannot trace is itself a finding. To re-run a query, Claude needs the access you used: the same database client or interpreter on the machine where it runs, or a connection through an MCP server ([module 10](../10-tools-and-mcp/README.md)). A figure it cannot re-run, you re-run yourself; [its card](../../cards/claim-auditor.md) lists what it needs.
- **Analysis code is code.** `modern-python` sets up Python with uv (a Python package and tool manager), ruff (a linter and formatter) and ty (a type checker). `tdd` writes the test first, so a transformation is checked against a known input and output before it touches real data. If your team works in notebooks or with conda, the ideas still apply, a linter, types and a test before real data; take them into your own setup (FOLD) rather than switching tools.
- **HTTP integrations** follow `production-fastapi`: typed request and response models, an explicit timeout on every outside call, structured logging. The rules carry over beyond FastAPI.
- **Tool contracts for agents** come from `building-pydantic-ai-agents`, a reference even if you use another framework. Each tool has typed inputs and a typed output; leaving free text out of the output type forces a structured result; tests run the agent against a test model (a stand-in that returns set answers, so no real model is called), so tool calls are checked deterministically.
- **Before adding a package,** `supply-chain-risk-auditor` looks for single maintainers, abandoned projects, past vulnerabilities and no security contact.
- **Document the data flow** with `drawio-diagrams`: sources, transformations and outputs in one editable diagram, a `.drawio` file you edit in the draw.io app, with an SVG picture beside it that opens in a browser ([its card](../../cards/drawio-diagrams.md) lists what it needs).
- **Office files and charts.** Anthropic's built-in document skills handle Excel, Word, PowerPoint and PDF files (`docs/facts.md`, "claude.ai: custom skills and the built-in document skills"). The same section records that a `dataviz` skill is **not** documented as an Anthropic built-in, in claude.ai or in Claude Code. The kit names it in its catalog without any files (catalog-only: there is nothing to adopt), so do not plan around it.

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

The studio reviewed an outside process framework, published as one Claude Code plugin with many commands and skills, much of it for tools the studio does not use. The verdict: adopt zero of its files, fold five of its ideas into tools the studio already had, and build two small tools of its own.

Two findings matter to anyone weighing a plugin like it. Its licence was source-available and ruled out one commercial use, so read a licence yourself before you copy any file. And its telemetry was on by default, sending data about the user and the repository out. The security scanner rated it critical; every finding checked by hand was a false positive, and the scanner missed the telemetry. The scan is a gate; the reading is still yours. The full review: [examples/outside-framework-review.md](../../examples/outside-framework-review.md).

## Apply it in Claude Code

An adoption order for a data analyst, each item through `vet-and-adopt`, which recommends SKIP, FOLD, ADAPT (take it rewritten in your words, for your tools) or ADOPT:

1. `claim-auditor` first; it pays off on your next report. ADAPT its list of claims that are RED on sight (graded RED until checked independently, whatever their source) to what is sensitive in your company (studio-specific: its examples come from the studio's own kinds of work).
2. `modern-python` and `tdd`, if you write Python. ADAPT `tdd` to your own test runner, for Python usually pytest, which `modern-python` sets up (studio-specific: `tdd` names the runners of the studio's own stacks).
3. `supply-chain-risk-auditor` before your next package install. It needs `gh`, GitHub's command-line tool; installing it is not covered in `docs/facts.md`, so use GitHub's own install page, then check that `gh --version` prints a version. [Its card](../../cards/supply-chain-risk-auditor.md) lists what else it needs. ADAPT its package managers to yours.
4. `drawio-diagrams` when you document a pipeline (studio-specific: its trigger examples name the studio's own work).
5. If you build agents: `building-pydantic-ai-agents` as the reference, and `production-fastapi` when the agent calls or serves HTTP.
6. Later, if they fit: `diagnosing-bugs` for a failure or a slowdown, `codebase-design` for code that will grow.

Then put the tool-contract checklist into the front door of the repository where you build the agent, under its rules: its `AGENTS.md`, or its `CLAUDE.md` when it has only that. In a company repository, ask first, or keep the checklist in a local file that stays out of git ([module 11](../11-workspace-layout/README.md)):

- every tool has typed inputs and a typed output model, never free text where a structure is expected;
- every outside call has an explicit timeout, and logs the request and the outcome;
- every tool has a test that runs without a real model and checks which tool was called with which arguments;
- every number the agent reports names the query or call that produced it.

## Apply it in claude.ai

1. Turn on the document skills as `docs/facts.md` describes ("claude.ai: custom skills and the built-in document skills"). On Team and Enterprise plans, the owners decide.
2. For a chart, ask for it in the chat. There is no documented built-in `dataviz` skill to switch on.
3. Use claim-auditing as a prompt pattern before anything leaves your hands: "For every number in this, show the query that produced it and re-run it. Grade each GREEN (re-run and matches), AMBER (indirect or stale source) or RED (no source, or it does not match). Do not soften a finding." Claude re-runs only what it can execute there, such as an uploaded file with code execution on; a warehouse query, you run yourself.
4. Paste the tool-contract checklist into the instructions of any Project where you design agents.
5. To use `claim-auditor` itself, it must be vetted first, and vetting needs a terminal with the scanner (START-HERE, "Install steps that come later"). With one, vet it there, write it in your words (ADAPT), then upload it as a custom skill (same facts section). Without one, use the prompt pattern in step 3.

Catalog items used here: [claim-auditor](../../catalog/skills/claim-auditor/SOURCE.md) · [modern-python](../../catalog/skills/modern-python/SOURCE.md) · [tdd](../../catalog/skills/tdd/SOURCE.md) · [production-fastapi](../../catalog/skills/production-fastapi/SOURCE.md) · [building-pydantic-ai-agents](../../catalog/skills/building-pydantic-ai-agents/SOURCE.md) · [supply-chain-risk-auditor](../../catalog/skills/supply-chain-risk-auditor/SOURCE.md) · [drawio-diagrams](../../catalog/skills/drawio-diagrams/SOURCE.md) · [diagnosing-bugs](../../catalog/skills/diagnosing-bugs/SOURCE.md) · [codebase-design](../../catalog/skills/codebase-design/SOURCE.md). Named in the catalog without files in the kit: `anthropic-document-skills` (link-only: it points to Anthropic's own skills, turned on as step 1 says) and `dataviz` (catalog-only: no files and no published source, so it cannot be adopted).
