// tools/export/test/changelog.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { itemHashes, diffItems, releaseDiff, changelogSection, prependChangelog, staleness, pageSources, CHANGELOG_HEAD } from '../changelog.mjs';

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
    assert.equal(first.state.hashes, 'verdict+findings');
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
    assert.equal(r.state.hashes, 'verdict+findings');
    assert.notEqual(r.state.items['skill:a'], itemHashes(root, files)['skill:a']);
  } finally { rmSync(root, { recursive: true, force: true }); }
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
