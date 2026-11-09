---
id: flutter-add-widget-test
title: Flutter widget tests
description: Use when writing a component-level test with WidgetTester: verify how the UI renders, plus user interactions such as tapping, scrolling or entering text. Also to validate a specific widget: it displays correct data, and responds to events as expected.
---

## When to use

- "Add a widget test for this screen", "test that tapping the button updates the label", "check the list scrolls to the last row".
- A single widget or small subtree needs checking for what it shows and how it reacts to gestures or typing.
- Not for pure logic with no UI (write a plain unit test) and not for full-app flows on a device (integration tests).

## How it works

1. Setup. Make sure `flutter_test` is listed under `dev_dependencies` in `pubspec.yaml`. Put tests in the `test/` folder at the project root and end each file name with `_test.dart`.
2. Declare the test with `testWidgets('what should happen', (WidgetTester tester) async { ... })`. The `tester` is your handle for building the widget and driving it.
3. Build the widget with `await tester.pumpWidget(...)`. If it reads theme, text direction or navigation from above, wrap it in a `MaterialApp` so those lookups succeed. A bare `Directionality` is enough only for simple widgets such as `Text`; Material widgets like `TextField` or `ListTile` also need a `Material` ancestor and `MediaQuery`, which `MaterialApp` provides.
4. Pick finders for the parts you care about: `find.text('Save')`, `find.byType(TextField)`, `find.byKey(const Key('save_btn'))`. Prefer keys when several widgets share a type.
5. Assert the starting state with `expect(finder, matcher)`. Common matchers: `findsOneWidget`, `findsNothing`, `findsNWidgets(3)`, `matchesGoldenFile`. A golden comparison fails until a reference image exists: create it once with `flutter test --update-goldens`, review the image, then commit it.
6. Act. `await tester.tap(finder)` for taps, `await tester.enterText(field, 'hello')` for typing. For an item deep in a long or lazy list, call `await tester.scrollUntilVisible(item, 300.0, scrollable: listFinder)` first so the row exists before you touch it.
7. Rebuild the tree after acting. Choose by case:

   | What you are testing | After the action |
   |---|---|
   | Static rendering | No action; assert right after `pumpWidget` |
   | A plain state change such as a tap | One `await tester.pump()` |
   | Animation, transition or async update (e.g. a `drag`) | `await tester.pumpAndSettle()` to run frames until none are pending |

8. Assert the new state with `expect` again.
9. Run it: `flutter test test/<name>_test.dart`.
10. Read the failure, decide whether the widget or the assertion is wrong, fix that one, and rerun until green.

A full worked example (add a todo, then swipe it away) is in [example-todo-list.md](flutter-add-widget-test/example-todo-list.md).

## Checks before done

- The file is under `test/`, ends in `_test.dart`, and `flutter_test` is a dev dependency.
- Each test asserts a state before and after the action, not only after.
- The correct rebuild call follows every action (`pump` vs `pumpAndSettle`).
- `flutter test` on the file exits green, and you saw the output yourself.
