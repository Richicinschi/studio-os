// tools/export/test/audit.test.mjs
// tools/audit.mjs against fixture setups in a sealed git environment (a temporary global config, no
// system config, a temporary home), so the maintainer's own identity, remotes and hooks never take part.
// The audit prints names, never values. A made-up token is planted wherever tokens usually sit, each
// source with its own two-digit suffix; a failure names the leaking source by its index and never
// prints the audit's output.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { audit, HEADINGS } from '../../audit.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const AUDIT = path.join(KIT, 'tools/audit.mjs');
const TOKEN = 'tok_wave3_9f1c2e7a';
const t = (i) => `${TOKEN}_${String(i).padStart(2, '0')}`;
// The same token shaped like a host name (hyphens, no underscores), for places that a host check alone would catch.
const h = (i) => t(i).replaceAll('_', '-');
const SOURCES = 34;

function sandbox() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-audit-test-'));
  const cfg = path.join(dir, 'gitconfig');
  writeFileSync(cfg, '[user]\n\tname = Audit Test\n\temail = audit@example.invalid\n[init]\n\tdefaultBranch = main\n[commit]\n\tgpgsign = false\n');
  const home = path.join(dir, 'home');
  mkdirSync(home);
  const env = { ...process.env, GIT_CONFIG_GLOBAL: cfg, GIT_CONFIG_NOSYSTEM: '1', HOME: home, USERPROFILE: home };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'CLAUDE_PROJECT_DIR']) delete env[k];
  const root = path.join(dir, 'setup');
  mkdirSync(root);
  const put = (rel, text) => {
    const p = path.join(root, rel);
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, text);
  };
  const git = (cwd, args) => {
    const r = spawnSync('git', args, { cwd, encoding: 'utf8', env });
    // Only the exit code: git's own messages could echo a planted remote URL.
    if (r.status !== 0) throw new Error(`git ${args[0]} failed with exit ${r.status}`);
  };
  const run = (...args) => spawnSync(process.execPath, [AUDIT, ...args], { encoding: 'utf8', env });
  // The audit with more environment, such as a GIT_DIR set by the shell it runs in.
  const runWith = (extra, ...args) => spawnSync(process.execPath, [AUDIT, ...args], { encoding: 'utf8', env: { ...env, ...extra } });
  const done = () => rmSync(dir, { recursive: true, force: true });
  return { dir, root, put, git, run, runWith, done, env };
}

// The text under one `## ` heading, up to the next.
function section(out, name) {
  const lines = out.split(/\r?\n/);
  const at = lines.indexOf(`## ${name}`);
  if (at < 0) return '';
  const end = lines.findIndex((l, i) => i > at && l.startsWith('## '));
  return lines.slice(at + 1, end < 0 ? undefined : end).join('\n');
}

// The indices of the sources whose token appears in the text; "unknown" for a bare token.
function leaks(text) {
  const found = [];
  for (let i = 0; i < SOURCES; i++) if (text.includes(t(i)) || text.includes(h(i))) found.push(i);
  if (!found.length && (text.includes(TOKEN) || text.includes(TOKEN.replaceAll('_', '-')))) found.push('unknown');
  return found;
}

// Each check reports its label only, never the output it searched.
function expectIn(text, needle, label) {
  assert.ok(text.includes(needle), `expected ${label}`);
}
function expectNotIn(text, needle, label) {
  assert.ok(!text.includes(needle), `did not expect ${label}`);
}

