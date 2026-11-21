#!/usr/bin/env node
// scan_ios_privacy.mjs — iOS privacy-manifest (PrivacyInfo.xcprivacy) surface.
//
// WHY: Apple's privacy manifest is the iOS analog of the Android manifest +
// the App Privacy label. The app's own manifest plus each third-party pod's
// manifest together declare collected data types, tracking, and required-reason
// API usage. This merges them so the App Privacy label and the Privacy Policy
// can be reconciled against what the binary actually declares.
//
// Usage:  node scan_ios_privacy.mjs [appDir]
// No external dependencies. Lightweight plist parse (no XML lib).

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DEFAULT_APP = '.'; // the current folder: run the scan from the app's root, or pass the path
const appDir = resolve(process.argv[2] || DEFAULT_APP);

// Human labels for the common NSPrivacyCollectedDataType values.
const TYPE_LABELS = {
  NSPrivacyCollectedDataTypeEmailAddress: 'Email address',
  NSPrivacyCollectedDataTypeName: 'Name',
  NSPrivacyCollectedDataTypeUserID: 'User ID',
  NSPrivacyCollectedDataTypeProductInteraction: 'Product interaction (usage)',
  NSPrivacyCollectedDataTypeCrashData: 'Crash data',
  NSPrivacyCollectedDataTypePerformanceData: 'Performance data',
  NSPrivacyCollectedDataTypePurchaseHistory: 'Purchase history',
  NSPrivacyCollectedDataTypeDeviceID: 'Device ID',
  NSPrivacyCollectedDataTypePreciseLocation: 'Precise location',
  NSPrivacyCollectedDataTypeCoarseLocation: 'Coarse location',
  NSPrivacyCollectedDataTypeHealth: 'Health',
  NSPrivacyCollectedDataTypeFitness: 'Fitness',
};

function findManifests(dir, acc = []) {
  // Recurse ios/ but skip heavy build dirs; collect PrivacyInfo.xcprivacy files.
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (/^(\.|DerivedData|build|\.symlinks)$/.test(e.name)) continue;
      findManifests(p, acc);
    } else if (e.name === 'PrivacyInfo.xcprivacy') {
      acc.push(p);
    }
  }
  return acc;
}

// Reads an XML plist into plain values (dict -> object, array -> list, true/false -> boolean,
// integer/real -> number, string/date/data -> string), so every key is found by name, in any order.
// Throws on markup it cannot read.
function readPlist(text) {
  const body = text.replace(/<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>/g, '');
  const tokens = body.match(/<[^>]*>|[^<]+/g) || [];
  let i = 0;
  const tagOf = (tok) => {
    const m = /^<(\/?)([A-Za-z]+)\b[^>]*?(\/?)>$/.exec(tok || '');
    return m && { closing: m[1] === '/', name: m[2], empty: m[3] === '/' };
  };
  const nextTag = () => {
    while (i < tokens.length && !tokens[i].startsWith('<')) {
      if (tokens[i].trim()) throw new Error(`text outside an element: "${tokens[i].trim().slice(0, 40)}"`);
      i++;
    }
    if (i >= tokens.length) throw new Error('the plist ends early');
    const tag = tagOf(tokens[i]);
    if (!tag) throw new Error(`cannot read ${tokens[i]}`);
    return tag;
  };
  const textUntil = (name) => {
    let s = '';
    while (i < tokens.length && tokens[i] !== `</${name}>`) s += tokens[i++];
    if (i >= tokens.length) throw new Error(`no </${name}>`);
    i++;
    return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  };
  const value = () => {
    const tag = nextTag();
    i++;
    if (tag.closing) throw new Error(`unexpected </${tag.name}>`);
    if (tag.name === 'plist') {
      const v = value();
      const end = nextTag();
      if (!end.closing || end.name !== 'plist') throw new Error('more than one value in <plist>');
      i++;
      return v;
    }
    if (tag.name === 'true' || tag.name === 'false') {
      if (!tag.empty) textUntil(tag.name);
      return tag.name === 'true';
    }
    if (tag.name === 'dict') {
      const dict = {};
      for (let t = tag.empty ? null : nextTag(); t; t = nextTag()) {
        i++;
        if (t.closing && t.name === 'dict') return dict;
        if (t.closing || t.name !== 'key') throw new Error(`<${t.name}> where a <key> belongs`);
        const key = t.empty ? '' : textUntil('key');
        dict[key] = value();
      }
      return dict;
    }
    if (tag.name === 'array') {
      const list = [];
      for (let t = tag.empty ? null : nextTag(); t; t = nextTag()) {
        if (t.closing && t.name === 'array') { i++; return list; }
        list.push(value());
      }
      return list;
    }
    const raw = tag.empty ? '' : textUntil(tag.name);
    return tag.name === 'integer' || tag.name === 'real' ? Number(raw) : raw;
  };
  return value();
}

