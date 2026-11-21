// tools/export/card-tokens.mjs
// The token figures a card may state, computed from the built kit with the estimator the kit uses
// everywhere else (bytes divided by 4, rounded up). A card states a figure either in its front matter
// (`tokens:`) or in its text ("the body, about 2,400 tokens"); checkCard holds each to the computed figure it
// names. checkPackScripts and checkStudioLines hold a card's lists (the scripts a domain ships, the studio
// lines it quotes) to the shipped files.
//   node tools/export/card-tokens.mjs        # list every figure that is more than 10% off, and every list gap
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseFrontmatter, startedByName } from './frontmatter.mjs';
import { shebangFiles } from './gates.mjs';

export const TOLERANCE = 0.1;
const tokens = (bytes) => Math.ceil(bytes / 4);

function filesUnder(dir, rel = '') {
  if (!existsSync(dir)) return [];
  return readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap((e) => {
    const r = rel ? `${rel}/${e.name}` : e.name;
    return e.isDirectory() ? filesUnder(dir, r) : [r];
  });
}

const tokensOf = (file) => tokens(statSync(file).size);

// Every figure a card may state about its item, with a label: description, body, each file of the item's
// folder, the folder's total, the sum of description and body, every front-matter size, and for a practice
// the kit files it lists. A domain adds its entry, its index, its agents and their sum.
export function allowedFigures(root, cardId, features) {
  const out = new Map();
  const add = (label, n) => { if (Number.isFinite(n) && n > 0) out.set(label, n); };
  const items = Object.fromEntries(features.modules.flatMap((m) => m.items).map((it) => [it.id, it]));
  const domain = (features.domains || []).find((d) => `pack-${d.id}` === cardId);
  if (domain) {
    let agentDescriptions = 0;
    for (const f of filesUnder(path.join(root, 'catalog', 'packs', domain.id, 'agents'))) {
      const d = parseFrontmatter(readFileSync(path.join(root, 'catalog', 'packs', domain.id, 'agents', f), 'utf8')).data;
      const t = tokens(Buffer.byteLength(String((d && d.description) || ''), 'utf8'));
      add(`agent description ${f}`, t);
      agentDescriptions += t;
    }
    // A standalone stub is a one-line skill with its own description. A stub Claude cannot start
    // (disable-model-invocation: true) keeps its description out of context, so it adds 0.
    let stubDescriptions = 0;
    const stubDir = path.join(root, 'catalog', 'packs', domain.id, 'stubs');
    if (existsSync(stubDir)) for (const e of readdirSync(stubDir, { withFileTypes: true }).filter((x) => x.isDirectory())) {
      const d = parseFrontmatter(readFileSync(path.join(stubDir, e.name, 'SKILL.md'), 'utf8')).data;
      // A card says such a stub costs 0 by naming how it starts: "You start it by name".
      if (startedByName(d)) out.set('stub started by name', 0);
      const t = startedByName(d) ? 0 : tokens(Buffer.byteLength(String((d && d.description) || ''), 'utf8'));
      add(`stub description ${e.name}`, t);
      stubDescriptions += t;
    }
    add('every stub description', stubDescriptions);
    add('entry plus every agent and stub description', domain.alwaysOnTokens + agentDescriptions + stubDescriptions);
    add('entry plus every agent description', domain.alwaysOnTokens + agentDescriptions);
    add('entry description', domain.alwaysOnTokens);
    add('index', domain.indexTokens);
    const dir = path.join(root, 'catalog', 'packs', domain.id);
    for (const f of filesUnder(path.join(dir, 'agents'))) { const t = tokensOf(path.join(dir, 'agents', f)); add(`agent ${f}`, t); }
    for (const f of filesUnder(dir)) add(`file ${f}`, tokensOf(path.join(dir, f)));
    return out;
  }
  const it = items[cardId];
  if (!it) return out;
  // A skill started by name has no description in context: its card states 0.
  if (it.loads === 'by-name') out.set('description', 0);
  else add('description', it.everySessionTokens);
  add('body', it.onDemandTokens);
  add('description plus body', (it.everySessionTokens || 0) + (it.onDemandTokens || 0));
  const dir = it.kind === 'skill' ? path.join(root, 'catalog', 'skills', cardId) : null;
  if (dir) {
    let total = 0;
    for (const f of filesUnder(dir)) { const t = tokensOf(path.join(dir, f)); add(`file ${f}`, t); total += t; }
    add('folder total', total);
  }
  if (it.kind === 'practice' && it.files) {
    let total = 0;
    for (const f of it.files) { const p = path.join(root, f); if (existsSync(p)) { const t = statSync(p).isDirectory() ? filesUnder(p).reduce((s, x) => s + tokensOf(path.join(p, x)), 0) : tokensOf(p); add(`file ${f}`, t); total += t; } }
    add('files total', total);
    add('stated every-session figure', it.everySessionTokens);
    add('stated on-demand figure', it.onDemandTokens);
  }
  return out;
}

