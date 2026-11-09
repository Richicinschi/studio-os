#!/usr/bin/env node
// run_mobsf.mjs — wrapper around MobSF (Mobile Security Framework) static analysis.
//
// WHY: MobSF statically analyses an APK *or* IPA and reports SDKs, permissions,
// trackers, hardcoded secrets, and network domains — cross-platform code-faithful
// evidence (Exodus is Android-only). This drives MobSF's REST API when a server
// is reachable, and DEGRADES GRACEFULLY otherwise.
//
// Usage:  node run_mobsf.mjs --file <path-to.apk|.ipa>
// Env:    MOBSF_URL (default http://localhost:8000), MOBSF_API_KEY (required to scan)
// Server: docker run -it -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest
//         (API key is printed in the container logs / Settings page)

import { existsSync, readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const args = process.argv.slice(2);
const fileIdx = args.indexOf('--file');
const file = fileIdx >= 0 ? resolve(args[fileIdx + 1]) : null;
const MOBSF_URL = (process.env.MOBSF_URL || 'http://localhost:8000').replace(/\/$/, '');
const API_KEY = process.env.MOBSF_API_KEY || '';

const result = { tool: 'MobSF', url: MOBSF_URL, ran: false };

async function reachable() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(`${MOBSF_URL}/`, { signal: ctrl.signal });
    clearTimeout(t);
    return r.ok || r.status === 200 || r.status === 302;
  } catch { return false; }
}

async function main() {
  if (!(await reachable())) {
    Object.assign(result, {
      skipped: true,
      reason: `MobSF server not reachable at ${MOBSF_URL}.`,
      howToStart: 'docker run -it -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest',
      thenSet: 'set MOBSF_API_KEY=<key from container logs/Settings>, then re-run with --file <apk|ipa>.',
    });
    return console.log(JSON.stringify(result, null, 2));
  }
  if (!API_KEY) {
    Object.assign(result, { skipped: true, reason: 'MOBSF_API_KEY not set (server is up).', hint: 'Copy the API key from the MobSF Settings page / container logs.' });
    return console.log(JSON.stringify(result, null, 2));
  }
  if (!file || !existsSync(file)) {
    Object.assign(result, { skipped: true, reason: file ? `File not found: ${file}` : 'No --file provided.', accepts: 'APK (Android) or IPA (iOS, built on macOS).' });
    return console.log(JSON.stringify(result, null, 2));
  }
  try {
    const bytes = readFileSync(file);
    const fd = new FormData();
    fd.append('file', new Blob([bytes]), basename(file));
    const up = await (await fetch(`${MOBSF_URL}/api/v1/upload`, { method: 'POST', headers: { Authorization: API_KEY }, body: fd })).json();
    const hash = up.hash;
    await fetch(`${MOBSF_URL}/api/v1/scan`, { method: 'POST', headers: { Authorization: API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ hash }) });
    const rep = await (await fetch(`${MOBSF_URL}/api/v1/report_json`, { method: 'POST', headers: { Authorization: API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ hash }) })).json();
    result.ran = true;
    result.permissions = Object.keys(rep.permissions || {});
    result.trackers = rep.trackers?.trackers?.map((t) => t.name) || [];
    result.domains = Object.keys(rep.domains || {}).slice(0, 100);
    result.summary = `MobSF: ${result.permissions.length} permissions, ${result.trackers.length} trackers, ${result.domains.length} domains. Reconcile domains/trackers against declared recipients (Privacy §6) and EU-region/transfer claims (§7).`;
  } catch (e) {
    Object.assign(result, { skipped: true, reason: `MobSF scan failed: ${String(e.message).slice(0, 300)}` });
  }
  console.log(JSON.stringify(result, null, 2));
}
main();
