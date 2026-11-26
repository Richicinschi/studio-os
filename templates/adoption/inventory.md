# Inventory

Written by `drill-to-adopt`'s discovery, read-only, on <YYYY-MM-DD>. Secrets and data files are listed by name and counted, never opened.

The script `node tools/audit.mjs`, run from the kit, fills Stack, File types (top 15), Repositories, Existing Claude setup, Hooks and Present but not opened, and the Kind, Name, Scope and What it does columns of Already installed, for the setup folder: names only, never values. Claude fills the rest (profiles, the user-level rows and plugins, the last three columns of Already installed, and the sections from What loads into every session today on) without opening the files the script reads.

**Setup folder:** <path> · **Looked at:** <the whole folder / one subfolder> · **Starting point:** <empty / existing work / existing Claude setup>

profiles: <data / ml / software / general, inferred from manifests and file types only; one line each: the profile and the file that suggested it>

## Already installed
| Kind | Name | Scope | What it does (its own description) | Tokens every session | Scanned (yes / no / unknown) | Against the kit |
|---|---|---|---|---|---|---|

<Against the kit: "same job as <id>", "overlaps <id> in part", or "nothing like it in the kit, keep it". Names and descriptions only: never a skill's body, a credential, an environment value or a hook's contents.>

## Stack
| Kind | Found | Where (manifest or file type) |
|---|---|---|

## File types (top 15)
| Extension | Count |
|---|---|

## Repositories
| Folder | Remote host | Branch | Clean |
|---|---|---|---|

## Existing Claude setup
| File or folder | Present | Notes |
|---|---|---|
| `CLAUDE.md`, `AGENTS.md` | | |
| `.claude/settings*.json` | | |
| `.claude/skills/`, `.claude/agents/` | | |
| `.mcp.json` | | |
| Other agent tools' instructions (Cursor, GitHub Copilot, Gemini CLI, Codex, Windsurf, Devin, Kiro) | | |

## Hooks
| Repository | Hook setup (`.husky/`, `.pre-commit-config.yaml`, `.git/hooks/`) |
|---|---|

## Present but not opened
<Secret-looking files and data files: their kind, how many, and up to 10 of their paths, as the script prints them; never their contents. An inventory from before the script has the kind and how many only.>

## What loads into every session today
| What | Size | Tokens (estimate) |
|---|---|---|
| Instruction files and what they import | | |
| Skill descriptions (<N> skills) | | |
| Agent descriptions (<N> agents) | | |
| **Total** | | |

<An estimate: file sizes divided by 4. Type `/context` in Claude Code to see the live breakdown. When the audit script ran, files imported with `@` are not counted in the first row, since finding them means opening the instruction files; an inventory from before the script counted them.>

## What the kit covers
| Your work or tool | Covered / partly / not covered | Kit module or item |
|---|---|---|

## Kit items you already have
<From each card's Detect: the items marked have or partly, and what was found (names and settings only, never values).>

## Confirmed in round 1
<Each item the adopter confirmed or corrected.>
