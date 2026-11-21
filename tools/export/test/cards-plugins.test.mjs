// tools/export/test/cards-plugins.test.mjs
// Every skill, agent and domain card's Detect also looks for a copy of the same name that a plugin
// enabled in the adopter's project provides, and its menu line marks it, so the menu does not offer a
// second skill on the same trigger. The command asks `claude plugin list --json` which plugins are
// enabled for the current folder and where each loads from (docs/facts.md, "Claude Code: installed
// plugins and their skills"); a disabled plugin, another repository's install, an old version and a
// lookalike path inside a plugin do not count, and without `claude` it says the check could not run.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const READER = 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let l;try{l=JSON.parse(s)}catch{}if(!Array.isArray(l))return console.log("plugin check could not run");for(const p of l){const r=p.readFromFolder||p.installPath,f=r&&require("path").join(r,process.argv[1]);if(p.enabled&&f&&require("fs").existsSync(f))console.log(p.id,f)}})';
const rel = (kind, name) => (kind === 'agent' ? `agents/${name}.md` : `skills/${name}/SKILL.md`);
export const pluginCommand = (kind, name) => `claude plugin list --json | node -e '${READER}' ${rel(kind, name)}`;
export const pluginLine = (kind, name) =>
  `- ${kind === 'agent' ? 'An agent' : 'A skill'} of the same name from a plugin enabled here: run from the project folder, \`${pluginCommand(kind, name)}\` prints the plugin's id and the path of each copy, and nothing else. \`claude plugin list\` reports which plugins are enabled for the current folder and the folder each one loads from, so a disabled plugin, a plugin installed for another repository and an old version left after an update do not count. When it prints \`plugin check could not run\` or an error such as \`claude: command not found\`, Detect says the plugin check could not run, and the item gets no plugin mark ([docs/facts.md](../docs/facts.md), "Claude Code: installed plugins and their skills").`;
export const MENU_SENTENCE = 'When nothing marks it **have** and that plugin line prints a copy, the menu says **a plugin provides one** instead of **not yet**, or **partly (a plugin provides one)** instead of **partly**, so what is missing stays in view, and it does not offer the kit\'s copy as a second.';

const dirs = (r) => readdirSync(path.join(KIT, r), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
const cards = [
  ...dirs('catalog/skills').map((id) => ({ card: id, kind: 'skill', name: id })),
  ...readdirSync(path.join(KIT, 'catalog/agents')).filter((f) => f.endsWith('.md')).sort().map((f) => ({ card: f.slice(0, -3), kind: 'agent', name: f.slice(0, -3) })),
  ...dirs('catalog/packs').map((id) => ({ card: `pack-${id}`, kind: 'skill', name: id })),
];

const detectOf = (text) => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const from = lines.indexOf('## Detect');
  const to = lines.indexOf('## Ask');
  return lines.slice(from + 1, to);
};

test('the skill, agent and domain cards are the 45 the catalog ships', () => {
  assert.equal(cards.length, 45);
  for (const c of cards) assert.ok(existsSync(path.join(KIT, 'cards', `${c.card}.md`)), `cards/${c.card}.md`);
});

test('each of those cards looks in enabled plugins for a copy of the same name, and its menu line names that mark', () => {
  const missing = [];
  for (const c of cards) {
    const text = readFileSync(path.join(KIT, 'cards', `${c.card}.md`), 'utf8');
    const detect = detectOf(text);
    if (!detect.includes(pluginLine(c.kind, c.name))) missing.push(`${c.card}: no plugin line`);
    const menu = detect.filter((l) => l.startsWith('The menu marks'));
    if (menu.length !== 1 || !menu[0].endsWith(` ${MENU_SENTENCE}`)) missing.push(`${c.card}: menu line without the plugin mark`);
    const at = detect.indexOf(pluginLine(c.kind, c.name));
    const menuAt = detect.findIndex((l) => l.startsWith('The menu marks'));
    if (at >= 0 && menuAt >= 0 && at > menuAt) missing.push(`${c.card}: plugin line after the menu line`);
    // The mark replaces "not yet" only; "partly" keeps its gap and says a plugin is there too.
    if (/instead of \*\*partly\*\* or \*\*not yet\*\*/.test(text)) missing.push(`${c.card}: the plugin mark still replaces partly`);
    if (/plugins\/cache|plugins\/synced/.test(detect.join('\n'))) missing.push(`${c.card}: still searches the plugin folders`);
  }
  assert.deepEqual(missing, []);
});

test('the drill and the features template know the plugin marks, and keep partly visible', () => {
  const drill = readFileSync(path.join(KIT, '.claude/skills/drill-to-adopt/SKILL.md'), 'utf8').replace(/\s+/g, ' ');
  assert.match(drill, /\*\*a plugin provides one\*\* in place of \*\*not yet\*\*/);
  assert.match(drill, /\*\*partly \(a plugin provides one\)\*\* in place of \*\*partly\*\*/);
  assert.match(drill, /partly \/ partly \(a plugin provides one\) \/ not yet \/ a plugin provides one/);
  const features = readFileSync(path.join(KIT, 'templates/adoption/features.md'), 'utf8');
  assert.match(features, /\*\*partly \(a plugin provides one\)\*\*/);
  const lines = features.split(/\r?\n/).filter((x) => x.includes('you have: <'));
  assert.ok(lines.length >= 3);
  for (const l of lines) assert.match(l, /<have \/ partly \/ partly \(a plugin provides one\) \/ not yet \/ a plugin provides one>/, l);
});

