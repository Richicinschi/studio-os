#!/usr/bin/env bash
# fbtool.sh: thin, guarded wrapper around the firebase and gcloud CLIs.
# Commands: init | emu | deploy | fn-deploy | secret | export | import
# deploy, fn-deploy, production export/import and secret delete ask first (--force skips the deploy question; secret set does not ask).
# A "no" or no answer at a prompt cancels with exit code 1. Run "bash test_fbtool.sh" (next to this file) to check this with stand-in programs.
set -euo pipefail

die()  { echo "error: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "'$1' is not installed"; }
# need_val "$@": inside an option loop, stop with a clear message when the option has no value
need_val() { (($# >= 2)) || die "option $1 needs a value"; }
yes_or_quit() {
  local answer
  read -r -p "$1 [y/N] " answer || { echo "cancelled (no answer)" >&2; exit 1; }
  [[ "$answer" == [yY] ]] || { echo "cancelled" >&2; exit 1; }
}
# Piped, "firebase use" prints the bare id; in a terminal it prints "Active Project: id" or "Active Project: alias (id)".
# Take the last non-empty line, drop CRs, keep what is inside the last parentheses if any, then require a project id shape.
active_project() {
  local out line=""
  [[ -f .firebaserc || -f firebase.json ]] || die "no .firebaserc or firebase.json here, run from the project folder"
  out=$(firebase use 2>/dev/null) || true
  out="${out//$'\r'/}"
  line=$(printf '%s\n' "$out" | grep -v '^[[:space:]]*$' | tail -n 1) || true
  line="${line#*Active Project:}"
  if [[ "$line" == *"("*")"* ]]; then line="${line##*(}"; line="${line%%)*}"; fi
  line="${line#"${line%%[![:space:]]*}"}"; line="${line%"${line##*[![:space:]]}"}"
  [[ "$line" =~ ^[a-z][a-z0-9-]{4,28}[a-z0-9]$ ]] || die "no active project, run: firebase use <project-id>"
  printf '%s\n' "$line"
}

cmd_init() {
  need firebase
  firebase projects:list >/dev/null 2>&1 || die "not logged in, run: firebase login"
  # The CLI accepts one feature name at most, so the feature picker runs interactively.
  echo "In the picker choose: Firestore, Functions, Hosting, Storage, Emulators."
  if [[ -n "${1:-}" ]]; then
    firebase init --project "$1"
  else
    firebase init
  fi
  echo "next: review firebase.json, edit the two rules files, then: fbtool.sh emu"
}

cmd_emu() {
  need firebase
  local dir="./emulator-data" import="" persist=1 only="" inspect=""
  while (($#)); do
    case "$1" in
      --debug)      inspect="--inspect-functions" ;;
      --import)     need_val "$@"; import="$2"; shift ;;
      --no-persist) persist=0 ;;
      --only)       need_val "$@"; only="$2"; shift ;;
      *) die "unknown option $1" ;;
    esac
    shift
  done
  local args=(emulators:start)
  [[ -n "$only" ]] && args+=(--only "$only")
  if [[ -n "$import" ]]; then args+=("--import=$import")
  elif [[ -d "$dir" ]]; then args+=("--import=$dir"); echo "loading saved data from $dir"; fi
  ((persist)) && args+=("--export-on-exit=$dir")
  [[ -n "$inspect" ]] && args+=("$inspect") && echo "debugger will listen on 9229"
  exec firebase "${args[@]}"
}

# Shared by deploy and fn-deploy
run_deploy() {  # run_deploy <project> <dry> <force> <args...>
  local project="$1" dry="$2" force="$3"; shift 3
  [[ -n "$project" ]] || die "no project, nothing deployed"
  echo "project: $project"
  echo "command: firebase deploy $*${dry:+ --dry-run}"
  if [[ -z "$dry" && "$force" != 1 ]]; then yes_or_quit "Deploy to $project?"; fi
  firebase deploy "$@" ${dry:+--dry-run}
}

cmd_deploy() {
  need firebase
  local dry="" force=0 args=()
  while (($#)); do
    case "$1" in
      --dry-run) dry=1 ;;
      --force|-f) force=1 ;;
      --only)    need_val "$@"; args+=(--only "$2"); shift ;;
      --except)  need_val "$@"; args+=(--except "$2"); shift ;;
      --message|-m) need_val "$@"; args+=(--message "$2"); shift ;;
      *) die "unknown option $1" ;;
    esac
    shift
  done
  local project; project=$(active_project) || exit 1
  [[ -n "$project" ]] || die "no active project, nothing deployed"
  run_deploy "$project" "$dry" "$force" ${args[@]+"${args[@]}"}
}

