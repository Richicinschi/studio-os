/**
 * How the before-tool guards read a command line: as the simple commands it
 * RUNS. A quoted argument stays an argument, so `git commit -m "gh pr merge"` merges nothing;
 * the body of `bash -c`, `pwsh -Command` or -EncodedCommand,
 * `cmd /c`, `eval` and `iex` is read as commands too, in its own shell's rules, and so
 * is `$( )`, a backtick pair (sh), `( )` and `{ }`. Every line is a command; a heredoc body,
 * a here-string and a comment are not. Env assignments and wrapper words (time, nohup, sudo, env,
 * timeout N, xargs, nice, exec, command) come off the front. `prog` is the program's file name in
 * lower case without .exe/.cmd/.bat, so `"C:\Program Files\GitHub CLI\gh.exe"` is gh.
 *
 * Three rule sets: 'sh' (Git Bash, macOS), 'ps' (PowerShell: backslash is literal, a backtick
 * escapes and continues a line, `<# #>` is a comment) and 'cmd' (`^` escapes, no single quotes).
 * The top level's comes from the tool that runs it (the hook passes Bash or PowerShell). Unicode
 * spaces separate words everywhere.
 *
 * Each command also says what feeds its stdin (`pipe`, `heredoc`, `herestring`, `file`), where
 * its output goes (`redirs`), whether it runs in a subshell or substitution (`scoped`: a cd there
 * does not move what follows), and whether it reads its PROGRAM from stdin (`stdinProgram`: a shell
 * or interpreter given no script, `-`, `-s` or `-Command -`).
 *
 * Not seen (a floor, not a boundary): what a variable, brace expansion or `$'...'` expands to, a
 * program named by a substitution, aliases defined outside the line, and code a program runs
 * itself (`node -e`, `Start-Process`).
 */

const MAX_DEPTH = 6;
// sh: outside quotes a backslash escapes these; before anything else it is kept (C:\path stays a path).
const ESCAPABLE = ' \t"\'\\$`;&|<>(){}#*?[]~!';
const SPACE = /[\s\u200b]/;
const KEYWORDS = new Set(['if', 'then', 'else', 'elif', 'do', 'while', 'until', '!', 'fi', 'done', 'esac']);
// Wrapper words and their options that take the next word as a value.
const WRAPPERS = {
  time: ['-f', '-o'], nohup: [], exec: ['-a'], nice: ['-n'], stdbuf: ['-i', '-o', '-e'], command: [],
  sudo: ['-u', '-g', '-h', '-p', '-C', '-D', '-r', '-t', '-U'], doas: ['-u', '-C'],
  env: ['-u', '-C', '-S', '--unset', '--chdir', '--split-string'], timeout: ['-s', '-k', '--signal', '--kill-after'],
  xargs: ['-I', '-n', '-P', '-L', '-d', '-a', '-E', '-s', '--max-args', '--max-procs', '--delimiter', '--arg-file'],
};
const SHELLS = new Set(['bash', 'sh', 'zsh', 'dash', 'ksh']);
const PS_VALUE = ['-executionpolicy', '-windowstyle', '-workingdirectory', '-version', '-inputformat', '-outputformat',
  '-configurationname', '-settingsfile', '-psconsolefile', '-custompipename'];

/** A program's name as the guards compare it: the file name, lower case, without .exe/.cmd/.bat/.com. */
export const progOf = (word) => String(word).split(/[\\/]/).pop().toLowerCase().replace(/\.(exe|cmd|bat|com)$/, '');

/** The guards' rule set for a tool: PowerShell's for the PowerShell tool, sh's otherwise. */
export const modeOf = (shell) => (/^powershell$/i.test(shell || '') ? 'ps' : 'sh');

/**
 * [{ argv, env, prog, stdin, redirs, scoped, stdinProgram }] for every simple command `text`
 * runs, in the order they start. `mode` is 'sh', 'ps' or 'cmd'.
 */
export function commands(text, mode = 'sh', depth = 0) {
  const out = [];
  if (depth <= MAX_DEPTH) parse(String(text), 0, { mode, depth, out, close: false });
  return out;
}

