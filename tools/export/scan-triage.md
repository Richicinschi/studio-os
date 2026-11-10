# Scan triage

The triage of every skill and every domain that SkillSpector did not rate `SAFE`, kept beside `scans.json`. A finding is a false positive (FP) when the matched text cannot do what the rule fears; "by design" means it does what the skill is for, which you weigh when you adopt it.

## Run of 2026-11-09

- **Scanner:** SkillSpector v2.2.3, `--no-llm` (static).
- **Scanned:** 24 skills, the 21 shipped in `catalog/skills/` and the 3 kit skills in `.claude/skills/`, after the core was rewritten as the studio's own text.
- **Verdicts:** 15 `SAFE`, 9 not.
- **Beyond the scanner:** every finding was read at its cited line, and every code file of the nine (scripts, templates, YAML) was swept by hand for network calls, credential paths and process calls.
- **Rescan:** after `brainstorming` and `git-guardrails` changed at the source, all 24 were scanned again the same day. Those two sections below are from the rescan, their code read again in full. Every other section was compared with its new findings line by line; the counts held, and the `tdd` and `using-agent-skills` rows now quote the lines as they read today.

**Outcome: no real risk in any of the nine. All nine stay shipped.** Their `SOURCE.md` shows the verdict with the counts below and a link to the item's section, and `vet-and-adopt` asks you to read the findings before you take one.

### brainstorming: DO_NOT_INSTALL, 100/100, 11 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| LP3 no declared permissions | `SKILL.md:1` | BY DESIGN | The frontmatter has no `capabilities` line, and the skill does run shell scripts (`scripts/start-server.sh`, `scripts/stop-server.sh`) and a Node server. That is what the visual companion is. Weigh it when you adopt. |
| PE3 credential access | `scripts/server.cjs:509` | FP | The line is `const vars = options.env \|\| process.env;` inside `browserLauncherForPlatform`. It reads `DISPLAY` and `WAYLAND_DISPLAY` to choose a browser opener. No credential file or secret is read. |
| PE2 sudo/root | `scripts/start-server.sh:103` | FP | The line is `chmod 600 "$state/server-instance-id"`. It makes the id file private to the owner. There is no sudo and no elevation. |
| RA2 session persistence (4 rows) | `scripts/start-server.sh:130` (2), `:132`, `:134` | BY DESIGN | Line 130 is the comment that explains the next two, and lines 132 and 134 are `nohup ... node server.cjs ... &` and `disown`: they leave the local server running after the launcher exits. It stops when the owning process exits or after the idle timeout (default 240 minutes), or on `stop-server.sh`. State sits under the session folder, or under `<project>/.studio-work/brainstorm/` with `--project-dir`. |
| TM1 tool parameter abuse (4 rows) | `scripts/stop-server.sh:30` (2), `:65`, `:87` | FP | Each is `rm -f` on fixed files inside the session's own `state/` folder (`server-info`, `server.pid`, `server-instance-id`, `server.log`). No variable path from outside, no `-r`. |

Hand sweep, redone for the rescan: read `scripts/server.cjs`, `scripts/start-server.sh` and `scripts/stop-server.sh` in full, and searched `scripts/helper.js` and `scripts/frame-template.html` for network calls, script sources and links. `server.cjs` is a local HTTP and WebSocket server, bound to 127.0.0.1 unless `--host` says otherwise. It opens no outbound connection. It serves the newest `.html` in `<session>/content`, only regular files with one link that resolve inside that folder. A key (random, 32 bytes, held in `?key=` or a cookie) is required for every request and for the WebSocket, and the WebSocket checks Origin. It writes only to the session folder (`state/events`, `server-info`, `server-stopped`) and to `.last-port` and `.last-token` under `<project>/.studio-work/brainstorm/`, the key files with mode 600. It spawns a process in one place: `openBrowserOnce` (`server.cjs:527-540`), once, only with `--open` and a loopback bind. It runs the system browser opener (`open`, `rundll32.exe`, `xdg-open`) through `execFile`, with the URL as a single argument and no shell; there is no other way to name the opener. When the port is busy or refused (`EADDRINUSE`, `EACCES`), it tries another random high port, at most 10 times (`server.cjs:659-675`). The page header is the fixed text "Studio brainstorm companion, local only", in the frame template's top bar (`frame-template.html:261`) and in the server's own pages. No `eval`, no decoding of text into code. `helper.js` runs in the viewer's page: it opens a WebSocket to `location.host`, sends clicks on `data-choice` elements, and reloads on a `reload` message. `frame-template.html` has no script and no remote link (only `<link rel="icon" href="data:,">`). `start-server.sh` creates `/tmp/brainstorm-*` or the project session folder, writes the instance id and pid, and starts `node server.cjs`. `stop-server.sh` signals a pid only if its command line carries this session's instance id, and deletes the session folder only when it is `/tmp/brainstorm-<id>` and holds no `..` (lines 90 to 95). Names match bodies: `quietly`, `isServable`, `originAllowed`, `openBrowserOnce`, `onBindError`, `reloadThroughKey`, `is_ours`, `mark_down` each do what the name says.

