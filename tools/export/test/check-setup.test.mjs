// tools/export/test/check-setup.test.mjs
// Public issues #11 and #32: the cards' check blocks, the allowlist that keeps them to reading, and
// tools/check-setup.mjs, which runs them in a setup without the model and writes nothing.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseChecks, lintChecks, refusal, checkItems, checkItemsText, cardOf, findBash } from '../../check-setup.mjs';
import { recordItem } from '../../installed.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const card = (check) => `# Item\n\n## Steps\n\n1. x\n\n## Check\n\n${check}\n\n## Undo\n\ny\n`;

test('parseChecks reads run/expect pairs and install lines from the Check section only, and counts the steps for the person', () => {
  const text = card('1. **Claude:** the file is there.\n\n   ```check\n   # the guard refuses a force-push\n   run: node "$(installed guard.mjs)"; echo "exit $?"\n   expect: exit 2\n   run: grep -c x f\n   expect:\n   install: catalog/skills/guard -> .claude/skills/guard\n   ```\n\n2. **you:** ask in a new session.\n3. **you:** and once more.')
    + '\n```check\nrun: echo outside the Check section\nexpect: never read\n```\n';
  const c = parseChecks(text);
  assert.deepEqual(c.steps.map((s) => [s.run, s.expect]), [['node "$(installed guard.mjs)"; echo "exit $?"', 'exit 2'], ['grep -c x f', '']]);
  assert.deepEqual(c.install.map((i) => [i.from, i.to]), [['catalog/skills/guard', '.claude/skills/guard']]);
  assert.equal(c.manual, 2);
  assert.deepEqual(c.errors, []);
  assert.equal(c.steps[0].line, text.split('\n').findIndex((l) => l.trim().startsWith('run: node')) + 1, 'the line number is the card\'s');
  const bad = parseChecks(card('```check\nrun: a\nrun: b\nexpect: 1\nexpect: 2\nwhat is this\n```\n```check\nrun: c\n'));
  assert.equal(bad.errors.length, 5, bad.errors.join('\n'));
  assert.match(bad.errors.join('\n'), /a run: line with no expect: after it/);
  assert.match(bad.errors.join('\n'), /an expect: line with no run: before it/);
  assert.match(bad.errors.join('\n'), /not a run:, expect: or install: line: what is this/);
  assert.match(bad.errors.join('\n'), /a check block is not closed/);
  assert.equal(cardOf('pack:media'), 'pack-media');
  assert.equal(cardOf('agent:skeptic'), 'skeptic');
  assert.equal(cardOf('front-door'), 'front-door');
});

