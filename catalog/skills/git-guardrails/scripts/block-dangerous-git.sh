#!/bin/bash
# PreToolUse hook: reads the hook JSON on stdin, exits 2 to veto a destructive git command.
# Studio policy: a plain `git push` passes. Force-pushes, history rewrites, working-tree
# destruction and skipped hooks do not.

payload=$(cat)

# Without jq, fall back to scanning the raw payload.
if type -P jq >/dev/null; then
  cmd=$(jq -r '.tool_input.command' <<<"$payload")
else
  cmd="$payload"
fi

# GIT matches "git" plus any options before the subcommand, never crossing a
# shell separator. END marks the close of one argument (the quote is for raw JSON).
GIT='git[^;&|]*'
ARGS='[^;&|]*'
END='( |$|")'

rules=(
  "$GIT push${ARGS}( --mirror| --delete| --force| -d$END| -f$END)"
  "$GIT push${ARGS}( :[^ ;&|\"]+| \+[^ ;&|])"
  "$GIT reset${ARGS} --hard"
  "$GIT clean${ARGS} (--force|-[[:alpha:]]*f)"
  "$GIT branch${ARGS} (--force|-D|-f)$END"
  "$GIT (checkout|switch)${ARGS} (--force-create|-B|-C)$END"
  "$GIT checkout${ARGS} (-f|--force)$END"
  "$GIT (restore|checkout)(  *--)? +\.$END"
  "$GIT commit-tree"
  "$GIT filter-(repo|branch)"
  "$GIT update-ref${ARGS} -d$END"
  "$GIT stash +(drop|clear)"
  "$GIT reflog +expire"
  "$GIT gc${ARGS} --prune"
  "$GIT worktree +remove${ARGS} (-f|--force)$END"
  "$GIT commit${ARGS} --amend"
  # git takes a unique prefix of a long option, so --no-veri skips the hooks too.
  # Blocks --no-verbose as well, a rare spelling.
  "$GIT --no-ver[a-z]*"
  "$GIT commit${ARGS} -[[:alpha:]]*n[[:alpha:]]*$END"
)

# Moving the hooks folder skips the hooks. git reads a config key in any case, so these
# match without regard to case. Reading the setting (`git config --get core.hooksPath`,
# alone or followed by a redirect) stays allowed; giving it a value or removing it does not.
KEY='core\.hookspath'
rules_any_case=(
  "git${ARGS} -c +${KEY}"
  "git${ARGS} --config-env[= ]+${KEY}"
  "$GIT config${ARGS} (--unset|--unset-all|--replace-all|--add|unset|set) ${ARGS}${KEY}"
  "$GIT config${ARGS} ${KEY} +([^ ;&|<>0-9]|[0-9]+[^0-9>])"
)

refuse() {
  echo "BLOCKED: '$cmd' hit the rule '$1'. You are not authorised to run this; ask the user." >&2
  exit 2
}

for rule in "${rules[@]}"; do
  grep -qE "$rule" <<<"$cmd" && refuse "$rule"
done
for rule in "${rules_any_case[@]}"; do
  grep -qiE "$rule" <<<"$cmd" && refuse "$rule"
done

# Any rebase rewrites history, except steering one already under way.
if grep -qE "$GIT rebase( |$)" <<<"$cmd"; then
  grep -qE "$GIT rebase +--(continue|quit|skip|abort)" <<<"$cmd" || refuse "git rebase"
fi

exit 0
