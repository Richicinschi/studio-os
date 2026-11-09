#!/usr/bin/env bash
# Launcher for the brainstorm companion. Prints one line of JSON: the server's "server-started" line, or an error.
#
# Options (all optional):
#   --project-dir <path>        Keep the session under <path>/.studio-work/brainstorm/. It survives a stop, and a
#                               restart reuses the project's port and key. Without it the session sits in /tmp.
#   --host <bind-host>          Interface to bind. Default 127.0.0.1; use 0.0.0.0 on a remote or container setup.
#   --url-host <host>           Host name written into the printed URL.
#   --idle-timeout-minutes N    Stop after N idle minutes. Default 240.
#   --open                      Open the viewer's browser when the first screen appears. Pass it only once the
#                               person has accepted the companion.
#   --foreground, --no-daemon   Keep the server attached to this terminal.
#   --background, --daemon      Detach even where foreground would be chosen on its own.

here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

bind_host=127.0.0.1
project_dir=
url_host=
idle_minutes=
foreground=false
force_detach=false

fail_json() {
  printf '{"error": "%s"}\n' "$1"
  exit 1
}

while (( $# )); do
  opt=$1
  case $opt in
    --project-dir|--host|--url-host|--idle-timeout-minutes)
      (( $# >= 2 )) || fail_json "Missing value for $opt"
      value=$2
      shift
      case $opt in
        --project-dir)          project_dir=$value ;;
        --host)                 bind_host=$value ;;
        --url-host)             url_host=$value ;;
        --idle-timeout-minutes) idle_minutes=$value ;;
      esac
      ;;
    --open)                   export BRAINSTORM_OPEN=1 ;;
    --foreground)             foreground=true ;;
    --no-daemon)              foreground=true ;;
    --background)             force_detach=true ;;
    --daemon)                 force_detach=true ;;
    *)                        fail_json "Unknown argument: $opt" ;;
  esac
  shift
done

# The printed URL shows a host the person can reach. For a loopback bind that is "localhost".
if [[ -z $url_host ]]; then
  url_host=$bind_host
  [[ $bind_host == 127.0.0.1 ]] && url_host=localhost
fi

if [[ -n $idle_minutes ]]; then
  [[ $idle_minutes =~ ^[0-9]+$ && $idle_minutes -ge 1 ]] || fail_json "--idle-timeout-minutes needs a whole number, 1 or more"
  export BRAINSTORM_IDLE_TIMEOUT_MS=$(( idle_minutes * 60 * 1000 ))
fi

windows_shell() {
  [[ -n $MSYSTEM ]] && return 0
  local probe
  probe="$(printf '%s %s' "$OSTYPE" "$(uname 2>/dev/null)" | tr '[:upper:]' '[:lower:]')"
  [[ $probe == *msys* || $probe == *cygwin* || $probe == *mingw* ]]
}

# Codex and Git Bash on Windows both kill detached children, so there the server stays in the foreground
# (unless --background was given).
if [[ $foreground != true && $force_detach != true ]]; then
  if [[ -n $CODEX_CI ]] || windows_shell; then
    foreground=true
  fi
fi

# The log, server-info and key files contain the session key: create everything private.
umask 077

session=$$-$(date +%s)
session_dir=/tmp/brainstorm-$session
if [[ -n $project_dir ]]; then
  root=$project_dir/.studio-work/brainstorm
  session_dir=$root/$session
  # Port and key are kept per project, so a restarted server has the address an open tab already knows.
  export BRAINSTORM_PORT_FILE=$root/.last-port
  export BRAINSTORM_TOKEN_FILE=$root/.last-token
fi

state=$session_dir/state
mkdir -p "$state" "$session_dir/content"

# A fresh id per start, given to the server on its command line. stop-server.sh looks for it before signalling
# a pid, so it never kills a stranger that reused the number.
instance=
[[ -r /dev/urandom ]] && instance="$(LC_ALL=C tr -dc 'a-f0-9' < /dev/urandom 2>/dev/null | head -c 48)"
if [[ ${#instance} -lt 32 ]]; then
  instance="$(printf '%016x%016x' "$(( $$ * 100000 + RANDOM ))" "$(date +%s)")"
fi
echo "$instance" > "$state/server-instance-id"
chmod 600 "$state/server-instance-id" 2>/dev/null

cd -- "$here" || exit 1

# The watchdog follows the harness that started us. $PPID is only the shell the harness opened for this one
# command, so the harness is that shell's parent.
owner="$(ps -o ppid= -p $PPID 2>/dev/null | tr -d '[:space:]')"
[[ -z $owner || $owner == 1 ]] && owner=$PPID
# Node on Windows cannot see MSYS process numbers, and a pid it cannot find would make the server quit after a
# minute. With no owner the idle timeout is the only trigger.
windows_shell && owner=

server_env=(
  "BRAINSTORM_DIR=$session_dir"
  "BRAINSTORM_HOST=$bind_host"
  "BRAINSTORM_URL_HOST=$url_host"
  "BRAINSTORM_OWNER_PID=$owner"
)

if [[ $foreground == true ]]; then
  env "${server_env[@]}" node server.cjs --brainstorm-server-id="$instance" &
  child=$!
  echo "$child" > "$state/server.pid"
  wait "$child"
  exit $?
fi

# Detached: nohup lets it outlive this shell, disown stops the shell waiting for it.
log=$state/server.log
nohup env "${server_env[@]}" node server.cjs --brainstorm-server-id="$instance" > "$log" 2>&1 &
child=$!
disown "$child" 2>/dev/null
echo "$child" > "$state/server.pid"

retry_hint="$here/start-server.sh"
[[ -n $project_dir ]] && retry_hint+=" --project-dir $project_dir"
retry_hint+=" --foreground --url-host $url_host --host $bind_host"

# Allow 5 seconds for the "server-started" line to show up in the log.
for (( tick = 0; tick < 50; tick++ )); do
  if grep -q server-started "$log" 2>/dev/null; then
    # Then watch 2 more seconds, to catch an environment that kills background processes just after start.
    for (( tick = 0; tick < 20; tick++ )); do
      kill -0 "$child" 2>/dev/null || fail_json "Server started but did not stay up. Run it in a persistent terminal: $retry_hint"
      sleep 0.1
    done
    grep -m 1 server-started "$log"
    exit 0
  fi
  sleep 0.1
done

fail_json "Server failed to start within 5 seconds"
