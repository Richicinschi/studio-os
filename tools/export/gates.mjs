// tools/export/gates.mjs
// The export gates (secrets incl. gitleaks, privacy, paths, risky, studio blocks, studio markers, dangling names, JSON, accounting, links, scanner) plus
// the --note and diagram-link checks. Each returns findings; any finding fails the export. Privacy findings
// name the deny-list position, never the term.
import { spawnSync } from 'node:child_process';
import { closeSync, existsSync, mkdtempSync, openSync, readdirSync, readFileSync, readSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { findSecrets, findDenied, findPaths, findRisky, fileKind, PATHS_ALLOW, RISKY_ALLOW, findStudioMarkers, STUDIO_ALLOW, findMarkers, MARKERS_ALLOW } from './rules.mjs';
import { isMenuItem } from './manifest.mjs';
import { parseFrontmatter, splitFrontmatter } from './frontmatter.mjs';

export { MARKERS_ALLOW };

const SKIP_DIRS = new Set(['.git', 'node_modules']);
// The rule source itself spells out the patterns it looks for; every other file is checked.
const EXEMPT = new Set(['tools/export/rules.mjs']);

// The local files (deny list, owner name) never leave this machine and are never scanned or staged.
export const isLocalOnly = (rel) => /^tools\/export\/[^/]+\.local\.(?:txt|json)$/.test(rel);

export const HAND_WRITTEN = ['LICENSE', 'SECURITY.md', 'CONTRIBUTING.md', '.github/', 'START-HERE.md', 'ADOPT.md', 'README.md', 'PRINCIPLES.md', 'AGENTS.md', 'CLAUDE.md', 'CHANGELOG.md', 'package.json', '.gitignore', '.gitattributes', 'export.manifest.json',
  '.claude/', 'modules/', 'templates/', 'examples/', 'docs/', 'tools/', 'cards/'];

export function walkFiles(root, rel = '') {
  const out = [];
  for (const ent of readdirSync(path.join(root, rel), { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const r = rel ? `${rel}/${ent.name}` : ent.name;
    if (ent.isDirectory()) out.push(...walkFiles(root, r)); else out.push(r);
  }
  return out.sort();
}

const read = (root, r) => readFileSync(path.join(root, r), 'utf8');
const kindOf = (root, r) => fileKind(r, readFileSync(path.join(root, r)));
const kitFiles = (root) => walkFiles(root).filter((r) => !isLocalOnly(r));
const textFiles = (root) => kitFiles(root).filter((r) => kindOf(root, r) === 'text');

export function gateSecrets(root) {
  return textFiles(root).filter((r) => !EXEMPT.has(r))
    .flatMap((r) => findSecrets(read(root, r)).map((f) => `${r}:${f.line} ${f.reason}`));
}

export function gateGitleaks(root) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-gitleaks-'));
  const report = path.join(dir, 'report.json');
  try {
    const r = spawnSync('gitleaks', ['dir', root, '--no-banner', '--redact', '--exit-code', '1', '--log-level', 'error', '--report-format', 'json', '--report-path', report], { encoding: 'utf8' });
    if (r.error) return [`gitleaks could not run (${r.error.code}): install it, or pass --no-gitleaks for a local dry run only`];
    if (r.status === 0) return [];
    let leaks = [];
    try { leaks = JSON.parse(readFileSync(report, 'utf8')); } catch { /* no report: fall through */ }
    if (!leaks.length) return [`gitleaks failed (exit ${r.status}): ${`${r.stdout}\n${r.stderr}`.trim().split('\n').slice(-3).join(' | ')}`];
    return leaks.map((l) => `${path.relative(root, path.resolve(root, l.File)).split(path.sep).join('/')}:${l.StartLine} gitleaks ${l.RuleID}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const term = (deny, f) => `denied term #${deny.indexOf(f.term) + 1}`;

export function gatePrivacy(root, deny) {
  return kitFiles(root).flatMap((r) => [
    ...findDenied(r, deny).map((f) => `${r}: file name has ${term(deny, f)}`),
    ...(kindOf(root, r) === 'text' ? findDenied(read(root, r), deny).map((f) => `${r}:${f.line} ${term(deny, f)}`) : []),
  ]);
}

// Per-line findings in every text file but rules.mjs, less those whose line holds an allowed phrase of that file.
function gateLines(root, find, allow) {
  return textFiles(root).filter((r) => !EXEMPT.has(r)).flatMap((r) => {
    const text = read(root, r);
    const lines = text.split(/\r?\n/);
    return find(text, r)
      .filter((f) => !allow.some((a) => a.file === r && (lines[f.line - 1] || '').includes(a.phrase)))
      .map((f) => `${r}:${f.line} ${f.reason}`);
  });
}

export const gatePaths = (root, allow = PATHS_ALLOW) => gateLines(root, findPaths, allow);

export const gateRisky = (root, allow = RISKY_ALLOW) => gateLines(root, findRisky, allow);

// The build cuts the studio's own blocks from shipped Markdown; any marker word still in a text file fails.
export const gateStudioBlocks = (root, allow = STUDIO_ALLOW) => gateLines(root, findStudioMarkers, allow);

// Studio words (the hub, hard rule, G1 to G8 …) in any text file under catalog/; findMarkers skips the rest.
export const gateMarkers = (root, allow = MARKERS_ALLOW) => gateLines(root, findMarkers, allow);

// Names from outside the studio that a shipped file may use although the studio has an item of that name:
// { file, name, why }. An entry passes only that name, only in that file.
export const NAMES_ALLOW = [];

// The inline-code spans of one line: a run of n backticks up to the next run of exactly n; a run with no
// partner is plain text. Each span's content is trimmed.
function codeSpans(line) {
  const spans = [];
  const runs = [...line.matchAll(/`+/g)];
  for (let i = 0; i < runs.length; i++) {
    const j = runs.findIndex((r, k) => k > i && r[0].length === runs[i][0].length);
    if (j < 0) continue;
    const start = runs[i].index + runs[i][0].length;
    spans.push({ from: runs[i].index, to: runs[j].index + runs[j][0].length, text: line.slice(start, runs[j].index).trim() });
    i = j;
  }
  return spans;
}

// The names one line of Markdown cites: inline code whose whole content (a leading / dropped, as in a slash
// command) is a name, and each [[name]] or [[name|label]] outside inline code.
function citedNames(line) {
  const spans = codeSpans(line);
  let prose = line;
  for (const s of [...spans].reverse()) prose = `${prose.slice(0, s.from)} ${prose.slice(s.to)}`;
  return {
    code: spans.map((s) => s.text.replace(/^\//, '')),
    linked: [...prose.matchAll(/\[\[([^\]\n]+?)\]\]/g)].map((m) => m[1].split('|')[0].trim()),
  };
}

// A name as a whole word of plain text, in any case: a letter, digit, _ or - next to it makes it part of
// a longer word (save-sessions, pre-save-session, save-session-notes).
const wordRe = (n) => new RegExp(`(?<![\\p{L}\\p{N}_-])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}_-])`, 'iu');

// The names in `candidates` that the front matter's description holds as plain text, each with its line
// in the file: the first line of the description that holds it, else the `description:` line itself.
function descriptionNames(text, candidates) {
  const { raw } = splitFrontmatter(text);
  if (raw === null) return [];
  const { data } = parseFrontmatter(text);
  const desc = data && typeof data.description === 'string' ? data.description : '';
  if (!desc) return [];
  const lines = raw.split('\n');
  const at = lines.findIndex((l) => /^description:/.test(l));
  if (at < 0) return [];
  let end = at + 1;
  while (end < lines.length && (!lines[end].trim() || /^\s/.test(lines[end]))) end++;
  return candidates.filter((n) => wordRe(n).test(desc)).map((n) => {
    const k = lines.slice(at, end).findIndex((l) => wordRe(n).test(l));
    // Line 1 of the file is the opening ---, so front matter line j is file line j + 2.
    return { name: n, line: at + (k < 0 ? 0 : k) + 2 };
  });
}

// The number of > that open a line: its blockquote depth.
const quoteDepth = (line) => (line.match(/^\s*(?:>\s*)*/)[0].match(/>/g) || []).length;

// A name the studio has but the kit does not ship, cited in inline code or [[linked]], points the adopter at
// nothing; so does any [[linked]] name the kit does not ship, and any such studio name the front matter's
// description holds as plain text (a whole word, in any case). In a description a studio name counts only
// with a hyphen in it: a one-word name (launch, pricing) is ordinary prose there. A private name counts at
// any shape. Checked in every .md file under catalog/, fenced blocks (``` and ~~~) skipped; a fence opened
// in a > blockquote closes on a fence line at the same depth, or ends with its blockquote (a later line
// with fewer >), and a quoted fence line inside an unquoted fence is its text. One finding per name per
// line. A private name (names.private) is reported without the name, which only the privacy list may
// hold, and no allow entry passes it.
export function gateNames(root, names, allow = NAMES_ALLOW) {
  const studio = new Set(names.studio);
  const shipped = new Set(names.shipped);
  const priv = new Set(names.private || []);
  const described = [...new Set([...[...studio].filter((n) => n.includes('-')), ...priv])].filter((n) => !shipped.has(n));
  const findings = [];
  for (const r of kitFiles(root).filter((f) => f.startsWith('catalog/') && /\.md$/i.test(f))) {
    const text = read(root, r);
    const inDescription = descriptionNames(text, described);
    let fence = null;
    text.split(/\r?\n/).forEach((line, i) => {
      const f = line.match(/^\s*(?:>\s*)*(`{3,}|~{3,})(.*)$/);
      const depth = quoteDepth(line);
      if (fence && depth < fence.depth) fence = null;
      if (fence) {
        if (f && depth === fence.depth && f[1][0] === fence.mark[0] && f[1].length >= fence.mark.length && !f[2].trim()) fence = null;
        return;
      }
      // A backtick fence's info string holds no backtick: ```name``` on its own is inline code.
      if (f && !(f[1][0] === '`' && f[2].includes('`'))) { fence = { mark: f[1], depth }; return; }
      const { code, linked } = citedNames(line);
      const found = [...code.filter((n) => (studio.has(n) || priv.has(n)) && !shipped.has(n)), ...linked.filter((n) => !shipped.has(n)),
        ...inDescription.filter((d) => d.line === i + 1).map((d) => d.name)];
      for (const n of new Set(found)) {
        if (priv.has(n)) findings.push(`${r}:${i + 1} names a private studio item (on the private list, private.local.txt, or in a hub pack whose pack.json says public: false)`);
        else if (!allow.some((a) => a.file === r && a.name === n)) findings.push(`${r}:${i + 1} names ${n}, which the kit does not ship`);
      }
    });
  }
  return findings;
}

// Every .json file the kit ships parses. A leading byte order mark is a finding too: JSON.parse refuses it,
// and the parser message would print the invisible character, so it gets its own message.
export function gateJson(root) {
  return kitFiles(root).filter((r) => r.endsWith('.json')).flatMap((r) => {
    const text = read(root, r);
    if (text.startsWith('\uFEFF')) return [`${r}: not valid JSON (starts with a byte order mark, U+FEFF)`];
    try { JSON.parse(text); return []; } catch (e) { return [`${r}: not valid JSON (${e.message})`]; }
  });
}

// The files under each of dirs (a folder or a single file; one that is missing is skipped) whose first two
// bytes are #!, relative to root with /, sorted. Only those two bytes are read.
export function shebangFiles(root, dirs) {
  const head = Buffer.alloc(2);
  const starts = (r) => {
    const fd = openSync(path.join(root, r), 'r');
    try { return readSync(fd, head, 0, 2, 0) === 2 && head[0] === 0x23 && head[1] === 0x21; } finally { closeSync(fd); }
  };
  const under = (d) => {
    if (!existsSync(path.join(root, d))) return [];
    return statSync(path.join(root, d)).isDirectory() ? walkFiles(root, d) : [d];
  };
  return dirs.flatMap(under).filter(starts).sort();
}

// A note becomes changelog text after the gates have run, so it is held to the same rules first.
export function gateNotes(notes, deny) {
  return notes.flatMap((n, i) => [
    ...findDenied(n, deny).map((f) => `--note ${i + 1}: ${term(deny, f)}`),
    ...findPaths(n).map((f) => `--note ${i + 1}: ${f.reason}`),
    ...findSecrets(n).map((f) => `--note ${i + 1}: ${f.reason}`),
    ...findStudioMarkers(n).map((f) => `--note ${i + 1}: ${f.reason}`),
  ]);
}

export function gateAccounting(root, { written, notices, manifest }) {
  const gen = new Set(written);
  const findings = [];
  for (const r of kitFiles(root)) {
    if (r.startsWith('catalog/') && !gen.has(r)) { findings.push(`${r}: in catalog/ but not produced by this export`); continue; }
    if (kindOf(root, r) === 'unknown') findings.push(`${r}: neither UTF-8 text nor a known binary type`);
    if (!gen.has(r) && !HAND_WRITTEN.some((h) => (h.endsWith('/') ? r.startsWith(h) : r === h))) findings.push(`${r}: not produced by the export and not in a hand-written location`);
  }
  for (const n of notices) if (!n.licenceFile) findings.push(`catalog/skills/${n.id}: third-party skill shipped without a licence file`);
  for (const it of manifest.items) if (it.kind === 'external' && (!it.upstream || !it.licence)) findings.push(`${it.id}: external item without upstream or licence`);
  return findings;
}

// Exact-case existence inside the kit: Windows and macOS file systems ignore case, Linux and GitHub do not.
function existsExact(root, abs) {
  const rel = path.relative(root, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return false;
  let dir = root;
  for (const seg of rel.split(path.sep).filter(Boolean)) {
    if (!existsSync(dir) || !readdirSync(dir).includes(seg)) return false;
    dir = path.join(dir, seg);
  }
  return true;
}

export function gateLinks(root) {
  const findings = [];
  for (const r of walkFiles(root).filter((f) => f.endsWith('.md'))) {
    // Only rendered links count: code blocks, inline code and HTML comments are skipped.
    const text = read(root, r).replace(/```[\s\S]*?```/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/`[^`\n]*`/g, '');
    for (const m of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = m[1];
      if (/^(https?:|mailto:|#)/i.test(target) || target.startsWith('<')) continue;
      let clean = target.split('#')[0];
      try { clean = decodeURIComponent(clean); } catch { /* keep the raw target */ }
      if (clean && !existsExact(root, path.resolve(root, path.dirname(r), clean))) findings.push(`${r}: broken link -> ${target}`);
    }
  }
  return findings;
}

// Every item that ships a SOURCE.md and whose last scan in scans.json recorded any finding (whatever its
// verdict, SAFE included) has exactly one section in scan-triage.md, for the same verdict and score, whose
// rows match the recorded findings one to one by rule, file and line: a finding with no row fails, a row
// with no finding fails, and so does a row judged anything but FP or BY DESIGN. A finding recorded twice
// needs two rows. A heading's ", K findings" must match its row count, and a table with a Verdict column
// but no File:line column fails as a whole. At a release, every such item must also have a scan, and every
// scan must be of the content that ships: `hashes` holds each item's hash as the export built it
// (scanItemHashes in scan.mjs), and an item whose recorded itemHash differs or is missing, or that the
// export could not hash at all, fails, whatever its verdict. A triage row can rest on text away from its line (an AE1 row's target file, the part of a
// file the scanner read only in part), which a change can reach without moving any finding. A dry run does
// not compare hashes: it has to write the changed catalog so that it can be scanned.
const where = (x) => `${x.rule} ${x.file}${x.line === null ? '' : `:${x.line}`}`;
const matchKey = (x) => `${x.rule}|${x.file}|${x.line}`;

export function gateTriage({ keys, scans, triage, release = false, hashes }) {
  const findings = [];
  for (const key of keys) {
    const s = scans[key];
    if (!s) { if (release) findings.push(`${key}: no scan in scans.json; a release ships only scanned items (node tools/export/scan.mjs)`); continue; }
    if (release) {
      if (!hashes || !Object.hasOwn(hashes, key)) { findings.push(`${key}: the export could not hash it, so its scan cannot be tied to what ships`); continue; }
      if (!s.itemHash) { findings.push(`${key}: scans.json records no itemHash for its last scan; rescan it (node tools/export/scan.mjs)`); continue; }
      if (s.itemHash !== hashes[key]) { findings.push(`${key}: the item changed since its scan; rescan and re-read its triage`); continue; }
    }
    if (!Array.isArray(s.findings)) { findings.push(`${key}: scans.json records no list of findings for its last scan; run node tools/export/scan.mjs again`); continue; }
    if (s.recommendation === 'SAFE' && !s.findings.length) continue;
    const t = triage[key];
    const last = `last scan ${s.recommendation} (${s.score}/100)`;
    if (!t) { findings.push(`${key}: ${last}, and tools/export/scan-triage.md has no section for it; read every finding and add one`); continue; }
    if (t.duplicate) { findings.push(`${key}: tools/export/scan-triage.md has more than one section for it; keep one`); continue; }
    if (t.noFileLine) { findings.push(`the triage table for ${key} has no File:line column`); continue; }
    if (t.recommendation !== s.recommendation || t.score !== s.score) { findings.push(`${key}: ${last}, but its triage section is for ${t.recommendation} (${t.score}/100); triage the new scan`); continue; }
    if (t.count !== undefined && t.count !== t.rows.length) findings.push(`${key}: heading says ${t.count} findings, the section has ${t.rows.length} rows`);
    const unmatched = [...t.rows];
    for (const f of s.findings) {
      const i = unmatched.findIndex((r) => matchKey(r) === matchKey(f));
      if (i >= 0) unmatched.splice(i, 1); else findings.push(`${key}: finding ${where(f)} has no triage row`);
    }
    for (const r of unmatched) findings.push(`${key}: triage row ${where(r)} matches no recorded finding`);
    for (const r of t.rows.filter((x) => x.verdict !== 'FP' && x.verdict !== 'BY DESIGN')) {
      findings.push(`${key}: triage row ${where(r)} is judged ${r.verdict || 'nothing'}, neither FP nor BY DESIGN; a real finding is fixed or the item is withheld, never shipped`);
    }
  }
  return findings;
}

// Quoted upstream text that names the scanner without the pin: { file, phrase, why }, like the kit's other
// allow lists. An occurrence passes only when it lies inside that phrase, in that file; an entry whose
// phrase is gone from its file (the file still there) is a finding, so a removed quote leaves no standing
// allowance. Keyed by phrase, not line, so an edit elsewhere in the file does not move it.
export const SCANNER_ALLOW = [
  { file: 'docs/facts.md', phrase: 'The README\'s install is `uv tool install git+https://github.com/NVIDIA/skillspector.git`', why: 'quotes the upstream README\'s install line, as a fact about the README, not as a line to run' },
];

// The scanner is installed or run from one source only: the git URL at the full pinned commit in
// scanner.json's install line. The gate is an allow list, read one line at a time (scannerLineHits):
//  1. Every URL (any scheme or host, `git@host:` forms included), read with its percent-escapes decoded,
//     whose last path segment starts with `skillspector` (the repository, with or without `.git` and an
//     `@<rev>`, or a wheel or sdist file), or that points into `NVIDIA/SkillSpector/archive`, must be
//     exactly that URL. A plain page link, `https://github.com/NVIDIA/SkillSpector` and pages under it,
//     passes.
//  2. A `skillspector` word outside such a URL fails when it names a version (==, >=, <=, ~=, !=, <, > or
//     an @ not followed by the pinned URL), stands alone as a requirement line, or is the argument of
//     install, add, run, upgrade, download, wheel, uvx, --with or --from (`--from=` split) in a command
//     (pip, python, py, pipx, uv, uvx, poetry, conda, mamba, pdm, rye, hatch) with no pinned URL in between.
// The name is not on PyPI (2026-11-22), so any install by name gets whatever code a later owner of the name
// publishes. What one line cannot show (a command continued on the next line, a requirements file) is
// listed in docs/MAINTAINING.md.
const URL_LIKE = /(?:\b[a-z][\w+.-]*:\/\/|\b[\w.-]+@[\w.-]+:|\b(?:[\w-]+\.)+[a-z]{2,}\/)[^\s`"'<>()[\]]*/gi;
const SCANNER_REPO_URL = /\/skillspector[^/?#\s]*(?:[#?].*)?$|:[\w.-]*\/?skillspector(?:\.git)?(?:@[^/\s]*)?$|\/nvidia\/skillspector\/archive(?:\/|$)/i;
const PLAIN_PAGE = /^https:\/\/github\.com\/nvidia\/skillspector$/i;
const SCANNER_COMMANDS = new Set(['pip', 'pip3', 'python', 'python3', 'py', 'pipx', 'uv', 'uvx', 'poetry', 'conda', 'mamba', 'pdm', 'rye', 'hatch']);
const SCANNER_VERBS = new Set(['install', 'add', 'run', 'upgrade', 'download', 'wheel', 'uvx', '--with', '--from']);
const PINNED_MARK = '\u0001';
const OTHER_MARK = '\u0002';

// Each hit on one line: { index, length } in the line's own text.
function scannerLineHits(line, pinnedUrl) {
  const hits = [];
  // Rule 1, and a masked copy of the line: the pinned URL becomes PINNED_MARKs, any other URL OTHER_MARKs,
  // so a name inside a URL is never read as a word.
  let masked = line;
  for (const m of line.matchAll(URL_LIKE)) {
    const url = m[0].replace(/[.,;:]+$/, '');
    const isPinned = url.toLowerCase() === pinnedUrl.toLowerCase();
    let plain = url; // %73killspector is skillspector to pip and git
    try { plain = decodeURIComponent(url); } catch { /* a malformed escape: read the URL as written */ }
    if (!isPinned && SCANNER_REPO_URL.test(plain) && !PLAIN_PAGE.test(plain)) hits.push({ index: m.index, length: url.length });
    masked = masked.slice(0, m.index) + (isPinned ? PINNED_MARK : OTHER_MARK).repeat(url.length) + masked.slice(m.index + url.length);
  }
  // Rule 2: words, in segments split at a backtick, a pipe, ; and &&.
  const words = [];
  for (const m of masked.matchAll(/\S+/g)) {
    const raw = m[0];
    const opens = /^[`]/.test(raw);
    const closes = /[`]$/.test(raw) && raw.length > 1;
    const clean = raw.replace(/^[`"'(!$>]+/, '').replace(/[`"'),;:]+$/, '').replace(/\.$/, '');
    if (opens || raw === '|' || raw === ';' || raw === '&&' || raw === '||') words.push({ boundary: true });
    if (/^--(?:from|with)=/i.test(clean)) {
      const eq = clean.indexOf('=');
      words.push({ w: clean.slice(0, eq), index: m.index, length: raw.length, prose: false });
      words.push({ w: clean.slice(eq + 1), index: m.index, length: raw.length, prose: false });
    } else if (clean) words.push({ w: clean, index: m.index, length: raw.length, prose: /[,;:)]$/.test(raw.replace(/`+$/, '')) });
    if (closes) words.push({ boundary: true });
  }
  const isPinned = (w) => w.startsWith(PINNED_MARK);
  const trimmed = line.trim().replace(/^[-*]\s+/, '');
  for (let i = 0; i < words.length; i++) {
    const t = words[i];
    if (t.boundary) continue;
    const m = t.w.match(/^skillspector(?:\[[^\]]*\])?(.*)$/i);
    if (!m) continue;
    const rest = m[1];
    const next = words[i + 1] && !words[i + 1].boundary ? words[i + 1].w : '';
    const after = words[i + 2] && !words[i + 2].boundary ? words[i + 2].w : '';
    let bad = false;
    if (rest.startsWith('@')) bad = !isPinned(rest.slice(1) || after);
    else if (/^(?:===|==|>=|<=|~=|!=|<|>)/.test(rest)) bad = true;
    else if (/^\.git\b/i.test(rest)) bad = true;
    else if (next === '@') bad = !isPinned(after);
    else if (/^(?:===|==|>=|<=|~=|!=|<|>)/.test(next)) bad = true;
    else if (/^skillspector(?:\[[^\]]*\])?$/i.test(trimmed)) bad = true;
    else {
      // The argument of a verb in a command, with no pinned URL in between.
      let command = false;
      let verb = false;
      for (let j = i - 1; j >= 0; j--) {
        const p = words[j];
        if (p.boundary) break;
        if (isPinned(p.w)) break;
        if (p.prose && !/^\d/.test(p.w)) break;
        const lw = p.w.toLowerCase();
        if (SCANNER_VERBS.has(lw)) verb = true;
        if (SCANNER_COMMANDS.has(lw)) command = true;
      }
      bad = verb && command;
    }
    if (bad) hits.push({ index: t.index, length: t.length });
  }
  return hits;
}

// One scanner for the whole kit, pinned in tools/export/scanner.json. Every install or run of it
// (scannerLineHits) in a Markdown or JSON file outside catalog/ must be the pinned git URL, so every install
// line gets the same scanner; one finding per line. Every entry in scans.json must record scanner.version. Findings
// name the file and line, never the line's text.
export function gateScanner(root, scanner, scans, allow = SCANNER_ALLOW) {
  const findings = [];
  // The pinned URL is the one in scanner.json's install line, so a moved repository is one edit there, plus
  // PLAIN_PAGE and the archive alternative of SCANNER_REPO_URL, which name the repository's page (until then a
  // link to the new page is flagged, which fails closed).
  const pinnedUrl = String(scanner.install ?? '').match(/\bgit\+\S+/)?.[0] ?? '';
  if (!scanner.commit || !pinnedUrl.endsWith(`@${scanner.commit}`)) findings.push('tools/export/scanner.json: the install line has no git URL at the pinned commit');
  const files = kitFiles(root).filter((f) => !f.startsWith('catalog/') && /\.(?:md|json)$/i.test(f));
  for (const r of files) {
    read(root, r).split(/\r?\n/).forEach((line, i) => {
      const allowed = (idx, len) => allow.some((a) => a.file === r && [...line.matchAll(new RegExp(a.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))]
        .some((p) => idx >= p.index && idx + len <= p.index + p[0].length));
      if (scannerLineHits(line, pinnedUrl).some((h) => !allowed(h.index, h.length))) {
        findings.push(`${r}:${i + 1} a SkillSpector install not pinned to ${scanner.version} by its full commit; use the install line in tools/export/scanner.json`);
      }
    });
  }
  for (const a of allow) {
    if (existsSync(path.join(root, a.file)) && !read(root, a.file).includes(a.phrase)) {
      findings.push(`${a.file}: a SCANNER_ALLOW entry's phrase is no longer in the file; remove the entry from gates.mjs`);
    }
  }
  for (const [key, s] of Object.entries(scans)) {
    if (s?.version !== scanner.version) findings.push(`tools/export/scans.json: ${key} was scanned with ${s?.version ?? 'no recorded version'}, but tools/export/scanner.json pins ${scanner.version}; rescan it (node tools/export/scan.mjs)`);
  }
  return findings;
}

// A diagrams.net link carries the diagram compressed in its #R fragment, out of reach of every text
// gate; it passes only if it decodes to exactly the gated .drawio beside it.
// Every menu item has its hand-written adoption card, and every card belongs to a menu item.
export function gateCards(root, manifest) {
  // Menu items have a card named for the item; a shipped pack has `pack-<id>`.
  const wanted = [...manifest.items.filter(isMenuItem).map((it) => ({ file: it.id, label: `${it.kind}:${it.id}` })),
    ...manifest.items.filter((it) => it.kind === 'pack' && it.status === 'shipped').map((it) => ({ file: `pack-${it.id}`, label: `pack:${it.id}` }))];
  const dir = path.join(root, 'cards');
  const cards = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];
  const ids = new Set(wanted.map((w) => w.file));
  return [
    ...wanted.filter((w) => !cards.includes(w.file)).map((w) => `cards/${w.file}.md: missing, the adoption card for ${w.label}`),
    ...cards.filter((c) => !ids.has(c)).sort().map((c) => `cards/${c}.md: a card for no menu item`),
  ];
}

export function gateDiagramUrls(root) {
  const findings = [];
  for (const r of kitFiles(root).filter((f) => f.endsWith('.url.txt'))) {
    const src = r.replace(/\.url\.txt$/, '.drawio');
    const m = read(root, r).match(/#R(\S+)/);
    if (!m || !existsSync(path.join(root, src))) { findings.push(`${r}: no #R payload, or no ${src} beside it`); continue; }
    let xml;
    try { xml = decodeURIComponent(inflateRawSync(Buffer.from(decodeURIComponent(m[1]), 'base64')).toString('utf8')); } catch { findings.push(`${r}: payload does not decode`); continue; }
    if (xml.replace(/\r\n/g, '\n') !== read(root, src).replace(/\r\n/g, '\n')) findings.push(`${r}: payload differs from ${src}; regenerate the link`);
  }
  return findings;
}
