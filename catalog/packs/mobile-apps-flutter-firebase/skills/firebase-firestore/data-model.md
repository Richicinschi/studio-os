# Data model

Firestore stores documents inside collections. There are no tables and no rows.

## Documents

- A document is a record of named fields: strings, numbers, booleans, timestamps, lists, and nested maps.
- The Firestore documentation sets a size limit per document (1 MiB at the time of writing). Large blobs belong elsewhere.
- Example in a `users` collection: `{ "first": "Nia", "last": "Okafor", "joined": 2021 }`.

## Collections

- A collection holds documents and nothing else. It cannot hold bare fields or other collections directly.
- Two documents in the same collection may have different fields.
- You never create or delete a collection by itself. The first document brings it into being, and removing the last document makes it vanish.

## Subcollections

A document can own subcollections. A `users` document might own a `notes` subcollection, giving paths such as `users/u42/notes/n7`. Use a subcollection when the children only make sense under one parent and you usually read them per parent.

## Collection groups

A collection group is every collection that shares one id, wherever it sits. A normal query reads one collection. A collection group query reads all of them at once.

Example: each hiking trail has a `comments` subcollection.

- One trail: `db.collection('trails/misty_ridge/comments').where('stars', '==', 4)`
- All trails: `db.collectionGroup('comments').where('stars', '==', 4)`

Collection group queries need their own index scope (see [indexes](indexes.md)), and rules for them must match the id with a recursive wildcard.

## Design habits

- Model for the queries the screens run, not for tidy theory. List the screens and queries first.
- Never mix public and private fields in one document. Rules work per document (see [security rules](security-rules.md)).
- Prefer the timestamp type to date strings.