const within = (stated, computed) => Math.abs(stated - computed) <= Math.max(1, computed * TOLERANCE);

// Findings for one card: a front-matter figure that is more than 10% off its computed figure, or a figure in
// the text that is more than 10% off the figure its sentence names, or in a sentence that names none.
// Skill and agent cards must state their description and body figures in the front matter.
export function checkCard(root, cardId, features) {
  const file = path.join(root, 'cards', `${cardId}.md`);
  const text = readFileSync(file, 'utf8');
  const { data, body } = parseFrontmatter(text);
  const allowed = allowedFigures(root, cardId, features);
  const fm = (data && data.tokens) || {};
  const findings = [];
  const item = features.modules.flatMap((m) => m.items).find((it) => it.id === cardId);
  if (item && (item.kind === 'skill' || item.kind === 'agent')) {
    for (const k of ['description', 'body']) {
      if (!(k in fm)) { findings.push(`cards/${cardId}.md: front matter tokens needs "${k}" (computed ${allowed.get(k)})`); continue; }
      if (!within(Number(fm[k]), allowed.get(k))) findings.push(`cards/${cardId}.md: front matter tokens.${k} is ${fm[k]}, computed ${allowed.get(k)}`);
    }
  } else if (features.domains && features.domains.some((d) => `pack-${d.id}` === cardId)) {
    // A domain card states three sizes: the entry alone (light, standard) and the entry with every agent (full).
    const entry = allowed.get('entry description');
    for (const k of ['light', 'standard']) if (k in fm && !within(Number(fm[k]), entry)) findings.push(`cards/${cardId}.md: front matter tokens.${k} is ${fm[k]}, the entry is ${entry}`);
    // Every stub's description is already in the computed figure, so full is held to it like light and standard.
    const full = fullOf(allowed);
    if ('full' in fm && full && !within(Number(fm.full), full)) findings.push(`cards/${cardId}.md: front matter tokens.full is ${fm.full}, the entry with every agent and stub description is ${full}`);
  }
  // A practice states sizes that are choices (what a smaller version of its file would load), so the sizes in
  // the front matter are not held to one file; the figures in its text still are.
  // Figures in the text: "about 2,400 tokens", "2,400 tokens", "~2,400 tokens". Each is held to the figure its
  // sentence names (figureLabels); one in no sentence that names a figure passes only from other_figures.
  const other = Array.isArray(data && data.other_figures) ? data.other_figures.map((x) => Number(String(x).replace(/,/g, ''))).filter(Number.isFinite) : [];
  const labels = figureLabels(allowed, fm);
  for (const s of sentencesOf(body)) {
    for (const m of s.text.matchAll(/(\d{1,3}(?:,\d{3})+|\d+)\s+tokens/g)) {
      const n = Number(m[1].replace(/,/g, ''));
      if (other.some((c) => within(n, c))) continue;
      const where = `cards/${cardId}.md: "${m[0]}" (text line ${body.slice(0, s.start + m.index).split('\n').length})`;
      const label = labelFor(s.text, m.index, labels);
      // A small figure in a sentence that names nothing (a row, a line of a sample) is not a file size; one
      // whose sentence names a figure of the item is held to it like any other.
      if (!label && n < 20) continue;
      if (!label) findings.push(`${where}: its sentence names no figure of the item (say which: ${[...labels.keys()].slice(0, 6).join(', ')}, ...), or list it in other_figures`);
      else if (!label.values.some((c) => within(n, c))) findings.push(`${where} is not within 10% of what "${label.word}" names (${[...new Set(label.values)].join(' or ')})`);
    }
  }
  return findings;
}

