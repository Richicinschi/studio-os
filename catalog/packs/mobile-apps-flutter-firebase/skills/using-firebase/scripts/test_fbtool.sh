#!/usr/bin/env bash
# test_fbtool.sh: checks fbtool.sh with stand-in npx and gcloud programs on PATH.
# Nothing real is called and nothing is written outside a temporary folder.
# Usage: bash test_fbtool.sh        (exit 0 = all checks passed)
set -u
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tool="$here/fbtool.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/bin"
log="$tmp/calls.log"

# Stand-ins: npx, run as the pinned Firebase CLI, answers "use" with an active project and logs the rest;
# gcloud logs its arguments. A bare firebase on PATH logs too, so a call that skips the pin is caught.
# Every npx call is also written, in order, to FB_ORDER; "--version" prints a marker on stdout and stderr,
# so a hidden (redirected or captured) first call is caught.
cat > "$tmp/bin/npx" <<'EOF'
#!/usr/bin/env bash
echo "$*" >> "$FB_ORDER"
if [[ "$1" == "firebase-tools@15.36.0" && "$2" == "--version" ]]; then
  echo "VERSION-SHOWN"; echo "VERSION-SHOWN" >&2
  exit 0
fi
if [[ "$1" == "firebase-tools@15.36.0" && "$2" == "use" ]]; then
  case "${FB_USE:-bare}" in
    bare) echo "demo-proj" ;;
    alias) echo "Active Project: staging (demo-proj)" ;;
    plain) echo "Active Project: demo-proj" ;;
    none) echo "Error: No active project" ;;
  esac
  exit 0
fi
echo "npx $*" >> "$FB_LOG"
EOF
cat > "$tmp/bin/firebase" <<'EOF'
#!/usr/bin/env bash
echo "bare firebase $*" >> "$FB_LOG"
EOF
cat > "$tmp/bin/gcloud" <<'EOF'
#!/usr/bin/env bash
echo "gcloud $*" >> "$FB_LOG"
EOF
chmod +x "$tmp/bin/npx" "$tmp/bin/firebase" "$tmp/bin/gcloud"
mkdir -p "$tmp/proj"; echo "{}" > "$tmp/proj/firebase.json"
order="$tmp/order.log"
export FB_LOG="$log" FB_ORDER="$order" PATH="$tmp/bin:$PATH"

fails=0
check() { if [[ "$2" == 1 ]]; then echo "pass  $1"; else echo "FAIL  $1"; fails=$((fails + 1)); fi; }
run() { : > "$log"; : > "$order"; cd "$tmp/proj" || exit 1; bash "$tool" "$@" > "$tmp/out" 2> "$tmp/err"; rc=$?; }

# 1. No answer (EOF) at the export prompt cancels non-zero and runs nothing.
run export --output gs://b/x < /dev/null
check "export with no answer exits non-zero" $((rc != 0))
check "export with no answer runs no gcloud" $([[ ! -s "$log" ]] && echo 1 || echo 0)

# 2. A "n" answer cancels non-zero.
run export --output gs://b/x <<< "n"
check "export answered n exits non-zero" $((rc != 0))

# 3. Deploy without --force and no answer cancels non-zero, no deploy runs.
run deploy < /dev/null
check "deploy with no answer exits non-zero" $((rc != 0))
check "deploy with no answer runs no deploy" $(grep -q "deploy" "$log" && echo 0 || echo 1)

# 4. A "y" answer runs the export with ONE comma-separated, trimmed flag.
run export --output gs://b/x --collections " users , orders,, posts " <<< "y"
check "export answered y exits 0" $((rc == 0))
check "one flag, trimmed list" $(grep -qx 'gcloud firestore export gs://b/x --project=demo-proj --collection-ids=users,orders,posts' "$log" && echo 1 || echo 0)

# 5. Import uses the same single flag; wrong project id cancels non-zero.
run import --input gs://b/x --collections "a, b" <<< "demo-proj"
check "import single flag" $(grep -qx 'gcloud firestore import gs://b/x --project=demo-proj --collection-ids=a,b' "$log" && echo 1 || echo 0)
run import --input gs://b/x <<< "wrong"
check "import wrong project id exits non-zero" $((rc != 0))

