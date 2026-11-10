// tools/export/test/rules.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rewriteText, findSecrets, findDenied, findPaths, loadDenyList, loadOwnerName, loadLocalRewrites, fileKind } from '../rules.mjs';
import { gatePrivacy } from '../gates.mjs';

// Studio paths, hostnames and addresses are assembled at runtime, so no kit file carries them as literals.
const WIN_HUB = ['E:', 'AppDev'].join('\\');
const BASH_HUB = ['', 'e', 'AppDev'].join('/');
const WIN_HOME = ['C:', 'Users', 'someone'].join('\\');
const OWNER = 'Zorblat';
const ip = (...octets) => octets.join('.');

test('hub and home paths become placeholders, in any case', () => {
  const { text, hits } = rewriteText(`Run ${WIN_HUB}\\tools\\x.mjs, then ${BASH_HUB}/wiki and ${WIN_HOME}\\.claude`);
  assert.equal(text, 'Run <HUB>\\tools\\x.mjs, then <HUB>/wiki and <HOME>\\.claude');
  assert.deepEqual([...new Set(hits)].sort(), ['home-path', 'hub-path']);
  assert.equal(rewriteText(`${['e:', 'appdev'].join('\\')}\\x and ${['', 'mnt', 'e', 'AppDev'].join('/')}/y`).text, '<HUB>\\x and <HUB>/y');
  assert.equal(rewriteText(`${['', 'Users', 'someone'].join('/')}/x and ${['', 'home', 'someone'].join('/')}/y`).text, '<HOME>/x and <HOME>/y');
  const untouched = '@app.get("/users/{user_id}") and /home/{user}/x and /mnt/c/Users/$USER/AppData';
  assert.equal(rewriteText(untouched).text, untouched, 'URL routes and placeholders are not home folders');
});

test('the owner name becomes "the owner", capitalized only where a sentence, item or paragraph starts', () => {
  const r = (t) => rewriteText(t, { owner: OWNER }).text;
  assert.equal(r(`Ask ${OWNER} first. ${OWNER}'s rule holds.`), "Ask the owner first. The owner's rule holds.");
  assert.equal(r(`- ${OWNER} merges`), '- The owner merges');
  assert.equal(r(`**${OWNER}** decides`), '**The owner** decides');
  assert.equal(r(`pushing stays\n  ${OWNER}'s. Next`), "pushing stays\n  the owner's. Next");
  assert.equal(r(`it is (${OWNER}’s call)`), 'it is (the owner’s call)');
  assert.equal(r(`a full stop.\n${OWNER} merges`), 'a full stop.\nThe owner merges');
  assert.equal(r(`para one\n\n${OWNER} merges`), 'para one\n\nThe owner merges');
  assert.equal(r(`para one\r\n\r\n${OWNER} merges`), 'para one\r\n\r\nThe owner merges');
  assert.equal(r(`${OWNER}ian stays`), `${OWNER}ian stays`);
  assert.equal(rewriteText(`Ask ${OWNER}.`).text, `Ask ${OWNER}.`, 'with no owner given the name is left for the privacy gate');
});

test('the owner rewrite stays fast on a long run of asterisks before the name', () => {
  // A child process, so a regex that backtracks for minutes is killed instead of hanging the suite.
  const rules = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'rules.mjs')).href;
  const text = `${'*'.repeat(60)}x ${OWNER}`;
  const code = `import { rewriteText } from ${JSON.stringify(rules)};\nrewriteText(${JSON.stringify(text)}, { owner: ${JSON.stringify(OWNER)} });`;
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', code], { timeout: 5000 });
  assert.equal(run.status, 0, `rewriteText did not finish within 5 s (signal ${run.signal})`);
});

test('generic secrets are found; the fake token is built at runtime so scanners ignore this file', () => {
  const token = 'ghp_' + 'a1'.repeat(18);
  assert.deepEqual(findSecrets(`ok line\nGITHUB=${token}\n`).map((f) => [f.reason, f.line]), [['github-token', 2]]);
  assert.deepEqual(findSecrets('version 1.2.3 and sk-short'), []);
});

test('denied terms match whole words in any case and report the line', () => {
  const deny = ['Zorblat Quenlin', 'acme-corp'];
  assert.deepEqual(findDenied('a\nmet zorblat quenlin today\nACME-CORP ships\nacme-corporate', deny),
    [{ term: 'Zorblat Quenlin', line: 2 }, { term: 'acme-corp', line: 3 }]);
});

