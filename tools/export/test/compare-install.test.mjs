// tools/export/test/compare-install.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareTrees, lineMapping, MAX_DIFF_LINES } from '../../compare-install.mjs';

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'compare-install.mjs');

// Two folders, the kit copy and the installed copy, each written from { 'rel/path': content }.
function fixture(kit, installed) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'kit-compare-install-'));
  const write = (root, files) => {
    for (const [rel, body] of Object.entries(files)) {
      const file = path.join(root, ...rel.split('/'));
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, body);
    }
  };
  const a = path.join(dir, 'kit');
  const b = path.join(dir, 'installed');
  mkdirSync(a);
  mkdirSync(b);
  write(a, kit);
  write(b, installed);
  return { dir, a, b, done: () => rmSync(dir, { recursive: true, force: true }) };
}
const run = (args) => {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
// The body of one `## ` section, trimmed.
const section = (out, title) => {
  const m = out.split(/^## /m).find((s) => s.startsWith(`${title}\n`));
  assert.ok(m !== undefined, `no section ${title} in:\n${out}`);
  return m.slice(title.length + 1).trim();
};

const ITEM = {
  'SKILL.md': '# A skill\n\nDoes one thing.\n',
  'scripts/run.mjs': "import fs from 'node:fs';\nconst x = 1;\nconsole.log('old');\nexport default x;\n",
  'scripts/setup.sh': '#!/bin/sh\necho hi\n',
  'bin/tool': '#!/usr/bin/env node\nconsole.log(1);\n',
  'references/notes.md': 'one\ntwo\n',
};
const crlf = (s) => s.replace(/\n/g, '\r\n');

test('identical trees: three empty sections and every script identical, exit 0', () => {
  const f = fixture(ITEM, ITEM);
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    for (const t of ['Only in the kit copy', 'Only in the installed copy', 'Different']) assert.equal(section(r.out, t), 'None.');
    assert.equal(section(r.out, 'Scripts'), ['- `bin/tool`: identical', '- `scripts/run.mjs`: identical', '- `scripts/setup.sh`: identical'].join('\n'));
    assert.doesNotMatch(r.out, /```/);
  } finally { f.done(); }
});

test('the whole output for one changed script, one added and one removed file', () => {
  const f = fixture(ITEM, {
    ...Object.fromEntries(Object.entries(ITEM).filter(([k]) => k !== 'references/notes.md')),
    'scripts/run.mjs': ITEM['scripts/run.mjs'].replace("'old'", "'new'"),
    'local/extra.md': 'mine\n',
  });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.equal(r.out, [
      '## Only in the kit copy',
      '',
      '- `references/notes.md`',
      '',
      '## Only in the installed copy',
      '',
      '- `local/extra.md`',
      '',
      '## Different',
      '',
      '- `scripts/run.mjs`',
      '',
      '## Scripts',
      '',
      '- `bin/tool`: identical',
      '- `scripts/run.mjs`: changed',
      '- `scripts/setup.sh`: identical',
      '',
      '```diff',
      '--- kit/scripts/run.mjs',
      '+++ installed/scripts/run.mjs',
      '@@ -1,4 +1,4 @@',
      " import fs from 'node:fs';",
      ' const x = 1;',
      "-console.log('old');",
      "+console.log('new');",
      ' export default x;',
      '```',
      '',
    ].join('\n'));
  } finally { f.done(); }
});

test('added and removed files are listed by POSIX path relative to each root, sorted', () => {
  const f = fixture({ ...ITEM, 'b/z.md': 'z\n', 'a/y/x.txt': 'x\n' }, { ...ITEM, 'c.md': 'c\n', 'scripts/new.py': 'print(1)\n', 'A.md': 'a\n' });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.equal(section(r.out, 'Only in the kit copy'), '- `a/y/x.txt`\n- `b/z.md`');
    assert.equal(section(r.out, 'Only in the installed copy'), '- `A.md`\n- `c.md`\n- `scripts/new.py` (script)');
    assert.equal(section(r.out, 'Different'), 'None.');
  } finally { f.done(); }
});