// A setup with a token in every place tokens usually sit. The index of each source is the suffix of its token.
function plantAll(s) {
  s.put('.claude/settings.json', JSON.stringify({
    env: { API_KEY: t(0) },
    hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: `node "$CLAUDE_PROJECT_DIR"/.claude/hooks/guard.mjs --key ${t(1)}` }] }] },
    permissions: { allow: ['Read(*)'], deny: ['Read(./.env)', 'Read(./secrets/**)'] },
    enabledPlugins: { 'demo-plugin@demo-market': true, 'off-plugin@demo-market': false },
  }, null, 2));
  s.put('.claude/settings.local.json', JSON.stringify({
    permissions: { allow: [`Bash(curl -H "Authorization: Bearer ${t(2)}" https://api.example.invalid)`] },
  }, null, 2));
  s.put('.mcp.json', JSON.stringify({
    mcpServers: {
      x: { type: 'http', url: `https://mcp.example.invalid/sse?key=${t(5)}`, headers: { Authorization: `Bearer ${t(4)}` }, env: { KEY: t(3) } },
      localtool: { command: 'npx', args: ['-y', 'some-server', '--token', t(19)] },
      // No scheme: user info before the host, and a variable. Neither is a URL, so no host is shown.
      noscheme: { type: 'http', url: `${h(24)}:pw@mcp.example.invalid` },
      fromvar: { type: 'sse', url: '${MCP_URL}' },
    },
  }, null, 2));
  // Compose's default name, with flow mappings and a flow list.
  s.put('compose.yaml', [
    'services:',
    `  api: {image: "registry.example.invalid/api:2.0", environment: {SECRET_KEY: ${t(28)}}}`,
    '  worker:',
    `    environment: [ "K=${t(29)}" ]`,
    '',
  ].join('\n'));
  // Override files, read under the same rules as the files they override.
  s.put('compose.override.yaml', [
    'services:',
    '  api:',
    '    environment:',
    `      - DEBUG_TOKEN=${t(32)}`,
    '  debugger:',
    `    command: ["serve", "--token", "${t(32)}"]`,
    '',
  ].join('\n'));
  s.put('docker-compose.override.yml', ['services:', '  web:', '    environment:', `      OVERRIDE_KEY: ${t(33)}`, ''].join('\n'));
  // CRLF line endings, as a file saved on Windows.
  s.put('docker-compose.yml', [
    'x-secret: &tokanchor ' + t(9),
    'services:',
    '  web:',
    '    image: registry.example.invalid/web:1.4.2',
    '    environment:',
    `      - API_KEY=${t(6)}`,
    '      - SHARED=*tokanchor',
    '    command: >',
    `      serve --token ${t(8)}`,
    '      --port 8080',
    '  db:',
    '    image: postgres:16.4',
    '    environment:',
    `      POSTGRES_PASSWORD: ${t(7)}`,
    '      ANCHORED: *tokanchor',
    'volumes:',
    '  dbdata:',
    '',
  ].join('\r\n'));
  s.put('.github/workflows/ci.yml', [
    'name: ci',
    'on: [push]',
    'env:',
    `  DEPLOY_TOKEN: ${t(10)}`,
    'jobs:',
    '  build:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    `      - run: echo ${t(11)}`,
    '      - uses: actions/example@v1',
    '        with:',
    `          api-key: ${t(30)}`,
    '',
  ].join('\n'));
  s.put('requirements.txt', `requests==2.32.3\npkg @ https://${t(13)}@pypi.example.invalid/pkg.whl\n--extra-index-url https://${t(21)}@pypi.example.invalid/simple\n`);
  // Fences that hold shorter fences, and a fence line with an info string, which cannot close a fence:
  // one shape per file, so each is tested on its own.
  s.put('CLAUDE.md', [
    '# Project rules', '', `The body says ${t(14)}.`, '', '## Testing', '', 'Run the tests.', '',
    '````md', '```', `# export API_KEY=${t(25)}`, '````', '', '## After fences', '',
  ].join('\n'));
  s.put('AGENTS.md', ['~~~~', '~~~', `# export API_KEY=${t(26)}`, '~~~~', '# Agents', ''].join('\n'));
  s.put('.cursorrules', ['```', 'echo start', '```bash', `# export API_KEY=${t(27)}`, '```', '# Rules', ''].join('\n'));
  s.put('.claude/skills/demo-skill/SKILL.md', `---\nname: demo-skill\ndescription: >-\n  Use when a demo needs\n  a skill.\n---\n\n# Demo\n\nBody holds ${t(15)}.\n`);
  s.put('.claude/agents/demo-agent.md', `---\nname: demo-agent\ndescription: "Use for demo work."\n---\nAgent body ${t(18)}.\n`);
  s.put('.env', `API_KEY=${t(16)}\n`);
  s.put('reports/sales.csv', `id,secret\n1,${t(20)}\n`);
  s.put('.pre-commit-config.yaml', `repos:\n  - repo: https://hooks.example.invalid/pre-commit\n    rev: v1.0.0\n    hooks:\n      - id: trailing-whitespace\n      - id: check-tokens\n        args: [--token, ${t(17)}]\n      - id: local-check\n        entry: bash -c "check --token ${t(31)}"\n`);
  s.git(s.root, ['init', '-q']);
  s.git(s.root, ['remote', 'add', 'origin', `https://gituser:${t(12)}@host/path/repo.git?q=${t(12)}`]);
  // Scheme-less remotes: a plain scp-like one, one with a colon in its user info, and one holding a newline.
  s.git(s.root, ['config', 'remote.scp.url', 'git@github.com:org/repo.git']);
  s.git(s.root, ['config', 'remote.userinfo.url', `${h(22)}:pw@github.com/org/repo.git`]);
  s.git(s.root, ['config', 'remote.newline.url', `https://nl.example.invalid/x\n${h(23)}:x`]);
  s.git(s.root, ['add', 'CLAUDE.md']);
  s.git(s.root, ['commit', '-q', '-m', 'first']);
  s.put('.git/hooks/pre-push', '#!/bin/sh\nexit 0\n');
  s.put('.husky/pre-commit', 'npm test\n');
  s.put('.husky/_/husky.sh', '# internal\n');
}

