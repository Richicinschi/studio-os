---
id: pack-audio-video-media
module: domains
checked: 2026-11-09
tokens:
  light: 69
  standard: 69
  full: 125
---

# Domain: audio, video and media

## Why

- **The problem:** a video or a recording is slow to understand and slow to fix by hand: you scrub through it for the one moment, cut the silences one by one, and discover after posting that the loudness or the file size was wrong.
- **The reason:** this pack gives Claude thirteen jobs for media, each as a short, tested procedure: understand a video, clip it into shorts, clean up a spoken recording, transcribe, subtitle, check audio and video by numbers, get media ready to post, and make narrated, motion or AI-generated video. One reviewer agent judges a render from extracted frames and measured readings.
- **The cost of skipping it:** each media task starts from a blank prompt, and the result is judged by impression instead of measurement.
- **The principle:** [evidence before claims](../PRINCIPLES.md#evidence-before-claims). The pack's skills measure the file (loudness, peaks, cuts, size) before they call it done, and ask for approval before anything paid or public.

## Detect

Read-only: presence and versions, never the media itself. Tools some of the skills use, printed as found or not found:

- `ffmpeg -version 2>/dev/null | head -1`, and the same for `ffprobe`, `yt-dlp` and `gifsicle`.
- The pack, at project and user level: `ls -d .claude/skills/audio-video-media "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/audio-video-media 2>/dev/null`.
- Another skill that already handles video or audio, from its front matter only:
  `for f in .claude/skills/*/SKILL.md "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/skills/*/SKILL.md; do [ -f "$f" ] && sed -n '2,/^---$/p' "$f" | grep -qiE 'video|audio|podcast|transcri|subtitle' && echo "$f"; done`

The menu marks the domain **have** when the pack's folder exists; **partly** when another skill already handles media and the pack is absent; and **not yet** otherwise.

## Ask

1. **"Do you work with video or audio?"**
   - Yes: take the pack. Recommended when `adoption/spec.md` names videos, recordings, podcasts, courses or social posts as part of your work.
   - No: skip it. Recommended otherwise.
   - Not sure: skip it for now; it comes back in update mode.
   - Default when skipped: not taken.
2. **"Where?"** (only on a yes)
   - This project only. Recommended when the media belongs to one project.
   - Every project, in your user folder. Recommended when you handle media in several.
   - Not sure: this project only.
   - Default when skipped: this project only.
3. **"Take the reviewer agent?"** (only on a yes; Claude Code only)
   - Yes: `media-critic`, which reviews a rendered video or audio file from frames and measurements. About 56 tokens every session (estimate). Recommended when you publish what you make.
   - No. Recommended when you only analyse recordings.
   - Not sure: yes.
   - Default when skipped: no.

## Needs

- `ffmpeg` for most skills. Two skills need other tools: `yt-dlp` (optional, for fetching a video that is yours), and a text-to-speech or speech-to-text tool where a skill names one. Each skill lists what it needs and carries a "Without local tools" section for claude.ai, so a missing tool narrows what Claude does and stops nothing.
- SkillSpector for the scan, row 1 of your plan ([SkillSpector](skillspector.md)).

## Steps

1. **Claude:** runs `vet-and-adopt` on `catalog/packs/audio-video-media/`: scans it with SkillSpector (`skillspector scan catalog/packs/audio-video-media --no-llm`), triages the findings, and recommends the decision. Most skills run commands on your computer (`ffmpeg`, a browser for the motion-video skill, an optional download); `vet-and-adopt` reads those lines with you.
2. **Claude:** copies the entry `SKILL.md` and the `skills/` folder to `<where>/skills/audio-video-media/`, and, on a yes to question 3, `agents/media-critic.md` to `<where>/agents/`. It shows the list first and saves on your yes.
3. **you:** install `ffmpeg` if Detect did not find it. A command that installs software is handed to you to type; Claude does not run it.
4. **Claude:** records the decision, the scope, the tools found and the undo in `adoption/decisions.md`.

## Check

1. The files exist at the paths you chose.
2. **you:** in a new session, give Claude a short video of your own and say "what is in this video?". Expected: Claude reads the entry, picks the skill for understanding a video, says which tool it needs, and answers from the file.
3. On claude.ai, upload the pack's zip first ([START-HERE](../START-HERE.md), "If you only use claude.ai"); the same question works without `ffmpeg`, with the limits the skill states.
4. If Claude answers without reading the pack's entry, the item is not done: the plan row stays unticked, and the folder name is the first thing to look at.

## Undo

- **Claude:** deletes the `audio-video-media` folder from `skills/`, and `media-critic.md` from `agents/` if it was copied.
- **you:** remove the zip from claude.ai's skill settings.
- **Claude:** adds a row to `adoption/decisions.md` saying it was removed.

## Watch out

- **The entry is the one cost every session:** about 69 tokens (estimate). Its index, about 1,100 tokens (estimate), loads when a media task comes up, and each skill only when it is used.
- **Paid and public steps need your approval.** The skills that call a paid service or post media stop and ask first; keep that behaviour when you adapt them.
- **Your media is session content.** Frames and transcripts that Claude reads go over the network like any other session content ([docs/facts.md](../docs/facts.md), "Claude Code: plans, account, attribution and where session content goes"). Check your company's data rules before you give Claude a recording of a customer or a colleague.
- **Downloading a video you do not own** is not what the clipping skill is for; it states that the video is yours.
