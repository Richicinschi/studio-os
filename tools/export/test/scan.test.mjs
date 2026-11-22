// tools/export/test/scan.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdictFrom, findingsFromReport, parseTriage, triageAnchor, scanTargets, kitSkills, scannerCommand, scanItemHashes, itemFiles, strayFiles } from '../scan.mjs';

// One rule for the verdict, the one scan-compare's `report:` line uses: risk_assessment's recommendation
// (a non-empty string) and score (a finite number), nothing read from anywhere else in the report.
test('verdictFrom reads risk_assessment only, as the report: line does', () => {
  assert.deepEqual(verdictFrom({ risk_assessment: { score: 12, severity: 'LOW', recommendation: 'CAUTION' } }), { score: 12, recommendation: 'CAUTION' });
  assert.deepEqual(verdictFrom({ issues: [{ score: 5, recommendation: 'X' }], risk_assessment: { score: 60, recommendation: 'DO_NOT_INSTALL' } }), { score: 60, recommendation: 'DO_NOT_INSTALL' });
  const none = { score: undefined, recommendation: undefined };
  assert.deepEqual(verdictFrom({ summary: { risk_score: 12, recommendation: 'REVIEW' } }), none);
  assert.deepEqual(verdictFrom({ risk_assessment: { recommendation: 'SAFE' } }), { score: undefined, recommendation: 'SAFE' });
  assert.deepEqual(verdictFrom({ risk_assessment: { score: '0', recommendation: ' ' } }), none);
  assert.deepEqual(verdictFrom(null), none);
});

const TRIAGE = [
  '# Scan triage', '', 'Intro.', '', '## Run of 2026-11-09', '',
  '### alpha: DO_NOT_INSTALL, 100/100', '',
  '| Finding | File:line | Verdict | Why |', '|---|---|---|---|',
  '| LP3 no declared permissions | `SKILL.md:1` | BY DESIGN | It runs scripts. |',
  '| PE3 credential access | `scripts/x.cjs:5` | FP | `a \\|\\| b` reads a display name. |',
  '| `RA2` session persistence | `s.sh:2` | BY DESIGN | A local server. |',
  '| RA2 session persistence | `s.sh:2` | BY DESIGN | The same line, found twice. |',
  '| SC1 no line | `refs/a.md` | FP | The scanner gave no line. |', '',
  'Hand sweep: read everything. | not a table row', '',
  '### pack:some-domain: CAUTION, 25/100', '',
  '| Finding | File:line | Verdict | Why |', '|---|---|---|---|',
  '| TM1 tool parameter abuse | `skills/a.md:4` | REAL | Something to stop on. |', '',
  '### One thing to know', '',
  '| Finding | File:line | Verdict | Why |', '|---|---|---|---|',
  '| X | `y:1` | FP | Not in any item section. |', '',
].join('\n');

test('parseTriage reads each item section: verdict, score, and one row per finding with its rule, file, line and verdict', () => {
  const t = parseTriage(TRIAGE);
  assert.deepEqual(Object.keys(t), ['alpha', 'pack:some-domain']);
  assert.deepEqual(t.alpha, {
    recommendation: 'DO_NOT_INSTALL', score: 100, anchor: 'alpha-do_not_install-100100',
    rows: [
      { rule: 'LP3', file: 'SKILL.md', line: 1, verdict: 'BY DESIGN' },
      { rule: 'PE3', file: 'scripts/x.cjs', line: 5, verdict: 'FP' },
      { rule: 'RA2', file: 's.sh', line: 2, verdict: 'BY DESIGN' },
      { rule: 'RA2', file: 's.sh', line: 2, verdict: 'BY DESIGN' },
      { rule: 'SC1', file: 'refs/a.md', line: null, verdict: 'FP' },
    ],
  });
  assert.deepEqual(t['pack:some-domain'], { recommendation: 'CAUTION', score: 25, anchor: 'packsome-domain-caution-25100', rows: [{ rule: 'TM1', file: 'skills/a.md', line: 4, verdict: 'REAL' }] });
});

