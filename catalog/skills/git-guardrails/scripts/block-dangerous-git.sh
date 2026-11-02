#!/bin/bash

INPUT=$(cat)
# Without jq, match against the raw hook input instead of letting everything through.
if command -v jq >/dev/null 2>&1; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')
else
  COMMAND="$INPUT"
fi

# Studio policy: plain `git push` is ALLOWED (Claude pushes at checkpoints).
# Blocked: force-pushes and remote deletes, history rewrites, destructive working-tree ops,
# and skipped hooks. G = git and its options, up to the subcommand, within one shell command.
# E = the end of an argument; the quote covers the raw-input fallback.
G='git[^;&|]*'
E='( |$|")'
DANGEROUS_PATTERNS=(
  "$G push[^;&|]*( --force| -f$E| \+[^ ;&|]| --mirror| --delete| -d$E| :[^ ;&|\"]+)"
  "$G reset[^;&|]* --hard"
  "$G clean[^;&|]* (-[a-zA-Z]*f|--force)"
  "$G branch[^;&|]* (-D|-f|--force)$E"
  "$G (checkout|switch)[^;&|]* (-B|-C|--force-create)$E"
  "$G commit-tree"
  "$G checkout[^;&|]* (-f|--force)$E"
  "$G (checkout|restore)( --)? +\.$E"
  "$G stash +(drop|clear)"
  "$G reflog +expire"
  "$G gc[^;&|]* --prune"
  "$G worktree +remove[^;&|]* (-f|--force)$E"
  "$G commit[^;&|]* --amend"
  "$G (filter-branch|filter-repo)"
  "$G update-ref[^;&|]* -d$E"
  "$G --no-verify"
  "$G commit[^;&|]* -[a-zA-Z]*n[a-zA-Z]*$E"
  "git[^;&|]* -c +core\.hooksPath"
)

block() {
  echo "BLOCKED: '$COMMAND' matches dangerous pattern '$1'. The user has prevented you from doing this." >&2
  exit 2
}

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then block "$pattern"; fi
done

# A rebase rewrites history; finishing or abandoning one that is already running does not.
if echo "$COMMAND" | grep -qE "$G rebase( |$)" && ! echo "$COMMAND" | grep -qE "$G rebase +--(abort|continue|skip|quit)"; then
  block "git rebase"
fi

exit 0
