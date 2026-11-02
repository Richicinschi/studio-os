// tools/export/test/canary.test.mjs
// The hook canary (templates/git-hooks/canary.mjs) run in a sealed git environment: a temporary global
// config, no system config, so the maintainer's own identity and signing never take part.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CANARY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../templates/git-hooks/canary.mjs');

function runCanary(gitconfig) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-canary-test-'));
  try {
    const cfg = path.join(dir, 'gitconfig');
    writeFileSync(cfg, gitconfig);
    const env = { ...process.env, GIT_CONFIG_GLOBAL: cfg, GIT_CONFIG_NOSYSTEM: '1' };
    delete env.GIT_DIR;
    const r = spawnSync(process.execPath, [CANARY], { encoding: 'utf8', env });
    return { status: r.status, out: `${r.stdout}${r.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const IDENTITY = '[user]\n\tname = Canary Test\n\temail = canary@example.invalid\n[init]\n\tdefaultBranch = main\n';

test('the canary passes where git can commit', () => {
  const r = runCanary(`${IDENTITY}[commit]\n\tgpgsign = false\n`);
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /^FAIL/m);
  assert.equal(r.out.match(/^PASS/gm).length >= 5, true, r.out);
});

test('where git cannot commit at all, the canary stops with the reason instead of reporting hook failures', () => {
  // Forward slashes: git config reads a backslash in a value as an escape.
  const noGpg = path.join(os.tmpdir(), 'no-such-gpg-program').split(path.sep).join('/');
  const r = runCanary(`${IDENTITY}[commit]\n\tgpgsign = true\n[gpg]\n\tprogram = ${noGpg}\n`);
  assert.equal(r.status, 2, r.out);
  assert.match(r.out, /a plain commit fails here, so the hooks cannot be tested/);
  assert.doesNotMatch(r.out, /made-up address/);
});
