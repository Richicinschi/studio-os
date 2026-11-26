// QR code encoder for the business card skill: byte mode, error correction L, M, Q or H, versions 1 to 25.
// Pure functions only: no files, network, child processes or environment.

const MAX_VERSION = 25;

// Error correction levels, in the order the tables below use.
const EC_LEVELS = ['L', 'M', 'Q', 'H'];

// Two-bit error correction indicator written into the format word, by level L, M, Q, H.
const EC_FORMAT_BITS = [1, 0, 3, 2];

// Error correction codewords per block, by level (L, M, Q, H), then version 1 to 25.
const EC_PER_BLOCK = [
  [7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26],
  [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28],
  [13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30],
  [17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30],
];

// Number of error correction blocks, by level (L, M, Q, H), then version 1 to 25.
const BLOCKS = [
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12],
  [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21],
  [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29],
  [1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35],
];

// Row and column coordinates of alignment pattern centres, by version 1 to 25.
const ALIGNMENT = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
  [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78],
  [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110],
];

// Eleven-module runs that look like a finder pattern beside light space, for penalty rule 3.
const FINDER_LIKE = [
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
].map((p) => p.map(Boolean));

// The eight mask conditions; a data module at (row r, column c) is flipped when its condition holds.
const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

export class QRTooLargeError extends Error {
  constructor() {
    super('too large for a card');
    this.name = 'QRTooLargeError';
    this.code = 'TOO_LARGE';
  }
}

// Arithmetic in GF(256) with the reducing polynomial 0x11D: powers of 2 and their logarithms.
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

function gfMultiply(a, b) {
  return a && b ? EXP[LOG[a] + LOG[b]] : 0;
}

// Generator polynomial of degree n, highest power first: the product of (x + 2^i) for i below n.
function rsGenerator(n) {
  let poly = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMultiply(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

// Error correction codewords for one block: the remainder of the data divided by the generator.
function rsRemainder(data, generator) {
  const rem = new Array(generator.length - 1).fill(0);
  for (const byte of data) {
    const factor = byte ^ rem.shift();
    rem.push(0);
    for (let j = 0; j < rem.length; j++) rem[j] ^= gfMultiply(generator[j + 1], factor);
  }
  return rem;
}

// Appends the remainder of value × x^degree divided by poly, as used by the format and version words.
function withBch(value, poly, degree) {
  let rem = value << degree;
  for (let bit = 31 - Math.clz32(rem); bit >= degree; bit--) if ((rem >> bit) & 1) rem ^= poly << (bit - degree);
  return (value << degree) | rem;
}

function formatWord(level, mask) {
  return withBch((EC_FORMAT_BITS[level] << 3) | mask, 0x537, 10) ^ 0x5412;
}

// Finder, separator, alignment and timing patterns, the dark module, reserved format areas and the
// version words, with a map of which modules they fix and the number of codewords left for data.
function template(version) {
  const size = 17 + 4 * version;
  const dark = Array.from({ length: size }, () => new Array(size).fill(false));
  const fixed = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (r, c, on) => {
    dark[r][c] = on;
    fixed[r][c] = true;
  };

  for (const [top, left] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = top + dr;
        const c = left + dc;
        if (r < 0 || c < 0 || r >= size || c >= size) continue;
        const ring = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        set(r, c, ring !== 2 && ring !== 4);
      }
    }
  }

  const centres = ALIGNMENT[version - 1];
  for (const r of centres) {
    for (const c of centres) {
      if (fixed[r][c]) continue; // the three corners taken by finder patterns
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
      }
    }
  }

  for (let i = 8; i < size - 8; i++) {
    if (!fixed[6][i]) set(6, i, i % 2 === 0);
    if (!fixed[i][6]) set(i, 6, i % 2 === 0);
  }

  set(size - 8, 8, true);
  for (let i = 0; i <= 8; i++) {
    if (!fixed[8][i]) set(8, i, false);
    if (!fixed[i][8]) set(i, 8, false);
  }
  for (let i = 0; i < 8; i++) set(8, size - 1 - i, false);
  for (let i = 0; i < 7; i++) set(size - 1 - i, 8, false);

  if (version >= 7) {
    const word = withBch(version, 0x1f25, 12);
    for (let i = 0; i < 18; i++) {
      const on = ((word >> i) & 1) === 1;
      set(Math.floor(i / 3), size - 11 + (i % 3), on);
      set(size - 11 + (i % 3), Math.floor(i / 3), on);
    }
  }

  let free = 0;
  for (const row of fixed) for (const f of row) if (!f) free++;
  return { size, dark, fixed, codewords: Math.floor(free / 8) };
}

// Mode, count, data, terminator and pad codewords, filling exactly `count` data codewords.
function dataCodewords(data, version, count) {
  const bits = [];
  const put = (value, length) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  put(0b0100, 4);
  put(data.length, version < 10 ? 8 : 16);
  for (const byte of data) put(byte, 8);
  put(0, Math.min(4, count * 8 - bits.length));
  while (bits.length % 8) bits.push(0);

  const words = [];
  for (let i = 0; i < bits.length; i += 8) words.push(bits.slice(i, i + 8).reduce((acc, b) => (acc << 1) | b, 0));
  for (let pad = 0xec; words.length < count; pad ^= 0xec ^ 0x11) words.push(pad);
  return words;
}