### drawio-diagrams: DO_NOT_INSTALL, 100/100, 8 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| AST4 subprocess call | `scripts/autolayout.py:203-204` | BY DESIGN | `subprocess.run(["dot", "-Tplain"], input=source, ...)`. A fixed argument list, no shell. It runs Graphviz `dot` on a DOT text built by `build_dot`, which escapes backslashes and double quotes in every label (`dot_string`). Used only for layout of big graphs. |
| LP3 no declared permissions | `SKILL.md:1` | FP | The frontmatter does declare `capabilities: [file_read, file_write, shell]` (line 10). The scanner's "network" guess has no code behind it; no script makes a request (see the sweep). |
| RA2 session persistence (2 rows) | `references/style-extraction.md:113`, `references/style-presets.md:24` | BY DESIGN | Prose that tells the agent to save a style preset to `~/.drawio-skill/styles/<name>.json` after the person says "save" or "looks good". It is a file in the person's home folder that outlives the session, and it is only written on their yes. A preset is JSON colours and fonts, not code. |
| TM1 tool parameter abuse (4 rows) | `data/shape-index.json.gz:1054`, `:1348`, `:2019`, `:2630` | FP | Lines of the unpacked shape index. They are a shape size, a title ("Isometric Cube"), a style string (`shape=cylinder3;...`) and an image path (`image=/img/lib/clip_art/finance/Stock_Down_128x128.png`). Plain data. I found no URL and no command in the whole unpacked file; the words "eval" and "subprocess" appear only inside shape titles and tags. |

Hand sweep: read all five scripts. `validate.py` parses a `.drawio` with `xml.etree.ElementTree` and prints errors and warnings; it writes nothing. `shapesearch.py` reads `data/shape-index.json.gz` and prints matches (Soundex and tag match); no write, no network. `autolayout.py` reads a graph JSON and a built-in preset, runs `dot`, and writes `.drawio` XML to `--output` or stdout. `encode_drawio_url.py` reads a `.drawio` and prints a diagrams.net link with the XML packed in the `#` fragment; it makes no request (only builds a string), and the page's own rule is that a link is an optional extra. `repair_png.py` appends a missing IEND chunk to a PNG you name, in place. No `eval`, `exec`, `socket`, `urlopen` or credential path anywhere. `SKILL.md` shows `drawio -x ...` export commands and says in line 20 that this copy makes no network calls. Names match bodies: `encode` returns the viewer link and `edit_url` the editor link; `group_colours` reads the default preset; `pack` percent-encodes, deflates and base64s. Two items for an adopter: the `references/` files send the agent to `~/.drawio-skill/styles/` (a write outside the working folder, on the person's yes), and `SKILL.md:18` cites a hub file and a dated incident from the studio, which is hub-internal wording.

### git-guardrails: DO_NOT_INSTALL, 97/100, 3 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| AS1 agent config directory access | `SKILL.md:71` | BY DESIGN | The install step tells the agent to put the hook in `.claude/hooks/` and register it in `.claude/settings.json` or `~/.claude/settings.json` (lines 70 to 76). That is the point of the skill: it edits the agent's own settings, to add a veto hook. It says to append to `hooks.PreToolUse`, never replace the file, and asks which scope first. Weigh it: it changes how every later command in that scope is handled. |
| TM1 tool parameter abuse (2 rows) | `SKILL.md:53`, `SKILL.md:104` | FP | Line 53 is a row of the table of refused forms (`--no-verify` and its prefixes, `-c core.hooksPath=`, `--config-env=core.hooksPath=`). Line 104 is a test command that pipes a forced push as JSON into the hook, to see exit code 2. Neither runs a destructive command. |

