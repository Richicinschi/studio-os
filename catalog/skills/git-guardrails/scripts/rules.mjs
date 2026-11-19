/**
 * The destructive git calls this guard refuses, read from a git command's arguments the way git
 * reads them: global options first, then the subcommand's options, short flags joined or apart
 * (`-fq`), and a long option by any prefix git would accept (`--forc`, `--ha`, `--no-veri`).
 */
import { gitSplit, opts, excludeOnly, allOf, cachedLast, lastSwitch, WORKTREE_OPTS } from './lib/git.mjs';
import { progOf } from './lib/shell.mjs';

const HOOKS = 'move or remove the hooks folder (core.hooksPath)';
const isHooksKey = (k) => /^core\.hookspath$/i.test(String(k ?? '').trim());

/** True when a git command's env sets a GIT_CONFIG_KEY_<n> to core.hooksPath. */
const envMovesHooks = (env = {}) => Object.entries(env).some(([k, v]) => /^GIT_CONFIG_KEY_\d+$/i.test(k) && isHooksKey(v));

/**
 * True when a command sets GIT_CONFIG_KEY_<n> to core.hooksPath for the git calls after it: in its
 * own env, or as an assignment among its words (`export GIT_CONFIG_KEY_0=…`, `set …` in cmd,
 * PowerShell's `$env:GIT_CONFIG_KEY_0 = '…'`).
 */
export function assignsHooksPath(argv, env) {
  if (envMovesHooks(env)) return true;
  return /(?:^|\s)(?:\$\{?env:)?GIT_CONFIG_KEY_\d+\}?\s*=\s*core\.hookspath(?:\s|$)/i.test(argv.join(' '));
}

/** The first argument before `--` that is `--no-verify` or a prefix of it from `--no-v` on. */
const skipsHooks = (args) => {
  const end = args.indexOf('--');
  return (end < 0 ? args : args.slice(0, end)).some((x) => {
    const name = x.split('=')[0];
    return name.length >= 6 && '--no-verify'.startsWith(name);
  });
};

const STEER_REBASE = ['--continue', '--abort', '--skip', '--quit', '--edit-todo', '--show-current-patch'];