test('a CRLF copy: "line endings only", no diff', () => {
  const f = fixture(ITEM, { ...ITEM, 'scripts/setup.sh': crlf(ITEM['scripts/setup.sh']), 'SKILL.md': crlf(ITEM['SKILL.md']) });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.equal(section(r.out, 'Different'), '- `SKILL.md` (line endings only)\n- `scripts/setup.sh` (line endings only)');
    assert.match(section(r.out, 'Scripts'), /^- `scripts\/setup\.sh`: changed \(line endings only\)$/m);
    assert.doesNotMatch(r.out, /```/);
  } finally { f.done(); }
});

test('content and line endings both differ: the diff is of the normalised text, and says line endings differ too', () => {
  const f = fixture(ITEM, { ...ITEM, 'scripts/run.mjs': crlf(ITEM['scripts/run.mjs'].replace("'old'", "'new'")) });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.equal(section(r.out, 'Different'), '- `scripts/run.mjs` (line endings differ too)');
    assert.match(r.out, /^- `scripts\/run\.mjs`: changed \(line endings differ too\)$/m);
    assert.match(r.out, /^-console\.log\('old'\);$/m);
    assert.match(r.out, /^\+console\.log\('new'\);$/m);
    // Only the one changed line shows as changed; no line differs by an invisible \r.
    const diff = r.out.split('```diff\n')[1].split('\n```')[0];
    assert.deepEqual(diff.split('\n').filter((l) => /^[-+](?![-+]{2} )/.test(l)), ["-console.log('old');", "+console.log('new');"]);
    assert.doesNotMatch(r.out, /\r/);
  } finally { f.done(); }
});

// A byte-order mark is written here as the escape \uFEFF, never as the character itself.
test('a byte-order mark in one copy only: "byte-order mark only", no diff', () => {
  const f = fixture(ITEM, { ...ITEM, 'scripts/setup.sh': `\uFEFF${ITEM['scripts/setup.sh']}`, 'SKILL.md': `\uFEFF${crlf(ITEM['SKILL.md'])}` });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.equal(section(r.out, 'Different'), '- `SKILL.md` (byte-order mark and line endings only)\n- `scripts/setup.sh` (byte-order mark only)');
    assert.match(section(r.out, 'Scripts'), /^- `scripts\/setup\.sh`: changed \(byte-order mark only\)$/m);
    assert.doesNotMatch(r.out, /```/);
    const d = compareTrees(f.a, f.b).different.find((x) => x.file === 'scripts/setup.sh');
    assert.equal(d.bomOnly, true);
    assert.equal(d.eolOnly, false);
  } finally { f.done(); }
});

test('a byte-order mark and changed content: the diff is of the text without the mark, and says so', () => {
  const f = fixture(ITEM, { ...ITEM, 'scripts/run.mjs': `\uFEFF${ITEM['scripts/run.mjs'].replace("'old'", "'new'")}` });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.equal(section(r.out, 'Different'), '- `scripts/run.mjs` (byte-order mark differs too)');
    assert.match(r.out, /^- `scripts\/run\.mjs`: changed \(byte-order mark differs too\)$/m);
    const diff = r.out.split('```diff\n')[1].split('\n```')[0];
    assert.deepEqual(diff.split('\n').filter((l) => /^[-+](?![-+]{2} )/.test(l)), ["-console.log('old');", "+console.log('new');"]);
    assert.doesNotMatch(r.out, /\uFEFF/);
  } finally { f.done(); }
});

