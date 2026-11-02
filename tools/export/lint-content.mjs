// tools/export/lint-content.mjs
// Content lint: module pages carry their front matter and the five headings in order; adoption cards
// their front matter and the eight headings in order; every skill folder's SKILL.md is named after its
// folder; every catalog skill has a SOURCE.md.
//   node tools/export/lint-content.mjs        # exit 1 on any error
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseFrontmatter } from './frontmatter.mjs';

export const MODULE_HEADINGS = ['## The problem', '## The mechanism', '## Evidence', '## Apply it in Claude Code', '## Apply it in claude.ai'];

export function lintModulePage(rel, text) {
  const { data, body } = parseFrontmatter(text);
  if (!data) return [`${rel}: no front matter`];
  const errors = [];
  for (const k of ['title', 'pack']) if (!data[k]) errors.push(`${rel}: front matter needs "${k}"`);
  for (const k of ['sources', 'questions']) if (!Array.isArray(data[k]) || !data[k].length) errors.push(`${rel}: front matter needs a non-empty "${k}" list`);
  const hay = `\n${body.replace(/\r\n/g, '\n')}\n`;
  let last = -1;
  for (const h of MODULE_HEADINGS) {
    const at = hay.indexOf(`\n${h}\n`);
    if (at < 0) errors.push(`${rel}: missing heading "${h}"`);
    else if (at < last) errors.push(`${rel}: heading "${h}" out of order`);
    else last = at;
  }
  return errors;
}

export function lintSkillDir(rel, dir) {
  const f = path.join(dir, 'SKILL.md');
  if (!existsSync(f)) return [`${rel}: no SKILL.md`];
  const { data } = parseFrontmatter(readFileSync(f, 'utf8'));
  const name = path.basename(dir);
  const errors = [];
  if (!data || data.name !== name) errors.push(`${rel}: SKILL.md name "${data?.name ?? ''}" must equal the folder name`);
  if (!data || !data.description) errors.push(`${rel}: SKILL.md needs a description`);
  return errors;
}

// An adoption card: id (its file name), module and checked, then exactly the eight headings, in order,
// none empty.
export const CARD_HEADINGS = ['## Why', '## Detect', '## Ask', '## Needs', '## Steps', '## Check', '## Undo', '## Watch out'];

export function lintCard(rel, text) {
  const { data, body } = parseFrontmatter(text);
  if (!data) return [`${rel}: no front matter`];
  const errors = [];
  for (const k of ['id', 'module', 'checked']) if (!data[k]) errors.push(`${rel}: front matter needs "${k}"`);
  const file = path.basename(rel, '.md');
  if (data.id && data.id !== file) errors.push(`${rel}: front matter id "${data.id}" must equal the file name`);
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const found = lines.map((l, i) => ({ h: l.trimEnd(), i })).filter((x) => /^## /.test(x.h));
  for (const x of found) if (!CARD_HEADINGS.includes(x.h)) errors.push(`${rel}: heading "${x.h}" is not one of the eight`);
  let last = -1;
  for (const h of CARD_HEADINGS) {
    const at = found.findIndex((x) => x.h === h);
    if (at < 0) { errors.push(`${rel}: missing heading "${h}"`); continue; }
    if (at < last) errors.push(`${rel}: heading "${h}" out of order`);
    else last = at;
    const end = at + 1 < found.length ? found[at + 1].i : lines.length;
    if (!lines.slice(found[at].i + 1, end).some((l) => l.trim())) errors.push(`${rel}: heading "${h}" is empty`);
  }
  return errors;
}

// Kind and true: the kit skills, START-HERE, ADOPT and the cards never talk a step down.
export const BANNED = ['great question', 'simply', 'just', 'easy', 'obviously', 'should work', 'guaranteed'];
const bannedRe = BANNED.map((w) => [w, new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'i')]);

export function lintBanned(rel, text) {
  return text.replace(/\r\n/g, '\n').split('\n').flatMap((line, i) =>
    bannedRe.filter(([, re]) => re.test(line)).map(([w]) => `${rel}:${i + 1} minimizing word "${w}"`));
}

// Adopters run Windows, macOS or Linux: the foundation step gives one command block for each.
export const OS_HEADINGS = ['### Windows', '### macOS', '### Linux'];

export function lintStartHere(text) {
  const hay = `\n${text.replace(/\r\n/g, '\n')}\n`;
  return OS_HEADINGS.filter((h) => !hay.includes(`\n${h}\n`)).map((h) => `START-HERE.md: the foundation step needs a "${h}" block`);
}

const dirsIn = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : []);

export function lintKit(root) {
  const errors = [];
  for (const d of dirsIn(path.join(root, 'modules'))) {
    const rel = `modules/${d}/README.md`;
    if (!existsSync(path.join(root, rel))) { errors.push(`${rel}: missing`); continue; }
    errors.push(...lintModulePage(rel, readFileSync(path.join(root, rel), 'utf8')));
  }
  for (const base of ['catalog/skills', '.claude/skills']) {
    for (const d of dirsIn(path.join(root, base))) {
      errors.push(...lintSkillDir(`${base}/${d}`, path.join(root, base, d)));
      if (base === 'catalog/skills' && !existsSync(path.join(root, base, d, 'SOURCE.md'))) errors.push(`${base}/${d}: no SOURCE.md`);
    }
  }
  const cards = path.join(root, 'cards');
  if (existsSync(cards)) {
    for (const f of readdirSync(cards).filter((n) => n.endsWith('.md')).sort()) errors.push(...lintCard(`cards/${f}`, readFileSync(path.join(cards, f), 'utf8')));
  }
  for (const f of ['START-HERE.md', 'ADOPT.md', 'CHANGELOG.md', 'export.manifest.json']) if (!existsSync(path.join(root, f))) errors.push(`${f}: missing`);
  if (existsSync(path.join(root, 'START-HERE.md'))) errors.push(...lintStartHere(readFileSync(path.join(root, 'START-HERE.md'), 'utf8')));
  const voice = ['START-HERE.md', 'ADOPT.md',
    ...dirsIn(path.join(root, '.claude/skills')).map((d) => `.claude/skills/${d}/SKILL.md`),
    ...(existsSync(cards) ? readdirSync(cards).filter((n) => n.endsWith('.md')).sort().map((n) => `cards/${n}`) : [])];
  for (const rel of voice) if (existsSync(path.join(root, rel))) errors.push(...lintBanned(rel, readFileSync(path.join(root, rel), 'utf8')));
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const errors = lintKit(root);
  for (const e of errors) console.log(e);
  console.log(errors.length ? `lint: ${errors.length} error(s)` : 'lint: clean');
  process.exit(errors.length ? 1 : 0);
}
