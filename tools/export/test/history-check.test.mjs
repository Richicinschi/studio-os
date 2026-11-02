// tools/export/test/history-check.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkHistory, privateTerms } from '../history-check.mjs';

// A throwaway repository; identity and signing come from a temporary global config, never from flags.
function sandbox() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-history-test-'));
  const cfg = path.join(dir, 'gitconfig');
  writeFileSync(cfg, '[user]\n\tname = History Test\n\temail = history@example.invalid\n[init]\n\tdefaultBranch = main\n[commit]\n\tgpgsign = false\n');
  const env = { ...process.env, GIT_CONFIG_GLOBAL: cfg, GIT_CONFIG_NOSYSTEM: '1' };
  delete env.GIT_DIR;
  const repo = path.join(dir, 'repo');
  mkdirSync(repo);
  const git = (...args) => {
    const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8', env });
    if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
    return r.stdout.trim();
  };
  const commit = (file, text, message) => {
    mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
    writeFileSync(path.join(repo, file), text);
    git('add', '-A');
    git('commit', '-q', '-m', message);
    return git('rev-parse', 'HEAD');
  };
  git('init', '-q');
  return { dir, repo, git, commit, done: () => rmSync(dir, { recursive: true, force: true }) };
}

test('history-check finds a term in a file, a file name or a message, by number only, and passes a clean commit', () => {
  const s = sandbox();
  try {
    const terms = ['Zorblat', 'Quenlin app'];
    const first = s.commit('docs/a.md', 'Built for the Quenlin app.\n', 'start');
    const second = s.commit('docs/zorblat-notes.md', 'clean\n', 'add notes');
    s.git('rm', '-q', 'docs/a.md', 'docs/zorblat-notes.md');
    s.git('commit', '-q', '-m', 'Zorblat said so');
    const third = s.git('rev-parse', 'HEAD');
    const clean = s.commit('docs/b.md', 'Nothing private here.\n', 'clean up');

    assert.deepEqual(checkHistory({ repo: s.repo, refs: [first, '-1'], terms }), { commits: 1, bad: 1, seen: ['#2'] });
    assert.deepEqual(checkHistory({ repo: s.repo, refs: [second, '-1'], terms }).seen, ['#2', 'file name #1']);
    assert.deepEqual(checkHistory({ repo: s.repo, refs: [third, '-1'], terms }).seen, ['message #1']);
    assert.deepEqual(checkHistory({ repo: s.repo, refs: [clean, '-1'], terms }), { commits: 1, bad: 0, seen: [] });
    assert.equal(checkHistory({ repo: s.repo, terms }).bad, 3);
  } finally { s.done(); }
});

test('the private terms come from the three local files: the owner, the deny list, and private ids and sources', () => {
  const s = sandbox();
  try {
    const local = path.join(s.repo, 'tools/export');
    mkdirSync(local, { recursive: true });
    assert.throws(() => privateTerms(s.repo), /private list missing/);
    writeFileSync(path.join(local, 'owner.local.txt'), 'Zorblat\n');
    writeFileSync(path.join(local, 'privacy.local.txt'), '# terms\nZorblat\nQuenlin app\n');
    writeFileSync(path.join(local, 'private.local.txt'), 'skill:vexmoor-diary\nsource modules/12/README.md .studio/memory/vexmoor-research.md\n');
    assert.deepEqual(privateTerms(s.repo), ['Zorblat', 'Quenlin app', 'vexmoor-diary', 'vexmoor-research']);
  } finally { s.done(); }
});
