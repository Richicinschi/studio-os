# Auth on Flutter, mobile and web

Applies when `google_sign_in` is on its 7.x line and the app targets both phones and the browser.

## 1. What changed in the Google plugin

- The old `signIn()` call is gone. Use `authenticate()` on platforms where `GoogleSignIn.instance.supportsAuthenticate()` is true; the web plugin does not offer it, which is why the web path below uses Firebase's popup.
- The result no longer bundles identity and authorization. Authenticating gives you an `idToken` only. If you need an `accessToken` to call a Google API, ask for server authorization as a separate step.

## 2. Initialize once, and not on web

- Before any other call, run `await GoogleSignIn.instance.initialize();` once at startup.
- On web, initializing without a `clientId` argument and without the `google-signin-client_id` meta tag in `web/index.html` raises an assertion, and the debug service then hangs: you see a blank page and no error worth reading.
- Simplest fix: let Firebase handle the web flow with `signInWithPopup(GoogleAuthProvider())` and skip the plugin there:
  ```dart
  if (!kIsWeb) {
    await GoogleSignIn.instance.initialize();
  }
  ```

## 3. Sign-out on web

If the plugin was never initialized on web, calling its `signOut()` there crashes. Guard it and always finish with Firebase:

```dart
if (!kIsWeb) {
  await GoogleSignIn.instance.signOut();
}
await FirebaseAuth.instance.signOut();
```

## 4. Prototype shortcut for per-user queries

A Firestore query that filters on `userId` and orders by `createdAt` needs a composite index. While prototyping you can filter only, then sort the returned list in Dart. Treat that as temporary; real data sets need the index.

## 5. A service class that handles both targets

```dart
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';

class SignInService {
  SignInService() {
    if (!kIsWeb) {
      GoogleSignIn.instance.initialize();
    }
  }

  final FirebaseAuth _firebase = FirebaseAuth.instance;

  Stream<User?> get userChanges => _firebase.authStateChanges();
  User? get user => _firebase.currentUser;

  /// Returns null when the person cancels or the attempt fails.
  Future<UserCredential?> google() async {
    try {
      if (kIsWeb) {
        return await _firebase.signInWithPopup(GoogleAuthProvider());
      }
      final account = await GoogleSignIn.instance.authenticate();
      final tokens = account.authentication;
      final credential = GoogleAuthProvider.credential(idToken: tokens.idToken);
      return await _firebase.signInWithCredential(credential);
    } catch (e) {
      debugPrint('Google sign-in failed: $e');
      return null;
    }
  }

  Future<void> signOut() async {
    try {
      if (!kIsWeb) {
        await GoogleSignIn.instance.signOut();
      }
    } catch (e) {
      debugPrint('Plugin sign-out failed: $e');
    } finally {
      await _firebase.signOut();
    }
  }
}
```

Drive the UI from `userChanges` (a `StreamBuilder`, or your router's redirect) so sign-in and sign-out update every screen. Check the plugin's current docs if `authenticate()` or `authentication` has a different shape in your installed version.

## 6. Troubleshooting `unauthorized-domain` on web

- Symptom: the popup flashes and closes; the console prints that the domain is not authorized for OAuth for the project.
- Cause: the host (usually `localhost`) is missing from the authorized domains.
- Fix: add it under Authentication settings in the console. A list in the `auth` section of `firebase.json` followed by an auth deploy may also work, but check the vendor's current documentation for that key before relying on it.
- Enter `localhost` only. No scheme and no port: Flutter web picks random ports, and Firebase compares hosts only.
