// Measures a business card's SVG sides and its PDF page size, so size, bleed, safe zone, type and QR are checked, not trusted.
// Usage: node card-check.mjs <side.svg>... [--size 85x55|us] [--bleed 3] [--safe 4] [--pdf card.pdf]
// Exit codes: 0 every check passed, 1 a check failed, 2 a usage or file error, or a side that is not
// well-formed XML (`not well-formed: <what> at line <n>`), which Chrome would print as a blank page.
// Offline: reads only the files named on the command line and writes nothing.
// --pdf: every page must be trim + 2 x bleed (within 0.5 mm), and the PDF must hold one page per side given,
// or 2 when no side is given.
//
// The convention a card side must follow. Anything outside it is an error, never a silent pass.
// - Well-formed XML: tags balanced; no attribute twice on one element; no raw "<" in an attribute value;
//   every "&" written &amp; &lt; &gt; &quot; &apos; &#digits; or &#xhex; (so a name like "Ruiz & Sons" is
//   written "Ruiz &amp; Sons"); every prefix (xlink: and any other) declared with xmlns:<prefix>, xml: being
//   built in; only characters XML allows; nothing but comments and whitespace outside the root; no "--"
//   inside a comment and no "-" just before its "-->".
// - Root: <svg xmlns="http://www.w3.org/2000/svg" width="<W>mm" height="<H>mm" viewBox="0 0 W H">, W x H
//   being the trim plus bleed on every side. No other default namespace (xmlns) inside it.
//   1 user unit is 1 mm. All positions and sizes are plain numbers in those units. The file may start with an
//   <?xml ...?> declaration; no other processing instruction is allowed. A DOCTYPE may not hold its own
//   definitions ([...]), and the only named entities are &amp; &lt; &gt; &quot; &apos; (numeric &#...; are fine).
// - Elements allowed: g, rect, circle, ellipse, line, polyline, polygon, path, text, tspan, image (with width
//   and height), title, desc, the QR's <svg id="qr">, and <defs> holding only linearGradient and
//   radialGradient with their stop elements.
// - Not allowed: CSS of any kind (no <style> element, no style attribute, no <?xml-stylesheet?>; use
//   attributes), transform, clip-path, mask, filter, visibility, display, xml:space, letter-spacing,
//   word-spacing, dominant-baseline, alignment-baseline, baseline-shift, direction, writing-mode, font-stretch,
//   textLength and lengthAdjust; dx, dy and rotate on text; x, y, dx, dy, rotate and font-size on tspan;
//   a nested <svg> other than the QR.
// - Text: <text x y font-size> with a unitless font-size, set on the text or on a parent <g>; optional
//   text-anchor (exactly start, middle or end) and font-weight. Its box is estimated per character, as a share
//   of the font size: 0.85 for the signs (C), (R) and TM (U+00A9, U+00AE, U+2122); 1.4 for any other
//   pictograph (Unicode Extended_Pictographic: emoji, stars, squares, clocks);
//   1.3 for anything else in U+1F000-1FAFF and U+2600-27BF; 1.0 for CJK, kana, Hangul
//   and full-width characters (U+1100-11FF, U+2E80-9FFF, U+AC00-D7AF, U+F900-FAFF, U+FF00-FFEF,
//   U+20000-3FFFF); 0.85 for a capital in any script and for m, w, @ and %; 0.65 for every other character.
//   Times 1.1 when bold (bold, bolder or 600 and up) on the text or a parent <g>, or on any of its <tspan>s,
//   which then makes the whole line count as bold. It runs from font-size above the baseline to
//   0.25 x font-size below it, and must sit inside the safe area.
//   Font sizes at least 2.47 (7 pt); the largest text at least 3.53 (10 pt).
// - Images: embedded as a data: URI in href or xlink:href. A linked file prints as nothing, so it is refused,
//   and so is a data: URI with no comma, such as the placeholder data:logo before embed-logo.mjs fills it.
// - Lines: stroke-width at least 0.088 (0.25 pt); a filled rect (fill not none or transparent) at least 0.088
//   on both sides.
// - QR: an inline <svg id="qr" x y width height viewBox="0 0 N N">, N being the module count with the quiet
//   zone. At least 15 wide, square, inside the safe area, modules (width / N) at least 0.4. Its first <rect>
//   is the light field over the whole viewBox (x 0, y 0, width N, height N, relative luminance 0.8 or more)
//   and its <path> has its own dark fill (0.2 or less). No opacity, fill-opacity or stroke-opacity other than
//   1 on the QR, its children or a group round it. Its children are not otherwise checked. Nothing painted
//   after it, and no text anywhere, may overlap it. An <image id="qr"> is refused.
// - Backgrounds: a rect, path, polygon, circle, ellipse or filled polyline (fill not none or transparent)
//   that reaches a trim edge (within 0.5) runs on to the bleed edge on that side, measured by its box. A path is boxed from every coordinate in its d, control points included; an arc by its end points and the
//   ellipse's extremes within the angle it sweeps.
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const MM_PER_PT = 25.4 / 72;
const MIN_FONT = 2.47; // 7 pt
const MIN_LARGEST_FONT = 3.53; // 10 pt
const MIN_STROKE = 0.088; // 0.25 pt
const MIN_QR = 15;
const MIN_MODULE = 0.4;
// The copyright, registered and trade mark signs are pictographs to Unicode but print like a capital
// (about 0.74 em), so they count 0.85 and are tested before the pictograph rule.
const MARK_CHAR = /[\u{A9}\u{AE}\u{2122}]/u;
// Every pictograph, wherever Unicode puts it (stars, squares, clocks and the emoji blocks alike).
const PICTOGRAPH_CHAR = /\p{Extended_Pictographic}/u;
const PICTOGRAPH_WIDTH = 1.4; // share of the font size
// Emoji and pictographs; miscellaneous symbols and dingbats: whatever in these blocks is not a pictograph.
const EMOJI_CHAR = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const EMOJI_WIDTH = 1.3;
// Hangul Jamo; CJK, kana and the rest; Hangul syllables; CJK compatibility; full-width forms; astral CJK.
const FULL_WIDTH_CHAR = /[\u{1100}-\u{11FF}\u{2E80}-\u{9FFF}\u{AC00}-\u{D7AF}\u{F900}-\u{FAFF}\u{FF00}-\u{FFEF}\u{20000}-\u{3FFFF}]/u;
const FULL_WIDTH = 1.0;
const WIDE_CHAR = /[\p{Lu}mw@%]/u; // capitals in any script
const WIDE_WIDTH = 0.85;
const NARROW_WIDTH = 0.65;
const OPACITY_ATTRS = ['opacity', 'fill-opacity', 'stroke-opacity'];
// An opacity of exactly 1 changes nothing; any other value, or one that is not a plain number, fades.
const hasOpacity = (el) => OPACITY_ATTRS.some((a) => el.attrs[a] !== undefined && !(NUMBER.test(el.attrs[a]) && Number(el.attrs[a]) === 1));
const ANCHORS = new Set(['start', 'middle', 'end']);
const NO_FILL = new Set(['none', 'transparent']);
const BOLD_FACTOR = 1.1;
const DESCENT = 0.25; // share of the font size below the baseline
const LIGHT = 0.8;
const DARK = 0.2;
const SIZE_TOLERANCE = 0.01;
const TRIM_REACH = 0.5; // a shape this close to the trim edge counts as reaching it
const PDF_TOLERANCE = 0.5;
const EPS = 1e-6;
const US_SIZE = [88.9, 50.8];
const DATA_URI = /^\s*data:/i; // the scheme is case-insensitive; the browser trims spaces round a URL

