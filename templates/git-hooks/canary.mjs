// Try the hooks in a throwaway repository, never a real one. Every line must say PASS (or SKIP).
//   node canary.mjs
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hooks = path.dirname(fileURLToPath(import.meta.url)).split(path.sep).join('/');
if (!spawnSync('git', ['config', 'user.email'], { encoding: 'utf8' }).stdout.trim()) {
  console.error('canary: set your git identity first: git config --global user.name "<you>" and git config --global user.email "<your email>"');
  process.exit(2);
}
const repo = mkdtempSync(path.join(os.tmpdir(), 'hooks-canary-'));
const git = (...args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' });
const results = [];
function check(name, r, wantOk) {
  const ok = (r.status === 0) === wantOk;
  const why = ok ? '' : `\n      ${`${r.stdout}${r.stderr}`.trim().split('\n').slice(-2).join('\n      ')}`;
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${why}`);
}
function tryCommit(file, text, wantOk, name) {
  const abs = path.join(repo, ...file.split('/'));
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, text);
  git('add', file);
  check(name, git('commit', '-q', '-m', `canary: ${name}`), wantOk);
  git('reset', '-q', '--hard', 'HEAD');
  git('clean', '-q', '-fd');
}

// If git cannot make even a plain commit here, nothing below would test the hooks: stop and say why.
let blocked = '';
try {
  git('init', '-q');
  git('config', 'core.hooksPath', hooks);
  const plain = git('commit', '-q', '--allow-empty', '-m', 'canary: plain');
  if (plain.status !== 0) {
    blocked = `${plain.stdout}${plain.stderr}`.trim().split('\n').slice(-3).join('\n  ');
  } else {
    results.push('PASS  a plain commit goes through');
    tryCommit('notes.txt', 'a\n<<<<<<< HEAD\nb\n=======\nc\n>>>>>>> other\n', false, 'a conflict marker is refused');
    const lan = [10, 255, 255, 254].join('.'); // made up: a private address no home router hands out
    tryCommit('docs/notes.md', `host ${lan}\n`, false, 'a private address in a normal file is refused');
    tryCommit('tests/test_hosts.py', `HOST = "${lan}"\n`, true, 'a made-up address in a test file is allowed');
    writeFileSync(path.join(repo, 'msg.txt'), 'canary: trailer\n\nCo-Authored-By: Someone <someone@example.invalid>\n');
    check('an attribution trailer is refused', git('commit', '-q', '--allow-empty', '-F', path.join(repo, 'msg.txt')), false);
    if (spawnSync('gitleaks', ['version'], { encoding: 'utf8' }).error) results.push('SKIP  the secret scan (gitleaks is not installed)');
    else tryCommit('config.txt', `token ghp_${'Ab3dE6gH9jK2'.repeat(3)}\n`, false, 'a leaked token is refused (gitleaks)');
  }
} finally {
  rmSync(repo, { recursive: true, force: true });
}
if (blocked) {
  console.error(`canary: a plain commit fails here, so the hooks cannot be tested. Git said:\n  ${blocked}\nA common cause is commit signing that cannot ask for its passphrase, for example over SSH. Fix that, then run the canary again.`);
  process.exit(2);
}
console.log(results.join('\n'));
process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0);
