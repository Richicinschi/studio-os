# Machine prerequisites

Every item below must pass before any other Firebase task. If one fails, fix it, re-check, and only then continue.

## 1. Node.js 20 or newer

Run `node --version`. If Node is missing or below 20, install it. Whenever the user must do something by hand, tell them exactly what, then stop and wait for their reply.

Preferred: a version manager, because global packages then install without permission trouble.

- macOS or Linux: ask the user to install nvm. Once they confirm, load it into the current shell by sourcing the profile files (`~/.bash_profile` and `~/.bashrc` for Bash, `~/.zprofile` and `~/.zshrc` for Zsh). Then run `nvm install 24` and `nvm use 24`.
- Windows: ask the user to install nvm-windows and a Node version through it. After they confirm, run `node --version` again.

Fallback: the LTS installer from the official Node download page. Ask the user to run it and tell you when done.

Studio note: on the studio machines, Vite and Astro projects run on Node 22 LTS through nvm-windows, because Node 25 broke Vite CSS. The Firebase CLI itself is fine on 20 or newer, so do not switch versions just for it.

## 2. Firebase CLI reachable

Run `npx firebase-tools@15.36.0 --version`. A version string means it works. Nothing needs a global install. Why the version is pinned, and how to move it, is in [firebase-basics.md](../firebase-basics.md).

## 3. Signed in

Run `npx firebase-tools@15.36.0 login`. With no browser available (remote shell, container), use `login --no-localhost` and let the user paste the code back.

## 4. Agent skills and MCP server (recommended)

The Firebase plugin (or the Firebase skills) and the Firebase MCP server inside your agent are recommended, not required. Together they give full Firebase support: the MCP server adds the Firebase documentation search and reads remote data such as Crashlytics reports and Data Connect queries. The per-agent steps are in [agent-environments.md](agent-environments.md). Installing from outside the studio counts as adopting an outside skill or server: scan and vet it first, and ask the person before installing.

## Gate

Do not move on to project work until items 1 to 3 pass. If a user asks to skip one of them, explain that the later commands depend on it, and offer to do the missing one now. Item 4 is recommended, not required: offer it, and if the person declines, carry on with the CLI and tell them which later steps need it. No command in this pack needs the plugin or the outside skills. The MCP server is used in `firebase-basics` step 4 (searching the Firebase docs; without it, use the docs on the web) and for reading remote data from the agent: Crashlytics reports in `firebase-crashlytics` steps 1 and 4, and Data Connect queries. Without it, the person reads that data in the Firebase console.
