# Integration test examples

## Cart badge test: `integration_test/app_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shop_demo/main.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('cart flow', () {
    testWidgets('one tap on add-to-cart raises the badge to 1', (tester) async {
      await tester.pumpWidget(const MyApp());
      expect(find.text('Cart (0)'), findsOneWidget);

      await tester.tap(find.byKey(const ValueKey('add_to_cart')));
      await tester.pumpAndSettle();

      expect(find.text('Cart (1)'), findsOneWidget);
    });
  });
}
```

Replace `shop_demo` with the package name from `pubspec.yaml`.

## Host script: `test_driver/integration_test.dart`

```dart
import 'package:integration_test/integration_test_driver.dart';

Future<void> main() => integrationDriver();
```

## Performance runs

When a test wraps its actions in `binding.traceAction(...)` and stores the timeline under the name `feed_timeline` (pass `reportKey: 'feed_timeline'` to `traceAction`; without it the key is `timeline`), use a host script that saves the summary. Save it as `test_driver/perf_driver.dart` and pass it to `--driver`.

```dart
import 'package:flutter_driver/flutter_driver.dart' as fd;
import 'package:integration_test/integration_test_driver.dart';

Future<void> main() {
  return integrationDriver(
    responseDataCallback: (Map<String, dynamic>? data) async {
      if (data == null) return;
      final timeline = fd.Timeline.fromJson(
        data['feed_timeline'] as Map<String, dynamic>,
      );
      final summary = fd.TimelineSummary.summarize(timeline);
      await summary.writeTimelineToFile(
        'feed_timeline',
        pretty: true,
        includeSummary: true,
      );
    },
  );
}
```

The output files land in the `build/` folder of the project, named after the first argument of `writeTimelineToFile`. Run it with `flutter drive --driver=test_driver/perf_driver.dart --target=<your test file> --profile`. Profile-mode runs (`--profile`) give numbers that mean something; debug mode does not.
