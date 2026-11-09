# Visual companion guide

The companion is a small local web server plus a browser page. You put
HTML files in a folder; the person sees the newest one in a tab and can
click choices; you read those clicks on your next turn. Nothing in it
contacts any outside address.

## Should this question go to the browser?

Judge it question by question. Ask yourself: would they understand the
answer faster by looking at it than by reading it?

Send to the browser when the substance is visual:

- wireframes, page layouts, navigation, component designs
- system diagrams, data flow, maps of relationships
- two or more looks set beside each other (layouts, palettes, directions)
- questions of finish: feel, spacing, visual hierarchy
- state machines, flowcharts and entity diagrams drawn out

Keep it in the terminal when the substance is words:

- scope and requirements ("what do we mean by X?", "which features ship?")
- a choice between approaches that can be described in a sentence each
- lists of tradeoffs, comparison tables
- technical decisions such as API shape, data model, architecture
- clarifying questions of every kind

A UI subject does not make a question visual. "How many steps should
signup have?" is conceptual, so ask it in the terminal. "Which of these
signup layouts feels right?" is visual, so show it.

## Serving the files

Whichever file in `screen_dir` was modified last is the one on screen. If
it opens with `<!DOCTYPE` or `<html`, the server treats it as a whole page
and only adds the helper script. Any other file counts as a fragment and
is dropped into a ready-made frame that supplies the header, the theme, the
connection light and the click handling. Default to fragments; write a
whole page only when you must control everything.

## Start it

Run this only after the person has accepted the companion:

```bash
bash scripts/start-server.sh --project-dir /path/to/project --open
```

It prints a single JSON line like this one (an example, with a made-up
key):

```
{"type":"server-started","port":50123,"host":"127.0.0.1","url_host":"localhost",
 "url":"http://localhost:50123/?key=9f3c…","screen_dir":"/path/to/project/.studio-work/brainstorm/4021-1760000000/content",
 "state_dir":"/path/to/project/.studio-work/brainstorm/4021-1760000000/state","idle_timeout_ms":14400000}
```

(The real output is one line.) Keep `screen_dir` and `state_dir`.

- `--open` makes the server open their browser when the first screen
  arrives. Hand over the URL anyway: a headless or remote machine cannot
  open a browser.
- Pass the project root as `--project-dir`. Mockups are then
  kept under `.studio-work/brainstorm/` and survive a restart, and the
  restarted server takes the same port and key. Without it, files go to
  `/tmp` and vanish on stop. If `.studio-work/` is not in the project's
  `.gitignore`, ask the person to add it.

**Always give out the complete URL, key included.** The `?key=...` ending
is what the server checks on every request; without it the answer is a
refusal. Hand over exactly the `url` value: no shortened form, no bare
`http://host:port`. The key stops other browser tabs, and other machines on
the network, from reading your screens or sending fake events. The browser
keeps the key in a cookie after the first visit, so reloads and `/files/*`
assets need no key in the address.

**If you lost the output,** read `$STATE_DIR/server-info`; it holds the
same JSON. For a `--project-dir` session, the session folders sit under
`<project>/.studio-work/brainstorm/`.

### How to launch, by tool

| Tool | What to do |
|------|------------|
| Claude Code | Run the command above. The script detaches the server. On Windows it falls back to foreground mode, which blocks the call: set `run_in_background: true` on the Bash call, and read `$STATE_DIR/server-info` on the next turn for the URL and port. |
| Codex | Run the command above. Codex kills background processes, so the script notices `CODEX_CI` and stays in the foreground. No extra flag. |
| Gemini CLI | Add `--foreground` and set `is_background: true` on the shell call, so the process survives between turns. |
| Copilot CLI | Run it with `--foreground` inside Copilot CLI's own non-blocking shell, so the CLI keeps the process alive between turns. Because the launcher is a shell script, start it as `bash scripts/start-server.sh ...` (on Windows, call Git Bash's `bash.exe` from the PowerShell tool). |
| Anything else | The server must outlive your turn. If detached processes get killed, use `--foreground` and start it with the platform's own way of running in the background. |

```bash
bash scripts/start-server.sh --project-dir /path/to/project --open --foreground
```

When the person's browser cannot reach the URL (usual with remote
machines and containers), bind a non-loopback address and choose what
host name the URL shows:

```bash
bash scripts/start-server.sh \
  --project-dir /path/to/project \
  --host 0.0.0.0 \
  --url-host localhost
```

## One round of the loop

1. **Check the server, then write a screen.**
   - Required: confirm it is alive before you mention the URL or push anything:
     `$STATE_DIR/server-info` must exist and `$STATE_DIR/server-stopped`
     must not. If it stopped, run `start-server.sh` again with the **same
     `--project-dir`**. The port is reused, so the open tab reconnects on
     its own (it shows a "paused" overlay meanwhile) and needs no new URL.
     Idle servers exit after 4 hours; `--idle-timeout-minutes` changes that.
   - Name the file after what it shows: `platform.html`,
     `visual-style.html`, `layout.html`.
   - **Never reuse a name.** Every screen is a new file.
   - Create the file with your file-writing tool. **Never use cat or a
     heredoc**: it floods the terminal.

