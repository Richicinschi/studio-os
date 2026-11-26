// tools/export/test/facts.test.mjs
// docs/facts.md, fact by fact (public issue #65): each fact carries its own date, fast-moving sections are due
// after 30 days and the rest after 90, and the kit's own page passes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { factsOf, lintFacts, staleFactSections, FAST_DAYS, SLOW_DAYS } from '../facts.mjs';

const page = [
  '---', 'title: Facts', 'fast:', '  - "Models: which for what"', '---', '', '# Facts', '',
  '## Models: which for what', '',
  '- The current model is X. (checked 2026-10-01, [source](https://a.example.invalid))',
  '- A menu entry: not documented as of 2026-11-20; searched [a page](https://a.example.invalid).',
  '', '## Git: hooks', '',
  '- git reads hooks from `core.hooksPath`. (read 2026-10-01, [source](https://b.example.invalid))',
  '- Observed with git 2.54 on 2026-11-10, in a throwaway repository: it worked.',
  '- Node.js 22 is supported until 2027-04-30.',
  '- A fact on two lines, first part',
  '  and its date on the second. (tried 2026-11-21)',
  '', '```bash', '- not a fact, a line in a block', '```', '',
].join('\n');

test('each fact is a bullet with its section, line and newest date after a dating word; a block\'s lines are not facts', () => {
  const facts = factsOf(page);
  assert.deepEqual(facts.map((f) => [f.section, f.line, f.date]), [
    ['Models: which for what', 11, '2026-10-01'],
    ['Models: which for what', 12, '2026-11-20'],
    ['Git: hooks', 16, '2026-10-01'],
    ['Git: hooks', 17, '2026-11-10'],
    ['Git: hooks', 18, null],
    ['Git: hooks', 19, '2026-11-21'],
  ]);
});

test('the lint refuses a fact with no date, by its line, and a fast: entry that names no section', () => {
  assert.deepEqual(lintFacts('docs/facts.md', page).map((e) => e.split(' a fact')[0]), ['docs/facts.md:18']);
  const wrong = page.replace('  - "Models: which for what"', '  - "Models: which for what"\n  - "Pricing"');
  assert.match(lintFacts('docs/facts.md', wrong).at(-1), /fast: "Pricing" is not a section of the page/);
});

test('a fact with two dates counts its older one; the lint refuses a date after today, a date that does not exist, and an open question with no page searched', () => {
  const two = '## S\n\n- Part one (read 2026-10-01), part two re-checked. (checked 2026-11-25, [source](https://a.example.invalid))\n';
  assert.equal(factsOf(two)[0].date, '2026-10-01');
  const bad = ['## S', '',
    '- Free as of 2027-01-01. (checked 2026-11-25)',
    '- A rule. (checked 2026-13-45)',
    '- Whether X: not documented as of 2026-11-25.',
    '- Whether Y: not documented as of 2026-11-25; searched [a page](https://a.example.invalid).',
    '- Written today where the writer lives. (checked 2026-11-26)', ''].join('\n');
  assert.deepEqual(lintFacts('f.md', bad, '2026-11-25').map((e) => e.replace(/ \(write.*$/, '')), [
    'f.md:3 the date 2027-01-01 is after today',
    'f.md:4 the date 2026-13-45 does not exist',
    'f.md:5 says "not documented" but names no page searched',
  ]);
});

test(`a fact in a fast section is due after ${FAST_DAYS} days, any other after ${SLOW_DAYS}`, () => {
  assert.deepEqual(staleFactSections(page, '2026-11-25'), [{ section: 'Models: which for what', window: 30, count: 1, oldest: '2026-10-01' }]);
  assert.deepEqual(staleFactSections(page, '2026-12-31').map((s) => [s.section, s.count, s.oldest]), [
    ['Models: which for what', 2, '2026-10-01'], ['Git: hooks', 1, '2026-10-01']]);
});

test('every fact on the kit\'s own facts page has a date, and every fast: entry is one of its sections', () => {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  assert.deepEqual(lintFacts('docs/facts.md', readFileSync(path.join(root, 'docs/facts.md'), 'utf8')), []);
});
