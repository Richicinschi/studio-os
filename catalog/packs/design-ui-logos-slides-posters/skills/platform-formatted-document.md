---
id: platform-formatted-document
title: Format a document for email or a CMS
---

## When to use

Use this when the person has a document (a Word file, Markdown, plain text) and wants it to look right after it is pasted somewhere that strips styling: an email tool, a CMS editor, a chat or newsletter editor. They might say "make this newsletter paste cleanly", "my formatting disappears in the email tool", "turn this Word file into something I can paste into the CMS".

Neighbours:
- A print-style document (PDF, one-pager, resume) that never gets pasted: a document-layout skill covers that, not this one.
- A web page or app screen built from scratch: the frontend design skills take over.
- Rewriting the words themselves: the copy-editing skill takes over. This skill moves and styles content; it does not change wording.

## How it works

1. **Find the target.** Ask once, in plain words: where will this be pasted, and is it an email, a CMS or something else? If the person does not know, pick the strictest assumption (email) and say so. Then work out what the target keeps. Check these points, from the person's answers or by a small paste test they can do: do styles written directly on each element survive? Do tables survive? Are images uploaded or must they live at a public web address? Are buttons just links? Is custom font support absent?

2. **Write the "what survives" list.** One screen, three groups: keeps, drops, unknown. Example lines: "inline styles: kept", "style blocks: dropped", "tables: kept", "images: must be hosted online". Show it to the person and use it as the rule set for everything below. Mark each unknown as a risk and test it in step 7.

3. **Read the input.**
   - Markdown or text: read it as is. If plain text has no markers, infer headings from short standalone lines and say which ones you guessed.
   - A Word file (.docx): it is a zip archive. Unzip it (rename a copy to .zip if needed) and read `word/document.xml`. Each `w:p` is a paragraph; inside it, `w:r` runs hold the text in `w:t`. A paragraph style named like Heading 1 to 6 (look the id up in `word/styles.xml`) is a heading. A `w:b` inside a run's properties means bold, `w:u` underline. Tables are `w:tbl`. Pictures are listed in `word/_rels/document.xml.rels` and stored in `word/media`. Write the result out as Markdown and show the person the outline to confirm before going on. Tell the person in plain words that you are reading the file's inner text directly, so no extra software is needed.
   - If the person says "just do it", skip the confirmation and list your guesses in the final message.

4. **Pick the document type** from the content: newsletter (several short items, links, a call to action), announcement (one message, one action) or article (long, linear reading). The type decides which components appear; do not style paragraph by paragraph.

5. **Assemble from a small component set only.** The allowed components are: heading, paragraph, quote, list, callout, button-link, divider, image-with-alt. Define each once, with its full inline style, and reuse it unchanged.
   - Newsletter: headings, short paragraphs, dividers between items, one button-link per item, callout for the lead item.
   - Announcement: one heading, short paragraphs, one callout, exactly one button-link.
   - Article: heading, long paragraphs, quotes, lists, images with alt text; no button unless asked.
   Map every source element to a component. If something has no match (a footnote, a code block), tell the person and use the nearest plain paragraph rather than inventing a new style.

6. **Apply the platform rules from your list.** For email: put every style inline on the element; lay out with tables (a single centred column about 600 pixels wide, `role="presentation"`); use only safe fonts with a fallback; no style blocks, no scripts, no external stylesheets, no position, flex or grid; images carry alt text and a full public address; buttons are styled links, not form buttons. For a CMS that accepts richer HTML, a plain structure with inline styles is still the safest, but a table is not required. Output only the body fragment if the target wants a fragment.

7. **Run the checker.** Save the HTML and run `node skills/platform-formatted-document/check-pasteable-html.mjs <file.html> --target=email` (use `--target=cms` for a CMS). It exits with an error and a line number for: script tags, external stylesheet links, style blocks (email only), position or flex/grid (email only), images without alt text, relative image paths, and paragraphs without inline style. Fix every error and re-run until it prints OK. The checker is a floor, not a guarantee: it does not know your target's own quirks.

8. **Second pass: does it read right without styling?** Strip all styles mentally (or by rewriting the HTML with the style attributes removed) and read the result. Check that the order is sensible, headings are real heading tags and not bold paragraphs, links still say where they go, every image has meaningful alt text, and the one action is obvious from the words. If the target drops styles it does not understand, this is what the reader will see.

9. **Hand over with a paste test.** Give the person the file and a plain instruction: open it in a browser, select all, copy, paste into the target, and send a test to themselves if it is email. Ask them to report what changed. Adjust the "what survives" list with the result and fix what broke. Never claim it works in a target you have not seen.

## Checks before done

- The "what survives" list exists, was shown to the person, and every rule in the output traces to it.
- The output uses only the eight listed components; no one-off hand styling.
- The checker printed OK for the right target, and you quote its last line.
- Every image has alt text and a full public address (or the person was told which images must be uploaded).
- The unstyled reading pass was done and any problem fixed or listed.
- You said plainly whether a real paste test happened. If not: "checked against rules, not tested in your tool".
