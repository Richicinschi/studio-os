## Update mode

**The kit's signature, first.** Before step 1, run
`git -C "<kit>" verify-commit --raw HEAD 2>&1; echo "exit $?"`. In PowerShell, run
`$ErrorActionPreference = 'Continue'; git -C "<kit>" verify-commit --raw HEAD 2>&1 | ForEach-Object { "$_" }; "exit $LASTEXITCODE"`
instead: in Windows PowerShell 5.1, `2>&1` turns gpg's lines into error records, which stop the
command when `$ErrorActionPreference` is `Stop`. Report one of these five, with its line on what it
means. `exit 0` alone is not a pass: a good signature by any imported key gives it. None of them
stops the run; verifying stays optional, so go on with step 1 whatever it says.

- **signed by the release key:** a `VALIDSIG` line whose last field is
  `991E180986B77CE992993AEB2E926BA88C6D6423`, and no `REVKEYSIG` line. The kit's newest commit is
  one the release key signed. With an `EXPKEYSIG` line too (after 2027-05-20), this is still the
  outcome: the commit was signed while the key was valid; say that the key has expired.
- **signed by another key:** a `VALIDSIG` line ending in another fingerprint, `NO_PUBKEY` with
  another key id, or a `REVKEYSIG` line (a revoked key; not the release). The commit is not one the
  release key signed as published: a commit made in the kit folder, or a copy from elsewhere.
  Compare it with the public repository. For a `REVKEYSIG` line, also look for the new key's
  announcement (`SECURITY.md`, "Checking that your copy is the release").
- **altered:** a `BADSIG` line. The commit does not match its signature: it was changed after it
  was signed, so it is not the release. Clone the kit again.
- **not signed:** no output, and `exit 1`. The newest commit carries no signature: a commit made in
  the kit folder, or a copy that is not the release.
- **no key imported:** `NO_PUBKEY 2E926BA88C6D6423`, or git cannot start `gpg` (`cannot run` or
  `cannot spawn`). The check could not be made; `START-HERE.md`, "Your first session", step 1, shows
  how to import the key.

1. Read their `adoption/decisions.md` (it records the kit version they adopted), their
   `adoption/features.md`, and the kit's `CHANGELOG.md`. When `adoption/installed.json` exists, run
   `node tools/installed.mjs check <setup>` from the kit's folder: for each installed item it says
   whether the kit's copy changed since their install, and whether their copy changed since. Tell
   them, per item the kit changed, why, from the `CHANGELOG.md` sections after their version, and
   whether their copy changed too: then both sides moved, and taking the new version means choosing
   what to keep. When no section names an item the check says changed, say that the kit's copy
   changed and the changelog does not say why; `node tools/compare-install.mjs` shows how their copy
   differs from the kit's now. Items the record has no kit hash for (installed before the kit published one) are
   compared through the changelog alone.
2. Run the audit again (with their yes), as `.claude/skills/drill-to-adopt/phases/1-audit.md` says
   (read it now), and compare it with their last `adoption/inventory.md`: new repositories, tools or
   hooks become new items in the gap report.
3. Re-enter at phase 2 (read `.claude/skills/drill-to-adopt/phases/2-decide.md`) with the items
   added or changed since that version only. Ask about those, under the same rules. Never re-ask a
   decided item unless the changelog says it changed.
4. Append an "Update to vX.Y.Z" section to their spec, add rows to their plan (read
   `.claude/skills/drill-to-adopt/phases/3-spec-and-plan.md` for both), and continue with phases 4
   and 5 for the new rows, reading each phase's file as it starts.

**Reading the Scan column.** A row written from v3.4.0 on holds two verdicts and the script
comparison: `kit: <verdict> <score>/100 · installed: <verdict> <score>/100 · scripts identical`, or
`· changed: <names>`, or `· no scripts`, or an `installed:` part that is `pending` or `n/a: <why>`
(the forms are listed in `templates/adoption/decisions.md`). An `installed: pending` row is an item
applied but not yet checked on disk: offer to run `vet-and-adopt`'s scans after Apply. A row from
before v3.4.0 holds one verdict, the kit copy's scan, and is still valid as it stands: read the
verdict as the kit copy's, and never re-ask an item only because its row has one verdict.
