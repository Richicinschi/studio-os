# Flutter with Firebase, start to finish

## Tools you need

1. **Flutter SDK on PATH.** If it is missing:
   - Find the machine type: `uname -m` tells Intel (`x64`) from Apple Silicon (`arm64`).
   - Download the latest stable SDK from the Flutter archive page for that platform, unzip it somewhere permanent such as `~/tools/flutter-sdk`, and add its `bin` folder to PATH in the shell profile (`~/.profile` for example).
   - Run `flutter doctor` to confirm.
2. **Firebase CLI signed in:** `npx -y firebase-tools@latest --version`, then `login`.
3. **FlutterFire CLI:** `dart pub global activate flutterfire_cli`. If `flutterfire` is then not found, add `~/.pub-cache/bin` to PATH.

## The path

1. **Project.** No app yet? `flutter create trail_notes` and enter the folder.
2. **Link to Firebase.** Stop and ask the developer, before running anything, whether to use an existing project ID or create one. Then run `flutterfire configure --project=<project_id>`, or plain `flutterfire configure` to choose or create interactively. It registers each platform app (iOS, Android, web and so on) and writes `lib/firebase_options.dart`.
3. **Start Firebase in code.** `flutter pub add firebase_core`, then in `lib/main.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const MyApp());
}
```

4. **Each new service** (Firestore, Auth, and so on): `flutter pub add <plugin>` (for example `firebase_storage`), then run `flutterfire configure` again so platform files stay in sync, then import and use it.

## Traps

- **Renamed app ID.** Changing the iOS bundle identifier or the Android `applicationId` after configuring leaves stale config. Run `flutterfire configure` again to regenerate the platform files and `firebase_options.dart`.
- **Android minimum SDK.** Firebase plugins often need a higher `minSdkVersion` than the Flutter default (the plugin's error message names the value it needs). Raise it in `android/app/build.gradle` when a plugin demands it.
- **iOS pods.** After adding a plugin with native code, look in `ios/` for a `Podfile`; if present, run `pod install`, or Xcode will fail to build. A project that uses only Swift Package Manager (FlutterFire supports it) may have no `Podfile`, which is fine.
- **Web and CORS in local testing.** Do not reach for `--disable-web-security`. Run on a fixed host and port instead, and add `localhost` to the authorized domains in Firebase Auth settings:

```bash
flutter run -d chrome --web-hostname=localhost --web-port=8081
```

- **Why `ensureInitialized` comes first.** Firebase setup talks to native iOS and Android code through platform channels. That call is mandatory: it makes sure the Flutter engine is ready for those calls before `runApp` starts. Leave it out and startup can fail unpredictably.
