// tools/export/manifest.mjs
// The allowlist: every hub skill and agent must be classified; only "shipped" items leave the hub.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from './frontmatter.mjs';
import { isLicenceFile } from './rules.mjs';

export const STATUSES = ['shipped', 'link-only', 'catalog-only', 'private'];
export const PACKS = ['foundation', 'way-of-working', 'data-work', 'catalog', 'none'];
export const KINDS = ['skill', 'agent', 'external', 'practice'];
export const IMPORTANCE = ['core', 'recommended', 'optional'];
export const LOADS = ['none', 'on-demand', 'every-session'];
export const WHY_MAX = 140;
const SHIP_PACKS = ['foundation', 'way-of-working', 'data-work'];

export const loadManifest = (file) => JSON.parse(readFileSync(file, 'utf8'));

// The feature menu: everything the kit ships or links to, practices included.
export const isMenuItem = (it) => it.kind === 'practice' || it.status === 'shipped' || it.status === 'link-only';
const keyOf = (it) => `${it.kind}:${it.id}`;

// importance and why are a string (every profile) or an object { default, data?, ml?, software? }.
export const PROFILE_KEYS = ['default', 'data', 'ml', 'software'];
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const values = (v) => (isObj(v) ? Object.values(v) : [v]);

// One line per broken rule, naming every offending item, the way the unclassified report does.
function menuErrors(m) {
  const menu = m.items.filter(isMenuItem);
  const str = (v) => typeof v === 'string' && v.trim() !== '';
  const has = (v) => str(v) || (isObj(v) && Object.keys(v).length > 0);
  const listed = (label, bad) => (bad.length ? [`${label}: ${bad.map(keyOf).join(', ')}`] : []);
  const explicitLoads = menu.filter((it) => it.kind === 'practice' || it.kind === 'external');
  const shaped = menu.filter((it) => has(it.importance) && has(it.why));
  return [
    ...listed('menu items without importance or why (add both in export.manifest.json)', menu.filter((it) => !has(it.importance) || !has(it.why))),
    ...listed('importance or why given per profile without a default', shaped.filter((it) => [it.importance, it.why].some((v) => isObj(v) && !str(v.default) ))),
    ...listed(`importance or why with a key other than ${PROFILE_KEYS.slice(0, -1).join(', ')} or ${PROFILE_KEYS.at(-1)}`,
      shaped.filter((it) => [it.importance, it.why].some((v) => isObj(v) && Object.keys(v).some((k) => !PROFILE_KEYS.includes(k))))),
    ...listed(`importance must be ${IMPORTANCE.slice(0, -1).join(', ')} or ${IMPORTANCE.at(-1)}`, shaped.filter((it) => values(it.importance).some((v) => !IMPORTANCE.includes(v)))),
    ...listed(`why longer than ${WHY_MAX} characters`, shaped.filter((it) => values(it.why).some((v) => !str(v) || v.length > WHY_MAX))),
    ...listed('practices and outside items without loads (none, on-demand or every-session)', explicitLoads.filter((it) => !LOADS.includes(it.loads))),
    ...listed('practices without files (the kit paths they adopt)', menu.filter((it) => it.kind === 'practice' && !(Array.isArray(it.files) && it.files.length))),
    ...listed('practices without a title', menu.filter((it) => it.kind === 'practice' && !has(it.title))),
    ...listed('outside items that load every session need everySessionTokens',
      menu.filter((it) => it.kind === 'external' && it.loads === 'every-session' && !Number.isInteger(it.everySessionTokens))),
  ];
}

