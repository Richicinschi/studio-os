---
id: accessibility-review
title: Check accessibility
---

## When to use

Use this when a person asks whether a page, app or design is accessible, or wants it to work for everyone: people with poor eyesight, people who cannot use a mouse, people using a screen reader, people sensitive to motion, people on small screens or large text.

Typical words: "is this accessible", "can colour-blind people read it", "does it work with a keyboard", "check the contrast", "make it work for everyone".

Neighbours:
- Choosing or designing the colours, type and layout in the first place: the visual design skills of this pack take over. Come back here to check the result.
- Page speed, SEO and general quality audits: the hub skills for performance and SEO cover those.
- Legal advice on accessibility duties: out of scope. Report measured results and say a jurist decides what is required.

The basis is the public WCAG 2.2 success criteria. Level AA is the default target. Report AAA only when asked.

## How it works

The rule of this skill: report measured results, not opinions. Every finding carries a number, a count, or an observed behaviour. If you could not measure something, say so and list it under "not verified".

First, find out what is under review: a live page, files in a folder, a screenshot, or a design description. Say which of the checks below you can run on it. A screenshot or a design can be checked for contrast, target size and structure by inspection; it cannot be checked for keyboard behaviour.

Work in this order. Stop to report early if the person only asked about one area.

1. **Contrast (1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast).**
   - Measure: the ratio between text colour and its background; between UI parts (input borders, icons that carry meaning, focus rings, chart lines) and their neighbours.
   - Pass line: 4.5:1 for normal text, 3:1 for large text (24 px or more, or 18.66 px or more in bold), 3:1 for UI components and meaningful graphics.
   - How: by script. Run `node skills/accessibility-review/contrast.mjs <text hex> <background hex> --size <px> [--bold]`. It prints the ratio and the verdicts, and exits with 1 when AA fails. Read the colours from the stylesheet or design file; do not guess them from a picture. Check every distinct pair, plus hover, disabled-but-informative, placeholder and error states. Text over an image or gradient: measure the worst spot.
   - Also check 1.4.1 Use of Color: wherever colour is the only signal (red error, green success, a coloured link inside text), look for a second signal such as an icon, text or underline.

2. **Keyboard and focus (2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.7 Focus Visible, 2.4.3 Focus Order).**
   - Measure: whether every action reachable by mouse is reachable by Tab, Shift+Tab, Enter, Space and arrow keys; whether focus is always visible; whether the focus order follows the reading order; whether focus can leave every dialog and menu (and Escape closes them).
   - Pass line: no unreachable control, no trap, a visible indicator on every focused element (and the indicator itself at 3:1 against its surroundings).
   - How: with a browser, drive Tab step by step, record the element focused at each step and whether an outline or other change is visible; list elements that never receive focus. By inspection: search the code for click handlers on non-interactive elements, `tabindex` above 0, and styles that remove outlines with no replacement. Without a browser, give the person this to try: "Put your mouse aside, press Tab repeatedly through the page, and tell me where you lose sight of the highlight or get stuck."

3. **Names and labels (1.1.1 Non-text Content, 4.1.2 Name, Role, Value, 2.4.4 Link Purpose, 3.3.2 Labels or Instructions).**
   - Measure: count images, icon-only buttons, links, and form fields; for each, does it have a text name a machine can read?
   - Pass line: every meaningful image has a text alternative that says what it conveys; decorative images have an empty alternative; every button and link has a name that makes sense out of context (not "click here"); every field has a visible label tied to it, not only placeholder text.
   - How: by inspection of the markup. Report counts, for example "9 of 14 images have no alt attribute". Do not judge alt text quality by length; judge by whether it replaces the image for someone who cannot see it.

4. **Structure and headings (1.3.1 Info and Relationships, 2.4.2 Page Titled, 2.4.6 Headings and Labels, 3.1.1 Language of Page, 1.4.12 Text Spacing).**
   - Measure: one clear page title; a language declared; a single top-level heading; heading levels that do not skip; lists, tables and landmarks (header, nav, main, footer) used for what they are; a way to skip repeated navigation (2.4.1 Bypass Blocks).
   - Pass line: the outline of headings alone tells the page's story; no layout done with empty elements to fake structure.
   - How: by inspection. Print the heading outline and show it to the person.

