// tools/scan-compare.mjs
// Tell the findings of your own SkillSpector scan of one item from the ones the kit already recorded:
//   skillspector scan <item-folder> --no-llm --format json | node tools/scan-compare.mjs <item-key> - --root <item-folder>
//   skillspector scan <installed> --no-llm --format json | node tools/scan-compare.mjs <item-key> - --kit <kit-item-path> --root <installed>
//   node tools/scan-compare.mjs <item-key> <report.json> [--scans <path>] [--root <item-folder>] [--kit <kit-item-path>]
// The report is a file, or `-` to read it from stdin as the scanner prints it (on Windows SkillSpector
// v2.13.6 refuses --output, and Windows PowerShell 5.1's > would re-encode a file as UTF-16).
// <item-key> is the item's key in tools/export/scans.json: a skill or agent id, or pack:<id> for a domain.
// Output: line 1 is `known: N, moved: K, reworded: R, new: M`; line 2 is the report's own verdict,
// `report: <recommendation> <score>/100`, from its risk_assessment (`report: verdict not stated` when it gives
// no recommendation and numeric score); then `moved:` lines, then `reworded:` lines, then `new:` lines, each
// `<kind>: <severity> <rule> <file>:<recorded line>\u2192<found line>` (`-` for no line) or, for new,
// `new: <severity> <rule> <file>:<line>` (`<file>` alone when the scanner gave no line).
// Matching, as multisets, each record used once; severity is not part of the match, and a finding found
// twice needs two records.
//   With --kit (the kit's copy of the item; --root is then the installed copy): each recorded finding's kit
//   line is mapped to the installed copy through the line diff (compare-install's lineMapping: a kit line
//   maps only when it is unchanged). Found at its mapped line: known when that is the same number, moved
//   when not, so a moved finding sits on the same text, proven. A recorded line that did not survive
//   (changed or deleted) pairs with a found finding of the same rule and file on a changed or added
//   installed line of the same changed region, the nearest place first: reworded. Anything else found is
//   new; a record found nowhere is not reported. A file holding a recorded finding that cannot be mapped
//   (missing on one side, binary, or over the diff limit) gets a line `no line map for <file>: <why>` after
//   line 2, and its findings pair as reworded, nearest line first, or are new.
//   Without --kit: known is the same rule, file and line; of the rest, the same rule and file at another
//   line is moved, paired in line order within each rule and file; reworded is 0; the rest are new. Such
//   moved lines are not proven, and a line after line 2 says so.
// Text: with --root, each moved and reworded line is followed by `  line <n>: <text>`, the line it was found
// at in the installed copy; with --kit, each reworded line also by `  kit line <n>: <text>`, the recorded
// line in the kit's copy. The text is cut at 200 characters (then ` ...`); a file is read as compare-install
// reads it (a byte-order mark set aside; strict UTF-8, else Latin-1); control characters are written as
// \uXXXX escapes, and then backslashes too. A line is read only from a file whose real path, links resolved,
// is inside the named folder; else `  (not read: <why>)`, or `  (no line <n> in <file>)`.
// Scanner version: read from the report's metadata.skillspector_version and compared with the version the
// kit's record of the item states, a leading "v" ignored on both. When they differ, or the report states no
// version, a line saying so comes before line 1, the findings are compared anyway, and the exit is 1.
// Item folder: a file path in the report that is absolute is made relative to the item's folder. That
// folder is --root when given; otherwise the folder the report says it scanned (skill.source), when that is
// an absolute path. A report with an absolute file path and neither is bad input; nothing is guessed.
// Exit: 0 when nothing is new or reworded, nothing moved unproven, and the versions match (with --kit, moved
// alone is 0); 1 otherwise; 2 on bad input (bad arguments, --kit without --root, a file that cannot be read as
// JSON, nothing on stdin, an item with no record, a record or report of the wrong shape). It reads the two
// JSON files (or stdin) and, with --root and --kit, the item's files that hold a finding; it writes nothing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lineMapping, OTHER_LINE_BREAKS } from './compare-install.mjs';
import { findingsFromReport, verdictFrom } from './export/scan.mjs';

const USAGE = 'usage: node tools/scan-compare.mjs <item-key> <report.json> [--scans <path>] [--root <item-folder>] [--kit <kit-item-path>]; <report.json> may be - to read the report from stdin';
const MAKE = 'skillspector scan <item-folder> --no-llm --format json | node tools/scan-compare.mjs <item-key> -';
const UNPROVEN = 'moved lines are paired by line order, not proven; give --kit <kit-item-path> with --root to map them';
const matchKey = (x) => `${x.rule}|${x.file}|${x.line}`;
const fileKey = (x) => `${x.rule}|${x.file}`;
const where = (x) => `${x.file}${x.line === null ? '' : `:${x.line}`}`;
const ARROW = '\u2192';
const lineOf = (n) => (n === null ? '-' : String(n));
const TEXT_MAX = 200;

