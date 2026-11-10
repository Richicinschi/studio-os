// tools/export/test/frontmatter.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../frontmatter.mjs';

test('scalars, quoted values and inline lists', () => {
  const { data, body } = parseFrontmatter('---\nname: tdd\ntitle: "Continuity"\ntags: [a, b]\n---\n# Body\n');
  assert.deepEqual(data, { name: 'tdd', title: 'Continuity', tags: ['a', 'b'] });
  assert.equal(body, '# Body\n');
});

test('folded description and nested metadata with a list', () => {
  const text = [
    '---', 'name: tdd', 'description: >-', '  Use when writing code', '  test-first.',
    'metadata:', '  category: engineering', '  author: Richicinschi (adapted by Claude from mattpocock/skills)',
    '  sources:', '    - mattpocock/skills · engineering/tdd (MIT)', '    - second source', '---', 'body',
  ].join('\n');
  const { data } = parseFrontmatter(text);
  assert.equal(data.description, 'Use when writing code test-first.');
  assert.equal(data.metadata.category, 'engineering');
  assert.equal(data.metadata.author, 'Richicinschi (adapted by Claude from mattpocock/skills)');
  assert.deepEqual(data.metadata.sources, ['mattpocock/skills · engineering/tdd (MIT)', 'second source']);
});

test('a list at the key indent, CRLF input, a wrapped list item, and no front matter', () => {
  const { data } = parseFrontmatter('---\r\nstudio_sources:\r\n- .studio/memory/a.md\r\n- .claude/skills/b/SKILL.md\r\nquestions:\r\n  - "Where should memory live:\r\n    a Project or a repo?"\r\nchecked: 2026-11-02\r\n---\r\n');
  assert.deepEqual(data.studio_sources, ['.studio/memory/a.md', '.claude/skills/b/SKILL.md']);
  assert.deepEqual(data.questions, ['Where should memory live: a Project or a repo?']);
  assert.equal(data.checked, '2026-11-02');
  assert.equal(parseFrontmatter('# no front matter').data, null);
});
