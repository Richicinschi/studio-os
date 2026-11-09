---
id: story-short-film
title: Turn a story into a short film
---

## When to use

Use this when the person has a story, a script or a rough idea and wants it developed into a short film or an animated short: "turn my story into a short film", "help me plan a one-minute video story", "I want a storyboard and shot list".

The job ends at a set of linked planning files, ready for filming or for generation. Neighbours take over after that:

- `ai-video-generation`: when the person wants the shots actually generated. Hand over the shot list and the consistency sheet from this skill.
- `video-edit-craft`: when footage already exists and needs cutting, pacing or finishing.
- `narrated-video`: when the piece is mainly a voice-over over pictures rather than characters in scenes.

Content boundaries, stated plainly to the person if they come up:

- No real person is depicted or imitated without that person's consent.
- No explicit content.
- Fiction does not target a named private individual. If the story is built to mock, expose or harass one, decline that part and say why. Offer an invented character instead.

## How it works

Work in a project folder, one plain Markdown file per stage, so the work can stop and resume and the person can open and edit any file. Do not hold the project only in the conversation.

1. **Set up the folder and the status table.**
   - Ask where the project folder should live, or propose one named after the working title.
   - Create `00-project.md`. Its top is a status table with one row per stage (idea, outline, cast, scenes, storyboard, shot list, production notes) and a state for each: not started, drafted, approved.
   - Below the table keep a short decisions log: date, what changed, why. Keep the whole file short enough to read in one go.
   - On a later visit, open `00-project.md` first, restate in three sentences what the project is, which stage is done and what was last decided, and continue from there. Do not reopen approved decisions unless the person does.
   - If the person only wants a one-off outline right now and will not come back, skip the folder and do the stages in the conversation.

2. **Ask one question at a time.** Never put several questions in one message. If something can be inferred from what the person said, fill it in and mark it "to confirm". Ask only what blocks the next stage.

3. **Show each stage and wait.** After writing a stage file, show it (or its key lines), say what you assumed, and ask for approval or changes. Only mark it approved in the status table when the person says so. Do not start the next stage first. Update the table after every stage.

4. **Fix the running time before anything else is planned.** Ask the format, then budget with it:
   - Vertical short of about a minute: spoken narration runs roughly three to four words per second, so a minute holds about 200 words at most. Plan for 3 to 6 scenes, shots of 2 to 5 seconds, and the first shot must grab attention.
   - Longer animated piece (3 to 10 minutes): plan roughly one scene per 30 to 60 seconds, so 5 to 15 scenes.
   - Write the total, the scene count and an approximate seconds-per-scene into `00-project.md`. When a later stage overruns the budget, cut scenes before cutting the ending.

5. **Stage: idea and logline** (`01-idea.md`). One sentence: who wants what, what stands in the way, what is at stake. Add genre, tone, audience and the intended hook (the first few seconds). If the person supplied a full script, record its premise here and treat the script as the source of truth for later stages.

6. **Stage: outline** (`02-outline.md`). A list of beats, each one line: the opening hook, the setup, escalating complications, the turning point, the climax, the ending. Check that the ending answers the question the hook raised. Check that every beat changes something; delete beats that only repeat.

7. **Stage: cast and consistency sheet** (`03-cast.md`). For each character: name, role in the story, look (age, build, hair, clothing, distinguishing marks), voice (tone, pace, accent as a description), traits and one want. Then add a short "keep the same" rules block for the whole piece: the fixed wording used to describe each character in every shot, fixed colours of clothing, the visual style, the colour palette. This sheet is what keeps characters identical from shot to shot, so every later prompt must reuse its wording word for word. Never base a character on a named real person, and never give a voice description that imitates a specific real person. If the person wants a real voice or likeness, only proceed with that person's own consent.

8. **Stage: scene list** (`04-scenes.md`). One entry per scene: number, place and time, who is in it, the one thing the main character wants in that scene, what happens, how it changes the situation, estimated seconds. Total the seconds against the budget from step 4.

9. **Stage: storyboard** (`05-storyboard.md`). One frame description per shot, numbered to match the scenes (for example 3.2 is the second shot of scene 3). Each frame: what is visible, who is where, the action, the emotion shown on screen. Describe pictures, not thoughts. If the person can draw or wants images, offer rough sketches; otherwise words are enough.

10. **Stage: shot list** (`06-shots.md`). A table, one row per shot: shot number, shot size (wide, medium, close-up, extreme close-up), camera angle, camera movement (static, pan, tilt, push in, tracking), duration in seconds, action, sound (dialogue, effects, music, silence). Add a column for the cast sheet characters present. Check the durations add up to the budget, and that shot sizes vary instead of repeating one size many times in a row.

11. **Stage: production notes or prompts** (`07-production.md`).
    - For filming: locations, props, costumes, a rough shooting order grouped by location, and what must be recorded as sound.
    - For generation: one prompt per shot built from the shot list row and the cast sheet wording, plus a style line shared by every prompt. Then hand off to `ai-video-generation` to run them. This skill does not run generation. Any paid generation or speech call asks first, with the cost stated, and uses whatever service the person already has set up. Do not name a default service.
    - Only a voice whose owner consents is ever cloned or imitated.

12. **Close.** Update the status table, list the files, and say what was not decided (open questions go in `00-project.md`).

### Craft rules, applied at every stage

- Hook in the first seconds: open on the strangest, most urgent or most promising image, not on setup.
- One want per scene. If a scene has two, split it or cut one.
- Show, do not tell: if the picture already shows it, do not also say it in dialogue or narration.
- The ending pays off the hook. Name the hook in `01-idea.md` and check the final beat against it.
- Cut anything that does not change the situation or reveal character.

## Checks before done

- The project folder exists with `00-project.md` and one file per stage reached, and the status table matches which files exist.
- Every stage marked approved was shown to the person and approved by them in their own words.
- The scene count and total seconds in the scene list and shot list fit the running-time budget written in `00-project.md`.
- Every shot row names the characters present, and each character appears with the same wording as in the cast sheet.
- The final beat of the outline answers the hook written in the idea file.
- Nothing in the cast or story depicts, imitates or targets a real named person, and nothing is explicit.
- No generation or speech call was made without the person agreeing to the stated cost.