test('a binary file is compared by bytes, without a diff', () => {
  const f = fixture({ ...ITEM, 'img/logo.png': Buffer.from([0x89, 0x50, 0, 1, 2]), 'scripts/blob.js': Buffer.from([0x61, 0, 0x62]) },
    { ...ITEM, 'img/logo.png': Buffer.from([0x89, 0x50, 0, 1, 3]), 'scripts/blob.js': Buffer.from([0x61, 0, 0x63]) });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.equal(section(r.out, 'Different'), '- `img/logo.png` (binary)\n- `scripts/blob.js` (binary)');
    assert.match(r.out, /^- `scripts\/blob\.js`: changed \(binary\)$/m);
    assert.doesNotMatch(r.out, /```/);
  } finally { f.done(); }
  const same = fixture({ 'x.bin': Buffer.from([0, 1, 2]) }, { 'x.bin': Buffer.from([0, 1, 2]) });
  try {
    assert.equal(section(run([same.a, same.b]).out, 'Different'), 'None.');
  } finally { same.done(); }
});

test(`a script over ${MAX_DIFF_LINES} lines: changed, too large to diff`, () => {
  const big = Array.from({ length: MAX_DIFF_LINES + 1 }, (_, n) => `line ${n}`).join('\n') + '\n';
  const f = fixture({ 'big.py': big }, { 'big.py': big.replace('line 7\n', 'line seven\n') });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.match(r.out, new RegExp(`^- \`big\\.py\`: changed \\(too large to diff: over ${MAX_DIFF_LINES} lines\\)$`, 'm'));
    assert.doesNotMatch(r.out, /```/);
  } finally { f.done(); }
});

test('a link inside a root is its own entry, never followed', () => {
  const f = fixture(ITEM, ITEM);
  const outside = mkdtempSync(path.join(os.tmpdir(), 'kit-compare-outside-'));
  try {
    writeFileSync(path.join(outside, 'secret-looking.txt'), 'not to be read\n');
    symlinkSync(outside, path.join(f.b, 'linked'), 'junction');
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    const only = section(r.out, 'Only in the installed copy');
    assert.match(only, /^- `linked` \(link \u2192 `[^`]+`\)$/);
    assert.doesNotMatch(r.out, /secret-looking/);
    // The same link in both copies is the same entry; a link to another target is different.
    symlinkSync(outside, path.join(f.a, 'linked'), 'junction');
    assert.equal(section(run([f.a, f.b]).out, 'Different'), 'None.');
    const other = path.join(outside, 'sub');
    mkdirSync(other);
    symlinkSync(other, path.join(f.a, 'linked2'), 'junction');
    symlinkSync(outside, path.join(f.b, 'linked2'), 'junction');
    const d = section(run([f.a, f.b]).out, 'Different');
    assert.match(d, /^- `linked2` \(kit copy: link \u2192 `[^`]*sub[^`]*`; installed copy: link \u2192 `[^`]+`\)$/);
  } finally { f.done(); rmSync(outside, { recursive: true, force: true }); }
});

test('two single files (an agent) are compared as one entry named by the kit file', () => {
  const f = fixture({ 'agent.md': '---\nname: a\n---\nBody\n' }, { 'agent.md': crlf('---\nname: a\n---\nBody\n') });
  try {
    const r = run([path.join(f.a, 'agent.md'), path.join(f.b, 'agent.md')]);
    assert.equal(r.code, 0, r.err);
    assert.equal(section(r.out, 'Different'), '- `agent.md` (line endings only)');
    assert.equal(section(r.out, 'Scripts'), 'None.');
  } finally { f.done(); }
});

test('bad input exits 2 with nothing on stdout: a missing path, a file against a folder, bad arguments', () => {
  const f = fixture(ITEM, ITEM);
  try {
    for (const args of [[path.join(f.dir, 'missing'), f.b], [f.a, path.join(f.dir, 'missing')], [path.join(f.a, 'SKILL.md'), f.b]]) {
      const r = run(args);
      assert.equal(r.code, 2, args.join(' '));
      assert.equal(r.out, '');
      assert.ok(r.err.length > 0);
    }
    for (const args of [[], [f.a], [f.a, f.b, f.b], [f.a, f.b, '--nope']]) {
      const r = run(args);
      assert.equal(r.code, 2, `args ${args.length}`);
      assert.equal(r.out, '');
      assert.match(r.err, /usage: node tools\/compare-install\.mjs <kit-item-path> <installed-path>/);
    }
  } finally { f.done(); }
});

// macOS keeps its temporary folder under /var, a link to /private/var: run through a linked path, the
// script must still run, never exit 0 having compared nothing.
test('compare-install.mjs runs when started through a linked folder', () => {
  const kit = mkdtempSync(path.join(os.tmpdir(), 'kit-ci-'));
  const link = path.join(mkdtempSync(path.join(os.tmpdir(), 'kit-ci-link-')), 'kit');
  try {
    mkdirSync(path.join(kit, 'tools'), { recursive: true });
    copyFileSync(CLI, path.join(kit, 'tools', 'compare-install.mjs'));
    symlinkSync(kit, link, 'junction');
    const r = spawnSync(process.execPath, [path.join(link, 'tools', 'compare-install.mjs')], { encoding: 'utf8' });
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /usage: node tools\/compare-install\.mjs/);
  } finally { rmSync(path.dirname(link), { recursive: true, force: true }); rmSync(kit, { recursive: true, force: true }); }
});

test('compareTrees: the result shape, hunks of 3 context lines, a missing final newline', () => {
  const base = Array.from({ length: 20 }, (_, n) => `l${n + 1}`);
  const changed = [...base];
  changed[1] = 'L2';
  changed[17] = 'L18';
  const f = fixture({ 's.sh': `${base.join('\n')}\n`, 'same.py': 'x\n', 'k.md': 'k\n' },
    { 's.sh': changed.join('\n'), 'same.py': 'x\n', 'i.md': 'i\n' });
  try {
    const r = compareTrees(f.a, f.b);
    assert.deepEqual(r.onlyA, ['k.md']);
    assert.deepEqual(r.onlyB, ['i.md']);
    assert.equal(r.different.length, 1);
    const d = r.different[0];
    assert.equal(d.file, 's.sh');
    assert.equal(d.script, true);
    assert.equal(d.eolOnly, false);
    assert.equal(d.diff, [
      '--- kit/s.sh',
      '+++ installed/s.sh',
      '@@ -1,5 +1,5 @@',
      ' l1',
      '-l2',
      '+L2',
      ' l3',
      ' l4',
      ' l5',
      '@@ -15,6 +15,6 @@',
      ' l15',
      ' l16',
      ' l17',
      '-l18',
      '+L18',
      ' l19',
      '-l20',
      '+l20',
      '\\ No newline at end of file',
    ].join('\n'));
    // An identical script is not in `different`; it is listed in `sameScripts`.
    assert.deepEqual(r.sameScripts, ['same.py']);
  } finally { f.done(); }
});

test('a diff holding a run of backticks gets a longer fence', () => {
  const f = fixture({ 'r.js': 'a\n```\n' }, { 'r.js': 'b\n```\n' });
  try {
    const r = run([f.a, f.b]);
    assert.match(r.out, /^````diff$/m);
    assert.match(r.out, /^````$/m);
  } finally { f.done(); }
});

// Special characters are built from their codes here, so this file holds none of them raw.
const chr = (...codes) => String.fromCharCode(...codes);
const escaped = (n) => `${chr(92)}u${n.toString(16).padStart(4, '0')}`;
const bytes = (...parts) => Buffer.concat(parts.map((p) => (typeof p === 'string' ? Buffer.from(p) : Buffer.from(p))));
const diffOf = (out) => out.split('```diff\n')[1].split('\n```')[0];
const changes = (diff) => diff.split('\n').filter((l) => /^[-+](?![-+]{2} )/.test(l));

test('a script that is not UTF-8 is diffed byte for byte, as Latin-1, and noted "not UTF-8"', () => {
  // A Windows PowerShell 5.1 script saved in Latin-1: e-acute (E9) in the kit copy, e-grave (E8) installed.
  const f = fixture({ 'x.ps1': bytes('param()\nWrite-Host "caf', [0xe9], '"\n') }, { 'x.ps1': bytes('param()\nWrite-Host "caf', [0xe8], '"\n') });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.equal(section(r.out, 'Different'), '- `x.ps1` (not UTF-8)');
    assert.match(r.out, /^- `x\.ps1`: changed \(not UTF-8\)$/m);
    const diff = diffOf(r.out);
    assert.match(diff, /^@@ -1,2 \+1,2 @@$/m);
    assert.deepEqual(changes(diff), [`-Write-Host "caf${chr(0xe9)}"`, `+Write-Host "caf${chr(0xe8)}"`]);
  } finally { f.done(); }
});

test('control characters in a diff line are shown as escapes, so nothing on the line can hide', () => {
  // ESC [2K clears a terminal line and a bare CR returns to its start; a C1 CSI and a right-to-left
  // override can reorder or hide text too. A tab is ordinary text and stays.
  const hidden = `echo ok${chr(27)}[2K${chr(13)}# hidden ${chr(0x9b)}2K ${chr(0x202e)}x`;
  const f = fixture({ 'r.sh': 'a\tb\necho ok\n' }, { 'r.sh': `a\tc\n${hidden}\n` });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.match(r.out, /^- `r\.sh`: changed \(control characters shown escaped\)$/m);
    assert.deepEqual(changes(diffOf(r.out)), ['-a\tb', '-echo ok', '+a\tc',
      `+echo ok${escaped(27)}[2K${escaped(13)}# hidden ${escaped(0x9b)}2K ${escaped(0x202e)}x`]);
    for (const c of [27, 13, 0x9b, 0x202e]) assert.ok(!r.out.includes(chr(c)), `raw ${c} in the output`);
  } finally { f.done(); }
});

