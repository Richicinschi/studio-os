// tools/export/item-hash.mjs
// One hash per catalog item: its files' paths and bytes, in path order. changelog.mjs uses it to tell which
// items changed between releases, and scan.mjs to tie each recorded scan to the content it read. No
// imports beyond node:, so scan.mjs stays runnable on its own.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Names that never ship, wherever they sit: version control, installed packages, Python's byte-code cache
// and the folder notes macOS's Finder writes. The build leaves them out of the catalog, the export out of its
// stage, and scan.mjs out of an item's hash; scan.mjs also refuses to scan an item that holds one, so the
// scanner reads exactly what ships.
export const SKIP_NAMES = new Set(['.git', 'node_modules', '__pycache__', '.DS_Store']);
export const isSkipped = (rel) => String(rel).split(/[\\/]/).some((seg) => SKIP_NAMES.has(seg));

const LAST_SCAN = /^(- \*\*Last scan:\*\* \S+ \(risk [^)]*\)).*$/m;

// A SOURCE.md names the scanner version and date of its last scan, and the export writes the verdict and
// its triage counts into the same line. For the changelog a re-scan with the same verdict is not a change,
// so the verdict stays in the hash and the rest of the line goes. For a scan (`scanNeutral`) the whole line
// goes: it is written from the scan itself, so a new verdict must not make the item look changed.
// With `findings`, the changelog also keeps the number of findings ("; N finding(s)", "; no findings", or
// none written, which is 0), so new findings under the same verdict and score make the item a change too.
const findingCount = (line) => line.match(/; (\d+) findings?\b/)?.[1] ?? (/; not triaged yet/.test(line) ? '?' : '0');
function hashable(f, buf, scanNeutral, findings) {
  if (!f.endsWith('/SOURCE.md')) return buf;
  const text = buf.toString('utf8');
  if (scanNeutral) return Buffer.from(text.replace(/^- \*\*Last scan:\*\*.*$/m, '- **Last scan:**'));
  return Buffer.from(text.replace(LAST_SCAN, (line, kept) => (findings ? `${kept}; findings: ${findingCount(line)}` : kept)));
}

// The hash of one item: `files` are paths relative to `root`, with / between their parts.
export function hashItem(root, files, { scanNeutral = false, findings = false } = {}) {
  const h = createHash('sha256');
  for (const f of [...files].sort()) h.update(f).update('\0').update(hashable(f, readFileSync(path.join(root, f)), scanNeutral, findings)).update('\0');
  return h.digest('hex').slice(0, 16);
}
