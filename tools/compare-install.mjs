// tools/compare-install.mjs
// Show what differs between the kit's copy of an item and the copy installed in a setup:
//   node tools/compare-install.mjs <kit-item-path> <installed-path>
// Both paths are folders (a skill, a domain), or both are single files (an agent); the two named paths are
// followed if they are links. Output is Markdown, to paste into adoption/decisions.md:
//   ## Only in the kit copy, ## Only in the installed copy, ## Different: one line per path, or "None.";
//   ## Scripts: one line per script in both copies, `identical` or `changed`, then a fenced unified diff
//   (3 lines of context) for each changed script.
// Paths are POSIX paths relative to each root, sorted. A script is a file whose first line starts with #!
// (after a byte-order mark, if any), or a name ending .mjs .js .cjs .ts .sh .bash .ps1 .psm1 .py .cmd .bat;
// a script in one copy only is marked (script). Where one copy is a link, the other's #! line still counts.
// Two text files equal once each CRLF is turned into LF differ by "line endings only", and show no diff;
// when the text differs too, the diff is of the normalised text, noted "line endings differ too". A UTF-8
// byte-order mark at the start of one copy only is set aside the same way: "byte-order mark only" (or
// "byte-order mark and line endings only"); else the diff is of the text without it, noted "byte-order mark
// differs too".
// A file holding a NUL byte is binary: compared byte for byte, never diffed. A script of more than
// MAX_DIFF_LINES (5,000) lines in either copy is "too large to diff". A diff is read as UTF-8; when either
// copy is not valid UTF-8, both are read byte for byte as Latin-1, noted "not UTF-8". In a diff line, control
// characters (C0 but tab, DEL, C1) and the bidirectional controls are written as \uXXXX escapes, noted
// "control characters shown escaped", so none can hide a change on a terminal; on such a line a backslash is
// written as \u005c too, so text that spells an escape cannot pass for one. Inside the roots, a link is never
// followed: it is its own entry, `link → <target>`, compared by its target text. Empty folders are not listed.
// It reads the two copies and writes nothing. Exit 0 when it has compared them (it reports, it does not
// judge); 2 on bad input (bad arguments, a path that is missing, a folder against a file) or when a file
// cannot be read.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const MAX_DIFF_LINES = 5000;
const CONTEXT = 3;
const SCRIPT_EXT = new Set(['.mjs', '.js', '.cjs', '.ts', '.sh', '.bash', '.ps1', '.psm1', '.py', '.cmd', '.bat']);
const USAGE = 'usage: node tools/compare-install.mjs <kit-item-path> <installed-path>';
const ARROW = '\u2192';

class BadInput extends Error {}