test('no planted token reaches stdout or stderr, and every name does', () => {
  const s = sandbox();
  try {
    plantAll(s);
    const r = s.run(s.root);
    assert.equal(r.status, 0, 'audit exits 0');
    assert.deepEqual(leaks(r.stdout), [], 'stdout holds the token of the source indices shown');
    assert.deepEqual(leaks(r.stderr), [], 'stderr holds the token of the source indices shown');
    assert.ok(r.stderr === '', 'stderr is empty');

    const out = r.stdout;
    for (const h of HEADINGS) expectIn(out, `\n## ${h}\n`, `the heading ${h}`);
    const stack = section(out, 'Stack');
    expectIn(stack, '| dependencies | requests, pkg | requirements.txt |', 'the dependency names');
    expectIn(stack, '| services | web, db | docker-compose.yml |', 'the service names');
    expectIn(stack, '| services | api, worker | compose.yaml |', 'the service names in compose.yaml, flow mappings included');
    expectIn(stack, '| services | api, debugger | compose.override.yaml |', 'the service names in compose.override.yaml');
    expectIn(stack, '| services | web | docker-compose.override.yml |', 'the service names in docker-compose.override.yml');
    expectIn(stack, '| CI jobs | build | .github/workflows/ci.yml |', 'the job name');
    expectNotIn(stack, 'dbdata', 'a volume as a service');
    expectNotIn(out, 'actions/example', 'a workflow step');

    const repos = section(out, 'Repositories');
    expectIn(repos, '| . | host, github.com, not parsed | main | no (', 'the remote hosts, branch and dirty state');
    expectNotIn(repos, 'nl.example.invalid', 'the host of a remote URL holding a newline');
    expectNotIn(out, 'gituser', 'the remote user info');
    expectNotIn(out, 'repo.git', 'the remote path');
    expectNotIn(out, 'pw@', 'the user info of a scheme-less remote');

    const installed = section(out, 'Already installed');
    expectIn(installed, '| MCP server | x | project | transport http, host mcp.example.invalid |', 'the MCP server x');
    expectIn(installed, '| MCP server | localtool | project | transport stdio |', 'the stdio MCP server');
    expectIn(installed, '| MCP server | noscheme | project | transport http, host not parsed |', 'a scheme-less MCP url as not parsed');
    expectIn(installed, '| MCP server | fromvar | project | transport sse, host not parsed |', 'an MCP url from a variable as not parsed');
    expectIn(installed, '| hook | PreToolUse: guard.mjs | project |', 'the hook event and script name');
    expectIn(installed, '| skill | demo-skill | project | Use when a demo needs a skill. |', 'the skill description');
    expectIn(installed, '| agent | demo-agent | project | Use for demo work. |', 'the agent description');
    expectNotIn(out, 'some-server', 'an MCP server argument');
    expectNotIn(out, 'npx', 'an MCP server command');
    expectNotIn(out, 'Bearer', 'a header value');

    const setup = section(out, 'Existing Claude setup');
    expectIn(setup, 'permissions allow 1, deny 2, ask 0', 'the permission counts of settings.json');
    expectIn(setup, 'permissions allow 1, deny 0, ask 0', 'the permission counts of settings.local.json');
    expectIn(setup, 'demo-plugin@demo-market', 'the enabled plugin');
    expectNotIn(setup, 'off-plugin', 'a disabled plugin');
    expectNotIn(out, 'Read(', 'a permission rule');
    expectIn(setup, 'CLAUDE.md: 14 lines; headings: Project rules; Testing; After fences |', 'the CLAUDE.md headings outside its fences');
    expectIn(setup, 'AGENTS.md: 5 lines; headings: Agents', 'the AGENTS.md heading after a tilde fence');
    expectIn(setup, '.cursorrules: 6 lines; headings: Rules |', 'the .cursorrules heading after a fence with an info string inside');
    expectNotIn(out, 'export API_KEY', 'a line inside a fence as a heading');

    const hooks = section(out, 'Hooks');
    expectIn(hooks, '.git/hooks/: pre-push', 'the git hook name');
    expectIn(hooks, '.pre-commit-config.yaml: trailing-whitespace, check-tokens, local-check', 'the pre-commit hook ids');
    expectNotIn(out, 'bash -c', 'a pre-commit entry');
    expectIn(hooks, '.husky/: pre-commit |', 'the husky hook name, without husky internals');

    const unopened = section(out, 'Present but not opened');
    expectIn(unopened, '.env', 'the .env file');
    expectIn(unopened, 'reports/sales.csv', 'the data file');
  } finally { s.done(); }
});

