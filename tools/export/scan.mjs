// tools/export/scan.mjs
// Runs SkillSpector (static, --no-llm, no cost) over every shipped and kit-only skill and records the
// verdicts in tools/export/scans.json; build.mjs writes them into each SOURCE.md.
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

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const file = path.join(root, 'tools/export/scans.json');
  const scans = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const version = (spawnSync('skillspector', ['--version'], { encoding: 'utf8' }).stdout || '').trim().split(/\s+/).pop() || '';
  const today = new Date().toISOString().slice(0, 10);
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'kit-scan-'));
  let failed = 0;
  for (const base of ['catalog/skills', '.claude/skills']) {
    const dir = path.join(root, base);
    if (!existsSync(dir)) continue;
    for (const id of readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
      const out = path.join(tmp, `${id}.json`);
      const r = spawnSync('skillspector', ['scan', path.join(dir, id), '--no-llm', '--format', 'json', '--output', out], { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
      if (!existsSync(out)) { console.error(`${base}/${id}: scan failed (exit ${r.status}) ${(r.stderr || '').slice(-300)}`); failed++; continue; }
      const v = verdictFrom(JSON.parse(readFileSync(out, 'utf8')));
      if (v.score === undefined || v.recommendation === undefined) { console.error(`${base}/${id}: report has no score/recommendation key; read ${out} and adjust verdictFrom`); failed++; continue; }
      scans[id] = { ...v, version, date: today };
      console.log(`${base}/${id}: ${v.recommendation} (${v.score}/100)`);
    }
  }
  writeFileSync(file, `${JSON.stringify(scans, null, 2)}\n`);
  if (!failed) rmSync(tmp, { recursive: true, force: true });
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
