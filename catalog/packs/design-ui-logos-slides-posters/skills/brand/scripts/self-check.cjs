#!/usr/bin/env node
'use strict';
// Self-check for the four brand scripts: feeds each one malformed input and fails if any
// of them dies with an uncaught exception (a stack trace on stderr) where a message was expected.
// Needs only Node. Run it from anywhere: node brand/scripts/self-check.cjs

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const here = __dirname;
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-check-'));
let failures = 0;

function write(rel, content) {
  const target = path.join(work, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  return target;
}

function run(script, args) {
  const r = spawnSync(process.execPath, [path.join(here, script), ...args], { cwd: work, encoding: 'utf8' });
  const crashed = /\n\s+at .*\(.*\)|Uncaught|TypeError|SyntaxError|RangeError/.test(r.stderr || '');
  return { code: r.status, out: r.stdout, err: r.stderr, crashed };
}

function expect(label, ok, detail) {
  if (!ok) failures += 1;
  console.log((ok ? 'ok   ' : 'FAIL ') + label + (ok ? '' : ' :: ' + detail));
}

// validate-asset against malformed manifests
const asset = write('banner_spring-fair_hero-shot_20260101.png', 'x');
const manifests = {
  'assets null': '{"assets":null}',
  'assets [null]': '{"assets":[null]}',
  'assets [1]': '{"assets":[1]}',
  'assets "x"': '{"assets":"x"}',
  'assets {}': '{"assets":{}}',
  'invalid JSON': '{not json',
  'empty file': '',
  'JSON null': 'null',
  'binary garbage': Buffer.from([0, 255, 254, 1, 2, 3, 200]),
};
for (const [label, body] of Object.entries(manifests)) {
  write('.assets/manifest.json', body);
  const r = run('validate-asset.cjs', [asset, '--json']);
  let parsed = null;
  try { parsed = JSON.parse(r.out); } catch { /* reported below */ }
  expect('validate-asset, manifest ' + label, !r.crashed && parsed !== null, r.err.split('\n')[0]);
}
fs.rmSync(path.join(work, '.assets'), { recursive: true, force: true });
const gone = run('validate-asset.cjs', ['no-such-file.png']);
expect('validate-asset, missing file', !gone.crashed && gone.code === 1, gone.err.split('\n')[0]);

// guidelines readers against malformed guidelines files
const bad = {
  'empty file': '',
  'binary garbage': Buffer.from(Array.from({ length: 400 }, (_, i) => (i * 37) % 256)),
  'one huge line': '#'.repeat(2000000) + '\n',
  'unclosed table': '### Primary Colors\n| a | #12345',
};
for (const [label, body] of Object.entries(bad)) {
  const file = write('docs/brand-guidelines.md', body);
  for (const [script, args] of [
    ['inject-brand-context.cjs', ['--json']],
    ['inject-brand-context.cjs', []],
    ['extract-colors.cjs', ['--palette']],
  ]) {
    const r = run(script, args);
    expect(script + ' ' + args.join(' ') + ', guidelines ' + label, !r.crashed, r.err.split('\n')[0]);
  }
  // sync needs a colour base to work with; with garbage it may refuse, but the refusal must be a message
  write('assets/design-tokens.json', '{}');
  const s = run('sync-brand-to-tokens.cjs', ['--dry-run']);
  expect('sync-brand-to-tokens --dry-run, guidelines ' + label, !s.crashed && s.code === 1, s.err.split('\n')[0]);
  void file;
}
for (const script of ['inject-brand-context.cjs', 'extract-colors.cjs', 'sync-brand-to-tokens.cjs']) {
  fs.rmSync(path.join(work, 'docs'), { recursive: true, force: true });
  const r = run(script, script.startsWith('extract') ? ['--palette'] : []);
  expect(script + ', guidelines file missing', !r.crashed && r.code === 1, r.err.split('\n')[0]);
}

fs.rmSync(work, { recursive: true, force: true });
console.log(failures === 0 ? 'self-check passed' : failures + ' check(s) failed');
process.exit(failures === 0 ? 0 : 1);
