---
id: ai-video-generation
title: Plan an AI-generated video
requires: [a generation service]
---

## When to use

Use this when the person wants video, images, voices or music made by an AI generation service and needs help planning the work and writing the prompts. Typical requests: "make me a 20-second product video", "generate a few shots of a mountain at dawn", "I need a calm music bed", "write the prompts for a short clip".

No service is the default. Work with whatever service the person already has set up, and ask which one if you do not know. Start from the goal and the budget the person states. If they state no budget, ask for one before planning anything.

Neighbouring jobs:
- Cutting, joining, trimming or captioning footage that already exists: a video-editing skill takes over once the generated files are on disk.
- Turning a link into a clip: that is a different job. Work from the person's own file by default; download from a link only when they say the content is theirs or the platform allows it.
- Drawing a logo or a still graphic by hand: use the design or illustration skills.

Refuse, and say why in one sentence, any request for a video that depicts, imitates or targets a named private individual. Also refuse any real person's likeness or voice without their consent, impersonation, and explicit content. Respect the rules of the service the person uses.

## How it works

1. **Get the brief.** Ask only for what is missing: the goal (what the media is for and who sees it), the budget in money or credits, the service and exact model the person has, the length, the aspect ratio, the language of any speech, and any reference files they own. Write the brief into a project folder (step 2).
2. **Make a project folder.** One folder per piece, with subfolders for `prompts`, `candidates`, `chosen` and `jobs`. Save the brief, every prompt and every result there so the work can be reused or resumed. Tell the person where the folder is.
3. **Write the production plan BEFORE any spending.** The plan lists every generation as a row: what it is, the prompt file, the model, the expected cost, the attempts allowed, and the fallback if it fails (a simpler prompt, a shorter duration, a still image instead of video, or dropping the shot). Add the total expected cost and the total at the maximum number of attempts.
4. **Run the validator pass on the plan** before showing it. Check each of these and fix what fails:
   - No contradictions: the same character, place and style are described the same way in every row; a shot does not start in a state the previous shot did not end in.
   - Durations add up: the shot lengths sum to the target length, shots are in order without gaps or overlaps, and no shot exceeds the maximum the model allows.
   - Nothing is missing: every shot has a prompt, every voice-over has a script, every music bed has a length that covers the picture, and every reference file named actually exists.
   - The worst-case total fits inside the budget.
5. **All-or-nothing admission for a batch.** Do not start a batch you cannot finish within the budget. If the worst-case total is above the budget, cut or shrink the plan first (fewer shots, shorter, fewer attempts) and show the person the smaller plan.
6. **Ask before EVERY paid call.** State what will be generated, with which exact model, and what it costs, then wait for a yes. Approval of the plan is not approval of each call unless the person says so in words ("go ahead with the whole batch up to this total"); even then, stop and ask again if a call would exceed its stated cost or the total.
7. **Exact model or fail.** Use the model the person chose. If it is unavailable or errors, never substitute a different model silently. Say what happened, name the alternatives and their costs, and ask.
8. **Make jobs resumable.** Most services run a job in the background and return an id. Write the id (or the result path) to `jobs/` the moment you receive it. If a wait times out or the session breaks, check the saved id and resume polling; never submit again and pay twice. Before any paid call, look in `jobs/` for an unfinished job for that same row.
9. **Keep every candidate.** Save each result into `candidates/` with a name that carries the row number and attempt number. Never overwrite one. Pick the winner with a one-line rule written down in advance (for example "the take with no distorted hands and the steadiest camera") and copy it into `chosen/`. Stop retrying when the attempts in the plan are used; do not quietly buy more.
10. **Keep shots consistent.** Before generating shots of a character, product or place, make a reference sheet: one image or short text block fixing appearance (face, clothes, colours, scale), style (palette, lens look, texture) and light. Generate or approve the sheet first, then attach or paste it into every shot prompt. Make each shot start from the state the previous one ended in.
11. **Disclose.** Tell the person to label the finished media as AI-made wherever the platform or law requires it, and offer a one-line disclosure text.

### Prompt skeleton

Write each prompt with these parts, each present and specific (an empty part is where prompts go vague):
subject, action (one visible action), setting, camera (framing and movement), light, style, duration, what to avoid.

Short patterns:
- **Product shot:** the product alone on a plain surface, slow orbit around it, soft side light with a clean highlight, premium commercial look, 5 seconds; avoid text, logos you do not own, fingers, reflections of people.
- **Landscape:** a named kind of place at a named time of day, one slow movement (mist drifting, water running), wide steady shot or gentle push-in, natural light, realistic, 8 seconds; avoid people, buildings, sudden cuts.
- **Character moment:** one invented character described from the reference sheet, one small action (turns toward the window), medium shot, warm evening light, filmic, 5 seconds; avoid fast motion, crowds, any real person's likeness.
- **Abstract loop:** flowing shapes of two or three named colours, slow regular motion that returns to its first frame, no camera move, 6 seconds; avoid hard cuts and anything that breaks the loop point.
- **Voice-over:** write the script with a target spoken length (about 2.5 words per second as a first estimate), the tone, the pace and the language; use a voice the person owns or a stock voice the service licenses, never a real person's voice without consent.
- **Music bed:** mood, tempo range, instruments, structure (quiet start, steady middle, clean ending), exact length, and "no vocals" if speech will sit on top; avoid imitating a named artist or song.

## Without local tools

If there is no generation service available, or the person has none set up, do the planning half only. Write the brief, the production plan with estimated cost ranges marked as estimates, the prompts and the reference sheet text into files the person can run elsewhere, in the order to run them. Say plainly that nothing was generated, no cost was checked against the service's real price list, and no prompt has been tested, so results may need rewording.

## Checks before done

- The plan existed, with per-generation costs, a total and attempt limits, before the first paid call.
- The validator pass was run and its findings (even "none") are stated.
- Each paid call was approved by the person with its cost stated, and the money or credits used are totalled and below the budget.
- The model used was the one the person chose, or a substitution was announced and approved.
- Every job id or path is saved in `jobs/`, and no row was paid for twice.
- All candidates are on disk, and the chosen file for each row is in `chosen/` with the selection rule written down.
- No real person's likeness or voice, no impersonation and no explicit content was used.
- The AI disclosure note was offered. If nothing was generated, the report says so.
