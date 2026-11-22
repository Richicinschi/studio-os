// tools/export/test/hooks.test.mjs
// The session hook templates (templates/hooks/) and the never-share list in check-staged.mjs, run
// against throwaway repositories in a sealed git environment: a temporary global config and no system
// config, so the maintainer's own identity, signing and hooks never take part.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const END = path.join(KIT, 'templates/hooks/session-end-check.mjs');
const START = path.join(KIT, 'templates/hooks/session-start-status.mjs');
const DAY = 24 * 3600;
// Network addresses are assembled at runtime, so no kit file carries them as literals (the export's paths gate).
const ip = (...octets) => octets.join('.');

function sandbox() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-hooks-test-'));
  const cfg = path.join(dir, 'gitconfig');
  writeFileSync(cfg, '[user]\n\tname = Hook Test\n\temail = hooks@example.invalid\n[init]\n\tdefaultBranch = main\n[commit]\n\tgpgsign = false\n');
  // The hooks' temporary folder is the sandbox's own, so the end check's state files never reach the real one.
  const tmp = path.join(dir, 'tmp');
  mkdirSync(tmp);
  // The home folder and Claude Code's config folder are the sandbox's own too, so the start status
  // never reads the real user settings.
  const home = path.join(dir, 'home');
  mkdirSync(home);
  const config = path.join(dir, 'config');
  const env = { ...process.env, GIT_CONFIG_GLOBAL: cfg, GIT_CONFIG_NOSYSTEM: '1', TMP: tmp, TEMP: tmp, TMPDIR: tmp, HOME: home, USERPROFILE: home, CLAUDE_CONFIG_DIR: config };
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
  // `extra` adds to the environment; a key set to undefined is removed from it.
  const run = (script, cwd, input = '', extra = {}) => {
    const e = { ...env, ...extra };
    for (const k of Object.keys(e)) if (e[k] === undefined) delete e[k];
    const r = spawnSync(process.execPath, [script], { cwd, input, encoding: 'utf8', env: e });
    return { status: r.status, out: r.stdout, err: r.stderr };
  };
  // A repository whose commits run a copy of templates/git-hooks; `attempt` returns instead of throwing.
  let hooks = '';
  const hooked = (rel) => {
    if (!hooks) {
      hooks = path.join(dir, 'git-hooks');
      cpSync(path.join(KIT, 'templates/git-hooks'), hooks, { recursive: true });
    }
    const p = repo(rel);
    git(p, ['config', 'core.hooksPath', hooks.split(path.sep).join('/')]);
    return p;
  };
  const attempt = (cwd, args, extra = {}) => {
    const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...env, ...extra } });
    return { status: r.status, out: r.stdout, err: r.stderr };
  };
  return { dir, tmp, home, config, git, repo, withRemote, run, hooked, attempt, done: () => rmSync(dir, { recursive: true, force: true }) };
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

test('session-start-status: nothing printed when all is clean; idle branches folded to one line; at most ten lines', () => {
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
    const three = r.out.trim().split('\n');
    assert.equal(three.length, 3, r.out);
    assert.equal(three[0], 'setup: 2 commits not on any remote'); // the front door's on main, the idea's on old-idea
    assert.match(three[1], /^setup: the front door's current state \(2020-01-01\) is \d+ days older than the last commit$/);
    assert.equal(three[2], 'setup: 13 branches idle for more than 14 days');
    // Eleven repositories with uncommitted changes: nine lines, then the count of the rest.
    const cells = [];
    for (let i = 0; i < 11; i++) {
      const p = s.repo(`many/r${String(i).padStart(2, '0')}`);
      writeFileSync(path.join(p, 'draft.md'), 'x\n');
      cells.push(`| R${i} | \`${p.split(path.sep).join('/')}\` |`);
    }
    mkdirSync(path.join(setup, 'registry'));
    writeFileSync(path.join(setup, 'registry/PROJECTS.md'), `| Project | Path |\n|---|---|\n${cells.join('\n')}\n`);
    const lines = s.run(START, setup).out.trim().split('\n');
    assert.equal(lines.length, 10, lines.join('\n'));
    assert.match(lines.at(-1), /^\.\.\. and \d+ more$/);
  } finally { s.done(); }
});

