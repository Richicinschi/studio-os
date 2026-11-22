// tools/export/test/item-hash.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hashItem } from '../item-hash.mjs';

function item() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'item-hash-'));
  mkdirSync(path.join(root, 'catalog/skills/a'), { recursive: true });
  const w = (rel, t) => writeFileSync(path.join(root, rel), t);
  w('catalog/skills/a/SKILL.md', '# a\n');
  const source = (last) => w('catalog/skills/a/SOURCE.md', `# a: source\n\n- **Origin:** ours\n- **Last scan:** ${last}\n`);
  source('SAFE (risk 0/100), SkillSpector v2.2.3 with --no-llm, 2026-11-19');
  return { root, w, source, files: ['catalog/skills/a/SKILL.md', 'catalog/skills/a/SOURCE.md'], done: () => rmSync(root, { recursive: true, force: true }) };
}

test('the scan hash ignores the whole Last scan line, so a new verdict does not make the item look changed', () => {
  const t = item();
  try {
    const h = hashItem(t.root, t.files, { scanNeutral: true });
    t.source('CAUTION (risk 25/100), SkillSpector v2.13.6 with --no-llm, 2026-11-21; 1 finding, read: 1 false positive ([triage](x))');
    assert.equal(hashItem(t.root, t.files, { scanNeutral: true }), h);
    // The changelog's hash keeps the verdict.
    assert.notEqual(hashItem(t.root, t.files), hashItem(t.root, t.files, { scanNeutral: true }));
  } finally { t.done(); }
});

test('the scan hash changes with any other byte of the item: a file, a SOURCE.md line, or a new file', () => {
  const t = item();
  try {
    const h = hashItem(t.root, t.files, { scanNeutral: true });
    t.w('catalog/skills/a/SKILL.md', '# a\nmore\n');
    const h2 = hashItem(t.root, t.files, { scanNeutral: true });
    assert.notEqual(h2, h);
    t.w('catalog/skills/a/SOURCE.md', '# a: source\n\n- **Origin:** theirs\n- **Last scan:** SAFE (risk 0/100)\n');
    const h3 = hashItem(t.root, t.files, { scanNeutral: true });
    assert.notEqual(h3, h2);
    t.w('catalog/skills/a/extra.md', 'x\n');
    assert.notEqual(hashItem(t.root, [...t.files, 'catalog/skills/a/extra.md'], { scanNeutral: true }), h3);
  } finally { t.done(); }
});
