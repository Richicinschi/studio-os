// tools/export/test/card-checks.test.mjs
// Public issue #32: every card's check block, run by tools/check-setup.mjs on a setup that is right and on
// one that is wrong. A right setup passes; a wrong one fails. Both front doors are tried where a block
// reads "the front door": AGENTS.md, and CLAUDE.md alone. A card that gains a block gains a case here.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkItems, checkItemsText, parseChecks } from '../../check-setup.mjs';
import { recordItem } from '../../installed.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const VAULT_RULE = 'Vault rule: never shorten or delete a memory line; copy it word for word into memory/vault/MEMORY-VAULT.md first, check it landed, then leave a pointer.';

// A rule folded into the front door: right with the words in AGENTS.md or in CLAUDE.md alone, wrong without them.
const frontDoorRule = (words) => ({
  right: [{ files: { 'AGENTS.md': `# Rules\n\n- ${words}\n`, 'CLAUDE.md': '@AGENTS.md\n' }, edited: ['AGENTS.md'] },
    { files: { 'CLAUDE.md': `# Rules\n\n- ${words}\n` }, edited: ['CLAUDE.md'] }],
  wrong: [{ files: { 'AGENTS.md': '# Rules\n\n- Nothing about it.\n' }, edited: ['AGENTS.md'] }],
});

const CASES = {
  'front-door': {
    right: [{ files: { 'AGENTS.md': '# Rules\n', 'CLAUDE.md': '@AGENTS.md\n' }, created: ['AGENTS.md', 'CLAUDE.md'] }],
    wrong: [{ files: { 'AGENTS.md': '# Rules\n', 'CLAUDE.md': '# My own notes\n' }, created: ['AGENTS.md', 'CLAUDE.md'] }],
  },
  'grant-ledger': {
    right: [{ files: { 'grants.md': '# Grants\n\n| Date | Act | Target | Your words | Reference |\n|---|---|---|---|---|\n' }, created: ['grants.md'] }],
    wrong: [{ files: { 'grants.md': '# Grants\n\n| Date | What |\n' }, created: ['grants.md'] }],
  },
  'rules-audit': {
    right: [{ files: { 'audit/rules-audit-brief.md': '# Brief\n\nRead every rule in ~/setup.\n' }, created: ['audit/rules-audit-brief.md'] }],
    wrong: [{ files: { 'audit/rules-audit-brief.md': '# Brief\n\nRead every rule in <your setup>.\n' }, created: ['audit/rules-audit-brief.md'] }],
  },
  vault: {
    right: [
      { files: { 'memory/vault/MEMORY-VAULT.md': '# Vault\n', 'AGENTS.md': `# Rules\n\n${VAULT_RULE}\n`, 'memory/MEMORY.md': `# Memory\n\n${VAULT_RULE}\n` }, created: ['memory/vault/MEMORY-VAULT.md'], edited: ['AGENTS.md', 'memory/MEMORY.md'] },
      { files: { 'memory/vault/MEMORY-VAULT.md': '# Vault\n', 'CLAUDE.md': `# Rules\n\n${VAULT_RULE}\n`, 'memory/MEMORY.md': `# Memory\n\n${VAULT_RULE}\n` }, created: ['memory/vault/MEMORY-VAULT.md'], edited: ['CLAUDE.md', 'memory/MEMORY.md'] },
    ],
    wrong: [{ files: { 'memory/vault/MEMORY-VAULT.md': '# Vault\n', 'AGENTS.md': `# Rules\n\n${VAULT_RULE}\n`, 'memory/MEMORY.md': '# Memory\n\nAbout the vault.\n' }, created: ['memory/vault/MEMORY-VAULT.md'], edited: ['AGENTS.md', 'memory/MEMORY.md'] }],
  },
  worktrees: frontDoorRule('Work on a branch in a git worktree of its own, never by switching the shared checkout.'),
  'commit-and-pr-writing': frontDoorRule('A commit message says why; a PR body says what was verified.'),
  'long-jobs-in-containers': frontDoorRule('A job of more than a few minutes runs in a named container.'),
  'merge-commit-only': frontDoorRule('Merge with a merge commit; never squash.'),
  'project-registry': frontDoorRule('The projects are listed in PROJECTS.md.'),
  'decision-log': {
    right: [{ files: { 'decisions/DECISIONS.md': '# Decisions\n\n## 2026-11-26: Keep the vault\n\nStatus: accepted\n' }, created: ['decisions/DECISIONS.md'] }],
    wrong: [{ files: { 'decisions/DECISIONS.md': '# Decisions\n\nNone yet.\n' }, created: ['decisions/DECISIONS.md'] }],
  },
  'git-guardrails': {
    right: [{ copy: { 'catalog/skills/git-guardrails/scripts': '.claude/hooks/git-guardrails' }, created: ['.claude/hooks/git-guardrails'] }],
    // A guard copied without rules.mjs beside it refuses every command that names git, git status too.
    wrong: [{ copy: { 'catalog/skills/git-guardrails/scripts': '.claude/hooks/git-guardrails' }, drop: ['.claude/hooks/git-guardrails/rules.mjs'], created: ['.claude/hooks/git-guardrails'] }],
  },
};

test('every card with a check block has a right and a wrong setup here', () => {
  const withBlocks = readdirSync(path.join(KIT, 'cards')).filter((f) => f.endsWith('.md'))
    .filter((f) => parseChecks(readFileSync(path.join(KIT, 'cards', f), 'utf8')).steps.length).map((f) => f.slice(0, -3)).sort();
  assert.deepEqual(withBlocks, Object.keys(CASES).sort());
});

for (const [card, { right, wrong }] of Object.entries(CASES)) {
  for (const [want, setups] of [['pass', right], ['fail', wrong]]) {
    setups.forEach((s, n) => {
      test(`${card}: setup ${want === 'pass' ? 'right' : 'wrong'} ${n + 1} ${want}es its check block`, async (t) => {
        const setup = mkdtempSync(path.join(os.tmpdir(), 'kit-card-check-'));
        t.after(() => rmSync(setup, { recursive: true, force: true }));
        for (const [rel, text] of Object.entries(s.files || {})) {
          mkdirSync(path.dirname(path.join(setup, rel)), { recursive: true });
          writeFileSync(path.join(setup, rel), text);
        }
        for (const [from, to] of Object.entries(s.copy || {})) cpSync(path.join(KIT, from), path.join(setup, to), { recursive: true });
        for (const rel of s.drop || []) rmSync(path.join(setup, rel));
        recordItem(setup, { id: card, decision: 'ADOPT', created: s.created || [], edited: s.edited || [] }, { kit: KIT });
        const [result] = await checkItems(setup, { kit: KIT, ids: [card] });
        assert.ok(result.steps.length > 0, 'the block ran');
        assert.equal(result.status, want, checkItemsText([result]));
      });
    });
  }
}
