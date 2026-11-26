// tools/export/test/overlap.test.mjs
// The export's overlap report (public issue #61): descriptions that share rare trigger words.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { descriptionOverlaps, shippedDescriptions, knownOverlaps, pairName } from '../overlap.mjs';

test('two descriptions that share rare trigger words are listed; stop words, short words and common words are not', () => {
  const pairs = descriptionOverlaps({
    'skill:parallel': 'Use when facing independent tasks: each one goes to its own subagent, side by side.',
    'skill:driven': 'Use when executing plans whose tasks are independent: a fresh subagent takes each task.',
    'skill:plans': 'Use when writing plans for a task, before touching code.',
    'pack:games': 'Use when making a game in any engine: designing, testing, assets.',
    'pack:godot': 'Use when working on a Godot game: scenes, shaders, testing builds.',
  });
  // "use", "when" and "its" are stop words; plural endings are folded ("tasks" is "task").
  assert.deepEqual(pairs.map((p) => [p.a, p.b, p.shared]), [
    ['skill:driven', 'skill:parallel', ['independent', 'subagent', 'task']],
    ['pack:games', 'pack:godot', ['game', 'testing']],
    ['skill:driven', 'skill:plans', ['plan', 'task']],
  ]);
  assert.deepEqual(descriptionOverlaps({ a: 'alpha beta', b: 'alpha gamma' }), [], 'one shared word is not enough');
  assert.deepEqual(descriptionOverlaps({ a: 'users bugs fixing', b: 'user bug fixing' }).map((p) => p.shared), [['bug', 'fixing']], 'a plural is folded before the stop-word check');
});

test('the shipped descriptions are those that load: each catalog skill, each domain entry and its stubs, never one Claude cannot start', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-overlap-'));
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  try {
    w('catalog/skills/a/SKILL.md', '---\nname: a\ndescription: >-\n  Use when a.\n---\n');
    w('catalog/skills/byname/SKILL.md', '---\nname: byname\ndescription: Started by name only.\ndisable-model-invocation: true\n---\n');
    w('catalog/packs/p/SKILL.md', '---\nname: p\ndescription: "Use when p."\n---\n');
    w('catalog/packs/p/stubs/s/SKILL.md', '---\nname: s\ndescription: Use when s.\n---\n');
    w('catalog/packs/p/skills/inner.md', '---\ndescription: not an entry\n---\n');
    w('catalog/skills/b/notes.md', 'no SKILL.md\n');
    assert.deepEqual(shippedDescriptions(root), { 'skill:a': 'Use when a.', 'pack:p': 'Use when p.', 'stub:p/s': 'Use when s.' });
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('on the kit itself the report runs, and every pair it finds is in tools/export/overlaps.json or is new', () => {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  const pairs = descriptionOverlaps(shippedDescriptions(root));
  for (const p of pairs) {
    assert.ok(p.a < p.b, 'a pair is named in one order');
    assert.ok(p.shared.length >= 2);
  }
  const known = knownOverlaps(root);
  assert.ok(Array.isArray(known) && known.every((k) => typeof k === 'string' && / and /.test(k)), 'overlaps.json is a list of "a and b"');
  assert.equal(pairName({ a: 'skill:x', b: 'skill:y' }), 'skill:x and skill:y');
});
