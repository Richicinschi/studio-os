# CLI and emulators

## Accounts and projects

- `firebase login` (browser), `firebase login --no-localhost` (remote shell), `firebase login:ci` (token for CI), `firebase login:list`, `login:add`, `login:use <email>`, `firebase logout`.
- `firebase projects:list`, `projects:create <id>`, `firebase use` (show), `firebase use <id or alias>`, `firebase use --add` (new alias). Aliases live in `.firebaserc`, for example `default`, `staging`, `production`. `firebase open <service>` opens the console page.

## Init

`firebase init` asks which features in an interactive picker. It takes at most one feature name on the command line (`firebase init hosting`), never a list; names include firestore, functions, hosting, storage, emulators, database, remoteconfig. Run `firebase help init` for the current list. It is interactive, so an agent never runs it: print the command and ask the owner to run it.

## Deploy

`firebase deploy` sends everything configured. Narrow it with `--only` or `--except`:
`hosting`, `functions`, `functions:name`, `functions:a,b`, `firestore`, `firestore:rules`, `firestore:indexes`, `storage`.
Extra flags: `--dry-run`, `--message "text"`, and `--force` (bypasses the prompts and also deletes deployed functions that are missing from the local code; only when the owner says so).

## Emulators

- Start: `firebase emulators:start [--only functions,firestore] [--project id]`.
- Keep data: `--import=./data` on the way in and `--export-on-exit=./data` on the way out. `firebase emulators:export ./backup` snapshots a running suite.
- Debug functions: `--inspect-functions` (inspector on 9229).
- Test run: `firebase emulators:exec "npm test"` starts, runs, shuts down.
- Ports: Auth 9099, Functions 5001, Firestore 8080, Realtime Database 9000, Hosting 5000, Pub/Sub 8085, Storage 9199, UI 4000.
- Use a project id starting with `demo-` for tests that must never reach a real project.

## Functions commands

`firebase functions:log [--only name] [-n 100]`, `functions:list`, `functions:delete <name> [--region r]`.
Secrets: `functions:secrets:set NAME`, `get NAME` (metadata), `access NAME` (prints the value, so avoid it in shared terminals), `destroy NAME`, `prune` (removes unused ones). There is no list subcommand; list names with `gcloud secrets list --project <id>`.
The old config store (`functions:config:set/get/unset`) is deprecated and slated for removal; use secrets and params, and move existing values with `functions:config:export`.

## Firestore commands

`firebase firestore:indexes` prints the live indexes; redirect to a file to keep them. `firebase firestore:delete <path> [--recursive] [--force]` deletes data for good: confirm with the owner first.

## Hosting commands

`hosting:channel:create|deploy|list|delete`, `hosting:clone` (there is no rollback command; see Hosting and GCP), `hosting:disable` (takes the site offline), `hosting:sites:list|create|delete`, `target:apply hosting <target> <site>`.

## Global flags

`--project <id>`, `--config <file>`, `--debug`, `--json` (for scripts), `--non-interactive` (CI), `--token <t>` (marked deprecated by the CLI; check the vendor's documentation for the supported CI sign-in).
