---
id: narrated-video
title: Make a narrated video
requires: [ffmpeg, a text-to-speech tool]
---

## When to use

Use this when the person wants an explainer, tutorial, narrated slideshow or presenter-style video made from a topic, an article or a script. Typical words: "turn this article into a video", "make a 2-minute explainer about X", "narrate my script".

Where the neighbours take over:

- Editing, trimming or re-encoding a video the person already has: use the video editing skill, not this one.
- Measuring loudness, sync or captions on a finished file: the measurement skill. This skill hands the finished file to it in the last stage.
- Only speech with no picture (a podcast, an audio guide): the speech or audio skill.
- A link to someone else's video as the source: work from the person's own file by default. Download a link only when the person says the content is theirs or the platform allows downloading it. A downloader tool is optional, never the default.

Refuse a video that depicts, imitates or targets a named private individual. Say why: it can harm them and they have not agreed.

## How it works

Keep one project folder. Everything below is written into it, so a stopped job can resume by looking at what exists.

Audio is the master clock. Generate the narration first, measure the real length of each sentence, then set every scene length from those numbers. Never guess durations and then squeeze the voice to fit.

Seven stages. Each ends in a gate: stop, show the result in plain words, and wait for an explicit yes.

1. **Topic and audience.** Write down who it is for, what they should know or do afterwards, target length, language and tone. Gate: the person confirms this short brief.
2. **Script.** Write the narration in scenes.
   - One idea per scene. If a scene needs "and also", split it.
   - Plain spoken language: short sentences, no stacked clauses, numbers written the way they are said.
   - Read-aloud test: read each scene aloud in your head at speaking pace; rewrite any sentence you would stumble on or run out of breath in.
   - Every figure, date or name shown or spoken must trace to something the person supplied or you can cite. Drop what you cannot support.
   - Gate: the person approves the script text.
3. **Voice.**
   - Use only a voice whose owner consents. Never clone or imitate a real person's voice without that person's consent. If the person asks for a famous or named voice, refuse and offer a stock or synthetic voice.
   - A presenter or avatar must be the person's own likeness, or clearly synthetic. Tell the person that many platforms require AI-made presenters or voices to be disclosed, and offer a one-line disclosure for the description.
   - Any paid speech or avatar call asks first, with the cost stated. Do not name a default service; use what the person has set up.
   - Make a 10-second sample of the first lines. Gate: the person approves the voice.
4. **Timing.** Generate narration per scene or per sentence. For each, measure the true duration (ffprobe reads it; for several files see the commands below). Write a timing table: scene, sentence, start, end, duration. Add a short pause between scenes (0.3 to 0.6 seconds is typical). Total narration time and each scene length come from this table. If the total misses the target by more than about 10 percent, edit the script, not the playback speed. Gate: the person sees the table and approves the length.
5. **Visuals.** Plan what is on screen per scene, with the scene length taken from the timing table. Keep each still on screen under about 3 seconds before something changes (a movement, a highlight, a cut); hold the final element of a scene for about a second before it leaves. Build the asset manifest (below) as you pick things. Any paid image or clip generation asks first with the cost; mark that asset `pending_confirmation` until the person says yes. Gate: the person approves the storyboard and the manifest.
6. **Assembly.** Build with ffmpeg: place visuals on the timing table, lay the narration, add music ducked well under the voice, burn in or attach captions made from the script and the measured times. Render at the agreed size. Gate before the final render: the person gives an explicit "render it" after seeing a preview or the plan.
7. **Final check.** Pass the file to the measurement skill: loudness, audio and video in sync, captions matching speech. Fix and re-run until it passes. Report numbers, not impressions.

### Adjustments are not consent

If the person tweaks a detail at a gate ("change that word", "make the title bigger"), apply it, show the result, and ask again. A tweak is not approval to move on. After any change that alters what the viewer sees or hears, the earlier yes for that stage does not carry over. Proceed only on an explicit yes.

### Asset manifest

Keep a file listing every image, clip, icon, font and music or sound file used. For each: an id, which scene it belongs to, type, role (background, inline, cutaway, music, effect), source (supplied by the person, stock, generated, drawn in code), status (planned, pending confirmation, resolved, failed), the path inside the project folder, licence status, credit text if required, and the cost if it was paid. Rules:

- A resolved asset must have a licence note. If licence status is unknown, mark it unknown and tell the person before rendering.
- Use only material the person owns, that is free to reuse for this purpose, or that is generated with their approval. Do not lift frames or clips from existing videos.
- Paths stay inside the project folder.

### Smallest rerun

When something changes, redo only what it forces. Reuse everything else.

| What changed | Redo | Reuse |
|---|---|---|
| Wording of the script, even one line | Narration for the changed scenes, then the timing table, then every scene after them (their start times shift), then assembly and final check | Topic brief, voice choice, visuals for unchanged scenes |
| A typo in captions only | Caption file and assembly of captions, final check of captions | Audio, visuals |
| Visuals only (layout, colours, images) | Assembly, final check | Narration and timing table |
| Music only | Re-mix music, loudness check | The picture render |
| Voice changed | All narration, timing, assembly, final check | Script, storyboard where lengths still fit |
| Target length or audience changed | Start again at the script | Nothing |

Any redo that changes what is seen or heard re-enters the render gate.

Useful commands (the same on Windows, macOS and Linux): `ffprobe -v error -show_entries format=duration -of csv=p=0 scene01.wav` prints one file's duration in seconds. `ffmpeg -i in.mp4 -af loudnorm=print_format=summary -f null -` prints loudness.

## Without local tools

If ffmpeg or a text-to-speech tool is missing, do not pretend to render. Say plainly that nothing was rendered. Deliver instead:

1. The approved script, scene by scene.
2. A scene table: scene number, the narration text, estimated duration (words divided by about 2.5 per second, marked as an estimate), and the on-screen visual described in one line.
3. The asset list with the licence notes the person must still check.
4. Short instructions for doing the build in the person's own tools: record or generate each scene's narration, measure the clips, then set the scene lengths from the measured times.

State which parts were not verified: real durations, loudness, sync and captions timing.

## Checks before done

- Every gate was passed with an explicit yes, and any later change re-asked.
- The timing table was built from measured audio durations, and scene lengths match it within about half a second.
- Total length is within about 10 percent of the agreed target.
- The asset manifest exists, and no resolved asset has a missing licence note or an unconfirmed paid cost.
- The voice is a stock, synthetic or consenting-owner voice; any AI presenter is disclosed or flagged for disclosure.
- The measurement skill passed loudness, sync and captions, with the numbers quoted.
- The output file opens and has both a video and an audio stream (ffprobe lists both).
- If anything was not rendered or checked, the report says so.
