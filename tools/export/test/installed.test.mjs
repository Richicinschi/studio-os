// tools/export/test/installed.test.mjs
// Public issues #60 and #30: the install record, adoption/installed.json, written and read by
// tools/installed.mjs; and the receipt it prints, which names kit items only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recordItem, setCheck, checkSetup, checkText, receipt, readRecord, whereFile, undoPlan, undoItem, BadInput } from '../../installed.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const sha = (s) => createHash('sha256').update(s).digest('hex');

function fixture(t) {
  const base = mkdtempSync(path.join(os.tmpdir(), 'kit-installed-'));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const kit = path.join(base, 'kit');
  const setup = path.join(base, 'setup');
  const home = path.join(base, 'home');
  const w = (root, rel, text) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), text); };
  w(kit, 'CHANGELOG.md', '# Changelog\n\n## v9.1.0 (2026-11-26)\n\n- x\n\n## v9.0.0 (2026-11-01)\n');
  const features = (h) => JSON.stringify({ modules: [{ id: '01', items: [{ id: 'guard', kind: 'skill', hash: h }, { id: 'memory', kind: 'practice', hash: 'm1' }, { id: 'nohash', kind: 'practice' }, { id: 'skeptic', kind: 'agent', hash: 'a1' }] }], domains: [{ id: 'media', hash: 'd1' }] });
  w(kit, 'catalog/features.json', features('g1'));
  w(setup, '.claude/skills/guard/SKILL.md', 'guard skill\n');
  w(setup, '.claude/skills/guard/run.sh', '#!/bin/sh\necho hi\n');
  w(setup, '.claude/skills/guard/node_modules/x.js', 'never recorded');
  w(setup, '..odd.md', 'a file whose name starts with two dots');
  w(setup, 'CLAUDE.md', '# Front door\n');
  w(setup, '.claude/settings.json', JSON.stringify({ hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'guard' }] }] }, other: 1 }));
  w(home, '.claude/agents/skeptic.md', 'agent\n');
  w(base, 'elsewhere/notes.md', 'outside the setup and the home folder\n');
  return { base, kit, setup, home, w, opts: { kit, home, today: '2026-11-26' }, setFeatures: (h) => w(kit, 'catalog/features.json', features(h)) };
}

test('record writes each file with its SHA-256, each settings key with its value\'s, the kit version and the kit\'s hash', (t) => {
  const f = fixture(t);
  const e = recordItem(f.setup, { id: 'guard', decision: 'adopt', created: ['.claude/skills/guard'], edited: ['CLAUDE.md'], settings: ['.claude/settings.json#hooks.PreToolUse'] }, f.opts);
  assert.equal(e.decision, 'ADOPT');
  assert.equal(e.kitVersion, 'v9.1.0');
  assert.equal(e.kitHash, 'g1');
  assert.equal(e.check, 'pending');
  assert.deepEqual(e.files.map((x) => [x.path, x.how]), [
    ['.claude/skills/guard/SKILL.md', 'created'], ['.claude/skills/guard/run.sh', 'created'], ['CLAUDE.md', 'edited']]);
  assert.deepEqual(e.folders, [{ path: '.claude/skills/guard', how: 'created' }]);
  assert.equal(e.files[0].sha256, sha('guard skill\n'));
  assert.deepEqual(e.settings.map((s) => [s.file, s.key]), [['.claude/settings.json', 'hooks.PreToolUse']]);
  // Paths: under the home folder with ~/ (given as ~/ or in full), outside both in full, a ..name inside.
  assert.equal(recordItem(f.setup, { id: 'skeptic', decision: 'ADAPT', created: ['~/.claude/agents/skeptic.md'] }, f.opts).files[0].path, '~/.claude/agents/skeptic.md');
  assert.equal(recordItem(f.setup, { id: 'x', decision: 'ADAPT', created: [path.join(f.home, '.claude/agents/skeptic.md')] }, f.opts).files[0].path, '~/.claude/agents/skeptic.md');
  assert.equal(recordItem(f.setup, { id: 'y', decision: 'FOLD', edited: [path.join(f.base, 'elsewhere/notes.md')] }, f.opts).files[0].path, path.join(f.base, 'elsewhere/notes.md').split(path.sep).join('/'));
  assert.equal(recordItem(f.setup, { id: 'z', decision: 'ADOPT', created: ['..odd.md'] }, f.opts).files[0].path, '..odd.md');
  // An item's card name, or its scan key, finds the kit's hash; an item the menu does not hold has none.
  assert.equal(recordItem(f.setup, { id: 'agent:skeptic', decision: 'ADOPT' }, f.opts).kitHash, 'a1');
  assert.equal(recordItem(f.setup, { id: 'pack-media', decision: 'ADOPT' }, f.opts).kitHash, 'd1');
  assert.equal(recordItem(f.setup, { id: 'pack:media', decision: 'ADOPT' }, f.opts).kitHash, 'd1');
  assert.equal(recordItem(f.setup, { id: 'x', decision: 'ADOPT' }, f.opts).kitHash, null);
  const skip = recordItem(f.setup, { id: 'memory', decision: 'SKIP' }, f.opts);
  assert.equal(skip.check, 'n/a');
  assert.deepEqual(skip.files, []);
});

