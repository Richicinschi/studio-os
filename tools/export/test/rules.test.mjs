// tools/export/test/rules.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rewriteText, findSecrets, findDenied, findPaths, findRisky, loadDenyList, loadOwnerName, loadLocalRewrites, fileKind, cutStudioOnly, findStudioMarkers, findMarkers } from '../rules.mjs';
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
  // Closing markup between the full stop and the space still ends the sentence.
  assert.equal(r(`5. **Instructions outrank skills.** ${OWNER}'s words come first.`), "5. **Instructions outrank skills.** The owner's words come first.");
  assert.equal(r(`He said "stop." ${OWNER} stopped. (Done.) ${OWNER} left.`), 'He said "stop." The owner stopped. (Done.) The owner left.');
  assert.equal(r(`**bold** ${OWNER} stays`), '**bold** the owner stays');
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
    writeFileSync(path.join(dir, 'list.txt'), '\uFEFF# people\nZorblat Quenlin\n\nacme-corp\n');
    assert.deepEqual(loadDenyList(path.join(dir, 'list.txt')), ['Zorblat Quenlin', 'acme-corp']);
    writeFileSync(path.join(dir, 'wide.txt'), Buffer.from('\uFEFFZorblat\n', 'utf16le'));
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
    writeFileSync(f, `\uFEFF${JSON.stringify([entry])}`);
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
  assert.equal(fileKind('a/notes.md', Buffer.from('\uFEFFhi', 'utf16le')), 'unknown');
  assert.equal(fileKind('a/blob.dat', Buffer.from([0xff, 0xfe, 0x00])), 'unknown');
});

test('image rule: a content path, URL or media file in a YAML image field is not a container image', () => {
  const fence = '```';
  const yml = [
    'image: ./cover.webp', 'image: /images/hero.png', 'image: hero.jpg', 'image: https://cdn.example.com/x.png',
    'image: ~/pictures/a', 'image: ../art/b', '  - image: "./c.svg"', "image: 'poster.PDF'", 'image: clip.mp4',
    'image: a.jpeg', 'image: a.avif', 'image: a.gif', 'image: a.ico', 'image: a.bmp', 'image: a.tiff', 'image: a.webm',
  ].join('\n');
  assert.deepEqual(findRisky(yml, 'site/content/post.yml'), []);
  assert.deepEqual(findRisky(`${fence}yaml\nimage: ./cover.webp\nimage: http://x.test/y\n${fence}\n`, 'a.md'), []);
});

test('image rule: a bare, registry or quoted image name is still flagged', () => {
  const fence = '```';
  const yml = ['image: nginx', 'image: ghcr.io/x/y', 'image: "redis"', 'image: localhost:5000/app', 'image: redis:7'].join('\n');
  assert.deepEqual(findRisky(yml, 'docker-compose.yml').map((f) => f.line), [1, 2, 3, 4]);
  assert.deepEqual(findRisky(`${fence}yml\nimage: nginx\n${fence}\n`, 'a.md').map((f) => f.line), [2]);
});

// The block markers are assembled at runtime, so no kit file but rules.mjs carries them for the gate to find.
const ONLY = ['studio', 'only'].join('-');
const OPEN = `<!-- ${ONLY} -->`;
const CLOSE = `<!-- /${ONLY} -->`;

test(`${ONLY} blocks: a block is cut from its open to its close marker, both included; the lines around it stay`, () => {
  assert.equal(cutStudioOnly(`before\n${OPEN}\none\ntwo\nthree\n${CLOSE}\nafter\n`, 'a.md'), 'before\nafter\n');
  assert.equal(cutStudioOnly(`before\r\n  ${OPEN}  \r\none\r\n\t${CLOSE}\r\nafter\r\n`, 'a.md'), 'before\r\nafter\r\n', 'CRLF, and markers with whitespace around them');
  assert.equal(cutStudioOnly(`before\n${OPEN}\none\n${CLOSE}`, 'a.md'), 'before\n', 'a close on the last line, with no newline after it');
});

test(`${ONLY} blocks: two blocks in one file are both cut`, () => {
  const text = `a\n${OPEN}\nx\n${CLOSE}\nb\n${OPEN}\ny\nz\n${CLOSE}\nc\n`;
  assert.equal(cutStudioOnly(text, 'a.md'), 'a\nb\nc\n');
});

test(`${ONLY} blocks: a block never closed stops the build at its open line, never cuts to the end`, () => {
  assert.throws(() => cutStudioOnly(`a\nb\n${OPEN}\nc\nd\n`, 'skills/x/SKILL.md'), (e) => e.message.startsWith(`skills/x/SKILL.md:3 ${ONLY} block`));
});

test(`${ONLY} blocks: a marker that shares its line with other text stops the build`, () => {
  assert.throws(() => cutStudioOnly(`a\ntext ${OPEN} more\nb\n`, 'x.md'), (e) => e.message.startsWith(`x.md:2 ${ONLY} block`));
  assert.throws(() => cutStudioOnly(`${OPEN}\na\nend ${CLOSE}\n`, 'x.md'), (e) => e.message.startsWith(`x.md:3 ${ONLY} block`));
});

test(`${ONLY} blocks: a nested open, or a close with no open, stops the build`, () => {
  assert.throws(() => cutStudioOnly(`${OPEN}\na\n${OPEN}\nb\n${CLOSE}\n${CLOSE}\n`, 'x.md'), (e) => e.message.startsWith(`x.md:3 ${ONLY} block`));
  assert.throws(() => cutStudioOnly(`a\n${CLOSE}\n`, 'x.md'), (e) => e.message.startsWith(`x.md:2 ${ONLY} block`));
});

