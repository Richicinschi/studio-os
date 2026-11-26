// tools/export/test/changelog.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { itemHashes, diffItems, releaseDiff, releaseItemFiles, catalogItemFiles, changelogSection, prependChangelog, staleness, pageSources, CHANGELOG_HEAD, HASHES } from '../changelog.mjs';

function tree(files) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-cl-'));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), text);
  }
  return root;
}

test('item hashes are stable and change with content', () => {
  const root = tree({ 'catalog/skills/a/SKILL.md': 'one' });
  try {
    const h1 = itemHashes(root, { 'skill:a': ['catalog/skills/a/SKILL.md'] });
    assert.deepEqual(itemHashes(root, { 'skill:a': ['catalog/skills/a/SKILL.md'] }), h1);
    writeFileSync(path.join(root, 'catalog/skills/a/SKILL.md'), 'two');
    assert.notEqual(itemHashes(root, { 'skill:a': ['catalog/skills/a/SKILL.md'] })['skill:a'], h1['skill:a']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('a re-scan alone does not change an item: the scan date and version are left out of the hash, the verdict is not', () => {
  const src = (verdict, version, date) => `# a: source\n\n- **Last scan:** ${verdict} (risk 0/100), SkillSpector ${version} with --no-llm, ${date}\n`;
  const root = tree({ 'catalog/skills/a/SOURCE.md': src('SAFE', '1.0', '2026-11-02') });
  try {
    const files = { 'skill:a': ['catalog/skills/a/SOURCE.md'] };
    const h1 = itemHashes(root, files)['skill:a'];
    writeFileSync(path.join(root, 'catalog/skills/a/SOURCE.md'), src('SAFE', '1.1', '2026-12-01'));
    assert.equal(itemHashes(root, files)['skill:a'], h1);
    writeFileSync(path.join(root, 'catalog/skills/a/SOURCE.md'), src('REVIEW', '1.1', '2026-12-01'));
    assert.notEqual(itemHashes(root, files)['skill:a'], h1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('a release compares finding counts too: a new count under the same verdict is a change, a re-scan with the same count is not', () => {
  const src = (count, date) => `# a: source\n\n- **Last scan:** DO_NOT_INSTALL (risk 100/100), SkillSpector v2.13.6 with --no-llm, ${date}${count}\n`;
  const counted = (n) => `; ${n} findings, all read: ${n} false positives ([triage](../../../tools/export/scan-triage.md#a))`;
  const root = tree({ 'catalog/skills/a/SOURCE.md': src(counted(6), '2026-11-21') });
  const files = { 'skill:a': ['catalog/skills/a/SOURCE.md'] };
  try {
    const first = releaseDiff(root, files, null);
    assert.equal(first.state.hashes, HASHES);
    assert.deepEqual(first.diff.added, ['skill:a']);
    writeFileSync(path.join(root, 'catalog/skills/a/SOURCE.md'), src(counted(6), '2026-12-01'));
    assert.deepEqual(releaseDiff(root, files, first.state).diff.changed, []);
    writeFileSync(path.join(root, 'catalog/skills/a/SOURCE.md'), src(counted(9), '2026-12-01'));
    assert.deepEqual(releaseDiff(root, files, first.state).diff.changed, ['skill:a']);
    // "no findings" and no count at all are both 0.
    writeFileSync(path.join(root, 'catalog/skills/a/SOURCE.md'), src('; no findings ([triage](x))', '2026-12-01'));
    const none = releaseDiff(root, files, first.state).state;
    writeFileSync(path.join(root, 'catalog/skills/a/SOURCE.md'), src('', '2026-12-02'));
    assert.deepEqual(releaseDiff(root, files, none).diff.changed, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('a previous state written before finding counts were hashed is compared in its own form, and the new state is written in the new form', () => {
  const src = (n) => `# a: source\n\n- **Last scan:** DO_NOT_INSTALL (risk 100/100), SkillSpector v2.13.6 with --no-llm, 2026-11-22; ${n} findings, all read: ${n} false positives ([triage](x))\n`;
  const root = tree({ 'catalog/skills/a/SOURCE.md': src(6) });
  const files = { 'skill:a': ['catalog/skills/a/SOURCE.md'] };
  try {
    const old = { version: '3.3.0', items: itemHashes(root, files) };
    writeFileSync(path.join(root, 'catalog/skills/a/SOURCE.md'), src(9));
    const r = releaseDiff(root, files, old);
    assert.deepEqual(r.diff.changed, [], 'the old form cannot see a count, so every item would look changed if compared in the new one');
    assert.equal(r.state.hashes, HASHES);
    assert.notEqual(r.state.items['skill:a'], itemHashes(root, files)['skill:a']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// A small kit: one skill and one agent in the catalog, two practices (one a folder of templates, one its
// card alone), an outside item on the menu, and a card for each.
function menuKit() {
  const root = tree({
    'catalog/skills/a/SKILL.md': 'a', 'catalog/agents/g.md': 'g',
    'templates/hooks-x/pre-commit': 'one', 'templates/hooks-x/check.mjs': 'two',
    'cards/a.md': 'card a', 'cards/g.md': 'card g', 'cards/hooks-x.md': 'card hooks', 'cards/habit.md': 'card habit', 'cards/tool.md': 'card tool',
  });
  const manifest = { items: [
    { kind: 'skill', id: 'a', status: 'shipped' }, { kind: 'agent', id: 'g', status: 'shipped' },
    { kind: 'practice', id: 'hooks-x', status: 'shipped', files: ['templates/hooks-x'] },
    { kind: 'practice', id: 'habit', status: 'shipped', files: ['cards/habit.md'] },
    { kind: 'external', id: 'tool', status: 'link-only' }, { kind: 'external', id: 'other', status: 'catalog-only' },
  ] };
  return { root, manifest, itemFiles: catalogItemFiles(root, manifest) };
}

test('a release compares practices and outside items too, each with its card and the files it installs', () => {
  const { root, manifest, itemFiles } = menuKit();
  try {
    assert.deepEqual(releaseItemFiles(root, manifest, itemFiles), {
      'skill:a': ['catalog/skills/a/SKILL.md', 'cards/a.md'], 'agent:g': ['catalog/agents/g.md', 'cards/g.md'],
      'practice:hooks-x': ['templates/hooks-x/check.mjs', 'templates/hooks-x/pre-commit', 'cards/hooks-x.md'],
      'practice:habit': ['cards/habit.md'], 'external:tool': ['cards/tool.md'],
    });
    const first = releaseDiff(root, itemFiles, null, { manifest });
    assert.deepEqual(first.diff.added, ['agent:g', 'external:tool', 'practice:habit', 'practice:hooks-x', 'skill:a']);
    // A changed template, card or a new practice is listed; a never-share list kept beside the templates is not.
    writeFileSync(path.join(root, 'templates/hooks-x/never-share.local.txt'), 'term\n');
    assert.deepEqual(releaseDiff(root, itemFiles, first.state, { manifest }).diff, { added: [], removed: [], changed: [] });
    writeFileSync(path.join(root, 'templates/hooks-x/check.mjs'), 'three');
    writeFileSync(path.join(root, 'cards/a.md'), 'card a, changed');
    writeFileSync(path.join(root, 'cards/tool.md'), 'card tool, changed');
    writeFileSync(path.join(root, 'cards/new.md'), 'card new');
    const next = { items: [...manifest.items.filter((i) => i.id !== 'habit'), { kind: 'practice', id: 'new', status: 'shipped', files: ['cards/new.md'] }] };
    assert.deepEqual(releaseDiff(root, itemFiles, first.state, { manifest: next }).diff,
      { added: ['practice:new'], removed: ['practice:habit'], changed: ['external:tool', 'practice:hooks-x', 'skill:a'] });
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('an agent whose recorded verdict, score or number of findings changes is listed as changed; a rescan with the same record is not', () => {
  const { root, manifest, itemFiles } = menuKit();
  const rec = (recommendation, score, n, date = '2026-11-22') => ({ recommendation, score, date, version: 'v2.13.6', findings: Array.from({ length: n }, (_, i) => ({ rule: 'X1', file: 'g.md', line: i + 1, severity: 'LOW' })) });
  try {
    const first = releaseDiff(root, itemFiles, null, { manifest, scans: { 'agent:g': rec('SAFE', 0, 0) } });
    const changed = (scans) => releaseDiff(root, itemFiles, first.state, { manifest, scans }).diff.changed;
    assert.deepEqual(changed({ 'agent:g': rec('SAFE', 0, 0, '2026-12-01') }), []);
    assert.deepEqual(changed({ 'agent:g': rec('CAUTION', 0, 0) }), ['agent:g']);
    assert.deepEqual(changed({ 'agent:g': rec('SAFE', 10, 0) }), ['agent:g']);
    assert.deepEqual(changed({ 'agent:g': rec('SAFE', 0, 2) }), ['agent:g']);
    assert.deepEqual(changed({}), ['agent:g'], 'a scan record that went away is a change too');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('a v3.4.0 state is compared in its own form, on the catalog items it tracked: no practice is listed as added', () => {
  const { root, manifest, itemFiles } = menuKit();
  try {
    const old = { version: '3.4.0', hashes: 'verdict+findings', items: itemHashes(root, itemFiles, { findings: true }) };
    const r = releaseDiff(root, itemFiles, old, { manifest, scans: { 'agent:g': { recommendation: 'CAUTION', score: 50, findings: [] } } });
    assert.deepEqual(r.diff, { added: [], removed: [], changed: [] });
    assert.equal(r.state.hashes, HASHES);
    assert.deepEqual(Object.keys(r.state.items).sort(), ['agent:g', 'external:tool', 'practice:habit', 'practice:hooks-x', 'skill:a']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('every card the kit ships belongs to an item the release compares, every file of those items can be read, and the recorded state is in the current form', () => {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  const manifest = JSON.parse(readFileSync(path.join(root, 'export.manifest.json'), 'utf8'));
  const items = releaseItemFiles(root, manifest, catalogItemFiles(root, manifest));
  const covered = new Set(Object.values(items).flat());
  assert.deepEqual(readdirSync(path.join(root, 'cards')).filter((f) => f.endsWith('.md')).map((f) => `cards/${f}`).filter((c) => !covered.has(c)), []);
  // Hashing reads every file, so a practice that names a file the kit does not hold fails here.
  releaseDiff(root, catalogItemFiles(root, manifest), null, { manifest });
  // The items themselves change between releases, so only the form is held here, never the list.
  assert.equal(JSON.parse(readFileSync(path.join(root, 'tools/export/state.json'), 'utf8')).hashes, HASHES);
});

test('diff and changelog sections', () => {
  const diff = diffItems({ 'skill:a': '1', 'skill:b': '2' }, { 'skill:a': '1', 'skill:b': '3', 'agent:c': '4' });
  assert.deepEqual(diff, { added: ['agent:c'], removed: [], changed: ['skill:b'] });
  assert.equal(changelogSection('2.1.0', '2026-12-01', diff, ['New data module.']),
    '## v2.1.0 (2026-12-01)\n\n- New data module.\n\n**Added:** `agent:c`\n\n**Changed:** `skill:b`\n\n');
  assert.equal(changelogSection('2.0.1', '2026-12-02', { added: [], removed: [], changed: [] }), '## v2.0.1 (2026-12-02)\n\nNo catalog changes.\n\n');
  assert.deepEqual(diffItems(undefined, { 'skill:a': '1' }), { added: ['skill:a'], removed: [], changed: [] });
});

test('prependChangelog puts the new section first and keeps the old ones', () => {
  const root = tree({});
  try {
    const f = path.join(root, 'CHANGELOG.md');
    prependChangelog(f, '## v2.0.0 (2026-11-02)\n\nFirst.\n\n');
    prependChangelog(f, '## v2.1.0 (2026-12-01)\n\nSecond.\n\n');
    const text = readFileSync(f, 'utf8');
    assert.ok(text.startsWith('# Changelog\n\n'));
    assert.ok(text.indexOf('v2.1.0') < text.indexOf('v2.0.0'));
    assert.equal(text.match(/# Changelog/g).length, 1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('prependChangelog keeps one header on a header-only file and on a CRLF checkout, and writes LF', () => {
  const root = tree({});
  try {
    const f = path.join(root, 'CHANGELOG.md');
    writeFileSync(f, CHANGELOG_HEAD);
    prependChangelog(f, '## v2.0.0 (2026-11-02)\n\nFirst.\n\n');
    assert.equal(readFileSync(f, 'utf8'), `${CHANGELOG_HEAD}## v2.0.0 (2026-11-02)\n\nFirst.\n\n`);
    writeFileSync(f, readFileSync(f, 'utf8').replace(/\n/g, '\r\n'));
    prependChangelog(f, '## v2.1.0 (2026-12-01)\n\nSecond.\n\n');
    const text = readFileSync(f, 'utf8');
    assert.equal(text.match(/# Changelog/g).length, 1);
    assert.equal(text.match(/Each export adds/g).length, 1);
    assert.equal(text.includes('\r'), false);
    assert.ok(text.indexOf('v2.1.0') < text.indexOf('v2.0.0'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('staleness: changed hub sources, facts older than 90 days, and a warning when git fails', () => {
  const root = tree({
    'modules/01-continuity/README.md': '---\ntitle: Continuity\nstudio_sources:\n  - .studio/memory/a.md\n  - .studio/memory/b.md\nchecked: 2026-07-01\n---\n# x\n',
    'docs/facts.md': '---\ntitle: Facts\nchecked: 2026-10-30\n---\n',
  });
  try {
    const gitLog = (hub, since, file) => (file.endsWith('a.md') ? 'abc123' : '');
    const r = staleness(root, { hub: 'H', sinceCommit: 'old', today: '2026-11-02', gitLog });
    assert.deepEqual(r.changedSources, [{ page: 'modules/01-continuity/README.md', source: '.studio/memory/a.md' }]);
    assert.deepEqual(r.staleFacts, [{ page: 'modules/01-continuity/README.md', checked: '2026-07-01' }]);
    const broken = staleness(root, { hub: 'H', sinceCommit: 'gone', today: '2026-11-02', gitLog: () => { throw new Error('unknown revision'); } });
    assert.equal(broken.changedSources.length, 0);
    assert.match(broken.warnings[0], /could not compare hub sources since gone/);
    assert.deepEqual(staleness(root, { hub: 'H', sinceCommit: undefined, today: '2026-11-02', gitLog }).changedSources, []);
    assert.deepEqual(pageSources(root), ['.studio/memory/a.md', '.studio/memory/b.md']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('staleness and the clean-hub check also follow private sources a page may not name', () => {
  const root = tree({ 'modules/12-x/README.md': '---\ntitle: X\nstudio_sources:\n  - .studio/memory/a.md\n---\n# x\n' });
  try {
    const extra = { 'modules/12-x/README.md': ['.studio/memory/private-one.md'] };
    const gitLog = (hub, since, file) => (file.endsWith('private-one.md') ? 'abc123' : '');
    const r = staleness(root, { hub: 'H', sinceCommit: 'old', today: '2026-11-02', gitLog, extra });
    assert.deepEqual(r.changedSources, [{ page: 'modules/12-x/README.md', source: '.studio/memory/private-one.md' }]);
    assert.deepEqual(pageSources(root, extra), ['.studio/memory/a.md', '.studio/memory/private-one.md']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('docs/facts.md is stale by section, fact by fact: a fast section after 30 days, the rest after 90; its page date no longer counts', () => {
  const root = tree({
    'docs/facts.md': ['---', 'title: Facts', 'checked: 2026-01-01', 'fast:', '  - "Models: which for what"', '---', '',
      '## Models: which for what', '', '- A model. (checked 2026-10-01, [source](https://a.example.invalid))', '- Another. (checked 2026-11-20)', '',
      '## Git: hooks', '', '- A hook fact. (checked 2026-10-01)', ''].join('\n'),
  });
  try {
    const r = staleness(root, { hub: 'H', sinceCommit: undefined, today: '2026-11-25' });
    assert.deepEqual(r.staleFacts, [{ page: 'docs/facts.md', section: 'Models: which for what', count: 1, window: 30, checked: '2026-10-01' }]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('PRINCIPLES.md is followed like the other hand-written pages: staleness and the clean-hub check read its studio_sources', () => {
  const root = tree({ 'PRINCIPLES.md': '---\ntitle: How we work\nstudio_sources:\n  - .studio/identity/SOUL.md\n---\n# x\n' });
  try {
    const gitLog = (hub, since, file) => (file.endsWith('SOUL.md') ? 'abc123' : '');
    const r = staleness(root, { hub: 'H', sinceCommit: 'old', today: '2026-11-02', gitLog });
    assert.deepEqual(r.changedSources, [{ page: 'PRINCIPLES.md', source: '.studio/identity/SOUL.md' }]);
    assert.deepEqual(pageSources(root), ['.studio/identity/SOUL.md']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ---- v3: removed items are listed with what replaces them
test('removed items are listed with their replacement', () => {
  const removed = [
    { kind: 'skill', id: 'council', was: 'shipped', replacedBy: 'a-shipped-domain', in: '3.0.0' },
    { kind: 'skill', id: 'ab-testing', was: 'catalog-only', replacedBy: 'a-waiting-domain', in: '3.0.0' },
    { kind: 'skill', id: 'cro', was: 'catalog-only', replacedBy: 'a-waiting-domain', in: '3.0.0' },
    { kind: 'external', id: 'old-link', was: 'link-only', note: 'the core skills this kit ships', in: '3.0.0' },
    { kind: 'skill', id: 'gone', was: 'catalog-only', in: '3.0.0' },
    { kind: 'skill', id: 'earlier', was: 'shipped', replacedBy: 'a-shipped-domain', in: '2.5.0' },
  ];
  const text = changelogSection('3.0.0', '2026-12-01', { added: [], removed: [], changed: [] }, [], { removed, shippedPacks: ['a-shipped-domain'] });
  assert.match(text, /\*\*Removed in this version, with what replaces each:\*\*/);
  assert.match(text, /- `skill:council` → the domain `a-shipped-domain`/);
  assert.match(text, /- `skill:ab-testing`, `skill:cro` → none in this version; its domain `a-waiting-domain` is not shipped yet/);
  assert.match(text, /- `external:old-link` → the core skills this kit ships/);
  assert.match(text, /- `skill:gone` → no longer part of the kit/);
  assert.ok(!text.includes('earlier'), 'a removal from another version is not listed');
});
