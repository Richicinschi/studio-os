# CLI and emulators

Every command here runs as `npx firebase-tools@15.36.0 <command>`, never the bare `firebase` command; the pin is explained in [firebase-basics.md](../firebase-basics.md). Short forms such as `login:add` or `hosting:channel:list` take the same prefix.

## Accounts and projects

- `npx firebase-tools@15.36.0 login` (browser), `npx firebase-tools@15.36.0 login --no-localhost` (remote shell), `npx firebase-tools@15.36.0 login:ci` (token for CI), `npx firebase-tools@15.36.0 login:list`, `login:add`, `login:use <email>`, `npx firebase-tools@15.36.0 logout`.
- `npx firebase-tools@15.36.0 projects:list`, `projects:create <id>`, `npx firebase-tools@15.36.0 use` (show), `npx firebase-tools@15.36.0 use <id or alias>`, `npx firebase-tools@15.36.0 use --add` (new alias). Aliases live in `.firebaserc`, for example `default`, `staging`, `production`. `npx firebase-tools@15.36.0 open <service>` opens the console page.

## Init

`npx firebase-tools@15.36.0 init` asks which features in an interactive picker. It takes at most one feature name on the command line (`npx firebase-tools@15.36.0 init hosting`), never a list; names include firestore, functions, hosting, storage, emulators, database, remoteconfig. Run `npx firebase-tools@15.36.0 help init` for the current list. It is interactive, so an agent never runs it: print the command and ask the owner to run it.

## Deploy

`npx firebase-tools@15.36.0 deploy` sends everything configured. Narrow it with `--only` or `--except`:
`hosting`, `functions`, `functions:name`, `functions:a,b`, `firestore`, `firestore:rules`, `firestore:indexes`, `storage`.
Extra flags: `--dry-run`, `--message "text"`, and `--force` (bypasses the prompts and also deletes deployed functions that are missing from the local code; only when the owner says so). `fbtool.sh deploy --force` is not this flag: it skips fbtool's own question and is never passed to the Firebase CLI.

## Emulators

- Start: `npx firebase-tools@15.36.0 emulators:start [--only functions,firestore] [--project id]`.
- Keep data: `--import=./data` on the way in and `--export-on-exit=./data` on the way out. `npx firebase-tools@15.36.0 emulators:export ./backup` snapshots a running suite.
- Debug functions: `--inspect-functions` (inspector on 9229).
- Test run: `npx firebase-tools@15.36.0 emulators:exec "npm test"` starts, runs, shuts down.
- Ports: Auth 9099, Functions 5001, Firestore 8080, Realtime Database 9000, Hosting 5000, Pub/Sub 8085, Storage 9199, UI 4000.
- Use a project id starting with `demo-` for tests that must never reach a real project.

## Functions commands

`npx firebase-tools@15.36.0 functions:log [--only name] [-n 100]`, `functions:list`, `functions:delete <name> [--region r]`.
Secrets: `functions:secrets:set NAME`, `get NAME` (metadata), `access NAME` (prints the value, so avoid it in shared terminals), `destroy NAME`, `prune` (removes unused ones). There is no list subcommand; list names with `gcloud secrets list --project <id>`.
The old config store (`functions:config:set/get/unset`) is deprecated and slated for removal; use secrets and params, and move existing values with `functions:config:export`.

## Firestore commands

`npx firebase-tools@15.36.0 firestore:indexes` prints the live indexes; redirect to a file to keep them. `npx firebase-tools@15.36.0 firestore:delete <path> [--recursive] [--force]` deletes data for good: confirm with the owner first.

## Hosting commands

`hosting:channel:create|deploy|list|delete`, `hosting:clone` (there is no rollback command; see Hosting and GCP), `hosting:disable` (takes the site offline), `hosting:sites:list|create|delete`, `target:apply hosting <target> <site>`.

## Global flags

`--project <id>`, `--config <file>`, `--debug`, `--json` (for scripts), `--non-interactive` (CI), `--token <t>` (marked deprecated by the CLI; check the vendor's documentation for the supported CI sign-in).