test('record refuses bad input: a decision, a path, a key, the kit\'s folder as the setup, and the adoption folder itself', (t) => {
  const f = fixture(t);
  assert.throws(() => recordItem(f.setup, { id: 'guard', decision: 'KEEP' }, f.opts), BadInput);
  assert.throws(() => recordItem(f.setup, { id: 'guard', decision: 'ADOPT', created: ['nope.md'] }, f.opts), /not found: nope\.md/);
  assert.throws(() => recordItem(f.setup, { id: 'guard', decision: 'ADOPT', settings: ['.claude/settings.json#hooks.Stop'] }, f.opts), /no key hooks\.Stop/);
  assert.throws(() => recordItem(f.setup, { id: 'guard', decision: 'ADOPT', settings: ['.claude/settings.json#constructor'] }, f.opts), /no key constructor/);
  assert.throws(() => recordItem(f.setup, { id: 'guard', decision: 'ADOPT', settings: ['.claude/settings.json'] }, f.opts), /<file>#<key>/);
  assert.throws(() => recordItem(f.kit, { id: 'guard', decision: 'ADOPT' }, f.opts), /the kit's folder/);
  f.w(f.setup, 'adoption/spec.md', 'spec');
  assert.throws(() => recordItem(f.setup, { id: 'guard', decision: 'ADOPT', created: ['adoption'] }, f.opts), /in adoption\//);
  f.w(f.setup, '.claude/broken.json', '{ not json');
  assert.throws(() => recordItem(f.setup, { id: 'guard', decision: 'ADOPT', settings: ['.claude/broken.json#a'] }, f.opts), /\.claude\/broken\.json: not valid JSON/);
  f.w(f.setup, 'adoption/installed.json', '{}');
  assert.throws(() => readRecord(f.setup), /not an install record/);
});

test('recording again replaces the entry and makes it the latest; UNDONE leaves no files', (t) => {
  const f = fixture(t);
  recordItem(f.setup, { id: 'guard', decision: 'ADOPT', created: ['CLAUDE.md'] }, f.opts);
  recordItem(f.setup, { id: 'memory', decision: 'ADOPT' }, f.opts);
  recordItem(f.setup, { id: 'guard', decision: 'UNDONE' }, f.opts);
  assert.deepEqual(readRecord(f.setup).items.map((x) => `${x.id} ${x.decision} ${x.files.length} ${x.check}`), ['memory ADOPT 0 pending', 'guard UNDONE 0 n/a']);
  assert.match(checkText(checkSetup(f.setup, f.opts)), /^guard \(UNDONE, 2026-11-26, check n\/a\): nothing written;/m);
});

test('check: unchanged, changed, missing, added, a settings key changed, and a file a later item rewrote is not a change', (t) => {
  const f = fixture(t);
  recordItem(f.setup, { id: 'guard', decision: 'ADOPT', created: ['.claude/skills/guard'], edited: ['CLAUDE.md'], settings: ['.claude/settings.json#hooks.PreToolUse'] }, f.opts);
  let r = checkSetup(f.setup, f.opts);
  assert.equal(r.clean, true);
  assert.match(checkText(r), /^guard \(ADOPT, 2026-11-26, check pending\): 3 files and 1 settings key unchanged since the install; the kit's copy is the same as at the install \(v9\.1\.0\)$/);
  // A later item edits the front door and records it: the guard's entry says who rewrote it.
  f.w(f.setup, 'CLAUDE.md', '# Front door\n\nMemory lives in memory/.\n');
  recordItem(f.setup, { id: 'memory', decision: 'ADAPT', edited: ['CLAUDE.md'] }, f.opts);
  r = checkSetup(f.setup, f.opts);
  assert.equal(r.clean, true);
  const front = r.items[0].parts.find((x) => x.path === 'CLAUDE.md');
  assert.deepEqual([front.state, front.by, front.shared], ['rewritten', 'memory', ['memory']]);
  // Someone edits the script, deletes the skill file, adds a script and changes the hook's command.
  f.w(f.setup, '.claude/skills/guard/run.sh', '#!/bin/sh\necho changed\n');
  unlinkSync(path.join(f.setup, '.claude/skills/guard/SKILL.md'));
  f.w(f.setup, '.claude/skills/guard/extra.sh', 'added later');
  f.w(f.setup, '.claude/settings.json', JSON.stringify({ other: 1, hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'other' }] }] } }));
  r = checkSetup(f.setup, f.opts);
  assert.equal(r.clean, false);
  const text = checkText(r);
  assert.match(text, /^guard \(ADOPT, 2026-11-26, check pending\): 4 files or keys changed, missing or added since the install;/m);
  assert.match(text, /^ {2}missing {2}\.claude\/skills\/guard\/SKILL\.md \(created\)$/m);
  assert.match(text, /^ {2}changed {2}\.claude\/skills\/guard\/run\.sh \(created\)$/m);
  assert.match(text, /^ {2}added {2}\.claude\/skills\/guard\/extra\.sh \(not written by the install\)$/m);
  assert.match(text, /^ {2}changed {2}\.claude\/settings\.json#hooks\.PreToolUse \(settings key\)$/m);
  assert.ok(!/ {2}rewritten/.test(text), 'without ids, unchanged and rewritten parts are not listed');
  // With an id, every file and key of that item is listed: what an undo works from.
  const one = checkText(checkSetup(f.setup, { ...f.opts, ids: ['guard'] }), { all: true });
  assert.match(one, /^ {2}rewritten by memory {2}CLAUDE\.md \(edited\): also recorded by memory$/m);
  assert.ok(!/^memory/m.test(one));
  assert.throws(() => checkSetup(f.setup, { ...f.opts, ids: ['nope'] }), /no item nope/);
});