const byName = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
const hasBom = (buf) => buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
const hasShebang = (buf) => {
  const at = hasBom(buf) ? 3 : 0;
  return buf.length >= at + 2 && buf[at] === 0x23 && buf[at + 1] === 0x21;
};
// Characters that can hide or reorder text on a terminal: C0 controls but tab and newline, DEL, C1 controls,
// and the bidirectional marks, overrides and isolates.
const CONTROLS = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const escapeChar = (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`;
// Every character `re` matches, as an escape; once there is one, every backslash as well.
const escapeAll = (s, re) => (s.search(re) === -1 ? s : s.replace(/\\/g, escapeChar).replace(re, escapeChar));
const visible = (s) => escapeAll(s, CONTROLS);
// In a name, a tab and a newline are escaped too.
const NAME_CONTROLS = /[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const STRICT_UTF8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
const utf8 = (buf) => { try { return STRICT_UTF8.decode(buf); } catch { return null; } };
// Characters a scanner may count as line breaks though the diff does not (Python's splitlines does): a lone
// CR, form feed, vertical tab, 1C to 1E, NEL, and the line and paragraph separators. Looked for in text whose
// CRLF has been read as LF.
export const OTHER_LINE_BREAKS = /[\u000b\u000c\u000d\u001c-\u001e\u0085\u2028\u2029]/;
const isScriptName = (rel) => SCRIPT_EXT.has(path.posix.extname(rel).toLowerCase());

// Every file, link and other non-folder entry under root, keyed by POSIX path relative to it. lstat, so a
// link is recorded with its target text and never entered or read through.
function walk(root) {
  const out = new Map();
  const visit = (dir, rel) => {
    for (const name of fs.readdirSync(dir).sort(byName)) {
      const abs = path.join(dir, name);
      const r = rel ? `${rel}/${name}` : name;
      const st = fs.lstatSync(abs);
      if (st.isSymbolicLink()) out.set(r, { kind: 'link', target: fs.readlinkSync(abs) });
      else if (st.isDirectory()) visit(abs, r);
      else if (st.isFile()) out.set(r, { kind: 'file', abs });
      else out.set(r, { kind: 'other' });
    }
  };
  visit(root, '');
  return out;
}

// The text with each CRLF turned into LF, as bytes, so text that is not valid UTF-8 still compares exactly.
function lf(buf) {
  const out = Buffer.alloc(buf.length);
  let n = 0;
  for (let i = 0; i < buf.length; i++) if (!(buf[i] === 0x0d && buf[i + 1] === 0x0a)) out[n++] = buf[i];
  return out.subarray(0, n);
}

// 'crlf', 'lf', 'mixed', or 'none' when the text has no line break.
function eolKind(buf) {
  let crlf = 0;
  let bare = 0;
  for (let i = 0; i < buf.length; i++) if (buf[i] === 0x0a) { if (buf[i - 1] === 0x0d) crlf++; else bare++; }
  return crlf && bare ? 'mixed' : crlf ? 'crlf' : bare ? 'lf' : 'none';
}

// Lines keeping their "\n", so a missing final newline is a difference like any other.
const splitLines = (text) => text.match(/[^\n]*\n|[^\n]+$/g) ?? [];

// The edit script from a to b: [type, line, aIndex, bIndex], type ' ', '-' or '+'. The common start and
// end are trimmed, then the middle is a longest-common-subsequence table; removals come before additions.
function lineDiff(a, b) {
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
  const n = a.length - pre - suf;
  const m = b.length - pre - suf;
  const w = m + 1;
  const L = new Uint16Array((n + 1) * w); // counts are at most MAX_DIFF_LINES, below 65,536
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i * w + j] = a[pre + i] === b[pre + j] ? L[(i + 1) * w + j + 1] + 1 : Math.max(L[(i + 1) * w + j], L[i * w + j + 1]);
    }
  }
  const ops = [];
  for (let k = 0; k < pre; k++) ops.push([' ', a[k], k, k]);
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[pre + i] === b[pre + j]) { ops.push([' ', a[pre + i], pre + i, pre + j]); i++; j++; }
    else if (i < n && (j >= m || L[(i + 1) * w + j] >= L[i * w + j + 1])) { ops.push(['-', a[pre + i], pre + i, pre + j]); i++; }
    else { ops.push(['+', b[pre + j], pre + i, pre + j]); j++; }
  }
  for (let k = 0; k < suf; k++) ops.push([' ', a[pre + n + k], pre + n + k, pre + m + k]);
  return ops;
}

// Two copies' bytes as text, the way they are compared: strict UTF-8, or both read byte for byte as Latin-1
// when either is not UTF-8 (each invalid byte would otherwise read as U+FFFD and hide its change).
function decodePair(a, b) {
  const textA = utf8(a);
  const textB = utf8(b);
  if (textA === null || textB === null) return { textA: a.toString('latin1'), textB: b.toString('latin1'), utf8: false };
  return { textA, textB, utf8: true };
}

// Which kit lines survive in the installed copy, read as the diff reads them: a leading byte-order mark set
// aside, CRLF as LF, decodePair's decoding, lines compared without their line break. `map` takes each
// unchanged kit line (1-based) to its installed line. The other lines fall in numbered changed regions, the
// runs of removed and added lines between unchanged ones: `kitRegion` and `instRegion` give each such line
// its region and its place in it (0-based). Two copies equal once read map line for line at any size;
// otherwise { why } when there is no mapping: a binary file, one over MAX_DIFF_LINES lines, or one that uses
// OTHER_LINE_BREAKS, where the scanner's line numbers and the diff's can disagree.
export function lineMapping(kitBuf, instBuf) {
  if (kitBuf.includes(0) || instBuf.includes(0)) return { why: 'binary' };
  const { textA, textB } = decodePair(lf(hasBom(kitBuf) ? kitBuf.subarray(3) : kitBuf), lf(hasBom(instBuf) ? instBuf.subarray(3) : instBuf));
  const a = splitLines(textA).map((l) => l.replace(/\n$/, ''));
  const b = splitLines(textB).map((l) => l.replace(/\n$/, ''));
  const map = new Map();
  const kitRegion = new Map();
  const instRegion = new Map();
  if (a.length === b.length && a.every((l, k) => l === b[k])) {
    a.forEach((_, k) => map.set(k + 1, k + 1));
    return { map, kitRegion, instRegion };
  }
  if (OTHER_LINE_BREAKS.test(textA) || OTHER_LINE_BREAKS.test(textB)) return { why: 'line breaks other than LF and CRLF' };
  if (a.length > MAX_DIFF_LINES || b.length > MAX_DIFF_LINES) return { why: `over ${MAX_DIFF_LINES} lines` };
  let region = -1;
  let start = null;
  for (const [type, , i, j] of lineDiff(a, b)) {
    if (type === ' ') { map.set(i + 1, j + 1); start = null; continue; }
    if (!start) { region++; start = { i, j }; }
    if (type === '-') kitRegion.set(i + 1, { region, at: i - start.i });
    else instRegion.set(j + 1, { region, at: j - start.j });
  }
  return { map, kitRegion, instRegion };
}

// A unified diff of two texts, with --- / +++ headers naming rel in each copy; `escaped` says whether a
// printed line had a control character written as an escape.
function unifiedDiff(rel, textA, textB) {
  let escaped = false;
  const ops = lineDiff(splitLines(textA), splitLines(textB));
  const changed = ops.flatMap((o, k) => (o[0] === ' ' ? [] : [k]));
  const out = [`--- kit/${rel}`, `+++ installed/${rel}`];
  const range = (start, count) => (count === 1 ? `${start}` : `${start},${count}`);
  let h = 0;
  while (h < changed.length) {
    // A hunk runs from CONTEXT lines before its first change to CONTEXT after its last; changes with at most
    // 2 * CONTEXT unchanged lines between them share one hunk, as in GNU diff.
    let last = h;
    while (last + 1 < changed.length && changed[last + 1] - changed[last] <= 2 * CONTEXT + 1) last++;
    const from = Math.max(0, changed[h] - CONTEXT);
    const to = Math.min(ops.length - 1, changed[last] + CONTEXT);
    const part = ops.slice(from, to + 1);
    const oldCount = part.filter((o) => o[0] !== '+').length;
    const newCount = part.filter((o) => o[0] !== '-').length;
    const oldStart = oldCount ? part[0][2] + 1 : part[0][2];
    const newStart = newCount ? part[0][3] + 1 : part[0][3];
    out.push(`@@ -${range(oldStart, oldCount)} +${range(newStart, newCount)} @@`);
    for (const [type, line] of part) {
      const text = line.replace(/\n$/, '');
      const shown = visible(text);
      if (shown !== text) escaped = true;
      out.push(type + shown);
      if (!line.endsWith('\n')) out.push('\\ No newline at end of file');
    }
    h = last + 1;
  }
  return { diff: out.join('\n'), escaped };
}

function readFile(rel, abs) {
  try { return fs.readFileSync(abs); } catch (e) { throw new BadInput(`cannot read ${rel}: ${e.code || e.message}`); }
}

const describe = (e) => (e.kind === 'link' ? `link ${ARROW} ${code(e.target)}` : e.kind === 'file' ? 'a file' : 'not a file or a link');

// One path present in both copies: null when they are the same, else its entry in `different`.
function compareEntry(rel, ea, eb) {
  if (ea.kind !== 'file' || eb.kind !== 'file') {
    // Nothing is read through a link: its name makes it a script, or a #! line in the other copy, a file.
    const script = isScriptName(rel) || [ea, eb].some((e) => e.kind === 'file' && hasShebang(readFile(rel, e.abs)));
    if (ea.kind === eb.kind && (ea.kind !== 'link' || ea.target === eb.target)) return { file: rel, script, same: true };
    return { file: rel, script, eolOnly: false, bomOnly: false, notes: [`kit copy: ${describe(ea)}; installed copy: ${describe(eb)}`] };
  }
  const a = readFile(rel, ea.abs);
  const b = readFile(rel, eb.abs);
  const script = isScriptName(rel) || hasShebang(a) || hasShebang(b);
  if (a.equals(b)) return { file: rel, script, same: true };
  if (a.includes(0) || b.includes(0)) return { file: rel, script, eolOnly: false, bomOnly: false, notes: ['binary'] };
  // A byte-order mark at the start of one copy only is set aside, like CRLF, and then named.
  const bomDiffers = hasBom(a) !== hasBom(b);
  const ta = hasBom(a) ? a.subarray(3) : a;
  const tb = hasBom(b) ? b.subarray(3) : b;
  const na = lf(ta);
  const nb = lf(tb);
  if (na.equals(nb)) {
    const eolDiffers = !ta.equals(tb);
    const label = bomDiffers && eolDiffers ? 'byte-order mark and line endings only' : bomDiffers ? 'byte-order mark only' : 'line endings only';
    return { file: rel, script, eolOnly: !bomDiffers, bomOnly: !eolDiffers, notes: [label] };
  }
  const ka = eolKind(a);
  const kb = eolKind(b);
  const notes = ka !== kb && ka !== 'none' && kb !== 'none' ? ['line endings differ too'] : [];
  if (bomDiffers) notes.push('byte-order mark differs too');
  const entry = { file: rel, script, eolOnly: false, bomOnly: false, notes };
  if (script) {
    const { textA, textB, utf8: isUtf8 } = decodePair(na, nb);
    if (!isUtf8) notes.push('not UTF-8');
    if (splitLines(textA).length > MAX_DIFF_LINES || splitLines(textB).length > MAX_DIFF_LINES) notes.unshift(`too large to diff: over ${MAX_DIFF_LINES} lines`);
    else {
      const { diff, escaped } = unifiedDiff(rel, textA, textB);
      entry.diff = diff;
      if (escaped) notes.push('control characters shown escaped');
    }
  }
  return entry;
}

function kindOf(p, which) {
  let st;
  try { st = fs.statSync(p); } catch (e) { throw new BadInput(`the ${which} ${p} cannot be read: ${e.code || e.message}`); }
  if (st.isDirectory()) return 'folder';
  if (st.isFile()) return 'file';
  throw new BadInput(`the ${which} ${p} is neither a folder nor a file`);
}

// Compare the kit copy a with the installed copy b: two folders, or two files. Beyond the stated
// { onlyA, onlyB, different }: each `different` entry also has `bomOnly` (it differs by a byte-order mark
// alone) and `notes` (the words printed after it), and
// `sameScripts` lists the scripts that are byte for byte the same; onlyA and onlyB entries that are
// scripts or links are described in `onlyNotes`.
export function compareTrees(a, b) {
  const ka = kindOf(a, 'kit copy');
  const kb = kindOf(b, 'installed copy');
  if (ka !== kb) throw new BadInput(`the kit copy is a ${ka} and the installed copy a ${kb}; give two folders or two files`);
  let A;
  let B;
  try {
    if (ka === 'file') {
      const rel = path.basename(a);
      A = new Map([[rel, { kind: 'file', abs: a }]]);
      B = new Map([[rel, { kind: 'file', abs: b }]]);
    } else {
      A = walk(a);
      B = walk(b);
    }
  } catch (e) {
    throw new BadInput(`cannot list the copies: ${e.code || e.message}`);
  }
  const onlyNotes = {};
  const only = (X, Y) => [...X.keys()].filter((k) => !Y.has(k)).sort(byName).map((k) => {
    const e = X.get(k);
    if (e.kind === 'link') onlyNotes[k] = `link ${ARROW} ${code(e.target)}`;
    else if (e.kind === 'other') onlyNotes[k] = 'not a file or a link';
    else if (isScriptName(k) || hasShebang(readFile(k, e.abs))) onlyNotes[k] = 'script';
    return k;
  });
  const onlyA = only(A, B);
  const onlyB = only(B, A);
  const different = [];
  const sameScripts = [];
  for (const rel of [...A.keys()].filter((k) => B.has(k)).sort(byName)) {
    const d = compareEntry(rel, A.get(rel), B.get(rel));
    if (!d) continue;
    if (d.same) { if (d.script) sameScripts.push(rel); continue; }
    different.push(d);
  }
  return { onlyA, onlyB, different, sameScripts, onlyNotes };
}

// Markdown inline code that holds any text: a fence longer than any run of backticks in it, and control
// characters, tab included, written as \u escapes so a name cannot break the line or hide.
function code(s) {
  const text = escapeAll(String(s), NAME_CONTROLS);
  const run = Math.max(0, ...(text.match(/`+/g) ?? []).map((r) => r.length));
  const tick = '`'.repeat(run + 1);
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
  return `${tick}${pad}${text}${pad}${tick}`;
}

