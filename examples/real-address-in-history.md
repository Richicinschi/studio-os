---
title: A real address in history
studio_sources:
  - .studio/memory/feedback_no_network_info_in_commits.md
---

# A real address in history

## What happened

A comment in a configuration file of one of the studio's repositories carried two real network addresses. A later commit removed the comment from the files. The addresses stayed in history: 51 commits still carried them.

When the repository was to go up to the git host, the only way to keep them out was to rewrite its whole history. The studio's ruling was short: "Never commit such information."

## What it cost, or would have

Deleting a line removes it from the current files, not from the commits that came before. Pushing the repository as it was would have published both addresses. Keeping them out took a rewrite of every commit, which changes every hash, and a history rewrite waits for an explicit yes in the studio.

## The rule it produced

Never write real network details into a committed file: a home or public address, a VPN exit, local network addresses, the router or network layout, machine host names. That covers code, config comments, notes, logs, saved web pages and commit messages. Describe the fact instead: "the direct connection reaches the server; the VPN exit is refused." A tool that records which machine ran something writes a label, never a host name.

Two checks came with it:

- Before the first push of any repository, search its full history, every commit, for address-shaped strings and for secrets.
- Saved copies of web pages can carry the address of whoever fetched them, because some pages print the visitor's address into their own script. Scan saved pages and PDFs before you commit them.

On 2026-11-02 the rule was narrowed. The harm is a real address reaching a remote, and a made-up address in a test is not one. The commit check now skips test files by their path (test folders, fixtures, `*.test.*`, `*.spec.*` and the like) and still checks docs, plans, memory and config. An example address there uses the ranges reserved for documentation.

## How to apply it

- The pre-commit hook in [templates/git-hooks](../templates/git-hooks/README.md) refuses a private network address outside test files, and runs gitleaks for secrets when it is installed. It does not catch a public address, so the full-history search before a first push still matters.
- Write connectivity findings as sentences, with no address in them.
- If an address already sits in history, deleting the line is not enough. Rewriting history is your decision, not Claude's: put it on your "ask me first" list in [templates/identity/RELATIONSHIP.md](../templates/identity/RELATIONSHIP.md).
- Your company may have its own rule for network details in code. Where it is stricter, it wins.
