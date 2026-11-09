// Checks an HTML file for patterns that break when pasted into email tools or CMS editors; exits 1 on any error.
import { readFileSync } from 'node:fs';

function parseArguments(argv) {
  const file = argv.find((a) => !a.startsWith('--'));
  const targetArg = argv.find((a) => a.startsWith('--target='));
  const target = targetArg ? targetArg.slice(9) : 'email';
  return { file, target };
}

function findTags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => m[0]);
}

function readAttribute(tag, attr) {
  const m = tag.match(new RegExp(`\\s${attr}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]) : null;
}

function lineOf(html, snippet) {
  const index = html.indexOf(snippet);
  return index < 0 ? 0 : html.slice(0, index).split('\n').length;
}

function collectErrors(html, target) {
  const errors = [];
  const add = (snippet, message) => errors.push(`line ${lineOf(html, snippet)}: ${message}`);

  for (const tag of findTags(html, 'script')) add(tag, 'script tag is removed or blocked');
  for (const tag of findTags(html, 'link')) {
    if (/rel\s*=\s*["']?stylesheet/i.test(tag)) add(tag, 'external stylesheet link is dropped');
  }
  if (target === 'email') {
    for (const tag of findTags(html, 'style')) add(tag, 'style block is stripped by many email clients; inline the styles');
    const styleValues = [...html.matchAll(/style\s*=\s*"([^"]*)"|style\s*=\s*'([^']*)'/gi)].map((m) => m[1] ?? m[2]);
    for (const value of styleValues) {
      if (/position\s*:/i.test(value)) add(value, 'position is not supported in email');
      if (/display\s*:\s*(inline-)?(flex|grid)|flex-|grid-/i.test(value)) add(value, 'flex or grid is not supported in email; use a table');
    }
  }
  for (const tag of findTags(html, 'img')) {
    const alt = readAttribute(tag, 'alt');
    if (alt === null || alt.trim() === '') add(tag, 'image has no alt text');
    const src = readAttribute(tag, 'src') ?? '';
    if (!/^(https?:\/\/|data:)/i.test(src)) add(tag, `image path "${src}" is not an absolute hosted address`);
  }
  for (const tag of findTags(html, 'p')) {
    if (!readAttribute(tag, 'style')) add(tag, 'paragraph has no inline style');
  }
  return errors;
}

const { file, target } = parseArguments(process.argv.slice(2));
if (!file || !['email', 'cms'].includes(target)) {
  console.error('usage: node check-pasteable-html.mjs <file.html> [--target=email|cms]');
  process.exit(2);
}
const errors = collectErrors(readFileSync(file, 'utf8'), target);
if (errors.length) {
  for (const e of errors) console.log(`ERROR ${e}`);
  console.log(`${errors.length} error(s) for target ${target}`);
  process.exit(1);
}
console.log(`OK: no banned patterns for target ${target}`);
