#!/usr/bin/env node
// emit_play_csv.mjs — emit a Google Play Data Safety declaration as CSV.
//
// WHY: the Data Safety form is the Android counterpart to Apple's App Privacy
// label. Driving it from one machine-readable "answers" file (the single source
// of truth) keeps the Play form, the Apple label, and the Privacy Policy from
// drifting. This emits a human-readable CSV always, and — given a Play Console
// export template — fills the importable 5-column CSV.
//
// Usage:
//   node emit_play_csv.mjs --answers answers.json  # the app's own answers -> readable CSV
//   node emit_play_csv.mjs                         # bundled EXAMPLE answers (not your app's)
//   node emit_play_csv.mjs --template play_export.csv   # fill importable 5-col CSV
//   add  --out file.csv  to write to a file.
// No external dependencies.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ---- Bundled EXAMPLE answers (pass --answers with the app's own file) ----
// The example app of legal-guardrails.md section 8: a Firebase + RevenueCat
// wellness app with no health data. Derived from the Data Safety taxonomy
// (14 categories / 7 purposes / 2 security declarations) and that app's data
// surface. NOT "Health & fitness". Mirrors assets/data-safety-answers.example.json.
const EXAMPLE_ANSWERS = {
  app: '<app name>',
  security: { encryptedInTransit: true, userCanRequestDeletion: true },
  // Each entry: category > type, collected/shared, ephemeral, optional, purposes[].
  // shared=false on every row: Firebase/RevenueCat/stores are PROCESSORS on the
  // publisher's documented instructions, which Play excludes from "sharing".
  // The Privacy Policy's recipients section must say the same.
  data: [
    { category: 'Personal info', type: 'Email address', collected: true, shared: false, ephemeral: false, optional: true, purposes: ['Account management', 'App functionality'], recipient: 'Google/Firebase (processor)' },
    { category: 'Personal info', type: 'User IDs', collected: true, shared: false, ephemeral: false, optional: false, purposes: ['Account management', 'App functionality', 'Analytics'], recipient: 'Google/Firebase, RevenueCat (processors)' },
    { category: 'Personal info', type: 'Name', collected: true, shared: false, ephemeral: false, optional: true, purposes: ['Account management'], recipient: 'Google/Firebase (processor)' },
    { category: 'Financial info', type: 'Purchase history', collected: true, shared: false, ephemeral: false, optional: false, purposes: ['App functionality', 'Account management'], recipient: 'RevenueCat (processor); Google Play (merchant of record)' },
    { category: 'App activity', type: 'App interactions', collected: true, shared: false, ephemeral: false, optional: true, purposes: ['Analytics', 'App functionality'], recipient: 'Google (Firebase Analytics, processor)' },
    { category: 'App info and performance', type: 'Crash logs', collected: true, shared: false, ephemeral: false, optional: true, purposes: ['Fraud prevention, security, and compliance', 'App functionality'], recipient: 'Google (Crashlytics, processor)' },
    { category: 'App info and performance', type: 'Diagnostics', collected: true, shared: false, ephemeral: false, optional: true, purposes: ['App functionality'], recipient: 'Google (Crashlytics, processor)' },
  ],
  // Categories explicitly NOT collected (asserted for the cross-check).
  notCollected: ['Location', 'Health & fitness', 'Messages', 'Photos & videos', 'Audio', 'Files & docs', 'Calendar', 'Contacts', 'Web browsing history'],
};

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const answersPath = opt('--answers');
const templatePath = opt('--template');
const outPath = opt('--out');

if (!answersPath) console.error('Note: no --answers file given; emitting the bundled EXAMPLE answers, not your app\'s. Copy assets/data-safety-answers.example.json, set every row for your app, and pass it with --answers.');
const answers = answersPath ? JSON.parse(readFileSync(resolve(answersPath), 'utf8')) : EXAMPLE_ANSWERS;

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function readableCsv(a) {
  const rows = [['Category', 'Data type', 'Collected', 'Shared', 'Ephemeral', 'Required', 'Purposes', 'Recipient(s)']];
  for (const d of a.data) {
    rows.push([d.category, d.type, d.collected ? 'Yes' : 'No', d.shared ? 'Yes' : 'No', d.ephemeral ? 'Yes' : 'No', d.optional ? 'Optional' : 'Required', (d.purposes || []).join('; '), d.recipient || '']);
  }
  rows.push([]);
  rows.push(['Security: encrypted in transit', a.security.encryptedInTransit ? 'Yes' : 'No']);
  rows.push(['Security: users can request deletion', a.security.userCanRequestDeletion ? 'Yes' : 'No']);
  rows.push(['Not collected', (a.notCollected || []).join('; ')]);
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n');
}

// Importable form: fill a Play Console export template's "Response value" column
// by matching the "Human-friendly question label" against our answers. Play's
// exact Question/Response IDs vary per app, so the template MUST come from
// "Play Console > Data safety > Export to CSV".
function importableCsv(a, templateText) {
  const lines = templateText.split(/\r?\n/);
  const header = lines[0];
  const out = [header];
  const collectedLabels = new Set(a.data.filter((d) => d.collected).map((d) => d.type.toLowerCase()));
  const sharedLabels = new Set(a.data.filter((d) => d.shared).map((d) => d.type.toLowerCase()));
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { out.push(line); continue; }
    const cols = line.split(',');
    const label = (cols[cols.length - 1] || '').toLowerCase();
    // Heuristic fill: set TRUE where a label references a collected/shared type.
    let val = '';
    if ([...collectedLabels].some((l) => label.includes(l))) val = 'TRUE';
    if (/encrypted in transit/.test(label)) val = a.security.encryptedInTransit ? 'TRUE' : 'FALSE';
    if (/request.*deletion|delete.*data/.test(label)) val = a.security.userCanRequestDeletion ? 'TRUE' : 'FALSE';
    if (val && cols.length >= 3) cols[2] = val; // Response value is column 3
    out.push(cols.join(','));
  }
  return out.join('\n') + '\n\n# NOTE: heuristic fill by label match — REVIEW every row before importing. Purposes/shared per-type still need manual confirmation against the template structure.';
}

let output;
if (templatePath && existsSync(resolve(templatePath))) {
  output = importableCsv(answers, readFileSync(resolve(templatePath), 'utf8'));
} else {
  output = readableCsv(answers);
  if (templatePath) output += '\n\n# (template not found — emitted readable CSV. Export a template via Play Console > Data safety > Export to CSV.)';
}

if (outPath) { writeFileSync(resolve(outPath), output); console.log(`Wrote ${outPath}`); }
else console.log(output);
