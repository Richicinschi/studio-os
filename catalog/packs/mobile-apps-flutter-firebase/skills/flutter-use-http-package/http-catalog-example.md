# Worked example: product catalog over HTTP

Fetches a JSON array, parses it in a background isolate, shows it in a list. Replace the address and token with your own.

```dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class Product {
  const Product({required this.sku, required this.label, required this.imageUrl});
  final int sku;
  final String label;
  final String imageUrl;

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        sku: json['sku'] as int,
        label: json['label'] as String,
        imageUrl: json['imageUrl'] as String,
      );
}

// Top level, so compute() can send it to another isolate.
List<Product> decodeProducts(String body) {
  final rows = (jsonDecode(body) as List<Object?>).cast<Map<String, Object?>>();
  return rows.map<Product>(Product.fromJson).toList();
}

Future<List<Product>> loadCatalog() async {
  final res = await http.get(
    Uri.parse('API_BASE_URL/v2/catalog'),
    headers: {
      HttpHeaders.authorizationHeader: 'Bearer <token>',
      HttpHeaders.acceptHeader: 'application/json',
    },
  );
  if (res.statusCode != 200) {
    throw Exception('Catalog request failed with status ${res.statusCode}');
  }
  return compute(decodeProducts, res.body);
}

class CatalogList extends StatefulWidget {
  const CatalogList({super.key});
  @override
  State<CatalogList> createState() => _CatalogListState();
}

class _CatalogListState extends State<CatalogList> {
  late final Future<List<Product>> _catalog;

  @override
  void initState() {
    super.initState();
    _catalog = loadCatalog(); // once, not in build
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Product>>(
      future: _catalog,
      builder: (context, snap) {
        if (snap.hasError) return Center(child: Text('Error: ${snap.error}'));
        final items = snap.data;
        if (items == null) return const Center(child: CircularProgressIndicator());
        return ListView.builder(
          itemCount: items.length,
          itemBuilder: (_, i) => ListTile(
            leading: Image.network(items[i].imageUrl),
            title: Text(items[i].label),
          ),
        );
      },
    );
  }
}
```
