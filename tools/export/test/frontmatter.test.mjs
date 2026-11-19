// tools/export/test/frontmatter.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, plainValueProblems } from '../frontmatter.mjs';

test('scalars, quoted values and inline lists', () => {
  const { data, body } = parseFrontmatter('---\nname: tdd\ntitle: "Continuity"\ntags: [a, b]\n---\n# Body\n');
  assert.deepEqual(data, { name: 'tdd', title: 'Continuity', tags: ['a', 'b'] });
  assert.equal(body, '# Body\n');
});

test('a double-quoted scalar is decoded, so \\" reads as "; in single quotes \'\' is one quote', () => {
  // The shape of a hub skill description that quotes a phrase.
  const text = '---\nname: explainer-figures\ndescription: "Use when a page needs an explainer figure or a \\"how it works\\" visual, or when the user asks for an isometric diagram of a technical idea, machine or process."\ntitle: \'It\'\'s a figure\'\n---\n';
  const { data } = parseFrontmatter(text);
  assert.equal(data.description, 'Use when a page needs an explainer figure or a "how it works" visual, or when the user asks for an isometric diagram of a technical idea, machine or process.');
  assert.equal(data.title, "It's a figure");
  assert.equal(parseFrontmatter('---\nx: "bad \\q escape"\n---\n').data.x, 'bad \\q escape');
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

test('plainValueProblems: a plain value holding ": " is flagged, quoted, folded and simple ones pass', () => {
  assert.deepEqual(plainValueProblems('description: a: b'), ['description: value is not valid YAML; quote it or use >-']);
  assert.deepEqual(plainValueProblems('description: "a: b"'), []);
  assert.deepEqual(plainValueProblems('description: >-\n  a: b'), []);
  assert.deepEqual(plainValueProblems('name: x'), []);
});

test('plainValueProblems: " #" in a plain value, nested keys, and one message per key', () => {
  assert.deepEqual(plainValueProblems('title: a #b'), ['title: value is not valid YAML; quote it or use >-']);
  assert.deepEqual(plainValueProblems('name: x\nmetadata:\n  author: Ada: the builder\n  category: engineering'),
    ['author: value is not valid YAML; quote it or use >-']);
  assert.deepEqual(plainValueProblems('a: x: y\nb: ok\nc: p #q'), [
    'a: value is not valid YAML; quote it or use >-',
    'c: value is not valid YAML; quote it or use >-',
  ]);
});

test('plainValueProblems: block scalar bodies, URLs, single quotes and flow lists pass', () => {
  assert.deepEqual(plainValueProblems('description: |\n  Step 1: read\n  key: value #x\n\n  more: text\nname: tdd'), []);
  assert.deepEqual(plainValueProblems('description: >\n  a: b\nnext: c: d'), ['next: value is not valid YAML; quote it or use >-']);
  assert.deepEqual(plainValueProblems('source: https://example.com/a#b'), []);
  assert.deepEqual(plainValueProblems("description: 'Use when: a #b'"), []);
  assert.deepEqual(plainValueProblems('tags: [a: b, c #d]'), []);
});

test('plainValueProblems: CRLF input and a quoted value over two lines', () => {
  assert.deepEqual(plainValueProblems('name: x\r\ndescription: a: b\r\nok: y\r\n'), ['description: value is not valid YAML; quote it or use >-']);
  assert.deepEqual(plainValueProblems('description: "Where: a\n  b: c"\nname: x'), []);
});

test('plainValueProblems: a plain value that ends in ":" is flagged; a colon inside a value passes', () => {
  // YAML reads a ":" at the end of a line as a mapping indicator, so "for:" there is an error, not text.
  assert.deepEqual(plainValueProblems('description: Use it for:'), ['description: value is not valid YAML; quote it or use >-']);
  assert.deepEqual(plainValueProblems('name: x\nmetadata:\n  domain: three parts:\r\n'), ['domain: value is not valid YAML; quote it or use >-']);
  assert.deepEqual(plainValueProblems('time: 10:30\nsource: https://example.com/a\nlist: a:b'), []);
  assert.deepEqual(plainValueProblems("description: \"Use it for:\"\ntitle: 'Steps:'"), []);
});

// The value between double quotes, as YAML source text.
const dq = (inner) => parseFrontmatter(`---\nx: "${inner}"\n---\n`).data.x;

test('a double-quoted scalar decodes every YAML 1.2 escape', () => {
  assert.equal(dq('a\tb'), 'a\tb'); // a literal tab, which JSON rejects
  assert.equal(dq('\\x41'), 'A');
  assert.equal(dq('\\0'), '\0');
  assert.equal(dq('\\e'), '\x1b');
  assert.equal(dq('a\\/b'), 'a/b');
  assert.equal(dq('a\\ b'), 'a b');
  assert.equal(dq('\\N\\_\\L\\P'), '\u0085\u00a0\u2028\u2029');
  assert.equal(dq('\\a\\b\\t\\\tx\\n\\v\\f\\r'), '\x07\b\t\tx\n\v\f\r');
  assert.equal(dq('\\u00e9 \\U0001F600'), '\u00e9 \u{1F600}');
  assert.equal(dq('C:\\\\x'), 'C:\\x');
  assert.equal(parseFrontmatter("---\nx: 'It''s'\n---\n").data.x, "It's");
});

test('a double-quoted scalar keeps an unknown or malformed escape as written and still decodes \\"', () => {
  assert.doesNotThrow(() => dq('a\\q'));
  assert.equal(dq('a\\q'), 'a\\q');
  assert.equal(dq('a \\q \\"b\\"'), 'a \\q "b"');
  assert.equal(dq('\\x4g \\"'), '\\x4g "');
  assert.equal(dq('\\U00110000'), '\\U00110000');
});