test('parseTriage reads a heading that carries a count of findings, and keeps the count', () => {
  const t = parseTriage(['### beta: CAUTION, 25/100, 1 finding', '', '| Finding | File:line | Verdict | Why |', '|---|---|---|---|', '| TM1 x | `a.md:3` | FP | y |', ''].join('\n'));
  assert.deepEqual(t.beta, { recommendation: 'CAUTION', score: 25, count: 1, anchor: 'beta-caution-25100-1-finding', rows: [{ rule: 'TM1', file: 'a.md', line: 3, verdict: 'FP' }] });
});

test('findingsFromReport keeps rule, file, line and severity of each issue, with / separators, relative to the item, sorted by file, line and rule', () => {
  const root = path.join(os.tmpdir(), 'kit-item');
  const report = (scannedAt) => ({
    skill: { name: 'item', source: root, scanned_at: scannedAt },
    risk_assessment: { score: 100, severity: 'CRITICAL', recommendation: 'DO_NOT_INSTALL' },
    issues: [
      { id: 'TM1', severity: 'HIGH', confidence: 0.9, location: { file: 'scripts\\stop.sh', start_line: 30, end_line: null }, code_snippet: 'rm -f x' },
      { id: 'PE3', severity: 'HIGH', location: { file: path.join(root, 'scripts', 'server.cjs'), start_line: 509, end_line: null } },
      { id: 'RA2', severity: 'MEDIUM', location: { file: 'scripts\\stop.sh', start_line: 30, end_line: 31 } },
      { id: 'LP3', severity: 'MEDIUM', location: { file: 'SKILL.md', start_line: 1, end_line: null } },
      { id: 'TM1', severity: 'HIGH', location: { file: 'scripts/stop.sh', start_line: 5, end_line: null } },
      { id: 'SC1', severity: 'LOW', location: { file: 'scripts\\stop.sh' } },
    ],
  });
  const want = [
    { rule: 'LP3', file: 'SKILL.md', line: 1, severity: 'MEDIUM' },
    { rule: 'PE3', file: 'scripts/server.cjs', line: 509, severity: 'HIGH' },
    { rule: 'SC1', file: 'scripts/stop.sh', line: null, severity: 'LOW' },
    { rule: 'TM1', file: 'scripts/stop.sh', line: 5, severity: 'HIGH' },
    { rule: 'RA2', file: 'scripts/stop.sh', line: 30, severity: 'MEDIUM' },
    { rule: 'TM1', file: 'scripts/stop.sh', line: 30, severity: 'HIGH' },
  ];
  assert.deepEqual(findingsFromReport(report('2026-11-21T10:00:00+00:00'), root), want);
  assert.deepEqual(findingsFromReport(report('2026-11-22T11:00:00+00:00'), root), want);
  assert.deepEqual(findingsFromReport({ risk_assessment: {} }, root), []);
});

test('parseTriage marks an item whose section appears twice, and keeps the first section\'s rows', () => {
  const text = ['### beta: CAUTION, 25/100', '', '| Finding | File:line | Verdict | Why |', '|---|---|---|---|', '| X | `a:1` | FP | y |', '',
    '### beta: CAUTION, 25/100', '', '| Finding | File:line | Verdict | Why |', '|---|---|---|---|', '| X | `a:1` | BY DESIGN | y |', ''].join('\n');
  const t = parseTriage(text);
  assert.equal(t.beta.duplicate, true);
  assert.deepEqual(t.beta.rows, [{ rule: 'X', file: 'a', line: 1, verdict: 'FP' }]);
});

test('triageAnchor is the heading anchor GitHub renders', () => {
  assert.equal(triageAnchor('brainstorming: DO_NOT_INSTALL, 100/100, 12 findings'), 'brainstorming-do_not_install-100100-12-findings');
});