test('a byte-order mark before the JSON is dropped', () => {
  const s = sandbox();
  try {
    s.put('.mcp.json', `\uFEFF${JSON.stringify({ mcpServers: { bomserver: { command: 'node' } } })}`);
    s.put('.claude/settings.json', `\uFEFF${JSON.stringify({ permissions: { allow: ['Read(*)', 'Glob(*)'] } })}`);
    const r = s.run(s.root);
    assert.equal(r.status, 0, 'audit exits 0');
    expectIn(section(r.stdout, 'Already installed'), '| MCP server | bomserver | project | transport stdio |', 'the server behind a byte-order mark');
    expectIn(section(r.stdout, 'Existing Claude setup'), 'permissions allow 2, deny 0, ask 0', 'the settings behind a byte-order mark');
    expectNotIn(r.stdout, 'not parsed', 'a parse failure');
  } finally { s.done(); }
});

test('an unparsable file is listed as present, not parsed, and nothing else', () => {
  const s = sandbox();
  try {
    s.put('.mcp.json', `{ "mcpServers": { "half": { "env": { "KEY": "${t(0)}" } `);
    s.put('.claude/settings.json', `{ "env": { "KEY": "${t(1)}" }, `);
    s.put('package.json', `{ "dependencies": { "left-pad": "1.0.0", "x": "${t(2)}" `);
    const r = s.run(s.root);
    assert.equal(r.status, 0, 'audit exits 0');
    assert.deepEqual(leaks(r.stdout), [], 'stdout holds the token of the source indices shown');
    expectIn(section(r.stdout, 'Existing Claude setup'), '.mcp.json: present, not parsed', 'the unparsable .mcp.json');
    expectIn(section(r.stdout, 'Existing Claude setup'), '.claude/settings.json: present, not parsed', 'the unparsable settings');
    expectIn(section(r.stdout, 'Stack'), '| dependencies | present, not parsed | package.json |', 'the unparsable package.json');
    expectNotIn(r.stdout, 'half', 'a server name from an unparsable file');
    expectNotIn(r.stdout, 'left-pad', 'a dependency from an unparsable file');
  } finally { s.done(); }
});

