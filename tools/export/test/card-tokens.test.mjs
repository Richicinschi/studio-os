// tools/export/test/card-tokens.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { allowedFigures, BYTES_ALLOW, checkAllCards, checkByteClaims, checkCard, checkPackScripts, checkStudioLines } from '../card-tokens.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..', '..');

test('every token figure in a card is within 10% of the figure computed from the shipped file', () => {
  assert.deepEqual(checkAllCards(root), []);
});

function fixture(card) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-cards-'));
  mkdirSync(path.join(dir, 'cards'));
  writeFileSync(path.join(dir, 'cards', 'demo.md'), card);
  const features = { modules: [{ id: 'm', items: [{ id: 'demo', kind: 'skill', everySessionTokens: 60, onDemandTokens: 2000 }] }], domains: [] };
  return { dir, features };
}
const card = (fm, text) => `---\nid: demo\nmodule: m\nchecked: 2026-11-09\n${fm}---\n\n# Demo\n\n${text}\n`;

test('a skill card must state its description and body, and a figure that drifts more than 10% is flagged', () => {
  const ok = fixture(card('tokens:\n  description: 62\n  body: 1900\n', 'Its description costs about 62 tokens; the body, about 2,100 tokens, loads on use.'));
  const bad = fixture(card('tokens:\n  description: 90\n  body: 2000\n', 'The body, about 3,000 tokens, loads on use.'));
  const none = fixture(card('', 'Nothing stated.'));
  try {
    assert.deepEqual(checkCard(ok.dir, 'demo', ok.features), []);
    const f = checkCard(bad.dir, 'demo', bad.features);
    assert.ok(f.some((x) => /tokens\.description is 90, computed 60/.test(x)), f.join('\n'));
    assert.ok(f.some((x) => /"3,000 tokens"/.test(x)), f.join('\n'));
    assert.equal(checkCard(none.dir, 'demo', none.features).length, 2);
  } finally { for (const x of [ok, bad, none]) rmSync(x.dir, { recursive: true, force: true }); }
});

test('a figure that is not a file size is allowed only when the card lists it in other_figures', () => {
  const listed = fixture(card('tokens:\n  description: 60\n  body: 2000\nother_figures:\n  - 30000\n', 'A session started at about 30,000 tokens.'));
  const unlisted = fixture(card('tokens:\n  description: 60\n  body: 2000\n', 'A session started at about 30,000 tokens.'));
  try {
    assert.deepEqual(checkCard(listed.dir, 'demo', listed.features), []);
    assert.equal(checkCard(unlisted.dir, 'demo', unlisted.features).length, 1);
  } finally { for (const x of [listed, unlisted]) rmSync(x.dir, { recursive: true, force: true }); }
});

// A domain with one agent and two stubs, one of them started only by name (disable-model-invocation: true).
function domainFixture(full) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-cards-'));
  const w = (rel, text) => { mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); writeFileSync(path.join(dir, rel), text); };
  const pack = 'catalog/packs/dom';
  w(`${pack}/SKILL.md`, `---\nname: dom\ndescription: ${'e'.repeat(400)}\n---\n${'i'.repeat(800)}`);
  w(`${pack}/agents/seat.md`, `---\nname: seat\ndescription: ${'a'.repeat(200)}\n---\nA seat.\n`);
  w(`${pack}/stubs/model-stub/SKILL.md`, `---\nname: model-stub\ndescription: ${'m'.repeat(200)}\n---\nRead the pack.\n`);
  w(`${pack}/stubs/hand-stub/SKILL.md`, `---\nname: hand-stub\ndescription: ${'h'.repeat(2000)}\ndisable-model-invocation: true\n---\nRead the pack.\n`);
  w('cards/pack-dom.md', `---\nid: pack-dom\nchecked: 2026-11-20\ntokens:\n  light: 100\n  standard: 100\n  full: ${full}\n---\n\n# dom\n`);
  const features = { modules: [], domains: [{ id: 'dom', alwaysOnTokens: 100, indexTokens: 200 }] };
  return { dir, features };
}

