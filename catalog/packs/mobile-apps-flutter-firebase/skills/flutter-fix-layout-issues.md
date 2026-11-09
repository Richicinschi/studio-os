---
id: flutter-fix-layout-issues
title: Fix Flutter layout errors
description: Use when addressing Flutter layout errors with Dart and Flutter MCP tools: "RenderFlex overflowed", "Vertical viewport was given unbounded height", unbounded width, ParentData misuse, overflow stripes or similar layout issues.
---

# Fix Flutter layout errors

## When to use

- "My screen has yellow and black stripes."
- "RenderFlex overflowed by N pixels."
- "Vertical viewport was given unbounded height" after putting a list in a column.
- A text field in a row throws an InputDecorator width error.
- "Incorrect use of ParentData widget" after moving widgets around.

Neighbours: building a new screen from scratch belongs to the screens and layouts skills of this pack; test failures belong to the testing skills. This skill only repairs constraint failures in an existing widget tree.

## How it works

1. Run the app in debug mode (or ask the Dart and Flutter MCP tools for the current runtime errors) and copy the first layout exception from the console. Do not guess from a screenshot alone.
2. Every layout error is a failed hand-off: constraints go down from the parent, the child picks a size inside them and passes it up, and only then does the parent decide where the child sits. It breaks when a child is given infinite room or wants more than it was given.
3. Find the primary error. The message "RenderBox was not laid out" is only fallout; scroll up the trace to the first error above it.
4. Match the message to its fix:

| Message | Cause | Fix |
|---|---|---|
| Vertical viewport was given unbounded height | ListView or GridView inside a Column, which offers infinite height | Wrap the scrollable in `Expanded` to take the leftover space, or in a `SizedBox` with a fixed height. `Expanded` only works when the Column itself has a bounded height; inside another scrollable, use the fixed height |
| InputDecorator cannot have an unbounded width | TextField or TextFormField inside a Row | Wrap the field in `Expanded`, `Flexible` or a `SizedBox` with a set width |
| RenderFlex overflowed | A Row or Column child wants more than its share (yellow and black stripes) | `Expanded` to make it fill and wrap inside its share, or `Flexible` to let it be smaller |
| Incorrect use of ParentData widget | `Expanded` or `Flexible` outside a Row, Column or Flex; `Positioned` outside a Stack; `TableCell` outside a Table | Make the widget a direct child of the required parent, with nothing in between |

5. Hot reload, then check the screen and the console together. Clean console and no stripes or error box: you are done. A different layout error: it is a new problem, so return to step 3 and read its first line.

Worked before and after code is in [examples](flutter-fix-layout-issues/examples.md).

## Checks before done

- The console shows no layout exception after hot reload.
- No stripes and no red or grey error box on screen, on a small phone size too.
- Each wrapper added is the smallest one that fixes the named error.
