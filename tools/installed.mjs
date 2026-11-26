// tools/installed.mjs
// The adoption's install record, adoption/installed.json in the adopter's setup (public issues #60, #30):
// for each item, the kit version and the item's content hash from catalog/features.json, the decision,
// every file the install created or edited with a SHA-256 of its content, the folders it created, and
// every settings key it added with a SHA-256 of its value. Run from the kit's folder, like the other tools:
//   node tools/installed.mjs record <setup> <id> <decision> [--created <path>]... [--edited <path>]... [--made <folder>]... [--setting <file>#<key>]...
//   node tools/installed.mjs checked <setup> <id> pass|fail
//   node tools/installed.mjs check <setup> [<id>...]
//   node tools/installed.mjs receipt <setup>
//   node tools/installed.mjs undo <setup> <id> [--yes]
//   node tools/installed.mjs where <setup> <id> <file name>
// <id> is the item's card name (cards/<id>.md: pack-<id> for a domain); the scan keys agent:<id> and
// pack:<id> are read too. A path is relative to <setup>, absolute, or starts with ~/; a folder records
// every file in it, and the folder itself, so a file added to it later shows. A settings key is a dot
// path into a JSON file (hooks.PreToolUse). The decision is ADOPT, ADAPT, FOLD, SKIP or UNDONE; recording
// an item again replaces its entry, which then counts as the latest write.
// `check` prints, per item, whether each recorded file and key is unchanged, changed, missing or added
// since, and whether the kit's copy changed since the install; with ids, it lists every file and key of
// those items, and which other items recorded the same one: what an undo works from. A file or key a later
// item recorded again, and left as that item wrote it, is "rewritten by" that item, not a change.
// `receipt` prints a summary that names kit items only, never a path or an item from outside the kit.
// `undo` prints what it would remove: each created file that is unchanged, that no other item wrote and
// that no link leads to, then the folders the record names (created, or made with --made to hold the
// item), once empty, never a folder above them; everything else, with the reason, is left for the
// card's Undo. With --yes, the one command here that removes anything, it removes those, and records the
// item UNDONE when nothing is left. `where` prints the path of an item's recorded file, for check blocks.
// Apart from undo --yes, it writes only adoption/installed.json, and never into the kit's folder.
// Exit 0; `check` exits 1 when anything changed, is missing or was added; 2 on bad input or an error.
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isSkipped } from './export/item-hash.mjs';

export const RECORD = 'adoption/installed.json';
export const DECISIONS = ['ADOPT', 'ADAPT', 'FOLD', 'SKIP', 'UNDONE'];
const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export class BadInput extends Error {}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const posix = (p) => p.split(path.sep).join('/');
// JSON with its keys sorted, so a value hashes the same whatever order its keys were written in.
const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(',')}]`
  : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`
    : JSON.stringify(v));

function readJson(file, what = file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    throw new BadInput(`${what}: ${e instanceof SyntaxError ? 'not valid JSON' : 'cannot be read'} (${e.message})`);
  }
}

// `abs` relative to `base` when it is inside it ('' for base itself), else null.
function inside(base, abs) {
  const rel = path.relative(base, abs);
  return rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel) ? null : rel;
}

