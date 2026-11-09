---
id: subtitle-stills
title: Make subtitle images from a video
requires: [ffmpeg]
---

## When to use

Use this when the person wants the subtitle lines of a clip as one long shareable image, or as a set of stills. They might say "turn the dialogue of this scene into one picture", "screenshot every subtitle line", or "make a long image of the quotes from my video".

- The footage must be the person's own, or properly licensed. Before starting, remind them that sharing frames from a film or show may need the rights holder's permission, even when the frames are only subtitle strips.
- The job works from a video file the person has. If they give a link, ask for the file. Download from a link only when they say the content is theirs or the platform allows downloading it, and only with a downloader tool they already have. Never make a downloader the default route.
- To cut a clip or burn subtitles in for playback, use a general video-editing skill instead. To write or translate subtitles from speech, use a transcription skill instead. This skill starts once the lines exist, either on screen or in a subtitle file.

## How it works

1. **Choose the mode first, and never mix modes.** Ask which one the person wants unless they already said. If they have not decided, you may inspect the material to say which is possible, but render nothing yet.
   - **Burned-in mode:** the picture already contains the subtitles (they stay when the player's caption switch is off). You crop the strip from real frames and never redraw, retype or alter the text.
   - **Added-text mode:** the video has no subtitles on screen, and the lines come from a subtitle file or a text the person has approved. Text is drawn onto real frames. Label the result as added subtitles, never as the film's own. Do not invent or reword lines; every line must trace back to the file or the person's text.
   - If the chosen mode does not fit the material, say exactly why and ask whether to switch. Never switch silently, even when the chosen mode is harder.
2. **Check the source.** Run `ffmpeg -v error -i INPUT -f null -` and confirm it finishes without errors. Read the size and duration with `ffprobe` or the first lines of `ffmpeg -i INPUT`.
3. **Find the moments.** Use the subtitle file (SRT or VTT) timestamps. For each line, pick a time inside the cue, about a third of the way in from its start, so the text is fully shown and clear of fades. For very short cues (under about 0.6 s) use the midpoint. If the person gave a list of times or a range, use those. Without a subtitle file in burned-in mode, ask for times, or sample at a steady interval and let them pick.
4. **Skip repeats.** If two neighbouring cues show the same text, keep one. Compare the two cropped images; identical pixels mean a duplicate.
5. **Extract frames accurately.** Seeking before the input is fast but can land on the wrong frame in videos with long gaps between keyframes. Use a two-step seek: jump to three seconds before the target with the first `-ss` placed before `-i`, then place a second `-ss` after `-i` with the remaining three seconds (or less near the start). Then add `-frames:v 1` and write a PNG. Number files in order: `frame-001.png`, `frame-002.png`.
6. **In added-text mode, draw the text.** Prefer the `subtitles` filter on the subtitle file, with the same two-step seek so timing stays right. If that filter is unavailable, use `drawtext` with the approved line, a readable size, a light fill and a dark outline, centred near the bottom. Keep one style for every frame.
7. **Measure where the text is, then crop.** Never crop by guessing a fixed strip.
   - Take the bottom quarter of the frame (or the strip the person points to). Convert it to grey and ask for the bounding box of every pixel at or above about 200 in brightness, on that single frame, with the `bbox` filter: `ffmpeg -i frame.png -vf "crop=iw:ih/4:0:3*ih/4,format=gray,bbox=min_val=200" -frames:v 1 -f null -`. Read the `crop=w:h:x:y` part of the `bbox` line in the log; its `y` counts from the top of the strip, so add the strip's own top (three quarters of the frame height) to get the position in the full frame. Do not use `cropdetect` for this: on a strip with text it finds the sideways range but can return an upside-down height. If the box is empty, the log has no `bbox` line. Burned-in text is usually bright and nearly colourless, often with an outline, so this box is the text.
   - Add margin: at least 25 percent of the text height above and below, and at least a few percent of the frame width on each side. Round to even numbers.
   - If the box is empty or covers under about 2 percent of the width, no text was found. Do not crop; show the person the frame and ask.
   - Prefer over-including background to cutting a letter. When two measurements disagree, take the larger box.
   - Check the vertical edges first: a crop edge must fall in clear background, never through a line of text. For two-line subtitles the box must hold both lines.
   - If the person wants the sides trimmed, compute the boxes for all frames, take the union (leftmost left, rightmost right), and use that one horizontal range for every frame. If sides need not be trimmed, keep the full width.
8. **Make widths consistent.** Every crop must end up the same width before stacking. If the source frames differ in size, scale each crop to the same width, keeping the aspect ratio. Never stretch.
9. **Stack in order.** Join the crops from first to last with the `vstack` filter (`-filter_complex` with `inputs=N`). With more than about 25 crops, stack in batches and then stack the batches. Optionally keep a few pixels of uniform spacing between strips.
10. **Fit sharing limits.** Platforms limit file size and sometimes height or pixel count, and the limits change. Tell the person to check the current limit of the place they will post. As a working default, split into parts of 8 to 12 lines, name them `part-1`, `part-2` and so on, and report each part's pixel size and file size. If a file is too big, convert to JPEG at a high quality setting, or reduce the width evenly across all parts; never drop lines silently.
11. **Name the output, never overwrite.** Create a folder beside the video called `<video-name>-subtitle-stills`. If it exists, use `-2`, `-3` and so on. Inside, keep the single frames in a `frames` folder, the stacked images at the top level, and use `ffmpeg -n` so no existing file is replaced. Note that `-n` leaves the old file alone but ffmpeg still exits with status 0 and only logs "already exists", so choose a fresh name before running instead of relying on the exit status, and confirm the new file exists afterwards.
12. **Report.** Say the mode used, the number of lines, the output folder, each file's size, and the copyright reminder in one sentence.

## Without local tools

Without ffmpeg, nothing can be produced here, and you must say so plainly: no frames were extracted, cropped or stacked, and nothing was checked. Offer the manual route instead.

1. Say which mode fits, using the rules above.
2. In their own video player, the person can pause on each subtitle line and use the player's snapshot or screenshot function, or step frame by frame (usually with a comma or period key). If there is a subtitle file, its timestamps tell them where to pause.
3. Give the crop rules in plain words: crop in a photo editor or a phone's edit screen; the top and bottom edges must sit in empty background, with a margin of about a quarter of a text line's height; keep the same width for every strip; check no letter is clipped.
4. Stack with any image editor, a collage app, or a document with images placed one under another at the same width, in order.
5. Offer to write the ffmpeg commands out for them to run later on a computer that has it, and say those commands would be untested.

## Checks before done

- The mode was chosen by the person or confirmed, and every frame in the result belongs to that one mode.
- The source decoded without errors, and the number of output strips matches the number of lines (minus reported duplicates).
- At least one extracted frame was opened and its text matched the cue it came from.
- For every strip, the measured text box sits fully inside the crop with margin, and no line of text is cut at any edge. Look at the first, the last and one in the middle.
- All strips have the same width in the stacked image, and the order matches the timestamps.
- Each output file's pixel size and file size were read and reported, and the person was told to confirm the platform's current limit.
- The output folder is new or numbered, and no earlier file was replaced.
- The copyright reminder was given, and in added-text mode the result is labelled as added subtitles.