test('scanTargets lists the shipped skills, the kit skills, every agent and every domain, an agent keyed agent:<id> and a domain pack:<id>', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-scan-'));
  try {
    for (const d of ['catalog/skills/zeta', 'catalog/skills/alpha', '.claude/skills/vet-and-adopt', '.claude/skills/drill-to-adopt', '.claude/skills/setup-workspace', 'catalog/agents', 'catalog/packs/some-domain/skills']) mkdirSync(path.join(root, d), { recursive: true });
    writeFileSync(path.join(root, 'catalog/packs/README.md'), 'not a domain\n');
    writeFileSync(path.join(root, 'catalog/agents/seat-two.md'), '# Seat two\n');
    writeFileSync(path.join(root, 'catalog/agents/seat-one.md'), '# Seat one\n');
    writeFileSync(path.join(root, 'catalog/agents/notes.txt'), 'not an agent\n');
    assert.deepEqual(scanTargets(root).map((t) => [t.key, path.relative(root, t.dir).split(path.sep).join('/')]), [
      ['alpha', 'catalog/skills/alpha'], ['zeta', 'catalog/skills/zeta'],
      ['drill-to-adopt', '.claude/skills/drill-to-adopt'], ['setup-workspace', '.claude/skills/setup-workspace'], ['vet-and-adopt', '.claude/skills/vet-and-adopt'],
      ['agent:seat-one', 'catalog/agents/seat-one.md'], ['agent:seat-two', 'catalog/agents/seat-two.md'],
      ['pack:some-domain', 'catalog/packs/some-domain'],
    ]);
    assert.deepEqual(kitSkills(root), ['drill-to-adopt', 'setup-workspace', 'vet-and-adopt']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scannerCommand reads SKILLSPECTOR_CMD as a command and its arguments, quotes keeping spaces and backslashes, never through a shell', () => {
  assert.deepEqual(scannerCommand(undefined), ['skillspector']);
  assert.deepEqual(scannerCommand('  '), ['skillspector']);
  assert.deepEqual(scannerCommand('uvx --python 3.13 --from git+https://example.invalid/s.git@abc skillspector'), ['uvx', '--python', '3.13', '--from', 'git+https://example.invalid/s.git@abc', 'skillspector']);
  assert.deepEqual(scannerCommand('"C:\\Program Files\\nodejs\\node.exe" \'/tmp/a b/fake.mjs\' x'), ['C:\\Program Files\\nodejs\\node.exe', '/tmp/a b/fake.mjs', 'x']);
  assert.deepEqual(scannerCommand('a;rm -rf x'), ['a;rm', '-rf', 'x'], 'shell characters are plain text');
  assert.throws(() => scannerCommand('"unclosed quote'), /SKILLSPECTOR_CMD.*quote/);
});

test('parseTriage keeps the count a heading states, and marks a table with a Verdict column but no File:line column', () => {
  const t = parseTriage(['### beta: CAUTION, 25/100, 2 findings', '', '| Finding | File:line | Verdict | Why |', '|---|---|---|---|', '| TM1 x | `a.md:3` | FP | y |', '',
    '### gamma: CAUTION, 25/100', '', '| Finding | Where | Verdict | Why |', '|---|---|---|---|', '| TM1 x | `a.md:3` | FP | y |', ''].join('\n'));
  assert.equal(t.beta.count, 2);
  assert.equal(t.beta.noFileLine, undefined);
  assert.equal(t.gamma.count, undefined);
  assert.equal(t.gamma.noFileLine, true);
});

// A kit with scan.mjs and scan-compare.mjs copied in, and a fake scanner: a node script that prints, for
// the folder or file it is asked to scan, the report reports.json holds under that path's last part. Like
// the real one, it exits 1 for a verdict other than SAFE, the report still printed.
const SCAN_MJS = fileURLToPath(new URL('../scan.mjs', import.meta.url));
const COMPARE_MJS = fileURLToPath(new URL('../../scan-compare.mjs', import.meta.url));
const ITEM_HASH_MJS = fileURLToPath(new URL('../item-hash.mjs', import.meta.url));
const FAKE = `import { readFileSync } from 'node:fs';
import path from 'node:path';
const a = process.argv.slice(2);
if (a[0] === '--version') { console.log('SkillSpector v2.13.6'); process.exit(0); }
const reports = JSON.parse(readFileSync(path.join(path.dirname(process.argv[1]), 'reports.json'), 'utf8'));
const r = reports[path.basename(a[1])];
if (!r) { console.error('no report for ' + a[1]); process.exit(2); }
process.stdout.write(JSON.stringify(r));
process.exit(r.risk_assessment.recommendation === 'SAFE' ? 0 : 1);
`;
const issue = (id, file, line, severity = 'HIGH') => ({ id, severity, location: { file, start_line: line, end_line: null } });
const reportOf = (recommendation, score, issues, extra = {}) => ({ skill: { name: 'x', source: '', scanned_at: new Date().toISOString() }, risk_assessment: { score, recommendation }, issues, suppressed_count: 0, metadata: { skillspector_version: '2.13.6' }, ...extra });
const finding = (rule, file, line, severity = 'HIGH') => ({ rule, file, line, severity });

function scanKit() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-check-'));
  for (const d of ['catalog/skills/alpha', '.claude/skills/kit-one', 'catalog/agents', 'tools/export', 'fake']) mkdirSync(path.join(root, d), { recursive: true });
  writeFileSync(path.join(root, 'catalog/skills/alpha/SKILL.md'), '# alpha\n');
  writeFileSync(path.join(root, '.claude/skills/kit-one/SKILL.md'), '# kit-one\n');
  writeFileSync(path.join(root, 'catalog/agents/gamma.md'), '# gamma\n');
  copyFileSync(SCAN_MJS, path.join(root, 'tools/export/scan.mjs'));
  copyFileSync(ITEM_HASH_MJS, path.join(root, 'tools/export/item-hash.mjs'));
  copyFileSync(COMPARE_MJS, path.join(root, 'tools/scan-compare.mjs'));
  copyFileSync(fileURLToPath(new URL('../../compare-install.mjs', import.meta.url)), path.join(root, 'tools/compare-install.mjs'));
  writeFileSync(path.join(root, 'fake/skillspector.mjs'), FAKE);
  const reports = {
    alpha: reportOf('CAUTION', 25, [issue('TM1', 'scripts/s.sh', 2), issue('LP3', 'SKILL.md', 1, 'MEDIUM')]),
    'kit-one': reportOf('SAFE', 0, []),
    'gamma.md': reportOf('SAFE', 10, [issue('SC1', 'gamma.md', null, 'LOW')]),
  };
  const hashes = scanItemHashes(root);
  const scans = {
    alpha: { score: 25, recommendation: 'CAUTION', version: 'v2.13.6', date: '2026-11-21', itemHash: hashes.alpha, findings: [finding('LP3', 'SKILL.md', 1, 'MEDIUM'), finding('TM1', 'scripts/s.sh', 2)] },
    'kit-one': { score: 0, recommendation: 'SAFE', version: 'v2.13.6', date: '2026-11-21', itemHash: hashes['kit-one'], findings: [] },
    'agent:gamma': { score: 10, recommendation: 'SAFE', version: 'v2.13.6', date: '2026-11-21', itemHash: hashes['agent:gamma'], findings: [finding('SC1', 'gamma.md', null, 'LOW')] },
  };
  const write = (r = reports, s = scans) => {
    writeFileSync(path.join(root, 'fake/reports.json'), JSON.stringify(r));
    writeFileSync(path.join(root, 'tools/export/scans.json'), `${JSON.stringify(s, null, 2)}\n`);
  };
  write();
  const run = (args, cmd = `"${process.execPath}" "${path.join(root, 'fake/skillspector.mjs')}"`) => spawnSync(process.execPath, [path.join(root, 'tools/export/scan.mjs'), ...args], {
    cwd: root, encoding: 'utf8', env: { ...process.env, SKILLSPECTOR_CMD: cmd },
  });
  const listing = () => readdirSync(root, { recursive: true }).map(String).sort();
  return { root, reports, scans, write, run, listing, done: () => rmSync(root, { recursive: true, force: true }) };
}

