# Maintaining the kit

For whoever exports the kit from the studio. Adopters never need this page.

## What is generated and what isn't

`catalog/` and `docs/THIRD_PARTY_NOTICES.md` are generated from the studio's hub by the export. Never edit them by hand; edit `export.manifest.json`, the allowlist, instead. Everything else is hand-written: the entry pages, `modules/`, `templates/`, `examples/`, `docs/facts.md`, the two kit skills in `.claude/skills/`, and `tools/export/` itself.

## Outside text and its credit

A domain ships only when `packShippable` passes: no file in it is an outside licence file, and no skill in it names an upstream, has an "adapted" author line or is a vendored copy not marked rewritten. It may still adapt outside text under a permissive licence, credited in a credit file: `ATTRIBUTION.md`, or a file whose name starts with `NOTICE`, at any depth. When the build finds one, the domain's `SOURCE.md` says it adapts outside work, names the licences of the adapted text and links the credit file, and `docs/THIRD_PARTY_NOTICES.md` lists the domain with a link to that file and to the text of each licence.

The build reads those licences from the credit file's tables: the column headed Licence, in every table except one whose header row or the heading above it says "not copied" or "never copied". A cell names one SPDX identifier or several (`MIT / Apache-2.0`). A credit file with no such table, a cell that is not an SPDX identifier, or only tables of sources not copied stops the export with the file and the row. Fix the credit file in the hub.

**Naming outside work.** A repo-wide test (`tools/export/test/export.test.mjs`) fails when any file names the outside workflow collection the core was first written from. Its one exception is credit a licence requires: the credit files a domain's `SOURCE.md` links from its Origin line, and no other file, the rest of that domain included. The test checks that one name only; the kit names other outside projects elsewhere: tools it installs, the sources in `docs/facts.md`, and programs and libraries a domain's text points to.

## Before you export

- Two local files must exist in `tools/export/`. Both are gitignored, and are never committed, printed or quoted:
  - `privacy.local.txt`, the deny list: people, clients, employers, private project names, personal identifiers (format in `privacy.local.example.txt`).
  - `owner.local.txt`, the owner's first name, which the export rewrites to "the owner" (format in `owner.local.example.txt`).
- The export refuses to run without either. `npm test` must pass.

## The export routine

1. **Dry run:** `node tools/export/export.mjs --hub <path to the studio hub>`. It builds the catalog in a staging copy, runs every gate there, and changes the kit only when all of them pass.
2. **Scan:** `node tools/export/scan.mjs` runs SkillSpector over every shipped and kit-only skill and every domain (`catalog/packs/<id>`, recorded as `pack:<id>`) and records each verdict, score and number of findings in `tools/export/scans.json`; the next export writes them into each `SOURCE.md`. Every verdict other than SAFE needs its section in `tools/export/scan-triage.md`: the heading `### <id>: VERDICT, N/100, K findings` (`### pack:<id>: ...` for a domain), then a table with one row per finding, read at the line it names, and a Verdict column that says FP or BY DESIGN (a row that stands for several findings says "(k rows)" in its Finding cell). The export writes the counts and a link to that section beside the verdict.
3. **Release**, from a clean checkout of the hub, because a release refuses a hub with uncommitted changes in what the export reads: `node tools/export/export.mjs --hub <clean hub checkout> --release X.Y.Z --note "What this release is about."` A release also runs the content lint, then writes the `CHANGELOG.md` section and `tools/export/state.json`. The changelog is the full account of what a release ships: when maintainer-facing files changed since the last release (`tools/`, `.github/`, `docs/MAINTAINING.md`, the tests), add one more note that starts with "Maintainers:" and says what changed, even when adopters see no difference; a change visitors see on GitHub, such as the issue forms, also gets an adopter line. `git log --stat <last release>..HEAD -- tools .github docs/MAINTAINING.md` lists them.

Exit codes: 0, done; 1, a gate failed and the kit is unchanged; 2, refused before building (a missing local file, a `--note` carrying a denied term, path or secret, a dirty hub, or `--no-gitleaks` on a release).

## The gates, and how to fix what they find

Fix the cause, never the gate.

