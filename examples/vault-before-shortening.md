---
title: Vault before you shorten
studio_sources:
  - .studio/memory/feedback_memory_vault.md
---

# Vault before you shorten

## What happened

The studio keeps its memory as one file per fact, plus an index with one line per file that every session loads at start. The loader reads only so much of that index ([docs/facts.md](../docs/facts.md), "Claude Code: where skills, agents and instruction files load from"), and a hook warns when the index nears the limit. The same pressure comes for every store that grows: a single long memory file, the front-door instruction file, the wiki.

The quick way to make room is to trim: shorten the lines, summarize old entries, delete the ones that look finished. The studio ruled that out, and said so more than once: "nothing gets lost and everything needs to be saved somewhere and tagged so that we can find it easily."

## What it cost, or would have

Shortening throws away the exact context a later session needs, and the whole point of a memory system is durable recall.

## The rule it produced

Memory is never freed by loss. When a store nears its limit:

- **The index:** move whole entries, word for word, into a vault file, grouped and tagged by project and by status (closed, parked, historical). Keep the memory file itself. Leave one pointer line to the vault in the index. When an entry becomes active again, restore it to the index.
- **One entry that is too long:** move its full detail to the vault, or to its own file, and leave a short pointer. Moving with a pointer is vaulting, and allowed. Cutting words is lossy shortening, and banned.
- **The front-door file:** archive old dated handoff entries to an archive page instead of deleting them.
- **Any future store:** the same rule.

The test after freeing space: can you still open and read the full original somewhere, found by a tag or a link? If not, it was lost. Undo it and vault it instead.

## How to apply it

- Start from [templates/memory](../templates/memory/README.md). The index template carries the rule in a comment, and `templates/memory/vault/MEMORY-VAULT.md` is the vault: entries kept word for word, newest at the bottom, each group under a dated heading that says why it moved.
- Tags are what make a vault usable. Pick a few you will search for later, such as the project and the status, and use them every time.
- For the front door, the same rule holds: archive old handoff entries to a file of your own instead of deleting them.
- In claude.ai: keep a vault document in the Project's knowledge, and copy text into it before you cut that text from the Project's instructions.