test('session-start-status: a date counts only inside the current state section, up to the next heading of the same or higher level', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const frontDoor = (text) => {
      writeFileSync(path.join(setup, 'AGENTS.md'), text);
      s.git(setup, ['add', 'AGENTS.md']);
      s.git(setup, ['commit', '-q', '-m', 'front door']);
      s.git(setup, ['push', '-q', 'origin', 'main']);
      return s.run(START, setup);
    };
    // The state has no date; the history's date is not the state's: no date, so no line.
    let r = frontDoor('# Front door\n\n## Current state\n\nWorking on the export.\n\n## History\n\n**2025-01-01**: started.\n');
    assert.equal(r.status, 0, r.err);
    assert.equal(r.out, '');
    // A lower heading, and a heading-like line in a fenced block, stay inside the section.
    r = frontDoor('# Front door\n\n## Current state\n\n```\n# not a heading\n```\n\n### Next\n\n**2020-01-01**: started.\n\n## History\n\n**2025-01-01**: older notes.\n');
    assert.equal(r.status, 0, r.err);
    assert.match(r.out.trim(), /^setup: the front door's current state \(2020-01-01\) is \d+ days older than the last commit$/);
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

// Helpers for the session hook cases below (studio-os #42, #43).
const posix = (p) => p.split(path.sep).join('/');
const register = (setup, cells) => {
  mkdirSync(path.join(setup, 'registry'), { recursive: true });
  writeFileSync(path.join(setup, 'registry/PROJECTS.md'), `| Project | Path | Status |\n|---|---|---|\n${cells.map((c, i) => `| P${i} | \`${c}\` | active |`).join('\n')}\n`);
};
const hoursAgo = (h) => `${Math.floor(Date.now() / 1000) - h * 3600} +0000`;
const commitAt = (s, repo, file, h) => {
  writeFileSync(path.join(repo, file), `${file} ${h}\n`);
  s.git(repo, ['add', file]);
  s.git(repo, ['commit', '-q', '-m', file], { GIT_COMMITTER_DATE: hoursAgo(h), GIT_AUTHOR_DATE: hoursAgo(h) });
  return s.git(repo, ['rev-parse', 'HEAD']);
};

test('session hooks: a repository with 30,000 untracked files does not silence the others', (t) => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const dirty = s.withRemote(s.repo('dirty'));
    mkdirSync(path.join(dirty, 'out'));
    writeFileSync(path.join(dirty, 'out/.gitkeep'), 'keep\n');
    s.git(dirty, ['add', '.']);
    s.git(dirty, ['commit', '-q', '-m', 'base']);
    s.git(dirty, ['push', '-q', 'origin', 'main']);
    let started = Date.now();
    for (let i = 1; i <= 30000; i++) writeFileSync(path.join(dirty, `out/sample-${String(i).padStart(6, '0')}-prediction.json`), '{}');
    t.diagnostic(`writing 30,000 files: ${Date.now() - started} ms`);
    const late = s.withRemote(s.repo('late'));
    commitAt(s, late, 'late.md', 2);
    register(setup, [posix(dirty), posix(late)]);
    started = Date.now();
    const end = s.run(END, setup);
    t.diagnostic(`end check: ${Date.now() - started} ms`);
    assert.equal(end.status, 2, end.err);
    assert.match(end.err, /late: 1 commit not on any remote, the oldest from 2 hours ago/);
    assert.match(end.err, /dirty: uncommitted changes/);
    started = Date.now();
    const start = s.run(START, setup);
    t.diagnostic(`start status: ${Date.now() - started} ms`);
    assert.equal(start.status, 0, start.err);
    assert.match(start.out, /^dirty: uncommitted changes$/m);
    assert.match(start.out, /^late: 1 commit not on any remote$/m);
  } finally { s.done(); }
});

test('session hooks: a repository git cannot read is named "could not be checked", and the others are still reported', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const broken = path.join(s.dir, 'broken');
    mkdirSync(broken);
    writeFileSync(path.join(broken, '.git'), `gitdir: ${posix(path.join(s.dir, 'missing-git-dir'))}\n`);
    const late = s.withRemote(s.repo('late'));
    commitAt(s, late, 'late.md', 2);
    register(setup, [posix(broken), posix(late), '/x/gone-for-the-hook-test']);
    const end = s.run(END, setup);
    assert.equal(end.status, 2, end.err);
    assert.match(end.err, /late: 1 commit not on any remote/);
    assert.match(end.err, /broken: could not be checked/);
    assert.doesNotMatch(end.err, /not found/); // a missing path is the start status's to name
    const start = s.run(START, setup);
    assert.equal(start.status, 0, start.err);
    assert.match(start.out, /^broken: could not be checked$/m);
    assert.match(start.out, /^late: 1 commit not on any remote$/m);
  } finally { s.done(); }
});

test('session-start-status: a registry cell that looks like a path and does not exist is named', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    register(setup, ['/x/no-such-folder-for-the-hook-test']);
    const r = s.run(START, setup);
    assert.equal(r.status, 0, r.err);
    assert.match(r.out, /^\/x\/no-such-folder-for-the-hook-test: not found$/m);
    assert.doesNotMatch(r.out, /active: not found|P0: not found/);
  } finally { s.done(); }
});

test('session-start-status: on Windows a /c/... cell, the way Git Bash prints it, is read as C:/...', { skip: process.platform === 'win32' ? false : 'Git Bash drive paths exist on Windows only' }, () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const gamma = s.repo('gamma');
    writeFileSync(path.join(gamma, 'draft.md'), 'x\n');
    register(setup, [`/${gamma[0].toLowerCase()}${posix(gamma.slice(2))}`]);
    const r = s.run(START, setup);
    assert.equal(r.status, 0, r.err);
    assert.match(r.out, /^gamma: uncommitted changes$/m);
  } finally { s.done(); }
});

test('session hooks: both count HEAD and every branch, so a detached HEAD and a branch not checked out are seen', () => {
  const s = sandbox();
  try {
    const detached = s.withRemote(s.repo('detached'));
    s.git(detached, ['checkout', '-q', '--detach']);
    commitAt(s, detached, 'loose.md', 3);
    const end = s.run(END, detached);
    assert.equal(end.status, 2, end.err);
    assert.match(end.err, /detached: 1 commit not on any remote, the oldest from 3 hours ago/);
    const side = s.withRemote(s.repo('side'));
    s.git(side, ['checkout', '-q', '-b', 'idea']);
    commitAt(s, side, 'idea.md', 3);
    s.git(side, ['checkout', '-q', 'main']);
    const start = s.run(START, side);
    assert.equal(start.status, 0, start.err);
    assert.match(start.out, /^side: 1 commit not on any remote$/m);
  } finally { s.done(); }
});

test('session-start-status: unsaved work is printed before idle branches, however many there are', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    s.git(setup, ['checkout', '-q', '-b', 'old-idea']);
    commitAt(s, setup, 'idea.md', 30 * 24);
    s.git(setup, ['checkout', '-q', 'main']);
    s.git(setup, ['push', '-q', 'origin', 'old-idea']);
    for (let i = 1; i < 12; i++) s.git(setup, ['branch', `stale-${String(i).padStart(2, '0')}`, 'old-idea']);
    const work = s.withRemote(s.repo('work'));
    writeFileSync(path.join(work, 'draft.md'), 'x\n');
    register(setup, [posix(work)]);
    const lines = s.run(START, setup).out.trim().split('\n');
    assert.ok(lines.length <= 10, lines.join('\n'));
    assert.ok(lines.includes('work: uncommitted changes'), lines.join('\n'));
    assert.ok(lines.includes('setup: 12 branches idle for more than 14 days'), lines.join('\n'));
    assert.ok(lines.indexOf('work: uncommitted changes') < lines.indexOf('setup: 12 branches idle for more than 14 days'));
  } finally { s.done(); }
});

test('session-end-check: the same commits stop a session once; a new old commit or a new session stops it again', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const first = commitAt(s, setup, 'a.md', 3);
    const state = path.join(s.tmp, 'claude-session-end-check');
    const stop = (fields) => s.run(END, setup, JSON.stringify({ stop_hook_active: false, ...fields })).status;
    assert.deepEqual([stop({ session_id: 's-1' }), stop({ session_id: 's-1' }), stop({ session_id: 's-1' })], [2, 0, 0]);
    const top = s.git(setup, ['rev-parse', '--show-toplevel']);
    assert.deepEqual(JSON.parse(readFileSync(path.join(state, 's-1.json'), 'utf8')), { reported: [`${top}@${first}`] });
    commitAt(s, setup, 'b.md', 2);
    assert.deepEqual([stop({ session_id: 's-1' }), stop({ session_id: 's-1' })], [2, 0]);
    assert.equal(stop({ session_id: 's-2' }), 2);
    rmSync(state, { recursive: true, force: true });
    assert.deepEqual([stop({}), stop({}), stop({})], [2, 2, 2]);
    assert.deepEqual([stop({ session_id: '../escape' }), stop({ session_id: '../escape' })], [2, 2]);
    assert.deepEqual([stop({ session_id: 42 }), stop({ session_id: 42 })], [2, 2]);
    assert.equal(existsSync(state), false);
    assert.deepEqual(readdirSync(s.tmp), []);
  } finally { s.done(); }
});

test('session-end-check: a setup folder that is not a git repository still gets one stop per session', () => {
  const s = sandbox();
  try {
    const setup = path.join(s.dir, 'setup');
    mkdirSync(setup);
    const work = s.withRemote(s.repo('work'));
    commitAt(s, work, 'old.md', 3);
    register(setup, [posix(work)]);
    const stop = () => s.run(END, setup, JSON.stringify({ session_id: 'plain-folder', stop_hook_active: false }));
    const replies = [stop(), stop(), stop()];
    assert.deepEqual(replies.map((r) => r.status), [2, 0, 0], replies[0].err);
    assert.match(replies[0].err, /work: 1 commit not on any remote/);
  } finally { s.done(); }
});

test('session-end-check: an input of null, or with a byte-order mark, is read without a TypeError', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const clean = s.run(END, setup, 'null');
    assert.equal(clean.status, 0, clean.err);
    assert.equal(clean.err, '');
    commitAt(s, setup, 'old.md', 3);
    const old = s.run(END, setup, 'null');
    assert.equal(old.status, 2, old.err);
    assert.doesNotMatch(old.err, /TypeError/);
    assert.match(old.err, /setup: 1 commit not on any remote/);
    const bom = `\uFEFF${JSON.stringify({ session_id: 'with-bom', stop_hook_active: false })}`;
    assert.deepEqual([s.run(END, setup, bom).status, s.run(END, setup, bom).status], [2, 0]);
  } finally { s.done(); }
});

test('session-start-status: only a missing path in a Path or Folder column is named, once, after the unsaved work', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const work = s.withRemote(s.repo('work'));
    writeFileSync(path.join(work, 'draft.md'), 'x\n');
    const gone = '/x/gone-for-the-hook-test';
    // The kit's registry template has four columns; "Read first" names a file, not a repository.
    mkdirSync(path.join(setup, 'registry'));
    writeFileSync(path.join(setup, 'registry/PROJECTS.md'), [
      '| Project | Path | Status | Read first |', '|---|---|---|---|',
      `| Work | \`${posix(work)}\` | active | \`${posix(work)}/AGENTS.md\` |`,
      `| Gone | \`${gone}\` | paused | \`${gone}/AGENTS.md\` |`,
      `| Gone again | \`${gone}\` | paused | \`/handoff\` |`,
      '', '| Skill | Where |', '|:---|---|', '| handoff | `~/.claude/skills` |', '',
    ].join('\n'));
    const r = s.run(START, setup);
    assert.equal(r.status, 0, r.err);
    assert.deepEqual(r.out.trim().split('\n'), ['setup: uncommitted changes', 'work: uncommitted changes', `${gone}: not found`]);
  } finally { s.done(); }
});

test('session-end-check: a repository git cannot read stops the session once per session, on its own', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const broken = path.join(s.dir, 'broken');
    mkdirSync(broken);
    writeFileSync(path.join(broken, '.git'), `gitdir: ${posix(path.join(s.dir, 'missing-git-dir'))}\n`);
    register(setup, [posix(broken)]);
    s.git(setup, ['add', 'registry']);
    s.git(setup, ['commit', '-q', '-m', 'registry']);
    s.git(setup, ['push', '-q', 'origin', 'main']);
    const stop = (fields) => s.run(END, setup, JSON.stringify({ stop_hook_active: false, ...fields }));
    const replies = [stop({ session_id: 'b-1' }), stop({ session_id: 'b-1' }), stop({ session_id: 'b-1' })];
    assert.deepEqual(replies.map((r) => r.status), [2, 0, 0], replies[0].err);
    assert.match(replies[0].err, /Git could not read these repositories[\s\S]*broken: could not be checked/);
    assert.doesNotMatch(replies[0].err, /These commits exist only|Push what should be kept/);
    assert.deepEqual(JSON.parse(readFileSync(path.join(s.tmp, 'claude-session-end-check/b-1.json'), 'utf8')), { reported: [`${broken}@unreadable`] });
    assert.deepEqual([stop({}).status, stop({}).status, stop({}).status], [2, 2, 2]);
  } finally { s.done(); }
});

