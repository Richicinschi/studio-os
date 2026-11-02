---
id: anthropic-document-skills
module: 09-data-work
checked: 2026-11-02
---

# Anthropic's document skills in claude.ai

## Why

- **The problem:** data work ends in a spreadsheet, a document, a deck or a PDF. When Claude cannot read or write those files, the numbers move between the chat and the file by hand, and every copy by hand is a place for a mistake.
- **The reason:** claude.ai has built-in skills that work with Excel, Word, PowerPoint and PDF files. They are switched on in settings; nothing is installed on your machine ([docs/facts.md](../docs/facts.md), "claude.ai: custom skills and the built-in document skills").
- **The cost of skipping it:** the kit has no story of its own here. Without them, Claude in claude.ai writes the content in the chat, and you build the file yourself.
- **The principle:** [fit, not copy](../PRINCIPLES.md#fit-not-copy). Use them where they are, built in, rather than copying their published source into your own skills: their licence does not make that source yours.

## Detect

Claude cannot see claude.ai settings from a terminal, so the audit asks you three things, and checks one thing on disk.

- **you:** your claude.ai plan: Free, Pro, Max, Ultra, Team or Enterprise.
- **you:** whether Settings > Capabilities shows "Code execution and file creation" turned on ("Create and edit files" in the newer layout).
- **you:** whether Customize > Skills shows the document skills switched on.
- Local copies of their source, folder names only, at project and user level: `U="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"; ls -d .claude/skills/docx .claude/skills/pdf .claude/skills/pptx .claude/skills/xlsx "$U"/skills/docx "$U"/skills/pdf "$U"/skills/pptx "$U"/skills/xlsx 2>/dev/null`. A folder found here is a copy someone made; Watch out says why that matters.

The menu marks the item **have** when code execution and the document skills are both on; **partly** when only one of the two is on, or on Team or Enterprise when you do not know your owners' policy; **not yet** when both are off or you do not know.

## Ask

1. **"Use the document skills in claude.ai?"** Recommended when your work is data.
   - Keep them on. Recommended when Detect says **have**.
   - Turn them on. Recommended when you work with Excel, Word, PowerPoint or PDF files in claude.ai and your company's rules allow those files there.
   - Leave them off: company files may not go into claude.ai, or you do not use these formats there. Recommended when your data rules in `adoption/spec.md` forbid uploads.
   - Not sure: the option recommended above for what Detect and your spec say: keep them on for **have**; turn them on when you work with these formats in claude.ai and your data rules allow those files there; otherwise leave them off.
   - Skip for now: leave it open; nothing is set, and it comes back in a later wave.
   - Default when skipped: no change.

## Needs

- A claude.ai account. Who switches them on depends on the plan ([docs/facts.md](../docs/facts.md), "claude.ai: custom skills and the built-in document skills"):
  - Free, Pro, Max and Ultra: you, in your settings;
  - Team: on for the organization by default;
  - Enterprise: the owners, in the organization's settings.
- "Code execution and file creation" turned on.
- Nothing to install on your machine. Whether these skills are built into Claude Code too is not documented in docs/facts.md as of 2026-11-02; this card covers claude.ai.

## Steps

1. **you:** (Free, Pro, Max, Ultra) in claude.ai, Settings > Capabilities, turn on "Code execution and file creation" ("Create and edit files" in the newer layout).
2. **you:** (Free, Pro, Max, Ultra) Customize > Skills, switch on the document skills.
3. **you:** (Team) they are on for your organization by default; if you do not see them, ask an owner. **you:** (Enterprise) owners set them in Organization settings > Plugins & skills > Policy; ask one.
4. **Claude:** records the decision, the scope (your claude.ai account, or your organization's policy), the licence (source-available under Anthropic's terms, not open source) and the undo in `adoption/decisions.md`. There is no scan: nothing is installed on your machine, and the source is published in `anthropics/skills` if you want to read it.

## Check

1. **you:** in a new claude.ai chat, ask "Make a one-page Word document with a two-row table of example numbers."
2. Expected: Claude creates a Word (`.docx`) file in the chat that you can open, with the table in it.

If no file appears, the item is not done: the plan row stays unticked. Look at the two settings in Steps 1 and 2 first; on Team or Enterprise, ask an owner.

## Undo

- **you:** Customize > Skills, switch the document skills off.
- **you:** turn off "Code execution and file creation" only if nothing else needs it: custom skills need it too ([docs/facts.md](../docs/facts.md)).
- **you:** (Team, Enterprise) the organization's setting is the owners' to change.
- **Claude:** adds the change to `adoption/decisions.md`.

## Watch out

- **Source-available, not open source.** The published source carries "© 2025 Anthropic, PBC. All rights reserved.", and its use is governed by your agreement with Anthropic, or by its Consumer or Commercial Terms of Service ([docs/facts.md](../docs/facts.md), "Licences of the external items"). Do not copy it into your own skills or repositories; if Detect found such a copy, ask whoever handles licences at your company.
- **An upload is a copy sent to claude.ai.** A company spreadsheet you attach leaves your machine; your company's data rules decide whether that is allowed, and on Team and Enterprise the owners control the setting.
- **Turning off code execution stops more than these.** Custom skills need it too, so switching it off for one reason switches them all off.
- **No built-in chart skill.** A `dataviz` skill is not documented as an Anthropic built-in, in claude.ai or in Claude Code; for a chart, ask for it in the chat ([module 09, Apply it in claude.ai](../modules/09-data-work/README.md#apply-it-in-claudeai)).
- **Two names for one switch.** Older settings pages call it "Code execution and file creation", newer ones "Create and edit files".
- **Context cost:** the kit counts them as loading on demand, only when a file task needs them; how claude.ai loads them, and what they add to a chat, is not documented in docs/facts.md as of 2026-11-02.
