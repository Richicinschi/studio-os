// tools/export/frontmatter.mjs
// Minimal YAML-subset front matter reader: top-level scalars, folded/literal blocks, lists, and
// nested maps. Enough for SKILL.md files and kit pages, with no dependency.

export function splitFrontmatter(text) {
  const m = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return m ? { raw: m[1].replace(/\r\n/g, '\n'), body: text.slice(m[0].length) } : { raw: null, body: text };
}

const indentOf = (line) => line.length - line.trimStart().length;

// YAML 1.2 double-quoted escapes. \x, \u and \U take 2, 4 and 8 hex digits; any other escape (or a malformed
// one) is kept as written.
const YAML_ESCAPES = {
  0: '\0', a: '\x07', b: '\b', t: '\t', '\t': '\t', n: '\n', v: '\v', f: '\f', r: '\r', e: '\x1b',
  ' ': ' ', '"': '"', '/': '/', '\\': '\\', N: '\u0085', _: '\u00a0', L: '\u2028', P: '\u2029',
};
function yamlDoubleQuoted(s) {
  return s.replace(/\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}|[\s\S])/g, (all, e) => {
    if (e.length > 1) {
      const code = parseInt(e.slice(1), 16);
      return code <= 0x10ffff ? String.fromCodePoint(code) : all;
    }
    return Object.hasOwn(YAML_ESCAPES, e) ? YAML_ESCAPES[e] : all;
  });
}

// A quoted scalar as YAML reads it: double quotes decode their escapes (\" is "); in single quotes '' is one
// quote.
function unquote(s) {
  const t = s.trim();
  if (t.length >= 2 && t[0] === '"' && t.at(-1) === '"') return yamlDoubleQuoted(t.slice(1, -1));
  if (t.length >= 2 && t[0] === "'" && t.at(-1) === "'") return t.slice(1, -1).replace(/''/g, "'");
  return t;
}

function parseList(lines, start) {
  const items = [];
  const listIndent = indentOf(lines[start]);
  let i = start;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    const li = indentOf(l);
    const isItem = l.trimStart().startsWith('- ');
    if (isItem && li === listIndent) { items.push(l.trimStart().slice(2).trim()); i++; continue; }
    if (!isItem && li > listIndent && items.length) { items[items.length - 1] += ` ${l.trim()}`; i++; continue; }
    break;
  }
  return [items.map(unquote), i];
}

function parseBlock(lines, start, indent) {
  const obj = {};
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) { i++; continue; }
    const ind = indentOf(line);
    if (ind < indent) break;
    if (ind > indent) { i++; continue; }
    const m = line.trimStart().match(/^([A-Za-z0-9_.-]+):(?:\s+(.*))?$/);
    if (!m) { i++; continue; }
    const key = m[1];
    const value = (m[2] || '').trim();
    i++;
    if (['>-', '>', '|', '|-'].includes(value)) {
      const parts = [];
      while (i < lines.length && (!lines[i].trim() || indentOf(lines[i]) > indent)) { parts.push(lines[i].trim()); i++; }
      obj[key] = value.startsWith('>') ? parts.filter(Boolean).join(' ') : parts.join('\n').trim();
    } else if (value === '') {
      let j = i;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length && lines[j].trimStart().startsWith('- ')) {
        [obj[key], i] = parseList(lines, j);
      } else if (j < lines.length && indentOf(lines[j]) > indent) {
        [obj[key], i] = parseBlock(lines, j, indentOf(lines[j]));
      } else {
        obj[key] = '';
      }
    } else if (value.startsWith('[') && value.endsWith(']')) {
      obj[key] = value.slice(1, -1).split(',').map(unquote).filter(Boolean);
    } else {
      obj[key] = unquote(value);
    }
  }
  return [obj, i];
}

export function parseFrontmatter(text) {
  const { raw, body } = splitFrontmatter(text);
  if (raw === null) return { data: null, body };
  return { data: parseBlock(raw.split('\n'), 0, 0)[0], body };
}

// A skill whose front matter sets `disable-model-invocation: true` is one Claude cannot start: its
// description stays out of context and the user starts it by name. `data` is parseFrontmatter(text).data.
export const startedByName = (data) => Boolean(data) && data['disable-model-invocation'] === 'true';

// A quoted scalar that closes on its own line: "..." (with \ escapes) or '...' (with '' escapes).
const closedQuote = (s) => (s[0] === '"' ? /^"(?:[^"\\]|\\.)*"/ : /^'(?:[^']|'')*'/).test(s);

// Keys whose plain value (not quoted, not a block scalar, not a [flow list]) holds ": " or " #", or
// ends in ":". Real YAML reads those as a nested mapping or a comment (a ":" at the end of a line is a
// mapping indicator, an error there), so the reader above and a YAML parser disagree. `raw` is
// splitFrontmatter(text).raw. One message per key, nested keys included.
export function plainValueProblems(raw) {
  const problems = [];
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  let blockIndent = -1; // inside a block scalar: skip lines indented deeper than its key
  let openQuote = null; // inside a quoted value that runs over lines: skip to its closing quote
  for (const line of lines) {
    if (openQuote) { if (line.includes(openQuote)) openQuote = null; continue; }
    if (blockIndent >= 0) {
      if (!line.trim() || indentOf(line) > blockIndent) continue;
      blockIndent = -1;
    }
    const content = line.trimStart();
    const item = content.match(/^-\s+(["'].*)$/); // a quoted list item may run over lines too
    const m = content.match(/^([A-Za-z0-9_.-]+):(?:\s+(.*))?$/);
    const value = item ? item[1].trim() : m ? (m[2] || '').trim() : '';
    if (!value) continue;
    if (value[0] === '"' || value[0] === "'") {
      if (!closedQuote(value)) openQuote = value[0];
    } else if (/^[>|][-+]?$/.test(value)) {
      blockIndent = indentOf(line);
    } else if (!value.startsWith('[') && (value.includes(': ') || value.includes(' #') || value.endsWith(':'))) {
      problems.push(`${m[1]}: value is not valid YAML; quote it or use >-`);
    }
  }
  return problems;
}