5. **Target size and zoom (2.5.8 Target Size (Minimum), 1.4.4 Resize Text, 1.4.10 Reflow).**
   - Measure: the size in CSS pixels of every tappable control; behaviour at 200% text size; behaviour at a 320 px wide viewport (the same as 400% zoom on a desktop).
   - Pass line: targets at least 24 by 24 CSS px, or smaller only when enough space surrounds them; at 200% text nothing is cut off or overlapped; at 320 px wide there is no sideways scrolling for ordinary content and nothing is lost.
   - How: with a browser, read each control's bounding box and list those under 24 px; set the viewport to 320 px and check for horizontal overflow. Without one, read the sizes from the stylesheet and ask the person to zoom the page to 200% and then 400% and report what breaks. For touch use, mention that larger targets help, but report only the 24 px line as the pass line.

6. **Motion and flashing (2.2.2 Pause, Stop, Hide, 2.3.1 Three Flashes or Below Threshold, 2.3.3 Animation from Interactions, 1.4.2 Audio Control).**
   - Measure: anything that moves, blinks or scrolls by itself for more than 5 seconds; anything that flashes more than 3 times in any one second; parallax or large movement triggered by scrolling; autoplaying sound longer than 3 seconds.
   - Pass line: moving content can be paused, stopped or hidden; nothing flashes above that rate; the page respects the reduced-motion setting of the operating system and removes non-essential motion when it is on (2.3.3 is a AAA criterion, but honouring the setting is cheap, so report it as a recommendation).
   - How: by inspection of animation code and styles for a reduced-motion rule; with a browser, emulate that setting and compare.

7. **Forms and errors (3.3.1 Error Identification, 3.3.3 Error Suggestion, 3.3.4 Error Prevention, 1.3.5 Identify Input Purpose, 3.3.7 Redundant Entry).**
   - Measure: for each form, what happens on a wrong entry: is the error in text, next to the field, and does it say how to fix it? Are required fields marked in text? Does the field declare what it asks for (name, email) so the browser can fill it?
   - Pass line: errors are named in text, tied to their field, and focus or announcement moves to them; important submissions (money, legal, deletion) can be reviewed, undone or confirmed.
   - How: by inspection; with a browser, submit the form empty and with bad data and record what appears.

8. **Screen reader, as far as possible.** Read the accessibility tree or the markup in reading order and ask: does each element announce a sensible name, role and state? With a browser tool, take the accessibility snapshot and check names, roles, and states (expanded, selected, checked). Live updates (toasts, validation) need a live region to be announced.

## Reporting

Give one table or list, worst first. Each finding has four parts:
- Finding: what is wrong and where (element, screen, selector).
- Criterion: number and short title.
- Measured value: the number or observed behaviour, with the pass line beside it.
- Fix: the smallest change that passes, with a concrete value where it is a colour or size (for a failing colour, offer the nearest passing shade and run the script on it before suggesting it).

Severity is by who is blocked:
- Blocker: some people cannot complete the task at all (a control unreachable by keyboard, a field with no name, a keyboard trap, a flashing hazard).
- Serious: they can finish but with great effort (contrast below the line on body text, focus invisible, tiny targets).
- Moderate: friction (skipped heading levels, vague link text).
- Minor: polish, or a AAA item.

End with a plain "Not verified" list. Automated and scripted checks cannot prove these, and the report must say so:
- What using a real screen reader is like (order of announcements, verbosity, confusion).
- Cognitive load: whether wording, flow and steps are understandable, and whether time limits or memory demands are fair.
- Whether alt text and labels are accurate, not merely present.
- Behaviour on assistive technology or devices you did not test.

A report with zero findings still lists "Not verified". Never say a page "is accessible" or "meets WCAG"; say which criteria were measured and passed.

## Checks before done

- Every contrast finding came from a script run (or a stated measurement) with the ratio shown, not from eyeballing.
- Every finding names a criterion number and gives the measured value and the pass line.
- The report states which areas could not be checked in this setup (for example keyboard behaviour on a screenshot) and why.
- The "Not verified" list is present, including screen-reader experience and cognitive load.
- Each suggested colour fix was run through the script and passes before it was offered.
- Findings are ordered by severity and each severity says who is blocked.
