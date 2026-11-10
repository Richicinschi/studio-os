// tools/export/credits.mjs
// A domain that adapts outside text carries a credit file: ATTRIBUTION.md, or a file whose name starts with
// NOTICE, at any depth. The build reads from its tables which licences cover the adapted text, and says so
// in the domain's SOURCE.md and in docs/THIRD_PARTY_NOTICES.md.

export const isCreditFile = (file) => /^(?:attribution\.md|notice[^/]*)$/i.test(file.split('/').pop());

export const spdxUrl = (id) => `https://spdx.org/licenses/${id}.html`;

const isRow = (line) => /^\s*\|/.test(line || '');
const isRule = (line) => /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line || '');
const cellsOf = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
// An SPDX identifier (MIT, Apache-2.0, BSD-3-Clause); a cell may name several ("MIT / Apache-2.0").
const SPDX_ID = /^[A-Z0-9][A-Za-z0-9.+-]*$/;
const SEPARATORS = /\s*[/,·]\s*|\s+(?:\+|&|and|or)\s+/i;
const NOT_COPIED = /\b(?:not|never)\s+copied\b/i;

// { licences }: the SPDX identifiers of the adapted text, sorted. They come from every table with a
// Licence column, except a table whose header row or nearest heading says its sources were "not copied" or
// "never copied". `rel` names the file in every error, so a failed export says which file to fix.
export function parseCreditFile(text, rel) {
  const lines = text.split(/\r?\n/);
  const licences = new Set();
  let heading = '';
  let tables = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) { heading = lines[i]; continue; }
    if (!isRow(lines[i]) || !isRule(lines[i + 1])) continue;
    const col = cellsOf(lines[i]).findIndex((c) => /^licen[cs]es?$/i.test(c));
    const adapted = col >= 0 && !NOT_COPIED.test(`${heading} ${lines[i]}`);
    if (col >= 0) tables++;
    let j = i + 2;
    for (; j < lines.length && isRow(lines[j]); j++) {
      if (!adapted) continue;
      const row = cellsOf(lines[j]);
      const cell = row[col] || '';
      const ids = cell.split(SEPARATORS).filter(Boolean);
      if (!ids.length || ids.some((id) => !SPDX_ID.test(id))) {
        throw new Error(`${rel}: the row for ${row[0] || '(no source)'} names its licence as "${cell}"; a credit file names the licence of adapted text by its SPDX identifier, such as MIT or Apache-2.0`);
      }
      for (const id of ids) licences.add(id);
    }
    i = j - 1;
  }
  if (!tables) throw new Error(`${rel}: a credit file with no table that has a Licence column, so the build cannot tell which licences cover the domain's adapted text`);
  if (!licences.size) throw new Error(`${rel}: a credit file that names no source of adapted text (every table with a Licence column says "not copied"), so the build cannot write the domain's Origin line`);
  return { licences: [...licences].sort() };
}
