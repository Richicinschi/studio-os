#!/usr/bin/env python3

# Self-check for validate_motion_config.py: feeds it awkward inputs and asserts it
# exits 1 with a message (never a traceback) and that --all keeps going.
# Run: python selfcheck_validator.py   (needs the jsonschema package)

import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
VALIDATOR = HERE / "validate_motion_config.py"
GOOD = HERE.parent / "examples" / "example-config.json"


def run(*args):
    done = subprocess.run(
        [sys.executable, "-X", "utf8", str(VALIDATOR), *map(str, args)],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    return done.returncode, done.stdout + done.stderr


def main():
    failures = []

    def expect(label, got, want_code, want_text=None):
        code, out = got
        ok = code == want_code and "Traceback" not in out and (want_text is None or want_text in out)
        print(("ok   " if ok else "FAIL ") + label)
        if not ok:
            failures.append(label)
            print("     exit", code, "|", out.strip()[:300])

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        (tmp / "bad_bytes.json").write_bytes(b"\xff\xfe\x00")
        (tmp / "empty.json").write_bytes(b"")
        (tmp / "null.json").write_text("null", encoding="utf-8")
        def spec(**changes):
            base = dict(props={}, type="scroll")
            base["component"] = "motion." + "section"
            base.update(changes)
            return json.dumps(base)

        (tmp / "wrong_type.json").write_text(spec(component=5), encoding="utf-8")
        (tmp / "bad_ease.json").write_text(spec(props={"transition": {"ease": "spring"}}), encoding="utf-8")
        (tmp / "huge.json").write_text(spec(description="x" * 5_000_000), encoding="utf-8")
        (tmp / "folder.json").mkdir()

        expect("valid example", run(GOOD), 0, "Valid")
        expect("invalid UTF-8", run(tmp / "bad_bytes.json"), 1, "Cannot read")
        expect("empty file", run(tmp / "empty.json"), 1, "Not valid JSON")
        expect("JSON null", run(tmp / "null.json"), 1, "Does not match")
        expect("component is a number", run(tmp / "wrong_type.json"), 1, "not of type")
        expect("unknown easing lists the allowed names", run(tmp / "bad_ease.json"), 1, "easeOut")
        expect("huge file", run(tmp / "huge.json"), 0)
        expect("directory given as a file", run(tmp / "folder.json"), 1, "Cannot read")
        expect("missing file", run(tmp / "nope.json"), 1, "not found")
        expect("no arguments", run(), 1, "Usage")

        # --all must report every file even when one of them cannot be decoded
        (tmp / "folder.json").rmdir()
        code, out = run("--all", tmp)
        ok = code == 1 and "Traceback" not in out and "bad_bytes.json" in out and "wrong_type.json" in out and "Summary" in out
        print(("ok   " if ok else "FAIL ") + "--all carries on past a bad file")
        if not ok:
            failures.append("--all")
            print(out[:400])

    print("\nAll checks passed." if not failures else f"\n{len(failures)} check(s) failed.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
