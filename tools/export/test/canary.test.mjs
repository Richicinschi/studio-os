// tools/export/test/canary.test.mjs
// The hook canary (templates/git-hooks/canary.mjs) run in a sealed git environment: an empty home folder,
// no system config, so the maintainer's own identity and signing never take part.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CANARY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../templates/git-hooks/canary.mjs');

// gitconfig: the text of the home folder's .gitconfig, or null to leave the home folder empty.
function runCanary(gitconfig) {
  const home = mkdtempSync(path.join(os.tmpdir(), 'kit-canary-home-'));
  try {
    if (gitconfig !== null) writeFileSync(path.join(home, '.gitconfig'), gitconfig);
    const env = { ...process.env, HOME: home, USERPROFILE: home, GIT_CONFIG_NOSYSTEM: '1' };
    for (const k of ['GIT_DIR', 'GIT_CONFIG_GLOBAL', 'GIT_CONFIG_SYSTEM', 'XDG_CONFIG_HOME', 'EMAIL',
      'GIT_AUTHOR_NAME', 'GIT_AUTHOR_EMAIL', 'GIT_COMMITTER_NAME', 'GIT_COMMITTER_EMAIL']) delete env[k];
    const r = spawnSync(process.execPath, [CANARY], { encoding: 'utf8', env });
    return { status: r.status, out: `${r.stdout}${r.stderr}` };
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

function assertPasses(r) {
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /^FAIL/m);
  assert.equal((r.out.match(/^PASS/gm) || []).length >= 5, true, r.out);
  assert.doesNotMatch(r.out, /signing/i);
}

test('with no git identity anywhere, as with one identity per folder, the canary passes on its own', () => {
  assertPasses(runCanary(null));
});

test('a signing setup that cannot sign does not take part: the canary commits unsigned', () => {
  // Forward slashes: git config reads a backslash in a value as an escape.
  const noGpg = path.join(os.tmpdir(), 'no-such-gpg-program').split(path.sep).join('/');
  assertPasses(runCanary(`[user]\n\tname = Someone\n\temail = someone@example.invalid\n[commit]\n\tgpgsign = true\n[gpg]\n\tprogram = ${noGpg}\n`));
});
