#!/usr/bin/env node
'use strict';
/*
 * Asset file check.
 *
 * Checks one asset file against the naming and filing conventions:
 * filename pattern, accepted format, size limits, and an entry in .assets/manifest.json.
 * Exit code is 0 when there are no issues and 1 otherwise. Warnings do not fail a file.
 *
 * Arguments: the asset path, and optionally --json for a machine-readable report.
 *
 * Colours are not inspected here; pair it with extract-colors.cjs for that.
 */

const fs = require('node:fs');
const path = require('node:path');

const KB = 1024;
const MB = KB * KB;

const CONVENTION =
  ['type', 'campaign', 'description', 'timestamp', 'variant'].map((p) => `{${p}}`).join('_') + '.{ext}';
const NAME_PATTERN = new RegExp(['^[a-z]+', '[a-z0-9-]+', '[a-z0-9-]+', '\\d{8}(?:_[a-z\\d-]+)?\\.[a-z]+$'].join('_'));
const NAME_EXAMPLES = [
  'banner_autumn-open-day_main-visual_20260314.png',
  'logo_rebrand_horizontal_20260314_dark.svg',
];
const KNOWN_TYPES = ['banner', 'logo', 'design', 'video', 'infographic', 'icon', 'photo'];

// Minimum pixel sizes per type. Listed for reference: this script does not read image headers.
const MIN_DIMENSIONS = Object.fromEntries(
  [['banner', 600, 300], ['logo', 100, 100], ['design', 800, 600], ['video', 640, 480], ['default', 100, 100]].map(
    ([kind, w, h]) => [kind, { minWidth: w, minHeight: h }]
  )
);

const SIZE_LIMITS = {
  image: { max: 5 * MB, recommended: 1 * MB },
  video: { max: 100 * MB, recommended: 50 * MB },
  svg: { max: 500 * KB, recommended: 100 * KB },
};

const FORMATS = {
  image: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
  vector: ['svg'],
  video: ['mp4', 'mov', 'webm'],
  document: ['pdf', 'psd', 'ai', 'fig'],
};

const extensionOf = (filename) => (filename.includes('.') ? filename.split('.').pop().toLowerCase() : '');

function humanSize(n) {
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  let value = n;
  let step = 0;
  while (value >= KB && step < units.length - 1) {
    value /= KB;
    step += 1;
  }
  return `${Number(value.toFixed(2))} ${units[step]}`;
}

// "type_campaign_description_YYYYMMDD[_variant].ext" split into its parts, or null if too few parts.
function splitName(filename) {
  const dot = filename.lastIndexOf('.');
  const parts = (dot > 0 ? filename.slice(0, dot) : filename).split('_');
  if (parts.length < 4) return null;
  const [type, campaign, description, timestamp, variant = null] = parts;
  return {
    type,
    campaign,
    description,
    timestamp,
    variant,
    extension: extensionOf(filename),
  };
}

function checkName(filename) {
  const problems = [];
  const hints = [];
  const parsed = splitName(filename);

  if (!NAME_PATTERN.test(filename)) {
    problems.push('Filename does not match naming convention');
    hints.push(`Expected format: ${CONVENTION}`, `Examples: ${NAME_EXAMPLES.join(', ')}`);
  }

  if (parsed) {
    const kebab = /^[a-z\d-]+$/;
    if (parsed.timestamp.length !== 8 || /\D/.test(parsed.timestamp)) problems.push('Timestamp should be YYYYMMDD format');
    if (parsed.campaign && !kebab.test(parsed.campaign)) problems.push('Campaign name should be kebab-case');
    if (parsed.description && !kebab.test(parsed.description)) problems.push('Description should be kebab-case');
    if (!KNOWN_TYPES.includes(parsed.type)) hints.push(`Consider using type: ${KNOWN_TYPES.join(', ')}`);
  }

  return { valid: problems.length === 0, issues: problems, suggestions: hints, parsed };
}

function checkFormat(ext) {
  const category = Object.keys(FORMATS).find((k) => FORMATS[k].includes(ext)) || null;
  if (!category) {
    return { valid: false, issues: [`Unsupported file format: .${ext}`], info: { category: null } };
  }
  return { valid: true, issues: [], info: { category } };
}

function checkSize(file, ext) {
  const size = fs.statSync(file).size;
  const limits = FORMATS.video.includes(ext) ? SIZE_LIMITS.video : ext === 'svg' ? SIZE_LIMITS.svg : SIZE_LIMITS.image;
  const tooBig = [];
  const heavy = [];

  const shown = humanSize(size);
  const crossed = size > limits.max ? 'max' : size > limits.recommended ? 'recommended' : null;
  if (crossed === 'max') tooBig.push('File size (' + shown + ') exceeds maximum (' + humanSize(limits.max) + ')');
  if (crossed === 'recommended') {
    heavy.push('File size (' + shown + ') exceeds recommended (' + humanSize(limits.recommended) + ')');
  }
  return { valid: tooBig.length === 0, issues: tooBig, warnings: heavy, size };
}

