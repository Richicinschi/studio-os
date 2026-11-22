// tools/export/scan.mjs
// Runs SkillSpector (static, --no-llm, no cost) over every shipped and kit-only skill, every agent and every
// domain, and records each verdict and every finding in tools/export/scans.json; build.mjs writes them into
// each SOURCE.md, with the hash of the content each scan read (itemHash). --check scans the same items and
// compares their findings and hashes with scans.json, writing nothing.
//   node tools/export/scan.mjs [--check]
// SKILLSPECTOR_CMD, when set, is the scanner command used instead of `skillspector` (see scannerCommand).
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compareFindings } from '../scan-compare.mjs';
import { hashItem, isSkipped } from './item-hash.mjs';

// The report's verdict, as the scanner states it in risk_assessment: { score, recommendation }, each
// undefined when absent or of the wrong type. scan-compare's `report:` line reads it with this same function.
export function verdictFrom(json) {
  const r = json && typeof json === 'object' ? json.risk_assessment : undefined;
  const ok = r && typeof r === 'object';
  return {
    score: ok && typeof r.score === 'number' && Number.isFinite(r.score) ? r.score : undefined,
    recommendation: ok && typeof r.recommendation === 'string' && r.recommendation.trim() ? r.recommendation.trim() : undefined,
  };
}

// The findings of a report, one per entry in its issues list: { rule, file, line, severity }, from the
// issue's id, location.file, location.start_line (null when there is none) and severity. Everything else is
// dropped, the fields that vary between runs on the same input (the report's scanned_at, its absolute source
// path) with it. `file` is relative to the item's folder, with / between its parts; the list is sorted by
// file, line (no line first) and rule, then severity, so two scans of the same folder record the same list.
export function findingsFromReport(report, itemRoot) {
  const issues = Array.isArray(report && report.issues) ? report.issues : [];
  const rel = (file) => {
    const f = String(file ?? '');
    return (path.isAbsolute(f) ? path.relative(itemRoot, f) : f).split('\\').join('/').replace(/^\.\//, '');
  };
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  return issues.map((i) => {
    const loc = i?.location || {};
    return { rule: String(i?.id ?? ''), file: rel(loc.file), line: Number.isInteger(loc.start_line) ? loc.start_line : null, severity: String(i?.severity ?? '') };
  }).sort((a, b) => cmp(a.file, b.file) || (a.line ?? -1) - (b.line ?? -1) || cmp(a.rule, b.rule) || cmp(a.severity, b.severity));
}

// The anchor GitHub gives a heading: lower case, punctuation dropped, each space a hyphen.
export const triageAnchor = (heading) => heading.toLowerCase().replace(/[^\p{L}\p{M}\p{N} _-]/gu, '').replace(/ /g, '-');

// The rule, file and line a triage row names: the first word of its Finding cell (backticks dropped) and its
// File:line cell, `file:line`, or `file` alone for a finding the scanner gave no line.
function triageRow(finding, where, verdict) {
  const loc = (where || '').replace(/`/g, '').trim();
  const m = loc.match(/^(.*):(\d+)$/);
  return { rule: (finding || '').replace(/`/g, '').trim().split(/\s+/)[0], file: m ? m[1] : loc, line: m ? Number(m[2]) : null, verdict: verdict || '' };
}

