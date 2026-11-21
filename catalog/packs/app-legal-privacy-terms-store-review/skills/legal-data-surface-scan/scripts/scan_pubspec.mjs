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

// Package registry: what each package does in general, in any app. It names no app's data:
// which of these data types the app really sends, and on what lawful basis, is the app's to
// answer (sdk-data-map.md holds the basis). recipient is the legal entity that receives data
// OFF the device; offDevice=false means the package keeps its data on the device (no flow to
// disclose as "sharing" unless the app sends it on). Keep entity names specific.
const SDK_REGISTRY = {
  firebase_auth: { recipient: 'Google/Firebase (Google Ireland Ltd / Google LLC)', dataTypes: ['email or phone number used to sign in', 'user ID', 'auth tokens', 'federated sign-in ID'], offDevice: true, purpose: 'Sign-in and account management' },
  cloud_firestore: { recipient: 'Google/Firebase (Google Ireland Ltd / Google LLC)', dataTypes: ['whatever the app writes to its database'], offDevice: true, purpose: 'Cloud database and sync', note: 'Check which collections the app writes and which hold personal data.' },
  firebase_analytics: { recipient: 'Google LLC', dataTypes: ['usage/app-activity events', 'app-instance ID (pseudonymous)', 'device and OS attributes'], offDevice: true, purpose: 'Analytics', note: 'On Android it collects the advertising ID unless google_analytics_adid_collection_enabled is false; "no advertising ID" needs that flag and the AD_ID strip (sdk-data-map.md §3).' },
  firebase_crashlytics: { recipient: 'Google LLC', dataTypes: ['crash logs', 'device/diagnostic data', 'installation ID'], offDevice: true, purpose: 'Crash reporting' },
  firebase_messaging: { recipient: 'Google LLC', dataTypes: ['FCM registration token'], offDevice: true, purpose: 'Push messages' },
  cloud_functions: { recipient: 'Google/Firebase (backend)', dataTypes: ['whatever the app sends to its functions'], offDevice: true, purpose: 'Server-side code' },
  firebase_remote_config: { recipient: 'Google LLC', dataTypes: ['config fetch (pseudonymous installation ID)'], offDevice: true, purpose: 'Remote configuration' },
  firebase_core: { recipient: 'Google/Firebase', dataTypes: [], offDevice: false, purpose: 'Platform init (no data on its own)' },
  purchases_flutter: { recipient: 'RevenueCat Inc. (US)', dataTypes: ['app user ID (set by the app, or an anonymous RevenueCat ID)', 'purchase token/receipt', 'subscription status'], offDevice: true, purpose: 'In-app purchases and subscriptions', note: 'US transfer — verify DPF/SCC.' },
  google_sign_in: { recipient: 'Google LLC', dataTypes: ['Google account email/profile', 'OAuth token'], offDevice: true, purpose: 'Sign-in with Google', note: 'Pulls USE_BIOMETRIC/USE_FINGERPRINT perms transitively; no biometric data retained.' },
  sign_in_with_apple: { recipient: 'Apple Inc.', dataTypes: ['Apple ID identifier', 'name and email (or relay email) when the user shares them', 'identity token'], offDevice: true, purpose: 'Sign in with Apple' },
  google_fonts: { recipient: 'Google LLC (Google Fonts)', dataTypes: ['IP address and user agent of each font download'], offDevice: true, purpose: 'Fetches fonts over the network at run time', note: 'No request when the fonts are bundled as assets and GoogleFonts.config.allowRuntimeFetching is false.' },
  shared_preferences: { recipient: '(on-device)', dataTypes: ['whatever key-value data the app saves'], offDevice: false, purpose: 'On-device storage' },
  flutter_local_notifications: { recipient: '(on-device)', dataTypes: ['scheduled notification content'], offDevice: false, purpose: 'Local notifications' },
  flutter_timezone: { recipient: '(on-device)', dataTypes: ['device timezone (local)'], offDevice: false, purpose: 'Reads the device timezone' },
  device_info_plus: { recipient: '(on-device)', dataTypes: ['device model, maker, OS version and hardware identifiers'], offDevice: false, purpose: 'Reads device data', note: 'Sends nothing itself; any of it the app sends off the device is a flow to disclose.' },
  just_audio: { recipient: '(on-device)', dataTypes: [], offDevice: false, purpose: 'Audio playback' },
  audio_session: { recipient: '(on-device)', dataTypes: [], offDevice: false, purpose: 'Audio session config' },
};

// Packages known to be pure UI/util with no data + no network — suppressed from "unknown".
const KNOWN_BENIGN = new Set([
  'flutter', 'flutter_riverpod', 'riverpod', 'go_router', 'intl', 'flutter_localizations',
  'cupertino_icons', 'flutter_markdown', 'markdown', 'path_provider',
  'collection', 'meta', 'vector_math', 'characters', 'material_color_utilities',
  'flutter_svg', 'url_launcher', 'package_info_plus',
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
