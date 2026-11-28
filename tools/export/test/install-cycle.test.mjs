// tools/export/test/install-cycle.test.mjs
// Public issues #12 and #32: for every item that ships files, install, check and undo in a throwaway setup,
// and the undo leaves the setup as it was. The install follows vet-and-adopt's copy rules (section 4, an item
// taken as it is); the check is tools/check-setup.mjs, the record's files and the card's check block; the
// undo is tools/installed.mjs. Cards with install: lines in their check block are installed the same way.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recordItem, undoItem, readRecord } from '../../installed.mjs';
import { checkItems, checkItemsText, parseChecks } from '../../check-setup.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const dirs = (rel) => (existsSync(path.join(KIT, rel)) ? readdirSync(path.join(KIT, rel), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : []);

// What each item copies, as [kit path, setup path] pairs, by vet-and-adopt's rules.
function copies(kind, id) {
  if (kind === 'skill') return [[`catalog/skills/${id}`, `.claude/skills/${id}`]];
  if (kind === 'agent') return [[`catalog/agents/${id}.md`, `.claude/agents/${id}.md`]];
  const root = `catalog/packs/${id}`;
  const out = [[`${root}/SKILL.md`, `.claude/skills/${id}/SKILL.md`]];
  if (existsSync(path.join(KIT, root, 'skills'))) out.push([`${root}/skills`, `.claude/skills/${id}/skills`]);
  for (const stub of dirs(`${root}/stubs`)) out.push([`${root}/stubs/${stub}/SKILL.md`, `.claude/skills/${stub}/SKILL.md`]);
  if (existsSync(path.join(KIT, root, 'agents'))) {
    for (const a of readdirSync(path.join(KIT, root, 'agents')).filter((f) => f.endsWith('.md')).sort()) out.push([`${root}/agents/${a}`, `.claude/agents/${a}`]);
  }
  return out;
}

const items = [
  ...dirs('catalog/skills').map((id) => ({ card: id, pairs: copies('skill', id) })),
  ...(existsSync(path.join(KIT, 'catalog/agents')) ? readdirSync(path.join(KIT, 'catalog/agents')).filter((f) => f.endsWith('.md')).sort() : [])
    .map((f) => ({ card: f.slice(0, -3), pairs: copies('agent', f.slice(0, -3)) })),
  ...dirs('catalog/packs').map((id) => ({ card: `pack-${id}`, pairs: copies('pack', id) })),
];
// Cards that say in their check block how the kit's own files install, for this test.
const shipped = new Set(items.map((i) => i.card));
for (const f of readdirSync(path.join(KIT, 'cards')).filter((n) => n.endsWith('.md')).sort()) {
  const { install } = parseChecks(readFileSync(path.join(KIT, 'cards', f), 'utf8'));
  if (install.length && !shipped.has(f.slice(0, -3))) items.push({ card: f.slice(0, -3), pairs: install.map((i) => [i.from, i.to]) });
}

// Every path under the setup but the adoption record, with each file's bytes.
const snapshot = (root) => readdirSync(root, { recursive: true }).map((r) => String(r).split(path.sep).join('/'))
  .filter((r) => r !== 'adoption' && !r.startsWith('adoption/')).sort()
  .map((r) => (statSync(path.join(root, r)).isFile() ? `${r} ${createHash('sha256').update(readFileSync(path.join(root, r))).digest('hex')}` : `${r}/`));

test('the kit ships items to install: every skill, agent and domain, and the cards whose check block installs', () => {
  assert.ok(items.filter((i) => !i.card.startsWith('pack-')).length >= 20, items.map((i) => i.card).join(', '));
  assert.ok(items.filter((i) => i.card.startsWith('pack-')).length >= 15);
});

for (const item of items) {
  test(`${item.card}: install, check and undo in a throwaway setup, which the undo leaves as it was`, async (t) => {
    const setup = mkdtempSync(path.join(os.tmpdir(), 'kit-cycle-'));
    t.after(() => rmSync(setup, { recursive: true, force: true }));
    // A setup with something of its own in it, which nothing may touch.
    // An empty agents folder they made: an install that puts an agent in it, and its undo, must leave it.
    mkdirSync(path.join(setup, '.claude/skills/their-own'), { recursive: true });
    mkdirSync(path.join(setup, '.claude/agents'), { recursive: true });
    writeFileSync(path.join(setup, 'CLAUDE.md'), '# Their front door\n');
    writeFileSync(path.join(setup, '.claude/skills/their-own/SKILL.md'), '---\nname: their-own\ndescription: x\n---\n');
    const before = snapshot(setup);
    // The folders the install makes to hold its files are recorded with --made, as vet-and-adopt says.
    const made = [];
    for (const [from, to] of item.pairs) {
      assert.ok(existsSync(path.join(KIT, from)), `${from} is in the kit`);
      for (let d = path.dirname(to); d !== '.' && !existsSync(path.join(setup, d)); d = path.dirname(d)) made.push(d);
      mkdirSync(path.dirname(path.join(setup, to)), { recursive: true });
      cpSync(path.join(KIT, from), path.join(setup, to), { recursive: true });
    }
    recordItem(setup, { id: item.card, decision: 'ADOPT', created: item.pairs.map(([, to]) => to), made }, { kit: KIT });
    const [result] = await checkItems(setup, { kit: KIT, ids: [item.card] });
    assert.equal(result.status, 'pass', checkItemsText([result]));
    assert.ok(result.files > 0);
    const done = undoItem(setup, item.card, { kit: KIT });
    assert.deepEqual(done.left, []);
    assert.equal(done.undone, true);
    assert.deepEqual(snapshot(setup), before);
    assert.equal(readRecord(setup).items[0].decision, 'UNDONE');
  });
}