test('session hooks: with git missing from the PATH, both say so; the end check once per session', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const noGit = { PATH: path.dirname(process.execPath) };
    for (const k of Object.keys(process.env)) if (/^path$/i.test(k) && k !== 'PATH') noGit[k] = undefined;
    const start = s.run(START, setup, '', noGit);
    assert.equal(start.status, 0, start.err);
    assert.match(start.out, /^setup: could not be checked$/m);
    const input = JSON.stringify({ session_id: 'no-git', stop_hook_active: false });
    const replies = [s.run(END, setup, input, noGit), s.run(END, setup, input, noGit), s.run(END, setup, input, noGit)];
    assert.deepEqual(replies.map((r) => r.status), [2, 0, 0], replies[0].err);
    assert.match(replies[0].err, /setup: could not be checked/);
  } finally { s.done(); }
});

test('session-end-check: session files older than 7 days are deleted, nothing else; a quiet reply keeps its own fresh', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const state = path.join(s.tmp, 'claude-session-end-check');
    mkdirSync(state);
    const daysAgo = (d) => new Date(Date.now() - d * DAY * 1000);
    const put = (name, d) => { writeFileSync(path.join(state, name), '{"reported":[]}'); utimesSync(path.join(state, name), daysAgo(d), daysAgo(d)); };
    put('old-session.json', 8);
    put('fresh-session.json', 1);
    put('notes.txt', 8);
    put('not.a.session.json', 8);
    assert.equal(s.run(END, setup, '{}').status, 0);
    assert.deepEqual(readdirSync(state).sort(), ['fresh-session.json', 'not.a.session.json', 'notes.txt']);
    commitAt(s, setup, 'old.md', 3);
    const input = JSON.stringify({ session_id: 'long', stop_hook_active: false });
    assert.equal(s.run(END, setup, input).status, 2);
    const mine = path.join(state, 'long.json');
    utimesSync(mine, daysAgo(6), daysAgo(6));
    assert.equal(s.run(END, setup, input).status, 0);
    assert.ok(statSync(mine).mtimeMs > Date.now() - 60000, 'the quiet reply refreshed the file');
  } finally { s.done(); }
});

test('session-end-check: the state folder is private to the user (not on Windows)', { skip: process.platform === 'win32' ? 'Windows has no POSIX file modes' : false }, () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    commitAt(s, setup, 'old.md', 3);
    assert.equal(s.run(END, setup, JSON.stringify({ session_id: 'mode' })).status, 2);
    assert.equal(statSync(path.join(s.tmp, 'claude-session-end-check')).mode & 0o777, 0o700);
  } finally { s.done(); }
});

test('session hooks: a data row whose first cell is "-" is a row, not a table rule', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const work = s.withRemote(s.repo('work'));
    writeFileSync(path.join(work, 'draft.md'), 'x\n');
    const late = s.withRemote(s.repo('late'));
    commitAt(s, late, 'late.md', 3);
    mkdirSync(path.join(setup, 'registry'));
    writeFileSync(path.join(setup, 'registry/PROJECTS.md'), [
      '| Project | Path | Status |', '| :--- | --- | ---: |',
      `| work | \`${posix(work)}\` | active |`,
      `| - | \`${posix(late)}\` | paused |`,
      '| - | `/x/gone-for-the-hook-test` | - |', '',
    ].join('\n'));
    const start = s.run(START, setup);
    assert.equal(start.status, 0, start.err);
    assert.match(start.out, /^work: uncommitted changes$/m);
    assert.match(start.out, /^late: 1 commit not on any remote$/m);
    assert.match(start.out, /^\/x\/gone-for-the-hook-test: not found$/m);
    const end = s.run(END, setup);
    assert.equal(end.status, 2, end.err);
    assert.match(end.err, /late: 1 commit not on any remote, the oldest from 3 hours ago/);
    assert.match(end.err, /work: uncommitted changes/);
  } finally { s.done(); }
});

test('session-end-check: a state folder that is a link is neither pruned nor written; the check runs as with no session id', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    commitAt(s, setup, 'old.md', 3);
    const target = path.join(s.dir, 'elsewhere');
    mkdirSync(target);
    const victim = path.join(target, 'someone-else.json');
    writeFileSync(victim, '{}');
    const old = new Date(Date.now() - 8 * DAY * 1000);
    utimesSync(victim, old, old);
    symlinkSync(target, path.join(s.tmp, 'claude-session-end-check'), process.platform === 'win32' ? 'junction' : 'dir');
    const input = JSON.stringify({ session_id: 'linked', stop_hook_active: false });
    assert.deepEqual([s.run(END, setup, input).status, s.run(END, setup, input).status], [2, 2]);
    assert.deepEqual(readdirSync(target), ['someone-else.json']);
  } finally { s.done(); }
});

// An old session file held open by another process with no sharing, so deleting it fails (EBUSY):
// the prune's per-entry catch must skip it and go on. Windows only: POSIX deletes an open file.
test('session-end-check: an old session file that cannot be deleted does not stop the rest of the prune', { skip: process.platform === 'win32' ? false : 'a file held open cannot be deleted on Windows only; POSIX systems delete it' }, async () => {
  const s = sandbox();
  let locker;
  try {
    const setup = s.withRemote(s.repo('setup'));
    const state = path.join(s.tmp, 'claude-session-end-check');
    mkdirSync(state);
    const old = new Date(Date.now() - 8 * DAY * 1000);
    for (const f of ['aaa-locked.json', 'bbb-old.json', 'zzz-old.json']) { writeFileSync(path.join(state, f), '{}'); utimesSync(path.join(state, f), old, old); }
    locker = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      "$h = [System.IO.File]::Open($env:LOCK_FILE, 'Open', 'Read', 'None'); [Console]::Out.WriteLine('ready'); [Console]::Out.Flush(); [void][Console]::In.ReadLine(); $h.Close()"],
    { env: { ...process.env, LOCK_FILE: path.join(state, 'aaa-locked.json') }, stdio: ['pipe', 'pipe', 'pipe'] });
    await new Promise((resolve, reject) => {
      let out = '';
      locker.stdout.on('data', (d) => { out += d; if (out.includes('ready')) resolve(); });
      locker.on('exit', (code) => reject(new Error(`the locking PowerShell exited (${code}) before it held the file`)));
    });
    assert.equal(s.run(END, setup, '{}').status, 0);
    assert.deepEqual(readdirSync(state), ['aaa-locked.json']);
  } finally {
    if (locker && locker.exitCode === null) {
      const exited = new Promise((resolve) => locker.on('exit', resolve));
      locker.stdin.end();
      await exited;
    }
    s.done();
  }
});

test('session-end-check: a corrupt state file is read as nothing raised yet', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    commitAt(s, setup, 'old.md', 3);
    const state = path.join(s.tmp, 'claude-session-end-check');
    mkdirSync(state);
    writeFileSync(path.join(state, 'torn.json'), '{"reported": [');
    const input = JSON.stringify({ session_id: 'torn', stop_hook_active: false });
    assert.deepEqual([s.run(END, setup, input).status, s.run(END, setup, input).status], [2, 0]);
  } finally { s.done(); }
});

test('session hooks: running both leaves .git/index untouched', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    commitAt(s, setup, 'old.md', 3);
    // A tracked file whose time changed and content did not: a plain `git status` rewrites the index for it.
    const later = new Date(Date.now() - 600000);
    utimesSync(path.join(setup, 'README.md'), later, later);
    const index = path.join(setup, '.git/index');
    const hash = () => createHash('sha256').update(readFileSync(index)).digest('hex');
    const before = hash();
    s.run(START, setup);
    s.run(END, setup);
    assert.equal(hash(), before);
  } finally { s.done(); }
});

// Review leftovers of #42, #43: how a table's rule row is told from its data rows.
test('session hooks: a table written without trailing pipes is read, its rule row and its last column too', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const work = s.withRemote(s.repo('work'));
    writeFileSync(path.join(work, 'draft.md'), 'x\n');
    const late = s.withRemote(s.repo('late'));
    commitAt(s, late, 'late.md', 3);
    mkdirSync(path.join(setup, 'registry'));
    writeFileSync(path.join(setup, 'registry/PROJECTS.md'), [
      '| Project | Status | Path', '| --- | :---: | ---',
      `| work | active | \`${posix(work)}\``,
      `| late | active | \`${posix(late)}\``,
      '| gone | paused | `/x/gone-for-the-hook-test`', '',
    ].join('\n'));
    s.git(setup, ['add', 'registry']);
    s.git(setup, ['commit', '-q', '-m', 'registry']);
    s.git(setup, ['push', '-q', 'origin', 'main']);
    const start = s.run(START, setup);
    assert.equal(start.status, 0, start.err);
    assert.deepEqual(start.out.trim().split('\n'), ['work: uncommitted changes', 'late: 1 commit not on any remote', '/x/gone-for-the-hook-test: not found']);
    const end = s.run(END, setup);
    assert.equal(end.status, 2, end.err);
    assert.match(end.err, /late: 1 commit not on any remote, the oldest from 3 hours ago/);
    assert.match(end.err, /work: uncommitted changes/);
  } finally { s.done(); }
});

