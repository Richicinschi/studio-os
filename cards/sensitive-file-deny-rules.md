---
id: sensitive-file-deny-rules
module: 06-git-and-guardrails
checked: 2026-11-10
---

# Deny rules for secret files

## Why

- **The problem:** Claude Code can read every file in a folder you give it: a `.env` file, a private key or a `credentials.json` opened in a search is a secret out of its file. The kit's audit script never opens such files; elsewhere the kit only asks Claude not to, and an instruction is not a lock ([SECURITY.md, Asked](../SECURITY.md#asked)).
- **The reason:** Claude Code's own permission rules: a `Read(...)` rule under `permissions.deny` is enforced before the tool runs, whatever the model intends ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files"). Six rules cover what the audit avoids: `.env*`, `*.pem` and `*.key` files, names holding `credential` or `secret`, and `~/.ssh`.
- **The cost of skipping it:** a secret Claude reads goes out with the conversation and stays in the session transcript on your machine, in plain text, for 30 days by default ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). There is no taking it back; the fix is a new secret.
- **The principle:** [checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement). "Never open a secret file" becomes a rule Claude Code refuses, not a sentence Claude keeps.

## Detect

Read-only. Rule text, counts and a version; never a file's contents, and never any other value from a settings file.

- Deny rules already set, at user level (`~/.claude/settings.json`, or under `$CLAUDE_CONFIG_DIR` when that is set) and in `.claude/settings.json` and `.claude/settings.local.json` of each repository in `adoption/inventory.md`. Claude prints the `permissions.deny` list alone, so no `env` value reaches the session:
  `node -e "try{const s=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8').replace(/^\uFEFF/,''));console.log(JSON.stringify((s.permissions||{}).deny||[]))}catch(e){console.log('no file, or not valid JSON')}" "<settings file>"`
  Rule text holds no secret, so it is shown as written. Without Node.js, you type `/permissions`, which lists every rule with its file, and read out the deny rules.
- What the rules would refuse. A rule matches a file or a folder anywhere in the path, the folders above the project included, so Claude counts four things per repository, printing no name (to see names, run a count in your own terminal without the `c` in `-ciE`); the first two are the secret-file paths:
  - tracked paths with a `.env*`, `*.pem` or `*.key` file or folder in them: `git -C "<repo>" ls-files | grep -ciE '(^|/)(\.env[^/]*|[^/]*\.(pem|key))(/|$)'`;
  - a top-level `.env` folder, often a Python virtual environment, which `git ls-files` hides when it is ignored: `test -d "<repo>/.env" && echo "a .env folder" || echo "none"`;
  - tracked paths with `credential` or `secret` in any file or folder name: `git -C "<repo>" ls-files | grep -ciE '(^|/)[^/]*(credential|secret)[^/]*(/|$)'`;
  - the repository's own path and every folder above it, which `git ls-files` never shows (`1` means it holds either word): `git -C "<repo>" rev-parse --show-toplevel | grep -ciE 'credential|secret'`; for a setup folder that is not a repository, `(cd "<your setup>" && pwd) | grep -ciE 'credential|secret'`.
- Claude Code's version: `claude --version`. Input redirects such as `cat < .env` are covered from v2.1.257, the Write tool from v2.1.228 ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files").

The menu marks the item **have** when a deny list at user level, or in every repository in `adoption/inventory.md`, holds rules for `.env*`, `*.pem`, `*.key` and `~/.ssh`, and for the two name words unless you chose against them; **partly** when only some of these are there; and **not yet** otherwise.

## Ask

1. **"Stop Claude Code from reading secret files?"**
   - Yes, in every project: `~/.claude/settings.json`, which holds in every folder Claude Code starts in or is given. Recommended when Detect found none of these rules and no secret-file path: rules written once cover every project.
   - Yes, in this project only: `.claude/settings.local.json`, yours alone, or `.claude/settings.json`, shared with everyone who clones the repository once committed. Recommended when a team should get the rules too (the shared file, agreed with them first), and when another repository has secret-file paths Claude needs, so the rules refuse nothing you need.
   - FOLD: add only the rules your deny list lacks, in the file that holds it. Recommended when Detect found some of them.
   - No.
   - Not sure: FOLD when Detect found some of the rules; this project only when any repository has a `.env` folder or `.env*`, `*.pem` or `*.key` paths; every project otherwise. Nothing is saved before you have seen the change, and Undo removes the lines.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Also refuse every file and folder named with the words credential or secret?"**
   - Yes: every path with either word in a file or folder name is refused, such as `credentials.json`, `client_secret.json`, `secret_store.py`, `my-secrets/notes.txt` and a whole project in a folder called `secret-garden`. Recommended when Detect counted 0 tracked paths with either word and no repository's own path holds one.
   - No: only `.env*`, `*.pem`, `*.key` and `~/.ssh` are refused. Recommended when the paths Detect counted with either word are files or folders Claude needs, such as code or notes. The only workable answer when a repository's own path holds either word: with yes, Claude could read nothing in that project, or, at user level, in any project under that folder.
   - Not sure: yes when both of those counts are 0; no otherwise.
   - Default when skipped: the same as Not sure.

