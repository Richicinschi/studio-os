// tools/export/test/gates.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { walkFiles, gateSecrets, gatePrivacy, gatePaths, gateAccounting, gateLinks, gateNotes, gateDiagramUrls, gateTriage, gateRisky, gateStudioBlocks, gateMarkers, MARKERS_ALLOW, gateNames, NAMES_ALLOW, gateJson, shebangFiles } from '../gates.mjs';

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

// The risky patterns are assembled at runtime, so this file itself passes the risky gate.
const AT = ['allowed', 'tools'].join('-');
const LATEST = ['lat', 'est'].join('');
const FWD = ['forwarded', 'allow', 'ips'].join('-');
const TRUSTED = ['trusted', 'hosts'].join('_');

test('risky: each unsafe pattern is found, with its line and reason; rules.mjs is exempt', () => {
  const root = kit({
    'catalog/skills/a/SKILL.md': `---\nname: a\n${AT}: Bash Read\n---\n`,
    'catalog/skills/b/SKILL.md': `---\nname: b\n${AT}: Read, Write, Grep\n---\n`,
    'catalog/skills/c/SKILL.md': `---\nname: c\n${AT}: [Read, Bash, Write]\n---\n`,
    'catalog/skills/d/SKILL.md': `---\nname: d\n${AT}:\n  - Read\n  - Bash\n---\n`,
    'catalog/packs/p/skills/docker.md': `FROM python:3.12-slim\nimage: ghcr.io/acme/app:${LATEST}\n`,
    'catalog/packs/p/skills/mcp.md': `Run \`npx -y some-mcp@${LATEST}\` once.\nnpm i @scope/tool@${LATEST}\n`,
    'catalog/packs/p/skills/proxy.md': [
      `uvicorn app:app --${FWD}=*`, `${FWD}="*"`, `app.add_middleware(ProxyHeadersMiddleware, ${TRUSTED}="*")`, `${TRUSTED}=["*"]`, '',
    ].join('\n'),
    'tools/export/rules.mjs': `// ${AT}: Bash\n// x/y:${LATEST} z@${LATEST} ${FWD}="*"\n`,
  });
  try {
    assert.deepEqual(gateRisky(root, []), [
      'catalog/packs/p/skills/docker.md:2 image with :latest',
      'catalog/packs/p/skills/mcp.md:1 @latest in a command',
      'catalog/packs/p/skills/mcp.md:2 @latest in a command',
      'catalog/packs/p/skills/proxy.md:1 trust everything ("*")',
      'catalog/packs/p/skills/proxy.md:2 trust everything ("*")',
      'catalog/packs/p/skills/proxy.md:3 trust everything ("*")',
      'catalog/packs/p/skills/proxy.md:4 trust everything ("*")',
      'catalog/skills/a/SKILL.md:3 bare Bash in allowed-tools',
      'catalog/skills/b/SKILL.md:3 bare Write in allowed-tools',
      'catalog/skills/c/SKILL.md:3 bare Bash in allowed-tools',
      'catalog/skills/c/SKILL.md:3 bare Write in allowed-tools',
      'catalog/skills/d/SKILL.md:5 bare Bash in allowed-tools',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('risky: scoped tools, other tags, prose about the tag and narrow trust lists pass', () => {
  const root = kit({
    'catalog/skills/a/SKILL.md': `---\nname: a\n${AT}: Bash(git branch:*) Read\n---\n`,
    'catalog/skills/b/SKILL.md': `---\nname: b\n${AT}: Read, Write(docs/**), Bash(npm test), NotebookEdit\n---\nUse Bash and Write freely in the body.\n`,
    'catalog/packs/p/skills/docker.md': `image: ghcr.io/acme/app:1.4.2\nPin a version; the :${LATEST} tag moves.\nnpx -y some-mcp@1.2.3\n`,
    'catalog/packs/p/skills/proxy.md': `--${FWD}=192.0.2.1\n${TRUSTED}=["192.0.2.1"]\n`,
  });
  try { assert.deepEqual(gateRisky(root, []), []); } finally { rmSync(root, { recursive: true, force: true }); }
});

// The block marker word, assembled at runtime, so this file carries no marker for the gate to find.
const only = ['studio', 'only'].join('-');

test('studio blocks: a marker left in any shipped text file is found, in any case; only rules.mjs is exempt', () => {
  const root = kit({
    'catalog/skills/a/SKILL.md': `ok\n<!-- ${only} -->\n`,
    'catalog/skills/a/scripts/run.py': `# <!-- /${only} -->\r\nprint(1)\r\n`,
    'docs/notes.md': `fine\nA ${only.toUpperCase()} note\n`,
    'catalog/skills/a/clean.md': 'studio only, not in this kit\n',
    'tools/export/rules.mjs': `const m = '${only}';\n`,
  });
  try {
    assert.deepEqual(gateStudioBlocks(root), [
      `catalog/skills/a/SKILL.md:2 ${only} marker left in shipped text`,
      `catalog/skills/a/scripts/run.py:1 ${only} marker left in shipped text`,
      `docs/notes.md:2 ${only} marker left in shipped text`,
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('studio blocks: an allowed phrase passes only in its own file, and only on its line', () => {
  const allow = [{ file: 'docs/MAINTAINING.md', phrase: `wrap it in <!-- ${only} -->`, why: 'the maintainer guide names the marker' }];
  const root = kit({
    'docs/MAINTAINING.md': `To keep a rule, wrap it in <!-- ${only} --> lines.\nA bare ${only} here.\n`,
    'docs/other.md': `To keep a rule, wrap it in <!-- ${only} --> lines.\n`,
  });
  try {
    assert.deepEqual(gateStudioBlocks(root, allow), [`docs/MAINTAINING.md:2 ${only} marker left in shipped text`, `docs/other.md:1 ${only} marker left in shipped text`]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('studio markers: found in catalog/ text, code comments included; files outside catalog/ and rules.mjs pass', () => {
  const root = kit({
    'catalog/skills/a/SKILL.md': 'ok\n## Hard rules\nAsk the hub and G6.\n',
    'catalog/skills/a/scripts/run.py': '# bound to this machine only\r\nprint(1)\r\n',
    'cards/a.md': 'the hub speaks to the maintainer\n',
    'docs/notes.md': 'his yes, G1\n',
    'tools/export/rules.mjs': "const m = 'the hub';\n",
  });
  try {
    assert.deepEqual(gateMarkers(root), [
      'catalog/skills/a/SKILL.md:2 studio marker "hard rule"',
      'catalog/skills/a/SKILL.md:3 studio marker "the hub"',
      'catalog/skills/a/SKILL.md:3 studio marker "G6"',
      'catalog/skills/a/scripts/run.py:1 studio marker "this machine"',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('studio markers: an allowed phrase passes only in its own file, and only on its line', () => {
  const allow = [{ file: 'catalog/packs/p/skills/law.md', phrase: 'guideline G6', why: 'a regulator guideline number' }];
  const root = kit({
    'catalog/packs/p/skills/law.md': 'Read guideline G6 first.\nThen G6 again.\n',
    'catalog/packs/p/skills/other.md': 'Read guideline G6 first.\n',
  });
  try {
    assert.deepEqual(gateMarkers(root, allow), ['catalog/packs/p/skills/law.md:2 studio marker "G6"', 'catalog/packs/p/skills/other.md:1 studio marker "G6"']);
    assert.ok(Array.isArray(MARKERS_ALLOW) && MARKERS_ALLOW.every((a) => a.file && a.phrase && a.why), 'MARKERS_ALLOW entries are { file, phrase, why }');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('risky: an allowed phrase passes only in its own file, and only on its line', () => {
  const allow = [{ file: 'catalog/skills/x/SKILL.md', phrase: 'Never write', why: 'a warning against the pattern' }];
  const root = kit({
    'catalog/skills/x/SKILL.md': `Never write \`image: app:${LATEST}\`.\nimage: app:${LATEST}\n`,
    'catalog/skills/y/SKILL.md': `Never write \`image: app:${LATEST}\`.\n`,
  });
  try {
    assert.deepEqual(gateRisky(root, allow), ['catalog/skills/x/SKILL.md:2 image with :latest', 'catalog/skills/y/SKILL.md:1 image with :latest']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('risky: an image with neither a tag nor a digest, in a Dockerfile, a YAML file or a fenced block', () => {
  const fence = '```';
  const root = kit({
    'catalog/packs/p/templates/Dockerfile.python.template': [
      'FROM python:3.12-slim AS builder', 'FROM builder', 'FROM scratch', 'FROM gcr.io/distroless/python3-debian12',
      'FROM --platform=linux/amd64 alpine', 'FROM ghcr.io/acme/app@sha256:' + 'ab'.repeat(32), 'FROM localhost:5000/app',
      'FROM ${BASE_IMAGE}', 'from node AS web', '',
    ].join('\n'),
    'catalog/packs/p/templates/docker-compose.yml': [
      'services:', '  db:', '    image: postgres', '  cache:', '    image: redis:7-alpine', '  app:', '    image: shopapi:${APP_VERSION}',
      '  - image: "nginx"', '  web:', '    image:', '      repository: nginx', '',
    ].join('\n'),
    'catalog/packs/p/skills/docker.md': [
      'FROM there, the image: a picture.', `${fence}dockerfile`, 'FROM node:22-slim AS build', 'FROM node', `${fence}`,
      `${fence}yaml`, 'image: busybox', `${fence}`, `${fence}`, 'FROM ubuntu', 'image: ubuntu', `${fence}`, '',
    ].join('\n'),
    'catalog/packs/p/skills/page.ts': "  image: '/images/hero.webp',\nFROM users\n",
  });
  try {
    assert.deepEqual(gateRisky(root, []), [
      'catalog/packs/p/skills/docker.md:4 image without a tag or digest',
      'catalog/packs/p/skills/docker.md:7 image without a tag or digest',
      'catalog/packs/p/templates/Dockerfile.python.template:4 image without a tag or digest',
      'catalog/packs/p/templates/Dockerfile.python.template:5 image without a tag or digest',
      'catalog/packs/p/templates/Dockerfile.python.template:7 image without a tag or digest',
      'catalog/packs/p/templates/Dockerfile.python.template:9 image without a tag or digest',
      'catalog/packs/p/templates/docker-compose.yml:3 image without a tag or digest',
      'catalog/packs/p/templates/docker-compose.yml:8 image without a tag or digest',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('risky: Bash(*), Bash(), Write(*) and Write() are bare, and an allowed-tools block value is read', () => {
  const root = kit({
    'catalog/skills/a/SKILL.md': `---\nname: a\n${AT}: Bash(*) Read\n---\n`,
    'catalog/skills/b/SKILL.md': `---\nname: b\n${AT}: Read, Bash(), Write( * )\n---\n`,
    'catalog/skills/c/SKILL.md': `---\nname: c\n${AT}: Write() Write(**)\n---\n`,
    'catalog/skills/d/SKILL.md': `---\nname: d\n${AT}: >-\n  Read Grep\n  Bash Write(docs/**)\ndescription: Bash and Write in prose.\n---\n`,
    'catalog/skills/e/SKILL.md': `---\nname: e\n${AT}: |\n  Bash(git status:*) Read\n\n  Write\n---\n`,
  });
  try {
    assert.deepEqual(gateRisky(root, []), [
      'catalog/skills/a/SKILL.md:3 bare Bash in allowed-tools',
      'catalog/skills/b/SKILL.md:3 bare Bash in allowed-tools',
      'catalog/skills/b/SKILL.md:3 bare Write in allowed-tools',
      'catalog/skills/c/SKILL.md:3 bare Write in allowed-tools',
      'catalog/skills/d/SKILL.md:5 bare Bash in allowed-tools',
      'catalog/skills/e/SKILL.md:6 bare Write in allowed-tools',
    ]);
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

test('notes: a --note naming the block marker fails, since the changelog it lands in is shipped and gated', () => {
  assert.deepEqual(gateNotes(['Fine.', `Hub text in ${only.toUpperCase()} blocks is cut.`], []), [`--note 2: ${only} marker left in shipped text`]);
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

const NAMES = { studio: ['claude-md-curator', 'handoff', 'save-session', 'teach'], shipped: ['handoff', 'teach'] };
const FENCE3 = '`'.repeat(3);

test('names: a studio name the kit does not ship, in whole inline code or in [[brackets]], is found in catalog/ Markdown outside fences', () => {
  const root = kit({
    'catalog/skills/a/SKILL.md': [
      'Run `save-session` at the end.',
      'Then `handoff`, keep `handoff-notes.md` and `save-session-notes.md`, the `teacher` and `teach`.',
      'See [[claude-md-curator]], [[handoff]] and [[handoff|the handoff skill]].',
      'Use `` /save-session `` and [[outside-thing|a label]]; `[[claude-md-curator]]` is the syntax.',
      FENCE3, '`save-session` and [[claude-md-curator]] in a fence', FENCE3,
      '~~~md', '`save-session`', '~~~',
      '`save-session` after, and `save-session` twice.',
      `${FENCE3}save-session${FENCE3} is inline code, not a fence.`,
      '`save-session` still seen.',
    ].join('\r\n'),
    'catalog/skills/a/scripts/run.py': '# `save-session`\n',
    'cards/a.md': 'Run `save-session` and [[claude-md-curator]].\n',
  });
  try {
    assert.deepEqual(gateNames(root, NAMES), [
      'catalog/skills/a/SKILL.md:1 names save-session, which the kit does not ship',
      'catalog/skills/a/SKILL.md:3 names claude-md-curator, which the kit does not ship',
      'catalog/skills/a/SKILL.md:4 names save-session, which the kit does not ship',
      'catalog/skills/a/SKILL.md:4 names outside-thing, which the kit does not ship',
      'catalog/skills/a/SKILL.md:11 names save-session, which the kit does not ship',
      'catalog/skills/a/SKILL.md:12 names save-session, which the kit does not ship',
      'catalog/skills/a/SKILL.md:13 names save-session, which the kit does not ship',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('names: an allow entry passes only its own name in its own file', () => {
  const allow = [{ file: 'catalog/a.md', name: 'save-session', why: 'an outside tool of the same name' }];
  const root = kit({
    'catalog/a.md': 'Run `save-session`, then [[claude-md-curator]].\n',
    'catalog/b.md': 'Run `save-session`.\n',
  });
  try {
    assert.deepEqual(gateNames(root, NAMES, allow), [
      'catalog/a.md:1 names claude-md-curator, which the kit does not ship',
      'catalog/b.md:1 names save-session, which the kit does not ship',
    ]);
    assert.ok(Array.isArray(NAMES_ALLOW) && NAMES_ALLOW.every((a) => a.file && a.name && a.why), 'NAMES_ALLOW entries are { file, name, why }');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('names: a private studio name, in whole inline code or in [[brackets]], is found without printing it; an allow entry never passes it', () => {
  const names = { ...NAMES, private: ['quiet-job', 'quiet-pack'] };
  const allow = [{ file: 'catalog/a.md', name: 'quiet-job', why: 'never honoured for a private name' }];
  const root = kit({
    'catalog/a.md': [
      'Run `quiet-job`, or `` /quiet-job ``.',
      'See [[quiet-pack]], then [[quiet-pack|a label]] and [[save-session]].',
      'Keep `quiet-job-notes.md`, and quiet-job in prose.',
      FENCE3, '`quiet-job` and [[quiet-pack]]', FENCE3,
    ].join('\n'),
  });
  try {
    const found = gateNames(root, names, allow);
    assert.deepEqual(found, [
      'catalog/a.md:1 names a private studio item (on the private list, private.local.txt, or in a hub pack whose pack.json says public: false)',
      'catalog/a.md:2 names a private studio item (on the private list, private.local.txt, or in a hub pack whose pack.json says public: false)',
      'catalog/a.md:2 names save-session, which the kit does not ship',
    ]);
    assert.ok(!found.join('\n').includes('quiet'), 'a private name is never printed');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('json: a file that parses passes; node_modules and local-only files are not read', () => {
  const root = kit({
    'catalog/skills/a/config.json': '{\n  "say": "hi \\"there\\""\n}\n',
    'package.json': '{"name": "x"}\n',
    'node_modules/dep/package.json': '{ not json',
    'tools/export/rewrites.local.json': '{ not json',
  });
  try { assert.deepEqual(gateJson(root), []); } finally { rmSync(root, { recursive: true, force: true }); }
});

test('json: an unescaped quote fails with the parser message', () => {
  const root = kit({ 'catalog/skills/a/bad.json': '{"say": "hi "there""}\n', 'docs/ok.json': '[]\n' });
  try {
    const found = gateJson(root);
    assert.equal(found.length, 1, found.join('\n'));
    assert.match(found[0], /^catalog\/skills\/a\/bad\.json: not valid JSON \(.+\)$/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('json: a leading byte order mark fails, and the finding names it without printing it', () => {
  const root = kit({ 'catalog/features.json': '\uFEFF{"a": 1}\n' });
  try {
    const found = gateJson(root);
    assert.equal(found.length, 1, found.join('\n'));
    assert.match(found[0], /^catalog\/features\.json: not valid JSON \(.*U\+FEFF.*\)$/);
    assert.ok(!found[0].includes('\uFEFF'), 'the invisible character is never printed');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('shebangFiles: files under the given folders whose first two bytes are #!, sorted, relative with /', () => {
  const root = kit({
    'catalog/skills/b/scripts/run.sh': '#!/bin/sh\necho ok\n',
    'catalog/skills/a/scripts/tool': '#!/usr/bin/env node\n',
    'catalog/skills/a/scripts/lib.mjs': 'export const x = 1;\n',
    'catalog/skills/a/notes.md': ' #! not first\n',
    'catalog/skills/a/node_modules/dep/cli.js': '#!/usr/bin/env node\n',
    'catalog/.git/hooks/pre-commit': '#!/bin/sh\n',
    'templates/git-hooks/commit-msg': '#!/bin/sh\n',
    'docs/NOTICES.md': '#!not a dir, but listed\n',
    'tools/x.sh': '#!/bin/sh\n',
    'catalog/empty': '',
    'catalog/one': '#',
  });
  try {
    assert.deepEqual(shebangFiles(root, ['catalog', 'templates', 'docs/NOTICES.md', 'missing']), [
      'catalog/skills/a/scripts/tool',
      'catalog/skills/b/scripts/run.sh',
      'docs/NOTICES.md',
      'templates/git-hooks/commit-msg',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
