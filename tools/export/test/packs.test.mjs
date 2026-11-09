// tools/export/test/packs.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import * as nodeFs from 'node:fs';
const awaitFs = () => nodeFs;
import { makePackHub } from './fixture-hub.mjs';
import { hubInventory, classify, validateManifest } from '../manifest.mjs';

const withHub = (fn) => { const hub = makePackHub(); try { return fn(hub); } finally { rmSync(hub, { recursive: true, force: true }); } };

test('inventory reads core, stubs and packs from a restructured hub', () => withHub((hub) => {
  const inv = hubInventory(hub);
  assert.deepEqual(inv.skills, ['alpha', 'beta']);
  assert.deepEqual(inv.agents, ['gamma']);
  assert.deepEqual(inv.packs, [
    { id: 'pack-one-two-three', skills: ['one-job', 'stubby'], agents: ['seat-one'], standalone: ['stubby'] },
    { id: 'pack-with-licence-inside', skills: ['lic-job'], agents: [], standalone: [] },
    { id: 'private-pack-for-me', skills: ['secret-job'], agents: [], standalone: [] },
  ]);
}));

test('a stub is not an unclassified skill', () => withHub((hub) => {
  const inv = hubInventory(hub);
  assert.ok(!inv.skills.includes('stubby'));
  assert.ok(!inv.skills.includes('pack-one-two-three'));
  const manifest = { items: [
    { id: 'alpha', kind: 'skill', status: 'catalog-only', pack: 'catalog' }, { id: 'beta', kind: 'skill', status: 'catalog-only', pack: 'catalog' },
    { id: 'gamma', kind: 'agent', status: 'catalog-only', pack: 'catalog' },
    ...inv.packs.map((p) => ({ id: p.id, kind: 'pack', status: 'withheld', pack: 'none' })),
  ] };
  assert.deepEqual(classify(inv, manifest), { unclassified: [], missing: [] });
}));

test('a pack missing from the manifest is unclassified', () => withHub((hub) => {
  const inv = hubInventory(hub);
  const manifest = { items: [
    { id: 'alpha', kind: 'skill', status: 'catalog-only', pack: 'catalog' }, { id: 'beta', kind: 'skill', status: 'catalog-only', pack: 'catalog' },
    { id: 'gamma', kind: 'agent', status: 'catalog-only', pack: 'catalog' },
    { id: 'pack-one-two-three', kind: 'pack', status: 'shipped' },
    { id: 'ghost-pack-that-left', kind: 'pack', status: 'withheld' },
  ] };
  assert.deepEqual(classify(inv, manifest), { unclassified: ['pack:pack-with-licence-inside', 'pack:private-pack-for-me'], missing: ['pack:ghost-pack-that-left'] });
}));

test('a pack item validates: status shipped, private or withheld, importance and why for a shipped one', () => {
  const ok = { id: 'p', kind: 'pack', status: 'shipped', module: 'domains', importance: 'optional', why: 'A domain.' };
  assert.deepEqual(validateManifest({ items: [ok, { id: 'q', kind: 'pack', status: 'private' }, { id: 'r', kind: 'pack', status: 'withheld' }] }), []);
  const bad = validateManifest({ items: [{ id: 's', kind: 'pack', status: 'catalog-only' }] });
  assert.ok(bad.some((e) => e.startsWith('pack:s: a pack is public, shipped, private or withheld')), bad.join('\n'));
});

// ---- Task 2: shippable packs into the kit
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FIXTURE_OWNER } from './fixture-hub.mjs';
import { packShippable } from '../packs.mjs';
import { buildKit } from '../build.mjs';
import { gateLinks } from '../gates.mjs';

