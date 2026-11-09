# Writing security rules

Treat yourself as a careful rules engineer who expects to be wrong somewhere. Rules are hard to prove complete, so everything you write is a prototype until a human has reviewed it.

## Say this when you hand the rules over

After writing rules, send the user a short note with four parts: these are prototype Security Rules for the Firestore data; the reasons you believe they hold (name them); a request to review and verify them before the app reaches a wider audience; and an offer to help harden them. Send all four parts every time, none left out. Never claim the rules are perfect or guaranteed.

## Phase 1: read the app

Scan the whole codebase and collect:

- every collection and document path
- every query, with each `where`, `orderBy` and `limit` (the rules must permit exactly these queries)
- the models: field names, types, required or optional, length limits, allowed values
- create, read, update and delete operations, and who does them
- the sign-in method (accounts, custom tokens, anonymous) and any role logic

Write the findings into an untracked scratch file and work from it.

## Phase 2: write the rules

Principles, applied every time the rules file changes:

- Deny by default, then allow the least that the app needs.
- Require sign-in for every read and write. Never write an open read in the first version. Public data needs an explicit request from the user.
- Check the data, not just the person. For each collection define one domain validator (for example `isValidMember(data)`) and call it in BOTH the create rule and the update rule. After any write, the required fields must still be present and valid.
- An owner check alone on update is a trap: the owner could delete fields or inject junk. Always pair ownership with the validator and with a no-self-promotion check.
- Never let the owner change who owns the document.
- Reject fields that are not in the model (strict schema).
- Prefer a single `read` rule over separate `get` and `list`, which add complexity.
- Put a comment above each rule saying why it exists.
- Open the file with a comment block that lists the assumed data model: each collection, its id pattern, each field with type, required or optional, limits, and whether it is immutable.
- Reusable functions are listed in [rule helpers](rules-helpers.md).

### Personal data: one document, one audience

A rule applies to a whole document, so you cannot show `nickname` and hide `email` in the same document.

- Any collection that holds email, phone, address or private settings is readable by its owner only.
- Never write a blanket "any signed-in user may read" rule on a members collection that holds private data.
- When other people must see a name or photo, either copy the public fields onto what the user creates (an author name on each article, preferred), or split into a public collection and a private collection.

### Roles and privilege

- A user must never be able to create a document that gives them an admin-like role, change their own role, grant themselves another user's data, or skip the hierarchy.
- Check on every read and write that the caller is allowed to do it and is not escalating or reaching data they have no right to.

Weak (a user creates `level: 'owner'` for themselves):

```
allow create: if isOwner(userId) && isValidMember(request.resource.data);
```

Stronger (self-created accounts get the lowest role; only an existing admin can set another):

```
allow create: if isValidMember(request.resource.data)
  && ((isOwner(userId) && request.resource.data.level == 'basic') || isStaff());
allow update: if isValidMember(request.resource.data)
  && ((isOwner(userId) && request.resource.data.level == resource.data.level) || isStaff());
```

### Further directives

- Dates: use the timestamp type. A regex on a date string checks shape only (month 13 passes). In a rules string, a digit class needs doubled backslashes, and a single backslash is a classic silent bug.
- Immutable fields such as the creation time and the author id must be explicitly equal before and after on update. When a non-owner may touch one field (a counter), verify that every other field is unchanged, and require ownership for sensitive ones.
- Denormalised author names: compare with the name in the sign-in token when possible, otherwise check type and a short length. Storing only the author id and loading the profile in the app is safest.
- Fields that control access (editors, viewers, roles, owner id) stay locked for everyone except the original owner, so a collaborator cannot promote themselves or remove the owner.
- Lists: check the elements too, for example every label is a string under 12 characters.
- Every string, list and map gets a realistic size limit. One unlimited text field lets an attacker write a huge payload.
- Re-read paths guarded only by "is signed in" and ask whether a role or ownership check is also needed.
- Per collection, give every field a type check, mark required fields, validate URL and email fields with the matching helper, range-check numbers, require recent client timestamps where a time is sent, and scope path fields to the caller (helpers are in the rule helpers file).
- After each change, check the app still works: its queries must still be allowed.

## Phase 3: attack your own rules

Run every item of the [attack checklist](attack-checklist.md), write down what happened for each, fix any hole that works, and repeat the whole phase until no attack succeeds. Never skip this phase.

## Phase 4: validate and save

Validate the syntax with a dry run (`deploy --only firestore:rules --dry-run`) or an equivalent tool, repeat until clean, then write `firestore.rules`. The file must be complete and runnable, with no placeholders and every assumption written down. After a permission-denied error in the app, decide whether the rules or the query is wrong, then rerun phase 3 after any rule change.
