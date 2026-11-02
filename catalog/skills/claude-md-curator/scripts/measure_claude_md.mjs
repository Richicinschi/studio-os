#!/usr/bin/env node
// measure_claude_md.mjs — size + handoff-entry inventory for the project's context
// file (AGENTS.md; CLAUDE.md until migrated), and the budget hook. Used by the
// claude-md-curator skill (report mode) and by the PostToolUse / SessionStart hooks
// (--hook modes).
//
// WHY: the project's context file (AGENTS.md; CLAUDE.md until migrated) loads into
// every session; Claude Code warns past ~40k chars.
// This measures it, lists the dated handoff entries (the part that grows), and
// — in hook mode — nudges Claude to run the curator skill when over budget.
//
// Modes:
//   node measure_claude_md.mjs [path]        -> human report (default)
//   node measure_claude_md.mjs --hook=posttooluse   (reads tool JSON on stdin)
//   node measure_claude_md.mjs --hook=sessionstart
//
// HARD RULE: a hook must never break a session. Everything is wrapped so the
// process ALWAYS exits 0; on any error it produces no output.

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, sep } from 'node:path';

// One budget for every runtime: CONTEXT_BUDGET in .studio/guardrails/context-file.mjs.
// A dynamic import, not a static one: a static import that fails to link exits 1 before
// any try/catch, and a copy synced out of the repo (tools/sync-skills.mjs) has no hub
// four levels up. The literal is that copy's fallback.
let CONTEXT_BUDGET = 30000;
try {
  CONTEXT_BUDGET = (await import(new URL('../../../../.studio/guardrails/context-file.mjs', import.meta.url))).CONTEXT_BUDGET ?? CONTEXT_BUDGET;
} catch { /* never break a session */ }
// CLAUDE_MD_BUDGET env override exists for testing the hook paths.
const BUDGET = Number(process.env.CLAUDE_MD_BUDGET) || CONTEXT_BUDGET; // one number for every runtime
const HARD_LIMIT = 40000;   // Claude Code's warn threshold

const __dirname = dirname(fileURLToPath(import.meta.url));
// scripts -> claude-md-curator -> skills -> .claude -> <repo root>
const REPO_ROOT = resolve(__dirname, '../../../..');
const DEFAULT_CLAUDE_MD = resolve(REPO_ROOT, 'CLAUDE.md');
// The root CLAUDE.md is a generated stub since 2026-07-30; the file that actually
// loads into every session is the registry. Guard the one that costs context.
const REGISTRY_MD = resolve(REPO_ROOT, '.studio', 'registry', 'projects.md');
const budgetFor = (file) => (resolve(file) === REGISTRY_MD ? 6000 : BUDGET);

// Archive routing (mirrors SKILL.md): a project with its own .git is its own
// repo — its archive stays inside it (docs/handoff-archive.md). Everything
// that is part of APPDEV itself archives into the root wiki.
function archivePathFor(file) {
  const dir = dirname(resolve(file));
  if (dir !== REPO_ROOT && existsSync(resolve(dir, '.git'))) {
    return resolve(dir, 'docs/handoff-archive.md');
  }
  if (dir === REPO_ROOT || dir.startsWith(REPO_ROOT + sep)) {
    return resolve(REPO_ROOT, 'wiki/handoff-archive.md');
  }
  return resolve(dir, 'docs/handoff-archive.md');
}

// Hard rule 12 (2026-10-25): a project's instructions live in AGENTS.md and its
// CLAUDE.md is an import stub; until a project is migrated, CLAUDE.md is still the
// content. Same resolution as .studio/guardrails/context-file.mjs, inlined because
// this script is synced out of the repo (tools/sync-skills.mjs) where that module
// is not beside it.
const IMPORT_RE = /^@AGENTS\.md[ \t]*\r?$/m;
function contextFileIn(dir) {
  const claude = resolve(dir, 'CLAUDE.md');
  const agents = resolve(dir, 'AGENTS.md');
  const hasClaude = existsSync(claude);
  if (existsSync(agents) && (!hasClaude || IMPORT_RE.test(readFileSync(claude, 'utf8')))) return agents;
  return hasClaude ? claude : null;
}

