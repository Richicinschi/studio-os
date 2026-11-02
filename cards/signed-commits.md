---
id: signed-commits
module: 06-git-and-guardrails
checked: 2026-11-02
---

# Signed commits

## Why

- **The problem:** git takes a commit's name and email from whatever is configured, so anyone can make a commit that claims to be yours. A signature is the part that proves it.
- **The reason:** a server that knows your public key shows your signed commits as verified, and some companies require it before a merge.
- **The cost of skipping it:** your commits carry no proof of where they came from. If your company requires signing, an unsigned commit is refused at review. The facts, and how the server checks them, are in [docs/facts.md](../docs/facts.md), "Git: signed commits and identity per folder".
- **The principle:** [one task, one branch, one PR, full history](../PRINCIPLES.md#one-task-one-branch-one-pr-full-history). A full history is worth more when each commit in it can be traced to the person who made it.

## Detect

Read-only. These commands print settings as set or not set, versions and counts. They never print a key ID, a fingerprint or a file name, and they use no network.

- Signing settings, for your user and for each repository in `adoption/inventory.md`:
  - `git config --global --get commit.gpgsign` and `git config --global --get gpg.format`;
  - `git config --global --get user.signingkey >/dev/null && echo set || echo "not set"`;
  - the same three inside each repository with `git -C <repo> config --local ...`.
- Whether a company repository overrides any of them locally: `git -C <repo> config --local --name-only --get-regexp '^(commit\.gpgsign|gpg\.format|user\.signingkey)$'`. `--name-only` is not in docs/facts.md as of 2026-11-02, so Claude first checks in `git help config` that it prints names without values.
- Versions: `git --version`, `ssh -V`, and `gpg --version | head -1` (it may not be installed).
- How many keys exist, counts only:
  - GPG secret keys: `gpg --list-secret-keys --with-colons 2>/dev/null | grep -c '^sec'`;
  - SSH public keys: `ls "$HOME"/.ssh/*.pub 2>/dev/null | wc -l`.

The menu marks the item **have** when `commit.gpgsign` is `true` and a signing key is set, **partly** when a key exists but signing is off, and **not yet** otherwise.

## Ask

1. **"Sign your commits?"** Recommended when your work is software, ML or data.
   - Keep what you have. Recommended when Detect says **have**.
   - SSH signing, with the SSH key you already push with, or a new one. Recommended when there is at least one SSH key and no GPG key, or no key of either kind.
   - GPG. Recommended when your company requires GPG, or when a GPG key already exists.
   - No.
   - Not sure: the option recommended above for what Detect found: keep what you have at **have**; GPG when your company requires it or a GPG key exists; SSH otherwise.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.
2. **"Where?"** (only when the answer above was SSH or GPG)
   - Every repository on this machine (your user's settings).
   - Your own setup only, set inside that repository. Recommended when your company says nothing about signing.
   - Company repositories too. Recommended only when your company asks for it.
   - Not sure: the option recommended above: your own setup only, or company repositories too when your company asks for signing. You can widen it later.
   - Default when skipped: your own setup only.

## Needs

- Git 2.34 or later for SSH signing (`git --version`); GPG signing needs GnuPG.
- GnuPG, if you choose GPG:
  - Windows: Git for Windows carries one; or install Gpg4win;
  - macOS: `! brew install gnupg`;
  - Debian or Ubuntu: `! sudo apt install gnupg`.
- An account on your git server where the public key goes: GitHub, or your company's own server.
- The `gh` command line, if you want to upload the key from the terminal; the server's settings page works too.

## Steps

1. **you:** create a key, if Detect found none of the kind you chose, in a separate terminal, not with `!`: these commands wait for a passphrase that only you can type, and whether a `!` command can take typed input is not documented ([docs/facts.md](../docs/facts.md), "Claude Code: the ! prefix, /init and local files"). The commands are GitHub's ([docs/facts.md](../docs/facts.md), "Git: signed commits and identity per folder"):
   - SSH: `ssh-keygen -t ed25519 -C "<your email>"`;
   - GPG: `gpg --full-generate-key` (GnuPG 2.1.17 or later).
2. **you:** tell Claude which key to use. For SSH, type the path of the public key file (the one ending in `.pub`); for GPG, the key ID. Claude never lists your key folders to find it.
3. **Claude:** on your yes, sets three values in the scope you chose (`git config --global ...` for every repository, `git -C <repo> config ...` for one):
   - SSH: `gpg.format ssh`, `user.signingkey <path to the .pub file>`, `commit.gpgsign true`;
   - GPG: `user.signingkey <key ID>`, `commit.gpgsign true`.
   Claude shows the commands before it runs them. They are the ones GitHub and git's own reference give ([docs/facts.md](../docs/facts.md), "Git: signed commits and identity per folder").
4. **you:** upload the public key to your server as a **signing** key:
   - SSH on GitHub: `! gh ssh-key add <path to the .pub file> --type signing`, or Settings, then "SSH and GPG keys", choosing the type "Signing key". A key you already push with must be added again as a signing key;
   - GPG on GitHub: Settings, then "SSH and GPG keys", "New GPG key", pasting the output of `gpg --armor --export <key ID>`;
   - a company server: its own settings page; ask your administrator if you cannot find it.
5. **Claude:** for SSH, writes one line to an allowed-signers file so your own machine can check signatures: your email, `namespaces="git"`, then the public key, so the key is accepted for git signatures only ([docs/facts.md](../docs/facts.md), "Git: signed commits and identity per folder"). The file can live outside any repository: in your setup folder, or in a file of your choice for every repository, such as `~/.config/git/allowed_signers`. `gpg.ssh.allowedSignersFile` points at it, in the same scope as step 3.
6. **Claude:** records the scope, the key type and the undo in `adoption/decisions.md`. It never records the key ID or the key itself.

## Check

1. **Claude:** in a throwaway repository in a temporary folder, with the same settings in place (inherited from your user's settings, or set inside it for "own setup only"), makes an empty commit: `git commit --allow-empty -m "signing check"`, then runs `git log --show-signature -1`. Expected:
   - SSH: a line `Good "git" signature for <your email> with ED25519 key SHA256:...`;
   - GPG: a line `gpg: Good signature from "<your name> <your email>"`.
   Then it deletes the throwaway folder.
2. **you:** after your next push to your own server, the commit shows as **Verified** there.

If step 1 prints `No signature` or an error, the item is not done: the plan row stays unticked, and the message is the next thing to look at.

## Undo

- **Claude:** removes the values in the same scope: `git config [--global] --unset commit.gpgsign`, then the same for `gpg.format`, `user.signingkey` and `gpg.ssh.allowedSignersFile`. (Newer git also accepts `git config unset <key>`.)
- **Claude:** deletes the line it added to the allowed-signers file.
- **you:** remove the key from your server: `! gh ssh-key delete <id>` (or `gh gpg-key delete`), or the "SSH and GPG keys" settings page.
- Your key itself stays on your machine; deleting it is your own decision.

## Watch out

- **A passphrase prompt stops an agent.** Claude cannot type your passphrase, so whether a long session can sign depends on how long your agent remembers it. For GnuPG that is `default-cache-ttl` and `max-cache-ttl` in `gpg-agent.conf`, 600 and 7,200 seconds by default ([docs/facts.md](../docs/facts.md)); raise both if a working day should sign after one prompt.
- **Windows can have two GnuPG installs.** Git for Windows carries its own GnuPG, and Gpg4win installs another ([docs/facts.md](../docs/facts.md)). With both on the machine, check which one git calls before you change an agent setting, and run Check step 1 from each terminal you use.
- **An unattended job cannot sign.** No one is there to type the passphrase. The studio exempts its one scheduled runner from signing and limits what it commits: in the studio's own repository, only a narrow set of folders, pushed straight to the main branch; in other repositories, only its own night branches, which land through a reviewed PR.
- **A personal key in a company repository** can break your company's policy. Ask before you sign there, and use the identity your company expects ([one git identity per folder](git-identity-per-folder.md)).
- **Never commit a key.** The private key stays on your machine; only the public half goes to the server.
- **SSH keys and email:** GitHub matches a GPG key to your verified email; whether an SSH signing key must match the commit email is not documented as of 2026-11-02.
