---
id: cut-spoken-recording
title: Clean up a spoken recording
requires: [ffmpeg]
---

## When to use

Use when the person has a talking-head video, lecture or podcast with pauses, "ums" or mistakes and wants it tidied: "cut the silences", "remove the ums", "take out where I messed up and said it again".

Work from the person's OWN FILE. If they give a link instead, download it only when they say the content is theirs or the platform allows downloading it; a downloader tool is optional, never the default.

Neighbouring jobs: if the person wants captions, music, effects, a new voice or a full restyle, that is another skill; finish the cleanup first. Never imitate or clone a voice to patch a gap.

## How it works

1. **Get the transcript with word timings first.** Each word needs a start and end in seconds. If the person already has one, use it. Otherwise use a local speech-recognition tool that outputs word times. A paid speech service is used only after telling the person the cost and getting a yes. Save it as a JSON list: `[{"word": "Hello", "start": 0.5, "end": 0.9}, ...]`.
2. **Make the edit list a pure function of the transcript and settings.** Same input, same list. Run `skills/cut-spoken-recording/edit-list.mjs` (Node 22). It reads the words file and prints JSON with `cuts` (start, end, reason), `keep` (ranges to keep) and `retimedWords` (the transcript on the new timeline). It never reads or changes the media.
3. **Detectors only propose.** Nothing is cut because a detector said so. A detector is a suggestion for the person to approve.
4. **One criterion per pass.** Run the passes one at a time, in this order, so each can be reviewed alone:
   - `silence`: gaps of 0.55 s or longer (settings: `--silence`, `--pad`).
   - `filler`: um, uh and similar words from a list the person can change.
   - `repeat`: the same word twice in a row, or a retake of the same sentence.
   - `falsestart`: a word broken off mid-way.
   Repeated takes and false starts are the riskiest: the script only catches the plain cases, so also read the transcript yourself for retakes (a sentence said twice with small changes) and add those as proposals, with the reason written out.
5. **Keep a small natural pause.** When cutting a silence, leave about 0.15 s on each side (`--pad`) so speech is not clipped and breathing room remains. Never cut a pause to zero.
6. **Show the person a short list and wait for a yes.** Plain words, with timestamps: "01:12 to 01:14, a 2-second silence; 03:40, 'um'". If there are more than about 15 cuts, group them ("34 short silences, all under 1.5 s") and show the biggest and the odd ones. Do not render until the person says yes. They may remove items; apply their changes by editing the proposal, not by guessing.
7. **Write revision-checked.** Never overwrite the original recording or the earlier edit list. Each pass writes a NEW numbered file (`edit-list-1.json`, `edit-list-2.json`) using `--out`; the script refuses to write over an existing file. The script prints `inputSha256` of the words file; pass it back as `--expect-hash` on the next step so a changed file is noticed before you build on it. If the hash does not match, stop, re-read, and tell the person.
8. **Retime after cuts.** After an approved pass, take `retimedWords` as the new transcript and run the next pass on it. Timings from the old timeline are wrong once anything was removed.
9. **Render after the last approved pass.** Write the output to a new file name, original untouched. Use the keep ranges as ffmpeg `trim`/`atrim` segments (with `setpts`/`asetpts` to reset time) and join them with `concat`. Give ffmpeg the arguments as a list (no shell string built from file names or transcript text). Re-encode the cuts rather than stream-copying, because copies can only cut on keyframes and leave the picture or sound out of step. Add a very short audio fade (about 20 to 30 ms) at each join.
10. **Check the result** (see below), then tell the person what was cut, the time saved, and where the new file is.
11. **Tool updates.** Never update ffmpeg or any helper automatically. If a newer version seems needed, say which version, why, and wait for a yes; pin the version you used in your notes.

## Without local tools

Without ffmpeg (for example on claude.ai), do the same up to step 6: if the person pastes or uploads a transcript with word times, produce the edit list by reasoning, or write them the script to run later. Give them the cut times and the keep ranges as a plain list they can apply in their own editor (delete each range, or keep each range and join them). Say clearly that you did not hear or render anything, and that the cuts come from the transcript alone, so they should listen at each join. With no word timings, you can only suggest which sentences to remove, not exact times.

## Checks before done

- The original file is untouched, and the output has a new name.
- Every cut in the render was in a list the person said yes to.
- Each pass has its own numbered edit list, and the hash check passed each time.
- The output duration equals the original minus the total of the approved cuts, within about a quarter second per cut.
- The pauses you kept are audible but short; no word starts or ends clipped at a join (listen to or inspect the audio around at least three joins, including the first and last).
- No clicks at the joins, and the loudness is unchanged from the original (compare measured loudness of both files; they should be within about 1 LU).
- Picture and sound stay in step at the end of the file.
- You stated plainly anything you did not check.
