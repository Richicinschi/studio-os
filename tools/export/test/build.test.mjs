// tools/export/test/build.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { makeFixtureHub, FIXTURE_OWNER as owner } from './fixture-hub.mjs';
import { buildKit } from '../build.mjs';

const flags = (importance = 'recommended') => ({ importance, why: `Why ${importance}.` });
const manifest = { kit: 'studio-os', version: '2.0.0', items: [
  { id: 'alpha', kind: 'skill', status: 'shipped', pack: 'way-of-working', module: '01-continuity', suits: 'Everyone.', changes: 'Studio-specific steps marked.', ...flags() },
  { id: 'beta', kind: 'skill', status: 'shipped', pack: 'data-work', module: '09-data-work', suits: 'Data work.', changes: 'Adapted.', ...flags('optional') },
  { id: 'gamma', kind: 'agent', status: 'shipped', pack: 'way-of-working', module: '08-agents-and-council', ...flags('optional') },
  { id: 'tool', kind: 'external', status: 'link-only', pack: 'foundation', module: '05-skills', title: 'A scanner', upstream: 'https://example.invalid/tool', licence: 'MIT', install: 'see docs', loads: 'none', ...flags('core') },
] };

function setup() {
  const hub = makeFixtureHub();
  const out = mkdtempSync(path.join(os.tmpdir(), 'kit-out-'));
  return { hub, out, done: () => { rmSync(hub, { recursive: true, force: true }); rmSync(out, { recursive: true, force: true }); } };
}

test('shipped skills and agents are copied with paths and the owner rewritten', () => {
  const { hub, out, done } = setup();
  try {
    const r = buildKit({ hub, out, manifest, owner, scans: { alpha: { score: 0, recommendation: 'SAFE', version: '1.0', date: '2026-11-02' } } });
    const alpha = readFileSync(path.join(out, 'catalog/skills/alpha/SKILL.md'), 'utf8');
    assert.match(alpha, /Run <HUB>\\tools\\x\.mjs and ask the owner\./);
    assert.ok(existsSync(path.join(out, 'catalog/skills/alpha/references/notes.md')));
    assert.match(readFileSync(path.join(out, 'catalog/agents/gamma.md'), 'utf8'), /A seat\. Ask the owner\./);
    assert.ok(existsSync(path.join(out, 'catalog/skills/beta/LICENSE')));
    assert.ok(r.written.includes('catalog/skills/alpha/SOURCE.md'));
    assert.deepEqual(Object.keys(r.itemFiles).sort(), ['agent:gamma', 'skill:alpha', 'skill:beta']);
    assert.deepEqual(r.notices, [{ id: 'beta', upstream: 'https://github.com/someone/upstream-repo', licenceFile: 'LICENSE', licenceLine: 'Copyright (c) 2026 Someone' }]);
  } finally { done(); }
});

test('SOURCE.md, INDEX.md and the notices say where each item comes from', () => {
  const { hub, out, done } = setup();
  try {
    buildKit({ hub, out, manifest, owner, scans: { alpha: { score: 0, recommendation: 'SAFE', version: '1.0', date: '2026-11-02' } } });
    const a =readFileSync(path.join(out, 'catalog/skills/alpha/SOURCE.md'), 'utf8');
    assert.match(a, /- \*\*Origin:\*\* Written in the studio's own words\. The kit counts it as the studio's own only because its folder holds no licence file, and its author line names no outside author and does not say "adapted by"\.\n/);
    assert.doesNotMatch(a, /Studio-original|not adapted from an outside skill/);
    assert.match(a, /SAFE \(risk 0\/100\)/);
    const b = readFileSync(path.join(out, 'catalog/skills/beta/SOURCE.md'), 'utf8');
    assert.match(b, /Third-party, adapted by the studio\. Upstream: https:\/\/github\.com\/someone\/upstream-repo/);
    assert.match(b, /not scanned yet/);
    const index = readFileSync(path.join(out, 'catalog/INDEX.md'), 'utf8');
    assert.match(index, /\| alpha \| skill \| way-of-working \| 01-continuity \| shipped \| \[skills\/alpha\]\(skills\/alpha\/SOURCE\.md\) \|/);
    assert.match(index, /\| tool \| external \| foundation \| 05-skills \| link-only \| \[upstream\]\(https:\/\/example\.invalid\/tool\) \|/);
    assert.match(readFileSync(path.join(out, 'docs/THIRD_PARTY_NOTICES.md'), 'utf8'), /\| beta \| https:\/\/github\.com\/someone\/upstream-repo \| Copyright \(c\) 2026 Someone \|/);
  } finally { done(); }
});

