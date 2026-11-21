#!/usr/bin/env python3

# Spec linter for Motion.dev animations. Usage is in the docstring below.
"""Lint Motion.dev animation specs against ../schema/motion-config.schema.json.

    python validate_motion_config.py spec.json
    python validate_motion_config.py --all some/dir

Needs the jsonschema package (pip install jsonschema).
Exit code 0 when every spec is valid, 1 otherwise. Warnings never change the exit code.
"""

import json
import sys
from pathlib import Path

SCHEMA_FILE = Path(__file__).resolve().parents[1].joinpath("schema", "motion-config.schema.json")
BUNDLE_LIMIT = 51200  # bytes, the 50KB budget
FPS_FLOOR = 60


def fail(message):
    print(f"❌ {message}")
    sys.exit(1)


def read_schema():
    if not SCHEMA_FILE.exists():
        fail(f"Schema not found: {SCHEMA_FILE}")
    return json.loads(SCHEMA_FILE.read_text(encoding="utf-8"))


def soft_warnings(spec):
    """Checks the schema cannot express. Returns a list of strings."""
    out = []
    perf = spec.get("performance", {})
    if perf.get("fps", FPS_FLOOR) < FPS_FLOOR:
        out.append(f"⚠️  Target frame rate {perf['fps']} is below the {FPS_FLOOR} floor")
    size = perf.get("bundleSize") or 0
    if size > BUNDLE_LIMIT:
        out.append(f"⚠️  Bundle size ({size} bytes) is over 50KB")
    if perf.get("gpuAccelerated") is False:
        out.append("⚠️  Not GPU-accelerated, expect jank")

    a11y = spec.get("accessibility")
    if a11y is None:
        out.append("⚠️  No accessibility section")
    else:
        for key, label in (
            ("reducedMotion", "no reduced-motion support"),
            ("keyboardNav", "not usable by keyboard"),
            ("focusVisible", "no visible focus indicator"),
        ):
            if not a11y.get(key):
                out.append(f"⚠️  Accessibility: {label}")
    return out


def check(path, schema):
    """Returns (valid, messages)."""
    try:
        import jsonschema
    except ImportError:
        fail("jsonschema is missing. Install it with: pip install jsonschema")

    try:
        spec = json.loads(Path(path).read_text(encoding="utf-8"))
    except json.JSONDecodeError as err:
        return False, [f"Not valid JSON: {err}"]
    except (OSError, ValueError) as err:   # ValueError covers UnicodeDecodeError (bad bytes)
        return False, [f"Cannot read file: {err}"]

    checker = jsonschema.validators.validator_for(schema)(schema)
    problem = jsonschema.exceptions.best_match(checker.iter_errors(spec))
    if problem is not None:
        text = problem.message
        if problem.context:   # oneOf failures: show what each branch said
            text += " (" + "; ".join(sorted({c.message for c in problem.context})) + ")"
        return False, [f"Does not match the schema: {text}"]

    return True, soft_warnings(spec)


def run_directory(folder, schema):
    folder = Path(folder)
    if not folder.is_dir():
        fail(f"Not a directory: {folder}")
    files = sorted(folder.rglob("*.json"))
    if not files:
        fail(f"No JSON files under {folder}")

    print(f"📁 Checking {len(files)} files...\n")
    good = bad = 0
    for f in files:
        ok, notes = check(f, schema)
        good, bad = (good + 1, bad) if ok else (good, bad + 1)
        print(f"{'✅' if ok else '❌'} {f.name}")
        for n in notes:
            print("   " + n)
    print()
    print(f"📊 Summary: {good} valid, {bad} invalid")
    sys.exit(0 if bad == 0 else 1)


def run_file(file, schema):
    file = Path(file)
    if not file.exists():
        fail(f"File not found: {file}")
    ok, notes = check(file, schema)
    if not ok:
        print(f"❌ Invalid: {file}")
        for n in notes:
            print("   " + n)
        sys.exit(1)
    print(f"✅ Valid: {file}")
    if notes:
        print()
        print("⚠️  Warnings:")
        for n in notes:
            print(f"   {n}")
    else:
        print("   No warnings.")
    sys.exit(0)


def main(argv):
    for stream in (sys.stdout, sys.stderr):   # emoji must not crash a legacy console
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    if len(argv) < 2:
        print("Usage: validate_motion_config.py <spec.json>")
        print("   or: validate_motion_config.py --all <folder>")
        sys.exit(1)
    schema = read_schema()
    if argv[1:2] == ["--all"]:
        if len(argv) < 3:
            fail("--all needs a directory")
        run_directory(argv[2], schema)
    else:
        run_file(argv[1], schema)


if __name__ == "__main__":
    main(sys.argv)
