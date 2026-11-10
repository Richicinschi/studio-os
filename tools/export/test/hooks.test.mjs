// tools/export/test/hooks.test.mjs
// The session hook templates (templates/hooks/) and the never-share list in check-staged.mjs, run
// against throwaway repositories in a sealed git environment: a temporary global config and no system
// config, so the maintainer's own identity, signing and hooks never take part.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const END = path.join(KIT, 'templates/hooks/session-end-check.mjs');
const START = path.join(KIT, 'templates/hooks/session-start-status.mjs');
const DAY = 24 * 3600;

function sandbox() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-hooks-test-'));
  const cfg = path.join(dir, 'gitconfig');
  writeFileSync(cfg, '[user]\n\tname = Hook Test\n\temail = hooks@example.invalid\n[init]\n\tdefaultBranch = main\n[commit]\n\tgpgsign = false\n');
  const env = { ...process.env, GIT_CONFIG_GLOBAL: cfg, GIT_CONFIG_NOSYSTEM: '1' };
  delete env.GIT_DIR;
  delete env.CLAUDE_PROJECT_DIR;
  const git = (cwd, args, extra = {}) => {
    const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...env, ...extra } });
    if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
    return r.stdout.trim();
  };
  const repo = (rel) => {
    const p = path.join(dir, rel);
    mkdirSync(p, { recursive: true });
    git(p, ['init', '-q']);
    writeFileSync(path.join(p, 'README.md'), 'x\n');
    git(p, ['add', '.']);
    git(p, ['commit', '-q', '-m', 'first']);
    return p;
  };
  let remotes = 0;
  const withRemote = (p) => {
    const bare = path.join(dir, `remote-${remotes++}.git`);
    git(dir, ['init', '-q', '--bare', bare]);
    git(p, ['remote', 'add', 'origin', bare]);
    git(p, ['push', '-q', 'origin', 'main']);
    return p;
  };
  const run = (script, cwd, input = '') => {
    const r = spawnSync(process.execPath, [script], { cwd, input, encoding: 'utf8', env });
    return { status: r.status, out: r.stdout, err: r.stderr };
  };
  return { dir, git, repo, withRemote, run, done: () => rmSync(dir, { recursive: true, force: true }) };
}

test('session-end-check: clean repositories let the session end', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    s.withRemote(s.repo('setup/work'));
    writeFileSync(path.join(setup, '.gitignore'), 'work/\n');
    s.git(setup, ['add', '.gitignore']);
    s.git(setup, ['commit', '-q', '-m', 'ignore work']);
    s.git(setup, ['push', '-q', 'origin', 'main']);
    mkdirSync(path.join(setup, 'registry'));
    writeFileSync(path.join(setup, 'registry/PROJECTS.md'), '| Project | Path | Status |\n|---|---|---|\n| Work | `work` | active |\n');
    s.git(setup, ['add', 'registry']);
    s.git(setup, ['commit', '-q', '-m', 'registry']);
    s.git(setup, ['push', '-q', 'origin', 'main']);
    const r = s.run(END, setup);
    assert.equal(r.status, 0, r.err);
    assert.equal(r.err, '');
  } finally { s.done(); }
});

test('session-end-check: a commit on no remote and older than the active window stops the session; the rest is listed with it', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const work = s.withRemote(s.repo('work'));
    mkdirSync(path.join(setup, 'adoption'));
    writeFileSync(path.join(setup, 'adoption/inventory.md'), `## Repositories\n| Folder | Remote host | Branch | Clean |\n|---|---|---|---|\n| \`${work.split(path.sep).join('/')}\` | example.invalid | main | yes |\n`);
    const twoHoursAgo = `${Math.floor(Date.now() / 1000) - 2 * 3600} +0000`;
    writeFileSync(path.join(work, 'README.md'), 'changed\n');
    s.git(work, ['commit', '-q', '-am', 'local only'], { GIT_COMMITTER_DATE: twoHoursAgo, GIT_AUTHOR_DATE: twoHoursAgo });
    writeFileSync(path.join(setup, 'notes.md'), 'draft\n');
    const r = s.run(END, setup);
    assert.equal(r.status, 2);
    assert.match(r.err, /work: 1 commit not on any remote, the oldest from 2 hours ago/);
    assert.match(r.err, /Also worth knowing[\s\S]*setup: uncommitted changes/);
    assert.match(r.err, /never pushes or cleans/);
  } finally { s.done(); }
});

test('session-end-check: fresh commits and uncommitted work alone never stop a session, nor a repository without a remote', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    writeFileSync(path.join(setup, 'README.md'), 'changed\n');
    s.git(setup, ['commit', '-q', '-am', 'just now']);
    writeFileSync(path.join(setup, 'notes.md'), 'draft\n');
    assert.equal(s.run(END, setup).status, 0);
    const local = s.repo('local');
    const old = `${Math.floor(Date.now() / 1000) - 5 * 3600} +0000`;
    writeFileSync(path.join(local, 'README.md'), 'changed\n');
    s.git(local, ['commit', '-q', '-am', 'old, no remote'], { GIT_COMMITTER_DATE: old, GIT_AUTHOR_DATE: old });
    assert.equal(s.run(END, local).status, 0);
  } finally { s.done(); }
});

test('session-end-check: the second stop always goes through', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const old = `${Math.floor(Date.now() / 1000) - 3 * 3600} +0000`;
    writeFileSync(path.join(setup, 'README.md'), 'changed\n');
    s.git(setup, ['commit', '-q', '-am', 'old'], { GIT_COMMITTER_DATE: old, GIT_AUTHOR_DATE: old });
    assert.equal(s.run(END, setup, JSON.stringify({ stop_hook_active: false })).status, 2);
    assert.equal(s.run(END, setup, JSON.stringify({ stop_hook_active: true })).status, 0);
  } finally { s.done(); }
});

