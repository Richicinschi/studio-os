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

function boolAfter(block, key) {
  // <key>KEY</key> followed by <true/> or <false/>
  const m = block.match(new RegExp(`<key>${key}</key>\\s*<(true|false)\\/>`));
  return m ? m[1] === 'true' : null;
}

function arrayStringsAfter(block, key) {
  const m = block.match(new RegExp(`<key>${key}</key>\\s*<array>([\\s\\S]*?)</array>`));
  if (!m) return [];
  return [...m[1].matchAll(/<string>([^<]+)<\/string>/g)].map((x) => x[1]);
}

function parseManifest(text) {
  const collected = [];
  const collBlock = text.match(/<key>NSPrivacyCollectedDataTypes<\/key>\s*<array>([\s\S]*?)<\/array>\s*(?=<key>NSPrivacyAccessedAPITypes<\/key>|<\/dict>\s*<\/plist>)/);
  if (collBlock) {
    for (const d of collBlock[1].matchAll(/<dict>([\s\S]*?)<\/dict>/g)) {
      const b = d[1];
      const type = (b.match(/<key>NSPrivacyCollectedDataType<\/key>\s*<string>([^<]+)<\/string>/) || [])[1];
      if (!type) continue;
      collected.push({
        type,
        label: TYPE_LABELS[type] || type,
        linked: boolAfter(b, 'NSPrivacyCollectedDataTypeLinked'),
        tracking: boolAfter(b, 'NSPrivacyCollectedDataTypeTracking'),
        purposes: arrayStringsAfter(b, 'NSPrivacyCollectedDataTypePurposes').map((p) => p.replace('NSPrivacyCollectedDataTypePurpose', '')),
      });
    }
  }
  const apis = [];
  // NOTE: the accessed-API array contains a nested <array> of reason codes, so a
  // non-greedy /<array>...<\/array>/ on the outer block stops at the inner array.
  // Instead, take the region from the key onward and match each <dict>...</dict>
  // (reason arrays hold no dicts, so dict-matching is safe).
  const apiKeyIdx = text.indexOf('NSPrivacyAccessedAPITypes');
  if (apiKeyIdx >= 0) {
    const region = text.slice(apiKeyIdx);
    for (const d of region.matchAll(/<dict>([\s\S]*?)<\/dict>/g)) {
      const b = d[1];
      const type = (b.match(/<key>NSPrivacyAccessedAPIType<\/key>\s*<string>([^<]+)<\/string>/) || [])[1];
      if (!type) continue;
      apis.push({ api: type.replace('NSPrivacyAccessedAPICategory', ''), reasons: arrayStringsAfter(b, 'NSPrivacyAccessedAPITypeReasons') });
    }
  }
  return {
    tracking: boolAfter(text, 'NSPrivacyTracking'),
    trackingDomains: arrayStringsAfter(text, 'NSPrivacyTrackingDomains'),
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
  const parsed = parseManifest(readFileSync(p, 'utf8'));
  return { path: p.replace(/\\/g, '/'), isAppManifest: /Runner[\\/]PrivacyInfo/.test(p), ...parsed };
});

// Union of collected types across app + pods, for label reconciliation.
const allTypes = {};
let anyTracking = false;
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
  reconcile: 'Map collectedDataTypes -> Apple App Privacy label answers and -> Privacy Policy §3. healthOrFitnessDeclared MUST be empty for a no-HealthKit wellness app. anyTracking should be false (no ATT).',
};
console.log(JSON.stringify(out, null, 2));
