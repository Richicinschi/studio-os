// tools/export/gates.mjs
// The export gates (secrets incl. gitleaks, privacy, paths, risky, studio blocks, studio markers, dangling names, JSON, accounting, links) plus
// the --note and diagram-link checks. Each returns findings; any finding fails the export. Privacy findings
// name the deny-list position, never the term.
import { spawnSync } from 'node:child_process';
import { closeSync, existsSync, mkdtempSync, openSync, readdirSync, readFileSync, readSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { findSecrets, findDenied, findPaths, findRisky, fileKind, PATHS_ALLOW, RISKY_ALLOW, findStudioMarkers, STUDIO_ALLOW, findMarkers, MARKERS_ALLOW } from './rules.mjs';
import { isMenuItem } from './manifest.mjs';

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

// A name the studio has but the kit does not ship, cited in inline code or [[linked]], points the adopter at
// nothing; so does any [[linked]] name the kit does not ship. Checked in every .md file under catalog/,
// fenced blocks (``` and ~~~) skipped; one finding per name per line. A private name (names.private) is
// reported without the name, which only the privacy list may hold, and no allow entry passes it.
export function gateNames(root, names, allow = NAMES_ALLOW) {
  const studio = new Set(names.studio);
  const shipped = new Set(names.shipped);
  const priv = new Set(names.private || []);
  const findings = [];
  for (const r of kitFiles(root).filter((f) => f.startsWith('catalog/') && /\.md$/i.test(f))) {
    let fence = null;
    read(root, r).split(/\r?\n/).forEach((line, i) => {
      const f = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
      if (fence) { if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2].trim()) fence = null; return; }
      // A backtick fence's info string holds no backtick: ```name``` on its own is inline code.
      if (f && !(f[1][0] === '`' && f[2].includes('`'))) { fence = f[1]; return; }
      const { code, linked } = citedNames(line);
      const found = [...code.filter((n) => (studio.has(n) || priv.has(n)) && !shipped.has(n)), ...linked.filter((n) => !shipped.has(n))];
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

// Every item that ships a SOURCE.md and whose last scan is not SAFE has exactly one section in scan-triage.md
// whose verdict, score and number of findings match that scan in scans.json, and whose rows add up to that
// number, each one FP or BY DESIGN. What it cannot see: a rescan whose findings change while their number,
// the verdict and the score stay the same. At a release, every such item must also have a scan.
export function gateTriage({ keys, scans, triage, release = false }) {
  const findings = [];
  for (const key of keys) {
    const s = scans[key];
    if (!s) { if (release) findings.push(`${key}: no scan in scans.json; a release ships only scanned items (node tools/export/scan.mjs)`); continue; }
    if (s.recommendation === 'SAFE') continue;
    const t = triage[key];
    const last = `last scan ${s.recommendation} (${s.score}/100)`;
    if (!t) { findings.push(`${key}: ${last}, and tools/export/scan-triage.md has no section for it; read every finding and add one`); continue; }
    if (t.duplicate) { findings.push(`${key}: tools/export/scan-triage.md has more than one section for it; keep one`); continue; }
    if (t.recommendation !== s.recommendation || t.score !== s.score) { findings.push(`${key}: ${last}, but its triage section is for ${t.recommendation} (${t.score}/100); triage the new scan`); continue; }
    if (s.findings === undefined) { findings.push(`${key}: scans.json records no number of findings for its last scan; run node tools/export/scan.mjs again`); continue; }
    if (s.findings !== t.findings) { findings.push(`${key}: the last scan has ${s.findings} findings, but its triage section is for ${t.findings}; triage the new scan`); continue; }
    const read = t.fp + t.byDesign + t.other;
    if (read !== t.findings) findings.push(`${key}: the triage reads ${read} of its ${t.findings} findings`);
    if (t.other) findings.push(`${key}: ${t.other} finding${t.other === 1 ? '' : 's'} judged neither FP nor BY DESIGN; a real finding is fixed or the item is withheld, never shipped`);
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
