// tools/export/test/gates.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { walkFiles, gateSecrets, gatePrivacy, gatePaths, gateAccounting, gateLinks, gateNotes, gateDiagramUrls, gateTriage } from '../gates.mjs';

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

const scanOf = (recommendation, score, findings) => ({ recommendation, score, ...(findings === undefined ? {} : { findings }), version: 'v2.2.3', date: '2026-11-09' });
const readOf = (recommendation, score, findings, fp, byDesign, other = 0) => ({ recommendation, score, findings, fp, byDesign, other, anchor: 'a' });

test('triage: every item whose last scan is not SAFE needs a triage section for that scan, every finding read, none judged real', () => {
  const scans = {
    safe: scanOf('SAFE', 10, 1), ok: scanOf('DO_NOT_INSTALL', 100, 3), none: scanOf('CAUTION', 25, 1), rescanned: scanOf('CAUTION', 35, 1),
    partial: scanOf('CAUTION', 25, 3), real: scanOf('DO_NOT_INSTALL', 60, 2), 'not-shipped': scanOf('DO_NOT_INSTALL', 100, 9),
  };
  const triage = {
    ok: readOf('DO_NOT_INSTALL', 100, 3, 2, 1), rescanned: readOf('CAUTION', 25, 1, 1, 0),
    partial: readOf('CAUTION', 25, 3, 1, 0), real: readOf('DO_NOT_INSTALL', 60, 2, 1, 0, 1),
  };
  assert.deepEqual(gateTriage({ keys: ['safe', 'ok', 'none', 'rescanned', 'partial', 'real'], scans, triage }), [
    'none: last scan CAUTION (25/100), and tools/export/scan-triage.md has no section for it; read every finding and add one',
    'rescanned: last scan CAUTION (35/100), but its triage section is for CAUTION (25/100); triage the new scan',
    'partial: the triage reads 1 of its 3 findings',
    'real: 1 finding judged neither FP nor BY DESIGN; a real finding is fixed or the item is withheld, never shipped',
  ]);
});

test('triage: a rescan with the same verdict and score but another number of findings fails, and so does a scan with no count', () => {
  const scans = { capped: scanOf('DO_NOT_INSTALL', 100, 35), uncounted: scanOf('CAUTION', 25) };
  const triage = { capped: readOf('DO_NOT_INSTALL', 100, 36, 28, 8), uncounted: readOf('CAUTION', 25, 1, 1, 0) };
  assert.deepEqual(gateTriage({ keys: ['capped', 'uncounted'], scans, triage }), [
    'capped: the last scan has 35 findings, but its triage section is for 36; triage the new scan',
    'uncounted: scans.json records no number of findings for its last scan; run node tools/export/scan.mjs again',
  ]);
});

test('triage: two sections for one item fail; an item with no scan fails only at a release', () => {
  const scans = { twice: scanOf('CAUTION', 25, 1) };
  const triage = { twice: { ...readOf('CAUTION', 25, 1, 1, 0), duplicate: true } };
  assert.deepEqual(gateTriage({ keys: ['twice', 'unscanned'], scans, triage }), [
    'twice: tools/export/scan-triage.md has more than one section for it; keep one',
  ]);
  assert.deepEqual(gateTriage({ keys: ['unscanned'], scans, triage, release: true }), [
    'unscanned: no scan in scans.json; a release ships only scanned items (node tools/export/scan.mjs)',
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