## Needs

- Claude Code v2.1.257 or later, for every route Detect names.
- Node.js, for the commands that read and change the deny list (Detect, Steps 2); without it, you use `/permissions` by hand. [Tools some items need](../docs/install-reference.md#tools-some-items-need) installs Node.js 22:
  - Windows: `! winget install --id OpenJS.NodeJS.22 -e`;
  - macOS and Linux: through nvm, the three lines in [docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux";
  - then `! node --version`.

## Steps

1. **Claude:** shows you the rules for your answers. With yes to both questions:
   ```json
   { "permissions": { "deny": ["Read(//**/.env*)", "Read(//**/*.pem)", "Read(//**/*.key)", "Read(//**/*credential*)", "Read(//**/*secret*)", "Read(~/.ssh/**)"] } }
   ```
   `//**/` matches on any drive, so the same lines work in a user or a project file, on Windows, macOS and Linux ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files"). `.env*` covers every name that starts with `.env`, such as `.env.production` and `.envrc`.
2. **Claude:** merges the rules into `permissions.deny` of the file you chose with this Node.js command, never with its file tools, which would read the whole file into the session, `env` values included. Claude shows you the command and runs it on your yes. `<settings file>` is `$HOME/.claude/settings.json` (or `$CLAUDE_CONFIG_DIR/settings.json`), `.claude/settings.local.json` or `.claude/settings.json`; with no to question 2, leave off the `credential` and `secret` rules.

   ```bash
   node -e "const fs=require('fs'),path=require('path');const [mode,file,...rules]=process.argv.slice(1);if(mode!=='add'&&mode!=='remove'){console.log('first word: add or remove');process.exit(1)}const had=fs.existsSync(file);if(mode==='remove'&&had===false){console.log('no file: nothing changed');process.exit(0)}let s={};try{if(had)s=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''))}catch(e){s=null}if(s===null||typeof s!=='object'||Array.isArray(s)){console.log('not a valid settings file: nothing changed');process.exit(1)}const p=s.permissions=s.permissions||{};const before=Array.isArray(p.deny)?p.deny:[];const after=mode==='add'?before.concat(rules.filter((r)=>before.indexOf(r)<0)):before.filter((r)=>rules.indexOf(r)<0);console.log('before: '+JSON.stringify(before));if(after.length)p.deny=after;else delete p.deny;if(Object.keys(p).length===0)delete s.permissions;fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(s,null,2)+'\n');console.log('after: '+JSON.stringify(after));if(mode==='add')console.log(had?'file: already there':'file: created')" add "<settings file>" "Read(//**/.env*)" "Read(//**/*.pem)" "Read(//**/*.key)" "Read(//**/*credential*)" "Read(//**/*secret*)" "Read(~/.ssh/**)"
   ```

   The command adds the rules the file lacks, keeps every other setting and rule, writes the file with two-space indentation, and prints the deny list before and after, nothing else. It creates a missing file and its folder, changes nothing in a file that is not valid JSON, and drops a byte-order mark. With `add`, its last line is `file: created` or `file: already there`.
   - Without Node.js, **you** type `/permissions`, add each rule as a deny rule and save it to the file you chose. The dialog's steps are an open question ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files").
3. **Claude:** records the decision, the file, the rules, the command's last line and the undo in `adoption/decisions.md`.

## Check

1. **you:** type `/permissions`. Expected: the six rules (four with no to question 2) among the deny rules, each with its settings file. If one is missing, or a session starts with a Settings Warning, the file did not load as written; `claude doctor`, in your terminal, lists the entries Claude Code rejected ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files").
2. **you:** in your own terminal, in the folder Claude Code runs in, make a canary: a folder `deny-check` holding a file `.env` with one made-up line.
   - bash: `mkdir deny-check && printf 'DENY_CHECK=made-up-canary\n' > deny-check/.env`
   - PowerShell: `New-Item -ItemType Directory deny-check; Set-Content -Path deny-check\.env -Value 'DENY_CHECK=made-up-canary' -Encoding ascii`

   **Claude:** tries its Read tool on `deny-check/.env`, then Bash `cat deny-check/.env`. Expected: both refused, as `File is in a directory that is denied by your permission settings.` and `Permission to use Bash with command cat deny-check/.env has been denied.`; another wording that refuses passes too. With the PowerShell tool, `Get-Content deny-check\.env` is refused as well, with a message about the session's working folders.
3. **Claude:** shows you the gap, with Bash: `grep -r made-up-canary deny-check`. Expected, as on Windows and macOS: `deny-check/.env:DENY_CHECK=made-up-canary` (Watch out). On Linux, not tested, no output means nothing was found, not a refusal. A refusal names the denied permission; if you get one, your Claude Code covers more than the docs said on 2026-11-09: note it in the decision row.
4. **Claude:** deletes the canary, `rm -r deny-check`, after your yes.

If step 1 does not show the rules, or the Read tool or `cat` prints the canary in step 2, the item is not done: the plan row stays unticked, and that step's output is the next thing to look at. Managed settings that allow only a company's own rules are one cause (Watch out).

## Undo

- **Claude:** after your yes, runs the Steps 2 command with `remove` in place of `add`, with the same file and rules. It takes out those rules alone and prints the deny list before and after. Without Node.js, **you** remove the rules in `/permissions`.
- **Claude:** only when the decision row says the step 2 command created the file, runs this next, after your yes. It deletes the file only when no setting is left in it, then its `.claude` folder only when that is empty. Otherwise the file stays, even when it holds only `{}`.
  ```bash
  node -e "const fs=require('fs'),path=require('path');const file=process.argv[1];if(fs.existsSync(file)===false){console.log('no file: nothing deleted');process.exit(0)}let s=null;try{s=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''))}catch(e){}if(s===null||typeof s!=='object'||Array.isArray(s)||Object.keys(s).length>0){console.log('other settings, or not valid JSON: file kept');process.exit(0)}fs.unlinkSync(file);console.log('file deleted');const dir=path.dirname(file);if(path.basename(dir)==='.claude'&&fs.readdirSync(dir).length===0){fs.rmdirSync(dir);console.log('empty .claude folder deleted')}" "<settings file>"
  ```
- **Claude:** removes the canary folder if it is still there, and marks the row in `adoption/decisions.md` as undone.

## Watch out

Every fact and test result behind this card, every path tested included, is in [docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files".

- **A floor, not a wall.** The rules cover Claude's file tools and the shell commands Claude Code recognizes as reading a named file. A command that reads without naming the file, such as `grep -r` (Check step 3), and a script Claude runs, such as Python or Node.js, read what they reach ([docs/facts.md](../docs/facts.md)). Claude Code's Grep tool leaves denied files out, but is off by default on macOS, Linux and WSL, where Claude searches with the shell's `grep`. Keep the audit's rule in your instructions too: the rules catch slips, the instruction covers the rest.
- **PowerShell is an open question:** whether `Read` deny rules apply to its commands ([docs/facts.md](../docs/facts.md)). In the kit's test a recursive `Select-String`, once allowed, printed every secret line.
- **For a wall, the sandbox.** It limits, at the system level, what files shell commands and the programs they start can read, and takes in these rules. It runs on macOS, Linux and WSL2, not on native Windows; the kit does not set it up ([docs/facts.md](../docs/facts.md)).
- **Names, not contents, and folders too** (question 2). A Python virtual environment in a `.env` folder is refused whole: Claude's file tools cannot read its packages, while `grep -r` still can. `.venv`, the usual name, is not matched ([docs/facts.md](../docs/facts.md)). A secret in a file of another name, such as `config.yaml` or a notebook's output, is not covered. A template such as `.env.example` is refused too, as a `!` rule cannot reopen a path under a `//` rule: paste what Claude needs from it into the chat.
- **MCP servers.** A server's own file tools, such as a filesystem server's, are not covered: `Read` rules apply to built-in tools, and an MCP tool can be denied only whole, by name (`mcp__<server>__<tool>`; [docs/facts.md](../docs/facts.md)). Give such a server only the folders it needs ([MCP servers with the least access](mcp-least-access.md)).
- **Secrets already in git** are a different problem: they are in history. [The git hook templates](git-hooks.md) stop new ones; removing old ones is a history rewrite ([a real address in history](../examples/real-address-in-history.md)).
- **Company plans.** Your organization's managed settings can make their own rules the only ones that count (`allowManagedPermissionRulesOnly`); your lines then do nothing, and Check step 2 shows it.
- **Mods.** Without managed settings or a Team or Enterprise sign-in, a mod (code a plugin runs inside Claude Code) can approve a call a deny rule refuses: scan a plugin before you install it ([SkillSpector](skillspector.md)).
- **Inside Claude Code only.** A terminal you open yourself, another editor's assistant or a script you run is outside these rules.
- **Token cost:** nothing loads into context; the rules are settings that Claude Code reads.
