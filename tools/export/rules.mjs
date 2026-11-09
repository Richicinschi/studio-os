// tools/export/rules.mjs
// Rewrite, secret, privacy and path rules for the kit export. Nothing personal is written here:
// people, clients, employers, personal emails and key ids live in the gitignored
// tools/export/privacy.local.txt, the owner's first name in tools/export/owner.local.txt, private hub
// items and sources in tools/export/private.local.txt, and studio-name rewrites in
// tools/export/rewrites.local.json. The export refuses to run without any one of the four.
import { isUtf8 } from 'node:buffer';
import { existsSync, readFileSync } from 'node:fs';

// Text is decided by content (valid UTF-8, no NUL bytes), never by extension, so no file escapes the
// rewrites and gates because of its name. Binary files pass only with a known type; anything else
// (a UTF-16 file, for one) is reported by the accounting gate.
export const BINARY_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp', '.gz', '.zip', '.pdf', '.woff', '.woff2', '.ttf', '.otf', '.mp3', '.wav', '.ogg', '.mp4']);

export function fileKind(rel, buf) {
  if (!buf.includes(0) && isUtf8(buf)) return 'text';
  const base = rel.split('/').pop();
  const dot = base.lastIndexOf('.');
  return BINARY_EXT.has(dot > 0 ? base.slice(dot).toLowerCase() : '') ? 'binary' : 'unknown';
}