test('scan.mjs --check: a scan that matches scans.json exits 0 and writes nothing', () => {
  const k = scanKit();
  try {
    const before = readFileSync(path.join(k.root, 'tools/export/scans.json'), 'utf8');
    const files = k.listing();
    const r = k.run(['--check']);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.doesNotMatch(r.stdout, /: (new|gone) /);
    assert.equal(readFileSync(path.join(k.root, 'tools/export/scans.json'), 'utf8'), before);
    assert.deepEqual(k.listing(), files);
  } finally { k.done(); }
});

test('scan.mjs --check: a finding found and not recorded is new, one recorded and not found is gone, and the exit is 1', () => {
  const k = scanKit();
  try {
    k.write({ ...k.reports,
      alpha: reportOf('CAUTION', 25, [issue('TM1', 'scripts/s.sh', 2), issue('LP3', 'SKILL.md', 1, 'MEDIUM'), issue('TM1', 'scripts/s.sh', 4)]),
      'gamma.md': reportOf('SAFE', 0, []),
    });
    const before = readFileSync(path.join(k.root, 'tools/export/scans.json'), 'utf8');
    const r = k.run(['--check']);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    const lines = r.stdout.split(/\r?\n/).filter((l) => / (new|gone) /.test(l));
    assert.deepEqual(lines, ['alpha: new TM1 scripts/s.sh:4', 'agent:gamma: gone SC1 gamma.md']);
    assert.equal(readFileSync(path.join(k.root, 'tools/export/scans.json'), 'utf8'), before);
  } finally { k.done(); }
});