test('a domain stub Claude cannot start adds nothing every session: the full figure leaves its description out', () => {
  const without = domainFixture(200);
  const withIt = domainFixture(700);
  try {
    const allowed = allowedFigures(without.dir, 'pack-dom', without.features);
    assert.equal(allowed.get('entry plus every agent and stub description'), 200);
    assert.equal(allowed.get('every stub description'), 50);
    assert.equal(allowed.get('stub description model-stub'), 50);
    assert.equal(allowed.has('stub description hand-stub'), false);
    assert.deepEqual(checkCard(without.dir, 'pack-dom', without.features), []);
    const f = checkCard(withIt.dir, 'pack-dom', withIt.features);
    assert.ok(f.some((x) => /tokens\.full is 700, the entry with every agent and stub description is 200/.test(x)), f.join('\n'));
  } finally { for (const x of [without, withIt]) rmSync(x.dir, { recursive: true, force: true }); }
});

test('a skill started by name states a description of 0 tokens', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-cards-'));
  try {
    mkdirSync(path.join(dir, 'cards'));
    writeFileSync(path.join(dir, 'cards', 'demo.md'), card('tokens:\n  description: 0\n  body: 2000\n', 'You start it by name.'));
    const features = { modules: [{ id: 'm', items: [{ id: 'demo', kind: 'skill', loads: 'by-name', everySessionTokens: 0, onDemandTokens: 2000 }] }], domains: [] };
    assert.deepEqual(checkCard(dir, 'demo', features), []);
    assert.equal(allowedFigures(dir, 'demo', features).get('description'), 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('a domain card states full as computed: a stub no longer earns 10% more on top', () => {
  const over = domainFixture(230);
  try {
    const f = checkCard(over.dir, 'pack-dom', over.features);
    assert.ok(f.some((x) => /tokens\.full is 230, the entry with every agent and stub description is 200/.test(x)), f.join('\n'));
  } finally { rmSync(over.dir, { recursive: true, force: true }); }
});

// A skill whose body is 1,637 tokens and whose folder (one SKILL.md of 7,928 bytes) is 1,982.
function labelFixture(text) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-cards-'));
  mkdirSync(path.join(dir, 'cards'));
  mkdirSync(path.join(dir, 'catalog', 'skills', 'demo'), { recursive: true });
  writeFileSync(path.join(dir, 'catalog', 'skills', 'demo', 'SKILL.md'), 'x'.repeat(7928));
  writeFileSync(path.join(dir, 'cards', 'demo.md'), card('tokens:\n  description: 57\n  body: 1637\n', text));
  const features = { modules: [{ id: 'm', items: [{ id: 'demo', kind: 'skill', everySessionTokens: 57, onDemandTokens: 1637 }] }], domains: [] };
  return { dir, features };
}

test('a figure in a card sentence is checked against the value its label names', () => {
  const body = labelFixture('The description loads every session, about 57 tokens; the body, about 2,060 tokens, loads only when it is used.');
  const folder = labelFixture('The description loads every session, about 57 tokens. The folder, about 2,060 tokens, is what you copy.');
  const unlabelled = labelFixture('Its instructions, about 1,640 tokens, load only when it runs.');
  const nearest = labelFixture('The body is loaded on use; the description costs about 1,640 tokens.');
  try {
    assert.equal(allowedFigures(folder.dir, 'demo', folder.features).get('folder total'), 1982);
    const f = checkCard(body.dir, 'demo', body.features);
    assert.equal(f.length, 1, f.join('\n'));
    assert.match(f[0], /"2,060 tokens".*body.*1637/);
    assert.deepEqual(checkCard(folder.dir, 'demo', folder.features), []);
    const u = checkCard(unlabelled.dir, 'demo', unlabelled.features);
    assert.equal(u.length, 1, u.join('\n'));
    assert.match(u[0], /"1,640 tokens".*names no figure/);
    const n = checkCard(nearest.dir, 'demo', nearest.features);
    assert.equal(n.length, 1, n.join('\n'));
    assert.match(n[0], /"1,640 tokens".*description.*57/);
  } finally { for (const x of [body, folder, unlabelled, nearest]) rmSync(x.dir, { recursive: true, force: true }); }
});

test('a label after the figure counts when none comes before it in the sentence', () => {
  const after = labelFixture('About 57 tokens load every session. About 1,640 tokens is the body.');
  const wrong = labelFixture('About 1,640 tokens load every session.');
  try {
    assert.deepEqual(checkCard(after.dir, 'demo', after.features), []);
    assert.equal(checkCard(wrong.dir, 'demo', wrong.features).length, 1);
  } finally { for (const x of [after, wrong]) rmSync(x.dir, { recursive: true, force: true }); }
});

// A pack with three script files (by extension and by shebang) and two that are not scripts.
function packFixture(cardText) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-cards-'));
  const w = (rel, text) => { mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); writeFileSync(path.join(dir, rel), text); };
  const pack = 'catalog/packs/dom';
  w(`${pack}/SKILL.md`, '---\nname: dom\ndescription: d\n---\nSay "studio rule" here.\n');
  w(`${pack}/skills/brand/scripts/sync-tokens.cjs`, 'module.exports = 1;\n');
  w(`${pack}/skills/brand/scripts/check.py`, 'print(1)\n');
  w(`${pack}/skills/brand/run-me`, '#!/usr/bin/env bash\necho hi\n');
  w(`${pack}/skills/brand/notes.md`, 'See `tokens.json`.\n');
  w(`${pack}/skills/brand/data.json`, '{}\n');
  w('cards/pack-dom.md', `---\nid: pack-dom\nchecked: 2026-11-20\n---\n\n# dom\n\n${cardText}\n`);
  return dir;
}

