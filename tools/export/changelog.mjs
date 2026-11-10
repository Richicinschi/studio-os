// tools/export/changelog.mjs
// What changed between exports (per catalog item), the changelog section, and the staleness report
// for hand-written pages (hub sources changed since the last export; facts older than 90 days).
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from './frontmatter.mjs';
import { walkFiles } from './gates.mjs';

// A SOURCE.md names the scanner version and date of its last scan; a re-scan with the same verdict is not
// a change to the item, so only the verdict enters the hash.
const hashable = (f, buf) => (f.endsWith('/SOURCE.md')
  ? Buffer.from(buf.toString('utf8').replace(/^(- \*\*Last scan:\*\* \S+ \(risk [^)]*\)).*$/m, '$1'))
  : buf);

export function itemHashes(root, itemFiles) {
  const out = {};
  for (const [key, files] of Object.entries(itemFiles)) {
    const h = createHash('sha256');
    for (const f of [...files].sort()) h.update(f).update('\0').update(hashable(f, readFileSync(path.join(root, f)))).update('\0');
    out[key] = h.digest('hex').slice(0, 16);
  }
  return out;
}

export function diffItems(prev = {}, next = {}) {
  return {
    added: Object.keys(next).filter((k) => !(k in prev)).sort(),
    removed: Object.keys(prev).filter((k) => !(k in next)).sort(),
    changed: Object.keys(next).filter((k) => k in prev && prev[k] !== next[k]).sort(),
  };
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
    if (data.checked && (Date.parse(today) - Date.parse(data.checked)) / 86400000 > maxAgeDays) staleFacts.push({ page: r, checked: data.checked });
  }
  return { changedSources, staleFacts, warnings };
}
