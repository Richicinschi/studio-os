// tools/export/test/export.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { makeFixtureHub, FIXTURE_OWNER, cardText } from './fixture-hub.mjs';
import { CHANGELOG_HEAD } from '../changelog.mjs';
import { runExport } from '../export.mjs';

const flags = { importance: 'optional', why: 'Fixes a problem some adopters have.' };
const manifest = { kit: 'studio-os', version: '2.0.0', items: [
  { id: 'alpha', kind: 'skill', status: 'shipped', pack: 'way-of-working', module: '01-continuity', ...flags },
  { id: 'beta', kind: 'skill', status: 'shipped', pack: 'data-work', module: '09-data-work', ...flags },
  { id: 'gamma', kind: 'agent', status: 'shipped', pack: 'way-of-working', module: '08-agents-and-council', ...flags },
  { id: 'tool', kind: 'external', status: 'link-only', pack: 'foundation', module: '05-skills', upstream: 'https://example.invalid/tool', licence: 'MIT', install: 'see docs', loads: 'none', ...flags },
] };

// A fresh kit as a maintainer has it before the first release: entry files, the changelog header, and
// the two local files (deny list position 2 is an invented private term).
function setup() {
  const hub = makeFixtureHub();
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-root-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  w('export.manifest.json', JSON.stringify(manifest));
  w('README.md', '# Kit\n');
  w('LICENSE', 'MIT License\n');
  w('START-HERE.md', '# Start here\n\n### Windows\nx\n\n### macOS\nx\n\n### Linux\nx\n');
  w('ADOPT.md', '# Adopt\n');
  w('CHANGELOG.md', CHANGELOG_HEAD);
  w('tools/export/privacy.local.txt', `# test terms\n${FIXTURE_OWNER}\nQuenlin\n`);
  w('tools/export/owner.local.txt', `${FIXTURE_OWNER}\n`);
  w('tools/export/private.local.txt', '# nothing private in the fixture\n');
  w('tools/export/rewrites.local.json', '[]\n');
  for (const it of manifest.items) w(`cards/${it.id}.md`, cardText(it.id, it.module));
  const lines = [];
  const run = (o = {}) => runExport({ root, hub, noGitleaks: true, today: '2026-11-02', log: (l) => lines.push(String(l)), rewrites: [], ...o });
  return { hub, root, w, lines, run, done: () => { rmSync(hub, { recursive: true, force: true }); rmSync(root, { recursive: true, force: true }); } };
}
const clean = (h, args) => (args[0] === 'status' ? '' : 'abc123');

test('a clean dry run builds the catalog into the kit', () => {
  const s = setup();
  try {
    assert.equal(s.run(), 0, s.lines.join('\n'));
    const alpha = readFileSync(path.join(s.root, 'catalog/skills/alpha/SKILL.md'), 'utf8');
    assert.match(alpha, /ask the owner\./);
    assert.ok(existsSync(path.join(s.root, 'docs/THIRD_PARTY_NOTICES.md')));
  } finally { s.done(); }
});

test('the export refuses to start without any one of its four local files, and builds nothing', () => {
  for (const f of ['privacy.local.txt', 'owner.local.txt', 'private.local.txt', 'rewrites.local.json']) {
    const s = setup();
    try {
      rmSync(path.join(s.root, 'tools/export', f));
      assert.equal(s.run(), 2, `${f}: ${s.lines.join('\n')}`);
      assert.match(s.lines.join('\n'), /missing: .*never commit it/, f);
      assert.equal(existsSync(path.join(s.root, 'catalog')), false, f);
    } finally { s.done(); }
  }
});

test('local rewrites from the gitignored file apply in the build and never enter the kit', () => {
  const s = setup();
  try {
    s.w('tools/export/rewrites.local.json', JSON.stringify([{ file: 'catalog/skills/alpha/SKILL.md', phrase: 'and ask', replacement: 'and then ask', why: 'a test', gone: 'and ask' }]));
    assert.equal(s.run(), 0, s.lines.join('\n'));
    assert.match(readFileSync(path.join(s.root, 'catalog/skills/alpha/SKILL.md'), 'utf8'), /and then ask the owner\./);
    s.w('tools/export/rewrites.local.json', '[{"file": "catalog/skills/alpha/SKILL.md"}]');
    assert.equal(s.run(), 2);
    assert.match(s.lines.join('\n'), /local rewrites need file, phrase or pattern, replacement, why and gone: entry 1/);
  } finally { s.done(); }
});