test('denied terms match across -, _ and whitespace spellings, joined forms and line wraps', () => {
  const deny = ['Zorblat Quenlin', 'acme-corp'];
  assert.deepEqual(findDenied('acme_corp\nacme corp\nacmecorp\nzorblat  quenlin', deny).map((f) => f.line), [1, 2, 3, 4]);
  assert.deepEqual(findDenied('met zorblat\nquenlin today', deny), [{ term: 'Zorblat Quenlin', line: 1 }]);
  assert.deepEqual(findDenied('see memory/project_acme_corp.md', deny), [{ term: 'acme-corp', line: 1 }]);
});

test('a denied term with a plural or possessive s still matches, inside identifiers too', () => {
  const deny = ['Zorblat', 'acme-corp'];
  assert.deepEqual(findDenied('see [[feedback_need_zorblats_word]]\nzorblat\'s note\nacme-corps\nacme-corporate', deny).map((f) => f.line), [1, 2, 3]);
});

test('hex identifiers match inside longer hex and after a 0x prefix', () => {
  const deny = ['ABCDEF0123456789'];
  assert.equal(findDenied('key 0xabcdef0123456789', deny).length, 1);
  assert.equal(findDenied('fpr 99887766554433221100ABCDEF0123456789', deny).length, 1);
  assert.equal(findDenied('nothing here', deny).length, 0);
});

