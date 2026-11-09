#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Look up draw.io's own shapes by keyword and print their exact style strings.

Command line: shapesearch.py QUERY, with optional --limit N and --json.
Example query: "gcp pubsub".

The index in data/shape-index.json.gz lists the shapes of draw.io's built-in
palettes (cloud providers, network, UML, BPMN, flowchart, and more). Each entry
has a title, a size, a style string and a tag line. A query is split into
words; a word matches a shape when it equals one of the shape's tags, or when
it sounds like one (Soundex). Shapes that match every word come first; when
none does, shapes matching any word are scored and listed instead.

Within one score, shapes whose title holds the query words rank higher, then
titles sort alphabetically.

Exit codes: 0 with results, 1 when the index is missing or nothing matched.
"""
import sys
import re
import os
import json
import io
import gzip
import argparse

HERE = os.path.dirname(__file__)
INDEX_FILE = "shape-index.json.gz"
INDEX = os.path.join(HERE, os.pardir, "data", INDEX_FILE)

# Soundex digit for each letter A..Z ("0" marks letters that are skipped).
SOUNDEX_DIGITS = "01230120022455012603010202"
TAIL_NOISE = re.compile(r"[.]*[0-9]*$")
TAG_SEPARATORS = re.compile(r"[/,()]")
SPLIT_RULES = (
    (re.compile("([a-z])(?=[A-Z])"), r"\1 "),
    (re.compile("([A-Za-z])(?=[0-9])"), r"\1 "),
    (re.compile("([0-9])(?=[A-Za-z])"), r"\1 "),
)
ALNUM_RUN = re.compile("[a-z0-9]+")
RESULT_FIELDS = ("style", "w", "h", "title")


def soundex(word):
    """Four-character Soundex code (first letter plus three digits)."""
    if not word:
        return ""
    code = [word[0].upper()]
    for letter in word[1:]:
        pos = ord(letter.upper()) - ord("A")
        if not 0 <= pos <= 25:
            continue
        digit = SOUNDEX_DIGITS[pos]
        if digit == "0" or digit == code[-1]:
            continue
        code.append(digit)
        if len(code) == 4:
            break
    return "".join(code).ljust(4, "0")


def phonetic_key(word):
    return soundex(TAIL_NOISE.sub("", word))


def index_tags(shapes):
    """Map every tag, and the Soundex of every tag, to the shapes carrying it."""
    table = {}
    for pos, shape in enumerate(shapes):
        line = shape.get("tags")
        if not line:
            continue
        keys = set()
        for tag in TAG_SEPARATORS.sub(" ", line.lower()).split():
            if len(tag) < 2:
                continue
            keys.add(tag)
            sound = phonetic_key(tag)
            if sound and sound != tag:
                keys.add(sound)
        for key in keys:
            table.setdefault(key, set()).add(pos)
    return table


def split_word(word):
    """Break a glued word at case changes and letter/digit borders."""
    for pattern, replacement in SPLIT_RULES:
        word = pattern.sub(replacement, word)
    return [piece for piece in word.lower().split() if len(piece) >= 2]


def query_terms(query):
    """Distinct search words of a query, in order."""
    terms = []
    for chunk in query.lower().split():
        pieces = split_word(chunk)
        if not pieces and len(chunk) >= 2:
            pieces = [chunk]
        for piece in pieces:
            if piece not in terms:
                terms.append(piece)
    return terms


def lookup(table, term):
    """Return (exact matches, sound-alike matches) for one search word."""
    exact = set(table.get(term, ()))
    sound = phonetic_key(term)
    similar = set()
    if sound and sound != term:
        similar = set(table.get(sound, ())) - exact
    return exact, similar


def search(shapes, table, query, limit):
    terms = query_terms(query) if query else []
    if not terms:
        return []
    hits = [lookup(table, term) for term in terms]

    # Candidates that satisfy every term, if there are any.
    everywhere = None
    for exact, similar in hits:
        reach = exact | similar
        everywhere = reach if everywhere is None else everywhere & reach
        if not everywhere:
            break
    allowed = everywhere or None

    # An exact tag hit is worth 1, a sound-alike 0.5, per term.
    scores = {}
    for exact, similar in hits:
        for pos in exact:
            if allowed is None or pos in allowed:
                scores[pos] = scores.get(pos, 0) + 1.0
        for pos in similar:
            if allowed is None or pos in allowed:
                scores[pos] = scores.get(pos, 0) + 0.5

    wanted = set(terms)

    def order(pos):
        title = str(shapes[pos].get("title", "")).casefold()
        overlap = wanted.intersection(ALNUM_RUN.findall(title))
        return (-scores[pos], -len(overlap), title, pos)

    picked = sorted(scores, key=order)[:limit]
    return [{field: shapes[pos][field] for field in RESULT_FIELDS} for pos in picked]


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Find draw.io shapes and print their style strings."
    )
    parser.add_argument("query", metavar="QUERY",
                        help='words to look for, for example "aws lambda" or "uml actor"')
    parser.add_argument("--limit", default=10, type=int, help="most results to show")
    parser.add_argument("--json", help="print JSON instead of text", action="store_true")
    args = parser.parse_args(argv)

    try:
        with io.TextIOWrapper(gzip.open(INDEX), encoding="utf-8") as handle:
            shapes = json.load(handle)
    except FileNotFoundError:
        sys.exit("error: shape index not found at " + INDEX)

    table = index_tags(shapes)
    found = search(shapes, table, args.query, limit=args.limit)
    if not found:
        sys.exit("no shapes matched %r" % args.query)
    if args.json:
        sys.stdout.write(json.dumps(found, indent=2, ensure_ascii=False) + "\n")
        return 0
    for item in found:
        heading = "%s  (%sx%s)" % (item["title"], item["w"], item["h"])
        print(heading + "\n  " + item["style"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