function checkManifest(file) {
  const manifestFile = path.join(process.cwd(), '.assets', 'manifest.json');
  if (!fs.existsSync(manifestFile)) return { registered: false, message: 'Manifest not found' };
  // Anything unreadable or malformed (bad JSON, "assets" that is not a list, a null item) is reported, never thrown.
  try {
    const raw = fs.readFileSync(manifestFile, 'utf-8');
    const list = JSON.parse(raw).assets;
    const rel = path.relative(process.cwd(), file);
    let entry;
    if (list !== undefined && list !== null) {
      if (!Array.isArray(list)) throw new TypeError('assets must be a list');
      entry = list.find((item) => [rel, file].includes(item.path));
    }
    const message = entry ? 'Asset registered in manifest' : 'Asset not in manifest';
    return { registered: Boolean(entry), message, asset: entry };
  } catch {
    const unreadable = 'Error reading manifest';
    return { registered: Boolean(0), message: unreadable };
  }
}

const dateStamp = () => new Date().toISOString().split('T')[0].split('-').join('');

function proposeName(pieces) {
  if (pieces === null) return null;
  const today = dateStamp();
  const stem = [pieces.type || 'asset', pieces.campaign || 'general', pieces.description || 'untitled', today];
  return stem.join('_') + '.' + (pieces.extension || 'png');
}

// JSON consumers expect the keys in this order
const REPORT_KEYS = ['path', 'filename', 'valid', 'issues', 'warnings', 'suggestions', 'checks'];
const inReportOrder = (report) => Object.fromEntries(REPORT_KEYS.map((k) => [k, report[k]]));

function validateAsset(file) {
  const report = {
    path: file,
    filename: path.basename(file),
    checks: {},
    valid: true,
    suggestions: [],
    warnings: [],
    issues: [],
  };

  if (!fs.existsSync(file)) {
    report.valid = false;
    report.issues.push('File not found: ' + file);
    return inReportOrder(report);
  }

  const filename = path.basename(file);
  const ext = extensionOf(filename);

  const name = checkName(filename);
  report.checks.filename = name;
  if (!name.valid) {
    report.issues.push(...name.issues);
    report.suggestions.push(...name.suggestions);
  }

  const format = checkFormat(ext);
  report.checks.format = format;
  if (!format.valid) report.issues.push(...format.issues);

  const size = checkSize(file, ext);
  report.checks.fileSize = size;
  if (!size.valid) report.issues.push(...size.issues);
  report.warnings.push(...size.warnings);

  const manifest = checkManifest(file);
  report.checks.manifest = manifest;
  if (!manifest.registered) {
    report.warnings.push('Asset not registered in manifest.json');
    report.suggestions.push('Register asset in .assets/manifest.json for tracking');
  }

  if (!name.valid && name.parsed) {
    const proposal = proposeName(name.parsed);
    if (proposal) report.suggestions.push(`Suggested filename: ${proposal}`);
  }

  report.valid = report.issues.length === 0;
  return inReportOrder(report);
}

function render(report) {
  const rule = '='.repeat(60);
  const out = ['', rule, `ASSET VALIDATION: ${report.filename}`, rule];
  out.push(`\nStatus: ${report.valid ? 'PASS' : 'FAIL'}`, `Path: ${report.path}`);

  const blocks = [
    ['ISSUES', report.issues],
    ['WARNINGS', report.warnings],
    ['SUGGESTIONS', report.suggestions],
  ];
  for (const [title, items] of blocks) {
    if (items.length === 0) continue;
    out.push(`\n${title}:`, ...items.map((i) => `  - ${i}`));
  }

  const bytes = report.checks.fileSize && report.checks.fileSize.size;
  if (bytes) out.push(`\nFile Size: ${humanSize(bytes)}`);
  out.push('\n' + rule);
  return out.join('\n');
}

function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');
  const target = argv.find((arg) => arg.slice(0, 2) !== '--');

  if (!target) {
    console.error('Usage: node validate-asset.cjs ' + '<asset-path> [--json]');
    console.error('\nExamples:');
    console.error('  node validate-asset.cjs assets/banners/email-headers/banner_winter-mailer_header_20260314.png');
    console.error('  node validate-asset.cjs assets/logos/monochrome/logo-white.svg --json');
    process.exit(1);
  }

  const file = path.isAbsolute(target) ? target : path.join(process.cwd(), target);
  const report = validateAsset(file);
  console.log(asJson ? JSON.stringify(report, null, 2) : render(report));
  process.exitCode = report.valid ? 0 : 1;
}

main();
