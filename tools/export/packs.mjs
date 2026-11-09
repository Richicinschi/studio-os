// tools/export/packs.mjs
// Which hub packs may leave the hub: only a pack that is entirely the studio's own text.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from './frontmatter.mjs';
import { isLicenceFile } from './rules.mjs';

// Pack files that are internal to the hub and never ship: the routing tests, the provenance record,
// the scan notes and pack.json (the kit reads the pack's shape from the files themselves).
export const PACK_INTERNAL = new Set(['pack.json', 'provenance.json', 'SCAN.md', 'tests']);

function filesUnder(dir, rel = '') {
  const out = [];
  for (const ent of readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${ent.name}` : ent.name;
    if (ent.isDirectory()) out.push(...filesUnder(dir, r));
    else out.push(r);
  }
  return out;
}

function vendoredIds(hub) {
  const file = path.join(hub, '.claude', 'skills', 'vendored.json');
  if (!existsSync(file)) return {};
  const v = JSON.parse(readFileSync(file, 'utf8'));
  const byId = {};
  for (const src of v.sources || []) for (const [id, rec] of Object.entries(src.skills || {})) byId[id] = rec;
  return byId;
}

// { ok, reasons }: a pack fails when any of its skills carries a LICENSE file, an author line that says
// "adapted", an upstream in its front matter, or a vendored.json entry that is not marked rewritten.
export function packShippable(hub, packId) {
  const dir = path.join(hub, 'library', packId);
  const reasons = [];
  const pack = JSON.parse(readFileSync(path.join(dir, 'pack.json'), 'utf8'));
  const vendored = vendoredIds(hub);
  for (const rel of filesUnder(dir)) {
    if (isLicenceFile(path.basename(rel))) reasons.push(`${rel}: a licence file, so third-party text`);
  }
  for (const s of pack.skills || []) {
    const file = path.join(dir, 'skills', `${s.id}.md`);
    if (existsSync(file)) {
      const { data } = parseFrontmatter(readFileSync(file, 'utf8'));
      const fm = data || {};
      const md = fm.metadata && typeof fm.metadata === 'object' ? fm.metadata : {};
      const author = String(md.author || fm.author || '');
      if (/adapted/i.test(author)) reasons.push(`skills/${s.id}.md: author says "${author}"`);
      if (fm.upstream || md.upstream || (Array.isArray(md.sources) && md.sources.length)) reasons.push(`skills/${s.id}.md: names an upstream`);
    }
    const rec = vendored[s.id];
    if (rec && rec.rewritten !== true) reasons.push(`skills/${s.id}.md: ${s.id} is a vendored third-party copy (${rec.disposition || 'recorded'}) and is not marked rewritten`);
  }
  return { ok: reasons.length === 0, reasons };
}

// Every file a shipped pack copies, relative to library/<id>/: the entry, the skills, the agents.
export function packSourceFiles(hub, packId) {
  const dir = path.join(hub, 'library', packId);
  return filesUnder(dir).filter((r) => !PACK_INTERNAL.has(r.split('/')[0]));
}

// A manifest pack is `public` (ships when packShippable says so), `shipped` (must be shippable or the
// build stops), `withheld`, or `private`. resolvePacks turns every `public` pack into shipped or
// withheld, so no one flips a pack by hand: the rewrite merging into the hub is what flips it. A pack
// with a `hold` stays withheld until the hold is removed. A withheld pack carries its `reasons`.
export function resolvePacks(hub, manifest) {
  return {
    ...manifest,
    items: manifest.items.map((it) => {
      if (it.kind !== 'pack' || it.status !== 'public') return it;
      if (it.hold) return { ...it, status: 'withheld', reasons: [`hold: ${it.hold}`] };
      const { ok, reasons } = packShippable(hub, it.id);
      return ok ? { ...it, status: 'shipped' } : { ...it, status: 'withheld', reasons };
    }),
  };
}

// The router skill maps tasks to skills in a table: one row per task, the skill in the second cell. In the kit
// a row stays only when its skill ships (a core skill, a shipped pack or one of its skills) or is a built-in
// slash command; a row for a withheld or private pack's skill, or for a standalone command that belongs to
// one, goes. Table lines only; headings and prose are left to the rewrite list.
export function pruneRouterRows(text, { known, goneSlash = new Set() }) {
  const dropped = [];
  const out = text.split('\n').filter((line) => {
    if (!line.startsWith('|')) return true;
    const cells = line.split('|').map((c) => c.trim());
    const go = cells[2];
    if (!go || /^-+$/.test(go) || go === 'Go to') return true;
    const first = (go.match(/`([^`]+)`/) || [])[1];
    if (!first) return true;
    if (first.startsWith('/')) {
      if (goneSlash.has(first.slice(1))) { dropped.push(first); return false; }
      return true;
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(first)) return true;
    if (known.has(first)) return true;
    dropped.push(first);
    return false;
  });
  return { text: out.join('\n'), dropped };
}