test('session-start-status: a row of dashes after a data row is a data row, so the rows around it keep their Path column', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    mkdirSync(path.join(setup, 'registry'));
    writeFileSync(path.join(setup, 'registry/PROJECTS.md'), [
      '| Project | Path | Status |', '|---|---|---|',
      '| one | `/x/gone-one-for-the-hook-test` | paused |',
      '| - | - | - |',
      '| two | `/x/gone-two-for-the-hook-test` | paused |', '',
    ].join('\n'));
    s.git(setup, ['add', 'registry']);
    s.git(setup, ['commit', '-q', '-m', 'registry']);
    s.git(setup, ['push', '-q', 'origin', 'main']);
    const r = s.run(START, setup);
    assert.equal(r.status, 0, r.err);
    assert.deepEqual(r.out.trim().split('\n'), ['/x/gone-one-for-the-hook-test: not found', '/x/gone-two-for-the-hook-test: not found']);
    const end = s.run(END, setup);
    assert.equal(end.status, 0, end.err);
  } finally { s.done(); }
});

// Issue #39: the start status sends a test force-push to each git guard the settings files name.
const guardLine = (p) => `git guard ${p} did not refuse a test force-push`;
const writeJson = (file, value) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(value, null, 2)); };
const writeScript = (file, text) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, text); return file; };
const preToolUse = (...hooks) => ({ hooks: { PreToolUse: [{ matcher: 'Bash|PowerShell', hooks }] } });
const execHook = (script) => ({ type: 'command', command: 'node', args: [script], onFailure: 'block' });
const shellHook = (command) => ({ type: 'command', command });
// Stand-in guards: one refuses exactly the test force-push sent as a Bash call, one lets everything run.
const REFUSES = "let s = '';\nprocess.stdin.on('data', (d) => { s += d; }).on('end', () => {\n  const p = JSON.parse(s);\n  process.exit(p.tool_name === 'Bash' && p.tool_input.command === 'git push --force origin main' ? 2 : 0);\n});\n";
const ALLOWS = 'process.exit(0);\n';
// A clean setup repository whose .claude folder git leaves out, so only guard lines are printed.
const guardedSetup = (s) => {
  const setup = s.withRemote(s.repo('setup'));
  writeFileSync(path.join(setup, '.git/info/exclude'), '.claude/\n');
  return setup;
};

test('session-start-status: a git guard that lets the test force-push through, or is missing, is named; one that refuses it is not', () => {
  const s = sandbox();
  try {
    const setup = guardedSetup(s);
    const guard = writeScript(path.join(setup, '.claude/hooks/git-guardrails/block-dangerous-git.mjs'), ALLOWS);
    writeJson(path.join(setup, '.claude/settings.json'), preToolUse(execHook('${CLAUDE_PROJECT_DIR}/.claude/hooks/git-guardrails/block-dangerous-git.mjs')));
    const run = () => s.run(START, setup, '', { CLAUDE_PROJECT_DIR: setup });
    const lets = run();
    assert.equal(lets.status, 0, lets.err);
    assert.equal(lets.out, `${guardLine(path.resolve(guard))}\n`);
    writeFileSync(guard, REFUSES);
    const refuses = run();
    assert.equal(refuses.status, 0, refuses.err);
    assert.equal(refuses.out, '');
    rmSync(guard);
    const gone = run();
    assert.equal(gone.status, 0, gone.err);
    assert.equal(gone.out, `${guardLine(path.resolve(guard))}\n`);
  } finally { s.done(); }
});

test('session-start-status: guards are found in settings.local.json in shell form, and in the user settings under CLAUDE_CONFIG_DIR or else ~/.claude', () => {
  const s = sandbox();
  try {
    const setup = guardedSetup(s);
    const local = writeScript(path.join(setup, '.claude/hooks/local/block-dangerous-git.mjs'), ALLOWS);
    writeJson(path.join(setup, '.claude/settings.local.json'), preToolUse(shellHook('node "$CLAUDE_PROJECT_DIR/.claude/hooks/local/block-dangerous-git.mjs"')));
    // Saved with a byte-order mark, as Windows PowerShell 5.1 writes UTF-8.
    const user = writeScript(path.join(s.dir, 'user-hooks/block-dangerous-git.mjs'), ALLOWS);
    mkdirSync(s.config);
    writeFileSync(path.join(s.config, 'settings.json'), `\uFEFF${JSON.stringify(preToolUse(execHook(posix(user))))}`);
    const home = writeScript(path.join(s.home, '.claude/hooks/git-guardrails/block-dangerous-git.mjs'), ALLOWS);
    writeJson(path.join(s.home, '.claude/settings.json'), preToolUse(shellHook('node ~/.claude/hooks/git-guardrails/block-dangerous-git.mjs')));
    const run = (extra = {}) => s.run(START, setup, '', { CLAUDE_PROJECT_DIR: setup, ...extra });
    const withConfig = run();
    assert.equal(withConfig.status, 0, withConfig.err);
    assert.deepEqual(withConfig.out.trim().split('\n').sort(), [guardLine(path.resolve(local)), guardLine(path.resolve(user))].sort());
    const withHome = run({ CLAUDE_CONFIG_DIR: undefined });
    assert.equal(withHome.status, 0, withHome.err);
    assert.deepEqual(withHome.out.trim().split('\n').sort(), [guardLine(path.resolve(local)), guardLine(path.resolve(home))].sort());
    // A settings file that does not parse is passed over; the others are still read.
    writeFileSync(path.join(setup, '.claude/settings.json'), '{ "hooks": ');
    assert.equal(run().out.trim().split('\n').length, 2);
  } finally { s.done(); }
});

test('session-start-status: no hook from the settings files runs but the git guard', () => {
  const s = sandbox();
  try {
    const setup = guardedSetup(s);
    const marker = path.join(s.dir, 'marker.txt');
    const other = writeScript(path.join(s.dir, 'other-hook.mjs'), `import { writeFileSync } from 'node:fs';\nwriteFileSync(${JSON.stringify(marker)}, 'ran');\n`);
    const guard = writeScript(path.join(setup, '.claude/hooks/git-guardrails/block-dangerous-git.mjs'), REFUSES);
    writeJson(path.join(setup, '.claude/settings.json'), {
      hooks: {
        PreToolUse: [
          { matcher: 'Bash', hooks: [execHook(posix(other)), shellHook(`node "${posix(other)}"`), execHook(posix(guard))] },
          { matcher: 'Bash|PowerShell', hooks: [shellHook(`node "${posix(other)}" --after block-dangerous-git.mjs.bak`)] },
        ],
        PostToolUse: [{ matcher: 'Bash', hooks: [shellHook(`node "${posix(other)}"`)] }],
        SessionStart: [{ matcher: 'startup', hooks: [execHook(posix(other))] }],
      },
    });
    writeJson(path.join(setup, '.claude/settings.local.json'), { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [execHook(posix(other))] }] } });
    writeJson(path.join(s.config, 'settings.json'), { hooks: { Stop: [{ hooks: [shellHook(`node "${posix(other)}"`)] }] } });
    const r = s.run(START, setup, '', { CLAUDE_PROJECT_DIR: setup });
    assert.equal(r.status, 0, r.err);
    assert.equal(r.out, '');
    assert.equal(existsSync(marker), false, 'another hook was run');
  } finally { s.done(); }
});

test('session-start-status: a guard that lets the force-push through comes first, so the ten-line cap never hides it', () => {
  const s = sandbox();
  try {
    const setup = guardedSetup(s);
    const guard = writeScript(path.join(setup, '.claude/hooks/git-guardrails/block-dangerous-git.mjs'), ALLOWS);
    writeJson(path.join(setup, '.claude/settings.json'), preToolUse(execHook('${CLAUDE_PROJECT_DIR}/.claude/hooks/git-guardrails/block-dangerous-git.mjs')));
    const cells = [];
    for (let i = 0; i < 11; i++) {
      const p = s.repo(`many/r${String(i).padStart(2, '0')}`);
      writeFileSync(path.join(p, 'draft.md'), 'x\n');
      cells.push(posix(p));
    }
    register(setup, cells);
    s.git(setup, ['add', 'registry']);
    s.git(setup, ['commit', '-q', '-m', 'registry']);
    s.git(setup, ['push', '-q', 'origin', 'main']);
    const lines = s.run(START, setup, '', { CLAUDE_PROJECT_DIR: setup }).out.trim().split('\n');
    assert.equal(lines.length, 10, lines.join('\n'));
    assert.equal(lines[0], guardLine(path.resolve(guard)));
    assert.match(lines.at(-1), /^\.\.\. and 3 more$/);
  } finally { s.done(); }
});