test('the allowlist refuses a run: line that writes, reaches the network, fetches a package or runs code, however it is written', () => {
  const refused = {
    'writes a file': ['grep -c x CLAUDE.md > count.txt', 'grep x a 2>err.log', 'echo x >> notes.md', 'echo x >&2x', 'echo x 1> f', 'echo x &> f',
      'echo x >| f', 'echo x > /dev/null', 'rm -f x', 'cp a b', 'mkdir d', 'tee out', 'sort -o out f', 'sed -i s/a/b/ f', 'sed \'1e touch x\' f',
      'git -C "$SETUP" commit -m x', 'git add .', 'git -C "$SETUP" config user.name x', 'git -C "$SETUP" branch new', 'git -C "$SETUP" log --output=x',
      'git "commit"', 'gh api -X PATCH x'],
    'reaches the network': ['curl -s example.invalid', 'wget x', 'ssh host true', 'Invoke-WebRequest x', 'nc -z host 80', 'git -C "$SETUP" ls-remote'],
    'fetches or installs a package': ['npx some-tool', 'uvx skillspector --version', 'npm install x', 'npm x', 'pip install x', 'go run x', 'winget list'],
    'runs code from a string': ['eval "$CMD"', 'bash -c "$CMD"', 'bash -ec "$CMD"', 'sh -c x', 'echo "$CMD" | sh', '$SHELL -c x', 'echo \'rm -f x\' | bash',
      'bash <<< \'rm x\'', 'node -e "1"', 'node -p 1', 'python3 -cprint(1)', 'powershell -command x', 'xargs rm < list', 'source ./env', '. ./env',
      'exec x', 'awk \'{ print }\' f', 'find . -delete', 'env rm x', 'command rm x', 'time rm x', 'nohup rm x',
      'cat <(rm x)', 'echo `rm x`', 'echo "$(rm x)"', 'test "$(grep x "$(rm y)")"', 'node "$KIT/tools/installed.mjs" undo "$SETUP" x --yes',
      'node "$(installed a.mjs)" --extra', 'git -c core.fsmonitor=\'rm x\' status', '\'rm\' -f x', 'r\\m -f x', 'r""m -f x', 'grep -c "it\'s" f; rm x; echo \'z\'',
      'X=1 grep x f', 'echo $HOME', 'echo ${ID}', 'echo $\'\\x41\'', 'grep x f &', '(grep x f)', '{ grep x f; }'],
  };
  for (const [kind, runs] of Object.entries(refused)) {
    for (const run of runs) assert.ok(refusal(run), `${kind}: ${run} was allowed`);
  }
  for (const run of ['grep -cE \'^@AGENTS\\.md[[:space:]]*$\' "$(installed CLAUDE.md)"', 'git -C "$SETUP" check-ignore -q x 2>/dev/null && echo ignored',
    'git -C "$SETUP" config --get core.hooksPath', 'echo \'{"tool_input":{"command":"git push --force origin main"}}\' | node "$(installed guard.mjs)" 2>&1; echo "exit $?"',
    'test -f a >&2 || echo no', 'grep -c x a 2>/dev/null', 'ls "$SETUP" | grep -c y', 'grep -c install AGENTS.md', 'grep -c \'a > b\' f',
    'test "$(grep -ci worktree "$(frontdoor)")" -ge 1 && echo yes || echo no', '[ -f "$SETUP/x" ] && echo yes', 'cat "$(installed a.md)" | wc -l']) {
    assert.equal(refusal(run), null, run);
  }
  assert.match(lintChecks('cards/x.md', card('```check\nrun: rm x\nexpect: 1\n```')).join('\n'), /^cards\/x\.md:\d+ check block: a run: line the allowlist refuses \(a command that is not on the list of readers/);
  for (const line of ['install: ../x -> y', 'install: x -> /etc/y', 'install: /etc/x -> y', 'install: C:/x -> y', 'install: x -> ~/y']) {
    assert.match(lintChecks('cards/x.md', card(`\`\`\`check\n${line}\n\`\`\``)).join('\n'), /must stay inside the kit and the setup/, line);
  }
});

test('findBash: the bash beside the installed git on Windows, never the WSL launcher; null when there is none', (t) => {
  const base = mkdtempSync(path.join(os.tmpdir(), 'kit-bash-'));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  mkdirSync(path.join(base, 'Git/bin'), { recursive: true });
  writeFileSync(path.join(base, 'Git/bin/bash.exe'), '');
  const git = (out) => () => ({ status: 0, stdout: out });
  assert.equal(findBash({ platform: 'win32', env: {}, run: git(path.join(base, 'Git/mingw64/libexec/git-core')) }), path.join(base, 'Git/bin/bash.exe'));
  assert.equal(findBash({ platform: 'win32', env: { CLAUDE_CODE_GIT_BASH_PATH: path.join(base, 'Git/bin/bash.exe') }, run: git('') }), path.join(base, 'Git/bin/bash.exe'));
  mkdirSync(path.join(base, 'Windows/System32'), { recursive: true });
  writeFileSync(path.join(base, 'Windows/System32/bash.exe'), '');
  const none = findBash({ platform: 'win32', env: { CLAUDE_CODE_GIT_BASH_PATH: path.join(base, 'Windows/System32/bash.exe') }, run: () => ({ error: new Error('no git') }) });
  assert.ok(none === null || !/system32/i.test(none), 'the WSL launcher is never chosen');
  assert.equal(findBash({ platform: 'linux', env: {} }), 'bash');
});

function fixture(t) {
  const base = mkdtempSync(path.join(os.tmpdir(), 'kit-check-setup-'));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const kit = path.join(base, 'kit');
  const setup = path.join(base, 'setup');
  const w = (root, rel, text) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), text); };
  w(kit, 'CHANGELOG.md', '# Changelog\n\n## v9.1.0 (2026-11-26)\n');
  w(kit, 'catalog/features.json', JSON.stringify({ modules: [], domains: [] }));
  w(kit, 'cards/good.md', card('```check\nrun: grep -c "^@AGENTS" "$(installed CLAUDE.md)"\nexpect: 1\nrun: test -f "$SETUP/AGENTS.md" && echo "id $ID"\nexpect: id good\n```\n\n1. **you:** ask "what must you never do?"'));
  w(kit, 'cards/bad.md', card('```check\nrun: grep -c never "$(installed notes.md)"\nexpect: 1\nrun: grep -c x "$(installed nope.md)"\nexpect: 1\n```'));
  w(kit, 'cards/plain.md', card('1. **you:** look at it.'));
  w(kit, 'cards/rule.md', card('```check\nrun: test "$(grep -ci worktree "$(frontdoor)")" -ge 1 && echo yes || echo no\nexpect: yes\n```'));
  w(kit, 'cards/sly.md', card('```check\nrun: rm -f "$SETUP/notes.md"; echo 1\nexpect: 1\n```'));
  w(kit, 'cards/slow.md', card('```check\nrun: tail -f "$(installed slow.md)"\nexpect: never\n```'));
  w(kit, 'cards/hooked.md', card('1. **you:** start a session.'));
  w(setup, 'CLAUDE.md', '@AGENTS.md\n');
  w(setup, 'AGENTS.md', '# Rules\n');
  w(setup, 'notes.md', 'nothing here\n');
  w(setup, 'gone.md', 'x');
  w(setup, 'slow.md', 'x');
  w(setup, 'only/CLAUDE.md', 'Use a worktree for each branch.\n');
  w(setup, '.claude/settings.json', JSON.stringify({ hooks: { Stop: [] } }));
  const opts = { kit, home: path.join(base, 'home'), today: '2026-11-26' };
  recordItem(setup, { id: 'good', decision: 'ADOPT', created: ['CLAUDE.md', 'AGENTS.md'] }, opts);
  recordItem(setup, { id: 'bad', decision: 'ADAPT', created: ['notes.md'] }, opts);
  recordItem(setup, { id: 'plain', decision: 'ADOPT', created: ['gone.md'] }, opts);
  recordItem(setup, { id: 'rule', decision: 'FOLD', edited: ['only/CLAUDE.md'] }, opts);
  recordItem(setup, { id: 'sly', decision: 'ADOPT', created: ['notes.md'] }, opts);
  recordItem(setup, { id: 'hooked', decision: 'ADOPT', settings: ['.claude/settings.json#hooks.Stop'] }, opts);
  recordItem(setup, { id: 'skipped', decision: 'SKIP' }, opts);
  rmSync(path.join(setup, 'gone.md'));
  return { kit, setup, w, opts };
}

