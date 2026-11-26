---
id: drawio-diagrams
module: 09-data-work
checked: 2026-11-02
tokens:
  description: 74
  body: 2113
---

# draw.io diagrams

## Why

- **The problem:** a pipeline or a system that lives in someone's head, or in a chat where it was explained once, or in a picture nobody can edit. Module 09 asks for the data flow, sources, transformations and outputs, in one editable diagram.
- **The reason:** Claude writes the diagram as a draw.io file (`.drawio`, plain XML that the draw.io editor opens), checks its structure with a local script (edges that point at nothing, duplicate or reserved ids, broken parents, overlapping shapes), and hands it back with a local SVG beside it (SVG: a picture format any browser opens), drawn from the same list of shapes and arrows. Both files stay on your machine, and the `.drawio` stays editable.
- **The cost of skipping it:** the kit has no story of its own here. Without it, a flow is redrawn from memory each time someone needs it, and nothing can be checked against the code: [claim-auditor](claim-auditor.md) treats every box on a diagram as a claim that the thing exists.
- **The principle:** [written state over chat history](../PRINCIPLES.md#written-state-over-chat-history). The flow lives in a file the next session can read and change, not in a chat that ends.

## Detect

Read-only: folder names, the front matter of skills and agents (their name and description), and command paths, never a skill's body, a data file or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/drawio-diagrams "$U/skills/drawio-diagrams" 2>/dev/null`.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'diagram|draw\.?io|flowchart|mermaid|excalidraw' && echo "$f"; done`
- What the skill can use on this machine: `command -v uv python3 py dot drawio` prints a path for each one found. The kit copy runs its scripts with `uv run python`, which picks a Python for you; without `uv` it uses your own Python 3, as `python3`, or as `py -3` on Windows (`py` is the Windows Python launcher); `dot` is Graphviz; `drawio` is the draw.io desktop app's command line.
- A skill of the same name from a plugin enabled here: run from the project folder, `claude plugin list --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let l;try{l=JSON.parse(s)}catch{}if(!Array.isArray(l))return console.log("plugin check could not run");for(const p of l){const r=p.readFromFolder||p.installPath,f=r&&require("path").join(r,process.argv[1]);if(p.enabled&&f&&require("fs").existsSync(f))console.log(p.id,f)}})' skills/drawio-diagrams/SKILL.md` prints the plugin's id and the path of each copy, and nothing else. `claude plugin list` reports which plugins are enabled for the current folder and the folder each one loads from, so a disabled plugin, a plugin installed for another repository and an old version left after an update do not count. When it prints `plugin check could not run` or an error such as `claude: command not found`, Detect says the plugin check could not run, and the item gets no plugin mark ([docs/facts.md](../docs/facts.md), "Claude Code: installed plugins and their skills").

The menu marks the item **have** when a skill named `drawio-diagrams` exists, or another skill writes `.drawio` files; **partly** when another diagram skill exists for a different format (Mermaid or Excalidraw, for example); **not yet** otherwise. When nothing marks it **have** and that plugin line prints a copy, the menu says **a plugin provides one** instead of **not yet**, or **partly (a plugin provides one)** instead of **partly**, so what is missing stays in view, and it does not offer the kit's copy as a second.

## Ask

1. **"Take drawio-diagrams?"** (ADOPT as it is is not offered: its front matter names the studio as category and author, and its planning step speaks of "a project in this workspace", the studio's.)
   - ADAPT: the kit copy with your examples, your Python command and the delivery you choose below. Recommended when Detect says **not yet** and you document systems or data flows.
   - FOLD: the write-then-validate step into the diagram skill you have, if it also writes `.drawio` files. Recommended when Detect says **have** through another skill.
   - Skip. Recommended when Detect says **have** with this same skill, or **partly** and that other format serves you, or you do not draw diagrams.
   - Not sure: the option recommended above for what Detect found: skip for **have** with this same skill or for **partly**, FOLD for **have** through another skill, ADAPT for **not yet**, with the description it would write shown to you first.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"How do you want to see each diagram?"** (for ADAPT)
   - The `.drawio` file and a local SVG beside it, as the kit copy delivers by default: Claude writes one small script that produces both from the same list of shapes and arrows, so they match, and checks a screenshot of the SVG for overlaps before it hands them over. Nothing leaves your machine. Recommended when Detect found no `drawio` command.
   - The `.drawio` file only, opened in the draw.io desktop app. Recommended when you edit every diagram in the app anyway and want no second file to keep in step.
   - The `.drawio` file and an exported picture (PNG, SVG or PDF): needs the draw.io desktop app. Recommended when Detect found `drawio`.
   - Any of these plus a diagrams.net link when you ask for one: the diagram rides inside the link, in the part after `#` (the fragment, which the browser keeps to itself and does not send to the server; RFC 3986, section 3.5); opening the link loads the viewer page from the web. The kit copy offers the link only on request, never in place of the files.
   - Not sure: the option recommended above for what Detect found: the file and an exported picture when it found `drawio`, otherwise the `.drawio` file and the local SVG, the kit copy's default, which sends nothing anywhere.
   - Default when skipped: the file and the local SVG.
3. **"Where?"**
   - This project: `.claude/skills/drawio-diagrams/`.
   - Every project: `~/.claude/skills/drawio-diagrams/`. Recommended when you document more than one repository.
   - Not sure: the option recommended above: every project when you document more than one repository, otherwise this project, the narrower choice.
   - Default when skipped: this project.

## Needs

- Python 3, to run the script Claude writes for each diagram, the structure check and the link script; the kit's scripts use only Python's standard library. The kit copy runs it with `uv run python`, and without `uv` as `python3`, or `py -3` on Windows. Python's Windows install manager also has a `python3` command, which Python's docs do not recommend using; Python's own install routes for each system, and the `py -3` form, are in [docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux".
- Microsoft Edge or Google Chrome, for the render check: the kit copy takes a screenshot of the SVG with the browser's headless mode (run without a window), `chrome.exe --headless=new --window-size=W,H --user-data-dir=<scratch dir> --screenshot=<png> ...` in its example, and its SKILL.md says Edge's `msedge.exe` takes the same flags. Chrome's own pages show each of these flags; whether `--screenshot` takes a file name, and whether Edge takes them all, is an open question ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux").
- Optional, Graphviz, for automatic layout of large diagrams (more than about 15 shapes): its `dot` command on the PATH. Without it, Claude places the shapes by hand. Graphviz's download page lists `winget install graphviz` for Windows, `brew install graphviz` for macOS and `sudo apt install graphviz` for Debian and Ubuntu ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux").
- Optional, the draw.io desktop app, for PNG, SVG and PDF export:
  - macOS: `! brew install --cask drawio` (as SKILL.md gives it);
  - Windows and Linux: from the app's releases page on GitHub; on Windows, its `.msi` installs for your user without administrator rights. Whether those installs give you the `drawio` command the export calls is an open question ([docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux").
- SkillSpector, for the scan in step 1: row 1 of your plan ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/drawio-diagrams/`: `skillspector scan catalog/skills/drawio-diagrams --no-llm --format json | node tools/scan-compare.mjs drawio-diagrams - --root catalog/skills/drawio-diagrams` (on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows). Expect DO_NOT_INSTALL, with every finding already in the kit's record: the comparer prints `known: 6, moved: 0, reworded: 0, new: 0` with the pinned v2.13.6. Claude shows each finding with its reading of it, and continues only when you have read them and say so (Watch out has the kit's triage).
2. **you:** install what your answer to question 2 needs, if Detect did not find it: the draw.io desktop app for exports, and Graphviz if you want automatic layout.
3. **Claude:** on your yes, writes the copy for your setup and shows you the change before it saves it:
   - the description's list of diagram kinds trimmed to the ones you draw, and its routing line to Excalidraw and Mermaid kept only for tools you have;
   - the "Check which tools exist" section, which checks for the draw.io command line, Graphviz, Inkscape, rsvg-convert and Python before Claude picks a route: kept, with your Python command where it is none of `uv run python`, `python3` and `py -3`;
   - the delivery step set to your answer to question 2;
   - the render check's browser command set to the browser you have, as your system starts it (the copy's example names Chrome, `chrome.exe`, and Edge, `msedge.exe`);
   - "When the diagram describes a project in this workspace, read that project's `AGENTS.md` first" pointed at your own instruction file;
   - nothing to drop in the references: the kit copy already says that its icon fetcher and code importers are not included (the studio removed the fetcher because it used the network);
   - the front matter's category and author set to yours; `data/SHAPE-INDEX-NOTICE.md` kept with the shape index.
4. **Claude:** records the decision, the scope, the delivery, the scan result and its triage, and the undo in `adoption/decisions.md`.

## Check

1. **you:** in a new session, ask "draw a diagram of <three parts of your system> and how data moves between them".
2. Expected: a `.drawio` file, with the local SVG beside it when you kept that delivery, both named by full path; and the structure check run on it, `uv run python <skill folder>/scripts/validate.py <name>.drawio` (without `uv`, `python3`, or `py -3` on Windows, in place of `uv run python`, or the Python command you set), ending in a line that starts with `0 error(s)`. Warnings may remain.
3. **you:** open the diagram the way you chose in question 2 (the SVG in a browser, for the default). Expected: the three parts and their arrows, readable, and the same parts as the `.drawio` shows in draw.io.

If the check reports errors, or the diagram does not open, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/drawio-diagrams/` or `~/.claude/skills/drawio-diagrams/`, whichever scope you chose.
- **Claude:** deletes `~/.drawio-skill/` if you saved style presets; the skill keeps your own presets there.
- **you:** the draw.io desktop app and Graphviz, if you installed them for this, stay until you remove them.
- **Claude:** adds the removal to `adoption/decisions.md`. Diagrams you made stay; they are your files.

## Watch out

- **`uv run python` sets up a project folder.** Run in a folder that holds a `pyproject.toml`, it creates `.venv/` and `uv.lock` there when they are missing. Run the scripts from another folder, as `uv run --no-project python`, or with your own Python 3 (`python3`, or `py -3` on Windows).
- **The scan says DO_NOT_INSTALL, and the kit kept it.** SkillSpector v2.13.6 rated the kit copy 57/100 from 6 findings ([the kit's scan triage](../tools/export/scan-triage.md#drawio-diagrams-do_not_install-57100-6-findings), the run of 2026-11-21). The kit read each one. By design: Graphviz's `dot` run locally, with a list of arguments and no shell, for automatic layout; two lines on saving a style preset to `~/.drawio-skill/styles/`, only after you say "save"; the `sudo apt install graphviz` line, a command for you to run; no `allowed-tools` line, as the front matter names its capabilities in its own field. A false positive: a reference page the scanner read only in part, stopped by an apostrophe. By hand: the compressed shape index, which the scanner also read only in part, holds shape data and no URL or command; the link script makes no request itself; the other scripts read and write local files only.
- **The optional link loads a web page.** The diagram travels in the part of the link after `#`, which the browser does not send to the server, but opening it still loads the diagrams.net viewer from the web. Where internal designs must stay off outside websites, keep to the files.
- **A link alone may go unopened.** The kit copy delivers a local SVG beside the `.drawio` file and a link only on request. Its SKILL.md gives the reason: the user may not open a hosted link, and a local file works offline.
- **The SVG does not follow later edits.** It is drawn by the script, not exported from the `.drawio`. Change the diagram in the draw.io app and the SVG falls behind: change the script and run it again, or export a fresh SVG from the app.
- **Context cost:** the description loads every session, about 74 tokens, one of the longer descriptions; when the list of descriptions outgrows its budget, Claude Code drops the least-used ones first ([docs/facts.md](../docs/facts.md), "Claude Code: measuring context and asking multiple choice"). The body, about 1,990 tokens, loads when the skill runs. Estimates (bytes divided by 4).
- **Files outside the project.** Saving a style preset writes to `~/.drawio-skill/styles/`, and building one writes temporary files under `/tmp`. The render check writes its screenshot and a throwaway browser profile to the scratch folder it is given.
- **Do not guess shape names.** A wrong vendor shape name renders as a blank box; the skill's `shapesearch.py` looks up the exact style string in the shipped index.
