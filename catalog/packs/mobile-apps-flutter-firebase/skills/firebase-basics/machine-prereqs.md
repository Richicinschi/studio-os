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

Run `npx -y firebase-tools@latest --version`. A version string means it works. Nothing needs a global install.

## 3. Signed in

Run `npx -y firebase-tools@latest login`. With no browser available (remote shell, container), use `login --no-localhost` and let the user paste the code back.

## 4. Agent skills and MCP server

Full Firebase support needs the Firebase skills and the Firebase MCP server inside your agent. The per-agent steps are in [agent-environments.md](agent-environments.md). Installing from outside the studio counts as adopting an outside skill or server: scan and vet it first.

## Gate

Do not move on to project work until all four pass. If a user asks to skip, explain that the later commands depend on them, and offer to do the missing one now.