test('scan.mjs --check: an item with no record, or a record holding only a count, is a difference', () => {
  const k = scanKit();
  try {
    const { 'kit-one': _gone, ...rest } = k.scans;
    k.write(k.reports, { ...rest, alpha: { ...k.scans.alpha, findings: 2 } });
    const r = k.run(['--check']);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /^alpha: the record in scans\.json holds no list of findings/m);
    assert.match(r.stdout, /^kit-one: not recorded in scans\.json/m);
  } finally { k.done(); }
});

test('scan.mjs: a report that left findings out (suppressed_count above 0) fails that item', () => {
  const k = scanKit();
  try {
    k.write({ ...k.reports, alpha: { ...k.reports.alpha, suppressed_count: 2 } });
    const before = readFileSync(path.join(k.root, 'tools/export/scans.json'), 'utf8');
    const check = k.run(['--check']);
    assert.notEqual(check.status, 0);
    assert.match(check.stderr, /catalog\/skills\/alpha: the report suppressed 2 finding\(s\)/);
    const record = k.run([]);
    assert.equal(record.status, 1, record.stdout + record.stderr);
    assert.match(record.stderr, /catalog\/skills\/alpha: the report suppressed 2 finding\(s\)/);
    assert.deepEqual(JSON.parse(readFileSync(path.join(k.root, 'tools/export/scans.json'), 'utf8')).alpha, JSON.parse(before).alpha, 'the item is not recorded');
  } finally { k.done(); }
});