const ALLOWED = new Set(['g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path', 'text', 'tspan', 'image', 'title', 'desc', 'defs', 'svg']);
const GRADIENTS = new Set(['linearGradient', 'radialGradient']);
const REFUSED_ATTRS = ['clip-path', 'mask', 'filter', 'letter-spacing', 'word-spacing', 'dominant-baseline', 'alignment-baseline',
  'baseline-shift', 'direction', 'writing-mode', 'font-stretch', 'textLength', 'lengthAdjust', 'xml:space'];
// Refused anywhere in the file, the inside of the QR included: they hide what the checker measured.
const HIDING_ATTRS = ['visibility', 'display'];

const NUMBER = /^\s*[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\s*$/i;
const MM = /^\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*mm\s*$/;

class ParseError extends Error {}

const ENTITIES = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|amp|quot|apos);/gi, (whole, name) => {
    if (name[0] !== '#') return ENTITIES[name.toLowerCase()] ?? whole;
    const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : whole;
  });
}

// A small scanner over <name attr="..."> tags, </name> end tags and the text between them, which also
// checks the file is well-formed XML with an SVG root: Chrome prints a file that is not as a blank page,
// which every later check would pass. Each such fault throws `not well-formed: <what> at line <n>`.
// Comments are dropped. Returns the root <svg> element, with the names of any processing instructions
// other than a leading <?xml ...?> declaration in its `instructions`, whether a DOCTYPE held its own
// definitions in `doctypeDefinitions`, and every named entity other than the five XML ones in `entities`.
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const XML_CHARS = /[^\t\n\r\u{20}-\u{D7FF}\u{E000}-\u{FFFD}\u{10000}-\u{10FFFF}]/u;
const legalCodePoint = (c) => c === 0x9 || c === 0xa || c === 0xd || (c >= 0x20 && c <= 0xd7ff)
  || (c >= 0xe000 && c <= 0xfffd) || (c >= 0x10000 && c <= 0x10ffff);