// scan-triage.md holds one `### <key>: VERDICT, N/100` section (optionally `, K findings` after it) per item
// with findings, with tables `| Finding | File:line | Verdict | Why |`, one row per finding. Returns
// { key: { recommendation, score, count?, noFileLine?, rows: [{ rule, file, line, verdict }], anchor } }:
// `count` is the K a heading states, and `noFileLine` marks a section with a Verdict column but no
// File:line column; the triage gate checks both. A key with a second section is marked `duplicate` (the
// first section counts), and the triage gate fails it.
export function parseTriage(text) {
  const out = {};
  let cur = null;
  let cols = null;
  for (const line of text.split(/\r?\n/)) {
    if (/^#{1,3} /.test(line)) {
      const h = line.replace(/^#+ /, '').trim();
      const m = h.match(/^(.+?): ([A-Z_]+), (\d+)\/100(?:, (\d+) findings?)?$/);
      cols = null;
      cur = null;
      if (!m) continue;
      if (out[m[1]]) { out[m[1]].duplicate = true; continue; }
      cur = out[m[1]] = { recommendation: m[2], score: Number(m[3]), ...(m[4] === undefined ? {} : { count: Number(m[4]) }), rows: [], anchor: triageAnchor(h) };
      continue;
    }
    if (!cur || !line.startsWith('|')) { cols = line.startsWith('|') ? cols : null; continue; }
    const cells = line.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
    if (!cols) {
      cols = { finding: cells.indexOf('Finding'), where: cells.indexOf('File:line'), verdict: cells.indexOf('Verdict') };
      if (cols.verdict >= 0 && cols.where < 0) cur.noFileLine = true;
      continue;
    }
    if (cols.verdict < 0 || cells.every((c) => /^:?-+:?$/.test(c))) continue;
    cur.rows.push(triageRow(cells[cols.finding], cells[cols.where], cells[cols.verdict]));
  }
  return out;
}

// The kit's own skills: every folder under .claude/skills (drill-to-adopt, setup-workspace, vet-and-adopt).
// scanTargets scans them and buildKit gates them, both from this one list.
export function kitSkills(root) {
  const dir = path.join(root, '.claude', 'skills');
  return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : [];
}

// What the scan covers: every shipped skill, every kit skill, every shipped agent (one file, key
// `agent:<id>`), and every domain (a shipped pack) as one folder under the key `pack:<id>`. `dir` is the
// folder or file handed to the scanner.
export function scanTargets(root) {
  const under = (base) => {
    const dir = path.join(root, base);
    return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : [];
  };
  const folders = (base, key) => under(base).filter((e) => e.isDirectory()).map((e) => e.name).sort()
    .map((id) => ({ key: key(id), dir: path.join(root, base, id), label: `${base}/${id}` }));
  const agents = under('catalog/agents').filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => e.name).sort()
    .map((name) => ({ key: `agent:${name.slice(0, -3)}`, dir: path.join(root, 'catalog/agents', name), label: `catalog/agents/${name}` }));
  return [
    ...folders('catalog/skills', (id) => id),
    ...kitSkills(root).map((id) => ({ key: id, dir: path.join(root, '.claude/skills', id), label: `.claude/skills/${id}` })),
    ...agents,
    ...folders('catalog/packs', (id) => `pack:${id}`),
  ];
}

// The files of one scan target, relative to the kit's root with / between their parts: every file under
// its folder, or the one file of an agent, without the names the export never ships (SKIP_NAMES in
// item-hash.mjs), so the hash is of what ships.
export function itemFiles(root, target) {
  const rel = (p) => path.relative(root, p).split(path.sep).join('/');
  if (!statSync(target.dir).isDirectory()) return [rel(target.dir)];
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).filter((e) => !isSkipped(e.name))
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [rel(path.join(dir, e.name))]));
  return walk(target.dir).sort();
}

// The names in a target's folder that the export never ships (a .DS_Store, a __pycache__ folder), relative
// to the kit's root. The scanner would read them, and its findings would be recorded against files no
// adopter gets, so scan.mjs refuses such an item until they are deleted.
export function strayFiles(root, target) {
  const rel = (p) => path.relative(root, p).split(path.sep).join('/');
  if (!statSync(target.dir).isDirectory()) return [];
  const walk = (dir) => readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (isSkipped(e.name) ? [rel(path.join(dir, e.name))] : e.isDirectory() ? walk(path.join(dir, e.name)) : []));
  return walk(target.dir).sort();
}

// The hash of the content each target's scan reads: the hash changelog.mjs gives an item (item-hash.mjs),
// with the whole Last scan line of a SOURCE.md left out, since the export writes that line from the scan
// itself. scans.json records it as `itemHash`; --check and a release's triage gate compare it with the
// content as it is now.
export const scanItemHashes = (root, targets = scanTargets(root)) => Object.fromEntries(
  targets.map((t) => [t.key, hashItem(root, itemFiles(root, t), { scanNeutral: true })]),
);