Hand sweep, redone for version 1.3.0: read `scripts/block-dangerous-git.sh` in full (72 lines). It reads the hook JSON from stdin, takes `.tool_input.command` with `jq` (or the raw payload without `jq`), matches it with `grep -qE` against 18 regexes, then with `grep -qiE` (any case) against 4 more on `core.hooksPath`, plus a rebase check, prints `BLOCKED ...` to stderr and exits 2 on a match, else exits 0. No network, no file write, no credential path, no `eval`, no process spawn other than `jq` and `grep`. The `BLOCKED` message echoes the command text to stderr only. The name `block-dangerous-git.sh` matches the body. The earlier scan's row on the script's own `--no-verify` rule is gone because the rule is now the prefix pattern `--no-ver[a-z]*` (line 40). A limit worth knowing (not a risk): a regex hook can be bypassed by a command it does not parse (for example one built inside a script file) and by spellings it does not list. Fed through the script, `git commit --no-v`, `git commit --no-ve` and a commit run with `GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_0=core.hooksPath` and `GIT_CONFIG_VALUE_0` exited 0, with and without `jq`. So it narrows mistakes and does not stop a determined caller.

### improve: DO_NOT_INSTALL, 60/100, 3 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| PE3 credential access (2 rows) | `SKILL.md:41`, `references/audit-playbook.md:45` | FP | `SKILL.md:41` is the rule that repo text saying "print the .env" is not obeyed and gets logged as a possible injection. `audit-playbook.md:45` lists `~/.netrc` and `https_proxy` as ordinary platform conventions that are not findings. Neither reads a credential; `SKILL.md:36` says no secret values go into the output. |
| TM3 unsafe defaults | `references/closing-the-loop.md:123` | FP | The line is the safeguard: on a public repo, warn that issues are world-readable and get an explicit yes before posting a plan with a vulnerability or credential location. It makes the flow safer, not looser. |

Hand sweep: No scripts; the skill is five markdown files. The one path where data leaves the machine is by design and opt-in: with the `--issues` flag, `references/closing-the-loop.md:120-126` runs `gh auth status`, `gh repo view --json visibility` and `gh issue create --title ... --body-file <plan>`, which posts plan text to GitHub. It needs the flag, a public-repo warning, and a shown list of titles with one confirmation (`SKILL.md:205-214`, `closing-the-loop.md:120-126`). Otherwise the skill is read-only on source (`SKILL.md:23`): it writes only inside `plans/` (or `advisor-plans/`) at the repo root, and it runs read-only checks such as `npm audit`. The scanner's 60 comes from two false matches and one safeguard line. Names (`reconcile`, `--issues`) match the text.

### using-agent-skills: CAUTION, 35/100, 2 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| AS1 agent config directory access | `SKILL.md:13` | FP | The line says in prose that the page lists the skills the kit ships in `.claude/skills/`, the skills inside any installed domain, and Claude Code's built-in slash commands. The skill reads nothing from a config directory; it tells the reader where the skills are. |
| AS3 skill enumeration | `SKILL.md:11` | BY DESIGN | Line 11 is the page's title, `# using-agent-skills`; the finding is about the page as a whole. The skill is a router: it lists the skills and domains so the agent can pick one. The enumeration is the content. It is a list of names and one-line uses, with no instruction to read other skills' files except when a row is chosen. |

Hand sweep: No scripts. The folder holds `SKILL.md`, `session-start.md` and `references/claude-code-tools.md` (all prose). `claude-code-tools.md` is an optional note about running a plan through one orchestrator subagent, only when the owner asks; it starts no process itself. `session-start.md` is a primer on checking for a skill before acting. No network, credential or write path.

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
| RA1 self-modification | `writing-good-tests.md:94` | FP | The line is "Remove the double or remove the assertion.", the answer to "About to assert on the double itself?" in a short block of rules about test doubles. It is advice on the tests in the user's project. The skill files are not named or edited. |

Hand sweep: No scripts (markdown only).

### One thing to know

No finding is a network call outside its design, data leaving the machine without a flag, or a credential path, and no item is left to look at.

Closed with the rescan: `brainstorming` no longer has `BRAINSTORM_OPEN_CMD`, the setting that ran a shell string through `childProcess.exec`. The browser opens only through the system opener, as one argument with no shell (`server.cjs:538`). Its page header is now fixed text in the frame template, so the placeholder comment the scanner read as a hidden instruction is gone too.