test('the deny list is required, must not be empty, and must be UTF-8', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-rules-'));
  try {
    assert.throws(() => loadDenyList(path.join(dir, 'missing.txt')), /deny list missing/);
    writeFileSync(path.join(dir, 'empty.txt'), '# only a comment\n\n');
    assert.throws(() => loadDenyList(path.join(dir, 'empty.txt')), /deny list is empty/);
    writeFileSync(path.join(dir, 'list.txt'), '﻿# people\nZorblat Quenlin\n\nacme-corp\n');
    assert.deepEqual(loadDenyList(path.join(dir, 'list.txt')), ['Zorblat Quenlin', 'acme-corp']);
    writeFileSync(path.join(dir, 'wide.txt'), Buffer.from('﻿Zorblat\n', 'utf16le'));
    assert.throws(() => loadDenyList(path.join(dir, 'wide.txt')), /must be UTF-8/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('local rewrites are required; each entry needs file, phrase or pattern, replacement, why and gone; errors never echo the text', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-rules-'));
  const f = path.join(dir, 'rewrites.local.json');
  const entry = { file: 'catalog/skills/x/SKILL.md', phrase: 'the Zorblat app', replacement: 'an app', why: 'a product', gone: 'zorblat' };
  try {
    assert.throws(() => loadLocalRewrites(f), /local rewrites missing: .*write \[\]; never commit it/);
    writeFileSync(f, '[]\n');
    assert.deepEqual(loadLocalRewrites(f), []);
    writeFileSync(f, '[{"phrase": "the Zorblat app",');
    assert.throws(() => loadLocalRewrites(f), (e) => /not valid JSON/.test(e.message) && !/Zorblat/.test(e.message));
    writeFileSync(f, JSON.stringify(entry));
    assert.throws(() => loadLocalRewrites(f), /must be a JSON array/);
    const { gone, ...noGone } = entry;
    writeFileSync(f, JSON.stringify([entry, noGone, { ...entry, pattern: 'Zorblat' }]));
    assert.throws(() => loadLocalRewrites(f), (e) => /entry 2, 3 in/.test(e.message) && !/Zorblat/.test(e.message));
    writeFileSync(f, `﻿${JSON.stringify([entry])}`);
    assert.deepEqual(loadLocalRewrites(f), [{ ...entry, localIndex: 1 }]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// The real local files exist only on the maintainer's machine; these checks run there and are skipped
// elsewhere. They report terms and entries by number only, so a failure never prints what they protect.
const LOCAL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const realDeny = path.join(LOCAL, 'privacy.local.txt');
const realRewrites = path.join(LOCAL, 'rewrites.local.json');

test('the privacy gate refuses every term on the real deny list, in a page and in a file name', { skip: !existsSync(realDeny) && 'no local deny list here' }, () => {
  const deny = loadDenyList(realDeny);
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-rules-'));
  try {
    deny.forEach((t, i) => writeFileSync(path.join(dir, `page${i + 1}.md`), `A line that names ${t.toLowerCase()} in passing.\n`));
    const found = gatePrivacy(dir, deny);
    deny.forEach((t, i) => assert.ok(found.some((l) => l.startsWith(`page${i + 1}.md:1 `)), `deny term #${i + 1} was not refused`));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('every real local rewrite entry is valid, and no replacement brings back a denied term', { skip: !existsSync(realRewrites) && 'no local rewrites here' }, () => {
  const deny = existsSync(realDeny) ? loadDenyList(realDeny) : [];
  for (const r of loadLocalRewrites(realRewrites)) {
    assert.equal(findDenied(r.replacement, deny).length, 0, `rewrites.local.json entry ${r.localIndex}: its replacement has a denied term`);
    if (r.pattern) assert.doesNotThrow(() => new RegExp(r.pattern, 'g'), `rewrites.local.json entry ${r.localIndex}: its pattern is not a valid regex`);
  }
});

test('the owner name file is required; its first entry is the name', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-rules-'));
  try {
    assert.throws(() => loadOwnerName(path.join(dir, 'missing.txt')), /owner name file missing/);
    writeFileSync(path.join(dir, 'empty.txt'), '# only a comment\n');
    assert.throws(() => loadOwnerName(path.join(dir, 'empty.txt')), /owner name file is empty/);
    writeFileSync(path.join(dir, 'owner.txt'), `# the owner\n${OWNER}\n`);
    assert.equal(loadOwnerName(path.join(dir, 'owner.txt')), OWNER);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('paths, hostnames and addresses are reported in any case; placeholders and documentation addresses are not', () => {
  const text = [
    `see ${WIN_HUB}\\x`,
    'ok <HUB>\\x and <HOME>/y and ~/notes and /mnt/c/Users/<you>/x',
    `ssh someone@${'Some-Mac' + '-mini' + '.local'}`,
    `host ${ip(192, 168, 1, 20)}`,
    'build 10.0.19045',
    `lower ${['e:', 'appdev'].join('\\')}\\x`,
    `wsl ${['', 'mnt', 'e', 'AppDev'].join('/')}`,
    `mac ${['', 'Users', 'someone', 'x'].join('/')}`,
    `linux ${['', 'home', 'someone', 'x'].join('/')}`,
    `tailnet ${ip(100, 101, 102, 103)}`,
    `link-local ${ip(169, 254, 1, 1)}`,
    `ula ${['fd12', '3456', '789a', '', '1'].join(':')}`,
    `public ${ip(8, 8, 4, 4)}`,
    `docs ${ip(192, 0, 2, 10)} ${ip(198, 51, 100, 7)} ${ip(203, 0, 113, 9)} ${ip(127, 0, 0, 1)} ${ip(0, 0, 0, 0)} ${ip(255, 255, 255, 0)}`,
    `versions v${ip(1, 2, 3, 4)} and ${ip(1, 2, 3, 4)}.5 and ${ip(300, 1, 1, 1)}`,
    `mdns ${'box' + '.local'} but not privacy.local.txt or .env.local`,
    `vpn ${'tail' + 'scale'}`,
    'route @app.get("/users/{user_id}") and /home/{user}/x',
    `win ${['c:', 'users', 'someone'].join('\\')}`,
  ].join('\n');
  assert.deepEqual(findPaths(text).map((f) => [f.reason, f.line]), [
    ['hub-path', 1], ['mac-host', 3], ['local-host', 3], ['private-ip', 4], ['hub-path', 6], ['hub-path', 7],
    ['home-path', 8], ['home-path', 9], ['private-ip', 10], ['private-ip', 11], ['private-ipv6', 12], ['public-ip', 13],
    ['local-host', 16], ['tailnet', 17], ['home-path', 19],
  ]);
});

test('text is decided by content: UTF-8 without NUL bytes; known binary types pass; anything else is unknown', () => {
  assert.equal(fileKind('a/SKILL.md', Buffer.from('# hi\n')), 'text');
  assert.equal(fileKind('a/main.py.template', Buffer.from('x = 1\n')), 'text');
  assert.equal(fileKind('a/LICENSE', Buffer.from('MIT\n')), 'text');
  assert.equal(fileKind('a/logo.png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff])), 'binary');
  assert.equal(fileKind('a/notes.md', Buffer.from('﻿hi', 'utf16le')), 'unknown');
  assert.equal(fileKind('a/blob.dat', Buffer.from([0xff, 0xfe, 0x00])), 'unknown');
});
