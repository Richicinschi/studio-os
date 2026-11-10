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
  # git takes a unique prefix of a long option, so --no-veri skips the hooks too, and so do
  # --no-v and --no-ve wherever the command has no --verbose (git am reads them as --no-verify;
  # commit and push call them ambiguous today). Blocks --no-verbose and its prefixes as well,
  # a rare spelling: --no-v, --no-ve and --no-ver start both.
  "$GIT --no-v(er[a-z]*|e?$END)"
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
  # Config given through the environment: GIT_CONFIG_COUNT with GIT_CONFIG_KEY_<n> naming the
  # key, in shell (`GIT_CONFIG_KEY_0=...`, after env or export) or PowerShell (`$env:... = '...'`)
  # form. The quote and backslash cover the raw JSON input.
  "GIT_CONFIG_KEY_[0-9]+[[:space:]]*=[[:space:]\"'\\]*${KEY}"
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