test('scan.mjs records every target from the report the scanner prints, agents and kit skills included', () => {
  const k = scanKit();
  try {
    k.write(k.reports, {});
    const r = k.run([]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const s = JSON.parse(readFileSync(path.join(k.root, 'tools/export/scans.json'), 'utf8'));
    assert.deepEqual(Object.keys(s).sort(), ['agent:gamma', 'alpha', 'kit-one']);
    assert.deepEqual(s['agent:gamma'].findings, [finding('SC1', 'gamma.md', null, 'LOW')]);
    assert.deepEqual(s.alpha.findings, k.scans.alpha.findings);
    assert.equal(s.alpha.version, 'v2.13.6');
    for (const key of ['agent:gamma', 'alpha', 'kit-one']) assert.equal(s[key].itemHash, k.scans[key].itemHash, key);
    assert.match(s.alpha.itemHash, /^[0-9a-f]{16}$/);
  } finally { k.done(); }
});

test('scan.mjs refuses an item that holds a name the export never ships, records nothing for it, and the hash ignores such names', () => {
  const k = scanKit();
  try {
    const hash = scanItemHashes(k.root).alpha;
    mkdirSync(path.join(k.root, 'catalog/skills/alpha/scripts/__pycache__'), { recursive: true });
    writeFileSync(path.join(k.root, 'catalog/skills/alpha/scripts/__pycache__/x.pyc'), 'bytes');
    writeFileSync(path.join(k.root, '.claude/skills/kit-one/.DS_Store'), 'finder');
    assert.equal(scanItemHashes(k.root).alpha, hash, 'what never ships is not hashed');
    const t = Object.fromEntries(scanTargets(k.root).map((x) => [x.key, x]));
    assert.deepEqual(strayFiles(k.root, t.alpha), ['catalog/skills/alpha/scripts/__pycache__']);
    const check = k.run(['--check']);
    assert.equal(check.status, 1, check.stdout + check.stderr);
    assert.match(check.stderr, /^catalog\/skills\/alpha: holds catalog\/skills\/alpha\/scripts\/__pycache__, which the export does not ship; delete it and scan again$/m);
    assert.match(check.stderr, /^\.claude\/skills\/kit-one: holds \.claude\/skills\/kit-one\/\.DS_Store, which the export/m);
    k.write(k.reports, {});
    const record = k.run([]);
    assert.equal(record.status, 1, record.stdout + record.stderr);
    assert.deepEqual(Object.keys(JSON.parse(readFileSync(path.join(k.root, 'tools/export/scans.json'), 'utf8'))), ['agent:gamma']);
  } finally { k.done(); }
});

test('scan.mjs --check: a changed verdict or score, a changed severity and another scanner version are differences', () => {
  const k = scanKit();
  try {
    k.write({ ...k.reports,
      alpha: reportOf('DO_NOT_INSTALL', 60, [issue('TM1', 'scripts/s.sh', 2), issue('LP3', 'SKILL.md', 1, 'HIGH')]),
    });
    const r = k.run(['--check']);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    const lines = r.stdout.split(/\r?\n/).filter((l) => l.startsWith('alpha: '));
    assert.deepEqual(lines, ['alpha: recorded CAUTION (25/100), scanned DO_NOT_INSTALL (60/100)', 'alpha: LP3 SKILL.md:1 is HIGH now, recorded MEDIUM']);
    k.write(k.reports, { ...k.scans, 'kit-one': { ...k.scans['kit-one'], version: 'v2.2.3' } });
    const v = k.run(['--check']);
    assert.equal(v.status, 1, v.stdout + v.stderr);
    assert.match(v.stdout, /^kit-one: recorded with SkillSpector v2\.2\.3, scanned with v2\.13\.6$/m);
  } finally { k.done(); }
});

test('scan.mjs drops the record of an item no longer scanned, saying so; --check reports it as a difference', () => {
  const k = scanKit();
  try {
    k.write(k.reports, { ...k.scans, 'pack:gone': { ...k.scans['kit-one'] } });
    const check = k.run(['--check']);
    assert.equal(check.status, 1, check.stdout + check.stderr);
    assert.match(check.stdout, /^pack:gone: recorded in scans\.json but no longer scanned$/m);
    const record = k.run([]);
    assert.equal(record.status, 0, record.stdout + record.stderr);
    assert.match(record.stdout, /^pack:gone: no longer scanned; its record is dropped from scans\.json$/m);
    assert.deepEqual(Object.keys(JSON.parse(readFileSync(path.join(k.root, 'tools/export/scans.json'), 'utf8'))).sort(), ['agent:gamma', 'alpha', 'kit-one']);
  } finally { k.done(); }
});

test('itemFiles lists every file of a folder item, and the one file of an agent, relative to the kit', () => {
  const k = scanKit();
  try {
    mkdirSync(path.join(k.root, 'catalog/skills/alpha/scripts'), { recursive: true });
    writeFileSync(path.join(k.root, 'catalog/skills/alpha/scripts/s.sh'), 'echo\n');
    const t = Object.fromEntries(scanTargets(k.root).map((x) => [x.key, x]));
    assert.deepEqual(itemFiles(k.root, t.alpha), ['catalog/skills/alpha/SKILL.md', 'catalog/skills/alpha/scripts/s.sh']);
    assert.deepEqual(itemFiles(k.root, t['agent:gamma']), ['catalog/agents/gamma.md']);
  } finally { k.done(); }
});

test('scan.mjs --check: an item whose content changed since its scan is a difference, though its findings are the same', () => {
  const k = scanKit();
  try {
    writeFileSync(path.join(k.root, 'catalog/skills/alpha/SKILL.md'), '# alpha\nedited after the scan\n');
    writeFileSync(path.join(k.root, 'catalog/agents/gamma.md'), '# gamma\nedited too\n');
    const r = k.run(['--check']);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /^alpha: the item changed since its scan \(itemHash [0-9a-f]{16}, now [0-9a-f]{16}\); rescan and re-read its triage$/m);
    assert.match(r.stdout, /^agent:gamma: the item changed since its scan/m);
    assert.doesNotMatch(r.stdout, /kit-one: the item changed/);
    assert.match(r.stdout, /: 2 difference\(s\)/);
  } finally { k.done(); }
});

