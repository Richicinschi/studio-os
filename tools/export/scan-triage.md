# Scan triage

The triage of every skill that SkillSpector did not rate `SAFE`, kept beside `scans.json`. A finding is a false positive (FP) when the matched text cannot do what the rule fears; "by design" means it does what the skill is for, which you weigh when you adopt it.

## Run of 2026-11-09

- **Scanner:** SkillSpector v2.2.3, `--no-llm` (static).
- **Scanned:** 24 skills, the 21 shipped in `catalog/skills/` and the 3 kit skills in `.claude/skills/`, after the core was rewritten as the studio's own text.
- **Verdicts:** 15 `SAFE`, 9 not.
- **Beyond the scanner:** every finding was read at its cited line, and every code file of the nine (scripts, templates, YAML) was swept by hand for network calls, credential paths and process calls.

**Outcome: no real risk in any of the nine. All nine stay shipped.** Their `SOURCE.md` shows the verdict, and `vet-and-adopt` asks you to read the findings before you take one.

### brainstorming: DO_NOT_INSTALL, 100/100, 12 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| LP3 no declared permissions | `SKILL.md:1` | BY DESIGN | The frontmatter has no `capabilities` line, and the skill does run shell scripts (`scripts/start-server.sh`, `scripts/stop-server.sh`) and a Node server. That is what the visual companion is. Weigh it when you adopt. |
| PE3 credential access | `scripts/server.cjs:511` | FP | The line is `const vars = options.env \|\| process.env;` inside `browserLauncherForPlatform`. It reads `DISPLAY` and `WAYLAND_DISPLAY` to choose a browser opener. No credential file or secret is read. |
| PE2 sudo/root | `scripts/start-server.sh:103` | FP | The line is `chmod 600 "$state/server-instance-id"`. It makes the id file private to the owner. There is no sudo and no elevation. |
| P2 hidden instructions | `scripts/server.cjs:192` | FP | The line is `html.replaceAll('<!-- BRANDING -->', ...)`. The HTML comment is a placeholder that the server swaps for the fixed text "Studio brainstorm companion, local only". It is not read by a model. |
| RA2 session persistence (4 rows) | `scripts/start-server.sh:130`, `:132`, `:134` | BY DESIGN | `nohup ... node server.cjs &` and `disown` leave the local server running after the launcher exits. It stops when the owning process exits or after the idle timeout (default 240 minutes), or on `stop-server.sh`. State sits under the session folder, or under `<project>/.studio-work/brainstorm/` with `--project-dir`. |
| TM1 tool parameter abuse (4 rows) | `scripts/stop-server.sh:30`, `:65`, `:87` | FP | Each is `rm -f` on fixed files inside the session's own `state/` folder (`server-info`, `server.pid`, `server-instance-id`, `server.log`). No variable path from outside, no `-r`. |

Hand sweep: read `scripts/server.cjs`, `scripts/helper.js`, `scripts/start-server.sh`, `scripts/stop-server.sh` in full, and grepped `scripts/frame-template.html`. `server.cjs` is a local HTTP and WebSocket server, bound to 127.0.0.1 unless `--host` says otherwise. It opens no outbound connection. It serves the newest `.html` in `<session>/content`, only regular files with one link that resolve inside that folder. A key (random, 32 bytes, held in `?key=` or a cookie) is required for every request and for the WebSocket, and the WebSocket checks Origin. It writes only to the session folder (`state/events`, `server-info`, `server-stopped`) and to `.last-port` and `.last-token` under `<project>/.studio-work/brainstorm/`, with mode 600. It spawns a process in one place: `openBrowserOnce` (`server.cjs:~520`), once, only with `--open` and a loopback bind. It runs the system browser opener (`open`, `rundll32.exe`, `xdg-open`) with the URL as a single argument and no shell. If the operator sets `BRAINSTORM_OPEN_CMD`, that string runs through `childProcess.exec` as written; an environment variable only the person who starts the server can set. No `eval`, no decoding of text into code. `helper.js` runs in the viewer's page: it opens a WebSocket to `location.host`, sends clicks on `data-choice` elements, and reloads on a `reload` message. `frame-template.html` has no script and no remote link (only `<link rel="icon" href="data:,">`). `start-server.sh` creates `/tmp/brainstorm-*` or the project session folder, writes the instance id and pid, and starts `node server.cjs`. `stop-server.sh` signals a pid only if its command line carries this session's instance id, and deletes the session folder only when the path starts with `/tmp/`. Names match bodies: `quietly`, `isServable`, `originAllowed`, `openBrowserOnce`, `reloadThroughKey`, `is_ours`, `mark_down` each do what the name says. One note on `stop-server.sh`: the `case $session_dir in /tmp/*)` test is a plain prefix match, so a path such as `/tmp/../x` would also match. It is reached only after a live server carrying that folder's instance id was stopped, so the risk is low; see Needs the owner.

