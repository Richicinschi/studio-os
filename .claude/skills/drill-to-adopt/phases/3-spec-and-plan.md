## Phase 3: Spec and plan

**Restate, then write the spec.** Restate in plain words: their work in their words; what they will
adopt and how; what they will skip and why; the gaps and their routes; the data rules you will
respect; the every-session total. Phrase nothing in the restatement as a question; end it with the
one question "May I write this as your spec?", with options. On their yes, write
`adoption/spec.md` in **their** setup from `templates/adoption/spec.md`, fill every section, the Gaps
included, and tell them the full path. Nothing goes into the kit repo.

**Then the plan,** from `templates/adoption/plan.md`: **one row per item**, never two in one row; an
item folded into another keeps its own row and says where it went. In waves; nothing needs a plugin.

**Wave 1 is the first sitting: at most about 8 rows.** Every other item they chose goes under "Later
waves" with a one-line why; nothing is dropped. Say it plainly: "Your plan has N items. Today we do
these 8 and see them work; 'next wave' picks up the rest." They may move an item up. Wave 1, in order:

- Row 1 is always `skillspector`, the scanner with the scan-first rule, so it arrives right before the
  first thing it checks.
- When the spec keeps `adoption/` out of git and phase 2 wrote no line (they said Not sure), the
  exclude line comes next, as phase 2 describes it, on their yes.
- In an **empty** folder, or a new setup folder the spec chose, row 2 is `setup-workspace` in create
  mode: the whole template tree, every file from `templates/`. No earlier row writes a front door, a
  `CLAUDE.md` or `handoffs/`; the scanner's rule line goes into the front door this row creates.
  `git init` is its own question, after the tree exists.
- When anything installed is scanned no or unknown: "scan what you already have", read-only, each
  result recorded; a real finding becomes a question to them, never an automatic removal.
- Then `handoff`, in the size they chose.
- With **existing work**, when they said yes to reorganizing or to a move in round 1:
  `setup-workspace` in restructure mode.
- Then the front door and memory, and the items that answer their named problem, the heaviest last.
- Each row's steps only they can do come from the card's **you:** lines, its check from the card's
  Check.

Show them the plan and ask for an explicit yes. After wave 1 has passed Verify, "next wave" (or update
mode) takes the next few items from Later waves the same way: their Round 2 first, then their rows.
