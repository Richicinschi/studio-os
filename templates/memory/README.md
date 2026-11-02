# Memory format

One fact per file. A fact earns a file only when it passes all four tests:
1. It is non-obvious: a fresh session could not work it out from the files.
2. It will still be true next month.
3. It changes what a later session does.
4. It carries its reason.

```markdown
---
name: short-kebab-slug
description: one line that tells a session whether to open this file
metadata:
  type: user | feedback | project | reference
  written: 2026-11-02T10:00:00Z
---

The fact.

**Why:** the reason or the incident behind it.
**How to apply:** what a session does differently because of it.
```

Types:
- `user`: who you are and what you prefer.
- `feedback`: how Claude should work, both corrections and approaches you confirmed.
- `project`: the state and decisions of ongoing work, always with absolute dates.
- `reference`: where things are (dashboards, docs, tickets).

Update an existing file rather than writing a near-duplicate. Correcting a memory that turned out wrong is worth more than adding one.