const fullOf = (allowed) => allowed.get('entry plus every agent and stub description') ?? allowed.get('entry plus every agent description');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The words a card sentence uses to name a figure, each with the values it may state: "description" and
// "every session", "body", "folder", "files", a file's name; for a domain "entry", "index", "every session",
// an agent's or a stub's name, and "by name" (0) when a stub is started only by name. A front-matter key
// (description, body, light, standard, full) names its computed counterpart where there is one; otherwise
// light, standard and full name the card's own value (a practice's sizes are choices, each a cost every
// session), and any other key names nothing.
const SIZES = ['light', 'standard', 'full'];
export function figureLabels(allowed, fm) {
  const labels = new Map();
  const add = (word, v) => { if (!Number.isFinite(v)) return; if (!labels.has(word)) labels.set(word, []); labels.get(word).push(v); };
  for (const [label, v] of allowed) {
    if (label === 'description') { add('description', v); add('every session', v); }
    else if (label === 'body') add('body', v);
    else if (label === 'folder total') add('folder', v);
    else if (label === 'files total') add('files', v);
    else if (label === 'entry description') { add('entry', v); add('every session', v); }
    else if (label === 'index') add('index', v);
    else if (label === 'stated every-session figure') add('every session', v);
    else if (label === 'stated on-demand figure') add('on demand', v);
    else if (label.startsWith('file ')) add(path.posix.basename(label.slice(5)), v);
    else if (label.startsWith('agent description ')) add(label.slice(18).replace(/\.md$/, ''), v);
    else if (label.startsWith('agent ')) add(label.slice(6).replace(/\.md$/, ''), v);
    else if (label.startsWith('stub description ')) add(label.slice(17), v);
    else if (label === 'stub started by name') add('by name', v);
  }
  const full = fullOf(allowed);
  if (full !== undefined) add('every session', full);
  const counterpart = allowed.has('entry description')
    ? { light: allowed.get('entry description'), standard: allowed.get('entry description'), full }
    : { description: allowed.get('description'), body: allowed.get('body') };
  for (const [k, raw] of Object.entries(fm)) {
    if (Object.hasOwn(counterpart, k) && counterpart[k] !== undefined) { add(k, counterpart[k]); continue; }
    // Only a practice's sizes stand as written; any other key (`folder: 9999`) names no figure.
    if (!SIZES.includes(k)) continue;
    add(k, Number(raw));
    add('every session', Number(raw));
  }
  return labels;
}

// The label a figure at `at` in `sentence` is held to: the nearest label word before it, or when there is
// none before it, the nearest after it. Words match whole, in any case; a longer word wins a tie.
function labelFor(sentence, at, labels) {
  let best = null;
  for (const [word, values] of labels) {
    const re = new RegExp(`(?<![\\w-])${escapeRe(word).replace(/ /g, '\\s+')}(?![\\w-])`, 'gi');
    for (const m of sentence.matchAll(re)) {
      const end = m.index + m[0].length;
      const rank = end <= at ? at - end : m.index >= at ? 1e9 + m.index - at : null;
      if (rank === null) continue;
      if (!best || rank < best.rank || (rank === best.rank && word.length > best.word.length)) best = { word, values, rank };
    }
  }
  return best;
}

