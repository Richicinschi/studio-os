// templates/hooks/session-start-status.mjs
// A Claude Code SessionStart hook: what Claude prints here goes into the new session's context, so it
// prints at most ten lines, and nothing at all when everything is in order. Unsaved work comes first:
//   - a git guard (block-dangerous-git.mjs) named in a PreToolUse entry of .claude/settings.json,
//     .claude/settings.local.json or the user settings that does not refuse a test force-push, is
//     missing or not a file, or refuses a plain `git status`; only that script is run, with `node`,
//     never any other hook, for 3 seconds at most and 6 for all guards together;
//   - repositories with uncommitted changes or commits on no remote, on any branch or a detached HEAD;
//   - repositories it could not read; then paths in a Path or Folder column that do not exist;
//   - a front door (AGENTS.md or CLAUDE.md) whose "current state" date is more than 14 days older
//     than its repository's last commit;
//   - local branches with no commit for more than 14 days, one line per repository.
// It reads the setup folder and the repositories named in registry/PROJECTS.md, or else in
// adoption/inventory.md: every table cell without spaces that names a folder holding a git repository.
// On Windows a cell written the way Git Bash prints it, /c/work/x, is read as C:/work/x.
// A repository with no commits yet is skipped, and the checked-out branch is never called idle. A
// checked-out branch with no commit yet still has the other branches counted for commits on no remote.
// It changes nothing. Node, no dependencies, any system.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.env.CLAUDE_PROJECT_DIR || process.cwd());
const IDLE_DAYS = 14;
const MAX_LINES = 10;
const DAY_MS = 24 * 3600 * 1000;
const unBom = (text) => text.replace(/^\uFEFF/, '');

