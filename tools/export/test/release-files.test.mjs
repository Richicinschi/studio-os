// tools/export/test/release-files.test.mjs
// Public issue #66, option 1: a page per release that lists every changed file under its item, with one
// line of why; and the check that the release commit holds exactly what the page lists.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { catalogItemFiles, releaseDiff } from '../changelog.mjs';
import { changedFiles, checkPage, checkState, gateWhy, groupOf, parseWhy, releaseFilesPage } from '../release-files.mjs';

const manifest = { items: [
  { id: 'alpha', kind: 'skill', status: 'shipped' },
  { id: 'front-door', kind: 'practice', status: 'shipped', files: ['templates/AGENTS.md'] },
  { id: 'hooks', kind: 'practice', status: 'shipped', files: ['templates/git-hooks'] },
  { id: 'secret-thing', kind: 'skill', status: 'private' },
] };

test('each file goes under its item where the kit knows one, else under its folder', () => {
  const cases = {
    'catalog/skills/alpha/SKILL.md': 'skill:alpha', 'catalog/agents/gamma.md': 'agent:gamma', 'catalog/packs/media/skills/x.md': 'pack:media',
    'cards/pack-media.md': 'pack:media', 'cards/alpha.md': 'skill:alpha', 'cards/front-door.md': 'practice:front-door', 'cards/secret-thing.md': 'cards',
    'templates/AGENTS.md': 'practice:front-door', 'templates/git-hooks/pre-commit': 'practice:hooks', 'templates/handoffs/TEMPLATE.md': 'templates',
    '.claude/skills/drill-to-adopt/phases/1-audit.md': 'kit skill:drill-to-adopt', 'modules/01-continuity/README.md': 'module:01-continuity',
    'docs/facts.md': 'docs', 'README.md': 'the top folder', 'tools/export/build.mjs': 'tools',
  };
  for (const [file, group] of Object.entries(cases)) assert.equal(groupOf(file, manifest), group, file);
});