const dictOf = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const listOf = (v) => (Array.isArray(v) ? v : []);
const boolOf = (v) => (typeof v === 'boolean' ? v : null);
const stringsOf = (v) => listOf(v).filter((s) => typeof s === 'string' && s !== '');

function parseManifest(text) {
  const root = dictOf(readPlist(text));
  const collected = listOf(root.NSPrivacyCollectedDataTypes)
    .map(dictOf)
    .filter((d) => typeof d.NSPrivacyCollectedDataType === 'string' && d.NSPrivacyCollectedDataType !== '')
    .map((d) => ({
      type: d.NSPrivacyCollectedDataType,
      label: TYPE_LABELS[d.NSPrivacyCollectedDataType] || d.NSPrivacyCollectedDataType,
      linked: boolOf(d.NSPrivacyCollectedDataTypeLinked),
      tracking: boolOf(d.NSPrivacyCollectedDataTypeTracking),
      purposes: stringsOf(d.NSPrivacyCollectedDataTypePurposes).map((p) => p.replace('NSPrivacyCollectedDataTypePurpose', '')),
    }));
  const apis = listOf(root.NSPrivacyAccessedAPITypes)
    .map(dictOf)
    .filter((d) => typeof d.NSPrivacyAccessedAPIType === 'string' && d.NSPrivacyAccessedAPIType !== '')
    .map((d) => ({ api: d.NSPrivacyAccessedAPIType.replace('NSPrivacyAccessedAPICategory', ''), reasons: stringsOf(d.NSPrivacyAccessedAPITypeReasons) }));
  return {
    tracking: boolOf(root.NSPrivacyTracking),
    trackingDomains: stringsOf(root.NSPrivacyTrackingDomains),
    collected,
    accessedApis: apis,
  };
}

const iosDir = join(appDir, 'ios');
if (!existsSync(iosDir)) {
  console.log(JSON.stringify({ error: `ios/ not found at ${iosDir}`, appDir }, null, 2));
  process.exit(0);
}

const manifestPaths = findManifests(iosDir);
const manifests = manifestPaths.map((p) => {
  let parsed;
  try {
    parsed = parseManifest(readFileSync(p, 'utf8'));
  } catch (err) {
    // The manifest entry says it could not be read; nothing is guessed from it.
    parsed = { error: `could not read this plist: ${err.message}`, tracking: null, trackingDomains: [], collected: [], accessedApis: [] };
  }
  return { path: p.replace(/\\/g, '/'), isAppManifest: /Runner[\\/]PrivacyInfo/.test(p), ...parsed };
});

// A manifest that could not be read declares nothing we know of: its data types and tracking are
// unknown, not absent. Each one is listed here, and tracking stays unknown unless another says true.
const notChecked = manifests
  .filter((mf) => mf.error)
  .map((mf) => `${mf.path}: ${mf.error} (convert it with \`plutil -convert xml1\` and re-run)`);

// Union of collected types across app + pods, for label reconciliation.
const allTypes = {};
let anyTracking = notChecked.length > 0 ? null : false;
const healthDeclared = [];
for (const mf of manifests) {
  if (mf.tracking) anyTracking = true;
  for (const c of mf.collected) {
    allTypes[c.label] = allTypes[c.label] || { linkedAnywhere: false, purposes: new Set() };
    if (c.linked) allTypes[c.label].linkedAnywhere = true;
    c.purposes.forEach((p) => allTypes[c.label].purposes.add(p));
    if (/Health|Fitness/.test(c.type)) healthDeclared.push(c.label);
  }
}

const out = {
  appDir,
  manifestCount: manifests.length,
  note: manifests.length <= 1 ? 'Only the app manifest found — pod manifests appear after `pod install` / a build on macOS. Re-run on the Mac for full third-party coverage.' : 'App + pod manifests merged.',
  appManifestPresent: manifests.some((m) => m.isAppManifest),
  anyTracking,
  healthOrFitnessDeclared: [...new Set(healthDeclared)],
  collectedDataTypes: Object.entries(allTypes).map(([label, v]) => ({ label, linked: v.linkedAnywhere, purposes: [...v.purposes] })),
  manifests,
  notChecked,
  reconcile: "Map collectedDataTypes -> Apple App Privacy label answers and -> Privacy Policy §3. healthOrFitnessDeclared non-empty is a condition to confirm, not a blocker: Apple's Health and Fitness types turn on the data, not on HealthKit. anyTracking should be false (no ATT). Each notChecked line is a manifest that could not be read: what it collects and whether it tracks are unknown, not absent, so collectedDataTypes may be missing types and anyTracking is null unless a readable manifest declares tracking.",
};
console.log(JSON.stringify(out, null, 2));
