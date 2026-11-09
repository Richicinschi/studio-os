"""Create a starter Python Cloud Functions codebase.

Usage: python new_python_functions.py [--path DIR] [--codebase NAME]
Writes main.py, requirements.txt and .gitignore, then prints the firebase.json entry.
"""
import argparse
import json
import sys
from pathlib import Path

REQUIREMENTS = ["firebase-functions>=0.5.0", "firebase-admin>=6.0.0"]

MAIN = '''"""Starter functions: HTTP, callable, Firestore trigger, schedule."""
import json
from typing import Any

from firebase_admin import initialize_app
from firebase_functions import firestore_fn, https_fn, options, scheduler_fn

initialize_app()


PROFILE_PATH = "users/{uid}"
VERBS = ["GET", "POST"]
# Replace with the web origins that may call this function; never "*" for anything that reads user data.
ALLOWED_ORIGINS = ["YOUR_APP_ORIGIN"]
CORS = options.CorsOptions(cors_origins=ALLOWED_ORIGINS, cors_methods=VERBS)


@https_fn.on_request(cors=CORS)
def echo(request: https_fn.Request) -> https_fn.Response:
    if request.method == "POST":
        body = {"got": request.get_json(silent=True) or {}}
    elif request.method == "GET":
        body = {"ok": True}
    else:
        return https_fn.Response("only GET and POST are served", status=405)
    return https_fn.Response(json.dumps(body))


@https_fn.on_call()
def shout(req: https_fn.CallableRequest) -> Any:
    if req.auth is None:
        raise https_fn.HttpsError(https_fn.FunctionsErrorCode.UNAUTHENTICATED, "sign in first")
    text = (req.data or {}).get("text")
    if not isinstance(text, str):
        raise https_fn.HttpsError(https_fn.FunctionsErrorCode.INVALID_ARGUMENT, "text must be a string")
    who = req.auth.uid
    return {"uid": who, "text": text.upper()}


@firestore_fn.on_document_created(document="users/{uid}")
def user_created(evt: "firestore_fn.Event[firestore_fn.DocumentSnapshot]") -> None:
    snap = evt.data
    if snap is None:
        return
    print("created", evt.params["uid"], snap.to_dict())


@firestore_fn.on_document_updated(document=PROFILE_PATH)
def user_updated(evt) -> None:  # evt.data.before and evt.data.after are document snapshots
    before, after = evt.data.before, evt.data.after
    print("updated", evt.params["uid"], before.to_dict() if before.exists else {}, after.to_dict() if after.exists else {})


@firestore_fn.on_document_deleted(document=PROFILE_PATH)
def user_deleted(evt: "firestore_fn.Event[firestore_fn.DocumentSnapshot]") -> None:
    print("deleted", evt.params["uid"])


@scheduler_fn.on_schedule(schedule="every 12 hours", timezone="UTC")
def twice_daily_job(tick: scheduler_fn.ScheduledEvent) -> None:
    print("twice daily job ran")


@scheduler_fn.on_schedule(timezone="Europe/Amsterdam", schedule="30 7 * * 1")
def monday_job(tick: scheduler_fn.ScheduledEvent) -> None:
    print("weekly job ran")
'''


def entry(path: str, codebase: str) -> str:
    return json.dumps(
        {"source": path, "codebase": codebase, "runtime": "python312"}, indent=2
    )


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--path", default="python-functions")
    ap.add_argument("--codebase", default="python")
    opts = ap.parse_args()

    target = Path(opts.path)
    if target.exists() and not target.is_dir():
        print(f"error: {target} exists and is not a folder", file=sys.stderr)
        return 1
    if target.exists() and any(target.iterdir()):
        try:
            answer = input(f"{target} is not empty. Write into it anyway? [y/N] ")
        except EOFError:
            answer = ""
        if answer.strip().lower() != "y":
            print("cancelled", file=sys.stderr)
            return 1
    target.mkdir(parents=True, exist_ok=True)
    (target / "requirements.txt").write_text("\n".join(REQUIREMENTS) + "\n", encoding="utf-8")
    (target / "main.py").write_text(MAIN, encoding="utf-8")
    (target / ".gitignore").write_text(".env\nvenv/\n*.pyc\n__pycache__/\n", encoding="utf-8")

    print(f"created {target}")
    print('add this object to the "functions" array in firebase.json:')
    print(entry(opts.path, opts.codebase))
    print(f"then: python -m venv {target}/venv, install requirements.txt,")
    print(f"and deploy with: fbtool.sh fn-deploy --codebase {opts.codebase}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
