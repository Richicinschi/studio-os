#!/usr/bin/env node
// run_exodus.mjs — wrapper around Exodus Privacy's exodus-standalone tracker scanner.
//
// WHY: Exodus statically detects ad/analytics TRACKERS and permissions baked
// into a built APK — the off-device truth that complements the source scan.
// This wrapper RUNS it when Docker + an APK are available, and otherwise
// DEGRADES GRACEFULLY with setup instructions (never crashes the sign-off).
//
// Usage:  node run_exodus.mjs --apk <path-to.apk>
//         (no --apk: prints how to produce one + skips)
// Requires: Docker with image `exodusprivacy/exodus-standalone` (auto-pulled on first run).

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';

const args = process.argv.slice(2);
const apkIdx = args.indexOf('--apk');
const apk = apkIdx >= 0 ? resolve(args[apkIdx + 1]) : null;

function have(cmd) {
  try { execSync(cmd, { stdio: 'ignore' }); return true; } catch { return false; }
}

const dockerOk = have('docker --version');
const result = { tool: 'exodus-standalone', available: dockerOk, ran: false };

if (!dockerOk) {
  result.skipped = true;
  result.reason = 'Docker not found on PATH.';
  result.howToInstall = 'Install Docker Desktop, then: docker pull exodusprivacy/exodus-standalone';
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (!apk || !existsSync(apk)) {
  result.skipped = true;
  result.reason = apk ? `APK not found: ${apk}` : 'No --apk provided.';
  result.howToBuild = 'flutter build apk --release --dart-define-from-file=.env  (output: build/app/outputs/flutter-apk/app-release.apk)';
  result.thenRun = 'node run_exodus.mjs --apk build/app/outputs/flutter-apk/app-release.apk';
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

try {
  // exodus-standalone reads the APK mounted into the container and prints a report.
  const dir = dirname(apk).replace(/\\/g, '/');
  const file = basename(apk);
  const raw = execSync(
    `docker run --rm -v "${dir}":/data exodusprivacy/exodus-standalone -j /data/${file}`,
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
  );
  let report;
  try { report = JSON.parse(raw); } catch { report = { rawOutput: raw.slice(0, 20000) }; }
  result.ran = true;
  result.trackers = (report.trackers || []).map((t) => t.name || t);
  result.permissions = report.permissions || report.application?.permissions || [];
  result.summary = `Detected ${result.trackers.length} tracker signature(s). Reconcile against Privacy §4 ("no ads / no advertising ID") — any advertising/analytics tracker not disclosed is a finding.`;
  result.report = report;
} catch (e) {
  result.skipped = true;
  result.ran = false;
  result.reason = `Exodus run failed: ${String(e.message).slice(0, 300)}`;
  result.hint = 'First run pulls the image (needs network). Ensure Docker Desktop is running.';
}
console.log(JSON.stringify(result, null, 2));
