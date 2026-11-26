// tools/export/test/lint-content.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintModulePage, lintKit, lintStartHere, lintCard, lintBanned, lintFrontmatterYaml, frontmatterFiles, lintNotDocumented, lintCardSize, CARD_MAX_TOKENS, BULLET_MAX_WORDS } from '../lint-content.mjs';
import { cardText } from './fixture-hub.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const good = ['---', 'title: Continuity', 'pack: way-of-working', 'studio_sources:', '  - .studio/memory/a.md', 'questions:', '  - Where should memory live?', '---',
  '# 01 Continuity', '', '## The problem', 'x', '## The mechanism', 'x', '## Evidence', 'x', '## Apply it in Claude Code', 'x', '## Apply it in claude.ai', 'x', ''].join('\n');

test('a complete module page passes', () => {
  assert.deepEqual(lintModulePage('modules/01/README.md', good), []);
});

test('missing front matter keys, missing and out-of-order headings are reported', () => {
  const noQuestions = good.replace('questions:\n  - Where should memory live?\n', '');
  assert.deepEqual(lintModulePage('m.md', noQuestions), ['m.md: front matter needs a non-empty "questions" list']);
  const noEvidence = good.replace('## Evidence\nx\n', '');
  assert.deepEqual(lintModulePage('m.md', noEvidence), ['m.md: missing heading "## Evidence"']);
  const swapped = good.replace('## The problem', '## TMP').replace('## The mechanism', '## The problem').replace('## TMP', '## The mechanism');
  assert.ok(lintModulePage('m.md', swapped).some((e) => e.includes('out of order')));
  assert.deepEqual(lintModulePage('m.md', '# no front matter'), ['m.md: no front matter']);
});

test('the studio files a page was written from are listed under studio_sources; the old sources key no longer counts', () => {
  const oldKey = good.replace('studio_sources:', 'sources:');
  assert.deepEqual(lintModulePage('m.md', oldKey), ['m.md: front matter needs a non-empty "studio_sources" list']);
});

