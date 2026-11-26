// tools/export/test/claude-ai-trial.test.mjs
// Public issue #64: the two zips and the checklist for a trial on claude.ai, and the row that records it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMAINS, build, record } from '../claude-ai-trial.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

test('the two domains ship, one of the nine #50 fixed and one it never touched', () => {
  for (const d of DOMAINS) assert.ok(existsSync(path.join(KIT, 'catalog/packs', d.id, 'SKILL.md')), d.id);
  assert.equal(DOMAINS.length, 2);
});

test('build writes each domain\'s zip and a checklist with the task for each', (t) => {
  const out = mkdtempSync(path.join(os.tmpdir(), 'kit-claude-ai-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  const zips = build(out, { today: '2026-11-26' });
  for (const z of zips) {
    const bytes = readFileSync(z);
    const id = path.basename(z, '.zip');
    assert.equal(bytes.readUInt32LE(0), 0x04034b50, `${id} is a zip`);
    // The entry and its skills, never the agents, which claude.ai has no place for.
    assert.ok(bytes.includes(Buffer.from(`${id}/SKILL.md`)), `${id}: the entry`);
    assert.ok(bytes.includes(Buffer.from(`${id}/skills/`)), `${id}: the skills`);
    assert.ok(!bytes.includes(Buffer.from(`${id}/agents/`)), `${id}: no agents`);
  }
  const list = readFileSync(path.join(out, 'CHECKLIST.md'), 'utf8');
  assert.match(list, /^# Trying two domains on claude\.ai \(2026-11-26\)$/m);
  for (const d of DOMAINS) {
    assert.ok(list.includes(`## ${d.id}`));
    assert.ok(list.includes(`> ${d.task}`));
  }
});

test('record prints one row for docs/trials.md, and refuses what it cannot record honestly', () => {
  const [a, b] = DOMAINS.map((d) => d.id);
  assert.equal(record({ domain: a, upload: 'accepted', skill: 'skills/council.md', note: 'Ran the panel | inline.', date: '2026-12-20' }),
    `| 2026-12-20 | \`${a}\` | accepted | skills/council.md | Ran the panel \\| inline. |`);
  assert.equal(record({ domain: b, upload: 'refused', error: 'Invalid  skill\nfile', date: '2026-12-20' }),
    `| 2026-12-20 | \`${b}\` | refused: "Invalid skill file" | n/a | - |`);
  assert.throws(() => record({ domain: 'other', upload: 'accepted' }), /--domain is one of/);
  assert.throws(() => record({ domain: a, upload: 'maybe' }), /accepted or refused/);
  assert.throws(() => record({ domain: a, upload: 'refused' }), /needs --error/);
  assert.throws(() => record({ domain: a, upload: 'accepted', date: '20 Dec' }), /YYYY-MM-DD/);
});

test('the command line: build and record exit 0, bad input exits 2 with the reason', (t) => {
  const out = mkdtempSync(path.join(os.tmpdir(), 'kit-claude-ai-cli-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  const run = (...a) => spawnSync(process.execPath, [path.join(KIT, 'tools/export/claude-ai-trial.mjs'), ...a], { encoding: 'utf8' });
  let r = run('build', out);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /CHECKLIST\.md/);
  r = run('record', '--domain', DOMAINS[0].id, '--upload', 'accepted', '--skill', 'skills/council.md', '--date', '2026-12-20');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^\| 2026-12-20 \| `advisor-council-for-big-decisions` \| accepted \| skills\/council\.md \| - \|$/m);
  r = run('record', '--domain', DOMAINS[0].id, '--upload', 'refused');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /needs --error/);
  assert.equal(run('nothing').status, 2);
});