cmd_fn_deploy() {
  need firebase
  local dry="" force=0 codebase="" names=()
  while (($#)); do
    case "$1" in
      --dry-run) dry=1 ;;
      --force|-f) force=1 ;;
      --codebase) need_val "$@"; codebase="$2"; shift ;;
      -*) die "unknown option $1" ;;
      *) names+=("$1") ;;
    esac
    shift
  done
  local target="functions"
  if ((${#names[@]})); then target="functions:$(IFS=,; echo "${names[*]}")"
  elif [[ -n "$codebase" ]]; then target="functions:$codebase"; fi
  local project; project=$(active_project) || exit 1
  [[ -n "$project" ]] || die "no active project, nothing deployed"
  run_deploy "$project" "$dry" "$force" --only "$target"
}

cmd_secret() {
  need firebase
  local action="${1:-}" name="${2:-}"
  case "$action" in
    set|get|list|versions|delete) ;;
    *) die "usage: secret set|get|list|versions|delete [NAME]" ;;
  esac
  local project; project=$(active_project) || exit 1
  echo "project: $project"
  case "$action" in
    set)      [[ -n "$name" ]] || die "usage: secret set NAME"
              firebase functions:secrets:set "$name"
              echo "bind it: defineSecret('$name') and list it in the function's secrets option" ;;
    get)      [[ -n "$name" ]] || die "usage: secret get NAME"; firebase functions:secrets:get "$name" ;;
    list)     need gcloud; gcloud secrets list --project="$project" ;;
    versions) need gcloud; [[ -n "$name" ]] || die "usage: secret versions NAME"
              gcloud secrets versions list "$name" --project="$project" ;;
    delete)   [[ -n "$name" ]] || die "usage: secret delete NAME"
              yes_or_quit "Permanently delete secret $name in $project?"
              firebase functions:secrets:destroy "$name" ;;
  esac
}

collection_flag() {  # turns " a, b ," into ONE flag: --collection-ids=a,b (spaces trimmed, empties dropped)
  local -a parts; local item out=""
  IFS=',' read -r -a parts <<< "$1" || true
  for item in ${parts[@]+"${parts[@]}"}; do
    item="${item#"${item%%[![:space:]]*}"}"; item="${item%"${item##*[![:space:]]}"}"
    [[ -n "$item" ]] && out+="${out:+,}$item"
  done
  [[ -n "$out" ]] || die "--collections needs at least one collection id"
  printf '%s\n' "--collection-ids=$out"
}

cmd_export() {
  local out="./firestore-export" colls="" emu=0
  while (($#)); do
    case "$1" in
      --output|-o) need_val "$@"; out="$2"; shift ;;
      --collections|-c) need_val "$@"; colls="$2"; shift ;;
      --emulator) emu=1 ;;
      *) die "unknown option $1" ;;
    esac
    shift
  done
  need firebase
  if ((emu)); then
    need curl
    local emu_host="127.0.0.1" emu_port=8080
    curl -fs "${emu_host}:${emu_port}" >/dev/null || die "Firestore emulator is not answering on ${emu_port}"
    firebase emulators:export "$out"
    return
  fi
  need gcloud
  [[ "$out" == gs://* ]] || die "production export needs a gs:// destination"
  local project; project=$(active_project) || exit 1
  local extra=()
  if [[ -n "$colls" ]]; then extra+=("$(collection_flag "$colls")"); fi
  yes_or_quit "Export PRODUCTION data of $project to $out?"
  gcloud firestore export "$out" --project="$project" ${extra[@]+"${extra[@]}"}
}

cmd_import() {
  local src="" colls="" emu=0
  while (($#)); do
    case "$1" in
      --input|-i) need_val "$@"; src="$2"; shift ;;
      --collections|-c) need_val "$@"; colls="$2"; shift ;;
      --emulator) emu=1 ;;
      *) die "unknown option $1" ;;
    esac
    shift
  done
  [[ -n "$src" ]] || die "--input is required"
  if ((emu)); then
    [[ "$src" != gs://* ]] || die "an emulator cannot load a gs:// path; use a local folder as --input"
    echo "A running emulator cannot be loaded from here. Stop it and run:"
    echo "  fbtool.sh emu --import $src"
    return
  fi
  need firebase; need gcloud
  [[ "$src" == gs://* ]] || die "production import needs a gs:// source"
  local project; project=$(active_project) || exit 1
  echo "This writes into PRODUCTION and can overwrite documents."
  local typed; read -r -p "Type the project id ($project) to continue: " typed || die "no answer, nothing imported"
  [[ "$typed" == "$project" ]] || die "project id did not match, nothing imported"
  local extra=()
  if [[ -n "$colls" ]]; then extra+=("$(collection_flag "$colls")"); fi
  gcloud firestore import "$src" --project="$project" ${extra[@]+"${extra[@]}"}
  echo "started; follow progress in the console under Firestore, Import/Export"
}

main() {
  local sub="${1:-}"; shift || true
  case "$sub" in
    init) cmd_init "$@" ;;
    emu) cmd_emu "$@" ;;
    deploy) cmd_deploy "$@" ;;
    fn-deploy) cmd_fn_deploy "$@" ;;
    secret) cmd_secret "$@" ;;
    export) cmd_export "$@" ;;
    import) cmd_import "$@" ;;
    *) echo "usage: fbtool.sh init|emu|deploy|fn-deploy|secret|export|import [options]"; exit 1 ;;
  esac
}
main "$@"