// Review round 1 of #39.
test('session-start-status: a folder named block-dangerous-git.mjs is never run, and is named', () => {
  const s = sandbox();
  try {
    const setup = guardedSetup(s);
    const marker = path.join(s.dir, 'marker.txt');
    const folder = path.join(setup, '.claude/hooks/git-guardrails/block-dangerous-git.mjs');
    // node would load the folder's index.js.
    writeScript(path.join(folder, 'index.js'), `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'ran');\nprocess.exit(2);\n`);
    writeJson(path.join(setup, '.claude/settings.json'), preToolUse(execHook('${CLAUDE_PROJECT_DIR}/.claude/hooks/git-guardrails/block-dangerous-git.mjs')));
    const r = s.run(START, setup, '', { CLAUDE_PROJECT_DIR: setup });
    assert.equal(r.status, 0, r.err);
    assert.equal(r.out, `${guardLine(path.resolve(folder))}\n`);
    assert.equal(existsSync(marker), false, 'the folder was run');
  } finally { s.done(); }
});

test('session-start-status: a guard that refuses a plain git status too is named', () => {
  const s = sandbox();
  try {
    const setup = guardedSetup(s);
    // What the entry script does when copied without guard.mjs beside it: it refuses every command that names git.
    const guard = writeScript(path.join(setup, '.claude/hooks/git-guardrails/block-dangerous-git.mjs'), 'process.exit(2);\n');
    writeJson(path.join(setup, '.claude/settings.json'), preToolUse(execHook(posix(guard))));
    const r = s.run(START, setup, '', { CLAUDE_PROJECT_DIR: setup });
    assert.equal(r.status, 0, r.err);
    assert.equal(r.out, `git guard ${path.resolve(guard)} refused a plain git status\n`);
  } finally { s.done(); }
});

// The first loop takes its 3 seconds and is failed; the second gets only what is left of the 6, so it
// and the third are counted as not tested.
test('session-start-status: a guard that never answers is stopped after 3 seconds, and all runs together get 6', () => {
  const s = sandbox();
  try {
    const setup = guardedSetup(s);
    const a = writeScript(path.join(s.dir, 'a/block-dangerous-git.mjs'), 'for (;;) {}\n');
    const b = writeScript(path.join(s.dir, 'b/block-dangerous-git.mjs'), 'for (;;) {}\n');
    const c = writeScript(path.join(s.dir, 'c/block-dangerous-git.mjs'), ALLOWS);
    writeJson(path.join(setup, '.claude/settings.json'), preToolUse(execHook(posix(a)), execHook(posix(b)), execHook(posix(c))));
    const started = Date.now();
    const r = s.run(START, setup, '', { CLAUDE_PROJECT_DIR: setup });
    const took = Date.now() - started;
    assert.equal(r.status, 0, r.err);
    assert.deepEqual(r.out.trim().split('\n'), [guardLine(path.resolve(a)), '2 git guards not tested: the 6 seconds for testing guards ran out']);
    assert.ok(took < 10000, `took ${took} ms`);
  } finally { s.done(); }
});

// Review round 2 of #39: a guard given only what is left of the 6 seconds is not failed for running out of it.
// It refuses the force-push after `pushMs` and lets `git status` run after `statusMs`.
const slowGuard = (pushMs, statusMs) => `const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
let s = '';
process.stdin.on('data', (d) => { s += d; }).on('end', () => {
  const push = JSON.parse(s).tool_input.command.startsWith('git push');
  sleep(push ? ${pushMs} : ${statusMs});
  process.exit(push ? 2 : 0);
});
`;
for (const [what, pushMs, statusMs] of [
  ['less than 1 second of the 6 is left for its next run', 2300, 0],
  ['its run is cut short by what is left of the 6 seconds', 1500, 2500],
]) {
  test(`session-start-status: a guard is counted as not tested, not as failed, when ${what}`, () => {
    const s = sandbox();
    try {
      const setup = guardedSetup(s);
      const a = writeScript(path.join(s.dir, 'a/block-dangerous-git.mjs'), 'for (;;) {}\n');
      const b = writeScript(path.join(s.dir, 'b/block-dangerous-git.mjs'), slowGuard(pushMs, statusMs));
      writeJson(path.join(setup, '.claude/settings.json'), preToolUse(execHook(posix(a)), execHook(posix(b))));
      const r = s.run(START, setup, '', { CLAUDE_PROJECT_DIR: setup });
      assert.equal(r.status, 0, r.err);
      assert.deepEqual(r.out.trim().split('\n'), [guardLine(path.resolve(a)), '1 git guard not tested: the 6 seconds for testing guards ran out']);
    } finally { s.done(); }
  });
}

test('session-start-status: a guard that ignores SIGTERM is still stopped (not on Windows)', { skip: process.platform === 'win32' ? 'Windows has no SIGTERM to ignore; the kill always lands' : false }, () => {
  const s = sandbox();
  try {
    const setup = guardedSetup(s);
    const guard = writeScript(path.join(s.dir, 'stubborn/block-dangerous-git.mjs'), "process.on('SIGTERM', () => {});\nsetInterval(() => {}, 1000);\n");
    writeJson(path.join(setup, '.claude/settings.json'), preToolUse(execHook(posix(guard))));
    const started = Date.now();
    const r = s.run(START, setup, '', { CLAUDE_PROJECT_DIR: setup });
    const took = Date.now() - started;
    assert.equal(r.status, 0, r.err);
    assert.equal(r.out, `${guardLine(path.resolve(guard))}\n`);
    assert.ok(took < 7000, `took ${took} ms`);
  } finally { s.done(); }
});

test('session-end-check: old session files that cannot be deleted do not stop the check (POSIX, not as root)', { skip: process.platform === 'win32' ? 'POSIX file modes; Windows has its own case above' : (process.getuid() === 0 ? 'root deletes in a read-only folder' : false) }, () => {
  const s = sandbox();
  const state = path.join(s.tmp, 'claude-session-end-check');
  try {
    const setup = s.withRemote(s.repo('setup'));
    commitAt(s, setup, 'old.md', 3);
    mkdirSync(state, { mode: 0o700 });
    const old = new Date(Date.now() - 8 * DAY * 1000);
    for (const f of ['aaa-old.json', 'zzz-old.json']) { writeFileSync(path.join(state, f), '{}'); utimesSync(path.join(state, f), old, old); }
    chmodSync(state, 0o555);
    const r = s.run(END, setup, '{}');
    assert.equal(r.status, 2, r.err);
    assert.match(r.err, /setup: 1 commit not on any remote/);
    assert.deepEqual(readdirSync(state).sort(), ['aaa-old.json', 'zzz-old.json']);
  } finally {
    try { chmodSync(state, 0o700); } catch { /* not made */ }
    s.done();
  }
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

// Issue #41: ordinary commits the git-hook templates refused. Each case runs a real `git commit`.
// The setup commits skip the hooks; only the commit that concludes the merge runs them.
// `mine` adds files to our side, `theirs` to the other branch, before the merge stops on the
// conflict in shared.txt.
function conflictedMerge(s, rel, mine = {}, theirs = {}) {
  const work = s.hooked(rel);
  const none = path.join(s.dir, `no-hooks-${rel}`);
  mkdirSync(none);
  const commit = (msg) => {
    s.git(work, ['add', '.']);
    s.git(work, ['-c', `core.hooksPath=${none.split(path.sep).join('/')}`, 'commit', '-q', '-m', msg]);
  };
  writeFileSync(path.join(work, 'shared.txt'), 'one\n');
  commit('base');
  s.git(work, ['checkout', '-q', '-b', 'upstream']);
  writeFileSync(path.join(work, 'router.md'), `Open the router at http://${ip(192, 168, 1, 1)}\n`);
  writeFileSync(path.join(work, 'shared.txt'), 'one, upstream\n');
  for (const [name, text] of Object.entries(theirs)) writeFileSync(path.join(work, name), text);
  commit("a teammate's commit");
  s.git(work, ['checkout', '-q', 'main']);
  writeFileSync(path.join(work, 'shared.txt'), 'one, mine\n');
  for (const [name, text] of Object.entries(mine)) writeFileSync(path.join(work, name), text);
  commit('mine');
  assert.notEqual(s.attempt(work, ['merge', '-q', 'upstream']).status, 0, 'the merge should stop on a conflict');
  return work;
}

test('pre-commit: concluding a merge checks only the lines new against both parents', () => {
  const s = sandbox();
  try {
    const work = conflictedMerge(s, 'merge-ok');
    writeFileSync(path.join(work, 'shared.txt'), 'one, merged\n');
    s.git(work, ['add', 'shared.txt']);
    const r = s.attempt(work, ['commit', '-q', '--no-edit']);
    assert.equal(r.status, 0, r.err);
  } finally { s.done(); }
});

test('pre-commit: a merge resolution that adds a private address of its own is refused', () => {
  const s = sandbox();
  try {
    const work = conflictedMerge(s, 'merge-bad');
    writeFileSync(path.join(work, 'shared.txt'), `one, merged; the printer is at http://${ip(192, 168, 1, 2)}\n`);
    s.git(work, ['add', 'shared.txt']);
    const r = s.attempt(work, ['commit', '-q', '--no-edit']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /shared\.txt: a private network address/);
    assert.doesNotMatch(r.err, /router\.md/);
  } finally { s.done(); }
});

test('pre-commit: a heading underlined with seven equals signs is no conflict marker', () => {
  const s = sandbox();
  try {
    const work = s.hooked('heading');
    writeFileSync(path.join(work, 'README.md'), 'x\n\nLicense\n=======\n\nMIT.\n');
    s.git(work, ['add', 'README.md']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'license heading']);
    assert.equal(r.status, 0, r.err);
  } finally { s.done(); }
});

test('pre-commit: a version number that starts with 10. is no private address', () => {
  const s = sandbox();
  try {
    const work = s.hooked('version');
    writeFileSync(path.join(work, 'App.csproj'), `<Project>\n  <PropertyGroup>\n    <AssemblyVersion>${ip(10, 0, 0, 0)}</AssemblyVersion>\n  </PropertyGroup>\n</Project>\n`);
    s.git(work, ['add', 'App.csproj']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'assembly version']);
    assert.equal(r.status, 0, r.err);
  } finally { s.done(); }
});