// The scanner to run: SKILLSPECTOR_CMD when it is set, else `skillspector` on the PATH. The value is a
// command and its arguments split on spaces; "double" or 'single' quotes keep spaces (and backslashes, so
// Windows paths pass as they are). It is never handed to a shell, so ; | & $ are plain text.
export function scannerCommand(value) {
  const text = String(value ?? '').trim();
  if (!text) return ['skillspector'];
  const words = [];
  let word = null;
  let quote = null;
  for (const ch of text) {
    if (quote) { if (ch === quote) quote = null; else word += ch; continue; }
    if (ch === '"' || ch === '\'') { quote = ch; word ??= ''; continue; }
    if (/\s/.test(ch)) { if (word !== null) words.push(word); word = null; continue; }
    word = (word ?? '') + ch;
  }
  if (quote) throw new Error(`SKILLSPECTOR_CMD has an unclosed ${quote} quote`);
  if (word !== null) words.push(word);
  return words;
}

// One scan: the JSON report the scanner prints on stdout (v2.13.6 refuses --output on Windows), read
// whatever the exit code, since the scanner exits 1 for a verdict other than SAFE. Returns { report } or
// { error }. A report that suppressed findings is an error: they are missing from its issues list.
function scanOne([cmd, ...pre], { dir, label }) {
  const r = spawnSync(cmd, [...pre, 'scan', dir, '--no-llm', '--format', 'json'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: { ...process.env, PYTHONUTF8: '1' } });
  if (r.error) return { error: `${label}: cannot run the scanner (${r.error.code || r.error.message})` };
  let report;
  try { report = JSON.parse(r.stdout); } catch { return { error: `${label}: scan failed (exit ${r.status}), no JSON report on stdout ${(r.stderr || '').slice(-300)}` }; }
  const v = verdictFrom(report);
  if (v.score === undefined || v.recommendation === undefined || !Array.isArray(report.issues)) {
    return { error: `${label}: report has no score, recommendation or issues list (its top-level fields: ${Object.keys(report || {}).join(', ')}); adjust verdictFrom or findingsFromReport` };
  }
  if (report.suppressed_count) return { error: `${label}: the report suppressed ${report.suppressed_count} finding(s), which are missing from its issues list; scan without suppression and run again` };
  // A single file (an agent) is scanned from a copy in a temporary folder, which the report names as its
  // source; file paths are relative to the folder the report says it scanned.
  const source = report.skill && typeof report.skill.source === 'string' && path.isAbsolute(report.skill.source) ? report.skill.source : dir;
  return { report, verdict: v, findings: findingsFromReport(report, source) };
}

const USAGE = 'usage: node tools/export/scan.mjs [--check]';
const where = (x) => `${x.file}${x.line === null ? '' : `:${x.line}`}`;

