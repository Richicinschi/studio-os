// tools/check-setup.mjs
// A read-only check of an adopter's setup, without the model (public issues #11, #32): for each item in
// adoption/installed.json, whether every file and settings key the install wrote is still there, and
// whether the commands in its card's check block print what they should. Run from the kit's folder:
//   node tools/check-setup.mjs <setup> [<id>...]
// A card's "## Check" section may hold fenced blocks with the info string `check`:
//   run: <a bash command, run in the setup folder>
//   expect: <the last line it must print>
//   install: <kit path> -> <setup path>      (read only by the kit's own tests, which install in a throwaway folder)
// A command sees SETUP, KIT and ID, and two helpers: `installed <name> [<item>]` prints where the item's
// recorded file of that name is, and `frontdoor [<item>]` the item's recorded AGENTS.md, else its CLAUDE.md.
// The steps a card leaves to the person ("you:") are counted, not run.
// What a run: line may hold is an allowlist (lintChecks): a few commands that only read, git only as
// `git -C "$SETUP"` with a reading subcommand, node only on an item's own installed file, and no
// redirect, quoting trick or substitution beyond that; the content lint applies it to every card, and
// this script again before it runs a block. It writes nothing itself.
// Exit 0 when every item passes; 1 when one fails; 2 on bad input or an error, bash not found included.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkSetup, readRecord, BadInput } from './installed.mjs';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const RUN_TIMEOUT_MS = 30000;

// The card an item id names: its card name, or a scan key (agent:<id>, skill:<id>, pack:<id>).
export const cardOf = (id) => (id.startsWith('pack:') ? `pack-${id.slice(5)}` : id.replace(/^(skill|agent|practice|external):/, ''));