// The command itself, run by bash with a stand-in `claude` that prints a made-up `plugin list --json`
// over a made-up plugins tree. Skipped where no bash is found.
const bash = spawnSync('bash', ['-c', 'echo ok'], { encoding: 'utf8' });
test('the plugin command prints only copies from enabled plugins, where each one loads from', { skip: bash.stdout?.trim() !== 'ok' && 'no bash' }, () => {
  const home = mkdtempSync(path.join(os.tmpdir(), 'kit-plugins-'));
  const fwd = (p) => p.replace(/\\/g, '/');
  const at = (r) => path.join(home, r);
  const put = (r) => { mkdirSync(path.dirname(at(r)), { recursive: true }); writeFileSync(at(r), '---\nname: x\n---\n'); };
  const script = (r, body) => { mkdirSync(path.dirname(at(r)), { recursive: true }); writeFileSync(at(r), `#!/bin/sh\n${body}\n`, { mode: 0o755 }); };
  try {
    const cache = 'plugins/cache/market';
    // Enabled, current version: counts. Its old version, marked orphaned, is not in the list.
    put(`${cache}/tools/2.0.0/skills/tdd/SKILL.md`);
    put(`${cache}/tools/2.0.0/agents/linus-reviewer.md`);
    put(`${cache}/tools/1.0.0/skills/tdd/SKILL.md`);
    writeFileSync(at(`${cache}/tools/1.0.0/.orphaned_at`), '1795150000000');
    // Decoys inside the enabled plugin: a package's folder of the same shape, and a lookalike name.
    put(`${cache}/tools/2.0.0/node_modules/pkg/skills/tdd/SKILL.md`);
    put(`${cache}/tools/2.0.0/skills/tdd-extra/SKILL.md`);
    // Disabled here, and installed for another repository: not enabled for this folder.
    put(`${cache}/off/1.0.0/skills/tdd/SKILL.md`);
    put(`${cache}/elsewhere/1.0.0/skills/tdd/SKILL.md`);
    // Synced from claude.ai, and a plugin loaded in place from a local marketplace's folder.
    put('plugins/synced/team/skills/tdd/SKILL.md');
    put('local-market/plugins/inplace/skills/tdd/SKILL.md');
    const list = [
      { id: 'tools@market', scope: 'user', enabled: true, installPath: at(`${cache}/tools/2.0.0`) },
      { id: 'off@market', scope: 'user', enabled: false, installPath: at(`${cache}/off/1.0.0`) },
      { id: 'elsewhere@market', scope: 'project', enabled: false, installPath: at(`${cache}/elsewhere/1.0.0`), projectPath: at('other-repo') },
      { id: 'team@synced', scope: 'synced', enabled: true, installPath: at('plugins/synced/team') },
      { id: 'inplace@local', scope: 'user', enabled: true, installPath: at('plugins/cache/local/inplace/1.0.0'), readFromFolder: at('local-market/plugins/inplace') },
    ];
    writeFileSync(at('list.json'), JSON.stringify(list, null, 2));
    script('bin/claude', `exec node -e 'process.stdout.write(require("fs").readFileSync(process.argv[1]))' '${fwd(at('list.json'))}'`);
    script('broken/claude', 'echo "error: plugins could not be read" >&2; exit 1');
    script('node-only/node', `exec '${fwd(process.execPath)}' "$@"`);

    // PATH holds only the stand-ins, so a real `claude` on this machine is never called.
    const run = (cmd, onPath) => spawnSync('bash', ['-c', `export PATH="${onPath.map((d) => `$(cd '${fwd(at(d))}' && pwd)`).join(':')}"; ${cmd}`], { encoding: 'utf8', cwd: home });
    const tail = (out) => out.split('\n').filter(Boolean).map((l) => fwd(l).replace(`${fwd(home)}/`, '')).sort();

    assert.deepEqual(tail(run(pluginCommand('skill', 'tdd'), ['bin', 'node-only']).stdout), [
      'inplace@local local-market/plugins/inplace/skills/tdd/SKILL.md',
      'team@synced plugins/synced/team/skills/tdd/SKILL.md',
      'tools@market plugins/cache/market/tools/2.0.0/skills/tdd/SKILL.md',
    ]);
    assert.deepEqual(tail(run(pluginCommand('agent', 'linus-reviewer'), ['bin', 'node-only']).stdout), ['tools@market plugins/cache/market/tools/2.0.0/agents/linus-reviewer.md']);
    assert.deepEqual(tail(run(pluginCommand('skill', 'claim-auditor'), ['bin', 'node-only']).stdout), []);
    // No claude on PATH, or claude failing: never a silent "no plugin".
    assert.deepEqual(tail(run(pluginCommand('skill', 'tdd'), ['node-only']).stdout), ['plugin check could not run']);
    assert.deepEqual(tail(run(pluginCommand('skill', 'tdd'), ['broken', 'node-only']).stdout), ['plugin check could not run']);
  } finally { rmSync(home, { recursive: true, force: true }); }
});
