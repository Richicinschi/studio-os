// Merges a list of hex colours into groups of near-identical colours by perceptual distance and prints the groups.
import { readFileSync } from 'node:fs';

function parseHex(text) {
  let h = text.trim().replace(/^#/, '').toLowerCase();
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function srgbToLab([r, g, b]) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const x = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
  const y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function labDistance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function readEntries(path) {
  const entries = [];
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [hexText, countText] = line.trim().split(/[\s,]+/);
    const rgb = parseHex(hexText);
    if (!rgb) {
      console.error(`skipped unreadable line: ${line}`);
      continue;
    }
    entries.push({
      hex: '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join(''),
      count: Number(countText) || 1,
      lab: srgbToLab(rgb),
    });
  }
  return entries;
}

function groupByDistance(entries, threshold) {
  const sorted = [...entries].sort((a, b) => b.count - a.count);
  const groups = [];
  for (const e of sorted) {
    const home = groups.find((g) => labDistance(g.lab, e.lab) <= threshold);
    if (home) {
      home.members.push(e);
      home.total += e.count;
    } else {
      groups.push({ hex: e.hex, lab: e.lab, total: e.count, members: [e] });
    }
  }
  return groups.sort((a, b) => b.total - a.total);
}

const [file, thresholdText = '15'] = process.argv.slice(2);
if (!file) {
  console.error('usage: node merge-colors.mjs <file-of-hex-lines> [distance, default 15]');
  process.exit(2);
}
const groups = groupByDistance(readEntries(file), Number(thresholdText));
for (const g of groups) {
  console.log(`${g.hex}  total=${g.total}  merged=[${g.members.map((m) => m.hex).join(' ')}]`);
}
