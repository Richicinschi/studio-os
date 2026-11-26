# Other agent tools and this kit

The kit installs into Claude Code. Several other agent tools read the same kinds of files, so part of what you adopt reaches them too. This page says what carries over to each, as the tools' own pages said on 2026-11-25. Each fact, with its source, is in [docs/facts.md](facts.md), "Other agent tools: instruction files, skills and hooks"; that section is re-checked every 30 days. The kit has no installer for other tools, and none is planned (public issue #16 says why).

## What carries over

| Tool | Your front door, `AGENTS.md` | Your skills, `SKILL.md` folders in `.claude/skills/` | Your hooks, in `.claude/settings.json` |
|---|---|---|---|
| OpenAI Codex | Read | Not named by its pages; it reads `.agents/skills/` | Not named by its pages; its own hooks use Claude Code's event names |
| Gemini CLI | Read only when its `context.fileName` setting lists it | Not named by its pages; it reads `.gemini/skills/` and `.agents/skills/` | Not read; its own hooks have other event names |
| Cursor | Read, at the root and in subfolders | Read | Run, the project's and the user-level ones, by default |
| GitHub Copilot | Read by its agent | Read | Run by its CLI and in VS Code, the repository's file only; its cloud agent reads `.github/hooks/` only |
| Devin, which Windsurf's agent pages now point to | Read | Read | Run, the project's and the user-level ones, by default |
| opencode | Read | Read | Not read; it has plugins of its own |
| Kiro | Read | Not named by its pages; it reads `.kiro/skills/` | Not read; it has hook files of its own |

Each of these tools takes a skill as a folder holding a `SKILL.md`. One that does not read `.claude/skills/` reads the same folder copied to its own place: `.agents/skills/` for Codex and Gemini CLI. The kit does not copy it for you; a copy is the same content you already scanned.

## What it means for you

- **Your front door and your skills travel.** Most of these tools read `AGENTS.md`, and four of them read `.claude/skills/` as it is. What you wrote for Claude reaches them without a second copy.
- **Your hooks run in three of them, untested.** The kit's hooks are the git guard, the session-start status and the end-of-session check. They were written and tested for Claude Code only.
  - Cursor, GitHub Copilot and Devin pick up the hooks in `.claude/settings.json`. Cursor maps Claude Code's hook names to its own.
  - VS Code's hooks page warns that "Sharing a hook file location does not establish runtime compatibility."
  - Whether the git guard refuses the same commands there is not tested.
- **If you use one of them on the same folders**, do two things:
  - Repeat, in that tool, the step of each hook card's Check that you run in a session yourself: step 2 of the git guard's, step 3 of the session-start status's, step 4 of the end-of-session check's. The other steps feed the script by hand, and those run the same in any tool.
  - Or stop the import, knowing what else it stops:
    - **Cursor:** the setting "Include Third-Party Plugins, Skills, and Other Configs" also stops your `.claude/skills/`.
    - **Devin:** `read_config_from` with `claude` set to `false` also stops `CLAUDE.md`, your skills and your MCP servers.
    - **Copilot:** it has no switch for the Claude Code files alone. VS Code's `chat.useHooks` stops all repository hooks, and the CLI's `disableAllHooks` skips every hook in a file.
- **Other tools' rules stay where they are.** The audit in phase 1 lists the instruction files other tools keep: Cursor's `.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md` and the others in the facts section. It shows their names and headings only, so the drill can ask whether your front door should say the same things.

## What this page does not cover

- **Tools whose pages could not be read.** Amp, Zed, JetBrains Junie and others that the AGENTS.md site lists: on 2026-11-25 their pages gave no answer that could be read.
- **Running any of these tools with the kit.** What is written here is what their pages say, not a trial.