test('pre-commit: a test file whose name holds a space is still a test file', () => {
  const s = sandbox();
  try {
    const work = s.hooked('spaced');
    writeFileSync(path.join(work, 'my thing.test.js'), `const HOST = "${ip(10, 1, 2, 3)}";\n`);
    s.git(work, ['add', 'my thing.test.js']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'spaced test file']);
    assert.equal(r.status, 0, r.err);
  } finally { s.done(); }
});

test('commit-msg: the diff below the scissors line of `git commit -v` is not read as the message', () => {
  const s = sandbox();
  try {
    const work = s.hooked('verbose');
    const policy = ['Generated', 'with', 'Claude', 'Code'].join(' ');
    writeFileSync(path.join(work, 'POLICY.md'), `Never write "${policy}" in a commit message.\n`);
    s.git(work, ['add', 'POLICY.md']);
    const r = s.attempt(work, ['commit', '-q', '-v', '-e', '-m', 'policy note'], { GIT_EDITOR: 'true' });
    assert.equal(r.status, 0, r.err);
    assert.equal(s.git(work, ['log', '-1', '--format=%B']), 'policy note');
  } finally { s.done(); }
});

test('pre-commit: a gitleaks run that fails is reported as such, not as a secret', { skip: spawnSync('gitleaks', ['version']).error ? 'gitleaks is not installed' : false }, (t) => {
  const s = sandbox();
  try {
    const work = s.hooked('broken-gitleaks');
    writeFileSync(path.join(work, '.gitleaks.toml'), 'title = "unclosed\n[[rules]\n');
    writeFileSync(path.join(work, 'notes.md'), 'plain notes\n');
    s.git(work, ['add', '.']);
    // A gitleaks that finds its config elsewhere never reads this broken one: nothing to test then.
    const probe = spawnSync('gitleaks', ['git', '--pre-commit', '--staged', '--no-banner', '--exit-code', '42'], { cwd: work, encoding: 'utf8', env: { ...process.env, GITLEAKS_CONFIG: '' } });
    if (probe.status === 0 || probe.status === 42 || !/config/i.test(probe.stderr)) {
      t.skip(`this gitleaks does not fail on the repository's broken .gitleaks.toml (exit ${probe.status})`);
      return;
    }
    const r = s.attempt(work, ['commit', '-q', '-m', 'notes'], { GITLEAKS_CONFIG: '' });
    assert.notEqual(r.status, 0);
    assert.match(r.err, /gitleaks could not run \(exit \d+\): \S/);
    assert.doesNotMatch(r.err, /found a secret/);
    assert.doesNotMatch(r.err, /\x1b\[/, 'colour codes in the message');
  } finally { s.done(); }
});

test('pre-commit: a staged change too large to check is refused with one plain line', () => {
  const s = sandbox();
  try {
    const work = s.hooked('large');
    const line = 'row of plain text in a large generated file\n';
    writeFileSync(path.join(work, 'big.txt'), line.repeat(Math.ceil(70 * 1024 * 1024 / line.length)));
    s.git(work, ['add', 'big.txt']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'big']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /^pre-commit: the staged change is too large to check \(over \d+ MB\); commit it in parts$/m);
    assert.equal(r.err.trim().split('\n').length, 1, r.err.slice(0, 2000));
    assert.doesNotMatch(r.err, /row of plain text|ENOBUFS|\n\s+at /);
  } finally { s.done(); }
});

// Review round 1 of #41.
test('commit-msg: a trailer below a hand-written scissors line is still refused', () => {
  const s = sandbox();
  try {
    const work = s.hooked('fake-scissors');
    const r = s.attempt(work, ['commit', '-q', '--allow-empty', '-m', 'subject', '-m', '# ------------------------ >8 ------------------------', '-m', 'Co-Authored-By: Bot <bot@example.invalid>']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /commit-msg refused: remove "Co-Authored-By: Bot/);
  } finally { s.done(); }
});

test('pre-commit: concluding a merge when only our side holds a 70 MB file is not refused as too large', () => {
  const s = sandbox();
  try {
    const line = 'row of plain text in a large generated file\n';
    const work = conflictedMerge(s, 'merge-large', { 'big.txt': line.repeat(Math.ceil(70 * 1024 * 1024 / line.length)) });
    writeFileSync(path.join(work, 'shared.txt'), 'one, merged\n');
    s.git(work, ['add', 'shared.txt']);
    const r = s.attempt(work, ['commit', '-q', '--no-edit']);
    assert.equal(r.status, 0, r.err.slice(0, 2000));
  } finally { s.done(); }
});

test('pre-commit: a decorative line of more than seven < signs opens no conflict', () => {
  const s = sandbox();
  try {
    const work = s.hooked('decorative');
    writeFileSync(path.join(work, 'README.md'), 'x\n\n<<<<<<<<<<\n\nLicense\n=======\n\nMIT.\n');
    s.git(work, ['add', 'README.md']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'decorated heading']);
    assert.equal(r.status, 0, r.err);
  } finally { s.done(); }
});

test('pre-commit: a private address after "conversion:" is no version and is refused', () => {
  const s = sandbox();
  try {
    const work = s.hooked('conversion');
    writeFileSync(path.join(work, 'notes.md'), `conversion: ${ip(10, 1, 2, 3)}\n`);
    s.git(work, ['add', 'notes.md']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'notes']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /notes\.md: a private network address/);
  } finally { s.done(); }
});

// Issue #40: what the hooks and the never-share list let through. Each case runs a real `git commit`.
const utf16le = (text) => Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')]);
const utf16be = (text) => {
  const b = Buffer.from(text, 'utf16le');
  b.swap16();
  return Buffer.concat([Buffer.from([0xfe, 0xff]), b]);
};
// Commits in `work` without running the hooks, for content that predates them.
function commitUnhooked(s, work, msg) {
  const none = path.join(s.dir, 'no-hooks');
  mkdirSync(none, { recursive: true });
  s.git(work, ['add', '.']);
  s.git(work, ['-c', `core.hooksPath=${none.split(path.sep).join('/')}`, 'commit', '-q', '-m', msg]);
}

test('pre-commit: a UTF-16 file with a byte-order mark is decoded, and a private address in it refused', () => {
  const s = sandbox();
  try {
    const work = s.hooked('utf16');
    // What `>` writes in Windows PowerShell 5.1.
    writeFileSync(path.join(work, 'dump.txt'), utf16le(`gateway ${ip(192, 168, 7, 7)}\r\n`));
    s.git(work, ['add', 'dump.txt']);
    const le = s.attempt(work, ['commit', '-q', '-m', 'dump']);
    assert.notEqual(le.status, 0);
    assert.match(le.err, /dump\.txt: a private network address/);
    s.git(work, ['rm', '-q', '--cached', 'dump.txt']);
    writeFileSync(path.join(work, 'dump-be.txt'), utf16be(`gateway ${ip(10, 20, 30, 40)}\n`));
    s.git(work, ['add', 'dump-be.txt']);
    const be = s.attempt(work, ['commit', '-q', '-m', 'dump']);
    assert.notEqual(be.status, 0);
    assert.match(be.err, /dump-be\.txt: a private network address/);
  } finally { s.done(); }
});