// Every file under a folder with its bytes and its modification time.
const snapshot = (root) => readdirSync(root, { recursive: true }).map(String).sort().map((r) => {
  const s = statSync(path.join(root, r));
  return s.isFile() ? `${r} ${createHash('sha256').update(readFileSync(path.join(root, r))).digest('hex')} ${s.mtimeMs}` : `${r}/`;
});

test('checkItems: files and keys present, each check run in the setup, a refused block never run; it writes nothing', (t) => {
  const f = fixture(t);
  const before = snapshot(f.setup);
  const results = checkItems(f.setup, { kit: f.kit, ids: ['good', 'bad', 'plain', 'rule', 'sly', 'hooked', 'skipped'] });
  assert.deepEqual(snapshot(f.setup), before, 'the setup is byte for byte and time for time as it was');
  assert.deepEqual(results.map((r) => `${r.id} ${r.status}`), ['good pass', 'bad fail', 'plain fail', 'rule pass', 'sly fail', 'hooked pass'], 'a SKIP is not checked');
  const by = Object.fromEntries(results.map((r) => [r.id, r]));
  assert.deepEqual(by.good.steps.map((s) => [s.got, s.pass]), [['1', true], ['id good', true]]);
  assert.equal(by.good.manual, 1);
  assert.equal(by.bad.steps[0].got, '0');
  assert.match(by.bad.steps[1].stderr, /no file nope\.md recorded for bad/, 'the reason a helper failed is shown');
  assert.deepEqual(by.plain.missing, ['gone.md']);
  assert.deepEqual(by.sly.steps, [], 'a block the allowlist refuses is not run');
  assert.ok(statSync(path.join(f.setup, 'notes.md')));
  const text = checkItemsText(results);
  assert.match(text, /^good: pass \(2 of 2 files and keys present; 2 of 2 checks passed; 1 step for you, from cards\/good\.md\)$/m);
  assert.match(text, /^bad: fail \(1 of 1 file or key present; 0 of 2 checks passed\)$/m);
  assert.match(text, /^ {2}failed {2}grep -c never "\$\(installed notes\.md\)"\n {4}expected: 1\n {4}printed: 0$/m);
  assert.match(text, /^ {4}error: error: no file nope\.md recorded for bad \/ /m);
  assert.match(text, /^plain: fail \(0 of 1 file or key present; 1 step for you, from cards\/plain\.md\)\n {2}missing {2}gone\.md$/m);
  assert.match(text, /^sly: fail .*\n {2}not run {2}cards\/sly\.md:\d+ check block: a run: line the allowlist refuses/m);
  // A settings key the install added, taken out since: the item fails.
  f.w(f.setup, '.claude/settings.json', JSON.stringify({ hooks: {} }));
  const [hooked] = checkItems(f.setup, { kit: f.kit, ids: ['hooked'] });
  assert.equal(hooked.status, 'fail');
  assert.match(checkItemsText([hooked]), /^hooked: fail \(0 of 1 file or key present; 1 step for you, from cards\/hooked\.md\)\n {2}missing {2}\.claude\/settings\.json#hooks\.Stop$/m);
});

test('a step that runs past its time fails, and a missing bash is an error, not a failed item', (t) => {
  const f = fixture(t);
  recordItem(f.setup, { id: 'slow', decision: 'ADOPT', created: ['slow.md'] }, f.opts);
  const [slow] = checkItems(f.setup, { kit: f.kit, ids: ['slow'], timeoutMs: 1500 });
  assert.equal(slow.status, 'fail');
  assert.match(slow.steps[0].error, /timed out/);
  assert.throws(() => checkItems(f.setup, { kit: f.kit, ids: ['good'], bash: null }), /bash was not found/);
  assert.throws(() => checkItems(f.setup, { kit: f.kit, ids: ['good'], bash: path.join(f.setup, 'no-such-bash') }), /could not start/);
});

test('the command line: exit 0 when every item passes, 1 when one fails, 2 with no record or bad input', (t) => {
  const f = fixture(t);
  const run = (...a) => spawnSync(process.execPath, [path.join(KIT, 'tools/check-setup.mjs'), ...a], { encoding: 'utf8' });
  // The real kit has no cards named good or plain, so only the record's files are checked here.
  let r = run(f.setup, 'good');
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^good: pass \(2 of 2 files and keys present; no card in this kit\)$/m);
  r = run(f.setup, 'plain');
  assert.equal(r.status, 1);
  assert.equal(run(path.join(f.setup, 'nope')).status, 2);
  const empty = path.join(f.setup, '..', 'empty');
  mkdirSync(empty);
  r = run(empty);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no install record/);
});
