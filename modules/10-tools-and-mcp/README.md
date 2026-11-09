---
title: Tools and MCP servers
pack: way-of-working
sources:
  - .claude/skills/vet-external-skill/SKILL.md
  - .studio/rules/hard-rules.md
  - .studio/memory/feedback_no_network_info_in_commits.md
  - docs/audits/2026-11-02-frontend-design-triage.md
questions:
  - "Which systems should Claude reach: a database, an API, your company's documents, a BI tool, a ticket system?"
  - Should any connection be read-only?
  - Do you sign in to those systems through company single sign-on?
---

# Tools and MCP servers

Words you do not know are in [START-HERE, "Words used in this kit"](../../START-HERE.md#words-used-in-this-kit).

## The problem

Connecting Claude to a database or a company system, through an MCP server (a program that gives Claude tools for one outside system), is powerful, and the easiest way to give away more access, or more data, than you meant to. Whatever a connected server can read, a session can read; whatever it can write, a session can change. A server that fetches outside content can carry prompt injection into the session (`docs/facts.md`, "Claude Code: MCP servers"). And a connection set up for one task tends to stay long after the task is done.

## The mechanism

- **A server is code that runs in your session.** The studio's scan-first rule covers skills, plugins, MCP servers and hooks alike, new or updated: scan the source, triage what a session actually loads, read the code by hand for outgoing calls, and record the decision before anything is connected. In the kit, `vet-and-adopt` does this.
- **Read the score, then read the code.** Scores are noisy both ways. A skill made only of prose, with no code to run, still gets a score: a prose skill the studio once vetted scanned SAFE at 20 out of 100, and when the studio triaged the plugin it came from, every finding was the phrase "not limited to" in its licence text. The Evidence shows the other way: a scan that missed the one real call.
- **Official first, least access.** The vendor's own server before a community one, its read-only mode where there is one, and a credential that does only what the task needs: a read-only database user, a token scoped to one project.
- **Secrets stay out of the chat and out of your repository.** Credentials live in environment variables that you set yourself; never paste one into the chat. A shared `.mcp.json` refers to them as `${VAR}` and holds no secret and no machine-specific path. A server added with `claude mcp add --env KEY=value` (or `--header`) is different: Claude Code keeps local and user servers in its own config file in your home folder, `~/.claude.json`, and the kit treats the value as written there in plain text, also when your shell filled it in from `"$NAME"`. To keep only the name there, add the server with `claude mcp add-json <name> '<json>'`, the secret written as `${VAR}` inside the single quotes; `claude mcp get <name>` then shows the reference by name, not its value (`docs/facts.md`, "Claude Code: MCP servers", which also lists the variables that read as empty in a remote server's address and headers). The studio's real-address rule applies too: no real address or machine name from your own network goes into a committed file, not even in a comment.
- **One server per need.** Connect what the task needs, and remove what you no longer use.
- **Claude runs what it can; you do what only you can.** Claude shows the non-interactive `claude mcp add` command and runs it on your yes. A sign-in to a remote server, company single sign-on included, is yours: type `/mcp` in the session and follow the steps in your browser, or run `claude mcp login <name>` in a separate terminal; `claude mcp list` shows which server still needs authentication (`docs/facts.md`, "Claude Code: MCP servers"). It is not a `!` command: whether a `!` command can take typed input, such as a password, is not documented ("Claude Code: the ! prefix, /init and local files").

Why the studio works this way, and what ignoring it cost: [PRINCIPLES.md](../../PRINCIPLES.md).

## Evidence

For months the studio ran a plugin that nobody had scanned, because its scan rule named only skills it forked or adapted. When the plugin was finally scanned, the verdict was 100 out of 100, critical, do not install, from 270 findings. Most sat in files a session never loads. Of the 53 that do load, 49 were false positives and four were real but low.

The finding that mattered was not among them. Reading the code by hand turned up one outgoing call: an optional browser companion loaded a logo from the vendor's website, on by default, which tells the vendor your IP address and the plugin's version. The README disclosed it; no skill file did. One environment variable switches it off. The rule that followed covers every skill, plugin, MCP server and hook, and adds that hand check. Code that runs in a session needs reading, not only scanning. [The full triage](../../examples/outside-plugin-scan.md).

## Apply it in Claude Code

1. For each system, answer three questions and write the answers into `adoption/spec.md`: what can it read, what can it write, and can it be read-only?
2. Find the vendor's official server. Run `vet-and-adopt` on its source repository, including the hand read of its code for outgoing calls. A non-SAFE result waits for your decision.
3. Create the narrowest credential the task allows, and put it in an environment variable yourself. Never paste it into the chat.
4. Pick the scope (`docs/facts.md`, "Claude Code: MCP servers"): **local** (the default: one project, only you), **project** (shared with a team through `.mcp.json` in version control) or **user** (every project on your machine). Start local.
5. Claude shows the command that adds the server and runs it on your yes. For a secret, prefer `claude mcp add-json` with a `${VAR}` reference, as above; a value passed with `--env` or `--header` sits in `~/.claude.json` in plain text, which is one more reason for the narrowest credential. A remote server's sign-in you do yourself: `/mcp` in the session, or `claude mcp login <name>` in a separate terminal.
6. Check the server with `claude mcp list`, or `/mcp` inside a session.
7. Record it in `adoption/decisions.md`: the server, its source, the scan result, the scope, and whether it is read-only.
8. When the task ends, remove it. For a remote server, run `claude mcp logout <name>` first: removing it alone leaves the sign-in stored.

On Team and Enterprise plans, only admins add servers. Under `claude -p`, a project's servers load without asking, so keep `.mcp.json` to servers you trust. A local server started with `npx` or `uvx` pulls packages: review the packages they pull before you run them (module 09).

## Apply it in claude.ai

Connectors are how claude.ai reaches outside systems; a custom connector is a remote MCP server added by its URL (`docs/facts.md`, "claude.ai: connectors").

1. Answer the same three questions first.
2. Prefer a connector from the directory: Customize > Connectors > Discover, then Connect to Claude, sign in and approve access. Approve only what the task needs.
3. A custom connector can reach unverified services: vet its source with `vet-and-adopt` in a terminal first.
4. Turn a connector on per conversation (the + menu > Connectors), only in chats that need it.
5. On Team and Enterprise plans, an Owner adds the connector for the organization, and you connect with your own account.
6. Remove connectors you no longer use.
7. A claude.ai connector also appears in Claude Code under `/mcp` when you sign in with a claude.ai subscription, so one decision covers both.

Used here: the kit's [`vet-and-adopt`](../../.claude/skills/vet-and-adopt/SKILL.md). Listed only: `vet-external-skill` (catalog-only, folded into `vet-and-adopt`), `skillspector` (link-only, installed as row 1 of your adoption plan). The practice with its card: [MCP servers with the least access](../../cards/mcp-least-access.md).