- **secrets** (patterns, plus gitleaks): remove the secret at its source in the hub.
- **privacy** (the deny list, in file content and in file names; a finding names the list position, never the term): rewrite the hub text, or make the item `catalog-only` with the reason in its `note`.
- **paths** (studio paths, home folders, hostnames, private and public addresses): if it is a pattern, add a rewrite with a test in `rules.mjs`; otherwise make the item `catalog-only`. Upstream text that names a product but carries no studio detail can go on `PATHS_ALLOW` in `rules.mjs`: that one phrase in that one file, with the reason, reviewed.
- **accounting** (stray catalog files, files that are neither UTF-8 text nor a known binary, third-party skills without a licence, external items without one, diagram links that no longer match their `.drawio`): fix the file, add the licence, or regenerate the link.
- **links** (relative links must resolve, with the exact case, inside the kit): fix the link or the file name.
- **cards** (every menu item, meaning every `shipped` and `link-only` item and every practice, has its hand-written adoption card `cards/<id>.md`, and every card belongs to a menu item): write the card, or remove the orphan.
- **triage** (every shipped item whose last scan in `scans.json` is not SAFE has one section in `scan-triage.md` with the same verdict, score and number of findings, whose rows add up to that number, each FP or BY DESIGN; at a release, every shipped item also has a scan): read the findings and write the section. A finding that is real is fixed at its source, or the item stops shipping; it never ships with the finding in it. The gate compares counts, not the findings themselves: a rescan whose findings change while their number, the verdict and the score stay the same passes it, so after every scan compare the new findings with the triage before you export.
- **lint** (releases only, or `node tools/export/lint-content.mjs` at any time): module pages carry their front matter and five headings in order; cards carry `id`, `module` and `checked` and the eight headings in order, none empty; skill folders match their names; START-HERE gives a block per operating system; and the kit skills, START-HERE, ADOPT and the cards use none of the words that talk a step down ("just", "simply", "easy", "obviously", "should work", "guaranteed", "great question").

**Token figures in cards** are held to the files they describe by `npm test` (`tools/export/card-tokens.mjs`), with the estimator the kit uses everywhere (bytes divided by 4, rounded up). A skill or agent card states `tokens: description` and `tokens: body` in its front matter; a domain card states its entry and entry-with-agents sizes; every figure in a card's text ("about 2,400 tokens") must be within 10% of a computed figure of that item. A figure that is not the size of a kit file (a threshold such as 1,000, a worked example, a measurement of something else) goes in the card's front matter under `other_figures:` as a list. After an export that changes a skill, run `node tools/export/card-tokens.mjs` and fix what it lists; the practice sizes (light, standard, full) are choices, so only their figures in the text are checked.

A new hub skill stops the export as "unclassified": add it to the manifest as `catalog-only` until the owner decides. A hub item that is never exported and whose very name must stay out of the kit goes, as `kind:id`, into the gitignored `tools/export/private.local.txt` (format in `private.local.example.txt`); the export counts it as private and no committed file names it. A hub source a page may not list, because its name would say what the studio works on privately, goes into the same file as `source <kit page> <hub path>`: staleness and the release's clean-hub check follow it, and the page's own `studio_sources:` leaves it out.

A studio pointer in a shipped copy whose rewrite would itself name what the studio works on privately (a product, a project, a data source) goes into the gitignored `tools/export/rewrites.local.json` instead of `STUDIO_REWRITES` (format in `rewrites.local.example.json`). Each entry also names a `gone` term: the build stops if that term is still in the file after the rewrites, and the export reports the entry by its number only. Put the same term on the deny list, so an export run without the file stops at the privacy gate.

