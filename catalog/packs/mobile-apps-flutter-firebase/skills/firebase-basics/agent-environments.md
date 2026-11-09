# Getting the Firebase skills and MCP server into your agent

Install and refresh recipes per agent. Two cross-cutting rules:

- Every skill, plugin, extension or MCP server here comes from outside. Scan and vet it first (studio hard rule 14), name what it will install, and get a yes before running the install.
- After any change, ask the user to restart the app, then stop and wait for their reply before you check that the connection shows up.

## The skills CLI pattern (Cursor, Copilot, Antigravity, others)

1. Look locally: `npx skills list --agent <agent>`; look globally: `npx skills list --global --agent <agent>`. If `firebase-basics` is in either list, the skills are present.
2. If not: `npx skills add firebase/agent-skills --agent <agent> --skill "*"`. Leave off `--yes` and `--global` to choose the location by hand; if the tool asks questions in a terminal, feed the answers through standard input. Re-run the lists to verify.
3. Agent names: Cursor is `cursor`, Copilot is `github-copilot`, Antigravity is `antigravity`; other names are in the skills CLI readme. For Antigravity the local check is whether `.agent/skills/firebase-basics` or `.agents/skills/firebase-basics` exists; the global check is the list command.

## The MCP entry

Each agent keeps a JSON file with a server map. Locations:

- Cursor: `~/.cursor/mcp.json` or `.cursor/mcp.json` in the project; map key `mcpServers`.
- Antigravity: `mcp_config.json` under `.gemini/antigravity/` in the user profile (`~/.gemini/antigravity/` on macOS and Linux, under `%USERPROFILE%` on Windows); key `mcpServers`.
- Copilot in VS Code: `.vscode/mcp.json` or the user `mcp.json`; servers sit under `mcp.servers` and each needs `"type": "stdio"`.
- Windsurf: `~/.codeium/windsurf/mcp_config.json`; Cline: `cline_mcp_settings.json`; Claude Desktop: `claude_desktop_config.json`; key `mcpServers` in each.

If the file or folder is missing, create it containing an empty server map (`{ "mcpServers": {} }`, or `{ "mcp": { "servers": {} } }` for Copilot). A `firebase` entry is already correct when its command is `firebase`, or is `npx` with `firebase-tools` and `mcp` in the args; in that case skip the edit. Otherwise merge in this entry and keep every other server that is already there:

```json
"firebase": { "command": "npx", "args": ["-y", "firebase-tools@latest", "mcp"] }
```

Check the file is still valid JSON. Then restart and confirm the server is connected in the agent UI.

## Claude Code

1. Check skills: `npx skills list --agent claude-code` and the same with `--global`. Check MCP: `claude mcp list -s user` and `claude mcp list -s project`.
2. Both present: done. Neither present: install. Only one present: stop, describe the mixed state, and ask before continuing.
3. Install: `claude plugin marketplace add firebase/agent-skills`, then `claude plugin install firebase@firebase`. Re-check both lists, restart, wait.

## Gemini CLI

1. `gemini extensions list`; if `firebase` is missing, install it with `gemini extensions install` followed by the GitHub address of the firebase/agent-skills repository. Verify with `gemini mcp list` (shows `firebase-tools`) and `gemini skills list`. Restart, wait.
2. Only want the server for one project: `gemini mcp add -e IS_GEMINI_CLI_EXTENSION=true firebase npx -y firebase-tools@latest mcp`, then `gemini mcp list`, restart, wait.

## Android Studio

Skills must sit in `~/.agents/skills`: `npx -y skills add firebase/agent-skills --skill "*" --yes`, then confirm they are there or linked. Skip the MCP server: Android Studio speaks only SSE, the Firebase server speaks stdio, and no bridge is set up.

## Refreshing

- Claude Code: `claude plugin update firebase@firebase`.
- Gemini CLI: `gemini extensions update firebase` (use the real name from `gemini extensions list` if it differs).
- Android Studio: list what the repo offers with `npx -y skills add firebase/agent-skills --list`, compare with `ls -la ~/.agents/skills`, add the missing ones (`--agent android_studio` if supported, otherwise copy or link them from a local clone), then `npx -y skills update --agent android_studio --yes`, or pull the clone and copy again.
- Antigravity, Cursor and everything else: list available skills, list installed ones at project and global level (`Agents: not linked` means installed but not usable yet), add each missing one at the level where Firebase skills already live (global if none), then run `npx -y skills update --agent <agent> --yes`, adding `--global` for the global level.
