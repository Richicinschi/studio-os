// Pre-commit checks on the lines a commit adds: conflict markers, real private network addresses
// (made-up ones are fine in test files), secrets through gitleaks when it is installed, and the terms
// in your never-share list when you keep one.
import { execFileSync, spawnSync } from 'node:child_process';
import { closeSync, existsSync, openSync, readFileSync, readSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The text lines of a file's bytes: UTF-16 when they start with its byte-order mark, else UTF-8.
// TextDecoder drops the mark. UTF-16BE is byte-swapped to LE first: a small-icu Node has no utf-16be.
const hasBom = (b) => b.length >= 2 && ((b[0] === 0xff && b[1] === 0xfe) || (b[0] === 0xfe && b[1] === 0xff));
function textLines(buf) {
  if (!buf?.length) return [];
  let enc = 'utf-8';
  if (hasBom(buf)) {
    if (buf[0] === 0xfe) buf = Buffer.from(buf.subarray(0, buf.length - (buf.length % 2))).swap16();
    enc = 'utf-16le';
  }
  return new TextDecoder(enc).decode(buf).split(/\r?\n/);
}

// never-share.local.txt beside this script: one term per line, saved as UTF-8 (or UTF-16 with a
// byte-order mark). Keep it out of git. A line starting with "# " (or a lone #) is a comment, and so
// is " # ..." after a term; \# anywhere in a term is a literal #, as in \#proj-falcon or C \#. A term
// matches as a whole word, in any case; a refusal names the list line, never the term, and so does
// the warning for a line in another encoding.
const listFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'never-share.local.txt');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const neverShare = [];
if (existsSync(listFile)) {
  textLines(readFileSync(listFile)).forEach((raw, i) => {
    if (!raw.replace(/\0/g, '').trim()) return; // blank, or the NUL a UTF-16 line break leaves behind
    if (/[\uFFFD\0]/.test(raw)) {
      console.error(`pre-commit: line ${i + 1} of your never-share list cannot be read, so it matches nothing; save the list as UTF-8`);
      return;
    }
    const t = raw.trim();
    if (!t || /^#(\s|$)/.test(t)) return;
    const term = t.replace(/\s+#(\s.*)?$/, '').replace(/\\#/g, '#');
    if (term) neverShare.push({ line: i + 1, re: new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(term).replace(/\s+/g, '\\s+')}(?![\\p{L}\\p{N}_])`, 'iu') });
  });
}

// Git output, or null when it is over MAX_MB.
const MAX_MB = 64;
function gitOut(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: MAX_MB * 1024 * 1024 });
  } catch (e) {
    if (e.code === 'ENOBUFS') return null;
    throw e;
  }
}
const mergeHead = execFileSync('git', ['rev-parse', '--git-path', 'MERGE_HEAD'], { encoding: 'utf8' }).trim();
function tooLarge() {
  console.error(existsSync(mergeHead)
    ? `pre-commit: this merge brings in a change too large to check (over ${MAX_MB} MB), and a merge cannot be committed in parts; look over the large files yourself before you decide how to conclude it`
    : `pre-commit: the staged change is too large to check (over ${MAX_MB} MB); commit it in parts`);
  process.exit(1);
}
// The added lines of a -U0 diff, each with its file. A "+++ " line names the file only in a file's
// header, straight after its "--- " line; in a hunk it is an added line that starts with "++ ".
function added(diff) {
  const lines = [];
  let file = '';
  let header = false;
  let prev = '';
  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) { header = true; file = ''; }
    else if (line.startsWith('@@')) header = false;
    // git ends a "+++ " path with a tab when the name holds a space
    else if (header) { if (line.startsWith('+++ ') && prev.startsWith('--- ')) file = line.slice(4).replace(/\t$/, '').replace(/^"?b\//, '').replace(/"$/, ''); }
    else if (line.startsWith('+')) lines.push({ file, text: line.slice(1) });
    prev = line;
  }
  return lines;
}
const DIFF = ['diff', '--cached', '--no-color', '--no-ext-diff', '-U0'];

const own = gitOut(DIFF);
if (own === null) tooLarge();
let lines = added(own);

// A blob's bytes; null when there is none, false when it is over MAX_MB.
const blob = (spec) => {
  const r = spawnSync('git', ['cat-file', 'blob', spec], { maxBuffer: MAX_MB * 1024 * 1024 });
  if (r.error?.code === 'ENOBUFS') return false;
  return r.status === 0 ? r.stdout : null;
};

// git calls a file binary when either version has a NUL in its first 8000 bytes, so a UTF-16 text
// file (what `>` writes in Windows PowerShell 5.1), or a file that was one, has no lines in the diff.
// A staged version that starts with a UTF-16 byte-order mark, or is text (no NUL in its first 8000
// bytes), is decoded instead, and its lines missing from the version it is compared with count as added.
const binary = (gitOut(['diff', '--cached', '--numstat', '--no-renames', '-z']) ?? '').split('\0')
  .filter((e) => e.startsWith('-\t-\t')).map((e) => e.slice(4));
const wide = [];
if (binary.length) {
  // Most binary files are images and the like: read their first bytes only, and from the working
  // tree when it holds what is staged (no unstaged change), rather than start git once per file.
  const unstaged = new Set((gitOut(['diff', '--name-only', '--no-renames', '-z']) ?? '').split('\0'));
  for (const file of binary) {
    let start = null;
    if (!unstaged.has(file)) {
      try {
        const fd = openSync(file, 'r');
        try {
          const b = Buffer.alloc(8000);
          start = b.subarray(0, readSync(fd, b, 0, b.length, 0));
        } finally { closeSync(fd); }
      } catch { start = null; }
    }
    // Past maxBuffer, spawnSync still returns all it read (often 64 KB): keep git's first 8000 bytes only.
    start ??= spawnSync('git', ['cat-file', 'blob', `:0:${file}`], { maxBuffer: 8000 }).stdout?.subarray(0, 8000);
    if (!start?.length || !(hasBom(start) || !start.includes(0))) continue;
    const staged = blob(`:0:${file}`);
    if (staged === false) console.error(`pre-commit: ${file}: too large to decode and check (over ${MAX_MB} MB); its lines were not checked`);
    else if (staged) wide.push({ file, text: textLines(staged) });
  }
}
// The decoded lines of w missing from rev's version of the file, or null when that version is over MAX_MB.
const newIn = (rev, w) => {
  const old = blob(`${rev}:${w.file}`);
  if (old === false) return null;
  const seen = new Set(textLines(old));
  return w.text.filter((t) => !seen.has(t)).map((text) => ({ file: w.file, text }));
};
// A HEAD version too large to read leaves every staged line of that file counted.
for (const w of wide) lines.push(...(newIn('HEAD', w) ?? w.text.map((text) => ({ file: w.file, text }))));

// While a merge is being concluded, a line counts only when it is new against every parent:
// the other branch's lines are in its own commits already, not in this one's change. Each parent
// is compared only on the paths this commit changes against HEAD, so a large file on one side alone
// is never read. A comparison still too large, of a diff or of a decoded file, leaves that parent's
// lines counted.
if (existsSync(mergeHead) && lines.length) {
  const paths = (gitOut(['diff', '--cached', '--name-only', '-z']) ?? '').split('\0').filter(Boolean);
  const batches = [[]];
  let size = 0;
  for (const p of paths) {
    if (size + p.length > 8000 && batches.at(-1).length) { batches.push([]); size = 0; }
    batches.at(-1).push(p);
    size += p.length + 1;
  }
  for (const parent of paths.length ? readFileSync(mergeHead, 'utf8').split(/\s+/).filter(Boolean) : []) {
    const theirs = new Set();
    let read = true;
    for (const batch of batches) {
      const diff = gitOut(['--literal-pathspecs', ...DIFF, parent, '--', ...batch]);
      if (diff === null) { read = false; break; }
      for (const l of added(diff)) theirs.add(`${l.file}\n${l.text}`);
    }
    for (const w of read ? wide : []) {
      const fresh = newIn(parent, w);
      if (!fresh) { read = false; break; }
      for (const l of fresh) theirs.add(`${l.file}\n${l.text}`);
    }
    if (read) lines = lines.filter((l) => theirs.has(`${l.file}\n${l.text}`));
  }
}

const PRIVATE_IP = /\b(10\.\d{1,3}|172\.(1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/g;
// A version number just after a version word: <AssemblyVersion>, Version=, "version": ", but not conversion:
const VERSION_BEFORE = /(?:(?<![A-Za-z])(?:version|Version|VERSION)|(?<=[a-z])Version)["']?\s*[:=>(]?\s*["']?\s*$/;
const TEST_FILE = /(^|\/)(test|tests|__tests__|fixtures?|testdata)\/|\.(test|spec)\.[a-z0-9]+$|(^|\/)test_[^/]*\.py$|_test\.(py|go)$/i;
const CONFLICT_SIDE = /^(<{7}|>{7})( |$)/;

const problems = [];
const opened = new Set(); // files with a <<<<<<< line; only there is a ======= line a conflict marker
for (const { file, text } of lines) {
  if (text.startsWith('<') && CONFLICT_SIDE.test(text)) opened.add(file);
  if (CONFLICT_SIDE.test(text) || (text === '=======' && opened.has(file))) problems.push(`${file}: a conflict marker`);
  const address = [...text.matchAll(PRIVATE_IP)].some((m) => !VERSION_BEFORE.test(text.slice(0, m.index)));
  if (address && !TEST_FILE.test(file)) problems.push(`${file}: a private network address (made-up ones belong in test files)`);
  for (const t of neverShare) if (t.re.test(text)) problems.push(`${file}: a term from your never-share list (line ${t.line} of the list)`);
}
// --exit-code 42 tells a finding apart from a run that failed, such as one with a broken config.
const gl = spawnSync('gitleaks', ['git', '--pre-commit', '--staged', '--no-banner', '--redact', '--exit-code', '42'], { encoding: 'utf8' });
if (gl.error) console.error('pre-commit: gitleaks is not installed, so the secret scan was skipped');
else if (gl.status === 42) problems.push('gitleaks found a secret in the staged changes (run `gitleaks git --pre-commit --redact --staged -v` to see where; the secret itself stays hidden)');
else if (gl.status !== 0) {
  let last = (gl.stderr || '').replace(/\x1b\[[0-9;]*m/g, '').trim().split(/\r?\n/).at(-1) || 'no message';
  if (last.length > 200) last = `${last.slice(0, 200)}...`;
  problems.push(['gitleaks could not run', `(exit ${gl.status}):`, last].join(' '));
}

if (problems.length) {
  console.error(`pre-commit refused this commit:\n- ${[...new Set(problems)].join('\n- ')}`);
  process.exit(1);
}
