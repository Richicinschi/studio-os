# JSON model examples

Three pieces: a model, a single-object fetch, and a list fetch parsed off the UI thread.

## Model for a library book

```dart
class Book {
  final int id;
  final String heading;
  final int pageCount;

  const Book({required this.id, required this.heading, required this.pageCount});

  factory Book.fromJson(Map<String, dynamic> map) {
    if (map case {'id': int id, 'title': String title, 'pages': int pages}) {
      return Book(id: id, heading: title, pageCount: pages);
    }
    throw FormatException('Book JSON has missing or mistyped keys: $map');
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': heading,
        'pages': pageCount,
      };
}
```

The Dart field may be named differently from the JSON key, as with `heading`. Only the map keys must match the API.

## One object, parsed inline

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Book> loadBook(http.Client client, int id) async {
  final res = await client.get(
    Uri.parse('https://<api-host>/books/$id'),
    headers: {'Accept': 'application/json'},
  );
  if (res.statusCode != 200) {
    throw Exception('Book request failed with ${res.statusCode}');
  }
  return Book.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
}
```

Taking the client as a parameter lets tests pass a fake.

## A big list, parsed in a background isolate

```dart
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

// Must be top level (or static) so compute can run it in another isolate.
List<Book> decodeBooks(String body) {
  final rows = (jsonDecode(body) as List<dynamic>).cast<Map<String, dynamic>>();
  return [for (final row in rows) Book.fromJson(row)];
}

Future<List<Book>> loadBooks(http.Client client) async {
  final res = await client.get(Uri.parse('https://<api-host>/books'));
  if (res.statusCode != 200) {
    throw Exception('Book list request failed with ${res.statusCode}');
  }
  return compute(decodeBooks, res.body);
}
```

Pass the body string, not decoded objects, so the decoding work itself moves off the UI thread.
