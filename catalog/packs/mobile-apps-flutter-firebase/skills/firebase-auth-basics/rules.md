# Reading the signed-in user in security rules

Rules see the caller through `request.auth`. It is `null` for anonymous callers who never signed in; a guest account created with anonymous sign-in is not null. For the full rule-writing craft use the Firestore or Storage skills, and `firebase-security-rules-auditor` to review.

## Common checks

Any signed-in account (weakest, rarely enough for private data):

```
allow read, write: if request.auth != null;
```

The user's own document, when the document id is the uid (`match /users/{userId}`):

```
allow read, write: if request.auth != null && request.auth.uid == userId;
```

A document that stores its owner in a field (here `owner_uid`):

```
allow read, write: if request.auth != null && request.auth.uid == resource.data.owner_uid;
```

On create there is no `resource` yet; compare `request.resource.data.owner_uid` instead.

## Token claims

`request.auth.token` holds standard claims and any custom claims you set:

- `request.auth.token.email`
- `request.auth.token.email_verified`
- `request.auth.token.name`

Example, only people with a verified email may create:

```
allow create: if request.auth.token.email_verified == true;
```
