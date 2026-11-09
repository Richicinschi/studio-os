#!/usr/bin/env bash
# Template for a reproduction loop that needs a person.
# Copy it, replace the prompts in the marked block, then run it
# with: bash hitl-loop.template.sh
# You (the agent) launch it; the user answers in their own shell.
#
# Helpers available inside the block:
#   step "<instruction>"        print an instruction and wait for Enter
#   capture VAR "<question>"    print a question and store the reply in VAR
#
# On exit the script prints every captured value as KEY=VALUE lines,
# so you can read the answers back.

set -u
set -o pipefail
set -e

show() {
  echo
  echo ">>> $1"
}

capture() {
  local name="$1" prompt="$2" reply
  show "$prompt"
  read -r -p "    > " reply
  printf -v "$name" '%s' "$reply"
}

step() {
  local text="$1"
  show "$text"
  read -rp "    [Enter when done] " _
}

# ===== edit below =====

step "Start the desktop client and log in as the test user."

capture FROZE "Press 'Sync now'. Did the window freeze? (y/n)"

capture LAST_STATUS "Type the text shown in the status bar (or 'none'):"

# ===== edit above =====

echo
echo '--- Captured ---'
printf 'FROZE=%s\n' "$FROZE"
printf 'LAST_STATUS=%s\n' "$LAST_STATUS"
