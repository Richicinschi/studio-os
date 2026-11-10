// tools/export/scan.mjs
// Runs SkillSpector (static, --no-llm, no cost) over every shipped and kit-only skill and every domain, and
// records the verdicts in tools/export/scans.json; build.mjs writes them into each SOURCE.md.
//   node tools/export/scan.mjs
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function findKey(obj, re) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const [k, v] of Object.entries(obj)) if (re.test(k) && (typeof v !== 'object' || v === null)) return v;
  for (const v of Object.values(obj)) {
    const hit = findKey(v, re);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

export const verdictFrom = (json) => ({ score: findKey(json, /^(risk_?score|score)$/i), recommendation: findKey(json, /^recommendation$/i) });

// The number of findings in a report: its issues list. The triage gate holds the triage to it, because a
// rescan can change the findings and keep the verdict and the score (many items sit at the 100/100 cap).
export const findingsFrom = (json) => (Array.isArray(json && json.issues) ? json.issues.length : undefined);

// The anchor GitHub gives a heading: lower case, punctuation dropped, each space a hyphen.
export const triageAnchor = (heading) => heading.toLowerCase().replace(/[^\p{L}\p{M}\p{N} _-]/gu, '').replace(/ /g, '-');

// scan-triage.md holds one `### <key>: VERDICT, N/100, K findings` section per item the scanner did not rate
// SAFE, with tables whose Verdict column says FP or BY DESIGN; a Finding cell with "(k rows)" counts k times.
// Returns { key: { recommendation, score, findings, fp, byDesign, other, anchor } }; `other` counts any
// other verdict, a REAL one included. A key with a second section is marked `duplicate` (the first section
// counts), and the triage gate fails it.
export function parseTriage(text) {
  const out = {};
  let cur = null;
  let cols = null;
  for (const line of text.split(/\r?\n/)) {
    if (/^#{1,3} /.test(line)) {
      const h = line.replace(/^#+ /, '').trim();
      const m = h.match(/^(.+?): ([A-Z_]+), (\d+)\/100, (\d+) findings?$/);
      cols = null;
      cur = null;
      if (!m) continue;
      if (out[m[1]]) { out[m[1]].duplicate = true; continue; }
      cur = out[m[1]] = { recommendation: m[2], score: Number(m[3]), findings: Number(m[4]), fp: 0, byDesign: 0, other: 0, anchor: triageAnchor(h) };
      continue;
    }
    if (!cur || !line.startsWith('|')) { cols = line.startsWith('|') ? cols : null; continue; }
    const cells = line.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
    if (!cols) { cols = { finding: cells.indexOf('Finding'), verdict: cells.indexOf('Verdict') }; continue; }
    if (cols.verdict < 0 || cells.every((c) => /^:?-+:?$/.test(c))) continue;
    const n = Number(((cells[cols.finding] || '').match(/\((\d+) rows\)/) || [])[1] || 1);
    const v = cells[cols.verdict];
    if (v === 'FP') cur.fp += n; else if (v === 'BY DESIGN') cur.byDesign += n; else cur.other += n;
  }
  return out;
}

// What the scan covers: every shipped skill, every kit skill, and every domain (a shipped pack), the domain
// as one folder under the key `pack:<id>`.
export function scanTargets(root) {
  const bases = [['catalog/skills', (id) => id], ['.claude/skills', (id) => id], ['catalog/packs', (id) => `pack:${id}`]];
  return bases.flatMap(([base, key]) => {
    const dir = path.join(root, base);
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
      .map((id) => ({ key: key(id), dir: path.join(dir, id), label: `${base}/${id}` }));
  });
}

// The report file for a scan key. No id holds "@", so a domain `pack:foo` and a skill `pack-foo` never share one.
export const reportFile = (key) => `${key.replace(':', '@')}.json`;

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const file = path.join(root, 'tools/export/scans.json');
  const scans = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const version = (spawnSync('skillspector', ['--version'], { encoding: 'utf8' }).stdout || '').trim().split(/\s+/).pop() || '';
  const today = new Date().toISOString().slice(0, 10);
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'kit-scan-'));
  let failed = 0;
  for (const { key, dir, label } of scanTargets(root)) {
    const out = path.join(tmp, reportFile(key));
    const r = spawnSync('skillspector', ['scan', dir, '--no-llm', '--format', 'json', '--output', out], { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
    if (!existsSync(out)) { console.error(`${label}: scan failed (exit ${r.status}) ${(r.stderr || '').slice(-300)}`); failed++; continue; }
    const report = JSON.parse(readFileSync(out, 'utf8'));
    const v = verdictFrom(report);
    const findings = findingsFrom(report);
    if (v.score === undefined || v.recommendation === undefined || findings === undefined) { console.error(`${label}: report has no score, recommendation or issues list; read ${out} and adjust verdictFrom or findingsFrom`); failed++; continue; }
    scans[key] = { ...v, findings, version, date: today };
    console.log(`${label}: ${v.recommendation} (${v.score}/100), ${findings} finding(s)`);
  }
  writeFileSync(file, `${JSON.stringify(scans, null, 2)}\n`);
  if (!failed) rmSync(tmp, { recursive: true, force: true });
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
