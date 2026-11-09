# Indexes

An index lets query time depend on the size of the result, not the size of the database. The two editions differ sharply, so check which one you have.

## Standard edition

- Every field, including map subfields, gets a single-field index automatically. That covers an equality filter, one range filter, or one sort on a single field.
- Several equality filters on different fields work through merged single-field indexes.
- A composite index (an ordered list of fields) is never created for you. It is needed for filters or sorts across more than one field.
- When a query needs one, the SDK throws an error that includes a console link that creates exactly that index. Read the error, then put the same index into `firestore.indexes.json` so it lives in the repo.

| Query shape | Index |
|---|---|
| one equality | automatic |
| one range or one sort | automatic |
| several equalities | automatic, merged |
| equality plus range or sort | composite |
| ranges on two fields | composite |
| array-contains plus equality | works by merging, but a composite index is recommended for speed |

### Exemptions

You can switch off automatic indexing for a field.

- Sequential values such as timestamps limit write throughput on that collection (see the Firestore documentation for the current limit). If you never query the field, exempt it.
- A document has a documented cap on index entries (see the Firestore documentation). Exempt big text blobs and huge lists you do not filter on.
- A field that carries a time-to-live deadline causes index churn. Exempt it if you do not query it.

Example file:

```json
{
  "indexes": [
    {
      "collectionGroup": "recipes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "cuisine", "order": "ASCENDING" },
        { "fieldPath": "minutes", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Enterprise edition

- No indexes exist by default. A query without a matching index scans the whole collection, which is slow and costly on large data. So define an index for each query that matters, including single-field ones.
- An index is a collection id plus an ordered list of fields, each ascending or descending. Direction and order make an index unique: `title` ascending with `minutes` descending is a different index from the reverse.
- Density: a dense index has an entry for every document, and a missing field counts as null. A sparse index (`SPARSE_ANY`) only covers documents that have a value, null included, for at least one indexed field. Sparse saves storage and can run faster.
- A unique index (created with the unique flag of the gcloud composite-index create command) rejects writes that would repeat a value, or a combination of values for several fields.

Query shapes: equality or single range needs a single-field index on that field. Several equalities need single-field indexes on each. Equality plus range and two ranges need a composite index on the fields involved. Array-contains plus equality can run by merging indexes, but the vendor recommends a composite index for it.

Dense:

```json
{ "collectionGroup": "recipes", "queryScope": "COLLECTION", "density": "DENSE",
  "fields": [ { "fieldPath": "cuisine", "order": "ASCENDING" }, { "fieldPath": "minutes", "order": "DESCENDING" } ] }
```

Sparse (the vendor's index-file reference lists the `density` key but no `unique` key, so check the vendor's current documentation before putting uniqueness into `firestore.indexes.json`; create unique indexes with gcloud for now):

```json
{ "collectionGroup": "recipes", "queryScope": "COLLECTION", "density": "SPARSE_ANY",
  "fields": [ { "fieldPath": "cuisine", "order": "ASCENDING" } ] }
```

Each object goes inside the `indexes` array of the file.

## Deploying

`deploy --only firestore:indexes` (with the npx prefix if needed). Index builds on big collections take time and change a live project, so confirm with the user first. A composite index for a collection group needs `"queryScope": "COLLECTION_GROUP"`.
