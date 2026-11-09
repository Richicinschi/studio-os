// Audits one logo SVG for production problems; exit 1 when any error is found.
// Usage: node svg-audit.mjs file.svg [--bg #ffffff] [--max-colors 4]
import { readFileSync } from 'node:fs';

const NAMED = { black: '#000000', white: '#ffffff', red: '#ff0000', blue: '#0000ff', green: '#008000', gray: '#808080', grey: '#808080', yellow: '#ffff00', orange: '#ffa500' };
const NUM = /-?\d*\.?\d+(?:e-?\d+)?/gi;

function parseArgs(argv) {
  const opts = { file: null, bg: null, maxColors: 4 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--bg') opts.bg = argv[++i];
    else if (argv[i] === '--max-colors') opts.maxColors = Number(argv[++i]);
    else opts.file = argv[i];
  }
  return opts;
}

function normaliseColour(value) {
  const v = String(value).trim().toLowerCase();
  if (NAMED[v]) return NAMED[v];
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v);
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return '#' + h;
}

function relativeLuminance(hex) {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function contrastRatio(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function collectColours(svg) {
  const found = new Set();
  const re = /(?:fill|stroke|stop-color)\s*[:=]\s*["']?\s*(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)/g;
  for (const m of svg.matchAll(re)) {
    const c = normaliseColour(m[1]);
    if (c) found.add(c);
  }
  return found;
}

function pairsToSegments(numbers) {
  const segs = [];
  for (let i = 0; i + 3 < numbers.length; i += 2) segs.push([numbers[i], numbers[i + 1], numbers[i + 2], numbers[i + 3]]);
  return segs;
}

function segmentsFromSvg(svg) {
  const segs = [];
  for (const m of svg.matchAll(/<line\b[^>]*>/g)) {
    const g = (n) => Number((new RegExp(`\\b${n}\\s*=\\s*["']([^"']+)`).exec(m[0]) || [])[1]);
    segs.push([g('x1'), g('y1'), g('x2'), g('y2')]);
  }
  for (const m of svg.matchAll(/<(?:polyline|polygon)\b[^>]*\bpoints\s*=\s*["']([^"']+)/g)) {
    segs.push(...pairsToSegments(m[1].match(NUM).map(Number)));
  }
  for (const m of svg.matchAll(/<path\b[^>]*\bd\s*=\s*["']([^"']+)/g)) {
    if (/[^MLZ\s\d.,eE+-]/.test(m[1])) continue; // only absolute M, L, Z paths are read
    segs.push(...pairsToSegments(m[1].match(NUM).map(Number)));
  }
  return segs.filter((s) => s.every(Number.isFinite));
}

function findNearMissAngles(svg) {
  const hits = [];
  for (const [x1, y1, x2, y2] of segmentsFromSvg(svg)) {
    if (Math.hypot(x2 - x1, y2 - y1) < 4) continue;
    const deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const off = ((deg % 90) + 90) % 90;
    const dist = Math.min(off, 90 - off);
    if (dist > 0.2 && dist <= 3) hits.push(`(${x1},${y1}) to (${x2},${y2}) is ${dist.toFixed(2)} degrees off axis`);
  }
  return hits;
}

function findWhiteKnockouts(svg) {
  const shapes = [...svg.matchAll(/<(?:rect|circle|ellipse|path|polygon|polyline|line)\b[^>]*>/g)].map((m) => m[0]);
  return shapes.filter((s, i) => {
    if (i === 0 || !/^<(?:rect|circle|ellipse)/.test(s)) return false;
    const fill = /\bfill\s*[:=]\s*["']?\s*(#[0-9a-fA-F]{3,6}|white)/.exec(s);
    return fill && normaliseColour(fill[1]) === '#ffffff';
  }).map((s) => s.slice(0, 80));
}

function checkContrast(colours, bgText, errors) {
  const bg = normaliseColour(bgText);
  if (!bg) { errors.push(`cannot read background colour ${bgText}; use #rrggbb`); return; }
  for (const c of colours) {
    const r = contrastRatio(c, bg);
    if (r < 3) errors.push(`${c} on ${bg} has contrast ${r.toFixed(2)} (needs 3 or more)`);
  }
}

function audit(svg, opts) {
  const errors = [], notes = [];
  if (/<(?:text|tspan)\b/i.test(svg)) errors.push('live text element found: convert letters to outlines');
  if (/<image\b/i.test(svg) || /data:image\//i.test(svg)) errors.push('embedded raster image found: a logo must be pure vector');
  if (/<filter\b|\bfilter\s*[:=]|feGaussianBlur|<foreignObject\b/i.test(svg)) errors.push('filter, blur or foreignObject found: breaks on many renderers and in print');
  const colours = collectColours(svg);
  if (colours.size > opts.maxColors) errors.push(`${colours.size} distinct colours (limit ${opts.maxColors}): ${[...colours].join(' ')}`);
  for (const h of findNearMissAngles(svg)) errors.push(`near-miss angle: ${h}`);
  for (const w of findWhiteKnockouts(svg)) errors.push(`white shape drawn over the mark fakes a knockout: ${w}`);
  if (opts.bg) checkContrast(colours, opts.bg, errors);
  else notes.push('no --bg given: contrast not checked');
  notes.push(`${colours.size} colour(s) found: ${[...colours].join(' ') || 'none declared'}`);
  return { errors, notes };
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.file) { console.error('usage: node svg-audit.mjs file.svg [--bg #ffffff] [--max-colors 4]'); process.exit(2); }
const { errors, notes } = audit(readFileSync(opts.file, 'utf8'), opts);
for (const n of notes) console.log('note: ' + n);
for (const e of errors) console.log('ERROR: ' + e);
console.log(errors.length ? `FAIL: ${errors.length} problem(s)` : 'PASS');
process.exit(errors.length ? 1 : 0);
