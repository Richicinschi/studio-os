// tools/export/test/fixture-hub.mjs
// A throwaway hub: two skills (one studio-original, one third-party with a LICENSE), one agent,
// a folder without SKILL.md and an AGENTS.md index, both of which must be ignored. The owner is the
// invented FIXTURE_OWNER, and the hub path is assembled at runtime so this file carries no literal.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const FIXTURE_OWNER = 'Zorblat';

// A complete adoption card: front matter and the eight headings, each with a line under it.
export const CARD_HEADINGS = ['Why', 'Detect', 'Ask', 'Needs', 'Steps', 'Check', 'Undo', 'Watch out'];
export const cardText = (id, module) => ['---', `id: ${id}`, `module: ${module}`, 'checked: 2026-11-02', '---', '', `# ${id}`, '',
  ...CARD_HEADINGS.flatMap((h) => [`## ${h}`, '', 'x', '']), ''].join('\n');
const WIN_HUB = ['E:', 'AppDev'].join('\\');

export function makeFixtureHub() {
  const hub = mkdtempSync(path.join(os.tmpdir(), 'kit-hub-'));
  const skill = (id, fm, body, extra = {}) => {
    const dir = path.join(hub, '.claude', 'skills', id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'SKILL.md'), `---\n${fm}\n---\n${body}`);
    for (const [f, t] of Object.entries(extra)) {
      mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
      writeFileSync(path.join(dir, f), t);
    }
  };
  skill('alpha', 'name: alpha\ndescription: Use when alpha.\nmetadata:\n  author: Richicinschi (Claude-authored)',
    `# alpha\n\nRun ${WIN_HUB}\\tools\\x.mjs and ask ${FIXTURE_OWNER}.\n`, { 'references/notes.md': 'See [the skill](../SKILL.md).\n' });
  skill('beta', 'name: beta\ndescription: Use when beta.\nmetadata:\n  author: Richicinschi (adapted by Claude from someone/upstream-repo)\n  sources:\n    - someone/upstream-repo · skills/beta (MIT)',
    '# beta\n', { LICENSE: 'MIT License\n\nCopyright (c) 2026 Someone\n' });
  mkdirSync(path.join(hub, '.claude', 'skills', 'not-a-skill'), { recursive: true });
  mkdirSync(path.join(hub, '.claude', 'agents'), { recursive: true });
  writeFileSync(path.join(hub, '.claude', 'agents', 'gamma.md'), `---\nname: gamma\n---\nA seat. Ask ${FIXTURE_OWNER}.\n`);
  writeFileSync(path.join(hub, '.claude', 'agents', 'AGENTS.md'), 'index\n');
  return hub;
}

// A restructured hub (core plus library packs): the fixture hub, plus
//   library/pack-one-two-three: two skills (one a standalone stub), one agent, an own-text pack
//   library/pack-with-licence-inside: a skill that carries a LICENSE
//   library/private-pack-for-me: the owner's private pack
// and the installed copies a hub keeps in .claude: the entry with a .pack.json marker, the stub, the agent.
export function makePackHub() {
  const hub = makeFixtureHub();
  const w = (rel, text) => { mkdirSync(path.dirname(path.join(hub, rel)), { recursive: true }); writeFileSync(path.join(hub, rel), text); };
  const pack = (id, skills, { agents = [], standalone = [] } = {}) => {
    const description = `Use when the user needs ${id} and wants its jobs done, with enough words to pass the length rule.`;
    w(`library/${id}/pack.json`, JSON.stringify({ id, title: `Title of ${id}`, description,
      skills: skills.map((s) => ({ id: s, title: s, summary: `Does ${s}.`, whenToUse: `Use when ${s}.`, file: `skills/${s}.md` })),
      ...(agents.length ? { agents: agents.map((a) => ({ id: a, file: `agents/${a}.md` })) } : {}),
      ...(standalone.length ? { standalone: standalone.map((s) => ({ id: s, userOnly: true })) } : {}) }, null, 2));
    w(`library/${id}/SKILL.md`, `---\nname: ${id}\ndescription: ${description}\n---\n# ${id}\n\nIndex. Ask ${FIXTURE_OWNER}.\n`);
    for (const s of skills) w(`library/${id}/skills/${s}.md`, `# ${s}\n\nSee [the index](../SKILL.md).\n`);
    for (const a of agents) w(`library/${id}/agents/${a}.md`, `---\nname: ${a}\n---\nA seat.\n`);
    w(`library/${id}/provenance.json`, '{"private":"never ships"}\n');
    w(`library/${id}/SCAN.md`, 'scan notes\n');
    w(`library/${id}/tests/routing.json`, '[]\n');
  };
  pack('pack-one-two-three', ['one-job', 'stubby'], { agents: ['seat-one'], standalone: ['stubby'] });
  w('library/pack-one-two-three/skills/one-job/helper.md', 'A nested file, [back](../../SKILL.md).\n');
  pack('pack-with-licence-inside', ['lic-job']);
  w('library/pack-with-licence-inside/skills/lic-job/LICENSE', 'MIT License\n\nCopyright (c) 2026 Someone\n');
  pack('private-pack-for-me', ['secret-job']);
  // installed copies
  w('.claude/skills/pack-one-two-three/.pack.json', '{"id":"pack-one-two-three","agents":["seat-one"]}');
  w('.claude/skills/pack-one-two-three/SKILL.md', '---\nname: pack-one-two-three\ndescription: x\n---\nIndex.\n');
  w('.claude/skills/stubby/SKILL.md', '---\nname: stubby\ndescription: x\n---\nRead `pack-one-two-three/skills/stubby.md` and follow it.\n');
  w('.claude/skills/pack-with-licence-inside/.pack.json', '{"id":"pack-with-licence-inside","agents":[]}');
  w('.claude/skills/pack-with-licence-inside/SKILL.md', '---\nname: pack-with-licence-inside\ndescription: x\n---\nIndex.\n');
  w('.claude/agents/seat-one.md', '---\nname: seat-one\n---\nA seat.\n');
  return hub;
}