test('lintKit checks module folders, skill folders, SOURCE.md and the entry files', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-lint-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  try {
    w('modules/01-continuity/README.md', good);
    mkdirSync(path.join(root, 'modules/02-empty'), { recursive: true });
    w('catalog/skills/tdd/SKILL.md', '---\nname: tdd\ndescription: Use when testing.\n---\n');
    w('.claude/skills/drill-to-adopt/SKILL.md', '---\nname: wrong-name\ndescription: x\n---\n');
    w('START-HERE.md', '# Start here\n\n### Windows\nx\n\n### macOS\nx\n\n### Linux\nx\n'); w('ADOPT.md', 'x'); w('CHANGELOG.md', 'x'); w('export.manifest.json', '{}');
    assert.deepEqual(lintKit(root), [
      'modules/02-empty/README.md: missing',
      'catalog/skills/tdd: no SOURCE.md',
      '.claude/skills/drill-to-adopt: SKILL.md name "wrong-name" must equal the folder name',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('START-HERE needs a command block for each operating system', () => {
  assert.deepEqual(lintStartHere('# Start here\n\n### Windows\nx\n'), [
    'START-HERE.md: the foundation step needs a "### macOS" block',
    'START-HERE.md: the foundation step needs a "### Linux" block',
  ]);
  assert.deepEqual(lintStartHere('\n### Windows\n\n### macOS\n\n### Linux\n'), []);
});

test('an adoption card has id, module and checked, and the eight headings in order, Why first, none empty', () => {
  const ok = cardText('handoff', '01-continuity');
  assert.deepEqual(lintCard('cards/handoff.md', ok), []);
  assert.deepEqual(lintCard('cards/handoff.md', ok.replace('## Why\n\nx\n', '')), ['cards/handoff.md: missing heading "## Why"']);
  assert.deepEqual(lintCard('cards/other.md', ok), ['cards/other.md: front matter id "handoff" must equal the file name']);
  assert.deepEqual(lintCard('cards/handoff.md', ok.replace('checked: 2026-11-02\n', '')), ['cards/handoff.md: front matter needs "checked"']);
  assert.deepEqual(lintCard('cards/handoff.md', ok.replace('## Undo\n\nx\n', '')), ['cards/handoff.md: missing heading "## Undo"']);
  assert.deepEqual(lintCard('cards/handoff.md', ok.replace('## Check\n\nx\n', '## Check\n\n')), ['cards/handoff.md: heading "## Check" is empty']);
  const swapped = ok.replace('## Ask', '## TMP').replace('## Detect', '## Ask').replace('## TMP', '## Detect');
  assert.ok(lintCard('cards/handoff.md', swapped).some((e) => e.includes('out of order')));
  assert.deepEqual(lintCard('cards/handoff.md', ok.replace('## Watch out', '## Notes\n\ny\n\n## Watch out')), ['cards/handoff.md: heading "## Notes" is not one of the eight']);
  assert.deepEqual(lintCard('cards/handoff.md', '# no front matter'), ['cards/handoff.md: no front matter']);
});

test('the kit skills, START-HERE, ADOPT and the cards use none of the minimizing words', () => {
  assert.deepEqual(lintBanned('cards/x.md', 'Adjust the list, then justify it.\nEasily done.\n'), []);
  assert.deepEqual(lintBanned('cards/x.md', 'Just run it.\nIt is easy and should work.\nGreat question! Simply put, obviously guaranteed.\n'), [
    'cards/x.md:1 minimizing word "just"',
    'cards/x.md:2 minimizing word "easy"',
    'cards/x.md:2 minimizing word "should work"',
    'cards/x.md:3 minimizing word "great question"',
    'cards/x.md:3 minimizing word "simply"',
    'cards/x.md:3 minimizing word "obviously"',
    'cards/x.md:3 minimizing word "guaranteed"',
  ]);
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-lint-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  try {
    w('START-HERE.md', '# Start here\n\nJust start.\n\n### Windows\nx\n\n### macOS\nx\n\n### Linux\nx\n'); w('ADOPT.md', 'x'); w('CHANGELOG.md', 'x'); w('export.manifest.json', '{}');
    w('.claude/skills/drill-to-adopt/SKILL.md', '---\nname: drill-to-adopt\ndescription: x\n---\nIt is easy.\n');
    w('modules/01-continuity/README.md', good.replace('x\n## The mechanism', 'Just a module.\n## The mechanism'));
    assert.deepEqual(lintKit(root), ['START-HERE.md:3 minimizing word "just"', '.claude/skills/drill-to-adopt/SKILL.md:5 minimizing word "easy"']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('lintKit reports front matter that real YAML reads differently, in every shipped Markdown file', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-lint-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  try {
    w('START-HERE.md', '# Start here\n\n### Windows\nx\n\n### macOS\nx\n\n### Linux\nx\n'); w('ADOPT.md', 'x'); w('CHANGELOG.md', 'x'); w('export.manifest.json', '{}');
    w('catalog/skills/tdd/SKILL.md', '---\nname: tdd\ndescription: Use when: testing.\n---\n'); w('catalog/skills/tdd/SOURCE.md', '# tdd: source\n');
    w('catalog/packs/p/agents/a.md', '---\nname: a\ndescription: It covers:\n---\n');
    w('catalog/packs/p/skills/ok.md', '---\nname: ok\ndescription: "Quoted: fine"\n---\n');
    w('catalog/packs/p/skills/plain.md', '# no front matter: nothing to read\n');
    assert.deepEqual(lintKit(root), [
      'catalog/packs/p/agents/a.md: front matter description: value is not valid YAML; quote it or use >-',
      'catalog/skills/tdd/SKILL.md: front matter description: value is not valid YAML; quote it or use >-',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('every front matter the kit ships is valid YAML as the reader takes it', () => {
  const files = frontmatterFiles(KIT);
  assert.ok(files.length >= 300, `only ${files.length} files with front matter found`);
  for (const rel of ['catalog/skills/git-guardrails/SKILL.md', 'catalog/packs/mobile-apps-flutter-firebase/SKILL.md', 'cards/git-guardrails.md']) assert.ok(files.includes(rel), rel);
  assert.deepEqual(lintFrontmatterYaml(KIT), []);
});

test('lintKit lints every card', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-lint-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  try {
    w('START-HERE.md', '# Start here\n\n### Windows\nx\n\n### macOS\nx\n\n### Linux\nx\n'); w('ADOPT.md', 'x'); w('CHANGELOG.md', 'x'); w('export.manifest.json', '{}');
    w('cards/handoff.md', cardText('handoff', '01-continuity').replace('## Steps\n\nx\n', ''));
    assert.deepEqual(lintKit(root), ['cards/handoff.md: missing heading "## Steps"']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('lintKit fails on a literal byte-order mark (EF BB BF) under tools/, templates/ or .claude/; catalog/ and local files are not read', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-lint-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  const BOM = '\uFEFF';
  try {
    w('START-HERE.md', '# Start here\n\n### Windows\nx\n\n### macOS\nx\n\n### Linux\nx\n'); w('ADOPT.md', 'x'); w('CHANGELOG.md', 'x'); w('export.manifest.json', '{}');
    w('tools/export/x.mjs', `// one\nconst re = /^${BOM}?---/;\n`);
    w('tools/export/escaped.mjs', 'const re = /^\\uFEFF?---/;\n');
    w('templates/rules/a.md', `${BOM}# A rule\n`);
    w('.claude/hooks/h.mjs', `a\nb\n'${BOM}' + '${BOM}'\n`);
    w('catalog/packs/p/skills/robots_check.py', `# ${BOM}\n`);
    w('tools/export/privacy.local.txt', `${BOM}term\n`);
    w('templates/git-hooks/never-share.local.txt', `${BOM}term\n`);
    w('docs/notes.md', `${BOM}# Notes\n`);
    assert.deepEqual(lintKit(root), [
      '.claude/hooks/h.mjs:3 a literal byte-order mark (bytes EF BB BF); remove it, or in code write the escape \\uFEFF',
      'templates/rules/a.md:1 a literal byte-order mark (bytes EF BB BF); remove it, or in code write the escape \\uFEFF',
      'tools/export/x.mjs:2 a literal byte-order mark (bytes EF BB BF); remove it, or in code write the escape \\uFEFF',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ---- public issue #59: a card, and each of its list items, has a size limit
test(`a card over ${CARD_MAX_TOKENS} tokens and a list item over ${BULLET_MAX_WORDS} words are refused, a wrapped item counted whole`, () => {
  const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
  const card = ['---', 'id: x', '---', '', '## Watch out', '', `- ${words(BULLET_MAX_WORDS)}`, `- ${words(100)}`, `  ${words(60)}`, `1. ${words(10)}`, ''].join('\n');
  assert.deepEqual(lintCardSize('cards/x.md', card), [`cards/x.md:8 a list item of 160 words, over ${BULLET_MAX_WORDS}`]);
  const big = `${card}\n${'x'.repeat(CARD_MAX_TOKENS * 4)}\n`;
  assert.match(lintCardSize('cards/x.md', big)[0], new RegExp(`^cards/x.md: about \\d+ tokens, over the ${CARD_MAX_TOKENS}`));
});

test('a list item runs on over a blank line while its text stays indented; fenced code counts as no words; a nested item is its own', () => {
  const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
  const card = ['## Steps', '',
    `2. ${words(100)}`, '', `   ${words(60)}`, '',                     // one item, two paragraphs: 160 words
    `3. ${words(100)}`, '', '   ```bash', `   ${words(80)}`, '   ```', '', // code under it does not count: 100
    `4. ${words(100)}`, `   - ${words(120)}`, '',                      // a nested item ends its parent: 100 and 120
    '```', `- ${words(200)}`, '```', '',                               // a "- " line inside a fence is not an item
    `5. ${words(140)}`, '', `${words(40)}`, ''].join('\n');             // a paragraph back at the margin ends it: 140
  assert.deepEqual(lintCardSize('cards/x.md', card), [`cards/x.md:3 a list item of 160 words, over ${BULLET_MAX_WORDS}`]);
});

// ---- public issue #65: "not documented" lives in docs/facts.md only
test('"not documented" is refused in every Markdown page outside catalog/, docs/facts.md, CHANGELOG.md and docs/MAINTAINING.md', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-notdoc-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  try {
    w('cards/a.md', 'Fine.\nWhether X is not documented ([docs/facts.md](../docs/facts.md)).\n');
    w('modules/01/README.md', 'It is **not** documented, said differently.\n');
    w('cards/b.md', 'Line one.\n\nWhether Y is not\ndocumented, across a line break.\n\nAlso *not* documented, and not yet documented.\n\nAn undocumented flag.\n');
    w('.claude/worktrees/x/cards/c.md', 'not documented, in a nested worktree\n');
    w('docs/facts.md', '- X: not documented as of 2026-11-25; searched [a page](https://a.example.invalid).\n');
    w('CHANGELOG.md', 'v1: the facts said "not documented".\n');
    w('docs/MAINTAINING.md', 'The lint refuses "not documented".\n');
    w('catalog/skills/x/SKILL.md', 'Upstream text: not documented.\n');
    w('tools/notes.txt', 'not documented, but not Markdown\n');
    // A fenced block quotes another file as it was: not read. The text after it is.
    w('examples/run.md', 'A file the run wrote:\n\n```markdown\nSkills: not documented.\n```\n\n~~~~\n```\nnot documented\n```\n~~~~\n\nAfter the block: undocumented.\n');
    assert.deepEqual(lintNotDocumented(root).map((e) => e.split(' says')[0]).sort(), ['cards/a.md:1', 'cards/b.md:3', 'cards/b.md:6', 'cards/b.md:8', 'examples/run.md:13', 'modules/01/README.md:1']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('lintKit refuses a card whose check block writes, reaches the network or is not well formed', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-lint-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  try {
    w('START-HERE.md', '# Start here\n\n### Windows\nx\n\n### macOS\nx\n\n### Linux\nx\n'); w('ADOPT.md', 'x'); w('CHANGELOG.md', 'x'); w('export.manifest.json', '{}');
    const check = (block) => cardText('demo', 'skills').replace(/## Check\n/, `## Check\n\n\`\`\`check\n${block}\n\`\`\`\n`);
    w('cards/good.md', check('run: grep -c x "$(installed SKILL.md)"\nexpect: 1'));
    w('cards/writes.md', check('run: grep -c x a > b\nexpect: 1'));
    w('cards/fetches.md', check('run: curl -s x\nexpect: 1'));
    w('cards/broken.md', check('run: grep -c x a'));
    const found = lintKit(root).filter((e) => /check block/.test(e));
    assert.equal(found.length, 3, found.join('\n'));
    assert.match(found.join('\n'), /^cards\/broken\.md: check block, line \d+: a run: line with no expect: after it$/m);
    assert.match(found.join('\n'), /^cards\/fetches\.md:\d+ check block: a run: line the allowlist refuses \(a command that is not on the list of readers .*\): curl -s x$/m);
    assert.match(found.join('\n'), /^cards\/writes\.md:\d+ check block: a run: line the allowlist refuses \(a redirect other than [^)]*\): grep -c x a > b$/m);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