export const isLicenceFile = (name) => /^(LICEN[CS]E|COPYING)(\.\w+)?$/i.test(name);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Does the word at `offset` start a sentence, a list item or a paragraph? Leading markup (bold, quotes,
// a parenthesis, a backtick) is looked through; a line wrapped in mid-sentence is not a start.
function startsSentence(str, offset) {
  const lineStart = str.lastIndexOf('\n', offset - 1) + 1;
  const core = str.slice(lineStart, offset).replace(/(?:\*\*?|_|["'`(“‘])+$/, '');
  if (/[.!?]\s+$/.test(core)) return true;
  if (/^\s*(?:[-*+>]|\d+[.)]|#{1,6})\s+$/.test(core)) return true;
  if (!/^\s*$/.test(core)) return false;
  const before = str.slice(0, Math.max(0, lineStart - 1)).replace(/\r$/, '');
  return !before.trim() || /\n\s*$/.test(before) || /(^|\n)#{1,6} [^\n]*$/.test(before) || /[.!?:]["')*_`”’]*\s*$/.test(before);
}

const ownerRewrite = (name) => ({
  reason: 'owner-name',
  pattern: new RegExp(`\\b${escapeRe(name)}(['’]s)?\\b`, 'g'),
  replacement: (match, possessive, offset, str) => `${startsSentence(str, offset) ? 'The' : 'the'} owner${possessive || ''}`,
});

// The outside workflow collection the core was first written from kept its working folders under its own name.
// The kit uses neutral folder names everywhere (skills, scripts and prose); the name is assembled here so that
// no file of the kit, this one included, carries it.
const OUTSIDE = ['super', 'powers'].join('');
export const FOLDER_REWRITES = [
  { reason: 'workflow-folder', pattern: new RegExp(`docs/${OUTSIDE}/plans`, 'g'), replacement: 'docs/plans' },
  { reason: 'workflow-folder', pattern: new RegExp(`docs/${OUTSIDE}/specs`, 'g'), replacement: 'docs/specs' },
  { reason: 'workflow-folder', pattern: new RegExp(`\\.${OUTSIDE}/`, 'g'), replacement: '.studio-work/' },
];

export const PATH_REWRITES = [
  { reason: 'hub-path', pattern: /[a-z]:[\\/]+AppDev(?=[\\/]|\b)/gi, replacement: '<HUB>' },
  { reason: 'hub-path', pattern: /(?<![\w.])\/(?:mnt\/)?[a-z]\/AppDev(?=\/|\b)/gi, replacement: '<HUB>' },
  { reason: 'home-path', pattern: /[a-z]:[\\/]+Users[\\/]+[^\\/\s"'`)<]+/gi, replacement: '<HOME>' },
  // macOS /Users and Linux /home are case-sensitive, so "/users/{id}" in a URL route is left alone.
  { reason: 'home-path', pattern: /(?<![\w.])\/(?:mnt\/)?(?:[A-Za-z]\/)?(?:Users|home)\/(?![<$~{])[^/\s"'`)<]+/g, replacement: '<HOME>' },
];

// `owner` is the owner's first name, from owner.local.txt; without it only paths are rewritten and the
// privacy gate catches the name.
export function rewriteText(text, { owner } = {}) {
  const hits = [];
  let out = text;
  for (const r of owner ? [...FOLDER_REWRITES, ...PATH_REWRITES, ownerRewrite(owner)] : [...FOLDER_REWRITES, ...PATH_REWRITES]) {
    out = out.replace(r.pattern, (...args) => {
      hits.push(r.reason);
      return typeof r.replacement === 'function' ? r.replacement(...args) : r.replacement;
    });
  }
  return { text: out, hits };
}

export const SECRET_PATTERNS = [
  { reason: 'google-api-key', pattern: /AIza[0-9A-Za-z_-]{35}/ },
  { reason: 'revenuecat-key', pattern: /\b(?:goog|appl|amzn|strp|mcs)_[0-9A-Za-z]{20,}\b/ },
  { reason: 'secret-key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { reason: 'github-token', pattern: /\bghp_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{50,}\b/ },
  { reason: 'slack-token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { reason: 'private-key-block', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY/ },
  { reason: 'assigned-credential', pattern: /(?:api[_-]?key|secret|token|password|passwd|client[_-]?secret|access[_-]?token|auth[_-]?token)["'\s]{0,3}[:=]["'\s]{0,3}[A-Za-z0-9_-]{24,}/i },
];

function perLine(text, patterns) {
  const out = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const { reason, pattern } of patterns) if (pattern.test(line)) out.push({ reason, line: i + 1 });
  });
  return out;
}

export const findSecrets = (text) => perLine(text, SECRET_PATTERNS);

function readTerms(file, what, hint) {
  if (!existsSync(file)) throw new Error(`${what} missing: ${file} (${hint}; never commit it)`);
  const buf = readFileSync(file);
  if (buf.includes(0) || !isUtf8(buf)) throw new Error(`${what} must be UTF-8: ${file}`);
  const terms = buf.toString('utf8').replace(/^﻿/, '').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  if (!terms.length) throw new Error(`${what} is empty: ${file}`);
  return terms;
}

export const loadDenyList = (file) => readTerms(file, 'privacy deny list', 'copy privacy.local.example.txt and fill it');
export const loadOwnerName = (file) => readTerms(file, 'owner name file', 'copy owner.local.example.txt and put the owner\'s first name in it')[0];

// Hex identifiers (key ids, registration numbers) match anywhere, so a 0x prefix or a longer fingerprint
// cannot hide them. Other terms match as whole words, with -, _ and whitespace (line wraps included)
// treated alike and allowed to vanish, so "a-b", "a_b", "a b" and "ab" are one term.
function denyPattern(term) {
  if (/^[0-9a-f]{8,}$/i.test(term)) return new RegExp(escapeRe(term), 'gi');
  const parts = term.split(/[-_\s]+/).filter(Boolean).map(escapeRe);
  // A plural or possessive s ("names", "name's") still matches, as in a note named need_<name>s_word.
  return new RegExp(`(?<![\\p{L}\\p{N}])${parts.join('[-_\\s]*')}(?:['’]?s)?(?![\\p{L}\\p{N}])`, 'giu');
}

export function findDenied(text, deny) {
  const out = [];
  deny.forEach((term, n) => {
    const lines = new Set([...text.matchAll(denyPattern(term))].map((m) => text.slice(0, m.index).split('\n').length));
    for (const line of lines) out.push({ term, line, n });
  });
  return out.sort((a, b) => a.line - b.line || a.n - b.n).map(({ term, line }) => ({ term, line }));
}

export const PATH_PATTERNS = [
  { reason: 'hub-path', pattern: /[a-z]:[\\/]+AppDev\b/i },
  { reason: 'hub-path', pattern: /(?<![\w.])\/(?:mnt\/)?[a-z]\/AppDev\b/i },
  { reason: 'home-path', pattern: /[a-z]:[\\/]+Users[\\/]+(?!<)/i },
  { reason: 'home-path', pattern: /(?<![\w.])\/(?:mnt\/)?(?:[A-Za-z]\/)?(?:Users|home)\/(?![<$~{])[\w.-]/ },
  { reason: 'mac-host', pattern: /\b[\w-]+-Mac-mini(?:\.local)?\b/i },
  { reason: 'local-host', pattern: /(?<![\w.-])[a-z0-9-]+(?:\.[a-z0-9-]+)*\.local(?![\w.-])/i },
  { reason: 'tailnet', pattern: /\.ts\.net\b|\btailscale\b/i },
];

// Upstream text the paths gate flags but that carries no studio detail. Each entry names the kit file,
// the exact phrase and why; gatePaths passes a finding only when its line holds that phrase in that
// file. It lives here, the one file the gates exempt, because it spells out what they look for. Keep
// it short and review every entry.
// Studio pointers in the shipped copies, replaced at build time with generic wording, and references
// to scripts a copy does not ship, rewritten. Reviewed one by one: each entry names its file ('*' for
// every shipped markdown file), the exact phrase or a section pattern, the replacement and why. The
// build stops on an entry that no longer matches. Specific entries come before generic ones, since a
// file's entries apply in this order. Code files are never touched.
export const STUDIO_REWRITES = [
  { file: 'catalog/skills/handoff/SKILL.md', pattern: '\\[\\[feedback_peer_requests_need_\\w+_word\\]\\]', replacement: 'the rule that a request from another session needs the owner\'s own word', why: 'a memory note whose name carries a person\'s name' },
  { file: 'catalog/skills/handoff/SKILL.md', phrase: '[[feedback_memory_vault]]', replacement: 'the vault rule', why: 'a studio memory note' },
  { file: 'catalog/skills/handoff/SKILL.md', phrase: 'node .studio/guardrails/session-hygiene.mjs', replacement: 'node <your setup>/hooks/session-end-check.mjs', why: 'the studio\'s Stop hook; the kit ships its own (cards/session-end-check.md)' },
  { file: 'catalog/skills/handoff/SKILL.md', phrase: 'node .studio/guardrails/studio-doctor.mjs', replacement: 'node <your setup check, if you keep one>', why: 'the studio\'s own machine check, not in the kit' },
  { file: 'catalog/skills/handoff/SKILL.md', phrase: 'If he is merely pausing', replacement: 'If they are merely pausing', why: 'the owner, by pronoun' },
  { file: 'catalog/skills/handoff/SKILL.md', phrase: 'delete only what he says yes to', replacement: 'delete only what they say yes to', why: 'the owner, by pronoun' },
  { file: 'catalog/skills/handoff/SKILL.md', phrase: 'did not name, and he treats them as his call', replacement: 'did not name, and the owner treats them as their own call', why: 'the owner, by pronoun' },
  { file: 'catalog/skills/handoff/SKILL.md', phrase: '- anything he did not name.', replacement: '- anything they did not name.', why: 'the owner, by pronoun' },
  { file: 'catalog/packs/advisor-council-for-big-decisions/skills/council.md', phrase: '⚠ Subagents can\'t talk to each other directly (they\'re isolated, one-shot)', replacement: '⚠ The seats are dispatched one-shot and never answer each other here', why: 'the kit\'s facts say a subagent can message another agent; the skill\'s point is that the chair runs the rounds' },
  { file: '*', phrase: 'hard rule 11', replacement: 'the rule that each risky act needs a recorded yes', why: 'a studio rule number' },
  {file: "catalog/skills/using-agent-skills/SKILL.md",pattern: "This page lists only what exists in the studio:[^\\n]*\\n",replacement: "This page lists the skills this kit ships in `.claude/skills/`, the skills inside any domain you installed, and Claude Code's built-in slash commands.\n",why: "the studio's skill index and sync files, which the kit does not ship"},
  {file: "catalog/skills/using-agent-skills/SKILL.md",pattern: "A name followed by \"pack X\" lives inside that pack\\. Read `library/X/SKILL\\.md`, find the skill in its table, open the file it names and follow it\\.",replacement: "A name followed by \"pack X\" lives inside the domain X you installed. Read `.claude/skills/X/SKILL.md`, find the skill in its table, open the file it names and follow it.",why: "the studio's library folder"},
  {file: "catalog/skills/using-agent-skills/SKILL.md",pattern: "- When no row fits, read[^\\n]*\\n- Keep this page true\\.[^\\n]*\\n",replacement: "- When no row fits, list `.claude/skills/` and read the descriptions.\n",why: "the studio's skill index, library index and sync script"},
  {file: "catalog/skills/using-agent-skills/SKILL.md",phrase: "For an outside skill: `vet-external-skill`, then `writing-great-skills`",replacement: "For an outside skill: `vet-and-adopt`, then `writing-great-skills`",why: "the studio's vetting skill; the kit's is vet-and-adopt"},
  {file: "catalog/packs/web-astro-cloudflare-gsap-performance/skills/site-architecture.md",phrase: "\"see how [reminders](/features/reminders) work\"",replacement: "\"see how reminders work\", linked to the reminders page",why: "an example link to a page of an imagined site; the kit cannot resolve a site path"},
  { file: '*', phrase: '.studio/rules/hard-rules.md', replacement: 'your rules file', why: 'a studio path' },
  { file: '*', phrase: '.studio/rules/coding-guidelines.md', replacement: 'your coding guidelines', why: 'a studio path' },
  { file: '*', phrase: '.studio/registry/projects.md', replacement: 'your project registry', why: 'a studio path' },
  { file: '*', phrase: '.studio/runtime/runtimes.json', replacement: 'the studio\'s list of runtimes (not in this kit)', why: 'a studio path' },
  { file: '*', phrase: '.studio/memory/', replacement: 'your memory folder', why: 'a studio path' },
  { file: '*', phrase: '.studio/guardrails/skills-primer.mjs', replacement: 'a start-up hook of your own (the studio\'s is not in this kit)', why: 'a studio script' },
  { file: '*', phrase: 'memory `feedback_workflow_concurrency_cap`', replacement: 'a studio note on how many agents run at once', why: 'a studio memory note' },
  { file: '*', phrase: '`feedback_workflow_concurrency_cap`', replacement: 'the same note', why: 'a studio memory note' },
  { file: '*', phrase: 'memory `feedback_subagent_orchestration`', replacement: 'a studio note on review restraint', why: 'a studio memory note' },
  { file: '*', phrase: 'memory `feedback_agents_parent_model`', replacement: 'a studio note on agent models', why: 'a studio memory note' },
];

// A rewrite whose phrase would itself name what the studio works on privately (a product, a project, a
// data source) lives in the gitignored tools/export/rewrites.local.json: a JSON array of entries shaped
// like STUDIO_REWRITES, each with `gone`, a term the build then checks is no longer in that file. Those
// terms also go on the deny list, as a second net. The file is required, like the other local files (an
// empty array is a deliberate choice); errors name entries by number only, so its text is never printed.
export function loadLocalRewrites(file) {
  if (!existsSync(file)) throw new Error(`local rewrites missing: ${file} (copy rewrites.local.example.json and fill it, or write []; never commit it)`);
  let list;
  try { list = JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch { throw new Error(`local rewrites are not valid JSON: ${file}`); }
  if (!Array.isArray(list)) throw new Error(`local rewrites must be a JSON array: ${file}`);
  const str = (v) => typeof v === 'string' && v.length > 0;
  const bad = list.map((r, i) => (r && str(r.file) && str(r.phrase) !== str(r.pattern) && typeof r.replacement === 'string' && str(r.why) && str(r.gone) ? null : i + 1)).filter(Boolean);
  if (bad.length) throw new Error(`local rewrites need file, phrase or pattern, replacement, why and gone: entry ${bad.join(', ')} in ${file}`);
  return list.map((r, i) => ({ ...r, localIndex: i + 1 }));
}

export const PATHS_ALLOW = [
  { file: 'catalog/skills/brainstorming/scripts/server.cjs', phrase: 'Tailscale SSH', why: 'an upstream comment naming a product among remote-shell cases; no network detail' },
];

// Any IPv4 address is reported except unspecified, loopback, masks and the RFC 5737 documentation
// ranges; private, CGNAT (tailnet) and link-local ones as private-ip, the rest as public-ip.
const DOC_NETS = [[192, 0, 2], [198, 51, 100], [203, 0, 113]];
function ipv4Reason([a, b, c, d]) {
  if ([a, b, c, d].some((n) => n > 255) || a === 0 || a === 127 || a === 255) return null;
  if (DOC_NETS.some(([x, y, z]) => a === x && b === y && c === z)) return null;
  const isPrivate = a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254);
  return isPrivate ? 'private-ip' : 'public-ip';
}
const IPV4 = /(?<![\w.])(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?!\w|\.\d)/g;
const IPV6_LOCAL = /(?<![\w:])(?:f[cd][0-9a-f]{2}|fe[89ab][0-9a-f]):[0-9a-f:]*[0-9a-f](?![\w:])/i;

export function findPaths(text) {
  const out = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const { reason, pattern } of PATH_PATTERNS) if (pattern.test(line)) out.push({ reason, line: i + 1 });
    const ips = new Set([...line.matchAll(IPV4)].map((m) => ipv4Reason(m.slice(1, 5).map(Number))));
    for (const reason of ['private-ip', 'public-ip']) if (ips.has(reason)) out.push({ reason, line: i + 1 });
    if (IPV6_LOCAL.test(line)) out.push({ reason: 'private-ipv6', line: i + 1 });
  });
  return out;
}
