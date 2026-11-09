#!/usr/bin/env bash
# Stops a brainstorm companion server and tidies up. Prints one line of JSON.
#
#   stop-server.sh <session_dir>
#
# Output is a "status" of stopped, not_running or stale_pid. If the process will not die the status is "failed",
# with an "error" text, and the exit code is 1.
# A session under /tmp is deleted once its server has stopped. A session under <project>/.studio-work/ stays, so
# the mockups can be looked at later.

session_dir=$1

say_status() {
  printf '{"status": "%s"}\n' "$1"
}

if [[ -z $session_dir ]]; then
  printf '{"error": "%s"}\n' 'Usage: stop-server.sh <session_dir>'
  exit 1
fi

state=$session_dir/state

alive() {
  kill -s 0 "$1" 2>/dev/null
}

# Leave a marker so the agent, and the paused page, can tell the server is down.
mark_down() {
  rm -f "$state/server-info"
  echo "{\"reason\":\"$1\",\"timestamp\":$(date +%s)}" > "$state/server-stopped"
}

# Does process $1 carry the argument --brainstorm-server-id=$2?
has_instance_arg() {
  local pid=$1 want="--brainstorm-server-id=$2" cmd
  if [[ -r /proc/$pid/cmdline ]]; then
    tr '\0' '\n' < "/proc/$pid/cmdline" | grep -qxF -- "$want"
    return
  fi
  cmd="$({ ps -o command= -p "$pid"; } 2>/dev/null)"
  [[ -n $cmd ]] || cmd="$({ ps -f -p "$pid" | tail -n +2; } 2>/dev/null)"
  [[ " $cmd " == *" $want "* ]]
}

# A pid file proves nothing after a reboot or a pid wrap-around. Signal only a live process that carries this
# session's instance id; if the id is missing or unreadable, the process is not ours.
is_ours() {
  local pid=$1 id
  alive "$pid" || return 1
  [[ -f $state/server-instance-id ]] || return 1
  read -r id < "$state/server-instance-id"
  id=${id%$'\r'}
  [[ $id =~ ^[-_a-zA-Z0-9]{32,64}$ ]] && has_instance_arg "$pid" "$id"
}

if [[ ! -f $state/server.pid ]]; then
  say_status not_running
  exit 0
fi

pid="$(cat "$state/server.pid")"

if ! is_ours "$pid"; then
  rm -f "$state/server.pid" "$state/server-instance-id"
  mark_down stale_pid
  say_status stale_pid
  exit 0
fi

# Ask first and give it about 2 seconds, then force it.
kill "$pid" 2>/dev/null
for (( waited = 0; waited < 20; waited++ )); do
  alive "$pid" || break
  sleep 0.1
done
if alive "$pid"; then
  kill -KILL "$pid" 2>/dev/null
  sleep 0.1
fi

if alive "$pid"; then
  printf '{"status": "%s", "error": "%s"}\n' failed "process still running"
  exit 1
fi

rm -f "$state/server.pid" "$state/server-instance-id" "$state/server.log"
mark_down stop-server.sh

# Only a throwaway session that start-server.sh made (/tmp/brainstorm-<id>) is deleted, and never a path
# holding "..", which could climb out of /tmp.
case $session_dir in
  *..*) ;;
  /tmp/brainstorm-*) rm -rf "$session_dir" ;;
esac

say_status stopped