test('pre-commit: in a UTF-16 file only the lines the commit adds are checked', () => {
  const s = sandbox();
  try {
    const work = s.hooked('utf16-added');
    writeFileSync(path.join(work, 'hosts.txt'), utf16le(`old host ${ip(192, 168, 7, 7)}\r\n`));
    commitUnhooked(s, work, 'from before the hooks');
    writeFileSync(path.join(work, 'hosts.txt'), utf16le(`old host ${ip(192, 168, 7, 7)}\r\nprinter in room 4\r\n`));
    s.git(work, ['add', 'hosts.txt']);
    const ok = s.attempt(work, ['commit', '-q', '-m', 'a plain line']);
    assert.equal(ok.status, 0, ok.err);
    writeFileSync(path.join(work, 'hosts.txt'), utf16le(`old host ${ip(192, 168, 7, 7)}\r\nprinter in room 4\r\n<<<<<<< HEAD\r\n`));
    s.git(work, ['add', 'hosts.txt']);
    const bad = s.attempt(work, ['commit', '-q', '-m', 'a marker']);
    assert.notEqual(bad.status, 0);
    assert.match(bad.err, /hosts\.txt: a conflict marker/);
    assert.doesNotMatch(bad.err, /private network address/);
  } finally { s.done(); }
});

test('pre-commit: concluding a merge counts only the UTF-16 lines new against both parents', () => {
  const s = sandbox();
  try {
    const work = conflictedMerge(s, 'merge-utf16', {}, { 'hosts.txt': utf16le(`gateway ${ip(192, 168, 7, 7)}\r\n`) });
    writeFileSync(path.join(work, 'shared.txt'), 'one, merged\n');
    writeFileSync(path.join(work, 'printer.txt'), utf16le(`printer ${ip(192, 168, 7, 8)}\r\n`));
    s.git(work, ['add', 'shared.txt', 'printer.txt']);
    const bad = s.attempt(work, ['commit', '-q', '--no-edit']);
    assert.notEqual(bad.status, 0);
    assert.match(bad.err, /printer\.txt: a private network address/);
    assert.doesNotMatch(bad.err, /hosts\.txt/);
    s.git(work, ['rm', '-q', '--cached', 'printer.txt']);
    const ok = s.attempt(work, ['commit', '-q', '--no-edit']);
    assert.equal(ok.status, 0, ok.err);
  } finally { s.done(); }
});

test('pre-commit: a shell trace line starting with "++ " is checked as a line, not read as a file name', () => {
  const s = sandbox();
  try {
    const work = s.hooked('trace');
    writeFileSync(path.join(work, 'deploy.log'), `+ ./deploy.sh\n++ ssh admin@${ip(192, 168, 1, 50)} uptime\n`);
    s.git(work, ['add', 'deploy.log']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'trace']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /deploy\.log: a private network address/);
  } finally { s.done(); }
});

test('pre-commit: a "++ " line that looks like a test file name does not make the lines after it test lines', () => {
  const s = sandbox();
  try {
    const work = s.hooked('fake-header');
    writeFileSync(path.join(work, 'notes.md'), `++ b/tests/fake.py\nhost ${ip(10, 1, 2, 3)}\n`);
    s.git(work, ['add', 'notes.md']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'notes']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /notes\.md: a private network address/);
    s.git(work, ['rm', '-q', '--cached', 'notes.md']);
    rmSync(path.join(work, 'notes.md'));
    // A removed "-- " line straight before an added "++ " line shows as "--- " then "+++ ".
    writeFileSync(path.join(work, 'run.txt'), '-- old step\n');
    commitUnhooked(s, work, 'run');
    writeFileSync(path.join(work, 'run.txt'), `++ ping ${ip(10, 1, 2, 3)}\n`);
    s.git(work, ['add', 'run.txt']);
    const swapped = s.attempt(work, ['commit', '-q', '-m', 'run']);
    assert.notEqual(swapped.status, 0);
    assert.match(swapped.err, /run\.txt: a private network address/);
  } finally { s.done(); }
});

test('the never-share list: a comment after a term, and a term that starts with #', () => {
  const s = sandbox();
  try {
    const work = s.hooked('list-comments');
    writeFileSync(path.join(s.dir, 'git-hooks', 'never-share.local.txt'), 'Initech  # the payroll client\n#proj-falcon\n# a comment\n\\#proj-eagle\n#\n');
    const tryCommit = (text) => {
      writeFileSync(path.join(work, 'notes.md'), text);
      s.git(work, ['add', 'notes.md']);
      return s.attempt(work, ['commit', '-q', '-m', 'notes']);
    };
    const term = tryCommit('Invoice for Initech, March.\n');
    assert.notEqual(term.status, 0);
    assert.match(term.err, /notes\.md: a term from your never-share list \(line 1 of the list\)/);
    const hash = tryCommit('Posted in #proj-falcon today.\n');
    assert.notEqual(hash.status, 0);
    assert.match(hash.err, /\(line 2 of the list\)/);
    const escaped = tryCommit('Posted in #proj-eagle today.\n');
    assert.notEqual(escaped.status, 0);
    assert.match(escaped.err, /\(line 4 of the list\)/);
    const comment = tryCommit('This is a comment about payroll.\n');
    assert.equal(comment.status, 0, comment.err);
  } finally { s.done(); }
});

test('the never-share list: a line it cannot read is named in a warning, never repeated', () => {
  const s = sandbox();
  try {
    const work = s.hooked('list-unreadable');
    // Line 2 as Add-Content writes a "u" with two dots, in one byte (U+FFFD when read as UTF-8); line 3
    // as `>>` appends it in Windows PowerShell 5.1 (UTF-16, so NULs), whose line break leaves one NUL behind.
    writeFileSync(path.join(s.dir, 'git-hooks', 'never-share.local.txt'), Buffer.concat([
      Buffer.from('zorbal\n'),
      Buffer.from('M\u00fcller Holdings\n', 'latin1'),
      Buffer.from('Quenlin\r\n', 'utf16le'),
    ]));
    writeFileSync(path.join(work, 'notes.md'), 'plain notes\n');
    s.git(work, ['add', 'notes.md']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'notes']);
    assert.equal(r.status, 0, r.err);
    assert.match(r.err, /line 2 of your never-share list cannot be read/);
    assert.match(r.err, /line 3 of your never-share list cannot be read/);
    assert.doesNotMatch(r.err, /line [14] of your never-share list/);
    assert.doesNotMatch(r.err, /Quenlin|Holdings/);
  } finally { s.done(); }
});

test('commit-msg: the scissors line of `git commit -v` is found in a translated git too', () => {
  const s = sandbox();
  try {
    const work = s.hooked('verbose-translated');
    const policy = ['Generated', 'with', 'Claude', 'Code'].join(' ');
    writeFileSync(path.join(work, 'POLICY.md'), `Never write "${policy}" in a commit message.\n`);
    s.git(work, ['add', 'POLICY.md']);
    // An editor that leaves the message as a German git writes it.
    const editor = path.join(s.dir, 'translate.mjs');
    writeFileSync(editor, [
      "import { readFileSync, writeFileSync } from 'node:fs';",
      'const f = process.argv[2];',
      "writeFileSync(f, readFileSync(f, 'utf8').replace('Do not modify or remove the line above.', '\\u00c4ndern oder entfernen Sie nicht die obige Zeile.'));",
    ].join('\n'));
    const fwd = (p) => p.split(path.sep).join('/');
    const r = s.attempt(work, ['commit', '-q', '-v', '-e', '-m', 'policy note'], { GIT_EDITOR: `"${fwd(process.execPath)}" "${fwd(editor)}"` });
    assert.equal(r.status, 0, r.err);
    assert.equal(s.git(work, ['log', '-1', '--format=%B']), 'policy note');
  } finally { s.done(); }
});

test('pre-commit: a merge that brings in a change too large to check says so without "commit it in parts"', () => {
  const s = sandbox();
  try {
    const line = 'row of plain text in a large generated file\n';
    const work = conflictedMerge(s, 'merge-large-theirs', {}, { 'big.txt': line.repeat(Math.ceil(70 * 1024 * 1024 / line.length)) });
    writeFileSync(path.join(work, 'shared.txt'), 'one, merged\n');
    s.git(work, ['add', 'shared.txt']);
    const r = s.attempt(work, ['commit', '-q', '--no-edit']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /^pre-commit: this merge brings in a change too large to check \(over \d+ MB\)/m);
    assert.doesNotMatch(r.err, /commit it in parts/);
    assert.equal(r.err.trim().split('\n').length, 1, r.err.slice(0, 2000));
  } finally { s.done(); }
});

