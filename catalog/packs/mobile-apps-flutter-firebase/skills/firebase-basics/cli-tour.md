# Initializing and exploring the CLI

## Initializing a folder

1. Look for `firebase.json` in the folder. If it is there, the folder is already a Firebase project directory and you can skip the rest.
2. Go to the root of the codebase. Only for a project that has no code yet, make a new directory first and enter it.
3. Run `npx -y firebase-tools@latest init`.

The command walks through three things: which features to set up (Firestore, Functions, Hosting and so on), which project to attach (an existing one or a new one), and then it writes the config files, mainly `firebase.json` and `.firebaserc`. Read what it generated before committing it.

If the developer has not yet chosen a project, ask first (see step 3 of the skill) so the prompt inside `init` has an answer ready.

## Finding commands without guessing

The CLI describes itself, so use that rather than memory.

```bash
npx -y firebase-tools@latest --help
npx -y firebase-tools@latest hosting:channel:deploy --help
npx -y firebase-tools@latest functions:log --help
```

The first lists every command grouped by area. The others show flags and examples for one command. When a command you remember is rejected, run its `--help` before trying variants, since flags change between releases.
