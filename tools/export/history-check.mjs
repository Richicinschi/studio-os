// tools/export/history-check.mjs
// Checks commits for the kit's private terms before anything is pushed to the public repository: the
// owner's first name (owner.local.txt), the deny list (privacy.local.txt), and the private item names
// and source file names (private.local.txt). Every file in each commit's tree, every file name and the
// commit message are searched. It prints counts and term numbers only, never a term.
//   node tools/export/history-check.mjs <ref> [<ref> ...]        (default: every ref, --all)
// Exit 0 when no commit carries a term, 1 when one does, 2 when the local files are missing.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findDenied, loadDenyList, loadOwnerName } from './rules.mjs';

// The terms, from the three local files of the kit checkout at `root`.
export function privateTerms(root) {
  const local = (f) => path.join(root, 'tools/export', f);
  if (!existsSync(local('private.local.txt'))) throw new Error(`private list missing: ${local('private.local.txt')}`);
  const priv = readFileSync(local('private.local.txt'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const privTerms = priv.flatMap((l) => (l.startsWith('source ')
    ? [path.basename(l.split(/\s+/)[2] || '').replace(/\.[^.]+$/, '')]
    : [l.split(':')[1]])).filter(Boolean);
  return [...new Set([loadOwnerName(local('owner.local.txt')), ...loadDenyList(local('privacy.local.txt')), ...privTerms])];
}

// Returns how many commits were checked, how many carry a term, and which term numbers were seen.
export function checkHistory({ repo, refs = [], terms }) {
  const git = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const commits = git('rev-list', ...(refs.length ? refs : ['--all'])).trim().split('\n').filter(Boolean);
  const number = (f) => terms.indexOf(f.term) + 1;
  const blobs = new Map();
  const seen = new Set();
  let bad = 0;
  for (const c of commits) {
    const hits = new Set(findDenied(git('log', '-1', '--format=%B', c), terms).map((f) => `message #${number(f)}`));
    for (const line of git('ls-tree', '-r', c).trim().split('\n').filter(Boolean)) {
      const [meta, file] = line.split('\t');
      const blob = meta.split(' ')[2];
      if (!blobs.has(blob)) {
        const text = git('cat-file', 'blob', blob);
        blobs.set(blob, text.includes('\0') ? [] : [...new Set(findDenied(text, terms).map(number))]);
      }
      for (const n of blobs.get(blob)) hits.add(`#${n}`);
      for (const f of findDenied(file, terms)) hits.add(`file name #${number(f)}`);
    }
    if (hits.size) { bad++; hits.forEach((h) => seen.add(h)); }
  }
  return { commits: commits.length, bad, seen: [...seen].sort() };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  let terms;
  try { terms = privateTerms(root); } catch (e) { console.error(`history-check: ${e.message}`); process.exit(2); }
  const r = checkHistory({ repo: root, refs: process.argv.slice(2), terms });
  console.log(`history-check: ${r.commits} commit(s) checked against ${terms.length} private terms; ${r.bad} carry at least one`);
  if (r.bad) console.log(`terms seen: ${r.seen.join(', ')}`);
  process.exit(r.bad ? 1 : 0);
}