// Review round 1 of #40.
test('commit-msg: a hand-written scissors line followed by a comment line does not hide a trailer', () => {
  const s = sandbox();
  try {
    const work = s.hooked('forged-scissors');
    const r = s.attempt(work, ['commit', '-q', '--allow-empty', '-m', 'subject', '-m', '# ------------------------ >8 ------------------------\n# note', '-m', 'Co-Authored-By: Bot <bot@example.invalid>']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /commit-msg refused: remove "Co-Authored-By: Bot/);
  } finally { s.done(); }
});

test('commit-msg: `git commit -v -v` with staged and unstaged diffs below the scissors line goes through', () => {
  const s = sandbox();
  try {
    const work = s.hooked('verbose-twice');
    const policy = ['Generated', 'with', 'Claude', 'Code'].join(' ');
    writeFileSync(path.join(work, 'POLICY.md'), `Never write "${policy}" in a commit message.\n`);
    s.git(work, ['add', 'POLICY.md']);
    writeFileSync(path.join(work, 'README.md'), `x\nCo-Authored-By: someone; "${policy}"\n`);
    const r = s.attempt(work, ['commit', '-q', '-v', '-v', '-e', '-m', 'policy note'], { GIT_EDITOR: 'true' });
    assert.equal(r.status, 0, r.err);
    assert.equal(s.git(work, ['log', '-1', '--format=%B']), 'policy note');
  } finally { s.done(); }
});

test('pre-commit: a file that was UTF-16 and is staged as UTF-8 is checked against the decoded old version', () => {
  const s = sandbox();
  try {
    const work = s.hooked('utf16-to-utf8');
    writeFileSync(path.join(work, 'hosts.txt'), utf16le(`old host ${ip(192, 168, 7, 7)}\r\n`));
    commitUnhooked(s, work, 'from before the hooks');
    writeFileSync(path.join(work, 'hosts.txt'), `old host ${ip(192, 168, 7, 7)}\nnew host ${ip(10, 9, 8, 7)}\n`);
    s.git(work, ['add', 'hosts.txt']);
    const bad = s.attempt(work, ['commit', '-q', '-m', 'utf-8 now']);
    assert.notEqual(bad.status, 0);
    assert.match(bad.err, /hosts\.txt: a private network address/);
    writeFileSync(path.join(work, 'hosts.txt'), `old host ${ip(192, 168, 7, 7)}\nprinter in room 4\n`);
    s.git(work, ['add', 'hosts.txt']);
    const ok = s.attempt(work, ['commit', '-q', '-m', 'utf-8 now']);
    assert.equal(ok.status, 0, ok.err);
  } finally { s.done(); }
});

test('pre-commit: a staged UTF-16 file is found when the working tree holds something else', () => {
  const s = sandbox();
  try {
    const work = s.hooked('utf16-unstaged');
    writeFileSync(path.join(work, 'dump.txt'), utf16le(`gateway ${ip(192, 168, 7, 7)}\r\n`));
    s.git(work, ['add', 'dump.txt']);
    writeFileSync(path.join(work, 'dump.txt'), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]));
    const r = s.attempt(work, ['commit', '-q', '-m', 'dump']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /dump\.txt: a private network address/);
  } finally { s.done(); }
});

test('pre-commit: a UTF-16 file over the size limit is skipped with a warning naming it', () => {
  const s = sandbox();
  try {
    const work = s.hooked('utf16-large');
    const line = 'row of plain text in a large generated file\r\n';
    writeFileSync(path.join(work, 'big16.txt'), utf16le(line.repeat(Math.ceil(35 * 1024 * 1024 / line.length))));
    s.git(work, ['add', 'big16.txt']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'big utf-16']);
    assert.equal(r.status, 0, r.err.slice(0, 2000));
    assert.match(r.err, /^pre-commit: big16\.txt: too large to decode and check \(over \d+ MB\); its lines were not checked$/m);
    assert.doesNotMatch(r.err, /commit it in parts/);
  } finally { s.done(); }
});

test('the never-share list: \\# anywhere in a term is a literal #', () => {
  const s = sandbox();
  try {
    const work = s.hooked('list-escaped-hash');
    writeFileSync(path.join(s.dir, 'git-hooks', 'never-share.local.txt'), 'C \\#  # the language\n');
    const tryCommit = (text) => {
      writeFileSync(path.join(work, 'notes.md'), text);
      s.git(work, ['add', 'notes.md']);
      return s.attempt(work, ['commit', '-q', '-m', 'notes']);
    };
    const plain = tryCommit('Plan C is a fallback.\n');
    assert.equal(plain.status, 0, plain.err);
    const term = tryCommit('We hire C # developers.\n');
    assert.notEqual(term.status, 0);
    assert.match(term.err, /\(line 1 of the list\)/);
  } finally { s.done(); }
});

test('the never-share list: a list saved as UTF-16 with a byte-order mark is read', () => {
  const s = sandbox();
  try {
    const work = s.hooked('list-utf16');
    writeFileSync(path.join(s.dir, 'git-hooks', 'never-share.local.txt'), utf16le('# my list\r\nInitech\r\n'));
    writeFileSync(path.join(work, 'notes.md'), 'Invoice for Initech, March.\n');
    s.git(work, ['add', 'notes.md']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'notes']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /notes\.md: a term from your never-share list \(line 2 of the list\)/);
    assert.doesNotMatch(r.err, /cannot be read/);
  } finally { s.done(); }
});

test('pre-commit: a staged text version is decoded when git calls the file binary and its NUL lies past 8000 bytes', () => {
  const s = sandbox();
  try {
    const work = s.hooked('nul-past-8000');
    // The committed version is binary, so git calls the file binary; the staged version has its first
    // NUL well past byte 8000, so it is text to git's own test. The working tree holds something else,
    // so the hook reads the staged blob through git.
    writeFileSync(path.join(work, 'data.txt'), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]));
    commitUnhooked(s, work, 'binary before');
    // About 18 KB before the NUL: past git's 8000 bytes, inside what one read of git's output returns.
    const text = `gateway ${ip(192, 168, 7, 7)}\n${'plain row of text\n'.repeat(1000)}`;
    writeFileSync(path.join(work, 'data.txt'), Buffer.concat([Buffer.from(text), Buffer.from([0]), Buffer.from('tail\n')]));
    s.git(work, ['add', 'data.txt']);
    writeFileSync(path.join(work, 'data.txt'), 'something else\n');
    const r = s.attempt(work, ['commit', '-q', '-m', 'text now']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /data\.txt: a private network address/);
  } finally { s.done(); }
});

test('pre-commit: a text file marked -diff in .gitattributes, such as a lockfile, is checked like plain text', () => {
  const s = sandbox();
  try {
    const work = s.hooked('minus-diff');
    writeFileSync(path.join(work, '.gitattributes'), 'package-lock.json -diff\n');
    commitUnhooked(s, work, 'attributes');
    writeFileSync(path.join(work, 'package-lock.json'), `{ "registry": "http://${ip(192, 168, 7, 7)}/npm" }\n`);
    s.git(work, ['add', 'package-lock.json']);
    const r = s.attempt(work, ['commit', '-q', '-m', 'lock']);
    assert.notEqual(r.status, 0);
    assert.match(r.err, /package-lock\.json: a private network address/);
  } finally { s.done(); }
});

test('session hooks: a checked-out branch with no commit yet does not hide unpushed commits on the other branches', () => {
  const s = sandbox();
  try {
    const repo = s.withRemote(s.repo('orphan'));
    s.git(repo, ['checkout', '-q', '-b', 'idea']);
    commitAt(s, repo, 'idea.md', 3);
    s.git(repo, ['checkout', '-q', '--orphan', 'fresh']);
    const start = s.run(START, repo);
    assert.equal(start.status, 0, start.err);
    assert.match(start.out, /^orphan: 1 commit not on any remote$/m);
    const end = s.run(END, repo);
    assert.equal(end.status, 2, end.err);
    assert.match(end.err, /orphan: 1 commit not on any remote, the oldest from 3 hours ago/);
  } finally { s.done(); }
});

test('session hooks: a header-row cell is no repository to check, in either hook', () => {
  const s = sandbox();
  try {
    const setup = s.withRemote(s.repo('setup'));
    const late = s.withRemote(s.repo('late'));
    commitAt(s, late, 'late.md', 3);
    mkdirSync(path.join(setup, 'registry'));
    writeFileSync(path.join(setup, 'registry/PROJECTS.md'), `| Project | \`${posix(late)}\` |\n|---|---|\n| x | y |\n`);
    const start = s.run(START, setup);
    assert.equal(start.status, 0, start.err);
    assert.doesNotMatch(start.out, /late/);
    const end = s.run(END, setup);
    assert.equal(end.status, 0, end.err);
    assert.doesNotMatch(end.err, /late/);
  } finally { s.done(); }
});
