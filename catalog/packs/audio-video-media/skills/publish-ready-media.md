---
id: publish-ready-media
title: Get media ready to post
requires: [ffmpeg]
---

## When to use

Use when the person wants a file smaller, converted or cleaned up for a platform, or wants a video or GIF published. Typical words: "shrink this GIF", "it is too big to upload", "remove the location from this video", "make it loud enough", "post this for me".

Work from the person's own file. If they give a link instead, only download it when they say the content is theirs or the platform allows downloading it; otherwise ask for the file. A downloader tool is optional, never the default route.

Neighbours: cutting, joining or editing the content itself belongs to the video editing skill; captions and speech belong to the transcription and subtitle skills. This skill starts once the content is final and ends when the file fits, is clean, and (only with approval) is posted.

## How it works

1. **Ask the target and its limits.** Ask where the file is going and what the limits are right now (file size, length, dimensions, format). Never state a platform's limits as fact: they change. Tell the person to check the platform's current rules and use the number they give you. If they cannot say, offer a cautious default and mark it "unconfirmed" in the plan.
2. **Probe the file.** Read the real size in bytes, duration, width, height, frame rate, streams and metadata with ffprobe. Report these numbers in plain words.
3. **Never overwrite the original.** Every result is a new file with a new name (for example `name-web.gif`). The original stays untouched.
4. **Show a plan table before doing anything.** Columns: file, what will change, target, cost (time, quality loss, money). Wait for a yes. Long tasks get a job id, and a status you can report on. If you are stuck on something only the person can supply (a limit, a choice, an approval), set the state to `needs_attention`, say exactly what you need, and stop.
5. **Fit a GIF to a size limit (the ladder).** Apply these steps in this order and stop the moment the file fits. Measure the real file after each step.
   - Lossy compression, in light, medium, then strong levels (needs a GIF optimiser tool; skip this rung and say so if only ffmpeg is present).
   - Fewer colours (for example 192, then 128, then 64).
   - A smaller scale, stepping down about 20 percent at a time, never below about 160 px wide.
   - A lower frame rate (for example 10, then 8, then 5).
   If everything is used and it still does not fit, say so, show the best result, and ask whether to trim the length or accept a different format. Run `node skills/publish-ready-media/size-fit-ladder.mjs <originalBytes> <targetBytes> <width> <fps>` to print the ordered ladder with estimated sizes as JSON. The estimates are rough guesses; the measured file decides.
6. **Convert to GIF with two passes.** First build a palette from the clip (palettegen), then apply it while converting (paletteuse). One-pass conversion gives banding and larger files. Pass arguments to ffmpeg as separate items, never as one text command assembled from names or user text.
7. **Check the loop seam.** For a looping GIF, extract the first and last frame (`ffmpeg -i out.gif -frames:v 1 first.png` and `ffmpeg -sseof -0.3 -i out.gif -update 1 last.png`) and compare them (mean absolute pixel difference, on a 0 to 255 scale): `ffmpeg -i first.png -i last.png -lavfi "blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null -` prints `YAVG=` with that number. Report it. A low value (a few units) loops cleanly; a high one shows a visible jump. Offer a fix (trim the end, or a short crossfade) instead of applying one silently.
8. **Scrub metadata by whitelist.** Keep exactly one video stream and one audio stream, copy nothing else: no extra data streams, no chapters, no global or per-stream tags. Write the result to a new file. Then verify: read the original's title, device or camera model, location text and encoder or tool name, and scan the output file's raw bytes for each of those strings. Any hit means the scrub failed; report which string and try again with a re-encode. Copying the streams removes the container tags but leaves the encoders' own signatures inside the video and audio data (the video encoder's settings note and the audio encoder's version). A recipe that clears all of them, tested: `ffmpeg -i in.mp4 -map 0:v:0 -map 0:a:0 -map_metadata -1 -map_chapters -1 -fflags +bitexact -flags +bitexact -c:v copy -bsf:v filter_units=remove_types=6 -c:a aac out.mp4` (the filter drops the video encoder's settings note; the audio is re-encoded without its signature, which costs a little quality, so say so; for a video with no audio drop the audio options). The signatures name tools, not people, so if the person accepts them, report them as left in rather than as failures. Some players show embedded data not stored in tags, so also re-probe the output and list what remains. Say what the scan covers and what it does not (picture content such as a visible face, a street sign or a screen is not metadata).
9. **Set loudness and size presets.** For common uses, suggest then confirm against the platform: speech and podcasts around -16 LUFS, general online video around -14 LUFS, true peak at or under -1 dB; vertical short video 1080 x 1920, landscape 1920 x 1080 or 1280 x 720; web and social video H.264 video with AAC audio in an mp4 container. Treat these as starting points and say to confirm against the platform's current rules. Measure loudness first, then adjust, then measure again.
10. **Publishing.** Never post without the person's explicit approval of the final file and the final text (caption, title, tags). Show both, wait for a clear yes, then post once. Do not use any tool or trick that bypasses a platform's own rules (rate limits, automation bans, age or copyright checks). Any paid service asks first, with the cost stated. If no sanctioned posting route exists, hand the finished file and text to the person to post themselves.
11. **Report.** List each output file with its new size, what changed, what was verified, and what was not.

## Without local tools

Without ffmpeg (for example on claude.ai), nothing can be probed or converted here. Give the person the plan table and the manual steps: which settings to pick in a free editor or converter (lower colours, smaller width, lower frame rate, strip metadata on export), the ladder order, and the limits question. Offer to write the exact commands for them to run on their own computer. State plainly that nothing was changed, no file was measured, and no scrub was verified. The ladder script can still be run by hand with Node if they have it.

## Checks before done

- The original file still exists with its original size and name.
- The new file's real size, in bytes, is at or under the limit the person gave, and you stopped at the first ladder step that fit.
- The width is not below about 160 px, or the person agreed to it.
- For a GIF: the seam difference number was reported.
- For a scrub: the output has one video and one audio stream at most, and the byte scan for title, device, location and tool strings found nothing (or you reported what it found).
- Loudness was measured after the change, and the number was shown, if audio was adjusted.
- The plan table was shown and approved before the work started.
- Nothing was posted unless the person approved the exact final file and text.