test('a scan that is not SAFE is shown with its findings, the triage result and a link to the triage', () => {
  const { hub, out, done } = setup();
  try {
    const scans = {
      alpha: { score: 100, recommendation: 'DO_NOT_INSTALL', version: 'v2.2.3', date: '2026-11-09' },
      beta: { score: 25, recommendation: 'CAUTION', version: 'v2.2.3', date: '2026-11-09' },
    };
    const triage = {
      alpha: { recommendation: 'DO_NOT_INSTALL', score: 100, findings: 12, fp: 7, byDesign: 5, other: 0, anchor: 'alpha-do_not_install-100100-12-findings' },
      beta: { recommendation: 'CAUTION', score: 25, findings: 1, fp: 1, byDesign: 0, other: 0, anchor: 'beta-caution-25100-1-finding' },
    };
    const r = buildKit({ hub, out, manifest, owner, scans, triage });
    const a = readFileSync(path.join(out, 'catalog/skills/alpha/SOURCE.md'), 'utf8');
    assert.match(a, /- \*\*Last scan:\*\* DO_NOT_INSTALL \(risk 100\/100\), SkillSpector v2\.2\.3 with --no-llm, 2026-11-09; 12 findings, all read: 7 false positives, 5 by design \(\[triage\]\(\.\.\/\.\.\/\.\.\/tools\/export\/scan-triage\.md#alpha-do_not_install-100100-12-findings\)\)\n/);
    const b = readFileSync(path.join(out, 'catalog/skills/beta/SOURCE.md'), 'utf8');
    assert.match(b, /2026-11-09; 1 finding, read: 1 false positive \(\[triage\]\(\.\.\/\.\.\/\.\.\/tools\/export\/scan-triage\.md#beta-caution-25100-1-finding\)\)\n/);
    assert.deepEqual(r.scanKeys.sort(), ['alpha', 'beta']);
  } finally { done(); }
});

test('a SAFE scan carries no triage, and a scan with no triage section says so', () => {
  const { hub, out, done } = setup();
  try {
    buildKit({ hub, out, manifest, owner, scans: {
      alpha: { score: 5, recommendation: 'SAFE', version: 'v2.2.3', date: '2026-11-09' },
      beta: { score: 60, recommendation: 'DO_NOT_INSTALL', version: 'v2.2.3', date: '2026-11-09' },
    } });
    assert.match(readFileSync(path.join(out, 'catalog/skills/alpha/SOURCE.md'), 'utf8'), /SAFE \(risk 5\/100\), SkillSpector v2\.2\.3 with --no-llm, 2026-11-09\n/);
    assert.match(readFileSync(path.join(out, 'catalog/skills/beta/SOURCE.md'), 'utf8'), /2026-11-09; not triaged yet\n/);
  } finally { done(); }
});

test('an unclassified hub skill stops the build', () => {
  const { hub, out, done } = setup();
  try {
    const partial = { ...manifest, items: manifest.items.filter((i) => i.id !== 'beta') };
    assert.throws(() => buildKit({ hub, out, manifest: partial }), /unclassified hub items.*skill:beta/);
  } finally { done(); }
});

test('text is found by content, whatever the extension; licence files and binaries are copied byte for byte', () => {
  const { hub, out, done } = setup();
  try {
    const hubPath = ['E:', 'AppDev'].join('\\');
    const alphaDir = path.join(hub, '.claude/skills/alpha');
    mkdirSync(path.join(alphaDir, 'templates'), { recursive: true });
    writeFileSync(path.join(alphaDir, 'templates/main.py.template'), `# see ${hubPath}\\x, ask ${owner}\n`);
    writeFileSync(path.join(alphaDir, 'logo.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]));
    writeFileSync(path.join(hub, '.claude/skills/beta/LICENSE'), `MIT License\n\nCopyright (c) 2026 Someone\nPortions by ${owner}\n`);
    buildKit({ hub, out, manifest, owner });
    assert.equal(readFileSync(path.join(out, 'catalog/skills/alpha/templates/main.py.template'), 'utf8'), '# see <HUB>\\x, ask the owner\n');
    assert.deepEqual([...readFileSync(path.join(out, 'catalog/skills/alpha/logo.png'))], [0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]);
    assert.match(readFileSync(path.join(out, 'catalog/skills/beta/LICENSE'), 'utf8'), new RegExp(`Portions by ${owner}`));
  } finally { done(); }
});

test('features.json carries importance, why, loads and the token estimates per module', () => {
  const { hub, out, done } = setup();
  try {
    const sdir = path.join(hub, '.claude/skills/delta');
    mkdirSync(sdir, { recursive: true });
    writeFileSync(path.join(sdir, 'SKILL.md'), `---\nname: delta\ndescription: ${'d'.repeat(400)}\n---\n${'b'.repeat(800)}`);
    mkdirSync(path.join(out, 'templates/big'), { recursive: true });
    writeFileSync(path.join(out, 'templates/big/FRONT.md'), 'f'.repeat(4400));
    writeFileSync(path.join(out, 'templates/hook.mjs'), 'h'.repeat(2000));
    mkdirSync(path.join(out, 'modules/01-continuity'), { recursive: true });
    writeFileSync(path.join(out, 'modules/01-continuity/README.md'), '---\ntitle: Continuity\n---\n# Continuity\n');
    mkdirSync(path.join(out, 'modules/02-context-and-models'), { recursive: true });
    writeFileSync(path.join(out, 'modules/02-context-and-models/README.md'), '---\ntitle: Context and models\n---\n# Context\n');
    const m = { ...manifest, items: [...manifest.items,
      { id: 'delta', kind: 'skill', status: 'shipped', pack: 'way-of-working', module: '01-continuity', ...flags('optional') },
      { id: 'front-door', kind: 'practice', status: 'shipped', pack: 'way-of-working', module: '01-continuity', title: 'The front door', loads: 'every-session', files: ['templates/big'], ...flags() },
      { id: 'hooks', kind: 'practice', status: 'shipped', pack: 'way-of-working', module: '01-continuity', title: 'Git hooks', loads: 'none', files: ['templates/hook.mjs'], ...flags() },
    ], later: [{ id: 'graph', title: 'The wiki graph', why: 'A generator and upkeep after every session.' }] };
    buildKit({ hub, out, manifest: m, owner });
    const f = JSON.parse(readFileSync(path.join(out, 'catalog/features.json'), 'utf8'));
    assert.equal(f.kit, 'studio-os');
    assert.equal(f.version, '2.0.0');
    assert.equal(f.heavyTokens, 1000);
    const mod = (id) => f.modules.find((x) => x.id === id);
    assert.equal(mod('01-continuity').title, 'Continuity');
    assert.deepEqual(mod('02-context-and-models').items, []);
    const item = (id) => f.modules.flatMap((x) => x.items).find((x) => x.id === id);
    assert.deepEqual(
      { ...item('delta') },
      { id: 'delta', kind: 'skill', importance: 'optional', why: 'Why optional.', loads: 'every-session', everySessionTokens: 100, onDemandTokens: 200, heavy: false, card: 'cards/delta.md' });
    assert.equal(item('front-door').everySessionTokens, 1100);
    assert.equal(item('front-door').heavy, true);
    assert.equal(item('hooks').everySessionTokens, 0);
    assert.equal(item('hooks').onDemandTokens, 0);
    assert.equal(item('tool').everySessionTokens, 0);
    assert.equal(item('gamma').loads, 'every-session');
    assert.deepEqual(f.modules.map((x) => x.id), ['01-continuity', '02-context-and-models', '05-skills', '08-agents-and-council', '09-data-work']);
    assert.deepEqual(mod('01-continuity').items.map((x) => x.id), ['alpha', 'front-door', 'hooks', 'delta']);
    assert.deepEqual(f.later, [{ id: 'graph', title: 'The wiki graph', why: 'A generator and upkeep after every session.' }]);
  } finally { done(); }
});

test('FEATURES.md shows each module as a table with its every-session total, then what is not in this version', () => {
  const { hub, out, done } = setup();
  try {
    mkdirSync(path.join(out, 'templates'), { recursive: true });
    writeFileSync(path.join(out, 'templates/FRONT.md'), 'f'.repeat(4400));
    const m = { ...manifest, items: [...manifest.items,
      { id: 'front-door', kind: 'practice', status: 'shipped', pack: 'way-of-working', module: '01-continuity', title: 'The front door', loads: 'every-session', files: ['templates/FRONT.md'], ...flags() },
    ], later: [{ id: 'graph', title: 'The wiki graph', why: 'A generator and upkeep after every session.' }] };
    buildKit({ hub, out, manifest: m, owner });
    const md = readFileSync(path.join(out, 'catalog/FEATURES.md'), 'utf8');
    assert.match(md, /estimate/i);
    assert.match(md, /drill-to-adopt.*vet-and-adopt.*setup-workspace|kit-only/s);
    assert.match(md, /\| Item \| What it is \| Importance \| Why \| Loads \| Tokens every session \|/);
    assert.match(md, /\| front-door \| practice: The front door \| recommended \| Why recommended\. \| every session \| 1,100 \(heavy\) \|/);
    assert.match(md, /\| tool \| outside tool: A scanner \| core \| Why core\. \| none \| 0 \|/);
    assert.match(md, /Every session for this module: about 1,1\d\d tokens/);
    assert.match(md, /## Not in this version[\s\S]*The wiki graph/);
    assert.match(md, /catalog\/INDEX\.md/);
  } finally { done(); }
});

test('a per-profile importance is carried into features.json as it is, and FEATURES.md shows each profile', () => {
  const { hub, out, done } = setup();
  try {
    const importance = { default: 'optional', software: 'recommended', ml: 'recommended' };
    const why = { default: 'Why in general.', ml: 'Why for ml.' };
    const m = { ...manifest, items: manifest.items.map((it) => (it.id === 'alpha' ? { ...it, importance, why } : it)) };
    buildKit({ hub, out, manifest: m, owner });
    const f = JSON.parse(readFileSync(path.join(out, 'catalog/features.json'), 'utf8'));
    const alpha = f.modules.flatMap((x) => x.items).find((x) => x.id === 'alpha');
    assert.deepEqual(alpha.importance, importance);
    assert.deepEqual(alpha.why, why);
    const md = readFileSync(path.join(out, 'catalog/FEATURES.md'), 'utf8');
    assert.match(md, /\| alpha \| skill \| optional; recommended for software, ml \| Why in general\. For ml: Why for ml\. \|/);
  } finally { done(); }
});

test('a skill folded from two upstreams names both in SOURCE.md and in the notices', () => {
  const { hub, out, done } = setup();
  try {
    writeFileSync(path.join(hub, '.claude/skills/beta/SKILL.md'), '---\nname: beta\ndescription: Use when beta.\nmetadata:\n  author: Richicinschi (adapted by Claude from someone/upstream-repo and other/second-repo)\n  sources:\n    - someone/upstream-repo · skills/beta (MIT)\n    - other/second-repo · skills/folded (MIT) — folded in\n---\n# beta\n');
    writeFileSync(path.join(hub, '.claude/skills/beta/LICENSE'), 'MIT License\n\nCopyright (c) 2026 Someone\nCopyright (c) 2025 Other\n');
    const r = buildKit({ hub, out, manifest, owner });
    assert.equal(r.notices[0].licenceLine, 'Copyright (c) 2026 Someone; Copyright (c) 2025 Other');
    const src = readFileSync(path.join(out, 'catalog/skills/beta/SOURCE.md'), 'utf8');
    assert.match(src, /Upstream: https:\/\/github\.com\/someone\/upstream-repo and https:\/\/github\.com\/other\/second-repo\./);
    assert.equal(r.notices[0].upstream, 'https://github.com/someone/upstream-repo, https://github.com/other/second-repo');
  } finally { done(); }
});

test('the studio rewrite list replaces studio pointers in shipped markdown, by exact phrase or section pattern', () => {
  const { hub, out, done } = setup();
  try {
    writeFileSync(path.join(hub, '.claude/skills/alpha/SKILL.md'),
      '---\nname: alpha\ndescription: Use when alpha.\n---\n# alpha\n\nRecord it in zorblat/ledgers/yes.md first, then in `zorblat/ledgers/yes.md` again.\n\n## Importers\n\nRun scripts/gone.py.\n\n## Next\n\nKept.\n');
    const rewrites = [
      { file: '*', phrase: 'zorblat/ledgers/yes.md', replacement: 'your grants ledger', why: 'a studio path' },
      { file: 'catalog/skills/alpha/SKILL.md', pattern: '## Importers[\\s\\S]*?(?=\\n## )', replacement: '## Importers\n\nNot in this copy.\n', why: 'a script it does not ship' },
    ];
    buildKit({ hub, out, manifest, owner, rewrites });
    const text = readFileSync(path.join(out, 'catalog/skills/alpha/SKILL.md'), 'utf8');
    assert.match(text, /Record it in your grants ledger first, then in your grants ledger again\./);
    assert.match(text, /## Importers\n\nNot in this copy\.\n\n## Next\n\nKept\./);
    assert.doesNotMatch(text, /gone\.py|zorblat\/ledgers/);
  } finally { done(); }
});

test('a studio rewrite entry that no longer matches stops the build, so the list stays true', () => {
  const { hub, out, done } = setup();
  try {
    const rewrites = [{ file: 'catalog/skills/alpha/SKILL.md', phrase: 'no such phrase', replacement: 'x', why: 'stale' }];
    assert.throws(() => buildKit({ hub, out, manifest, owner, rewrites }), /studio rewrite entries that no longer match.*no such phrase/s);
  } finally { done(); }
});

test('a local rewrite entry must remove its term from its file, and is reported by number, never by its text', () => {
  const { hub, out, done } = setup();
  try {
    writeFileSync(path.join(hub, '.claude/skills/alpha/SKILL.md'), '---\nname: alpha\ndescription: Use when alpha.\n---\n# alpha\n\nDiagram the Vexmoor app. Later, the Vexmoor app again, and vexmoor alone.\n');
    const entry = { file: 'catalog/skills/alpha/SKILL.md', phrase: 'the Vexmoor app', replacement: 'this app', why: 'a product', gone: 'vexmoor', localIndex: 1 };
    assert.throws(() => buildKit({ hub, out, manifest, owner, rewrites: [entry] }), (e) => /left their term behind/.test(e.message) && /rewrites\.local\.json entry 1: its term is still in catalog\/skills\/alpha\/SKILL\.md/.test(e.message) && !/Vexmoor/i.test(e.message));
    writeFileSync(path.join(hub, '.claude/skills/alpha/SKILL.md'), '---\nname: alpha\ndescription: Use when alpha.\n---\n# alpha\n\nDiagram the Vexmoor app.\n');
    buildKit({ hub, out, manifest, owner, rewrites: [entry] });
    assert.match(readFileSync(path.join(out, 'catalog/skills/alpha/SKILL.md'), 'utf8'), /Diagram this app\./);
    const stale = { ...entry, phrase: 'the Quenlin tool', gone: 'quenlin' };
    assert.throws(() => buildKit({ hub, out, manifest, owner, rewrites: [stale] }), (e) => /rewrites\.local\.json entry 1/.test(e.message) && !/Quenlin/.test(e.message));
  } finally { done(); }
});

test('a practice whose files are not what loads states its own estimate', () => {
  const { hub, out, done } = setup();
  try {
    mkdirSync(path.join(out, 'templates'), { recursive: true });
    writeFileSync(path.join(out, 'templates/hook.mjs'), 'h'.repeat(8000));
    const m = { ...manifest, items: [...manifest.items,
      { id: 'status', kind: 'practice', status: 'shipped', pack: 'way-of-working', module: '01-continuity', title: 'A start hook', loads: 'every-session', everySessionTokens: 200, files: ['templates/hook.mjs'], ...flags() }] };
    buildKit({ hub, out, manifest: m, owner });
    const f = JSON.parse(readFileSync(path.join(out, 'catalog/features.json'), 'utf8'));
    const it = f.modules.flatMap((x) => x.items).find((x) => x.id === 'status');
    assert.equal(it.everySessionTokens, 200);
    assert.equal(it.heavy, false);
  } finally { done(); }
});

test('a practice whose file is not in the kit stops the build', () => {
  const { hub, out, done } = setup();
  try {
    const m = { ...manifest, items: [...manifest.items,
      { id: 'ghost', kind: 'practice', status: 'shipped', pack: 'way-of-working', module: '01-continuity', title: 'Ghost', loads: 'none', files: ['templates/nope.md'], ...flags() }] };
    assert.throws(() => buildKit({ hub, out, manifest: m, owner }), /practice:ghost.*templates\/nope\.md/);
  } finally { done(); }
});

test('a rebuild removes catalog files no longer produced', () => {
  const { hub, out, done } = setup();
  try {
    mkdirSync(path.join(out, 'catalog/skills/old'), { recursive: true });
    writeFileSync(path.join(out, 'catalog/skills/old/SKILL.md'), 'stale');
    buildKit({ hub, out, manifest });
    assert.equal(existsSync(path.join(out, 'catalog/skills/old')), false);
  } finally { done(); }
});

test('outside data named in a NOTICE file inside a skill is listed in the third-party notices', () => {
  const { hub, out, done } = setup();
  try {
    mkdirSync(path.join(hub, '.claude/skills/alpha/data'), { recursive: true });
    writeFileSync(path.join(hub, '.claude/skills/alpha/data/INDEX-NOTICE.md'), '# Where the index comes from\n\nIt is published at <https://example.invalid/data-project> and released under the Apache License 2.0, which applies to this data.\n');
    const r = buildKit({ hub, out, manifest, owner });
    const e = r.notices.find((n) => n.id === 'alpha');
    assert.deepEqual(e, { id: 'alpha', upstream: 'https://example.invalid/data-project', licenceFile: 'data/INDEX-NOTICE.md', licenceLine: 'Apache License 2.0 (data; see the notice file)' });
    assert.match(readFileSync(path.join(out, 'docs/THIRD_PARTY_NOTICES.md'), 'utf8'), /\| alpha \| https:\/\/example\.invalid\/data-project \| Apache License 2\.0 \(data/);
  } finally { done(); }
});