// Characters that can hide or reorder text on a terminal, the same set as compare-install.mjs: C0 controls but
// tab, DEL, C1 controls, and the bidirectional controls. Once a line holds one, backslashes are escaped too,
// so text that spells an escape cannot pass for one.
const CONTROLS = /[\u0000-\u0008\u000a-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const escapeChar = (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`;
const visible = (s) => (s.search(CONTROLS) === -1 ? s : s.replace(/\\/g, escapeChar).replace(CONTROLS, escapeChar));
const STRICT_UTF8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

// The bytes of file, a path relative to root, or { why }. Only a file whose real path is inside root's real
// path is read, so neither ../ nor a link leads out of it.
function readInside(root, file) {
  try {
    const realRoot = fs.realpathSync(root);
    const real = fs.realpathSync(path.resolve(root, file));
    const rel = path.relative(realRoot, real);
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return { why: 'outside the item folder' };
    return { buf: fs.readFileSync(real) };
  } catch (e) {
    return { why: e.code || e.message };
  }
}

// A file's lines, read as compare-install reads them; null when it uses other line breaks than LF and CRLF,
// where the scanner's line numbers and these can disagree.
function linesOf(buf) {
  const body = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf ? buf.subarray(3) : buf;
  let text;
  try { text = STRICT_UTF8.decode(body); } catch { text = body.toString('latin1'); }
  if (OTHER_LINE_BREAKS.test(text.split('\u000d\u000a').join('\u000a'))) return null;
  const lines = text.split('\n').map((l) => l.replace(/\r$/, ''));
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

// Line n of file under root, as one indented output line headed `label`.
function lineText(root, file, n, cache, label) {
  if (!cache.has(file)) {
    const got = readInside(root, file);
    const lines = got.buf ? linesOf(got.buf) : null;
    cache.set(file, !got.buf ? got : lines ? { lines } : { why: 'line breaks other than LF and CRLF' });
  }
  const entry = cache.get(file);
  if (entry.why) return `  (not read: ${entry.why})`;
  if (n < 1 || n > entry.lines.length) return `  (no line ${n} in ${file})`;
  const raw = entry.lines[n - 1];
  return `  ${label} ${n}: ${visible(raw.slice(0, TEXT_MAX))}${raw.length > TEXT_MAX ? ' ...' : ''}`;
}

// Each found finding is known when a recorded finding with the same rule, file and line is still unmatched;
// each record is used once. Both lists keep the order of `found`.
export function compareFindings(recorded, found) {
  const left = new Map();
  for (const r of recorded) left.set(matchKey(r), (left.get(matchKey(r)) || 0) + 1);
  const out = { known: [], new: [] };
  for (const f of found) {
    const n = left.get(matchKey(f)) || 0;
    if (n > 0) { left.set(matchKey(f), n - 1); out.known.push(f); } else out.new.push(f);
  }
  return out;
}

// Without the kit's copy, three tiers, as multisets, each record used once: known (same rule, file and line);
// moved (same rule and file, another line: the remaining records and findings of each rule and file are
// paired in line order, a missing line first); new (the rest). Each list keeps the order of `found`; a moved
// finding carries the recorded line as `from`. compareFindings, above, is the exact match alone, which
// scan.mjs --check needs.
export function classifyFindings(recorded, found) {
  const { known, new: rest } = compareFindings(recorded, found);
  const left = compareFindings(found, recorded).new; // the records no found finding matched exactly
  const byLine = (x, y) => (x.line ?? -Infinity) - (y.line ?? -Infinity);
  const group = (list) => {
    const m = new Map();
    for (const x of list) m.set(fileKey(x.f), [...(m.get(fileKey(x.f)) || []), x]);
    for (const g of m.values()) g.sort((x, y) => byLine(x.f, y.f) || x.i - y.i);
    return m;
  };
  const records = group(left.map((f, i) => ({ f, i })));
  const pending = group(rest.map((f, i) => ({ f, i })));
  const moved = [];
  const fresh = [];
  for (const [k, g] of pending) {
    const r = records.get(k) || [];
    g.forEach((x, n) => { if (n < r.length) moved.push({ ...x, from: r[n].f.line }); else fresh.push(x); });
  }
  const inOrder = (list) => list.sort((x, y) => x.i - y.i);
  return {
    known,
    moved: inOrder(moved).map((x) => ({ ...x.f, from: x.from })),
    reworded: [],
    new: inOrder(fresh).map((x) => x.f),
  };
}

// With the kit's copy: mappingOf(file) is compare-install's lineMapping of that file, kit to installed, or
// { why }. See the header for the tiers. Each list keeps the order of `found`; moved and reworded findings
// carry the recorded line as `from`.
export function classifyMapped(recorded, found, mappingOf) {
  const slots = new Map(); // rule|file|line -> indexes of found findings not yet used
  found.forEach((f, i) => slots.set(matchKey(f), [...(slots.get(matchKey(f)) || []), i]));
  const take = (k) => { const q = slots.get(k); return q && q.length ? q.shift() : -1; };
  const used = new Map(); // found index -> { kind, from }
  const lost = [];
  for (const r of recorded) {
    if (r.line === null) {
      const i = take(matchKey(r));
      if (i >= 0) used.set(i, { kind: 'known' });
      continue;
    }
    const m = mappingOf(r.file);
    const to = m.map ? m.map.get(r.line) : undefined;
    if (to === undefined) { lost.push(r); continue; }
    const i = take(`${fileKey(r)}|${to}`);
    if (i >= 0) used.set(i, to === r.line ? { kind: 'known' } : { kind: 'moved', from: r.line });
  }
  // A place in a changed region; a file with no mapping is one region, placed by line number.
  const placeOf = (file, line, side) => {
    const m = mappingOf(file);
    return m.map ? m[side].get(line) : { region: 0, at: line };
  };
  const pairs = [];
  lost.forEach((r, n) => {
    const pr = placeOf(r.file, r.line, 'kitRegion');
    if (!pr) return; // a recorded line past the end of the kit's file
    found.forEach((f, i) => {
      if (used.has(i) || f.line === null || fileKey(f) !== fileKey(r)) return;
      const pf = placeOf(f.file, f.line, 'instRegion');
      if (pf && pf.region === pr.region) pairs.push({ n, i, dist: Math.abs(pf.at - pr.at) });
    });
  });
  pairs.sort((x, y) => x.dist - y.dist || x.i - y.i || x.n - y.n);
  const pairedRecord = new Set();
  for (const p of pairs) {
    if (used.has(p.i) || pairedRecord.has(p.n)) continue;
    used.set(p.i, { kind: 'reworded', from: lost[p.n].line });
    pairedRecord.add(p.n);
  }
  const out = { known: [], moved: [], reworded: [], new: [] };
  found.forEach((f, i) => {
    const u = used.get(i);
    if (!u) out.new.push(f);
    else if (u.kind === 'known') out.known.push(f);
    else out[u.kind].push({ ...f, from: u.from });
  });
  return out;
}

class BadInput extends Error {}

function readJson(file, what) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { throw new BadInput(`cannot read the ${what} ${file}: ${e.code || e.message}`); }
  return parseJson(text, `the ${what} ${file}`);
}

function parseJson(text, name) {
  try { return JSON.parse(text.replace(/^\uFEFF/, '')); } catch (e) { throw new BadInput(`${name} is not valid JSON: ${e.message}`); }
}

// The report piped in on stdin. Nothing at all means the scanner printed no report; its error went to stderr.
async function readStdin() {
  if (process.stdin.isTTY) throw new BadInput(`no report on stdin: pipe the scanner's JSON into it, as in ${MAKE}`);
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.replace(/^\uFEFF/, '').trim()) throw new BadInput(`nothing came in on stdin: the scanner printed no report; read its error, then run ${MAKE}`);
  return parseJson(text, 'the report on stdin');
}

