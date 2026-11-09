// tools/export/test/upload-bundle.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { bundleEntries, main } from '../../upload-bundle.mjs';

// A shipped pack as the kit holds it: entry, skills (one with a nested folder), agents and stubs.
function makePacks() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-packs-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  w('some-domain-here/SKILL.md', '---\nname: some-domain-here\ndescription: d\n---\nIndex\n');
  w('some-domain-here/skills/one.md', 'One\n');
  w('some-domain-here/skills/two/helper.md', 'Nested file\n');
  w('some-domain-here/agents/seat.md', 'A seat\n');
  w('some-domain-here/stubs/one/SKILL.md', 'stub\n');
  return root;
}
// Windows and macOS ship bsdtar, which reads a zip. GNU tar on Linux cannot, so there unzip does.
const bsdtar = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
const useTar = process.platform === 'win32' || process.platform === 'darwin';
function zipRun(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.error) throw new Error(`no zip reader: ${cmd} did not run (${r.error.code}). Install ${useTar ? 'bsdtar' : 'unzip'} to run these tests.`);
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}
const listZip = (zip) => zipRun(...(useTar ? [bsdtar, ['-tf', zip]] : ['unzip', ['-Z1', zip]])).split(/\r?\n/).filter(Boolean).sort();
const extractZip = (zip, dir) => zipRun(...(useTar ? [bsdtar, ['-xf', zip, '-C', dir]] : ['unzip', ['-q', zip, '-d', dir]]));
const WANT = ['some-domain-here/SKILL.md', 'some-domain-here/skills/one.md', 'some-domain-here/skills/two/helper.md'];
const tmp = (p) => mkdtempSync(path.join(os.tmpdir(), p));

test('bundle holds the entry and skills only', () => {
  const packs = makePacks();
  try {
    assert.deepEqual(bundleEntries(path.join(packs, 'some-domain-here'), 'some-domain-here').map((e) => e.name), WANT);
  } finally { rmSync(packs, { recursive: true, force: true }); }
});

test('the zip lists with the platform zip reader', () => {
  const packs = makePacks();
  const out = tmp('kit-zip-');
  try {
    assert.equal(main(['some-domain-here', '--out', out, '--packs', packs]), 0);
    const zip = path.join(out, 'some-domain-here.zip');
    assert.ok(existsSync(zip));
    assert.deepEqual(listZip(zip), WANT);
  } finally { rmSync(packs, { recursive: true, force: true }); rmSync(out, { recursive: true, force: true }); }
});

test('the same input gives the same bytes, and the zip reader extracts the content', () => {
  const packs = makePacks();
  const a = tmp('kit-zip-');
  const b = tmp('kit-zip-');
  const c = tmp('kit-zip-');
  try {
    main(['some-domain-here', '--out', a, '--packs', packs]);
    main(['some-domain-here', '--out', b, '--packs', packs]);
    assert.ok(readFileSync(path.join(a, 'some-domain-here.zip')).equals(readFileSync(path.join(b, 'some-domain-here.zip'))));
    extractZip(path.join(a, 'some-domain-here.zip'), c);
    assert.equal(readFileSync(path.join(c, 'some-domain-here/skills/two/helper.md'), 'utf8'), 'Nested file\n');
  } finally { for (const d of [packs, a, b, c]) rmSync(d, { recursive: true, force: true }); }
});

test('a domain the kit does not ship, or a bad call, exits non-zero', () => {
  const packs = makePacks();
  const out = tmp('kit-zip-');
  try {
    assert.equal(main(['no-such-domain-here', '--out', out, '--packs', packs]), 1);
    assert.equal(main(['some-domain-here']), 2);
    assert.equal(main(['../escape', '--out', out, '--packs', packs]), 2);
  } finally { rmSync(packs, { recursive: true, force: true }); rmSync(out, { recursive: true, force: true }); }
});
