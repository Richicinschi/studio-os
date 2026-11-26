// tools/export/release-files.mjs
// Every file a release changed, under its item, with one line of why (public issue #66, option 1). The
// public repository takes one commit per release, which nobody can read file by file; this page lists what
// that commit holds. A release writes it as docs/releases/vX.Y.Z.md, from the previous release's tag (the
// tree it published) to the tree the release run leaves, and the CHANGELOG section links it. The why lines
// come from `--why "<group>=<text>"` and pass the same gate as `--note`.
// From the kit's checkout, by hand:
//   node tools/export/release-files.mjs page --previous X.Y.Z --release X.Y.Z [--why "<group>=<text>"]...
//     writes the page again, such as to add why lines after the release run;
//   node tools/export/release-files.mjs check X.Y.Z <release commit>
//     compares the page with the files the release commit changes against the previous tag: exit 0 when the
//     same, 1 when not, with each file that differs.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gateNotes } from './gates.mjs';
import { loadDenyList } from './rules.mjs';
import { loadManifest } from './manifest.mjs';

const STATUS = { A: 'added', M: 'changed', T: 'changed', D: 'removed' };
export const pagePath = (release) => `docs/releases/v${release}.md`;

// [{ status, path }], sorted by path: tracked files that differ from the tag's tree, and new files git does
// not ignore. `git` is (args) => stdout. Paths are read NUL-separated, so git never quotes them.
export function changedFiles(git, tag) {
  const parts = git(['diff', '--name-status', '-z', '--no-renames', tag, '--', '.']).split('\0').filter(Boolean);
  const tracked = [];
  for (let i = 0; i + 1 < parts.length; i += 2) tracked.push({ status: STATUS[parts[i][0]] || 'changed', path: parts[i + 1] });
  const added = git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean).map((p) => ({ status: 'added', path: p }));
  return [...tracked, ...added].filter((f, i, a) => a.findIndex((x) => x.path === f.path) === i).sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

