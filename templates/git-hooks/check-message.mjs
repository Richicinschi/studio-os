// commit-msg check: refuse attribution trailers that name a tool or a second author.
import { readFileSync } from 'node:fs';

const TRAILER = /^(co-authored-by|generated-by|generated-with|assisted-by)\s*:/i;
// `git commit -v` puts the diff below a scissors line; the message ends there. Only git's own
// scissors line counts, in any language: right after it a comment line of text ("<c> Do not modify
// or remove the line above."), and below it nothing but comment lines, blank lines and diffs. A
// scissors line written by hand with a trailer below it is not one.
const all = readFileSync(process.argv[2], 'utf8').split(/\r?\n/);
const isScissors = (i) => {
  const c = all[i][0];
  if (!/^\S -{24} >8 -{24}$/.test(all[i]) || !(all[i + 1] ?? '').startsWith(`${c} `) || all[i + 1].trim().length < 2) return false;
  let j = i + 1;
  while (j < all.length && (all[j].startsWith(c) || all[j] === '')) j++;
  return j === all.length || all[j].startsWith('diff --git ');
};
const scissors = all.findIndex((_, i) => isScissors(i));
const lines = (scissors < 0 ? all : all.slice(0, scissors)).filter((l) => !l.startsWith('#'));
const bad = lines.slice(1).filter((l) => TRAILER.test(l.trim()) || /generated with .*claude/i.test(l));
if (bad.length) {
  console.error(`commit-msg refused: remove ${bad.map((l) => `"${l.trim()}"`).join(', ')}`);
  process.exit(1);
}