// --no-optional-locks: `status` would otherwise rewrite .git/index. A large buffer: one repository
// with tens of thousands of untracked files prints megabytes.
const git = (repo, args) => execFileSync('git', ['--no-optional-locks', '-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();
// Any output at all means uncommitted changes; output too large to hold is output too.
const dirty = (repo) => { try { return git(repo, ['status', '--porcelain']) !== ''; } catch (e) { if (e.code === 'ENOBUFS') return true; throw e; } };

// Every table cell without spaces, with whether its column is headed Path or Folder.
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
  const out = [];
  let pathColumn = [];
  rows.forEach((l, i) => {
    if (!isRow(l) || isRule(i)) return;
    const cells = cellsOf(l);
    if (isRule(i + 1)) { pathColumn = cells.map((c) => /^(path|folder)$/i.test(c)); return; }
    cells.forEach((cell, j) => {
      if (!cell || /\s/.test(cell)) return;
      const p = path.resolve(root, process.platform === 'win32' ? cell.replace(/^\/([A-Za-z])(\/|$)/, (m, d) => `${d.toUpperCase()}:/`) : cell);
      out.push({ cell, p, inPathColumn: Boolean(pathColumn[j]) });
    });
  });
  return out;
}
// A cell that looks like a path: absolute, a drive, ~, ./ or ../. A missing one in a Path or
// Folder column is named; other columns hold skills, files and notes, not repositories.
const pathLike = (cell) => /^([\\/~]|\.\.?[\\/]|[A-Za-z]:[\\/])/.test(cell);

// The git guard: a word whose file name is block-dangerous-git.mjs in a PreToolUse command hook.
const GUARD = 'block-dangerous-git.mjs';
const isGuard = (word) => word.split(/[\\/]/).pop() === GUARD;
// The words of a shell-form command, quotes taken off: node "$CLAUDE_PROJECT_DIR"/x.mjs is two words.
function words(command) {
  const out = [];
  let word = null;
  let quote = '';
  for (const ch of command) {
    if (quote) { if (ch === quote) quote = ''; else word += ch; continue; }
    if (ch === '"' || ch === "'") { quote = ch; word ??= ''; continue; }
    if (/\s/.test(ch)) { if (word !== null) out.push(word); word = null; continue; }
    word = (word ?? '') + ch;
  }
  if (word !== null) out.push(word);
  return out;
}
// Absolute paths of the guard scripts that PreToolUse entries in these settings files run. Exec form
// (`command` plus `args`) runs no shell, so only the ${CLAUDE_PROJECT_DIR} placeholder is replaced and
// any other path is taken as written; a shell-form `command` also has $CLAUDE_PROJECT_DIR, and ~ or
// $HOME at the start, as the shell would read them. A file that is missing or does not parse is skipped.
function guardsIn(settingsFiles) {
  const found = new Set();
  const add = (word, shell) => {
    let p = word.replace(shell ? /\$\{CLAUDE_PROJECT_DIR\}|\$\{env:CLAUDE_PROJECT_DIR\}|\$env:CLAUDE_PROJECT_DIR\b|\$CLAUDE_PROJECT_DIR\b/g : /\$\{CLAUDE_PROJECT_DIR\}/g, () => root);
    if (shell) p = p.replace(/^(~|\$HOME\b|\$\{HOME\})(?=[\\/]|$)/, () => os.homedir());
    found.add(path.resolve(root, p));
  };
  for (const file of settingsFiles) {
    let settings;
    try { settings = JSON.parse(unBom(readFileSync(file, 'utf8'))); } catch { continue; }
    const groups = settings?.hooks?.PreToolUse;
    for (const group of Array.isArray(groups) ? groups : []) {
      for (const h of Array.isArray(group?.hooks) ? group.hooks : []) {
        if (typeof h?.command !== 'string') continue;
        if (Array.isArray(h.args)) {
          for (const w of [h.command, ...h.args]) if (typeof w === 'string' && isGuard(w)) add(w, false);
        } else {
          for (const w of words(h.command)) if (isGuard(w)) add(w, true);
        }
      }
    }
  }
  return [...found];
}
// The test the guard's own card runs: a force-push sent as a Bash call must exit 2, and a plain
// `git status` must exit 0 (a guard copied without guard.mjs beside it refuses every git command).
// A path that is not a file is never run: node would load a folder's index.js. Each run gets 3 seconds
// and all runs together 6, so a guard that hangs cannot hold the session start; it is killed with
// SIGKILL, which a script cannot ignore. A guard that does not answer in its 3 seconds counts as one
// that failed. A run is not started with less than 1 second of the 6 left, and a run cut short by what
// was left of the 6 did not get its 3 seconds: either way the guard is counted as not tested.
const RUN_MS = 3000;
const ALL_RUNS_MS = 6000;
const MIN_RUN_MS = 1000;
const asBash = (command) => JSON.stringify({ tool_name: 'Bash', tool_input: { command } });
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
function testGuards(scripts) {
  const out = [];
  const until = Date.now() + ALL_RUNS_MS;
  // The exit code, or null when it did not answer in its 3 seconds; undefined when it was not tested.
  const exitOf = (script, command) => {
    const left = until - Date.now();
    if (left < MIN_RUN_MS) return undefined;
    const timeout = Math.min(RUN_MS, left);
    const r = spawnSync(process.execPath, [script], { cwd: root, input: asBash(command), stdio: ['pipe', 'ignore', 'ignore'], timeout, killSignal: 'SIGKILL' });
    if (r.error?.code === 'ETIMEDOUT' && timeout < RUN_MS) return undefined;
    return r.status;
  };
  let untested = 0;
  for (const script of scripts) {
    if (!isFile(script)) { out.push(`git guard ${script} did not refuse a test force-push`); continue; }
    const push = exitOf(script, 'git push --force origin main');
    if (push === undefined) { untested++; continue; }
    if (push !== 2) { out.push(`git guard ${script} did not refuse a test force-push`); continue; }
    const status = exitOf(script, 'git status');
    if (status === undefined) untested++;
    else if (status !== 0) out.push(`git guard ${script} refused a plain git status`);
  }
  if (untested) out.push(`${untested} git guard${untested === 1 ? '' : 's'} not tested: the 6 seconds for testing guards ran out`);
  return out;
}

// The first YYYY-MM-DD in the front door's "current state" section: from its heading to the next
// heading of the same or higher level. Headings are ATX (# to ######) outside fenced code blocks.
const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]|$)/;
function stateDate(repo) {
  for (const f of ['AGENTS.md', 'CLAUDE.md']) {
    const p = path.join(repo, f);
    if (!existsSync(p)) continue;
    let fence = '';
    let level = 0;
    const section = [];
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const mark = line.match(FENCE);
      if (fence) {
        // A fence closes on the same character, at least as long, with nothing after it.
        if (mark && mark[1][0] === fence[0] && mark[1].length >= fence.length && !line.slice(mark[0].length).trim()) fence = '';
      } else if (mark) {
        fence = mark[1];
      } else {
        const h = line.match(HEADING);
        if (h && level && h[1].length <= level) break;
        if (h && !level && /current state/i.test(line)) level = h[1].length;
      }
      if (level) section.push(line);
    }
    const m = section.join('\n').match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (m) return m[1];
  }
  return null;
}

