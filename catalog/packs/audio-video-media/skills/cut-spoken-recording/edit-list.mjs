// Proposes cuts for a spoken recording from word timings and returns a keep-list; never touches media.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const DEFAULTS = { pass: 'silence', silenceSeconds: 0.55, padSeconds: 0.15, fillers: ['um', 'uh', 'erm', 'hmm'] };

const norm = (w) => String(w).toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');
const round = (n) => Math.round(n * 1000) / 1000;

export function proposeSilenceCuts(words, s) {
  const cuts = [];
  for (let i = 0; i + 1 < words.length; i++) {
    const gap = words[i + 1].start - words[i].end;
    if (gap >= s.silenceSeconds && gap > 2 * s.padSeconds) {
      cuts.push({ start: words[i].end + s.padSeconds, end: words[i + 1].start - s.padSeconds, reason: `silence of ${round(gap)}s` });
    }
  }
  return cuts;
}

export function proposeFillerCuts(words, s) {
  const list = new Set(s.fillers.map(norm));
  return words.filter((w) => list.has(norm(w.word))).map((w) => ({ start: w.start, end: w.end, reason: `filler "${norm(w.word)}"` }));
}

export function proposeRepeatCuts(words) {
  const cuts = [];
  for (let i = 1; i < words.length; i++) {
    if (norm(words[i].word) && norm(words[i].word) === norm(words[i - 1].word)) {
      cuts.push({ start: words[i - 1].start, end: words[i].start, reason: `repeated "${norm(words[i].word)}"` });
    }
  }
  return cuts;
}

export function proposeFalseStartCuts(words) {
  return words.filter((w) => /[-–]$/.test(String(w.word).trim())).map((w) => ({ start: w.start, end: w.end, reason: `broken-off word "${w.word}"` }));
}

const PASSES = { silence: proposeSilenceCuts, filler: proposeFillerCuts, repeat: proposeRepeatCuts, falsestart: proposeFalseStartCuts };

export function mergeCuts(cuts) {
  const sorted = cuts.filter((c) => c.end > c.start).map((c) => ({ ...c })).sort((a, b) => a.start - b.start);
  const out = [];
  for (const c of sorted) {
    const last = out[out.length - 1];
    if (last && c.start <= last.end) { last.end = Math.max(last.end, c.end); last.reason += '; ' + c.reason; } else out.push(c);
  }
  return out.map((c) => ({ ...c, start: round(c.start), end: round(c.end) }));
}

export function keepRangesFromCuts(cuts, duration) {
  const keep = [];
  let at = 0;
  for (const c of cuts) { if (c.start > at) keep.push([round(at), c.start]); at = c.end; }
  if (duration > at) keep.push([round(at), round(duration)]);
  return keep;
}

export function retimeWords(words, cuts) {
  const shift = (t) => t - cuts.reduce((sum, c) => sum + Math.max(0, Math.min(t, c.end) - c.start), 0);
  return words
    .filter((w) => !cuts.some((c) => w.start >= c.start && w.end <= c.end))
    .map((w) => ({ word: w.word, start: round(shift(w.start)), end: round(shift(w.end)) }));
}

export function buildEditList(words, settings = {}) {
  const s = { ...DEFAULTS, ...settings };
  const detect = PASSES[s.pass];
  if (!detect) throw new Error(`unknown pass "${s.pass}"; use one of ${Object.keys(PASSES).join(', ')}`);
  const duration = s.duration ?? (words.length ? words[words.length - 1].end : 0);
  const cuts = mergeCuts(detect(words, s));
  return { pass: s.pass, settings: s, duration, cuts, keep: keepRangesFromCuts(cuts, duration), retimedWords: retimeWords(words, cuts) };
}

function main(argv) {
  const [file, ...rest] = argv;
  if (!file) {
    console.error('usage: node edit-list.mjs words.json [--pass silence|filler|repeat|falsestart] [--silence 0.55] [--pad 0.15] [--expect-hash sha256] [--out new-file.json]');
    process.exit(2);
  }
  const raw = readFileSync(file);
  const hash = createHash('sha256').update(raw).digest('hex');
  const flag = (n) => { const i = rest.indexOf(n); return i >= 0 ? rest[i + 1] : undefined; };
  if (flag('--expect-hash') && flag('--expect-hash') !== hash) {
    console.error('input changed since it was read; re-read it before editing');
    process.exit(3);
  }
  const data = JSON.parse(raw);
  const settings = { ...(Array.isArray(data) ? {} : data.settings) };
  if (flag('--pass')) settings.pass = flag('--pass');
  if (flag('--silence')) settings.silenceSeconds = Number(flag('--silence'));
  if (flag('--pad')) settings.padSeconds = Number(flag('--pad'));
  const result = { inputSha256: hash, ...buildEditList(Array.isArray(data) ? data : data.words, settings) };
  const text = JSON.stringify(result, null, 2);
  const out = flag('--out');
  if (out) {
    if (existsSync(out)) { console.error('refusing to overwrite ' + out + '; choose the next number'); process.exit(4); }
    writeFileSync(out, text);
  }
  console.log(text);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