Closed on 2026-11-09: `scripts/stop-server.sh` deleted any folder under `/tmp/` when it stopped a throwaway session, which would also match a path such as `/tmp/../x`. It now deletes only `/tmp/brainstorm-<id>` and never a path holding `..` (lines 90 to 95). The scan's four findings in that script are the same `rm -f` rows as before (lines 30, 65, 87) and are unchanged.

## Domains: run of 2026-11-09

- **Scanner:** SkillSpector v2.2.3, `--no-llm` (static).
- **Scanned:** the 21 domains in `catalog/packs/`, each folder as one item (entry, skills, agents, stubs and `SOURCE.md`), recorded in `scans.json` under `pack:<id>`.
- **Verdicts:** 8 `SAFE`, 13 not (8 `DO_NOT_INSTALL`, 5 `CAUTION`), with 133 findings between them.
- **Beyond the scanner:** every finding was read at its cited line, and around it where the line alone did not settle it. Every code file, template and config file in the 21 domains was searched for network calls (`fetch`, `urlopen`, `requests`, `curl`, `wget`), process calls, `eval` and credential paths, and each hit was read. Unlike the skills above, the domains' code files were not each read in full, and a search like this misses what does not use those words: a review found the pre-commit template's five outside repositories and the full reach of the Firebase helper script, both now below.
- **Rescan:** after the legal domain and the Astro domain changed at the source, all 21 were scanned again the same day, and once more after the legal domain's licence fix. Those two sections below are from the rescans; every other section was compared with its new findings line by line, and none changed.

**Outcome: no real risk in any of the thirteen. All thirteen stay shipped.** File paths below are relative to the domain's folder, `catalog/packs/<id>/`.

### pack:app-legal-privacy-terms-store-review: DO_NOT_INSTALL, 100/100, 16 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| EA2 autonomous decision making (5 rows) | `skills/legal-analytics-consent.md:48`, `skills/legal-guardrails/references/nl-eu-law/ap-guidance.md:81`, `.../eprivacy-cookiewet.md:110`, `.../gdpr-articles.md:57`, `skills/legal-guardrails/references/platform/apple-review-guidelines.md:98` | FP | Legal reference text on when the law does or does not require consent ("strictly necessary, no consent", "a frequent wrong argument: skip consent"). It tells the person what the rules say about their app; it lets the agent decide nothing. |
| EA3 scope creep | `.../eprivacy-cookiewet.md:39` | FP | The sentence says the ePrivacy rule on stored data "is not limited to browser cookies". A summary of the law's scope, not a scope for the agent. |
| EA3 scope creep (2 rows) | `skills/legal-apple-gate/assets/app-privacy-label-template.md:75`, `skills/legal-terms-review-nl/assets/eu-safe-clauses.md:95` | FP | "INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY": the warranty disclaimer of the MIT permission notice each file now carries, in a `text` block, beside the passage it took over from an MIT-licensed source. Licence text, not a scope for the agent. |
| YR1 YARA rule info_stealer | `.../eprivacy-cookiewet.md:39` | FP | The same sentence: "cookies" and "reads information from terminal equipment" are the law's words. Prose, no code. |
| PE3 credential access | `skills/legal-data-surface-scan/scripts/run_exodus.mjs:39` | FP | A string the script prints as a hint when no APK is given: `flutter build apk --release --dart-define-from-file=.env`. The script reads no `.env`. |
| PE3 credential access | `skills/legal-guardrails/references/taxonomy/sdk-data-map.md:227` | FP | A table row naming what a sign-in SDK collects (an account email, an access token), for the privacy policy to disclose. Nothing is read. |
| RA2 session persistence (4 rows) | `skills/legal-data-surface-scan/scripts/scan_ios_privacy.mjs:11`, `:65`, `.../sdk-data-map.md:127`, `skills/legal-signoff-orchestrator.md:33` | FP | "plist" is Apple's property-list file format. The script parses the app's privacy manifests and writes nothing; the reference line names an `Info.plist` key; the orchestrator's line is a row of its app fact sheet, which takes the app's name and bundle ID from the project's own files, `Info.plist` among them. |
| TM1 tool parameter abuse | `skills/legal-data-surface-scan/scripts/run_exodus.mjs:52` | BY DESIGN | `docker run --rm -v <APK folder>:/data <the Exodus standalone image> -j /data/<apk>`, an argument list with no shell. It runs an outside container image on the person's own APK to list its trackers. Weigh it: the image is pulled by name, with no pinned digest, and the APK's folder is mounted writable. |