// A card's text in blocks: a paragraph, a list item (with its continuation lines) or a heading. A blank line,
// a list marker or a heading starts the next block.
function blocksOf(text) {
  const out = [];
  let block = null;
  let pos = 0;
  for (const line of text.split('\n')) {
    const start = pos;
    pos += line.length + 1;
    if (!line.trim() || /^\s*(?:[-*+]|\d+\.)\s/.test(line) || /^\s*#/.test(line)) {
      if (block) out.push(block);
      block = line.trim() ? { start, text: line } : null;
    } else if (block) block.text += `\n${line}`;
    else block = { start, text: line };
  }
  if (block) out.push(block);
  return out;
}

// A card's text in sentences, each with its offset: within a block, a sentence ends at ".", "!" or "?" (with
// a closing "**") followed by white space and anything but a lower-case letter.
export function sentencesOf(text) {
  return blocksOf(text).flatMap(({ start, text: t }) => {
    const out = [];
    let from = 0;
    for (const m of t.matchAll(/[.!?](?:\*\*)?(?=\s+[^\sa-z])/g)) {
      const end = m.index + m[0].length;
      out.push({ start: start + from, text: t.slice(from, end) });
      from = end;
    }
    out.push({ start: start + from, text: t.slice(from) });
    return out;
  });
}

const namedIn = (text, name) => new RegExp(`(?<![\\w.-])${escapeRe(name)}(?![\\w-]|\\.\\w)`).test(text);

// Findings for a domain card: every script file the domain ships (a file that starts with "#!" or ends in
// .mjs, .cjs, .js, .py or .sh) is named in the card by its file name.
export function checkPackScripts(root, cardId) {
  if (!cardId.startsWith('pack-')) return [];
  const id = cardId.slice(5);
  const dir = path.join(root, 'catalog', 'packs', id);
  if (!existsSync(dir)) return [`cards/${cardId}.md: the kit ships no catalog/packs/${id}/`];
  const card = readFileSync(path.join(root, 'cards', `${cardId}.md`), 'utf8');
  const rel = `catalog/packs/${id}`;
  const scripts = new Set([...filesUnder(dir).filter((r) => /\.(?:mjs|cjs|js|py|sh)$/.test(r)).map((r) => `${rel}/${r}`), ...shebangFiles(root, [rel])]);
  return [...scripts].sort().filter((r) => !namedIn(card, path.posix.basename(r)))
    .map((r) => `cards/${cardId}.md: does not name the script ${r} the domain ships`);
}

// The files of the item a card describes, with paths relative to the item's folder (a domain, a skill) or to
// the kit (an agent, a practice's files).
function shippedFiles(root, cardId) {
  const pack = path.join(root, 'catalog', 'packs', cardId.slice(5));
  if (cardId.startsWith('pack-') && existsSync(pack)) return filesUnder(pack).map((rel) => ({ rel, file: path.join(pack, rel) }));
  const skill = path.join(root, 'catalog', 'skills', cardId);
  if (existsSync(skill)) return filesUnder(skill).map((rel) => ({ rel, file: path.join(skill, rel) }));
  const agent = `catalog/agents/${cardId}.md`;
  if (existsSync(path.join(root, agent))) return [{ rel: agent, file: path.join(root, agent) }];
  const featuresFile = path.join(root, 'catalog', 'features.json');
  if (!existsSync(featuresFile)) return [];
  const it = JSON.parse(readFileSync(featuresFile, 'utf8')).modules.flatMap((m) => m.items).find((x) => x.id === cardId);
  return ((it && it.files) || []).flatMap((f) => {
    const p = path.join(root, f);
    if (!existsSync(p)) return [];
    return statSync(p).isDirectory() ? filesUnder(p).map((r) => ({ rel: `${f}/${r}`, file: path.join(p, r) })) : [{ rel: f, file: p }];
  });
}

