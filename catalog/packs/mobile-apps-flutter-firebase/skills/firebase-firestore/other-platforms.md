# Pipelines, web and Python

Native Android and iOS are in [native mobile](native-mobile.md). Flutter is in [Flutter usage](flutter-usage.md).

## Pipelines on Enterprise: the default choice

On an Enterprise database, build data logic with the pipeline API first. A pipeline runs its stages inside the database.

Rules:

1. Read the API before you query. In the web package the typings are `pipeline.d.ts` and `expressions.d.ts`, both inside the `lite-api` folder (under `node_modules/@firebase/firestore/dist/lite/firestore/src`). Study the first before you query; use the second only to confirm a specific expression exists. Never assume an expression is there.
2. Push filtering, joining, sorting and counting into stages. Do not map, sort or total arrays in app code.
3. A plain `where` query or a live listener is the exception. Use it only when real-time updates or offline caching are a firm requirement, and say so in your reply.

### Join

Bind the foreign key with `define`, then add a field from a nested pipeline that filters on the document id and collapses to one value:

```javascript
import { field, variable } from "firebase/firestore/pipelines";

const articlesWithWriter = db.pipeline().collection("articles")
  .define(field("writerUid").as("w"))
  .addFields(
    db.pipeline().collection("writers")
      .where(field("__name__").documentId().equal(variable("w")))
      .select(field("penName"), field("portraitUrl"))
      .toScalarExpression()
      .as("writer")
  );
```

### Full-text search

The `search` stage only looks at fields that have a text index, so create one first (see the vendor's text-search page). Stage and expression signatures change between preview releases; confirm each one in the installed typings.

```javascript
import { documentMatches, score } from "firebase/firestore/pipelines";

const hits = db.pipeline().collection("articles")
  .search({ query: documentMatches("pour over"), sort: score().descending() })
  .limit(8);
```

## Web (modular SDK)

Initialise with the config object (get its values from the CLI `apps:sdkconfig` command for the web app). On Firebase App Hosting, `initializeApp()` with no arguments works.

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const db = getFirestore(initializeApp(firebaseConfig));
```

For an Enterprise database pass the database id as the second argument of `getFirestore`. Verify the signature in the installed typings.

The usual calls:

- `setDoc(doc(db, "stations", "AMS"), data)` creates or replaces; add `{ merge: true }` to keep other fields.
- `addDoc(collection(db, "stations"), data)` for an automatic id; the result carries `.id`.
- `updateDoc(ref, { open24h: true })` changes fields and fails if the document is missing.
- `runTransaction(db, async (tx) => { const s = await tx.get(ref); ... tx.update(ref, {...}); })` for read-modify-write.
- `getDoc(ref)` then `snap.exists()`; `getDocs(queryOrCollection)` for many.
- `onSnapshot(ref or query, callback)` returns an unsubscribe function; call it when the view goes away. Inside, `snapshot.docChanges()` yields `added`, `modified`, `removed`.
- `query(ref, where("zone", "==", "NL"), orderBy("title"), limit(4))`. Filters on different fields can need a composite index.

## Python (server)

The server SDK picks up Application Default Credentials in Google Cloud environments.

```python
ref = db.collection("stations").document("AMS")
ref.set({"title": "Amsterdam Centraal"})            # replace
ref.set({"platforms": 15}, merge=True)  # merge
ref.update({"open24h": True})               # fails if missing
_, new_ref = db.collection("stations").add({"title": "Utrecht Centraal"})  # auto id
snap = ref.get()
if snap.exists:
    print(snap.to_dict())
for d in db.collection("stations").stream():
    print(d.id, d.to_dict())
```

- Filters: `from google.cloud.firestore import FieldFilter`, then `.where(filter=FieldFilter("zone", "==", "NL"))`, chained for AND; `.order_by("title").limit(4)`.
- Transactions: decorate a function with `@firestore.transactional`, read with `ref.get(transaction=tx)`, write with `tx.update(...)`.
- Pipeline: `client.pipeline().collection("stations")`, then iterate `.execute()` and read `result.id` and `result.data()`.