// A card's Check section, with the line number its first line has in the card.
function checkSection(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const at = lines.findIndex((l) => l.trimEnd() === '## Check');
  if (at < 0) return { lines: [], start: 0 };
  let end = lines.findIndex((l, i) => i > at && /^## /.test(l));
  if (end < 0) end = lines.length;
  return { lines: lines.slice(at + 1, end), start: at + 2 };
}

// The check blocks of a card: { steps: [{ run, expect, line }], install: [{ from, to, line }], manual, errors }.
export function parseChecks(text) {
  const { lines, start } = checkSection(text);
  const steps = [];
  const install = [];
  const errors = [];
  let inBlock = false;
  let pending = null;
  const dangling = () => { if (pending) errors.push(`line ${pending.line}: a run: line with no expect: after it`); pending = null; };
  lines.forEach((raw, i) => {
    const line = start + i;
    const l = raw.trim();
    if (/^```/.test(l)) {
      if (!inBlock && l === '```check') { inBlock = true; return; }
      if (inBlock) { dangling(); inBlock = false; }
      return;
    }
    if (!inBlock || l === '' || l.startsWith('#')) return;
    let m;
    if ((m = l.match(/^run: (.+)$/))) {
      dangling();
      pending = { run: m[1], line };
    } else if ((m = l.match(/^expect:(.*)$/))) {
      if (!pending) errors.push(`line ${line}: an expect: line with no run: before it`);
      else { steps.push({ ...pending, expect: m[1].trim() }); pending = null; }
    } else if ((m = l.match(/^install: (\S+) -> (\S+)$/))) {
      install.push({ from: m[1], to: m[2], line });
    } else errors.push(`line ${line}: not a run:, expect: or install: line: ${l}`);
  });
  if (inBlock) { dangling(); errors.push('a check block is not closed'); }
  const manual = lines.filter((l) => /\*\*you:\*\*/.test(l)).length;
  return { steps, install, manual, errors };
}

// The allowlist. A run: line is a list of simple commands joined by |, &&, || or ;. Each command's first
// word is one of these, unquoted; `installed` and `frontdoor` are the helpers above.
export const READERS = new Set(['test', '[', 'grep', 'echo', 'ls', 'wc', 'head', 'tail', 'cut', 'tr', 'cat', 'installed', 'frontdoor']);
// git only as git -C "$SETUP" <one of these>; config only with --get or --get-all.
export const GIT_READS = new Set(['check-ignore', 'rev-parse', 'ls-files', 'config']);
const VARS = new Set(['SETUP', 'KIT', 'ID', '?']);
const REDIRECTS = new Set(['2>/dev/null', '>/dev/null', '1>/dev/null', '2>&1', '>&2', '1>&2']);

class Refused extends Error {}

// Splits a command line into commands of words, reading quotes as bash does. Each word keeps its text as
// written (raw), whether it used a quote, whether it holds an unquoted < or >, and the $( ) inside it.
export function splitCommands(line) {
  const commands = [[]];
  let w = null;
  let i = 0;
  const word = () => { if (!w) w = { raw: '', quoted: false, redirect: false, subs: [] }; return w; };
  const end = () => { if (w) { commands.at(-1).push(w); w = null; } };
  // $( ... ): to the matching ), with quotes inside skipped; returns the index after it.
  const sub = (from) => {
    let depth = 1;
    let j = from;
    while (j < line.length && depth) {
      const c = line[j];
      if (c === '\'') { const k = line.indexOf('\'', j + 1); if (k < 0) throw new Refused('a quote that is not closed'); j = k + 1; continue; }
      if (c === '"') { j += 1; while (j < line.length && line[j] !== '"') j += line[j] === '\\' ? 2 : 1; j += 1; continue; }
      if (c === '(') depth += 1;
      if (c === ')') depth -= 1;
      j += 1;
    }
    if (depth) throw new Refused('a $( that is not closed');
    word().subs.push(line.slice(from, j - 1));
    return j;
  };
  const dollar = (j) => {
    const next = line[j + 1];
    if (next === '(') { if (line[j + 2] === '(') throw new Refused('arithmetic $(( ))'); w.raw += line.slice(j, j); return sub(j + 2); }
    const name = line.slice(j + 1).match(/^([A-Za-z_][A-Za-z0-9_]*|\?)/)?.[1];
    if (!name || !VARS.has(name)) throw new Refused(`a $ the lint does not allow (only $SETUP, $KIT, $ID, $? and $( ))`);
    return j + 1 + name.length;
  };
  while (i < line.length) {
    const c = line[i];
    if (c === ' ' || c === '\t') { end(); i += 1; continue; }
    if (c === '|' || c === ';' || (c === '&' && line[i + 1] === '&')) {
      if (c === '|' && w && /[<>]$/.test(w.raw)) throw new Refused('a redirect into a pipe (>|)');
      end();
      i += line[i + 1] === c ? 2 : 1;
      commands.push([]);
      continue;
    }
    if (c === '&') {
      if (w && /[<>]$/.test(w.raw)) { word().raw += c; i += 1; continue; }
      throw new Refused('an & that runs a command in the background');
    }
    if (c === '\\') throw new Refused('a backslash outside single quotes');
    if (c === '`') throw new Refused('a backtick');
    if (c === '(' || c === ')' || c === '{' || c === '}') throw new Refused(`a ${c} outside quotes`);
    if (c === '\'') {
      const k = line.indexOf('\'', i + 1);
      if (k < 0) throw new Refused('a quote that is not closed');
      const x = word(); x.raw += line.slice(i, k + 1); x.quoted = true;
      i = k + 1;
      continue;
    }
    if (c === '"') {
      const x = word(); x.quoted = true;
      let j = i + 1;
      x.raw += '"';
      while (j < line.length && line[j] !== '"') {
        if (line[j] === '\\') throw new Refused('a backslash inside double quotes');
        if (line[j] === '`') throw new Refused('a backtick');
        if (line[j] === '$') { const from = j; j = dollar(j); x.raw += line.slice(from, j); continue; }
        x.raw += line[j];
        j += 1;
      }
      if (j >= line.length) throw new Refused('a quote that is not closed');
      x.raw += '"';
      i = j + 1;
      continue;
    }
    if (c === '$') {
      if (line[i + 1] === '\'' || line[i + 1] === '"' || line[i + 1] === '{') throw new Refused(`a $${line[i + 1]}`);
      const x = word(); const from = i; i = dollar(i); x.raw += line.slice(from, i);
      continue;
    }
    const x = word();
    if (c === '<' || c === '>') x.redirect = true;
    x.raw += c;
    i += 1;
  }
  end();
  return commands;
}

// Why a command line is refused, or null. Every $( ) inside it is held to the same rules.
export function refusal(line) {
  try {
    check(line);
    return null;
  } catch (e) {
    if (e instanceof Refused) return e.message;
    throw e;
  }
}
function check(line) {
  const commands = splitCommands(line);
  for (const words of commands) {
    if (!words.length) throw new Refused('an empty command');
    for (const x of words) {
      if (x.redirect && (x.quoted || !REDIRECTS.has(x.raw))) throw new Refused(`a redirect other than ${[...REDIRECTS].join(', ')}: ${x.raw}`);
      if (x.raw.includes('<<')) throw new Refused('a here-document or here-string');
    }
    const args = words.filter((x) => !x.redirect);
    const [first, ...rest] = args;
    if (!first) throw new Refused('a redirect with no command');
    if (first.quoted || first.subs.length) throw new Refused(`a command word written with quotes or $: ${first.raw}`);
    if (first.raw === 'node') {
      if (rest.length !== 1 || !/^"\$\(installed [\w./-]+\)"$/.test(rest[0].raw)) throw new Refused('node may only run an item\'s own installed file: node "$(installed <name>)"');
    } else if (first.raw === 'git') {
      const [c, dir, cmd, ...more] = rest;
      if (c?.raw !== '-C' || dir?.raw !== '"$SETUP"' || !GIT_READS.has(cmd?.raw)) throw new Refused(`git only as git -C "$SETUP" with ${[...GIT_READS].join(', ')}`);
      if (cmd.raw === 'config' && !more.some((x) => x.raw === '--get' || x.raw === '--get-all')) throw new Refused('git config only with --get or --get-all');
      if (more.some((x) => /^-c|^--(output|exec|ext-diff|textconv|config-env)/.test(x.raw.replace(/^['"]/, '')))) throw new Refused(`a git option that can write or run something: ${more.map((x) => x.raw).join(' ')}`);
    } else if (!READERS.has(first.raw)) {
      throw new Refused(`a command that is not on the list of readers (${[...READERS].join(', ')}, node, git): ${first.raw}`);
    }
    for (const x of words) for (const s of x.subs) check(s);
  }
}

export function lintChecks(rel, text) {
  const { steps, install, errors } = parseChecks(text);
  const out = errors.map((e) => `${rel}: check block, ${e}`);
  for (const s of steps) {
    const why = refusal(s.run);
    if (why) out.push(`${rel}:${s.line} check block: a run: line the allowlist refuses (${why}): ${s.run}`);
  }
  const outside = (p) => path.isAbsolute(p) || /^[A-Za-z]:/.test(p) || p.startsWith('~') || p.split(/[\\/]/).includes('..');
  for (const i of install) if (outside(i.from) || outside(i.to)) out.push(`${rel}:${i.line} check block: an install: line must stay inside the kit and the setup`);
  return out;
}

// Git Bash on Windows: the bash beside the git that is installed, never the WSL launcher in System32;
// bash elsewhere. Null when there is none.
export function findBash({ platform = process.platform, env = process.env, run = spawnSync } = {}) {
  const ok = (p) => p && existsSync(p) && !/[\\/]system32[\\/]/i.test(p);
  if (ok(env.CLAUDE_CODE_GIT_BASH_PATH)) return env.CLAUDE_CODE_GIT_BASH_PATH;
  if (platform !== 'win32') return 'bash';
  const exec = run('git', ['--exec-path'], { encoding: 'utf8' });
  const found = [];
  if (!exec.error && exec.status === 0) {
    // <git>/mingw64/libexec/git-core, or <git>/libexec/git-core: bash is in <git>/bin.
    for (let d = path.resolve(String(exec.stdout).trim()), n = 0; n < 4; d = path.dirname(d), n += 1) found.push(path.join(d, 'bin', 'bash.exe'), path.join(d, 'usr', 'bin', 'bash.exe'));
  }
  found.push('C:\\Program Files\\Git\\bin\\bash.exe', 'C:\\Program Files (x86)\\Git\\bin\\bash.exe');
  return found.find(ok) || null;
}

// installed.mjs beside this file, run by the same node, so a check reads the record however the kit was given.
const INSTALLED_MJS = fileURLToPath(new URL('./installed.mjs', import.meta.url));
const PRELUDE = [
  'node() { "$NODE" "$@"; }',
  'installed() { "$NODE" "$INSTALLED_MJS" where "$SETUP" "${2:-$ID}" "$1"; }',
  'frontdoor() { installed AGENTS.md "$1" 2>/dev/null || installed CLAUDE.md "$1"; }',
].join('\n');

// Runs one check step in the setup folder; returns the last line it printed, and the last line of its errors.
function runStep(step, { setup, kit, id, bash, timeoutMs }) {
  const r = spawnSync(bash, ['-c', `${PRELUDE}\n${step.run}`], {
    cwd: setup, encoding: 'utf8', input: '', timeout: timeoutMs,
    env: { ...process.env, SETUP: setup, KIT: kit, ID: id, NODE: process.execPath, INSTALLED_MJS, GIT_OPTIONAL_LOCKS: '0' },
  });
  if (r.error && r.error.code !== 'ETIMEDOUT') throw new BadInput(`could not start ${bash}: ${r.error.message}`);
  if (r.error) return { got: null, error: `timed out after ${timeoutMs / 1000} s` };
  const last = (s) => String(s || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).at(-1) || '';
  // Its errors from the first line, where the cause usually is (a helper that found no file), at most 300 characters.
  const errs = String(r.stderr || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(' / ');
  return { got: last(r.stdout), error: null, stderr: errs.length > 300 ? `${errs.slice(0, 297)}...` : errs };
}

// Each recorded item (or the ones named), checked: { id, status, files, missing, changed, steps, manual }.
export function checkItems(setup, { kit = KIT, ids = [], bash, timeoutMs = RUN_TIMEOUT_MS } = {}) {
  const { items } = checkSetup(setup, { kit, ids });
  let shell = bash;
  return items.filter((it) => !['SKIP', 'UNDONE'].includes(it.decision)).map((it) => {
    const files = it.parts.filter((p) => p.kind === 'file' && p.state !== 'added');
    const missing = it.parts.filter((p) => p.state === 'missing').map((p) => (p.kind === 'key' ? `${p.file}#${p.key}` : p.path));
    const changed = it.parts.filter((p) => p.state === 'changed' || p.state === 'added').map((p) => (p.kind === 'key' ? `${p.file}#${p.key}` : p.path));
    const name = `cards/${cardOf(it.id)}.md`;
    const cardFile = path.join(kit, name);
    const text = existsSync(cardFile) ? readFileSync(cardFile, 'utf8') : null;
    const card = text === null ? null : parseChecks(text);
    // A block the allowlist refuses is never run, wherever the card came from.
    const errors = text === null ? [] : lintChecks(name, text);
    const steps = errors.length || !card ? [] : card.steps.map((s) => {
      if (shell === undefined) shell = findBash();
      if (!shell) throw new BadInput('bash was not found: install Git for Windows, or set CLAUDE_CODE_GIT_BASH_PATH to its bash.exe');
      const r = runStep(s, { setup, kit, id: it.id, bash: shell, timeoutMs });
      return { run: s.run, expect: s.expect, got: r.got, error: r.error, stderr: r.stderr, pass: !r.error && r.got === s.expect };
    });
    const fail = missing.length > 0 || errors.length > 0 || steps.some((s) => !s.pass);
    return { id: it.id, card: card ? name : null, status: fail ? 'fail' : 'pass', files: files.length, keys: it.parts.filter((p) => p.kind === 'key').length, missing, changed, steps, manual: card ? card.manual : 0, errors };
  });
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function checkItemsText(results) {
  if (!results.length) return 'No installed items to check.';
  const out = [];
  for (const r of results) {
    const present = r.files + r.keys - r.missing.length;
    const parts = [`${present} of ${plural(r.files + r.keys, 'file or key', 'files and keys')} present`];
    if (r.steps.length) parts.push(`${r.steps.filter((s) => s.pass).length} of ${plural(r.steps.length, 'check')} passed`);
    if (r.manual) parts.push(`${plural(r.manual, 'step')} for you, from ${r.card}`);
    if (!r.card) parts.push('no card in this kit');
    out.push(`${r.id}: ${r.status} (${parts.join('; ')})`);
    for (const p of r.missing) out.push(`  missing  ${p}`);
    for (const p of r.changed) out.push(`  changed since the install  ${p}`);
    for (const s of r.steps.filter((x) => !x.pass)) {
      out.push(`  failed  ${s.run}\n    expected: ${s.expect}\n    printed: ${s.error ? `(${s.error})` : s.got || '(nothing)'}`);
      if (s.stderr) out.push(`    error: ${s.stderr}`);
    }
    for (const e of r.errors) out.push(`  not run  ${e}`);
  }
  return out.join('\n');
}

function main(argv) {
  const [setupArg, ...ids] = argv;
  if (!setupArg) throw new BadInput('usage: node tools/check-setup.mjs <setup> [<id>...]');
  const setup = path.resolve(setupArg);
  if (!existsSync(setup) || !statSync(setup).isDirectory()) throw new BadInput(`not a folder: ${setupArg}`);
  if (!readRecord(setup).items.length) throw new BadInput('no install record (adoption/installed.json): run each card\'s Check instead, as setup-check mode does');
  const results = checkItems(setup, { ids });
  console.log(checkItemsText(results));
  return results.every((r) => r.status === 'pass') ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exitCode = 2;
  }
}
