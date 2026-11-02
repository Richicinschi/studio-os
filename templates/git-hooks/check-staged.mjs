// Pre-commit checks on the lines a commit adds: conflict markers, real private network addresses
// (made-up ones are fine in test files), secrets through gitleaks when it is installed, and the terms
// in your never-share list when you keep one.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// never-share.local.txt beside this script: one term per line, # for comments. Keep it out of git.
// A term matches as a whole word, in any case; a refusal names the list line, never the term.
const listFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'never-share.local.txt');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const neverShare = existsSync(listFile)
  ? readFileSync(listFile, 'utf8').split(/\r?\n/).map((t, i) => ({ line: i + 1, term: t.trim() }))
    .filter((t) => t.term && !t.term.startsWith('#'))
    .map((t) => ({ ...t, re: new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(t.term).replace(/\s+/g, '\\s+')}(?![\\p{L}\\p{N}_])`, 'iu') }))
  : [];

const diff = execFileSync('git', ['diff', '--cached', '--no-color', '--no-ext-diff', '-U0'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const PRIVATE_IP = /\b(10\.\d{1,3}|172\.(1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/;
const TEST_FILE = /(^|\/)(test|tests|__tests__|fixtures?|testdata)\/|\.(test|spec)\.[a-z0-9]+$|(^|\/)test_[^/]*\.py$|_test\.(py|go)$/i;
const CONFLICT = /^(<{7}|>{7})( |$)|^={7}$/;

const problems = [];
let file = '';
for (const line of diff.split('\n')) {
  if (line.startsWith('+++ ')) { file = line.slice(4).replace(/^"?b\//, '').replace(/"$/, ''); continue; }
  if (!line.startsWith('+')) continue;
  const text = line.slice(1);
  if (CONFLICT.test(text)) problems.push(`${file}: a conflict marker`);
  if (PRIVATE_IP.test(text) && !TEST_FILE.test(file)) problems.push(`${file}: a private network address (made-up ones belong in test files)`);
  for (const t of neverShare) if (t.re.test(text)) problems.push(`${file}: a term from your never-share list (line ${t.line} of the list)`);
}
const gl = spawnSync('gitleaks', ['git', '--pre-commit', '--staged', '--no-banner', '--redact', '--exit-code', '1'], { encoding: 'utf8' });
if (gl.error) console.error('pre-commit: gitleaks is not installed, so the secret scan was skipped');
else if (gl.status !== 0) problems.push('gitleaks found a secret in the staged changes (run `gitleaks git --pre-commit --staged -v` to see it)');

if (problems.length) {
  console.error(`pre-commit refused this commit:\n- ${[...new Set(problems)].join('\n- ')}`);
  process.exit(1);
}
