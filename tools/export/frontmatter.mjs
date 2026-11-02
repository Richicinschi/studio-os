// tools/export/frontmatter.mjs
// Minimal YAML-subset front matter reader: top-level scalars, folded/literal blocks, lists, and
// nested maps. Enough for SKILL.md files and kit pages, with no dependency.

export function splitFrontmatter(text) {
  const m = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return m ? { raw: m[1].replace(/\r\n/g, '\n'), body: text.slice(m[0].length) } : { raw: null, body: text };
}

const indentOf = (line) => line.length - line.trimStart().length;

function unquote(s) {
  const t = s.trim();
  if (t.length >= 2 && ((t[0] === '"' && t.at(-1) === '"') || (t[0] === "'" && t.at(-1) === "'"))) return t.slice(1, -1);
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
