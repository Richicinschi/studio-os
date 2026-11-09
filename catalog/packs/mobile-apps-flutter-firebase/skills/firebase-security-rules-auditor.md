---
id: firebase-security-rules-auditor
title: Firestore rules auditor
description: Use when Firestore security rules are written, generated or updated and must be judged as secure and robust; evaluate how secure the rules are, try to break them, score 1 to 5 and return JSON findings.
---

## When to use

- "Audit these Firestore rules", "are my security rules safe", "review the rules the model just generated".
- Right after any edit to a rules file, before deploying it.
- Neighbours in this pack: writing rules from scratch or wiring up sign-in belongs to the other Firebase skills; this one only judges rules that already exist.

## How it works

1. Take the attacker's seat. You are a penetration tester. A rule set that looks elaborate is not thereby safe; your job is to find a sequence of reads and writes that gets past it. Assume a signed-in malicious user who can send any payload.
2. Walk six checks over every match block and every operation (get, list, create, update, delete):
   - A. Update bypass. Compare create with update. Can someone create a legal document, then update it into an illegal one (change a role, exceed a size cap, swap a field's type)?
   - B. Source of authority. Do sensitive fields such as role, isAdmin or ownerId get trusted from the incoming document (`request.resource.data`)? Authority must come from stored data (`resource.data`, a lookup document) or from the auth token, never from what the client sends.
   - C. Fit with the app. Do the rules let the product work? If collaborators in a shared-data app cannot read the shared data, the rules are broken and will push the team toward loosening them.
   - D. Storage abuse. Look for caps on string length and array size. Without them, report resource exhaustion (denial of service).
   - E. Type safety. Are fields tested with `is string`, `is int`, `is timestamp` and the like?
   - F. Field limits versus identity. `hasOnly()` and `diff()` restrict which fields change, not who changes them. Without an ownership test such as `resource.data.uid == request.auth.uid`, any signed-in user can alter another user's document fields, which is an integrity hole.
3. Apply the admin exception. One fixed admin email in a rule, for example a comparison on `request.auth.token.email`, is acceptable and costs no points only if `request.auth.token.email_verified == true` is also required and nothing lets another person grant themselves admin or leaves an escalation path.
4. Score from 1 to 5 using the worst finding:

   | Score | Meaning |
   |---|---|
   | 1 Critical | Unauthorised reads (leaks), privilege escalation, or validation that can be skipped entirely |
   | 2 Major | Broken business logic, users assigning themselves roles, controls that can be bypassed |
   | 3 Moderate | Personal data exposed (for instance readable emails), or create and update validating critical fields differently |
   | 4 Minor | Damage limited to the user's own data (update bypass on own documents), missing size caps, small missing type checks, wide reads on non-sensitive fields |
   | 5 Secure | Complete validation, strict ownership, role-based access through sound ACLs |

5. Return the result as JSON, nothing hidden outside it:

   ```json
   {
     "score": 3,
     "summary": "overall verdict in a few sentences",
     "findings": [
       {
         "check": "which of the six checks or the admin rule",
         "severity": "critical|major|moderate|minor",
         "issue": "what is wrong and how it can be abused",
         "recommendation": "the concrete fix"
       }
     ]
   }
   ```

## Checks before done

- All six checks were run against every operation of every match block, not only the ones that looked suspicious.
- Each finding names a concrete abuse path, not just a style complaint.
- The score matches the worst finding in the table above.
- The admin exception was applied only when both conditions held.
- The output is valid JSON in the structure above.