test('depth 4 is honoured, and node_modules/ and .venv/ are skipped', () => {
  const s = sandbox();
  const pkg = (name) => JSON.stringify({ dependencies: { [name]: '1.0.0' } }, null, 2);
  try {
    s.put('a/b/c/d/package.json', pkg('four-deep'));
    s.put('a/b/c/d/e/package.json', pkg('five-deep'));
    s.put('node_modules/lib/package.json', pkg('in-node-modules'));
    s.put('node_modules/lib/index.zzz', 'x');
    s.put('.venv/lib/requirements.txt', 'in-venv\n');
    s.put('venv/lib/requirements.txt', 'in-plain-venv\n');
    s.put('dist/package.json', pkg('in-dist'));
    let r = s.run(s.root);
    assert.equal(r.status, 0, 'audit exits 0');
    expectIn(r.stdout, 'four-deep', 'a manifest four folders deep');
    expectNotIn(r.stdout, 'five-deep', 'a manifest five folders deep');
    for (const name of ['in-node-modules', 'in-venv', 'in-plain-venv', 'in-dist', '.zzz']) expectNotIn(r.stdout, name, `anything from a skipped folder (${name})`);
    r = s.run(s.root, '--depth', '5');
    assert.equal(r.status, 0, 'audit exits 0 with --depth 5');
    expectIn(r.stdout, 'five-deep', 'a manifest five folders deep at --depth 5');
    expectNotIn(r.stdout, 'in-node-modules', 'node_modules at --depth 5');
  } finally { s.done(); }
});

test('a skill shows its description and never its body; CLAUDE.md shows headings and line count only', () => {
  const s = sandbox();
  try {
    s.put('.claude/skills/writer/SKILL.md', '---\nname: writer\ndescription: Use when writing a letter.\n---\n\n# Writer\n\nBODYMARKER line.\n');
    s.put('CLAUDE.md', '# House rules\r\n\r\nINSTRUCTIONBODY here.\r\n\r\n## Commits\r\n\r\n```sh\r\n# not a heading\r\n```\r\n');
    s.put('AGENTS.md', '# Agents\n');
    const r = s.run(s.root);
    assert.equal(r.status, 0, 'audit exits 0');
    expectIn(section(r.stdout, 'Already installed'), '| skill | writer | project | Use when writing a letter. |', 'the skill description');
    expectNotIn(r.stdout, 'BODYMARKER', 'the skill body');
    const setup = section(r.stdout, 'Existing Claude setup');
    expectIn(setup, 'CLAUDE.md: 9 lines; headings: House rules; Commits', 'the CLAUDE.md line count and headings');
    expectIn(setup, 'AGENTS.md: 1 line; headings: Agents', 'the AGENTS.md line count and heading');
    expectNotIn(r.stdout, 'INSTRUCTIONBODY', 'the CLAUDE.md body');
    expectNotIn(r.stdout, 'not a heading', 'a comment inside a code fence');
  } finally { s.done(); }
});

