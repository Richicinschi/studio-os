#!/usr/bin/env node
// scan_pubspec.mjs — Dart/Flutter SDK -> data-collection profile.
//
// WHY: off-the-shelf scanners (Exodus, MobSF, Privado) are blind to Dart's
// pub ecosystem. This reads pubspec.lock, matches packages against a curated
// registry of data-relevant SDKs, and emits the (data-type, recipient,
// on/off-device) flows the Privacy Policy must account for.
//
// Usage:  node scan_pubspec.mjs [appDir]
//   appDir defaults to the current folder (the Flutter project root). Output: JSON to stdout.
// No external dependencies (Node >=16, ESM).

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DEFAULT_APP = '.'; // the current folder: run the scan from the app's root, or pass the path
const appDir = resolve(process.argv[2] || DEFAULT_APP);

// Curated registry: package -> data flow. recipient is the legal entity that
// receives data OFF the device. offDevice=false means the package keeps data
// local (no flow to disclose as "sharing"). Keep entity names specific.
const SDK_REGISTRY = {
  firebase_auth: { recipient: 'Google/Firebase (Google Ireland Ltd / Google LLC)', dataTypes: ['email', 'user ID', 'auth tokens', 'federated sign-in ID'], offDevice: true, purpose: 'Account management', basis: '6(1)(b) contract' },
  cloud_firestore: { recipient: 'Google/Firebase (EU region; FREE tier = on-device only)', dataTypes: ['account profile', 'session history (Pro)'], offDevice: true, purpose: 'App functionality', basis: '6(1)(b) contract', note: 'Free tier keeps history on-device; only Pro syncs.' },
  firebase_analytics: { recipient: 'Google LLC', dataTypes: ['usage/app-activity events', 'app-instance ID (pseudonymous)'], offDevice: true, purpose: 'Analytics', basis: 'CONSENT required in NL (cookiewet) — NOT 6(1)(f)', note: 'AD_ID must be stripped; opt-in gate required in NL.' },
  firebase_crashlytics: { recipient: 'Google LLC', dataTypes: ['crash logs', 'device/diagnostic data'], offDevice: true, purpose: 'Fraud prevention/security & app stability', basis: 'CONSENT (analyse vs strictly-necessary) — flag' },
  firebase_messaging: { recipient: 'Google LLC', dataTypes: ['FCM push token', 'device ID'], offDevice: true, purpose: 'Developer communications', basis: '6(1)(a) consent (notifications)' },
  cloud_functions: { recipient: 'Google/Firebase (backend)', dataTypes: ['server-side processing'], offDevice: true, purpose: 'App functionality', basis: '6(1)(b) contract' },
  firebase_remote_config: { recipient: 'Google LLC', dataTypes: ['config fetch (pseudonymous instance ID)'], offDevice: true, purpose: 'App functionality', basis: '6(1)(f) legitimate interest' },
  firebase_core: { recipient: 'Google/Firebase', dataTypes: [], offDevice: false, purpose: 'Platform init (no data on its own)', basis: 'n/a' },
  purchases_flutter: { recipient: 'RevenueCat Inc. (US)', dataTypes: ['app user ID (= Firebase UID)', 'purchase token/receipt', 'subscription status'], offDevice: true, purpose: 'Account management / purchase processing', basis: '6(1)(b) contract', note: 'US transfer — verify DPF/SCC.' },
  google_sign_in: { recipient: 'Google LLC', dataTypes: ['Google account email/profile', 'OAuth token'], offDevice: true, purpose: 'Account management', basis: '6(1)(b) contract', note: 'Pulls USE_BIOMETRIC/USE_FINGERPRINT perms transitively; no biometric data retained.' },
  sign_in_with_apple: { recipient: 'Apple Inc.', dataTypes: ['Apple relay email/identifier', 'identity token'], offDevice: true, purpose: 'Account management', basis: '6(1)(b) contract' },
  shared_preferences: { recipient: '(on-device)', dataTypes: ['settings', 'reminder time', 'free-tier history'], offDevice: false, purpose: 'On-device storage', basis: 'n/a (no flow)' },
  flutter_local_notifications: { recipient: '(on-device)', dataTypes: ['local reminder schedule'], offDevice: false, purpose: 'On-device reminders', basis: 'n/a (no flow)' },
  flutter_timezone: { recipient: '(on-device)', dataTypes: ['device timezone (local)'], offDevice: false, purpose: 'Reminder scheduling', basis: 'n/a' },
  just_audio: { recipient: '(on-device)', dataTypes: [], offDevice: false, purpose: 'Audio playback', basis: 'n/a' },
  audio_session: { recipient: '(on-device)', dataTypes: [], offDevice: false, purpose: 'Audio session config', basis: 'n/a' },
};

