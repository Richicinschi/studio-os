---
id: transcribe-recording
title: Turn a recording into text
requires: [a speech-to-text tool]
---

## When to use

Use this when a person wants a transcript, captions, meeting notes or searchable text from an audio or video recording, in their words: "write out this interview", "subtitles for my video", "who said what in this call", "get me the quotes".

Neighbouring jobs:
- Cutting, converting or extracting the audio track from a video first: use the audio and video editing skills; come back here once you have an audio file.
- Summaries, minutes or action items from a transcript: finish the transcript here, then write the summary as a normal writing task.
- Translating the text into another language: transcribe first, then translate as a separate step.
- Making speech from text (the reverse direction): a text-to-speech skill.

Links: work from the person's OWN FILE by default. If they give a video link, only download it when they say the content is theirs or the platform allows downloading it. A downloader tool is optional, never the default route. Otherwise ask for the file.

Consent: recordings of other people may need their consent where the law requires it (calls, meetings, interviews). Remind the person once, briefly, and move on. Do not lecture and do not block, but do not help with covert recording of someone who has not agreed.

## How it works

1. **Ask what the text is for.** Notes for themselves, captions for a video, or quote-checking each need a different output. Also ask the spoken language if it is not obvious, and whether people should be named.
2. **Pick the output formats.** Offer these in plain words:
   - plain text: easy to read and search, no times;
   - timed captions in SRT or VTT: for subtitles on a video; each caption stays short (about two lines, a few seconds);
   - JSON with word times: for tools, editing apps or exact quote lookup.
   Notes usually want plain text with a time stamp at each paragraph. Captions want SRT or VTT. Quote-checking wants word times plus the plain text.
3. **Check the file.** Confirm it exists, note its length, and tell the person how long the job is likely to take if the tool is slow. If it is a video, extract the audio track to a temporary copy; leave the original untouched.
4. **Choose the tool by kind.**
   - Default: a local, offline speech-recognition tool. This is the right choice for meetings, interviews, medical, legal, family or anything private, because the audio never leaves the machine.
   - A cloud service only if the person agrees after you say plainly that the audio is uploaded to another company. If it is paid, ask first and state the cost estimate (length of audio times the price per minute). Use whichever service the person has already set up; do not pick one for them.
   - If several are available, prefer the local one.
5. **Choose the model size and language in general terms.** Bigger models are more accurate, especially with accents, noise and technical words, but are slower and need more memory. Smaller ones are fine for a clean single-speaker recording. Set the language explicitly when you know it; automatic detection can fail on short or mixed clips. For a mixed-language recording, say the result will be weaker where the language switches. For a first run on a long file, test on a one-minute sample before running the whole thing.
6. **Run the pipeline.** In plain words, the steps are: (a) cut out the parts with no speech so the tool does not invent words in silence or music; (b) recognise the words; (c) add punctuation and capital letters; (d) separate speakers, only if the person wants labels. Many tools do these together; if yours does not, say which step is missing.
7. **Speaker labels.** Label speakers Speaker 1, Speaker 2 and so on, in order of first appearance, unless the person tells you the names. If they give names, map them to the labels from what they say ("Speaker 1 is me"), not from the voice. Never guess a real name from a voice or from how someone sounds. Tell the person that labelling fails when people talk over each other or have similar voices, and offer to correct a label across the whole file once they identify one line.
8. **Pick the style: clean or true verbatim.**
   - Clean verbatim (default for notes and captions): drop "um", false starts and stutters, keep the meaning and the speaker's wording.
   - True verbatim (for quote-checking, legal or research use): keep every filler, repeat and half word.
   Say which one you used at the top of the file.
9. **Mark low confidence.** If the tool gives confidence scores, mark words or passages that fall below roughly a 0.5 to 0.6 score with a visible marker such as [unclear?] around them. If it gives no scores, mark passages with names, numbers, jargon, heavy accent or overlapping speech yourself. Then spot-check: play or read back three to five of the marked passages, plus one from the start, middle and end, and compare them to the audio if you can. Report what you found.
10. **Save the outputs.** Write them next to the source file, with the source name plus the format extension. Never overwrite an existing file: if the name is taken, add a number or a date. Delete only your own temporary audio copy.
11. **Report honestly.** Tell the person the files and where they are, how long the audio was, the tool and model size, the language, the style (clean or true verbatim), how many passages are marked unclear, and what you spot-checked.

Known limits to state when they matter:
- Strong accents, quiet speakers, background noise and bad microphones raise the error rate.
- Crosstalk: overlapping speech is usually lost or merged into one speaker.
- Jargon, product names, surnames and acronyms are often spelled wrongly. Ask for a word list or fix them in one pass afterwards.
- Numbers, dates and quoted amounts must be checked by a person before being relied on.
- Music, singing and heavily compressed phone calls are unreliable.
- A transcript is a draft, not an official record, unless a person has checked it.

## Without local tools

On claude.ai or any place with no speech-to-text tool, you cannot hear audio. Do not pretend to transcribe, and do not make up what was said from the file name or topic.

Instead:
- Ask for an existing text: the video's own captions, an auto-transcript from the meeting or video platform, or a file the person already made. If they paste it in, you can clean it up, add punctuation, split into paragraphs, apply speaker labels they dictate, convert it to SRT or VTT, and mark places that look wrong. The result is only as good as the text they gave you.
- Or give them steps to make a transcript on their own computer: install a local speech-recognition program (Windows, macOS and Linux versions exist), open the file, choose the language and a model size, pick the output format, run it, then paste the result back. Offer to write a short script if they are comfortable running one.

Say plainly in your reply that nothing was transcribed by you and that any cleanup is based on the text supplied.

## Checks before done

- The output files exist, are non-empty, and sit next to the source file; no existing file was overwritten.
- The formats match what the person said the text is for (SRT or VTT has numbered or timed cues in order and none overlap).
- The first, middle and last parts of the text were compared with the recording or tool output, and the person was told what was checked.
- Speaker labels are Speaker 1, 2 and so on, or names the person gave; no name was guessed.
- Low-confidence passages are marked, and their count is reported.
- The style (clean or true verbatim), tool, model size and language are stated.
- If a cloud service was used, the person agreed first and was told the audio leaves their machine, and the cost was stated before any paid call.
- The consent reminder was given when other people were recorded.
