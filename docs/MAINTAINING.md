# Maintaining the kit

For whoever exports the kit from the studio. Adopters never need this page.

## What is generated and what isn't

`catalog/` and `docs/THIRD_PARTY_NOTICES.md` are generated from the studio's hub by the export. Never edit them by hand; edit `export.manifest.json`, the allowlist, instead. Everything else is hand-written: the entry pages, `modules/`, `templates/`, `examples/`, `docs/facts.md`, the two kit skills in `.claude/skills/`, and `tools/export/` itself.

## Before you export

- Two local files must exist in `tools/export/`. Both are gitignored, and are never committed, printed or quoted:
  - `privacy.local.txt`, the deny list: people, clients, employers, private project names, personal identifiers (format in `privacy.local.example.txt`).
  - `owner.local.txt`, the owner's first name, which the export rewrites to "the owner" (format in `owner.local.example.txt`).
- The export refuses to run without either. `npm test` must pass.

## The export routine

1. **Dry run:** `node tools/export/export.mjs --hub <path to the studio hub>`. It builds the catalog in a staging copy, runs every gate there, and changes the kit only when all of them pass.
2. **Scan:** `node tools/export/scan.mjs` runs SkillSpector over every shipped and kit-only skill and records the verdicts in `tools/export/scans.json`; the next export writes them into each `SOURCE.md`.
3. **Release**, from a clean checkout of the hub, because a release refuses a hub with uncommitted changes in what the export reads: `node tools/export/export.mjs --hub <clean hub checkout> --release X.Y.Z --note "What this release is about."` A release also runs the content lint, then writes the `CHANGELOG.md` section and `tools/export/state.json`.

Exit codes: 0, done; 1, a gate failed and the kit is unchanged; 2, refused before building (a missing local file, a `--note` carrying a denied term, path or secret, a dirty hub, or `--no-gitleaks` on a release).

## The gates, and how to fix what they find

Fix the cause, never the gate.

- **secrets** (patterns, plus gitleaks): remove the secret at its source in the hub.
- **privacy** (the deny list, in file content and in file names; a finding names the list position, never the term): rewrite the hub text, or make the item `catalog-only` with the reason in its `note`.
- **paths** (studio paths, home folders, hostnames, private and public addresses): if it is a pattern, add a rewrite with a test in `rules.mjs`; otherwise make the item `catalog-only`. Upstream text that names a product but carries no studio detail can go on `PATHS_ALLOW` in `rules.mjs`: that one phrase in that one file, with the reason, reviewed.
- **accounting** (stray catalog files, files that are neither UTF-8 text nor a known binary, third-party skills without a licence, external items without one, diagram links that no longer match their `.drawio`): fix the file, add the licence, or regenerate the link.
- **links** (relative links must resolve, with the exact case, inside the kit): fix the link or the file name.
- **cards** (every menu item, meaning every `shipped` and `link-only` item and every practice, has its hand-written adoption card `cards/<id>.md`, and every card belongs to a menu item): write the card, or remove the orphan.
- **lint** (releases only, or `node tools/export/lint-content.mjs` at any time): module pages carry their front matter and five headings in order; cards carry `id`, `module` and `checked` and the eight headings in order, none empty; skill folders match their names; START-HERE gives a block per operating system; and the kit skills, START-HERE, ADOPT and the cards use none of the words that talk a step down ("just", "simply", "easy", "obviously", "should work", "guaranteed", "great question").

A new hub skill stops the export as "unclassified": add it to the manifest as `catalog-only` until the owner decides. A hub item that is never exported and whose very name must stay out of the kit goes, as `kind:id`, into the gitignored `tools/export/private.local.txt` (format in `private.local.example.txt`); the export counts it as private and no committed file names it. A hub source a page may not list, because its name would say what the studio works on privately, goes into the same file as `source <kit page> <hub path>`: staleness and the release's clean-hub check follow it, and the page's own `sources:` leaves it out.

A studio pointer in a shipped copy whose rewrite would itself name what the studio works on privately (a product, a project, a data source) goes into the gitignored `tools/export/rewrites.local.json` instead of `STUDIO_REWRITES` (format in `rewrites.local.example.json`). Each entry also names a `gone` term: the build stops if that term is still in the file after the rewrites, and the export reports the entry by its number only. Put the same term on the deny list, so an export run without the file stops at the privacy gate.

The export needs four local files, all gitignored and never committed: `owner.local.txt` (the owner's first name), `privacy.local.txt` (the deny list), `private.local.txt` (hub items and sources no committed file may name) and `rewrites.local.json` (the studio-name rewrites). Each has an example beside it with invented entries. To export on another machine, copy all four there by hand. Without any one of them the export refuses to start and builds nothing, so a missing file can never ship what it protects; a file with no entries (`[]` for the rewrites) is a deliberate choice and runs. A `shipped` or `link-only` item, and every practice, also needs `importance` (core, recommended or optional) and a `why` of at most 140 characters, each either one value or one per profile (`{ "default", "data", "ml", "software" }`, the default required); a practice or an outside item needs `loads` (none, on-demand or every-session), and a practice its `files`. A practice whose files are not what loads, such as a hook's printed lines, states `everySessionTokens` itself. The export then writes `catalog/features.json` and `catalog/FEATURES.md` with each item's token estimate.

The adoption diagram is generated: edit the list in `tools/docs/adoption-sequence.mjs`, then run `node tools/docs/adoption-sequence.mjs docs`.

## Staleness

Every export lists the hand-written pages whose `sources:` changed in the hub since the last release, and the pages whose `checked:` date is more than 90 days old, `docs/facts.md` included. Re-check those facts against their sources, then update the date.

## Versioning

Semver. A new or changed item is a minor version. A removed item or a changed adoption protocol is a major version, because adopters' recorded decisions refer to them.

## History

This repository stays private. If the kit ever goes public, push the clean tree to a separate public repository; never flip this one, because its history holds every earlier version.