test('pyproject extras keep the array open, and a Pipfile source is not a dependency', () => {
  const s = sandbox();
  try {
    s.put('py/pyproject.toml', '[project]\nname = "demo"\ndependencies = [\n  "fastapi[standard]>=0.115",  # web ]\n  "httpx>=0.27",\n]\n');
    s.put('pipenv/Pipfile', '[packages]\nrequests = "*"\n\n[[source]]\nurl = "https://pypi.example.invalid/simple"\nverify_ssl = true\nname = "pypi"\n\n[dev-packages]\npytest = "*"\n');
    const r = s.run(s.root);
    assert.equal(r.status, 0, 'audit exits 0');
    const stack = section(r.stdout, 'Stack');
    expectIn(stack, '| dependencies | fastapi, httpx | py/pyproject.toml |', 'both pyproject dependencies');
    expectIn(stack, '| dependencies | requests, pytest | pipenv/Pipfile |', 'the Pipfile packages only');
    expectNotIn(stack, 'verify_ssl', 'a Pipfile source key');
  } finally { s.done(); }
});

test('git ignores a GIT_DIR set in the environment', () => {
  const s = sandbox();
  try {
    s.git(s.root, ['init', '-q']);
    s.git(s.root, ['remote', 'add', 'origin', 'https://right.example.invalid/a.git']);
    const other = path.join(s.dir, 'other');
    mkdirSync(other);
    s.git(other, ['init', '-q']);
    s.git(other, ['remote', 'add', 'origin', 'https://wrong.example.invalid/b.git']);
    const r = s.runWith({ GIT_DIR: path.join(other, '.git'), GIT_WORK_TREE: other, GIT_INDEX_FILE: path.join(other, '.git', 'index') }, s.root);
    assert.equal(r.status, 0, 'audit exits 0');
    expectIn(section(r.stdout, 'Repositories'), '| . | right.example.invalid |', 'the remote of the repository found');
    expectNotIn(r.stdout, 'wrong.example.invalid', 'the remote of the repository in GIT_DIR');
  } finally { s.done(); }
});

test('git runs with no GIT_* variable from the environment but the sealed config, in any case', () => {
  const s = sandbox();
  try {
    s.put('README.md', 'x\n');
    s.git(s.root, ['init', '-q']);
    s.git(s.root, ['remote', 'add', 'origin', 'https://right.example.invalid/a.git']);
    s.git(s.root, ['add', 'README.md']);
    s.git(s.root, ['commit', '-q', '-m', 'first']);
    const empty = path.join(s.dir, 'no-objects');
    mkdirSync(empty);
    const expected = '| . | right.example.invalid | main | yes |';
    // GIT_CONFIG_PARAMETERS adds config as -c does; GIT_OBJECT_DIRECTORY points git at a store with no objects.
    const injected = "'remote.injected.url'='https://wrong.example.invalid/b.git'";
    for (const [label, extra] of [
      ['GIT_CONFIG_PARAMETERS', { GIT_CONFIG_PARAMETERS: injected }],
      ['GIT_OBJECT_DIRECTORY', { GIT_OBJECT_DIRECTORY: empty }],
      // Windows reads environment names in any case.
      ['Git_Config_Parameters', { Git_Config_Parameters: injected }],
      ['git_object_directory', { git_object_directory: empty }],
    ]) {
      const r = s.runWith(extra, s.root);
      assert.equal(r.status, 0, `audit exits 0 with ${label}`);
      expectIn(section(r.stdout, 'Repositories'), expected, `the repository's own host and a clean state with ${label} set`);
      expectNotIn(r.stdout, 'wrong.example.invalid', `a remote from ${label}`);
    }
  } finally { s.done(); }
});

// audit() in a child process under the sealed environment, with git's buffer or time limit shrunk, as
// the shipped limits (64 MiB of status, 20 seconds per git call) are out of a test's reach.
function repositoriesWithLimits(s, limits, env = s.env) {
  const code = [
    `const m = await import(${JSON.stringify(pathToFileURL(AUDIT).href)});`,
    `if (!m.GIT_LIMITS) { process.stdout.write('no GIT_LIMITS'); process.exit(0); }`,
    `Object.assign(m.GIT_LIMITS, ${JSON.stringify(limits)});`,
    `process.stdout.write(m.audit(${JSON.stringify(s.root)}, { depth: 4 }).sections['Repositories'].join('\\n'));`,
  ].join('\n');
  return spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', env });
}

