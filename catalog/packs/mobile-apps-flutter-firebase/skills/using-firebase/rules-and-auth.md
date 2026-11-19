# Rules and Auth notes

## Rule file anatomy

Firestore: `rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { ... } }`. Storage: `service firebase.storage { match /b/{bucket}/o { ... } }`.

Paths: `match /users/{uid}` is one level; `match /users/{uid}/{doc=**}` covers the document and everything under it. Operations: `get`, `list` (together `read`), `create`, `update`, `delete` (together `write`).

Inputs: `request.auth` (null when signed out; `.uid`, `.token.email`, `.token.email_verified`, custom claims at `.token.<name>`), `request.resource.data` (what will be stored), `resource.data` (what is stored), `request.time`. Storage adds `request.resource.size`, `.contentType`, `.metadata` and the same on `resource`.

End every file with a match on everything that denies. Rules are not filters: a query must itself be narrow enough that every possible result is allowed.

## Common patterns

- Owner only: `request.auth != null && request.auth.uid == uid`.
- Signed in only: `request.auth != null`.
- Public read, signed-in write.
- Author check: compare `resource.data.authorId` (update, delete) or `request.resource.data.authorId` (create) with `request.auth.uid`.
- Time window: `request.time < resource.data.createdAt + duration.value(24, 'h')`.
- Rate limit: read a per-user marker with `get(/databases/$(database)/documents/limits/$(request.auth.uid))` and require the last action to be older than a minute. Each `get` or `exists` costs a billed read.
- Put repeated checks in named functions (`isSignedIn`, `isOwner(uid)`, `isAdmin`, `hasRole(r)`).

## Validating writes

- Required keys: `data.keys().hasAll([...])`. Only these keys: `data.keys().hasOnly([...])`.
- Types: `is string`, `is int`, `is bool`, `is list`, `is map`, `is timestamp`.
- Length: `data.title.size() <= 100`. Allowed values: `data.status in ['draft', 'published']`.
- Locked fields on update: require `request.resource.data.authorId == resource.data.authorId`.
- Limit what may change: `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['name', 'bio'])`.
- Stamp times from the server: `data.createdAt == request.time`.

## Storage rules

Gate by folder (`users/{uid}/...`), file size (`request.resource.size < 5 * 1024 * 1024`), type (`contentType.matches('image/.*')` or an allow list), file name by a whole-segment path variable checked with `matches()` (`match /profiles/{uid}/{fileName}` with a `fileName.matches(...)` test, as in `assets/storage.rules.template`; a partial segment such as `avatar.{ext}` does not compile), and custom metadata such as `uploadedBy`. Uploads that only a backend should delete get `allow delete: if false`.

## Testing rules

Start from `assets/rules.test.template.mjs`: copy it to `rules.test.mjs` next to `firestore.rules` and `storage.rules`; its header lists the packages to install. It uses the rules testing library against the Firestore and Storage emulators: `initializeTestEnvironment({ projectId: "demo-rules", firestore: { rules }, storage: { rules } })`, then `unauthenticatedContext()` or `authenticatedContext("uid", { admin: true })`, with calls wrapped in `assertSucceeds` or `assertFails` and data seeded with `withSecurityRulesDisabled`. Add a case for every rule you change, and cover at least: signed out is refused, owner is allowed, another user is refused, admin claim is allowed, a create missing a required field fails. Run with `npx firebase-tools@15.36.0 emulators:exec --only firestore,storage --project demo-rules "node --test rules.test.mjs"`; the `demo-` project id keeps the run off every real project. Deploy with `npx firebase-tools@15.36.0 deploy --only firestore:rules` or `--only storage`.

## Client sign-in

Init the Auth client from the app, and during development point it at the Auth emulator (port 9099). Providers: email and password (create, sign in, reset), Google popup or redirect, phone number with a verification code, anonymous (can later be linked to a real provider so the uid survives). Sign out clears the session.

## Server checks

Get the ID token on the client (`user.getIdToken()`), send it as `Authorization: Bearer <token>`, and verify it with the Admin SDK (`verifyIdToken`). In callable functions `request.auth` is already verified; in HTTP functions you verify the header yourself.

## Custom claims

Set them on the server only: `setCustomUserClaims(uid, { admin: true, role: "editor" })`. The user sees the change after the next token refresh (force one with `getIdToken(true)`). Rules read them as `request.auth.token.role`. Total claims must stay under the documented size cap (1000 bytes at the time of writing; check the vendor's documentation), and reserved names (`exp`, `iat`, `iss`, `aud`, `sub`, `firebase`, `nonce`, `auth_time`, `azp`, `acr`, `amr`, `at_hash`, `c_hash`, `cnf`, `jti`, `nbf`) cannot be used.

## Custom tokens and user admin

`createCustomToken(uid, claims)` on the server and `signInWithCustomToken` on the client link an outside identity system to Firebase. The Admin SDK also gets, creates, updates, deletes and lists users and can revoke refresh tokens (`revokeRefreshTokens(uid)`) to log someone out everywhere. Deleting users is irreversible: ask first.