test('a pack card names every script file the pack ships', () => {
  const missing = packFixture('Read `skills/brand/scripts/sync-tokens.cjs` and `check.py` together.');
  const all = packFixture('Read `sync-tokens.cjs`, `check.py` and `skills/brand/run-me` together.');
  try {
    const f = checkPackScripts(missing, 'pack-dom');
    assert.equal(f.length, 1, f.join('\n'));
    assert.match(f[0], /cards\/pack-dom\.md.*skills\/brand\/run-me/);
    assert.deepEqual(checkPackScripts(all, 'pack-dom'), []);
    assert.deepEqual(checkPackScripts(all, 'demo'), []);
  } finally { for (const x of [missing, all]) rmSync(x, { recursive: true, force: true }); }
});

test('every backticked phrase a card quotes as studio-specific occurs in the shipped item', () => {
  const ghost = packFixture('## Watch out\n\n- **Studio-specific wording.** The skills carry `studio rule` lines,\n  a `ghost line` and a note in `skills/brand/notes.md`.\n- **Other.** `not checked here`.');
  const ok = packFixture('## Watch out\n\n- **Studio references.** The skills carry `studio rule` lines and a pointer to `tokens.json`.');
  try {
    const f = checkStudioLines(ghost, 'pack-dom');
    assert.equal(f.length, 1, f.join('\n'));
    assert.match(f[0], /cards\/pack-dom\.md.*`ghost line`/);
    assert.deepEqual(checkStudioLines(ok, 'pack-dom'), []);
  } finally { for (const x of [ghost, ok]) rmSync(x, { recursive: true, force: true }); }
});

