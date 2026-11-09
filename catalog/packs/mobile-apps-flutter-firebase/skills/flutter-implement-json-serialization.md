---
id: flutter-implement-json-serialization
title: Hand-written JSON models in Flutter
description: Use when manually writing model classes with fromJson and toJson via dart:convert, mapping JSON keys to class properties for simple data structures, parsing http responses, and moving big payloads off the UI thread.
---

## When to use

- "Add a model for this JSON", "write fromJson and toJson", "parse this API response".
- Small or medium data shapes where a few fields are mapped by hand.
- A fetch that returns JSON and must become typed Dart objects.

If the shapes are many, deeply nested, or change often, a generator-based setup fits better than hand-written maps. That is a different job; this skill stays with manual mapping.

## How it works

1. Import `dart:convert`. It gives `jsonDecode` for text to data and `jsonEncode` for data to text.
2. `jsonDecode` returns `dynamic`. Cast the result straight away: `Map<String, dynamic>` for an object, `List<dynamic>` for an array.
3. Make the model a plain class with `final` fields and a `const` constructor with required named parameters.
4. Add `factory Model.fromJson(Map<String, dynamic> json)`. Read each key with a type check, either a `switch` over a map pattern (`{'id': int id, ...}`) or explicit `as` casts. When a key is missing or has the wrong type, throw a `FormatException`; do not build a half-filled object.
5. Add `Map<String, dynamic> toJson()` that returns every field under its JSON key. Keep key names identical to the ones `fromJson` reads, so a round trip gives back an equal object.
6. For a network call, use the `http` package. Check the status code first (200 for a read, 201 for a create). On any other code throw an `Exception`; never return `null` to hide a failure.
7. Pick where to parse. A single object or a short list is parsed inline. A big payload (one whose parse shows up as dropped frames when you time it with the performance overlay or the profiler on a real device) goes through `compute(parseFn, response.body)`. `compute` needs a top-level or static function that takes the raw body string and returns the model list.
8. Decode, cast, then pass the map to `fromJson`.

Worked code for a model, a single fetch and a background list fetch: [json-model-examples.md](flutter-implement-json-serialization/json-model-examples.md).

## Checks before done

- Every `jsonDecode` result is cast before use.
- `fromJson` throws on missing or mistyped keys.
- A unit test feeds a sample map to `fromJson`, checks the fields, then checks that `toJson` reproduces the map.
- A unit test feeds a bad map and expects the exception.
- Non-success status codes throw; no path returns `null` for an error.
- Large lists use `compute` with a top-level function.
- Run `flutter test` and `flutter analyze`; fix any type-mismatch errors by correcting the casts, not by loosening types to `dynamic`.
