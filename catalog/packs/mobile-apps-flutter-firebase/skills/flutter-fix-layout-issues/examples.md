# Layout fix examples

## List inside a column

Broken, throws the unbounded height error:

```dart
Column(
  children: [
    const Text('Your orders'),
    ListView(
      children: const [
        ListTile(title: Text('Order 4021')),
        ListTile(title: Text('Order 4022')),
      ],
    ),
  ],
)
```

Fixed, the list takes only the space left under the heading:

```dart
Column(
  children: [
    const Text('Your orders'),
    Expanded(
      child: ListView(
        children: const [
          ListTile(title: Text('Order 4021')),
          ListTile(title: Text('Order 4022')),
        ],
      ),
    ),
  ],
)
```

## Text field inside a row

Broken, the field has no width limit:

```dart
Row(
  children: [
    const Icon(Icons.mail),
    TextField(),
  ],
)
```

Fixed, the field fills what the icon leaves:

```dart
Row(
  children: [
    const Icon(Icons.mail),
    Expanded(child: TextField()),
  ],
)
```

## Long text beside an icon

Broken, the string runs past the screen edge and reports an overflow in pixels:

```dart
Row(
  children: [
    const Icon(Icons.warning),
    const Text('Delivery to the second address was delayed because the courier could not reach the recipient.'),
  ],
)
```

Fixed, the text wraps inside its share:

```dart
Row(
  children: [
    const Icon(Icons.warning),
    const Expanded(
      child: Text('Delivery to the second address was delayed because the courier could not reach the recipient.'),
    ),
  ],
)
```
