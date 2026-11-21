// tools/export/test/modes.test.mjs
// Every shipped file that starts with #! is recorded in git as executable (100755). The kit's checkout has
// core.fileMode=false, so the mode lives only in the index: git add --chmod=+x sets it, git ls-files -s shows it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shebangFiles } from '../gates.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const git = (args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function isWorkTree() {
  try { return git(['rev-parse', '--is-inside-work-tree']).trim() === 'true'; } catch { return false; }
}

test('every file under catalog/ and templates/ that starts with #! is committed as 100755', (t) => {
  if (!isWorkTree()) { t.skip(`${root} is not a git work tree, so the index modes cannot be read`); return; }
  // -z: NUL-separated "<mode> <object> <stage>\t<path>", paths unquoted.
  const modes = new Map(git(['ls-files', '-s', '-z', '--', 'catalog', 'templates']).split('\0').filter(Boolean).map((e) => {
    const tab = e.indexOf('\t');
    return [e.slice(tab + 1), e.slice(0, tab).split(' ')[0]];
  }));
  const scripts = shebangFiles(root, ['catalog', 'templates']);
  assert.ok(scripts.length > 0, 'the kit ships scripts, so the list is never empty');
  const wrong = scripts.filter((f) => modes.get(f) !== '100755').map((f) => `${modes.get(f) || 'not in the index'} ${f}`);
  assert.deepEqual(wrong, [], `${wrong.length} of ${scripts.length} script(s) start with #! but are not 100755 (git add --chmod=+x -- <file>):\n${wrong.join('\n')}`);
});
