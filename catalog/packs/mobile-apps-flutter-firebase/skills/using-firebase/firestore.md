# Firestore notes

## Shape and limits

The numbers here are the vendor's documented limits at the time of writing; check the vendor's documentation for current values.

Data lives in documents (maps of fields) inside collections; a document may own subcollections. A document holds at most 1 MB, a path may be at most 100 levels deep, a field name at most 1,500 bytes.

## Starting a client

Web and Node client: `getFirestore(app)`. Server code (Admin SDK, which ignores rules): `getFirestore()` after `initializeApp()`. Python: `firebase_admin.initialize_app()` then `firestore.client()`; inside Cloud Functions the credentials come for free.

## Reading and writing

- Write with a chosen id: `setDoc(ref, data)`. With an automatic id: `addDoc(collectionRef, data)`. Partial overwrite: `setDoc(ref, data, { merge: true })`.
- `updateDoc` changes named fields and fails if the document is missing. Dotted paths reach inside maps (`"address.city"`).
- Field helpers: `serverTimestamp()`, `increment(n)`, `arrayUnion(x)`, `arrayRemove(x)`, `deleteField()`.
- Read one document with `getDoc` and check `exists()`. Read a set with `getDocs(query)`.
- `deleteDoc` removes one document only. Its subcollections stay. To clear a tree use the CLI `firebase firestore:delete <path> --recursive` (ask first).

## Queries

Operators: `==`, `!=`, `<`, `<=`, `>`, `>=`, `array-contains`, `array-contains-any`, `in`, `not-in`. `in` and `array-contains-any` accept at most 30 values; `not-in` at most 10. An OR query may expand to at most 30 disjunctions.

OR: wrap clauses in `or(...)`, and nest `and(...)` inside for mixed logic. Across all subcollections with one name use `collectionGroup(db, "comments")`, which needs a composite index at collection-group scope. Page with cursors: order by a field, then `startAfter(lastDoc)` plus `limit(n)`.

## Live listeners

`onSnapshot(ref or query, onNext, onError)` returns an unsubscribe function. Always keep it and call it when the screen goes away. Provide the error callback; a rules denial arrives there.

## Transactions and batches

A transaction reads first, then writes, and retries itself if the data moved. Use it for read-modify-write such as moving a balance. A batch is for several writes that must land together and need no reads. Both are atomic. A transaction is retried a finite number of times when a document it read changes, so its function may run more than once: keep it free of side effects outside the database. A transaction fails offline, while a batch can queue offline. Size is limited (10 MiB per transaction at the time of writing) and the old fixed count of 500 writes per batch is not in the current documentation: split large jobs into several batches, and check the vendor's documentation for the current ceiling.

## Modelling

Embed when the pieces are read together, change rarely and a single read is the goal (an author's name on a post). Reference when the data changes often, is shared by many, is large or has no upper size. Use a subcollection for a natural parent and child (`posts/{id}/comments`) and a root collection with a parent id field when you must query across parents or the link is many to many.

## Counting and totals

Firestore has server-side aggregation queries: `count()`, `sum()` and `average()` over a query (web: `getCountFromServer` and `getAggregateFromServer`; Python uses `avg`). There is no group-by or min/max. For totals read very often, keep a counter document and bump it with `increment` in the same transaction or in a function; use sharded counters when writes to one counter would exceed what one document can take.

## Indexes

Every single field is indexed automatically. A query on several fields, or with an inequality plus an order on another field, needs a composite index. Declare indexes in `firestore.indexes.json` (each has `collectionGroup`, `queryScope` of COLLECTION or COLLECTION_GROUP, and `fields` with an order) and use `fieldOverrides` to switch off indexing on big text fields. Deploy with `firebase deploy --only firestore:indexes`. A failing query prints a link that creates the missing index.

## Offline

Mobile SDKs cache by default. On web, enable it explicitly (IndexedDB persistence). `snapshot.metadata.hasPendingWrites` tells local from confirmed data, and `waitForPendingWrites(db)` resolves when everything reached the server.
