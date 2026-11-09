// Measures integrated loudness, true peak and loudness range of a media file with ffmpeg and prints a verdict per check.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const DEFAULTS = { target: -16, tolerance: 2, maxPeak: -1, maxLra: 15 };

// Pulls the JSON block that ffmpeg's loudnorm filter prints at the end of its log.
export function parseLoudnormOutput(text) {
  const start = text.lastIndexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  let raw;
  try { raw = JSON.parse(text.slice(start, end + 1)); } catch { return null; }
  const integratedLufs = Number(raw.input_i);
  const truePeakDbtp = Number(raw.input_tp);
  const loudnessRangeLu = Number(raw.input_lra);
  if (![integratedLufs, truePeakDbtp, loudnessRangeLu].every(Number.isFinite)) return null;
  return { integratedLufs, truePeakDbtp, loudnessRangeLu };
}

// Turns three readings into four-state checks: flagged, clear, info or not_run.
export function judgeReadings(readings, limits = DEFAULTS) {
  if (!readings) {
    return ["integrated_loudness", "true_peak", "loudness_range"].map((name) => ({ name, state: "not_run" }));
  }
  const off = Math.abs(readings.integratedLufs - limits.target);
  return [
    { name: "integrated_loudness", state: off > limits.tolerance ? "flagged" : "clear",
      note: `${readings.integratedLufs} LUFS vs target ${limits.target} +/- ${limits.tolerance}` },
    { name: "true_peak", state: readings.truePeakDbtp > limits.maxPeak ? "flagged" : "clear",
      note: `${readings.truePeakDbtp} dBTP vs ceiling ${limits.maxPeak}` },
    { name: "loudness_range", state: readings.loudnessRangeLu > limits.maxLra ? "flagged" : "info",
      note: `${readings.loudnessRangeLu} LU vs limit ${limits.maxLra}` },
  ];
}

// Maps the checks to an exit code: 0 clear, 1 flagged, 2 could not run.
export function exitCodeFor(checks) {
  if (checks.some((c) => c.state === "not_run")) return 2;
  return checks.some((c) => c.state === "flagged") ? 1 : 0;
}

// Runs ffmpeg through the argument-array form (no shell) and returns its log text, or null if it cannot run.
export function runLoudnormPass(file) {
  const args = ["-hide_banner", "-nostats", "-i", file, "-vn", "-af", "loudnorm=print_format=json", "-f", "null", "-"];
  const run = spawnSync("ffmpeg", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (run.error || typeof run.stderr !== "string" || !run.stderr.includes("{")) return null;
  return run.stderr;
}

// Reads --target, --tolerance, --max-peak and --max-lra from the argument list.
export function readOptions(argv) {
  const limits = { ...DEFAULTS };
  const names = { "--target": "target", "--tolerance": "tolerance", "--max-peak": "maxPeak", "--max-lra": "maxLra" };
  const files = [];
  for (let i = 0; i < argv.length; i++) {
    if (names[argv[i]]) limits[names[argv[i]]] = Number(argv[++i]);
    else files.push(argv[i]);
  }
  return { file: files[0], limits };
}

function main() {
  const { file, limits } = readOptions(process.argv.slice(2));
  if (!file || Object.values(limits).some((v) => !Number.isFinite(v))) {
    console.error("usage: node loudness-report.mjs <file> [--target -16] [--tolerance 2] [--max-peak -1] [--max-lra 15]");
    process.exit(2);
  }
  const log = runLoudnormPass(file);
  const readings = log ? parseLoudnormOutput(log) : null;
  const checks = judgeReadings(readings, limits);
  console.log(JSON.stringify({ file, limits, readings, checks }, null, 2));
  process.exit(exitCodeFor(checks));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