/** What one subcommand refuses: its arguments in, the rule's name or null out. */
const SUBS = {
  push(args, cfg) {
    const o = opts(args, {
      values: ['--repo', '--receive-pack', '--exec', '--push-option', '--recurse-submodules'], shorts: 'o',
      guarded: ['--force', '--force-with-lease', '--force-if-includes', '--mirror', '--delete', '--prune'],
    });
    if (o.has('--force', '-f', '--force-with-lease', '--force-if-includes')) return 'force-push';
    if (o.has('--mirror')) return 'mirror push (overwrites and deletes remote branches)';
    if (o.has('--delete', '-d')) return 'delete a remote branch';
    if (o.has('--prune')) return 'prune remote branches';
    const specs = o.pos.slice(1);
    if (specs.some((s) => s.startsWith('+'))) return 'force-push';
    if (specs.some((s) => s.startsWith(':') && s.length > 1)) return 'delete a remote branch';
    if (cfg.some((c) => /^(remote|push)\./i.test(c))) return 'push with -c remote.* or push.* (can change where and how it pushes)';
    return null;
  },
  reset(args) {
    return opts(args, { guarded: ['--hard'] }).has('--hard') ? 'discard uncommitted work (reset --hard)' : null;
  },
  commit(args) {
    const o = opts(args, {
      values: ['--message', '--file', '--author', '--date', '--template', '--reuse-message', '--reedit-message', '--fixup', '--squash', '--trailer', '--cleanup', '--pathspec-from-file'],
      shorts: 'mFCct', attached: 'Su', guarded: ['--amend'],
    });
    if (o.has('--amend')) return 'rewrite a commit (commit --amend)';
    if (o.has('-n')) return 'skip the hooks (commit -n)';
    return null;
  },
  clean(args, cfg) {
    const o = opts(args, { values: ['--exclude'], shorts: 'e', guarded: ['--force'] });
    if (o.has('-n', '--dry-run')) return null;
    const unforced = cfg.some((c) => /^clean\.requireforce=(false|no|off|0|)$/i.test(c.trim()));
    return o.has('-f', '--force') || unforced ? 'delete untracked files (clean -f)' : null;
  },
  branch(args) {
    const o = opts(args, {
      values: ['--set-upstream-to', '--contains', '--no-contains', '--merged', '--no-merged', '--points-at', '--sort', '--format'],
      shorts: 'u', guarded: ['--force'],
    });
    return o.has('-D', '-f', '--force', '-M', '-C') ? 'force a branch (delete, move or reset it)' : null;
  },
  switch(args) {
    const o = opts(args, WORKTREE_OPTS.switch);
    if (o.has('-C', '--force-create')) return 'reset a branch (switch -C)';
    return o.has('-f', '--force', '--discard-changes') ? 'discard uncommitted work (switch --force)' : null;
  },
  checkout(args) {
    const o = opts(args, WORKTREE_OPTS.checkout);
    if (o.has('-B')) return 'reset a branch (checkout -B)';
    if (o.has('-f', '--force')) return 'discard uncommitted work (checkout --force)';
    // The first positional may be the commit to check out from (`checkout HEAD ':!x'`).
    return allOf(o.pos) || excludeOnly(o.pos.slice(1)) ? 'discard uncommitted work in the whole tree (checkout .)' : null;
  },
  'checkout-index'(args) {
    return opts(args, { guarded: ['--force'] }).has('-f', '--force') ? 'overwrite working files (checkout-index --force)' : null;
  },
  restore(args) {
    const o = opts(args, WORKTREE_OPTS.restore);
    const stagedOnly = o.has('--staged', '-S') && !o.has('--worktree', '-W') && !args.some((x) => x.startsWith('--no-st'));
    return !stagedOnly && allOf(o.pos) ? 'discard uncommitted work in the whole tree (restore .)' : null;
  },
  rm(args) {
    // git rm's `*` crosses `/`, so `rm -f '*'` deletes every tracked file without -r.
    const o = opts(args, WORKTREE_OPTS.rm);
    const kept = cachedLast(args) || lastSwitch(args, '--dry-run', 'n');
    return !kept && allOf(o.pos) ? 'delete the whole tree (rm .)' : null;
  },
  'read-tree'(args) {
    const o = opts(args, WORKTREE_OPTS['read-tree']);
    return o.has('--reset') && o.has('-u') ? 'discard uncommitted work (read-tree --reset -u)' : null;
  },
  'update-ref': () => 'move or delete a ref (update-ref)',
  reflog: (args) => (['expire', 'delete', 'drop'].includes(args[0]) ? 'delete reflog entries (the way back)' : null),
  stash: (args) => (['drop', 'clear'].includes(args[0]) ? 'delete stashed work (stash drop/clear)' : null),
  gc: (args) => (opts(args, { values: ['--max-cruft-size', '--expire-to'], guarded: ['--prune'] }).has('--prune') ? 'delete unreachable commits (gc --prune)' : null),
  worktree(args) {
    if (args[0] !== 'remove') return null;
    return opts(args.slice(1), { guarded: ['--force'] }).has('-f', '--force') ? 'delete a worktree with its changes (worktree remove --force)' : null;
  },
  rebase: (args) => (args.some((x) => STEER_REBASE.includes(x)) ? null : 'rewrite history (rebase)'),
  'filter-branch': () => 'rewrite history (filter-branch)',
  'filter-repo': () => 'rewrite history (filter-repo)',
  'commit-tree': () => 'rewrite history (commit-tree)',
  config(args) {
    const o = opts(args, {
      values: ['--file', '--blob', '--type', '--default', '--comment', '--value'], shorts: 'ft',
      guarded: ['--unset', '--unset-all', '--replace-all', '--add', '--rename-section', '--remove-section'],
    });
    const verbs = ['get', 'list', 'set', 'unset', 'rename-section', 'remove-section', 'edit'];
    const verb = verbs.includes(o.pos[0]) ? o.pos[0] : null;
    const rest = verb ? o.pos.slice(1) : o.pos;
    const core = /^core$/i.test(rest[0] ?? '');
    if (verb === 'set' || verb === 'unset') return isHooksKey(rest[0]) ? HOOKS : null;
    if (verb === 'rename-section' || verb === 'remove-section') return core ? HOOKS : null;
    if (verb) return null;
    if (o.has('--unset', '--unset-all', '--replace-all', '--add') && isHooksKey(rest[0])) return HOOKS;
    if (o.has('--rename-section', '--remove-section') && core) return HOOKS;
    if (o.has('--unset', '--unset-all', '--replace-all', '--add', '--rename-section', '--remove-section')) return null;
    if (o.has('--get', '--get-all', '--get-regexp', '--get-urlmatch', '--get-color', '--get-colorbool', '--list', '-l')) return null;
    return isHooksKey(rest[0]) && rest.length >= 2 ? HOOKS : null; // `config core.hooksPath` alone reads it
  },
};

/**
 * The plain-words name of the rule a git call (argv[0] is git) breaks, or null. `env` is the
 * call's own env assignments (`GIT_CONFIG_KEY_0=core.hooksPath git commit`).
 */
export function refusal(argv, env = {}) {
  if (!argv.length || progOf(argv[0]) !== 'git') return null;
  const { cfg, sub, args } = gitSplit(argv);
  if (cfg.some((c) => isHooksKey(c.split('=')[0])) || envMovesHooks(env)) return HOOKS;
  if (!sub) return null;
  if (skipsHooks(args)) return 'skip the hooks (--no-verify)';
  return Object.hasOwn(SUBS, sub) ? SUBS[sub](args, cfg) : null;
}
