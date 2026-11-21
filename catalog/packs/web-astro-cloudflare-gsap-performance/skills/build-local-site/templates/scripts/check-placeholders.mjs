#!/usr/bin/env node
// Refuses the build while any template placeholder is left in src/ or public/.
//
// The templates ship with upper-case tokens in double underscores where a
// fact about the business goes (its name, phone, licence, rating, hours, form
// endpoint). Some of them stand where the sample site used to make a claim,
// such as a rating badge or round-the-clock service. A site built with one of
// them left in would publish the token, or, if someone "fixes" it by typing a
// plausible value, a claim nobody checked. So `npm run build` runs this first
// (the "prebuild" script) and stops until each one is filled in or its line is
// deleted.
//
// Scans every file under src/ except *.template files, which Astro does not
// build, and every text file under public/, which Astro copies to the site as
// it is (robots.txt ships with __SITE_URL__). Binary files, such as images and
// fonts, are skipped. Prints `file:line: <TOKEN> is not filled in` for each
// one and exits 1 if it found any. Run it by hand with:
// node scripts/check-placeholders.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const PLACEHOLDER = /__[A-Z][A-Z0-9_]*__/g;
const root = process.cwd();
const src = join(root, 'src');
const pub = join(root, 'public');
// Files skipped by type; any other file holding a NUL byte is skipped too.
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|bmp|tiff?|woff2?|ttf|otf|eot|pdf|zip|gz|br|mp3|mp4|webm|ogg|wav)$/i;

if (!existsSync(src)) {
  console.error(`check-placeholders: no src/ folder in ${root}; run it from the project root.`);
  process.exit(1);
}

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (entry.isFile() && !entry.name.endsWith('.template') && !BINARY.test(entry.name)) yield path;
  }
}

let found = 0;
const scanned = [...files(src), ...(existsSync(pub) ? files(pub) : [])];
for (const path of scanned) {
  const buf = readFileSync(path);
  if (buf.includes(0)) continue; // binary, such as an image
  const name = relative(root, path).split(sep).join('/');
  buf
    .toString('utf8')
    .split(/\r?\n/)
    .forEach((line, i) => {
      for (const [token] of line.matchAll(PLACEHOLDER)) {
        console.error(`${name}:${i + 1}: ${token} is not filled in`);
        found++;
      }
    });
}

if (found > 0) {
  console.error(
    `\n${found} placeholder(s) left. Replace each with a fact the business can prove, ` +
      'or delete the line or element it sits in. The build will not run until none are left.',
  );
  process.exit(1);
}
