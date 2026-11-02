// templates/hooks/session-end-check.mjs
// A Claude Code Stop hook. Stop runs after every reply, not only when you close a session, so this
// stops a session for one thing only: commits that exist on no remote and are older than the active
// window, the one state where work can be lost for good. Fresher unpushed commits and uncommitted
// changes are listed with it, never on their own, so an ordinary reply is never interrupted.
// It reads the setup folder and the repositories named in registry/PROJECTS.md, or else in
// adoption/inventory.md. It never pushes, commits or cleans anything. Node, no dependencies.
//   Exit 0: nothing old is unpushed, or this is the second stop in a row (Claude was told once).
//   Exit 2: one line per repository on stderr, which Claude reads and raises with you.
// SESSION_END_ACTIVE_MINUTES sets the active window (default 60): a commit younger than that is
// work in flight, not work left behind.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.env.CLAUDE_PROJECT_DIR || process.cwd());
const ACTIVE_MIN = Number(process.env.SESSION_END_ACTIVE_MINUTES) > 0 ? Number(process.env.SESSION_END_ACTIVE_MINUTES) : 60;

let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { input = {}; }
if (input.stop_hook_active) process.exit(0);

const git = (repo, args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const isRepo = (p) => { try { return git(p, ['rev-parse', '--show-toplevel']) !== ''; } catch { return false; } };

// Repository paths: every table cell without spaces, in the registry or else the inventory, that
// names a folder holding a git repository.
function listed() {
  const file = ['registry/PROJECTS.md', 'adoption/inventory.md'].map((f) => path.join(root, f)).find(existsSync);
  if (!file) return [];
  return readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l))
    .flatMap((l) => l.split('|').slice(1, -1).map((c) => c.trim().replace(/^`|`$/g, '')))
    .filter((c) => c && !/\s/.test(c)).map((c) => path.resolve(root, c));
}

const repos = [...new Set([root, ...listed()].filter((p) => existsSync(p) && isRepo(p)).map((p) => git(p, ['rev-parse', '--show-toplevel'])))];
const block = [];
const notes = [];
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
for (const repo of repos) {
  const name = path.basename(repo);
  if (git(repo, ['remote'])) {
    const range = ['--branches', '--not', '--remotes'];
    const old = Number(git(repo, ['rev-list', '--count', `--before=${ACTIVE_MIN}.minutes.ago`, ...range]) || 0);
    const total = Number(git(repo, ['rev-list', '--count', ...range]) || 0);
    if (old) {
      const oldest = Math.min(...git(repo, ['log', '--format=%ct', ...range]).split('\n').filter(Boolean).map(Number)) * 1000;
      const hours = Math.max(1, Math.floor((Date.now() - oldest) / 3600000));
      block.push(`${name}: ${plural(old, 'commit')} not on any remote, the oldest from ${plural(hours, 'hour')} ago`);
    }
    if (total > old) notes.push(`${name}: ${plural(total - old, 'commit')} from the last ${ACTIVE_MIN} minutes, not pushed yet`);
  }
  if (git(repo, ['status', '--porcelain'])) notes.push(`${name}: uncommitted changes`);
}

if (block.length) {
  const lines = ['These commits exist only on this machine:', ...block.map((l) => `  ${l}`)];
  if (notes.length) lines.push('Also worth knowing:', ...notes.map((l) => `  ${l}`));
  lines.push('Push what should be kept, with the person\'s yes, or say it is left on purpose and stop again. This check never pushes or cleans.');
  console.error(lines.join('\n'));
  process.exit(2);
}