// Splits the data into blocks, adds each block's error correction, and interleaves the result.
function interleave(data, ecLength, blockCount) {
  const shortLength = Math.floor(data.length / blockCount);
  const longCount = data.length % blockCount;
  const blocks = [];
  for (let b = 0, at = 0; b < blockCount; b++) {
    const length = shortLength + (b >= blockCount - longCount ? 1 : 0);
    blocks.push(data.slice(at, at + length));
    at += length;
  }
  const generator = rsGenerator(ecLength);
  const ecBlocks = blocks.map((block) => rsRemainder(block, generator));

  const out = [];
  for (let i = 0; i <= shortLength; i++) for (const block of blocks) if (i < block.length) out.push(block[i]);
  for (let i = 0; i < ecLength; i++) for (const block of ecBlocks) out.push(block[i]);
  return out;
}

// Places the codeword bits in two-column strips, right to left, alternately upward and downward.
function placeCodewords(tpl, codewords) {
  const { size, fixed } = tpl;
  const modules = tpl.dark.map((row) => row.slice());
  const total = codewords.length * 8;
  let i = 0;
  for (let right = size - 1, upward = true; right >= 1; right -= 2, upward = !upward) {
    if (right === 6) right = 5; // the vertical timing pattern takes column 6
    for (let k = 0; k < size; k++) {
      const r = upward ? size - 1 - k : k;
      for (const c of [right, right - 1]) {
        if (fixed[r][c]) continue;
        modules[r][c] = i < total && ((codewords[i >> 3] >> (7 - (i & 7))) & 1) === 1;
        i++;
      }
    }
  }
  return modules;
}

// Applies one mask to the data modules and writes both copies of the format word.
function applyMask(tpl, placed, level, mask) {
  const { size, fixed } = tpl;
  const modules = placed.map((row, r) => row.map((on, c) => (fixed[r][c] ? on : on !== MASKS[mask](r, c))));
  const word = formatWord(level, mask);
  for (let i = 0; i < 15; i++) {
    const on = ((word >> i) & 1) === 1;
    if (i < 6) modules[i][8] = on;
    else if (i < 8) modules[i + 1][8] = on;
    else if (i === 8) modules[8][7] = on;
    else modules[8][14 - i] = on;
    if (i < 8) modules[8][size - 1 - i] = on;
    else modules[size - 15 + i][8] = on;
  }
  return modules;
}

// The four standard penalty rules: long runs, 2 × 2 blocks, finder-like runs and dark balance.
function penalty(modules) {
  const size = modules.length;
  let score = 0;
  const lines = [];
  for (let i = 0; i < size; i++) lines.push(modules[i], modules.map((row) => row[i]));
  for (const line of lines) {
    let run = 1;
    for (let k = 1; k <= size; k++) {
      if (k < size && line[k] === line[k - 1]) run++;
      else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    for (let k = 0; k + 11 <= size; k++) {
      if (FINDER_LIKE.some((p) => p.every((b, t) => line[k + t] === b))) score += 40;
    }
  }
  let darkCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c]) darkCount++;
      if (r + 1 < size && c + 1 < size) {
        const on = modules[r][c];
        if (modules[r][c + 1] === on && modules[r + 1][c] === on && modules[r + 1][c + 1] === on) score += 3;
      }
    }
  }
  const total = size * size;
  return score + Math.floor(Math.abs(darkCount * 20 - total * 10) / total) * 10;
}

export function encodeQR(data, opts = {}) {
  if (!(data instanceof Uint8Array)) throw new TypeError('data must be a Uint8Array');
  const { ec = 'M', mask, maxVersion = MAX_VERSION } = opts;
  const level = EC_LEVELS.indexOf(ec);
  if (level < 0) throw new RangeError('ec must be L, M, Q or H');
  if (mask !== undefined && !(Number.isInteger(mask) && mask >= 0 && mask <= 7)) throw new RangeError('mask must be 0 to 7');
  if (!Number.isInteger(maxVersion) || maxVersion < 1) throw new RangeError('maxVersion must be 1 or more');

  for (let version = 1; version <= Math.min(maxVersion, MAX_VERSION); version++) {
    const tpl = template(version);
    const ecLength = EC_PER_BLOCK[level][version - 1];
    const blockCount = BLOCKS[level][version - 1];
    const dataCount = tpl.codewords - ecLength * blockCount;
    if (4 + (version < 10 ? 8 : 16) + 8 * data.length > dataCount * 8) continue;

    const placed = placeCodewords(tpl, interleave(dataCodewords(data, version, dataCount), ecLength, blockCount));
    let best = null;
    for (const m of mask === undefined ? [0, 1, 2, 3, 4, 5, 6, 7] : [mask]) {
      const modules = applyMask(tpl, placed, level, m);
      const score = mask === undefined ? penalty(modules) : 0;
      if (!best || score < best.score) best = { mask: m, modules, score };
    }
    return { version, ec, mask: best.mask, size: tpl.size, modules: best.modules };
  }
  throw new QRTooLargeError();
}

export function qrSvg(qr, opts = {}) {
  const { quiet = 4 } = opts;
  if (!Number.isInteger(quiet) || quiet < 0) throw new RangeError('quiet must be a whole number, 0 or more');
  const n = qr.size + 2 * quiet;
  let d = '';
  qr.modules.forEach((row, r) => row.forEach((on, c) => {
    if (on) d += 'M' + (c + quiet) + ' ' + (r + quiet) + 'h1v1h-1z';
  }));
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges">'
    + '<rect width="' + n + '" height="' + n + '" fill="#fff"/><path fill="#000" d="' + d + '"/></svg>';
}