### drawio-diagrams: DO_NOT_INSTALL, 100/100, 8 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| AST4 subprocess call | `scripts/autolayout.py:203-204` | BY DESIGN | `subprocess.run(["dot", "-Tplain"], input=source, ...)`. A fixed argument list, no shell. It runs Graphviz `dot` on a DOT text built by `build_dot`, which escapes backslashes and double quotes in every label (`dot_string`). Used only for layout of big graphs. |
| LP3 no declared permissions | `SKILL.md:1` | FP | The frontmatter does declare `capabilities: [file_read, file_write, shell]` (line 10). The scanner's "network" guess has no code behind it; no script makes a request (see the sweep). |
| RA2 session persistence (2 rows) | `references/style-extraction.md:113`, `references/style-presets.md:24` | BY DESIGN | Prose that tells the agent to save a style preset to `~/.drawio-skill/styles/<name>.json` after the person says "save" or "looks good". It is a file in the person's home folder that outlives the session, and it is only written on their yes. A preset is JSON colours and fonts, not code. |
| TM1 tool parameter abuse (4 rows) | `data/shape-index.json.gz:1054`, `:1348`, `:2019`, `:2630` | FP | Lines of the unpacked shape index. They are a shape size, a title ("Isometric Cube"), a style string (`shape=cylinder3;...`) and an image path (`image=/img/lib/clip_art/finance/Stock_Down_128x128.png`). Plain data. I found no URL and no command in the whole unpacked file; the words "eval" and "subprocess" appear only inside shape titles and tags. |

Hand sweep: read all five scripts. `validate.py` parses a `.drawio` with `xml.etree.ElementTree` and prints errors and warnings; it writes nothing. `shapesearch.py` reads `data/shape-index.json.gz` and prints matches (Soundex and tag match); no write, no network. `autolayout.py` reads a graph JSON and a built-in preset, runs `dot`, and writes `.drawio` XML to `--output` or stdout. `encode_drawio_url.py` reads a `.drawio` and prints a diagrams.net link with the XML packed in the `#` fragment; it makes no request (only builds a string), and the page's own rule is that a link is an optional extra. `repair_png.py` appends a missing IEND chunk to a PNG you name, in place. No `eval`, `exec`, `socket`, `urlopen` or credential path anywhere. `SKILL.md` shows `drawio -x ...` export commands and says in line 20 that this copy makes no network calls. Names match bodies: `encode` returns the viewer link and `edit_url` the editor link; `group_colours` reads the default preset; `pack` percent-encodes, deflates and base64s. Two items for an adopter: the `references/` files send the agent to `~/.drawio-skill/styles/` (a write outside the working folder, on the person's yes), and `SKILL.md:18` cites a hub file and a dated incident from the studio, which is hub-internal wording.

