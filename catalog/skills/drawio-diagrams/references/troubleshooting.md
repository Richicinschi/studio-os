# Troubleshooting

Read this when a picture comes out wrong, an export fails, or a command-line call errors. Most
entries end in a one-line cure.

## Mistakes in the XML or layout

- **Root cells missing.** Put cells `0` and `1` first inside `<root>`.
- **Shapes look unconnected.** An edge's `source` and `target` must equal the `id` of shapes
  that exist.
- **An edge written as a self-closing cell.** It will not draw. Give it the long form with a
  child `<mxGeometry relative="1" as="geometry" />`.
- **A double hyphen in a comment.** The XML spec forbids it; use one hyphen or reword.
- **Characters that XML reserves in a label.** Write `&amp;`, `&lt;`, `&gt;`, `&quot;`.
- **A literal `\n` in a label.** Write `&#xa;` to break the line.
- **Overlapping shapes.** Space them by diagram size (200 to 350 px) and leave corridors.
- **Edges running through shapes.** Add waypoints, spread entry and exit points, or give more
  room.
- **An arrowhead stuck on a bend.** The final segment before the target must be at least
  20 px long.
- **Endless polishing.** After five rounds, suggest that the user fine-tune the `.drawio` in
  the desktop app.

## draw.io command line

- **The shell says it cannot find `draw.io` right after a Homebrew cask install.** The cask puts
  the program on PATH as `drawio`, with no dot, so test with `drawio --version`. A dotted name
  belongs only to the program inside the Mac app package and to `draw.io.exe` on Windows.
- **Command not found on macOS at all.** Call the program inside the app package by its whole
  path: `/Applications/draw.io.app/Contents/MacOS/draw.io`.
- **Image API refuses the preview ("dimensions exceed the 2576x2576px limit").** Export with
  `--width 2000` and not `-s 2`. There is no short `-w`; using it quietly breaks argument parsing
  and the CLI claims "input file/directory not found". A tall, narrow diagram that still
  overshoots needs `--height 2000`.
- **Image API returns 400 "Could not process image" on a draft PNG.** Export the preview without
  `-e`. The real cause is a truncated IEND chunk in `-e` PNGs (upstream issue 8); leaving `-e`
  off for previews is the simplest cure.
- **A final `-e` PNG will not open in viewers or APIs.** Run
  `py -3.13 <skill-dir>/scripts/repair_png.py <path>`. The CLI drops the last 8 bytes. SVG and
  PDF are fine.
- **Wrong background in an export.** A known CLI bug. Use `--transparent`, or set the background
  in the style.
- **PDF export fails.** It needs Chromium, which the desktop app bundles.

## Linux

- Blank or failing headless output: prefix the command with `xvfb-run -a`.
- `--no-sandbox` taken for the file name: it must be the last argument (drawio-desktop issues
  249 and 1056).
- `Failed to get 'appData' path` or `Home directory not accessible`: run `export HOME=/tmp`
  first (drawio-desktop issue 127).
- Segfault, EGL or MESA "failed to load driver" on a server: add `--disable-gpu`.

## WSL2 and Windows

**WSL2 cannot find `drawio` or `draw.io`.** The CLI lives on the Windows side. Check for WSL2 with
`grep -qi microsoft /proc/version`, then run the Windows program through `/mnt/c`. Quote the
path, because it contains a space.

```bash
"/mnt/c/Program Files/draw.io/draw.io.exe" --version
# a per-user install sits under your profile:
"/mnt/c/Users/$USER/AppData/Local/Programs/draw.io/draw.io.exe" -V
```

**Opening an exported file fails when given a `/mnt/c/...` path.** `cmd.exe` cannot read WSL
paths. Convert the path first; the empty `""` after `start` is the window title it insists on.

```bash
cmd.exe /c start "" "$(wslpath -w diagram.drawio.png)"
```

**A browser link opens an empty diagram.** In `cmd.exe`, `start` treats `&` as a command
separator and discards everything after `#`, and the fragment is the entire diagram. Never hand
the link to `start`. Write a `.url` shortcut and open that.

```bash
URL=$(uv run python <skill-dir>/scripts/encode_drawio_url.py --edit diagram.drawio)
TMP=$(mktemp --suffix=.url)
printf '[InternetShortcut]\r\nURL=%s\r\n' "$URL" > "$TMP"
cmd.exe /c start "" "$(wslpath -w "$TMP")"
```

The same shortcut trick works on plain Windows (`start "" "%TEMP%\d.url"`). On macOS and Linux,
`open "$URL"` or `xdg-open "$URL"` is enough.
