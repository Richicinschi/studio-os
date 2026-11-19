// templates/hooks/session-end-check.mjs
// A Claude Code Stop hook. Stop runs after every reply, not only when you close a session, so this
// stops a session for two things only: commits that exist on no remote and are older than the active
// window, the one state where work can be lost for good, and repositories git cannot read, where
// that state cannot be ruled out. Fresher unpushed commits and uncommitted changes are listed with
// them, never on their own. It raises the same commits and repositories once per session: Claude
// Code sends a session_id, and what was raised in that session is kept in one file,
// <temp folder>/claude-session-end-check/<session_id>.json; files older than 7 days are deleted.
// It reads the setup folder and the repositories named in registry/PROJECTS.md, or else in
// adoption/inventory.md. It never pushes, commits or cleans anything. Node, no dependencies.
//   Exit 0: nothing to raise, all of it was raised before in this session, or this is the second
//           stop in a row (Claude was told once).
//   Exit 2: one line per repository on stderr, which Claude reads and raises with you.
// SESSION_END_ACTIVE_MINUTES sets the active window (default 60): a commit younger than that is
// work in flight, not work left behind.
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, unlinkSync, utimesSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.env.CLAUDE_PROJECT_DIR || process.cwd());
const ACTIVE_MIN = Number(process.env.SESSION_END_ACTIVE_MINUTES) > 0 ? Number(process.env.SESSION_END_ACTIVE_MINUTES) : 60;
const KEEP_DAYS = 7;
const unBom = (text) => text.replace(/^\uFEFF/, '');

let input = {};
try { input = JSON.parse(unBom(readFileSync(0, 'utf8')) || '{}'); } catch { input = {}; }
if (!(typeof input === 'object' && input)) input = {};
const stateDir = path.join(os.tmpdir(), 'claude-session-end-check');
// The state folder is used only when it is a real folder, not a link, and on POSIX one this user
// owns; a missing one is created when needed. Otherwise the check runs as with no session_id.
const ownFolder = (mustExist) => {
  try {
    const st = lstatSync(stateDir);
    return st.isDirectory() && !st.isSymbolicLink() && (typeof process.getuid !== 'function' || st.uid === process.getuid());
  } catch (e) { return !mustExist && e.code === 'ENOENT'; }
};
const usable = ownFolder(false);
// Used in a file name, so letters, digits, _ and - only; anything else counts as no session_id.
const NAME = /^[A-Za-z0-9_-]{1,200}$/;
const session = usable && typeof input.session_id === 'string' && NAME.test(input.session_id) ? input.session_id : '';
const stateFile = session ? path.join(stateDir, `${session}.json`) : '';

// Session files untouched for more than 7 days are deleted; nothing else in the folder is, and
// one that cannot be deleted is left for next time.
if (usable) {
  let names = [];
  try { names = readdirSync(stateDir); } catch { names = []; }
  for (const f of names.filter((n) => /^[A-Za-z0-9_-]{1,200}\.json$/.test(n))) {
    try {
      const st = lstatSync(path.join(stateDir, f));
      if (st.isFile() && st.mtimeMs < Date.now() - KEEP_DAYS * 24 * 3600 * 1000) unlinkSync(path.join(stateDir, f));
    } catch { /* in use or gone: next time */ }
  }
}
// A quiet exit keeps this session's file fresh, so a session longer than 7 days keeps its memory.
const quiet = () => {
  if (stateFile) { try { const now = new Date(); utimesSync(stateFile, now, now); } catch { /* no file yet */ } }
  process.exit(0);
};
if (input.stop_hook_active) quiet();

