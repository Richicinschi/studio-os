---
id: flutter-setup-localization
title: Flutter localization setup
description: Add `flutter_localizations` and `intl`, turn on "generate true" in `pubspec.yaml`, and write an `l10n.yaml` file. Use when initializing localization support for a new Flutter project, or when adding strings to one.
requires: [flutter]
---

## When to use

Typical wordings: "set up translations", "add l10n to this app", "make the strings localizable", "AppLocalizations is missing", "add an ARB file".

- Starting localization in a project that has none: follow every step below.
- Adding or changing text in a project that already has it: jump to steps 5 to 7.
- Plurals, placeholders and gendered text: see [formatting patterns](flutter-setup-localization/formatting.md).
- Layout that breaks with longer translated text: that is layout work, use the responsive layout or layout-fix skills of this pack.

Studio rule: the studio ships English only. Adding a second language is a deliberate milestone, and it needs professionally reviewed text. Do not add machine-translated locales on your own. A project can still be set up for localization with English as the only locale.

## How it works

Strings live in ARB files (JSON with a `.arb` extension). The Flutter tool compiles them into a typed `AppLocalizations` class, so a missing key is a compile error instead of a runtime blank.

Track these four tasks as you go: dependencies, generate flag, config file, app widget wiring.

1. **Add the packages.** From the project root:
   ```bash
   flutter pub add flutter_localizations --sdk=flutter
   flutter pub add intl:any
   ```
   Open `pubspec.yaml` and confirm `dependencies` now lists `flutter` (sdk: flutter), `flutter_localizations` (sdk: flutter) and `intl: any`.

2. **Switch on generation.** In the `flutter:` block of `pubspec.yaml`, add `generate: true`.

3. **Write `l10n.yaml`** next to `pubspec.yaml`:
   ```yaml
   arb-dir: lib/l10n
   template-arb-file: app_en.arb
   output-localization-file: app_localizations.dart
   ```
   Do not set `synthetic-package`. Current Flutter no longer builds the synthetic `flutter_gen` package, and the tool rejects `synthetic-package: true`. The generated Dart files land in the `arb-dir` folder (or in `output-dir`, if you set that key). Only on an older Flutter, before the 3.32 stable line, may you still need `synthetic-package: false`; check the vendor's current documentation for your SDK version.
   Optional: add `use-escaping: true` if messages need literal single quotes or braces.

4. **Connect the app widget.** Import `package:flutter_localizations/flutter_localizations.dart` and the generated file. Import the generated file by its real path under `lib`: with `arb-dir: lib/l10n` that is `l10n/app_localizations.dart` from `lib/main.dart`. An import starting with `package:flutter_gen` is the old form and no longer resolves on current Flutter; replace it wherever you find it.
   ```dart
   MaterialApp(
     localizationsDelegates: const [
       AppLocalizations.delegate,
       GlobalMaterialLocalizations.delegate,
       GlobalWidgetsLocalizations.delegate,
       GlobalCupertinoLocalizations.delegate,
     ],
     supportedLocales: const [Locale('en')],
     home: const HomeScreen(),
   )
   ```
   The same two lists go into `CupertinoApp`. Add one `Locale` per ARB file you ship. Per the studio rule above, a new locale entry is a milestone, not a default.

5. **Write the strings.** Create `lib/l10n/app_en.arb` (the template). Every new key gets a description so a translator knows the context:
   ```json
   {
     "welcomeTitle": "Welcome back",
     "@welcomeTitle": { "description": "Heading on the home screen" }
   }
   ```
   To change an existing string, find the key in every ARB file in `lib/l10n` and update each one. Other-locale files hold only the key and its translated value, no metadata.

6. **Generate.** Run `flutter pub get`. Read the terminal output. ARB syntax errors (a missing comma, a placeholder that is named differently in two files) are reported there. Fix the file and run it again until the output is clean.

7. **Use the strings.** Inside any widget below the app widget:
   ```dart
   final l10n = AppLocalizations.of(context)!;
   // ...
   Text(l10n.welcomeTitle)
   ```
   Calling this from the same widget that builds `MaterialApp` fails, because no localizations exist above it yet. Move the call into a child widget.

8. **Dynamic text.** For names, counts and conditional wording, use the patterns in [formatting patterns](flutter-setup-localization/formatting.md), which also has a full widget example.

## Without local tools

If the `flutter` command is not available, make the edits by hand: add the three dependency lines to `pubspec.yaml`, add `generate: true`, create `l10n.yaml` and the ARB files. Then tell the user that `flutter pub get` still has to run on their machine to generate `AppLocalizations`, and that nothing is verified until it does.

## Checks before done

- `pubspec.yaml` has the two packages and `generate: true`.
- `l10n.yaml` exists at the project root and its `arb-dir` and `template-arb-file` point at real files.
- `flutter pub get` finished with no ARB errors.
- Each key exists in every ARB file, and every placeholder name matches across files.
- The app widget lists all four delegates and a `supportedLocales` entry for each shipped ARB file.
- No hardcoded user-facing string was left in the widgets you touched.
- If a new language was added: the user asked for it and the text was reviewed by a professional, per the studio rule.
