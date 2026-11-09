// Computes the WCAG contrast ratio of two hex colours and prints AA/AAA verdicts; exits 1 if AA fails.
// Usage: node contrast.mjs <foreground> <background> [--size <px>] [--bold]

function parseHexColour(text) {
  let hex = String(text).trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(hex)) hex = [...hex].map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function channelToLinear(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]) {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Large text: at least 24 CSS px, or at least 18.66 px (14 pt) when bold.
function isLargeText(sizePx, bold) {
  return sizePx >= 24 || (bold && sizePx >= 18.66);
}

function verdict(pass) {
  return pass ? 'PASS' : 'FAIL';
}

function parseArguments(argv) {
  const colours = [];
  let size = null;
  let bold = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--size') size = Number(argv[++i]);
    else if (argv[i] === '--bold') bold = true;
    else colours.push(argv[i]);
  }
  return { colours, size, bold };
}

function main() {
  const { colours, size, bold } = parseArguments(process.argv.slice(2));
  const fg = colours[0] && parseHexColour(colours[0]);
  const bg = colours[1] && parseHexColour(colours[1]);
  if (!fg || !bg || (size !== null && !(size > 0))) {
    console.error('Usage: node contrast.mjs <fg hex> <bg hex> [--size <px>] [--bold]');
    process.exit(2);
  }
  const ratio = contrastRatio(fg, bg);
  const shown = (Math.floor(ratio * 100) / 100).toFixed(2); // floor: never round a near-miss up
  console.log(`Contrast ratio: ${shown}:1  (${colours[0]} on ${colours[1]})`);
  console.log(`Normal text   AA (4.5)  ${verdict(ratio >= 4.5)}   AAA (7)    ${verdict(ratio >= 7)}`);
  console.log(`Large text    AA (3)    ${verdict(ratio >= 3)}   AAA (4.5)  ${verdict(ratio >= 4.5)}`);
  console.log(`UI component / graphic  AA (3)  ${verdict(ratio >= 3)}`);
  let aaPass = ratio >= 4.5;
  if (size !== null) {
    const large = isLargeText(size, bold);
    aaPass = ratio >= (large ? 3 : 4.5);
    console.log(`Your text (${size}px${bold ? ', bold' : ''}) counts as ${large ? 'large' : 'normal'}: AA ${verdict(aaPass)}`);
  }
  process.exit(aaPass ? 0 : 1);
}

main();
