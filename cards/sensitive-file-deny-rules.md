---
id: sensitive-file-deny-rules
module: 06-git-and-guardrails
checked: 2026-11-10
---

# Deny rules for secret files

## Why

- **The problem:** Claude Code can read every file in a folder you give it. A `.env` file, a private key or a `credentials.json` opened during a search or a look around is a secret that has left its file. The kit's read-only audit asks Claude never to open such files, and an instruction is not a lock ([SECURITY.md, Asked](../SECURITY.md#asked)).
- **The reason:** Claude Code's own permission rules. A `Read(...)` rule under `permissions.deny` in a settings file is checked by Claude Code before the tool runs, whatever the model intends: "Permission rules are enforced by Claude Code, not by the model" ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files"). Six rules cover the secret files the audit avoids: `.env` files and their variants, `*.pem` and `*.key` files, files whose names hold `credential` or `secret`, and your `~/.ssh` folder, where SSH keys live.
- **The cost of skipping it:** a secret Claude reads goes out with the conversation and stays in the session transcript on your machine, in plain text, for 30 days by default ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). There is no taking it back; the fix is a new secret.
- **The principle:** [checks for rules that must never break, prose for judgement](../PRINCIPLES.md#checks-for-rules-that-must-never-break-prose-for-judgement). "Never open a secret file" becomes a rule Claude Code refuses, not a sentence Claude keeps.

## Detect

Read-only. Rule text, counts and a version; never a file's contents, and never any other value from a settings file.

- Deny rules already set, at user level (`~/.claude/settings.json`, or `$CLAUDE_CONFIG_DIR/settings.json` when that is set) and in `.claude/settings.json` and `.claude/settings.local.json` of each repository in `adoption/inventory.md`. Claude prints the `permissions.deny` list alone, so nothing else in the file, such as an `env` value, reaches the session:
  `node -e "try{const s=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));console.log(JSON.stringify((s.permissions||{}).deny||[]))}catch(e){console.log('no file, or not valid JSON')}" "<settings file>"`
  Rule text holds no secret, so it is shown as written. Without Node.js, Claude asks you to type `/permissions`, which lists every rule with the file it comes from, and to read out the deny rules.
- What the rules would refuse. A rule matches a file or a folder, anywhere in the path, including the project folder and the folders above it, so Claude checks four things for each repository, names never printed (to see the names yourself, run a count in your own terminal without the `c` in `-ciE`):
  - tracked paths with a `.env*`, `*.pem` or `*.key` file or folder in them: `git -C "<repo>" ls-files | grep -ciE '(^|/)(\.env[^/]*|[^/]*\.(pem|key))(/|$)'`;
  - a folder named `.env` at the top, often a Python virtual environment, which `git ls-files` does not show when it is ignored: `test -d "<repo>/.env" && echo "a .env folder" || echo "none"`;
  - tracked paths with `credential` or `secret` in any file or folder name: `git -C "<repo>" ls-files | grep -ciE '(^|/)[^/]*(credential|secret)[^/]*(/|$)'`;
  - the repository's own path, the project folder and every folder above it, which `git ls-files` never shows: `git -C "<repo>" rev-parse --show-toplevel | grep -ciE 'credential|secret'` (`1` means the path holds either word). For your setup folder when it is not a repository: `(cd "<your setup>" && pwd) | grep -ciE 'credential|secret'`.
- Claude Code's version: `claude --version`. Input redirects such as `cat < .env` are covered from v2.1.257, the Write tool from v2.1.228 ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files").

The menu marks the item **have** when a deny list at user level, or in every repository in `adoption/inventory.md`, holds rules for `.env*`, `*.pem`, `*.key` and `~/.ssh`, and for the two name words unless you chose against them; **partly** when only some of these are there; and **not yet** otherwise.

## Ask

1. **"Stop Claude Code from reading secret files?"**
   - Yes, in every project: the rules go in your user settings, `~/.claude/settings.json`, and hold in every folder Claude Code starts in or is given. Recommended when Detect found none of these rules, and in every repository it counted 0 `.env*`, `*.pem` and `*.key` paths and no `.env` folder: secrets sit in many projects, and rules written once cover each of them.
   - Yes, in this project only: `.claude/settings.local.json`, your own settings for one project; or `.claude/settings.json`, which reaches everyone who clones the repository once committed. Recommended when a team should get the rules too, through the shared file, after you have agreed it with them; and when another repository has a `.env` folder, or `.env*`, `*.pem` or `*.key` paths that Claude needs to read, so the rules go only where they refuse nothing you need.
   - FOLD: add only the rules your deny list lacks, in the file that holds it. Recommended when Detect found some of them.
   - No.
   - Not sure: the option recommended above for what Detect found: FOLD when it found some of the rules; this project only when another repository has a `.env` folder or `.env*`, `*.pem` or `*.key` paths; every project otherwise. Nothing is saved before you have seen the change, and Undo removes the lines.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Also refuse every file and folder named with the words credential or secret?"**
   - Yes: `credentials.json`, `client_secret.json` and `secrets.yaml` are refused, and so is every path with either word in a file or a folder name, anywhere in the path, including the project folder: `secret_store.py`, `my-secrets/notes.txt`, `aws-credentials-helper/src/app.js`, and every file of a project kept in a folder called `secret-garden`. Recommended when Detect counted 0 tracked paths with either word and no repository's own path holds either word.
   - No: only `.env*`, `*.pem`, `*.key` and `~/.ssh` are refused. Recommended when Detect counted paths with either word and you know them to be ordinary files or folders, such as code or notes, that Claude needs to read. The only workable answer when a repository's own path holds either word: with yes, Claude could read nothing in that project, and with the rules at user level, nothing in any project under that folder.
   - Not sure: the option recommended above for the counts: yes when Detect counted 0 paths with either word and no repository's path holds one; no otherwise.
   - Default when skipped: the same as Not sure.

## Needs

- Claude Code, v2.1.257 or later for every route Detect names (`claude --version`).
- Node.js, for the commands that read or change the deny list without the rest of the settings file passing through the session; without it, you use `/permissions` by hand. [Tools some items need](../docs/install-reference.md#tools-some-items-need) installs Node.js 22:
  - Windows: `! winget install --id OpenJS.NodeJS.22 -e`;
  - macOS and Linux: through nvm, the three lines in [docs/facts.md](../docs/facts.md), "Installing the tools on Windows, macOS and Linux";
  - then `! node --version`.
- Nothing else: the rules are Claude Code's own setting.

## Steps

1. **Claude:** shows you the rules for your answers. With yes to both questions:
   ```json
   {
     "permissions": {
       "deny": [
         "Read(//**/.env*)",
         "Read(//**/*.pem)",
         "Read(//**/*.key)",
         "Read(//**/*credential*)",
         "Read(//**/*secret*)",
         "Read(~/.ssh/**)"
       ]
     }
   }
   ```
   A rule that starts `//**/` matches a file or a folder of that name anywhere in the path, on any drive, so the same lines work in a user file and a project file, on Windows, macOS and Linux ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files"). `.env*` covers `.env`, `.env.production` and every other name that starts with `.env`, such as `.envrc`. With no to question 2, the `credential` and `secret` lines are left out.
2. **Claude:** merges the rules into `permissions.deny` of the file you chose with one Node.js command, never with its file tools: those would read the whole file into the session, `env` values included. The command reads the file, adds the rules it lacks, keeps every other setting and rule, writes the file back with two-space indentation, and prints the deny list before and after, nothing else. It creates the file and its folder when there is none, and changes nothing in a file that is not valid JSON. In the kit's test (2026-11-10, Claude Code 2.1.319 on Windows), Claude Code loaded a file the command had rewritten with no warning, and the file's `env` value, allow rule and older deny rule worked as before. Claude shows you the command and runs it on your yes; `<settings file>` is `$HOME/.claude/settings.json` (or `$CLAUDE_CONFIG_DIR/settings.json`), `.claude/settings.local.json` or `.claude/settings.json`, and with no to question 2 the `credential` and `secret` rules are left off the line:
   ```bash
   node -e "const fs=require('fs'),path=require('path');const [mode,file,...rules]=process.argv.slice(1);if(mode!=='add'&&mode!=='remove'){console.log('first word: add or remove');process.exit(1)}if(mode==='remove'&&fs.existsSync(file)===false){console.log('no file: nothing changed');process.exit(0)}let s={};try{if(fs.existsSync(file))s=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){s=null}if(s===null||typeof s!=='object'||Array.isArray(s)){console.log('not a valid settings file: nothing changed');process.exit(1)}const p=s.permissions=s.permissions||{};const before=Array.isArray(p.deny)?p.deny:[];const after=mode==='add'?before.concat(rules.filter((r)=>before.indexOf(r)<0)):before.filter((r)=>rules.indexOf(r)<0);console.log('before: '+JSON.stringify(before));if(after.length)p.deny=after;else delete p.deny;if(Object.keys(p).length===0)delete s.permissions;fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(s,null,2)+'\n');console.log('after: '+JSON.stringify(after))" add "<settings file>" "Read(//**/.env*)" "Read(//**/*.pem)" "Read(//**/*.key)" "Read(//**/*credential*)" "Read(//**/*secret*)" "Read(~/.ssh/**)"
   ```
   Without Node.js, **you** type `/permissions`, add each rule as a deny rule and save it to the file you chose: a rule added there is saved to the settings file you pick. The dialog's steps are not documented as of 2026-11-09 ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files").
3. **Claude:** records the decision, the file, the rules and the undo in `adoption/decisions.md`.

## Check

1. **you:** type `/permissions`. Expected: the six rules (four with no to question 2) among the deny rules, each with the settings file Claude put it in. If one is missing, or a session starts with a Settings Warning, the file did not load as written; `claude doctor`, in your terminal, lists the entries Claude Code rejected ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files").
2. **you:** in your own terminal, in the folder Claude Code runs in, make a canary: a folder `deny-check` holding a file `.env` with one made-up line.
   - bash: `mkdir deny-check && printf 'DENY_CHECK=made-up-canary\n' > deny-check/.env`
   - PowerShell: `New-Item -ItemType Directory deny-check; Set-Content -Path deny-check\.env -Value 'DENY_CHECK=made-up-canary' -Encoding ascii`

   **Claude:** tries its Read tool on `deny-check/.env`, then its Bash tool with `cat deny-check/.env`. Expected: both refused. With Claude Code 2.1.319 on Windows the Read tool said `File is in a directory that is denied by your permission settings.` and the Bash tool `Permission to use Bash with command cat deny-check/.env has been denied.`; 2.1.321 on macOS used the same wording, and another wording that refuses passes too. Where Claude has the PowerShell tool, `Get-Content deny-check\.env` is refused as well; its message, seen with 2.1.319, blames the session's working folders, even though the file is inside them.
3. **Claude:** shows you the gap on the same file, with its Bash tool: `grep -r made-up-canary deny-check`. Expected: it prints `deny-check/.env:DENY_CHECK=made-up-canary`, because a command that does not name the file is not covered (Watch out). The kit saw this on Windows (Claude Code 2.1.319) and on macOS (2.1.321), where Claude's `grep` is an embedded ugrep and printed the hidden `.env` all the same. Linux was not tested: there, no output means the search found nothing, which is not a refusal. A refusal names the denied permission; if you get one, your Claude Code covers more than the docs said on 2026-11-09, so note it in the decision row.
4. **Claude:** deletes the canary, `rm -r deny-check`, after your yes.

If step 1 does not show the rules, or the Read tool or `cat` prints the canary in step 2, the item is not done: the plan row stays unticked, and that step's output is the next thing to look at. A company plan whose managed settings allow only their own rules is one cause (Watch out).

## Undo

- **Claude:** runs the Steps 2 command with `remove` in place of `add`, the same file and the same rules, after your yes. It takes out those rules alone, leaves every other setting and rule, and prints the deny list before and after. Without Node.js, **you** remove the rules in `/permissions`.
- **Claude:** removes the canary folder if it is still there, and marks the row in `adoption/decisions.md` as undone.

## Watch out

- **A floor, not a wall.** The rules cover Claude's file tools and the shell commands Claude Code recognizes as reading a named file. A command that reads without naming the file passes: `grep -r` over a folder printed the line of every denied file, hidden ones included, in the kit's tests on Windows and on macOS (Check step 3). Claude Code's own Grep tool left those files out on both systems, but on macOS, Linux and WSL that tool is off by default and Claude searches with `grep` through the shell. A script Claude runs, in Python or Node.js for example, reads what it opens ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files"). Keep the audit's rule in your instructions too; the rules catch the slips, the instruction covers the rest.
- **PowerShell is not documented.** In the kit's test `Get-Content .env` was refused, while a recursive `Select-String` over the folder, once allowed, printed every secret line.
- **For a wall, the sandbox.** Claude Code's sandbox limits, at the operating system's level, what files shell commands and the programs they start can read, and it takes these rules into its own configuration. It runs on macOS, Linux and WSL2, not on native Windows, and the kit does not set it up ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files").
- **Names, not contents, and folders too.** A rule matches a file or a folder, anywhere in the path, including the project folder and the folders above it. A review run with Claude Code 2.1.319 on Windows saw `my-secrets/notes.txt`, `aws-credentials-helper/src/app.js`, `keys.key/readme.txt` and every file of a project in a folder named `secret-garden` refused ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files"). A Python virtual environment in a folder named `.env` is refused as a whole, as the kit's test on Windows showed (2026-11-10), so Claude's file tools cannot read the packages installed there, while `grep -r` still reaches them; `.venv` is the usual name and is not matched. A secret in a file with another name, such as `config.yaml` or a notebook's output, is not covered. A template such as `.env.example` is refused too: a `!` rule cannot reopen a file under a rule that starts `//`. Paste what Claude needs from it into the chat.
- **MCP servers.** A server's own tool that reads files, such as a filesystem server's, is not covered: `Read` rules apply to Claude Code's built-in tools, and a settings file can deny an MCP tool only as a whole, by its name (`mcp__<server>__<tool>`), not for one path ([docs/facts.md](../docs/facts.md), "Claude Code: permission rules for secret files"). Give such a server only the folders it needs ([MCP servers with the least access](mcp-least-access.md)).
- **Secrets already in git** are a different problem: a Detect count of tracked `.env*`, `*.pem` or `*.key` paths that hold secrets means they are in history. [The git hook templates](git-hooks.md) stop new ones; removing old ones is a history rewrite ([a real address in history](../examples/real-address-in-history.md)).
- **Company plans.** Your organization's managed settings can make their own rules the only ones that count (`allowManagedPermissionRulesOnly`); your lines then do nothing, and Check step 2 shows it.
- **Mods.** In a session with neither managed settings nor a Team or Enterprise sign-in, a mod (code a plugin runs inside Claude Code) can approve a call that a deny rule refuses. Scan a plugin before you install it ([SkillSpector](skillspector.md)).
- **Inside Claude Code only.** A terminal you open yourself, another editor's assistant or a script you run is outside these rules.
- **Token cost:** nothing loads into context; the rules are settings that Claude Code reads.
