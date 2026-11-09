#!/usr/bin/env node
// scan_android_manifest.mjs — Android permission / AD_ID surface from the manifest.
//
// WHY: SDKs auto-merge permissions (notably the AD_ID advertising-id permission
// pulled in by firebase_analytics) into the MERGED manifest even when the app
// claims "no advertising ID". This greps the merged manifest (preferred) or the
// source manifest, classifies permissions, and reports whether AD_ID is present
// or has been stripped via tools:node="remove" — to reconcile against the Play
// Data Safety "no advertising ID" answer and Privacy Policy §4.
//
// Usage:  node scan_android_manifest.mjs [appDir]
// No external dependencies.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DEFAULT_APP = '.'; // the current folder: run the scan from the app's root, or pass the path
const appDir = resolve(process.argv[2] || DEFAULT_APP);

// Sensitive / notable permissions to classify when found.
const SENSITIVE = {
  'com.google.android.gms.permission.AD_ID': 'Advertising ID (GAID) — must match Data Safety "advertising ID" answer',
  'android.permission.ACCESS_ADSERVICES_ATTRIBUTION': 'AdServices attribution',
  'android.permission.ACCESS_ADSERVICES_AD_ID': 'AdServices ad id',
  'android.permission.ACCESS_FINE_LOCATION': 'Precise location',
  'android.permission.ACCESS_COARSE_LOCATION': 'Approximate location',
  'android.permission.USE_BIOMETRIC': 'Biometric (pulled in by Google Sign-In; no biometric data retained)',
  'android.permission.USE_FINGERPRINT': 'Fingerprint (legacy; via Google Sign-In)',
  'android.permission.READ_CONTACTS': 'Contacts',
  'android.permission.RECORD_AUDIO': 'Microphone',
  'android.permission.CAMERA': 'Camera',
  'android.permission.QUERY_ALL_PACKAGES': 'Installed-apps inventory (needs Play justification)',
  'android.permission.READ_PHONE_STATE': 'Phone state',
  'com.android.vending.BILLING': 'Play Billing',
  'android.permission.POST_NOTIFICATIONS': 'Notifications (Android 13+)',
  'android.permission.RECEIVE_BOOT_COMPLETED': 'Boot-completed (reminder rescheduling)',
  'android.permission.SCHEDULE_EXACT_ALARM': 'Exact alarms (reminders)',
  'android.permission.INTERNET': 'Network access',
};

function findMergedManifest() {
  // Prefer the release merged manifest (what actually ships), then debug.
  const base = join(appDir, 'build', 'app', 'intermediates', 'merged_manifest');
  const candidates = [];
  if (existsSync(base)) {
    for (const variant of ['release', 'debug', 'profile']) {
      const vdir = join(base, variant);
      if (!existsSync(vdir)) continue;
      // walk one level for processXxxMainManifest/AndroidManifest.xml
      for (const sub of readdirSync(vdir)) {
        const f = join(vdir, sub, 'AndroidManifest.xml');
        if (/process.*MainManifest/i.test(sub) && existsSync(f)) candidates.push({ path: f, variant, mtime: statSync(f).mtimeMs });
      }
    }
  }
  candidates.sort((a, b) => (a.variant === 'release' ? -1 : 1) - (b.variant === 'release' ? -1 : 1) || b.mtime - a.mtime);
  return candidates[0]?.path || null;
}

function permsFromManifest(text) {
  const found = [];
  const re = /<uses-permission[^>]*android:name="([^"]+)"([^>]*)\/?>/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    const attrs = m[2] || '';
    const stripped = /tools:node\s*=\s*"remove"/.test(attrs);
    found.push({ name, stripped });
  }
  return found;
}

function readTargetSdk() {
  // Look in android/app/build.gradle(.kts) for targetSdk / targetSdkVersion.
  for (const f of ['build.gradle.kts', 'build.gradle']) {
    const p = join(appDir, 'android', 'app', f);
    if (existsSync(p)) {
      const t = readFileSync(p, 'utf8');
      const m = t.match(/targetSdk(?:Version)?\s*[=( ]\s*(\d+)/);
      if (m) return Number(m[1]);
      const flutterRef = /targetSdk(?:Version)?\s*[=( ]\s*flutter\.targetSdkVersion/.test(t);
      if (flutterRef) return 'flutter.targetSdkVersion (Flutter default)';
    }
  }
  return null;
}

const merged = findMergedManifest();
const source = join(appDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const manifestPath = merged || (existsSync(source) ? source : null);

if (!manifestPath) {
  console.log(JSON.stringify({ error: 'No AndroidManifest found (build the app to produce a merged manifest).', appDir }, null, 2));
  process.exit(0);
}

const text = readFileSync(manifestPath, 'utf8');
const perms = permsFromManifest(text);
// Also scan the SOURCE manifest for tools:node="remove" strips (the merged one drops removed perms entirely).
let sourceStrips = [];
if (existsSync(source) && source !== manifestPath) {
  sourceStrips = permsFromManifest(readFileSync(source, 'utf8')).filter((p) => p.stripped).map((p) => p.name);
}

const adIdName = 'com.google.android.gms.permission.AD_ID';
const adIdInMerged = perms.find((p) => p.name === adIdName);
const adIdStripped = sourceStrips.includes(adIdName) || (adIdInMerged?.stripped ?? false);

const out = {
  appDir,
  manifestUsed: manifestPath,
  isMerged: !!merged,
  targetSdk: readTargetSdk(),
  permissions: perms.map((p) => ({
    name: p.name,
    stripped: p.stripped,
    note: SENSITIVE[p.name] || null,
  })),
  sensitivePermissions: perms.filter((p) => SENSITIVE[p.name]).map((p) => p.name),
  advertisingId: {
    presentInMerged: !!adIdInMerged && !adIdInMerged.stripped,
    strippedInSource: adIdStripped,
    verdict: adIdStripped
      ? 'AD_ID stripped via tools:node="remove" — consistent with "no advertising ID".'
      : (adIdInMerged ? 'AD_ID PRESENT in merged manifest — reconcile with Data Safety / Privacy §4 or strip it.' : 'AD_ID not present.'),
  },
  reconcile: 'Compare sensitivePermissions against Play Data Safety declarations and Privacy §4 "what we do not collect". Any sensitive perm with no Data Safety coverage is a finding.',
};
console.log(JSON.stringify(out, null, 2));
