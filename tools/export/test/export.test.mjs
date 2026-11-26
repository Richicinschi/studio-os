// tools/export/test/export.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { makeFixtureHub, makePackHub, FIXTURE_OWNER, cardText } from './fixture-hub.mjs';
import { CHANGELOG_HEAD } from '../changelog.mjs';
import { runExport } from '../export.mjs';
import { scanItemHashes } from '../scan.mjs';

const flags = { importance: 'optional', why: 'Fixes a problem some adopters have.' };
const manifest = { kit: 'studio-os', version: '2.0.0', items: [
  { id: 'alpha', kind: 'skill', status: 'shipped', pack: 'way-of-working', module: '01-continuity', ...flags },
  { id: 'beta', kind: 'skill', status: 'shipped', pack: 'data-work', module: '09-data-work', ...flags },
  { id: 'gamma', kind: 'agent', status: 'shipped', pack: 'way-of-working', module: '08-agents-and-council', ...flags },
  { id: 'tool', kind: 'external', status: 'link-only', pack: 'foundation', module: '05-skills', upstream: 'https://example.invalid/tool', licence: 'MIT', install: 'see docs', loads: 'none', ...flags },
] };

// A fresh kit as a maintainer has it before the first release: entry files, the changelog header, and
// the two local files (deny list position 2 is an invented private term). The kit is a git work tree, as
// a maintainer's checkout is, unless git is false.
function setup({ git = true } = {}) {
  const hub = makeFixtureHub();
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-root-'));
  if (git) execFileSync('git', ['-C', root, 'init', '-q'], { stdio: 'ignore' });
  const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
  w('export.manifest.json', JSON.stringify(manifest));
  w('README.md', '# Kit\n');
  w('LICENSE', 'MIT License\n');
  w('START-HERE.md', '# Start here\n\n### Windows\nx\n\n### macOS\nx\n\n### Linux\nx\n');
  w('ADOPT.md', '# Adopt\n');
  w('CHANGELOG.md', CHANGELOG_HEAD);
  w('tools/export/privacy.local.txt', `# test terms\n${FIXTURE_OWNER}\nQuenlin\n`);
  w('tools/export/owner.local.txt', `${FIXTURE_OWNER}\n`);
  w('tools/export/private.local.txt', '# nothing private in the fixture\n');
  w('tools/export/rewrites.local.json', '[]\n');
  // A release ships only scanned items, each scanned with the version scanner.json pins (an invented commit).
  w('tools/export/scanner.json', JSON.stringify({ version: 'v2.2.3', tag: 'v2.2.3', commit: 'c3'.repeat(20), python: '3.13', install: 'uv tool install --python 3.13 git+https://github.com/NVIDIA/skillspector.git@' + 'c3'.repeat(20) }));
  const safe = { score: 0, recommendation: 'SAFE', findings: [], version: 'v2.2.3', date: '2026-11-02' };
  w('tools/export/scans.json', JSON.stringify({ alpha: safe, beta: safe, 'agent:gamma': safe }));
  for (const it of manifest.items) w(`cards/${it.id}.md`, cardText(it.id, it.module));
  const lines = [];
  const run = (o = {}) => runExport({ root, hub, noGitleaks: true, today: '2026-11-02', log: (l) => lines.push(String(l)), rewrites: [], ...o });
  // As a maintainer does before a release: a dry run writes the catalog, then each item is scanned, which
  // records the hash of the content the scan read.
  const scanned = () => {
    run();
    const hashes = scanItemHashes(root);
    const scans = JSON.parse(readFileSync(path.join(root, 'tools/export/scans.json'), 'utf8'));
    for (const [key, rec] of Object.entries(scans)) if (hashes[key]) rec.itemHash = hashes[key];
    w('tools/export/scans.json', JSON.stringify(scans));
    lines.length = 0;
  };
  return { hub, root, w, lines, run, scanned, done: () => { rmSync(hub, { recursive: true, force: true }); rmSync(root, { recursive: true, force: true }); } };
}
const clean = (h, args) => (args[0] === 'status' ? '' : 'abc123');

test('a clean dry run builds the catalog into the kit', () => {
  const s = setup();
  try {
    assert.equal(s.run(), 0, s.lines.join('\n'));
    const alpha = readFileSync(path.join(s.root, 'catalog/skills/alpha/SKILL.md'), 'utf8');
    assert.match(alpha, /ask the owner\./);
    assert.ok(existsSync(path.join(s.root, 'docs/THIRD_PARTY_NOTICES.md')));
  } finally { s.done(); }
});

test('the export refuses to start without any one of its four local files, and builds nothing', () => {
  for (const f of ['privacy.local.txt', 'owner.local.txt', 'private.local.txt', 'rewrites.local.json']) {
    const s = setup();
    try {
      rmSync(path.join(s.root, 'tools/export', f));
      assert.equal(s.run(), 2, `${f}: ${s.lines.join('\n')}`);
      assert.match(s.lines.join('\n'), /missing: .*never commit it/, f);
      assert.equal(existsSync(path.join(s.root, 'catalog')), false, f);
    } finally { s.done(); }
  }
});