/** Reads `text` from `i` into `out`; with `close`, stops after the `)` that closes a `$(` and returns the index after it. */
function parse(text, i, { mode, depth, out, close }) {
  const n = text.length;
  const sh = mode === 'sh';
  const ps = mode === 'ps';
  const cmd = mode === 'cmd';
  let words = [];
  let w = null;            // the word being read; null between words
  let redir = null;        // the next word is this redirection's target
  let parens = 0;          // ( ) opened inside this span
  let meta = { stdin: undefined, redirs: [] };
  const heredocs = [];     // delimiters whose bodies start at the next newline (sh)
  const nested = (body, m = mode) => { for (const c of commands(body, m, depth + 1)) out.push({ ...c, scoped: true }); };
  const endWord = () => {
    if (w === null) return;
    if (redir) { if (redir !== '<<<' && redir !== '<') meta.redirs.push({ op: redir, target: w }); redir = null; } else words.push(w);
    w = null;
  };
  const endCommand = () => {
    endWord();
    if (words.length || meta.redirs.length) simple(words, meta, out, depth, mode, depth > 0 || parens > 0); // a bare `> file` writes too
    words = [];
    meta = { stdin: undefined, redirs: [] };
  };
  const sub = (j) => { const e = parse(text, j + 2, { mode, depth: depth + 1, out, close: true }); w = `${w ?? ''}$(…)`; return e; };
  // The `$( )` spans inside an expandable PowerShell string or here-string run too.
  const subsIn = (s) => { for (let k = s.indexOf('$('); k >= 0; k = s.indexOf('$(', k + 2)) parse(s, k + 2, { mode, depth: depth + 1, out, close: true }); };

  while (i < n) {
    const c = text[i];
    if (c === '\n') {
      endCommand();
      i++;
      for (const { tag, dash } of heredocs.splice(0)) {
        let j = i;
        let end = -1;
        while (j < n) {
          const e = text.indexOf('\n', j);
          const line = text.slice(j, e < 0 ? n : e).replace(/\r$/, '');
          j = e < 0 ? n : e + 1;
          if ((dash ? line.replace(/^\t+/, '') : line) === tag) { end = j; break; }
        }
        if (end >= 0) i = end; // no terminator: not a heredoc (`(( 1<<2 ))`), so nothing is skipped
      }
      continue;
    }
    if (SPACE.test(c)) { endWord(); i++; continue; }
    if (ps && c === '`') {
      if (text[i + 1] === '\n' || (text[i + 1] === '\r' && text[i + 2] === '\n')) { i += text[i + 1] === '\r' ? 3 : 2; continue; }
      w = (w ?? '') + (text[i + 1] ?? '');
      i += 2;
      continue;
    }
    if (cmd && c === '^') {
      if (text[i + 1] === '\n') { i += 2; continue; }
      w = (w ?? '') + (text[i + 1] ?? '');
      i += 2;
      continue;
    }
    if (!cmd && w === null && c === '#') { while (i < n && text[i] !== '\n') i++; continue; }
    if (ps && w === null && c === '<' && text[i + 1] === '#') { const e = text.indexOf('#>', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (c === ')') {
      endCommand();
      i++;
      if (parens === 0 && close) return i;
      parens = Math.max(0, parens - 1);
      continue;
    }
    if (c === '&' && text[i + 1] === '>') { endWord(); i += text[i + 2] === '>' ? 3 : 2; redir = '>'; continue; }
    if (c === '|') {
      const pipe = text[i + 1] !== '|';
      endCommand();
      i += pipe ? (text[i + 1] === '&' ? 2 : 1) : 2;
      if (pipe) meta.stdin = 'pipe'; // the next command reads it
      continue;
    }
    if (c === ';' || c === '&' || c === '(') { endCommand(); if (c === '(') parens++; i++; continue; }
    if (!cmd && (c === '{' || c === '}') && w === null) { endCommand(); i++; continue; }
    if (sh && c === '<' && text.startsWith('<<', i) && text[i + 2] !== '<') {
      const m = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([^\s;&|<>()'"]+))/.exec(text.slice(i, i + 200));
      if (m) { endWord(); heredocs.push({ tag: m[2] ?? m[3] ?? m[4], dash: m[1] === '-' }); meta.stdin = 'heredoc'; i += m[0].length; continue; }
    }
    if (c === '<' || c === '>') {
      const fd = w !== null && /^\d+$/.test(w);
      if (fd) w = null; // a file descriptor, as in 2>&1
      endWord();
      if (text[i + 1] === '(') { i++; continue; } // process substitution: the ( is next
      let op = c;
      i++;
      while (i < n && '<>&|'.includes(text[i])) op += text[i++];
      if (op.startsWith('<<<')) { meta.stdin = 'herestring'; redir = '<<<'; } else if (op.startsWith('<')) { meta.stdin = meta.stdin ?? 'file'; redir = '<'; } else redir = fd ? `2${op}` : op.replace(/[&|]$/, '');
      continue;
    }
    // A word character.
    if (ps && c === '@' && w === null && (text[i + 1] === "'" || text[i + 1] === '"') && /^\r?\n/.test(text.slice(i + 2, i + 4))) {
      const q = text[i + 1];
      const start = text.indexOf('\n', i) + 1;
      const end = text.indexOf(`\n${q}@`, start);
      w = text.slice(start, end < 0 ? n : end); // a here-string: one word
      if (q === '"') subsIn(w);
      i = end < 0 ? n : end + 3;
      continue;
    }
    if (w === null) w = '';
    if (c === "'" && !cmd) {
      let j = i + 1;
      for (;;) {
        const e = text.indexOf("'", j);
        if (e < 0) { w += text.slice(j); j = n; break; }
        w += text.slice(j, e);
        if (ps && text[e + 1] === "'") { w += "'"; j = e + 2; continue; } // '' inside a PowerShell string
        j = e + 1;
        break;
      }
      i = j;
      continue;
    }
    if (c === '"') {
      i++;
      while (i < n) {
        const d = text[i];
        if (d === '"') {
          if (ps && text[i + 1] === '"') { w += '"'; i += 2; continue; }
          break;
        }
        if (sh && d === '\\' && '"\\$`\n'.includes(text[i + 1] ?? '')) { if (text[i + 1] !== '\n') w += text[i + 1]; i += 2; continue; }
        if (ps && d === '`') { w += text[i + 1] ?? ''; i += 2; continue; }
        if (!cmd && d === '$' && text[i + 1] === '(') { i = sub(i); continue; }
        if (sh && d === '`') {
          const e = text.indexOf('`', i + 1);
          const q = text.indexOf('"', i + 1);
          if (e > 0 && (q < 0 || e < q)) { nested(text.slice(i + 1, e)); w += '`…`'; i = e + 1; continue; }
        }
        w += d;
        i++;
      }
      i++;
      continue;
    }
    if (sh && c === '\\') {
      const d = text[i + 1];
      if (d === '\n') { i += 2; continue; }
      if (d !== undefined && ESCAPABLE.includes(d)) { w += d; i += 2; continue; }
      w += c;
      i++;
      continue;
    }
    if (!cmd && c === '$' && text[i + 1] === '(') { i = sub(i); continue; }
    if (sh && c === '`') {
      const e = text.indexOf('`', i + 1);
      if (e > 0) { nested(text.slice(i + 1, e)); w += '`…`'; i = e + 1; continue; }
    }
    w += c;
    i++;
  }
  endCommand();
  return n;
}

/** One simple command: keywords, env assignments and wrapper words off the front; a shell's body read too. */
function simple(words, meta, out, depth, mode, scoped) {
  const a = [...words];
  const env = {};
  let stdin = meta.stdin;
  for (;;) {
    while (a.length && KEYWORDS.has(a[0])) a.shift();
    while (a.length && /^[A-Za-z_]\w*=/.test(a[0])) {
      const x = a.shift();
      env[x.slice(0, x.indexOf('='))] = x.slice(x.indexOf('=') + 1);
    }
    const p = a.length ? progOf(a[0]) : '';
    if (!Object.hasOwn(WRAPPERS, p) || (p === 'command' && /^-[vV]$/.test(a[1] || ''))) break;
    a.shift();
    while (a.length && a[0].startsWith('-') && a[0] !== '-') {
      const f = a.shift();
      if (f === '--') break;
      if (WRAPPERS[p].includes(f)) a.shift();
    }
    if (p === 'timeout' && a.length) a.shift(); // its duration
    if (p === 'xargs') stdin = undefined;       // xargs turns stdin into arguments
  }
  if (!a.length) {
    if (Object.keys(env).length || meta.redirs.length) out.push({ argv: [], env, prog: '', stdin, redirs: meta.redirs, scoped, stdinProgram: false });
    return;
  }
  const prog = progOf(a[0]);
  const body = bodyOf(prog, a);
  out.push({ argv: a, env, prog, stdin, redirs: meta.redirs, scoped, stdinProgram: body === STDIN || readsStdin(prog, a) });
  if (body && body !== STDIN) for (const c of commands(body.text, body.mode, depth + 1)) out.push({ ...c, scoped: true });
}

const STDIN = Symbol('stdin');

/** The command text a shell, PowerShell, cmd, eval, iex or wsl runs ({ text, mode }), STDIN when it reads it from stdin, or null. */
function bodyOf(prog, a) {
  if (SHELLS.has(prog)) {
    let c = false;
    let s = false;
    for (let i = 1; i < a.length; i++) {
      const x = a[i];
      if (x === '-') return c ? null : STDIN;
      if (x === '--') return c ? (a[i + 1] ? { text: a[i + 1], mode: 'sh' } : null) : a[i + 1] ? null : STDIN;
      if (/^-[A-Za-z]*c[A-Za-z]*$/.test(x)) { c = true; continue; }
      if (/^-[A-Za-z]*s[A-Za-z]*$/.test(x)) s = true;
      if (/^[-+][oO]$/.test(x) || ['--rcfile', '--init-file'].includes(x)) { i++; continue; }
      if (/^[-+]/.test(x)) continue;
      return c ? { text: x, mode: 'sh' } : s ? STDIN : null;
    }
    return c ? null : STDIN;
  }
  if (prog === 'pwsh' || prog === 'powershell') {
    if (a.length === 1) return STDIN;
    for (let i = 1; i < a.length; i++) {
      const x = a[i].toLowerCase();
      const is = (name) => x.length >= 2 && name.startsWith(x);
      if (x === '-') return STDIN;
      if (!x.startsWith('-')) return { text: a.slice(i).join(' '), mode: 'ps' };
      if (is('-command')) return a[i + 1] === '-' ? STDIN : { text: a.slice(i + 1).join(' '), mode: 'ps' };
      if (is('-encodedcommand') || x === '-ec') {
        try { return { text: Buffer.from(a[i + 1] || '', 'base64').toString('utf16le'), mode: 'ps' }; } catch { return null; }
      }
      if (is('-file')) return a[i + 1] === '-' ? STDIN : null;
      if (['-ep', '-ex', '-wd', '-of', '-if', '-v', '-w'].includes(x) || PS_VALUE.some((p) => x.length >= 3 && p.startsWith(x))) i++;
    }
    return null;
  }
  if (prog === 'cmd') {
    const i = a.findIndex((x, k) => k > 0 && /^\/[ck]$/i.test(x));
    return i > 0 ? { text: a.slice(i + 1).join(' '), mode: 'cmd' } : STDIN;
  }
  if (prog === 'eval') return { text: a.slice(1).join(' '), mode: 'sh' };
  if (prog === 'iex' || prog === 'invoke-expression') {
    const rest = a.slice(1).filter((x) => !/^-command$/i.test(x));
    return rest.length ? { text: rest.join(' '), mode: 'ps' } : STDIN;
  }
  if (prog === 'wsl') {
    for (let i = 1; i < a.length; i++) {
      const x = a[i];
      if (x === '-e' || x === '--exec' || x === '--') return { text: a.slice(i + 1).join(' '), mode: 'sh' };
      if (['-d', '--distribution', '-u', '--user', '--cd'].includes(x)) { i++; continue; }
      if (!x.startsWith('-')) return { text: a.slice(i).join(' '), mode: 'sh' };
    }
  }
  return null;
}

/** True when node or python takes its program from stdin: `-`, or no script, -e, -c or -m. */
function readsStdin(prog, a) {
  const args = a.slice(1);
  if (prog === 'node') {
    if (args.includes('-')) return true;
    return !args.some((x) => !x.startsWith('-') || /^(-e|--eval|-p|--print|--test|-v|--version|-h|--help|-c|--check|-i|--interactive)(=|$)/.test(x));
  }
  if (/^python(3(\.\d+)?)?$/.test(prog)) {
    if (args.includes('-')) return true;
    return !args.some((x) => !x.startsWith('-') || /^-[cm]/.test(x) || /^(-V|--version|-h|--help)$/.test(x));
  }
  return false;
}