const days = (from, to) => Math.floor((to - from) / DAY_MS);
const now = Date.now();
const repos = new Set();
const unsaved = new Set();
const missing = new Set();
const stale = new Set();
for (const { cell, p, inPathColumn } of [{ cell: '', p: root, inPathColumn: false }, ...listed()]) {
  if (!existsSync(p)) { if (inPathColumn && pathLike(cell)) missing.add(`${cell}: not found`); continue; }
  try { repos.add(git(p, ['rev-parse', '--show-toplevel'])); } catch {
    if (existsSync(path.join(p, '.git'))) unsaved.add(`${path.basename(p)}: could not be checked`);
  }
}
const hasCommits = (repo) => { try { git(repo, ['rev-parse', '--verify', '-q', 'HEAD']); return true; } catch { return false; } };
for (const repo of repos) {
  const name = path.basename(repo);
  try {
    // A checked-out branch with no commit yet still leaves the other branches to count, as the end check does.
    const head = hasCommits(repo);
    const work = [];
    if (head && dirty(repo)) work.push('uncommitted changes');
    if (git(repo, ['remote'])) {
      const n = Number(git(repo, ['rev-list', '--count', ...(head ? ['HEAD'] : []), '--branches', '--not', '--remotes']) || 0);
      if (n) work.push(`${n} commit${n === 1 ? '' : 's'} not on any remote`);
    }
    if (work.length) unsaved.add(`${name}: ${work.join('; ')}`);
    if (!head) continue;
    const current = git(repo, ['branch', '--show-current']);
    const state = stateDate(repo);
    const last = Number(git(repo, ['log', '-1', '--format=%ct']) || 0) * 1000;
    if (state && last && days(Date.parse(state), last) > IDLE_DAYS) {
      stale.add(`${name}: the front door's current state (${state}) is ${days(Date.parse(state), last)} days older than the last commit`);
    }
    const idle = git(repo, ['for-each-ref', '--format=%(refname:short) %(committerdate:unix)', 'refs/heads']).split('\n').filter(Boolean)
      .map((row) => row.split(' ')).filter(([branch, ts]) => branch !== current && days(Number(ts) * 1000, now) > IDLE_DAYS).length;
    if (idle) stale.add(`${name}: ${idle} branch${idle === 1 ? '' : 'es'} idle for more than ${IDLE_DAYS} days`);
  } catch { unsaved.add(`${name}: could not be checked`); }
}

const userSettings = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'), 'settings.json');
const guard = testGuards(guardsIn([path.join(root, '.claude/settings.json'), path.join(root, '.claude/settings.local.json'), userSettings]));

const lines = [...guard, ...unsaved, ...missing, ...stale];
if (lines.length > MAX_LINES) {
  // A git guard that does not refuse is never cut, however many there are; the cap applies to the rest.
  const shown = lines.slice(0, Math.max(MAX_LINES - 1, guard.length));
  const rest = lines.length - shown.length;
  console.log([...shown, ...(rest ? [`... and ${rest} more`] : [])].join('\n'));
} else if (lines.length) {
  console.log(lines.join('\n'));
}
