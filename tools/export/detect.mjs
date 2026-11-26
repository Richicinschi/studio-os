// tools/export/detect.mjs
// catalog/DETECT.md: the "## Detect" section of every card, in one file (public issue #58). The drill's
// phase 1 reads it instead of opening 80 cards, whose Detect sections are a small part of their length.
// The export writes it into the catalog it builds; after a card's Detect changes between exports, run
//   node tools/export/detect.mjs
// to write it again in the kit, and `npm test` holds the committed file to the cards.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DETECT_FILE = 'catalog/DETECT.md';

// A link in a card is relative to cards/; in catalog/DETECT.md it must still reach the same place.
const relink = (text, id) => text.replace(/\]\(([^)\s]+)\)/g, (m, target) => {
  if (/^[a-z]+:/i.test(target) || target.startsWith('../')) return m;
  if (target.startsWith('#')) return `](../cards/${id}.md${target})`;
  return `](../cards/${target})`;
});

// Most skill, agent and domain cards end their Detect with the same plugin check, word for word but for the
// path it looks for, and with the same sentence on how the menu marks a plugin's copy. Written once at the
// top, they shrink the file by a large part; a card whose wording differs keeps its own text.
const PLUGIN = /^- (A skill|An agent) of the same name from a plugin enabled here: run from the project folder, `claude plugin list --json \| node -e '[^']*' (\S+)`.*$/m;
const MENU = /When nothing marks it \*\*have\*\* and that plugin line prints a copy, .*?as a second\./;

function detectSections(root) {
  const dir = path.join(root, 'cards');
  const cards = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : [];
  const sections = [];
  for (const f of cards) {
    const id = f.slice(0, -3);
    const lines = readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n').split('\n');
    const title = (lines.find((l) => /^# /.test(l)) || `# ${id}`).slice(2).trim();
    const at = lines.findIndex((l) => l.trimEnd() === '## Detect');
    if (at < 0) continue;
    // The section ends at the next "## " heading outside a code fence.
    let fence = false;
    let end = lines.findIndex((l, i) => {
      if (i <= at) return false;
      if (/^\s*(```|~~~)/.test(l)) fence = !fence;
      return !fence && /^## /.test(l);
    });
    if (end < 0) end = lines.length;
    sections.push({ f, id, title, body: lines.slice(at + 1, end).join('\n').trim() });
  }
  return sections;
}

// A plugin line after "of the same name from a plugin enabled here: ", with its path as <path>: the same
// for a skill and an agent.
const generic = (m) => m[0].slice(`- ${m[1]} of the same name from a plugin enabled here: `.length).replace(m[2], '<path>');

export function detectTable(root) {
  const sections = detectSections(root);
  // The shared plugin check, from the first card that has one; the shared menu sentence.
  const first = sections.map((s) => s.body.match(PLUGIN)).find(Boolean);
  const shared = first && generic(first);
  const menu = sections.map((s) => s.body.match(MENU)).find(Boolean)?.[0];
  const out = ['# Detect, for every item', '',
    'Generated from the "Detect" section of each card in `cards/` by `tools/export/detect.mjs`: edit the cards, never this file. The drill reads it in phase 1 instead of opening each card. Each section is read-only: presence, counts and dates, never a file\'s content.', ''];
  if (shared) {
    out.push('## The plugin check, shared by the cards below', '',
      'A card below that says "the plugin check" runs this, with `<path>` set to the path it names:', '',
      `- A skill or agent of the same name from a plugin enabled here: ${shared}`, '');
    if (menu) out.push(`The menu marks that follow from it, wherever a card below says "the plugin marks": ${menu}`, '');
  }
  for (const s of sections) {
    let body = s.body;
    const m = shared && body.match(PLUGIN);
    // Only a line that is the shared one but for its path is replaced; any other wording stays.
    if (m && generic(m) === shared) body = body.replace(m[0], `- ${m[1]} of the same name from a plugin enabled here: the plugin check, with \`<path>\` set to \`${m[2]}\`.`);
    if (menu && body.includes(menu)) body = body.replace(menu, 'The plugin marks apply.');
    out.push(`## ${s.id}: ${s.title}`, '', `Card: [cards/${s.f}](../cards/${s.f})`, '', relink(body, s.id), '');
  }
  return `${out.join('\n').trimEnd()}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  writeFileSync(path.join(root, DETECT_FILE), detectTable(root));
  console.log(`wrote ${DETECT_FILE}`);
}