// The report's own verdict, as the scanner states it in risk_assessment: the rule scan.mjs records.
function verdictLine(report) {
  const v = verdictFrom(report);
  return `report: ${v.recommendation !== undefined && v.score !== undefined ? `${v.recommendation} ${v.score}/100` : 'verdict not stated'}`;
}

const bare = (v) => String(v).trim().replace(/^v/i, '');

export async function main(argv) {
  let scansFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'export', 'scans.json');
  let root = null;
  let kitRoot = null;
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if ((a === '--scans' || a === '--root' || a === '--kit') && i + 1 < argv.length) {
      const v = path.resolve(argv[++i]);
      if (a === '--scans') scansFile = v; else if (a === '--root') root = v; else kitRoot = v;
    } else if (!a.startsWith('--') && pos.length < 2) pos.push(a);
    else { console.error(USAGE); return 2; }
  }
  if (pos.length !== 2) { console.error(USAGE); return 2; }
  if (kitRoot && !root) { console.error(`--kit needs --root <installed>, the installed copy it is mapped to. ${USAGE}`); return 2; }
  // Text is read only from folders named on the command line, never from one the report names.
  const textRoot = root;
  const [key, reportFile] = pos;
  const reportName = reportFile === '-' ? 'on stdin' : reportFile;
  try {
    // stdin is read to the end first: a pipe left unread breaks under the scanner, which on Windows then
    // prints "[Errno 22] Invalid argument" beside this script's own message.
    const piped = reportFile === '-' ? await readStdin() : null;
    const scans = readJson(scansFile, 'scan record');
    const rec = scans && typeof scans === 'object' && Object.hasOwn(scans, key) ? scans[key] : undefined;
    if (!rec || typeof rec !== 'object') throw new BadInput(`${key}: the kit has no scan record for this item in ${scansFile}; check the key (a skill or agent id, or pack:<id> for a domain)`);
    if (!Array.isArray(rec.findings)) throw new BadInput(`${key}: the kit's record in ${scansFile} holds no list of findings (a record made before v3.4.0 holds only a count); there is nothing to compare against`);
    if (typeof rec.version !== 'string' || !bare(rec.version)) throw new BadInput(`${key}: the kit's record in ${scansFile} states no scanner version`);
    if (kitRoot && !(fs.statSync(kitRoot, { throwIfNoEntry: false })?.isDirectory())) throw new BadInput(`--kit ${kitRoot} is not a folder: give the kit's copy of the item`);
    const report = reportFile === '-' ? piped : readJson(reportFile, 'report');
    if (!report || !Array.isArray(report.issues)) throw new BadInput(`the report ${reportName} has no issues list; make it with ${MAKE}`);
    if (!root) {
      const source = report.skill && typeof report.skill.source === 'string' ? report.skill.source : '';
      if (source && path.isAbsolute(source)) root = source;
      else if (report.issues.some((i) => path.isAbsolute(String(i?.location?.file ?? '')))) {
        throw new BadInput(`the report ${reportName} names files by absolute path and does not say which folder it scanned; give --root <item-folder>, the folder you scanned`);
      }
    }
    const found = findingsFromReport(report, root ?? process.cwd());
    const version = report.metadata && typeof report.metadata.skillspector_version === 'string' ? bare(report.metadata.skillspector_version) : '';
    const kit = bare(rec.version);
    const lines = [];
    if (!version) lines.push(`scanner version not stated in the report; the kit's record is v${kit}; counts may differ`);
    else if (version !== kit) lines.push(`scanner version v${version} differs from the kit's record v${kit}; counts may differ`);
    const mappings = new Map();
    const mappingOf = (file) => {
      if (!mappings.has(file)) {
        const k = readInside(kitRoot, file);
        const n = readInside(textRoot, file);
        mappings.set(file, k.why ? { why: `kit copy: ${k.why}` } : n.why ? { why: `installed copy: ${n.why}` } : lineMapping(k.buf, n.buf));
      }
      return mappings.get(file);
    };
    const c = kitRoot ? classifyMapped(rec.findings, found, mappingOf) : classifyFindings(rec.findings, found);
    lines.push(`known: ${c.known.length}, moved: ${c.moved.length}, reworded: ${c.reworded.length}, new: ${c.new.length}`);
    lines.push(verdictLine(report));
    if (kitRoot) {
      const byName = ([x], [y]) => (x < y ? -1 : x > y ? 1 : 0);
      for (const [file, m] of [...mappings].sort(byName)) if (m.why) lines.push(`no line map for ${file}: ${m.why}`);
    } else if (c.moved.length) {
      lines.push(UNPROVEN);
    }
    const cache = new Map();
    const kitCache = new Map();
    const text = (f) => { if (textRoot && f.line !== null) lines.push(lineText(textRoot, f.file, f.line, cache, 'line')); };
    const span = (f) => `${f.severity} ${f.rule} ${f.file}:${lineOf(f.from)}${ARROW}${lineOf(f.line)}`;
    for (const f of c.moved) { lines.push(`moved: ${span(f)}`); text(f); }
    for (const f of c.reworded) {
      lines.push(`reworded: ${span(f)}`);
      text(f);
      lines.push(lineText(kitRoot, f.file, f.from, kitCache, 'kit line'));
    }
    for (const f of c.new) lines.push(`new: ${f.severity} ${f.rule} ${where(f)}`);
    console.log(lines.join('\n'));
    const unproven = !kitRoot && c.moved.length;
    return unproven || c.reworded.length || c.new.length || version !== kit ? 1 : 0;
  } catch (e) {
    // Anything that stops the comparison is exit 2, never 1, so it cannot read as "new findings".
    console.error(e instanceof BadInput ? e.message : `cannot compare: ${e.message}`);
    return 2;
  }
}

// Node gives the started module its real path, links resolved (macOS keeps its temporary folder under /var,
// a link to /private/var), so the started path is compared the same way.
const started = () => { try { return pathToFileURL(fs.realpathSync(process.argv[1])).href; } catch { return ''; } };
if (process.argv[1] && import.meta.url === started()) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
}
