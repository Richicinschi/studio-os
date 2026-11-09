// tools/export/card-tokens.mjs
// The token figures a card may state, computed from the built kit with the estimator the kit uses
// everywhere else (bytes divided by 4, rounded up). A card states a figure either in its front matter
// (`tokens:`) or in its text ("about 2,400 tokens"); checkCard compares both with the computed set.
//   node tools/export/card-tokens.mjs        # list every figure that is more than 10% off
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseFrontmatter } from './frontmatter.mjs';

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
    // A standalone stub is a one-line skill with its own description.
    let stubDescriptions = 0;
    const stubDir = path.join(root, 'catalog', 'packs', domain.id, 'stubs');
    if (existsSync(stubDir)) for (const e of readdirSync(stubDir, { withFileTypes: true }).filter((x) => x.isDirectory())) {
      const d = parseFrontmatter(readFileSync(path.join(stubDir, e.name, 'SKILL.md'), 'utf8')).data;
      const t = tokens(Buffer.byteLength(String((d && d.description) || ''), 'utf8'));
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
  add('description', it.everySessionTokens);
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

// Findings for one card: a front-matter figure or a figure in the text that is within 10% of no computed figure.
// Skill and agent cards must state their description and body figures in the front matter.
export function checkCard(root, cardId, features) {
  const file = path.join(root, 'cards', `${cardId}.md`);
  const text = readFileSync(file, 'utf8');
  const { data, body } = parseFrontmatter(text);
  const allowed = allowedFigures(root, cardId, features);
  const fm = (data && data.tokens) || {};
  const findings = [];
  const fmValues = Object.entries(fm).map(([k, v]) => [k, Number(v)]).filter(([, v]) => Number.isFinite(v));
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
    const full = allowed.get('entry plus every agent and stub description') ?? allowed.get('entry plus every agent description');
    // The stub for a domain's standalone command adds one more description, so the card may state up to 10% more.
    if ('full' in fm && full && !within(Number(fm.full), full) && !within(Number(fm.full), full * 1.1)) findings.push(`cards/${cardId}.md: front matter tokens.full is ${fm.full}, the entry with every agent and stub description is ${full}`);
  }
  // A practice states sizes that are choices (what a smaller version of its file would load), so the sizes in
  // the front matter are not held to one file; the figures in its text still are.
  // Figures in the text: "about 2,400 tokens", "2,400 tokens", "~2,400 tokens".
  const stated = new Set([...fmValues.map(([, v]) => v), ...(Array.isArray(data && data.other_figures) ? data.other_figures.map((x) => Number(String(x).replace(/,/g, ''))).filter(Number.isFinite) : [])]);
  for (const m of body.matchAll(/(\d{1,3}(?:,\d{3})+|\d+)\s+tokens/g)) {
    const n = Number(m[1].replace(/,/g, ''));
    if (n < 20) continue;
    if ([...allowed.values()].some((c) => within(n, c)) || [...stated].some((c) => within(n, c))) continue;
    const line = body.slice(0, m.index).split('\n').length;
    findings.push(`cards/${cardId}.md: "${m[0]}" (text line ${line}) is within 10% of no computed figure`);
  }
  return findings;
}

export function checkAllCards(root) {
  const features = JSON.parse(readFileSync(path.join(root, 'catalog', 'features.json'), 'utf8'));
  const dir = path.join(root, 'cards');
  return readdirSync(dir).filter((f) => f.endsWith('.md')).sort().flatMap((f) => checkCard(root, f.slice(0, -3), features));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const findings = checkAllCards(root);
  for (const f of findings) console.log(f);
  console.log(`card-tokens: ${findings.length} finding(s)`);
  process.exitCode = findings.length ? 1 : 0;
}