// The kit's version, from the top section of its CHANGELOG.md: "v3.5.0".
export function kitVersion(kit = KIT) {
  const f = path.join(kit, 'CHANGELOG.md');
  return (existsSync(f) && readFileSync(f, 'utf8').match(/^## (v\d+\.\d+\.\d+)/m)?.[1]) || null;
}

// Each menu item's and domain's content hash, from catalog/features.json, under its card name and its
// scan key: <id> and <kind>:<id> for an item, <id>, pack-<id> and pack:<id> for a domain.
export function kitHashes(kit = KIT) {
  const f = path.join(kit, 'catalog/features.json');
  const out = new Map();
  if (!existsSync(f)) return out;
  const features = readJson(f, 'catalog/features.json');
  for (const m of features.modules || []) for (const it of m.items || []) for (const k of [it.id, `${it.kind}:${it.id}`]) out.set(k, it.hash || null);
  for (const d of features.domains || []) for (const k of [d.id, `pack-${d.id}`, `pack:${d.id}`]) out.set(k, d.hash || null);
  return out;
}

// A path as recorded: relative to the setup inside it, ~/ under the home folder, else absolute; always /.
function stored(setup, abs, home) {
  const rel = inside(setup, abs);
  if (rel) return posix(rel);
  const inHome = inside(home, abs);
  if (inHome) return `~/${posix(inHome)}`;
  return posix(abs);
}
function resolved(setup, p, home) {
  if (/^~[\\/]/.test(p)) return path.join(home, p.slice(2));
  return path.isAbsolute(p) ? p : path.resolve(setup, p);
}

const isDir = (abs) => existsSync(abs) && statSync(abs).isDirectory();
// Every file in a folder but the names that never ship, sorted.
function filesIn(abs) {
  return readdirSync(abs, { recursive: true }).map(String).filter((r) => !isSkipped(r))
    .map((r) => path.join(abs, r)).filter((f) => statSync(f).isFile()).sort();
}

function settingValue(abs, key, what) {
  if (!existsSync(abs)) return undefined;
  let v = readJson(abs, what);
  for (const part of key.split('.')) {
    if (!v || typeof v !== 'object' || Array.isArray(v) || !Object.hasOwn(v, part)) return undefined;
    v = v[part];
  }
  return v;
}

export function readRecord(setup) {
  const f = path.join(setup, RECORD);
  if (!existsSync(f)) return { format: 1, items: [] };
  const rec = readJson(f, RECORD);
  const ok = rec && Array.isArray(rec.items) && rec.items.every((it) => it && typeof it.id === 'string'
    && Array.isArray(it.files) && Array.isArray(it.settings) && (it.folders === undefined || Array.isArray(it.folders)));
  if (!ok) throw new BadInput(`${RECORD} is not an install record this tool wrote`);
  for (const it of rec.items) it.folders ||= [];
  return rec;
}
function writeRecord(setup, rec) {
  mkdirSync(path.join(setup, 'adoption'), { recursive: true });
  writeFileSync(path.join(setup, RECORD), `${JSON.stringify(rec, null, 2)}\n`);
}

const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function refuseKit(setup, kit) {
  if (inside(path.resolve(kit), path.resolve(setup)) !== null) throw new BadInput('the setup is the kit\'s folder or inside it: give the path of your own setup');
}

// Records one item, replacing an earlier entry for it; returns the entry.
export function recordItem(setup, { id, decision, created = [], edited = [], made = [], settings = [] }, { kit = KIT, home = os.homedir(), today = localDate() } = {}) {
  refuseKit(setup, kit);
  const dec = String(decision || '').toUpperCase();
  if (!id) throw new BadInput('an item id is needed');
  if (!DECISIONS.includes(dec)) throw new BadInput(`decision must be one of ${DECISIONS.join(', ')}, not "${decision}"`);
  const files = [];
  const folders = [];
  const own = path.join(setup, 'adoption');
  for (const [how, list] of [['created', created], ['edited', edited]]) {
    for (const p of list) {
      const abs = resolved(setup, p, home);
      if (!existsSync(abs)) throw new BadInput(`not found: ${p}`);
      if (inside(own, abs) !== null) throw new BadInput(`${p} is in adoption/, the adoption's own record: record only what the install wrote`);
      if (isDir(abs)) {
        folders.push({ path: stored(setup, abs, home), how });
        for (const f of filesIn(abs)) files.push({ path: stored(setup, f, home), how, sha256: sha256(readFileSync(f)) });
      } else files.push({ path: stored(setup, abs, home), how, sha256: sha256(readFileSync(abs)) });
    }
  }
  // A folder the install made only to hold its files, such as .claude/agents/ in a setup that had none: an
  // undo removes it once empty, and nothing in it counts as this item's.
  for (const p of made) {
    const abs = resolved(setup, p, home);
    if (!isDir(abs)) throw new BadInput(`not a folder: ${p}`);
    folders.push({ path: stored(setup, abs, home), how: 'made' });
  }
  // A path given twice (a folder and a file in it) is recorded once.
  const seen = new Set();
  for (let k = files.length - 1; k >= 0; k -= 1) { if (seen.has(files[k].path)) files.splice(k, 1); else seen.add(files[k].path); }
  const keys = settings.map((s) => {
    const at = s.lastIndexOf('#');
    if (at < 1 || at === s.length - 1) throw new BadInput(`a setting is <file>#<key>, not "${s}"`);
    const file = s.slice(0, at);
    const key = s.slice(at + 1);
    const v = settingValue(resolved(setup, file, home), key, file);
    if (v === undefined) throw new BadInput(`no key ${key} in ${file}`);
    return { file: stored(setup, resolved(setup, file, home), home), key, sha256: sha256(canon(v)) };
  });
  const entry = {
    id, decision: dec, date: today, kitVersion: kitVersion(kit), kitHash: kitHashes(kit).get(id) ?? null,
    check: dec === 'SKIP' || dec === 'UNDONE' ? 'n/a' : 'pending', files, folders, settings: keys,
  };
  const rec = readRecord(setup);
  rec.items = [...rec.items.filter((it) => it.id !== id), entry];
  writeRecord(setup, rec);
  return entry;
}

// Sets an item's check result: pass or fail.
export function setCheck(setup, id, result, { kit = KIT } = {}) {
  refuseKit(setup, kit);
  if (!['pass', 'fail'].includes(result)) throw new BadInput(`a check is pass or fail, not "${result}"`);
  const rec = readRecord(setup);
  const it = rec.items.find((x) => x.id === id);
  if (!it) throw new BadInput(`no item ${id} in ${RECORD}`);
  it.check = result;
  writeRecord(setup, rec);
  return it;
}

// Recorded parts, comparable across items: a file by its path; a settings key by its file and dot path.
const partsOf = (it) => [...it.files.map((f) => ({ kind: 'file', path: f.path, sha256: f.sha256, rec: f })),
  ...it.settings.map((s) => ({ kind: 'key', file: s.file, key: s.key, sha256: s.sha256, rec: s }))];
const within = (key, outer) => key === outer || key.startsWith(`${outer}.`);
// Whether part b covers part a: the same file, or a key equal to a's or holding it.
const covers = (b, a) => (a.kind === 'file' ? b.kind === 'file' && b.path === a.path : b.kind === 'key' && b.file === a.file && within(a.key, b.key));
const overlaps = (a, b) => covers(a, b) || covers(b, a);

// Every recorded item with the state of each file and key now, and of the kit's copy.
export function checkSetup(setup, { kit = KIT, home = os.homedir(), ids = [] } = {}) {
  const rec = readRecord(setup);
  for (const id of ids) if (!rec.items.some((it) => it.id === id)) throw new BadInput(`no item ${id} in ${RECORD}`);
  const hashes = kitHashes(kit);
  const now = kitVersion(kit);
  const cache = new Map();
  const current = (p) => {
    const k = p.kind === 'file' ? `f ${p.path}` : `k ${p.file}#${p.key}`;
    if (!cache.has(k)) {
      if (p.kind === 'file') {
        const abs = resolved(setup, p.path, home);
        cache.set(k, existsSync(abs) && statSync(abs).isFile() ? sha256(readFileSync(abs)) : null);
      } else {
        const v = settingValue(resolved(setup, p.file, home), p.key, p.file);
        cache.set(k, v === undefined ? null : sha256(canon(v)));
      }
    }
    return cache.get(k);
  };
  const all = rec.items.map(partsOf);
  const state = (i, p) => {
    const nowSha = current(p);
    if (nowSha === null) return { state: 'missing' };
    if (nowSha === p.sha256) return { state: 'unchanged' };
    // The latest later item that recorded this part, or a key holding it: if what it recorded is still as
    // it wrote it, the change is that item's.
    for (let j = rec.items.length - 1; j > i; j -= 1) {
      const later = all[j].find((q) => covers(q, p));
      if (later) return current(later) === later.sha256 ? { state: 'rewritten', by: rec.items[j].id } : { state: 'changed' };
    }
    // A later key inside this one may explain part of the change, not all of it: say so, still a change.
    const inner = rec.items.slice(i + 1).flatMap((it, k) => all[i + 1 + k].filter((q) => covers(p, q)).map((q) => `${it.id} wrote ${q.key}`));
    return inner.length ? { state: 'changed', note: `${inner.join(', ')} inside it since` } : { state: 'changed' };
  };
  const items = rec.items.map((it, i) => {
    const shared = (p) => rec.items.filter((x, j) => j !== i && all[j].some((q) => overlaps(q, p))).map((x) => x.id);
    const parts = all[i].map((p) => ({ ...p.rec, kind: p.kind, ...state(i, p), shared: shared(p) }));
    // Files in a folder the install created that it did not write, and that no other item recorded.
    const known = new Set(rec.items.flatMap((x) => x.files.map((f) => f.path)));
    const added = it.folders.filter((d) => d.how === 'created').flatMap((d) => {
      const abs = resolved(setup, d.path, home);
      return isDir(abs) ? filesIn(abs).map((f) => stored(setup, f, home)).filter((p) => !known.has(p)) : [];
    }).map((p) => ({ path: p, how: 'added', kind: 'file', state: 'added', shared: [] }));
    const kitNow = hashes.get(it.id);
    const kitState = !it.kitHash || !kitNow ? 'unknown' : kitNow === it.kitHash ? 'same' : 'changed';
    return { ...it, parts: [...parts, ...added], kit: kitState, kitNow: now };
  });
  const shown = ids.length ? items.filter((it) => ids.includes(it.id)) : items;
  const clean = shown.every((it) => it.parts.every((x) => x.state === 'unchanged' || x.state === 'rewritten'));
  return { items: shown, clean };
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function checkText({ items }, { all = false } = {}) {
  if (!items.length) return 'No items recorded yet.';
  const out = [];
  for (const it of items) {
    const bad = it.parts.filter((x) => !['unchanged', 'rewritten'].includes(x.state));
    const files = it.parts.filter((x) => x.kind === 'file' && x.state !== 'added').length;
    const keys = it.parts.filter((x) => x.kind === 'key').length;
    const what = it.parts.length === 0 ? 'nothing written'
      : bad.length === 0 ? `${plural(files, 'file')} and ${plural(keys, 'settings key')} unchanged since the install`
        : `${bad.length} ${bad.length === 1 ? 'file or key' : 'files or keys'} changed, missing or added since the install`;
    const kit = it.kit === 'same' ? `the kit's copy is the same as at the install (${it.kitVersion})`
      : it.kit === 'changed' ? `the kit's copy changed since ${it.kitVersion} (now ${it.kitNow})`
        : 'no kit hash to compare (an item from outside the kit, or recorded before the kit published one)';
    out.push(`${it.id} (${it.decision}, ${it.date}, check ${it.check}): ${what}; ${kit}`);
    for (const x of it.parts) {
      if (!all && (x.state === 'unchanged' || x.state === 'rewritten')) continue;
      const name = x.kind === 'key' ? `${x.file}#${x.key} (settings key)` : x.state === 'added' ? `${x.path} (not written by the install)` : `${x.path} (${x.how})`;
      const note = [x.note, x.shared.length ? `also recorded by ${x.shared.join(', ')}` : ''].filter(Boolean).join('; ');
      out.push(`  ${x.state === 'rewritten' ? `rewritten by ${x.by}` : x.state}  ${name}${note ? `: ${note}` : ''}`);
    }
  }
  return out.join('\n');
}

// Where an item's recorded file of this name is, as an absolute path with / (for a card's check block).
export function whereFile(setup, id, name, { home = os.homedir() } = {}) {
  const it = readRecord(setup).items.find((x) => x.id === id);
  if (!it) throw new BadInput(`no item ${id} in ${RECORD}`);
  const found = it.files.filter((x) => x.path === name || x.path.endsWith(`/${name}`));
  if (!found.length) throw new BadInput(`no file ${name} recorded for ${id}`);
  if (found.length > 1) throw new BadInput(`${found.length} files named ${name} are recorded for ${id}: give more of the path, such as ${found[0].path}`);
  return posix(resolved(setup, found[0].path, home));
}

// Whether a path is reached through a link (a symlink, or a junction on Windows) below the setup, the home
// folder or the drive: an undo never removes through one, since the file may live outside the setup.
function throughLink(setup, abs, home) {
  const base = [path.resolve(setup), path.resolve(home)].find((b) => inside(b, abs) !== null) || path.parse(abs).root;
  for (let p = abs; p.length > base.length; p = path.dirname(p)) {
    try { if (lstatSync(p).isSymbolicLink()) return true; } catch { return false; }
  }
  return false;
}

// What an undo of one item may remove by itself: each file the install created that is unchanged, that no
// other item recorded and that no link leads to, then each folder it created or made, once empty.
// Everything else stays, with the reason, for the card's Undo and the person's answer.
export function undoPlan(setup, id, { kit = KIT, home = os.homedir() } = {}) {
  const [it] = checkSetup(setup, { kit, home, ids: [id] }).items;
  if (it.decision === 'SKIP' || it.decision === 'UNDONE') throw new BadInput(`nothing to undo: ${id} is recorded as ${it.decision}`);
  const remove = [];
  const left = [];
  for (const p of it.parts) {
    const name = p.kind === 'key' ? `${p.file}#${p.key} (settings key)` : p.path;
    if (p.kind === 'key') left.push({ name, why: 'a settings key: the card\'s Undo takes it out' });
    else if (p.how === 'edited') left.push({ name, why: 'edited, not created: the card\'s Undo takes out what the item added' });
    else if (p.state === 'added') left.push({ name, why: 'added since the install: ask before removing it' });
    else if (p.state === 'changed') left.push({ name, why: 'changed since the install: ask before removing it' });
    else if (p.state === 'missing') continue;
    else if (p.state === 'rewritten' || p.shared.length) left.push({ name, why: `also written by ${p.state === 'rewritten' ? p.by : p.shared.join(', ')}` });
    else if (throughLink(setup, resolved(setup, p.path, home), home)) left.push({ name, why: 'reached through a link: it may live outside the setup' });
    else remove.push(p.path);
  }
  const folders = [...it.folders].sort((a, b) => b.path.length - a.path.length);
  return { id, remove, folders, left };
}

// The folders inside a folder, deepest first, never through a link.
function foldersIn(abs) {
  const out = [];
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    const sub = path.join(abs, e.name);
    if (!e.isDirectory() || lstatSync(sub).isSymbolicLink()) continue;
    out.push(...foldersIn(sub), sub);
  }
  return out;
}

// Carries out an undo plan: removes its files, then its folders, deepest first, each only when empty and
// not a link, and never a folder the record does not name. Returns what was removed and what is left;
// records the item as UNDONE only when nothing is left.
export function undoItem(setup, id, { kit = KIT, home = os.homedir(), today } = {}) {
  refuseKit(setup, kit);
  const plan = undoPlan(setup, id, { kit, home });
  const removed = [];
  for (const p of plan.remove) { unlinkSync(resolved(setup, p, home)); removed.push(p); }
  const left = [...plan.left];
  for (const { path: d, how } of plan.folders) {
    const abs = resolved(setup, d, home);
    if (!existsSync(abs)) continue;
    if (throughLink(setup, abs, home)) { left.push({ name: `${d}/`, why: 'a link, or reached through one' }); continue; }
    // Inside a folder the install created, its own empty subfolders go first.
    if (how === 'created') for (const sub of foldersIn(abs)) if (readdirSync(sub).length === 0) rmdirSync(sub);
    if (readdirSync(abs).length) { left.push({ name: `${d}/`, why: `not empty: it holds ${readdirSync(abs).slice(0, 3).join(', ')}, which the record does not list` }); continue; }
    rmdirSync(abs);
    removed.push(`${d}/`);
  }
  if (!left.length) recordItem(setup, { id, decision: 'UNDONE' }, { kit, home, ...(today ? { today } : {}) });
  return { id, removed, left, undone: !left.length };
}

const TAKEN = { ADOPT: 'adopted', ADAPT: 'adapted', FOLD: 'folded' };

// A receipt with nothing private in it: kit item ids, counts and a duration only.
export function receipt(setup, { kit = KIT } = {}) {
  const rec = readRecord(setup);
  const known = kitHashes(kit);
  const inKit = rec.items.filter((it) => known.has(it.id));
  const outside = rec.items.length - inKit.length;
  const count = (d) => rec.items.filter((it) => it.decision === d).length;
  const versions = [...new Set(rec.items.map((it) => it.kitVersion).filter(Boolean))];
  const taken = inKit.filter((it) => TAKEN[it.decision]).map((it) => `${it.id} (${TAKEN[it.decision]})`);
  const skipped = inKit.filter((it) => it.decision === 'SKIP').map((it) => it.id);
  const failed = inKit.filter((it) => it.check === 'fail').map((it) => it.id);
  const failedOutside = rec.items.filter((it) => it.check === 'fail').length - failed.length;
  const checks = (r) => rec.items.filter((it) => it.check === r).length;
  const files = rec.items.reduce((n, it) => n + it.files.length, 0);
  const keys = rec.items.reduce((n, it) => n + it.settings.length, 0);
  const dir = path.join(setup, 'adoption');
  const docs = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'receipt.md') : [];
  const times = docs.map((f) => statSync(path.join(dir, f)).mtime.getTime()).sort((a, b) => a - b);
  const minutes = times.length > 1 ? Math.round((times.at(-1) - times[0]) / 60000) : null;
  const notes = docs.filter((f) => /^handoff-.*\.md$/.test(f)).length;
  return [
    '## Adoption receipt', '',
    `- Kit: ${kitVersion(kit) || 'unknown'}${versions.length ? ` (installs recorded under ${versions.join(', ')})` : ''}.`,
    `- Items recorded: ${rec.items.length}. Adopted ${count('ADOPT')}, adapted ${count('ADAPT')}, folded ${count('FOLD')}, skipped ${count('SKIP')}, undone ${count('UNDONE')}. From outside the kit: ${outside}, not named here.`,
    `- Kit items taken: ${taken.join(', ') || 'none'}.`,
    `- Kit items skipped: ${skipped.join(', ') || 'none'}.`,
    `- Checks: ${checks('pass')} passed, ${checks('fail')} failed${failed.length || failedOutside ? ` (${[failed.join(', '), failedOutside ? `${failedOutside} from outside the kit` : ''].filter(Boolean).join(', and ')})` : ''}, ${checks('pending')} pending.`,
    `- Written: ${plural(files, 'file')} and ${plural(keys, 'settings key')}.`,
    `- Time: ${minutes === null ? 'not known (fewer than two files in adoption/)' : `about ${minutes} minutes between the earliest and the latest last change of the files in adoption/ (an estimate: a pause, or a later note, counts too)`}.`,
    `- Sittings: ${plural(notes, 'handoff note')} in adoption/.`,
    '',
  ].join('\n');
}

function main(argv) {
  const [cmd, setupArg, ...rest] = argv;
  const usage = 'usage: node tools/installed.mjs record|checked|check|receipt|undo|where <setup> ... (see the header of tools/installed.mjs)';
  if (!cmd || !setupArg) throw new BadInput(usage);
  const setup = path.resolve(setupArg);
  if (!isDir(setup)) throw new BadInput(`not a folder: ${setupArg}`);
  refuseKit(setup, KIT);
  if (cmd === 'record') {
    const [id, decision, ...opts] = rest;
    const lists = { '--created': [], '--edited': [], '--made': [], '--setting': [] };
    for (let i = 0; i < opts.length; i += 2) {
      if (!Object.hasOwn(lists, opts[i]) || opts[i + 1] === undefined) throw new BadInput(`unknown or empty option: ${opts[i]}`);
      lists[opts[i]].push(opts[i + 1]);
    }
    const e = recordItem(setup, { id, decision, created: lists['--created'], edited: lists['--edited'], made: lists['--made'], settings: lists['--setting'] });
    const c = e.files.filter((f) => f.how === 'created').length;
    console.log(`recorded ${e.id}: ${e.decision}, ${plural(e.files.length, 'file')} (${c} created, ${e.files.length - c} edited), ${plural(e.settings.length, 'settings key')}, kit ${e.kitVersion || 'version unknown'}${e.kitHash ? '' : ', no kit hash'}`);
    return 0;
  }
  if (cmd === 'checked') {
    const it = setCheck(setup, rest[0], rest[1]);
    console.log(`${it.id}: check ${it.check}`);
    return 0;
  }
  if (cmd === 'check') {
    const result = checkSetup(setup, { ids: rest });
    console.log(checkText(result, { all: rest.length > 0 }));
    return result.clean ? 0 : 1;
  }
  if (cmd === 'where') {
    console.log(whereFile(setup, rest[0], rest[1] || ''));
    return 0;
  }
  if (cmd === 'undo') {
    const [id, flag] = rest;
    if (flag !== undefined && flag !== '--yes') throw new BadInput(`unknown option: ${flag}`);
    if (flag !== '--yes') {
      const plan = undoPlan(setup, id);
      for (const p of plan.remove) console.log(`would remove  ${p}`);
      for (const d of plan.folders) console.log(`would remove, once empty  ${d.path}/`);
      for (const l of plan.left) console.log(`left  ${l.name}: ${l.why}`);
      console.log('nothing removed: add --yes, after their yes');
      return 0;
    }
    const done = undoItem(setup, id);
    for (const p of done.removed) console.log(`removed  ${p}`);
    for (const l of done.left) console.log(`left  ${l.name}: ${l.why}`);
    console.log(done.undone ? `${id}: recorded as UNDONE` : `${id}: not recorded as undone yet: ${done.left.length} left for the card's Undo`);
    return 0;
  }
  if (cmd === 'receipt') {
    process.stdout.write(receipt(setup));
    return 0;
  }
  throw new BadInput(usage);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    // Every failure is 2, never 1, which means "changed": a bad record, a file that cannot be read.
    console.error(`error: ${e.message}`);
    process.exitCode = 2;
  }
}