Read beyond the flagged lines: `run_exodus.mjs` also runs `docker --version` (a fixed string) to see whether Docker is there. `run_mobsf.mjs`, not flagged, uploads the APK to a MobSF server at `MOBSF_URL` (default `http://localhost:8000`, a server the person starts) with `MOBSF_API_KEY` from the environment; it is the one place a file leaves a script in this domain, to a server the person names. `scan_android_manifest.mjs`, `scan_ios_privacy.mjs` and `scan_pubspec.mjs` read files and print; the hits in them are regular expression matches. `emit_play_csv.mjs` reads the person's answers file (`--answers`) and an optional template, and prints the CSV or writes it to the `--out` file they name; with no answers file it prints the bundled example answers and says on stderr that they are not the person's app. The rescan follows the domain's change to take the person's app as an input: the orchestrator now builds an app fact sheet from the project before any review, and the one new finding is a row of that sheet. A second rescan followed the domain's licence fix at the source: the two files that take over a passage from an MIT-licensed source now carry its copyright line and permission notice, the credit file's table of text taken over lists MIT only, and some passages were reworded. Only Markdown changed, no code file; the two new findings are that notice's disclaimer.

### pack:design-ui-logos-slides-posters: DO_NOT_INSTALL, 100/100, 6 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| AST4 subprocess call | `skills/motion-dev-animations/scripts/selfcheck_validator.py:19` | BY DESIGN | The self-test runs its sibling `validate_motion_config.py` with the same Python (`sys.executable`), as an argument list with no shell, on fixture inputs. |
| LP3 no declared permissions | `SKILL.md:1` | BY DESIGN | The entry's front matter has no `capabilities` line, and the domain's skills run local scripts (12 code files: brand colours and tokens, contrast, SVG audit, motion config validation, page checks). Weigh it when you adopt. |
| EA1 unrestricted tool access | `skills/design-tool-bridge.md:45` | FP | The line is the safeguard: some design tools can run arbitrary code, so treat that as a higher-risk power, say in one sentence what the script will do, and get an explicit yes first. |
| MP3 memory manipulation | `skills/motion-design/director/motion-personality.md:35` | FP | "Steady timing, clear state changes": a description of an animation style. |
| MP3 memory manipulation | `skills/slide-deck.md:28` | FP | "Follow the keep/replace rule" for the text in a copied slide template. No agent memory is involved. |
| OH3 unbounded output | `skills/template-charts-reports.md:62` | FP | "Fits A4 or Letter without cutting": a print layout instruction. |

Read beyond the flagged lines: `skills/brand/scripts/self-check.cjs` runs its sibling scripts with the current Node; `sync-brand-to-tokens.cjs` runs a local token generator with `execFileSync` (argument list). No code file in the domain makes a network call. The `new RegExp(...).exec(...)` hits are pattern matches, not code execution.

### pack:engineering-testing-performance-code-design: CAUTION, 25/100, 1 finding

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| YR1 YARA rule info_stealer | `skills/browser-testing-with-devtools.md:80` | FP | The line warns that attaching to a live browser profile exposes "banking, GitHub sessions, saved cookies", and recommends the connection that is safer by design. It is the warning against harvesting, not a harvest. |

Read beyond the flagged line: the domain has no code files.

### pack:godot-camera-shaders-particles-export: CAUTION, 40/100, 4 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| EA1 unrestricted tool access | `skills/godot-editor-bridge.md:17` | FP | The line lists what needs asking first, and refuses to turn on a tool's "run any code" feature unless the person asks for that exact thing in the session. A boundary. |
| EA2 autonomous decision making (3 rows) | `skills/godot-export-builds.md:103`, `skills/godot-test-and-verify.md:40`, `:77` | FP | Each says nothing is uploaded, installed or downloaded "without asking": checks that the agent asked first. |

Read beyond the flagged lines: the domain has no code files.