const base = [
  { id: 'alpha', kind: 'skill', status: 'catalog-only', pack: 'catalog' }, { id: 'beta', kind: 'skill', status: 'catalog-only', pack: 'catalog' },
  { id: 'gamma', kind: 'agent', status: 'catalog-only', pack: 'catalog' },
  { id: 'private-pack-for-me', kind: 'pack', status: 'private' },
];
const shipOne = [...base, { id: 'pack-one-two-three', kind: 'pack', status: 'shipped', why: 'A domain.' }, { id: 'pack-with-licence-inside', kind: 'pack', status: 'withheld' }];
const stage = () => mkdtempSync(path.join(os.tmpdir(), 'kit-out-'));

test('a pack with a LICENSE inside is not shippable', () => withHub((hub) => {
  const r = packShippable(hub, 'pack-with-licence-inside');
  assert.equal(r.ok, false);
  assert.ok(r.reasons.some((x) => /LICENSE/.test(x)), r.reasons.join('\n'));
  assert.deepEqual(packShippable(hub, 'pack-one-two-three'), { ok: true, reasons: [] });
}));

test('a shipped pack that is not shippable stops the build with its reasons', () => withHub((hub) => {
  const out = stage();
  try {
    const items = base.concat([{ id: 'pack-one-two-three', kind: 'pack', status: 'withheld' }, { id: 'pack-with-licence-inside', kind: 'pack', status: 'shipped', why: 'x' }]);
    assert.throws(() => buildKit({ hub, out, manifest: { items }, owner: FIXTURE_OWNER }), /pack:pack-with-licence-inside.*not shippable[\s\S]*LICENSE/);
  } finally { rmSync(out, { recursive: true, force: true }); }
}));

test('a shippable pack lands in catalog/packs, with its agents and stubs, and a withheld one does not', () => withHub((hub) => {
  const out = stage();
  try {
    const r = buildKit({ hub, out, manifest: { items: shipOne }, owner: FIXTURE_OWNER });
    const p = path.join(out, 'catalog/packs/pack-one-two-three');
    assert.match(readFileSync(path.join(p, 'SKILL.md'), 'utf8'), /Ask the owner\./);
    assert.ok(existsSync(path.join(p, 'skills/one-job.md')));
    assert.ok(existsSync(path.join(p, 'agents/seat-one.md')));
    assert.ok(existsSync(path.join(p, 'stubs/stubby/SKILL.md')));
    assert.ok(!existsSync(path.join(out, 'catalog/packs/pack-with-licence-inside')));
    assert.ok(r.written.includes('catalog/packs/pack-one-two-three/SKILL.md'));
    assert.ok(r.itemFiles['pack:pack-one-two-three'].includes('catalog/packs/pack-one-two-three/agents/seat-one.md'));
  } finally { rmSync(out, { recursive: true, force: true }); }
}));

test('provenance.json never ships', () => withHub((hub) => {
  const out = stage();
  try {
    buildKit({ hub, out, manifest: { items: shipOne }, owner: FIXTURE_OWNER });
    const p = path.join(out, 'catalog/packs/pack-one-two-three');
    for (const f of ['provenance.json', 'SCAN.md', 'pack.json', 'tests']) assert.ok(!existsSync(path.join(p, f)), f);
  } finally { rmSync(out, { recursive: true, force: true }); }
}));

test('nested pack files pass the links gate', () => withHub((hub) => {
  const out = stage();
  try {
    buildKit({ hub, out, manifest: { items: shipOne }, owner: FIXTURE_OWNER });
    assert.ok(existsSync(path.join(out, 'catalog/packs/pack-one-two-three/skills/one-job/helper.md')));
    assert.deepEqual(gateLinks(out).filter((f) => f.startsWith('catalog/packs/')), []);
  } finally { rmSync(out, { recursive: true, force: true }); }
}));