test('local rewrites from the gitignored file apply in the build and never enter the kit', () => {
  const s = setup();
  try {
    s.w('tools/export/rewrites.local.json', JSON.stringify([{ file: 'catalog/skills/alpha/SKILL.md', phrase: 'and ask', replacement: 'and then ask', why: 'a test', gone: 'and ask' }]));
    assert.equal(s.run(), 0, s.lines.join('\n'));
    assert.match(readFileSync(path.join(s.root, 'catalog/skills/alpha/SKILL.md'), 'utf8'), /and then ask the owner\./);
    s.w('tools/export/rewrites.local.json', '[{"file": "catalog/skills/alpha/SKILL.md"}]');
    assert.equal(s.run(), 2);
    assert.match(s.lines.join('\n'), /local rewrites need file, phrase or pattern, replacement, why and gone: entry 1/);
  } finally { s.done(); }
});

test('a menu item without its adoption card fails the export, and so does a card for no menu item', () => {
  const s = setup();
  try {
    rmSync(path.join(s.root, 'cards/beta.md'));
    s.w('cards/old.md', cardText('old', '01-continuity'));
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /cards: FAIL \(2\)/);
    assert.match(out, /cards\/beta\.md: missing, the adoption card for skill:beta/);
    assert.match(out, /cards\/old\.md: a card for no menu item/);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('a shipped skill with a risky pattern fails the export at the risky gate', () => {
  const s = setup();
  try {
    const at = ['allowed', 'tools'].join('-');
    writeFileSync(path.join(s.hub, '.claude/skills/beta/SKILL.md'), `---\nname: beta\ndescription: Use when beta.\n${at}: Bash Read\n---\n# beta\n`);
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /risky: FAIL \(1\)/);
    assert.match(out, /catalog\/skills\/beta\/SKILL\.md:\d+ bare Bash in allowed-tools/);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('a block marker the build does not cut fails the export at the studioBlocks gate', () => {
  const s = setup();
  try {
    const only = ['studio', 'only'].join('-');
    mkdirSync(path.join(s.hub, '.claude/skills/beta/scripts'), { recursive: true });
    writeFileSync(path.join(s.hub, '.claude/skills/beta/scripts/run.sh'), `#!/bin/sh\n# <!-- ${only} -->\necho hi\n`);
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /studioBlocks: FAIL \(1\)/);
    assert.ok(out.includes(`catalog/skills/beta/scripts/run.sh:2 ${only} marker left in shipped text`), out);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('a studio marker in shipped catalog text fails the export at the markers gate', () => {
  const s = setup();
  try {
    writeFileSync(path.join(s.hub, '.claude/skills/beta/SKILL.md'), '---\nname: beta\ndescription: Use when beta.\n---\n# beta\nAsk the hub first.\n');
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /markers: FAIL \(1\)/);
    assert.match(out, /catalog\/skills\/beta\/SKILL\.md:\d+ studio marker "the hub"/);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('a shipped JSON file that does not parse fails the export at the json gate', () => {
  const s = setup();
  try {
    writeFileSync(path.join(s.hub, '.claude/skills/beta/config.json'), '{"say": "hi "there""}\n');
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /json: FAIL \(1\)/);
    assert.match(out, /catalog\/skills\/beta\/config\.json: not valid JSON \(.+\)/);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

const addScript = (s) => {
  mkdirSync(path.join(s.hub, '.claude/skills/beta/scripts'), { recursive: true });
  writeFileSync(path.join(s.hub, '.claude/skills/beta/scripts/run.sh'), '#!/bin/sh\necho hi\n');
};
const gitIn = (dir, args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

test('in a kit that is not a git work tree, the export says the scripts were not marked executable and exits non-zero', () => {
  const s = setup({ git: false });
  try {
    addScript(s);
    assert.equal(s.run(), 1, s.lines.join('\n'));
    assert.ok(existsSync(path.join(s.root, 'catalog/skills/beta/scripts/run.sh')));
    assert.match(s.lines.join('\n'), /export: the catalog was copied, but .* is not a git work tree: 1 script\(s\) were not marked executable/);
    assert.doesNotMatch(s.lines.join('\n'), /modes: .* marked executable in the git index/);
  } finally { s.done(); }
});

test('in a kit that is not a git work tree, a release says so, exits non-zero and writes no release files', () => {
  const s = setup({ git: false });
  try {
    s.scanned();
    const before = readFileSync(path.join(s.root, 'CHANGELOG.md'), 'utf8');
    assert.equal(s.run({ release: '2.0.0', notes: ['x'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 1, s.lines.join('\n'));
    assert.match(s.lines.join('\n'), /is not a git work tree: 0 script\(s\) were not marked executable, and the release files were not written/);
    assert.equal(readFileSync(path.join(s.root, 'CHANGELOG.md'), 'utf8'), before);
    assert.equal(existsSync(path.join(s.root, 'tools/export/state.json')), false);
  } finally { s.done(); }
});

test('in a git work tree, the export records every shipped script as 100755 in the index', () => {
  const s = setup();
  try {
    addScript(s);
    gitIn(s.root, ['init', '-q']);
    assert.equal(s.run(), 0, s.lines.join('\n'));
    assert.match(gitIn(s.root, ['ls-files', '-s', '--', 'catalog/skills/beta/scripts/run.sh']), /^100755 /);
    assert.match(s.lines.join('\n'), /modes: 1 script\(s\) marked executable in the git index/);
  } finally { s.done(); }
});

test('when git cannot mark the scripts executable, the export says so and exits non-zero', () => {
  const s = setup();
  try {
    addScript(s);
    const calls = [];
    const kitGit = (dir, args) => {
      calls.push(args);
      if (args[0] === 'rev-parse') return 'true';
      throw new Error('index.lock exists');
    };
    assert.equal(s.run({ kitGit }), 1);
    assert.match(s.lines.join('\n'), /export: the catalog was copied, but git could not mark 1 script\(s\) executable: index\.lock exists/);
    assert.deepEqual(calls[1], ['add', '--chmod=+x', '--', 'catalog/skills/beta/scripts/run.sh']);
  } finally { s.done(); }
});

test('a name the kit does not ship fails the export at the names gate; shipped names and the kit\'s own skills pass', () => {
  const s = setup();
  try {
    s.w('.claude/skills/vet-and-adopt/SKILL.md', '---\nname: vet-and-adopt\ndescription: x\n---\n');
    writeFileSync(path.join(s.hub, '.claude/skills/beta/SKILL.md'), '---\nname: beta\ndescription: Use when beta.\n---\n# beta\nRun `gamma`, then [[vet-and-adopt]].\nSee [[no-such-skill]].\n');
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /names: FAIL \(1\)/);
    assert.match(out, /catalog\/skills\/beta\/SKILL\.md:\d+ names no-such-skill, which the kit does not ship/);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('a hidden pack\'s skill named in shipped text fails the names gate, and the log never prints it', () => {
  const s = setup();
  try {
    const hidden = path.join(s.hub, 'library/hush-pack');
    mkdirSync(hidden, { recursive: true });
    writeFileSync(path.join(hidden, 'pack.json'), JSON.stringify({ id: 'hush-pack', public: false, title: 'x', description: 'x', skills: [{ id: 'hush-job' }] }));
    writeFileSync(path.join(s.hub, '.claude/skills/beta/SKILL.md'), '---\nname: beta\ndescription: Use when beta.\n---\n# beta\nRun `hush-job` first.\n');
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /names: FAIL \(1\)/);
    assert.match(out, /catalog\/skills\/beta\/SKILL\.md:\d+ names a private studio item \(on the private list, private\.local\.txt, or in a hub pack whose pack\.json says public: false\)/);
    assert.ok(!out.includes('hush-job'), out);
  } finally { s.done(); }
});

test('a hub item whose name must never ship is classified private from the local file, not the manifest', () => {
  const s = setup();
  try {
    const id = `${FIXTURE_OWNER.toLowerCase()}-voice`;
    mkdirSync(path.join(s.hub, '.claude/skills', id), { recursive: true });
    writeFileSync(path.join(s.hub, '.claude/skills', id, 'SKILL.md'), `---\nname: ${id}\ndescription: Private.\n---\n`);
    assert.equal(s.run(), 1);
    assert.match(s.lines.join('\n'), new RegExp(`unclassified hub items.*skill:${id}`));
    s.lines.length = 0;
    s.w('tools/export/private.local.txt', `# hub items never exported, one kind:id per line\nskill:${id}\n`);
    assert.equal(s.run(), 0, s.lines.join('\n'));
    assert.equal(readFileSync(path.join(s.root, 'export.manifest.json'), 'utf8').includes(id), false);
    assert.equal(existsSync(path.join(s.root, 'catalog/skills', id)), false);
    assert.equal(readFileSync(path.join(s.root, 'catalog/INDEX.md'), 'utf8').includes(id), false);
  } finally { s.done(); }
});

test('the export writes the feature menu into the catalog', () => {
  const s = setup();
  try {
    assert.equal(s.run(), 0, s.lines.join('\n'));
    const f = JSON.parse(readFileSync(path.join(s.root, 'catalog/features.json'), 'utf8'));
    assert.deepEqual(f.modules.map((m) => m.id), ['01-continuity', '05-skills', '08-agents-and-council', '09-data-work']);
    assert.ok(existsSync(path.join(s.root, 'catalog/FEATURES.md')));
  } finally { s.done(); }
});

test('a shipped item whose last scan is not SAFE fails the export until scan-triage.md has its section', () => {
  const s = setup();
  try {
    s.w('tools/export/scans.json', JSON.stringify({ alpha: { score: 25, recommendation: 'CAUTION', findings: [{ rule: 'TM1', file: 'SKILL.md', line: 3, severity: 'HIGH' }], version: 'v2.2.3', date: '2026-11-09' } }));
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /triage: FAIL \(1\)/);
    assert.match(out, /alpha: last scan CAUTION \(25\/100\), and tools\/export\/scan-triage\.md has no section for it/);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
    s.lines.length = 0;
    s.w('tools/export/scan-triage.md', '# Scan triage\n\n### alpha: CAUTION, 25/100, 1 finding\n\n| Finding | File:line | Verdict | Why |\n|---|---|---|---|\n| TM1 tool parameter abuse | `SKILL.md:3` | FP | A warning, not a command. |\n');
    assert.equal(s.run(), 0, s.lines.join('\n'));
    assert.match(s.lines.join('\n'), /triage: pass/);
    assert.match(readFileSync(path.join(s.root, 'catalog/skills/alpha/SOURCE.md'), 'utf8'),
      /CAUTION \(risk 25\/100\), SkillSpector v2\.2\.3 with --no-llm, 2026-11-09; 1 finding, read: 1 false positive \(\[triage\]\(\.\.\/\.\.\/\.\.\/tools\/export\/scan-triage\.md#alpha-caution-25100-1-finding\)\)/);
  } finally { s.done(); }
});

test('a shipped domain gets its SOURCE.md, which accounting accepts, and a scan of it that is not SAFE needs its triage', () => {
  const s = setup();
  try {
    const packHub = makePackHub();
    const items = [...manifest.items,
      { id: 'pack-one-two-three', kind: 'pack', status: 'public', importance: 'optional', why: 'A domain.' },
      { id: 'pack-with-licence-inside', kind: 'pack', status: 'public', importance: 'optional', why: 'Withheld.' },
      { id: 'private-pack-for-me', kind: 'pack', status: 'private' }];
    s.w('export.manifest.json', JSON.stringify({ ...manifest, items }));
    s.w('cards/pack-pack-one-two-three.md', cardText('pack-pack-one-two-three', 'domains'));
    s.w('tools/export/scans.json', JSON.stringify({ 'pack:pack-one-two-three': { score: 25, recommendation: 'CAUTION', findings: [{ rule: 'TM1', file: 'skills/one-job.md', line: 3, severity: 'HIGH' }], version: 'v2.2.3', date: '2026-11-09' } }));
    const run = () => runExport({ root: s.root, hub: packHub, noGitleaks: true, today: '2026-11-02', log: (l) => s.lines.push(String(l)), rewrites: [] });
    try {
      assert.equal(run(), 1);
      assert.match(s.lines.join('\n'), /pack:pack-one-two-three: last scan CAUTION \(25\/100\), and tools\/export\/scan-triage\.md has no section for it/);
      s.lines.length = 0;
      s.w('tools/export/scan-triage.md', '# Scan triage\n\n### pack:pack-one-two-three: CAUTION, 25/100, 1 finding\n\n| Finding | File:line | Verdict | Why |\n|---|---|---|---|\n| TM1 tool parameter abuse | `skills/one-job.md:3` | FP | A warning, not a command. |\n');
      assert.equal(run(), 0, s.lines.join('\n'));
      assert.match(s.lines.join('\n'), /accounting: pass[\s\S]*links: pass[\s\S]*triage: pass/);
      assert.match(readFileSync(path.join(s.root, 'catalog/packs/pack-one-two-three/SOURCE.md'), 'utf8'),
        /2026-11-09; 1 finding, read: 1 false positive \(\[triage\]\(\.\.\/\.\.\/\.\.\/tools\/export\/scan-triage\.md#packpack-one-two-three-caution-25100-1-finding\)\)/);
    } finally { rmSync(packHub, { recursive: true, force: true }); }
  } finally { s.done(); }
});

test('a domain\'s credit file the build cannot read fails the export with the file and the reason, and the kit is unchanged', () => {
  const s = setup();
  try {
    const packHub = makePackHub();
    const items = [...manifest.items,
      { id: 'pack-one-two-three', kind: 'pack', status: 'public', importance: 'optional', why: 'A domain.' },
      { id: 'pack-with-licence-inside', kind: 'pack', status: 'public', importance: 'optional', why: 'Withheld.' },
      { id: 'private-pack-for-me', kind: 'pack', status: 'private' }];
    s.w('export.manifest.json', JSON.stringify({ ...manifest, items }));
    s.w('cards/pack-pack-one-two-three.md', cardText('pack-pack-one-two-three', 'domains'));
    writeFileSync(path.join(packHub, 'library/pack-one-two-three/skills/NOTICE.md'), '# Notice\n\nSome of this comes from elsewhere.\n');
    try {
      assert.equal(runExport({ root: s.root, hub: packHub, noGitleaks: true, today: '2026-11-02', log: (l) => s.lines.push(String(l)), rewrites: [] }), 1);
      assert.match(s.lines.join('\n'), /export: catalog\/packs\/pack-one-two-three\/skills\/NOTICE\.md: a credit file with no table that has a Licence column/);
      assert.equal(existsSync(path.join(s.root, 'catalog')), false);
    } finally { rmSync(packHub, { recursive: true, force: true }); }
  } finally { s.done(); }
});

test('a --note that fails a gate stops the export before anything is built, without echoing the term', () => {
  const s = setup();
  try {
    assert.equal(s.run({ notes: ['Thanks to Quenlin.'] }), 2);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
    assert.match(s.lines.join('\n'), /--note 1: denied term #2/);
    assert.equal(s.lines.join('\n').includes('Quenlin'), false);
  } finally { s.done(); }
});

test('a failing gate leaves the kit exactly as it was', () => {
  const s = setup();
  try {
    s.w('catalog/skills/alpha/SKILL.md', 'previous');
    writeFileSync(path.join(s.hub, '.claude/skills/alpha/notes.md'), 'met Quenlin\n');
    assert.equal(s.run(), 1);
    assert.equal(readFileSync(path.join(s.root, 'catalog/skills/alpha/SKILL.md'), 'utf8'), 'previous');
    assert.equal(existsSync(path.join(s.root, 'catalog/skills/alpha/notes.md')), false);
    assert.match(s.lines.join('\n'), /catalog\/skills\/alpha\/notes\.md:1 denied term #2/);
    assert.equal(s.lines.join('\n').includes('Quenlin'), false);
  } finally { s.done(); }
});

test('a scan made with a version scanner.json does not pin, or an unpinned install line, fails the scanner gate and leaves the kit unchanged', () => {
  const s = setup();
  try {
    s.w('tools/export/scans.json', JSON.stringify({ alpha: { score: 0, recommendation: 'SAFE', findings: [], version: 'v2.13.6', date: '2026-11-21' } }));
    s.w('docs/install.md', '# Install\n\nuv tool install git+https://example.invalid/skillspector.git\n');
    assert.equal(s.run(), 1);
    const out = s.lines.join('\n');
    assert.match(out, /scanner: FAIL \(2\)/);
    assert.match(out, /docs\/install\.md:3 a SkillSpector install not pinned/);
    assert.match(out, /tools\/export\/scans\.json: alpha was scanned with v2\.13\.6, but tools\/export\/scanner\.json pins v2\.2\.3/);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('the export refuses to start without tools/export/scanner.json, and builds nothing', () => {
  const s = setup();
  try {
    rmSync(path.join(s.root, 'tools/export/scanner.json'));
    assert.equal(s.run(), 2);
    assert.match(s.lines.join('\n'), /export: .*scanner\.json/);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('a release fails the triage gate for a shipped item with no scan; a dry run lets it through', () => {
  const s = setup();
  try {
    const safe = { score: 0, recommendation: 'SAFE', findings: [], version: 'v2.2.3', date: '2026-11-02' };
    s.w('tools/export/scans.json', JSON.stringify({ alpha: safe }));
    assert.equal(s.run(), 0, s.lines.join('\n'));
    s.scanned();
    assert.equal(s.run({ release: '2.0.0', notes: ['x'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 1);
    assert.match(s.lines.join('\n'), /triage: FAIL \(2\)\n {2}beta: no scan in scans\.json; a release ships only scanned items.*\n {2}agent:gamma: no scan in scans\.json/);
    // A kit skill in the kit folder is gated the same way: unscanned, it fails a release.
    s.w('tools/export/scans.json', JSON.stringify({ alpha: safe, beta: safe, 'agent:gamma': safe }));
    s.w('.claude/skills/kit-one/SKILL.md', '---\nname: kit-one\ndescription: A kit skill.\n---\n# kit-one\n');
    s.scanned();
    assert.equal(s.run({ release: '2.0.0', notes: ['x'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 1);
    assert.match(s.lines.join('\n'), /triage: FAIL \(1\)\n {2}kit-one: no scan in scans\.json; a release ships only scanned items/);
  } finally { s.done(); }
});

test('a release fails the triage gate for an item that changed since its scan; a dry run writes the change so it can be scanned', () => {
  const s = setup();
  try {
    s.scanned();
    // The hub changes alpha after the scan: its triage was read against other content.
    const skill = path.join(s.hub, '.claude/skills/alpha/SKILL.md');
    writeFileSync(skill, `${readFileSync(skill, 'utf8')}\nOne more line after the scan.\n`);
    assert.equal(s.run({ release: '2.0.0', notes: ['x'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 1);
    assert.match(s.lines.join('\n'), /triage: FAIL \(1\)\n {2}alpha: the item changed since its scan; rescan and re-read its triage/);
    assert.equal(existsSync(path.join(s.root, 'tools/export/state.json')), false);
    s.lines.length = 0;
    assert.equal(s.run(), 0, s.lines.join('\n'));
    assert.match(readFileSync(path.join(s.root, 'catalog/skills/alpha/SKILL.md'), 'utf8'), /One more line after the scan\./);
  } finally { s.done(); }
});

test('a stray .DS_Store or __pycache__ in a kit skill neither ships nor changes its hash: the release passes', () => {
  const s = setup();
  try {
    const safe = { score: 0, recommendation: 'SAFE', findings: [], version: 'v2.2.3', date: '2026-11-02' };
    s.w('.claude/skills/kit-one/SKILL.md', '---\nname: kit-one\ndescription: A kit skill.\n---\n# kit-one\n');
    s.w('tools/export/scans.json', JSON.stringify({ alpha: safe, beta: safe, 'agent:gamma': safe, 'kit-one': safe }));
    s.scanned();
    s.w('.claude/skills/kit-one/.DS_Store', 'finder notes');
    s.w('.claude/skills/kit-one/__pycache__/x.cpython-313.pyc', 'bytes');
    assert.equal(s.run({ release: '2.0.0', notes: ['x'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 0, s.lines.join('\n'));
    assert.match(s.lines.join('\n'), /triage: pass/);
  } finally { s.done(); }
});

test('a release never skips gitleaks, and refuses a hub with uncommitted changes in what it reads', () => {
  const s = setup();
  try {
    assert.equal(s.run({ release: '2.0.0' }), 2);
    const dirty = (h, args) => (args[0] === 'status' ? ' M .claude/skills/alpha/SKILL.md' : 'abc123');
    assert.equal(s.run({ release: '2.0.0', noGitleaks: false, gitleaks: () => [], hubGit: dirty }), 2);
    assert.equal(existsSync(path.join(s.root, 'catalog')), false);
  } finally { s.done(); }
});

test('the first release passes the lint, then writes one changelog section and the state snapshot', () => {
  const s = setup();
  try {
    s.scanned();
    assert.equal(s.run({ release: '2.0.0', notes: ['First release.'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 0, s.lines.join('\n'));
    const log = readFileSync(path.join(s.root, 'CHANGELOG.md'), 'utf8');
    assert.equal(log.match(/# Changelog/g).length, 1);
    assert.ok(log.includes('## v2.0.0 (2026-11-02)\n\n- First release.\n\n**Added:** `agent:gamma`, `external:tool`, `skill:alpha`, `skill:beta`\n'));
    const state = JSON.parse(readFileSync(path.join(s.root, 'tools/export/state.json'), 'utf8'));
    assert.equal(state.version, '2.0.0');
    assert.equal(state.hubCommit, 'abc123');
    assert.equal(state.hashes, 'verdict+findings+cards');
    assert.deepEqual(Object.keys(state.items).sort(), ['agent:gamma', 'external:tool', 'skill:alpha', 'skill:beta']);
    // An agent's recorded scan is part of its hash, so a new verdict lists it as changed at the next release.
    const scans = JSON.parse(readFileSync(path.join(s.root, 'tools/export/scans.json'), 'utf8'));
    scans['agent:gamma'] = { ...scans['agent:gamma'], score: 40, recommendation: 'CAUTION', findings: [{ rule: 'X1', file: 'gamma.md', line: 2, severity: 'LOW' }] };
    writeFileSync(path.join(s.root, 'tools/export/scans.json'), JSON.stringify(scans));
    writeFileSync(path.join(s.root, 'tools/export/scan-triage.md'), '### agent:gamma: CAUTION, 40/100, 1 findings\n\n| Finding | File:line | Verdict | Why |\n|---|---|---|---|\n| X1 test | gamma.md:2 | FP | a test |\n');
    // The next release compares its files with the last one's tag (#66), so v2.0.0 is committed and tagged first.
    const git = (...a) => execFileSync('git', ['-C', s.root, ...a], { encoding: 'utf8' });
    for (const [k, v] of [['user.name', 'test'], ['user.email', 'test@example.invalid'], ['commit.gpgsign', 'false'], ['tag.gpgsign', 'false']]) git('config', k, v);
    s.w('.gitignore', 'tools/export/*.local.txt\ntools/export/*.local.json\n');
    git('add', '.'); git('commit', '-q', '-m', 'v2.0.0'); git('tag', 'v2.0.0');
    assert.equal(s.run({ release: '2.1.0', noGitleaks: false, gitleaks: () => [], hubGit: clean }), 0, s.lines.join('\n'));
    assert.ok(readFileSync(path.join(s.root, 'CHANGELOG.md'), 'utf8').includes('## v2.1.0 (2026-11-02)\n\n- Every file this release changed, under its item: [docs/releases/v2.1.0.md](docs/releases/v2.1.0.md).\n\n**Changed:** `agent:gamma`\n'));
  } finally { s.done(); }
});

// ---- v3: the committed manifest names no outside repository
import { loadManifest } from '../manifest.mjs';
const realManifest = () => loadManifest(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..', '..', 'export.manifest.json'));

test('no catalog-only item with an upstream link remains', () => {
  const linked = realManifest().items.filter((it) => it.status === 'catalog-only' && /https?:\/\//.test(String(it.upstream || '')));
  assert.deepEqual(linked.map((it) => `${it.kind}:${it.id}`), []);
});

test('link-only items are only tools the kit installs', () => {
  const linkOnly = realManifest().items.filter((it) => it.status === 'link-only').map((it) => it.id);
  assert.deepEqual(linkOnly, ['skillspector']);
});

test('every removal in the manifest records its version and a replacement or a reason', () => {
  const m = realManifest();
  assert.ok(Array.isArray(m.removed) && m.removed.length > 0);
  for (const r of m.removed) {
    assert.ok(r.kind && r.id && r.was && /^\d+\.\d+\.\d+$/.test(r.in), JSON.stringify(r));
    assert.ok(!m.items.some((it) => it.kind === r.kind && it.id === r.id), `${r.kind}:${r.id} is both removed and listed`);
  }
  for (const id of ['outside-workflow-plugin', 'anthropic-document-skills', 'coding-guidelines']) {
    const rec = m.removed.find((r) => r.kind === 'external' && r.id === id);
    assert.ok(rec && (rec.replacedBy || rec.note), `external:${id} needs a replacement or a note`);
  }
});

test('a release stamps its version into the manifest and the feature menu, and no private item reaches the file', () => {
  const s = setup();
  try {
    s.scanned();
    assert.equal(s.run({ release: '3.1.0', notes: ['Stamp.'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 0, s.lines.join('\n'));
    const onDisk = JSON.parse(readFileSync(path.join(s.root, 'export.manifest.json'), 'utf8'));
    assert.equal(onDisk.version, '3.1.0');
    assert.deepEqual(onDisk.items.map((i) => i.id).sort(), manifest.items.map((i) => i.id).sort());
    assert.equal(JSON.parse(readFileSync(path.join(s.root, 'catalog/features.json'), 'utf8')).version, '3.1.0');
  } finally { s.done(); }
});

// ---- the kit names no outside workflow collection anywhere, except in credit a licence requires
// The one stated exception: the credit files (ATTRIBUTION.md, NOTICE*) of a domain whose build detected
// them, which is what its SOURCE.md shows by linking them from its Origin line. Any other file, the rest of
// that domain included, still fails.
import { isCreditFile } from '../credits.mjs';
const kitRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..', '..');

function creditedFiles(root) {
  const packs = path.join(root, 'catalog', 'packs');
  if (!existsSync(packs)) return new Set();
  const files = new Set();
  for (const id of readdirSync(packs)) {
    const source = path.join(packs, id, 'SOURCE.md');
    if (!existsSync(source)) continue;
    const origin = (readFileSync(source, 'utf8').match(/^- \*\*Origin:\*\* Adapts outside work: .*$/m) || [''])[0];
    for (const m of origin.matchAll(/\]\(([^)\s]+)\)/g)) if (isCreditFile(m[1])) files.add(`catalog/packs/${id}/${m[1]}`);
  }
  return files;
}

function filesNaming(root, needle) {
  const allowed = creditedFiles(root);
  const hits = [];
  const walk = (dir) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      if (['.git', 'node_modules'].includes(ent.name) || /\.local\.(txt|json)$/.test(ent.name)) continue;
      const p = path.join(dir, ent.name);
      const rel = path.relative(root, p).split(path.sep).join('/');
      if (ent.isDirectory()) { walk(p); continue; }
      if (allowed.has(rel) || statSync(p).size >= 2_000_000) continue;
      if (needle.test(rel) || (!/\.(png|gz|zip|svg|webp)$/.test(ent.name) && needle.test(readFileSync(p, 'utf8')))) hits.push(rel);
    }
  };
  walk(root);
  return hits.sort();
}

test('the kit holds the outside workflow collection\'s name in no file', () => {
  assert.deepEqual(filesNaming(kitRoot, new RegExp(['super', 'powers'].join(''), 'i')), []);
});

test('the one exception is a credit file its domain\'s SOURCE.md links from an "Adapts outside work" Origin line', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'kit-names-'));
  try {
    const w = (rel, t) => { mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); writeFileSync(path.join(root, rel), t); };
    const credit = '- **Origin:** Adapts outside work: some text follows sources under MIT, credited in [ATTRIBUTION.md](skills/x/ATTRIBUTION.md); the rest is the studio\'s own.\n';
    w('catalog/packs/credited/SOURCE.md', `# credited: source\n\n${credit}`);
    w('catalog/packs/credited/skills/x/ATTRIBUTION.md', '| Source | Licence |\n|---|---|\n| Quenlinworks | MIT |\n');
    w('catalog/packs/credited/skills/x.md', 'Adapted from Quenlinworks.\n');
    w('catalog/packs/own/SOURCE.md', '# own: source\n\n- **Origin:** Written in the studio\'s own words.\n');
    w('catalog/packs/own/skills/y/ATTRIBUTION.md', '| Source | Licence |\n|---|---|\n| Quenlinworks | MIT |\n');
    w('cards/a.md', 'Quenlinworks.\n');
    assert.deepEqual(filesNaming(root, /quenlinworks/i), ['cards/a.md', 'catalog/packs/credited/skills/x.md', 'catalog/packs/own/skills/y/ATTRIBUTION.md']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('every credit file a shipped domain carries is linked from its SOURCE.md Origin line and listed in the notices', () => {
  const packs = path.join(kitRoot, 'catalog', 'packs');
  const found = [];
  const walk = (dir, rel) => {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const r = `${rel}/${ent.name}`;
      if (ent.isDirectory()) walk(path.join(dir, ent.name), r); else if (isCreditFile(ent.name)) found.push(r);
    }
  };
  for (const id of readdirSync(packs)) walk(path.join(packs, id), `catalog/packs/${id}`);
  assert.ok(found.length > 0, 'no credit file found, so this test checks nothing; if the last one left the kit on purpose, remove this line');
  assert.deepEqual(found.filter((f) => !creditedFiles(kitRoot).has(f)), []);
  const notices = readFileSync(path.join(kitRoot, 'docs/THIRD_PARTY_NOTICES.md'), 'utf8');
  assert.deepEqual(found.filter((f) => !notices.includes(`](../${f})`)), []);
});

test('a shipped file that cites an item the private list keeps out of the kit fails the privacy gate, by position only', () => {
  const s = setup();
  try {
    const id = `${FIXTURE_OWNER.toLowerCase()}-voice`;
    mkdirSync(path.join(s.hub, '.claude/skills', id), { recursive: true });
    writeFileSync(path.join(s.hub, '.claude/skills', id, 'SKILL.md'), `---\nname: ${id}\ndescription: Private.\n---\n`);
    s.w('tools/export/private.local.txt', `skill:${id}\n`);
    writeFileSync(path.join(s.hub, '.claude/skills/alpha/SKILL.md'), `---\nname: alpha\ndescription: Use when alpha.\nmetadata:\n  author: Richicinschi (Claude-authored)\n---\n# alpha\n\nAfter this, see \`${id}\`.\n`);
    assert.equal(s.run(), 1, s.lines.join('\n'));
    const out = s.lines.join('\n');
    assert.match(out, /privacy: FAIL/);
    assert.match(out, /catalog\/skills\/alpha\/SKILL\.md:\d+ denied term #\d+/);
    assert.equal(out.includes(id), false, 'the name is never printed');
  } finally { s.done(); }
});

// ---- #66: every changed file, under its item, at each release
test('a release after the first writes docs/releases/vX.Y.Z.md from the last release\'s tag, and the changelog links it', () => {
  const s = setup();
  const git = (...a) => execFileSync('git', ['-C', s.root, ...a], { encoding: 'utf8' });
  try {
    s.scanned();
    assert.equal(s.run({ release: '2.0.0', notes: ['First release.'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 0, s.lines.join('\n'));
    assert.match(s.lines.join('\n'), /release files: the first release has no earlier one to compare with; no page written/);
    for (const [k, v] of [['user.name', 'test'], ['user.email', 'test@example.invalid'], ['commit.gpgsign', 'false'], ['tag.gpgsign', 'false']]) git('config', k, v);
    s.w('.gitignore', 'tools/export/*.local.txt\ntools/export/*.local.json\n');
    git('add', '.'); git('commit', '-q', '-m', 'v2.0.0'); git('tag', 'v2.0.0');
    s.w('cards/alpha.md', `${readFileSync(path.join(s.root, 'cards/alpha.md'), 'utf8')}\nOne more line.\n`);
    // A dry run names the groups the release's page will have, so the --why lines can be written first.
    s.lines.length = 0;
    assert.equal(s.run({ whys: ['skill:alpha=Its card says more.'] }), 0, s.lines.join('\n'));
    assert.match(s.lines.join('\n'), /^release files \(dry run\): since v2\.0\.0, \d+ group\(s\): .*skill:alpha.*; no why for: /m);
    s.lines.length = 0;
    assert.equal(s.run({ release: '2.1.0', notes: ['Second.'], whys: ['skill:alpha=Its card says more.', 'skill:nothing=Unused.'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 0, s.lines.join('\n'));
    const page = readFileSync(path.join(s.root, 'docs/releases/v2.1.0.md'), 'utf8');
    assert.match(page, /^# Studio OS v2\.1\.0: every changed file$/m);
    assert.match(page, /^## skill:alpha\n\nWhy: Its card says more\.\n\n- changed `cards\/alpha\.md`$/m);
    assert.match(page, /^- changed `CHANGELOG\.md`$/m, 'what the release itself writes is listed too');
    assert.ok(!/local\.txt/.test(page), 'ignored local files are never listed');
    assert.match(readFileSync(path.join(s.root, 'CHANGELOG.md'), 'utf8'), /^## v2\.1\.0 \(2026-11-02\)\n\n- Second\.\n- Every file this release changed, under its item: \[docs\/releases\/v2\.1\.0\.md\]\(docs\/releases\/v2\.1\.0\.md\)\.$/m);
    assert.match(s.lines.join('\n'), /release files: docs\/releases\/v2\.1\.0\.md, \d+ file\(s\) in \d+ group\(s\); no why for/);
    assert.match(s.lines.join('\n'), /a --why names a group with no changed file, left out: skill:nothing/);
    // The same release again is refused: its changelog section and state are written; its page can be redone alone.
    s.lines.length = 0;
    assert.equal(s.run({ release: '2.1.0', notes: ['Again.'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 2);
    assert.match(s.lines.join('\n'), /v2\.1\.0 is already released in this checkout .*release-files\.mjs page --previous <the release before> --release 2\.1\.0/);
    assert.equal(readFileSync(path.join(s.root, 'CHANGELOG.md'), 'utf8').match(/^## v2\.1\.0 /gm).length, 1);
  } finally { s.done(); }
});

test('a release stops before building when the last release\'s tag is missing, or a --why is malformed or fails the gates', () => {
  const s = setup();
  try {
    s.scanned();
    s.w('tools/export/state.json', JSON.stringify({ version: '1.9.0', hashes: 'verdict+findings', items: {} }));
    assert.equal(s.run({ release: '2.0.0', notes: ['x'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 2);
    assert.match(s.lines.join('\n'), /the tag v1\.9\.0 of the last release is not in this checkout; fetch it first: git fetch origin --tags/);
    s.lines.length = 0;
    assert.equal(s.run({ whys: ['no equals sign'] }), 2);
    assert.match(s.lines.join('\n'), /a --why is "<group>=<text>"/);
    s.lines.length = 0;
    assert.equal(s.run({ whys: ['skill:alpha=Thanks to Quenlin.'] }), 2);
    assert.match(s.lines.join('\n'), /a --note or --why fails the gates; nothing was built/);
    assert.match(s.lines.join('\n'), /--why skill:alpha: denied term #\d+/, 'a finding names its --why');
  } finally { s.done(); }
});

// ---- the markers gate and catalog/DETECT.md
test('a release passes with a marker in a card\'s Detect line, which catalog/DETECT.md carries, and fails with it in a shipped skill', () => {
  const s = setup();
  try {
    // The card speaks to the reader: "this machine" is theirs.
    s.w('cards/alpha.md', readFileSync(path.join(s.root, 'cards/alpha.md'), 'utf8').replace(/## Detect\n\nx\n/, '## Detect\n\n- What the skill can use on this machine: `command -v dot` prints a path.\n'));
    s.scanned();
    assert.equal(s.run({ release: '2.0.0', notes: ['x'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 0, s.lines.join('\n'));
    assert.match(readFileSync(path.join(s.root, 'catalog/DETECT.md'), 'utf8'), /What the skill can use on this machine/);
    assert.match(s.lines.join('\n'), /^markers: pass$/m);
  } finally { s.done(); }
  const t = setup();
  try {
    // The same words in a shipped skill are a studio marker, and the release stops.
    const skill = path.join(t.hub, '.claude/skills/beta/SKILL.md');
    writeFileSync(skill, `${readFileSync(skill, 'utf8')}\nRun it on this machine.\n`);
    t.scanned();
    assert.equal(t.run({ release: '2.0.0', notes: ['x'], noGitleaks: false, gitleaks: () => [], hubGit: clean }), 1);
    assert.match(t.lines.join('\n'), /catalog\/skills\/beta\/SKILL\.md:\d+ studio marker "this machine"/);
  } finally { t.done(); }
});