// Misspellings of the marker in its HTML-comment form: a space or an underscore for the hyphen, no hyphen, upper case.
const MISSPELT = ['studio only', 'studio_only', 'studioonly', 'STUDIO ONLY', 'Studio -  only'];

test(`${ONLY} blocks: a pair misspelt the same way at both ends stops the build, so the block never ships`, () => {
  for (const word of MISSPELT) {
    const text = `a\n<!-- ${word} -->\nsecret\n<!-- /${word} -->\nb\n`;
    assert.throws(() => cutStudioOnly(text, 'x.md'), (e) => e.message.startsWith(`x.md:2 ${ONLY} block`), word);
  }
});

test(`${ONLY} blocks: a misspelt marker alone on its line stops the build and says it is misspelt`, () => {
  for (const word of MISSPELT) {
    assert.throws(() => cutStudioOnly(`a\n  <!--${word}-->  \nb\n`, 'x.md'), (e) => e.message.startsWith(`x.md:2 ${ONLY} block`) && /misspelt/.test(e.message), word);
    assert.throws(() => cutStudioOnly(`${OPEN}\na\n<!-- /${word} -->\n`, 'x.md'), (e) => e.message.startsWith(`x.md:3 ${ONLY} block`) && /misspelt/.test(e.message), `/${word}`);
  }
});

test(`${ONLY} blocks: text with no markers comes back byte for byte, CRLF included`, () => {
  for (const text of ['', 'one line', 'a\r\nb\r\n', 'a\nb\r\nc', '\n\n', `mentions ${ONLY} in prose\r\n`]) assert.equal(cutStudioOnly(text, 'x.md'), text);
});

test(`${ONLY} markers left over are found per line, in any case`, () => {
  const reason = `${ONLY} marker left in shipped text`;
  assert.deepEqual(findStudioMarkers(`ok\r\n${OPEN}\r\nstudio only\r\nA ${ONLY.toUpperCase()} note`), [{ reason, line: 2 }, { reason, line: 4 }]);
  assert.deepEqual(findStudioMarkers('nothing here\n'), []);
});

test(`${ONLY} markers left over: a misspelt marker in its comment form is found too; prose without the comment is not`, () => {
  const reason = `${ONLY} marker left in shipped text`;
  const text = MISSPELT.map((w) => `<!-- ${w} -->`).join('\n');
  assert.deepEqual(findStudioMarkers(text), MISSPELT.map((_, i) => ({ reason, line: i + 1 })));
  assert.deepEqual(findStudioMarkers('studio only, not in this kit\n<!-- studio notes -->\n'), []);
});

const MARKERS = ['the hub', 'hard rule', 'studio rule', 'studio hub', 'this machine', 'his yes', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];
const marker = (m, line) => ({ line, reason: `studio marker "${m}"` });
const CARD = 'catalog/skills/x/SKILL.md';

test('studio markers: each marker is found once in a line as a whole word; word markers in any case, G1 to G8 in capitals only', () => {
  for (const m of MARKERS) {
    const gate = /^G\d$/.test(m);
    assert.deepEqual(findMarkers(`clean\nsay ${m} here, ${m} again.\n`, CARD), [marker(m, 2)], m);
    assert.deepEqual(findMarkers(`${m.toUpperCase()} first\n`, CARD), [marker(m, 1)], `${m} in upper case`);
    assert.deepEqual(findMarkers(`${m.toLowerCase()} first\n`, CARD), gate ? [] : [marker(m, 1)], `${m} in lower case`);
  }
  assert.deepEqual(findMarkers('ask the hub, then this machine\r\nok\r\n', CARD), [marker('the hub', 1), marker('this machine', 1)], 'two markers on one line, two findings');
  assert.deepEqual(findMarkers('nothing studio here\n', CARD), []);
});

test('studio markers: G6 is found, g6, G60, PG6, G6a, G0 and G9 are not; nor is a marker inside a longer word', () => {
  assert.deepEqual(findMarkers('see G6.\n(g6)\n(G6)\n', CARD), [marker('G6', 1), marker('G6', 3)]);
  assert.deepEqual(findMarkers('G60 PG6 G6a G0 G9 G6_x\n', CARD), []);
  assert.deepEqual(findMarkers('bathe hub, the hubris, othis machine, this machinery, his yesterday, hard ruler\n', CARD), []);
});

// Task 6 review, M2: "the studio hub's shared root checkout" shipped past the list, which knew only "the hub".
test('studio markers: "studio hub" and the possessive forms are found, with a straight or a curly apostrophe', () => {
  const text = [
    'Never clean in the studio hub\'s shared root checkout.',
    'The studio hub keeps it.',
    'studio hubs differ',
    'the hub\'s root',
    'the hub’s root',
    'the studio hub’s root',
    'a studio hubcap, the hubris',
  ].join('\n');
  assert.deepEqual(findMarkers(text, CARD), [
    marker('studio hub', 1), marker('studio hub', 2), marker('studio hub', 3),
    marker('the hub', 4), marker('the hub', 5), marker('studio hub', 6),
  ]);
});

test('studio markers: a "Hard rules" heading is found (a false hit goes on the allow-list, not out of the rule)', () => {
  assert.deepEqual(findMarkers('# Intro\n\n## Hard rules\n', CARD), [marker('hard rule', 3)]);
  assert.deepEqual(findMarkers('Studio rules apply.\n', CARD), [marker('studio rule', 1)]);
});

test('studio markers: only files under catalog/ are checked, Windows separators included', () => {
  const text = 'ask the hub\n';
  assert.deepEqual(findMarkers(text, 'catalog\\packs\\p\\skills\\a.md'), [marker('the hub', 1)]);
  for (const file of ['docs/notes.md', 'cards/x.md', 'README.md', 'tools/catalog/x.md', 'catalogue/x.md']) assert.deepEqual(findMarkers(text, file), [], file);
});
