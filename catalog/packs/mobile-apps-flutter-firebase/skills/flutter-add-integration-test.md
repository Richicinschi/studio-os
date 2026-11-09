---
id: flutter-add-integration-test
title: Flutter integration tests
description: Use when adding Flutter integration testing to a project: explore UI components via MCP, automate user flows with the integration_test package. Configures Flutter Driver and converts MCP actions into permanent integration tests.
requires: [flutter]
---
## When to use

- "Add integration tests to this app", "automate the login flow", "turn what I just clicked into a test".
- You want to poke at a running app through the Dart/Flutter MCP tools first, then freeze the working path as a test file.
- You are migrating or maintaining older `flutter_driver` tests.

Neighbours: for tests that need no running app (single widgets, logic), use the `tdd` skill and plain `flutter test`. For Firebase rules or backend checks, use the other skills in this pack.

## How it works

1. **Dependencies.** From the project root run:
   `flutter pub add 'dev:integration_test:{"sdk":"flutter"}'`
   `flutter pub add 'dev:flutter_test:{"sdk":"flutter"}'`
   `flutter pub add 'dev:flutter_driver:{"sdk":"flutter"}'` (needed by the driver extension import in step 2 and by the performance host script)
2. **App hooks.** In the entry point you test (`lib/main.dart`, or a separate `lib/main_test.dart` so production stays clean), import `package:flutter_driver/driver_extension.dart` and call `enableFlutterDriverExtension();` before `runApp()`. Only the MCP exploration in step 3 and legacy `flutter_driver` suites need this call; a plain `integration_test` run through `flutter drive` works without it. Put a `ValueKey` (for example `ValueKey('save_note_button')`) on every widget a test must find. Keys survive text and layout changes; finders by text do not.
3. **Explore first, through MCP.** Start the app with `launch_app` and `target: "lib/main_test.dart"`; it returns the DTD URI. The Dart and Flutter MCP server ships `launch_app` switched off by default, so enable it in the server configuration first. Read the widget tree with the server's widget inspector tool (older server versions call it `get_widget_tree`) to list keys, texts and types. Drive the flow with the Flutter Driver commands `tap`, `enter_text` and `scroll`, sent through the server's `flutter_driver_command` tool. After every navigation or animation, wait with the `waitFor` command or confirm with `get_health` before the next action. Tool names differ between server versions: check the installed version's tool list and the vendor's current documentation. If a widget is absent from the tree, it is probably built lazily inside a `ListView` or `SliverList`: `scroll` or `scrollIntoView` until it mounts. Write down each successful action; that list becomes the test.
4. **Write the test.** Create `integration_test/` at the project root and name files `<name>_test.dart`.
   - First line of `main()`: `IntegrationTestWidgetsFlutterBinding.ensureInitialized();`
   - Load the UI with `await tester.pumpWidget(const MyApp());`
   - After each `tester.tap(...)` or similar, `await tester.pumpAndSettle();`
   - Assert with `expect(find.byKey(const ValueKey('note_title')), findsOneWidget);` or `findsNothing`.
   - For something off screen: `await tester.scrollUntilVisible(itemFinder, 400.0, scrollable: listFinder);`
   - Legacy `flutter_driver` suites use the driver API instead (`driver.waitFor`, `driver.waitForAbsent`, `driver.tap`, `driver.scroll`); keep that style only while maintaining them.
   - Add the host script `test_driver/integration_test.dart`, which only calls `integrationDriver()`.
   Full examples, including the timeline driver for performance runs, are in [examples.md](flutter-add-integration-test/examples.md).
5. **Run it.** The base command is `flutter drive` with `--target` pointing at your test file and `--driver` pointing at the host script (paths as created in step 4). Add the device flag that fits:
   - Chrome: start `chromedriver --port=4444` in a second terminal, add `-d chrome`.
   - Headless web: add `-d web-server`.
   - Android device or emulator: no extra flag beyond a connected device. For a `--profile` run on a phone or emulator also add `--no-dds`, because the debug service is not reachable from the computer.
   - Firebase Test Lab (Android): build `flutter build apk --debug`, then `./gradlew app:assembleAndroidTest`, then upload both APKs in the Test Lab console. A release build leaves out `integration_test`, so use debug builds here; to bake one test file into the app APK, build it from the `android` folder with `./gradlew app:assembleDebug -Ptarget=integration_test/<name>_test.dart`. This is an outside service and may cost money: ask the owner first and state that.
6. **Loop until green.** Read the output. `PumpAndSettleTimedOutException` usually means an animation never ends (a spinner, a looping controller): replace `pumpAndSettle` with a bounded `pump(Duration)` for that screen. "Widget not found" usually means it is off screen: add `scrollUntilVisible`. Re-run after each fix.

## Without local tools

No Flutter SDK or device available: do steps 1 to 4 as files only, say plainly that nothing was run, and give the owner the full `flutter drive` command from step 5, with real paths filled in, to run himself. Never report a test as passing that has not executed.

## Checks before done

- `integration_test` and `flutter_test` are in `pubspec.yaml` dev dependencies.
- The driver extension call sits before `runApp()` in the entry point the test launches.
- Every widget the test touches has a key, and the test finds by key.
- `ensureInitialized()` is called, and `test_driver/integration_test.dart` exists.
- The test passed in a real `flutter drive` run, and you can quote the result.
- Test and key names are English, as everywhere in the studio.