test('checkAllCards runs the script and studio-line checks too', () => {
  const dir = packFixture('- **Studio-specific names.** It points to `ghost-skill`.');
  try {
    writeFileSync(path.join(dir, 'catalog', 'features.json'), JSON.stringify({ modules: [], domains: [{ id: 'dom', alwaysOnTokens: 1, indexTokens: 1 }] }));
    const f = checkAllCards(dir);
    assert.ok(f.some((x) => /sync-tokens\.cjs/.test(x)), f.join('\n'));
    assert.ok(f.some((x) => /`ghost-skill`/.test(x)), f.join('\n'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('a figure under 20 is checked when its sentence names a label, and passes unchecked when it names none', () => {
  const d = domainFixture(200);
  try {
    const text = (body) => writeFileSync(path.join(d.dir, 'cards', 'pack-dom.md'), `---\nid: pack-dom\nchecked: 2026-11-20\ntokens:\n  light: 100\n  standard: 100\n  full: 200\n---\n\n# dom\n\n${body}\n`);
    text('- Yes: the stub `hand-stub`, which you start yourself. About 16 tokens every session (estimate).');
    const f = checkCard(d.dir, 'pack-dom', d.features);
    assert.equal(f.length, 1, f.join('\n'));
    assert.match(f[0], /"16 tokens".*"every session" names/);
    text('- Yes: the stub `hand-stub`. You start it by name: Claude cannot start it itself, so its description never loads and it costs 0 tokens every session.\n- Each row adds about 13 tokens.');
    assert.deepEqual(checkCard(d.dir, 'pack-dom', d.features), []);
    // Without a stub started by name, "by name" names nothing, and 0 every session is wrong.
    rmSync(path.join(d.dir, 'catalog/packs/dom/stubs/hand-stub'), { recursive: true, force: true });
    const g = checkCard(d.dir, 'pack-dom', d.features);
    assert.equal(g.length, 1, g.join('\n'));
    assert.match(g[0], /"0 tokens".*"every session" names/);
  } finally { rmSync(d.dir, { recursive: true, force: true }); }
});

test('a front-matter key other than description, body, light, standard and full names no figure', () => {
  const odd = fixture(card('tokens:\n  description: 60\n  body: 2000\n  folder: 9999\n', 'The folder, about 9,999 tokens, is what you copy.'));
  try {
    const f = checkCard(odd.dir, 'demo', odd.features);
    assert.equal(f.length, 1, f.join('\n'));
    assert.match(f[0], /"9,999 tokens".*names no figure/);
  } finally { rmSync(odd.dir, { recursive: true, force: true }); }
});

test('a card states no size in bytes, except before "divided by 4" or on an allowed line', () => {
  const allow = [{ file: 'cards/demo.md', phrase: 'loads the first 25 KB', why: 'a documented limit' }];
  const text = [
    'Detect: `wc -c < identity/USER.md`, and `docker info --format \'{{.MemTotal}} bytes\'`.',
    'Its size is 1,430 bytes.',
    'An estimate: its 107 bytes divided by 4.',
    'Claude Code loads the first 25 KB of the file.',
    'The cap is 25 KB here, and 1.5 MB there.',
    'Only bytes pass before the estimator: its 2 KB divided by 4.',
  ].join('\n');
  const c = fixture(card('tokens:\n  description: 60\n  body: 2000\n', text));
  try {
    const f = checkByteClaims(c.dir, 'demo', allow);
    assert.deepEqual(f.map((x) => x.replace(/ is a size in bytes.*/, '')), [
      'cards/demo.md:13 "1,430 bytes"',
      'cards/demo.md:16 "25 KB"',
      'cards/demo.md:16 "1.5 MB"',
      'cards/demo.md:17 "2 KB"',
    ]);
    assert.equal(checkByteClaims(c.dir, 'demo', []).length, 5, 'without the allow entry, the documented limit is a finding too');
    assert.ok(Array.isArray(BYTES_ALLOW) && BYTES_ALLOW.every((a) => a.file && a.phrase && a.why), 'BYTES_ALLOW entries are { file, phrase, why }');
  } finally { rmSync(c.dir, { recursive: true, force: true }); }
});

test('checkAllCards runs the byte check too', () => {
  const dir = packFixture('The entry is 400 bytes.');
  try {
    writeFileSync(path.join(dir, 'catalog', 'features.json'), JSON.stringify({ modules: [], domains: [{ id: 'dom', alwaysOnTokens: 1, indexTokens: 1 }] }));
    assert.ok(checkAllCards(dir).some((x) => /"400 bytes"/.test(x)));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('a domain card sentence names the entry, the index or an agent', () => {
  const d = domainFixture(200);
  try {
    const text = (body) => writeFileSync(path.join(d.dir, 'cards', 'pack-dom.md'), `---\nid: pack-dom\nchecked: 2026-11-20\ntokens:\n  light: 100\n  standard: 100\n  full: 200\n---\n\n# dom\n\n${body}\n`);
    text('- Yes: `seat`, which reviews: about 50 tokens every session (estimate).\n- **The entry is the one cost every session:** about 100 tokens. Its index, about 200 tokens, loads on use.');
    assert.deepEqual(checkCard(d.dir, 'pack-dom', d.features), []);
    text('- **The entry is the one cost every session:** about 100 tokens. Its index, about 250 tokens, loads on use.');
    const f = checkCard(d.dir, 'pack-dom', d.features);
    assert.equal(f.length, 1, f.join('\n'));
    assert.match(f[0], /"250 tokens".*"index" names \(200\)/);
  } finally { rmSync(d.dir, { recursive: true, force: true }); }
});