test('a settings key: key order does not count; a later key holding it explains a change; a later key inside it is named, still a change', (t) => {
  const f = fixture(t);
  recordItem(f.setup, { id: 'guard', decision: 'ADOPT', settings: ['.claude/settings.json#hooks.PreToolUse'] }, f.opts);
  f.w(f.setup, '.claude/settings.json', JSON.stringify({ other: 2, hooks: { PreToolUse: [{ hooks: [{ command: 'guard', type: 'command' }], matcher: 'Bash' }] } }));
  assert.equal(checkSetup(f.setup, f.opts).clean, true);
  // A later item rewrites the whole hooks object and records it: the guard's key is that item's now.
  f.w(f.setup, '.claude/settings.json', JSON.stringify({ hooks: { PreToolUse: [], Stop: [{ hooks: [] }] } }));
  recordItem(f.setup, { id: 'stopper', decision: 'ADOPT', settings: ['.claude/settings.json#hooks'] }, f.opts);
  let r = checkSetup(f.setup, f.opts);
  assert.equal(r.clean, true);
  assert.equal(r.items[0].parts[0].state, 'rewritten');
  assert.equal(r.items[0].parts[0].by, 'stopper');
  // The other way round: an earlier key holds a later one. The later key may explain part of it only.
  recordItem(f.setup, { id: 'wide', decision: 'ADOPT', settings: ['.claude/settings.json#hooks'] }, f.opts);
  f.w(f.setup, '.claude/settings.json', JSON.stringify({ hooks: { PreToolUse: [], Stop: [{ hooks: [{ type: 'command', command: 'x' }] }] } }));
  recordItem(f.setup, { id: 'narrow', decision: 'ADOPT', settings: ['.claude/settings.json#hooks.Stop'] }, f.opts);
  r = checkSetup(f.setup, { ...f.opts, ids: ['wide'] });
  assert.equal(r.clean, false);
  assert.match(checkText(r, { all: true }), /^ {2}changed {2}\.claude\/settings\.json#hooks \(settings key\): narrow wrote hooks\.Stop inside it since; also recorded by guard, stopper, narrow$/m);
});

test('check says when the kit\'s copy changed since the install, and when there is nothing to compare', (t) => {
  const f = fixture(t);
  recordItem(f.setup, { id: 'guard', decision: 'ADOPT' }, f.opts);
  recordItem(f.setup, { id: 'nohash', decision: 'ADOPT' }, f.opts);
  recordItem(f.setup, { id: 'pack-media', decision: 'ADOPT' }, f.opts);
  f.setFeatures('g2');
  f.w(f.kit, 'CHANGELOG.md', '# Changelog\n\n## v9.2.0 (2026-12-20)\n\n- guard changed\n\n## v9.1.0 (2026-11-26)\n');
  const r = checkSetup(f.setup, f.opts);
  assert.deepEqual(r.items.map((x) => `${x.id} ${x.kit}`), ['guard changed', 'nohash unknown', 'pack-media same']);
  assert.match(checkText(r), /^guard .*the kit's copy changed since v9\.1\.0 \(now v9\.2\.0\)$/m);
  assert.match(checkText(r), /^nohash .*no kit hash to compare/m);
});

test('the receipt names kit items, counts and a duration only: never a path, a date or an item from outside the kit', (t) => {
  const f = fixture(t);
  assert.match(receipt(f.setup, { kit: f.kit }), /^- Time: not known \(fewer than two files in adoption\/\)\.$/m);
  recordItem(f.setup, { id: 'guard', decision: 'ADOPT', created: ['.claude/skills/guard'], settings: ['.claude/settings.json#hooks'] }, f.opts);
  recordItem(f.setup, { id: 'memory', decision: 'SKIP' }, f.opts);
  recordItem(f.setup, { id: 'acme-client-tool', decision: 'ADAPT', created: ['CLAUDE.md'] }, f.opts);
  recordItem(f.setup, { id: 'pack-media', decision: 'FOLD' }, f.opts);
  setCheck(f.setup, 'guard', 'fail', { kit: f.kit });
  setCheck(f.setup, 'acme-client-tool', 'fail', { kit: f.kit });
  assert.throws(() => setCheck(f.setup, 'guard', 'ok', { kit: f.kit }), BadInput);
  f.w(f.setup, 'adoption/handoff-2026-11-26.md', 'note');
  f.w(f.setup, 'adoption/spec.md', 'Data rules: nothing leaves Acme Corp.');
  const text = receipt(f.setup, { kit: f.kit });
  assert.match(text, /^- Kit: v9\.1\.0 \(installs recorded under v9\.1\.0\)\.$/m);
  assert.match(text, /^- Items recorded: 4\. Adopted 1, adapted 1, folded 1, skipped 1, undone 0\. From outside the kit: 1, not named here\.$/m);
  assert.match(text, /^- Kit items taken: guard \(adopted\), pack-media \(folded\)\.$/m);
  assert.match(text, /^- Kit items skipped: memory\.$/m);
  assert.match(text, /^- Checks: 0 passed, 2 failed \(guard, and 1 from outside the kit\), 1 pending\.$/m);
  assert.match(text, /^- Written: 3 files and 1 settings key\.$/m);
  assert.match(text, /^- Time: about \d+ minutes between the earliest and the latest last change of the files in adoption\//m);
  assert.match(text, /^- Sittings: 1 handoff note in adoption\/\.$/m);
  for (const secret of ['acme', 'Acme', 'CLAUDE.md', '.claude', f.setup, 'settings.json', '2026-11-26']) assert.ok(!text.includes(secret), `the receipt holds ${secret}`);
  setCheck(f.setup, 'guard', 'pass', { kit: f.kit });
  assert.match(receipt(f.setup, { kit: f.kit }), /^- Checks: 1 passed, 1 failed \(1 from outside the kit\), 1 pending\.$/m);
});

test('the command line: check exits 0 when clean, 1 on a change, 2 on bad input or a broken record; it never writes into the kit', (t) => {
  const f = fixture(t);
  const run = (...a) => spawnSync(process.execPath, [path.join(KIT, 'tools/installed.mjs'), ...a], { encoding: 'utf8' });
  let r = run('record', f.setup, 'guard', 'ADOPT', '--created', '.claude/skills/guard/run.sh', '--setting', '.claude/settings.json#hooks');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^recorded guard: ADOPT, 1 file \(1 created, 0 edited\), 1 settings key, kit v\d+\.\d+\.\d+/);
  assert.equal(run('check', f.setup).status, 0);
  f.w(f.setup, '.claude/skills/guard/run.sh', 'changed');
  r = run('check', f.setup, 'guard');
  assert.equal(r.status, 1);
  assert.match(r.stdout, / {2}changed {2}\.claude\/skills\/guard\/run\.sh \(created\)/);
  assert.match(r.stdout, / {2}unchanged {2}\.claude\/settings\.json#hooks \(settings key\)/);
  assert.equal(run('checked', f.setup, 'guard', 'pass').status, 0);
  assert.match(run('receipt', f.setup).stdout, /^## Adoption receipt/);
  for (const args of [['record', f.setup, 'guard', 'KEEP'], ['check', path.join(f.setup, 'nope')], ['record', f.setup, 'guard', 'ADOPT', '--copied', 'x'],
    ['record', f.setup, 'guard', 'ADOPT', '--constructor', 'x'], ['bogus', f.setup], ['record', KIT, 'guard', 'ADOPT'], ['check', path.join(KIT, 'docs')]]) {
    r = run(...args);
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stderr, /^error: /);
    assert.ok(!/\n {4}at /.test(r.stderr), 'no stack trace');
  }
  f.w(f.setup, 'adoption/installed.json', '{"items": "no"}');
  assert.equal(run('check', f.setup).status, 2);
  f.w(f.setup, 'adoption/installed.json', '{ broken');
  r = run('check', f.setup);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /adoption\/installed\.json: not valid JSON/);
});

test('where prints an item\'s recorded file by name, as an absolute path with /, and refuses a name two files share', (t) => {
  const f = fixture(t);
  recordItem(f.setup, { id: 'guard', decision: 'ADOPT', created: ['.claude/skills/guard'] }, f.opts);
  assert.equal(whereFile(f.setup, 'guard', 'run.sh', f.opts), path.join(f.setup, '.claude/skills/guard/run.sh').split(path.sep).join('/'));
  assert.equal(whereFile(f.setup, 'guard', 'guard/SKILL.md', f.opts), path.join(f.setup, '.claude/skills/guard/SKILL.md').split(path.sep).join('/'));
  assert.throws(() => whereFile(f.setup, 'guard', 'nope.sh', f.opts), /no file nope\.sh recorded for guard/);
  assert.throws(() => whereFile(f.setup, 'other', 'run.sh', f.opts), /no item other/);
  f.w(f.setup, 'p/a/SKILL.md', 'a');
  f.w(f.setup, 'p/b/SKILL.md', 'b');
  recordItem(f.setup, { id: 'two', decision: 'ADOPT', created: ['p'] }, f.opts);
  assert.throws(() => whereFile(f.setup, 'two', 'SKILL.md', f.opts), /2 files named SKILL\.md are recorded for two: give more of the path/);
  assert.equal(whereFile(f.setup, 'two', 'b/SKILL.md', f.opts), path.join(f.setup, 'p/b/SKILL.md').split(path.sep).join('/'));
});

test('undo removes what the install created and the folders the record names, never a folder above them', (t) => {
  const f = fixture(t);
  const tree = () => readdirSync(f.setup, { recursive: true }).map((r) => String(r).split(path.sep).join('/')).filter((r) => !r.startsWith('adoption')).sort();
  // A folder the person made before, empty: the install puts an agent in it, and the undo must leave it.
  mkdirSync(path.join(f.setup, '.claude/agents'), { recursive: true });
  const before = tree();
  f.w(f.setup, '.claude/skills/new-one/SKILL.md', 'new');
  f.w(f.setup, '.claude/skills/new-one/scripts/a.sh', 'a');
  f.w(f.setup, '.claude/agents/helper.md', 'agent');
  f.w(f.setup, 'CLAUDE.md', '# Front door\n\nUse new-one.\n');
  recordItem(f.setup, { id: 'new-one', decision: 'ADOPT', created: ['.claude/skills/new-one', '.claude/agents/helper.md'], edited: ['CLAUDE.md'], settings: ['.claude/settings.json#hooks'] }, f.opts);
  recordItem(f.setup, { id: 'skeptic', decision: 'ADOPT', created: ['~/.claude/agents/skeptic.md'] }, f.opts);
  const plan = undoPlan(f.setup, 'new-one', f.opts);
  assert.deepEqual(plan.remove, ['.claude/skills/new-one/SKILL.md', '.claude/skills/new-one/scripts/a.sh', '.claude/agents/helper.md']);
  assert.deepEqual(plan.left.map((l) => l.name), ['CLAUDE.md', '.claude/settings.json#hooks (settings key)']);
  assert.ok(existsSync(path.join(f.setup, '.claude/skills/new-one/SKILL.md')), 'a plan removes nothing');
  const done = undoItem(f.setup, 'new-one', f.opts);
  assert.deepEqual(done.removed, ['.claude/skills/new-one/SKILL.md', '.claude/skills/new-one/scripts/a.sh', '.claude/agents/helper.md', '.claude/skills/new-one/']);
  assert.equal(done.undone, false, 'not UNDONE while the card\'s Undo has work left');
  assert.equal(readRecord(f.setup).items.find((x) => x.id === 'new-one').decision, 'ADOPT');
  assert.ok(existsSync(path.join(f.setup, '.claude/agents')), 'the folder the person made stays, though empty');
  assert.ok(existsSync(path.join(f.setup, '.claude/skills/guard/SKILL.md')), 'files no record names stay');
  // Outside the setup only the recorded file goes: the agents folder above it stays, though empty.
  undoItem(f.setup, 'skeptic', f.opts);
  assert.ok(!existsSync(path.join(f.home, '.claude/agents/skeptic.md')));
  assert.ok(existsSync(path.join(f.home, '.claude/agents')));
  assert.equal(readRecord(f.setup).items.find((x) => x.id === 'skeptic').decision, 'UNDONE');
  assert.deepEqual(tree().filter((r) => r !== 'CLAUDE.md'), before.filter((r) => r !== 'CLAUDE.md'), 'every other path as before');
});

test('undo removes a folder made with --made once empty; it leaves a changed, added or shared file and a folder that is not empty', (t) => {
  const f = fixture(t);
  f.w(f.setup, 'tools/one/a.md', 'a');
  f.w(f.setup, 'tools/one/b.md', 'b');
  f.w(f.setup, 'tools/one/c.md', 'c');
  recordItem(f.setup, { id: 'one', decision: 'ADOPT', created: ['tools/one'], made: ['tools'] }, f.opts);
  recordItem(f.setup, { id: 'two', decision: 'ADOPT', created: ['tools/one/c.md'] }, f.opts);
  assert.deepEqual(checkSetup(f.setup, f.opts).items[0].parts.filter((p) => p.state === 'added'), [], 'a made folder is not this item\'s');
  f.w(f.setup, 'tools/one/a.md', 'edited');
  f.w(f.setup, 'tools/one/d.md', 'added');
  let done = undoItem(f.setup, 'one', f.opts);
  assert.deepEqual(done.removed, ['tools/one/b.md']);
  assert.deepEqual(done.left.map((l) => [l.name, l.why.split(':')[0]]), [
    ['tools/one/a.md', 'changed since the install'], ['tools/one/c.md', 'also written by two'], ['tools/one/d.md', 'added since the install'],
    ['tools/one/', 'not empty'], ['tools/', 'not empty']]);
  for (const p of ['a.md', 'c.md', 'd.md']) unlinkSync(path.join(f.setup, 'tools/one', p));
  // A name the record never lists, such as the one Finder writes, keeps the folder and the item open.
  f.w(f.setup, 'tools/one/.DS_Store', 'x');
  recordItem(f.setup, { id: 'two', decision: 'UNDONE' }, f.opts);
  done = undoItem(f.setup, 'one', f.opts);
  assert.equal(done.undone, false);
  assert.match(done.left.map((l) => `${l.name} ${l.why}`).join('\n'), /^tools\/one\/ not empty: it holds \.DS_Store/m);
  unlinkSync(path.join(f.setup, 'tools/one/.DS_Store'));
  done = undoItem(f.setup, 'one', f.opts);
  assert.deepEqual(done.removed, ['tools/one/', 'tools/']);
  assert.equal(done.undone, true);
  assert.ok(existsSync(f.setup));
  assert.throws(() => undoItem(f.setup, 'one', f.opts), /nothing to undo: one is recorded as UNDONE/);
  recordItem(f.setup, { id: 'skipped', decision: 'SKIP' }, f.opts);
  assert.throws(() => undoPlan(f.setup, 'skipped', f.opts), /nothing to undo: skipped is recorded as SKIP/);
});

test('undo never removes through a link: a file a junction or symlink leads to stays, outside the setup too', (t) => {
  const f = fixture(t);
  const shared = path.join(f.base, 'shared/x');
  f.w(f.base, 'shared/x/SKILL.md', 'shared');
  mkdirSync(path.join(f.setup, '.claude/skills'), { recursive: true });
  try {
    symlinkSync(shared, path.join(f.setup, '.claude/skills/x'), 'junction');
  } catch (e) {
    t.skip(`a link cannot be made here: ${e.code}`);
    return;
  }
  recordItem(f.setup, { id: 'x', decision: 'ADOPT', created: ['.claude/skills/x'] }, f.opts);
  const done = undoItem(f.setup, 'x', f.opts);
  assert.deepEqual(done.removed, []);
  assert.match(done.left.map((l) => `${l.name} ${l.why}`).join('\n'), /^\.claude\/skills\/x\/SKILL\.md reached through a link/m);
  assert.ok(existsSync(path.join(shared, 'SKILL.md')), 'the file outside the setup is untouched');
  assert.ok(lstatSync(path.join(f.setup, '.claude/skills/x')).isSymbolicLink(), 'the link stays');
});

test('undo on the command line prints a plan without --yes and acts only with it, printing what it removed', (t) => {
  const f = fixture(t);
  const run = (...a) => spawnSync(process.execPath, [path.join(KIT, 'tools/installed.mjs'), ...a], { encoding: 'utf8' });
  f.w(f.setup, 'x/a.md', 'a');
  assert.equal(run('record', f.setup, 'one', 'ADOPT', '--created', 'x').status, 0);
  let r = run('undo', f.setup, 'one');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^would remove {2}x\/a\.md$/m);
  assert.match(r.stdout, /^would remove, once empty {2}x\/$/m);
  assert.match(r.stdout, /^nothing removed: add --yes, after their yes$/m);
  assert.ok(existsSync(path.join(f.setup, 'x/a.md')));
  r = run('undo', f.setup, 'one', '--yes');
  assert.match(r.stdout, /^removed {2}x\/a\.md\nremoved {2}x\/\none: recorded as UNDONE$/m);
  assert.ok(!existsSync(path.join(f.setup, 'x')));
  assert.equal(run('undo', f.setup, 'one', '--force').status, 2);
  assert.equal(run('undo', f.setup, 'one', '--yes').status, 2, 'an undone item has nothing to undo');
  assert.equal(run('where', f.setup, 'one', 'a.md').status, 2, 'an undone item has no files');
});
