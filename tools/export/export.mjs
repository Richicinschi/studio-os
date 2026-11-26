// tools/export/export.mjs
// Export the kit from the hub. The catalog is built into a staging copy of the kit and every gate runs
// there; the kit itself changes only when every gate passes. With --release the content lint runs too,
// then the changelog section and the state snapshot are written.
//   node tools/export/export.mjs --hub <path to the studio hub>
//   node tools/export/export.mjs --hub <hub> --release 2.0.0 --note "What this release is about."
//   --no-gitleaks only for a dry run on a machine without gitleaks; never for a release.
// After the copy, every shipped file that starts with #! is marked executable in the kit's git index.
// Exit codes: 0 done; 1 the build stopped or a gate failed (the kit is unchanged), or the kit is not a git
// work tree or git could not mark the scripts executable (the catalog was copied; the release files were
// not written); 2 refused before building.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadManifest, hubInventory } from './manifest.mjs';
import { loadDenyList, loadOwnerName, loadLocalRewrites, STUDIO_REWRITES } from './rules.mjs';
import { buildKit } from './build.mjs';
import { resolvePacks } from './packs.mjs';
import { gateSecrets, gateGitleaks, gatePrivacy, gatePaths, gateRisky, gateAccounting, gateLinks, gateNotes, gateDiagramUrls, gateCards, gateTriage, gateScanner, gateStudioBlocks, gateMarkers, gateNames, gateJson, shebangFiles, isLocalOnly } from './gates.mjs';
import { parseTriage, scanItemHashes } from './scan.mjs';
import { isSkipped } from './item-hash.mjs';
import { releaseDiff, changelogSection, prependChangelog, staleness, pageSources } from './changelog.mjs';
import { descriptionOverlaps, shippedDescriptions, knownOverlaps, pairName } from './overlap.mjs';
import { phaseLoads } from './phase-loads.mjs';
import { changedFiles, gateWhy, groupFiles, pagePath, parseWhy, releaseFilesPage } from './release-files.mjs';
import { lintKit } from './lint-content.mjs';

// What the build produces; only these move from the staging copy into the kit.
const GENERATED = ['catalog', 'docs/THIRD_PARTY_NOTICES.md'];