### pack:marketing-copy-emails-seo-signups: DO_NOT_INSTALL, 100/100, 6 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| E4 context leakage (2 rows) | `skills/ai-seo.md:18`, `skills/content-strategy.md:26` | FP | "Collect context": read the person's own product marketing notes in their repository, if there are any, then ask only for what is missing. Nothing is sent anywhere. |
| EA2 autonomous decision making (2 rows) | `skills/churn-prevention/references/cancel-flow-patterns.md:115`, `skills/onboarding.md:53` | FP | The first is a data protection rule for the person's product (no marketing on data kept after cancelling, without consent); the second is the boundary that nothing is sent, posted or paid for without asking. |
| MP3 memory manipulation | `skills/cro/references/form-fields-and-flow.md:80` | FP | "A clear statement of what they receive": advice for a sign-up form. |
| P6 direct prompt extraction | `skills/paywalls/references/experiments.md:93` | FP | "Re-show rules after a big engagement jump": when to show a paywall again. Nothing to do with a prompt. |

Read beyond the flagged lines: the domain has no code files.

### pack:marketing-plans-offers-pricing-launches: DO_NOT_INSTALL, 60/100, 5 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| AS1 agent config directory access | `skills/product-marketing.md:20` | BY DESIGN | The skill keeps one product marketing notes file in the person's repository, at `.agents/product-marketing.md`, and looks for it there and in `.claude/`. A copy found elsewhere gets an offer to move it, and a missing file is drafted with the person and saved there. It reads and writes that one file in an agent folder. |
| EA2 autonomous decision making (3 rows) | `skills/ad-creative.md:57`, `skills/pricing.md:21`, `:54` | FP | Boundaries: no spend, generation or publishing without approval and a stated amount; no real price set without asking the owner. |
| PE1 excessive permissions | `skills/pricing/references/free-plans-and-enterprise.md:27` | FP | "Give full access, not a cut-down version": pricing advice for a free trial of the person's product. Not an agent permission. |

Read beyond the flagged lines: the domain has no code files.

### pack:mobile-apps-flutter-firebase: DO_NOT_INSTALL, 100/100, 30 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| E3 file system enumeration | `skills/firebase-basics/agent-environments.md:50` | BY DESIGN | For one editor, the setup step lists the person's own skills folder (`ls -la ~/.agents/skills`) to compare it with the list of Firebase's agent skills, then adds the missing ones and updates them with `npx -y skills update --yes`. Weigh it: the page installs Firebase's outside skills, plugin or extension for every agent it covers (lines 11, 35, 39, 44), and its refresh steps update them with no question (lines 50, 51). Its line 5 says to scan and vet each one first, name what will be installed, and get a yes; in the kit that is `vet-and-adopt`. |
| PE3 credential access (2 rows) | `skills/using-firebase/assets/gitignore.template:17`, `:21` | FP | `.env` and `*-credentials.json` are lines of a `.gitignore` template, which keep secrets out of git. Nothing is read. |
| RA2 session persistence (25 rows) | `skills/firebase-basics.md:4`, `:10`, `:26`, `:28`; `skills/firebase-basics/native-and-web-setup.md:29`, `:31` (2), `:32`; `skills/firebase-crashlytics.md:37`; `skills/firebase-crashlytics/ios-setup.md:7`, `:10`, `:31`; `skills/firebase-firestore/native-mobile.md:65`, `:66`, `:67`; `skills/firebase-remote-config-basics/ios-setup.md:7`, `:10`, `:20`, `:24` (2), `:25`, `:32`, `:41`, `:57`; `skills/flutter-setup-declarative-routing.md:46` | FP | "plist" is Apple's property-list file format (`GoogleService-Info.plist`, `Info.plist`, a defaults file), and the three `native-mobile.md` rows match "stopListening" in a Firestore listener example. No persistence mechanism. |
| RA2 session persistence | `skills/firebase-basics/agent-environments.md:23` | BY DESIGN | Adds a `firebase` server entry (`npx -y firebase-tools@latest mcp`) to an agent's MCP configuration file, creating the file if it is missing and keeping every other server. That is the setup step's purpose. Weigh it: the server runs the latest release of the Firebase CLI each time the agent starts it. |
| TM1 tool parameter abuse | `skills/using-firebase/scripts/test_fbtool.sh:85` | FP | `rm -f "$tmp/proj/firebase.json"` deletes a fixture file inside the test's own `mktemp -d` folder. |

Read beyond the flagged lines: `skills/using-firebase/scripts/fbtool.sh` acts on the person's own Firebase project, the one the CLI has active. It runs `firebase deploy` (line 74), after a yes/no question that `--force` skips (line 73); `gcloud firestore export` of production data (line 176), after a yes/no question (line 175); `gcloud firestore import` into production (line 205), after the person types the project id (lines 200 to 202); and `firebase functions:secrets:set` (line 128), with no question of its own. It also checks that the local Firestore emulator answers (`curl` to `127.0.0.1:8080`) before an emulator export. Weigh it: it deploys, moves production data and sets secrets when Claude runs it, so each run is an act to agree first. `scripts/new_python_functions.py` and the remaining templates make no network or process call.

