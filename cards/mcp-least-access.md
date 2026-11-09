---
id: mcp-least-access
module: 10-tools-and-mcp
checked: 2026-11-02
---

# MCP servers with the least access

## Why

- **The problem:** an MCP server (a program that gives Claude tools to reach a database, an API or a company system) runs in your session. Whatever it can read, a session can read; whatever it can write, a session can change. A server that fetches outside content can carry prompt injection into the session, and a connection set up for one task tends to stay long after the task is done.
- **The reason:** the vendor's own server, in its read-only mode where there is one, with a credential that does only what the task needs and at the narrowest scope, limits what a mistake or an injected instruction can reach. Scanning its source and reading its code first shows what it sends out.
- **The cost of skipping it:** the studio ran a plugin for months without a scan. When it was scanned, the one call that left the machine was not among the scanner's 270 findings; only a read of the code found it ([module 10, Evidence](../modules/10-tools-and-mcp/README.md#evidence)).
- **The principle:** [scan before anything runs in a session](../PRINCIPLES.md#scan-before-anything-runs-in-a-session). A server is code that runs in your session, so it is scanned, read and limited before it connects.

## Detect

Read-only. Server names and scopes only: never a credential, a header, an environment value or a token in a URL.

- Project scope: the names of the servers in `.mcp.json` at the root of each repository in `adoption/inventory.md`, not their settings.
- Every scope: `claude mcp list` prints each server with its state (connected, needs authentication, failed). Claude reports names and states only; if a line shows a token in a URL or an argument, Claude says a secret is exposed there without repeating it. To print a state it has to reach each server, so Claude asks before running it; without your yes, Detect stops at `.mcp.json` and asks you which other servers you use.
- Which scope each server is in: one named in `.mcp.json` is project scope. Local and project servers load only in their own project, and user servers in all of them ([docs/facts.md](../docs/facts.md), "Claude Code: MCP servers"), so Claude runs `claude mcp list` once more in an empty temporary folder: a server listed there too is user scope (or comes from a plugin or a claude.ai connector), and one listed only in the project and not in `.mcp.json` is local.
- Records: whether each server has a row in `adoption/decisions.md`, or in your own notes, naming its source, its scope and its access.

The menu marks the item **have** when every server Detect finds has a recorded source, scope and access, **partly** when some do, and **not yet** when none do or there are no servers yet. With no servers, the item stays optional until you want one.

## Ask

1. **"Which server, from whom?"**
   - The vendor's own server. Recommended when the vendor of the system publishes one.
   - A community server, only after `vet-and-adopt` and a read of its code for outgoing calls. Recommended only when no official one exists.
   - A claude.ai connector from the directory, when you use claude.ai with the same account: it also appears in Claude Code under `/mcp` ([docs/facts.md](../docs/facts.md), "claude.ai: connectors").
   - None: Claude works from files or exports you give it.
   - Not sure: the vendor's own server, the option recommended above. Claude looks for it and shows you what it found, with its source, before anything is added; when there is none, it says so and adds nothing.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no server.
2. **"What may it do, and with which credential?"**
   - Read-only, with a credential made for this server alone: a read-only database user, or a token scoped to one project. Recommended when the task only reads, such as questions, reports or dashboards.
   - Read and write, limited to one project, schema or space. Only when the task must change something there.
   - The server's own sign-in, company single sign-on included, which you complete yourself. Recommended when your company requires single sign-on for that system.
   - Not sure: the option recommended above: the server's own sign-in when your company requires single sign-on for that system, otherwise read-only, with a new credential made for it; widening it later is one change.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no credential, so no server.
3. **"Which scope?"** ([docs/facts.md](../docs/facts.md), "Claude Code: MCP servers")
   - Local, the default: this project, and only you. Recommended to start with.
   - Project: shared with your team through `.mcp.json` in version control, holding `${VAR}` references and no secret. Recommended when your team has agreed on this server.
   - User: every project on your machine. Recommended only when every project needs it.
   - Not sure: local, the option recommended above.
   - Default when skipped: local.

## Needs

- Claude Code. Every `claude mcp` command here is in [docs/facts.md](../docs/facts.md), "Claude Code: MCP servers".
- SkillSpector, for the scan of the server's source ([SkillSpector](skillspector.md)).
- For a local server started with `npx`, Node.js; with `uvx`, uv:
  - Windows: `! winget install --id OpenJS.NodeJS.22 -e` and `! powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`;
  - macOS and Linux: Node.js through nvm, the lines in docs/facts.md, "Installing the tools on Windows, macOS and Linux", and `! curl -LsSf https://astral.sh/uv/install.sh | sh`.
- An account on the system with the right to create a narrow credential, or someone who can create one for you.
- On Team and Enterprise plans, an admin: only admins add servers there ([docs/facts.md](../docs/facts.md)).

## Steps

1. **you:** for each system, answer three questions: what can it read, what can it write, and can it be read-only? Claude writes your answers into `adoption/spec.md`.
2. **Claude:** finds the source repository of the server you chose and runs `vet-and-adopt` on it: a SkillSpector scan, triage, and a read of its code by hand for calls that leave your machine. A verdict other than SAFE waits for your decision. A server started with `npx` or `uvx` can fetch its packages from their registry when it starts, so what runs is not only the code you scanned; review the packages a server pulls before you run it, as you would review any dependency.
3. **you:** create the credential in the system itself, as narrow as question 2 decided, and put it in an environment variable in the environment Claude Code starts in, under the name Claude gives you, such as `<SERVICE>_TOKEN`. Never paste it into the chat.
4. **Claude:** shows the add command for your scope and runs it on your yes, from its own shell. It stores the variable's name, never its value. A value typed after `--env` or `--header`, or filled in by the shell from `"$<NAME>"`, is treated as written into `~/.claude.json` in plain text, while a `${<NAME>}` reference is stored as written and expanded from your environment when the server starts, for local and user servers as well as project ones ([docs/facts.md](../docs/facts.md), "Claude Code: MCP servers"). So every route uses the reference:
   - a local program: `claude mcp add-json <name> '{"type":"stdio","command":"<command>","args":[<args>],"env":{"<NAME>":"${<NAME>}"}}'`, with `--scope user` after it for user scope;
   - a remote server: `claude mcp add-json <name> '{"type":"http","url":"<url>","headers":{"Authorization":"Bearer ${<NAME>}"}}'`, with `--scope user` for user scope. Give the variable a name of your own: names of Claude Code's own and other credentials, such as `ANTHROPIC_API_KEY`, `HTTPS_PROXY` or `NPM_TOKEN`, read as empty in a remote server's URL and headers;
   - project scope: `.mcp.json` is shared. Claude writes the same reference into the file itself (for example `"Authorization": "Bearer ${<NAME>}"`), with no secret and no machine-specific path in the file, and shows you the file before saving it.

   The single quotes keep the shell from filling the value in.
5. **you:** any sign-in, company single sign-on included, is yours; Claude never types a password or a token. A remote server that signs in through your browser: run `/mcp` in the session and follow the steps in your browser, or `claude mcp login <name>` in a separate terminal ([docs/facts.md](../docs/facts.md), "Claude Code: MCP servers"). A sign-in that asks for a password or a code in the terminal goes in a separate terminal, not through `!`: whether a `!` command can take typed input is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files").
6. **Claude:** records one row in `adoption/decisions.md`: the server, its source, the scan result, the scope, read-only or not, the variable's name (never its value), when to remove it, and the undo.

## Check

1. **Claude:** `claude mcp list`. Expected: the server's name with the state connected, not "needs authentication" or "failed". For the scope: a project server's name is in `.mcp.json`; a local one is not listed when `claude mcp list` runs in an empty temporary folder; a user one is ([docs/facts.md](../docs/facts.md), "Claude Code: MCP servers").
2. **Claude:** `claude mcp get <name>`. Expected: the variable shown by name, `${<NAME>}`, never a value; that command shows a reference by name rather than its value ([docs/facts.md](../docs/facts.md)). A token or key in the output means a value was stored: Claude says so without repeating it, and the item is not done until the credential is replaced and the server is removed and added again with the reference.
3. **you:** in a session, ask Claude for one read through the server, such as listing a few tables or items: it returns them. Then ask for one write you would not mind, such as creating an item named `mcp-write-check` in a test space. Expected for a read-only choice: the server or the system refuses it with a permission error. For a read-and-write choice, the same write outside the allowed project is refused.

If the server is not connected, or a write that should be refused goes through, the item is not done: Claude deletes the test item, you narrow the credential, and the plan row stays unticked until the refusal shows.

## Undo

- **Claude:** for a remote server, `claude mcp logout <name>` first, which revokes its stored sign-in (removing the server alone does not); then `claude mcp remove <name>`. For a project server, it also checks that the entry is gone from `.mcp.json`.
- **you:** revoke or delete the credential in the system itself, and remove the environment variable.
- **you:** to be asked again about a project's servers, `! claude mcp reset-project-choices`.
- **Claude:** marks the row in `adoption/decisions.md` as undone.

## Watch out

- **Outside content can carry instructions.** A server that fetches web pages, tickets or mail can bring prompt injection into your session ([docs/facts.md](../docs/facts.md)); give such a server read-only access first of all.
- **`claude -p` does not ask.** An interactive session asks before it uses a project's servers; a `claude -p` run loads them without asking, so keep `.mcp.json` to servers you trust.
- **Same name, several scopes.** Local wins over project, project over user, user over plugins, and plugins over claude.ai connectors ([docs/facts.md](../docs/facts.md)); a forgotten local server can hide the one your team shares.
- **Team and Enterprise plans:** only admins add servers, and an Owner adds a claude.ai connector for the organization; ask before you plan around one.
- **Scores are noisy both ways.** A plugin of pure prose scored 40/100 on eight findings, each the phrase "not limited to" in its licence text, while another plugin's real outgoing call produced no finding ([module 10](../modules/10-tools-and-mcp/README.md#the-mechanism)). Read the findings, then the code.
- **Your own network stays out of shared files.** No real address or machine name goes into a committed `.mcp.json`, not even in a comment ([a real address in history](../examples/real-address-in-history.md)).
- **Your company's data rules win.** Whatever a server reads enters your session; check that your company's rules let that system's data reach Claude before you connect it.
- **Connections outlive tasks.** Remove a server when its task ends, and put the date to check it in its decision row.
- **Token cost:** every connected server's tool names load into each session before you type ([docs/facts.md](../docs/facts.md)). The kit has no estimate for a typical server; type `/context` to see what yours cost.