# 6. A list with no usable id is refused before the prompt; a star is never expanded.
run export --output gs://b/x --collections " , " <<< "y"
check "empty collection list refused" $((rc != 0))
touch "$tmp/file1"
(cd "$tmp/proj" && : > "$log" && bash "$tool" export --output gs://b/x --collections '*' <<< "y" > /dev/null 2>&1)
check "star is passed literally" $(grep -qx 'gcloud firestore export gs://b/x --project=demo-proj --collection-ids=\*' "$log" && echo 1 || echo 0)

# 7. Export without collections adds no flag.
run export --output gs://b/x <<< "y"
check "no collections, no flag" $(grep -qx 'gcloud firestore export gs://b/x --project=demo-proj' "$log" && echo 1 || echo 0)

# 8. Project lookup: bare id, "alias (id)" and plain forms resolve; no project stops every command.
for form in bare alias plain; do
  FB_USE=$form run deploy --dry-run
  check "project resolved ($form)" $(grep -qx 'npx firebase-tools@15.36.0 deploy --dry-run' "$log" && echo 1 || echo 0)
done
for cmd in "deploy --dry-run" "deploy --force" "fn-deploy --force a" "secret list" "export --output gs://b/x"; do
  FB_USE=none run $cmd < /dev/null
  check "no project: '$cmd' exits non-zero" $((rc != 0))
  check "no project: '$cmd' calls nothing" $([[ ! -s "$log" ]] && echo 1 || echo 0)
done
rm -f "$tmp/proj/firebase.json"
run deploy --force < /dev/null
check "no firebase.json or .firebaserc: deploy --force exits non-zero" $((rc != 0))
check "no firebase.json or .firebaserc: nothing called" $([[ ! -s "$log" ]] && echo 1 || echo 0)
echo "{}" > "$tmp/proj/firebase.json"

# 9. secret list uses gcloud, not a firebase subcommand.
run secret list
check "secret list uses gcloud secrets list" $(grep -qx 'gcloud secrets list --project=demo-proj' "$log" && echo 1 || echo 0)

# 10. import --emulator never offers a gs:// path as an emulator path.
run import --input gs://b/x --emulator
check "import --emulator with gs:// exits non-zero" $((rc != 0))
check "import --emulator with gs:// prints no emu command" $(grep -q "emu --import" "$tmp/out" && echo 0 || echo 1)
run import --input ./data --emulator
check "import --emulator local folder prints the command" $(grep -q "emu --import ./data" "$tmp/out" && echo 1 || echo 0)

# 11. Typed project-id prompt with no input exits non-zero.
run import --input gs://b/x < /dev/null
check "import with no answer exits non-zero" $((rc != 0))

# 12. Every Firebase CLI call goes through the pinned npx form, never a bare firebase.
run deploy --force < /dev/null
check "deploy --force runs the pinned CLI" $(grep -qx 'npx firebase-tools@15.36.0 deploy' "$log" && echo 1 || echo 0)
run secret get KEY
check "secret get runs the pinned CLI" $(grep -qx 'npx firebase-tools@15.36.0 functions:secrets:get KEY' "$log" && echo 1 || echo 0)
run export --emulator --output ./x
check "no bare firebase call" $(grep -q '^bare firebase' "$log" && echo 0 || echo 1)

# 13. Before any call whose output is hidden, "--version" runs first and in the open, so npx's
#     "Ok to proceed?" question for a first download is visible instead of looking like a hang.
for cmd in "init" "deploy --dry-run" "secret list"; do
  run $cmd < /dev/null
  check "'$cmd': --version is the first npx call" $([[ "$(head -n 1 "$order")" == "firebase-tools@15.36.0 --version" ]] && echo 1 || echo 0)
  check "'$cmd': --version stdout not hidden" $(grep -qx 'VERSION-SHOWN' "$tmp/out" && echo 1 || echo 0)
  check "'$cmd': --version stderr not hidden" $(grep -qx 'VERSION-SHOWN' "$tmp/err" && echo 1 || echo 0)
done

if ((fails)); then echo "$fails check(s) failed"; exit 1; fi
echo "all checks passed"
