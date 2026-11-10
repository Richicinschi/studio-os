// tools/export/test/scan.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findKey, verdictFrom, findingsFrom, parseTriage, triageAnchor, scanTargets, reportFile } from '../scan.mjs';

test('verdictFrom finds the score and recommendation wherever the report nests them', () => {
  assert.deepEqual(verdictFrom({ summary: { risk_score: 12, recommendation: 'REVIEW' } }), { score: 12, recommendation: 'REVIEW' });
  assert.deepEqual(verdictFrom({ results: [{ meta: {} }, { score: 0, Recommendation: 'SAFE' }] }), { score: 0, recommendation: 'SAFE' });
  assert.equal(findKey({ a: { b: 1 } }, /^c$/), undefined);
});

const TRIAGE = [
  '# Scan triage', '', 'Intro.', '', '## Run of 2026-11-09', '',
  '### alpha: DO_NOT_INSTALL, 100/100, 7 findings', '',
  '| Finding | File:line | Verdict | Why |', '|---|---|---|---|',
  '| LP3 no declared permissions | `SKILL.md:1` | BY DESIGN | It runs scripts. |',
  '| PE3 credential access | `x.cjs:5` | FP | `a \\|\\| b` reads a display name. |',
  '| RA2 session persistence (4 rows) | `s.sh:1`, `:2` | BY DESIGN | A local server. |',
  '| TM1 tool parameter abuse | `t.sh:3` | FP | A fixed file. |', '',
  'Hand sweep: read everything. | not a table row', '',
  '### pack:some-domain: CAUTION, 25/100, 1 finding', '',
  '| Finding | File:line | Verdict | Why |', '|---|---|---|---|',
  '| TM1 tool parameter abuse | `skills/a.md:4` | REAL | Something to stop on. |', '',
  '### One thing to know', '',
  '| Finding | File:line | Verdict | Why |', '|---|---|---|---|',
  '| X | `y:1` | FP | Not in any item section. |', '',
].join('\n');

test('parseTriage reads each item section: verdict, score, findings, and the rows by verdict with "(k rows)" counted k times', () => {
  const t = parseTriage(TRIAGE);
  assert.deepEqual(Object.keys(t), ['alpha', 'pack:some-domain']);
  assert.deepEqual(t.alpha, { recommendation: 'DO_NOT_INSTALL', score: 100, findings: 7, fp: 2, byDesign: 5, other: 0, anchor: 'alpha-do_not_install-100100-7-findings' });
  assert.deepEqual(t['pack:some-domain'], { recommendation: 'CAUTION', score: 25, findings: 1, fp: 0, byDesign: 0, other: 1, anchor: 'packsome-domain-caution-25100-1-finding' });
});

test('findingsFrom counts the report\'s issues, and says nothing when the report has no issues list', () => {
  assert.equal(findingsFrom({ risk_assessment: { score: 100 }, issues: [{ id: 'TM1' }, { id: 'RA2' }] }), 2);
  assert.equal(findingsFrom({ issues: [] }), 0);
  assert.equal(findingsFrom({ risk_assessment: {} }), undefined);
});

test('parseTriage marks an item whose section appears twice, and keeps the first section\'s counts', () => {
  const text = ['### beta: CAUTION, 25/100, 1 finding', '', '| Finding | File:line | Verdict | Why |', '|---|---|---|---|', '| X | `a:1` | FP | y |', '',
    '### beta: CAUTION, 25/100, 1 finding', '', '| Finding | File:line | Verdict | Why |', '|---|---|---|---|', '| X | `a:1` | BY DESIGN | y |', ''].join('\n');
  const t = parseTriage(text);
  assert.equal(t.beta.duplicate, true);
  assert.equal(t.beta.fp, 1);
  assert.equal(t.beta.byDesign, 0);
});

test('reportFile gives a domain and a skill whose names look alike different report files', () => {
  assert.notEqual(reportFile('pack:foo'), reportFile('pack-foo'));
  assert.match(reportFile('pack:foo'), /^[^:\\/]+\.json$/);
});

test('triageAnchor is the heading anchor GitHub renders', () => {
  assert.equal(triageAnchor('brainstorming: DO_NOT_INSTALL, 100/100, 12 findings'), 'brainstorming-do_not_install-100100-12-findings');
});

test('scanTargets lists the shipped skills, the kit skills and every domain, a domain keyed pack:<id>', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-scan-'));
  try {
    for (const d of ['catalog/skills/zeta', 'catalog/skills/alpha', '.claude/skills/kit-one', 'catalog/packs/some-domain/skills']) mkdirSync(path.join(root, d), { recursive: true });
    writeFileSync(path.join(root, 'catalog/packs/README.md'), 'not a domain\n');
    assert.deepEqual(scanTargets(root).map((t) => [t.key, path.relative(root, t.dir).split(path.sep).join('/')]), [
      ['alpha', 'catalog/skills/alpha'], ['zeta', 'catalog/skills/zeta'], ['kit-one', '.claude/skills/kit-one'], ['pack:some-domain', 'catalog/packs/some-domain'],
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
