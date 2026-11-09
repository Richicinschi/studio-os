// tools/export/test/card-tokens.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkAllCards, checkCard } from '../card-tokens.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..', '..');

test('every token figure in a card is within 10% of the figure computed from the shipped file', () => {
  assert.deepEqual(checkAllCards(root), []);
});

function fixture(card) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-cards-'));
  mkdirSync(path.join(dir, 'cards'));
  writeFileSync(path.join(dir, 'cards', 'demo.md'), card);
  const features = { modules: [{ id: 'm', items: [{ id: 'demo', kind: 'skill', everySessionTokens: 60, onDemandTokens: 2000 }] }], domains: [] };
  return { dir, features };
}
const card = (fm, text) => `---\nid: demo\nmodule: m\nchecked: 2026-11-09\n${fm}---\n\n# Demo\n\n${text}\n`;

test('a skill card must state its description and body, and a figure that drifts more than 10% is flagged', () => {
  const ok = fixture(card('tokens:\n  description: 62\n  body: 1900\n', 'Its description costs about 62 tokens; the body, about 2,100 tokens, loads on use.'));
  const bad = fixture(card('tokens:\n  description: 90\n  body: 2000\n', 'The body, about 3,000 tokens, loads on use.'));
  const none = fixture(card('', 'Nothing stated.'));
  try {
    assert.deepEqual(checkCard(ok.dir, 'demo', ok.features), []);
    const f = checkCard(bad.dir, 'demo', bad.features);
    assert.ok(f.some((x) => /tokens\.description is 90, computed 60/.test(x)), f.join('\n'));
    assert.ok(f.some((x) => /"3,000 tokens"/.test(x)), f.join('\n'));
    assert.equal(checkCard(none.dir, 'demo', none.features).length, 2);
  } finally { for (const x of [ok, bad, none]) rmSync(x.dir, { recursive: true, force: true }); }
});

test('a figure that is not a file size is allowed only when the card lists it in other_figures', () => {
  const listed = fixture(card('tokens:\n  description: 60\n  body: 2000\nother_figures:\n  - 30000\n', 'A session started at about 30,000 tokens.'));
  const unlisted = fixture(card('tokens:\n  description: 60\n  body: 2000\n', 'A session started at about 30,000 tokens.'));
  try {
    assert.deepEqual(checkCard(listed.dir, 'demo', listed.features), []);
    assert.equal(checkCard(unlisted.dir, 'demo', unlisted.features).length, 1);
  } finally { for (const x of [listed, unlisted]) rmSync(x.dir, { recursive: true, force: true }); }
});