const note = (notes) => (notes && notes.length ? ` (${notes.join('; ')})` : '');

export function toMarkdown(r) {
  const list = (items) => (items.length ? items : ['None.']);
  const out = [];
  const sect = (title, items) => out.push(`## ${title}`, '', ...list(items), '');
  sect('Only in the kit copy', r.onlyA.map((k) => `- ${code(k)}${note(r.onlyNotes[k] ? [r.onlyNotes[k]] : [])}`));
  sect('Only in the installed copy', r.onlyB.map((k) => `- ${code(k)}${note(r.onlyNotes[k] ? [r.onlyNotes[k]] : [])}`));
  sect('Different', r.different.map((d) => `- ${code(d.file)}${note(d.notes)}`));
  const scripts = [
    ...r.sameScripts.map((file) => ({ file, line: `- ${code(file)}: identical` })),
    ...r.different.filter((d) => d.script).map((d) => ({ file: d.file, line: `- ${code(d.file)}: changed${note(d.notes)}`, diff: d.diff })),
  ].sort((x, y) => byName(x.file, y.file));
  sect('Scripts', scripts.map((s) => s.line));
  for (const s of scripts) {
    if (!s.diff) continue;
    const run = Math.max(0, ...(s.diff.match(/`+/g) ?? []).map((t) => t.length));
    const fence = '`'.repeat(Math.max(3, run + 1));
    out.push(`${fence}diff`, s.diff, fence, '');
  }
  return out.join('\n');
}

export function main(argv) {
  if (argv.length !== 2 || argv.some((a) => a.startsWith('--'))) { console.error(USAGE); return 2; }
  try {
    process.stdout.write(toMarkdown(compareTrees(path.resolve(argv[0]), path.resolve(argv[1]))));
    return 0;
  } catch (e) {
    console.error(e instanceof BadInput ? e.message : `cannot compare: ${e.message}`);
    return 2;
  }
}

// Node gives the started module its real path, links resolved (macOS keeps its temporary folder under /var,
// a link to /private/var), so the started path is compared the same way.
const started = () => { try { return pathToFileURL(fs.realpathSync(process.argv[1])).href; } catch { return ''; } };
if (process.argv[1] && import.meta.url === started()) process.exitCode = main(process.argv.slice(2));
