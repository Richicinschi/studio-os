---
id: supply-chain-risk-auditor
module: 09-data-work
checked: 2026-11-02
---

# Supply-chain risk audit

## Why

- **The problem:** a package installed because a snippet needed it, with no look at who maintains it. Every package you add is code someone else can change, and you run it with your access.
- **The reason:** for each direct dependency, the skill finds its repository and checks six risk factors: a single maintainer or a small group, no maintenance for a long time, low popularity, risky features (calls into native code, deserialization, running third-party code), past high or critical CVEs (published vulnerability reports), and no security contact. It cites numbers it got from GitHub, and suggests a better-maintained alternative for each package it flags.
- **The cost of skipping it:** the kit has no story of a dependency gone bad. Skipping the audit means you learn who maintains each package, and whether anyone does, after something has gone wrong; module 09 names this as one of the three things that go wrong in data work ([module 09, The problem](../modules/09-data-work/README.md#the-problem)).
- **The principle:** [scan before anything runs in a session](../PRINCIPLES.md#scan-before-anything-runs-in-a-session). A package runs in your work as surely as a skill runs in a session; the audit looks at who stands behind it before you trust it.

## Detect

Read-only: folder names, the front matter of skills and agents (their name and description), command paths and the names of package manifests, never a skill's body, a data file, a lock file's contents or a credential. No network.

- Your user folder: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"` (`%USERPROFILE%\.claude` on Windows, unless `CLAUDE_CONFIG_DIR` moves it).
- A skill of the same name: `ls -d .claude/skills/supply-chain-risk-auditor "$U/skills/supply-chain-risk-auditor" 2>/dev/null`.
- Another skill or agent doing the same job, read from front matter only (the lines between the first two `---`); it prints the matching file names:
  `for f in .claude/skills/*/SKILL.md "$U"/skills/*/SKILL.md .claude/agents/*.md "$U"/agents/*.md; do awk '/^---$/{n++; next} n==1' "$f" 2>/dev/null | grep -qiE 'supply.?chain|dependenc|maintainer' && echo "$f"; done`
- The `gh` command line the skill needs: `command -v gh` prints a path, or nothing.
- Which package manifests the project has, names only: `ls package.json pyproject.toml requirements*.txt pubspec.yaml 2>/dev/null`.

The menu marks the item **have** when a skill named `supply-chain-risk-auditor` exists, or another skill's description covers who maintains your dependencies; **partly** when another skill covers dependencies only in part (for example a known-vulnerability check, which this skill leaves to dedicated tools); **not yet** otherwise. A missing `gh` does not change the mark; it adds a step.

## Ask

1. **"Take supply-chain-risk-auditor?"**
   - ADAPT: the kit copy with your package managers named in its description in place of the studio's three ecosystems. Recommended when Detect says **not yet** and you install packages for your work.
   - ADOPT as it is: the body and its report template as they ship; Claude still replaces the description's studio line (step 3).
   - FOLD: add its six risk factors to the dependency-review skill you already have. Recommended when Detect says **partly**.
   - Skip. Recommended when Detect says **have**, or when you never add packages.
   - Not sure: the option recommended above for what Detect found: skip for **have**, FOLD for **partly**, ADAPT for **not yet**, with the description it would write shown to you first.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: not taken.
2. **"Where?"**
   - This project: `.claude/skills/supply-chain-risk-auditor/`.
   - Every project: `~/.claude/skills/supply-chain-risk-auditor/`. Recommended when you add packages in more than one repository, since the audit belongs before any install.
   - Not sure: the option recommended above: every project when you add packages in more than one repository, otherwise this project, the narrower choice.
   - Default when skipped: this project.

## Needs

- The `gh` command line on your PATH. The skill stops and asks you to install it when it is missing. Its install commands, and whether these queries need you signed in to GitHub, are not documented in docs/facts.md as of 2026-11-02; use GitHub's own install page.
- Network access to GitHub from the machine where Claude runs.
- SkillSpector, for the scan in step 1: row 1 of your plan ([docs/facts.md](../docs/facts.md), "Installing SkillSpector").

## Steps

1. **Claude:** runs `vet-and-adopt` on the kit copy, `catalog/skills/supply-chain-risk-auditor/`: `skillspector scan catalog/skills/supply-chain-risk-auditor --no-llm` (on Windows, `PYTHONUTF8=1` first, as docs/facts.md shows), the triage, and a recommendation against what Detect found. The studio's scan of this copy on 2026-11-02 said SAFE, 0/100; your own result is the one that counts.
2. **you:** if Detect found no `gh`, install it from GitHub's install page. If it asks you to sign in, type that yourself with Claude Code's `!` prefix; Claude never handles the token.
3. **Claude:** on your yes, writes the copy for your setup and shows you the change before it saves it:
   - the description's triggers in your words, naming the package managers you use instead of the studio's three;
   - the front matter's author and the studio's notes dropped; the upstream source line kept;
   - the body and `resources/results-template.md` kept as they are, and `LICENSE` kept: per the `LICENSE` file itself, the kit's only source for it, it is CC BY-SA 4.0 (a Creative Commons licence that asks you to credit Trail of Bits and to share an adapted copy under the same licence).
4. **Claude:** asks whether the audit's workspace stays out of git. The skill creates a `.supply-chain-risk-auditor/` folder with a `results.md` in the project; Claude adds it to `.gitignore`, or leaves it if you want the report kept with the code.
5. **Claude:** records the decision, the scope, the scan result and the undo in `adoption/decisions.md`.

## Check

1. **you:** in a new session, in a project with at least one package manifest, say "audit this project's dependencies".
2. Expected: Claude first confirms `gh` is there, then creates `.supply-chain-risk-auditor/results.md` from the template and fills it: each flagged dependency with its risk factors, the numbers it got from `gh` (stars and open issues may be rounded with `~`), and a suggested alternative; or an empty high-risk table when no dependency has a risk factor.

If the report cites numbers with no `gh` query behind them, or adds sections the template does not have, the item is not done: the plan row stays unticked.

## Undo

- **Claude:** deletes `.claude/skills/supply-chain-risk-auditor/` or `~/.claude/skills/supply-chain-risk-auditor/`, whichever scope you chose. For FOLD, it removes the lines it added, which `adoption/decisions.md` names.
- **Claude:** deletes `.supply-chain-risk-auditor/` in each project where it ran, after showing you what is in it, and the `.gitignore` line if it added one.
- **you:** if you installed `gh` only for this, removing it, and signing out of it, is your call.
- **Claude:** adds the removal to `adoption/decisions.md`.

## Watch out

- **Your dependency list leaves the machine.** The audit sends the names of your dependencies to GitHub as queries. In a company project whose package names are internal, check your rules first; internal packages hosted elsewhere will not resolve anyway.
- **Only direct dependencies.** Packages that your packages pull in are not checked.
- **It is not a vulnerability scanner.** The skill leaves active vulnerability scanning to dedicated tools, and does not look at licences either.
- **One query or more per dependency.** A long dependency list means a long run with many calls to GitHub.
- **Judgement, not a score.** "Single maintainer" weighs less for a prolific, well-known contributor and more for an anonymous one; read the notes, not only the table. Every number in the report should come from a `gh` query; [claim-auditor](claim-auditor.md) can check that.
- **ShareAlike licence.** An adapted copy you share with others carries CC BY-SA 4.0 and credits Trail of Bits, as the copy's `LICENSE` file sets out.
- **Context cost:** the description loads every session, about 70 tokens; the body, about 1,370 tokens, loads when the skill runs. Estimates (bytes divided by 4).