test('session-start-status: nothing printed when all is clean, and at most ten lines otherwise', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    assert.equal(s.run(START, setup).out, '');
    const old = `${Math.floor(Date.now() / 1000) - 30 * DAY} +0000`;
    s.git(setup, ['checkout', '-q', '-b', 'old-idea']);
    writeFileSync(path.join(setup, 'idea.md'), 'x\n');
    s.git(setup, ['add', 'idea.md']);
    s.git(setup, ['commit', '-q', '-m', 'old idea'], { GIT_COMMITTER_DATE: old, GIT_AUTHOR_DATE: old });
    s.git(setup, ['checkout', '-q', 'main']);
    writeFileSync(path.join(setup, 'AGENTS.md'), '# Front door\n\n## Current state\n\n**2020-01-01**: started.\n');
    s.git(setup, ['add', 'AGENTS.md']);
    s.git(setup, ['commit', '-q', '-m', 'front door']);
    for (let i = 0; i < 12; i++) {
      s.git(setup, ['branch', `stale-${String(i).padStart(2, '0')}`, 'old-idea']);
    }
    const r = s.run(START, setup);
    assert.equal(r.status, 0);
    const lines = r.out.trim().split('\n');
    assert.ok(lines.length <= 10, r.out);
    assert.match(r.out, /setup: 1 commit not on any remote/);
    assert.match(r.out, /setup: the front door's current state \(2020-01-01\) is \d+ days older than the last commit/);
    assert.match(r.out, /setup: branch old-idea idle for 30 days/);
    assert.match(lines.at(-1), /and \d+ more/);
  } finally { s.done(); }
});

test('session-start-status: a repository with no commits yet is skipped, and the checked-out branch is never called idle', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const empty = path.join(s.dir, 'empty');
    mkdirSync(empty);
    s.git(empty, ['init', '-q']);
    mkdirSync(path.join(setup, 'registry'));
    writeFileSync(path.join(setup, 'registry/PROJECTS.md'), `| Project | Path |\n|---|---|\n| Empty | \`${empty.split(path.sep).join('/')}\` |\n`);
    s.git(setup, ['add', 'registry']);
    const old = `${Math.floor(Date.now() / 1000) - 40 * DAY} +0000`;
    s.git(setup, ['commit', '-q', '-m', 'registry'], { GIT_COMMITTER_DATE: old, GIT_AUTHOR_DATE: old });
    s.git(setup, ['push', '-q', 'origin', 'main']);
    const r = s.run(START, setup);
    assert.equal(r.status, 0, r.err);
    assert.doesNotMatch(r.out, /branch main idle/);
    const end = s.run(END, setup);
    assert.equal(end.status, 0, end.err);
  } finally { s.done(); }
});

test('session-end-check: the oldest unpushed commit is the earliest date, whatever the order', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const at = (h) => `${Math.floor(Date.now() / 1000) - h * 3600} +0000`;
    writeFileSync(path.join(setup, 'a.md'), 'a\n');
    s.git(setup, ['add', 'a.md']);
    s.git(setup, ['commit', '-q', '-m', 'a'], { GIT_COMMITTER_DATE: at(2), GIT_AUTHOR_DATE: at(2) });
    writeFileSync(path.join(setup, 'b.md'), 'b\n');
    s.git(setup, ['add', 'b.md']);
    s.git(setup, ['commit', '-q', '-m', 'b'], { GIT_COMMITTER_DATE: at(5), GIT_AUTHOR_DATE: at(5) });
    const r = s.run(END, setup);
    assert.equal(r.status, 2);
    assert.match(r.err, /setup: 2 commits not on any remote, the oldest from 5 hours ago/);
  } finally { s.done(); }
});

test('the never-share list refuses a staged file holding one of its terms, as a whole word and in any case', () => {
  const s = sandbox();
  try {
    const hooks = path.join(s.dir, 'git-hooks');
    cpSync(path.join(KIT, 'templates/git-hooks'), hooks, { recursive: true });
    writeFileSync(path.join(hooks, 'never-share.local.txt'), '# one term per line\nQuenlin Logistics\nzorbal\n');
    const work = s.repo('work');
    s.git(work, ['config', 'core.hooksPath', hooks.split(path.sep).join('/')]);
    const tryCommit = (text) => {
      writeFileSync(path.join(work, 'notes.md'), text);
      s.git(work, ['add', 'notes.md']);
      const r = spawnSync('git', ['commit', '-q', '-m', 'notes'], { cwd: work, encoding: 'utf8', env: { ...process.env, GIT_CONFIG_GLOBAL: path.join(s.dir, 'gitconfig'), GIT_CONFIG_NOSYSTEM: '1' } });
      return { status: r.status, err: r.stderr };
    };
    const refused = tryCommit('Report for quenlin logistics, draft.\n');
    assert.notEqual(refused.status, 0);
    assert.match(refused.err, /notes\.md: a term from your never-share list \(line 2 of the list\)/);
    assert.doesNotMatch(refused.err, /quenlin/i);
    assert.equal(tryCommit('The zorbals are fine.\n').status, 0);
  } finally { s.done(); }
});

test('every gitleaks command the pre-commit check tells the person to run redacts the secret', () => {
  // Run inside a Claude session, an unredacted command would print the secret into the session.
  const src = readFileSync(path.join(KIT, 'templates/git-hooks/check-staged.mjs'), 'utf8');
  const shown = [...src.matchAll(/`(gitleaks [^`]+)`/g)].map((m) => m[1]);
  assert.ok(shown.length > 0, 'check-staged.mjs shows no gitleaks command');
  for (const cmd of shown) assert.match(cmd, /--redact\b/, cmd);
});