// Every context file the workspace model knows: the root stub, one per registry
// project (any group, resolved), and the registry itself.
function allContextFiles() {
  const found = [];
  if (existsSync(DEFAULT_CLAUDE_MD)) found.push(DEFAULT_CLAUDE_MD);
  if (existsSync(REGISTRY_MD)) {
    for (const line of readFileSync(REGISTRY_MD, 'utf8').split('\n')) {
      if (!line.startsWith('|') || !line.includes('`')) continue;
      const cell = (line.split('|')[3] || '').trim().replace(/`/g, '').replace(/\/$/, '');
      if (!cell.includes('/')) continue;
      const f = contextFileIn(resolve(REPO_ROOT, cell));
      if (f) found.push(f);
    }
    found.push(REGISTRY_MD);
  }
  return found;
}

function findClaudeMd(pathArg) {
  if (pathArg && existsSync(pathArg)) return resolve(pathArg);
  if (existsSync(DEFAULT_CLAUDE_MD)) return DEFAULT_CLAUDE_MD;
  return contextFileIn(process.cwd());
}

// Parse the dated handoff entries inside the "## Current state" section.
// Each entry is a single line beginning **YYYY-MM-DD ...** (newest first in the
// file). Returns {chars, currentStateChars, lastUpdatedChars, entries:[...]}.
function analyze(text) {
  const lines = text.split(/\r?\n/);
  let csStart = -1; let csEnd = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+Current state/i.test(lines[i])) { csStart = i; }
    else if (csStart >= 0 && /^##\s+/.test(lines[i])) { csEnd = i; break; }
  }
  const entries = [];
  let lastUpdatedChars = 0;
  if (csStart >= 0) {
    for (let i = csStart; i < csEnd; i++) {
      const ln = lines[i];
      if (/^\*\*Last updated:/i.test(ln)) lastUpdatedChars = ln.length;
      const m = ln.match(/^\*\*(\d{4}-\d{2}-\d{2})(?:\s*\([^)]*\))?\s*[—-]/);
      if (m) {
        entries.push({
          line: i + 1,
          date: m[1],
          size: ln.length,
          title: ln.replace(/^\*\*/, '').slice(0, 80),
        });
      }
    }
  }
  // Oldest first (file is newest-first).
  entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.line - b.line) * -1).reverse();
  const currentStateChars = csStart >= 0
    ? lines.slice(csStart, csEnd).join('\n').length
    : 0;
  return { chars: text.length, currentStateChars, lastUpdatedChars, entries, csStart, csEnd };
}

function readStdin() {
  try { return readFileSync(0, 'utf8'); } catch { return ''; }
}

function reminder(file, chars, budget = BUDGET) {
  const over = chars - budget;
  return `${file} is ${chars.toLocaleString()} chars — ${over.toLocaleString()} over the ${budget.toLocaleString()} budget (Claude Code warns past ${HARD_LIMIT.toLocaleString()}). Run the **claude-md-curator** skill: archive its oldest "## Current state" handoff entries into ${archivePathFor(file)} (move, never delete) until it is back under budget.`;
}

function emitHookContext(eventName, message) {
  // Inject a reminder as additional context without blocking the turn.
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: eventName, additionalContext: message },
  }));
}

const ARCHIVE_INTRO = `---
tags:
  - meta
  - log
  - timeline
---

# Handoff Archive

Chronological archive (newest-first) of the project's context file (AGENTS.md; CLAUDE.md until migrated) "## Current state" handoff entries, relocated here by the claude-md-curator skill to keep the project's context file (AGENTS.md; CLAUDE.md until migrated) under its context budget. **Nothing is deleted — only moved.** Linked from [[Home]] and [[index]].
`;

// Safe mechanical move: evict all dated entries beyond the newest `keepN` from
// CLAUDE.md into wiki/handoff-archive.md. Verifies each evicted entry exists in
// the archive BEFORE removing it from CLAUDE.md. Touches only dated-entry lines
// inside "## Current state" — never the durable sections. Returns a summary.
function doArchive(file, text, a, keepN) {
  const lines = text.split(/\r?\n/);
  const entryIdx = [];
  for (let i = a.csStart; i < a.csEnd; i++) {
    if (/^\*\*\d{4}-\d{2}-\d{2}(?:\s*\([^)]*\))?\s*[—-]/.test(lines[i])) entryIdx.push(i);
  }
  const evict = entryIdx.slice(keepN); // file order is newest-first; keep the first keepN
  if (evict.length === 0) return { moved: 0, note: 'nothing to evict (<= keepN entries)' };

  const sections = evict.map((idx) => {
    const m = lines[idx].match(/^\*\*(\d{4}-\d{2}-\d{2}(?:\s*\([^)]*\))?)\s*[—-]/);
    return `## ${m ? m[1] : 'entry'}\n\n${lines[idx]}\n`;
  });
  const archivePath = archivePathFor(file);
  mkdirSync(dirname(archivePath), { recursive: true });
  let archiveText;
  if (existsSync(archivePath)) {
    archiveText = readFileSync(archivePath, 'utf8');
    const firstEntry = archiveText.search(/\n## \d{4}-\d{2}-\d{2}/);
    if (firstEntry >= 0) {
      archiveText = archiveText.slice(0, firstEntry) + '\n' + sections.join('\n') + archiveText.slice(firstEntry + 1);
    } else {
      archiveText = archiveText.replace(/\s*$/, '\n\n') + sections.join('\n');
    }
  } else {
    archiveText = ARCHIVE_INTRO + '\n' + sections.join('\n');
  }
  writeFileSync(archivePath, archiveText);

  // VERIFY before removing anything from CLAUDE.md.
  const check = readFileSync(archivePath, 'utf8');
  for (const idx of evict) {
    if (!check.includes(lines[idx])) {
      return { moved: 0, error: `verify failed for the entry on line ${idx + 1}; CLAUDE.md left UNCHANGED` };
    }
  }

  // Remove evicted entry lines + a single trailing blank each.
  const drop = new Set(evict);
  for (const idx of evict) if (lines[idx + 1] === '') drop.add(idx + 1);
  const kept = lines.filter((_, i) => !drop.has(i));
  const newText = kept.join('\n');
  writeFileSync(file, newText);
  return { moved: evict.length, kept: keepN, archivePath, claudeMdChars: newText.length };
}

function main() {
  const args = process.argv.slice(2);
  const hookArg = args.find((a) => a.startsWith('--hook'));
  const archiveFlag = args.some((a) => a === '--archive' || a.startsWith('--archive'));
  const pathArg = args.find((a) => !a.startsWith('--'));

  if (hookArg) {
    const mode = (hookArg.split('=')[1] || '').toLowerCase();
    if (mode === 'posttooluse') {
      // Nudge about the context file the edit actually touched (root OR per-project).
      let fp = '';
      try {
        const input = JSON.parse(readStdin() || '{}');
        fp = String(input?.tool_input?.file_path || input?.tool_input?.filePath || '');
      } catch { fp = ''; }
      if (!/(^|[\\/])(CLAUDE|AGENTS)\.md$/i.test(fp)) return;
      const target = resolve(fp);
      if (!existsSync(target)) return;
      const chars = readFileSync(target, 'utf8').length;
      if (chars > BUDGET) emitHookContext('PostToolUse', reminder(target, chars));
      return;
    }
    if (mode === 'sessionstart') {
      // Sweep every context file in the workspace, not just the root -- plus the
      // registry, which now carries its own tighter budget (see budgetFor).
      const msgs = allContextFiles()
        .map((f) => ({ f, chars: readFileSync(f, 'utf8').length, budget: budgetFor(f) }))
        .filter((x) => x.chars > x.budget)
        .map((x) => reminder(x.f, x.chars, x.budget));
      if (msgs.length) emitHookContext('SessionStart', msgs.join('\n\n'));
      return;
    }
    return;
  }

  const file = findClaudeMd(pathArg);
  if (!file) return; // nothing to measure -> silent (exit 0)
  const text = readFileSync(file, 'utf8');
  const a = analyze(text);

  if (archiveFlag) {
    const keepArg = args.find((x) => x.startsWith('--keep='));
    const keepN = keepArg ? parseInt(keepArg.split('=')[1], 10) : 2;
    console.log(JSON.stringify(doArchive(file, text, a, Number.isNaN(keepN) ? 2 : keepN), null, 2));
    return;
  }

  // Default: human-readable report for the skill. When no explicit path was
  // given, also report the registry -- the file that actually loads into every
  // session now that root CLAUDE.md is a generated stub -- under its own
  // tighter 6,000 B budget (see budgetFor).
  console.log(formatReport(file, a, budgetFor(file)));
  if (!pathArg && existsSync(REGISTRY_MD) && resolve(REGISTRY_MD) !== resolve(file)) {
    const regText = readFileSync(REGISTRY_MD, 'utf8');
    console.log('');
    console.log(formatReport(REGISTRY_MD, analyze(regText), budgetFor(REGISTRY_MD)));
  }
}

function formatReport(file, a, budget) {
  const status = a.chars <= budget ? 'UNDER budget' : `OVER budget by ${a.chars - budget}`;
  const out = [];
  out.push(`File: ${file}`);
  out.push(`Total: ${a.chars} chars  (budget ${budget}, hard limit ${HARD_LIMIT}) -> ${status}`);
  out.push(`"## Current state" section: ${a.currentStateChars} chars`);
  out.push(`"Last updated:" line: ${a.lastUpdatedChars} chars` + (a.lastUpdatedChars > 1500 ? '  <- shorten this' : ''));
  out.push(`Dated handoff entries: ${a.entries.length}  (oldest first — evict from the top)`);
  for (const e of a.entries) {
    out.push(`  ${e.date}  ${String(e.size).padStart(5)}c  line ${e.line}  ${e.title}…`);
  }
  if (a.chars > budget) {
    // Suggest how many oldest entries to evict to get under budget.
    let running = a.chars; let n = 0;
    for (const e of a.entries) { if (running <= budget) break; running -= e.size; n++; }
    out.push('');
    out.push(`Suggestion: archiving the ${n} oldest entr${n === 1 ? 'y' : 'ies'} to ${archivePathFor(file)} gets it to ~${running} chars. Move (don't delete); verify the text landed in the archive before removing each from CLAUDE.md.`);
  }
  return out.join('\n');
}

try { main(); } catch { /* never break a session */ }
process.exit(0);
