---
id: pack-python-backend-fastapi-docker-agents
module: domains
checked: 2026-11-09
tokens:
  light: 36
  standard: 36
  full: 36
---

# Domain: Python back ends, FastAPI, Docker and AI agents

## Why

- **The problem:** a Python back end that works on your laptop is not yet one you can run for other people. Packaging, logging, health checks, a container that runs as root and an AI agent with no tests are the gaps a first version leaves, and a non-coder who builds with Claude does not know to ask about them.
- **The reason:** this pack gives Claude four skills, each a written procedure with templates: set up a Python project with `uv`, `ruff` and `pytest`; build a FastAPI service with structured logging, health checks, error handlers and middleware; harden a Docker image with multi-stage builds, a non-root user and no secrets in layers; and build an AI agent in Python with Pydantic AI, with tools, structured output and tests.
- **The cost of skipping it:** Claude writes each of these from memory, in whatever style it last saw, and the gaps show up when the service is live.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The skills end in checks you can run (a health endpoint, the container's user, the test run) instead of a statement that it works.

## Detect

Read-only: presence and versions, never the contents of your code. Tools the skills use, printed as found or not found:

- `python --version 2>/dev/null || python3 --version`, and `uv --version`, `docker --version` and `node --version` (the last one only matters for the Node Docker template).
- The pack, at project and user level: `ls -d .claude/skills/python-backend-fastapi-docker-agents "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/python-backend-fastapi-docker-agents 2>/dev/null`.
- Another skill that already covers the same jobs, from front matter only. Print each file's `name` and `description` lines and nothing below them:
  `awk 'FNR==1{n=0} /^---[[:space:]]*$/{n++; next} n==1 && /^(name|description):/{p=1; print FILENAME": "$0; next} n==1 && p && /^[[:space:]]/{print FILENAME": "$0; next} {p=0}' .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md 2>/dev/null | grep -iE 'python|fastapi|docker|pydantic'`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already covers Python, FastAPI or Docker and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you build or run Python back ends, containers or AI agents?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names an API, a Python service, a Dockerfile or an AI agent as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when one project is the Python service.
   - Every project, in your user folder. Recommended when you build Python services in several.
   - Not sure: this project only.
   - Default when skipped: this project only.

## Needs

- Python 3.11 or newer for the project setup skill; `uv` for installing packages; `docker` to build and run images. Which of these a task needs depends on the skill. None of the four skills has a "Without local tools" section, so on claude.ai Claude can write the files and explain the commands, and you run them on your own computer.
- A model provider key if you build an AI agent: the agent skill's examples call a hosted model, and the key stays in your environment, not in the code.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/python-backend-fastapi-docker-agents/`: scans it with SkillSpector (`skillspector scan catalog/packs/python-backend-fastapi-docker-agents --no-llm`), triages the findings, and recommends the decision. Your own scan is the one that decides.
2. **Claude and you:** read the code files the pack ships, together. They are templates, and they run only when a project copies them: `skills/production-fastapi/templates/` holds `error_handlers.py`, `health_checks.py`, `logging_config.py` and `middleware.py`; `skills/production-docker/templates/` holds a Dockerfile for Python, one for Node, a compose file and a `.dockerignore`; `skills/modern-python/templates/` holds a Dependabot file and a pre-commit file.
3. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/python-backend-fastapi-docker-agents/`. The pack has no agents and no standalone stubs. It shows the list first and saves on your yes.
4. **Claude:** records the decision, the scope and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose, including the four skill files under `skills/`.
2. **you:** in a new session, say "I want to put my FastAPI app in a Docker image". Expected: Claude opens the pack's entry, picks the Docker skill, reads it in full, and builds on a multi-stage image that runs as a non-root user.
3. If Claude writes a Dockerfile without opening the pack, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `python-backend-fastapi-docker-agents` folder from `skills/`.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 36 tokens (estimate, bytes divided by 4). Its index, about 458 tokens (estimate), loads when a task reaches the pack, and each skill only when it is used.
- **Your code is session content.** Files Claude reads from your service go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you open code that holds customer data.
- **The modern-python skill does not migrate a project on its own.** It starts a migration off pip or Poetry only when you ask.
- **Keys and images.** The Docker skill says to pass secrets with BuildKit mounts so they stay out of image layers. Keep that rule when you adapt it.
- **Author field and sample names.** The skills carry the studio's author name in their front matter, and the agent examples name particular hosted models. Replace the author with yours, and check the model names against what your provider offers today.
