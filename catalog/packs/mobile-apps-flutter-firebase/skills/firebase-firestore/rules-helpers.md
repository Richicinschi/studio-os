# Rule helpers

Copy only what the data model needs. Each function is small so the rules read like sentences.

## Identity

```
function signedIn() { return request.auth != null; }
function isOwner(uid) { return signedIn() && request.auth.uid == uid; }
function ownsDoc() { return signedIn() && request.auth.uid == resource.data.uid; }
// create: a supplied uid must be the caller's
function uidOnCreate() {
  return !('uid' in request.resource.data) || request.resource.data.uid == request.auth.uid;
}
// update: the uid may not change
function uidOnUpdate() {
  return !('uid' in request.resource.data) || request.resource.data.uid == resource.data.uid;
}
```

Use `uidOnCreate` and `uidOnUpdate` together with `ownsDoc`, not alone.

## Shape

```
function hasFields(f) { return request.resource.data.keys().hasAll(f); }
function onlyFields(f) { return request.resource.data.keys().hasOnly(f); }
function untouched(f) {
  return !request.resource.data.diff(resource.data).affectedKeys().hasAny(f);
}
function textBetween(field, lo, hi) {
  return request.resource.data[field] is string
    && request.resource.data[field].size() >= lo
    && request.resource.data[field].size() <= hi;
}
function optionalText(field, lo, hi) {
  return !(field in request.resource.data) || textBetween(field, lo, hi);
}
function listUpTo(v, max) { return v is list && v.size() <= max; }
function mapWithKeys(v, keys) { return v is map && v.keys().hasOnly(keys); }
function positive(field) {
  return request.resource.data[field] is number && request.resource.data[field] > 0;
}
```

## Formats

```
function httpUrl(v) { return v is string && v.matches('^https?://.*'); }
function emailLike(v) {
  return v is string && v.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
}
// shape only: month 13 passes. Prefer a timestamp field.
function isoDateShape(v) {
  return v is string && v.matches('^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.*Z?$');
}
// the value must sit inside the caller's own folder
function inOwnFolder(v) { return v is string && v.matches('^users/' + request.auth.uid + '/.*'); }
// a client timestamp within the last five minutes, never in the future
function justNow(t) {
  return t is timestamp && t > request.time - duration.value(5, 'm') && t <= request.time;
}
```

## Domain validator example

```
function isValidUser(d) {
  return onlyFields(['handle', 'email', 'birthYear', 'tier'])
    && d.handle is string && d.handle.size() >= 3 && d.handle.size() <= 30
    && emailLike(d.email)
    && d.birthYear is int && d.birthYear >= 1900 && d.birthYear <= 2012
    && d.tier in ['staff', 'regular', 'visitor'];
}
```

## Enum values

```
function validStatus() { return request.resource.data.status in ['draft', 'review', 'published']; }
```

## State transitions (updates only)

```
function validMove() {
  let from = resource.data.status;
  let to = request.resource.data.status;
  return (from == 'draft' && to == 'review') || (from == 'review' && to == 'published');
}
```

Without this, a client can jump from the first state straight to the last.

## Path and reference scoping

Any field that names another resource (an image path, a parent id) must be checked to point inside the caller's area, with a helper such as `inOwnFolder`, on both create and update.

## Safe counters (likes, upvotes, replies)

All three must hold:

1. Only the counter field changes.
2. It changes by exactly one, up or down.
3. A tracking document moves with it: the like document must not exist before an increment and must exist after it, and the reverse for a decrement.

Checking "does not exist yet" alone is not enough, because a client can skip creating the tracking document and loop the increment. Use `existsAfter()` (or `getAfter()`) so the rule sees the state after the batch.

```
function counterMove(docId) {
  let tracker = /databases/$(database)/documents/likes/$(request.auth.uid + '_' + docId);
  let diff = request.resource.data.diff(resource.data);
  return diff.affectedKeys().hasOnly(['likeCount'])
    && math.abs(request.resource.data.likeCount - resource.data.likeCount) == 1
    && (
      (request.resource.data.likeCount > resource.data.likeCount && !exists(tracker) && existsAfter(tracker))
      || (request.resource.data.likeCount < resource.data.likeCount && exists(tracker) && !existsAfter(tracker))
    );
}
```
