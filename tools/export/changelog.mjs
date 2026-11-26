// tools/export/changelog.mjs
// What changed between exports (per catalog item), the changelog section, and the staleness report
// for hand-written pages (hub sources changed since the last export; facts older than 90 days).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { staleFactSections } from './facts.mjs';
import { parseFrontmatter } from './frontmatter.mjs';
import { walkFiles } from './gates.mjs';
import { hashItem, isSkipped } from './item-hash.mjs';

// A SOURCE.md names the scanner version and date of its last scan; a re-scan with the same verdict is not
// a change to the item, so only the verdict (and, with `findings`, the number of findings) enters the hash
// (item-hash.mjs).
export function itemHashes(root, itemFiles, { findings = false } = {}) {
  return Object.fromEntries(Object.entries(itemFiles).map(([key, files]) => [key, hashItem(root, files, { findings })]));
}

export function diffItems(prev = {}, next = {}) {
  return {
    added: Object.keys(next).filter((k) => !(k in prev)).sort(),
    removed: Object.keys(prev).filter((k) => !(k in next)).sort(),
    changed: Object.keys(next).filter((k) => k in prev && prev[k] !== next[k]).sort(),
  };
}

// The catalog's item files as committed in the kit, the way the build lists them (`built.itemFiles`), for
// what runs without the hub: `npm test` and a state written again from a release commit.
export function catalogItemFiles(root, manifest) {
  const under = (dir) => (existsSync(path.join(root, dir)) ? walkFiles(root, dir).filter((r) => !isSkipped(r)) : []);
  const out = {};
  for (const it of manifest.items) {
    if (it.kind === 'skill' && it.status === 'shipped') out[`skill:${it.id}`] = under(`catalog/skills/${it.id}`);
    else if (it.kind === 'agent' && it.status === 'shipped') out[`agent:${it.id}`] = [`catalog/agents/${it.id}.md`];
    else if (it.kind === 'pack' && under(`catalog/packs/${it.id}`).length) out[`pack:${it.id}`] = under(`catalog/packs/${it.id}`);
  }
  return out;
}

// Everything on the menu that a release compares, with the files that make it up: each catalog item with
// its adoption card, each practice with its card and the files it installs (a folder file by file, the
// gitignored never-share list someone keeps beside the hook templates left out), and an outside item with
// its card. A changed card or template is then a change to its item, and update mode asks about it again.
// A card is named for its item, `pack-<id>` for a domain (as the cards gate has it).
export function releaseItemFiles(root, manifest, itemFiles) {
  const card = (id) => (existsSync(path.join(root, 'cards', `${id}.md`)) ? [`cards/${id}.md`] : []);
  const expand = (rel) => (statSync(path.join(root, rel)).isDirectory()
    ? walkFiles(root, rel).filter((r) => !isSkipped(r) && path.posix.basename(r) !== 'never-share.local.txt') : [rel]);
  const out = {};
  for (const [key, files] of Object.entries(itemFiles)) {
    const [kind, id] = key.split(':');
    out[key] = [...new Set([...files, ...card(kind === 'pack' ? `pack-${id}` : id)])];
  }
  for (const it of manifest?.items || []) {
    if (it.kind === 'practice' && it.status === 'shipped') out[`practice:${it.id}`] = [...new Set([...(it.files || []).flatMap(expand), ...card(it.id)])];
    else if (it.kind === 'external' && it.status === 'link-only') out[`external:${it.id}`] = card(it.id);
  }
  return out;
}

// An agent is one file with no SOURCE.md to carry its last scan, so its recorded verdict, score and number
// of findings (scans.json) enter its hash: a new verdict or finding count lists it as changed, as for a skill.
const scanLine = (rec) => (rec ? `${rec.recommendation} ${rec.score}; findings: ${Array.isArray(rec.findings) ? rec.findings.length : '?'}` : 'no scan');
function releaseHashes(root, items, scans) {
  const hashes = itemHashes(root, items, { findings: true });
  for (const key of Object.keys(hashes).filter((k) => k.startsWith('agent:'))) {
    hashes[key] = createHash('sha256').update(hashes[key]).update('\0').update(scanLine(scans[key])).digest('hex').slice(0, 16);
  }
  return hashes;
}

// What a release lists against the previous state, and the items of the state it writes. The state says
// how its hashes were made (`hashes`). An older state is compared in its own form, on the catalog items it
// tracked: no finding counts in v3.3.0 and earlier (no `hashes`), no cards, practices or agent scans in
// v3.4.0 (`verdict+findings`). Compared in the new form, every item would look changed. The new state is
// always written in the new form.
export const HASHES = 'verdict+findings+cards';
export function releaseDiff(root, itemFiles, prev, { manifest, scans = {} } = {}) {
  const items = releaseHashes(root, releaseItemFiles(root, manifest, itemFiles), scans);
  const compare = !prev || prev.hashes === HASHES ? items : itemHashes(root, itemFiles, { findings: prev.hashes === 'verdict+findings' });
  return { diff: diffItems(prev?.items, compare), state: { hashes: HASHES, items } };
}