// The time limit and the environment under which every git call outlives it. A 1 ms limit alone was a race:
// on a fast Linux machine a small git call can end within it. So, off Windows, the git on the PATH never
// answers, however fast the machine; on Windows the real git stays, since it cannot start within 1 ms.
function gitPastItsTime(s) {
  if (process.platform === 'win32') return { limits: { timeout: 1 }, env: s.env };
  const bin = path.join(s.dir, 'slow-bin');
  mkdirSync(bin);
  // exec, so the time limit's kill reaches sleep itself: a sleep left as the shell's child would hold the
  // call's output open for its 30 s.
  writeFileSync(path.join(bin, 'git'), '#!/bin/sh\nexec sleep 30\n', { mode: 0o755 });
  return { limits: { timeout: 500 }, env: { ...s.env, PATH: `${bin}${path.delimiter}${s.env.PATH}` } };
}

test('a status too large for the buffer is dirty, and git that runs too long is unknown', () => {
  const s = sandbox();
  try {
    s.put('README.md', 'x\n');
    s.git(s.root, ['init', '-q']);
    s.git(s.root, ['add', 'README.md']);
    s.git(s.root, ['commit', '-q', '-m', 'first']);
    for (let i = 0; i < 20; i++) s.put(`untracked-${i}.txt`, 'x\n');
    let r = repositoriesWithLimits(s, { maxBuffer: 16 });
    assert.equal(r.status, 0, 'audit exits 0 with a small buffer');
    expectIn(r.stdout, '| main | no (many changes) |', 'a status past the buffer counted as dirty');
    const slow = gitPastItsTime(s);
    const started = Date.now();
    r = repositoriesWithLimits(s, slow.limits, slow.env);
    assert.ok(Date.now() - started >= slow.limits.timeout, 'git ran into the time limit, not a failure to start');
    assert.equal(r.status, 0, 'audit exits 0 with a short time limit');
    expectIn(r.stdout, '| unknown |', 'a git call past the time limit shown as unknown');
    expectNotIn(r.stdout, '| yes |', 'a timed-out status shown as clean');
    expectNotIn(r.stdout, '| no (', 'a timed-out status shown as dirty');
    expectNotIn(r.stdout, '| none |', 'a timed-out remote lookup shown as no remote');
    r = repositoriesWithLimits(s, {});
    expectIn(r.stdout, '| none | main |', 'a repository with no remote, within the limits, shows none');
  } finally { s.done(); }
});

test('skills and agents are listed by front matter whatever their names; the never list still holds for other files', () => {
  const s = sandbox();
  try {
    s.put('.claude/skills/secret-scanner/SKILL.md', '---\nname: secret-scanner\ndescription: Use when scanning for leaked keys.\n---\nBody.\n');
    s.put('.claude/skills/secret-scanner/secrets.txt', `${t(0)}\n`);
    s.put('.claude/skills/data/SKILL.md', '---\nname: data\ndescription: Use for data work.\n---\nBody.\n');
    s.put('.claude/agents/credential-checker.md', '---\nname: credential-checker\ndescription: Use to check credentials are not committed.\n---\nBody.\n');
    const r = s.run(s.root);
    assert.equal(r.status, 0, 'audit exits 0');
    assert.deepEqual(leaks(r.stdout), [], 'stdout holds the token of the source indices shown');
    const installed = section(r.stdout, 'Already installed');
    expectIn(installed, '| skill | secret-scanner | project | Use when scanning for leaked keys. |', 'a skill whose folder name matches the never list');
    expectIn(installed, '| skill | data | project | Use for data work. |', 'a skill whose folder is named data');
    expectIn(installed, '| agent | credential-checker | project | Use to check credentials are not committed. |', 'an agent whose file name matches the never list');
    expectIn(section(r.stdout, 'Present but not opened'), '.claude/skills/secret-scanner/secrets.txt', 'a secret file inside a skill folder');
  } finally { s.done(); }
});