test('scan.mjs --check: a scanner that cannot be started stops the check with exit 2, naming SKILLSPECTOR_CMD', () => {
  const k = scanKit();
  try {
    const r = k.run(['--check'], path.join(k.root, 'no-such-scanner'));
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /SKILLSPECTOR_CMD/);
  } finally { k.done(); }
});

test('the CI job scan installs the scanner tools/export/scanner.json pins, on its Python, and runs --check', () => {
  const kit = fileURLToPath(new URL('../../../', import.meta.url));
  const scanner = JSON.parse(readFileSync(path.join(kit, 'tools/export/scanner.json'), 'utf8'));
  const yml = readFileSync(path.join(kit, '.github/workflows/test.yml'), 'utf8');
  const job = yml.slice(yml.indexOf('\n  scan:\n'));
  assert.ok(job.length > 1, 'test.yml has a job scan');
  assert.ok(job.includes(`pip install "skillspector @ git+https://github.com/NVIDIA/skillspector.git@${scanner.commit}"`));
  assert.ok(job.includes(`python-version: '${scanner.python}'`));
  assert.match(job, /actions\/setup-python@[0-9a-f]{40} # v/);
  assert.match(job, /run: node tools\/export\/scan\.mjs --check\n/);
  assert.match(job, /if: .*'schedule'.*refs\/heads\/release\//);
  assert.doesNotMatch(job, /pull_request|refs\/heads\/main/);
  // A bounded run, and no token left in the checkout while it installs and runs third-party Python.
  assert.match(job, /\n {4}timeout-minutes: \d+\n/);
  assert.match(job, /actions\/checkout@[0-9a-f]{40} # v[\d.]+\n {8}with:\n {10}persist-credentials: false\n/);
  // The weekly schedule is for the scan alone: the three-system test matrix does not run on it.
  const test = yml.slice(yml.indexOf('\n  test:\n'), yml.indexOf('\n  scan:\n'));
  assert.match(test, /\n {4}if: github\.event_name != 'schedule'\n/);
});

test('scan.mjs refuses an argument it does not know', () => {
  const k = scanKit();
  try {
    const r = k.run(['--chek']);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /usage: node tools\/export\/scan\.mjs \[--check\]/);
  } finally { k.done(); }
});

// macOS keeps its temporary folder under /var, a link to /private/var: run through a linked path, the
// script must still run, never exit 0 having checked nothing.
test('scan.mjs runs when started through a linked folder', () => {
  const k = scanKit();
  const link = path.join(mkdtempSync(path.join(os.tmpdir(), 'kit-link-')), 'kit');
  try {
    symlinkSync(k.root, link, 'junction');
    const r = spawnSync(process.execPath, [path.join(link, 'tools/export/scan.mjs'), '--chek'], { encoding: 'utf8' });
    assert.equal(r.status, 2, r.stdout + r.stderr);
  } finally { rmSync(path.dirname(link), { recursive: true, force: true }); k.done(); }
});

// No pull request runs the scanner, so this is what ties tools/export/scans.json to the kit on every one:
// each scanned item's recorded itemHash must be the hash of its content now, on every system.
test('scans.json matches the kit: every scanned item is recorded, with the hash of its content as it is now', () => {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const scans = JSON.parse(readFileSync(path.join(root, 'tools/export/scans.json'), 'utf8'));
  const hashes = scanItemHashes(root);
  const problems = [
    ...Object.keys(hashes).filter((k) => !Object.hasOwn(scans, k)).map((k) => `${k}: scanned item with no record in scans.json`),
    ...Object.keys(scans).filter((k) => !Object.hasOwn(hashes, k)).map((k) => `${k}: recorded in scans.json but no longer scanned`),
    ...Object.keys(hashes).filter((k) => Object.hasOwn(scans, k) && scans[k].itemHash !== hashes[k])
      .map((k) => `${k}: changed since its scan (itemHash ${scans[k].itemHash ?? 'not recorded'}, now ${hashes[k]})`),
  ];
  assert.deepEqual(problems, [], `rescan it in this PR (node tools/export/scan.mjs, with the pinned scanner) and re-read its triage:\n${problems.join('\n')}`);
});