// The cards' Watch out sections quote studio leftovers in a list item led by a bold "Studio…" phrase:
// "Studio-specific lines.", "Studio-specific wording.", "Studio-specific names.", "Studio references.",
// "Studio skill names.", "Studio wording.".
const STUDIO_ITEM = /^\s*(?:[-*+]|\d+\.)\s+\*\*Studio\b[^*]*\*\*/;

// Findings for one card: every backticked phrase in its studio-specific items occurs in the shipped item,
// in a file's text or as a file's path.
export function checkStudioLines(root, cardId) {
  const { body } = parseFrontmatter(readFileSync(path.join(root, 'cards', `${cardId}.md`), 'utf8'));
  const items = blocksOf(body).filter((b) => STUDIO_ITEM.test(b.text));
  if (!items.length) return [];
  const files = shippedFiles(root, cardId);
  const texts = files.map((f) => readFileSync(f.file, 'utf8'));
  const occurs = (p) => texts.some((t) => t.includes(p)) || files.some((f) => f.rel === p || f.rel.endsWith(`/${p}`));
  const findings = [];
  for (const b of items) {
    for (const m of b.text.matchAll(/`([^`\n]+)`/g)) {
      if (occurs(m[1])) continue;
      const line = body.slice(0, b.start + m.index).split('\n').length;
      findings.push(`cards/${cardId}.md: \`${m[1]}\` (text line ${line}) is quoted as studio-specific but is not in the shipped item`);
    }
  }
  return findings;
}

// Cards state sizes in tokens, never in bytes (a byte figure is not checked against anything). A figure
// followed by bytes, KB, MB or GB is a finding, unless it is a figure in bytes followed by "divided by 4"
// ("8,000 bytes divided by 4", the estimator spelt out; a KB, MB or GB figure fails even then), or its
// line holds an allowed phrase of that card: { file, phrase, why }, for a documented limit that is
// not a kit file's size. Commands in a Detect section (`wc -c`) carry no figure, so they pass.
export const BYTES_ALLOW = [
  { file: 'cards/memory-index.md', phrase: 'loads the first 200 lines or 25 KB of its own `MEMORY.md`', why: 'Claude Code\'s documented limit for its auto memory (docs/facts.md), not the size of a kit file' },
];
const BYTE_FIGURE = /(?<![\w.,])\d[\d,.]*\s*(?:bytes?\b(?!\s+divided\s+by\s+4)|[KMG]i?B\b|kB\b)/g;

export function checkByteClaims(root, cardId, allow = BYTES_ALLOW) {
  const file = `cards/${cardId}.md`;
  return readFileSync(path.join(root, 'cards', `${cardId}.md`), 'utf8').split(/\r?\n/).flatMap((line, i) => {
    if (allow.some((a) => a.file === file && line.includes(a.phrase))) return [];
    return [...line.matchAll(BYTE_FIGURE)].map((m) => `${file}:${i + 1} "${m[0]}" is a size in bytes; state it in tokens (bytes divided by 4), or drop it`);
  });
}

export function checkAllCards(root) {
  const features = JSON.parse(readFileSync(path.join(root, 'catalog', 'features.json'), 'utf8'));
  const dir = path.join(root, 'cards');
  return readdirSync(dir).filter((f) => f.endsWith('.md')).sort().flatMap((f) => {
    const id = f.slice(0, -3);
    return [...checkCard(root, id, features), ...checkPackScripts(root, id), ...checkStudioLines(root, id), ...checkByteClaims(root, id)];
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const findings = checkAllCards(root);
  for (const f of findings) console.log(f);
  console.log(`card-tokens: ${findings.length} finding(s)`);
  process.exitCode = findings.length ? 1 : 0;
}