// ---- Task 3: domains in the menu
test('features.json lists shipped packs as domains with token costs', () => withHub((hub) => {
  const out = stage();
  try {
    const r = buildKit({ hub, out, manifest: { items: shipOne }, owner: FIXTURE_OWNER });
    assert.ok(r.written.includes('catalog/features.json'));
    const f = JSON.parse(readFileSync(path.join(out, 'catalog/features.json'), 'utf8'));
    assert.equal(f.domains.length, 1);
    const [d] = f.domains;
    assert.equal(d.id, 'pack-one-two-three');
    assert.equal(d.title, 'Title of pack-one-two-three');
    assert.deepEqual(d.skills, ['one-job', 'stubby']);
    assert.deepEqual(d.agents, ['seat-one']);
    const desc = JSON.parse(readFileSync(path.join(hub, 'library/pack-one-two-three/pack.json'), 'utf8')).description;
    assert.equal(d.alwaysOnTokens, Math.ceil(Buffer.byteLength(desc, 'utf8') / 4));
    assert.ok(Number.isInteger(d.indexTokens) && d.indexTokens > 0);
  } finally { rmSync(out, { recursive: true, force: true }); }
}));

test('FEATURES.md has a Domains section', () => withHub((hub) => {
  const out = stage();
  try {
    buildKit({ hub, out, manifest: { items: shipOne }, owner: FIXTURE_OWNER });
    const md = readFileSync(path.join(out, 'catalog/FEATURES.md'), 'utf8');
    assert.match(md, /^## Domains$/m);
    assert.match(md, /\| pack-one-two-three \| Title of pack-one-two-three: A domain\. \|/);
  } finally { rmSync(out, { recursive: true, force: true }); }
}));

test('a withheld pack is not a domain', () => withHub((hub) => {
  const out = stage();
  try {
    buildKit({ hub, out, manifest: { items: shipOne }, owner: FIXTURE_OWNER });
    const f = JSON.parse(readFileSync(path.join(out, 'catalog/features.json'), 'utf8'));
    assert.ok(!f.domains.some((d) => d.id === 'pack-with-licence-inside'));
    assert.doesNotMatch(readFileSync(path.join(out, 'catalog/FEATURES.md'), 'utf8'), /pack-with-licence-inside/);
  } finally { rmSync(out, { recursive: true, force: true }); }
}));

test('every shipped pack needs its card, and a pack card belongs to a shipped pack', async () => {
  const { gateCards } = await import('../gates.mjs');
  const { mkdirSync, writeFileSync } = await import('node:fs');
  const { cardText } = await import('./fixture-hub.mjs');
  const root = stage();
  try {
    mkdirSync(path.join(root, 'cards'));
    assert.deepEqual(gateCards(root, { items: shipOne }), ['cards/pack-pack-one-two-three.md: missing, the adoption card for pack:pack-one-two-three']);
    writeFileSync(path.join(root, 'cards/pack-pack-one-two-three.md'), cardText('pack-pack-one-two-three', 'domains'));
    assert.deepEqual(gateCards(root, { items: shipOne }), []);
    writeFileSync(path.join(root, 'cards/pack-pack-with-licence-inside.md'), cardText('x', 'domains'));
    assert.deepEqual(gateCards(root, { items: shipOne }), ['cards/pack-pack-with-licence-inside.md: a card for no menu item']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ---- a public pack ships when it is shippable, with no manual flip
import { resolvePacks } from '../packs.mjs';

test('a public pack is shipped when shippable and withheld when not, with the reasons', () => withHub((hub) => {
  const items = [...base, { id: 'pack-one-two-three', kind: 'pack', status: 'public', why: 'A domain.' }, { id: 'pack-with-licence-inside', kind: 'pack', status: 'public', why: 'x' }];
  const r = resolvePacks(hub, { items });
  const st = Object.fromEntries(r.items.filter((i) => i.kind === 'pack').map((i) => [i.id, i.status]));
  assert.deepEqual(st, { 'pack-one-two-three': 'shipped', 'pack-with-licence-inside': 'withheld', 'private-pack-for-me': 'private' });
  assert.ok(r.items.find((i) => i.id === 'pack-with-licence-inside').reasons.some((x) => /LICENSE/.test(x)));
}));

test('a public pack with a hold stays withheld and says why', () => withHub((hub) => {
  const items = [...base, { id: 'pack-one-two-three', kind: 'pack', status: 'public', why: 'A domain.', hold: 'examples name a private app' }, { id: 'pack-with-licence-inside', kind: 'pack', status: 'withheld' }];
  const it = resolvePacks(hub, { items }).items.find((i) => i.id === 'pack-one-two-three');
  assert.equal(it.status, 'withheld');
  assert.deepEqual(it.reasons, ['hold: examples name a private app']);
}));

test('buildKit ships a public shippable pack and leaves a licensed one out', () => withHub((hub) => {
  const out = stage();
  try {
    const items = [...base, { id: 'pack-one-two-three', kind: 'pack', status: 'public', why: 'A domain.' }, { id: 'pack-with-licence-inside', kind: 'pack', status: 'public', why: 'x' }];
    buildKit({ hub, out, manifest: { items }, owner: FIXTURE_OWNER });
    assert.ok(existsSync(path.join(out, 'catalog/packs/pack-one-two-three/SKILL.md')));
    assert.ok(!existsSync(path.join(out, 'catalog/packs/pack-with-licence-inside')));
    const f = JSON.parse(readFileSync(path.join(out, 'catalog/features.json'), 'utf8'));
    assert.deepEqual(f.domains.map((d) => d.id), ['pack-one-two-three']);
  } finally { rmSync(out, { recursive: true, force: true }); }
}));

// ---- the router skill keeps only rows for what the kit ships
import { pruneRouterRows } from '../packs.mjs';

test('router rows for skills the kit does not ship are dropped; built-in commands and shipped skills stay', () => {
  const text = ['| Situation | Go to |', '|---|---|', '| Plan | `writing-plans` |', '| Look | `frontend-design` (pack not-shipped) |',
    '| Review | `/code-review` (the ultra level) |', '| Learn | `/teach` |', '| Both | `tdd` or `x-y` |', 'Prose line with `frontend-design`.'].join('\n');
  const r = pruneRouterRows(text, { known: new Set(['writing-plans', 'tdd']), goneSlash: new Set(['teach']) });
  assert.deepEqual(r.dropped, ['frontend-design', '/teach']);
  assert.equal(r.text, ['| Situation | Go to |', '|---|---|', '| Plan | `writing-plans` |', '| Review | `/code-review` (the ultra level) |', '| Both | `tdd` or `x-y` |', 'Prose line with `frontend-design`.'].join('\n'));
});

// ---- a pack the hub marks public:false is hub-only
test('a hub-only pack (public: false) needs no manifest entry, and its stub is not a core skill', () => withHub((hub) => {
  const fs = awaitFs();
  const f = path.join(hub, 'library/private-pack-for-me/pack.json');
  const p = JSON.parse(fs.readFileSync(f, 'utf8'));
  p.public = false;
  p.standalone = [{ id: 'secret-job', userOnly: true }];
  fs.writeFileSync(f, JSON.stringify(p));
  fs.mkdirSync(path.join(hub, '.claude/skills/secret-job'), { recursive: true });
  fs.writeFileSync(path.join(hub, '.claude/skills/secret-job/SKILL.md'), '---\nname: secret-job\ndescription: x\n---\nstub\n');
  const inv = hubInventory(hub);
  assert.ok(!inv.packs.some((x) => x.id === 'private-pack-for-me'));
  assert.deepEqual(inv.hiddenPacks.map((x) => x.id), ['private-pack-for-me']);
  assert.ok(!inv.skills.includes('secret-job'));
  const manifest = { items: [
    { id: 'alpha', kind: 'skill', status: 'catalog-only', pack: 'catalog' }, { id: 'beta', kind: 'skill', status: 'catalog-only', pack: 'catalog' },
    { id: 'gamma', kind: 'agent', status: 'catalog-only', pack: 'catalog' },
    { id: 'pack-one-two-three', kind: 'pack', status: 'withheld' }, { id: 'pack-with-licence-inside', kind: 'pack', status: 'withheld' },
  ] };
  assert.deepEqual(classify(inv, manifest), { unclassified: [], missing: [] });
}));