### git-guardrails: DO_NOT_INSTALL, 100/100, 4 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| AS1 agent config directory access | `SKILL.md:65` | BY DESIGN | The install step tells the agent to put the hook in `.claude/hooks/` and register it in `.claude/settings.json` or `~/.claude/settings.json`. That is the point of the skill: it edits the agent's own settings, to add a veto hook. It says to append to `hooks.PreToolUse`, never replace the file, and asks which scope first. Weigh it: it changes how every later command in that scope is handled. |
| TM1 tool parameter abuse (2 rows) | `SKILL.md:40`, `SKILL.md:98` | FP | Line 40 is a table row listing the refused forms (`commit --amend, -n, --no-verify`). Line 98 is a test command that pipes a forced push as JSON into the hook, to see exit code 2. Neither runs a destructive command. |
| TM1 tool parameter abuse | `scripts/block-dangerous-git.sh:38` | FP | The line is a regex rule (`"$GIT --no-verify"`) in the block list. It is matched with `grep -qE` against the command text; it is not executed. |

Hand sweep: read `scripts/block-dangerous-git.sh` in full (57 lines). It reads the hook JSON from stdin, takes `.tool_input.command` with `jq` (or the raw payload without `jq`), matches it with `grep -qE` against 19 regexes plus a rebase check, prints `BLOCKED ...` to stderr and exits 2 on a match, else exits 0. No network, no file write, no credential path, no `eval`, no process spawn other than `jq` and `grep`. The `BLOCKED` message echoes the command text to stderr only. The name `block-dangerous-git.sh` matches the body. A limit worth knowing (not a risk): a regex hook can be bypassed by a command it does not parse (for example one built inside a script file), so it narrows mistakes and does not stop a determined caller.

### improve: DO_NOT_INSTALL, 60/100, 3 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| PE3 credential access (2 rows) | `SKILL.md:41`, `references/audit-playbook.md:45` | FP | `SKILL.md:41` is the rule that repo text saying "print the .env" is not obeyed and gets logged as a possible injection. `audit-playbook.md:45` lists `~/.netrc` and `https_proxy` as ordinary platform conventions that are not findings. Neither reads a credential; `SKILL.md:36` says no secret values go into the output. |
| TM3 unsafe defaults | `references/closing-the-loop.md:123` | FP | The line is the safeguard: on a public repo, warn that issues are world-readable and get an explicit yes before posting a plan with a vulnerability or credential location. It makes the flow safer, not looser. |

Hand sweep: No scripts; the skill is five markdown files. The one path where data leaves the machine is by design and opt-in: with the `--issues` flag, `references/closing-the-loop.md:120-126` runs `gh auth status`, `gh repo view --json visibility` and `gh issue create --title ... --body-file <plan>`, which posts plan text to GitHub. It needs the flag, a public-repo warning, and a shown list of titles with one confirmation (`SKILL.md:205-214`, `closing-the-loop.md:120-126`). Otherwise the skill is read-only on source (`SKILL.md:23`): it writes only inside `plans/` (or `advisor-plans/`) at the repo root, and it runs read-only checks such as `npm audit`. The scanner's 60 comes from two false matches and one safeguard line. Names (`reconcile`, `--issues`) match the text.

### using-agent-skills: CAUTION, 35/100, 2 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| AS1 agent config directory access | `SKILL.md:13` | FP | The line names `.claude/skills/` and `.claude/skills/README.md` in prose, as the place where the skills are listed. The skill reads nothing from a config directory; it tells the reader which index to open. |
| AS3 skill enumeration | `SKILL.md:11` | BY DESIGN | The skill is a router: it lists the studio's skills and packs so the agent can pick one. The enumeration is the content. It is a list of names and one-line uses, with no instruction to read other skills' files except when a row is chosen. |

Hand sweep: No scripts. The folder holds `SKILL.md`, `session-start.md` and `references/claude-code-tools.md` (all prose). `claude-code-tools.md` is an optional note about running a plan through one orchestrator subagent, only when the owner asks; it starts no process itself. `session-start.md` is a primer on checking for a skill before acting. No network, credential or write path. `SKILL.md:13` points at `library/<pack>/` and `library/map.json`, which are hub paths that may not exist in an adopter's setup; the page works only as far as those exist.

