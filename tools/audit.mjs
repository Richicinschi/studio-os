// tools/audit.mjs
// Print what a setup folder holds, as names only, never values: node tools/audit.mjs <folder> [--depth N]
// Read-only. It lists file types, manifests' dependency names, compose services, CI jobs, the existing
// Claude setup (hook events and script names, permission counts, enabled plugins, MCP server names,
// skill and agent descriptions, instruction-file headings), git remote hosts, branches and dirty counts,
// and hook names. It never prints an environment value, a command, a header, a rule's text, a URL beyond
// its host, or a file's body. It never opens `.env*`, `*.pem`, `*.key`, `*credential*`, `*secret*`,
// `id_*` or data files, and lists them under "Present but not opened". It goes at most N folders deep
// (default 4), never into node_modules/, .venv/, venv/ or build folders, and reads at most the first
// 200 lines of a manifest. Exit 0 on success, 2 on bad input, 1 on an unexpected error (named only).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HEADINGS = ['Stack', 'File types (top 15)', 'Repositories', 'Existing Claude setup', 'Already installed', 'Hooks', 'Present but not opened'];
export const DEFAULT_DEPTH = 4;
const MAX_LINES = 200;
const MAX_BYTES = 1024 * 1024;
const NOT_PARSED = 'present, not parsed';

const SKIP_DIRS = new Set(['.git', 'node_modules', '.venv', 'venv', 'build', 'dist', 'out', 'target', '.next', '.nuxt', '.svelte-kit',
  '__pycache__', '.gradle', '.dart_tool', '.tox', '.mypy_cache', '.pytest_cache']);
const DATA_DIRS = new Set(['data', 'datasets']);
// The never list: matched on the lower-case name of a file or folder, which is listed and never opened.
const NEVER = [
  { kind: 'environment files (.env*)', test: (n) => n.startsWith('.env') },
  { kind: 'keys and certificates (*.pem, *.key)', test: (n) => n.endsWith('.pem') || n.endsWith('.key') },
  { kind: 'credential files (*credential*)', test: (n) => n.includes('credential') },
  { kind: 'secret files (*secret*)', test: (n) => n.includes('secret') },
  { kind: 'SSH keys (id_*)', test: (n) => n.startsWith('id_') },
  { kind: 'data files (*.csv, *.parquet, *.xlsx, *.db, *.sqlite)', test: (n) => /\.(?:csv|parquet|xlsx|db|sqlite)$/.test(n) },
];
const DATA_FOLDERS = 'data folders';
const LIST_CAP = 10;