// Packages known to be pure UI/util with no data + no network — suppressed from "unknown".
const KNOWN_BENIGN = new Set([
  'flutter', 'flutter_riverpod', 'riverpod', 'go_router', 'intl', 'flutter_localizations',
  'cupertino_icons', 'google_fonts', 'flutter_markdown', 'markdown', 'path_provider',
  'collection', 'meta', 'vector_math', 'characters', 'material_color_utilities',
  'flutter_svg', 'url_launcher', 'package_info_plus', 'device_info_plus',
]);

function parseLock(text) {
  // pubspec.lock is YAML. Lightweight parse of the `packages:` section.
  const pkgs = {};
  const lines = text.split(/\r?\n/);
  let inPackages = false, cur = null;
  for (const line of lines) {
    if (/^packages:\s*$/.test(line)) { inPackages = true; continue; }
    if (inPackages && /^\S/.test(line)) break; // left the packages block
    if (!inPackages) continue;
    const name = line.match(/^  ([A-Za-z0-9_]+):\s*$/);
    if (name) { cur = name[1]; pkgs[cur] = { dependency: '', version: '' }; continue; }
    if (cur) {
      const dep = line.match(/^\s+dependency:\s*"?([^"\n]+)"?\s*$/);
      const ver = line.match(/^\s+version:\s*"?([^"\n]+)"?\s*$/);
      if (dep) pkgs[cur].dependency = dep[1];
      if (ver) pkgs[cur].version = ver[1];
    }
  }
  return pkgs;
}

const lockPath = join(appDir, 'pubspec.lock');
if (!existsSync(lockPath)) {
  console.log(JSON.stringify({ error: `pubspec.lock not found at ${lockPath}`, appDir }, null, 2));
  process.exit(0);
}

const pkgs = parseLock(readFileSync(lockPath, 'utf8'));
const dataSdks = [], onDevice = [], unknownNetwork = [];
for (const [name, meta] of Object.entries(pkgs)) {
  const reg = SDK_REGISTRY[name];
  if (reg) {
    const entry = { package: name, version: meta.version, dependency: meta.dependency, ...reg };
    if (reg.offDevice) dataSdks.push(entry); else onDevice.push(entry);
  } else if (!KNOWN_BENIGN.has(name) && meta.dependency.startsWith('direct')) {
    // Direct dependency we don't recognise — surface so the SDK map can be extended.
    unknownNetwork.push({ package: name, version: meta.version, dependency: meta.dependency });
  }
}

const out = {
  appDir,
  source: 'pubspec.lock',
  totalPackages: Object.keys(pkgs).length,
  offDeviceDataFlows: dataSdks,
  onDeviceOnly: onDevice,
  unrecognisedDirectDeps: unknownNetwork,
  summary: {
    flowsToDisclose: dataSdks.length,
    recipients: [...new Set(dataSdks.map((s) => s.recipient))],
    note: 'Each offDeviceDataFlows entry is a (data-type, recipient) the Privacy Policy must disclose. Reconcile against privacy.md §3/§6 and the store labels.',
  },
};
console.log(JSON.stringify(out, null, 2));
