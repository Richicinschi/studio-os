#!/usr/bin/env node
'use strict';
/*
 * Palette reader and image-colour helper.
 *
 * Reads the brand palette from the guidelines file and, for an image, prints how to pull
 * its dominant colours so they can be compared with the palette. No image decoding happens
 * here; the work is handed to ImageMagick or an image-analysis skill.
 *
 * Arguments: --palette lists the palette; an image path prints extraction steps;
 * --brand-file <md> points at another guidelines file; --json switches to JSON output.
 */

const { existsSync, readFileSync } = require('node:fs');
const { isAbsolute, join } = require('node:path');

const DEFAULT_FILE = ['docs', 'brand-guidelines.md'].join('/');
const RGB_THRESHOLD = 50; // distance (0..441) under which a colour counts as on-brand

const absolute = (p) => (isAbsolute(p) ? p : join(process.cwd(), p));

const HEX_COLOR = new RegExp('#[0-9a-f]{6}\\b', 'gi');
const hexesIn = (text) => Array.from(new Set(text.match(HEX_COLOR) || []));

// Each palette group is the text under one "### <Name>" heading, up to the next heading.
const GROUPS = ['Primary', 'Secondary', 'Neutral', 'Semantic'];

function parseBrandColors(file) {
  const target = absolute(file);
  if (!existsSync(target)) return null;
  const md = readFileSync(target, 'utf-8');
  const palette = Object.fromEntries([...GROUPS.map((g) => g.toLowerCase()), 'all'].map((k) => [k, []]));
  for (const group of GROUPS) {
    const until = '(?=' + ['###', '##', '$'].join('|') + ')';
    const block = new RegExp('### ' + group + '[\\s\\S]*?' + until, 'i').exec(md);
    if (!block) continue;
    const found = hexesIn(block[0]);
    palette[group.toLowerCase()] = found;
    palette.all.push(...found);
  }
  palette.all = Array.from(new Set(palette.all));
  return palette;
}

