#!/usr/bin/env node
// scan_android_manifest.mjs — Android permission / AD_ID surface from the manifest.
//
// WHY: SDKs auto-merge permissions (notably the AD_ID advertising-id permission
// pulled in by firebase_analytics) into the MERGED manifest even when the app
// claims "no advertising ID". This greps the merged manifest (preferred) or the
// source manifest, classifies permissions, and reports whether AD_ID is present
// or has been stripped via tools:node="remove", and whether Firebase's
// google_analytics_adid_collection_enabled meta-data is set to false — to
// reconcile against the Play Data Safety "no advertising ID" answer and Privacy
// Policy §4. When Firebase Analytics ships (its measurement components in the
// manifest, or firebase_analytics in pubspec.yaml / the app's Gradle file), only
// both controls together support "no advertising ID" (sdk-data-map.md §3);
// without Firebase Analytics the flag is not applicable.
//
// Usage:  node scan_android_manifest.mjs [appDir]   (a Flutter project root, or a native Android project root)
// No external dependencies.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

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
  // Flutter's build path first; the native Android path only when Flutter's has none.
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
  return candidates[0]?.path || findNativeMergedManifest();
}

// A native Android project (appDir = the Gradle root, app module in app/) builds into app/build/;
// Flutter moves its build to build/app/. The Android Gradle plugin writes an intermediate artifact to
// build/intermediates/<artifact>/<variant>/<task name>/ (ArtifactsImpl.kt in AGP's gradle-core,
// android.googlesource.com platform/tools/base, adds the task name as the last folder). So the merged
// manifest is merged_manifest/<variant>/process<Variant>MainManifest/AndroidManifest.xml, the folder
// Flutter's path above uses too, and the multi-APK copy merged_manifests/<variant>/process<Variant>Manifest/.
// Older AGP releases wrote no task folder: merged_manifests/<variant>/AndroidManifest.xml (the path the
// Android build guides give) or merged_manifest/<variant>/AndroidManifest.xml. All four are searched.
function findNativeMergedManifest() {
  const intermediates = join(appDir, 'app', 'build', 'intermediates');
  const layouts = [['merged_manifest', /^process.*MainManifest$/i], ['merged_manifests', /^process.*Manifest$/i]];
  const candidates = [];
  for (const [artifact, taskFolder] of layouts) {
    for (const variant of ['release', 'debug', 'profile']) {
      const vdir = join(intermediates, artifact, variant);
      if (!existsSync(vdir)) continue;
      const files = [join(vdir, 'AndroidManifest.xml')];
      for (const sub of readdirSync(vdir)) if (taskFolder.test(sub)) files.push(join(vdir, sub, 'AndroidManifest.xml'));
      for (const f of files) if (existsSync(f)) candidates.push({ path: f, variant, mtime: statSync(f).mtimeMs });
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

// Flutter keeps the Android project in android/; a native project is the Android project itself, with
// the app module in app/. Each file is read from Flutter's place when it is there, else from the native
// place. A check whose file is in neither place is listed in notChecked, never reported as a pass.
const notChecked = [];
const shown = (p) => relative(appDir, p).split('\\').join('/');
const firstExisting = (paths) => paths.find((p) => existsSync(p)) || null;
const SOURCE_PLACES = [join(appDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), join(appDir, 'app', 'src', 'main', 'AndroidManifest.xml')];
const GRADLE_PLACES = [join(appDir, 'android', 'app'), join(appDir, 'app')].flatMap((dir) => ['build.gradle.kts', 'build.gradle'].map((f) => join(dir, f)));
const source = firstExisting(SOURCE_PLACES);
const gradle = firstExisting(GRADLE_PLACES);
const gradleText = gradle ? readFileSync(gradle, 'utf8') : null;
const GRADLE_LOOKED = 'android/app/build.gradle(.kts) or app/build.gradle(.kts)';

function readTargetSdk() {
  if (gradleText === null) {
    notChecked.push(`targetSdk: no app Gradle file (looked for ${GRADLE_LOOKED})`);
    return null;
  }
  const m = gradleText.match(/targetSdk(?:Version)?\s*[=( ]\s*(\d+)/);
  if (m) return Number(m[1]);
  if (/targetSdk(?:Version)?\s*[=( ]\s*flutter\.targetSdkVersion/.test(gradleText)) return 'flutter.targetSdkVersion (Flutter default)';
  notChecked.push(`targetSdk: ${shown(gradle)} sets no literal targetSdk / targetSdkVersion (read it from the value it names)`);
  return null;
}

const merged = findMergedManifest();
const manifestPath = merged || source;

if (!manifestPath) {
  console.log(JSON.stringify({ error: 'No AndroidManifest found (build the app to produce a merged manifest).', appDir }, null, 2));
  process.exit(0);
}

const text = readFileSync(manifestPath, 'utf8');
const perms = permsFromManifest(text);
// Also scan the SOURCE manifest for tools:node="remove" strips (the merged one drops removed perms entirely).
let sourceStrips = [];
let stripChecked = true;
if (source && source !== manifestPath) {
  sourceStrips = permsFromManifest(readFileSync(source, 'utf8')).filter((p) => p.stripped).map((p) => p.name);
} else if (!source) {
  stripChecked = false;
  notChecked.push('AD_ID strip (tools:node="remove"): no source manifest (looked for android/app/src/main/AndroidManifest.xml or app/src/main/AndroidManifest.xml)');
}

const adIdName = 'com.google.android.gms.permission.AD_ID';
const adIdInMerged = perms.find((p) => p.name === adIdName);
const adIdStripped = sourceStrips.includes(adIdName) || (adIdInMerged?.stripped ?? false);
const adIdPresent = !!adIdInMerged && !adIdInMerged.stripped;
// SDKs such as Firebase Analytics add AD_ID only when the manifests merge, so the source manifest
// cannot show its absence. With no merged manifest and no strip in the source, AD_ID is unknown.
// (An AD_ID the source lists itself, unstripped, is in the merged manifest too: that stays a finding.)
const adIdUnknown = !merged && !adIdStripped && !adIdPresent;
if (adIdUnknown) notChecked.push('AD_ID in the merged manifest: no merged manifest (build the app and re-run)');

// Firebase's documented switch: <meta-data android:name="google_analytics_adid_collection_enabled"
// android:value="false"/>, read from the manifest used (the merged one when it exists, as that ships).
function adidFlagValue(t) {
  for (const m of t.matchAll(/<meta-data\b[^>]*>/g)) {
    const tag = m[0];
    if (!/android:name\s*=\s*"google_analytics_adid_collection_enabled"/.test(tag)) continue;
    const v = tag.match(/android:value\s*=\s*"([^"]*)"/);
    return v ? v[1] : null;
  }
  return null;
}
const adidFlag = adidFlagValue(text);
const adidCollectionDisabled = adidFlag !== null && adidFlag.trim().toLowerCase() === 'false';

// The flag is required only when Firebase Analytics ships. Signs: its measurement components
// (com.google.android.gms.measurement.*) in the manifest used, or firebase_analytics /
// firebase-analytics / play-services-measurement in pubspec.yaml or the app's Gradle file
// (firebase.analytics too: a version catalog alias such as libs.firebase.analytics).
// With no merged manifest, no pubspec.yaml and no Gradle file, it is not checked.
const pubspec = join(appDir, 'pubspec.yaml');
function firebaseAnalyticsEvidence() {
  const ev = [];
  if (/com\.google\.android\.gms\.measurement\./.test(text)) ev.push(`${merged ? 'merged' : 'source'} manifest: com.google.android.gms.measurement components`);
  if (existsSync(pubspec) && /^\s+firebase_analytics\s*:/m.test(readFileSync(pubspec, 'utf8'))) ev.push('pubspec.yaml: firebase_analytics');
  if (gradleText !== null && /firebase[.-]analytics|play-services-measurement/.test(gradleText)) ev.push(`${shown(gradle)}: firebase-analytics / play-services-measurement`);
  return ev;
}
const firebaseEvidence = firebaseAnalyticsEvidence();
const firebaseChecked = firebaseEvidence.length > 0 || !!merged || existsSync(pubspec) || gradleText !== null;
if (!firebaseChecked) notChecked.push(`Firebase Analytics: no merged manifest, no pubspec.yaml and no app Gradle file (looked for ${GRADLE_LOOKED})`);
const firebaseAnalytics = firebaseChecked ? firebaseEvidence.length > 0 : null;
const consistent = adIdPresent ? false : adIdUnknown || firebaseAnalytics === null ? null : !firebaseAnalytics || adidCollectionDisabled;
const FLAG = 'google_analytics_adid_collection_enabled=false';
const adIdState = adIdStripped ? 'AD_ID stripped via tools:node="remove"' : 'AD_ID not present';
let verdict;
if (adIdPresent) verdict = 'AD_ID PRESENT in merged manifest — reconcile with Data Safety / Privacy §4 or strip it' + (firebaseAnalytics ? ', and set ' + FLAG : '') + '.';
else if (adIdUnknown) verdict = 'AD_ID NOT checked: there is no merged manifest, and the source manifest does not strip AD_ID (SDKs such as Firebase Analytics add it at merge), so "no advertising ID" is not confirmed' + (adidCollectionDisabled ? ' (' + FLAG + ' is set in the source manifest)' : '') + ': build the app and re-run, or strip AD_ID with tools:node="remove".';
else if (consistent === null) verdict = adIdState + ', but whether Firebase Analytics ships was NOT checked (see notChecked), so "no advertising ID" is not confirmed: build the app and re-run.';
else if (consistent && !firebaseAnalytics) verdict = adIdState + '; Firebase Analytics not detected, so ' + FLAG + ' is not applicable — consistent with "no advertising ID".';
else if (consistent) verdict = adIdState + ' and ' + FLAG + ' set — both controls present; consistent with "no advertising ID".';
else verdict = adIdState + ', but ' + FLAG + ' is ' + (adidFlag === null ? 'missing' : `"${adidFlag}"`) + ' in the ' + (merged ? 'merged' : 'source') + ' manifest while Firebase Analytics ships — NOT yet consistent with "no advertising ID": set the flag too (sdk-data-map.md §3).';

const out = {
  appDir,
  manifestUsed: manifestPath,
  isMerged: !!merged,
  sourceManifest: source,
  gradleFile: gradle,
  targetSdk: readTargetSdk(),
  permissions: perms.map((p) => ({
    name: p.name,
    stripped: p.stripped,
    note: SENSITIVE[p.name] || null,
  })),
  sensitivePermissions: perms.filter((p) => SENSITIVE[p.name]).map((p) => p.name),
  advertisingId: {
    presentInMerged: adIdUnknown ? null : adIdPresent,
    strippedInSource: stripChecked ? adIdStripped : null,
    firebaseAnalytics,
    firebaseAnalyticsEvidence: firebaseEvidence,
    adidCollectionFlag: adidFlag,
    adidCollectionDisabled,
    consistentWithNoAdvertisingId: consistent,
    verdict,
  },
  notChecked,
  reconcile: 'Compare sensitivePermissions against Play Data Safety declarations and Privacy §4 "what we do not collect". Any sensitive perm with no Data Safety coverage is a finding. Each notChecked line is a check still to do, not a pass.',
};
console.log(JSON.stringify(out, null, 2));
