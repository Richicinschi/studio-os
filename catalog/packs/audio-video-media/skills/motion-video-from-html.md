---
id: motion-video-from-html
title: Make a motion video from web pages
requires: [a browser, ffmpeg]
---

## When to use

Use when the person wants an animated launch video, product demo or motion-graphics explainer made of text, screens, shapes and transitions. Typical words: "make a launch video", "animate this product tour", "a 30-second explainer with titles and screenshots".

Neighbours, and where each takes over:

- `motion-design` and `motion-dev-animations` (hub skills): animation inside a live web project, such as hover effects, page transitions and scroll effects. They do not produce a finished video file. If the person wants the animation to stay in their website, use those; if they want an MP4, stay here.
- `narrated-video`: when the video is mainly a voice explaining something. Come back here only for the animated visuals.
- `judge-media-by-measurement`: the final quality check on the rendered file.

Material rules: work from the person's own files and screenshots. If they give a link to a video, ask for the file; download only if they say the content is theirs or the platform allows downloads. Never build a video that depicts, imitates or targets a named private individual; refuse and say why. Never imitate a real person's voice without that person's consent. Any paid generation or speech service is asked about first, with the cost stated, and uses whatever service the person has already set up.

## How it works

1. **Pick the build approach, in plain words.** Offer two routes. (a) One HTML file driven by a clock: simplest, no build step, best for videos under about two minutes. (b) A component framework, where scenes are reusable pieces of code: better when the person wants many similar videos or will keep editing. Default to (a) unless the person has a reason. Tell them which you chose and why in one sentence.

2. **Hold to the core design rule.** Every frame is computed from the time `t` alone, a pure function of time. No random numbers without a fixed seed, no reading the real clock, no network calls, no animation that depends on what happened in the previous frame. The page exposes one function that sets the time (for example `seek(t)`), and everything on screen is updated from it. Payoff: any frame can be rendered, scrubbed or re-rendered identically, and one scene can be re-rendered without redoing the rest.

3. **Storyboard first.** Write a scene list as a table: scene number, duration in seconds, on-screen text, visual, motion, sound. Add total length, frame size and frame rate (default 1920x1080 at 30 fps). Show it to the person and wait for a clear yes. If they change anything, update the table and ask again. Do not build before the yes. If the person has not decided on a look, offer three short directions that differ in the central picture, not in colours, and let them choose.

4. **Assets manifest and licence check.** List every font, image, screenshot, icon, music file and clip the video uses: file name, where it came from, and its licence or the person's confirmation that it is theirs. Fonts must be installed locally or bundled; a font fetched from the web at render time breaks the "no network" rule and may not be licensed for video. Flag anything unclear and ask. Put the manifest next to the HTML.

5. **Build with motion principles.** Short rules to apply to every scene:
   - One focal point per scene; everything else is quieter.
   - Ease in and out on movement. Linear motion only for continuous things like a progress bar.
   - Hold time to read: allow at least 0.3 seconds per word of on-screen text plus a half-second beat, and never fewer than 1.5 seconds for any title.
   - A consistent transition language: pick two or three transitions and reuse them. A new transition type needs a reason.
   - Keep text inside a safe margin (about 5 percent of the frame on each side).
   - Move things at believable speeds; sudden jumps read as errors.

6. **Cheap preview first.** Render a low-resolution preview (for example 960x540 at 15 fps, or only a few sample frames per scene) and give it to the person, or a contact sheet of frames if they cannot play video. Ask for sign-off. Do not start the full-quality render until they approve. Never launch a long final render without that approval; state the expected render time before starting it.

7. **Seam checks between scenes.** At every cut or transition, render the frames just before and just after the cut and measure, with numbers rather than by eye:
   - Continuity of position: the main element's position at the last frame of scene A and the first of scene B should match where the transition says they match.
   - Continuity of speed: if something is moving as it leaves, the next thing should enter moving in a compatible direction at a similar pace. Flag a speed ratio over about 3 to 1 across a cut.
   - No flash frames: no single frame that is fully blank, fully white or a different background for one frame only. Compare each frame's average brightness with its neighbours and flag outliers.
   - No clipped text: at the cut frame, every text box lies fully inside the frame and is not cut by an element from the other scene.
   Report each seam as pass or fail with the measured value. Fix failures and re-measure; do not just say "looks fine".

8. **Render deterministically.** Step the page through times `0, 1/fps, 2/fps...`, wait until fonts and images are loaded, capture each frame as an image, and name them in order. Because of the pure-function rule, a re-render gives the same frames. Optional real motion blur: for each output frame, capture several sub-frames spread over about half the frame interval and average them. Use it for fast motion only, since it multiplies render time.

9. **Encode with ffmpeg.** Join the numbered frames at the chosen frame rate into H.264 with a pixel format that plays everywhere (yuv420p) and add the audio track if there is one, for example `ffmpeg -framerate 30 -i frames/frame_%04d.png -i narration.wav -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest out.mp4` (drop the audio input and `-c:a aac -shortest` for a silent video). State the exact command you ran. Windows, macOS and Linux differ only in how the input path is written; the options are the same.

10. **Pin versions.** Record the browser version, ffmpeg version and any library versions in a short notes file beside the video. Do not run commands that download the latest version of a tool on the fly; use what is installed, or ask the person to install a named version.

11. **Hand over.** Give the video, the HTML source, the storyboard, the assets manifest and the notes file. Run `judge-media-by-measurement` on the final file when the person wants an independent check.

## Without local tools

If there is no browser or no ffmpeg, produce the storyboard and the complete HTML source, plus the exact render and encode steps for the person to run (or for someone with the tools). Say clearly that nothing was rendered, that the seam checks were not measured, and that timing and layout were reasoned about, not seen. Offer a way to preview: opening the HTML file in any browser and moving a time slider shows any frame.

## Checks before done

- The person said yes to the storyboard, and a preview was approved before the final render.
- The HTML contains no real-clock reads, unseeded random numbers or network requests (search the source for them).
- Rendering the same frame twice gave identical images.
- Every seam has a measured result written down, and all failures were fixed and re-measured.
- No text is clipped at any cut frame and no flash frame exists.
- The assets manifest lists every font and media file with its licence or ownership note.
- The encoded file plays: its duration, frame size and frame rate match the storyboard (checked with ffprobe).
- Tool versions are recorded in the notes file.
- If anything could not be checked, the report says which check and why.
