---
id: production-fastapi
module: 09-data-work
checked: 2026-11-02
---

# Production FastAPI

## Why

- **The problem:** a Python service, or an agent that calls or serves HTTP, with no timeout on its outside calls, logs nobody can search, and no way to ask whether it is ready. Module 09 asks for typed request and response models, an explicit timeout on every outside call, and structured logging, and says the rules carry over beyond FastAPI.
- **The reason:** the skill holds production patterns for FastAPI, a Python web framework, with ready templates: start-up and shutdown in one `lifespan` function, structured JSON logs with a request id on every line, separate "alive" and "ready" health checks, one error format (RFC 7807 problem details, a standard JSON shape for errors), a timeout on every outside call, and security basics such as parameterised queries, request size limits, security headers and no wildcard CORS (the browser rule for which other sites may call your API) together with credentials.
- **The cost of skipping it:** the kit has no story of its own here. Without it, each service finds these patterns one incident at a time.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). A readiness check and a request id on every log line turn "the service is up" and "that request failed" into things you can look up rather than assert.

## Detect

Read-only: folder names, the front matter of skills and agents (their name and description), and counts of files, never a skill's body, a data file, a `.env` file or any other credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/production-fastapi "$U/skills/production-fastapi" 2>/dev/null`.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'fastapi|starlette|uvicorn' && echo "$f"; done`
- Whether the project uses FastAPI, as a count of files: `grep -rliE 'fastapi' --include=pyproject.toml --include='requirements*.txt' . 2>/dev/null | wc -l`.
- Module 09's checklist line on timeouts and logging, already in an instruction file: `grep -inE 'timeout|structured log' CLAUDE.md AGENTS.md 2>/dev/null`.
- Whether [building-pydantic-ai-agents](building-pydantic-ai-agents.md) is in place too: `ls -d .claude/skills/building-pydantic-ai-agents "$U/skills/building-pydantic-ai-agents" 2>/dev/null` (the two descriptions overlap).

The menu marks the item **have** when a skill named `production-fastapi` exists, or another skill covers FastAPI services; **partly** when only an instruction-file rule covers timeouts and logging; **not yet** otherwise.

## Ask

1. **"Take production-fastapi?"**
   - ADAPT: the kit copy with its trigger narrowed to FastAPI and its pointers to six sibling skills removed (step 2). Recommended when Detect says **not yet** and you build or maintain a FastAPI service.
   - ADOPT as it is: the body, checklist and templates as they ship; Claude still removes the front matter's studio lines and the pointers that lead nowhere.
   - FOLD: module 09's lines on timeouts and logging into the project's instruction file. Recommended when you call HTTP services but do not serve one, or Detect says **partly**.
   - Skip. Recommended when Detect says **have**, or you build no HTTP services in Python.
   - Not sure: the option recommended above for what Detect found: skip for **have**, ADAPT when it counted any FastAPI file, otherwise FOLD.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"** (for ADAPT or ADOPT)
   - This project: `.claude/skills/production-fastapi/` in the service's repository. Recommended in most cases, since its trigger is broad.
   - Every project: `~/.claude/skills/production-fastapi/`.
   - Not sure: this project, the option recommended above and the narrower choice.
   - Default when skipped: this project.

## Needs

- For the skill: nothing beyond Claude Code.
- For the service it helps you build: Python, FastAPI, and the libraries its templates import (structlog for logs, httpx for outgoing calls, and a database driver if you use the database example). Installing them is not documented in docs/facts.md as of 2026-11-02; uv is ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux").
- SkillSpector, for the scan in step 1: row 1 of your plan ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/production-fastapi/`: `skillspector scan catalog/skills/production-fastapi --no-llm` (on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows). Expect DO_NOT_INSTALL; Claude shows each finding with its reading of it, and continues only when you have read them and say so (Watch out has the studio's triage).
2. **Claude:** on your yes, writes the copy for your setup and shows you the change before it saves it:
   - the description's triggers in your words, keeping FastAPI, Starlette and Uvicorn, and dropping the bare `pydantic` trigger if you take [building-pydantic-ai-agents](building-pydantic-ai-agents.md) too;
   - the "Cross-References" section and the other pointers to six sibling skills (for databases, containers, deployment, monitoring, review and planning) dropped, or pointed at what you use: the kit does not ship them;
   - the front matter's author, the studio's note on what it was kept for and its adoption notes dropped; the upstream source line kept;
   - `checklist.md` and `templates/` kept, and `LICENSE` kept (MIT, per the `LICENSE` file itself, the kit's only source for it).
3. **Claude:** for FOLD, writes into the project's instruction file, in your words: every outside call has an explicit timeout, and logs the request and the outcome.
4. **Claude:** records the decision, the scope, the scan result and its triage, and the undo in `adoption/decisions.md`.

## Check

1. **you:** in a new session in the service's repository (or a temporary folder with a one-route FastAPI app), ask "add start-up and shutdown handling and health checks to this app".
2. Expected: Claude uses `lifespan`, not the older `on_event`; adds `/health/live`, which returns 200 without checking anything, and `/health/ready`, which checks each dependency with its own short timeout; and gives the outgoing HTTP client an explicit timeout.

If the answer uses `on_event`, or a readiness check without timeouts, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/production-fastapi/` or `~/.claude/skills/production-fastapi/`, whichever scope you chose. For FOLD, it removes the lines it added, which `adoption/decisions.md` names.
- **Claude:** adds the removal to `adoption/decisions.md`. Service code written with it stays; it is your code now.

## Watch out

- **The scan says DO_NOT_INSTALL, and the studio kept it.** The build of SkillSpector that reports 2.2.3 rated the kit copy 100/100 from 13 findings. The studio read each one: six example addresses at a reserved example domain, where nothing is sent; a log level set from its name; a code comment; coding advice; a front-matter match with no content; and licence text, all false positives. One is by design: the app's settings read its own `.env` file, the usual pattern, so keep `.env` out of git. By hand: the templates create an HTTP client with timeouts for the app's own calls and name no outside host. The skill ships no executable scripts; its templates are code for your own app.
- **Its CORS default is `http://localhost:3000`.** Change it to your real front end before you deploy.
- **Its error handler can report to Sentry.** `templates/error_handlers.py` calls `sentry_sdk.capture_exception`, which sends nothing until you set Sentry up; if your company forbids sending errors outside, take that call out ([the kit's scan triage](../tools/export/scan-triage.md)).
- **The largest body in this module.** It loads at about 6,080 tokens, more than the 5,000 tokens a compaction keeps of each skill body ([docs/facts.md](../docs/facts.md), "Claude Code: context commands, subagents, extra folders"), so part of it may not survive a compaction; which part is not documented. Its description loads every session, about 140 tokens. Estimates (bytes divided by 4).
- **A broad trigger.** The description fires on any `pydantic`, `starlette` or `uvicorn` import as well as `fastapi`. With [building-pydantic-ai-agents](building-pydantic-ai-agents.md) adopted, both bodies can load in one Pydantic project, about 9,050 tokens together (an estimate).
- **Opinionated.** It prescribes structlog, Gunicorn with Uvicorn workers, and no `print()` anywhere. Where your company already has a logging or deployment standard, that standard wins: FOLD the timeout and health-check ideas instead.
- **The pointers dangle on purpose.** The upstream ships sibling skills that this one points to; the studio took only this one and a container skill (which the kit lists in its catalog, not shipped) and left the other pointers in place, leading nowhere. Remove or redirect them.
