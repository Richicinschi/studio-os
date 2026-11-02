// tools/export/test/lint-content.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { lintModulePage, lintKit, lintStartHere, lintCard, lintBanned } from '../lint-content.mjs';
import { cardText } from './fixture-hub.mjs';

const good = ['---', 'title: Continuity', 'pack: way-of-working', 'sources:', '  - .studio/memory/a.md', 'questions:', '  - Where should memory live?', '---',
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

test('lintKit lints every card', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-lint-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  try {
    w('START-HERE.md', '# Start here\n\n### Windows\nx\n\n### macOS\nx\n\n### Linux\nx\n'); w('ADOPT.md', 'x'); w('CHANGELOG.md', 'x'); w('export.manifest.json', '{}');
    w('cards/handoff.md', cardText('handoff', '01-continuity').replace('## Steps\n\nx\n', ''));
    assert.deepEqual(lintKit(root), ['cards/handoff.md: missing heading "## Steps"']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