test('on a line with an escape, a backslash is escaped too, so written-out escape text cannot pass for one', () => {
  // The installed line holds the six characters backslash-u-0-0-1-b and then a real ESC; a line with a
  // backslash and no control character keeps its backslash as it is.
  const f = fixture({ 'r.sh': 'printf "a\\n"\necho\n' }, { 'r.sh': `printf "a\\n"\necho ${chr(92)}u001b${chr(27)}\n` });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    const diff = diffOf(r.out);
    assert.deepEqual(changes(diff), ['-echo', `+echo ${escaped(92)}u001b${escaped(27)}`]);
    assert.match(diff, /^ printf "a\\n"$/m);
  } finally { f.done(); }
});

test('a #! file in one copy and a link in the other is still listed under Scripts', () => {
  const f = fixture({ 'bin/tool': '#!/bin/sh\necho hi\n' }, {});
  const outside = mkdtempSync(path.join(os.tmpdir(), 'kit-compare-outside-'));
  try {
    mkdirSync(path.join(f.b, 'bin'));
    symlinkSync(outside, path.join(f.b, 'bin', 'tool'), 'junction');
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.match(section(r.out, 'Scripts'), /^- `bin\/tool`: changed \(kit copy: a file; installed copy: link /);
  } finally { f.done(); rmSync(outside, { recursive: true, force: true }); }
});

test('a #! line after a byte-order mark still makes a script', () => {
  const bom = [0xef, 0xbb, 0xbf];
  const f = fixture({ run: bytes(bom, '#!/bin/sh\necho one\n') }, { run: bytes(bom, '#!/bin/sh\necho two\n') });
  try {
    const r = run([f.a, f.b]);
    assert.equal(r.code, 0, r.err);
    assert.match(section(r.out, 'Scripts'), /^- `run`: changed$/m);
    assert.deepEqual(changes(diffOf(r.out)), ['-echo one', '+echo two']);
  } finally { f.done(); }
});

test('.ts, .cmd, .bat and .psm1 files are scripts too', () => {
  const files = { 'a.ts': 'export {};\n', 'b.cmd': '@echo off\r\n', 'c.bat': '@echo off\r\n', 'd.psm1': 'function F {}\n' };
  const f = fixture(files, files);
  try {
    const r = run([f.a, f.b]);
    assert.equal(section(r.out, 'Scripts'), ['- `a.ts`: identical', '- `b.cmd`: identical', '- `c.bat`: identical', '- `d.psm1`: identical'].join('\n'));
  } finally { f.done(); }
});

// scan-compare maps the kit's recorded lines to the installed copy with this, read the same way as a diff.
test('lineMapping: unchanged lines map kit to installed; changed ones fall in numbered regions', () => {
  // Installed: a byte-order mark, CRLF, a line added at the top, b deleted, d changed to D, no final newline.
  const m = lineMapping(Buffer.from('a\nb\nc\nd\ne\n'), bytes([0xef, 0xbb, 0xbf], 'x\r\na\r\nc\r\nD\r\ne'));
  assert.deepEqual([...m.map], [[1, 2], [3, 3], [5, 5]]);
  assert.deepEqual([...m.kitRegion], [[2, { region: 1, at: 0 }], [4, { region: 2, at: 0 }]]);
  assert.deepEqual([...m.instRegion], [[1, { region: 0, at: 0 }], [4, { region: 2, at: 0 }]]);
  // Not UTF-8: both read as Latin-1, so a changed byte is a changed line and the rest still map.
  const latin = lineMapping(bytes('one\ncaf', [0xe9], '\n'), bytes('zero\none\ncaf', [0xe8], '\n'));
  assert.deepEqual([...latin.map], [[1, 2]]);
  assert.deepEqual([...latin.kitRegion], [[2, { region: 1, at: 0 }]]);
  // No mapping, with the reason, for a binary file or one over the diff limit.
  assert.deepEqual(lineMapping(Buffer.from([0x61, 0]), Buffer.from('a')), { why: 'binary' });
  const big = Buffer.from('x\n'.repeat(MAX_DIFF_LINES + 1));
  assert.deepEqual(lineMapping(big, Buffer.concat([big, Buffer.from('y\n')])), { why: `over ${MAX_DIFF_LINES} lines` });
  // Two copies the same once read map line for line, whatever their size.
  assert.equal(lineMapping(big, big).map.get(MAX_DIFF_LINES + 1), MAX_DIFF_LINES + 1);
});

// The scanner may count other characters as line breaks (Python's splitlines does), so its line numbers
// and the diff's can disagree: two copies that differ and hold any of them have no mapping.
test('lineMapping: copies that differ and use line breaks other than LF and CRLF have no mapping', () => {
  const why = { why: 'line breaks other than LF and CRLF' };
  // A lone CR, form feed, vertical tab, 1C, 1D, 1E; NEL as Latin-1 and as UTF-8; U+2028 and U+2029 as UTF-8.
  for (const sep of [[0x0d], [0x0c], [0x0b], [0x1c], [0x1d], [0x1e], [0x85], [0xc2, 0x85], [0xe2, 0x80, 0xa8], [0xe2, 0x80, 0xa9]]) {
    const kit = bytes('a', sep, 'b\n');
    assert.deepEqual(lineMapping(kit, bytes('z\n', kit)), why, `bytes ${sep.join(' ')} in the kit copy`);
    assert.deepEqual(lineMapping(bytes('z\nab\n'), bytes('a', sep, 'b\n')), why, `bytes ${sep.join(' ')} in the installed copy`);
    // The same copies still map line for line: any count of lines agrees with itself.
    assert.equal(lineMapping(kit, kit).map.get(1), 1);
  }
  // CRLF is not one of them.
  assert.equal(lineMapping(Buffer.from('a\r\nb\r\n'), Buffer.from('z\r\na\r\nb\r\n')).map.get(2), 3);
});
