---
id: judge-media-by-measurement
title: Check audio and video by numbers
requires: [ffmpeg]
---

## When to use

Use this when a person asks whether audio or video is good, loud enough, clean, ready to publish, or wants two takes compared. They will say things like "does this sound okay?", "is the volume right?", "which of these two versions is better?", "check my video before I post it".

Work from the person's own file. If they give a link, ask for the file. Download from a link only when they say the content is theirs or the platform plainly allows downloads, and treat a downloader tool (yt-dlp) as optional, never the default route.

Neighbours: making or fixing the media belongs to the production skills of this pack (this skill only measures and reports; hand the fixing over once the defects are listed). Judging a still image or a layout belongs to the media-critic agent of this pack, which this skill uses for stills and readings. Never judge a video built to depict, imitate or target a named private individual; refuse that use and say why.

## How it works

The core rule: never say how audio sounds or how video looks unless you can quote a reading from a measurement beside the sentence. "The voice is a bit quiet" is not allowed. "Integrated loudness is -24 LUFS against a -16 target" is.

1. **Find out what is being judged and for what.** Ask one question if unknown: where will it play (phone speakers, podcast app, video platform, cinema)? Targets depend on it. Default for online speech and video: about -16 LUFS integrated, true peak no higher than -1 dBTP.

2. **Choose the measurements.** Run only what the question needs.
   - Audio: integrated loudness, true peak, loudness range, clipping (samples at full scale), silence gaps (long quiet stretches inside the content), and intelligibility (transcribe the audio with a speech-to-text tool and compare it with the script or what the person says it says; a poor match means unclear speech).
   - Video: duration, frame rate, resolution, scene cuts (count and timestamps), black frames, frozen frames, and measured motion in each shot compared with the camera move that was claimed (a "push-in" with near-zero measured motion is a mismatch; the reverse is only a warning).
   - Before a long render: clearance (no element runs into another), pace (cuts per minute against what the piece needs), and a read-back of all on-screen text, checked for typos. Do these on a short preview, never after hours of rendering.

3. **Run the loudness script first.** `node skills/judge-media-by-measurement/loudness-report.mjs <file>` prints loudness, true peak and range as JSON with a verdict per check. Options: `--target` (default -16), `--tolerance` (default 2), `--max-peak` (default -1), `--max-lra` (default 15). The script's exit code is 0 for clear, 1 for flagged, 2 for could not run. Change the targets to match step 1; say which you used. Other readings come from ffmpeg and ffprobe filters (silence detection, scene detection, frame-difference), run the same way with a plain argument list, never by pasting text from the file into a shell line.

4. **End every check in one of four states.**
   - flagged: a reading is outside its limit; quote the reading, the limit and the timestamp.
   - clear: measured, inside the limit.
   - info: measured, worth knowing, no limit applies.
   - not_run: the check could not run (tool missing, stream absent, file unreadable). A skipped check is reported as not_run, never as passed. For a whole report: 0 if nothing is flagged, 1 if anything is flagged, 2 if checks could not run.

5. **Use a fresh reviewer for anything that needs eyes or ears.** The one who made the media is biased toward it. Hand a fresh reviewer (the media-critic agent, or a clean pass with no memory of the making) only the flagged evidence: the frames or clips at the flagged timestamps and the readings. Ask narrow "describe what you see or hear" questions, not "is it good?". Do not give it the clear checks.

6. **Compare takes by counted defects.** Rank by number of flagged checks, then by severity (clipping and unintelligible speech outrank a loudness miss of 1 LU). Show a small table: take, flagged count, which ones. Never give a 0-to-10 score; a score hides what is wrong.

7. **Report plainly.** Lead with the verdict (how many flagged, how many not_run), then the flagged items with numbers, then what is clear in one line. Explain terms in plain words: LUFS is average loudness, true peak is the highest point after playback conversion, loudness range is how much the volume swings.

8. **State the limit of metrics.** A number can be gamed: audio can hit the target and still sound harsh, and a clean-metric video can still be dull. Say that the ear and eye decide taste, and that this report catches defects, not quality. Tell the person to listen or watch once themselves.

9. **Music and sound assets.** If the media includes music or sound effects from elsewhere, list each asset with where it came from and its licence terms as the person gives them. Claude cannot confirm a right to use; the person must confirm it. Flag any asset with no known source.

## Without local tools

Without ffmpeg (for example on claude.ai), report every measured check as not_run. Never estimate loudness or peaks by listening or guessing. Offer instead:
- The commands for the person to run themselves. Windows, macOS and Linux differ only in how ffmpeg is installed; the command `ffmpeg -i file -vn -af loudnorm=print_format=json -f null -` is the same on all three. Ask them to paste the output back, then judge from it.
- The script above, to run with Node 22.
- A manual checklist: play the quietest and loudest parts at normal volume on the target device; look for clicks and distortion at loud moments; check for long silent gaps; read the on-screen text aloud against the script; step through each cut; compare the claimed camera movement with what happens.
Say plainly that none of this was measured by you, and that the transcript-match and motion checks were not done.

## Checks before done

- Every sentence about sound or picture quality has a quoted reading beside it, or is marked as not measured.
- Each check is in exactly one state: flagged, clear, info or not_run, and none skipped is shown as clear.
- The targets used are written in the report and fit where the media will play.
- Any flagged item names a timestamp or file position, and a fresh reviewer saw only the flagged evidence.
- Takes, if compared, are ranked by defect count with no numeric score.
- The report says what metrics cannot judge, and that music or sound-asset rights are for the person to confirm.