The export needs four local files, all gitignored and never committed: `owner.local.txt` (the owner's first name), `privacy.local.txt` (the deny list), `private.local.txt` (hub items and sources no committed file may name) and `rewrites.local.json` (the studio-name rewrites). Each has an example beside it with invented entries. To export on another machine, copy all four there by hand. Without any one of them the export refuses to start and builds nothing, so a missing file can never ship what it protects; a file with no entries (`[]` for the rewrites) is a deliberate choice and runs. A `shipped` or `link-only` item, and every practice, also needs `importance` (core, recommended or optional) and a `why` of at most 140 characters, each either one value or one per profile (`{ "default", "data", "ml", "software" }`, the default required); a practice or an outside item needs `loads` (none, on-demand or every-session), and a practice its `files`. A practice whose files are not what loads, such as a hook's printed lines, states `everySessionTokens` itself. The export then writes `catalog/features.json` and `catalog/FEATURES.md` with each item's token estimate.

The adoption diagram is generated: edit the list in `tools/docs/adoption-sequence.mjs`, then run `node tools/docs/adoption-sequence.mjs docs`.

## Staleness

`studio_sources:`, in the front matter of the module pages, the examples, `START-HERE.md`, `ADOPT.md` and `PRINCIPLES.md`, lists the studio files the page was written from; the kit does not ship them, so a reader cannot open them, and the key's name says whose sources they are.

Every export lists the hand-written pages whose `studio_sources:` changed in the hub since the last release, and the pages whose `checked:` date is more than 90 days old, `docs/facts.md` included. Re-check those facts against their sources, then update the date.

## Versioning

Semver. A new or changed item is a minor version. A removed item or a changed adoption protocol is a major version, because adopters' recorded decisions refer to them.

## History

The kit has two histories that never meet. The development history lives in a private repository, the `dev` remote; it holds every earlier version, private terms included, so it is never made public. The public repository, the `origin` remote, began on 2026-11-02 with one signed commit holding the v2.0.1 tree, and each later release adds one commit on top. Never push `main` to `origin`: the two histories share no commit, and the only way through would be a force-push.

## Publishing a release

Day-to-day work and every release commit go to `dev` (`git push dev main`). After a release has passed every gate (`--release` runs gitleaks and the lint), publish its tree as one commit on top of `origin/main`. Build that commit in a separate worktree on a detached HEAD, so `main` and its gitignored local files stay where they are and no local branch has to move. The commit goes first to a branch `release/vX.Y.Z` on `origin`, where the test workflow runs on Linux, Windows and macOS; `main` on `origin` moves only after that run is green. From your kit checkout:

```bash
git fetch origin
git worktree add --detach ../studio-os-public origin/main   # the first time only
cd ../studio-os-public
git switch --detach origin/main                     # start from what is published, on no branch
git rm -r -q .                                      # empty the index and the folder of tracked files
git checkout <release commit> -- .                  # the release tree, every file
git commit -S -m "Studio OS vX.Y.Z"                 # message: the version; the story is in CHANGELOG.md
test "$(git rev-parse HEAD^{tree})" = "$(git rev-parse <release commit>^{tree})" && echo "same tree" || echo "STOP: not the release tree"
test "$(git rev-list --count origin/main..HEAD)" = 1 && echo "one commit" || echo "STOP: not exactly one new commit"
node <your kit checkout>/tools/export/history-check.mjs "origin/main..$(git rev-parse HEAD)"
git push origin HEAD:refs/heads/release/vX.Y.Z      # starts the test workflow on the three systems
gh run list -R "$(git remote get-url origin)" --workflow test.yml --commit "$(git rev-parse HEAD)" --json databaseId --jq '.[0].databaseId'
gh run watch <run id> -R "$(git remote get-url origin)" --exit-status && git push origin HEAD:main   # main moves only on a green run
git push origin --delete release/vX.Y.Z             # you run this one yourself, see below
```

Expected: `same tree`, `one commit`, then `history-check: 1 commit(s) checked ...; 0 carry at least one`, then the run's id, then `gh run watch` ending with all three jobs passed and exit code 0, then a plain push of `main` with no force, then the release branch deleted. A `STOP` line, a term found, or any count other than 1 commit checked stops the publish: a range with no commits passes `history-check` while checking nothing, which is why the count check comes first.

The range `origin/main..<commit>` is exactly what the push to `main` publishes, so `history-check.mjs` checks that and nothing else. It runs from your kit checkout, because it reads the local files of the checkout it lives in; that checkout shares its objects and `origin/main` with the publish worktree but not its HEAD, so the commit is named by its id. It checks the commit's whole tree, its file names and its message against the owner's name, the deny list and the private item and source names, and prints term numbers only. Given `origin/main` alone, it checks the whole public history. Both checks come before the first push, because the release branch is public as soon as it exists.

If `gh run list` prints nothing, the run has not started yet: wait a few seconds and run it again. If no run appears within a minute, the workflow did not trigger: stop, and do not push `main`. Deleting the release branch is a command you run yourself: the kit's [git-guardrails](../cards/git-guardrails.md), where it is installed, refuses every remote delete (`push --delete`) when Claude runs git.

**When the publish stops.** `origin/main` has not moved, and the commit you built is on no local branch: when you give up an attempt, `git switch --detach origin/main` in the publish worktree is the only local undo. Then, by cause:

- **A term found, or a `STOP` line:** nothing was pushed. Fix it in the kit, release again (below), and start over.
- **A red run:** do not push `main`. If the infrastructure failed rather than a test (a runner that did not start, a download that timed out), run the failed jobs again on the same commit with `gh run rerun <run id> -R "$(git remote get-url origin)" --failed`, then watch the run again. Otherwise delete the release branch yourself (`git push origin --delete release/vX.Y.Z`), fix the cause in the kit, release again, and start over.
- **The push to `release/vX.Y.Z` is rejected:** a branch from an earlier attempt is still there. Delete it, then push again. Never force.

**Releasing the same version again.** A release writes its `CHANGELOG.md` section and `tools/export/state.json`, the snapshot the next release compares against. In the fix commit on `main` in your kit checkout, put both back as they were before the failed release (`git checkout <release commit>^ -- tools/export/state.json CHANGELOG.md`), then run `--release X.Y.Z` again with the same notes and commit the result as the new release commit. Without that, the second run compares against the release that was never published: its section says "No catalog changes" and sits above a second section for the same version.

The workflow file in the pushed commit decides what runs, so the gate holds from the first release whose `.github/workflows/test.yml` lists `release/**`. Before that, these steps used a local branch `public`; it is no longer needed. Once the publish worktree is detached, `git branch -d public` deletes it, and refuses if it holds a commit `origin/main` does not have.

## Pull requests on the public repository

The public repository runs Dependabot alerts and security updates, CodeQL code scanning and secret scanning, so Dependabot can open pull requests there. Never merge a pull request on the public repository, Dependabot's included: the next release commit replaces the whole tree with the release tree, so a change that exists only on `origin` disappears at that release. Make the change where its file comes from instead (a file under `catalog/` in the hub, anything else in this repository), release and publish, then close the pull request if it is still open.
