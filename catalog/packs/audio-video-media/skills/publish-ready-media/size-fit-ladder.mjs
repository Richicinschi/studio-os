// Prints the ordered list of GIF size-reduction steps, with estimated settings, as JSON.
import { pathToFileURL } from 'node:url';

const LOSSY_LEVELS = [80, 120, 180];
const COLOUR_COUNTS = [192, 128, 64];
const SCALE_STEP = 0.8;
const WIDTH_FLOOR = 160;
const FPS_STEPS = [10, 8, 5];
// Rough guesses of how much each step shrinks a file. Real results vary; always re-measure.
const LOSSY_FACTOR = { 80: 0.8, 120: 0.7, 180: 0.6 };
const COLOUR_FACTOR = { 256: 1, 192: 0.9, 128: 0.8, 64: 0.65 };

export function buildSizeFitLadder({ originalBytes, targetBytes, width, fps }) {
  for (const [k, v] of Object.entries({ originalBytes, targetBytes, width, fps })) {
    if (!Number.isFinite(v) || v <= 0) throw new Error(`${k} must be a positive number`);
  }
  if (originalBytes <= targetBytes) {
    return { alreadyFits: true, originalBytes, targetBytes, rungs: [] };
  }
  const rungs = [];
  let size = originalBytes;
  let curWidth = width;
  let curFps = fps;
  const addRung = (kind, label, settings, factor) => {
    size *= factor;
    rungs.push({
      order: rungs.length + 1, kind, label, settings,
      estimatedBytes: Math.round(size), fitsTarget: size <= targetBytes,
    });
  };
  let prevLossy = 0;
  for (const l of LOSSY_LEVELS) {
    addRung('lossy', `lossy compression level ${l}`, { lossy: l }, LOSSY_FACTOR[l] / (prevLossy ? LOSSY_FACTOR[prevLossy] : 1));
    prevLossy = l;
  }
  let prevColours = 256;
  for (const c of COLOUR_COUNTS) {
    addRung('colours', `${c} colours`, { colours: c }, COLOUR_FACTOR[c] / COLOUR_FACTOR[prevColours]);
    prevColours = c;
  }
  while (Math.round(curWidth * SCALE_STEP) >= WIDTH_FLOOR) {
    const next = Math.round(curWidth * SCALE_STEP);
    addRung('scale', `scale to ${next} px wide`, { width: next }, (next / curWidth) ** 2);
    curWidth = next;
  }
  for (const f of FPS_STEPS) {
    if (f >= curFps) continue;
    addRung('fps', `${f} frames per second`, { fps: f }, f / curFps);
    curFps = f;
  }
  const firstFit = rungs.find((r) => r.fitsTarget);
  return {
    alreadyFits: false, originalBytes, targetBytes,
    firstRungThatFits: firstFit ? firstFit.order : null,
    note: 'Estimates are rough. Apply one rung at a time, measure the real file, stop the moment it fits.',
    rungs,
  };
}

function runCli(argv) {
  if (argv.length !== 4) {
    console.error('usage: node size-fit-ladder.mjs <originalBytes> <targetBytes> <width> <fps>');
    process.exit(2);
  }
  const [originalBytes, targetBytes, width, fps] = argv.map(Number);
  try {
    console.log(JSON.stringify(buildSizeFitLadder({ originalBytes, targetBytes, width, fps }), null, 2));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) runCli(process.argv.slice(2));
