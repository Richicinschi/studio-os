---
id: clip-into-shorts
title: Clip a long video into shorts
requires: [ffmpeg, yt-dlp (optional)]
---

## When to use

Use when the person wants short clips, reels or vertical videos from a longer video that is theirs: a podcast, a talk, a screen recording, a stream, a course lesson. They might say "find the best moments", "make me TikToks from this interview" or "split this lecture into parts".

Neighbours:
- Cleaning up the audio of the source first: use the audio skills of this pack, then come back.
- Making a video from scratch (no source footage): a generation or slideshow skill, not this one.
- Posting or scheduling the clips: out of scope. Hand the finished files over; publishing is public and hard to undo, so the person does it or asks you explicitly.

Rules about the source:
- Work from the person's own file by default.
- If they give a link, download it only when they say the content is theirs, or the platform clearly allows downloading it. Ask once if unclear. yt-dlp is optional: if it is missing, ask for the file instead of working around it.
- Never build a clip that depicts, imitates or targets a named private individual. Refuse and say why.

## How it works

1. **Look at the source.** Run `ffprobe` for duration, resolution, frame rate and whether audio exists. Tell the person in one line what you found. Ask for the target if not given: vertical 9:16 (1080x1920) is the default, plus how many clips and where captions should be.

2. **Get a word-timed transcript.** Each word needs its own start and end time, not only whole lines. Use a local speech recognition tool that gives word timestamps, or use the transcript the person already has if it carries word times. Save it as a JSON file in a working folder next to the video. If only line-level times exist, say that cuts will be less precise and snap to line ends instead. Do not invent timestamps.

3. **Propose 8 to 12 candidates.** Read the whole transcript. Each candidate is 15 to 55 seconds long. Score each from 0 to 100 on a weighted rubric you define and show to the person:
   - Hook, 30 percent: a bold claim, a question, a promise or a surprise in the first three seconds.
   - Stands alone, 25 percent: makes sense with no earlier context.
   - Payoff, 20 percent: a punchline, answer, reveal or clear ending.
   - Energy, 15 percent: strong opinion, humour, emotion or pace.
   - Length fit, 10 percent: tight, nothing to trim at either end.
   Weighted score = the sum of score times weight. Give each candidate start and end, a one-line hook text for the opening, and one sentence of reasoning. Do not pad the list: if the video only holds five good moments, say so rather than adding filler.

4. **The person approves.** Show the ranked table and wait. Do not cut anything until they pick which clips, and any changes (drop, merge, move a boundary). Silence is not approval.

5. **Snap the cut points.** Model-chosen times fall mid-word. For each clip:
   - Move the start to the nearest word start within about 1.5 seconds, preferring the start of a sentence.
   - Move the end to the end of the sentence within about 3 seconds after the proposed end. If none, use the nearest word end.
   - If a silence of at least about 0.3 seconds sits near a boundary, prefer the middle of that silence. Find silences with ffmpeg's silence detection filter (`silencedetect`, noise about -35 dB, minimum 0.3 s) and read its log output.
   - Add a pad of about 300 ms after the last word, and a little before the first word.
   - Clamp the length to about 5 to 60 seconds. If snapping pushes a clip outside, re-pick the boundary rather than cutting mid-sentence.
   Keep a small table of original versus snapped times and show it.

6. **Cut frame-accurately.** Tell the person plainly: copying the streams without re-encoding is fast but can only start on keyframes, so a clip may begin seconds early, show a frozen frame or lose audio sync. The safe way is to seek after the input and re-encode:
   `ffmpeg -i in.mp4 -ss START -to END -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k out.mp4`
   Put `-ss` and `-to` after `-i`. Slower, exact. Use stream copy only when the person asks for speed and accepts rough edges.

7. **Reframe to 9:16.** Choose by footage type and ask if unsure:
   - Centre crop: needs nothing; fine for a single centred speaker.
   - Face tracking: needs a face detector and per-frame positions; best for a talking head. Smooth the path so it does not jitter. If faces are small, off-centre or several, tracking can zoom onto the wrong thing.
   - Cursor tracking: for screen recordings; needs the cursor position (sample frames about every half second and find the small moving region). Pan slowly.
   - Blurred-background fit: scale the whole frame into the middle and fill the bars with a blurred copy. Safe when nothing can be cropped (slides, charts, two people side by side).
   Without a face or cursor tool, fall back to centre crop or blurred fit and say so.

8. **Burn in captions.** First check the caption filter exists: `ffmpeg -filters` must list `subtitles` (needs libass). If missing, say so and offer a separate subtitle file instead. Build the subtitle file from the word times (shift each time by the clip start), grouping 3 to 6 words per caption. Copy the subtitle file into a temp folder whose path has no spaces or special characters and burn from there, since odd paths break the filter. Run ffmpeg from inside that folder and give the file without a path (`-vf subtitles=cap.srt`): on Windows a full path with a drive letter breaks the filter because of the colon. Keep text inside the lower-middle safe area, away from the platform's edge buttons. Clean fillers in caption text only if asked; never change timestamps.

9. **Chapters (optional).** For videos over about 20 minutes, offer chapters of 2 to 5 minutes, each with a title and start time, also snapped to sentence ends. These are a separate output from shorts.

10. **Check each export** (commands are the same on Windows, macOS and Linux):
    - Opens: `ffprobe -v error -show_entries format=duration,size -of default=nw=1 clip.mp4` returns without errors.
    - Duration within the clamp and within about 0.5 s of expected.
    - Resolution 1080x1920 for vertical.
    - Audio stream present, and not silent: mean volume from the `volumedetect` filter is above about -60 dB.
    - File size sensible (not zero, not above the platform limit the person named).
    - Captions fit: extract one frame mid-clip with `ffmpeg -ss 1 -i clip.mp4 -frames:v 1 frame.png` and look at it. Text must sit inside the frame with margins.
    Report a table: clip, duration, size, pass or the problem.

## Without local tools

Without ffmpeg (for example on claude.ai), nothing can be cut. Still do steps 1 to 5 from a transcript the person pastes or uploads: the ranked candidate list with start and end times (snapped to the transcript's own word or sentence ends), hook lines, and exact cut instructions for their own editor, written as start and end timestamps in hours:minutes:seconds.milliseconds, plus the ffmpeg commands for them to run themselves if they wish. Say clearly that no video was cut or checked, that snapping used the transcript only (no silence detection), and that captions and reframing are not done. Without a word-timed transcript, say the times are approximate and give a margin of a few seconds to be trimmed by eye.

## Checks before done

- The person saw the scored candidates and approved the final list before any cut.
- Every cut start and end was snapped; a table of original versus snapped times exists.
- Each clip was re-encoded with seek after input (or the person accepted stream copy knowingly).
- Each exported file opens, has audio, is within the length clamp and has the intended resolution, shown by real command output.
- Captions were burned only after the filter check, and one frame per clip was looked at.
- The source was the person's own file, or they confirmed the rights to a link.
- Anything not done (no tool, no captions, approximate times) was said plainly.
