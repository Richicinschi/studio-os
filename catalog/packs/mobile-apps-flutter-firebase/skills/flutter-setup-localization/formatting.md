# Formatting patterns for ARB messages

Three tools cover dynamic text. All are declared in the template ARB file; the generated class turns each into a method.

## Placeholders

Put the parameter name in braces in the text, then declare its type under the matching `@key` entry. An `example` helps translators.

```json
"greetUser": "Good morning, {person}",
"@greetUser": {
  "description": "Greeting with the user's first name",
  "placeholders": {
    "person": { "type": "String", "example": "Ada" }
  }
}
```

Generated call: `l10n.greetUser('Ada')`.

## Plurals

Quantity-dependent wording uses the `plural` form. The `other` branch must always be present, because it is the fallback for every count not named. Inside a branch, `{count}` prints the number.

```json
"cartItems": "{count, plural, =0{Your cart is empty} =1{1 item} other{{count} items}}",
"@cartItems": {
  "description": "Item count in the cart badge",
  "placeholders": {
    "count": { "type": "num", "format": "compact" }
  }
}
```

The `format` key controls how the number prints; `compact` gives short forms such as 1.2K for large counts. Generated call: `l10n.cartItems(3)`.

## Selects

For wording that depends on a category value, such as a person's grammatical gender, use `select`. Include `other` as the catch-all.

```json
"ownerLabel": "{kind, select, host{the host} guest{the guest} other{someone}}",
"@ownerLabel": {
  "description": "Who owns the booking",
  "placeholders": {
    "kind": { "type": "String" }
  }
}
```

The caller passes a string that matches one branch name, anything else lands in `other`.

## A widget that uses two of them

```dart
import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart'; // path from this file to the generated output; adjust to your folders

class InboxHeader extends StatelessWidget {
  const InboxHeader({super.key, required this.person, required this.unread});

  final String person;
  final int unread;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        Text(l10n.greetUser(person)),
        Text(l10n.cartItems(unread)), // reuses the plural message above for a count
      ],
    );
  }
}
```

## Config reminder

A complete `l10n.yaml` with escaping on:

```yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
use-escaping: true
```

There is no `synthetic-package` line on purpose: current Flutter rejects `true`.

With `use-escaping: true`, wrap literal braces or apostrophes in single quotes inside messages.