// What may be printed as a name: no spaces, no quotes, no URL user info.
const NAME = /^[A-Za-z0-9@_][\w@./:+-]{0,199}$/;
const HOST = /^(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+$|^\[[0-9A-Fa-f:.]+\]$/;
const name = (s) => (typeof s === 'string' && NAME.test(s) && !s.includes('://') ? s : null);
const cell = (s) => String(s).replace(/[\r\n]+/g, ' ').replace(/\|/g, '\\|');
const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const lines = (text) => text.replace(/^\uFEFF/, '').split(/\r?\n/);

// The first `max` lines of a file, read in chunks so a large file is never read whole.
function readHead(file, max = MAX_LINES) {
  const fd = fs.openSync(file, 'r');
  const chunks = [];
  const buf = Buffer.alloc(65536);
  let newlines = 0;
  let total = 0;
  let eof = false;
  try {
    while (newlines <= max && total < MAX_BYTES) {
      const n = fs.readSync(fd, buf, 0, buf.length, null);
      if (!n) { eof = true; break; }
      chunks.push(Buffer.from(buf.subarray(0, n)));
      total += n;
      for (let i = 0; i < n; i++) if (buf[i] === 10) newlines++;
    }
  } finally { fs.closeSync(fd); }
  const all = lines(Buffer.concat(chunks).toString('utf8'));
  return { lines: all.slice(0, max), truncated: !eof || all.slice(max).some((l) => l !== '') };
}

// A whole small file (JSON settings, instruction files), or null when it is larger than MAX_BYTES.
function readSmall(file) {
  if (fs.statSync(file).size > MAX_BYTES) return null;
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

function parseJson(file) {
  try {
    const text = readSmall(file);
    const v = text === null ? null : JSON.parse(text);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch { return null; }
}

// The host of a remote or server URL, never its user info, path or query.
// A value holding a line break, or an `@` anywhere but in scp-like `user@host:path` user info, is
// "not parsed": the text before a colon is a host only in the plain scp-like shape.
const SCHEME_URL = /^[a-z][a-z0-9+.-]*:\/\//i;
export function hostOf(raw) {
  const s = String(raw).trim();
  if (/[\r\n]/.test(s)) return 'not parsed';
  if (SCHEME_URL.test(s)) {
    try {
      const u = new URL(s);
      if (u.protocol === 'file:') return 'local path';
      return HOST.test(u.hostname) ? u.hostname : 'not parsed';
    } catch { return 'not parsed'; }
  }
  const scp = s.match(/^(?:[^@:/\\\s]+@)?([^@:/\\\s]+):(.*)$/);
  if (scp && !/^[a-z]$/i.test(scp[1])) return !scp[2].includes('@') && HOST.test(scp[1]) ? scp[1] : 'not parsed';
  // A local path: no user info, and a colon only after a drive letter.
  if (s.includes('@') || (s.includes(':') && !/^[a-z]:[\\/]/i.test(s))) return 'not parsed';
  return 'local path';
}

// An MCP server's url is a URL with a scheme or nothing: a scheme-less value or a `${VAR}` is "not parsed".
const urlHost = (raw) => (SCHEME_URL.test(String(raw).trim()) ? hostOf(raw) : 'not parsed');

// ---- the walk ----

function walk(root, depth) {
  const files = []; // openable regular files, posix paths relative to root
  const counted = []; // every regular file seen, for the extension counts
  const repos = [];
  const never = new Map(); // kind -> paths
  const note = (kind, r) => { if (!never.has(kind)) never.set(kind, []); never.get(kind).push(r); };
  const visit = (rel, level) => {
    let ents;
    try { ents = fs.readdirSync(path.join(root, rel), { withFileTypes: true }); } catch { return; }
    for (const e of ents.sort((a, b) => byName(a.name, b.name))) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      const lower = e.name.toLowerCase();
      if (e.name === '.git') { repos.push(rel || '.'); continue; }
      // A skill's folder and an agent's file or folder are named for what they do ("secret-scanner"),
      // and only their front matter is ever read, so the never list and data folders do not apply to them.
      const item = (e.isDirectory() && /(?:^|\/)\.claude\/(?:skills|agents(?:\/.*)?)$/.test(rel))
        || (e.isFile() && lower.endsWith('.md') && /(?:^|\/)\.claude\/agents(?:\/.*)?$/.test(rel));
      const hit = item ? undefined : NEVER.find((k) => k.test(lower));
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(lower)) continue;
        if (hit) { note(hit.kind, `${r}/`); continue; }
        if (DATA_DIRS.has(lower) && !item) { note(DATA_FOLDERS, `${r}/`); continue; }
        if (level < depth) visit(r, level + 1);
      } else if (e.isFile()) {
        counted.push(r);
        if (hit) note(hit.kind, r);
        else files.push(r);
      }
    }
  };
  visit('', 0);
  return { files, counted, repos, never };
}

// ---- manifests ----

// A requirement's name, from the start of a line or string: the name must end at a version, extra,
// marker, `@` or the end, so a bare URL or an option is never taken for a name.
function reqName(s) {
  const m = String(s).trim().match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(?=\s|\[|[<>=!~;@]|$)/);
  return m ? m[1] : null;
}

function packageJson(head) {
  const keys = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  try {
    const j = JSON.parse(head.lines.join('\n'));
    return keys.flatMap((k) => (j && typeof j[k] === 'object' && j[k] ? Object.keys(j[k]) : []));
  } catch {
    if (!head.truncated) return null;
  }
  // Longer than 200 lines: the keys inside each dependency block, line by line.
  const out = [];
  let inside = false;
  for (const l of head.lines) {
    if (!inside) { inside = new RegExp(`^\\s*"(?:${keys.join('|')})"\\s*:\\s*\\{\\s*$`).test(l); continue; }
    if (/^\s*\}/.test(l)) { inside = false; continue; }
    const m = l.match(/^\s*"([^"]+)"\s*:/);
    if (m) out.push(m[1]);
  }
  return out;
}