function parseSvg(src) {
  const doc = { tag: '#document', attrs: {}, children: [] };
  const stack = [doc];
  const instructions = [];
  // A browser expands entities declared in a DOCTYPE into markup the checker would never see, so both the
  // definitions and any entity other than the five XML ones are kept for the checker to refuse.
  let doctypeDefinitions = false;
  let doctypeSeen = false;
  const entities = [];
  const lineAt = (pos) => src.slice(0, pos).split('\n').length;
  const fail = (msg, pos) => { throw new ParseError('not well-formed: ' + msg + ' at line ' + lineAt(pos)); };
  const skipTo = (from, close, what) => {
    const end = src.indexOf(close, from);
    if (end < 0) fail('unclosed ' + what, from);
    return end + close.length;
  };
  const NAME = /[A-Za-z_:][-\w.:]*/y;
  const ATTR = /\s+([A-Za-z_:][-\w.:]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/y;
  const CLOSE = /\s*(\/?)>/y;
  const END = /\s*>/y;
  // Every "&" begins one of the five XML entities, a numeric reference, or a named entity that step 2
  // refuses by name. A bare "&", "&#;", "&#xZZ;" or a name with letters outside ASCII is not well-formed.
  const REF = /&(?:(#[0-9]+|#x[0-9a-fA-F]+)|([A-Za-z_:][-\w.:]*));/y;
  const checkRefs = (raw, base, el) => {
    for (let k = raw.indexOf('&'); k >= 0; k = raw.indexOf('&', k + 1)) {
      REF.lastIndex = k;
      const m = REF.exec(raw);
      if (!m) fail('"&" must begin &amp;, &lt;, &gt;, &quot;, &apos;, &#digits; or &#xhex;', base + k);
      if (m[1]) {
        const code = m[1][1] === 'x' ? parseInt(m[1].slice(2), 16) : parseInt(m[1].slice(1), 10);
        if (!legalCodePoint(code)) fail('&' + m[1] + '; is not a character XML allows', base + k);
      } else if (!Object.hasOwn(ENTITIES, m[2])) {
        entities.push({ name: m[2], el });
      }
    }
  };
  const hasRoot = () => doc.children.some((c) => c.tag);

  const bad = XML_CHARS.exec(src);
  if (bad) fail('character U+' + bad[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0') + ' is not allowed in XML', bad.index);

  let i = 0;
  while (i < src.length) {
    const lt = src.indexOf('<', i);
    const stop = lt < 0 ? src.length : lt;
    if (stop > i) {
      const raw = src.slice(i, stop);
      if (stack.length === 1) {
        if (raw.trim()) fail('text outside the root element', i + raw.search(/\S/));
      } else {
        const cdataEnd = raw.indexOf(']]>');
        if (cdataEnd >= 0) fail('"]]>" in text', i + cdataEnd);
        checkRefs(raw, i, stack.at(-1));
        stack.at(-1).children.push({ text: decode(raw) });
      }
    }
    if (lt < 0) break;
    if (src.startsWith('<!--', lt)) {
      i = skipTo(lt + 4, '-->', 'comment');
      // XML allows no "--" inside a comment and no "-" just before its "-->", so "--->" is out too.
      const body = src.slice(lt + 4, i - 3);
      if (body.includes('--') || body.endsWith('-')) fail('comment contains --', lt);
      continue;
    }
    if (src.startsWith('<![CDATA[', lt)) {
      if (stack.length === 1) fail('CDATA outside the root element', lt);
      i = skipTo(lt, ']]>', 'CDATA section');
      stack.at(-1).children.push({ text: src.slice(lt + 9, i - 3) });
      continue;
    }
    if (src.startsWith('<?', lt)) {
      // Only a leading <?xml ...?> declaration is harmless; any other instruction is kept for the checker to refuse.
      NAME.lastIndex = lt + 2;
      const name = NAME.exec(src)?.[0] ?? '';
      const declaration = name === 'xml' && /^﻿?$/.test(src.slice(0, lt));
      i = skipTo(lt, '?>', 'processing instruction');
      if (!declaration) instructions.push(name);
      continue;
    }
    if (src.startsWith('<!DOCTYPE', lt)) {
      if (doctypeSeen) fail('a second DOCTYPE', lt);
      if (hasRoot()) fail('DOCTYPE after the root element', lt);
      doctypeSeen = true;
      // Quoted strings are skipped whole, so a quoted ">" cannot end the DOCTYPE early and hide a "[".
      let k = lt + 9;
      let quote = null;
      let inside = false;
      let closed = false;
      while (k < src.length) {
        const ch = src[k];
        if (quote) { if (ch === quote) quote = null; k++; continue; }
        if (ch === '"' || ch === "'") { quote = ch; k++; continue; }
        if (inside) {
          if (src.startsWith('<!--', k)) { k = skipTo(k + 4, '-->', 'comment'); continue; }
          if (ch === ']') inside = false;
          k++;
          continue;
        }
        if (ch === '[') { inside = true; doctypeDefinitions = true; k++; continue; }
        k++;
        if (ch === '>') { closed = true; break; }
      }
      if (!closed) fail('unclosed DOCTYPE', lt);
      i = k;
      continue;
    }
    if (src.startsWith('<!', lt)) fail('markup declaration outside a DOCTYPE', lt);
    if (src[lt + 1] === '/') {
      NAME.lastIndex = lt + 2;
      const name = NAME.exec(src)?.[0];
      END.lastIndex = NAME.lastIndex;
      if (!name || !END.exec(src)) fail('malformed end tag', lt);
      const open = stack.at(-1);
      if (open.tag !== name) fail(open === doc ? '</' + name + '> closes nothing' : '</' + name + '> does not close <' + open.tag + '>', lt);
      stack.pop();
      i = END.lastIndex;
      continue;
    }
    NAME.lastIndex = lt + 1;
    const tag = NAME.exec(src)?.[0];
    if (!tag) fail('stray "<"', lt);
    if (stack.length === 1 && hasRoot()) fail('more than one root element', lt);
    const attrs = {};
    const raws = [];
    let p = NAME.lastIndex;
    let selfClosing;
    for (;;) {
      CLOSE.lastIndex = p;
      const c = CLOSE.exec(src);
      if (c) { p = CLOSE.lastIndex; selfClosing = c[1] === '/'; break; }
      ATTR.lastIndex = p;
      const a = ATTR.exec(src);
      if (!a) fail('malformed <' + tag + '> tag', lt);
      const [, name, dq, sq] = a;
      const raw = dq ?? sq;
      if (Object.hasOwn(attrs, name)) fail('attribute ' + name + ' appears twice', p);
      if (raw.includes('<')) fail('"<" in the value of attribute ' + name, p);
      attrs[name] = decode(raw);
      raws.push([raw, a.index + a[0].length - raw.length - 1]);
      p = ATTR.lastIndex;
    }
    const el = { tag, attrs, children: [] };
    for (const [raw, at] of raws) checkRefs(raw, at, el);

    // Namespaces: every prefix in a name is declared with xmlns:<prefix> here or on an ancestor; xml: is built in.
    el.prefixes = new Set();
    for (const [name, value] of Object.entries(attrs)) {
      if (!name.startsWith('xmlns:')) continue;
      if (value === '') fail(name + ' may not be empty', lt);
      el.prefixes.add(name.slice(6));
    }
    for (const name of [tag, ...Object.keys(attrs)]) {
      if (!name.includes(':')) continue;
      const parts = name.split(':');
      if (parts.length !== 2 || !parts[0] || !parts[1]) fail(name + ' is not a valid name', lt);
      const prefix = parts[0];
      if (prefix === 'xml' || (prefix === 'xmlns' && name !== tag)) continue;
      if (![el, ...stack].some((e) => e.prefixes?.has(prefix))) fail('prefix "' + prefix + '" in ' + name + ' is not declared', lt);
    }

    if (stack.length === 1) {
      if (tag !== 'svg') fail('the root element must be <svg>', lt);
      if (attrs.xmlns !== SVG_NAMESPACE) fail('the root <svg> needs xmlns="' + SVG_NAMESPACE + '"', lt);
    }
    stack.at(-1).children.push(el);
    if (!selfClosing) stack.push(el);
    i = p;
  }
  if (stack.length > 1) fail('<' + stack.at(-1).tag + '> is never closed', src.length);
  const root = doc.children.find((c) => c.tag);
  if (!root) fail('no root element', 0);
  root.instructions = instructions;
  root.doctypeDefinitions = doctypeDefinitions;
  root.entities = entities;
  return root;
}

const collapse = (s) => s.replace(/\s+/g, ' ').trim();
const textOf = (el) => el.children.map((c) => (c.tag ? textOf(c) : c.text)).join('');
const fmt = (n) => String(Math.round(n * 100) / 100);
const elements = (el) => el.children.filter((c) => c.tag);

// Every element under el, el included, in document order. Iterative, so depth cannot overflow it.
function* descendants(el) {
  const stack = [el];
  while (stack.length) {
    const next = stack.pop();
    yield next;
    stack.push(...elements(next).reverse());
  }
}

// An element is named by its tag and its id, or by the first 30 characters of its text.
function describe(el) {
  if (el.attrs.id !== undefined) return '<' + el.tag + ' id="' + el.attrs.id + '">';
  if (el.tag === 'text' || el.tag === 'tspan') {
    const t = collapse(textOf(el));
    if (t) return '<' + el.tag + '> "' + [...t].slice(0, 30).join('') + '"';
  }
  return '<' + el.tag + '>';
}

const isBold = (w) => w === 'bold' || w === 'bolder' || (NUMBER.test(w) && Number(w) >= 600);

// Relative luminance of a fill: #rgb, #rrggbb, rgb(r, g, b), white or black. Anything else is null.
function luminance(color) {
  const c = color.trim().toLowerCase();
  let rgb;
  if (c === 'white') rgb = [255, 255, 255];
  else if (c === 'black') rgb = [0, 0, 0];
  else if (/^#[0-9a-f]{3}$/.test(c)) rgb = [...c.slice(1)].map((h) => parseInt(h + h, 16));
  else if (/^#[0-9a-f]{6}$/.test(c)) rgb = [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  else {
    const m = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(c);
    if (!m) return null;
    rgb = m.slice(1).map(Number);
  }
  const [r, g, b] = rgb.map((v) => {
    const s = Math.min(v, 255) / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// An arc's bound: its start and end points, plus each extreme of its ellipse in x and in y that falls inside
// the angle the arc sweeps. Centre and angles follow the SVG endpoint-to-centre conversion, with the radii
// scaled up when they are too small to reach. The box is exact for the arc, never smaller.
function addArc(add, x1, y1, rxIn, ryIn, angle, large, sweep, x2, y2) {
  add(x1, y1);
  add(x2, y2);
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (rx === 0 || ry === 0 || (x1 === x2 && y1 === y2)) return; // a straight line, or nothing drawn
  const phi = (angle * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const xp = cos * dx + sin * dy;
  const yp = -sin * dx + cos * dy;
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
  if (lambda > 1) { rx *= Math.sqrt(lambda); ry *= Math.sqrt(lambda); }
  const num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp;
  const den = rx * rx * yp * yp + ry * ry * xp * xp;
  const k = (large !== sweep ? 1 : -1) * Math.sqrt(Math.max(0, num / den));
  const cxp = (k * rx * yp) / ry;
  const cyp = (-k * ry * xp) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;

  const TAU = 2 * Math.PI;
  const between = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const start = between(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
  let sweepAngle = between((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
  if (!sweep && sweepAngle > 0) sweepAngle -= TAU;
  else if (sweep && sweepAngle < 0) sweepAngle += TAU;
  const swept = (t) => (((sweep ? t - start : start - t) % TAU) + TAU) % TAU <= Math.abs(sweepAngle) + 1e-9;
  const point = (t) => [
    cx + rx * cos * Math.cos(t) - ry * sin * Math.sin(t),
    cy + rx * sin * Math.cos(t) + ry * cos * Math.sin(t),
  ];
  // Where the ellipse turns in x and in y (at 0, 90, 180 and 270 degrees when it is not rotated).
  const tx = Math.atan2(-ry * sin, rx * cos);
  const ty = Math.atan2(ry * cos, rx * sin);
  for (const t of [tx, tx + Math.PI, ty, ty + Math.PI]) if (swept(t)) add(...point(t));
}

// The box of a path from every coordinate in d: end points, control points (reflected ones for S and T
// included) and arc bounds. A Bezier curve stays inside its control points, so the box can only be too big.
// Returns null when d cannot be read, and a box with infinite sides when d draws nothing.
const PATH_PARAMS = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
function pathBox(d) {
  const SEP = /[\s,]*/y;
  const NUM = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
  let i = 0;
  const skip = () => { SEP.lastIndex = i; SEP.exec(d); i = SEP.lastIndex; };
  const number = () => {
    skip();
    NUM.lastIndex = i;
    const m = NUM.exec(d);
    if (!m) return null;
    i = NUM.lastIndex;
    return Number(m[0]);
  };
  const flag = () => {
    skip();
    if (d[i] !== '0' && d[i] !== '1') return null;
    return d[i++] === '1';
  };
  const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const add = (x, y) => {
    box.x0 = Math.min(box.x0, x); box.y0 = Math.min(box.y0, y);
    box.x1 = Math.max(box.x1, x); box.y1 = Math.max(box.y1, y);
  };
  let x = 0, y = 0, sx = 0, sy = 0, cmd = null, lastC = null, lastQ = null;
  for (;;) {
    skip();
    if (i >= d.length) break;
    if (/[MmLlHhVvCcSsQqTtAaZz]/.test(d[i])) cmd = d[i++];
    else if (cmd === null || cmd === 'z' || cmd === 'Z') return null;
    const lower = cmd.toLowerCase();
    const rel = cmd === lower;
    if (lower === 'z') { x = sx; y = sy; lastC = lastQ = null; continue; }
    const p = [];
    for (let k = 0; k < PATH_PARAMS[lower]; k++) {
      const v = lower === 'a' && (k === 3 || k === 4) ? flag() : number();
      if (v === null) return null;
      p.push(v);
    }
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    let c = null, q = null;
    switch (lower) {
      case 'm': x = ox + p[0]; y = oy + p[1]; sx = x; sy = y; cmd = rel ? 'l' : 'L'; break;
      case 'l': x = ox + p[0]; y = oy + p[1]; break;
      case 'h': x = ox + p[0]; break;
      case 'v': y = oy + p[0]; break;
      case 'c':
        add(ox + p[0], oy + p[1]);
        c = [ox + p[2], oy + p[3]];
        add(...c);
        x = ox + p[4]; y = oy + p[5];
        break;
      case 's':
        if (lastC) add(2 * x - lastC[0], 2 * y - lastC[1]);
        c = [ox + p[0], oy + p[1]];
        add(...c);
        x = ox + p[2]; y = oy + p[3];
        break;
      case 'q':
        q = [ox + p[0], oy + p[1]];
        add(...q);
        x = ox + p[2]; y = oy + p[3];
        break;
      case 't':
        q = lastQ ? [2 * x - lastQ[0], 2 * y - lastQ[1]] : [x, y];
        add(...q);
        x = ox + p[0]; y = oy + p[1];
        break;
      case 'a': {
        const [x1, y1] = [x, y];
        x = ox + p[5]; y = oy + p[6];
        addArc(add, x1, y1, p[0], p[1], p[2], p[3], p[4], x, y);
        break;
      }
    }
    lastC = c;
    lastQ = q;
    add(x, y);
  }
  return box;
}

const overlaps = (a, b) => a.x0 < b.x1 - EPS && b.x0 < a.x1 - EPS && a.y0 < b.y1 - EPS && b.y0 < a.y1 - EPS;
const finite = (b) => [b.x0, b.y0, b.x1, b.y1].every(Number.isFinite);

export function checkCard(svg, opts) {
  const [trimW, trimH] = opts.trim;
  const bleed = opts.bleed ?? 3;
  const safe = opts.safe ?? 4;
  const W = trimW + 2 * bleed;
  const H = trimH + 2 * bleed;
  const inner = bleed + safe;
  const safeArea = { x0: inner, y0: inner, x1: W - inner, y1: H - inner };
  const inside = (b) => b.x0 >= safeArea.x0 - EPS && b.y0 >= safeArea.y0 - EPS && b.x1 <= safeArea.x1 + EPS && b.y1 <= safeArea.y1 + EPS;

  const root = parseSvg(svg);
  // One list per check, joined in the check order at the end.
  const size = [], refused = [], safeZone = [], type = [], lines = [], qrErrors = [], background = [];
  const oks = [];

  const num = (el, name) => {
    const v = el.attrs[name];
    if (v === undefined) return 0;
    if (NUMBER.test(v)) return Number(v);
    refused.push(name + ' "' + v + '" is not a plain number at ' + describe(el));
    return NaN;
  };
  const xywh = (el) => {
    const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((a) => num(el, a));
    return { x0: x, y0: y, x1: x + w, y1: y + h, w, h };
  };

  // 1. Size and viewBox.
  const rootName = describe(root);
  const mw = MM.exec(root.attrs.width ?? '');
  const mh = MM.exec(root.attrs.height ?? '');
  if (!mw || !mh) {
    size.push('size is not given in mm (width "' + (root.attrs.width ?? '') + '", height "' + (root.attrs.height ?? '') + '") at ' + rootName);
  } else if (Math.abs(Number(mw[1]) - W) > SIZE_TOLERANCE || Math.abs(Number(mh[1]) - H) > SIZE_TOLERANCE) {
    size.push('size is ' + fmt(Number(mw[1])) + ' x ' + fmt(Number(mh[1])) + ' mm, expected ' + fmt(W) + ' x ' + fmt(H) + ' mm at ' + rootName);
  }
  if (root.attrs.viewBox === undefined) {
    refused.push('no viewBox at ' + rootName);
  } else {
    const vb = root.attrs.viewBox.trim().split(/[\s,]+/);
    const ok = vb.length === 4 && vb.every((v) => NUMBER.test(v))
      && Number(vb[0]) === 0 && Number(vb[1]) === 0
      && Math.abs(Number(vb[2]) - W) <= SIZE_TOLERANCE && Math.abs(Number(vb[3]) - H) <= SIZE_TOLERANCE;
    if (!ok) size.push('viewBox is "' + root.attrs.viewBox + '", expected "0 0 ' + fmt(W) + ' ' + fmt(H) + '" at ' + rootName);
  }

  // 2. CSS anywhere in the file, the QR and <defs> included: a style sheet applies to the whole card.
  // So does one linked by <?xml-stylesheet?>. visibility and display can hide anything, the QR included.
  if (root.doctypeDefinitions) refused.push('DOCTYPE with its own definitions is not allowed at <!DOCTYPE>');
  for (const { name, el } of root.entities) refused.push('entity &' + name + '; is not allowed at ' + describe(el));
  for (const name of root.instructions) {
    refused.push(name === 'xml-stylesheet'
      ? 'CSS is not allowed (use attributes) at <?xml-stylesheet?>'
      : 'processing instruction not allowed at <?' + name + '?>');
  }
  for (const el of descendants(root)) {
    if (el.tag === 'style' || el.attrs.style !== undefined) refused.push('CSS is not allowed (use attributes) at ' + describe(el));
    for (const a of HIDING_ATTRS) if (el.attrs[a] !== undefined) refused.push(a + ' not supported at ' + describe(el));
    // Elements in another default namespace are not SVG, and a browser draws none of them.
    if (el !== root && el.attrs.xmlns !== undefined && el.attrs.xmlns !== SVG_NAMESPACE) {
      refused.push('xmlns other than the SVG namespace at ' + describe(el));
    }
  }

  // Walk the tree once, in paint order, collecting what the later checks measure.
  const texts = [], fontSizes = [], strokes = [], hairlines = [], shapes = [], edgeShapes = [], qrs = [];
  let order = 0;
  const checkDefs = (defs) => {
    for (const child of elements(defs)) {
      if (child.tag === 'style') continue;
      if (!GRADIENTS.has(child.tag)) { refused.push('element not allowed at ' + describe(child)); continue; }
      for (const stop of elements(child)) {
        if (stop.tag !== 'stop' && stop.tag !== 'style') refused.push('element not allowed at ' + describe(stop));
      }
    }
  };
  const walk = (el, inherited, isRoot) => {
    if (el.tag === 'style') return; // refused above
    const where = describe(el);
    if (!isRoot && !ALLOWED.has(el.tag)) { refused.push('element not allowed at ' + where); return; }
    const index = order++;
    if (el.attrs.transform !== undefined) refused.push('transform not supported at ' + where);
    for (const a of REFUSED_ATTRS) if (el.attrs[a] !== undefined) refused.push(a + ' not supported at ' + where);
    if (el.tag === 'defs') { checkDefs(el); return; }
    if (el.tag === 'title' || el.tag === 'desc') return;

    const ownAnchor = el.attrs['text-anchor'];
    if (ownAnchor !== undefined && !ANCHORS.has(ownAnchor)) refused.push('text-anchor "' + ownAnchor + '" not supported at ' + where);
    const anchor = ownAnchor ?? inherited.anchor;
    const bold = el.attrs['font-weight'] !== undefined ? isBold(el.attrs['font-weight'].trim()) : inherited.bold;
    const fill = el.attrs.fill ?? inherited.fill;
    let fontSize = inherited.fontSize;
    const fs = el.attrs['font-size'];
    if (fs !== undefined) {
      if (NUMBER.test(fs)) {
        fontSize = Number(fs);
        fontSizes.push({ size: fontSize, el });
      } else {
        refused.push('font-size with a unit ("' + fs + '") at ' + where);
        fontSize = NaN;
      }
    }
    if (el.attrs['stroke-width'] !== undefined) strokes.push({ value: el.attrs['stroke-width'], el });

    if (el.tag === 'svg' && !isRoot) {
      if (el.attrs.id === 'qr') qrs.push({ el, index, faded: inherited.faded });
      else refused.push('nested svg other than the QR at ' + where);
      return; // its children live in another coordinate system
    }
    if (el.tag === 'image' && el.attrs.id === 'qr') {
      refused.push('QR as an image cannot be checked; inline the QR SVG as <svg id="qr"> at ' + where);
    }
    // Without both, an image is drawn at its own size, which the checker cannot know.
    if (el.tag === 'image' && (el.attrs.width === undefined || el.attrs.height === undefined)) {
      refused.push('image without width and height at ' + where);
    }
    // A side printed through card.html is itself shown as an image, and Chrome loads nothing outside it:
    // a linked file prints as nothing. Only an image carried inside the side, as a data: URI, is drawn.
    if (el.tag === 'image') {
      const link = el.attrs.href ?? el.attrs['xlink:href'] ?? '';
      if (!DATA_URI.test(link)) refused.push('image must be embedded as a data: URI at ' + where);
      // A data: URI with no comma carries no data: the placeholder href="data:logo" that embed-logo.mjs fills.
      else if (!link.includes(',')) refused.push('logo placeholder not filled (run embed-logo.mjs) at ' + where);
    }

    if (el.tag === 'text' || el.tag === 'tspan') {
      const unmeasured = el.tag === 'text' ? ['dx', 'dy', 'rotate'] : ['x', 'y', 'dx', 'dy', 'rotate', 'font-size'];
      for (const a of unmeasured) if (el.attrs[a] !== undefined) refused.push(a + ' on <' + el.tag + '> not supported at ' + where);
      if (el.tag === 'text') texts.push({ el, fontSize, anchor, bold, index });
    }

    if (el.tag === 'rect' || (el.tag === 'image' && el.attrs.width !== undefined && el.attrs.height !== undefined)) {
      const b = xywh(el);
      shapes.push({ ...b, el, index });
      if (el.tag === 'rect') {
        edgeShapes.push({ ...b, el });
        if (!NO_FILL.has(fill.trim()) && b.w > 0 && b.h > 0 && (b.w < MIN_STROKE || b.h < MIN_STROKE)) hairlines.push({ ...b, el });
      }
    } else if (el.tag === 'circle' || el.tag === 'ellipse') {
      const [cx, cy] = [num(el, 'cx'), num(el, 'cy')];
      const [rx, ry] = el.tag === 'circle' ? [num(el, 'r'), num(el, 'r')] : [num(el, 'rx'), num(el, 'ry')];
      const b = { x0: cx - rx, y0: cy - ry, x1: cx + rx, y1: cy + ry };
      shapes.push({ ...b, el, index });
      edgeShapes.push({ ...b, el });
    } else if (el.tag === 'line') {
      const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((a) => num(el, a));
      shapes.push({ x0: Math.min(x1, x2), y0: Math.min(y1, y2), x1: Math.max(x1, x2), y1: Math.max(y1, y2), el, index });
    } else if (el.tag === 'polygon' || el.tag === 'polyline') {
      const raw = (el.attrs.points ?? '').trim();
      const parts = raw ? raw.split(/[\s,]+/) : [];
      if (parts.length < 2 || parts.length % 2 || !parts.every((v) => NUMBER.test(v))) {
        refused.push('points that cannot be read at ' + where);
      } else {
        const n = parts.map(Number);
        const xs = n.filter((_, k) => k % 2 === 0);
        const ys = n.filter((_, k) => k % 2 === 1);
        const b = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
        shapes.push({ ...b, el, index });
        // A polygon is always closed and filled; a polyline with fill none or transparent is only a line.
        if (el.tag === 'polygon' || !NO_FILL.has(fill.trim())) edgeShapes.push({ ...b, el });
      }
    } else if (el.tag === 'path') {
      const b = pathBox(el.attrs.d ?? '');
      if (!b) refused.push('path data that cannot be read at ' + where);
      else if (finite(b)) {
        shapes.push({ ...b, el, index });
        edgeShapes.push({ ...b, el });
      }
    }

    const faded = inherited.faded || hasOpacity(el);
    for (const child of elements(el)) walk(child, { fontSize, anchor, bold, fill, faded }, false);
  };
  walk(root, { fontSize: undefined, anchor: 'start', bold: false, fill: '#000', faded: false }, true);

  // 3. Every text box inside the safe area.
  for (const t of texts) {
    t.where = describe(t.el);
    if (t.fontSize === undefined) { refused.push('text without a font-size at ' + t.where); continue; }
    const x = num(t.el, 'x');
    const y = num(t.el, 'y');
    if (!Number.isFinite(t.fontSize) || !Number.isFinite(x) || !Number.isFinite(y)) continue;
    let units = 0;
    for (const ch of collapse(textOf(t.el))) {
      units += MARK_CHAR.test(ch) ? WIDE_WIDTH
        : PICTOGRAPH_CHAR.test(ch) ? PICTOGRAPH_WIDTH
        : EMOJI_CHAR.test(ch) ? EMOJI_WIDTH
        : FULL_WIDTH_CHAR.test(ch) ? FULL_WIDTH
          : WIDE_CHAR.test(ch) ? WIDE_WIDTH
            : NARROW_WIDTH;
    }
    // One bold <tspan> makes the whole line count as bold: simpler than weighing each part, and never smaller.
    const boldPart = [...descendants(t.el)].some((e) => e.tag === 'tspan' && e.attrs['font-weight'] !== undefined && isBold(e.attrs['font-weight'].trim()));
    const width = units * t.fontSize * (t.bold || boldPart ? BOLD_FACTOR : 1);
    const x0 = t.anchor === 'middle' ? x - width / 2 : t.anchor === 'end' ? x - width : x;
    t.box = { x0, x1: x0 + width, y0: y - t.fontSize, y1: y + DESCENT * t.fontSize };
    if (!inside(t.box)) safeZone.push('text outside the safe zone at ' + t.where);
  }
  const measured = texts.filter((t) => t.box);
  if (measured.length && !safeZone.length) oks.push('text inside the safe zone (' + measured.length + ' lines)');

  // 4. Type sizes.
  for (const f of fontSizes) {
    if (f.size < MIN_FONT) type.push('text smaller than 7 pt (font-size ' + fmt(f.size) + ') at ' + describe(f.el));
  }
  if (measured.length) {
    const largest = measured.reduce((a, b) => (b.fontSize > a.fontSize ? b : a));
    if (largest.fontSize < MIN_LARGEST_FONT) {
      type.push('no text of 10 pt or more (largest font-size ' + fmt(largest.fontSize) + ') at ' + largest.where);
    } else if (!type.length) {
      const smallest = Math.min(...fontSizes.map((f) => f.size));
      oks.push('type from ' + fmt(smallest) + ' to ' + fmt(largest.fontSize) + ' mm (' + fmt(smallest / MM_PER_PT) + ' to ' + fmt(largest.fontSize / MM_PER_PT) + ' pt)');
    }
  }

  // 5. Line weights. A stroke-width of 0 draws nothing, so it is not a thin line. A filled rect is a line too.
  const widths = [];
  for (const s of strokes) {
    if (!NUMBER.test(s.value)) { refused.push('stroke-width with a unit ("' + s.value + '") at ' + describe(s.el)); continue; }
    const w = Number(s.value);
    if (w === 0) continue;
    widths.push(w);
    if (w < MIN_STROKE) lines.push('line thinner than 0.25 pt (stroke-width ' + fmt(w) + ') at ' + describe(s.el));
  }
  for (const r of hairlines) lines.push('line thinner than 0.25 pt (rect ' + fmt(r.w) + ' x ' + fmt(r.h) + ' mm) at ' + describe(r.el));
  if (widths.length && !lines.length) oks.push('thinnest line ' + fmt(Math.min(...widths)) + ' mm');

  // 6. The QR: wide enough, square, fine enough modules, dark on light, inside the safe area, and nothing on it.
  // Text anywhere counts; another shape counts only when it is painted after the QR, on top of it.
  for (const q of qrs) {
    const where = describe(q.el);
    const b = xywh(q.el);
    if (![b.x0, b.y0, b.w, b.h].every(Number.isFinite)) continue;
    const before = qrErrors.length;
    if (b.w < MIN_QR) qrErrors.push('QR narrower than 15 mm (' + fmt(b.w) + ' mm) at ' + where);
    if (Math.abs(b.w - b.h) > SIZE_TOLERANCE) qrErrors.push('QR not square (' + fmt(b.w) + ' x ' + fmt(b.h) + ' mm) at ' + where);
    const vb = (q.el.attrs.viewBox ?? '').trim().split(/[\s,]+/);
    if (vb.length !== 4 || !vb.every((v) => NUMBER.test(v)) || Number(vb[0]) !== 0 || Number(vb[1]) !== 0
      || !(Number(vb[2]) > 0) || Number(vb[2]) !== Number(vb[3])) {
      qrErrors.push('QR viewBox must be "0 0 N N" at ' + where);
    } else {
      const module = b.w / Number(vb[2]);
      if (module < MIN_MODULE - EPS) qrErrors.push('QR modules smaller than 0.4 mm (' + fmt(module) + ' mm) at ' + where);
    }
    // Dark on light: the first rect is a light field over the whole viewBox, the path is dark, and no opacity
    // on the QR, its children or a group round it fades either.
    const n = Number(vb[2]);
    const inQr = [...descendants(q.el)];
    const field = inQr.find((e) => e.tag === 'rect');
    const ink = inQr.find((e) => e.tag === 'path');
    const light = field && luminance(field.attrs.fill ?? '#000');
    // The modules need their own fill: an inherited one could be anything, a light group round the QR included.
    const dark = ink && ink.attrs.fill !== undefined ? luminance(ink.attrs.fill) : null;
    const exactly = (el, a, want) => {
      const v = el.attrs[a] ?? (want === 0 ? '0' : undefined);
      return v !== undefined && NUMBER.test(v) && Math.abs(Number(v) - want) <= EPS;
    };
    const covers = field && exactly(field, 'x', 0) && exactly(field, 'y', 0) && exactly(field, 'width', n) && exactly(field, 'height', n);
    const faded = q.faded || inQr.some(hasOpacity);
    if (light == null || dark == null || light < LIGHT || dark > DARK || !covers || faded) {
      qrErrors.push('QR must be dark on light at ' + where);
    }
    if (!inside(b)) qrErrors.push('QR outside the safe zone at ' + where);
    for (const t of measured) if (overlaps(b, t.box)) qrErrors.push('QR overlapped by ' + t.where);
    for (const s of shapes) {
      if (s.index > q.index && s.el !== q.el && finite(s) && overlaps(b, s)) qrErrors.push('QR overlapped by ' + describe(s.el));
    }
    if (qrErrors.length === before) oks.push('QR ' + fmt(b.w) + ' mm square, modules ' + fmt(b.w / Number(vb[2])) + ' mm, dark on light, inside the safe zone, nothing on it');
  }

  // 7. A rect, path, polygon, circle, ellipse or filled polyline that reaches a trim edge runs on to the bleed edge.
  const trimEdges = [
    ['left', (r) => r.x0 <= bleed + TRIM_REACH, (r) => r.x0 <= SIZE_TOLERANCE],
    ['right', (r) => r.x1 >= W - bleed - TRIM_REACH, (r) => r.x1 >= W - SIZE_TOLERANCE],
    ['top', (r) => r.y0 <= bleed + TRIM_REACH, (r) => r.y0 <= SIZE_TOLERANCE],
    ['bottom', (r) => r.y1 >= H - bleed - TRIM_REACH, (r) => r.y1 >= H - SIZE_TOLERANCE],
  ];
  let reaching = 0;
  for (const r of edgeShapes) {
    if (!finite(r)) continue;
    let reaches = false;
    for (const [side, atTrim, atBleed] of trimEdges) {
      if (!atTrim(r)) continue;
      reaches = true;
      if (!atBleed(r)) background.push('background stops at the trim on the ' + side + ' edge at ' + describe(r.el));
    }
    if (reaches) reaching++;
  }
  if (reaching && !background.length) oks.push('backgrounds run into the bleed (' + reaching + ' reaching the trim)');

  if (!size.length) oks.unshift('size ' + fmt(W) + ' x ' + fmt(H) + ' mm');
  return { errors: [...size, ...refused, ...safeZone, ...type, ...lines, ...qrErrors, ...background], oks };
}

// The size of every /Type /Page object, from points to mm, rounded to 0.1 mm, in /Kids order when the page
// tree can be followed and in file order otherwise. A page without its own /MediaBox takes its /Pages
// parent's. When any page's size cannot be read, the result is empty.
export function pdfPageSizes(pdf) {
  const text = pdf.toString('latin1');
  const n = '([-+]?(?:\\d+\\.?\\d*|\\.\\d+))';
  const BOX = new RegExp('/MediaBox\\s*\\[\\s*' + n + '\\s+' + n + '\\s+' + n + '\\s+' + n + '\\s*\\]');
  const markers = [...text.matchAll(/(\d+)\s+\d+\s+obj\b/g)];
  const objects = new Map();
  markers.forEach((m, k) => {
    let body = text.slice(m.index + m[0].length, k + 1 < markers.length ? markers[k + 1].index : text.length);
    body = body.split(/endobj/)[0].split(/\bstream[\r\n]/)[0];
    const type = /\/Type\s*\/(Pages?)(?![\w])/.exec(body)?.[1];
    if (!type) return;
    const box = BOX.exec(body);
    objects.set(m[1], {
      id: m[1],
      type,
      box: box && box.slice(1).map(Number),
      parent: /\/Parent\s+(\d+)\s+\d+\s+R/.exec(body)?.[1],
      kids: [...(/\/Kids\s*\[([^\]]*)\]/.exec(body)?.[1] ?? '').matchAll(/(\d+)\s+\d+\s+R/g)].map((r) => r[1]),
    });
  });
  const pages = [...objects.values()].filter((o) => o.type === 'Page');

  // Follow the page tree from each root /Pages node; fall back to file order if it does not reach every page.
  const ordered = [];
  const seen = new Set();
  const visit = (id) => {
    const o = objects.get(id);
    if (!o || seen.has(id)) return;
    seen.add(id);
    if (o.type === 'Page') ordered.push(o);
    else o.kids.forEach(visit);
  };
  for (const o of objects.values()) if (o.type === 'Pages' && !o.parent) visit(o.id);
  const list = ordered.length === pages.length ? ordered : pages;

  const mm = (pt) => Math.round(pt * MM_PER_PT * 10) / 10;
  const sizes = [];
  for (const page of list) {
    let o = page;
    for (let hops = 0; o && !o.box && hops < 64; hops++) o = objects.get(o.parent);
    if (!o?.box) return [];
    const [x0, y0, x1, y1] = o.box;
    sizes.push([mm(Math.abs(x1 - x0)), mm(Math.abs(y1 - y0))]);
  }
  return sizes;
}

const USAGE = 'usage: node card-check.mjs <side.svg>... [--size 85x55|us] [--bleed 3] [--safe 4] [--pdf card.pdf]\n'
  + '--pdf: the PDF must hold one page per side given, or 2 when no side is given, each trim + 2 x bleed';

class UsageError extends Error {}

function parse(argv) {
  let values, positionals;
  try {
    ({ values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: { size: { type: 'string' }, bleed: { type: 'string' }, safe: { type: 'string' }, pdf: { type: 'string' } },
    }));
  } catch (err) {
    throw new UsageError(err.message);
  }
  if (!positionals.length && values.pdf === undefined) throw new UsageError('give at least one side .svg or --pdf');
  let trim = [85, 55];
  if (values.size !== undefined) {
    const m = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/i.exec(values.size);
    if (values.size.toLowerCase() === 'us') trim = US_SIZE;
    else if (m && Number(m[1]) > 0 && Number(m[2]) > 0) trim = [Number(m[1]), Number(m[2])];
    else throw new UsageError('--size must be WxH in mm, such as 85x55, or us');
  }
  const mmOption = (name, fallback) => {
    const v = values[name];
    if (v === undefined) return fallback;
    if (!/^\d+(?:\.\d+)?$/.test(v)) throw new UsageError('--' + name + ' must be a number of mm, 0 or more');
    return Number(v);
  };
  return { files: positionals, trim, bleed: mmOption('bleed', 3), safe: mmOption('safe', 4), pdf: values.pdf };
}

const oneLine = (err) => String(err?.message ?? err).split('\n')[0];

export function main(argv) {
  let args;
  try {
    args = parse(argv);
  } catch (err) {
    process.stderr.write(err.message + '\n' + USAGE + '\n');
    return 2;
  }
  const out = [];
  let code = 0;
  const fileError = (msg) => { process.stderr.write(msg + '\n'); code = 2; };

  for (const file of args.files) {
    let svg;
    try {
      svg = readFileSync(file, 'utf8');
    } catch (err) {
      fileError('cannot read ' + file + ': ' + (err.code ?? err.message));
      continue;
    }
    let result;
    try {
      result = checkCard(svg.replace(/^﻿/, ''), { trim: args.trim, bleed: args.bleed, safe: args.safe });
    } catch (err) {
      fileError(err instanceof ParseError ? file + ': ' + err.message : 'cannot check ' + file + ': ' + oneLine(err));
      continue;
    }
    if (!result.errors.length) out.push(file + ': ok');
    for (const e of result.errors) out.push(file + ': error: ' + e);
    if (result.errors.length && code === 0) code = 1;
  }

  if (args.pdf !== undefined) {
    let pages = null;
    try {
      pages = pdfPageSizes(readFileSync(args.pdf));
    } catch (err) {
      fileError('cannot read ' + args.pdf + ': ' + (err.code ?? oneLine(err)));
    }
    if (pages && !pages.length) fileError(args.pdf + ': cannot read the page size');
    const W = args.trim[0] + 2 * args.bleed;
    const H = args.trim[1] + 2 * args.bleed;
    const failed = () => { if (code === 0) code = 1; };
    (pages ?? []).forEach(([w, h], k) => {
      out.push(args.pdf + ': page ' + (k + 1) + ' ' + w + ' x ' + h + ' mm');
      if (Math.abs(w - W) > PDF_TOLERANCE || Math.abs(h - H) > PDF_TOLERANCE) {
        out.push(args.pdf + ': error: page ' + (k + 1) + ' is ' + w + ' x ' + h + ' mm, expected ' + fmt(W) + ' x ' + fmt(H) + ' mm');
        failed();
      }
    });
    // One page per side given, or front and back when no sides are given.
    const expected = args.files.length || 2;
    if (pages?.length && pages.length !== expected) {
      out.push(args.pdf + ': error: PDF has ' + pages.length + ' pages, expected ' + expected);
      failed();
    }
  }

  if (out.length) process.stdout.write(out.join('\n') + '\n');
  return code;
}

const realPath = (p) => { try { return realpathSync(p); } catch { return null; } };
if (process.argv[1] && realPath(process.argv[1]) === realPath(fileURLToPath(import.meta.url))) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    process.stderr.write('card-check: ' + oneLine(err) + '\n');
    process.exitCode = 2;
  }
}