### pack:phone-app-testing-release-and-agents: CAUTION, 30/100, 3 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| EA2 autonomous decision making (2 rows) | `skills/inspect-your-own-app-build.md:59`, `skills/mobile-ui-build-bar.md:18` | FP | Boundaries: no `sudo` or shell profile edit, and no emulator or large SDK install, "without asking". |
| RA2 session persistence | `skills/app-store-and-play-release-gate.md:37` | FP | Reads the usage-description keys in the app's `Info.plist`. "plist" is the file format. |

Read beyond the flagged lines: the domain has no code files.

### pack:python-backend-fastapi-docker-agents: DO_NOT_INSTALL, 100/100, 21 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| LP3 no declared permissions | `SKILL.md:1` | BY DESIGN | The entry's front matter has no `capabilities` line, and the domain's skills run shell commands (`uv`, `docker build`) and write project files from templates. Weigh it when you adopt. |
| PE3 credential access (3 rows) | `skills/production-docker.md:164`, `skills/production-fastapi.md:392`, `skills/production-fastapi/templates/main.py.template:32` | FP | The first is a warning that `COPY .env` bakes secrets into an image layer. The other two are the generated app's settings class loading its own `.env` at run time, the usual pattern for that library. The skill reads no credential. |
| SC2 external script fetching | `skills/modern-python/references/uv-commands.md:5` | BY DESIGN | uv's own install command, which pipes its install script into a shell. It is listed with the alternatives (a package manager, pipx) for the person to run. Weigh it as you would any install script. |
| TM1 tool parameter abuse (10 rows) | `skills/production-docker.md:53` (2), `:182` (2), `:437` (2); `skills/production-docker/templates/Dockerfile.node.template:34` (2), `Dockerfile.python.template:20` (2) | FP | `rm -rf /var/lib/apt/lists/*` inside a Dockerfile `RUN`: it deletes the package index in the image being built, a standard size step. The "rm -rf /" match is the start of that path. |
| TM1 tool parameter abuse | `skills/production-docker.md:65` | FP | `docker run --rm --entrypoint python <runtime image> --version` prints the Python version of the runtime image; `--rm` removes that container afterwards. |
| TM2 chaining abuse (5 rows) | `skills/production-docker.md:53`, `:182`, `:437`; `Dockerfile.node.template:34`, `Dockerfile.python.template:20` | FP | The same cleanup, chained with `&&` in the same `RUN` so it lands in one layer. |

Read beyond the flagged lines: the Docker templates' only network calls are container health checks against the container itself (`localhost` and `127.0.0.1`). `skills/modern-python/templates/pre-commit-config.yaml` is the one that reaches out: run with prek, it fetches hook code from five outside repositories (lines 8, 24, 30, 36, 41) and runs it on every commit, at a `rev` the person fills in with a release tag. Weigh it: a tag can be moved to other code, so pin each `rev` to a full commit SHA, and read what each hook runs before the first commit.

### pack:stock-research-backtests-trading-safety: CAUTION, 32/100, 1 finding

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| P6 direct prompt extraction | `skills/personal-budget-and-bookkeeping/summarise_spending.py:85` | FP | `return rules` ends `load_rules`, which reads the person's keyword-to-category file into a list of pairs. Nothing to do with a prompt. |

Read beyond the flagged line: `bootstrap_check.py`, `dcf_grid.py` and `summarise_spending.py` read local files and print; no network or process call.

### pack:web-api-security-login-and-graphql: DO_NOT_INSTALL, 60/100, 3 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| EA2 autonomous decision making | `skills/graphql-and-federation.md:14` | FP | The boundary: never turn off a production safety limit to pass a test "without asking and naming the risk". |
| PE3 credential access (2 rows) | `skills/auth-and-sessions.md:26`, `:31` | FP | Design advice for the person's API: short-lived access tokens kept in secure storage, and how long tokens and sessions should live. Nothing is read. |

Read beyond the flagged lines: the domain has no code files.