function requirements(head) {
  return head.lines.map((l) => l.replace(/(^|\s)#.*$/, '').trim()).filter((l) => l && !l.startsWith('-')).map(reqName);
}

// A TOML line with its strings and comment removed, so a `]` inside "fastapi[standard]" or after `#` never
// ends an array.
const tomlBare = (s) => s.replace(/"[^"]*"|'[^']*'/g, '""').replace(/#.*$/, '');

function pyproject(head) {
  const out = [];
  let table = '';
  let array = false; // inside a multi-line array of requirement strings
  for (const l of head.lines) {
    const t = l.trim();
    const header = t.match(/^\[\[?\s*([^\]]+?)\s*\]\]?$/);
    if (header && !array) { table = header[1].replace(/["']/g, ''); continue; }
    if (array) {
      for (const m of t.matchAll(/"([^"]*)"|'([^']*)'/g)) out.push(reqName(m[1] ?? m[2]));
      if (tomlBare(t).includes(']')) array = false;
      continue;
    }
    const poetry = table === 'tool.poetry.dependencies' || table === 'tool.poetry.dev-dependencies' || /^tool\.poetry\.group\.[^.]+\.dependencies$/.test(table);
    const key = t.match(/^["']?([A-Za-z0-9][A-Za-z0-9._-]*)["']?\s*=\s*(.*)$/);
    if (!key) continue;
    if (poetry) { if (key[1] !== 'python') out.push(key[1]); continue; }
    const listed = (table === 'project' && key[1] === 'dependencies') || table === 'project.optional-dependencies' || table === 'dependency-groups';
    if (listed && key[2].startsWith('[')) {
      for (const m of key[2].matchAll(/"([^"]*)"|'([^']*)'/g)) out.push(reqName(m[1] ?? m[2]));
      array = !tomlBare(key[2]).includes(']');
    }
  }
  return out;
}

function pipfile(head) {
  const out = [];
  let table = '';
  for (const l of head.lines) {
    const t = l.trim();
    // An array of tables such as [[source]] is a header too, so its keys are never taken for packages.
    const header = t.match(/^\[\[?([^\]]+)\]\]?$/);
    if (header) { table = header[1].trim(); continue; }
    if (table !== 'packages' && table !== 'dev-packages') continue;
    const m = t.match(/^["']?([A-Za-z0-9][A-Za-z0-9._-]*)["']?\s*=/);
    if (m) out.push(m[1]);
  }
  return out;
}

function goMod(head) {
  const out = [];
  let block = false;
  for (const l of head.lines) {
    const t = l.replace(/\/\/.*$/, '').trim();
    if (/^require\s*\($/.test(t)) { block = true; continue; }
    if (block && t === ')') { block = false; continue; }
    const m = block ? t.match(/^(\S+)\s+v\d/) : t.match(/^require\s+(\S+)\s+v\d/);
    if (m) out.push(m[1]);
  }
  return out;
}

function pomXml(head) {
  const out = [];
  let dep = null;
  for (const l of head.lines) {
    if (/<dependency>/.test(l)) dep = {};
    if (dep) {
      const g = l.match(/<groupId>\s*([^<\s]+)\s*<\/groupId>/);
      const a = l.match(/<artifactId>\s*([^<\s]+)\s*<\/artifactId>/);
      if (g) dep.g = g[1];
      if (a) dep.a = a[1];
    }
    if (dep && /<\/dependency>/.test(l)) {
      if (dep.a) out.push(dep.g && !dep.g.includes('$') ? `${dep.g}:${dep.a}` : dep.a);
      dep = null;
    }
  }
  return out;
}

function csproj(head) {
  return head.lines.flatMap((l) => [...l.matchAll(/<PackageReference\b[^>]*?\bInclude\s*=\s*"([^"]+)"/gi)].map((m) => m[1]));
}

// The keys one level under a top-level YAML key, read line by line: names only, never a value.
function yamlChildKeys(ls, parent) {
  const out = [];
  let inside = false;
  let indent = null;
  for (const l of ls) {
    if (!l.trim() || /^\s*#/.test(l)) continue;
    const lead = l.length - l.trimStart().length;
    if (lead === 0) { inside = yamlKey(l) === parent; indent = null; continue; }
    if (!inside) continue;
    if (indent === null) indent = lead;
    if (lead !== indent) continue;
    const k = yamlKey(l.trimStart());
    if (k) out.push(k);
  }
  return out;
}
function yamlKey(l) {
  const m = l.match(/^(["']?)([A-Za-z0-9_.-]+)\1\s*:(?:\s|$)/);
  return m ? m[2] : null;
}

function environmentYml(head) {
  const out = [];
  let inside = false;
  for (const l of head.lines) {
    if (!l.trim() || /^\s*#/.test(l)) continue;
    if (!/^\s/.test(l)) { inside = yamlKey(l) === 'dependencies'; continue; }
    const m = inside && l.match(/^\s*-\s*["']?([^\s"'#]+)/);
    if (!m || m[1].endsWith(':')) continue;
    out.push(reqName(m[1].replace(/^[\w.-]+::/, '')));
  }
  return out;
}

const MANIFESTS = [
  { test: (b) => b === 'package.json', kind: 'dependencies', read: packageJson },
  { test: (b) => b === 'pyproject.toml', kind: 'dependencies', read: pyproject },
  { test: (b) => /^requirements.*\.txt$/.test(b), kind: 'dependencies', read: requirements },
  { test: (b) => b === 'environment.yml' || b === 'environment.yaml', kind: 'dependencies', read: environmentYml },
  { test: (b) => b === 'pipfile', kind: 'dependencies', read: pipfile },
  { test: (b) => b === 'go.mod', kind: 'dependencies', read: goMod },
  { test: (b) => b === 'pom.xml', kind: 'dependencies', read: pomXml },
  { test: (b) => b.endsWith('.csproj'), kind: 'dependencies', read: csproj },
  { test: (b) => b === 'dbt_project.yml' || b === 'dbt_project.yaml', kind: 'dbt project', read: () => [] },
  { test: (b) => /^docker-compose.*\.ya?ml$/.test(b) || /^compose(?:\.override)?\.ya?ml$/.test(b), kind: 'services', read: (h) => yamlChildKeys(h.lines, 'services') },
  { test: (b, r) => /(?:^|\/)\.github\/workflows\/[^/]+\.ya?ml$/.test(r), kind: 'CI jobs', read: (h) => yamlChildKeys(h.lines, 'jobs') },
];

function stack(root, files) {
  const rows = [];
  for (const r of files) {
    const base = path.posix.basename(r).toLowerCase();
    const m = MANIFESTS.find((x) => x.test(base, r));
    if (!m) continue;
    let found;
    try {
      const head = readHead(path.join(root, r));
      const names = m.read(head);
      if (names === null) found = NOT_PARSED;
      else {
        const shown = [...new Set(names.map(name).filter(Boolean))];
        found = m.kind === 'dbt project' ? 'dbt project file' : shown.length ? shown.join(', ') : 'none listed';
        if (head.truncated) found += ` (first ${MAX_LINES} lines)`;
      }
    } catch { found = NOT_PARSED; }
    rows.push(`| ${m.kind} | ${cell(found)} | ${cell(r)} |`);
  }
  return rows;
}

// ---- the Claude setup ----

const dirOf = (r) => { const d = path.posix.dirname(r); return d === '.' ? '' : d; };
// The folder a `.claude/` or `.mcp.json` belongs to, for the scope column.
const where = (folder) => (folder ? ` (${folder})` : '');

// The script file named in a hook command, never the command itself.
function scriptName(cmd) {
  for (const tok of String(cmd).split(/\s+/)) {
    const bare = tok.replace(/["']/g, '');
    if (!/\.(?:mjs|cjs|js|ts|py|sh|bash|ps1|bat|cmd|rb|pl)$/i.test(bare)) continue;
    const base = bare.split(/[\\/]/).pop();
    if (/^[\w.-]+$/.test(base)) return base;
  }
  return '(inline command)';
}

function mcpRows(servers, scope) {
  if (!servers || typeof servers !== 'object' || Array.isArray(servers)) return [];
  return Object.entries(servers).map(([key, s]) => {
    const v = s && typeof s === 'object' ? s : {};
    const type = ['stdio', 'sse', 'http', 'ws'].includes(v.type) ? v.type : v.command ? 'stdio' : v.url ? 'not set' : 'unknown';
    const host = typeof v.url === 'string' ? `, host ${urlHost(v.url)}` : '';
    return `| MCP server | ${cell(name(key) ?? '(name not shown)')} | ${scope} | transport ${type}${host} | | | |`;
  });
}

function settingsFile(root, r, installed) {
  const j = parseJson(path.join(root, r));
  if (!j) return `${r}: ${NOT_PARSED}`;
  const folder = dirOf(dirOf(r));
  const scope = `${/settings\.local\.json$/i.test(r) ? 'local' : 'project'}${where(folder)}`;
  const parts = [];
  const p = j.permissions && typeof j.permissions === 'object' ? j.permissions : {};
  const count = (k) => (Array.isArray(p[k]) ? p[k].length : 0);
  parts.push(`permissions allow ${count('allow')}, deny ${count('deny')}, ask ${count('ask')}`);
  let hooks = 0;
  if (j.hooks && typeof j.hooks === 'object') {
    for (const [event, groups] of Object.entries(j.hooks)) {
      if (!Array.isArray(groups)) continue;
      for (const g of groups) {
        for (const h of Array.isArray(g?.hooks) ? g.hooks : []) {
          const what = h?.type === 'command' ? scriptName(h.command) : `(${name(h?.type) ?? 'unknown'} hook)`;
          installed.push(`| hook | ${cell(name(event) ?? '(event not shown)')}: ${cell(what)} | ${scope} | | | | |`);
          hooks++;
        }
      }
    }
  }
  parts.push(plural(hooks, 'hook'));
  const plugins = j.enabledPlugins && typeof j.enabledPlugins === 'object'
    ? Object.entries(j.enabledPlugins).filter(([, on]) => on === true).map(([k]) => name(k)).filter(Boolean) : [];
  parts.push(plugins.length ? `plugins enabled: ${plugins.join(', ')}` : 'no plugins enabled');
  const mcp = mcpRows(j.mcpServers, scope);
  if (mcp.length) { installed.push(...mcp); parts.push(plural(mcp.length, 'MCP server')); }
  return `${r}: ${parts.join('; ')}`;
}

// The front matter's `name` and `description`, never the body: reading stops at the closing `---`.
function frontMatter(file) {
  const { lines: ls } = readHead(file);
  if (ls[0]?.trim() !== '---') return null;
  const end = ls.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end < 0) return null;
  const fm = ls.slice(1, end);
  const get = (key) => {
    const at = fm.findIndex((l) => new RegExp(`^${key}\\s*:`).test(l));
    if (at < 0) return null;
    const first = fm[at].replace(new RegExp(`^${key}\\s*:\\s*`), '').trim();
    const more = [];
    for (const l of fm.slice(at + 1)) { if (l.trim() && !/^\s/.test(l)) break; more.push(l.trim()); }
    const parts = /^[>|][+-]?\d*$/.test(first) ? more : [first, ...more];
    const v = parts.filter(Boolean).join(' ').trim();
    return v.replace(/^(["'])([\s\S]*)\1$/, '$2');
  };
  return { name: get('name'), description: get('description') };
}

const INSTRUCTIONS = (r) => /^(?:claude|agents)\.md$/i.test(path.posix.basename(r));
const OTHER_AGENTS = (r) => /^\.cursorrules$/i.test(path.posix.basename(r)) || /(?:^|\/)\.github\/copilot-instructions\.md$/i.test(r);

// Present, line count and headings, never the body.
function instructionFile(root, r) {
  try {
    const text = readSmall(path.join(root, r));
    if (text === null) return `${r}: ${NOT_PARSED}`;
    const ls = lines(text);
    if (ls[ls.length - 1] === '') ls.pop();
    const heads = [];
    // Fenced code as CommonMark has it: a fence opens with 3 or more backticks or tildes, indented at most
    // 3 spaces, and closes only with the same character, at least as many of them, and nothing after
    // but spaces. Everything in between is code, never a heading.
    let fence = null; // { char, length } of the open fence
    for (const l of ls) {
      const f = l.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (fence) {
        if (f && f[1][0] === fence.char && f[1].length >= fence.length && !f[2].trim()) fence = null;
        continue;
      }
      if (f && !(f[1][0] === '`' && f[2].includes('`'))) { fence = { char: f[1][0], length: f[1].length }; continue; }
      const h = l.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
      if (h) heads.push(h[1]);
    }
    return `${r}: ${plural(ls.length, 'line')}; headings: ${heads.length ? heads.join('; ') : 'none'}`;
  } catch { return `${r}: ${NOT_PARSED}`; }
}

function claudeSetup(root, files) {
  const installed = [];
  const notes = { instructions: [], settings: [], items: [], mcp: [], others: [] };
  let skills = 0;
  let agents = 0;
  const scope = (folder) => `project${where(folder)}`;
  for (const r of files) {
    let m;
    if (INSTRUCTIONS(r)) notes.instructions.push(instructionFile(root, r));
    else if (OTHER_AGENTS(r)) notes.others.push(instructionFile(root, r));
    else if (/(?:^|\/)\.claude\/settings(?:\.[^/]*)?\.json$/i.test(r)) notes.settings.push(settingsFile(root, r, installed));
    else if (path.posix.basename(r) === '.mcp.json') {
      const j = parseJson(path.join(root, r));
      if (!j) { notes.mcp.push(`${r}: ${NOT_PARSED}`); continue; }
      const rows = mcpRows(j.mcpServers, scope(dirOf(r)));
      installed.push(...rows);
      notes.mcp.push(`${r}: ${plural(rows.length, 'server')}`);
    } else if ((m = r.match(/^(?:(.*)\/)?\.claude\/(skills)\/([^/]+)\/SKILL\.md$/)) || (m = r.match(/^(?:(.*)\/)?\.claude\/(agents)\/(.+)\.md$/))) {
      const kind = m[2] === 'skills' ? 'skill' : 'agent';
      if (kind === 'skill') skills++; else agents++;
      let fm = null;
      try { fm = frontMatter(path.join(root, r)); } catch { /* listed as not parsed */ }
      const label = name(fm?.name) ?? name(path.posix.basename(m[3])) ?? '(name not shown)';
      const desc = fm ? (fm.description ?? '(no description)') : NOT_PARSED;
      installed.push(`| ${kind} | ${cell(label)} | ${scope(m[1] ?? '')} | ${cell(desc)} | | | |`);
    }
  }
  if (skills || agents) notes.items.push(`${plural(skills, 'skill')}, ${plural(agents, 'agent')} (listed under Already installed)`);
  const row = (label, list) => `| ${label} | ${list.length ? 'yes' : 'no'} | ${cell(list.join(' · '))} |`;
  return {
    setup: [
      '| File or folder | Present | Notes |',
      '|---|---|---|',
      row('`CLAUDE.md`, `AGENTS.md`', notes.instructions),
      row('`.claude/settings*.json`', notes.settings),
      row('`.claude/skills/`, `.claude/agents/`', notes.items),
      row('`.mcp.json`', notes.mcp),
      row("Other agents' instructions (`.cursorrules`, `.github/copilot-instructions.md`)", notes.others),
    ],
    installed,
  };
}

// ---- git ----

// Read-only git: no optional locks (status never rewrites the index) and no fsmonitor command. Git runs
// on the repository found, with no GIT_* variable from the caller's environment (GIT_DIR, GIT_CONFIG_PARAMETERS,
// GIT_OBJECT_DIRECTORY and the rest), except the two that select the global config file or turn the system
// one off. Names are matched in any case, as Windows reads them.
const GIT_KEEP = new Set(['GIT_CONFIG_GLOBAL', 'GIT_CONFIG_NOSYSTEM']);
const GIT_ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => {
  const u = k.toUpperCase();
  return !u.startsWith('GIT_') || GIT_KEEP.has(u);
}));
// Output git may print (as the session hooks allow) and how long one git call may run. Exported so the
// tests can shrink them.
export const GIT_LIMITS = { maxBuffer: 64 * 1024 * 1024, timeout: 20_000 };
function gitRun(cwd, args) {
  try {
    return spawnSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args],
      { cwd, env: GIT_ENV, encoding: 'utf8', windowsHide: true, maxBuffer: GIT_LIMITS.maxBuffer, timeout: GIT_LIMITS.timeout });
  } catch (e) { return { error: e, status: null, stdout: '' }; }
}
function git(cwd, args) {
  const r = gitRun(cwd, args);
  return !r.error && r.status === 0 ? r.stdout : null;
}

// Each entry of `git config -z --get-regexp` is the key, a line feed, then the value, ended by NUL; a
// value that still holds a line break is "not parsed". Exit 1 with no output is no remote; a call that
// failed otherwise, or ran past the time limit, is unknown.
function remoteHosts(dir) {
  const r = gitRun(dir, ['config', '-z', '--get-regexp', '^remote\\..*\\.url$']);
  if (r.error || (r.status !== 0 && r.status !== 1)) return ['unknown'];
  if (r.status === 1) return [];
  const out = r.stdout;
  return [...new Set(out.split('\0').filter(Boolean).map((e) => {
    const at = e.indexOf('\n');
    return at < 0 ? 'not parsed' : hostOf(e.slice(at + 1));
  }))];
}

function repository(root, rel) {
  const dir = path.join(root, rel);
  const hosts = remoteHosts(dir);
  const head = git(dir, ['rev-parse', '--abbrev-ref', 'HEAD'])?.trim();
  const branch = head && /^[\w./-]+$/.test(head) ? head : 'unknown';
  // A status too large for the buffer is dirty, as the session hooks count it; a status that failed or ran
  // past the time limit is unknown.
  const status = gitRun(dir, ['status', '--porcelain']);
  let clean;
  if (status.error?.code === 'ENOBUFS') clean = 'no (many changes)';
  else if (status.error || status.status !== 0) clean = 'unknown';
  else {
    const changed = status.stdout.split(/\r?\n/).filter(Boolean).length;
    clean = changed === 0 ? 'yes' : `no (${plural(changed, 'change')})`;
  }
  return `| ${cell(rel)} | ${cell(hosts.join(', ') || 'none')} | ${cell(branch)} | ${clean} |`;
}

// The non-sample hook names in .git/hooks/, or null when .git is a file (a worktree or a submodule).
function gitHooks(root, rel) {
  const dotGit = path.join(root, rel, '.git');
  try {
    if (!fs.lstatSync(dotGit).isDirectory()) return null;
    return fs.readdirSync(path.join(dotGit, 'hooks'), { withFileTypes: true }).filter((e) => e.isFile() && !e.name.endsWith('.sample')).map((e) => e.name).sort(byName);
  } catch { return []; }
}

function hooks(root, files, repos) {
  const by = new Map();
  const add = (folder, part) => { const k = folder || '.'; if (!by.has(k)) by.set(k, []); by.get(k).push(part); };
  for (const rel of repos) {
    const found = gitHooks(root, rel);
    const names = (found ?? []).map(name).filter(Boolean);
    add(rel === '.' ? '' : rel, found === null ? '.git/hooks/: not read (.git is a file: a worktree or submodule)' : `.git/hooks/: ${names.length ? names.join(', ') : 'none'}`);
  }
  const husky = new Map();
  for (const r of files) {
    const h = r.match(/^(?:(.*)\/)?\.husky\/([^/]+)$/);
    if (h) { const k = h[1] ?? ''; if (!husky.has(k)) husky.set(k, []); husky.get(k).push(h[2]); continue; }
    if (path.posix.basename(r) === '.pre-commit-config.yaml') {
      let part;
      try {
        const ids = readHead(path.join(root, r)).lines.map((l) => l.match(/^\s*(?:-\s+)?id\s*:\s*["']?([A-Za-z0-9_.-]+)["']?\s*(?:#.*)?$/)?.[1]).filter(Boolean);
        part = `.pre-commit-config.yaml: ${ids.length ? [...new Set(ids)].join(', ') : 'no hook ids'}`;
      } catch { part = `.pre-commit-config.yaml: ${NOT_PARSED}`; }
      add(dirOf(r), part);
    }
  }
  for (const [k, names] of husky) add(k, `.husky/: ${names.map(name).filter(Boolean).join(', ')}`);
  return [...by.keys()].sort(byName).map((k) => `| ${cell(k)} | ${cell(by.get(k).join(' · '))} |`);
}

// ---- the audit ----

export function audit(folder, { depth = DEFAULT_DEPTH } = {}) {
  const root = path.resolve(folder);
  if (!fs.statSync(root).isDirectory()) throw new Error('not a folder');
  const { files, counted, repos, never } = walk(root, depth);
  const none = (cols) => `| none found${' |'.repeat(cols)}`;

  const stackRows = stack(root, files);
  const exts = new Map();
  for (const r of counted) {
    const e = path.posix.extname(r).toLowerCase() || '(none)';
    exts.set(e, (exts.get(e) ?? 0) + 1);
  }
  const top = [...exts].sort((a, b) => b[1] - a[1] || byName(a[0], b[0])).slice(0, 15);
  const { setup, installed } = claudeSetup(root, files);
  const hookRows = hooks(root, files, repos);
  const unopened = [...never].sort((a, b) => byName(a[0], b[0])).map(([kind, list]) => {
    const shown = list.slice(0, LIST_CAP).join(', ');
    const more = list.length > LIST_CAP ? `, and ${list.length - LIST_CAP} more` : '';
    return `- ${kind}: ${list.length} (${shown}${more})`;
  });

  return {
    sections: {
      'Stack': ['| Kind | Found | Where (manifest or file type) |', '|---|---|---|', ...(stackRows.length ? stackRows : [none(2)])],
      'File types (top 15)': ['| Extension | Count |', '|---|---|', ...(top.length ? top.map(([e, n]) => `| ${cell(e)} | ${n} |`) : [none(1)])],
      'Repositories': ['| Folder | Remote host | Branch | Clean |', '|---|---|---|---|', ...(repos.length ? repos.map((r) => repository(root, r)) : [none(3)])],
      'Existing Claude setup': setup,
      'Already installed': ['| Kind | Name | Scope | What it does (its own description) | Tokens every session | Scanned (yes / no / unknown) | Against the kit |',
        '|---|---|---|---|---|---|---|', ...(installed.length ? installed : [none(6)])],
      'Hooks': ['| Repository | Hook setup (`.husky/`, `.pre-commit-config.yaml`, `.git/hooks/`) |', '|---|---|', ...(hookRows.length ? hookRows : [none(1)])],
      'Present but not opened': unopened.length ? unopened : ['- none found'],
    },
  };
}

export function render({ sections }, depth) {
  const out = ['# Setup audit', '',
    `Read-only: names only, never values. At most ${depth} folders deep; node_modules/, .venv/, venv/ and build folders skipped; at most ${MAX_LINES} lines of each manifest read.`, ''];
  for (const h of HEADINGS) out.push(`## ${h}`, ...sections[h], '');
  return out.join('\n');
}

const USAGE = 'usage: node tools/audit.mjs <folder> [--depth N]';

function main(argv) {
  let folder = null;
  let depth = DEFAULT_DEPTH;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--depth') {
      const v = argv[++i];
      if (v === undefined || !/^\d+$/.test(v)) { console.error(`--depth needs a whole number\n${USAGE}`); return 2; }
      depth = Number(v);
    } else if (a.startsWith('-') || folder !== null) { console.error(USAGE); return 2; } else folder = a;
  }
  if (folder === null) { console.error(USAGE); return 2; }
  try {
    if (!fs.statSync(folder).isDirectory()) throw new Error('not a folder');
  } catch { console.error(`not a folder: ${folder}\n${USAGE}`); return 2; }
  let text;
  // An unexpected error is named, never shown: a parser's message can quote the text it read.
  try { text = render(audit(folder, { depth }), depth); } catch (e) { console.error(`audit failed (${e?.code ?? e?.name ?? 'error'})`); return 1; }
  process.stdout.write(text);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
