# Provisioning and deploy

Never run the interactive `init` command from an agent: it waits for keyboard answers. Write the three files by hand instead.

## The three files

1. `firebase.json` configures the CLI. If it already exists, merge into it, do not overwrite.
2. `firestore.rules` holds the rules.
3. `firestore.indexes.json` holds the index definitions.

### firebase.json

Standard edition, default database:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

For a named database add `"database"` and `"location"`. A Standard database that is named in the config but does not exist yet is created by the deploy. To choose the location: run `firestore:locations`, ask the user, and suggest the region the app already uses.

Enterprise edition adds the edition key:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json",
    "edition": "enterprise",
    "database": "tasks-db",
    "location": "<chosen-location>"
  }
}
```

### Creating an Enterprise database (ask first, it can cost money)

```bash
firebase firestore:databases:create tasks-db \
  --location="<chosen-location>" \
  --edition="enterprise" \
  --firestore-data-access="ENABLED" \
  --mongodb-compatible-data-access="DISABLED"
```

- The id is required and cannot be `(default)`.
- Add `--realtime-updates="ENABLED"` when the app needs live listeners.
- Only `--firestore-data-access` (ENABLED or DISABLED) was confirmed against vendor docs; for the other flag values run `firebase firestore:databases:create --help`.
- Check afterwards with `firestore:databases:get tasks-db`.

### Starter rules: everything denied

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Real rules come from [security rules](security-rules.md).

### Starter indexes: empty

```json
{
  "indexes": [],
  "fieldOverrides": []
}
```

## Deploying

Deploy is not optional. Until it runs, a Standard database named only in config does not exist in the cloud, and neither rules nor indexes are live. Deploying changes a live project, so say what you are about to push and get a yes first.

- Everything: `deploy --only firestore`
- Rules only: `deploy --only firestore:rules`
- Indexes only: `deploy --only firestore:indexes`

Prefix each with `npx -y firebase-tools@latest` when the CLI is not installed.

## Emulator

`emulators:start --only firestore` runs a local Firestore, normally on port 8080, with a web UI on port 4000 of localhost under the firestore path. Point app tests at it so test data never touches the real database.
