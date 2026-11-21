/**
 * git's option reader, shared by the grant guard (grant-required.mjs) and the shipped git-guardrails guard:
 * git's global options and subcommand, then a subcommand's options and positionals, and which
 * pathspecs name the whole tree. Self-contained (no imports), so it can be copied byte for byte.
 */

/**
 * git's global options, then the subcommand and its arguments. A global option that takes its
 * value as the next word consumes it (`git --attr-source HEAD reset --hard` runs reset): -C, -c,
 * --git-dir, --work-tree, --namespace, --config-env, --attr-source and --shallow-file (git 2.54);
 * --super-prefix and --list-cmds of older gits; --exec-path alone prints a path and exits.
 */
export function gitSplit(argv) {
  const dirs = [];
  const git = [];
  const cfg = [];
  let i = 1;
  for (; i < argv.length; i++) {
    const x = argv[i];
    if (!x.startsWith('-')) break;
    if (x === '-C') dirs.push(argv[++i] ?? '');
    else if (x === '-c') cfg.push(argv[++i] ?? '');
    else if (['--git-dir', '--work-tree', '--namespace'].includes(x)) git.push(`${x}=${argv[++i] ?? ''}`);
    else if (/^--(git-dir|work-tree|namespace)=/.test(x)) git.push(x);
    else if (x === '--config-env') cfg.push(argv[++i] ?? '');
    else if (x.startsWith('--config-env=')) cfg.push(x.slice(13));
    else if (['--attr-source', '--shallow-file', '--exec-path', '--super-prefix', '--list-cmds'].includes(x)) i++;
  }
  return { dirs, git, cfg, sub: argv[i], args: argv.slice(i + 1) };
}

/**
 * A pathspec's magic words (lower case) and the pattern after them: the long form `:(top,glob)x`
 * and the short form, a colon and the signs `/` (top), `!` or `^` (exclude), then an optional
 * colon (`:/x`, `:!x`, `:/!:x`).
 */
function magicOf(pathspec) {
  const s = String(pathspec);
  if (s.startsWith(':(')) {
    const end = s.indexOf(')');
    if (end > 0) return { magic: s.slice(2, end).split(',').map((m) => m.trim().toLowerCase()), rest: s.slice(end + 1) };
  }
  if (!s.startsWith(':')) return { magic: [], rest: s };
  let j = 1;
  const magic = [];
  for (; j < s.length && '/!^'.includes(s[j]); j++) magic.push(s[j] === '/' ? 'top' : 'exclude');
  if (s[j] === ':') j++;
  return { magic, rest: s.slice(j) };
}

const excluded = (magic) => magic.includes('exclude');

/**
 * True when a pathspec names the whole working tree, or all of the folder it is read from (the top
 * with `top` or `:/`, else the current folder). The pattern after the magic is read lexically:
 * `./` and `//` collapse and `..` takes off the segment before it. It names the whole tree when
 * nothing is left (`.`, `./`, `src/..`, `..`), or when what is left is made of wildcards alone and
 * holds a `*` (`*`, `**`, `./**`, `?*`, `**` and `*` joined by a slash): a literal before the first wildcard (`src/*.js`)
 * or after it (`*.js`) narrows it. With `glob`, `*` stops at `/`, so `:(glob)*` discards the
 * top-level files only: still refused. `:(literal)` reads `*` as a file name; an exclusion names
 * nothing by itself (excludeOnly reads a list of them).
 */
export function wholeTree(pathspec) {
  const { magic, rest } = magicOf(pathspec);
  if (excluded(magic)) return false;
  const kept = [];
  for (const seg of rest.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') kept.pop();
    else kept.push(seg);
  }
  const left = kept.join('/');
  if (left === '') return true;
  return !magic.includes('literal') && /^[*?/]+$/.test(left) && left.includes('*');
}

/**
 * True when every pathspec of a non-empty list is an exclusion (`:!x`, `:^x`, `:(exclude)x`): git
 * then reads the list as everything except those, so it names the whole tree.
 */
