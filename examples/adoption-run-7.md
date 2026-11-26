# One adoption, turn by turn: trial run 7

This is one whole adoption, as it ran on 2026-11-09: every question the drill asked, every answer, the fresh sessions that tested it, and the files it left in the setup folder. It is [trial run 7](../docs/trials.md#runs-7-to-9-domains-2026-11-09), published as it happened.

**What it is, and what it is not.**

- **A scripted persona, not a person.** An agent, a separate Claude Code session running the trial, played a weekly podcaster who cuts short clips for social media. It read each reply and answered from a short brief, picking the recommended option ("1") most of the time. It also ran the copy lines the drill handed over and started the fresh sessions. Nothing in it is anyone's real work, and its answers came faster and surer than a person's would.
- **One model.** Claude Sonnet 5.5, in Claude Code 2.1.319, run headless: one `claude -p` call per turn, each resuming the session, with the kit's project settings only.
- **One date.** The kit as built on the afternoon of 2026-11-09, before the v3.0.0 release of that evening. The drill has changed since, in its words and in what it reads: [CHANGELOG.md](../CHANGELOG.md) says how. Read this as a picture of the flow, not as the current text.
- **Left out:**
  - the tools Claude ran and what they printed, and the short notes Claude wrote between them, which `claude -p` does not return. The line in italics under each reply, from the trial's log, gives the number of steps Claude Code reported for it and the seconds it took. Below it are the files Claude wrote in that turn, and the writes Claude Code refused.
  - the files under `.claude/`. In this headless run Claude Code refused writes there, so the drill handed over a copy line for each, and the agent running the trial ran them. They were the domain's 18 files and the media-critic agent, byte for byte the kit's copies of that day, and the handoff skill, the drill's staged copy, shown below as `adoption/staged/handoff-SKILL.md`.
  - a short test recording the persona supplied.
- **Shortened:** paths: `<setup>` is the adopter's setup folder, `<kit>` the kit's folder, `<trial>` the throwaway folder that held both. The run also wrote the name of the account it ran under into the spec's header, which reads `<name>` here.

How it went, as [docs/trials.md](../docs/trials.md#runs-7-to-9-domains-2026-11-09) judged it: it reached the handover in 34 turns; the domain was scanned before anything was copied; and the three fresh sessions answered from the adopter's own files.

## The conversation

"Adopter" is the persona; "Drill" is Claude, running `drill-to-adopt`.

### Turn 1

**Adopter:** Start the adoption. My setup folder is <setup> (empty, not a git repository yet). I only use Claude Code on this computer. Please go ahead and ask your questions one at a time.

**Drill:** Your setup folder is empty and has no `adoption/` folder yet, so this is a first run. I'll start at phase 1 of 5, Audit.

**May I look around your setup folder before I ask anything?** It's read-only. I'd list file types, project files such as `package.json`, any existing Claude files, and git remotes. I never open secrets or data files.

Your folder is empty, so there's little to find. The look is quick and I'd record that in `adoption/inventory.md`.

1. **Yes (Recommended).** I run the quick read-only look, and the menu can then show what you already have.
2. **No.** I skip the audit and ask about your work open-ended. The menu then shows no have/partly marks.
3. **Only one subfolder.** Tell me which one.

_(6 tool turns, 15 s)_

### Turn 2

**Adopter:** 1

**Drill:** The audit is done. I saved it at `setup/adoption/inventory.md`. Here is what it found.

- **Your setup folder:** empty. It has no files, no git repository and no Claude files.
- **Installed on this machine:** SkillSpector v2.2.3 (the kit's safety scanner) and git 2.54. The scanner's rule line isn't in any front door yet, so the kit's scanner item counts as "partly" there.
- **Not checked:** your user-level `~/.claude` folder, because this session can only read the kit and the setup folder. Any skills, agents or plugins you keep there show as unknown, not "none". Typing `/context` in Claude Code shows the live breakdown.
- **Loaded into every session today:** about 0 tokens from the setup folder (an estimate). Tokens are roughly pieces of words. Claude reads your instruction files and skill list before your first message, and that uses part of the room it has for your work.

Phase 2 of 5, Decide. About 15 minutes left in this sitting (an estimate). You can stop any time and I'll pick up from `adoption/`.

**What is your work, and what should Claude help you with?** Tell me in your own words. The folder is empty, so I have nothing to suggest yet.

_(14 tool turns, 57 s)_

*Files Claude wrote in this turn: `<setup>/adoption/inventory.md`.*

### Turn 3

**Adopter:** I run a small weekly podcast and make short video clips for social media from my recordings. I want Claude to help me cut out silences and ums, make transcripts and subtitles, and get clips ready to post.

**Drill:** Got it: a weekly podcast, plus short social clips cut from your recordings. You want help removing silences and ums, making transcripts and subtitles, and getting clips ready to post.

From what I've seen, here is how I read your setup:
- **Kind of work:** general. You have no code or data-science files, so none of the kit's data, ML or software profiles apply. The media work is something I'll check against the kit's packs later.
- **Operating system:** Windows.
- **Tools:** Claude Code only, plus git and the SkillSpector scanner already on this machine.

**Is that right?**

1. **Yes (Recommended).** I record it as is.
2. **Some is wrong.** Tell me which part, in your own words.
3. **Not sure.** I take option 1 and you can correct it later.

_(1 tool turns, 10 s)_

### Turn 4

**Adopter:** 1

**Drill:** Acknowledged: general work, on Windows, with Claude Code only.

Now your data rules. They come before any question about where things are stored. There are three, one at a time.

**What may leave this computer?** For example, a raw recording with a guest's voice in it, or a draft transcript sent to an outside website or service.

1. **Nothing leaves until you say so (Recommended).** This is the strictest reading, so it protects you and your guests most. Raw recordings, drafts and transcripts stay on this machine.
2. **Only finished, published material may leave.** Posted episodes and clips are fine. Raw recordings and drafts stay local.
3. **Anything may go to outside tools** when it helps the work.
4. **Not sure.** I take option 1 and write "strictest reading assumed" in your spec.

_(1 tool turns, 11 s)_

### Turn 5

**Adopter:** Nothing sensitive: it is my own public podcast. The Claude account is my personal one. A repository here may have a remote on GitHub, private.

**Drill:** Recorded your data rules:
- **What may leave:** nothing here is sensitive, because it's your own public podcast.
- **Account:** your personal Claude account may see this work.
- **Remote:** a repository here may have a remote on GitHub, as a private one.

**Which Claude plan is your personal account on?** Type `/status` in Claude Code to see it. I can't read it from here.

1. **Pro.** An individual paid plan, and it includes Claude Code.
2. **Max or Ultra.**
3. **Free.**
4. **Not sure.** I note "plan unknown". It changes nothing in the choices so far, and you can check with `/status` later.

_(3 tool turns, 22 s)_

### Turn 6

**Adopter:** 2

**Drill:** Recorded: Max or Ultra plan, Claude Code only.

**What goes wrong today between sessions or chats?** For example, Claude forgetting how you like clips cut or subtitles styled, decisions you have to repeat, or where you left off on an episode. Tell me in your own words.

_(1 tool turns, 3 s)_

### Turn 7

**Adopter:** Every new session forgets my clip style and which episode I was on, and I repeat the same instructions about subtitles.

**Drill:** Recorded: each new session forgets your clip style and which episode you were on, and you repeat the same subtitle instructions. The first things I'll propose will answer exactly that.

**Do you have anything else I should know about?** I mean saved prompts, notes about your clip style, claude.ai Projects, or folders with episodes or scripts. Give me a folder path and I'll read what's in it. I won't open recordings or other data files. Tell me in your own words, or say "nothing else".

_(1 tool turns, 4 s)_

### Turn 8

**Adopter:** No, nothing else: no projects or notes elsewhere.

**Drill:** Recorded: nothing else exists, so you start fresh and the layout questions don't apply. Here is the menu in two levels. The first level is the modules, one line each, with what each would add to every session if you took all of it. Those figures are estimates.

1. **Continuity** fixes sessions that start from zero. Mostly recommended for you. About 737 tokens if you took it all. **Proposed:** the front-door file, memory with its index, and handoff notes.
2. **Context and models** keeps long threads light. Recommended. About 89 tokens.
3. **Planning** turns an idea into approved small tasks. Partly recommended. About 279 tokens.
4. **Delegation** runs independent work in parallel. Optional. About 198 tokens.
5. **Skills** has the safety scanner, SkillSpector, and a guide to writing your own skills. The scanner is core. About 140 tokens. **Proposed:** the scanner.
6. **Git and guardrails** protects history and blocks risky git commands. Two items are recommended and the rest are optional for you. About 497 tokens.
7. **Identity and contract** puts who you are, what needs your OK and how you want things written in short pages. Partly recommended. About 303 tokens. **Proposed:** a style page for your clip and subtitle habits.
8. **Agents and the council** has code reviewers and a researcher. Optional. About 249 tokens.
9. **Data work** is for traceable numbers, bug hunting and diagrams. Optional. About 269 tokens.
10. **Tools and MCP servers** keeps connected tools to the least access. Optional. No tokens.
11. **Workspace layout** has project instructions for claude.ai and a project index. You don't use claude.ai, so I'd leave it out. About 194 tokens.
12. **Experiments and evaluation** is for ML and data experiments. Optional, and it doesn't fit your work. About 397 tokens.

Domains come as a separate question right after this one. The audio and video pack is the one that fits your recordings.

The proposed set answers "forgets my clip style and which episode I was on". It is the scanner, handoff, the front door, memory and the style page. Everything else stays unticked.

**Which menu answer do you want?**

1. **As proposed (Recommended).** You get the five items above.
2. **Open a module.** Give me its number to see its items and change them.
3. **Also one item.** Name it in plain words, for example "also the git guardrails".
4. **Not sure.** I take it as proposed.

_(3 tool turns, 22 s)_

### Turn 9

**Adopter:** 1

**Drill:** Recorded: the menu is as proposed. The five items are the scanner, handoff, the front door, memory and the style page. I'll ask about the sizes of the ones that have sizes, one at a time. Token figures are estimates, and they're what each size loads before your first message.

**What size should memory be?**

1. **Light (Recommended).** One notes file, `NOTES.md`, with a line per fact, its reason and the date. About 51 tokens to start, and each fact you add loads in full. It's the smallest size that stops you repeating facts, such as your clip style. You can grow it later.
2. **Standard.** An index plus one file per fact. About 55 tokens to start, and about 33 tokens (estimate) for each fact. A fact's file opens only when its line matches the task. This fits better once the facts no longer fit one short file.
3. **Full.** Standard plus a vault that keeps the full text of any line before it is shortened. About 55 tokens.
4. **Not sure.** I take light.
5. **Skip for now.** Nothing is set and the question comes back in a later wave.

_(2 tool turns, 9 s)_

### Turn 10

**Adopter:** 1

**Drill:** Recorded: memory at the light size, one `NOTES.md` file, about 51 tokens to start (estimate).

**What size should the style page be?** This is where your clip style and subtitle habits would live.

1. **Light (Recommended).** Five lines: tone, length, formatting, words to avoid and how to report a result, each in a short phrase. About 89 tokens (estimate). You named one or two habits, and this is the smallest size that holds them.
2. **Standard.** A short page that also covers how to open an answer, when a table fits, how mistakes are owned and the shape of a report. About 298 tokens (estimate). It fits better when you have several habits or others read what Claude writes.
3. **Full.** Standard plus a header and a closing note. About 405 tokens (estimate). It's meant for one file shared across several setups.
4. **Not sure.** I take light, and I'll offer to grow it after a week.
5. **Skip for now.** Nothing is set and the question comes back in a later wave.

_(1 tool turns, 4 s)_

### Turn 11

**Adopter:** 1

**Drill:** Recorded: the style page at the light size, about 89 tokens (estimate). Handoff and the front door have no size choice.

Now the domain question. A domain is a pack of skills for one kind of job, installed together. Only one fits what you told me, **Audio, video and media**.

It has thirteen short, tested procedures. They include cutting a spoken recording, transcribing, subtitling, clipping into shorts and getting media ready to post. It also has a reviewer agent that checks a render from extracted frames and measured readings. The pack costs about 69 tokens in every session (estimate). Its index of about 1,100 tokens loads only when a media task comes up, and each skill loads only when it's used.

**Do you want this pack?**

1. **Yes, take the audio and video pack (Recommended).** It matches your silences, ums, transcripts, subtitles and clips. It's scanned with SkillSpector before anything is installed.
2. **None of these fit.** Nothing is installed, and I record "no domain".
3. **Not sure.** I take none for now, and update mode offers it again.

_(1 tool turns, 5 s)_

### Turn 12

**Adopter:** 1

**Drill:** Recorded: you take the audio and video pack, about 69 tokens every session (estimate).

**Where should the pack live?**

1. **This project only (Recommended).** It installs into your setup folder, and Claude Code uses it when you start there. All your podcast work is in one place, so this is the smallest choice.
2. **Every project, in your user folder.** Any folder you start Claude Code in would use it. That means it also loads in unrelated work.
3. **Not sure.** I take this project only.
4. **Skip for now.** I use this project only as the expected answer, and nothing is set yet.

_(1 tool turns, 5 s)_

### Turn 13

**Adopter:** 1

**Drill:** Recorded: the pack lives in this project only.

**Do you want the reviewer agent too?** It's called `media-critic`. It reviews a finished video or audio file from extracted frames and measured readings, such as loudness and file size, before you post. It adds about 80 tokens every session (estimate).

1. **Yes (Recommended).** You publish what you make, and this is a check before posting.
2. **No.** Skip the agent. You can add it later.
3. **Not sure.** I take yes.
4. **Skip for now.** Nothing is set, and I use no as the expected answer.

_(1 tool turns, 5 s)_

### Turn 14

**Adopter:** 1

**Drill:** Recorded: you take the reviewer agent `media-critic`, about 80 tokens every session (estimate). I saved your choices at `setup/adoption/features.md`.

**The total.** Your choice loads about 780 tokens into every session (an estimate). The heaviest three are the front door (about 358), the style page (about 89) and the reviewer agent (about 80). Nothing is heavy by the kit's own threshold, which is 1,000 tokens for one item. I can't give you a share of Claude's working room, because `docs/facts.md` states no size for it.

**Do you want to drop anything for weight?**

1. **Keep everything (Recommended).** Each item answers something you named, and the total is small.
2. **Drop the reviewer agent.** That saves about 80 tokens (estimate), and the pack still works without it.
3. **Drop the style page.** That saves about 89 tokens (estimate), and you'd keep repeating your subtitle habits.
4. **Not sure.** I keep everything.

_(3 tool turns, 22 s)_

*Files Claude wrote in this turn: `<setup>/adoption/features.md`.*

### Turn 15

**Adopter:** 1

**Drill:** Recorded: you keep everything. Before the defaults, one correction to the total. I took handoff's figure from the menu, about 73 tokens. Handoff's own card says the standard size, which I recommend below, is about 197 tokens (estimate). That figure may count the front-door lines twice. So your every-session total is closer to **about 900 tokens (estimate)**, not 780. I'll fix the file once your sizes are final.

Phase 3 of 5 comes next. First I'll tailor wave 1, the items we install and see working today. It's 8 items, in this order:

1. The scanner (SkillSpector) and its scan-first rule
2. Building your setup folder from the kit's templates
3. Handoff
4. The front door
5. Memory (light)
6. The style page (light)
7. The audio and video pack
8. The `media-critic` reviewer

Nothing else is chosen, so there's no later wave yet. Here is what I'd set for each, from what I found:

1. **Scanner:** keep the one you have, because `skillspector` v2.2.3 is already installed. The scan-first rule line goes in your setup folder's front door.
2. **Setup folder:** build the whole template tree in your empty folder. `git init` comes as its own question afterwards.
3. **Handoff:** standard size. Your problem includes not knowing which episode you were on, and standard also sweeps memory and commits. It goes in this setup only. It commits and pushes with each push shown to you first, because your data rules allow a private GitHub remote.
4. **Front door:** standard size, since you take memory and handoff. It's a new `AGENTS.md` plus a one-line `CLAUDE.md`, in your setup folder only.
5. **Memory:** light size, as you chose. Claude proposes a fact and saves it on your yes.
6. **Style page:** light size, as you chose.
7. **Audio and video pack:** this project only, as you chose. `ffmpeg` is already installed (version 8.1), so nothing to install there.
8. **Reviewer:** yes, as you chose.

**Do you want to keep these defaults?**

1. **Keep these (Recommended).**
2. **Change some.** Give me the numbers and I'll ask each one in full.
3. **Not sure.** I keep them.

_(7 tool turns, 35 s)_

### Turn 16

**Adopter:** 1

**Drill:** Recorded: you keep all the defaults.

One question needs your answer. **How should Claude load the style page?** It's a file Claude Code reads for your clip and subtitle habits.

1. **Imported into every session (Recommended).** One `@identity/STYLE.md` line in the front door loads the file at launch, every session, for certain. It costs the file's size, about 89 tokens (estimate). Your front door is small, so this is the way that works for certain.
2. **Read when needed.** The front door only says when to read it. It costs nothing every session, but a session may skip reading it and guess.
3. **A start-up hook.** A hook prints the file at the start of each session. The cost is the same as an import, and it suits many folders. You use one setup folder, so it doesn't fit.
4. **Not sure.** I take imported.
5. **Skip for now.** Nothing is set, and I use imported as the expected answer.

_(2 tool turns, 9 s)_

### Turn 17

**Adopter:** 1

**Drill:** Recorded: the style page is imported into every session. Phase 2 is done, and every wave-1 item is decided.

Phase 3 of 5, Spec and plan. About 10 minutes left in this sitting (an estimate). You can stop any time, and I'll pick up from `adoption/`.

**The gap report** covers each part of your work and tools:

| Your work or tool | Covered? | By what |
|---|---|---|
| Cutting silences and ums | covered | the pack's spoken-recording cutter |
| Transcripts | partly | the pack's transcriber. It needs a speech-to-text tool, and I haven't checked which one you have. Your `ffmpeg` build lists a whisper feature, but I haven't tested it. |
| Subtitles | covered | the pack's subtitle and transcribe skills. I'll confirm them with a real check. |
| Short clips for social | covered | the pack's clip-into-shorts and publish-ready skills |
| Which episode you're on, your clip style | covered | handoff, memory and the style page |
| Posting to the social platforms themselves | not covered | The kit has no connector for them. My one route is to skip: you post by hand, since you said "ready to post". |
| GitHub (private remote) | covered | git, plus handoff's commit-and-push step |

**What I'd write as your spec:**
- **Your work:** a weekly podcast and short social clips, which you want Claude to help cut, transcribe, subtitle and prepare.
- **Adopt:** the scanner, the setup folder, handoff (standard), the front door (standard), memory (light), the style page (light, imported), the audio and video pack (this project only) and the `media-critic` reviewer.
- **Skip:** everything else in the kit, because none of it answers what you named. Posting directly is skipped as above.
- **Data rules:** nothing here is sensitive, your personal account may see it, and a private GitHub remote is allowed. Pushes are shown to you first.
- **Every-session total:** about 900 tokens (estimate, and likely an upper bound), with the front door, handoff and the pack as the heaviest.

**May I write this as your spec?**

1. **Yes (Recommended).** I write `setup/adoption/spec.md`, then the plan for wave 1.
2. **Change something first.** Tell me what.
3. **Not sure.** I change nothing yet.

_(1 tool turns, 17 s)_

### Turn 18

**Adopter:** 1

**Drill:** I wrote your spec and plan in your setup folder: `setup/adoption/spec.md` and `setup/adoption/plan.md`. I also updated the total in `setup/adoption/features.md`.

Your plan has 9 items. Today we do all of them and see them work. Nothing waits for a later wave, and "next wave" picks up anything you add.

1. The scanner and its rule line
2. Building the setup folder from the kit's templates
3. Reading your user-level `~/.claude` folder, which the audit couldn't see (read-only; it needs your yes)
4. Handoff (standard)
5. The front door (standard)
6. Memory (light)
7. The style page (light)
8. The audio and video pack
9. The `media-critic` reviewer

Each row ends with a check we run in front of you. A row is ticked only after its check has passed. Row 7 needs a few words from you about your clip and subtitle habits.

**Do you approve this plan so I can start wave 1?**

1. **Yes, start (Recommended).** I start with row 1, the scanner.
2. **Change the plan first.** Tell me what to move or drop.
3. **Not sure.** I change nothing yet.

_(6 tool turns, 36 s)_

*Files Claude wrote in this turn: `<setup>/adoption/spec.md`, `<setup>/adoption/plan.md`, `<setup>/adoption/features.md`.*

### Turn 19

**Adopter:** 1

**Drill:** Row 2 builds your setup folder. Nothing is created yet. Here is what I'd create in `setup/`, using only the kit's blank templates. Later rows then fill them in, in your words.

```text
setup/
  AGENTS.md          the front door (from the kit's template)
  CLAUDE.md          one line: @AGENTS.md
  NOTES.md           memory, light size (one line per fact)
  identity/STYLE.md  your clip and subtitle habits
  handoffs/          TEMPLATE.md, where end-of-session notes go
  adoption/          already there (inventory, features, spec, plan, decisions)
  .claude/skills/    where handoff and the audio and video pack go
  .claude/agents/    where media-critic goes
```

The kit's full tree also has `USER.md`, `RELATIONSHIP.md`, `SOUL.md`, a memory folder with a vault, and git hook templates. I'd leave those out, because you didn't choose them. Each would add empty files that Claude has to read past.

**Shall I create this tree?**

1. **Yes, only what you chose (Recommended).** I create the folders and files above, and no existing file is touched.
2. **Yes, the kit's full tree.** I also create the unchosen files from the templates.
3. **Change it.** Tell me what to add or drop.
4. **Not sure.** I change nothing yet.

_(9 tool turns, 55 s)_

*Files Claude wrote in this turn: `<setup>/adoption/decisions.md`, `<setup>/adoption/plan.md`.*

### Turn 20

**Adopter:** 1

**Drill:** Row 2 is done. I created four files in `setup/`, all copied blank from the kit's templates:
- `AGENTS.md`, the front door
- `CLAUDE.md`, one line: `@AGENTS.md`
- `identity/STYLE.md`
- `handoffs/TEMPLATE.md`

I checked by listing the folder, and the four files are there. Two differences from what I proposed:
- **`NOTES.md`:** it has no blank template, so the memory row (row 6) writes it.
- **`.claude/skills/` and `.claude/agents/`:** creating them needed an approval, and I didn't work around it. They'll be made when the audio and video pack and `media-critic` go in (rows 8 and 9).

The front door and style page are still blank prompts, and the front-door and style rows fill them in. The scanner's rule line goes into the front door in row 5.

One more question, on its own. **Do you want to make this folder a git repository?** That keeps a history of every change to your setup. I'd add a `.gitignore` that excludes `.env*`, data folders, `.claude/settings.local.json` and `CLAUDE.local.md`. I'd add no remote, so nothing leaves your computer.

1. **Yes (Recommended).** Handoff's commit step needs a repository, and you can undo any change.
2. **No.** The folder stays as plain files, and handoff can't commit.
3. **Not sure.** I change nothing yet.
4. **Skip for now.** The question comes back before the handoff row.

_(15 tool turns, 51 s)_

*Files Claude wrote in this turn: `<setup>/AGENTS.md`, `<setup>/CLAUDE.md`, `<setup>/identity/STYLE.md`, `<setup>/handoffs/TEMPLATE.md`, `<setup>/adoption/decisions.md`, `<setup>/adoption/plan.md`.*

*Writes Claude Code refused in this turn: `<setup>/.claude/skills/.gitkeep`, `<setup>/.claude/agents/.gitkeep`.*

### Turn 21

**Adopter:** 1. I also created the two folders .claude/skills and .claude/agents myself, so you do not need approval for them.

**Drill:** The folder is now a git repository with no remote. The `.gitignore` also keeps your audio and video files (wav, mp3, mp4, mov, mkv) out of git, so recordings never get committed by accident. If you'd rather track some, say so and I'll loosen it.

Row 3 is next. It scans what you already have installed, read-only. The audit couldn't read your user-level `~/.claude` folder, because this session may only read the kit and the setup folder. I can't go around that block. You can show me what's there with a line that only prints, like this:

`! ls ~/.claude`

**Do you want to run it?**

1. **Yes (Recommended).** You type the line above, the folder listing lands here, and I scan any skills, agents or plugins it shows. I change nothing.
2. **There's nothing there.** You tell me, and I record "none, as you said" instead of "unknown".
3. **Not sure.** I record "unknown" and move on.
4. **Skip for now.** The row stays open and comes back later.

_(4 tool turns, 32 s)_

*Files Claude wrote in this turn: `<setup>/.gitignore`, `<setup>/adoption/decisions.md`.*

### Turn 22

**Adopter:** 4

**Drill:** The scan says the kit's handoff skill is clean: 0/100, SAFE, no findings. I also read it myself. It has no network calls and no scripts, only instructions.

It can't go in as it is, though. Its first and last steps refer to the studio's own tools: a wiki log, a transcript archiver, signed commits, hub branches and a gate script. You don't have any of those. So I rewrote it for your setup, as one `SKILL.md` that would go in `setup/.claude/skills/handoff/`. These are the changes:
- **Trigger phrases:** now your own ("wrap up", "end of day"), and it skips if you're only pausing.
- **Dropped:** the wiki log, the archiver, the hub branches, signing and the branch clean-up.
- **Kept:** the memory sweep with its four tests, then a note written from your template, then the commit. It ends with a message naming what was left undone, and the same hard rules (never merge, force-push, rewrite history or tag).
- **Push:** it only pushes if a remote exists, with each push shown to you first. You have no remote yet, so for now it commits only.
- **Episode tracking:** the note always records which episode you were on and its stage. That answers your "which episode?" problem.

Here is the file:

```markdown
---
name: handoff
description: Close out a work session. Use when I say "wrap up", "end of day", "let's wrap up", "save everything" or "/handoff", not when I am just pausing. Sweeps memory, writes the handoff note, commits, and names what is left undone.
---

### handoff

If I am only pausing, say so and skip this: closing out a session that will continue is wasted.
Make a todo per step and do them in order. Say which step you skip and why.

1. **Real state first.** Run `git status --short`. Never close out against an assumed state.
2. **Memory sweep.** A fact goes into `NOTES.md` (one line: the fact, why, the date) only if it
   passes all four tests: non-obvious, durable, changes what a later session does, carries its why.
   Sharpen an existing line rather than adding a near-duplicate; correcting a line this session
   proved wrong is worth more than any addition. Never delete a line to make room. Writing
   nothing is a valid result: say so, never pad.
3. **The note.** Write `handoffs/YYYY-MM-DD-<topic>.md` from `handoffs/TEMPLATE.md`. Always name
   the episode I was working on and its stage (recorded, cut, transcribed, subtitled, clips made,
   posted). "Done" lists what was checked and how, not what was attempted.
4. **Commit.** After steps 2 and 3, so nothing written last is left out: commit what this session
   wrote, in coherent commits, each message saying why. Push only if a remote exists, and show
   me the push first. With no remote, say "committed, no remote".
5. **Check.** `git status --short` must print nothing the session wrote. With a remote,
   `git rev-list --count --branches --not --remotes` must print `0`.
6. **Say it.** Last message: what was done, what was verified and how, what is deliberately
   left open, and the first thing the next session does.

Never: merge a PR, force-push, rewrite history, tag; call a repository clean without checking it;
invent a memory to look productive. If something is broken and cannot be fixed now, it goes in
the report.
```

**Shall I save it?**

1. **Save it as shown (Recommended).**
2. **Change something first.** Tell me what.
3. **Not sure.** I save nothing yet.
4. **Skip for now.** The row stays open.

_(3 tool turns, 46 s)_

### Turn 23

**Adopter:** 1

**Drill:** The write was refused. The harness treats anything inside `.claude/` as a sensitive location and asks for approval each time. Your note that you created those folders doesn't change that rule, so I didn't work around it. Nothing was saved, and row 4 stays open.

**How do you want to get the file into `.claude/skills/handoff/`?**

1. **Approve the permission prompt (Recommended).** I retry the same write. If your permission prompt shows, accept it. It's the same for the pack and the reviewer in rows 8 and 9, so this settles it for the whole wave.
2. **I stage it, you move it.** I save the file as `setup/adoption/staged/handoff-SKILL.md`, and you copy it into place yourself. I'd then check the copy.
3. **Not sure.** I take option 1.
4. **Skip for now.** The row stays open.

_(2 tool turns, 10 s)_

*Writes Claude Code refused in this turn: `<setup>/.claude/skills/handoff/SKILL.md`.*

### Turn 24

**Adopter:** 2

**Drill:** I saved the adapted skill at `setup/adoption/staged/handoff-SKILL.md`. It's the same text I showed you. I recorded the decision in `decisions.md` with its check marked as pending.

Your step is to copy it into place. This line makes the folder and copies the file, and it changes nothing else:

```
! mkdir -p "<setup>/.claude/skills/handoff" && cp "<setup>/adoption/staged/handoff-SKILL.md" "<setup>/.claude/skills/handoff/SKILL.md"
```

**Have you run it?**

1. **Done.** I check that the file is in place, then tick the row.
2. **I'd rather do it another way.** Tell me how.
3. **Not yet.** The row waits, and I move to row 5, the front door.

_(3 tool turns, 16 s)_

*Files Claude wrote in this turn: `<setup>/adoption/staged/handoff-SKILL.md`, `<setup>/adoption/decisions.md`.*

### Turn 25

**Adopter:** 1

**Drill:** The front-door template scanned clean (0/100, SAFE, plain text). For row 5 I wrote the front door in your words from what you told me. The rules are my proposal, so please read them as yours to change. It names only files that exist today: `handoffs/` is there, but `NOTES.md` and the style import wait for rows 6 and 7. This is the whole `AGENTS.md`, about 250 tokens (estimate):

```markdown
### AGENTS.md

#### Who I am and how to work with me

I run a small weekly public podcast and cut short video clips for social media from my
recordings. I use Claude to cut silences and ums, make transcripts and subtitles, and get
clips ready to post.

#### Load this at the start of every session

- The newest note in `handoffs/`, when the task continues earlier work. It names the episode
  I was on and its stage.

#### Rules

- Never delete, overwrite or move my original recordings. Work on copies.
- Never post or publish anything. I post by hand.
- Always ask me first: deleting any file, pushing, sending anything outside this machine.
- Anything from outside that runs in a session (a skill, a plugin, an MCP server or a hook),
  new or updated, is scanned with SkillSpector and its code read for calls that leave this
  machine before it is installed; on Windows run the scan with `PYTHONUTF8=1`. A verdict other
  than SAFE waits for my decision.

#### End of a session

When I say "wrap up" or "end of day", use the `handoff` skill. Notes go in `handoffs/` as
`YYYY-MM-DD-<topic>.md`, from `handoffs/TEMPLATE.md`.
```

`CLAUDE.md` already holds the single line `@AGENTS.md`, so it stays as it is. The scanner's rule line from row 1 is in the Rules section.

**Shall I save this as your front door?**

1. **Save it as shown (Recommended).**
2. **Change something first.** Tell me what, for example the rules.
3. **Not sure.** I save nothing yet.
4. **Skip for now.** The row stays open.

_(6 tool turns, 28 s)_

*Files Claude wrote in this turn: `<setup>/adoption/decisions.md`, `<setup>/adoption/plan.md`.*

### Turn 26

**Adopter:** 1

**Drill:** Row 5 is saved. I recorded the decision, and the first of its two checks passed: `CLAUDE.md` holds the import line. The second check, a fresh session answering from the file, is in Verify. Row 1 is now complete too, because the scanner's rule line is in the front door, so I ticked it.

Row 6 is memory at the light size. This needs no scan, because I write the files from your choices rather than copying anything from the kit. It has three parts:

**1. A new `NOTES.md`:**
```markdown
### NOTES

<!-- One line per fact: the fact, why, the date. A fact goes in only if it is non-obvious,
durable, changes what a later session does, and carries its why. -->

- A private GitHub remote is allowed for this setup, and nothing in my work is sensitive: it is
  my own public podcast. Why: I said so when I adopted this setup. (2026-11-09)
```
That one line is the first memory. It's the one fact so far that no file in the folder shows and that changes what a session may do.

**2. Two changes to the front door `AGENTS.md`.** I'd add this line under "Load this at the start of every session":
```diff
+ - `NOTES.md`: facts earlier sessions learned, one line each with the reason.
```
And I'd add a section before "End of a session":
```diff
+ ## Memory
+
+ When you learn a durable, non-obvious fact that would change what a later session does,
+ propose one line for `NOTES.md` (the fact, why, the date) and save it when I say yes.
```

**3. Cost.** This adds about 51 tokens to every session at the start (estimate), and each fact adds its own line.

**Shall I save the notes file and make the two front-door changes?**

1. **Yes (Recommended).**
2. **Change something first.** Tell me what.
3. **Not sure.** I save nothing yet. Saving is a change to your files, so Not sure isn't a yes.
4. **Skip for now.** The row stays open.

_(8 tool turns, 29 s)_

*Files Claude wrote in this turn: `<setup>/AGENTS.md`, `<setup>/adoption/decisions.md`, `<setup>/adoption/plan.md`.*

### Turn 27

**Adopter:** 1

**Drill:** Row 6 is saved. `NOTES.md` exists, and the front door names it twice, once in the load list and once in the Memory section. Its fresh-session check is in Verify.

Row 7 is the style page. It's the file that stops you repeating the same instructions. I'll write it only from what you say, one question at a time.

**What are your clip and subtitle habits, the instructions you keep repeating?** For example, how long clips run, where subtitles sit, how many words per line, the font or colour, what you always cut. Tell me in your own words, as many as come to mind. You can say "none yet" and I'll leave those lines for you to fill in.

_(7 tool turns, 18 s)_

*Files Claude wrote in this turn: `<setup>/NOTES.md`, `<setup>/AGENTS.md`, `<setup>/adoption/decisions.md`, `<setup>/adoption/plan.md`.*

### Turn 28

**Adopter:** Clips are 30 to 45 seconds, vertical. Subtitles sit in the lower third, two lines at most, about 6 words per line, white text with a dark outline. Always cut the pauses longer than a second and the ums. Never add music.

**Drill:** Recorded. Those are your clip and subtitle habits, in your words. You didn't give me tone, length or how to report a result, so I left those lines out instead of guessing. The file is shorter and costs fewer tokens: about 90 tokens or less (estimate). After a week I'll offer to add any correction you gave twice.

Here is `identity/STYLE.md`, replacing the blank template:

```markdown
### STYLE.md: how Claude works for me

#### Clips
- 30 to 45 seconds, vertical.
- Always cut pauses longer than one second, and the ums.
- Never add music.

#### Subtitles
- In the lower third, two lines at most, about 6 words per line.
- White text with a dark outline.
```

And one line added to the front door, under "Load this at the start of every session", so it loads for certain every session:

```diff
+ - @identity/STYLE.md
```

I'd also add one rule to the front door's Rules section: never change anything in `identity/` without showing you the change first.

```diff
+ - Never edit anything in `identity/` without showing me the change first.
```

**Shall I save the style page and the two front-door additions?**

1. **Yes (Recommended).**
2. **Change something first.** Tell me what.
3. **Not sure.** I save nothing yet.
4. **Skip for now.** The row stays open.

_(1 tool turns, 10 s)_

### Turn 29

**Adopter:** 1

**Drill:** The scan gave the pack 20/100, severity LOW, recommendation SAFE. The scanner is noisy, so here is my own reading of what it flagged and of the code.

**The two medium findings are both false alarms.**
- **Autonomous decision (`ai-video-generation.md:48`):** the line is a voice-over prompt pattern that ends "never a real person's voice without consent". It's advice about prompts, and it takes no action.
- **Unrestricted tool access (`publish-ready-media.md:31`):** this is step 10, "Publishing". It says the opposite: never post without your explicit approval of the final file and text, and hand the file over if there's no sanctioned route. This matches your rule that you post by hand.

**The pack's four small scripts** (cut list, loudness report, size ladder, safe swap) run only on your own computer. A search for network calls in them found none. Two of them start `ffmpeg` with a list of arguments, not a shell command. Two read or write files: the cut-list script writes an edit list, and the editor-bridge script writes then swaps a temp file beside the file it edits.

**What I haven't done:** I haven't read all 19 files line by line, and the pack's examples are the studio's, so a few may name a tool you don't use. I'll read the ones for cutting, transcribing, clipping and publishing with you when we test it.

**What the pack costs:** its entry costs about 69 tokens every session (estimate). The index of about 1,100 tokens loads only when a media task comes up, and each skill loads only when it's used.

**The install:** the pack has no stub files. The entry `SKILL.md` and the `skills/` folder go to `setup/.claude/skills/audio-video-media/`. The harness blocks my writing into `.claude/`, so I'd give you one copy line to type, as with handoff.

**Do you want to adopt the pack as it is?**

1. **Yes, adopt it (Recommended).** I give you the copy line, and then I check the files.
2. **Skip the pack.** Nothing is installed and I record why.
3. **Not sure.** Nothing changes yet. Not sure isn't a yes here.
4. **Skip for now.** The row stays open.

_(14 tool turns, 47 s)_

*Files Claude wrote in this turn: `<setup>/identity/STYLE.md`, `<setup>/AGENTS.md`, `<setup>/adoption/decisions.md`, `<setup>/adoption/plan.md`.*

### Turn 30

**Adopter:** 1

**Drill:** Recorded the decision, with its check pending. Your step is to copy the pack in. This line makes the folder and copies the entry file and the `skills/` folder from the kit. It doesn't touch the reviewer agent, which is row 9.

```
! mkdir -p "<setup>/.claude/skills/audio-video-media" && cp -r "<kit>/catalog/packs/audio-video-media/SKILL.md" "<kit>/catalog/packs/audio-video-media/skills" "<setup>/.claude/skills/audio-video-media/"
```

**Have you run it?**

1. **Done.** I list the folder and compare it with the kit copy.
2. **I'd rather do it another way.** Tell me how.
3. **Not yet.** The row waits.

_(2 tool turns, 10 s)_

*Files Claude wrote in this turn: `<setup>/adoption/decisions.md`.*

### Turn 31

**Adopter:** 1

**Drill:** Row 8 is done and checked. `diff` printed IDENTICAL against the kit copy, and the 17 files are in `setup/.claude/skills/audio-video-media/`. The check that it answers a question about a real video comes in the fresh-session proof.

Row 9 is the `media-critic` reviewer. It was scanned together with the pack and had no findings. I read its header:
- **Purpose:** it reviews a finished render from extracted frames and measured readings alone, such as loudness, peaks, cut lists and sizes. It never opens your project or asks what you meant, and text inside a frame is treated as data, not as instructions.
- **Tools it may use:** Read, Grep, Glob, Bash and Skill. It describes itself as read-only, but Bash is a broad tool. That's the same permission level any Claude Code agent can have, and you can ask for it narrowed.
- **Cost:** about 80 tokens every session (estimate), for its description.

It goes to `setup/.claude/agents/media-critic.md`, and I'd give you the same kind of copy line.

**Shall I adopt it as it is?**

1. **Yes, adopt it as it is (Recommended).** You wanted it so you can check a render before you post.
2. **Adopt it without Bash.** I give you a version with the tools list narrowed to Read, Grep, Glob and Skill. It can then look at files but run no commands, so it can't measure for itself.
3. **Skip it.** Nothing is installed.
4. **Not sure.** Nothing changes yet.
5. **Skip for now.** The row stays open.

_(5 tool turns, 18 s)_

*Files Claude wrote in this turn: `<setup>/adoption/decisions.md`, `<setup>/adoption/plan.md`.*

### Turn 32

**Adopter:** 1

**Drill:** Recorded, with the check pending. This line copies the one agent file from the kit into your agents folder. It changes nothing else.

```
! cp "<kit>/catalog/packs/audio-video-media/agents/media-critic.md" "<setup>/.claude/agents/media-critic.md"
```

**Have you run it?**

1. **Done.** I compare the copy with the kit file.
2. **I'd rather do it another way.** Tell me how.
3. **Not yet.** The row waits.

_(2 tool turns, 8 s)_

*Files Claude wrote in this turn: `<setup>/adoption/decisions.md`.*

### Turn 33

**Adopter:** 1

**Drill:** Row 9 is done: the agent file is identical to the kit copy. Wave 1 is installed.

Phase 5 of 5, Verify. About 5 minutes left in this sitting (an estimate).

**What I checked in front of you:**
- Row 1, the scanner: `skillspector --version` printed `SkillSpector v2.2.3`, and the rule line is in your front door.
- Row 2, the setup folder: the files exist, and the folder is a git repository with no remote.
- Row 4, handoff: the skill is in place and identical to the vetted copy.
- Row 5, the front door: `CLAUDE.md` holds the import line.
- Row 6, memory: `NOTES.md` is named twice in the front door.
- Row 7, the style page: it's imported by the front door.
- Row 8, the pack: 17 files, identical to the kit copy.
- Row 9, `media-critic`: identical to the kit copy.

**Still open:**
- **Row 3:** the scan of your user-level `~/.claude`, which you skipped.
- **The fresh-session proof:** the checks that a new session answers from your files. Nothing is called working until you've seen that.

**Every-session load, measured** from the files' sizes, bytes divided by 4. Your user-level files weren't measured:
- **Instruction files and memory:** 2,097 bytes, about 524 tokens (estimate).
- **Descriptions of the handoff skill, the pack and the agent:** about 190 tokens (estimate).
- **Total:** about 714 tokens (estimate), against my earlier upper estimate of about 900. `/context` shows the live figure.

I also wrote the first handoff note at `setup/handoffs/2026-11-09-adoption.md`, so the new session has something to resume from.

**Your step is to open a second terminal in the setup folder.** Start Claude Code there and ask these three things, one at a time:
1. "What must you never do here?"
2. "What are my clip length and subtitle rules?"
3. "Where did we stop?"

The answers should come from your files, not from this conversation.

**What did the new session answer?** Paste or describe it.

1. **It answered from my files.** Tell me what it said, and I record which file each answer came from.
2. **It got something wrong or guessed.** Tell me what, and we look at it.
3. **I'll do it later.** I write the handover now and mark this check as waiting on you.

_(9 tool turns, 38 s)_

*Files Claude wrote in this turn: `<setup>/adoption/decisions.md`, `<setup>/adoption/plan.md`, `<setup>/handoffs/2026-11-09-adoption.md`.*

### Three fresh sessions, between turns 33 and 34

The agent running the trial started three new sessions in the setup folder, each with one question. They had none of the conversation, only the files.

#### Fresh session 1

**Adopter:** I have a podcast recording, ep12.wav in this folder, with long pauses and some ums. Before doing anything: which of your skills would you use to clean it up, and why? Do not run any commands; answer in three lines.

**Claude:** 1. I'd use the `audio-video-media` skill. It covers cleaning up, clipping, transcribing and subtitling recordings, and it says to open it before replying about a recording like `ep12.wav`.
2. I'd open it with your rules in mind. I'd work on a copy of `ep12.wav` and leave the original alone, and I'd cut pauses over one second and the ums per `STYLE.md`. I'd also read the newest `handoffs/` note and `NOTES.md` first if this continues earlier work.
3. I wouldn't use `handoff` yet, since that's only for when you say "wrap up". If the cleanup needs an outside skill, plugin, MCP server or hook, I'd scan it with SkillSpector and wait for your decision before installing it.

#### Fresh session 2

**Adopter:** Please clean up ep12.wav: cut the long pauses and ums. Start by reading what you need; do not run ffmpeg or write any file yet, just tell me the plan in four lines.

**Claude:** Plan for `ep12.wav` (nothing run or written yet):

1. **Transcript:** I need word-level timings first. No speech-to-text tool is chosen yet (an open item in the last handoff), so I'll propose a local one and check it with you before installing. Any tool, plugin or hook from outside has to pass a SkillSpector scan first.
2. **Proposals, one pass at a time:** `silence`, then `filler` (ums), then `repeat`, then `falsestart`. Each pass writes its own numbered `edit-list-N.json`. Silences over 1 s are cut per your STYLE.md. The skill's default threshold is 0.55 s, so I'll show you that gap, and I'll leave about 0.15 s of pause on each side of a cut.
3. **Your approval:** I'll give you a short timestamped list ("01:12 to 01:14, 2 s silence; 03:40, 'um'") and render nothing until you say yes. You can remove items from it.
4. **Render and check:** The output goes to a new file such as `ep12-clean.wav`, and the original stays untouched. I'll use ffmpeg with a 20 to 30 ms fade at each join. Then I'll check duration, loudness (within about 1 LU of the original), clicks and clipped words at the joins.

Do you want me to look for a local speech-to-text tool, or do you already have a transcript with word times?

#### Fresh session 3

**Adopter:** Three short questions, answer each in one or two lines and name the file each answer came from: 1. What must you never do here? 2. What are my clip length and subtitle rules? 3. Where did we stop?

**Claude:** 1. **Never do:** Don't delete, overwrite or move your original recordings (work on copies). Don't post or publish anything. Don't edit `identity/` without showing you the change first. Ask first before deleting any file, pushing, or sending anything off this machine. Source: `AGENTS.md` (Rules).
2. **Clips and subtitles:** Clips run 30–45 seconds, vertical. Cut pauses over one second and the ums, and never add music. Subtitles go in the lower third, two lines at most with about 6 words per line, in white text with a dark outline. Source: `identity/STYLE.md`.
3. **Where we stopped:** Wave 1 of the setup is installed (front door, `NOTES.md`, `STYLE.md`, `handoff` skill, `audio-video-media` pack, `media-critic` agent). No episode has been worked on, nothing is committed, and there is no remote. Still open: the user-level `~/.claude` scan, a speech-to-text choice, and the tone, length and report-format lines for `STYLE.md`. Next step is to pick the first episode. Source: `handoffs/2026-11-09-adoption.md`.

### Turn 34

**Adopter:** 1. The fresh session answered all three from my files: the never-do list from AGENTS.md, the clip and subtitle rules from identity/STYLE.md, and where we stopped from handoffs/2026-11-09-adoption.md. It also opened the audio and video pack when I asked it to clean up a recording.

**Drill:** Wave 1 is installed. The first fresh-session proof passed: the fresh session answered all three questions from your own files. Several smaller checks are still open, and the hand-over lists each one.

**What passed**
- **Scanner:** v2.2.3 is installed, and its rule line is in your front door.
- **Setup folder:** built and made a git repository, with no remote.
- **Front door and handoff:** your fresh session answered "what must you never do?" from `AGENTS.md` and "where did we stop?" from the handoff note.
- **Style page:** the clip and subtitle rules came from `identity/STYLE.md`, which ends the repeated subtitle instructions.
- **Pack and reviewer:** both are installed and identical to the vetted copies. The pack opened when you asked it to clean up a recording.

**Still open** (each has its own line in the hand-over)
- **Row 3, the scan of your user-level `~/.claude`:** skipped, so anything installed there is unscanned.
- **Memory:** I haven't seen a fresh session answer from `NOTES.md` yet.
- **Style edits:** I haven't seen a diff shown before a style edit.
- **Pack on a real video:** "what is in this video?" hasn't been tried on a real file.
- **`media-critic`:** I haven't seen it listed in a fresh session.
- **Handoff close-out:** no "wrap up" run yet, and nothing is committed. Your first "wrap up" makes the first commit.
- **Transcripts:** no speech-to-text tool is chosen yet.

**Where things are**
- Every-session load is now about 714 tokens (estimate), measured from file sizes. It was about 900 in the plan. Your user-level files weren't measured, and `/context` shows the live number.
- The hand-over is at `setup/adoption/handover.md`, and the plan, decisions and first handoff note are beside it in `adoption/` and `handoffs/`.
- To resume, start a new session in `setup/` and ask where you stopped.
- To take more from the kit, say "next wave".
- A standing note: the folder has no remote, so don't push it anywhere until you add the private GitHub one.

_(10 tool turns, 40 s)_

*Files Claude wrote in this turn: `<setup>/adoption/plan.md`, `<setup>/adoption/handover.md`.*

## The files it wrote

Each file as the run left it in `<setup>`. Under `.claude/`, copied by the agent running the trial:

- `.claude/agents/media-critic.md`
- `.claude/skills/audio-video-media/SKILL.md`
- `.claude/skills/audio-video-media/skills/ai-video-generation.md`
- `.claude/skills/audio-video-media/skills/clip-into-shorts.md`
- `.claude/skills/audio-video-media/skills/cut-spoken-recording.md`
- `.claude/skills/audio-video-media/skills/cut-spoken-recording/edit-list.mjs`
- `.claude/skills/audio-video-media/skills/judge-media-by-measurement.md`
- `.claude/skills/audio-video-media/skills/judge-media-by-measurement/loudness-report.mjs`
- `.claude/skills/audio-video-media/skills/motion-video-from-html.md`
- `.claude/skills/audio-video-media/skills/narrated-video.md`
- `.claude/skills/audio-video-media/skills/publish-ready-media.md`
- `.claude/skills/audio-video-media/skills/publish-ready-media/size-fit-ladder.mjs`
- `.claude/skills/audio-video-media/skills/story-short-film.md`
- `.claude/skills/audio-video-media/skills/subtitle-stills.md`
- `.claude/skills/audio-video-media/skills/transcribe-recording.md`
- `.claude/skills/audio-video-media/skills/video-edit-craft.md`
- `.claude/skills/audio-video-media/skills/video-editor-bridge.md`
- `.claude/skills/audio-video-media/skills/video-editor-bridge/safe-swap.mjs`
- `.claude/skills/audio-video-media/skills/watch-a-video.md`
- `.claude/skills/handoff/SKILL.md`

### `.gitignore`

```
.env*
*.pem
*.key
.claude/settings.local.json
CLAUDE.local.md
# recordings and other large media stay out of git
*.wav
*.mp3
*.mp4
*.mov
*.mkv
```

### `AGENTS.md`

```markdown
# AGENTS.md

## Who I am and how to work with me

I run a small weekly public podcast and cut short video clips for social media from my
recordings. I use Claude to cut silences and ums, make transcripts and subtitles, and get
clips ready to post.

## Load this at the start of every session

- The newest note in `handoffs/`, when the task continues earlier work. It names the episode
  I was on and its stage.
- `NOTES.md`: facts earlier sessions learned, one line each with the reason.
- @identity/STYLE.md

## Rules

- Never delete, overwrite or move my original recordings. Work on copies.
- Never post or publish anything. I post by hand.
- Never edit anything in `identity/` without showing me the change first.
- Always ask me first: deleting any file, pushing, sending anything outside this machine.
- Anything from outside that runs in a session (a skill, a plugin, an MCP server or a hook),
  new or updated, is scanned with SkillSpector and its code read for calls that leave this
  machine before it is installed; on Windows run the scan with `PYTHONUTF8=1`. A verdict other
  than SAFE waits for my decision.

## Memory

When you learn a durable, non-obvious fact that would change what a later session does,
propose one line for `NOTES.md` (the fact, why, the date) and save it when I say yes.

## End of a session

When I say "wrap up" or "end of day", use the `handoff` skill. Notes go in `handoffs/` as
`YYYY-MM-DD-<topic>.md`, from `handoffs/TEMPLATE.md`.
```

### `CLAUDE.md`

```markdown
@AGENTS.md
```

### `NOTES.md`

```markdown
# NOTES

<!-- One line per fact: the fact, why, the date. A fact goes in only if it is non-obvious,
durable, changes what a later session does, and carries its why. -->

- A private GitHub remote is allowed for this setup, and nothing in my work is sensitive: it is
  my own public podcast. Why: I said so when I adopted this setup. (2026-11-09)
```

### `adoption/decisions.md`

```markdown
# Adoption decisions

One row per item, never two items in one row, written by `vet-and-adopt` as soon as the item is applied or staged, with Check "pending"; the Check cell gets the result, and the line that showed it, once the check has run. A skipped item gets a row too, with Check "n/a". `drill-to-adopt` reads this file in update mode, so keep the kit version column accurate. The Undo column is the item card's Undo, written for your setup, so anything can be taken out again later.

| Date | Kit version | Item | Decision | Where it went | Why | Scan | Check | Undo |
|---|---|---|---|---|---|---|---|---|
| 2026-11-09 | v2.0.0 | skillspector | ADOPT (kept the scanner already installed) | SkillSpector v2.2.3 on this machine, installed before the adoption. The scan-first rule line is not written yet: it goes into the setup's front door once row 2 creates it. | Everything that runs in a session is scanned first. | n/a (this is the scanner) | 1 of 3 checks: `skillspector --version` printed `SkillSpector v2.2.3` (pass). 2: scan of the kit's `claim-auditor` printed `Score 0/100, Severity LOW, Recommendation SAFE` (pass; run with `PYTHONUTF8=1`). 3: rule line in the front door: pass 2026-11-09, `AGENTS.md` contains SkillSpector (count 1) in its Rules section. | Delete the rule line from the front door. To remove the scanner itself, use uv's own uninstall (not documented in the kit's facts as of 2026-11-02). Past decisions stay. |
| 2026-11-09 | v2.0.0 | setup-workspace: create the chosen tree | ADOPT (only the items you chose, not the kit's full tree) | `AGENTS.md`, `CLAUDE.md` (one line `@AGENTS.md`), `identity/STYLE.md`, `handoffs/TEMPLATE.md`, all copied blank from the kit's templates. `NOTES.md` is written by the memory row. `.claude/skills/` and `.claude/agents/` are created when rows 8 and 9 write into them (the harness asked for approval to write inside `.claude/`, which I did not work around). | Rows 3 to 9 write into this tree. | n/a | pending: the four files exist (checked by listing the folder). | Delete the four files and the `identity/` and `handoffs/` folders; `adoption/` stays. |
| 2026-11-09 | v2.0.0 | setup-workspace: git init | ADOPT | `setup/.git` and `setup/.gitignore` (excludes `.env*`, keys, `.claude/settings.local.json`, `CLAUDE.local.md`, and wav/mp3/mp4/mov/mkv recordings). No remote. | Handoff commits need a repository; a history lets any change be undone. | n/a | `git init` printed "Initialized empty Git repository". | Delete the `.git` folder and `.gitignore`. |
| 2026-11-09 | v2.0.0 | handoff (standard) | ADAPT | Staged at `adoption/staged/handoff-SKILL.md`; goes to `.claude/skills/handoff/SKILL.md` (this setup only) once you copy it. Commit only until a remote exists; pushes shown first. | Your problem includes not knowing which episode you were on; the note always names the episode and its stage. | SkillSpector on the kit copy: 0/100, LOW, SAFE, no findings; I also read it by hand (no network calls, no scripts). The adapted file is plain instructions. | installed 2026-11-09: you copied it; `SKILL.md` exists at `.claude/skills/handoff/` and `cmp` against the staged file printed "identical". Still pending: the card's fresh-session check ("where did we stop?") and one real close-out, both in Verify. | Delete `.claude/skills/handoff/`; keep your notes in `handoffs/`. |
| 2026-11-09 | v2.0.0 | front-door (standard) | ADAPT | `setup/AGENTS.md` (written in your words) and `setup/CLAUDE.md` (one line, `@AGENTS.md`), setup folder only. Names only files that exist today; the memory line and the style import come with rows 6 and 7. The scanner's rule line is in its Rules section. | One file every session reads first, so Claude knows your rules and where you stopped. | Kit template `templates/AGENTS.md`: 0/100, LOW, SAFE, plain text. | check 1 pass: `grep -c '^@AGENTS.md'` on `CLAUDE.md` printed 1. Check 2 (a fresh session answers "What must you never do here?" without opening a file) is pending, in Verify. | Restore `AGENTS.md` to the blank template; `CLAUDE.md` is one line you can delete. |
| 2026-11-09 | v2.0.0 | memory-index (light) | ADAPT | `setup/NOTES.md` with one first memory (private GitHub remote allowed, nothing sensitive); `AGENTS.md` names it in its load list and has a Memory section. Claude proposes a fact, saves it on your yes. | Stops you repeating facts such as your clip style. | n/a: written from your answers, nothing copied from the kit. | check 1 pass: `NOTES.md` is named in `AGENTS.md` (count 2, the load line and the Memory section). Check 2 (a fresh session answers a question only the first note answers) is pending, in Verify. | Delete `NOTES.md` and the two `AGENTS.md` additions. |
| 2026-11-09 | v2.0.0 | identity-style (light) | ADAPT | `setup/identity/STYLE.md` (your clip and subtitle habits, in your words; tone, length and report lines left out because you gave none), imported by the line `@identity/STYLE.md` in `AGENTS.md`, plus the rule to show you every change to `identity/` first. | You repeat the same subtitle instructions every session. | n/a: written from your words, nothing copied from the kit beyond the blank template. | check 1 pending: the file is named in `AGENTS.md`; fresh-session checks (1 to 3) are in Verify. | Remove the import line and the rule from `AGENTS.md`; delete `identity/STYLE.md`. |
| 2026-11-09 | v2.0.0 | audio-video-media (domain pack) | ADOPT as it is | `setup/.claude/skills/audio-video-media/` (the entry `SKILL.md` and the `skills/` folder, 17 files), this project only. The `media-critic` agent is row 9. | You cut silences and ums, transcribe, subtitle and clip a weekly podcast. | SkillSpector on `catalog/packs/audio-video-media`: 20/100, LOW, SAFE, 2 medium findings (EA2 at `ai-video-generation.md:48`, EA1 at `publish-ready-media.md:31`), both read and judged false alarms (neither grants anything). The four `.mjs` scripts were searched for network calls: none. Not every file was read line by line. | installed 2026-11-09: `diff` of the kit's `SKILL.md` and `skills/` against the installed copy printed IDENTICAL; the 17 files are listed. Pending: the pack answers "what is in this video?" in a fresh session (Verify). | Delete the `audio-video-media` folder from `.claude/skills/`. |
| 2026-11-09 | v2.0.0 | media-critic (agent of audio-video-media) | ADOPT as it is | `setup/.claude/agents/media-critic.md`, this project only. Tools: Read, Grep, Glob, Bash, Skill. | You publish what you make and want a check before posting. | Scanned with the pack: no findings in `agents/media-critic.md`. | installed 2026-11-09: `cmp` against the kit file printed "identical". Pending: the agent shows in a fresh session (Verify). | Delete `.claude/agents/media-critic.md`. |
```

### `adoption/features.md`

```markdown
# Feature choices

**Kit version:** v2.0.0 · **Date:** 2026-11-09 · **Every session, your choice:** about 900 tokens (estimate, upper bound: front door standard 358 + handoff standard 197 + memory light 51 + style light 89 + pack 69 + media-critic 80 + scanner rule line 60)
**Heaviest three:** front-door (about 358), handoff (about 197), identity-style (about 89)

Written by `drill-to-adopt` as you answer, one line per item, never two items on one line. You may edit it by hand: tick or untick a box, and the next run reads this file instead of asking again. A box is ticked only when you chose the item; nothing is ticked as "assumed". Tokens are estimates (bytes divided by 4). "You have" comes from the audit: **have**, **partly** or **not yet**.

## Continuity (`01-continuity`): taken

- [x] front-door: one file every session reads first, so Claude knows your rules and what to load · recommended · every session, about 358 tokens · you have: not yet
- [x] handoff: a note at the end of a session so the next one starts where you stopped (which episode you were on) · recommended · every session, about 73 tokens · you have: not yet
- [x] memory-index: remembers facts such as your clip style between sessions · recommended · every session, about 51 tokens · you have: not yet · size: light (one `NOTES.md`)
- [ ] session-end-check: not chosen
- [ ] vault: not chosen
- [ ] decision-log: not chosen
- [ ] session-start-status: not chosen

## Skills (`05-skills`): taken

- [x] skillspector: scans anything from outside before it is installed; its rule line goes in the front door · core · every session, about 60 tokens for the rule line (estimate) · you have: partly (scanner v2.2.3 installed, rule line missing)
- [ ] writing-great-skills: not chosen
- [ ] using-agent-skills: not chosen

## Identity and contract (`07-identity-and-contract`): taken

- [x] identity-style: keeps your clip and subtitle habits so you stop repeating them · optional · every session, about 89 tokens · you have: not yet · size: light
- [ ] identity-relationship: not chosen
- [ ] identity-user: not chosen
- [ ] identity-soul: not chosen

## Context and models, Planning, Delegation, Git and guardrails, Agents and the council, Data work, Tools and MCP servers, Workspace layout, Experiments and evaluation: skipped

## Domains

- [x] audio-video-media: understand, clip, clean up, transcribe, subtitle and publish recordings · about 69 tokens every session (estimate) · scope: this project only · you have: not yet
- [x] media-critic (agent of audio-video-media): reviews a render from frames and measurements before you post · about 80 tokens every session (estimate) · you have: not yet

## Single picks

None.

## Not in this version

- wiki-graph, session-archive: listed as "later" by the kit, not offered.
```

### `adoption/handover.md`

```markdown
# Hand-over

**Date:** 2026-11-09 · **Kit version:** v2.0.0 · **Wave:** 1

Written by `drill-to-adopt` in phase 5, Verify, at the end of a sitting that ends with some rows still waiting.

## What you have now

| Item | Where it lives | Check run | Result |
|---|---|---|---|
| skillspector | scanner on this machine (v2.2.3); rule line in `AGENTS.md` | `skillspector --version`; scan of a kit skill; rule line present | pass: printed `SkillSpector v2.2.3`; `claim-auditor` 0/100 SAFE; `SkillSpector` found in `AGENTS.md` |
| setup folder | `setup/` (git repository, no remote, nothing committed yet) | files exist | pass: `AGENTS.md`, `CLAUDE.md`, `NOTES.md`, `identity/STYLE.md`, `handoffs/`, `adoption/` listed |
| handoff (standard) | `.claude/skills/handoff/SKILL.md` | fresh session asked "where did we stop?" | pass, as you reported: answered from `handoffs/2026-11-09-adoption.md`. The "wrap up" run is not seen yet. |
| front-door (standard) | `AGENTS.md`, `CLAUDE.md` | import line count; fresh session asked what it must never do | pass: count 1; you reported the answer came from `AGENTS.md` |
| memory-index (light) | `NOTES.md` | named in `AGENTS.md`; fresh session answers from the first note | check 1 pass (count 2); check 2 not run yet |
| identity-style (light) | `identity/STYLE.md`, imported by `AGENTS.md` | fresh session answers clip and subtitle rules; diff before an edit | the answer came from `identity/STYLE.md`, as you reported; the diff check not run yet |
| audio-video-media pack | `.claude/skills/audio-video-media/` | files identical to the kit copy; fresh session opens the pack | identical (`diff` printed IDENTICAL); you reported it opened for a clean-up request; "what is in this video?" on a real file not run yet |
| media-critic agent | `.claude/agents/media-critic.md` | `cmp` against the kit file | identical; not yet seen in a fresh session |

## Still waiting on you

- **Row 3, scan what you already have:** skipped. Your user-level `~/.claude` was never read, so any skills or plugins there are unscanned. To do it later, run `! ls ~/.claude` and say "scan what I already have".
- **Row 6, memory:** ask a fresh session "may I push to GitHub?" and see it answer from `NOTES.md`.
- **Row 7, style:** say "add a line to `identity/STYLE.md`: no exclamation marks" and see a diff before it saves.
- **Row 8, the pack:** give a fresh session a short video of yours and ask "what is in this video?".
- **Row 9, the reviewer:** type `/agents` in a fresh session and look for `media-critic`.
- **Handoff, the "wrap up" run:** at the end of a real working session, say "wrap up" once and watch it write a note and commit.
- **The first commit:** the setup folder has nothing committed yet. The first "wrap up" makes it. There is no remote; add a private GitHub one when you want pushes.
- **Transcripts:** no speech-to-text tool is chosen yet. Claude will name the options when you first ask for a transcript.

## How to resume tomorrow

1. Start a new session in the setup folder (`setup/`), rather than resuming today's.
2. Say: "Read the newest note in `handoffs/` and `NOTES.md`, tell me where we stopped, and then help me with the next episode using my clip and subtitle habits."
3. The answer comes from the front door (`AGENTS.md`), `NOTES.md`, `identity/STYLE.md` and the newest handoff note.

Fresh-session proof, run on 2026-11-09 in a second terminal: asked what it must never do, the answer came from `AGENTS.md`; asked for the clip and subtitle rules, from `identity/STYLE.md`; asked "where did we stop?", from `handoffs/2026-11-09-adoption.md` (all as you reported). Pass.

## What loads into every session

| | Tokens (estimate unless marked measured) |
|---|---|
| Before the adoption (phase 1, the audit) | about 0 (setup folder only; user level not read) |
| Your choice (phase 2, the menu) | about 900 (upper bound) |
| Now (phase 5) | about 714 |

"Now" is file sizes divided by 4 (an estimate): instruction files and memory 2,097 bytes (about 524), plus the descriptions of the handoff skill, the pack and the agent (about 190). The heaviest three: the front door (about 369), the style page and `NOTES.md` together (about 150), the pack's description (about 72). Your user-level files were not measured; `/context` shows the live total.

## Skipped, and why

| Item or module | Why |
|---|---|
| Context and models, Planning, Delegation, Agents and the council | nothing you named needs them |
| Git and guardrails | not chosen for now; handoff commits without a remote |
| Data work, Experiments and evaluation | not for podcast and clip work |
| Tools and MCP servers, Workspace layout | no connected tools; you do not use claude.ai |
| The user, relationship and soul identity pages | not chosen |
| Advisor council domain | you named no big-decision job |
| Posting to the social platforms | not covered by the kit; you post by hand |
| Scan of `~/.claude` (row 3) | skipped for now |

## When the kit changes

Pull the kit (`git pull` in its folder), read the top of its `CHANGELOG.md`, open Claude Code in the kit and say "Update my adoption." Only new or changed items are asked about; your answers in `adoption/features.md` and `adoption/decisions.md` stand. To take the next items from your plan's Later waves, say "next wave".
```

### `adoption/inventory.md`

```markdown
# Inventory

Written by `drill-to-adopt`'s discovery, read-only, on 2026-11-09. Only manifests and instruction files were read; secrets and data files are counted, never opened.

**Setup folder:** <setup> · **Looked at:** the whole folder · **Starting point:** empty

profiles: general (nothing to infer from: the folder holds no files; to be confirmed in round 1)

## Already installed
| Kind | Name | Scope | What it does (its own description) | Tokens every session | Scanned (yes / no / unknown) | Against the kit |
|---|---|---|---|---|---|---|
| tool | SkillSpector v2.2.3 | machine (on PATH) | static scanner for skills, plugins, hooks | 0 (loads nothing) | n/a | this is the kit's `skillspector` item; the scan-first line is not yet in any front door |
| tool | git 2.54.0 | machine | version control | 0 | n/a | needed by git items |

Project level (`.claude/` in the setup folder): none. User level (`~/.claude`): not read. This session may only read the kit and the setup folder, so skills, agents, plugins and hooks there are **unknown**, not "none".

## Stack
| Kind | Found | Where (manifest or file type) |
|---|---|---|
| none | the folder is empty | |

## File types (top 15)
| Extension | Count |
|---|---|
| (no files) | 0 |

## Repositories
| Folder | Remote host | Branch | Clean |
|---|---|---|---|
| none: the folder is not a git repository yet | | | |

## Existing Claude setup
| File or folder | Present | Notes |
|---|---|---|
| `CLAUDE.md`, `AGENTS.md` | no | |
| `.claude/settings*.json` | no | |
| `.claude/skills/`, `.claude/agents/` | no | |
| `.mcp.json` | no | |
| Other agents' instructions (`.cursorrules`, `.github/copilot-instructions.md`) | no | |

## Hooks
| Repository | Hook setup (`.husky/`, `.pre-commit-config.yaml`, `.git/hooks/`) |
|---|---|
| none (no repository) | |

## Present but not opened
Nothing: no secret-looking or data files.

## What loads into every session today
| What | Size | Tokens (estimate) |
|---|---|---|
| Instruction files and what they import | 0 bytes in the setup folder (user level not read) | about 0 |
| Skill descriptions (0 found in the setup folder) | 0 | about 0 |
| Agent descriptions (0 found in the setup folder) | 0 | about 0 |
| **Total** | setup folder only | **about 0** |

An estimate: file sizes divided by 4, setup folder only. Type `/context` in Claude Code to see the live breakdown, user level included.

## What the kit covers
| Your work or tool | Covered / partly / not covered | Kit module or item |
|---|---|---|
| (to be filled after round 1) | | |

## Kit items you already have
- skillspector: **partly**. The scanner is installed (v2.2.3); the scan-first line is not in any front door yet.
- uv: not checked (needs an approval); only needed if SkillSpector has to be reinstalled.
- All other cards: **not yet** (an empty folder holds none of their files). Cards that look at user-level files were not run.

## Confirmed in round 1
(not yet asked)
```

### `adoption/plan.md`

```markdown
# Adoption plan

**Spec:** `adoption/spec.md`, approved 2026-11-09 · **Kit version:** v2.0.0

Written by `drill-to-adopt` from your approved spec, in waves, one item per row. `vet-and-adopt` takes the first row without a tick, follows that item's card, and ticks the row only after the row's check has passed.

## Wave 1: the first sitting

| # | Item | Module | Route | Steps only you can do | How you will see it works | Done |
|---|---|---|---|---|---|---|
| 1 | skillspector: SkillSpector and the scan-first rule | 05-skills | adopt | none (already installed); the rule line is shown to you before it is saved | `skillspector --version` prints a version, and a scan of one kit skill prints a verdict | [x] 2026-11-09: v2.2.3; claim-auditor 0/100 SAFE; rule line in `AGENTS.md` |
| 2 | setup-workspace, create mode | 11-workspace-layout | run | none; `git init` comes as its own question afterwards | every file of the tree exists, copied from the kit's templates | [x] 2026-11-09: the 4 files exist (`AGENTS.md`, `CLAUDE.md`, `identity/STYLE.md`, `handoffs/TEMPLATE.md`); `.claude/` folders are made by rows 8 and 9 |
| 3 | scan what you already have | 05-skills | read-only | say yes to reading your user-level `~/.claude` | each installed item scanned, result in `adoption/decisions.md`, nothing changed | [ ] |
| 4 | handoff (standard) | 01-continuity | adapt | none | a fresh session asked "where did we stop?" answers from your note | [x] 2026-11-09: you reported the fresh session answered "where did we stop?" from `handoffs/2026-11-09-adoption.md`. The end-of-day "wrap up" run is still to be seen once. |
| 5 | front-door (standard) | 01-continuity | adapt | read the draft and change what you would not sign | `grep -cE '^@AGENTS\.md' CLAUDE.md` prints 1; a fresh session answers "What must you never do here?" from the file | [x] 2026-11-09: `CLAUDE.md` import line count 1; you reported the fresh session answered the never-do list from `AGENTS.md` |
| 6 | memory-index (light) | 01-continuity | adapt | none | a fresh session answers a question only the first note answers | [ ] saved 2026-11-09; check 1 passed; waits on you: ask a fresh session "may I push to GitHub?" and see it answer from `NOTES.md` |
| 7 | identity-style (light) | 07-identity-and-contract | adapt | tell me your clip and subtitle habits | a fresh session answers in the style you wrote, and shows a diff before editing the file | [ ] saved 2026-11-09; you reported the clip and subtitle rules came from `identity/STYLE.md`; waits on you: say "add a line: no exclamation marks" and see a diff before it saves |
| 8 | audio-video-media pack | domains | adopt after scan | none (`ffmpeg` is installed) | in a fresh session, a short video of yours: "what is in this video?" reads the pack's entry and answers from the file | [ ] installed 2026-11-09, identical to the kit copy; you reported the pack opened when you asked to clean up a recording; waits on you: "what is in this video?" on a real short video |
| 9 | media-critic agent | domains | adopt after scan | none | the file exists in `.claude/agents/` and the agent appears in a fresh session | [ ] installed 2026-11-09, identical to the kit copy; waits on you: see `media-critic` listed in a fresh session (for example by typing `/agents`) |

## Later waves

Nothing is waiting: everything you chose is in wave 1. Say "next wave" or run update mode when you want more, for example the user page, the git guardrails, or a speech-to-text tool for transcripts.
```

### `adoption/spec.md`

```markdown
# Adoption spec

**Adopter:** <name> · **Kit version:** v2.0.0 · **Date:** 2026-11-09
**Written by:** drill-to-adopt · **Approved:** 2026-11-09

## 1. Profile
- Work, in your own words: "I run a small weekly podcast and make short video clips for social media from my recordings. I want Claude to help me cut out silences and ums, make transcripts and subtitles, and get clips ready to post."
- profiles: general (confirmed in round 1; no code or data-science files)
- Where Claude is used, plan, operating system: Claude Code only; Max or Ultra plan (said by you; `/status` can confirm); Windows 10
- Where this setup lives, and the folder you start from each day: the folder `<setup>` (empty today, not a git repository yet). You start Claude Code there.
- Layout today: nothing exists yet; reorganize: no; folders you named: none

## 2. Data rules to respect
- What may leave: nothing here is sensitive; it is your own public podcast (your words).
- Account: your personal Claude account may see this work.
- Remote: a repository here may have a remote on GitHub, private.
- Pushes are still shown to you before they run. Session content (recordings' frames, transcripts) goes over the network like any session content (`docs/facts.md`, "Claude Code: plans, account, attribution and where session content goes"). Guests' voices are in your recordings; that is your call, and I did not ask about guest consent.

## 3. What goes wrong today
"Every new session forgets my clip style and which episode I was on, and I repeat the same instructions about subtitles."

## 4. Adoption list
One row per item.

| # | Item | Module | Expected decision | Variant (Code / claude.ai / both) | Size | Tailoring |
|---|---|---|---|---|---|---|
| 1 | skillspector | 05-skills | ADOPT (keep installed v2.2.3) | Code | n/a | rule line goes in the setup folder's front door |
| 2 | setup-workspace, create mode | 11-workspace-layout | run | Code | n/a | whole template tree in the empty folder; `git init` is its own question afterwards |
| 3 | scan what you already have | 05-skills | read-only | Code | n/a | your user-level `~/.claude` was not read in the audit; needs your OK to read it |
| 4 | handoff | 01-continuity | ADAPT | Code | standard | skill in this setup only; commit and push, each push shown first |
| 5 | front-door | 01-continuity | ADAPT | Code | standard | new `AGENTS.md` plus one-line `CLAUDE.md`; setup folder only |
| 6 | memory-index | 01-continuity | ADAPT | Code | light | `NOTES.md`; Claude proposes a fact and saves it on your yes |
| 7 | identity-style | 07-identity-and-contract | ADAPT | Code | light | imported into every session; starts with your clip style and subtitle habits |
| 8 | audio-video-media (domain) | domains | ADOPT after scan | Code | n/a | this project only; `ffmpeg` 8.1 already installed |
| 9 | media-critic (agent of the domain) | domains | ADOPT after scan | Code | n/a | reviews a render from frames and measurements |

## 5. Ruled out
| Item or module | Why |
|---|---|
| Context and models, Planning, Delegation, Agents and the council | not chosen; nothing you named needs them |
| Git and guardrails | not chosen for now; the first sitting commits only through handoff |
| Data work, Experiments and evaluation | not for podcast and clip work |
| Tools and MCP servers, Workspace layout (claude.ai Project, project registry) | no connected tools; you do not use claude.ai |
| The other identity pages (user, relationship, soul) | not chosen |
| Advisor council domain | you named no big-decision job |

## 6. Open
- Handoff and the front door: the token figures differ between the menu and the cards. About 900 tokens every session is the upper estimate; it is measured again in Verify.
- Your user-level `~/.claude`: unknown (see row 3).
- Which speech-to-text tool you will use for transcripts: not decided; the pack's transcribe skill states what it needs. Default: Claude names the options when you first ask for a transcript.

## 7. Updates
(none yet)

## 8. Gaps

| Need | Covered by | Route | Candidate or skill to write | Decision |
|---|---|---|---|---|
| Cutting silences and ums | audio-video-media (cut-spoken-recording) | n/a | n/a | covered |
| Transcripts | audio-video-media (transcribe-recording) | partly: needs a speech-to-text tool, not yet chosen | n/a | partly covered |
| Subtitles | audio-video-media (clip-into-shorts, transcribe, publish-ready-media) | n/a | to be confirmed by a real check | covered |
| Short clips for social | audio-video-media (clip-into-shorts, publish-ready-media) | n/a | n/a | covered |
| Which episode you are on, clip style | handoff, memory-index, identity-style | n/a | n/a | covered |
| Posting to the social platforms | nothing | skip: you post by hand | none | not covered |
| GitHub private remote | git, handoff (commit and push) | n/a | n/a | covered |
```

### `adoption/staged/handoff-SKILL.md`

```markdown
---
name: handoff
description: Close out a work session. Use when I say "wrap up", "end of day", "let's wrap up", "save everything" or "/handoff", not when I am just pausing. Sweeps memory, writes the handoff note, commits, and names what is left undone.
---

# handoff

If I am only pausing, say so and skip this: closing out a session that will continue is wasted.
Make a todo per step and do them in order. Say which step you skip and why.

1. **Real state first.** Run `git status --short`. Never close out against an assumed state.
2. **Memory sweep.** A fact goes into `NOTES.md` (one line: the fact, why, the date) only if it
   passes all four tests: non-obvious, durable, changes what a later session does, carries its why.
   Sharpen an existing line rather than adding a near-duplicate; correcting a line this session
   proved wrong is worth more than any addition. Never delete a line to make room. Writing
   nothing is a valid result: say so, never pad.
3. **The note.** Write `handoffs/YYYY-MM-DD-<topic>.md` from `handoffs/TEMPLATE.md`. Always name
   the episode I was working on and its stage (recorded, cut, transcribed, subtitled, clips made,
   posted). "Done" lists what was checked and how, not what was attempted.
4. **Commit.** After steps 2 and 3, so nothing written last is left out: commit what this session
   wrote, in coherent commits, each message saying why. Push only if a remote exists, and show
   me the push first. With no remote, say "committed, no remote".
5. **Check.** `git status --short` must print nothing the session wrote. With a remote,
   `git rev-list --count --branches --not --remotes` must print `0`.
6. **Say it.** Last message: what was done, what was verified and how, what is deliberately
   left open, and the first thing the next session does.

Never: merge a PR, force-push, rewrite history, tag; call a repository clean without checking it;
invent a memory to look productive. If something is broken and cannot be fixed now, it goes in
the report.
```

### `handoffs/2026-11-09-adoption.md`

```markdown
# Handoff: adoption of the kit, wave 1 (2026-11-09)

**Done:** The setup folder was built and wave 1 installed. Checked: `skillspector --version` prints v2.2.3; the front door `AGENTS.md` and `CLAUDE.md` (`@AGENTS.md`) exist; `NOTES.md` holds one first memory; `identity/STYLE.md` holds the clip and subtitle habits and is imported by the front door; the `handoff` skill, the `audio-video-media` pack (17 files) and the `media-critic` agent are in `.claude/`, each identical to the vetted copy. The folder is a git repository with no remote and nothing committed yet.
**Decided:** Claude Code only; Max or Ultra plan. Nothing here is sensitive (own public podcast); a private GitHub remote is allowed; pushes are shown first. Memory is light (`NOTES.md`). Posting is done by hand, never by Claude. Details are in `adoption/spec.md` and `adoption/decisions.md`.
**Open:** (1) The scan of anything already in the user-level `~/.claude` was skipped; it was never read. (2) No speech-to-text tool is chosen for transcripts yet. (3) The first commit has not been made; no remote exists. (4) No episode has been worked on yet. (5) Tone, length and report-format lines are not in `identity/STYLE.md`.
**Next session starts with:** Ask which episode to work on first, and try the pack on one real recording: "what is in this video?" Then, at the end, say "wrap up" to test the handoff skill.
**Resume prompt:** I run a weekly podcast and cut clips. Read the newest note in `handoffs/` and `NOTES.md`, tell me where we stopped, and then help me with the next episode using my clip and subtitle habits from `identity/STYLE.md`.
```

### `handoffs/TEMPLATE.md`

```markdown
# Handoff: <topic> (<YYYY-MM-DD>)

**Done:** <what changed, with links to files, queries, PRs or dashboards>
**Decided:** <decisions, and who made them>
**Open:** <what is unfinished, and what it waits on>
**Next session starts with:** <the first concrete step>
**Resume prompt:** <one paragraph to paste as the first message of the next session or chat>
```

### `identity/STYLE.md`

```markdown
# STYLE.md: how Claude works for me

## Clips
- 30 to 45 seconds, vertical.
- Always cut pauses longer than one second, and the ums.
- Never add music.

## Subtitles
- In the lower third, two lines at most, about 6 words per line.
- White text with a dark outline.
```