export function validateManifest(m) {
  if (!m || !Array.isArray(m.items)) return ['manifest has no items array'];
  const errors = [...menuErrors(m)];
  if (m.later !== undefined) {
    const bad = Array.isArray(m.later) ? m.later.filter((l) => !l || !l.id || !l.title || !l.why) : [{ id: 'later is not a list' }];
    if (bad.length) errors.push(`later items need id, title and why: ${bad.map((l) => (l && l.id) || '?').join(', ')}`);
  }
  const seen = new Set();
  for (const it of m.items) {
    const key = `${it.kind}:${it.id}`;
    if (seen.has(key)) errors.push(`${key}: listed twice`);
    seen.add(key);
    if (!KINDS.includes(it.kind)) errors.push(`${key}: kind must be one of ${KINDS.join(', ')}`);
    if (!STATUSES.includes(it.status)) errors.push(`${key}: status must be one of ${STATUSES.join(', ')}`);
    if (!PACKS.includes(it.pack)) errors.push(`${key}: pack must be one of ${PACKS.join(', ')}`);
    if (it.kind === 'external' && (!it.upstream || !it.licence || !it.install)) errors.push(`${key}: an external item needs upstream, licence and install`);
    if (it.kind === 'external' && it.status === 'shipped') errors.push(`${key}: external items are never shipped (link-only or catalog-only)`);
    if (it.status === 'shipped' && !SHIP_PACKS.includes(it.pack)) errors.push(`${key}: a shipped item belongs to ${SHIP_PACKS.join(', ')}`);
    if (it.status === 'private' && it.pack !== 'none') errors.push(`${key}: a private item has pack "none"`);
    if (it.kind === 'practice' && it.status !== 'shipped') errors.push(`${key}: a practice ships in the kit (status "shipped")`);
    if (isMenuItem(it) && !it.module) errors.push(`${key}: a menu item names its module`);
  }
  return errors;
}

export function hubInventory(hub) {
  const sdir = path.join(hub, '.claude', 'skills');
  const adir = path.join(hub, '.claude', 'agents');
  const skills = readdirSync(sdir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(path.join(sdir, d.name, 'SKILL.md')))
    .map((d) => d.name).sort();
  const agents = existsSync(adir)
    ? readdirSync(adir).filter((f) => f.endsWith('.md') && !['AGENTS.md', 'README.md', 'CLAUDE.md'].includes(f)).map((f) => f.slice(0, -3)).sort()
    : [];
  return { skills, agents };
}

export function classify(inventory, manifest) {
  const listed = new Set(manifest.items.map((it) => `${it.kind}:${it.id}`));
  const present = new Set([...inventory.skills.map((s) => `skill:${s}`), ...inventory.agents.map((a) => `agent:${a}`)]);
  const unclassified = [...present].filter((k) => !listed.has(k)).sort();
  const missing = manifest.items.filter((it) => (it.kind === 'skill' || it.kind === 'agent') && !present.has(`${it.kind}:${it.id}`))
    .map((it) => `${it.kind}:${it.id}`).sort();
  return { unclassified, missing };
}

const repoIn = (s) => (String(s).replace(/https?:\/\/github\.com\//g, '').match(/\b([A-Za-z0-9][\w.-]*\/[\w.-]+)/) || [])[1];

export function readSkillMeta(skillDir) {
  const { data } = parseFrontmatter(readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8'));
  const fm = data || {};
  const md = fm.metadata && typeof fm.metadata === 'object' ? fm.metadata : {};
  const author = String(md.author || fm.author || '');
  const sources = Array.isArray(md.sources) ? md.sources : [];
  const licenceFile = readdirSync(skillDir).find(isLicenceFile) || null;
  // Every copyright notice line ("Copyright (c) 2026 Someone", "Copyright 2025 Someone", "© ..."): a skill
  // folded from two upstreams carries both holders. A licence's legal text that only mentions copyright
  // (Creative Commons, for one) is not a notice and yields none.
  const licenceLine = licenceFile
    ? readFileSync(path.join(skillDir, licenceFile), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => /^(?:Copyright\s+(?:\(c\)|©|\d{4})|©)/i.test(l)).join('; ') || null
    : null;
  const thirdParty = licenceFile !== null || /adapted by/i.test(author) || (author !== '' && !/^Richicinschi/i.test(author));
  // Every upstream, in order: a skill folded from two sources names both.
  const repos = thirdParty
    ? [...new Set([author, ...sources].map(repoIn).filter((r) => r && !/^(engineering|productivity|misc|skills)\//.test(r)).map((r) => r.replace(/\.git$/, '')))]
    : [];
  const upstreams = repos.map((r) => `https://github.com/${r}`);
  return {
    name: String(fm.name || ''), description: String(fm.description || ''), author, sources,
    licenceFile, licenceLine, thirdParty, upstream: upstreams[0] || null, upstreams,
  };
}
