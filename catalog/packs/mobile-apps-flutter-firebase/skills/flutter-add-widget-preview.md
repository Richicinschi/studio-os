---
id: flutter-add-widget-preview
title: Flutter widget previews
description: Use when creating new UI components or updating existing screens in Flutter and you want interactive widget previews (the previews.dart system) to ensure consistent design and interactive testing.
requires: [flutter]
---

# Flutter widget previews

## When to use

- "Add a preview for this widget", "preview this screen in light and dark", "set up the widget previewer".
- You just wrote or changed a UI component and want to see it live, isolated from the rest of the app, without launching the whole app.
- Automated widget tests belong to the testing skills of this pack; this skill is for looking at the UI.

## How it works

1. Import `package:flutter/widget_previews.dart` in the file that holds the widget.
2. Pick a valid target: a top-level function, a static method, or a public constructor or factory that needs no arguments and returns a `Widget` or `WidgetBuilder`. For a widget that needs data, write a small preview function that supplies sample values.
3. Put `@Preview(...)` on the target.
4. Set what helps review: `name`, `group`, `size`, `theme`, `brightness`. Also available: `textScaleFactor`, `wrapper` (wraps the widget tree, for example to inject an inherited widget) and `localizations`.
5. If several previews share the same setup (theme, wrapper), move it into one class that extends `Preview` and annotate with that class.
6. For several variants of one widget, stack more than one annotation on it, or write a class that extends `MultiPreview` for a set you reuse.
7. When a value must be computed at runtime (a name built from other fields), override `transform()`; a const annotation cannot do this.
8. The previewer runs on the web. Keep `dart:io`, `dart:ffi` and native plugins out of anything a preview reaches, directly or through imports; they load but throw as soon as they are called. Use conditional imports to swap in a fake.
9. When code loads assets through `dart:ui` `fromAsset`, use package paths such as `packages/<your_package>/assets/logo.png`.
10. Any callback you pass into a preview annotation must be public and constant, or code generation fails.
11. If the widget has no natural size, give `size` explicitly. Without it the previewer boxes the widget to about half the viewport.
12. In an IDE (Android Studio, IntelliJ, or VS Code with Flutter 3.38 or newer; the newest documentation describes 3.47, so check the vendor's current documentation for your IDE) the previewer starts on its own. Open the "Flutter Widget Preview" sidebar tab. Turn off the "Filter previews by selected file" toggle at the bottom left to see previews from other files.
13. From a terminal instead: go to the project root, run `flutter widget-preview start`, and use the Chrome window it opens.
14. Iterate: edit the code or annotation and watch the preview refresh. If you changed global state such as a static initializer, press the global hot restart at the bottom right. To reset only one widget, press the restart button on its card. Read errors in the IDE or terminal, fix, repeat.

Worked code for custom annotations, runtime transforms and a light/dark set: [references/custom-annotations.md](flutter-add-widget-preview/references/custom-annotations.md).

## Without local tools

Without the Flutter SDK the previewer cannot run. Still write the annotations and sample-data wrappers by the rules above, and tell the user to run `flutter widget-preview start` (Flutter 3.38 or newer) to check them.

## Checks before done

- The import is present and every target needs no arguments.
- No `dart:io`, `dart:ffi` or native plugin is reachable from a preview.
- Asset paths are package paths; annotation callbacks are public and const.
- Unconstrained widgets have a `size`.
- The previewer started and each preview renders without console errors, in light and dark if the app supports both.
