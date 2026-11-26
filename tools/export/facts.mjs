// tools/export/facts.mjs
// docs/facts.md, fact by fact. Each fact is a bullet under a `## ` section and carries the date it was last
// checked, written after one of the words in FACT_DATE (the newest such date counts). Facts in a section the
// front matter lists under `fast:` (model names, plans, prices, claude.ai features) go stale after 30 days,
// the rest after 90. The lint refuses a fact with no date and a `fast:` entry that names no section; the
// export lists the stale facts by section.
import { splitFrontmatter, parseFrontmatter } from './frontmatter.mjs';

export const FAST_DAYS = 30;
export const SLOW_DAYS = 90;
// "observed ... on" may run over a version number ("Observed with Claude Code 2.1.329 on 2026-11-20"), not
// over the end of a sentence.
export const FACT_DATE = /\b(?:checked|read|as of|tried|observed\b(?:[^.;]|\.\d)*?\bon)\s+(\d{4}-\d{2}-\d{2})\b/gi;

// The bullets of the page, outside fenced blocks, each with its section, its line, its text and its oldest
// date (null when it carries none): a bullet that holds two dates has a part last checked on the older one.
// A bullet's continuation lines (indented) belong to it.
export function factsOf(text) {
  const { body } = splitFrontmatter(text);
  const offset = text.split('\n').length - body.split('\n').length;
  const facts = [];
  let section = null;
  let fenced = false;
  let current = null;
  body.split(/\r?\n/).forEach((line, i) => {
    if (/^\s*```/.test(line)) { fenced = !fenced; current = null; return; }
    if (fenced) return;
    const heading = line.match(/^## (.+)$/);
    if (heading) { section = heading[1].trim(); current = null; return; }
    if (/^- /.test(line)) { current = { section, line: offset + i + 1, text: line }; facts.push(current); return; }
    if (current && /^\s+\S/.test(line)) current.text += ` ${line.trim()}`;
    else current = null;
  });
  return facts.map(({ section, line, text: t }) => {
    const dates = [...t.matchAll(FACT_DATE)].map((m) => m[1]).sort();
    return { section, line, text: t, dates, date: dates.length ? dates[0] : null };
  });
}

const realDate = (d) => !Number.isNaN(Date.parse(d)) && new Date(Date.parse(d)).toISOString().slice(0, 10) === d;

export function fastSections(text) {
  const fast = parseFrontmatter(text).data?.fast;
  return Array.isArray(fast) ? fast.map(String) : [];
}

// Lint: every fact has a date, each of its dates exists and none is after `today` (a date in the future
// would never come due); a fact that says "not documented" names the pages searched, or links its source;
// every `fast:` entry names a section of the page.
// `today` is a UTC date, and a fact is dated where its writer lives, so a date one day ahead of it passes.
export function lintFacts(rel, text, today = new Date().toISOString().slice(0, 10)) {
  const facts = factsOf(text);
  const sections = new Set(facts.map((f) => f.section));
  const latest = new Date(Date.parse(today) + 86400000).toISOString().slice(0, 10);
  return [
    ...facts.filter((f) => !f.date).map((f) => `${rel}:${f.line} a fact with no date (write "checked YYYY-MM-DD", or "read", "as of", "tried" or "observed ... on" before its date)`),
    ...facts.flatMap((f) => f.dates.filter((d) => !realDate(d) || d > latest).map((d) => `${rel}:${f.line} the date ${d} ${realDate(d) ? 'is after today' : 'does not exist'}`)),
    ...facts.filter((f) => /not documented/i.test(f.text) && !/\bsearched\b|\]\(https?:/i.test(f.text))
      .map((f) => `${rel}:${f.line} says "not documented" but names no page searched (write "searched [<page>](<url>)")`),
    ...fastSections(text).filter((s) => !sections.has(s)).map((s) => `${rel}: front matter fast: "${s}" is not a section of the page`),
  ];
}

// The facts past their window on `today`, one entry per section: its window, how many facts are past it,
// and the oldest of their dates.
export function staleFactSections(text, today) {
  const fast = new Set(fastSections(text));
  const bySection = new Map();
  for (const f of factsOf(text)) {
    if (!f.date) continue;
    const window = fast.has(f.section) ? FAST_DAYS : SLOW_DAYS;
    if ((Date.parse(today) - Date.parse(f.date)) / 86400000 <= window) continue;
    const s = bySection.get(f.section) || { section: f.section, window, count: 0, oldest: f.date };
    s.count++;
    if (f.date < s.oldest) s.oldest = f.date;
    bySection.set(f.section, s);
  }
  return [...bySection.values()];
}
