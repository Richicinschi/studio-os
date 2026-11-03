// tools/export/gates.mjs
// The export gates (secrets incl. gitleaks, privacy, paths, accounting, links) plus the --note and
// diagram-link checks. Each returns findings; any finding fails the export. Privacy findings name the
// deny-list position, never the term.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { findSecrets, findDenied, findPaths, fileKind, PATHS_ALLOW } from './rules.mjs';
import { isMenuItem } from './manifest.mjs';

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

export function gatePaths(root, allow = PATHS_ALLOW) {
  return textFiles(root).filter((r) => !EXEMPT.has(r)).flatMap((r) => {
    const text = read(root, r);
    const lines = text.split(/\r?\n/);
    return findPaths(text)
      .filter((f) => !allow.some((a) => a.file === r && (lines[f.line - 1] || '').includes(a.phrase)))
      .map((f) => `${r}:${f.line} ${f.reason}`);
  });
}

export function gateNotes(notes, deny) {
  return notes.flatMap((n, i) => [
    ...findDenied(n, deny).map((f) => `--note ${i + 1}: ${term(deny, f)}`),
    ...findPaths(n).map((f) => `--note ${i + 1}: ${f.reason}`),
    ...findSecrets(n).map((f) => `--note ${i + 1}: ${f.reason}`),
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

// A diagrams.net link carries the diagram compressed in its #R fragment, out of reach of every text
// gate; it passes only if it decodes to exactly the gated .drawio beside it.
// Every menu item has its hand-written adoption card, and every card belongs to a menu item.
export function gateCards(root, manifest) {
  const menu = manifest.items.filter(isMenuItem);
  const dir = path.join(root, 'cards');
  const cards = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];
  const ids = new Set(menu.map((it) => it.id));
  return [
    ...menu.filter((it) => !cards.includes(it.id)).map((it) => `cards/${it.id}.md: missing, the adoption card for ${it.kind}:${it.id}`),
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
