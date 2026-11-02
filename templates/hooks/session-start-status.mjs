// templates/hooks/session-start-status.mjs
// A Claude Code SessionStart hook: what Claude prints here goes into the new session's context, so it
// prints at most ten lines, and nothing at all when everything is in order:
//   - repositories with uncommitted changes or commits on no remote;
//   - local branches with no commit for more than 14 days;
//   - a front door (AGENTS.md or CLAUDE.md) whose "current state" date is more than 14 days older
//     than its repository's last commit.
// It reads the setup folder and the repositories named in registry/PROJECTS.md, or else in
// adoption/inventory.md: every table cell without spaces that names a folder holding a git repository.
// A repository with no commits yet is skipped, and the checked-out branch is never called idle.
// It changes nothing. Node, no dependencies, any system.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.env.CLAUDE_PROJECT_DIR || process.cwd());
const IDLE_DAYS = 14;
const MAX_LINES = 10;
const DAY_MS = 24 * 3600 * 1000;

const git = (repo, args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const isRepo = (p) => { try { return git(p, ['rev-parse', '--show-toplevel']) !== ''; } catch { return false; } };

function listed() {
  const file = ['registry/PROJECTS.md', 'adoption/inventory.md'].map((f) => path.join(root, f)).find(existsSync);
  if (!file) return [];
  return readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l))
    .flatMap((l) => l.split('|').slice(1, -1).map((c) => c.trim().replace(/^`|`$/g, '')))
    .filter((c) => c && !/\s/.test(c)).map((c) => path.resolve(root, c));
}

// The first YYYY-MM-DD after a "current state" heading in the front door.
function stateDate(repo) {
  for (const f of ['AGENTS.md', 'CLAUDE.md']) {
    const p = path.join(repo, f);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, 'utf8');
    const at = text.search(/^#+ .*current state/im);
    if (at < 0) continue;
    const m = text.slice(at).match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (m) return m[1];
  }
  return null;
}

const days = (from, to) => Math.floor((to - from) / DAY_MS);
const now = Date.now();
const repos = [...new Set([root, ...listed()].filter((p) => existsSync(p) && isRepo(p)).map((p) => git(p, ['rev-parse', '--show-toplevel'])))];
const lines = [];
const hasCommits = (repo) => { try { git(repo, ['rev-parse', '--verify', '-q', 'HEAD']); return true; } catch { return false; } };
for (const repo of repos.filter(hasCommits)) {
  const name = path.basename(repo);
  const current = git(repo, ['branch', '--show-current']);
  const work = [];
  if (git(repo, ['status', '--porcelain'])) work.push('uncommitted changes');
  if (git(repo, ['remote'])) {
    const n = Number(git(repo, ['rev-list', '--count', 'HEAD', '--not', '--remotes']) || 0);
    if (n) work.push(`${n} commit${n === 1 ? '' : 's'} not on any remote`);
  }
  if (work.length) lines.push(`${name}: ${work.join('; ')}`);
  const state = stateDate(repo);
  const last = Number(git(repo, ['log', '-1', '--format=%ct']) || 0) * 1000;
  if (state && last && days(Date.parse(state), last) > IDLE_DAYS) {
    lines.push(`${name}: the front door's current state (${state}) is ${days(Date.parse(state), last)} days older than the last commit`);
  }
  for (const row of git(repo, ['for-each-ref', '--format=%(refname:short) %(committerdate:unix)', 'refs/heads']).split('\n').filter(Boolean).sort()) {
    const [branch, ts] = row.split(' ');
    const idle = days(Number(ts) * 1000, now);
    if (branch !== current && idle > IDLE_DAYS) lines.push(`${name}: branch ${branch} idle for ${idle} days`);
  }
}

if (lines.length > MAX_LINES) {
  const shown = lines.slice(0, MAX_LINES - 1);
  console.log([...shown, `... and ${lines.length - shown.length} more`].join('\n'));
} else if (lines.length) {
  console.log(lines.join('\n'));
}