function hexToRgb(hex) {
  const digits = String(hex).replace(/^#/, '');
  if (!/^[\da-f]{6}$/i.test(digits)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  const part = (n) => Math.round(n).toString(16).padStart(2, '0');
  return ('#' + part(r) + part(g) + part(b)).toUpperCase();
}

// Straight-line distance between two colours in RGB space.
function colorDistance(a, b) {
  const p = typeof a === 'string' ? hexToRgb(a) : a;
  const q = typeof b === 'string' ? hexToRgb(b) : b;
  if (!p || !q) return Infinity;
  return Math.hypot(p.r - q.r, p.g - q.g, p.b - q.b);
}

function findNearestBrandColor(color, brandColors) {
  let best = { color: null, distance: Infinity };
  for (const candidate of brandColors) {
    const d = colorDistance(color, candidate);
    if (d < best.distance) best = { color: candidate, distance: d };
  }
  return best;
}

// Percent of extracted colours that sit within `threshold` of some brand colour.
function calculateCompliance(extracted, brand, threshold = RGB_THRESHOLD) {
  if (!Array.isArray(extracted) || !extracted.length) return 100; // nothing to judge
  if (!Array.isArray(brand) || !brand.length) return 0; // nothing to match against
  const hits = extracted.filter((c) => findNearestBrandColor(c, brand).distance <= threshold);
  return Math.round((hits.length / extracted.length) * 100);
}

const magickCommand = (img, n = 10) =>
  ['magick', `"${img}"`, '-colors', n, '-depth', 8, '-format', '"%c"', 'histogram:info:'].join(' ');

// Each histogram line starts with a pixel count and carries a hex value; returns the most frequent first.
function parseImageMagickOutput(output) {
  const rows = [];
  for (const line of output.trim().split('\n')) {
    const hex = new RegExp('#([\\da-f]{6})', 'i').exec(line);
    if (!hex) continue;
    const lead = line.split(':')[0].trim();
    rows.push({ hex: '#' + hex[1].toUpperCase(), count: /^\d+$/.test(lead) ? Number(lead) : 0 });
  }
  return rows.sort((x, y) => y.count - x.count);
}

function printPalette(palette) {
  const rule = '='.repeat(50);
  const lines = ['', rule, 'BRAND COLOR PALETTE', rule];
  const labelled = [
    ['Primary Colors', palette.primary],
    ['Secondary Colors', palette.secondary],
    ['Neutral Colors', palette.neutral],
    ['Semantic Colors', palette.semantic],
  ];
  for (const [label, list] of labelled) {
    if (list.length === 0) continue;
    lines.push('', label + ':', ...list.map((c) => '  ' + c));
  }
  lines.push('', rule, 'Total: ' + palette.all.length + ' colors in brand palette', rule, '');
  console.log(lines.join('\n'));
}

function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');
  const wantPalette = argv.includes('--palette');
  const flagAt = argv.indexOf('--brand-file');
  const flagValue = flagAt === -1 ? null : argv[flagAt + 1];
  const guidelines = flagValue === null ? DEFAULT_FILE : flagValue;
  const image = argv.find((a) => a.slice(0, 2) !== '--' && a !== flagValue);

  const palette = parseBrandColors(guidelines);
  if (palette === null) {
    console.error('Brand guidelines not found at: ' + guidelines);
    console.error('Create brand guidelines or specify ' + 'path with --brand-file');
    process.exit(1);
  }

  if (wantPalette || !image) {
    if (asJson) {
      console.log(JSON.stringify(palette, null, 2));
      return;
    }
    printPalette(palette);
    if (!image) {
      console.log('To extract colors from an image:');
      console.log('  node extract-colors.cjs <image-path>');
      console.log('\nOr use ImageMagick directly:');
      console.log('  ' + magickCommand('image.png').replace(/"image\.png"/, 'image.png'));
    }
    return;
  }

  const imagePath = absolute(image);
  if (!existsSync(imagePath)) {
    console.error('Image not found: ' + imagePath);
    process.exit(1);
  }

  const command = magickCommand(imagePath);
  const steps = [
    '1. Run the ImageMagick command to extract colors:',
    `   ${command}`,
    '',
    '2. Or use the ai-multimodal skill:',
    '   python ' + ['.claude', 'skills', 'ai-multimodal', 'scripts', 'gemini_batch_process.py'].join('/') + ' \\',
    `     --files "${imagePath}" \\`,
    '     --task analyze \\',
    '     --prompt "List the ten dominant colors of this image as hex values"',
    '',
    '3. Then compare extracted colors against brand palette',
  ];

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          image: imagePath,
          brandPalette: palette,
          extractionCommand: command,
          instructions: steps,
          complianceCheck: {
            threshold: RGB_THRESHOLD,
            description: `Colors within distance ${RGB_THRESHOLD} (RGB space) are considered brand-compliant`,
            brandColors: palette.all,
          },
        },
        null,
        2
      )
    );
    return;
  }

  const rule = '='.repeat(60);
  console.log(['', rule, 'COLOR EXTRACTION HELPER', rule].join('\n'));
  const show = (list) => list.join(', ') || 'none';
  const report = [
    '\nImage: ' + imagePath,
    '\nBrand Colors: ' + palette.all.length + ' colors loaded',
    '\nTo extract colors from this image:\n',
    ...steps,
    '\n' + rule,
    '\nBrand Palette Reference:',
    '  Primary: ' + show(palette.primary),
    '  Secondary: ' + show(palette.secondary),
    '  Neutral: ' + show(palette.neutral),
    rule + '\n',
  ];
  console.log(report.join('\n'));
}

Object.assign(module.exports, {
  calculateCompliance,
  colorDistance,
  findNearestBrandColor,
  hexToRgb,
  parseBrandColors,
  parseImageMagickOutput,
  rgbToHex,
});

if (require.main === module) main();