export function excludeOnly(pathspecs) {
  return pathspecs.length > 0 && pathspecs.every((p) => excluded(magicOf(p).magic));
}

/**
 * A subcommand's options and positionals. `values` are the long options that take the next word,
 * `shorts` the short ones (value = rest of the cluster or the next word), `attached` the short ones
 * whose value can only be attached (`-S<key>`). git accepts an unambiguous prefix of a long option,
 * so a prefix of one of `guarded` counts as it (`--force-w`, `--amen`, `--no-veri`; review #6).
 * `unknown` is set when a long option is neither listed nor guarded.
 */
export function opts(args, { values = [], switches = [], shorts = '', attached = '', guarded = [] } = {}) {
  const flags = new Map();
  const pos = [];
  let unknown = false;
  for (let i = 0; i < args.length; i++) {
    const x = args[i];
    if (x === '--') { pos.push(...args.slice(i + 1)); break; }
    if (x.startsWith('--')) {
      const eq = x.indexOf('=');
      const name = eq < 0 ? x : x.slice(0, eq);
      const known = values.includes(name) || switches.includes(name) || guarded.includes(name);
      if (!known) {
        const g = name.length >= 3 ? guarded.filter((k) => k.startsWith(name)) : [];
        for (const k of g) flags.set(k, true);
        if (!g.length) unknown = true;
      }
      flags.set(name, eq >= 0 ? x.slice(eq + 1) : values.includes(name) ? args[++i] : true);
      continue;
    }
    if (x.length > 1 && x[0] === '-') {
      for (let j = 1; j < x.length; j++) {
        const f = x[j];
        if (shorts.includes(f)) { flags.set(`-${f}`, x.slice(j + 1) || args[++i]); break; }
        flags.set(`-${f}`, attached.includes(f) ? x.slice(j + 1) || true : true);
        if (attached.includes(f)) break;
      }
      continue;
    }
    pos.push(x);
  }
  return { has: (...names) => names.some((k) => flags.has(k)), get: (k) => flags.get(k), pos, unknown };
}

/** The option tables (for opts) of the commands that can discard working-tree changes. */
export const WORKTREE_OPTS = {
  checkout: { values: ['--orphan', '--conflict', '--pathspec-from-file'], shorts: 'bB', guarded: ['--force'] },
  switch: { values: ['--create', '--force-create', '--orphan', '--conflict'], shorts: 'cC', guarded: ['--force', '--discard-changes', '--force-create'] },
  restore: { values: ['--source', '--conflict', '--pathspec-from-file', '--unified', '--inter-hunk-context'], shorts: 's', guarded: ['--worktree', '--staged'] },
  rm: { values: ['--pathspec-from-file'], guarded: ['--cached'] },
  'read-tree': { guarded: ['--reset'] },
};

/**
 * True when the last word before `--` that sets or clears a switch sets it: `long` or a prefix of
 * it from three characters (`--cach`), its `--no-` form or a prefix from six (`--no-c`) clears it,
 * and `short` in a flag group (`-rn`) sets it. For git rm, whose short options take no value and
 * whose long ones these prefixes name alone.
 */
export function lastSwitch(args, long, short = '') {
  const no = `--no-${long.slice(2)}`;
  let on = false;
  for (const x of args) {
    if (x === '--') break;
    const name = x.split('=')[0];
    if (name.length >= 3 && long.startsWith(name)) on = true;
    else if (name.length >= 6 && no.startsWith(name)) on = false;
    else if (short && /^-[^-]/.test(x) && x.includes(short)) on = true;
  }
  return on;
}

/** True when git rm's last of `--cached` and `--no-cached` is `--cached` (it then keeps the files). */
export const cachedLast = (args) => lastSwitch(args, '--cached');

/** True when pathspecs name the whole tree: one of them does, or all are exclusions (everything but). */
export const allOf = (pathspecs) => pathspecs.some(wholeTree) || excludeOnly(pathspecs);
