# Visuals, video and voice for ads

Generated media is a paid and outward-facing step. Before running any paid tool, state the expected cost and wait for a yes. Tool names, quality and prices shift fast: check each provider's current terms and price page, never rely on a remembered figure. Generated people, voices and likenesses need consent and must not mislead (no fake testimonials, no invented customers, no cloned voice of someone who has not agreed).

## Pick by need

| Need | Category | Examples |
|---|---|---|
| Static ad image | Image generation | Gemini image models, Flux, Ideogram, DALL-E |
| Image with headline text inside | Text-capable image model | Ideogram, Gemini image models |
| Same product in many scenes | Image model with multi-image reference | Flux |
| Edit an existing image | Image model with editing | Gemini image models, Flux editing variants |
| Short video from a prompt | Video generation | Veo, Kling, Runway, Sora, Seedance, Higgsfield |
| Video with built-in sound | Video model with native audio | Veo, Kling, Sora, Seedance |
| Voice track | Speech synthesis | ElevenLabs, OpenAI speech, Cartesia, PlayHT, a local open-source studio |
| Many versions from data | Code-rendered video | Remotion |

Whether Midjourney offers an official public API has changed over time, so check its current documentation; unofficial wrappers risk account bans. Stable Diffusion suits teams that run their own GPUs.

## Images

- Pick a model that renders text well when the headline is in the picture, and still verify the spelling letter by letter.
- Use reference images to keep one product or person consistent across a batch.
- Ask for the exact size from the table below so no cropping is needed.
- Test several cheap drafts before one expensive high-resolution render.

## Video

- Models with native audio produce speech and effects in one pass. Some tools (Runway output, Remotion) are silent and need a voice track.
- Vertical 9:16 is needed for stories, reels, shorts and TikTok; check that your chosen model outputs it natively.
- Model strengths and which tools output sound change with every release and were not re-verified here; check each vendor's current documentation. Earlier rough guide: dialogue-heavy, use Sora, Veo, Kling or Seedance; consistent characters across scenes, Runway; cinematic camera moves, Higgsfield or Kling; cheapest volume, Seedance. Clip length caps differ per model and per version, so read the current limits.

## Voice

Use a standalone voice tool when the video is silent, when one brand voice must run through every ad, when the same script is needed in several languages, or when you want to re-record a line without reshooting.

Choosing:
- Best realism and voice cloning: ElevenLabs.
- Cheap and quick, drafts and volume: OpenAI speech (no cloning).
- Very low latency or live previews: Cartesia.
- Widest language count: PlayHT.
- Enterprise or on-premise cloning: Resemble AI.
- Licensing comfort (paid actors): WellSaid.
- Free, private, runs on your own machine: an open-source local voice studio. Good when the copy is not public yet.

Combining silent video and a voice track: render the video, synthesize the narration, then mux with `ffmpeg -i clip.mp4 -i voice.mp3 -c:v copy -c:a aac out.mp4`.

## Code-rendered video with Remotion

Remotion renders video from React code, so every frame is deterministic and on-brand, and hundreds of versions can be batch-rendered from a data file. AI video models give a new result every time and cannot take a price or a name from a spreadsheet.

Good fits:
- Product ads from a list of items (name, price, image, tagline, button text).
- Copy tests: one template, several headline and button sets.
- Personalised clips addressed to a named recipient. Only with a lawful basis for using that data, and never sent without approval.
- One composition rendered in 1:1 for feed, 9:16 for stories, 16:9 for video sites.

Commands: `npx create-video@latest` starts a project; `npx remotion render src/index.ts Promo out/promo.mp4` renders one composition; pass `--props` with a path to a JSON file to feed data (on Windows shells, inline JSON loses its quotes, so use a file). Check the Remotion documentation for the current render syntax. Check the license terms for company size before commercial use.

## Hybrid workflow for volume

1. Explore hero concepts with generative tools in small, approved batches.
2. Turn the winning pattern into a Remotion template.
3. Batch-render the variations from a data file.
4. Go back to generative tools only for new angles; keep Remotion for scale.

## Image sizes by placement

| Placement | Ratio | Size in pixels |
|---|---|---|
| Meta feed and carousel | 1:1 | 1080 x 1080 |
| Meta stories and reels | 9:16 | 1080 x 1920 |
| Google display landscape | 1.91:1 | 1200 x 628 |
| Google display square | 1:1 | 1200 x 1200 |
| LinkedIn landscape | 1.91:1 | 1200 x 627 |
| LinkedIn square | 1:1 | 1200 x 1200 |
| TikTok feed | 9:16 | 1080 x 1920 |
| X feed | 16:9 | 1200 x 675 |
| X card | 1.91:1 | 800 x 418 |

Confirm against the platform's current spec page before exporting.
