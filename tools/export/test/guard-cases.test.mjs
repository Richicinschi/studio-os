// tools/export/test/guard-cases.test.mjs
// The shipped git guard (catalog/skills/git-guardrails/scripts/) run against its own case table,
// cases.json, the way Claude Code runs it: the hook's JSON on stdin, exit 2 to refuse, 0 to allow.
// An adopter who tunes rules.mjs runs the same table (cards/git-guardrails.md, Check step 1).
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const scripts = path.join(root, 'catalog/skills/git-guardrails/scripts');
const guard = path.join(scripts, 'block-dangerous-git.mjs');
const cases = JSON.parse(readFileSync(path.join(scripts, 'cases.json'), 'utf8'));

function exitFor({ tool, command }) {
  const r = spawnSync(process.execPath, [guard], {
    input: JSON.stringify({ tool_name: tool, tool_input: { command } }),
    encoding: 'utf8',
  });
  if (r.error) throw r.error;
  return r.status;
}

test('the case table holds both lists, each case a tool and a command', () => {
  assert.ok(Array.isArray(cases.block) && cases.block.length > 0, 'block list');
  assert.ok(Array.isArray(cases.allow) && cases.allow.length > 0, 'allow list');
  for (const c of [...cases.block, ...cases.allow]) {
    assert.ok(['Bash', 'PowerShell'].includes(c.tool), `tool of ${JSON.stringify(c)}`);
    assert.equal(typeof c.command, 'string', `command of ${JSON.stringify(c)}`);
  }
});

test('the shipped guard refuses every command in the block list (exit 2)', () => {
  const missed = cases.block.filter((c) => exitFor(c) !== 2);
  assert.deepEqual(missed, []);
});

test('the shipped guard lets every command in the allow list run (exit 0)', () => {
  const refused = cases.allow.filter((c) => exitFor(c) !== 0);
  assert.deepEqual(refused, []);
});
