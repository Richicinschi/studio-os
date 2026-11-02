// tools/export/test/gates.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { walkFiles, gateSecrets, gatePrivacy, gatePaths, gateAccounting, gateLinks, gateNotes, gateDiagramUrls } from '../gates.mjs';

function kit(files) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-gates-'));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), text);
  }
  return root;
}
const token = 'ghp_' + 'b2'.repeat(18);
const WIN_HUB = ['E:', 'AppDev'].join('\\');

test('walkFiles lists files, skipping .git', () => {
  const root = kit({ 'a.md': 'x', '.git/HEAD': 'ref', 'docs/b.md': 'y' });
  try { assert.deepEqual(walkFiles(root), ['a.md', 'docs/b.md']); } finally { rmSync(root, { recursive: true, force: true }); }
});

test('secrets: found in content, the pipeline source and tests included; only rules.mjs is exempt', () => {
  const root = kit({ 'docs/a.md': `key ${token}\n`, 'tools/export/rules.mjs': `const t = '${token}';\n`, 'tools/export/x.mjs': `const t = '${token}';\n` });
  try { assert.deepEqual(gateSecrets(root), ['docs/a.md:1 github-token', 'tools/export/x.mjs:1 github-token']); } finally { rmSync(root, { recursive: true, force: true }); }
});

test('privacy: content and file names are checked, by list position only; local files are skipped', () => {
  const root = kit({
    'modules/01/README.md': 'ok\nmet Zorblat today\n',
    'examples/zorblat-notes.md': 'clean\n',
    'tools/export/privacy.local.txt': 'Zorblat\n',
    'tools/export/owner.local.txt': 'Zorblat\n',
    'tools/export/rewrites.local.json': '[{"phrase": "Zorblat app"}]\n',
  });
  try {
    assert.deepEqual(gatePrivacy(root, ['acme', 'Zorblat']), ['examples/zorblat-notes.md: file name has denied term #2', 'modules/01/README.md:2 denied term #2']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('paths: found in content and tests; only rules.mjs is exempt', () => {
  const root = kit({ 'examples/s.md': `run ${WIN_HUB}\\x\n`, 'tools/export/rules.mjs': `'${WIN_HUB}'\n`, 'tools/export/test/t.mjs': `'${WIN_HUB}'\n` });
  try { assert.deepEqual(gatePaths(root), ['examples/s.md:1 hub-path', 'tools/export/test/t.mjs:1 hub-path']); } finally { rmSync(root, { recursive: true, force: true }); }
});

test('paths: an allowed phrase passes only in its own file, and only that phrase', () => {
  const product = ['Tail', 'scale'].join('');
  const allow = [{ file: 'catalog/skills/x/server.cjs', phrase: `${product} SSH`, why: 'upstream comment' }];
  const root = kit({
    'catalog/skills/x/server.cjs': `// common on WSL, ${product} SSH, and others\n// my ${product.toLowerCase()} box\n`,
    'catalog/skills/y/server.cjs': `// common on WSL, ${product} SSH, and others\n`,
  });
  try {
    assert.deepEqual(gatePaths(root, allow), ['catalog/skills/x/server.cjs:2 tailnet', 'catalog/skills/y/server.cjs:1 tailnet']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('accounting: PRINCIPLES.md is a hand-written file', () => {
  const root = kit({ 'PRINCIPLES.md': '# How we work\n' });
  try { assert.deepEqual(gateAccounting(root, { written: [], notices: [], manifest: { items: [] } }), []); } finally { rmSync(root, { recursive: true, force: true }); }
});

test('accounting: stray catalog files, unknown encodings, unknown locations, unlicensed third-party skills, external items without licence', () => {
  const root = kit({ 'catalog/INDEX.md': 'i', 'catalog/stray.md': 's', 'modules/u.md': Buffer.from('﻿hi', 'utf16le'), 'modules/x.md': 'm', 'random.txt': 'r' });
  try {
    const manifest = { items: [{ id: 'tool', kind: 'external', status: 'link-only', pack: 'foundation', upstream: 'u' }] };
    assert.deepEqual(gateAccounting(root, { written: ['catalog/INDEX.md'], notices: [{ id: 'b', licenceFile: null }], manifest }), [
      'catalog/stray.md: in catalog/ but not produced by this export',
      'modules/u.md: neither UTF-8 text nor a known binary type',
      'random.txt: not produced by the export and not in a hand-written location',
      'catalog/skills/b: third-party skill shipped without a licence file',
      'tool: external item without upstream or licence',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('links: relative links must resolve with the exact case, inside the kit; web links, anchors, code and comments are ignored', () => {
  const root = kit({
    'a.md': '[ok](docs/b.md) [bad](missing.md) [web](https://x.invalid) [anchor](#top) [deep](docs/b.md#part)\n```\n[no](nothere.md)\n```\n`[inline](gone.md)`\n<!-- an example line:\n- [Title](file.md) -->\n',
    'docs/b.md': '[up](../a.md) [case](MAINTAINING.md) [wrong](maintaining.md) [out](../../outside.md)\n',
    'docs/MAINTAINING.md': 'm\n',
  });
  try {
    assert.deepEqual(gateLinks(root), ['a.md: broken link -> missing.md', 'docs/b.md: broken link -> maintaining.md', 'docs/b.md: broken link -> ../../outside.md']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('notes: a --note is checked for denied terms, paths and secrets before anything is built', () => {
  assert.deepEqual(gateNotes(['A fine note.', `Thanks to Zorblat, see ${WIN_HUB}`, token], ['acme', 'Zorblat']), [
    '--note 2: denied term #2', '--note 2: hub-path', '--note 3: github-token',
  ]);
});

test('diagram links: the payload must decode to the .drawio beside it', () => {
  const url = (xml) => `https://viewer.diagrams.net/?tags=%7B%7D#R${encodeURIComponent(deflateRawSync(Buffer.from(encodeURIComponent(xml))).toString('base64'))}`;
  const xml = '<mxfile><diagram name="d">a &amp; b</diagram></mxfile>\n';
  const root = kit({
    'docs/flow.drawio': xml, 'docs/flow.url.txt': `${url(xml)}\n`,
    'docs/old.drawio': xml, 'docs/old.url.txt': url(xml.replace('a &amp; b', 'secret text')),
    'docs/none.url.txt': 'https://example.invalid/\n',
  });
  try {
    assert.deepEqual(gateDiagramUrls(root), [
      'docs/none.url.txt: no #R payload, or no docs/none.drawio beside it',
      'docs/old.url.txt: payload differs from docs/old.drawio; regenerate the link',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
