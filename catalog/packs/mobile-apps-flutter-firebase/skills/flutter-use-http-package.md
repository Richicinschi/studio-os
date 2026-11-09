---
id: flutter-use-http-package
title: Flutter REST calls with the http package
description: Use when you need a Flutter app to call a REST API with the http package: GET, POST, PUT or DELETE, fetch from or send data to a REST API, typed JSON models, error handling, FutureBuilder display, background parsing.
---

# Flutter REST calls with the http package

## When to use

- "Fetch this list from an API", "post a form to my backend", "update or delete a record over HTTP".
- Any Flutter code that talks plain REST/JSON.
- Neighbours: Firebase reads and writes go through the Firebase skills; JSON model generation belongs to the JSON skill; this one covers the request, the status check and the display.

## How it works

1. Add the package with `flutter pub add http`, then import it with a prefix: `import 'package:http/http.dart' as http;`.
2. Allow network access per platform. Android: add `<uses-permission android:name="android.permission.INTERNET" />` to `android/app/src/main/AndroidManifest.xml`. macOS: add the key `com.apple.security.network.client` set to `<true/>` in both `macos/Runner/DebugProfile.entitlements` and `macos/Runner/Release.entitlements`. A missing entry makes requests fail at runtime on that platform only, so a test on another platform will not reveal it.
3. Build the address with `Uri.parse(...)`, never a raw string. For GET, put filters in the query part of the URI. Put the token and accept type in the `headers` map; use `HttpHeaders.authorizationHeader` as the key for credentials.
4. For POST and PUT, send header `'Content-Type': 'application/json; charset=UTF-8'` and a body made with `jsonEncode(...)` from `dart:convert`. For DELETE, return an empty model instance once the server answers 200.
5. Check `response.statusCode`: 200 is success for GET, PUT and DELETE; 201 for POST. Anything else, throw an `Exception` that carries the code. Never return null on failure: `FutureBuilder` would never see an error and the spinner runs forever.
6. Define a typed class first, with a `factory Model.fromJson(Map<String, dynamic> json)`. Turn the body into data with `jsonDecode(response.body)` and map it through that factory.
7. Make the request function return `Future<Model>` (or `Future<List<Model>>`).
8. For large payloads, parse off the UI thread: import `package:flutter/foundation.dart` and call `compute(parseFn, response.body)`. `parseFn` must be a top-level function or a static method; closures and instance methods cannot cross isolates.
9. In the widget, hold the Future in a state field set once in `initState`, so rebuilds do not refetch. Use `FutureBuilder`: show data when `snapshot.hasData`, an error text when `snapshot.hasError`, else a `CircularProgressIndicator`.
10. Run the app, trigger the call, read the console for unhandled exceptions, and fix parse or permission errors before moving on.

A full worked example (product catalog with a bearer header and background parsing) is in [http-catalog-example.md](flutter-use-http-package/http-catalog-example.md).

## Checks before done

- Android manifest and both macOS entitlement files carry the network permission.
- Every non-success status throws; no code path returns null.
- Write calls send the JSON content type and an encoded body.
- The function passed to `compute` is top-level or static.
- The Future is created once, not inside `build`.
- The app was run and the console showed no unhandled exception.