2. **Tell them what to expect, then end your turn.**
   - Give the URL again, at every round and not only the first.
   - Summarise the screen in a line, for instance "Three layouts for the
     booking page".
   - Ask for the reply in the terminal: "Look it over and tell me what you
     think. Click an option if you want to."

3. **Next turn, collect the feedback.**
   - If `$STATE_DIR/events` exists, read it. It lists their clicks and
     selections as JSON lines.
   - Combine it with what they typed. The typed reply is the main answer;
     the events add structure.

4. **Revise or move on.** Feedback that changes the screen means a new file
   (`layout-v2.html`). Go to the next question only when this one is
   settled.

5. **Blank the screen when the talk returns to text.** If the next step
   needs no browser, push a waiting screen so a decided question does not
   sit there:

   ```html
   <!-- filename: waiting.html (or waiting-2.html, and so on) -->
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">Back to the terminal for a moment...</p>
   </div>
   ```

   Push a fresh content file when the next visual question comes.

6. Repeat until the design is settled.

## Markup toolkit

For a fragment, write only the inner content. No `<html>`, no CSS, no
`<script>`: the frame supplies them. A complete small example:

```html
<h2>Which booking page reads better?</h2>
<p class="subtitle">Think about how quickly a visitor finds a free slot</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Calendar first</h3>
      <p>Free days are visible at once</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>Services first</h3>
      <p>Pick the treatment, then the day</p>
    </div>
  </div>
</div>
```

The frame defines these building blocks.

**Options** (lettered choices): the markup above. Add `data-multiselect`
to the container to allow several picks; each click then toggles that
item.

```html
<div class="options" data-multiselect>
  <!-- same option markup; each item can be switched on and off -->
</div>
```

**Cards** (designs to compare):

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- mockup content --></div>
    <div class="card-body">
      <h3>Name</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

**Mockup frame**:

```html
<div class="mockup">
  <div class="mockup-header">Preview: booking page</div>
  <div class="mockup-body"><!-- your mockup HTML --></div>
</div>
```

**Split view** (two mockups side by side):

```html
<div class="split">
  <div class="mockup"><!-- left --></div>
  <div class="mockup"><!-- right --></div>
</div>
```

**Pros and cons**:

```html
<div class="pros-cons">
  <div class="pros"><h4>Pros</h4><ul><li>Benefit</li></ul></div>
  <div class="cons"><h4>Cons</h4><ul><li>Drawback</li></ul></div>
</div>
```

**Wireframe parts**:

```html
<div class="mock-nav">Brand | Services | Prices | Contact</div>
<div style="display: flex;">
  <div class="mock-sidebar">Menu</div>
  <div class="mock-content">Main area</div>
</div>
<button class="mock-button">Book now</button>
<input class="mock-input" placeholder="Your name">
<div class="placeholder">Photo goes here</div>
```

**Text styles**: `h2` for the page title, `h3` for a section heading,
`.subtitle` for quieter text under a title, `.section` for a block with
space below, `.label` for a small uppercase caption.

## What the browser reports

Each click on an element with `data-choice` is appended to
`$STATE_DIR/events` as one JSON object per line. The file is deleted when
you push a new screen.

```jsonl
{"type":"click","text":"B\n    \n      Services first\n      Pick the treatment, then the day","choice":"b","id":null,"timestamp":1760000412000}
{"type":"click","text":"A\n    \n      Calendar first\n      Free days are visible at once","choice":"a","id":null,"timestamp":1760000419000}
```

Read the whole sequence. People often click around before settling, and
the last `choice` is usually the final pick, yet the path can show doubt or
a preference worth a follow-up question. No `events` file means no
interaction: rely on what they typed.

## Style advice

- Match the finish to the question: wireframes for layout, polish for
  polish.
- Put the question on the page ("Which layout looks more trustworthy?"),
  not a bare "Pick one".
- Settle the current screen before you go on; revise as a new file.
- Offer two to four options per screen at most.
- Use real content when it matters. For a photo portfolio, show real
  photos; placeholders hide design problems.
- Keep mockups plain: structure and layout, not pixel-perfect detail.

## File names

Name files for their meaning. Never reuse a name. Mark revisions with a
suffix (`layout-v2.html`, `layout-v3.html`). The server picks by modified
time, so the newest file wins.

## Shutting down

```bash
bash scripts/stop-server.sh $SESSION_DIR
```

A `--project-dir` session keeps its mockups in `.studio-work/brainstorm/`
for later. Only sessions under `/tmp` are deleted on stop.

## Reference files

- the frame's CSS: `scripts/frame-template.html`
- the page-side script: `scripts/helper.js`