// The group a file belongs to: its item where the kit knows one, else its folder.
export function groupOf(file, manifest) {
  const p = file.split(path.sep).join('/');
  let m;
  if ((m = p.match(/^catalog\/skills\/([^/]+)\//))) return `skill:${m[1]}`;
  if ((m = p.match(/^catalog\/agents\/([^/]+)\.md$/))) return `agent:${m[1]}`;
  if ((m = p.match(/^catalog\/packs\/([^/]+)\//))) return `pack:${m[1]}`;
  if ((m = p.match(/^cards\/pack-([^/]+)\.md$/))) return `pack:${m[1]}`;
  if ((m = p.match(/^\.claude\/skills\/([^/]+)\//))) return `kit skill:${m[1]}`;
  const items = (manifest?.items || []).filter((it) => it.status !== 'private');
  if ((m = p.match(/^cards\/([^/]+)\.md$/))) {
    const it = items.find((x) => x.id === m[1]);
    return it ? `${it.kind}:${it.id}` : 'cards';
  }
  const owner = items.find((it) => (it.files || []).some((f) => p === f || p.startsWith(`${f.replace(/\/$/, '')}/`)));
  if (owner) return `${owner.kind}:${owner.id}`;
  if ((m = p.match(/^modules\/([^/]+)\//))) return `module:${m[1]}`;
  return p.includes('/') ? p.split('/')[0] : 'the top folder';
}

// The why lines: ["<group>=<text>"] → { group: text }.
export function parseWhy(list = []) {
  const out = {};
  for (const w of list) {
    const at = w.indexOf('=');
    if (at < 1 || !w.slice(at + 1).trim()) throw new Error(`a --why is "<group>=<text>", not "${w}"`);
    out[w.slice(0, at).trim()] = w.slice(at + 1).trim();
  }
  return out;
}

// The why texts through the note gate, each finding named by its --why.
export const gateWhy = (why, deny) => gateNotes(Object.values(why), deny).map((f) => f.replace(/^--note (\d+)/, (m, n) => `--why ${Object.keys(why)[Number(n) - 1]}`));

const ORDER = ['skill', 'agent', 'pack', 'practice', 'external', 'kit skill', 'module'];
const rank = (g) => { const i = ORDER.indexOf(g.split(':')[0]); return i < 0 ? ORDER.length : i; };

// The groups of a list of files, in the page's order: items first, then folders.
export function groupFiles(files, manifest) {
  const groups = new Map();
  for (const f of files) {
    const g = groupOf(f.path, manifest);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(f);
  }
  return new Map([...groups].sort(([a], [b]) => rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0)));
}

// The page. `files` from changedFiles; the page lists itself, since the release commit holds it.
export function releaseFilesPage({ version, previous, files, manifest, why = {} }) {
  const self = pagePath(version);
  const all = files.some((f) => f.path === self) ? files : [...files, { status: 'added', path: self }].sort((a, b) => (a.path < b.path ? -1 : 1));
  const groups = groupFiles(all, manifest);
  const names = [...groups.keys()];
  const count = (s) => all.filter((f) => f.status === s).length;
  const out = [`# Studio OS v${version}: every changed file`, '',
    `From v${previous} to v${version}: ${all.length} files, ${count('added')} added, ${count('changed')} changed, ${count('removed')} removed, under the item or folder each belongs to. The release writes this page (\`tools/export/release-files.mjs\`); each "Why" is the maintainer's, and "Not given" means none was written. [CHANGELOG.md](../../CHANGELOG.md) has the story of the release.`, ''];
  for (const g of names) {
    out.push(`## ${g}`, '', `Why: ${why[g] || 'Not given.'}`, '');
    for (const f of groups.get(g)) out.push(`- ${f.status} \`${f.path}\``);
    out.push('');
  }
  return { text: `${out.join('\n').trimEnd()}\n`, groups: names, missing: names.filter((g) => !why[g]), unused: Object.keys(why).filter((g) => !groups.has(g)) };
}

// The files a page lists, as "<status> <path>".
export const listedFiles = (text) => [...text.matchAll(/^- (added|changed|removed) `(.+)`$/gm)].map((m) => `${m[1]} ${m[2]}`).sort();

// The release commit's own page against what the commit changes since the previous tag: { page, missing,
// extra }, or { error } when the commit adds no page or more than one.
export function checkPage(git, previous, commit) {
  const parts = git(['diff', '--name-status', '-z', '--no-renames', `v${previous}`, commit]).split('\0').filter(Boolean);
  const actual = [];
  for (let i = 0; i + 1 < parts.length; i += 2) actual.push({ status: STATUS[parts[i][0]] || 'changed', path: parts[i + 1] });
  const pages = actual.filter((f) => f.status === 'added' && /^docs\/releases\/v[^/]+\.md$/.test(f.path)).map((f) => f.path);
  if (pages.length !== 1) return { error: `expected the commit to add one page under docs/releases/, found ${pages.length}` };
  const listed = new Set(listedFiles(git(['show', `${commit}:${pages[0]}`])));
  const real = new Set(actual.map((f) => `${f.status} ${f.path}`));
  return { page: pages[0], missing: [...real].filter((x) => !listed.has(x)).sort(), extra: [...listed].filter((x) => !real.has(x)).sort() };
}

function main(argv) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const git = (args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  const [cmd] = argv;
  if (cmd === 'page' && opt('--previous') && opt('--release')) {
    const why = parseWhy(argv.flatMap((a, i) => (a === '--why' ? [argv[i + 1]] : [])));
    const findings = gateWhy(why, loadDenyList(path.join(root, 'tools/export/privacy.local.txt')));
    if (findings.length) { for (const f of findings) console.error(`  ${f}`); console.error('a --why fails the gates; nothing written'); return 2; }
    const out = releaseFilesPage({ version: opt('--release'), previous: opt('--previous'), files: changedFiles(git, `v${opt('--previous')}`), manifest: loadManifest(path.join(root, 'export.manifest.json')), why });
    mkdirSync(path.join(root, 'docs/releases'), { recursive: true });
    writeFileSync(path.join(root, pagePath(opt('--release'))), out.text);
    console.log(`wrote ${pagePath(opt('--release'))}: ${out.groups.length} group(s)${out.missing.length ? `; no why for ${out.missing.join(', ')}` : ''}${out.unused.length ? `; left out, no changed file: ${out.unused.join(', ')}` : ''}`);
    return 0;
  }
  if (cmd === 'check' && argv[1] && argv[2]) {
    const [, previous, commit] = argv;
    const r = checkPage(git, previous, commit);
    if (r.error) { console.error(r.error); return 1; }
    for (const x of r.missing) console.log(`not on the page: ${x}`);
    for (const x of r.extra) console.log(`on the page, not in the commit: ${x}`);
    console.log(r.missing.length || r.extra.length ? `${r.page} differs from ${commit}` : `${r.page} lists every file ${commit} changes since v${previous}`);
    return r.missing.length || r.extra.length ? 1 : 0;
  }
  console.error('usage: node tools/export/release-files.mjs page --previous X.Y.Z --release X.Y.Z [--why "<group>=<text>"]... | check <previous X.Y.Z> <release commit>');
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`error: ${e.message}`); process.exitCode = 2; }
}
