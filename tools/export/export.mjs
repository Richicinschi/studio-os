// tools/export/export.mjs
// Export the kit from the hub. The catalog is built into a staging copy of the kit and every gate runs
// there; the kit itself changes only when every gate passes. With --release the content lint runs too,
// then the changelog section and the state snapshot are written.
//   node tools/export/export.mjs --hub <path to the studio hub>
//   node tools/export/export.mjs --hub <hub> --release 2.0.0 --note "What this release is about."
//   --no-gitleaks only for a dry run on a machine without gitleaks; never for a release.
// Exit codes: 0 done, 1 a gate failed (the kit is unchanged), 2 refused before building.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadManifest } from './manifest.mjs';
import { loadDenyList, loadOwnerName, loadLocalRewrites, STUDIO_REWRITES } from './rules.mjs';
import { buildKit } from './build.mjs';
import { gateSecrets, gateGitleaks, gatePrivacy, gatePaths, gateAccounting, gateLinks, gateNotes, gateDiagramUrls, gateCards, isLocalOnly } from './gates.mjs';
import { itemHashes, diffItems, changelogSection, prependChangelog, staleness, pageSources } from './changelog.mjs';
import { lintKit } from './lint-content.mjs';

// What the build produces; only these move from the staging copy into the kit.
const GENERATED = ['catalog', 'docs/THIRD_PARTY_NOTICES.md'];

const defaultHubGit = (hub, args) => execFileSync('git', ['-C', hub, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

export function runExport({ root, hub, release, notes = [], noGitleaks = false, today = new Date().toISOString().slice(0, 10),
  gitleaks = gateGitleaks, hubGit = defaultHubGit, log = console.log, rewrites = STUDIO_REWRITES }) {
  if (release && noGitleaks) { log('export: a release always runs gitleaks'); return 2; }
  const local = (f) => path.join(root, 'tools/export', f);
  let manifest; let deny; let owner; let localRewrites;
  try {
    manifest = loadManifest(path.join(root, 'export.manifest.json'));
    deny = loadDenyList(local('privacy.local.txt'));
    owner = loadOwnerName(local('owner.local.txt'));
    // The local entries are file-specific, so they go first (specific before generic).
    localRewrites = loadLocalRewrites(local('rewrites.local.json'));
  } catch (e) { log(`export: ${e.message}`); return 2; }
  // The gitignored private.local.txt holds what no committed file may name: `kind:id` lines are hub
  // items never exported (they count as private items), and `source <kit page> <hub path>` lines are
  // hub sources a page may not list in its front matter (staleness and the clean-hub check follow them).
  // It is required: without it those sources would drop out of the checks without a word.
  const extraSources = {};
  if (!existsSync(local('private.local.txt'))) {
    log(`export: private list missing: ${local('private.local.txt')} (copy private.local.example.txt and fill it; never commit it)`);
    return 2;
  }
  {
    const lines = readFileSync(local('private.local.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    for (const l of lines.filter((x) => x.startsWith('source '))) {
      const [, page, src] = l.split(/\s+/);
      if (page && src) extraSources[page] = [...(extraSources[page] || []), src];
    }
    const priv = lines.filter((x) => !x.startsWith('source ')).map((l) => { const [kind, id] = l.split(':'); return { id, kind, status: 'private', pack: 'none' }; });
    manifest = { ...manifest, items: [...manifest.items, ...priv.filter((p) => !manifest.items.some((it) => it.kind === p.kind && it.id === p.id))] };
  }

  const noteFindings = gateNotes(notes, deny);
  if (noteFindings.length) {
    for (const f of noteFindings) log(`  ${f}`);
    log('export: a --note fails the gates; nothing was built');
    return 2;
  }
  if (release) {
    const dirty = hubGit(hub, ['status', '--porcelain', '--', '.claude', ...pageSources(root, extraSources)]);
    if (dirty) { log(`export: the hub has uncommitted changes in what the export reads; commit them, or pass --hub a clean checkout:\n${dirty}`); return 2; }
  }

  const scansPath = local('scans.json');
  const scans = existsSync(scansPath) ? JSON.parse(readFileSync(scansPath, 'utf8')) : {};
  const stage = mkdtempSync(path.join(os.tmpdir(), 'kit-stage-'));
  try {
    cpSync(root, stage, { recursive: true, filter: (src) => {
      const rel = path.relative(root, src).split(path.sep).join('/');
      return !(rel === '.git' || rel.startsWith('.git/') || rel.split('/').includes('node_modules') || isLocalOnly(rel));
    } });
    let built;
    try { built = buildKit({ hub, out: stage, manifest, scans, owner, rewrites: [...localRewrites, ...rewrites] }); } catch (e) { log(`export: ${e.message}`); return 1; }

    const checks = {
      secrets: [...gateSecrets(stage), ...(noGitleaks ? [] : gitleaks(stage))],
      privacy: gatePrivacy(stage, deny),
      paths: gatePaths(stage),
      accounting: [...gateAccounting(stage, { written: built.written, notices: built.notices, manifest }), ...gateDiagramUrls(stage)],
      links: gateLinks(stage),
      cards: gateCards(stage, manifest),
      ...(release ? { lint: lintKit(stage) } : {}),
    };
    let failed = 0;
    for (const [name, findings] of Object.entries(checks)) {
      log(`${name}: ${findings.length ? `FAIL (${findings.length})` : 'pass'}`);
      for (const f of findings.slice(0, 50)) log(`  ${f}`);
      failed += findings.length;
    }
    const prev = existsSync(local('state.json')) ? JSON.parse(readFileSync(local('state.json'), 'utf8')) : null;
    const stale = staleness(root, { hub, sinceCommit: prev?.hubCommit, today, extra: extraSources });
    for (const w of stale.warnings) log(`stale: ${w}`);
    for (const s of stale.changedSources) log(`stale: ${s.page} summarizes ${s.source}, which changed in the hub`);
    for (const s of stale.staleFacts) log(`stale: ${s.page} facts last checked ${s.checked}`);
    log(`built ${built.written.length} file(s) from ${hub}`);
    if (failed) { log(`export: ${failed} finding(s); the kit was not changed`); return 1; }

    for (const g of GENERATED) {
      rmSync(path.join(root, g), { recursive: true, force: true });
      cpSync(path.join(stage, g), path.join(root, g), { recursive: true });
    }
    if (release) {
      const items = itemHashes(root, built.itemFiles);
      const diff = diffItems(prev?.items, items);
      prependChangelog(path.join(root, 'CHANGELOG.md'), changelogSection(release, today, diff, notes));
      writeFileSync(local('state.json'), `${JSON.stringify({ version: release, date: today, hubCommit: hubGit(hub, ['rev-parse', 'HEAD']), items }, null, 2)}\n`);
      log(`released v${release}: ${diff.added.length} added, ${diff.changed.length} changed, ${diff.removed.length} removed`);
    }
    return 0;
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  if (!arg('--hub')) { console.error('export: pass --hub <path to the studio hub>'); process.exit(2); }
  process.exit(runExport({
    root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'),
    hub: path.resolve(arg('--hub')),
    release: arg('--release'),
    notes: argv.flatMap((a, i) => (a === '--note' ? [argv[i + 1]] : [])),
    noGitleaks: argv.includes('--no-gitleaks'),
  }));
}