const defaultGit = (dir, args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

export function runExport({ root, hub, release, notes = [], whys = [], noGitleaks = false, today = new Date().toISOString().slice(0, 10),
  gitleaks = gateGitleaks, hubGit = defaultGit, kitGit = defaultGit, log = console.log, rewrites = STUDIO_REWRITES }) {
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
    // What the list keeps out of the kit by name is also denied in every file the export builds, so a core skill
    // that cites such an item fails the privacy gate (reported by list position, never by name).
    deny = [...deny, ...[...priv.map((p) => p.id), ...hubInventory(hub).hiddenPacks.map((p) => p.id)].filter((id, i, a) => id && !deny.includes(id) && a.indexOf(id) === i)];
    manifest = { ...manifest, items: [...manifest.items, ...priv.filter((p) => !manifest.items.some((it) => it.kind === p.kind && it.id === p.id))] };
  }

  // The why lines of the release's files page are written into the kit like a note, so they pass the same gate.
  let why;
  try { why = parseWhy(whys); } catch (e) { log(`export: ${e.message}`); return 2; }
  const noteFindings = [...gateNotes(notes, deny), ...gateWhy(why, deny)];
  if (noteFindings.length) {
    for (const f of noteFindings) log(`  ${f}`);
    log('export: a --note or --why fails the gates; nothing was built');
    return 2;
  }
  // The files page compares the release with the tree the last release published, its tag.
  const lastState = existsSync(local('state.json')) ? JSON.parse(readFileSync(local('state.json'), 'utf8')) : null;
  // A release already made in this checkout is not made again: its changelog section and state exist. Its
  // files page can be written again on its own, with why lines, by release-files.mjs.
  if (release && lastState?.version === release) {
    log(`export: v${release} is already released in this checkout (tools/export/state.json); to write its files page again, run node tools/export/release-files.mjs page --previous <the release before> --release ${release} --why "<group>=<text>"`);
    return 2;
  }
  // The groups a release's files page will have, so its --why lines can be written before the release.
  const lastTag = lastState?.version ? `v${lastState.version}` : null;
  let hasLastTag = false;
  if (lastTag) { try { kitGit(root, ['rev-parse', '--verify', '-q', `refs/tags/${lastTag}`]); hasLastTag = true; } catch { hasLastTag = false; } }
  if (release && lastTag && !hasLastTag) {
    log(`export: the tag ${lastTag} of the last release is not in this checkout; fetch it first: git fetch origin --tags`);
    return 2;
  }
  if (release) {
    const dirty = hubGit(hub, ['status', '--porcelain', '--', '.claude', ...pageSources(root, extraSources)]);
    if (dirty) { log(`export: the hub has uncommitted changes in what the export reads; commit them, or pass --hub a clean checkout:\n${dirty}`); return 2; }
  }

  // The one scanner the kit pins (version and full commit); the scanner gate holds every install line and
  // every recorded scan to it. Without it that gate could not run, so the export refuses to start.
  let scanner;
  try {
    scanner = JSON.parse(readFileSync(local('scanner.json'), 'utf8'));
    if (typeof scanner.version !== 'string' || !/^[0-9a-f]{40}$/.test(scanner.commit)) throw new Error('needs a version and a 40-character commit');
  } catch (e) { log(`export: tools/export/scanner.json: ${e.code === 'ENOENT' ? 'missing' : e.message}`); return 2; }

  const scansPath = local('scans.json');
  const scans = existsSync(scansPath) ? JSON.parse(readFileSync(scansPath, 'utf8')) : {};
  const triagePath = local('scan-triage.md');
  const triage = existsSync(triagePath) ? parseTriage(readFileSync(triagePath, 'utf8')) : {};
  const stage = mkdtempSync(path.join(os.tmpdir(), 'kit-stage-'));
  try {
    cpSync(root, stage, { recursive: true, filter: (src) => {
      const rel = path.relative(root, src).split(path.sep).join('/');
      // The same names the build and scan.mjs leave out (item-hash.mjs), so a stray .DS_Store or
      // __pycache__ in a kit skill neither ships nor changes its hash.
      return !(isSkipped(rel) || isLocalOnly(rel));
    } });
    // Which packs ship is computed from the hub, never flipped by hand; each withheld pack prints its skill-level reasons.
    // A release stamps its own version into the manifest, so the feature menu and the adoption the drill
    // records name the kit version they came from; the file on disk gets it once every gate has passed.
    const rawManifest = release ? { ...manifest, version: release } : manifest;
    manifest = resolvePacks(hub, rawManifest);
    for (const it of manifest.items.filter((i) => i.kind === 'pack' && i.status === 'withheld')) {
      log([`pack ${it.id}: withheld`, ...(it.reasons || []).map((x) => `  - ${x}`)].join(String.fromCharCode(10)));
    }
    for (const it of manifest.items.filter((i) => i.kind === 'pack' && i.status === 'shipped')) log(`pack ${it.id}: ships`);
    let built;
    try { built = buildKit({ hub, out: stage, manifest, scans, triage, owner, rewrites: [...localRewrites, ...rewrites] }); } catch (e) { log(`export: ${e.message}`); return 1; }

    const checks = {
      secrets: [...gateSecrets(stage), ...(noGitleaks ? [] : gitleaks(stage))],
      privacy: gatePrivacy(stage, deny),
      paths: gatePaths(stage),
      risky: gateRisky(stage),
      studioBlocks: gateStudioBlocks(stage),
      markers: gateMarkers(stage),
      names: gateNames(stage, built.names),
      json: gateJson(stage),
      accounting: [...gateAccounting(stage, { written: built.written, notices: built.notices, manifest }), ...gateDiagramUrls(stage)],
      links: gateLinks(stage),
      cards: gateCards(stage, manifest),
      // Each item hashed as built in the stage, the content that ships, the way scan.mjs hashes the kit's copy.
      triage: gateTriage({ keys: built.scanKeys, scans, triage, release: Boolean(release), hashes: scanItemHashes(stage) }),
      scanner: gateScanner(stage, scanner, scans),
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
    for (const s of stale.staleFacts) {
      log(s.section ? `stale: ${s.page}, "${s.section}": ${s.count} fact(s) past ${s.window} days, the oldest checked ${s.checked}` : `stale: ${s.page} facts last checked ${s.checked}`);
    }
    // Descriptions that share their rare trigger words compete for the same request (issue #61): a report,
    // the pairs tools/export/overlaps.json does not know yet marked new.
    const known = new Set(knownOverlaps(root));
    for (const o of descriptionOverlaps(shippedDescriptions(stage))) log(`overlap${known.has(pairName(o)) ? '' : ' (new)'}: ${pairName(o)} share ${o.shared.join(', ')}`);
    // What the adoption session reads, phase by phase (issue #58); START-HERE states it, npm test holds it.
    for (const p of phaseLoads(stage)) log(`load: ${p.label}, about ${p.tokens} tokens`);
    log(`built ${built.written.length} file(s) from ${hub}`);
    if (failed) { log(`export: ${failed} finding(s); the kit was not changed`); return 1; }

    for (const g of GENERATED) {
      rmSync(path.join(root, g), { recursive: true, force: true });
      cpSync(path.join(stage, g), path.join(root, g), { recursive: true });
    }
    // The kit's checkout has core.fileMode=false, so a script is executable only by its mode in the index.
    const scripts = shebangFiles(root, GENERATED);
    let workTree = false;
    try { workTree = kitGit(root, ['rev-parse', '--is-inside-work-tree']) === 'true'; } catch { /* not a repository */ }
    // Without a work tree the modes cannot be recorded, so the export stops short of success, scripts or not.
    if (!workTree) {
      log(`export: the catalog was copied, but ${root} is not a git work tree: ${scripts.length} script(s) were not marked executable${release ? ', and the release files were not written' : ''}; run the export in the kit's git checkout`);
      return 1;
    }
    try {
      // Batched, so a long list never runs past the command-line limit.
      for (let i = 0; i < scripts.length; i += 100) kitGit(root, ['add', '--chmod=+x', '--', ...scripts.slice(i, i + 100)]);
    } catch (e) {
      log(`export: the catalog was copied, but git could not mark ${scripts.length} script(s) executable: ${String(e.stderr || e.message).trim()}`);
      return 1;
    }
    log(`modes: ${scripts.length} script(s) marked executable in the git index`);
    if (!release && hasLastTag) {
      const groups = [...groupFiles(changedFiles((args) => kitGit(root, args), lastTag), loadManifest(path.join(root, 'export.manifest.json'))).keys()];
      log(`release files (dry run): since ${lastTag}, ${groups.length} group(s): ${groups.join(', ')}${Object.keys(why).length ? `; no why for: ${groups.filter((g) => !why[g]).join(', ') || 'none'}` : ''}`);
    } else if (!release && Object.keys(why).length) log('release files: --why is read by a release, and by a dry run once the last release\'s tag is in this checkout');
    if (release) {
      // The committed file, not the in-memory manifest: that one also holds the private items from the local list.
      const committed = loadManifest(path.join(root, 'export.manifest.json'));
      writeFileSync(path.join(root, 'export.manifest.json'), `${JSON.stringify({ ...committed, version: release }, null, 2)}\n`);
      const { diff, state } = releaseDiff(root, built.itemFiles, prev, { manifest, scans });
      const page = pagePath(release);
      const pageNote = lastState?.version ? [`Every file this release changed, under its item: [${page}](${page}).`] : [];
      prependChangelog(path.join(root, 'CHANGELOG.md'), changelogSection(release, today, diff, [...notes, ...pageNote], { removed: manifest.removed || [], shippedPacks: manifest.items.filter((it) => it.kind === 'pack' && it.status === 'shipped').map((it) => it.id) }));
      writeFileSync(local('state.json'), `${JSON.stringify({ version: release, date: today, hubCommit: hubGit(hub, ['rev-parse', 'HEAD']), ...state }, null, 2)}\n`);
      log(`released v${release}: ${diff.added.length} added, ${diff.changed.length} changed, ${diff.removed.length} removed`);
      // Every changed file under its item (public issue #66), from the last release's tag to this tree.
      if (lastState?.version) {
        const files = changedFiles((args) => kitGit(root, args), `v${lastState.version}`);
        const out = releaseFilesPage({ version: release, previous: lastState.version, files, manifest: loadManifest(path.join(root, 'export.manifest.json')), why });
        mkdirSync(path.join(root, 'docs/releases'), { recursive: true });
        writeFileSync(path.join(root, page), out.text);
        log(`release files: ${page}, ${files.length} file(s) in ${out.groups.length} group(s)${out.missing.length ? `; no why for ${out.missing.length}: ${out.missing.join(', ')}` : ''}`);
        if (out.unused.length) log(`release files: a --why names a group with no changed file, left out: ${out.unused.join(', ')}`);
      } else log('release files: the first release has no earlier one to compare with; no page written');
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
    whys: argv.flatMap((a, i) => (a === '--why' ? [argv[i + 1]] : [])),
    noGitleaks: argv.includes('--no-gitleaks'),
  }));
}
