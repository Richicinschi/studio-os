#!/usr/bin/env bash
# test_fbtool.sh: checks fbtool.sh with stand-in firebase and gcloud programs on PATH.
# Nothing real is called and nothing is written outside a temporary folder.
# Usage: bash test_fbtool.sh        (exit 0 = all checks passed)
set -u
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tool="$here/fbtool.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/bin"
log="$tmp/calls.log"

# Stand-ins: firebase answers "use" with an active project; gcloud logs its arguments.
cat > "$tmp/bin/firebase" <<'EOF'
#!/usr/bin/env bash
if [[ "$1" == "use" ]]; then
  case "${FB_USE:-bare}" in
    bare) echo "demo-proj" ;;
    alias) echo "Active Project: staging (demo-proj)" ;;
    plain) echo "Active Project: demo-proj" ;;
    none) echo "Error: No active project" ;;
  esac
  exit 0
fi
echo "firebase $*" >> "$FB_LOG"
EOF
cat > "$tmp/bin/gcloud" <<'EOF'
#!/usr/bin/env bash
echo "gcloud $*" >> "$FB_LOG"
EOF
chmod +x "$tmp/bin/firebase" "$tmp/bin/gcloud"
mkdir -p "$tmp/proj"; echo "{}" > "$tmp/proj/firebase.json"
export FB_LOG="$log" PATH="$tmp/bin:$PATH"

fails=0
check() { if [[ "$2" == 1 ]]; then echo "pass  $1"; else echo "FAIL  $1"; fails=$((fails + 1)); fi; }
run() { : > "$log"; cd "$tmp/proj" || exit 1; bash "$tool" "$@" > "$tmp/out" 2> "$tmp/err"; rc=$?; }

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
  check "project resolved ($form)" $(grep -qx 'firebase deploy --dry-run' "$log" && echo 1 || echo 0)
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

if ((fails)); then echo "$fails check(s) failed"; exit 1; fi
echo "all checks passed"