// --no-optional-locks: `status` would otherwise rewrite .git/index. A large buffer: one repository
// with tens of thousands of untracked files prints megabytes.
const git = (repo, args) => execFileSync('git', ['--no-optional-locks', '-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();
// Any output at all means uncommitted changes; output too large to hold is output too.
const dirty = (repo) => { try { return git(repo, ['status', '--porcelain']) !== ''; } catch (e) { if (e.code === 'ENOBUFS') return true; throw e; } };

// Repository paths: every table cell without spaces, in the registry or else the inventory. On
// Windows a cell written the way Git Bash prints it, /c/work/x, is read as C:/work/x.
function listed() {
  const file = ['registry/PROJECTS.md', 'adoption/inventory.md'].map((f) => path.join(root, f)).find(existsSync);
  if (!file) return [];
  const rows = unBom(readFileSync(file, 'utf8')).split(/\r?\n/);
  const isRow = (l) => /^\|/.test(l || '');
  // A row's cells; the trailing pipe is optional.
  const cellsOf = (l) => l.replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim().replace(/^`|`$/g, ''));
  // The rule row is the second line of a table, every cell dashes with optional colons: | --- | :-: |
  // A row of dashes further down is a data row.
  const isRule = (i) => isRow(rows[i]) && isRow(rows[i - 1]) && !isRow(rows[i - 2]) && cellsOf(rows[i]).every((c) => /^:?-+:?$/.test(c));
  // The header row, the one above the rule row, names columns: its cells are skipped, as the start status does.
  return rows.flatMap((l, i) => (isRow(l) && !isRule(i) && !isRule(i + 1) ? cellsOf(l) : []))
    .filter((c) => c && !/\s/.test(c))
    .map((cell) => path.resolve(root, process.platform === 'win32' ? cell.replace(/^\/([A-Za-z])(\/|$)/, (m, d) => `${d.toUpperCase()}:/`) : cell));
}

const repos = new Set();
const unreadable = new Map(); // key -> line
const cannotRead = (where, name) => unreadable.set(`${where}@unreadable`, `${name}: could not be checked`);
for (const p of [root, ...listed()]) {
  if (!existsSync(p)) continue;
  try { repos.add(git(p, ['rev-parse', '--show-toplevel'])); } catch {
    if (existsSync(path.join(p, '.git'))) cannotRead(p, path.basename(p));
  }
}

const block = [];
const keys = [];
const notes = new Set();
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
for (const repo of repos) {
  const name = path.basename(repo);
  try {
    if (git(repo, ['remote'])) {
      let head = true;
      try { git(repo, ['rev-parse', '--verify', '-q', 'HEAD']); } catch { head = false; }
      const range = [...(head ? ['HEAD'] : []), '--branches', '--not', '--remotes'];
      const old = git(repo, ['rev-list', '--timestamp', `--before=${ACTIVE_MIN}.minutes.ago`, ...range]).split('\n').filter(Boolean).map((l) => l.split(' '));
      const total = Number(git(repo, ['rev-list', '--count', ...range]) || 0);
      if (old.length) {
        const oldest = Math.min(...old.map(([ts]) => Number(ts))) * 1000;
        const hours = Math.max(1, Math.floor((Date.now() - oldest) / 3600000));
        block.push(`${name}: ${plural(old.length, 'commit')} not on any remote, the oldest from ${plural(hours, 'hour')} ago`);
        keys.push(...old.map(([, id]) => `${repo}@${id}`));
      }
      if (total > old.length) notes.add(`${name}: ${plural(total - old.length, 'commit')} from the last ${ACTIVE_MIN} minutes, not pushed yet`);
    }
    if (dirty(repo)) notes.add(`${name}: uncommitted changes`);
  } catch { cannotRead(repo, name); }
}
keys.push(...unreadable.keys());

if (keys.length) {
  if (session) {
    // What was already raised in this session; when all of it is there, stay quiet.
    let reported = [];
    try {
      const saved = JSON.parse(unBom(readFileSync(stateFile, 'utf8')));
      if (saved && Array.isArray(saved.reported)) reported = saved.reported.filter((k) => typeof k === 'string');
    } catch { reported = []; }
    const seen = new Set(reported);
    if (keys.every((k) => seen.has(k))) quiet();
    try {
      mkdirSync(stateDir, { recursive: true, mode: 0o700 });
      if (ownFolder(true)) writeFileSync(stateFile, JSON.stringify({ reported: [...new Set([...reported, ...keys])] }));
    } catch { /* not remembered: the same things are raised again next reply */ }
  }
  const lines = [];
  if (block.length) lines.push('These commits exist only on this machine:', ...block.map((l) => `  ${l}`));
  if (unreadable.size) lines.push('Git could not read these repositories, so unsaved work in them cannot be ruled out:', ...[...unreadable.values()].map((l) => `  ${l}`));
  if (notes.size) lines.push('Also worth knowing:', ...[...notes].map((l) => `  ${l}`));
  lines.push(block.length
    ? 'Push what should be kept, with the person\'s yes, or say it is left on purpose and stop again. This check never pushes or cleans.'
    : 'Find out with the person why git cannot read them, or say it is left as it is and stop again. This check never pushes or cleans.');
  console.error(lines.join('\n'));
  process.exit(2);
}
quiet();