test('a menu item without its adoption card fails the export, and so does a card for no menu item', () => {
  const s = setup();
  try {
    rmSync(path.join(s.root, 'cards/beta.md'));
    s.w('cards/old.md', cardText('old', '01-continuity'));
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /cards: FAIL \(2\)/);
    assert.match(out, /cards\/beta\.md: missing, the adoption card for skill:beta/);
    assert.match(out, /cards\/old\.md: a card for no menu item/);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('a hub item whose name must never ship is classified private from the local file, not the manifest', () => {
  const s = setup();
  try {
    const id = `${FIXTURE_OWNER.toLowerCase()}-voice`;
    mkdirSync(path.join(s.hub, '.claude/skills', id), { recursive: true });
    writeFileSync(path.join(s.hub, '.claude/skills', id, 'SKILL.md'), `---\nname: ${id}\ndescription: Private.\n---\n`);
    assert.equal(s.run(), 1);
    assert.match(s.lines.join('\n'), new RegExp(`unclassified hub items.*skill:${id}`));
    s.lines.length = 0;
    s.w('tools/export/private.local.txt', `# hub items never exported, one kind:id per line\nskill:${id}\n`);
    assert.equal(s.run(), 0, s.lines.join('\n'));
    assert.equal(readFileSync(path.join(s.root, 'export.manifest.json'), 'utf8').includes(id), false);
    assert.equal(existsSync(path.join(s.root, 'catalog/skills', id)), false);
    assert.equal(readFileSync(path.join(s.root, 'catalog/INDEX.md'), 'utf8').includes(id), false);
  } finally { s.done(); }
});

test('the export writes the feature menu into the catalog', () => {
  const s = setup();
  try {
    assert.equal(s.run(), 0, s.lines.join('\n'));
    const f = JSON.parse(readFileSync(path.join(s.root, 'catalog/features.json'), 'utf8'));
    assert.deepEqual(f.modules.map((m) => m.id), ['01-continuity', '05-skills', '08-agents-and-council', '09-data-work']);
    assert.ok(existsSync(path.join(s.root, 'catalog/FEATURES.md')));
  } finally { s.done(); }
});

test('a --note that fails a gate stops the export before anything is built, without echoing the term', () => {
  const s = setup();
  try {
    assert.equal(s.run({ notes: ['Thanks to Quenlin.'] }), 2);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
    assert.match(s.lines.join('\n'), /--note 1: denied term #2/);
    assert.equal(s.lines.join('\n').includes('Quenlin'), false);
  } finally { s.done(); }
});

test('a failing gate leaves the kit exactly as it was', () => {
  const s = setup();
  try {
    s.w('catalog/skills/alpha/SKILL.md', 'previous');
    writeFileSync(path.join(s.hub, '.claude/skills/alpha/notes.md'), 'met Quenlin\n');
    assert.equal(s.run(), 1);
    assert.equal(readFileSync(path.join(s.root, 'catalog/skills/alpha/SKILL.md'), 'utf8'), 'previous');
    assert.equal(existsSync(path.join(s.root, 'catalog/skills/alpha/notes.md')), false);
    assert.match(s.lines.join('\n'), /catalog\/skills\/alpha\/notes\.md:1 denied term #2/);
    assert.equal(s.lines.join('\n').includes('Quenlin'), false);
  } finally { s.done(); }
});

test('a release never skips gitleaks, and refuses a hub with uncommitted changes in what it reads', () => {
  const s = setup();
  try {
    assert.equal(s.run({ release: '2.0.0' }), 2);
    const dirty = (h, args) => (args[0] === 'status' ? ' M .claude/skills/alpha/SKILL.md' : 'abc123');
    assert.equal(s.run({ release: '2.0.0', noGitleaks: false, gitleaks: () => [], hubGit: dirty }), 2);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('the first release passes the lint, then writes one changelog section and the state snapshot', () => {
  const s = setup();
  try {
    assert.equal(s.run({ release: '2.0.0', notes: ['First release.'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 0, s.lines.join('\n'));
    const log = readFileSync(path.join(s.root, 'CHANGELOG.md'), 'utf8');
    assert.equal(log.match(/# Changelog/g).length, 1);
    assert.ok(log.includes('## v2.0.0 (2026-11-02)\n\n- First release.\n\n**Added:** `agent:gamma`, `skill:alpha`, `skill:beta`\n'));
    const state = JSON.parse(readFileSync(path.join(s.root, 'tools/export/state.json'), 'utf8'));
    assert.equal(state.version, '2.0.0');
    assert.equal(state.hubCommit, 'abc123');
  } finally { s.done(); }
});

// ---- v3: the committed manifest names no outside repository
import { loadManifest } from '../manifest.mjs';
const realManifest = () => loadManifest(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..', '..', 'export.manifest.json'));

test('no catalog-only item with an upstream link remains', () => {
  const linked = realManifest().items.filter((it) => it.status === 'catalog-only' && /https?:\/\//.test(String(it.upstream || '')));
  assert.deepEqual(linked.map((it) => `${it.kind}:${it.id}`), []);
});

test('link-only items are only tools the kit installs', () => {
  const linkOnly = realManifest().items.filter((it) => it.status === 'link-only').map((it) => it.id);
  assert.deepEqual(linkOnly, ['skillspector']);
});

test('every removal in the manifest records its version and a replacement or a reason', () => {
  const m = realManifest();
  assert.ok(Array.isArray(m.removed) && m.removed.length > 0);
  for (const r of m.removed) {
    assert.ok(r.kind && r.id && r.was && /^\d+\.\d+\.\d+$/.test(r.in), JSON.stringify(r));
    assert.ok(!m.items.some((it) => it.kind === r.kind && it.id === r.id), `${r.kind}:${r.id} is both removed and listed`);
  }
  for (const id of ['outside-workflow-plugin', 'anthropic-document-skills', 'coding-guidelines']) {
    const rec = m.removed.find((r) => r.kind === 'external' && r.id === id);
    assert.ok(rec && (rec.replacedBy || rec.note), `external:${id} needs a replacement or a note`);
  }
});

test('a release stamps its version into the manifest and the feature menu, and no private item reaches the file', () => {
  const s = setup();
  try {
    assert.equal(s.run({ release: '3.1.0', notes: ['Stamp.'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 0, s.lines.join('\n'));
    const onDisk = JSON.parse(readFileSync(path.join(s.root, 'export.manifest.json'), 'utf8'));
    assert.equal(onDisk.version, '3.1.0');
    assert.deepEqual(onDisk.items.map((i) => i.id).sort(), manifest.items.map((i) => i.id).sort());
    assert.equal(JSON.parse(readFileSync(path.join(s.root, 'catalog/features.json'), 'utf8')).version, '3.1.0');
  } finally { s.done(); }
});

// ---- the kit names no outside workflow collection anywhere
test('the kit holds the outside workflow collection\'s name in no file', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..', '..');
  const needle = new RegExp(['super', 'powers'].join(''), 'i');
  const hits = [];
  const walk = (dir) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      if (['.git', 'node_modules'].includes(ent.name) || /\.local\.(txt|json)$/.test(ent.name)) continue;
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (statSync(p).size < 2_000_000 && needle.test(path.relative(root, p)) || (statSync(p).size < 2_000_000 && !/\.(png|gz|zip|svg|webp)$/.test(ent.name) && needle.test(readFileSync(p, 'utf8')))) hits.push(path.relative(root, p).split(path.sep).join('/'));
    }
  };
  walk(root);
  assert.deepEqual(hits, []);
});

test('a shipped file that cites an item the private list keeps out of the kit fails the privacy gate, by position only', () => {
  const s = setup();
  try {
    const id = `${FIXTURE_OWNER.toLowerCase()}-voice`;
    mkdirSync(path.join(s.hub, '.claude/skills', id), { recursive: true });
    writeFileSync(path.join(s.hub, '.claude/skills', id, 'SKILL.md'), `---\nname: ${id}\ndescription: Private.\n---\n`);
    s.w('tools/export/private.local.txt', `skill:${id}\n`);
    writeFileSync(path.join(s.hub, '.claude/skills/alpha/SKILL.md'), `---\nname: alpha\ndescription: Use when alpha.\nmetadata:\n  author: Richicinschi (Claude-authored)\n---\n# alpha\n\nAfter this, see \`${id}\`.\n`);
    assert.equal(s.run(), 1, s.lines.join('\n'));
    const out = s.lines.join('\n');
    assert.match(out, /privacy: FAIL/);
    assert.match(out, /catalog\/skills\/alpha\/SKILL\.md:\d+ denied term #\d+/);
    assert.equal(out.includes(id), false, 'the name is never printed');
  } finally { s.done(); }
});
