# Custom preview annotations

Every snippet needs these imports:

```dart
import 'package:flutter/material.dart';
import 'package:flutter/widget_previews.dart';
```

## Plain preview

```dart
@Preview(name: 'Greeting', group: 'Text')
Widget greetingPreview() => const Text('Hi there');
```

## Shared setup in a Preview subclass

Use when many widgets need the same theme or label prefix.

```dart
final class BrandedPreview extends Preview {
  const BrandedPreview({super.name, super.group});

  PreviewThemeData _brandTheme() => PreviewThemeData(
        materialLight: ThemeData(colorSchemeSeed: Colors.teal),
        materialDark: ThemeData(
          colorSchemeSeed: Colors.teal,
          brightness: Brightness.dark,
        ),
      );

  @override
  Preview transform() {
    final base = super.transform();
    final b = base.toBuilder()
      ..name = 'Brand / ${base.name ?? ''}'
      ..theme = _brandTheme;
    return b.build();
  }
}

@BrandedPreview(name: 'Save button')
Widget saveButtonPreview() =>
    FilledButton(onPressed: null, child: const Text('Save'));
```

The name is built inside `transform()` because a const annotation cannot join runtime values. `toBuilder()` returns a `PreviewBuilder`, and its `build()` method gives back the `Preview`. The theme API is the part most likely to differ by Flutter version: the `PreviewThemeData(materialLight:, materialDark:)` constructor shown here is documented in some releases, while newer documentation (3.47) describes `PreviewThemeData` as a type you extend. Check the API reference for the installed Flutter version before copying the theme lines.

## Light and dark in one annotation

```dart
final class LightAndDark extends MultiPreview {
  const LightAndDark({required this.label});

  final String label;

  @override
  List<Preview> get previews => const [
        Preview(brightness: Brightness.light),
        Preview(brightness: Brightness.dark),
      ];

  @override
  List<Preview> transform() => super.transform().map((p) {
        final b = p.toBuilder()
          ..group = 'Theme modes'
          ..name = '$label (${p.brightness!.name})';
        return b.build();
      }).toList();
}

@LightAndDark(label: 'Profile tile')
Widget profileTilePreview() =>
    const ListTile(leading: Icon(Icons.person), title: Text('Sam'));
```

## Stacking annotations

```dart
@Preview(name: 'Narrow', size: Size(240, 120))
@Preview(name: 'Wide', size: Size(640, 120))
Widget bannerPreview() => const Card(child: Text('Sale ends today'));
```
