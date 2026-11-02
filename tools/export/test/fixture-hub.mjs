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