// Record mode scans every target and writes each verdict, its findings and its itemHash to scans.json, and
// drops the record of any item that is no longer scanned, naming it. --check scans every target the same
// way and writes nothing; each difference with scans.json is one line: `<key>: new|gone <rule> <file>:<line>`
// for a finding, a severity changed on a finding at the same place, a verdict or score changed, a scanner
// version other than the recorded one, the item's content changed since its scan (itemHash), no record, or a
// record for an item no longer scanned. Either mode refuses an item whose folder holds a name the export
// never ships (strayFiles). Exit 0 when all match (or all were recorded), 1 on any difference or any item
// that could not be scanned or read, 2 when the scanner cannot be started at all or the arguments are wrong.
function main(argv) {
  if (argv.length > 1 || (argv.length === 1 && argv[0] !== '--check')) { console.error(USAGE); return 2; }
  const check = argv[0] === '--check';
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const file = path.join(root, 'tools/export/scans.json');
  const scans = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  let cmd;
  try { cmd = scannerCommand(process.env.SKILLSPECTOR_CMD); } catch (e) { console.error(e.message); return 2; }
  const ver = spawnSync(cmd[0], [...cmd.slice(1), '--version'], { encoding: 'utf8' });
  if (ver.error) { console.error(`cannot run the scanner ${cmd[0]} (${ver.error.code || ver.error.message}); install it (tools/export/scanner.json) or set SKILLSPECTOR_CMD`); return 2; }
  const version = (ver.stdout || '').trim().split(/\s+/).pop() || '';
  console.log(`scanner: SkillSpector ${version || '(no version printed)'}`);
  const today = new Date().toISOString().slice(0, 10);
  let failed = 0;
  let differences = 0;
  const targets = scanTargets(root);
  // Hashed before the scans: what the record ties each verdict to is the content as the scan found it.
  const hashes = scanItemHashes(root, targets);
  for (const t of targets) {
    const strays = strayFiles(root, t);
    if (strays.length) { console.error(`${t.label}: holds ${strays[0]}${strays.length > 1 ? ` and ${strays.length - 1} more` : ''}, which the export does not ship; delete it and scan again`); failed++; continue; }
    const s = scanOne(cmd, t);
    if (s.error) { console.error(s.error); failed++; continue; }
    const { verdict: v, findings } = s;
    if (!check) {
      scans[t.key] = { score: v.score, recommendation: v.recommendation, version, date: today, itemHash: hashes[t.key], findings };
      console.log(`${t.label}: ${v.recommendation} (${v.score}/100), ${findings.length} finding(s)`);
      continue;
    }
    const rec = Object.hasOwn(scans, t.key) ? scans[t.key] : undefined;
    if (!rec) { console.log(`${t.key}: not recorded in scans.json; scanned ${v.recommendation} (${v.score}/100), ${findings.length} finding(s)`); differences++; continue; }
    if (!Array.isArray(rec.findings)) { console.log(`${t.key}: the record in scans.json holds no list of findings; scanned ${findings.length} finding(s)`); differences++; continue; }
    const added = compareFindings(rec.findings, findings).new;
    const gone = compareFindings(findings, rec.findings).new;
    // Same places, so pair the two sorted lists and compare each finding's severity.
    const severities = added.length || gone.length || rec.findings.length !== findings.length ? [] : findings
      .map((f, i) => [f, rec.findings[i]]).filter(([f, r]) => f.severity !== r.severity)
      .map(([f, r]) => `${t.key}: ${f.rule} ${where(f)} is ${f.severity} now, recorded ${r.severity}`);
    const lines = [
      ...(rec.version === version ? [] : [`${t.key}: recorded with SkillSpector ${rec.version ?? 'no version'}, scanned with ${version || 'no version printed'}`]),
      ...(rec.recommendation === v.recommendation && rec.score === v.score ? [] : [`${t.key}: recorded ${rec.recommendation} (${rec.score}/100), scanned ${v.recommendation} (${v.score}/100)`]),
      ...added.map((f) => `${t.key}: new ${f.rule} ${where(f)}`),
      ...gone.map((f) => `${t.key}: gone ${f.rule} ${where(f)}`),
      ...severities,
      // The same findings on changed content: the triage was read against other text (an AE1 row's target
      // file, say, which keeps its finding at the linking line however it changes).
      ...(rec.itemHash === hashes[t.key] ? [] : [`${t.key}: the item changed since its scan (itemHash ${rec.itemHash ?? 'not recorded'}, now ${hashes[t.key]}); rescan and re-read its triage`]),
    ];
    for (const l of lines) console.log(l);
    differences += lines.length;
  }
  const scanned = new Set(targets.map((t) => t.key));
  const orphans = Object.keys(scans).filter((k) => !scanned.has(k)).sort();
  for (const k of orphans) {
    if (check) { console.log(`${k}: recorded in scans.json but no longer scanned`); differences++; } else { delete scans[k]; console.log(`${k}: no longer scanned; its record is dropped from scans.json`); }
  }
  if (check) {
    console.log(`checked ${targets.length - failed} of ${targets.length} item(s): ${differences} difference(s)${failed ? `, ${failed} not scanned` : ''}`);
    return differences || failed ? 1 : 0;
  }
  writeFileSync(file, `${JSON.stringify(scans, null, 2)}\n`);
  return failed ? 1 : 0;
}

// Node gives the started module its real path, links resolved (macOS keeps its temporary folder under /var,
// a link to /private/var), so the started path is compared the same way.
const started = () => { try { return pathToFileURL(realpathSync(process.argv[1])).href; } catch { return ''; } };
if (process.argv[1] && import.meta.url === started()) process.exitCode = main(process.argv.slice(2));
