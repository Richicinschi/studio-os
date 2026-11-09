# Attack checklist for a rules file

Act as an attacker with a valid account. For every item write one line: tried, result, fix. Any item that succeeds sends you back to edit the rules, and then you rerun the whole list.

## Access

1. Public list: can an unsigned or wrong user run a collection query and receive documents that should be private (for example `archived == true`)?
2. Wrong owner: can I get, create, update or delete a document I do not own?
3. Mixed content: with a second account, can I read the first account's user document? If public profiles were wanted, does that same document also hold an email or private key? Both being true means the rules are unsafe.
4. Orphans: can I read or write `accounts/77/photos/9` when `accounts/77` does not exist?
5. Query mismatch: do the rules allow the queries the app really runs? A query filtered on `state == 'live'` needs a rule that only allows reads of published documents.

## Ownership and roles

6. Hijack on create: can I create a document with someone else's `creatorId` or `ownerId`?
7. Hijack on update: can I change those fields on an existing document?
8. Self-promotion: can I make an account and write `isStaff: true` or `level: 'owner'` into my own profile? (This tests whether roles live in editable documents rather than in sign-in claims.)

## Data shape

9. Update bypass: after a legitimate create, can I send an edit that carries an oversized string or invalid fields, because only the create rule validates?
10. Create then ruin: can I update a valid document into an invalid one, for example by removing a required field?
11. Required fields: can I create or update while leaving out something the model requires?
12. Type juggling: can I write a number where a string belongs, or a string into a timestamp?
13. Schema pollution: can I add a field like `debugBlob` that the model does not define?
14. Resource exhaustion: does every string, list and map have a size check? One missing check is a denial-of-service hole.
15. Numbers: can I send a negative fee, a negative count, or an enormous value?
16. Immutable fields: can I change `createdAt` or another field that must stay fixed?
17. Time: can I set `createdAt` into the past or future to jump the sort order?

## Workflow and references

18. State jump: can I move `state` from `draft` straight to `published`?
19. Path escape: can I point an `coverPath` or `avatarPath` at another user's folder or a restricted area?
20. Counter replay: can I raise a counter without creating the tracking document, or raise it twice?
21. Validator coverage: does EVERY update rule, including owner-only ones, call the domain validator? An update rule that only checks ownership is a critical hole.
