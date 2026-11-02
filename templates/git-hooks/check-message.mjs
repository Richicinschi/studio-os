// commit-msg check: refuse attribution trailers that name a tool or a second author.
import { readFileSync } from 'node:fs';

const TRAILER = /^(co-authored-by|generated-by|generated-with|assisted-by)\s*:/i;
const lines = readFileSync(process.argv[2], 'utf8').split(/\r?\n/).filter((l) => !l.startsWith('#'));
const bad = lines.slice(1).filter((l) => TRAILER.test(l.trim()) || /generated with .*claude/i.test(l));
if (bad.length) {
  console.error(`commit-msg refused: remove ${bad.map((l) => `"${l.trim()}"`).join(', ')}`);
  process.exit(1);
}
