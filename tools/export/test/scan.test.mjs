// tools/export/test/scan.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { findKey, verdictFrom } from '../scan.mjs';

test('verdictFrom finds the score and recommendation wherever the report nests them', () => {
  assert.deepEqual(verdictFrom({ summary: { risk_score: 12, recommendation: 'REVIEW' } }), { score: 12, recommendation: 'REVIEW' });
  assert.deepEqual(verdictFrom({ results: [{ meta: {} }, { score: 0, Recommendation: 'SAFE' }] }), { score: 0, recommendation: 'SAFE' });
  assert.equal(findKey({ a: { b: 1 } }, /^c$/), undefined);
});