// Removals recorded in the manifest (`removed`: kind, id, was, in, and a `replacedBy` domain or a `note`)
// for this version, grouped by what replaces them, so an adopter's recorded decision about a removed item
// finds its answer instead of a silent gap.
function removedLines(removed, version, shippedPacks) {
  const here = removed.filter((r) => r.in === version);
  if (!here.length) return [];
  const code = (s) => `\`${s}\``;
  const groups = new Map();
  for (const r of here) {
    const to = r.replacedBy && shippedPacks.includes(r.replacedBy) ? `the domain ${code(r.replacedBy)}`
      : r.note ? r.note
      : r.replacedBy ? `none in this version; its domain ${code(r.replacedBy)} is not shipped yet`
      : 'no longer part of the kit';
    groups.set(to, [...(groups.get(to) || []), `${r.kind}:${r.id}`]);
  }
  return ['**Removed in this version, with what replaces each:**', '',
    ...[...groups].map(([to, keys]) => `- ${keys.sort().map(code).join(', ')} → ${to}`), ''];
}

export function changelogSection(version, date, diff, notes = [], { removed = [], shippedPacks = [] } = {}) {
  const list = (label, keys) => (keys.length ? [`**${label}:** ${keys.map((k) => `\`${k}\``).join(', ')}`, ''] : []);
  const gone = removedLines(removed, version, shippedPacks);
  const any = diff.added.length + diff.changed.length + diff.removed.length + gone.length > 0;
  return [`## v${version} (${date})`, '',
    ...notes.map((n) => `- ${n}`), ...(notes.length ? [''] : []),
    ...list('Added', diff.added), ...list('Changed', diff.changed), ...list('Removed', diff.removed), ...gone,
    ...(any ? [] : ['No catalog changes.', '']), ''].join('\n');
}

export const CHANGELOG_HEAD = '# Changelog\n\nEach export adds a section at the top. `drill-to-adopt` in update mode reads this file.\n\n';

// The file may come back from a Windows checkout with CRLF endings; it is read as LF and written as LF.
export function prependChangelog(file, section) {
  const old = existsSync(file) ? readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/^# Changelog\n\n[^\n]*\n\n?/, '') : '';
  writeFileSync(file, CHANGELOG_HEAD + section + old);
}

const defaultGitLog = (hub, since, file) =>
  execFileSync('git', ['-C', hub, 'log', '--format=%h', `${since}..HEAD`, '--', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

const isHandPage = (r) => r.endsWith('.md') && (r.startsWith('modules/') || r.startsWith('examples/') || ['START-HERE.md', 'ADOPT.md', 'PRINCIPLES.md', 'docs/facts.md'].includes(r));

// `extra` maps a page to hub sources it may not name in its own front matter (from the gitignored
// private.local.txt): they are tracked like the rest, but no committed file carries them.
const handPages = (root, extra = {}) => walkFiles(root).filter(isHandPage)
  .map((r) => ({ page: r, data: parseFrontmatter(readFileSync(path.join(root, r), 'utf8')).data }))
  .filter((p) => p.data)
  .map((p) => ({ ...p, sources: [...(Array.isArray(p.data.studio_sources) ? p.data.studio_sources : []), ...(extra[p.page] || [])] }));

// Every hub file a hand-written page summarizes (its `studio_sources:`), for the release's clean-hub check.
export const pageSources = (root, extra) => [...new Set(handPages(root, extra).flatMap((p) => p.sources))];

export function staleness(root, { hub, sinceCommit, today, maxAgeDays = 90, gitLog = defaultGitLog, extra = {} }) {
  const changedSources = [];
  const staleFacts = [];
  const warnings = [];
  let gitOk = Boolean(sinceCommit);
  for (const { page: r, data, sources } of handPages(root, extra)) {
    for (const s of sources) {
      if (!gitOk) break;
      try {
        if (gitLog(hub, sinceCommit, s)) changedSources.push({ page: r, source: s });
      } catch (e) {
        warnings.push(`could not compare hub sources since ${sinceCommit} (${e.message.split('\n')[0]}); was the hub history rewritten? Review every page by hand this time.`);
        gitOk = false;
      }
    }
    // docs/facts.md is dated fact by fact (facts.mjs); every other page by its `checked:`.
    if (r === 'docs/facts.md') {
      for (const s of staleFactSections(readFileSync(path.join(root, r), 'utf8'), today)) staleFacts.push({ page: r, section: s.section, count: s.count, window: s.window, checked: s.oldest });
    } else if (data.checked && (Date.parse(today) - Date.parse(data.checked)) / 86400000 > maxAgeDays) staleFacts.push({ page: r, checked: data.checked });
  }
  return { changedSources, staleFacts, warnings };
}