### pack:web-astro-cloudflare-gsap-performance: DO_NOT_INSTALL, 100/100, 35 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| E1 external transmission (16 rows) | `skills/astro-dev.md:152`; `skills/astro-dev/references/astro-core-patterns.md:100`, `content-collections.md:73`; `skills/workers-best-practices/references/rules.md:20`, `:28` (2), `:51`, `:210` (2), `:213` (2), `:219` (2), `:395`, `:406`; `skills/wrangler.md:197` | FP | Code examples in reference pages, for the person's own page or Worker: `fetch` calls to the reserved example host, two lines that show calling Cloudflare's REST API from a Worker as the mistake to avoid, and a `curl` to the local development server. The skill sends nothing. |
| OH1 unvalidated output injection | `skills/schema/references/schema-examples.md:304` | FP | `dangerouslySetInnerHTML` places JSON-LD in a script tag, and line 297, seven lines above, escapes every `<` in it (`.replace(/</g, "\\u003c")`), which closes the injection the rule fears. |
| P2 hidden instructions (9 rows) | `skills/astro-dev.md:79`; `skills/astro-dev/references/islands-and-hydration.md:39`; `skills/build-local-site/templates/src/pages/about.astro:42`, `areas/[area].astro:60`, `blog/[slug].astro:96`, `contact.astro:39`, `index.astro:136`, `:254`, `services/[area]/[service].astro:122` | FP | HTML comments in examples and page templates ("Hero", "Form column", "wakes up when scrolled to"). Layout notes for a developer, not instructions to a model. |
| SC1 unpinned dependencies (8 rows) | `skills/build-local-site/templates/package.json:13` to `:19`, `:22` | BY DESIGN | The starter site's dependencies are caret ranges, so `npm install` takes the newest compatible release of each. No lockfile ships. Weigh it: commit your own lockfile once the site builds. |
| TM1 tool parameter abuse | `skills/wrangler.md:197` | FP | `curl "http://localhost:8787/cdn-cgi/local/scheduled"` triggers a scheduled handler on the local development server. |

Read beyond the flagged lines: the code files are Astro and TypeScript config and data templates, with no network or process call. The starter site's layout (`templates/src/layouts/BaseLayout.astro`) loads Google Fonts and a Google Analytics tag with a placeholder id, which the guide says to replace: the built site's visitors' browsers contact Google. That is the site template's choice, for the person to keep or remove; in the EU an analytics tag generally needs the visitor's consent first (the legal domain's ePrivacy notes cover it).

### pack:web-search-and-scraping-into-files: CAUTION, 45/100, 2 findings

| Finding | File:line | Verdict | Why |
|---|---|---|---|
| LP3 no declared permissions | `SKILL.md:1` | BY DESIGN | The entry's front matter has no `capabilities` line, and the domain fetches web pages and runs `robots_check.py`. That is what the domain is for. Weigh it when you adopt. |
| P6 direct prompt extraction | `skills/web-scrape-and-search-api/robots_check.py:138` | FP | `return rules, delay, is_named` ends `pick`, which merges a site's robots.txt groups for one user agent. Nothing to do with a prompt. |

Read beyond the flagged lines: `robots_check.py` fetches one robots.txt (`urllib`, 15-second timeout) for a site the person names, or reads a local file.

### Domains: things to know

No finding is a network call outside its design or a credential read. The acts that send data out or change a live project (deploys, production data exports and imports, secrets, outside installs) are by design; each is listed here to weigh, and none blocks:

- `mobile-apps-flutter-firebase`: the agent setup page installs Firebase's outside skills, plugin or extension for every agent it covers, and its refresh steps update them with `--yes`; the MCP entry runs the latest Firebase CLI release at each start; and `fbtool.sh` deploys, exports and imports production Firestore data and sets secrets in the person's own project, with `--force` skipping the deploy question and no question before a secret is set.
- `python-backend-fastapi-docker-agents`: the pre-commit template runs hook code from five outside repositories at tags the person fills in; pin each to a commit SHA.
- `app-legal-privacy-terms-store-review`: `run_exodus.mjs` runs an outside container image by name, with the APK's folder mounted writable; `run_mobsf.mjs` uploads the APK to the MobSF server the person points it at.

Closed with the rescan: the Astro domain's site template now asks for `"astro": "^7.3.3"` (`skills/build-local-site/templates/package.json:17`), the floor the earlier scan's row named as clearing all four advisories that 7.1.1 had, and the scanner's known-vulnerable finding (SC4) is gone. The eight rows on caret ranges stay.