test('bad input exits 2', () => {
  const s = sandbox();
  try {
    s.put('file.txt', 'x');
    assert.equal(s.run().status, 2, 'no folder');
    assert.equal(s.run(path.join(s.root, 'missing')).status, 2, 'a missing folder');
    assert.equal(s.run(path.join(s.root, 'file.txt')).status, 2, 'a file, not a folder');
    assert.equal(s.run(s.root, '--depth', 'x').status, 2, 'a depth that is not a number');
    assert.equal(s.run(s.root, '--depth').status, 2, 'a depth with no value');
    assert.equal(s.run(s.root, '--bogus').status, 2, 'an unknown option');
  } finally { s.done(); }
});

test('the audit writes nothing, and audit() returns every section', () => {
  const s = sandbox();
  const snapshot = (dir) => readdirSync(dir, { recursive: true }).sort().map((f) => {
    const st = statSync(path.join(dir, f));
    return `${f} ${st.size} ${st.mtimeMs}`;
  });
  try {
    plantAll(s);
    const before = snapshot(s.root);
    const r = s.run(s.root);
    assert.equal(r.status, 0, 'audit exits 0');
    assert.ok(JSON.stringify(snapshot(s.root)) === JSON.stringify(before), 'the folder is unchanged');
  } finally { s.done(); }
  // In process, on a folder with no repository, so no git runs outside the sealed environment.
  const plain = sandbox();
  try {
    plain.put('package.json', '{}');
    const { sections } = audit(plain.root, { depth: 4 });
    assert.deepEqual(Object.keys(sections), HEADINGS);
    for (const h of HEADINGS) assert.ok(Array.isArray(sections[h]), `${h} is a list of lines`);
  } finally { plain.done(); }
});

// Public issue #4: the other agent tools' instruction files their own pages name (docs/facts.md, "Other agent
// tools: instruction files, skills and hooks"), by name and headings only; a file no tool reads as rules,
// and skills, are not listed.
test('the audit lists the instruction files of Cursor, GitHub Copilot, Gemini CLI, Codex, Windsurf, Devin and Kiro, and leaves out what none of them reads', () => {
  const s = sandbox();
  try {
    const listed = ['.cursorrules', '.cursor/rules/style.mdc', '.cursor/rules/team/review.mdc', '.cursor/rules/plain.md', '.github/copilot-instructions.md',
      '.github/instructions/frontend/react.instructions.md', 'GEMINI.md', 'AGENTS.override.md', 'AGENT.md', 'AGENTS.local.md', '.windsurfrules',
      '.windsurf/rules/a.md', '.windsurf/global_rules.md', '.devin/rules/b.md', '.devin/global_rules.md', '.kiro/steering/product.md'];
    const ignored = ['.github/instructions/notes.md', '.agents/skills/x/SKILL.md', 'docs/GEMINI-notes.md', '.devin/notes.md'];
    for (const f of [...listed, ...ignored]) s.put(f, `# Heading of ${f}\n\nbody ${t(40)}\n`);
    const row = audit(s.root, { depth: 4 }).sections['Existing Claude setup'].find((l) => l.startsWith("| Other agent tools' instructions"));
    assert.ok(row, 'the row is there');
    for (const f of listed) assert.ok(row.includes(`${f}: 3 lines; headings: Heading of ${f}`), `${f} is listed by name and heading`);
    for (const f of ignored) assert.ok(!row.includes(`${f}:`), `${f} is not listed`);
    assert.ok(!row.includes(t(40)), 'no body text');
  } finally { s.done(); }
});
