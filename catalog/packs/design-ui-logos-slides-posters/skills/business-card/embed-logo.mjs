// Puts a logo file into a card side as a data URI, in place of the placeholder href="data:logo".
// Usage: node embed-logo.mjs <side.svg> <logo.png|.jpg|.jpeg|.svg>
// Every href or xlink:href whose whole value is data:logo becomes data:<type>;base64,<the logo file>, the type
// taken from the logo's extension (image/png, image/jpeg or image/svg+xml). The rest of the side is unchanged.
// Exit codes: 0 written, 1 the side holds no placeholder, 2 a usage or file error.
// Offline: reads the two files named on the command line and writes only the side named first.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const USAGE = 'usage: node embed-logo.mjs <side.svg> <logo.png|.jpg|.jpeg|.svg>';
const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };
// href="data:logo" or xlink:href='data:logo', with any spaces round the "=".
const PLACEHOLDER = /(\bhref\s*=\s*)(["'])data:logo\2/g;

function fail(message, code) {
  process.stderr.write(message + '\n');
  process.exitCode = code;
}

function main(argv) {
  if (argv.length !== 2) return fail(USAGE, 2);
  const [side, logo] = argv;
  const type = TYPES[path.extname(logo).toLowerCase()];
  if (!type) return fail('the logo must be a .png, .jpg, .jpeg or .svg file: ' + logo + '\n' + USAGE, 2);

  let svg, data;
  try {
    svg = readFileSync(side, 'utf8');
  } catch (err) {
    return fail('cannot read ' + side + ': ' + (err.code ?? err.message), 2);
  }
  try {
    data = readFileSync(logo).toString('base64');
  } catch (err) {
    return fail('cannot read ' + logo + ': ' + (err.code ?? err.message), 2);
  }

  let count = 0;
  const out = svg.replace(PLACEHOLDER, (whole, attr, quote) => {
    count++;
    return attr + quote + 'data:' + type + ';base64,' + data + quote;
  });
  if (!count) return fail('no href="data:logo" placeholder in ' + side, 1);

  try {
    writeFileSync(side, out, 'utf8');
  } catch (err) {
    return fail('cannot write ' + side + ': ' + (err.code ?? err.message), 2);
  }
  process.stdout.write(side + ': ' + count + (count === 1 ? ' logo' : ' logos') + ' embedded as ' + type + '\n');
}

try {
  main(process.argv.slice(2));
} catch (err) {
  fail('embed-logo: ' + String(err?.message ?? err).split('\n')[0], 2);
}