test('the page lists every file under its group, itself included, items first, with its why or "Not given"', () => {
  const files = [
    { status: 'changed', path: 'README.md' }, { status: 'added', path: 'catalog/skills/alpha/new.md' },
    { status: 'changed', path: 'cards/alpha.md' }, { status: 'removed', path: 'docs/old.md' }, { status: 'changed', path: 'templates/AGENTS.md' },
  ];
  const { text, groups, missing, unused } = releaseFilesPage({ version: '3.5.0', previous: '3.4.0', files, manifest, why: { 'skill:alpha': 'A new step for large inputs.', 'skill:beta': 'x' } });
  assert.deepEqual(groups, ['skill:alpha', 'practice:front-door', 'docs', 'the top folder']);
  assert.deepEqual(missing, ['practice:front-door', 'docs', 'the top folder']);
  assert.deepEqual(unused, ['skill:beta'], 'a why for a group with no changed file is reported');
  assert.match(text, /^# Studio OS v3\.5\.0: every changed file$/m);
  assert.match(text, /^From v3\.4\.0 to v3\.5\.0: 6 files, 2 added, 3 changed, 1 removed,/m);
  assert.match(text, /^## skill:alpha\n\nWhy: A new step for large inputs\.\n\n- changed `cards\/alpha\.md`\n- added `catalog\/skills\/alpha\/new\.md`$/m);
  assert.match(text, /^## practice:front-door\n\nWhy: Not given\.\n\n- changed `templates\/AGENTS\.md`$/m);
  assert.match(text, /^## docs\n\nWhy: Not given\.\n\n- removed `docs\/old\.md`\n- added `docs\/releases\/v3\.5\.0\.md`$/m, 'the page lists itself');
  assert.deepEqual(parseWhy(['skill:alpha=Why, with = inside.']), { 'skill:alpha': 'Why, with = inside.' });
  assert.throws(() => parseWhy(['skill:alpha']), /<group>=<text>/);
  assert.throws(() => parseWhy(['skill:alpha=  ']), /<group>=<text>/);
  assert.deepEqual(gateWhy({ 'skill:alpha': 'Fine.', 'docs': 'Thanks to Quenlin.' }, ['Quenlin']), ['--why docs: denied term #1']);
});

function repo(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-release-files-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
  const w = (rel, text) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), text); };
  git(['init', '-q']);
  for (const [k, v] of [['user.name', 'test'], ['user.email', 'test@example.invalid'], ['commit.gpgsign', 'false'], ['tag.gpgsign', 'false'], ['core.quotepath', 'true']]) git(['config', k, v]);
  return { root, git, w };
}

test('changedFiles reads git: what differs from the tag, new files git does not ignore, renames as a removal and an addition, any name', (t) => {
  const { root, git, w } = repo(t);
  w('README.md', 'a\n'); w('docs/old.md', 'old\n'); w('docs/moved.md', 'moved\n'); w('.gitignore', 'tools/export/*.local.txt\n');
  git(['add', '.']); git(['commit', '-q', '-m', 'v3.4.0']); git(['tag', 'v3.4.0']);
  w('README.md', 'b\n'); unlinkSync(path.join(root, 'docs/old.md')); w('catalog/skills/alpha/SKILL.md', 'new\n'); w('tools/export/privacy.local.txt', 'never listed\n');
  git(['mv', 'docs/moved.md', 'docs/now here.md']);
  w('docs/café notes.md', 'accents\n');
  assert.deepEqual(changedFiles(git, 'v3.4.0'), [
    { status: 'changed', path: 'README.md' }, { status: 'added', path: 'catalog/skills/alpha/SKILL.md' }, { status: 'added', path: 'docs/café notes.md' },
    { status: 'removed', path: 'docs/moved.md' }, { status: 'added', path: 'docs/now here.md' }, { status: 'removed', path: 'docs/old.md' }]);
});

test('checkPage: the release commit against its page, both ways', (t) => {
  const { git, w } = repo(t);
  w('README.md', 'a\n'); w('docs/old.md', 'old\n');
  git(['add', '.']); git(['commit', '-q', '-m', 'v1.0.0']); git(['tag', 'v1.0.0']);
  w('README.md', 'b\n');
  const files = changedFiles(git, 'v1.0.0');
  w('docs/releases/v1.1.0.md', releaseFilesPage({ version: '1.1.0', previous: '1.0.0', files, manifest }).text);
  git(['add', '.']); git(['commit', '-q', '-m', 'v1.1.0']);
  assert.deepEqual(checkPage(git, '1.0.0', 'HEAD'), { page: 'docs/releases/v1.1.0.md', missing: [], extra: [] });
  // A file changed after the release run, such as the version in package.json: the check names it.
  w('package.json', '{"version":"1.1.0"}\n'); unlinkSync(path.join(git(['rev-parse', '--show-toplevel']).trim(), 'docs/old.md'));
  git(['add', '-A']); git(['commit', '-q', '-m', 'late']);
  assert.deepEqual(checkPage(git, '1.0.0', 'HEAD'), { page: 'docs/releases/v1.1.0.md', missing: ['added package.json', 'removed docs/old.md'], extra: [] });
  assert.match(checkPage(git, '1.0.0', 'v1.0.0').error, /found 0/);
});

test('checkState: the release commit\'s state against the hashes of its own tree, read from git', (t) => {
  const { root, git, w } = repo(t);
  w('.gitattributes', '* text=auto eol=lf\n'); w('README.md', 'a\n');
  git(['add', '.']); git(['commit', '-q', '-m', 'before any release']);
  const kit = { kit: 'k', version: '1.1.0', items: [{ id: 'alpha', kind: 'skill', status: 'shipped' }] };
  w('export.manifest.json', JSON.stringify(kit)); w('catalog/skills/alpha/SKILL.md', 'skill\n'); w('cards/alpha.md', 'card\n');
  const { state } = releaseDiff(root, catalogItemFiles(root, kit), null, { manifest: kit });
  w('tools/export/state.json', JSON.stringify({ version: '1.1.0', ...state }));
  git(['add', '.']); git(['commit', '-q', '-m', 'v1.1.0']);
  assert.deepEqual(checkState(root, 'HEAD'), { differ: [] });
  // A card fixed after the release run, and the state not written again: the next release would list the item
  // as changed although the fixed card is what this release ships (v3.5.0's 13 cards).
  w('cards/alpha.md', 'card, fixed\n');
  assert.deepEqual(checkState(root, 'HEAD'), { differ: [] }, 'the commit, not the folder');
  git(['commit', '-q', '-am', 'fix the card']);
  assert.deepEqual(checkState(root, 'HEAD'), { differ: ['skill:alpha'] });
  assert.match(checkState(root, 'HEAD~2').error, /no tools\/export\/state\.json/);
  // Last: an older commit read into the checkout's own index would show here as staged changes.
  assert.equal(git(['status', '--porcelain']), '', 'the checkout and its index stay as they were');
});
