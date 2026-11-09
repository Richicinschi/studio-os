#!/usr/bin/env bash
# find-polluter.sh: find the test file that leaves a file or folder behind.
#
# It runs the matching test files one at a time with `npm test <file>`
# and stops at the first one after which the watched path exists.
#
# Arguments: the path to watch, then a glob of test files.
# Sample call (from the project root):
#   bash find-polluter.sh 'manifest.json' 'tests/**/*.spec.js'
#
# Exit codes: 0 = no polluter found, 1 = polluter found or bad arguments.

set -e

[ "$#" -eq 2 ] || {
  echo "Usage: $0 <path_to_watch> <test_glob>"
  echo "Example: $0 'manifest.json' 'tests/**/*.spec.js'"
  exit 1
}

watched="$1"
glob="$2"

# Announce what is being hunted.
echo "🔍 Searching for test that creates: $watched"
echo "Test pattern: $glob"
echo ""

# `find .` prints paths that start with ./, so drop a leading ./ from the glob.
glob="${glob#./}"

# find -path cannot match "**/" against zero directory levels. Search with the
# glob as written and again with "**/" removed, so files sitting directly in
# the base folder are found too.
collapsed="${glob//\*\*\//}"
files="$(
  { find . -path "./$glob"; find . -path "./$collapsed"; } | sort -u
)"

total=0
if [ -n "$files" ]; then
  total="$(echo "$files" | grep -c '')"
fi

printf 'Found %s test files\n\n' "$total"

n=0
for file in $files; do
  n=$((n + 1))

  # If the path is already there, no later test can be blamed for creating it.
  if test -e "$watched"; then
    printf '⚠️  Pollution already exists before test %s/%s\n' "$n" "$total"
    printf '   Skipping: %s\n' "$file"
    continue
  fi

  echo "[$n/$total] Testing: $file"

  # Test failures are irrelevant here; only the side effect matters.
  npm test "$file" &> /dev/null || :

  if test -e "$watched"; then
    printf '\n🎯 FOUND POLLUTER!\n'
    printf '   Test: %s\n   Created: %s\n\n' "$file" "$watched"
    printf 'Pollution details:\n'
    ls -la "$watched"
    printf '\nTo investigate:\n'
    printf '  npm test %s    # Run just this test\n' "$file"
    printf '  cat %s         # Review test code\n' "$file"
    exit 1
  fi
done

printf '\n✅ No polluter found - all tests clean!\n'
exit 0
