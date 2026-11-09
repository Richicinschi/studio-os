---
id: firebase-auth-basics
title: Firebase Auth basics
description: Use when the app needs login, user management, or locked-down data via auth rules (user sign-in, secure data access): enabling providers, Flutter, web, Android or iOS clients, request.auth checks in Firestore or Storage rules.
---

## When to use

Typical asks: "add login to my app", "let people sign in with Google", "anonymous guest accounts", "only the owner can read this document", "the Google popup closes by itself".

Neighbours:
- Creating the Firebase project, installing or logging in the CLI: `firebase-basics`.
- Writing and testing the wider rule set for Firestore data: `firebase-firestore`, and `firebase-security-rules-auditor` to review rules you already have.
- This skill covers what is in between: which provider to switch on, how a client signs in and out, and how rules read the signed-in user.

## How it works

1. **Have a project and the CLI.** You need a Firebase project and a logged-in CLI (run it with `npx -y firebase-tools@latest`; a global install is optional). A new project is made with `npx -y firebase-tools@latest projects:create`. If the project or the login is missing, hand over to `firebase-basics` first.

2. **Know what a user is.** Firebase Auth supplies backend services, client SDKs and ready-made sign-in UI libraries. Every account has a `uid`, unique across all sign-in methods. Other fields can be absent depending on the provider: `email`, `displayName`, `photoURL`, and the boolean `emailVerified`. Never assume an email exists.

3. **Pick providers.** Choices: email and password; federated sign-in (Google, Facebook, Twitter, GitHub, Microsoft, Apple and more); phone by SMS; anonymous guest accounts that can be linked to a real account later; custom auth fed from an existing system. Default to Google Sign-In unless the user has a reason not to.

4. **Understand tokens.** A successful sign-in yields an ID token (a JWT, valid for 1 hour) that proves identity to Firebase services and to your own backend. A long-lived refresh token silently gets new ID tokens. The SDKs do the refreshing; you only handle it yourself when verifying tokens on a server.

5. **Enable the providers.**
   - From the CLI, only Google Sign-In, anonymous and email/password can be switched on. Add an `auth` block to `firebase.json`:
     ```json
     {
       "auth": {
         "providers": {
           "anonymous": true,
           "emailPassword": true,
           "googleSignIn": {
             "oAuthBrandDisplayName": "Trail Notes",
             "supportEmail": "care@trailnotes.test",
             "authorizedRedirectUris": ["HTTPS_HOST_PLACEHOLDER", "http://localhost"]
           }
         }
       }
     }
     ```
   - Editing the file does nothing by itself. Run `npx -y firebase-tools@latest deploy --only auth` so the backend applies it and creates the OAuth clients for your platforms. This changes a live project: say so and get a yes before running it.
   - Every other provider is enabled by hand in the console, under Authentication, then Sign-in method: open your project, switch on the provider, save.

6. **Authorized domains.** If a Google popup opens and closes at once with `unauthorized-domain`, the page's host is not on the allowed list. Add `localhost` (for local runs) in the console under Authentication settings, or, if your installed CLI accepts it, an `authorizedDomains` list in the `auth` block of `firebase.json` (the CLI's provider page does not list that key: check the vendor's current documentation, and treat the console route as the sure one). Enter the bare host only: `localhost`, never `http://localhost:9090`.

7. **Connect the client.** Open the file for the platform, Flutter first because it is the studio's main stack:
   - Flutter: [flutter.md](firebase-auth-basics/flutter.md)
   - Web: [web.md](firebase-auth-basics/web.md)
   - Android with Kotlin: [android.md](firebase-auth-basics/android.md)
   - iOS with Swift: [ios.md](firebase-auth-basics/ios.md)

8. **Protect the data.** Rules read the caller through `request.auth`. Patterns are in [rules.md](firebase-auth-basics/rules.md).

## Checks before done

- The provider is enabled in the console or in a deployed `auth` config, not only written to `firebase.json`.
- Authorized domains contain hosts only, no scheme and no port.
- The app reacts to auth state changes (a stream or listener) instead of reading the user once at start.
- On iOS, no `Auth.auth()` is created before `FirebaseApp.configure()` has run.
- On Flutter web, the Google plugin is not initialized or signed out without a client id (see the Flutter file).
- Any rule that says `request.auth != null` is not the only gate on private data; ownership is checked too.
- Nothing was deployed to a live project without the user's yes.