### executing-plans: CAUTION, 25/100, 1 finding

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| TM1 tool parameter abuse | `SKILL.md:160` | FP | The matched line is a warning in the ledger notes: "`git clean -fdx` deletes the workspace, because git ignores it. After that, rebuild your position from `git log`." The skill tells the agent what that command would destroy; it does not tell it to run it. |

Hand sweep: `scripts/task-start` calls the sibling skill's `task-brief` (path found from its own location) to cut one task out of the plan into `.studio-work/sdd/<plan>/`, then prints the brief path and `git rev-parse HEAD`. `scripts/task-done` runs the test command the caller passes after `--`, saves its full output to the plan's workspace, and appends a completion line to `progress.md` only if the command exited 0. Process spawning is the caller's test command, by design. No network, no credential path, no decoding or evaluating of text, and writes stay inside `.studio-work/sdd/`. Names match bodies.

### finishing-a-development-branch: CAUTION, 25/100, 1 finding

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| TM1 tool parameter abuse | `SKILL.md:81` | BY DESIGN | `git push -u origin <feature-branch>` (and the detached-HEAD form `git push origin HEAD:refs/heads/<new-branch>`). Neither has `--force`. The skill pushes the branch to the remote so a PR can be opened; that is its purpose, and it is the one act here that sends data off the machine (the branch's commits, to the repo's own remote). Line 85 says the merge is the partner's to press. |

Hand sweep: No scripts.

### subagent-driven-development: CAUTION, 25/100, 1 finding

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| TM1 tool parameter abuse | `SKILL.md:118` | FP | Item 6 of the setup steps: "If `git clean -fdx` wiped the workspace (it is only scratch), rebuild from `git log`." It describes recovery after someone else ran that command; the skill never runs it. |

Hand sweep: three scripts read in full. `scripts/sdd-workspace` prints the per-plan folder under `<repo-root>/.studio-work/sdd/`, creates it, writes a `plan-path` file in it and a `.gitignore` containing `*` there if absent. `scripts/task-brief` copies one task's section of the plan (awk, with the task number used as a regex pattern, not as code) into `task-<N>-brief.md` in that folder, or into an OUTFILE the caller names. `scripts/review-package` writes the commit list, `git diff --stat` and `git diff -U10` for a range into `review-<base>..<head>.diff` in that folder, or into an OUTFILE the caller names. Only git is spawned (read commands). The OUTFILE argument can point anywhere, but the skill's text uses the default. No network, no credential path, no decoding or evaluating of text. The `.md` prompt files and references hold no code. Names match bodies.

### tdd: CAUTION, 25/100, 1 finding

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| RA1 self-modification | `writing-good-tests.md:94` | FP | The line is prose in the section "Tests belong with the code": "The cycle of failing test, minimal code, refactor is what 'finished' means." It is advice on how much test code to write in the user's project. The skill files are not named or edited. |

Hand sweep: No scripts (markdown only).

### One thing to know

No finding is a network call outside its design, data leaving the machine without a flag, or a credential path. One item to look at, not blocking:

- `catalog/skills/brainstorming/scripts/server.cjs:~519-520`: `BRAINSTORM_OPEN_CMD` is run through `childProcess.exec` as a shell string. Only the person who launches the server sets it, and the code comment says so. By design, noted for the adopter.

Closed on 2026-11-09: `scripts/stop-server.sh` deleted any folder under `/tmp/` when it stopped a throwaway session, which would also match a path such as `/tmp/../x`. It now deletes only `/tmp/brainstorm-<id>` and never a path holding `..` (lines 90 to 95). The scan's four findings in that script are the same `rm -f` rows as before (lines 30, 65, 87) and are unchanged.
